# 🚀 Upstash Redis Setup Guide

## **Step 1: Get Your Connection Details**
From your Upstash console, copy these values:

```bash
REDIS_HOST=shining-chimp-5922.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=your_token_here (click the eye icon to reveal)
REDIS_DB=0
```

## **Step 2: Create .env.local File**
Create a `.env.local` file in your project root:

```bash
# Upstash Redis Configuration
REDIS_HOST=shining-chimp-5922.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=your_actual_token_here
REDIS_DB=0
REDIS_TLS=true

# YouTube API Keys (comma-separated)
YOUTUBE_API_KEYS=your_key_1,your_key_2,your_key_3
```

## **Step 3: Test the Connection**
Your app will automatically connect to Upstash Redis when you start it.

To test the connection, visit:
```
/api/admin/youtube-status
```

You should see:
```json
{
  "youtube": { ... },
  "cache": {
    "status": "connected"
  }
}
```

## **Step 4: Deploy to Vercel**
1. Add these environment variables in Vercel:
   - Go to your project → Settings → Environment Variables
   - Add each variable from `.env.local`

2. Deploy your app

## **🎯 What You Get:**
- ✅ **Free Redis** (500k commands/month, 256MB storage)
- ✅ **TLS encryption** for security
- ✅ **Global CDN** for fast access
- ✅ **Auto-scaling** if you exceed free tier
- ✅ **99.9% uptime** SLA

## **💰 Cost:**
- **Free tier**: $0/month (up to 500k commands/month)
- **Your usage**: ~2k users/week × 5 searches = 10k searches/week
- **Redis commands**: ~20k/month (well within free tier!)

## **🔧 Troubleshooting:**
If you get connection errors:
1. Check `REDIS_TLS=true` is set
2. Verify your token is correct
3. Make sure you're using the right host/port
4. Check Vercel environment variables are set

Your app is now ready to use Upstash Redis! 🎉
