import { APP_BASE_HREF } from '@angular/common';
import { CommonEngine } from '@angular/ssr';
import express from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';
import bootstrap from './src/main.server';
import ADODB from 'node-adodb'; // Adicionado
import pool from './db';

// Configuração da conexão com o banco de dados Access
const accessDbPath = join(__dirname, 'C:\\Users\\RMSF_SDAI\\Application Data\\Desktop\\teste1.accdb'); // Altere para o caminho real do seu arquivo .accdb
const connection = ADODB.open(`Provider=Microsoft.ACE.OLEDB.12.0;Data Source=${accessDbPath};Persist Security Info=False;`);

// A função app é exportada para ser usada por funções serverless.
export function app(): express.Express {
  const server = express();
  const serverDistFolder = dirname(fileURLToPath(import.meta.url));
  const browserDistFolder = resolve(serverDistFolder, '../browser');
  const indexHtml = join(serverDistFolder, 'index.server.html');

  const commonEngine = new CommonEngine();

  server.set('view engine', 'html');
  server.set('views', browserDistFolder);

  // Exemplo de endpoints API REST Express
  // server.get('/api/**', (req, res) => {});

  server.get('/api/data', async (req, res) => {
    try {
      const query = 'SELECT * FROM geral-SCA'; // Altere para o nome da sua tabela
      const rows = await connection.query(query);
      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Falha ao buscar dados do banco de dados' });
    }
  });

  // Endpoint para upload de arquivo XLSX no lado do servidor

  // Servir arquivos estáticos a partir de /browser
  server.get('*.*', express.static(browserDistFolder, {
    maxAge: '1y'
  }));

  // Todas as rotas regulares usam o mecanismo Angular
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

  // Iniciar o servidor Node
  const server = app();
  server.listen(port, () => {
    console.log(`Servidor Node Express ouvindo em http://localhost:${port}`);
  });
}

run();
