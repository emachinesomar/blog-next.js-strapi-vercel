const path = require('path');
const strapiPkg = require('@strapi/strapi');
const fs = require('fs');

console.log('--- Vercel Request Received ---');

const createStrapi = strapiPkg.createStrapi || (strapiPkg.default && strapiPkg.default.createStrapi) || (typeof strapiPkg === 'function' ? strapiPkg : null);

module.exports = async (req, res) => {
  console.log('Method:', req.method, 'URL:', req.url);
  
  try {
    if (!global.strapi) {
      console.log('Initializing Strapi 5 Engine...');
      
      if (!createStrapi) {
        throw new Error(`Could not find a valid Strapi initialization function. Available keys: ${Object.keys(strapiPkg).join(', ')}`);
      }

      // 1. Resolve Application Directory
      let appDir = process.cwd();
      // If deployed from root, we need to append backend
      if (!fs.existsSync(path.join(appDir, 'package.json')) && fs.existsSync(path.join(appDir, 'backend'))) {
        appDir = path.join(appDir, 'backend');
      }
      
      console.log('Final AppDir:', appDir);
      const files = fs.readdirSync(appDir);
      console.log('Files present:', files.join(', '));
      
      // 2. Validate essential folders (dist is mandatory for Strapi 5)
      if (!files.includes('dist')) {
        throw new Error(`The "dist" folder is missing in ${appDir}. Did the build fail?`);
      }

      // 3. Initialize and Load Strapi
      global.strapi = await createStrapi({ appDir }).load();
      
      // 4. Set up internal server callbacks
      await global.strapi.postListen();
      console.log('Strapi 5 is now ready and listening.');
    }
    
    // Automatic redirect for root to admin
    if (req.url === '/' || req.url === '') {
      console.log('Redirecting root to /admin');
      res.writeHead(302, { Location: '/admin' });
      return res.end();
    }

    // Forward the request to Strapi's Koa application
    const callback = global.strapi.server.app.callback();
    return callback(req, res);

  } catch (error) {
    console.error('CRITICAL: Strapi Bridge Failure:', error);
    return res.status(500).json({
      error: 'Strapi Bridge Error',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      diagnostics: {
        cwd: process.cwd(),
        url: req.url,
        hasDist: fs.existsSync(path.join(process.cwd(), 'dist')) || fs.existsSync(path.join(process.cwd(), 'backend/dist')),
        files: fs.readdirSync(process.cwd())
      }
    });
  }
};
