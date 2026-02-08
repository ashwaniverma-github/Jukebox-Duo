/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://jukeboxduo.com', // replace with your domain
  generateRobotsTxt: true, // generates robots.txt
  sitemapSize: 5000,
  outDir: 'public', // sitemap and robots.txt will be placed here
  // Custom robots.txt rules
  robotsTxtOptions: {
    policies: [
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
  },
  // Custom sitemap configuration
  exclude: [
    '/api/*',
    '/admin/*',
    '/dashboard/*',
    '/room/*',
  ],
  // Add custom pages with specific priorities
  additionalPaths: async (config) => {
    const currentDate = new Date().toISOString();

    return [
      {
        loc: '/',
        changefreq: 'weekly',
        priority: 1.0,
        lastmod: currentDate,
      },
      {
        loc: '/about',
        changefreq: 'monthly',
        priority: 0.8,
        lastmod: currentDate,
      },
      {
        loc: '/features',
        changefreq: 'monthly',
        priority: 0.8,
        lastmod: currentDate,
      },
      {
        loc: '/contact',
        changefreq: 'monthly',
        priority: 0.6,
        lastmod: currentDate,
      },
      {
        loc: '/privacy-policy',
        changefreq: 'yearly',
        priority: 0.3,
        lastmod: currentDate,
      },
      {
        loc: '/terms',
        changefreq: 'yearly',
        priority: 0.3,
        lastmod: currentDate,
      },
    ];
  },
};
