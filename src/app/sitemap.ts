import { MetadataRoute } from 'next';
import { getListenTogetherSlugs, getForSlugs, getAlternativeSlugs, getFocusSlugs } from '@/lib/seo-data';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://jukeboxduo.com';

    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 1,
        },
        {
            url: `${baseUrl}/features`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/about`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/contact`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.6,
        },
        {
            url: `${baseUrl}/terms`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.4,
        },
        {
            url: `${baseUrl}/privacy-policy`,
            lastModified: new Date(),
            changeFrequency: 'yearly',
            priority: 0.4,
        },
        {
            url: `${baseUrl}/tools/playlist-name-generator`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/alternatives`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.8,
        },
    ];

    // Listen Together programmatic pages
    const listenTogetherPages: MetadataRoute.Sitemap = getListenTogetherSlugs().map(
        (slug) => ({
            url: `${baseUrl}/listen-together/${slug}`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.8,
        })
    );

    // For programmatic pages
    const forPages: MetadataRoute.Sitemap = getForSlugs().map((slug) => ({
        url: `${baseUrl}/for/${slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.8,
    }));

    // Alternative programmatic pages
    const alternativePages: MetadataRoute.Sitemap = getAlternativeSlugs().map((slug) => ({
        url: `${baseUrl}/alternatives/${slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.8,
    }));

    // Focus programmatic pages
    const focusPages: MetadataRoute.Sitemap = getFocusSlugs().map((slug) => ({
        url: `${baseUrl}/focus/${slug}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: 0.8,
    }));

    return [...staticPages, ...listenTogetherPages, ...forPages, ...alternativePages, ...focusPages];
}
