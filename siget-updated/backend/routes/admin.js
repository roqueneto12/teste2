const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Company = require('../models/Company');
const User = require('../models/User');
const TestItem = require('../models/TestItem');
const auth = require('../middleware/auth');
const router = express.Router();

// Middleware para verificar se é admin
const isAdmin = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Token não fornecido' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    
    // Verificar se é um admin
    const admin = await Admin.findById(decoded.adminId);
    if (!admin) {
      return res.status(403).json({ message: 'Acesso negado. Apenas administradores.' });
    }

    req.admin = admin;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token inválido' });
  }
};

// Login do admin
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar admin
    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    // Verificar senha
    const isPasswordValid = await admin.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    // Gerar token JWT
    const token = jwt.sign(
      { adminId: admin._id, role: 'admin' },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login de admin realizado com sucesso',
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        permissions: admin.permissions
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro interno do servidor', error: error.message });
  }
});

// CRUD de Empresas
// Listar todas as empresas
router.get('/companies', isAdmin, async (req, res) => {
  try {
    const companies = await Company.find().select('-password');
    res.json({ companies });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar empresas', error: error.message });
  }
});

// Criar nova empresa
router.post('/companies', isAdmin, async (req, res) => {
  try {
    const { name, cnpj, email, password } = req.body;

    // Verificar se a empresa já existe
    const existingCompany = await Company.findOne({ 
      $or: [{ email }, { cnpj }] 
    });
    
    if (existingCompany) {
      return res.status(400).json({ 
        message: 'Empresa já cadastrada com este email ou CNPJ' 
      });
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 12);

    // Criar nova empresa
    const company = new Company({
      name,
      cnpj,
      email,
      password: hashedPassword
    });

    await company.save();

    res.status(201).json({
      message: 'Empresa criada com sucesso',
      company: {
        id: company._id,
        name: company.name,
        email: company.email,
        cnpj: company.cnpj
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar empresa', error: error.message });
  }
});

// Atualizar empresa
router.put('/companies/:id', isAdmin, async (req, res) => {
  try {
    const { name, cnpj, email } = req.body;
    const company = await Company.findByIdAndUpdate(
      req.params.id,
      { name, cnpj, email },
      { new: true, runValidators: true }
    ).select('-password');

    if (!company) {
      return res.status(404).json({ message: 'Empresa não encontrada' });
    }

    res.json({ message: 'Empresa atualizada com sucesso', company });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar empresa', error: error.message });
  }
});

// Deletar empresa
router.delete('/companies/:id', isAdmin, async (req, res) => {
  try {
    const company = await Company.findByIdAndDelete(req.params.id);
    
    if (!company) {
      return res.status(404).json({ message: 'Empresa não encontrada' });
    }

    // Deletar todos os usuários da empresa
    await User.deleteMany({ company: req.params.id });

    res.json({ message: 'Empresa deletada com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao deletar empresa', error: error.message });
  }
});

// CRUD de Usuários
// Listar todos os usuários
router.get('/users', isAdmin, async (req, res) => {
  try {
    const users = await User.find().populate('company', 'name cnpj');
    res.json({ users });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar usuários', error: error.message });
  }
});

// Criar novo usuário
router.post('/users', isAdmin, async (req, res) => {
  try {
    const { name, email, role, company, phone, department } = req.body;

    // Verificar se a empresa existe
    const companyExists = await Company.findById(company);
    if (!companyExists) {
      return res.status(400).json({ message: 'Empresa não encontrada' });
    }

    const user = new User({
      name,
      email,
      role,
      company,
      phone,
      department
    });

    await user.save();
    await user.populate('company', 'name cnpj');

    res.status(201).json({
      message: 'Usuário criado com sucesso',
      user
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar usuário', error: error.message });
  }
});

// Atualizar usuário
router.put('/users/:id', isAdmin, async (req, res) => {
  try {
    const { name, email, role, status, phone, department } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, role, status, phone, department },
      { new: true, runValidators: true }
    ).populate('company', 'name cnpj');

    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    res.json({ message: 'Usuário atualizado com sucesso', user });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar usuário', error: error.message });
  }
});

// Deletar usuário
router.delete('/users/:id', isAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    res.json({ message: 'Usuário deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao deletar usuário', error: error.message });
  }
});

// CRUD de Itens de Teste
// Listar todos os itens de teste
router.get('/test-items', isAdmin, async (req, res) => {
  try {
    const testItems = await TestItem.find().populate('createdBy', 'name email');
    res.json({ testItems });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar itens de teste', error: error.message });
  }
});

// Criar novo item de teste
router.post('/test-items', isAdmin, async (req, res) => {
  try {
    const testItem = new TestItem({
      ...req.body,
      createdBy: req.admin._id
    });

    await testItem.save();
    await testItem.populate('createdBy', 'name email');

    res.status(201).json({
      message: 'Item de teste criado com sucesso',
      testItem
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao criar item de teste', error: error.message });
  }
});

// Atualizar item de teste
router.put('/test-items/:id', isAdmin, async (req, res) => {
  try {
    const testItem = await TestItem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('createdBy', 'name email');

    if (!testItem) {
      return res.status(404).json({ message: 'Item de teste não encontrado' });
    }

    res.json({ message: 'Item de teste atualizado com sucesso', testItem });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar item de teste', error: error.message });
  }
});

// Deletar item de teste
router.delete('/test-items/:id', isAdmin, async (req, res) => {
  try {
    const testItem = await TestItem.findByIdAndDelete(req.params.id);
    
    if (!testItem) {
      return res.status(404).json({ message: 'Item de teste não encontrado' });
    }

    res.json({ message: 'Item de teste deletado com sucesso' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao deletar item de teste', error: error.message });
  }
});

// Associar cliente ao sistema (empresa)
router.post('/associate-client', isAdmin, async (req, res) => {
  try {
    const { companyId, clientData } = req.body;

    const company = await Company.findById(companyId);
    if (!company) {
      return res.status(404).json({ message: 'Empresa não encontrada' });
    }

    // Aqui você pode adicionar lógica específica para associar um cliente
    // Por exemplo, criar um campo 'clients' no modelo Company
    // Por enquanto, vamos apenas retornar sucesso
    
    res.json({
      message: 'Cliente associado com sucesso',
      company: company.name,
      clientData
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao associar cliente', error: error.message });
  }
});

// Dashboard - estatísticas gerais
router.get('/dashboard', isAdmin, async (req, res) => {
  try {
    const totalCompanies = await Company.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalTestItems = await TestItem.countDocuments();
    
    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);

    const companiesWithUserCount = await Company.aggregate([
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: 'company',
          as: 'users'
        }
      },
      {
        $project: {
          name: 1,
          email: 1,
          cnpj: 1,
          userCount: { $size: '$users' },
          createdAt: 1
        }
      },
      { $sort: { userCount: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      statistics: {
        totalCompanies,
        totalUsers,
        totalTestItems,
        usersByRole,
        topCompanies: companiesWithUserCount
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar estatísticas', error: error.message });
  }
});

module.exports = router;

