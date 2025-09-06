# SiGeT - Sistema de Gerenciamento de Testes

## Descrição

O SiGeT é um protótipo de sistema de gerenciamento de testes desenvolvido com base na documentação fornecida. O sistema permite que empresas gerenciem seus casos de teste de forma visual através de um quadro Kanban, com funcionalidades de arrastar e soltar, filtros e controle de usuários.

## Tecnologias Utilizadas

### Backend
- **Node.js** com Express.js
- **MongoDB Atlas** (banco de dados na nuvem)
- **Mongoose** (ODM para MongoDB)
- **JWT** (autenticação)
- **bcryptjs** (criptografia de senhas)
- **CORS** (Cross-Origin Resource Sharing)

### Frontend
- **Vue.js 3** (Composition API)
- **Vue Router 4** (roteamento)
- **Axios** (requisições HTTP)
- **VueDraggable** (funcionalidade drag-and-drop)
- **Vite** (build tool)

## Funcionalidades Implementadas

### Autenticação
- ✅ Registro de empresas (nome, CNPJ, email, senha)
- ✅ Login com validação JWT
- ✅ Proteção de rotas autenticadas
- ✅ Logout

### Gerenciamento de Cartões de Teste
- ✅ Criação de cartões com título, descrição, status, prioridade
- ✅ Visualização em quadro Kanban (5 colunas: A Fazer, Em Progresso, Testando, Concluído, Bloqueado)
- ✅ Edição e exclusão de cartões
- ✅ Arrastar e soltar entre colunas (drag-and-drop)
- ✅ Filtros por status, prioridade e responsável
- ✅ Atribuição de responsáveis aos cartões
- ✅ Controle de resultados de teste (Pendente, Aprovado, Reprovado, Bloqueado)

### Gerenciamento de Usuários
- ✅ Cadastro de usuários por empresa
- ✅ Diferentes funções (Testador, Desenvolvedor, Gerente)
- ✅ Atribuição de usuários aos cartões

### Interface
- ✅ Design responsivo
- ✅ Interface moderna e intuitiva
- ✅ Feedback visual para diferentes prioridades
- ✅ Modais para criação/edição

## Estrutura do Projeto

```
siget-prototype/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── views/
│   │   │   ├── Login.vue
│   │   │   ├── Register.vue
│   │   │   └── Dashboard.vue
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── router/
│   │   │   └── index.js
│   │   ├── App.vue
│   │   └── main.js
│   ├── server/
│   │   ├── models/
│   │   │   ├── Company.js
│   │   │   ├── User.js
│   │   │   ├── TestCard.js
│   │   │   └── Comment.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── testCards.js
│   │   │   └── users.js
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   ├── server.js
│   │   ├── .env
│   │   └── package.json
│   ├── package.json
│   └── vite.config.js
```

## Como Executar o Protótipo

### Pré-requisitos
- Node.js (versão 16 ou superior)
- npm ou yarn
- Acesso à internet (para MongoDB Atlas)

### Execução

1.  Navegue até a pasta principal do projeto:
    ```bash
    cd siget-prototype/frontend
    ```

2.  Instale as dependências do frontend:
    ```bash
    npm install
    ```

3.  Instale as dependências do backend (agora dentro da pasta `server`):
    ```bash
    cd server
    npm install
    cd ..
    ```

4.  Configure as variáveis de ambiente no arquivo `.env` (localizado em `siget-prototype/frontend/server/.env`):
    ```
    MONGO_URI=mongodb+srv://roquefneto:senha123@testbs.zgkzc64.mongodb.net/siget?retryWrites=true&w=majority&appName=TestBs
    PORT=5000
    JWT_SECRET=siget_jwt_secret_key_2024
    ```

5.  Inicie o servidor backend:
    ```bash
    npm run server
    ```

6.  Em um novo terminal, inicie o servidor de desenvolvimento do frontend:
    ```bash
    cd siget-prototype/frontend
    npm run dev
    ```

O backend estará rodando em `http://localhost:5000` e o frontend em `http://localhost:3001`.

## Como Usar o Sistema

### 1. Registro de Empresa
- Acesse `http://localhost:3001`
- Clique em "Registre-se aqui"
- Preencha os dados da empresa (nome, CNPJ, email, senha)
- Clique em "Registrar"

### 2. Login
- Na tela de login, insira email e senha da empresa
- Clique em "Entrar"

### 3. Dashboard
- Após o login, você será redirecionado para o dashboard
- Use os filtros para visualizar cartões específicos
- Clique em "Novo Cartão" para criar um caso de teste

### 4. Gerenciamento de Cartões
- **Criar**: Clique em "Novo Cartão" e preencha as informações
- **Editar**: Clique em qualquer cartão existente
- **Mover**: Arraste e solte cartões entre as colunas
- **Filtrar**: Use os filtros por status, prioridade ou responsável

### 5. Gerenciamento de Usuários
- Clique em "Gerenciar Usuários"
- Adicione novos usuários preenchendo nome, email e função
- Usuários podem ser atribuídos aos cartões

## Dados de Teste

Para testar o sistema, você pode usar os seguintes dados:

**Empresa de Teste:**
- Nome: Empresa Teste SiGeT
- CNPJ: 12.345.678/0001-90
- Email: teste@siget.com
- Senha: 123456

## Arquitetura

### Backend (API REST)
- **Autenticação**: JWT com middleware de proteção
- **Banco de Dados**: MongoDB Atlas com Mongoose
- **Rotas**: Organizadas por funcionalidade (auth, testCards, users)
- **Validação**: Validação de dados de entrada
- **CORS**: Configurado para permitir requisições do frontend

### Frontend (SPA)
- **Vue 3**: Composition API para reatividade
- **Roteamento**: Vue Router com guards de autenticação
- **Estado**: Gerenciamento local com refs e computed
- **HTTP**: Axios com interceptors para token JWT
- **UI**: Interface responsiva com CSS moderno

### Integração
- **API**: Comunicação via HTTP REST
- **Autenticação**: Token JWT armazenado no localStorage
- **Tempo Real**: Atualizações automáticas após operações CRUD

## Funcionalidades Avançadas Implementadas

1. **Drag and Drop**: Cartões podem ser arrastados entre colunas
2. **Filtros Dinâmicos**: Filtros em tempo real por múltiplos critérios
3. **Validação de Formulários**: Validação client-side e server-side
4. **Feedback Visual**: Cores diferentes para prioridades e status
5. **Responsividade**: Interface adaptável para diferentes dispositivos
6. **Segurança**: Autenticação JWT e validação de dados

## Melhorias Futuras

- Implementação de comentários nos cartões
- Histórico de movimentações
- Notificações em tempo real
- Relatórios e dashboards analíticos
- Integração com ferramentas de CI/CD
- Testes automatizados
- Deploy em produção

## Contato

Este protótipo foi desenvolvido seguindo as especificações do documento "Plano de Testes - SiGeT" fornecido.

