// ===== CONFIGURAÇÃO GLOBAL =====
const CONFIG = {
  API_BASE_URL: 'https://5000-ik2stx87pkssf5k8p1d9o-db511b77.manusvm.computer/api',
  STORAGE_KEYS: {
    TOKEN: 'siget_token',
    USER: 'siget_user',
    ADMIN_TOKEN: 'siget_admin_token',
    ADMIN_USER: 'siget_admin_user'
  }
};

// ===== ESTADO GLOBAL =====
const AppState = {
  user: null,
  admin: null,
  isAuthenticated: false,
  isAdmin: false,
  currentPage: 'home'
};

// ===== UTILITÁRIOS =====
const Utils = {
  // Formatar números
  formatNumber(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  },

  // Formatar data
  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  },

  // Debounce para otimizar pesquisas
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
};

// ===== GERENCIADOR DE API =====
const API = {
  // Fazer requisição HTTP
  async request(endpoint, options = {}) {
    const url = `${CONFIG.API_BASE_URL}${endpoint}`;
    const token = AppState.isAdmin 
      ? localStorage.getItem(CONFIG.STORAGE_KEYS.ADMIN_TOKEN)
      : localStorage.getItem(CONFIG.STORAGE_KEYS.TOKEN);

    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` })
      },
      ...options
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Erro na requisição');
      }

      return data;
    } catch (error) {
      console.error('Erro na API:', error);
      throw error;
    }
  },

  // Métodos de autenticação
  async login(credentials) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  },

  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  async adminLogin(credentials) {
    return this.request('/admin/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    });
  },

  // Métodos administrativos
  async getAdminDashboard() {
    return this.request('/admin/dashboard');
  },

  async getCompanies() {
    return this.request('/admin/companies');
  },

  async createCompany(companyData) {
    return this.request('/admin/companies', {
      method: 'POST',
      body: JSON.stringify(companyData)
    });
  },

  async updateCompany(id, companyData) {
    return this.request(`/admin/companies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(companyData)
    });
  },

  async deleteCompany(id) {
    return this.request(`/admin/companies/${id}`, {
      method: 'DELETE'
    });
  },

  async getUsers() {
    return this.request('/admin/users');
  },

  async createUser(userData) {
    return this.request('/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  },

  async updateUser(id, userData) {
    return this.request(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData)
    });
  },

  async deleteUser(id) {
    return this.request(`/admin/users/${id}`, {
      method: 'DELETE'
    });
  },

  async getTestItems() {
    return this.request('/admin/test-items');
  },

  async createTestItem(testItemData) {
    return this.request('/admin/test-items', {
      method: 'POST',
      body: JSON.stringify(testItemData)
    });
  },

  async updateTestItem(id, testItemData) {
    return this.request(`/admin/test-items/${id}`, {
      method: 'PUT',
      body: JSON.stringify(testItemData)
    });
  },

  async deleteTestItem(id) {
    return this.request(`/admin/test-items/${id}`, {
      method: 'DELETE'
    });
  }
};

// ===== GERENCIADOR DE TOAST =====
const Toast = {
  show(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };

    toast.innerHTML = `
      <span class="toast-icon">${icons[type]}</span>
      <span class="toast-message">${message}</span>
      <button class="toast-close">×</button>
    `;

    container.appendChild(toast);

    // Mostrar toast
    setTimeout(() => toast.classList.add('show'), 100);

    // Remover toast
    const removeToast = () => {
      toast.classList.add('hide');
      setTimeout(() => {
        if (container.contains(toast)) {
          container.removeChild(toast);
        }
      }, 300);
    };

    // Auto-remover
    setTimeout(removeToast, duration);

    // Botão de fechar
    toast.querySelector('.toast-close').addEventListener('click', removeToast);
  }
};

// ===== GERENCIADOR DE PÁGINAS =====
const PageManager = {
  showPage(pageId) {
    // Esconder todas as páginas
    document.querySelectorAll('.page').forEach(page => {
      page.classList.remove('active');
    });

    // Mostrar página selecionada
    const targetPage = document.getElementById(`${pageId}-page`);
    if (targetPage) {
      targetPage.classList.add('active');
      AppState.currentPage = pageId;
    }

    // Atualizar navegação
    document.querySelectorAll('.menu-link').forEach(link => {
      link.classList.remove('active');
    });

    const activeLink = document.querySelector(`[data-page="${pageId}"]`);
    if (activeLink) {
      activeLink.classList.add('active');
    }

    // Carregar conteúdo da página
    this.loadPageContent(pageId);
  },

  async loadPageContent(pageId) {
    try {
      switch (pageId) {
        case 'dashboard':
          if (AppState.isAuthenticated && !AppState.isAdmin) {
            await this.loadCompanyDashboard();
          }
          break;
        case 'admin-dashboard':
          if (AppState.isAdmin) {
            await this.loadAdminDashboard();
          }
          break;
        case 'profile':
          await this.loadProfilePage();
          break;
      }
    } catch (error) {
      console.error('Erro ao carregar página:', error);
      Toast.show('Erro ao carregar conteúdo', 'error');
    }
  },

  async loadCompanyDashboard() {
    const container = document.getElementById('company-dashboard');
    container.innerHTML = `
      <div class="dashboard-loading">
        <div class="loading-spinner"></div>
        <p>Carregando dashboard...</p>
      </div>
    `;

    // Aqui você pode carregar dados específicos da empresa
    // Por enquanto, vamos mostrar uma mensagem
    setTimeout(() => {
      container.innerHTML = `
        <div class="dashboard-welcome">
          <h3>Bem-vindo, ${AppState.user.name}!</h3>
          <p>Dashboard da empresa em desenvolvimento...</p>
          <div class="dashboard-actions">
            <button class="btn btn-primary" onclick="window.location.href='/dashboard'">
              Ir para Dashboard Completo
            </button>
          </div>
        </div>
      `;
    }, 1000);
  },

  async loadAdminDashboard() {
    const container = document.getElementById('admin-dashboard');
    container.innerHTML = `
      <div class="dashboard-loading">
        <div class="loading-spinner"></div>
        <p>Carregando painel administrativo...</p>
      </div>
    `;

    try {
      const data = await API.getAdminDashboard();
      const stats = data.statistics;

      container.innerHTML = `
        <div class="admin-stats">
          <div class="stat-card">
            <div class="stat-icon">🏢</div>
            <div class="stat-info">
              <h3>${stats.totalCompanies}</h3>
              <p>Empresas</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">👥</div>
            <div class="stat-info">
              <h3>${stats.totalUsers}</h3>
              <p>Usuários</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon">🧪</div>
            <div class="stat-info">
              <h3>${stats.totalTestItems}</h3>
              <p>Itens de Teste</p>
            </div>
          </div>
        </div>
        
        <div class="admin-actions">
          <h3>Ações Administrativas</h3>
          <div class="action-buttons">
            <button class="btn btn-primary" onclick="AdminManager.showCompaniesModal()">
              Gerenciar Empresas
            </button>
            <button class="btn btn-primary" onclick="AdminManager.showUsersModal()">
              Gerenciar Usuários
            </button>
            <button class="btn btn-primary" onclick="AdminManager.showTestItemsModal()">
              Gerenciar Itens de Teste
            </button>
          </div>
        </div>
      `;
    } catch (error) {
      container.innerHTML = `
        <div class="error-message">
          <h3>Erro ao carregar dashboard</h3>
          <p>${error.message}</p>
        </div>
      `;
    }
  },

  async loadProfilePage() {
    const container = document.getElementById('profile-content');
    
    if (!AppState.isAuthenticated && !AppState.isAdmin) {
      this.showPage('home');
      Toast.show('Faça login para acessar seu perfil', 'warning');
      return;
    }

    const user = AppState.isAdmin ? AppState.admin : AppState.user;
    const userType = AppState.isAdmin ? 'Administrador' : 'Empresa';

    container.innerHTML = `
      <div class="profile-card">
        <div class="profile-header">
          <div class="profile-avatar">
            ${userType === 'Administrador' ? '👨‍💼' : '🏢'}
          </div>
          <div class="profile-info">
            <h3>${user.name}</h3>
            <p>${user.email}</p>
            <span class="profile-type">${userType}</span>
            <p>Membro desde ${Utils.formatDate(user.createdAt || new Date())}</p>
          </div>
        </div>
      </div>
    `;
  }
};

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', () => {
  // Ocultar loading
  setTimeout(() => {
    const loadingOverlay = document.getElementById('loading-overlay');
    loadingOverlay.classList.add('fade-out');
  }, 1000);

  // Event listeners para navegação
  document.querySelectorAll('[data-page]').forEach(element => {
    element.addEventListener('click', (e) => {
      e.preventDefault();
      const pageId = element.getAttribute('data-page');
      PageManager.showPage(pageId);
    });
  });

  // Event listener para "Começar Agora"
  document.getElementById('get-started-btn').addEventListener('click', () => {
    document.getElementById('login-btn').click();
  });

  // Verificar autenticação existente
  checkExistingAuth();

  // Carregar página inicial
  PageManager.showPage('home');
});

// ===== VERIFICAR AUTENTICAÇÃO EXISTENTE =====
function checkExistingAuth() {
  // Verificar token de empresa
  const token = localStorage.getItem(CONFIG.STORAGE_KEYS.TOKEN);
  const userData = localStorage.getItem(CONFIG.STORAGE_KEYS.USER);

  if (token && userData) {
    try {
      AppState.user = JSON.parse(userData);
      AppState.isAuthenticated = true;
      Auth.updateUI();
    } catch (error) {
      localStorage.removeItem(CONFIG.STORAGE_KEYS.TOKEN);
      localStorage.removeItem(CONFIG.STORAGE_KEYS.USER);
    }
  }

  // Verificar token de admin
  const adminToken = localStorage.getItem(CONFIG.STORAGE_KEYS.ADMIN_TOKEN);
  const adminData = localStorage.getItem(CONFIG.STORAGE_KEYS.ADMIN_USER);

  if (adminToken && adminData) {
    try {
      AppState.admin = JSON.parse(adminData);
      AppState.isAdmin = true;
      Auth.updateUI();
    } catch (error) {
      localStorage.removeItem(CONFIG.STORAGE_KEYS.ADMIN_TOKEN);
      localStorage.removeItem(CONFIG.STORAGE_KEYS.ADMIN_USER);
    }
  }
}

// Expor objetos globalmente
window.AppState = AppState;
window.API = API;
window.Toast = Toast;
window.PageManager = PageManager;
window.Utils = Utils;

