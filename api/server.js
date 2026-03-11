const path = require('path');
const strapiPkg = require('@strapi/strapi');

console.log('--- Vercel Request Received ---');
console.log('Path:', path.join(__dirname));

const createStrapi = strapiPkg.createStrapi || (strapiPkg.default && strapiPkg.default.createStrapi) || (typeof strapiPkg === 'function' ? strapiPkg : null);

module.exports = async (req, res) => {
  console.log('Method:', req.method, 'URL:', req.url);
  
  const fs = require('fs');
  const appDir = process.cwd();
  
  // Diagnostic: Check if dist exists
  const distExists = fs.existsSync(path.join(appDir, 'dist'));
  console.log('AppDir:', appDir);
  console.log('Dist exists:', distExists);

  try {
    if (!global.strapi) {
      console.log('Initializing Strapi 5...');
      
      if (!createStrapi) {
        throw new Error(`Could not find a valid Strapi initialization function. Available keys: ${Object.keys(strapiPkg).join(', ')}`);
      }

      // Check if we are at root or in backend
      let appDir = process.cwd();
      if (!fs.existsSync(path.join(appDir, 'package.json')) && fs.existsSync(path.join(appDir, 'backend'))) {
        appDir = path.join(appDir, 'backend');
      }
      
      console.log('Final AppDir:', appDir);
      console.log('Files in AppDir:', fs.readdirSync(appDir).join(', '));
      
      global.strapi = await createStrapi({ appDir }).load();
      await global.strapi.postListen();
      console.log('Strapi 5 ready');
    }
    
    // Custom handling for root to avoid 404
    if (req.url === '/') {
      console.log('Root request - returning redirect to /admin');
      res.writeHead(302, { Location: '/admin' });
      return res.end();
    }

    const callback = global.strapi.server.app.callback();
    return callback(req, res);
  } catch (error) {
    console.error('Fatal Bridge Error:', error);
    return res.status(500).json({
      error: 'Strapi bridge error',
      message: error.message,
      stack: error.stack,
      reqUrl: req.url,
      cwd: process.cwd(),
      distExists: fs.existsSync(path.join(process.cwd(), 'dist')) || fs.existsSync(path.join(process.cwd(), 'backend/dist'))
    });
  }
};
