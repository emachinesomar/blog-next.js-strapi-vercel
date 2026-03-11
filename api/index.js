const path = require('path');
const strapiPkg = require('@strapi/strapi');

// In Strapi 5, the initialization function might be a named export 'createStrapi'
// or the default export, or the package itself in older/different builds.
const createStrapi = strapiPkg.createStrapi || (strapiPkg.default && strapiPkg.default.createStrapi) || (typeof strapiPkg === 'function' ? strapiPkg : null);

module.exports = async (req, res) => {
  try {
    if (!global.strapi) {
      console.log('Starting Strapi 5...');
      
      if (!createStrapi) {
        throw new Error(`Could not find a valid Strapi initialization function. Available keys: ${Object.keys(strapiPkg).join(', ')}`);
      }

      const appDir = path.join(__dirname, '..');
      global.strapi = await createStrapi({ appDir }).load();
      await global.strapi.postListen();
      console.log('Strapi 5 started successfully');
    }
    global.strapi.server.app.callback()(req, res);
  } catch (error) {
    console.error('Strapi startup error:', error);
    res.status(500).json({
      error: 'Strapi startup error',
      message: error.message,
      stack: error.stack,
      availableKeys: Object.keys(strapiPkg)
    });
  }
};
