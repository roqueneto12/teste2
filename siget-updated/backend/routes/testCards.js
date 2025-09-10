const express = require('express');
const TestCard = require('../models/TestCard');
const User = require('../models/User');
const auth = require('../middleware/auth');
const router = express.Router();

// Aplicar middleware de autenticação a todas as rotas
router.use(auth);

// Listar todos os cartões da empresa
router.get('/', async (req, res) => {
  try {
    const { status, priority, assignee } = req.query;
    
    let filter = { company: req.company._id };
    
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignee) filter.assignee = assignee;

    const testCards = await TestCard.find(filter)
      .populate('assignee', 'name email role')
      .sort({ createdAt: -1 });

    res.json(testCards);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar cartões', error: error.message });
  }
});

// Criar novo cartão
router.post('/', async (req, res) => {
  try {
    const { title, description, priority, assignee } = req.body;

    const testCard = new TestCard({
      title,
      description,
      priority,
      assignee: assignee || null,
      company: req.company._id
    });

    await testCard.save();
    await testCard.populate('assignee', 'name email role');

    res.status(201).json(testCard);
  } catch (error) {
    res.status(400).json({ message: 'Erro ao criar cartão', error: error.message });
  }
});

// Buscar cartão por ID
router.get('/:id', async (req, res) => {
  try {
    const testCard = await TestCard.findOne({
      _id: req.params.id,
      company: req.company._id
    }).populate('assignee', 'name email role');

    if (!testCard) {
      return res.status(404).json({ message: 'Cartão não encontrado' });
    }

    res.json(testCard);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar cartão', error: error.message });
  }
});

// Atualizar cartão
router.put('/:id', async (req, res) => {
  try {
    const { title, description, status, priority, assignee, testResult, position } = req.body;

    const testCard = await TestCard.findOneAndUpdate(
      { _id: req.params.id, company: req.company._id },
      { 
        title, 
        description, 
        status, 
        priority, 
        assignee: assignee || null, 
        testResult,
        position
      },
      { new: true, runValidators: true }
    ).populate('assignee', 'name email role');

    if (!testCard) {
      return res.status(404).json({ message: 'Cartão não encontrado' });
    }

    res.json(testCard);
  } catch (error) {
    res.status(400).json({ message: 'Erro ao atualizar cartão', error: error.message });
  }
});

// Deletar cartão
router.delete('/:id', async (req, res) => {
  try {
    const testCard = await TestCard.findOneAndDelete({
      _id: req.params.id,
      company: req.company._id
    });

    if (!testCard) {
      return res.status(404).json({ message: 'Cartão não encontrado' });
    }

    res.json({ message: 'Cartão deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao deletar cartão', error: error.message });
  }
});

module.exports = router;

