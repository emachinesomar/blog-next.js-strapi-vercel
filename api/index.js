const strapi = require('@strapi/strapi');

module.exports = async (req, res) => {
  if (!global.strapi) {
    global.strapi = await strapi().load();
    await global.strapi.postListen();
  }
  global.strapi.server.app.callback()(req, res);
};
