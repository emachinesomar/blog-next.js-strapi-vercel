const path = require('path');
const strapiPkg = require('@strapi/strapi');
const fs = require('fs');

module.exports = async (req, res) => {
  const appDir = process.cwd();
  return res.status(200).json({
    status: "Bridge reached",
    reqUrl: req.url,
    cwd: appDir,
    filesInCwd: fs.readdirSync(appDir).join(', '),
    nodeEnv: process.env.NODE_ENV,
    publicUrl: process.env.PUBLIC_URL
  });
};
