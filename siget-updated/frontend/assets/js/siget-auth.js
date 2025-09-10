// ===== GERENCIADOR DE AUTENTICAÇÃO =====
const Auth = {
  // Inicializar eventos de autenticação
  init() {
    // Botões de abrir modais
    document.getElementById('login-btn').addEventListener('click', () => {
      this.showModal('login');
    });

    document.getElementById('admin-login-btn').addEventListener('click', () => {
      this.showModal('admin-login');
    });

    // Botões de fechar modais
    document.getElementById('login-modal-close').addEventListener('click', () => {
      this.hideModal('login');
    });

    document.getElementById('register-modal-close').addEventListener('click', () => {
      this.hideModal('register');
    });

    document.getElementById('admin-login-modal-close').addEventListener('click', () => {
      this.hideModal('admin-login');
    });

    // Links para alternar entre modais
    document.getElementById('show-register').addEventListener('click', () => {
      this.hideModal('login');
      this.showModal('register');
    });

    document.getElementById('show-login').addEventListener('click', () => {
      this.hideModal('register');
      this.showModal('login');
    });

    // Formulários
    document.getElementById('login-form').addEventListener('submit', (e) => {
      this.handleLogin(e);
    });

    document.getElementById('register-form').addEventListener('submit', (e) => {
      this.handleRegister(e);
    });

    document.getElementById('admin-login-form').addEventListener('submit', (e) => {
      this.handleAdminLogin(e);
    });

    // Logout
    document.getElementById('logout-btn').addEventListener('click', () => {
      this.logout();
    });

    // Toggle de senha
    document.getElementById('login-password-toggle').addEventListener('click', () => {
      this.togglePassword('login-password');
    });

    document.getElementById('register-password-toggle').addEventListener('click', () => {
      this.togglePassword('register-password');
    });

    document.getElementById('admin-login-password-toggle').addEventListener('click', () => {
      this.togglePassword('admin-login-password');
    });

    // Menu do usuário
    document.getElementById('user-avatar').addEventListener('click', () => {
      this.toggleUserMenu();
    });

    // Fechar modais ao clicar no overlay
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          this.hideAllModals();
        }
      });
    });

    // Fechar menu do usuário ao clicar fora
    document.addEventListener('click', (e) => {
      const userMenu = document.getElementById('user-menu');
      const dropdown = document.getElementById('user-dropdown');
      
      if (!userMenu.contains(e.target)) {
        dropdown.classList.remove('show');
      }
    });
  },

  // Mostrar modal
  showModal(type) {
    const modal = document.getElementById(`${type}-modal`);
    modal.classList.add('active');
    
    // Focar no primeiro input
    setTimeout(() => {
      const firstInput = modal.querySelector('input');
      if (firstInput) firstInput.focus();
    }, 100);
  },

  // Esconder modal
  hideModal(type) {
    const modal = document.getElementById(`${type}-modal`);
    modal.classList.remove('active');
    
    // Limpar formulário
    const form = modal.querySelector('form');
    if (form) form.reset();
  },

  // Esconder todos os modais
  hideAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
      modal.classList.remove('active');
    });
  },

  // Toggle de visibilidade da senha
  togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const toggle = document.getElementById(`${inputId}-toggle`);
    
    if (input.type === 'password') {
      input.type = 'text';
      toggle.textContent = '🙈';
    } else {
      input.type = 'password';
      toggle.textContent = '👁️';
    }
  },

  // Toggle menu do usuário
  toggleUserMenu() {
    const dropdown = document.getElementById('user-dropdown');
    dropdown.classList.toggle('show');
  },

  // Lidar com login da empresa
  async handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    try {
      submitBtn.textContent = 'Entrando...';
      submitBtn.disabled = true;
      
      const response = await API.login({ email, password });
      
      // Salvar dados da empresa
      AppState.isAuthenticated = true;
      AppState.user = response.company;
      AppState.isAdmin = false;
      
      localStorage.setItem(CONFIG.STORAGE_KEYS.TOKEN, response.token);
      localStorage.setItem(CONFIG.STORAGE_KEYS.USER, JSON.stringify(response.company));
      
      // Atualizar interface
      this.updateUI();
      this.hideModal('login');
      
      Toast.show('Login realizado com sucesso!', 'success');
      PageManager.showPage('dashboard');
      
    } catch (error) {
      console.error('Erro no login:', error);
      Toast.show(error.message, 'error');
    } finally {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  },

  // Lidar com registro da empresa
  async handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('register-name').value;
    const cnpj = document.getElementById('register-cnpj').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    try {
      submitBtn.textContent = 'Cadastrando...';
      submitBtn.disabled = true;
      
      const response = await API.register({ name, cnpj, email, password });
      
      // Salvar dados da empresa
      AppState.isAuthenticated = true;
      AppState.user = response.company;
      AppState.isAdmin = false;
      
      localStorage.setItem(CONFIG.STORAGE_KEYS.TOKEN, response.token);
      localStorage.setItem(CONFIG.STORAGE_KEYS.USER, JSON.stringify(response.company));
      
      // Atualizar interface
      this.updateUI();
      this.hideModal('register');
      
      Toast.show('Cadastro realizado com sucesso!', 'success');
      PageManager.showPage('dashboard');
      
    } catch (error) {
      console.error('Erro no cadastro:', error);
      Toast.show(error.message, 'error');
    } finally {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  },

  // Lidar com login do admin
  async handleAdminLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('admin-login-email').value;
    const password = document.getElementById('admin-login-password').value;
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    try {
      submitBtn.textContent = 'Entrando...';
      submitBtn.disabled = true;
      
      const response = await API.adminLogin({ email, password });
      
      // Salvar dados do admin
      AppState.isAdmin = true;
      AppState.admin = response.admin;
      AppState.isAuthenticated = false;
      
      localStorage.setItem(CONFIG.STORAGE_KEYS.ADMIN_TOKEN, response.token);
      localStorage.setItem(CONFIG.STORAGE_KEYS.ADMIN_USER, JSON.stringify(response.admin));
      
      // Atualizar interface
      this.updateUI();
      this.hideModal('admin-login');
      
      Toast.show('Login de admin realizado com sucesso!', 'success');
      PageManager.showPage('admin-dashboard');
      
    } catch (error) {
      console.error('Erro no login de admin:', error);
      Toast.show(error.message, 'error');
    } finally {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  },

  // Logout
  logout() {
    // Limpar dados locais
    localStorage.removeItem(CONFIG.STORAGE_KEYS.TOKEN);
    localStorage.removeItem(CONFIG.STORAGE_KEYS.USER);
    localStorage.removeItem(CONFIG.STORAGE_KEYS.ADMIN_TOKEN);
    localStorage.removeItem(CONFIG.STORAGE_KEYS.ADMIN_USER);
    
    // Resetar estado
    AppState.isAuthenticated = false;
    AppState.isAdmin = false;
    AppState.user = null;
    AppState.admin = null;
    
    // Atualizar interface
    this.updateUI();
    
    // Voltar para home
    PageManager.showPage('home');
    
    Toast.show('Logout realizado com sucesso!', 'success');
  },

  // Atualizar interface baseada no estado de autenticação
  updateUI() {
    const authButtons = document.getElementById('auth-buttons');
    const userMenu = document.getElementById('user-menu');
    
    if (AppState.isAuthenticated || AppState.isAdmin) {
      // Mostrar menu do usuário
      authButtons.style.display = 'none';
      userMenu.style.display = 'block';
      
      // Atualizar dados do usuário
      const currentUser = AppState.isAdmin ? AppState.admin : AppState.user;
      const userRole = AppState.isAdmin ? 'Admin' : 'Empresa';
      
      document.getElementById('user-name').textContent = currentUser.name;
      document.getElementById('user-role').textContent = userRole;
      
      // Atualizar link do perfil baseado no tipo de usuário
      const profileLink = document.getElementById('profile-link');
      if (AppState.isAdmin) {
        profileLink.innerHTML = '👨‍💼 Perfil Admin';
      } else {
        profileLink.innerHTML = '🏢 Perfil da Empresa';
      }
      
    } else {
      // Mostrar botões de auth
      authButtons.style.display = 'flex';
      userMenu.style.display = 'none';
    }
  }
};

// Inicializar autenticação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  Auth.init();
});

// Expor Auth globalmente
window.Auth = Auth;

