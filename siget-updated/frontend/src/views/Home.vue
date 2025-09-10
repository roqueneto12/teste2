<template>
  <div class="home-container">
    <!-- Loading Overlay -->
    <div v-if="loading" id="loading-overlay" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p>Carregando...</p>
    </div>

    <!-- Header -->
    <header class="header-container">
      <div class="container">
        <div class="header-content">
          <h1 class="header">
            <router-link to="/">🧪 SiGeT</router-link>
          </h1>
          
          <!-- Navigation -->
          <nav class="menu" id="main-menu">
            <a href="#" class="menu-link" @click="setActivePage('home')" :class="{ active: activePage === 'home' }">Início</a>
            <a href="#" class="menu-link" @click="setActivePage('about')" :class="{ active: activePage === 'about' }">Sobre</a>
            <a href="#" class="menu-link" @click="setActivePage('features')" :class="{ active: activePage === 'features' }">Funcionalidades</a>
          </nav>

          <!-- Auth Buttons / User Menu -->
          <div class="auth-section">
            <!-- Buttons for non-authenticated users -->
            <div v-if="!isAuthenticated" class="auth-buttons" id="auth-buttons">
              <router-link to="/login" class="btn btn-secondary">Entrar</router-link>
              <button class="btn btn-primary" @click="showAdminLogin">Admin</button>
            </div>

            <!-- User menu for authenticated users -->
            <div v-if="isAuthenticated" class="user-menu" id="user-menu">
              <button class="user-avatar" @click="toggleUserMenu">
                <span class="user-name">{{ user.name }}</span>
                <span class="user-role">{{ user.role }}</span>
                <span>▼</span>
              </button>
              <div class="dropdown-menu" :class="{ show: showUserDropdown }">
                <router-link to="/dashboard" class="dropdown-item">
                  📊 Dashboard
                </router-link>
                <a href="#" class="dropdown-item" @click="setActivePage('profile')">
                  👤 Perfil
                </a>
                <hr class="dropdown-divider">
                <button class="dropdown-item" @click="logout">
                  🚪 Sair
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main id="main-content">
      <!-- Home Page -->
      <div v-if="activePage === 'home'" id="home-page" class="page active">
        <!-- Hero Banner -->
        <section class="hero-banner">
          <div class="container">
            <div class="hero-content">
              <h2 class="hero-title">Sistema de Gerenciamento de Testes</h2>
              <p class="hero-description">
                Gerencie seus casos de teste de forma visual e eficiente com nosso quadro Kanban. 
                Controle de usuários, relatórios e muito mais!
              </p>
              <div class="hero-actions">
                <router-link to="/register" class="btn btn-primary btn-large">Começar Agora</router-link>
                <button class="btn btn-secondary btn-large" @click="setActivePage('about')">Saiba Mais</button>
              </div>
            </div>
          </div>
        </section>

        <!-- Features Section -->
        <section class="features-section">
          <div class="container">
            <h2 class="section-title">🚀 Principais Funcionalidades</h2>
            <div class="features-grid">
              <div class="feature-card">
                <div class="feature-icon">📋</div>
                <h3>Quadro Kanban</h3>
                <p>Visualize e gerencie seus casos de teste com arrastar e soltar</p>
              </div>
              <div class="feature-card">
                <div class="feature-icon">👥</div>
                <h3>Gestão de Usuários</h3>
                <p>Controle completo de usuários, funções e permissões</p>
              </div>
              <div class="feature-card">
                <div class="feature-icon">📊</div>
                <h3>Relatórios</h3>
                <p>Acompanhe o progresso com relatórios detalhados</p>
              </div>
              <div class="feature-card">
                <div class="feature-icon">🔒</div>
                <h3>Segurança</h3>
                <p>Sistema seguro com autenticação e controle de acesso</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <!-- About Page -->
      <div v-if="activePage === 'about'" id="about-page" class="page active">
        <section class="about-section">
          <div class="container">
            <h2 class="section-title">Sobre o SiGeT</h2>
            <div class="about-content">
              <p>O SiGeT é um sistema completo de gerenciamento de testes desenvolvido para facilitar o trabalho de equipes de QA e desenvolvimento. Com uma interface moderna e intuitiva, permite organizar casos de teste de forma visual através de um quadro Kanban.</p>
              
              <h3>Por que escolher o SiGeT?</h3>
              <ul>
                <li>Interface moderna e responsiva</li>
                <li>Quadro Kanban com drag-and-drop</li>
                <li>Gestão completa de usuários e empresas</li>
                <li>Relatórios e estatísticas detalhadas</li>
                <li>Sistema de permissões flexível</li>
                <li>Itens de teste pré-cadastrados</li>
              </ul>
            </div>
          </div>
        </section>
      </div>

      <!-- Features Page -->
      <div v-if="activePage === 'features'" id="features-page" class="page active">
        <section class="features-detail-section">
          <div class="container">
            <h2 class="section-title">Funcionalidades Detalhadas</h2>
            
            <div class="feature-detail">
              <h3>🎯 Quadro Kanban Interativo</h3>
              <p>Organize seus casos de teste em colunas personalizáveis: A Fazer, Em Progresso, Testando, Concluído e Bloqueado. Mova cartões facilmente com arrastar e soltar.</p>
            </div>
            
            <div class="feature-detail">
              <h3>👨‍💼 Painel Administrativo</h3>
              <p>Administradores podem gerenciar empresas, usuários e itens de teste. Controle total sobre permissões e acesso ao sistema.</p>
            </div>
            
            <div class="feature-detail">
              <h3>🏢 Gestão Multi-Empresa</h3>
              <p>Suporte para múltiplas empresas com isolamento completo de dados. Cada empresa tem seus próprios usuários e casos de teste.</p>
            </div>
            
            <div class="feature-detail">
              <h3>📋 Itens de Teste Pré-cadastrados</h3>
              <p>Biblioteca de casos de teste comuns para agilizar o processo de criação. Inclui testes funcionais, de performance, segurança e usabilidade.</p>
            </div>
          </div>
        </section>
      </div>
    </main>

    <!-- Footer -->
    <footer class="footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-section">
            <h3>SiGeT</h3>
            <p>Sistema de Gerenciamento de Testes completo e moderno para equipes de desenvolvimento.</p>
          </div>
          <div class="footer-section">
            <h3>Navegação</h3>
            <ul class="footer-links">
              <li><a href="#" @click="setActivePage('home')">Início</a></li>
              <li><a href="#" @click="setActivePage('about')">Sobre</a></li>
              <li><a href="#" @click="setActivePage('features')">Funcionalidades</a></li>
            </ul>
          </div>
          <div class="footer-section">
            <h3>Suporte</h3>
            <div class="contact-info">
              <p>📧 suporte@siget.com</p>
              <p>💬 Suporte técnico</p>
            </div>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; 2024 SiGeT. Todos os direitos reservados.</p>
          <p>Desenvolvido com ❤️ para equipes de QA</p>
        </div>
      </div>
    </footer>

    <!-- Toast Container -->
    <div id="toast-container" class="toast-container">
      <div v-for="toast in toasts" :key="toast.id" :class="['toast', `toast-${toast.type}`, { show: toast.show }]">
        {{ toast.message }}
        <button class="toast-close" @click="removeToast(toast.id)">✕</button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'

export default {
  name: 'Home',
  setup() {
    const loading = ref(true)
    const activePage = ref('home')
    const isAuthenticated = ref(false)
    const showUserDropdown = ref(false)
    const toasts = ref([])
    
    const user = ref({
      name: '',
      role: ''
    })

    // Simular carregamento
    onMounted(() => {
      setTimeout(() => {
        loading.value = false
      }, 1000)
      
      // Verificar se usuário está logado
      const token = localStorage.getItem('token')
      const company = localStorage.getItem('company')
      
      if (token && company) {
        isAuthenticated.value = true
        const companyData = JSON.parse(company)
        user.value = {
          name: companyData.name,
          role: 'Empresa'
        }
      }
    })

    const setActivePage = (page) => {
      activePage.value = page
    }

    const toggleUserMenu = () => {
      showUserDropdown.value = !showUserDropdown.value
    }

    const showAdminLogin = () => {
      // Implementar modal de login admin
      console.log('Mostrar modal de login admin')
    }

    const logout = () => {
      localStorage.removeItem('token')
      localStorage.removeItem('company')
      isAuthenticated.value = false
      showUserDropdown.value = false
      
      // Mostrar toast de sucesso
      addToast('Logout realizado com sucesso!', 'success')
    }

    const addToast = (message, type = 'info') => {
      const id = Date.now()
      const toast = {
        id,
        message,
        type,
        show: false
      }
      
      toasts.value.push(toast)
      
      // Mostrar toast
      setTimeout(() => {
        toast.show = true
      }, 100)
      
      // Remover toast automaticamente
      setTimeout(() => {
        removeToast(id)
      }, 5000)
    }

    const removeToast = (id) => {
      const index = toasts.value.findIndex(toast => toast.id === id)
      if (index > -1) {
        toasts.value[index].show = false
        setTimeout(() => {
          toasts.value.splice(index, 1)
        }, 300)
      }
    }

    return {
      loading,
      activePage,
      isAuthenticated,
      showUserDropdown,
      user,
      toasts,
      setActivePage,
      toggleUserMenu,
      showAdminLogin,
      logout,
      addToast,
      removeToast
    }
  }
}
</script>

<style scoped>
/* Os estilos são importados globalmente no main.css */
</style>

