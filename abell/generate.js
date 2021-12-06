const fs = require('fs');
const path = require('path');
const { build: viteBuild, resolveConfig } = require('vite');

const { render } = require('../dist/server/entry-server.js');
const { recursiveFindFiles } = require('./utils.js');

const createdHTMLFiles = [];
const STATIC_OUT_DIR = path.resolve(__dirname, '../dist/static');

const createHTMLFile = async (abellFilePath) => {
  // Generate HTML file
  const appHtml = await render(abellFilePath);

  const htmlFilePath = abellFilePath.replace('.abell', '.html');
  
  // Write HTML file
  fs.writeFileSync(htmlFilePath, appHtml);
  createdHTMLFiles.push(htmlFilePath);
  console.log(`Generated ${path.relative(process.cwd(), htmlFilePath)}`);
}

const buildForClient = async () => {
  console.log('Build for client...')
  const mode = process.env.MODE || process.env.NODE_ENV || 'production'
  const config = await resolveConfig({}, 'build', mode)
  await viteBuild({
    root: path.resolve(__dirname, '../pages'),
    build: {
      ssrManifest: true,
      rollupOptions: {
        input: createdHTMLFiles
      },
      outDir: STATIC_OUT_DIR,
    },
    mode: config.mode,
  })
}


(async () => {
  // create dist/static if doesn't exist
  if (!fs.existsSync(STATIC_OUT_DIR)) {
    fs.mkdirSync(STATIC_OUT_DIR);
  }

  // Create HTML files
  const abellFilePaths = recursiveFindFiles(path.resolve(__dirname, '../pages/'), '.abell');
  for (const abellFilePath of abellFilePaths) {
    await createHTMLFile(abellFilePath);
  }
  
  // Bundle Client
  await buildForClient();
  
  // delete HTML files (bundled ones are created by vite during client build)
  for (const createdHTMLFile of createdHTMLFiles) {
    fs.unlinkSync(createdHTMLFile);
  }
  
  console.log('`npx serve dist/static` to run static server');
})();