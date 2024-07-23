const User = require('../models/user');

// Criação de um novo usuário
exports.createUser = async (req, res) => {
  const { nome, email } = req.body;
  try {
    const user = await User.create({ nome, email });
    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Leitura de todos os usuários
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.status(200).json(users);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Leitura de um usuário pelo ID
exports.getUserById = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findByPk(id);
    if (user) {
      res.status(200).json(user);
    } else {
      res.status(404).json({ error: 'Usuário não encontrado' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Atualização de um usuário
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { nome, email } = req.body;
  try {
    const user = await User.findByPk(id);
    if (user) {
      user.nome = nome;
      user.email = email;
      await user.save();
      res.status(200).json(user);
    } else {
      res.status(404).json({ error: 'Usuário não encontrado' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Exclusão de um usuário
exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findByPk(id);
    if (user) {
      await user.destroy();
      res.status(204).send();
    } else {
      res.status(404).json({ error: 'Usuário não encontrado' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
