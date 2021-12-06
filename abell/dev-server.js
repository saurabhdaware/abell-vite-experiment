const fs = require('fs');
const path = require('path')
const express = require('express')
const { createServer: createViteServer } = require('vite')

const SERVER_PORT = 3000;
const ENTRY_SERVER_PATH = `../src/entry-server.js`;

const getFilePathFromURL = (dirtyUrl) => {
  const url = dirtyUrl.endsWith('/') ? dirtyUrl.slice(0, -1) : dirtyUrl;
  const base = path.resolve(__dirname, '../pages/');
  const { join } = path;
  if (url === '/') {
    return join(base, 'index.abell');
  }

  const directPath = join(base, url + '.abell'); // files like `/about.abell`;
  const indexPath = join(base, url, 'index.abell'); // files like `/about/index.abell`;

  if (fs.existsSync(directPath)) {
    return directPath;
  }

  if (fs.existsSync(indexPath)) {
    return indexPath;
  }

  // 404 pages
  throw new Error(`No file found that can be rendered for '${url}' url`);
}

async function createServer() {
  const app = express()

  const vite = await createViteServer({
    server: { middlewareMode: 'ssr' },
    root: path.resolve(__dirname, '../pages'),
  })

  app.use(vite.middlewares)

  app.use('*', async (req, res) => {
    const url = req.originalUrl
  
    try {
      const { render } = await vite.ssrLoadModule(ENTRY_SERVER_PATH);
  
      const appHtml = await render(getFilePathFromURL(url));
      const html = await vite.transformIndexHtml(url, appHtml)

      res.status(200).set({ 'Content-Type': 'text/html' }).end(html)
    } catch (e) {
      vite.ssrFixStacktrace(e)
      console.error(e)
      res.status(500).end(e.message)
    }
  })

  app.listen(SERVER_PORT, () => {
    console.log(`Server listening on port http://localhost:${SERVER_PORT}`);
  })
}

createServer()