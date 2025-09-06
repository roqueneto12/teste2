require('dotenv').config();
const mongoose = require('mongoose');
const TestItem = require('./models/TestItem');
const Admin = require('./models/Admin');

const testItems = [
  {
    title: 'Teste de Login - Credenciais Válidas',
    description: 'Verificar se o usuário consegue fazer login com credenciais válidas',
    category: 'funcional',
    priority: 'alta',
    estimatedTime: 0.5,
    prerequisites: 'Usuário cadastrado no sistema',
    expectedResult: 'Usuário deve ser redirecionado para o dashboard após login bem-sucedido',
    steps: [
      { stepNumber: 1, description: 'Acessar a página de login' },
      { stepNumber: 2, description: 'Inserir email válido' },
      { stepNumber: 3, description: 'Inserir senha válida' },
      { stepNumber: 4, description: 'Clicar no botão "Entrar"' }
    ],
    tags: ['login', 'autenticacao', 'funcional']
  },
  {
    title: 'Teste de Login - Credenciais Inválidas',
    description: 'Verificar se o sistema rejeita credenciais inválidas',
    category: 'funcional',
    priority: 'alta',
    estimatedTime: 0.5,
    prerequisites: 'Sistema funcionando normalmente',
    expectedResult: 'Sistema deve exibir mensagem de erro e não permitir acesso',
    steps: [
      { stepNumber: 1, description: 'Acessar a página de login' },
      { stepNumber: 2, description: 'Inserir email inválido ou senha incorreta' },
      { stepNumber: 3, description: 'Clicar no botão "Entrar"' }
    ],
    tags: ['login', 'seguranca', 'validacao']
  },
  {
    title: 'Teste de Criação de Cartão',
    description: 'Verificar se é possível criar um novo cartão de teste',
    category: 'funcional',
    priority: 'media',
    estimatedTime: 1,
    prerequisites: 'Usuário logado no sistema',
    expectedResult: 'Cartão deve ser criado e aparecer no quadro Kanban',
    steps: [
      { stepNumber: 1, description: 'Clicar no botão "Novo Cartão"' },
      { stepNumber: 2, description: 'Preencher título do cartão' },
      { stepNumber: 3, description: 'Preencher descrição' },
      { stepNumber: 4, description: 'Selecionar prioridade' },
      { stepNumber: 5, description: 'Clicar em "Salvar"' }
    ],
    tags: ['cartao', 'criacao', 'kanban']
  },
  {
    title: 'Teste de Drag and Drop',
    description: 'Verificar se os cartões podem ser movidos entre colunas',
    category: 'usabilidade',
    priority: 'media',
    estimatedTime: 0.5,
    prerequisites: 'Cartões existentes no quadro',
    expectedResult: 'Cartão deve mudar de coluna e status deve ser atualizado',
    steps: [
      { stepNumber: 1, description: 'Selecionar um cartão' },
      { stepNumber: 2, description: 'Arrastar para outra coluna' },
      { stepNumber: 3, description: 'Soltar o cartão' },
      { stepNumber: 4, description: 'Verificar se o status foi atualizado' }
    ],
    tags: ['drag-drop', 'kanban', 'interface']
  },
  {
    title: 'Teste de Performance - Carregamento da Página',
    description: 'Verificar se a página carrega em tempo aceitável',
    category: 'performance',
    priority: 'media',
    estimatedTime: 1,
    prerequisites: 'Conexão de internet estável',
    expectedResult: 'Página deve carregar em menos de 3 segundos',
    steps: [
      { stepNumber: 1, description: 'Abrir ferramentas de desenvolvedor' },
      { stepNumber: 2, description: 'Acessar a aba Network' },
      { stepNumber: 3, description: 'Recarregar a página' },
      { stepNumber: 4, description: 'Verificar tempo de carregamento' }
    ],
    tags: ['performance', 'carregamento', 'tempo']
  },
  {
    title: 'Teste de Responsividade Mobile',
    description: 'Verificar se a interface funciona corretamente em dispositivos móveis',
    category: 'compatibilidade',
    priority: 'media',
    estimatedTime: 2,
    prerequisites: 'Dispositivo móvel ou emulador',
    expectedResult: 'Interface deve se adaptar corretamente ao tamanho da tela',
    steps: [
      { stepNumber: 1, description: 'Acessar o sistema em dispositivo móvel' },
      { stepNumber: 2, description: 'Testar navegação entre páginas' },
      { stepNumber: 3, description: 'Testar criação de cartões' },
      { stepNumber: 4, description: 'Verificar se todos os elementos são clicáveis' }
    ],
    tags: ['mobile', 'responsividade', 'interface']
  },
  {
    title: 'Teste de Segurança - SQL Injection',
    description: 'Verificar se o sistema está protegido contra ataques de SQL Injection',
    category: 'seguranca',
    priority: 'critica',
    estimatedTime: 2,
    prerequisites: 'Conhecimento básico de SQL Injection',
    expectedResult: 'Sistema deve rejeitar tentativas de SQL Injection',
    steps: [
      { stepNumber: 1, description: 'Identificar campos de entrada' },
      { stepNumber: 2, description: 'Inserir payloads de SQL Injection' },
      { stepNumber: 3, description: 'Verificar resposta do sistema' },
      { stepNumber: 4, description: 'Documentar vulnerabilidades encontradas' }
    ],
    tags: ['seguranca', 'sql-injection', 'vulnerabilidade']
  },
  {
    title: 'Teste de Filtros do Kanban',
    description: 'Verificar se os filtros do quadro Kanban funcionam corretamente',
    category: 'funcional',
    priority: 'media',
    estimatedTime: 1,
    prerequisites: 'Cartões com diferentes status e prioridades',
    expectedResult: 'Filtros devem mostrar apenas cartões que atendem aos critérios',
    steps: [
      { stepNumber: 1, description: 'Aplicar filtro por status' },
      { stepNumber: 2, description: 'Verificar se apenas cartões do status selecionado aparecem' },
      { stepNumber: 3, description: 'Aplicar filtro por prioridade' },
      { stepNumber: 4, description: 'Combinar múltiplos filtros' }
    ],
    tags: ['filtros', 'kanban', 'busca']
  }
];

async function seedTestItems() {
  try {
    // Conectar ao MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/siget', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('MongoDB connected');

    // Buscar admin para associar aos itens
    const admin = await Admin.findOne({ email: 'admin@siget.com' });
    
    if (!admin) {
      console.log('Admin não encontrado. Execute primeiro o seedAdmin.js');
      return;
    }

    // Verificar se já existem itens de teste
    const existingItems = await TestItem.countDocuments();
    
    if (existingItems > 0) {
      console.log('Itens de teste já existem no banco');
      return;
    }

    // Criar itens de teste
    const itemsWithAdmin = testItems.map(item => ({
      ...item,
      createdBy: admin._id
    }));

    await TestItem.insertMany(itemsWithAdmin);
    console.log(`${testItems.length} itens de teste criados com sucesso!`);

  } catch (error) {
    console.error('Erro ao criar itens de teste:', error);
  } finally {
    await mongoose.connection.close();
  }
}

seedTestItems();

