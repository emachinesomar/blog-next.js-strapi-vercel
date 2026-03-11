const path = require('path');
const strapiPkg = require('@strapi/strapi');

console.log('--- Vercel Request Received ---');
console.log('Path:', path.join(__dirname));

const createStrapi = strapiPkg.createStrapi || (strapiPkg.default && strapiPkg.default.createStrapi) || (typeof strapiPkg === 'function' ? strapiPkg : null);

module.exports = async (req, res) => {
  console.log('Method:', req.method, 'URL:', req.url);
  
  // Diagnostic response for root route
  if (req.url === '/' || req.url === '/test-root') {
    return res.status(200).send("Hello from Strapi Bridge!");
  }

  try {
    if (!global.strapi) {
      console.log('Initializing Strapi 5...');
      
      if (!createStrapi) {
        throw new Error(`Could not find a valid Strapi initialization function. Available keys: ${Object.keys(strapiPkg).join(', ')}`);
      }

      // Vercel root directory is assumed to be 'backend'
      const appDir = process.cwd(); 
      console.log('AppDir:', appDir);
      
      global.strapi = await createStrapi({ appDir }).load();
      await global.strapi.postListen();
      console.log('Strapi 5 ready');
    }
    
    return global.strapi.server.app.callback()(req, res);
  } catch (error) {
    console.error('Fatal Bridge Error:', error);
    return res.status(500).json({
      error: 'Strapi bridge error',
      message: error.message,
      stack: error.stack,
      availableKeys: Object.keys(strapiPkg)
    });
  }
};
