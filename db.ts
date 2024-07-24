// db.ts
import mysql from 'mysql2/promise';

const pool: mysql.Pool = mysql.createPool({
  host: 'localhost',
  user: 'seu_usuario',
  password: 'sua_senha',
  database: 'seu_banco_de_dados',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

export default pool;
