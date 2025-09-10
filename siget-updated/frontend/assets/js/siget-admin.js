// ===== GERENCIADOR ADMINISTRATIVO =====
const AdminManager = {
  
  // Mostrar modal de gerenciamento de empresas
  async showCompaniesModal() {
    try {
      const response = await API.getCompanies();
      const companies = response.companies;

      const modalHTML = `
        <div id="companies-modal" class="modal active">
          <div class="modal-overlay"></div>
          <div class="modal-content" style="max-width: 800px;">
            <div class="modal-header">
              <h3 class="modal-title">Gerenciar Empresas</h3>
              <button class="modal-close" onclick="AdminManager.closeModal('companies-modal')">✕</button>
            </div>
            <div class="modal-body">
              <div class="admin-actions-header">
                <button class="btn btn-primary" onclick="AdminManager.showCreateCompanyForm()">
                  Nova Empresa
                </button>
              </div>
              <div class="admin-table-container">
                <table class="admin-table">
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>CNPJ</th>
                      <th>Email</th>
                      <th>Data de Criação</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${companies.map(company => `
                      <tr>
                        <td>${company.name}</td>
                        <td>${company.cnpj}</td>
                        <td>${company.email}</td>
                        <td>${Utils.formatDate(company.createdAt)}</td>
                        <td>
                          <button class="btn-small btn-secondary" onclick="AdminManager.editCompany('${company._id}')">
                            Editar
                          </button>
                          <button class="btn-small btn-danger" onclick="AdminManager.deleteCompany('${company._id}')">
                            Excluir
                          </button>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      `;

      document.body.insertAdjacentHTML('beforeend', modalHTML);
    } catch (error) {
      Toast.show('Erro ao carregar empresas: ' + error.message, 'error');
    }
  },

  // Mostrar modal de gerenciamento de usuários
  async showUsersModal() {
    try {
      const response = await API.getUsers();
      const users = response.users;

      const modalHTML = `
        <div id="users-modal" class="modal active">
          <div class="modal-overlay"></div>
          <div class="modal-content" style="max-width: 900px;">
            <div class="modal-header">
              <h3 class="modal-title">Gerenciar Usuários</h3>
              <button class="modal-close" onclick="AdminManager.closeModal('users-modal')">✕</button>
            </div>
            <div class="modal-body">
              <div class="admin-actions-header">
                <button class="btn btn-primary" onclick="AdminManager.showCreateUserForm()">
                  Novo Usuário
                </button>
              </div>
              <div class="admin-table-container">
                <table class="admin-table">
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>Email</th>
                      <th>Função</th>
                      <th>Empresa</th>
                      <th>Status</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${users.map(user => `
                      <tr>
                        <td>${user.name}</td>
                        <td>${user.email}</td>
                        <td>
                          <span class="role-badge role-${user.role}">
                            ${user.role}
                          </span>
                        </td>
                        <td>${user.company?.name || 'N/A'}</td>
                        <td>
                          <span class="status-badge status-${user.status}">
                            ${user.status}
                          </span>
                        </td>
                        <td>
                          <button class="btn-small btn-secondary" onclick="AdminManager.editUser('${user._id}')">
                            Editar
                          </button>
                          <button class="btn-small btn-danger" onclick="AdminManager.deleteUser('${user._id}')">
                            Excluir
                          </button>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      `;

      document.body.insertAdjacentHTML('beforeend', modalHTML);
    } catch (error) {
      Toast.show('Erro ao carregar usuários: ' + error.message, 'error');
    }
  },

  // Mostrar modal de gerenciamento de itens de teste
  async showTestItemsModal() {
    try {
      const response = await API.getTestItems();
      const testItems = response.testItems;

      const modalHTML = `
        <div id="test-items-modal" class="modal active">
          <div class="modal-overlay"></div>
          <div class="modal-content" style="max-width: 1000px;">
            <div class="modal-header">
              <h3 class="modal-title">Gerenciar Itens de Teste</h3>
              <button class="modal-close" onclick="AdminManager.closeModal('test-items-modal')">✕</button>
            </div>
            <div class="modal-body">
              <div class="admin-actions-header">
                <button class="btn btn-primary" onclick="AdminManager.showCreateTestItemForm()">
                  Novo Item de Teste
                </button>
              </div>
              <div class="admin-table-container">
                <table class="admin-table">
                  <thead>
                    <tr>
                      <th>Título</th>
                      <th>Categoria</th>
                      <th>Prioridade</th>
                      <th>Tempo Estimado</th>
                      <th>Criado por</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${testItems.map(item => `
                      <tr>
                        <td>${item.title}</td>
                        <td>
                          <span class="category-badge category-${item.category}">
                            ${item.category}
                          </span>
                        </td>
                        <td>
                          <span class="priority-badge priority-${item.priority}">
                            ${item.priority}
                          </span>
                        </td>
                        <td>${item.estimatedTime}h</td>
                        <td>${item.createdBy?.name || 'Sistema'}</td>
                        <td>
                          <button class="btn-small btn-info" onclick="AdminManager.viewTestItem('${item._id}')">
                            Ver
                          </button>
                          <button class="btn-small btn-secondary" onclick="AdminManager.editTestItem('${item._id}')">
                            Editar
                          </button>
                          <button class="btn-small btn-danger" onclick="AdminManager.deleteTestItem('${item._id}')">
                            Excluir
                          </button>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      `;

      document.body.insertAdjacentHTML('beforeend', modalHTML);
    } catch (error) {
      Toast.show('Erro ao carregar itens de teste: ' + error.message, 'error');
    }
  },

  // Fechar modal
  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.remove();
    }
  },

  // Formulário de criação de empresa
  showCreateCompanyForm() {
    const formHTML = `
      <div id="create-company-modal" class="modal active">
        <div class="modal-overlay"></div>
        <div class="modal-content">
          <div class="modal-header">
            <h3 class="modal-title">Nova Empresa</h3>
            <button class="modal-close" onclick="AdminManager.closeModal('create-company-modal')">✕</button>
          </div>
          <div class="modal-body">
            <form id="create-company-form">
              <div class="form-group">
                <label class="form-label">Nome da Empresa:</label>
                <input type="text" class="form-input" id="company-name" required>
              </div>
              <div class="form-group">
                <label class="form-label">CNPJ:</label>
                <input type="text" class="form-input" id="company-cnpj" required>
              </div>
              <div class="form-group">
                <label class="form-label">Email:</label>
                <input type="email" class="form-input" id="company-email" required>
              </div>
              <div class="form-group">
                <label class="form-label">Senha:</label>
                <input type="password" class="form-input" id="company-password" required>
              </div>
              <button type="submit" class="btn btn-primary btn-full">Criar Empresa</button>
            </form>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', formHTML);

    document.getElementById('create-company-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const companyData = {
        name: document.getElementById('company-name').value,
        cnpj: document.getElementById('company-cnpj').value,
        email: document.getElementById('company-email').value,
        password: document.getElementById('company-password').value
      };

      try {
        await API.createCompany(companyData);
        Toast.show('Empresa criada com sucesso!', 'success');
        AdminManager.closeModal('create-company-modal');
        AdminManager.closeModal('companies-modal');
        AdminManager.showCompaniesModal(); // Recarregar lista
      } catch (error) {
        Toast.show('Erro ao criar empresa: ' + error.message, 'error');
      }
    });
  },

  // Formulário de criação de usuário
  async showCreateUserForm() {
    try {
      const companiesResponse = await API.getCompanies();
      const companies = companiesResponse.companies;

      const formHTML = `
        <div id="create-user-modal" class="modal active">
          <div class="modal-overlay"></div>
          <div class="modal-content">
            <div class="modal-header">
              <h3 class="modal-title">Novo Usuário</h3>
              <button class="modal-close" onclick="AdminManager.closeModal('create-user-modal')">✕</button>
            </div>
            <div class="modal-body">
              <form id="create-user-form">
                <div class="form-group">
                  <label class="form-label">Nome:</label>
                  <input type="text" class="form-input" id="user-name" required>
                </div>
                <div class="form-group">
                  <label class="form-label">Email:</label>
                  <input type="email" class="form-input" id="user-email" required>
                </div>
                <div class="form-group">
                  <label class="form-label">Função:</label>
                  <select class="form-input" id="user-role" required>
                    <option value="">Selecione uma função</option>
                    <option value="testador">Testador</option>
                    <option value="desenvolvedor">Desenvolvedor</option>
                    <option value="gerente">Gerente</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Empresa:</label>
                  <select class="form-input" id="user-company" required>
                    <option value="">Selecione uma empresa</option>
                    ${companies.map(company => `
                      <option value="${company._id}">${company.name}</option>
                    `).join('')}
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Telefone:</label>
                  <input type="text" class="form-input" id="user-phone">
                </div>
                <div class="form-group">
                  <label class="form-label">Departamento:</label>
                  <input type="text" class="form-input" id="user-department">
                </div>
                <button type="submit" class="btn btn-primary btn-full">Criar Usuário</button>
              </form>
            </div>
          </div>
        </div>
      `;

      document.body.insertAdjacentHTML('beforeend', formHTML);

      document.getElementById('create-user-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const userData = {
          name: document.getElementById('user-name').value,
          email: document.getElementById('user-email').value,
          role: document.getElementById('user-role').value,
          company: document.getElementById('user-company').value,
          phone: document.getElementById('user-phone').value,
          department: document.getElementById('user-department').value
        };

        try {
          await API.createUser(userData);
          Toast.show('Usuário criado com sucesso!', 'success');
          AdminManager.closeModal('create-user-modal');
          AdminManager.closeModal('users-modal');
          AdminManager.showUsersModal(); // Recarregar lista
        } catch (error) {
          Toast.show('Erro ao criar usuário: ' + error.message, 'error');
        }
      });
    } catch (error) {
      Toast.show('Erro ao carregar empresas: ' + error.message, 'error');
    }
  },

  // Formulário de criação de item de teste
  showCreateTestItemForm() {
    const formHTML = `
      <div id="create-test-item-modal" class="modal active">
        <div class="modal-overlay"></div>
        <div class="modal-content" style="max-width: 600px;">
          <div class="modal-header">
            <h3 class="modal-title">Novo Item de Teste</h3>
            <button class="modal-close" onclick="AdminManager.closeModal('create-test-item-modal')">✕</button>
          </div>
          <div class="modal-body">
            <form id="create-test-item-form">
              <div class="form-group">
                <label class="form-label">Título:</label>
                <input type="text" class="form-input" id="test-item-title" required>
              </div>
              <div class="form-group">
                <label class="form-label">Descrição:</label>
                <textarea class="form-input" id="test-item-description" rows="3" required></textarea>
              </div>
              <div class="form-group">
                <label class="form-label">Categoria:</label>
                <select class="form-input" id="test-item-category" required>
                  <option value="">Selecione uma categoria</option>
                  <option value="funcional">Funcional</option>
                  <option value="performance">Performance</option>
                  <option value="seguranca">Segurança</option>
                  <option value="usabilidade">Usabilidade</option>
                  <option value="compatibilidade">Compatibilidade</option>
                  <option value="regressao">Regressão</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Prioridade:</label>
                <select class="form-input" id="test-item-priority" required>
                  <option value="">Selecione uma prioridade</option>
                  <option value="baixa">Baixa</option>
                  <option value="media">Média</option>
                  <option value="alta">Alta</option>
                  <option value="critica">Crítica</option>
                </select>
              </div>
              <div class="form-group">
                <label class="form-label">Tempo Estimado (horas):</label>
                <input type="number" class="form-input" id="test-item-time" min="0.5" step="0.5" value="1" required>
              </div>
              <div class="form-group">
                <label class="form-label">Pré-requisitos:</label>
                <textarea class="form-input" id="test-item-prerequisites" rows="2"></textarea>
              </div>
              <div class="form-group">
                <label class="form-label">Resultado Esperado:</label>
                <textarea class="form-input" id="test-item-expected" rows="2" required></textarea>
              </div>
              <button type="submit" class="btn btn-primary btn-full">Criar Item de Teste</button>
            </form>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', formHTML);

    document.getElementById('create-test-item-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const testItemData = {
        title: document.getElementById('test-item-title').value,
        description: document.getElementById('test-item-description').value,
        category: document.getElementById('test-item-category').value,
        priority: document.getElementById('test-item-priority').value,
        estimatedTime: parseFloat(document.getElementById('test-item-time').value),
        prerequisites: document.getElementById('test-item-prerequisites').value,
        expectedResult: document.getElementById('test-item-expected').value,
        steps: [
          { stepNumber: 1, description: 'Passo a ser definido' }
        ],
        tags: []
      };

      try {
        await API.createTestItem(testItemData);
        Toast.show('Item de teste criado com sucesso!', 'success');
        AdminManager.closeModal('create-test-item-modal');
        AdminManager.closeModal('test-items-modal');
        AdminManager.showTestItemsModal(); // Recarregar lista
      } catch (error) {
        Toast.show('Erro ao criar item de teste: ' + error.message, 'error');
      }
    });
  },

  // Deletar empresa
  async deleteCompany(id) {
    if (confirm('Tem certeza que deseja excluir esta empresa? Esta ação não pode ser desfeita.')) {
      try {
        await API.deleteCompany(id);
        Toast.show('Empresa excluída com sucesso!', 'success');
        AdminManager.closeModal('companies-modal');
        AdminManager.showCompaniesModal(); // Recarregar lista
      } catch (error) {
        Toast.show('Erro ao excluir empresa: ' + error.message, 'error');
      }
    }
  },

  // Deletar usuário
  async deleteUser(id) {
    if (confirm('Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.')) {
      try {
        await API.deleteUser(id);
        Toast.show('Usuário excluído com sucesso!', 'success');
        AdminManager.closeModal('users-modal');
        AdminManager.showUsersModal(); // Recarregar lista
      } catch (error) {
        Toast.show('Erro ao excluir usuário: ' + error.message, 'error');
      }
    }
  },

  // Deletar item de teste
  async deleteTestItem(id) {
    if (confirm('Tem certeza que deseja excluir este item de teste? Esta ação não pode ser desfeita.')) {
      try {
        await API.deleteTestItem(id);
        Toast.show('Item de teste excluído com sucesso!', 'success');
        AdminManager.closeModal('test-items-modal');
        AdminManager.showTestItemsModal(); // Recarregar lista
      } catch (error) {
        Toast.show('Erro ao excluir item de teste: ' + error.message, 'error');
      }
    }
  },

  // Placeholder para edição (implementar conforme necessário)
  editCompany(id) {
    Toast.show('Funcionalidade de edição em desenvolvimento', 'info');
  },

  editUser(id) {
    Toast.show('Funcionalidade de edição em desenvolvimento', 'info');
  },

  editTestItem(id) {
    Toast.show('Funcionalidade de edição em desenvolvimento', 'info');
  },

  viewTestItem(id) {
    Toast.show('Funcionalidade de visualização em desenvolvimento', 'info');
  }
};

// Adicionar estilos CSS para os elementos administrativos
const adminStyles = `
<style>
.admin-actions-header {
  margin-bottom: var(--spacing-lg);
  text-align: right;
}

.admin-table-container {
  overflow-x: auto;
  max-height: 400px;
  overflow-y: auto;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
  background: var(--bg-secondary);
  border-radius: var(--border-radius-md);
  overflow: hidden;
}

.admin-table th,
.admin-table td {
  padding: var(--spacing-md);
  text-align: left;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.admin-table th {
  background: var(--bg-tertiary);
  color: var(--accent-primary);
  font-weight: 600;
}

.admin-table tr:hover {
  background: rgba(0, 212, 255, 0.05);
}

.btn-small {
  padding: var(--spacing-xs) var(--spacing-sm);
  font-size: 0.8rem;
  border-radius: var(--border-radius-sm);
  margin-right: var(--spacing-xs);
  border: none;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-danger {
  background: var(--accent-error);
  color: white;
}

.btn-info {
  background: var(--accent-primary);
  color: white;
}

.role-badge, .status-badge, .category-badge, .priority-badge {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: capitalize;
}

.role-testador { background: rgba(0, 255, 136, 0.2); color: var(--accent-success); }
.role-desenvolvedor { background: rgba(0, 212, 255, 0.2); color: var(--accent-primary); }
.role-gerente { background: rgba(255, 170, 0, 0.2); color: var(--accent-warning); }

.status-ativo { background: rgba(0, 255, 136, 0.2); color: var(--accent-success); }
.status-inativo { background: rgba(255, 68, 68, 0.2); color: var(--accent-error); }

.category-funcional { background: rgba(0, 212, 255, 0.2); color: var(--accent-primary); }
.category-performance { background: rgba(255, 170, 0, 0.2); color: var(--accent-warning); }
.category-seguranca { background: rgba(255, 68, 68, 0.2); color: var(--accent-error); }
.category-usabilidade { background: rgba(0, 255, 136, 0.2); color: var(--accent-success); }
.category-compatibilidade { background: rgba(138, 143, 154, 0.2); color: var(--text-muted); }
.category-regressao { background: rgba(102, 126, 234, 0.2); color: #667eea; }

.priority-baixa { background: rgba(0, 255, 136, 0.2); color: var(--accent-success); }
.priority-media { background: rgba(255, 170, 0, 0.2); color: var(--accent-warning); }
.priority-alta { background: rgba(255, 140, 0, 0.2); color: #ff8c00; }
.priority-critica { background: rgba(255, 68, 68, 0.2); color: var(--accent-error); }

.admin-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: var(--spacing-lg);
  margin-bottom: var(--spacing-2xl);
}

.stat-card {
  background: var(--bg-card);
  padding: var(--spacing-lg);
  border-radius: var(--border-radius-lg);
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.stat-icon {
  font-size: 2rem;
}

.stat-info h3 {
  color: var(--accent-primary);
  font-size: 1.5rem;
  margin: 0;
}

.stat-info p {
  color: var(--text-secondary);
  margin: 0;
}

.admin-actions h3 {
  color: var(--accent-primary);
  margin-bottom: var(--spacing-md);
}

.action-buttons {
  display: flex;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

textarea.form-input {
  resize: vertical;
  min-height: 80px;
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', adminStyles);

// Expor AdminManager globalmente
window.AdminManager = AdminManager;

