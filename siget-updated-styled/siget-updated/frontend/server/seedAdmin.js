require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/Admin');

async function createDefaultAdmin() {
  try {
    // Conectar ao MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/siget', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('MongoDB connected');

    // Verificar se já existe um admin
    const existingAdmin = await Admin.findOne({ email: 'admin@siget.com' });
    
    if (existingAdmin) {
      console.log('Admin padrão já existe');
      return;
    }

    // Criar admin padrão
    const admin = new Admin({
      name: 'Administrador SiGeT',
      email: 'admin@siget.com',
      password: 'admin123',
      permissions: ['manage_companies', 'manage_users', 'manage_tests', 'view_reports']
    });

    await admin.save();
    console.log('Admin padrão criado com sucesso!');
    console.log('Email: admin@siget.com');
    console.log('Senha: admin123');

  } catch (error) {
    console.error('Erro ao criar admin:', error);
  } finally {
    await mongoose.connection.close();
  }
}

createDefaultAdmin();

