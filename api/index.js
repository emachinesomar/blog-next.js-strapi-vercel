const path = require('path');
const strapi = require('@strapi/strapi');

module.exports = async (req, res) => {
  try {
    if (!global.strapi) {
      console.log('Starting Strapi...');
      // Explicitly set the application directory (parent of api/)
      const appDir = path.join(__dirname, '..');
      global.strapi = await strapi({ appDir }).load();
      await global.strapi.postListen();
      console.log('Strapi started successfully');
    }
    global.strapi.server.app.callback()(req, res);
  } catch (error) {
    console.error('Strapi startup error:', error);
    res.status(500).send(`Strapi startup error: ${error.message}. Check Vercel logs for details.`);
  }
};
