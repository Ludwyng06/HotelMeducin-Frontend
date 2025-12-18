const { createServer } = require('https');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = 4200;
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Ruta a los certificados SSL (generados con mkcert)
const certPath = path.join(__dirname, '../Backend/certs/cert.pem');
const keyPath = path.join(__dirname, '../Backend/certs/key.pem');

// Verificar que los certificados existan
if (!fs.existsSync(certPath) || !fs.existsSync(keyPath)) {
  console.error('❌ Error: No se encontraron los certificados SSL');
  console.error(`   Certificado esperado en: ${certPath}`);
  console.error(`   Clave esperada en: ${keyPath}`);
  console.error('');
  console.error('💡 Para generar los certificados, ejecuta:');
  console.error('   1. Instala mkcert: choco install mkcert');
  console.error('   2. Instala CA local: mkcert -install');
  console.error('   3. Genera certificados:');
  console.error('      cd Backend');
  console.error('      mkdir certs');
  console.error('      mkcert -key-file certs/key.pem -cert-file certs/cert.pem localhost 127.0.0.1 ::1');
  console.error('');
  console.error('🔄 Iniciando servidor HTTP en su lugar...');
  process.exit(1);
}

const httpsOptions = {
  key: fs.readFileSync(keyPath),
  cert: fs.readFileSync(certPath),
};

app.prepare().then(() => {
  createServer(httpsOptions, async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`> ✅ Servidor HTTPS listo en https://${hostname}:${port}`);
    console.log(`> 🔒 Certificado SSL válido (sin advertencias del navegador)`);
  });
});

