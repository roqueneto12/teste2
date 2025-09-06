// ===== GERENCIADOR DE AUTENTICAÇÃO =====
const Auth = {
  // Inicializar eventos de autenticação
  init() {
    // Botões de abrir modais
    document.getElementById('login-btn').addEventListener('click', () => {
      this.showModal('login');
    });

    document.getElementById('register-btn').addEventListener('click', () => {
      this.showModal('register');
    });

    // Botões de fechar modais
    document.getElementById('login-modal-close').addEventListener('click', () => {
      this.hideModal('login');
    });

    document.getElementById('register-modal-close').addEventListener('click', () => {
      this.hideModal('register');
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

    // Verificador de força da senha
    document.getElementById('register-password').addEventListener('input', (e) => {
      this.checkPasswordStrength(e.target.value);
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
    
    // Limpar verificador de senha
    if (type === 'register') {
      this.resetPasswordStrength();
    }
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

  // Verificar força da senha
  checkPasswordStrength(password) {
    const strengthFill = document.getElementById('strength-fill');
    const strengthText = document.getElementById('strength-text');
    
    let strength = 0;
    let text = 'Muito fraca';
    
    if (password.length >= 6) strength++;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    
    const strengthTexts = [
      'Muito fraca',
      'Fraca',
      'Regular',
      'Boa',
      'Forte',
      'Muito forte'
    ];
    
    text = strengthTexts[strength];
    
    strengthFill.className = `strength-fill strength-${strength}`;
    strengthText.textContent = text;
  },

  // Resetar verificador de senha
  resetPasswordStrength() {
    const strengthFill = document.getElementById('strength-fill');
    const strengthText = document.getElementById('strength-text');
    
    strengthFill.className = 'strength-fill strength-0';
    strengthText.textContent = 'Digite uma senha';
  },

  // Toggle menu do usuário
  toggleUserMenu() {
    const dropdown = document.getElementById('user-dropdown');
    dropdown.classList.toggle('show');
  },

  // Lidar com login
  async handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    const rememberMe = document.getElementById('remember-me').checked;
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    try {
      submitBtn.textContent = 'Entrando...';
      submitBtn.disabled = true;
      
      const response = await fetch(`${CONFIG.API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Erro no login');
      }
      
      // Salvar dados do usuário
      AppState.isAuthenticated = true;
      AppState.user = data.data.user;
      
      localStorage.setItem(CONFIG.STORAGE_KEYS.TOKEN, data.data.token);
      localStorage.setItem(CONFIG.STORAGE_KEYS.USER, JSON.stringify(data.data.user));
      
      // Atualizar interface
      this.updateUI();
      this.hideModal('login');
      
      Toast.show('Login realizado com sucesso!', 'success');
      
    } catch (error) {
      console.error('Erro no login:', error);
      Toast.show(error.message, 'error');
    } finally {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  },

  // Lidar com registro
  async handleRegister(e) {
    e.preventDefault();
    
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    
    try {
      submitBtn.textContent = 'Cadastrando...';
      submitBtn.disabled = true;
      
      const response = await fetch(`${CONFIG.API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ name, email, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Erro no cadastro');
      }
      
      // Salvar dados do usuário
      AppState.isAuthenticated = true;
      AppState.user = data.data.user;
      
      localStorage.setItem(CONFIG.STORAGE_KEYS.TOKEN, data.data.token);
      localStorage.setItem(CONFIG.STORAGE_KEYS.USER, JSON.stringify(data.data.user));
      
      // Atualizar interface
      this.updateUI();
      this.hideModal('register');
      
      Toast.show('Cadastro realizado com sucesso!', 'success');
      
    } catch (error) {
      console.error('Erro no cadastro:', error);
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
    
    // Resetar estado
    AppState.isAuthenticated = false;
    AppState.user = null;
    
    // Atualizar interface
    this.updateUI();
    
    // Voltar para home se estiver em página protegida
    if (['profile', 'favorites'].includes(AppState.currentPage)) {
      PageManager.showPage('home');
    }
    
    Toast.show('Logout realizado com sucesso!', 'success');
  },

  // Atualizar interface baseada no estado de autenticação
  updateUI() {
    const authButtons = document.getElementById('auth-buttons');
    const userMenu = document.getElementById('user-menu');
    
    if (AppState.isAuthenticated && AppState.user) {
      // Mostrar menu do usuário
      authButtons.style.display = 'none';
      userMenu.style.display = 'block';
      
      // Atualizar dados do usuário
      document.getElementById('user-name').textContent = AppState.user.name;
      document.getElementById('user-avatar-img').src = AppState.user.avatar;
      
    } else {
      // Mostrar botões de auth
      authButtons.style.display = 'flex';
      userMenu.style.display = 'none';
    }
  },

  // Verificar se o token ainda é válido
  async validateToken() {
    const token = localStorage.getItem(CONFIG.STORAGE_KEYS.TOKEN);
    
    if (!token) {
      return false;
    }
    
    try {
      const response = await fetch(`${CONFIG.API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        AppState.user = data.data.user;
        AppState.isAuthenticated = true;
        localStorage.setItem(CONFIG.STORAGE_KEYS.USER, JSON.stringify(data.data.user));
        return true;
      } else {
        // Token inválido, limpar dados
        this.logout();
        return false;
      }
    } catch (error) {
      console.error('Erro ao validar token:', error);
      this.logout();
      return false;
    }
  }
};

// Inicializar autenticação quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  Auth.init();
  
  // Validar token se existir
  const token = localStorage.getItem(CONFIG.STORAGE_KEYS.TOKEN);
  if (token) {
    Auth.validateToken();
  }
});

// Expor Auth globalmente
window.Auth = Auth;

