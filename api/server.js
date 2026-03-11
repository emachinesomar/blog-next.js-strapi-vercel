const fs = require('fs');
const path = require('path');

module.exports = async (req, res) => {
  // 1. Inmediata respuesta de diagnóstico para confirmar que el ruteo funciona
  console.log('--- Bridge Invoked ---');
  console.log('URL:', req.url);
  
  const appDir = process.cwd();
  
  // Si solo quieres ver si funciona, descomenta la siguiente línea y haz push:
  // return res.status(200).send("CONEXIÓN EXITOSA: El puente ha sido alcanzado.");

  try {
    const strapiPkg = require('@strapi/strapi');
    const createStrapi = strapiPkg.createStrapi || (strapiPkg.default && strapiPkg.default.createStrapi) || (typeof strapiPkg === 'function' ? strapiPkg : null);

    if (!global.strapi) {
      console.log('Iniciando Strapi...');
      
      let finalAppDir = appDir;
      if (!fs.existsSync(path.join(appDir, 'package.json')) && fs.existsSync(path.join(appDir, 'backend'))) {
        finalAppDir = path.join(appDir, 'backend');
      }

      global.strapi = await createStrapi({ appDir: finalAppDir }).load();
      await global.strapi.postListen();
    }
    
    if (req.url === '/' || req.url === '') {
      res.writeHead(302, { Location: '/admin' });
      return res.end();
    }

    return global.strapi.server.app.callback()(req, res);
  } catch (err) {
    return res.status(500).json({
      error: 'Error en el arranque de Strapi',
      message: err.message,
      path: req.url,
      cwd: appDir,
      files: fs.readdirSync(appDir)
    });
  }
};
