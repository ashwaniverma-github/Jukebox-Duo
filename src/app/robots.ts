import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/dashboard/',
          '/room/',
        ],
      },
    ],
    sitemap: 'https://jukeboxduo.com/sitemap.xml',
    host: 'https://jukeboxduo.com',
  }
}
