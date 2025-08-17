interface YouTubeAPIKey {
  key: string;
  quotaUsed: number;
  lastUsed: number;
  isActive: boolean;
  dailyQuota: number;
}

export interface YouTubeAPIError {
  error: {
    message: string;
    errors: Array<{
      reason: string;
      message: string;
    }>;
  };
}

class YouTubeKeyManager {
  private apiKeys: YouTubeAPIKey[] = [];
  private currentKeyIndex = 0;
  private quotaResetTime = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  constructor() {
    this.initializeKeys();
  }

  private initializeKeys() {
    // Get API keys from environment variables
    const keys = process.env.YOUTUBE_API_KEYS?.split(',') || [];
    const fallbackKey = process.env.YOUTUBE_API_KEY;

    if (fallbackKey) {
      keys.push(fallbackKey);
    }

    // Initialize API key objects
    this.apiKeys = keys.map((key) => ({
      key: key.trim(),
      quotaUsed: 0,
      lastUsed: 0,
      isActive: true,
      dailyQuota: 10000 // YouTube's default daily quota
    }));

    if (this.apiKeys.length === 0) {
      throw new Error('No YouTube API keys configured');
    }

    console.log(`Initialized ${this.apiKeys.length} YouTube API keys`);
  }

  // Get next available API key
  getNextKey(): string | null {
    const now = Date.now();
    
    // Reset quota if 24 hours have passed
    this.apiKeys.forEach(apiKey => {
      if (now - apiKey.lastUsed > this.quotaResetTime) {
        apiKey.quotaUsed = 0;
        apiKey.isActive = true;
      }
    });

    // Find active key with lowest quota usage
    const availableKeys = this.apiKeys.filter(apiKey => 
      apiKey.isActive && apiKey.quotaUsed < apiKey.dailyQuota
    );

    if (availableKeys.length === 0) {
      console.warn('All YouTube API keys have exceeded daily quota');
      return null;
    }

    // Sort by quota usage (least used first) and last used time
    availableKeys.sort((a, b) => {
      if (a.quotaUsed !== b.quotaUsed) {
        return a.quotaUsed - b.quotaUsed;
      }
      return a.lastUsed - b.lastUsed;
    });

    const selectedKey = availableKeys[0];
    selectedKey.lastUsed = now;
    selectedKey.quotaUsed += 100; // Each search costs 100 quota units

    console.log(`Using API key ${this.apiKeys.indexOf(selectedKey) + 1}, quota used: ${selectedKey.quotaUsed}/${selectedKey.dailyQuota}`);

    return selectedKey.key;
  }

  // Get quota status for all keys
  getQuotaStatus() {
    const now = Date.now();
    return this.apiKeys.map((apiKey, index) => {
      const isReset = now - apiKey.lastUsed > this.quotaResetTime;
      return {
        keyIndex: index + 1,
        quotaUsed: isReset ? 0 : apiKey.quotaUsed,
        dailyQuota: apiKey.dailyQuota,
        isActive: apiKey.isActive && (isReset || apiKey.quotaUsed < apiKey.dailyQuota),
        lastUsed: apiKey.lastUsed,
        timeUntilReset: Math.max(0, this.quotaResetTime - (now - apiKey.lastUsed))
      };
    });
  }

  // Manually update quota usage (for error handling)
  updateQuotaUsage(key: string, quotaUsed: number) {
    const apiKey = this.apiKeys.find(k => k.key === key);
    if (apiKey) {
      apiKey.quotaUsed = Math.min(apiKey.quotaUsed + quotaUsed, apiKey.dailyQuota);
      apiKey.lastUsed = Date.now();
      if (apiKey.quotaUsed >= apiKey.dailyQuota) {
        apiKey.isActive = false;
        console.log(`API key ${this.apiKeys.indexOf(apiKey) + 1} has been deactivated due to quota exhaustion`);
      }
    }
  }

  // Handle API error response and determine if it's quota-related
  handleApiError(key: string, response: Response, errorData?: YouTubeAPIError | null): { isQuotaError: boolean; shouldRetry: boolean } {
    const apiKey = this.apiKeys.find(k => k.key === key);
    if (!apiKey) return { isQuotaError: false, shouldRetry: false };

    // Check for quota-related errors
    const isQuotaError = response.status === 403 && errorData?.error?.errors?.some((err) => 
      err.reason === 'quotaExceeded' || 
      err.reason === 'dailyLimitExceeded' ||
      err.reason === 'rateLimitExceeded'
    );

    if (isQuotaError) {
      console.warn(`API key ${this.apiKeys.indexOf(apiKey) + 1} quota exceeded:`, errorData?.error?.message || 'Unknown quota error');
      // Mark this key as exhausted
      this.updateQuotaUsage(key, apiKey.dailyQuota - apiKey.quotaUsed);
      return { isQuotaError: true, shouldRetry: this.hasAvailableKeys() };
    }

    // Handle other errors (bad request, forbidden but not quota, etc.)
    if (response.status >= 400) {
      console.error(`API key ${this.apiKeys.indexOf(apiKey) + 1} error (${response.status}):`, errorData?.error?.message || 'Unknown error');
      
      // For non-quota errors, add minimal usage but don't disable the key
      this.updateQuotaUsage(key, 10);
      
      // Only retry if we have other keys and it's not a client error (4xx)
      const shouldRetry = response.status >= 500 && this.hasAvailableKeys();
      return { isQuotaError: false, shouldRetry };
    }

    return { isQuotaError: false, shouldRetry: false };
  }

  // Get a prioritized list of available API keys without mutating state
  getKeyAttemptOrder(): string[] {
    const now = Date.now();
    this.apiKeys.forEach(apiKey => {
      if (now - apiKey.lastUsed > this.quotaResetTime) {
        apiKey.quotaUsed = 0;
        apiKey.isActive = true;
      }
    });

    const availableKeys = this.apiKeys
      .filter(apiKey => apiKey.isActive && apiKey.quotaUsed < apiKey.dailyQuota)
      .slice();

    availableKeys.sort((a, b) => {
      if (a.quotaUsed !== b.quotaUsed) {
        return a.quotaUsed - b.quotaUsed;
      }
      return a.lastUsed - b.lastUsed;
    });

    return availableKeys.map(k => k.key);
  }

  // Get total available quota across all keys
  getTotalAvailableQuota(): number {
    const now = Date.now();
    return this.apiKeys.reduce((total, apiKey) => {
      const isReset = now - apiKey.lastUsed > this.quotaResetTime;
      const availableQuota = isReset ? apiKey.dailyQuota : Math.max(0, apiKey.dailyQuota - apiKey.quotaUsed);
      return total + availableQuota;
    }, 0);
  }

  // Check if any keys are available
  hasAvailableKeys(): boolean {
    const now = Date.now();
    return this.apiKeys.some(apiKey => {
      const isReset = now - apiKey.lastUsed > this.quotaResetTime;
      return apiKey.isActive && (isReset || apiKey.quotaUsed < apiKey.dailyQuota);
    });
  }

  // Get a user-friendly error message when all keys are exhausted
  getQuotaExhaustedMessage(): { message: string; estimatedResetHours: number } {
    const quotaStatus = this.getQuotaStatus();
    const earliestResetTime = Math.min(...quotaStatus.map(s => s.timeUntilReset));
    const hoursUntilReset = Math.ceil(earliestResetTime / (1000 * 60 * 60));
    
    const message = `All YouTube API keys have exceeded their daily quota. Search functionality will be restored in approximately ${hoursUntilReset} hour${hoursUntilReset !== 1 ? 's' : ''}.`;
    
    return { message, estimatedResetHours: hoursUntilReset };
  }
}

export const youtubeKeyManager = new YouTubeKeyManager();
export default youtubeKeyManager;
