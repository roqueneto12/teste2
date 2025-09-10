const express = require('express');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// Aplicar middleware de autenticação a todas as rotas
router.use(auth);

// Listar todos os usuários da empresa
router.get('/', async (req, res) => {
  try {
    const users = await User.find({ company: req.company._id })
      .sort({ name: 1 });

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar usuários', error: error.message });
  }
});

// Criar novo usuário
router.post('/', async (req, res) => {
  try {
    const { name, email, role } = req.body;

    const user = new User({
      name,
      email,
      role,
      company: req.company._id
    });

    await user.save();

    res.status(201).json(user);
  } catch (error) {
    res.status(400).json({ message: 'Erro ao criar usuário', error: error.message });
  }
});

// Buscar usuário por ID
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.params.id,
      company: req.company._id
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar usuário', error: error.message });
  }
});

// Atualizar usuário
router.put('/:id', async (req, res) => {
  try {
    const { name, email, role } = req.body;

    const user = await User.findOneAndUpdate(
      { _id: req.params.id, company: req.company._id },
      { name, email, role },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    res.json(user);
  } catch (error) {
    res.status(400).json({ message: 'Erro ao atualizar usuário', error: error.message });
  }
});

// Deletar usuário
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findOneAndDelete({
      _id: req.params.id,
      company: req.company._id
    });

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    res.json({ message: 'Usuário deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao deletar usuário', error: error.message });
  }
});

module.exports = router;

