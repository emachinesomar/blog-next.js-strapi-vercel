const path = require('path');
const strapiPkg = require('@strapi/strapi');
const fs = require('fs');

console.log('--- Strapi 5 Serverless Boot Started ---');

const createStrapi = strapiPkg.createStrapi || (strapiPkg.default && strapiPkg.default.createStrapi) || (typeof strapiPkg === 'function' ? strapiPkg : null);

module.exports = async (req, res) => {
  const appDir = process.cwd();
  console.log('Request URL:', req.url);
  console.log('Working Directory:', appDir);

  try {
    // 1. Path Resolution (Support for backend folder or root)
    let finalAppDir = appDir;
    if (!fs.existsSync(path.join(appDir, 'package.json')) && fs.existsSync(path.join(appDir, 'backend'))) {
      finalAppDir = path.join(appDir, 'backend');
    }

    // 2. Artifact Check (Dist is mandatory)
    const distPath = path.join(finalAppDir, 'dist');
    if (!fs.existsSync(distPath)) {
      console.warn('WARNING: dist folder not found at', distPath);
      // Try to list files for debugging
      const files = fs.readdirSync(finalAppDir);
      throw new Error(`Critical Error: 'dist' folder missing in ${finalAppDir}. Files found: ${files.join(', ')}`);
    }

    // 3. Initialize Strapi Instance
    if (!global.strapi) {
      console.log('Instantiating Strapi engine...');
      global.strapi = await createStrapi({ appDir: finalAppDir }).load();
      await global.strapi.postListen();
      console.log('Strapi engine loaded successfully.');
    }

    // 4. Handle Routing
    if (req.url === '/' || req.url === '') {
      console.log('Redirecting root to admin');
      res.writeHead(302, { Location: '/admin' });
      return res.end();
    }

    // Forward to Koa callback
    const callback = global.strapi.server.app.callback();
    return callback(req, res);

  } catch (error) {
    console.error('SERVERLESS_BOOT_ERROR:', error);
    return res.status(500).json({
      error: 'Strapi Runtime Error',
      message: error.message,
      cwd: appDir,
      files: fs.existsSync(appDir) ? fs.readdirSync(appDir) : 'CWD NOT READABLE',
      stack: process.env.NODE_ENV === 'development' ? error.stack : 'REDACTED'
    });
  }
};
