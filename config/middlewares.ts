import type { Core } from '@strapi/strapi';

const config: Core.Config.Middlewares = [
  'strapi::logger',
  'strapi::errors',
  {
    name: 'strapi::security',
    config: {
      contentSecurityPolicy: {
        useDefaults: true,
        directives: {
          'script-src': ["'self'", "'unsafe-inline'", 'cdn.tiny.cloud'],
          'connect-src': ["'self'", 'https:', 'cdn.tiny.cloud'],
          'img-src': ["'self'", 'data:', 'blob:', 'cdn.tiny.cloud', 'res.cloudinary.com'],
          'style-src': ["'self'", "'unsafe-inline'", 'cdn.tiny.cloud'],
          'font-src': ["'self'", 'cdn.tiny.cloud'],
        },
      },
    },
  },
  {
    name: 'strapi::cors',
    config: {
      origin: [
        'http://localhost:3000',
        process.env.FRONTEND_URL || 'http://localhost:3000',
      ],
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
      headers: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
      keepHeaderOnError: true,
    },
  },
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
];

export default config;
