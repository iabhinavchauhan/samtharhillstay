import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { app } from './server/index.js';
import { connectDb } from './server/db.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = 3000;
const clientDir = path.resolve(__dirname, 'client');
const clientDistDir = path.resolve(clientDir, 'dist');
const isProd = process.env.NODE_ENV === 'production';

async function bootstrap() {
  await connectDb();

  // If in production mode and client build exists, serve statically
  if (isProd && fs.existsSync(path.join(clientDistDir, 'index.html'))) {
    console.log('[Samthar] Production mode: serving static client bundle from client/dist');
    app.use(express.static(clientDistDir));
    app.get('*', (req, res, next) => {
      if (req.originalUrl.startsWith('/api') || req.originalUrl.startsWith('/uploads')) {
        return next();
      }
      res.sendFile(path.join(clientDistDir, 'index.html'));
    });
  } else {
    // In development or when pre-built dist is absent: use Vite dev middleware
    console.log('[Samthar] Dev mode: starting with Vite middleware...');
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
      root: clientDir,
    });

    app.use(vite.middlewares);

    app.use('*', async (req, res, next) => {
      const url = req.originalUrl;
      if (url.startsWith('/api') || url.startsWith('/uploads')) {
        return next();
      }
      try {
        const indexPath = path.join(clientDir, 'index.html');
        let template = fs.readFileSync(indexPath, 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        vite.ssrFixStacktrace(e);
        next(e);
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Samthar Applet] Dev server running at http://0.0.0.0:${PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error('[Samthar Startup Fatal Error]:', err);
  process.exit(1);
});
