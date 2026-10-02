// next-sitemap.config.js
/** @type {Record<string, unknown>} */
const config = {
  siteUrl: 'https://sender.cl',
  generateRobotsTxt: true,
  generateIndexSitemap: true,
  exclude: ['/server-sitemap.xml', '/_next/*', '/assets/*', '/fonts/*'],
  robotsTxtOptions: {
    policies: [
      { userAgent: '*', allow: '/' },
      { userAgent: '*', disallow: ['/api/', '/_next/', '/static/'] },
    ],
    additionalSitemaps: ['https://sender.cl/sitemap.xml'],
  },
  transform: async (cfg, path) => {
    /** @type {Record<string, number>} */
    const priorityMap = {
      '': 1.0,
      en: 1.0,
      productos: 0.9,
      'en/productos': 0.9,
      'en/products': 0.9,
      proyectos: 0.9,
      'en/projects': 0.9,
      ingenieria: 0.8,
      'en/engineering': 0.8,
      contacto: 0.7,
      'en/contact': 0.7,
    };

    const localePath = path.replace(/^\/(es|en)/, '').replace(/^\/+/, '') || '';
    const priority = priorityMap[localePath] || 0.5;

    return {
      loc: path,
      changefreq: 'monthly',
      priority,
      alternateRefs: cfg.alternateRefsDefault,
    };
  },
  additionalPaths: async () => [
    {
      loc: '/',
      changefreq: 'monthly',
      priority: 1.0,
      alternateRefs: [
        { href: 'https://sender.cl/en', hreflang: 'en' },
        { href: 'https://sender.cl/', hreflang: 'es-CL' },
      ],
    },
    {
      loc: '/en',
      changefreq: 'monthly',
      priority: 1.0,
      alternateRefs: [
        { href: 'https://sender.cl/en', hreflang: 'en' },
        { href: 'https://sender.cl/', hreflang: 'es-CL' },
      ],
    },
  ],
};

export default config;
