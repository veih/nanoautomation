const express = require('express');
const sequelize = require('./config/database');
const userRoutes = require('./routes/userRoutes');
const app = express();

app.use(express.json());
app.use('/api', userRoutes);

const PORT = process.env.PORT || 3000;

sequelize.sync().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
}).catch(error => {
  console.log('Erro ao sincronizar com o banco de dados:', error);
});
