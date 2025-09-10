const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Company = require('../models/Company');
const router = express.Router();

// Registrar empresa
router.post('/register', async (req, res) => {
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

    // Gerar token JWT
    const token = jwt.sign(
      { companyId: company._id },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Empresa registrada com sucesso',
      token,
      company: {
        id: company._id,
        name: company.name,
        email: company.email,
        cnpj: company.cnpj
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro interno do servidor', error: error.message });
  }
});

// Login da empresa
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Buscar empresa
    const company = await Company.findOne({ email });
    if (!company) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    // Verificar senha
    const isPasswordValid = await bcrypt.compare(password, company.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Credenciais inválidas' });
    }

    // Gerar token JWT
    const token = jwt.sign(
      { companyId: company._id },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Login realizado com sucesso',
      token,
      company: {
        id: company._id,
        name: company.name,
        email: company.email,
        cnpj: company.cnpj
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro interno do servidor', error: error.message });
  }
});

module.exports = router;

