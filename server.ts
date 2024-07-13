import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr';
import express from 'express';
import multer from 'multer';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import bootstrap from './src/main.server';
import * as fs from 'fs'; // Import fs for file system operations
import XLSX from 'xlsx'; // Install xlsx for Excel file parsing

// The Express app is exported so that it can be used by serverless Functions.
export function app(): express.Express {
  const server = express();
  const serverDistFolder = dirname(fileURLToPath(import.meta.url));
  const browserDistFolder = resolve(serverDistFolder, '../browser');
  const indexHtml = join(serverDistFolder, 'index.server.html');

  const commonEngine = new CommonEngine();

  server.set('view engine', 'html');
  server.set('views', browserDistFolder);

  // Example Express Rest API endpoints
  // server.get('/api/**', (req, res) => {});

  // Server-side file upload endpoint for XLSX files
  const upload = multer({ dest: 'uploads/' }); // Changed to a relative path
  server.post('/upload-xlsx', upload.single('file'), async (req, res) => {
    const xlsxFile = req.file;

    if (!xlsxFile) {
      res.status(400).send('No file uploaded!');
      return;
    }

    const filePath = xlsxFile.path; // filePath is already a string

    try {
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);

      // Process the extracted data (data is an array of objects representing rows)
      console.log('XLSX data:', data);

      // ...

      res.send({ message: 'File uploaded and processed successfully!', data });
    } catch (error) {
      console.error('Error parsing XLSX file:', error);
      res.status(500).send('Failed to process uploaded file!');
    } finally {
      fs.unlinkSync(filePath); // Remove temporary uploaded file
    }
  });

  // Serve static files from /browser
  server.get('*.*', express.static(browserDistFolder, {
    maxAge: '1y'
  }));

  // All regular routes use the Angular engine
  server.get('*', (req, res, next) => {
    const { protocol, originalUrl, baseUrl, headers } = req;

    commonEngine
      .render({
        bootstrap,
        documentFilePath: indexHtml,
        url: `${protocol}://${headers.host}${originalUrl}`,
        publicPath: browserDistFolder,
        providers: [{ provide: APP_BASE_HREF, useValue: baseUrl }],
      })
      .then((html) => res.send(html))
      .catch((err) => next(err));
  });

  return server;
}

function run(): void {
  const port = process.env['PORT'] || 4000;

  // Start up the Node server
  const server = app();
  server.listen(port, () => {
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

run();
