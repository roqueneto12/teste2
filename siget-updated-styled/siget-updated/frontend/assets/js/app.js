// ===== CONFIGURAÇÃO GLOBAL =====
const CONFIG = {
  API_BASE_URL: 'http://localhost:3000/api',
  STORAGE_KEYS: {
    TOKEN: 'novels_franky_token',
    USER: 'novels_franky_user'
  }
};

// ===== ESTADO GLOBAL =====
const AppState = {
  user: null,
  isAuthenticated: false,
  currentPage: 'home',
  novels: [],
  filters: {
    genre: '',
    status: '',
    sort: 'views'
  },
  pagination: {
    currentPage: 1,
    totalPages: 1
  }
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

  // Gerar estrelas de avaliação
  generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    let starsHTML = '';

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        starsHTML += '<span class="star filled">★</span>';
      } else if (i === fullStars && hasHalfStar) {
        starsHTML += '<span class="star half">★</span>';
      } else {
        starsHTML += '<span class="star">★</span>';
      }
    }

    return starsHTML;
  },

  // Traduzir status
  translateStatus(status) {
    const translations = {
      'ongoing': 'Em Andamento',
      'completed': 'Completo',
      'hiatus': 'Hiato'
    };
    return translations[status] || status;
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
    const token = localStorage.getItem(CONFIG.STORAGE_KEYS.TOKEN);

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

  // Métodos específicos
  async getNovels(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return this.request(`/novels?${queryString}`);
  },

  async getFeaturedNovels() {
    return this.request('/novels/featured');
  },

  async getPopularNovels(limit = 8) {
    return this.request(`/novels/popular?limit=${limit}`);
  },

  async searchNovels(query) {
    return this.request(`/novels/search?q=${encodeURIComponent(query)}`);
  },

  async getNovelStats() {
    return this.request('/novels/stats');
  },

  async getFavorites() {
    return this.request('/users/favorites');
  },

  async addToFavorites(novelId) {
    return this.request('/users/favorites', {
      method: 'POST',
      body: JSON.stringify({ novelId })
    });
  },

  async removeFromFavorites(novelId) {
    return this.request(`/users/favorites/${novelId}`, {
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
        case 'home':
          await this.loadHomePage();
          break;
        case 'novels':
          await this.loadNovelsPage();
          break;
        case 'ranking':
          await this.loadRankingPage();
          break;
        case 'profile':
          await this.loadProfilePage();
          break;
        case 'favorites':
          await this.loadFavoritesPage();
          break;
      }
    } catch (error) {
      console.error('Erro ao carregar página:', error);
      Toast.show('Erro ao carregar conteúdo', 'error');
    }
  },

  async loadHomePage() {
    // Carregar estatísticas
    try {
      const statsData = await API.getNovelStats();
      const stats = statsData.data;
      
      document.getElementById('total-novels').textContent = Utils.formatNumber(stats.totalNovels);
      document.getElementById('total-chapters').textContent = Utils.formatNumber(stats.totalChapters);
      document.getElementById('total-views').textContent = Utils.formatNumber(stats.totalViews);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
    }

    // Carregar novels em destaque
    try {
      const featuredData = await API.getFeaturedNovels();
      this.renderFeaturedNovels(featuredData.data.novels);
    } catch (error) {
      console.error('Erro ao carregar novels em destaque:', error);
    }

    // Carregar novels populares
    try {
      const popularData = await API.getPopularNovels();
      this.renderPopularNovels(popularData.data.novels);
    } catch (error) {
      console.error('Erro ao carregar novels populares:', error);
    }
  },

  async loadNovelsPage() {
    const params = {
      page: AppState.pagination.currentPage,
      limit: 12,
      ...AppState.filters
    };

    try {
      const data = await API.getNovels(params);
      this.renderAllNovels(data.data.novels);
      this.renderPagination(data.data.pagination);
    } catch (error) {
      console.error('Erro ao carregar novels:', error);
      Toast.show('Erro ao carregar novels', 'error');
    }
  },

  async loadRankingPage() {
    try {
      const data = await API.getNovels({ sort: 'views', limit: 20 });
      this.renderRanking(data.data.novels);
    } catch (error) {
      console.error('Erro ao carregar ranking:', error);
      Toast.show('Erro ao carregar ranking', 'error');
    }
  },

  async loadProfilePage() {
    if (!AppState.isAuthenticated) {
      this.showPage('home');
      Toast.show('Faça login para acessar seu perfil', 'warning');
      return;
    }

    const container = document.getElementById('profile-content');
    container.innerHTML = `
      <div class="profile-card">
        <div class="profile-header">
          <img src="${AppState.user.avatar}" alt="Avatar" class="profile-avatar">
          <div class="profile-info">
            <h3>${AppState.user.name}</h3>
            <p>${AppState.user.email}</p>
            <p>Membro desde ${new Date(AppState.user.createdAt).toLocaleDateString('pt-BR')}</p>
          </div>
        </div>
        <div class="profile-stats">
          <div class="stat-item">
            <span class="stat-number">${AppState.user.favorites?.length || 0}</span>
            <span class="stat-label">Favoritos</span>
          </div>
        </div>
      </div>
    `;
  },

  async loadFavoritesPage() {
    if (!AppState.isAuthenticated) {
      this.showPage('home');
      Toast.show('Faça login para ver seus favoritos', 'warning');
      return;
    }

    try {
      const data = await API.getFavorites();
      this.renderFavorites(data.data.favorites);
    } catch (error) {
      console.error('Erro ao carregar favoritos:', error);
      Toast.show('Erro ao carregar favoritos', 'error');
    }
  },

  renderFeaturedNovels(novels) {
    const container = document.getElementById('featured-novels');
    container.innerHTML = novels.map(novel => `
      <div class="featured-card">
        <div class="featured-image">
          <img src="${novel.cover}" alt="${novel.title}" loading="lazy">
          <div class="featured-badge">Destaque</div>
        </div>
        <div class="featured-info">
          <h3 class="featured-title">${novel.title}</h3>
          <div class="featured-meta">
            <div class="genre-tags">
              ${novel.genres.map(genre => `<span class="tag">${genre}</span>`).join('')}
            </div>
            <div class="rating">
              <div class="stars">${Utils.generateStars(novel.rating)}</div>
              <span class="rating-value">${novel.rating}</span>
            </div>
          </div>
          <p class="featured-description">${novel.description}</p>
          <div class="featured-stats">
            <span>📖 ${novel.chapters} caps</span>
            <span>👁️ ${Utils.formatNumber(novel.views)}</span>
            <span>📅 ${novel.publishedYear}</span>
          </div>
          <div class="featured-actions">
            <button class="btn btn-primary">Ler Agora</button>
            <button class="btn btn-secondary favorite-btn" data-novel-id="${novel._id}">
              ${AppState.user?.favorites?.includes(novel._id) ? '❤️' : '🤍'}
            </button>
          </div>
        </div>
      </div>
    `).join('');

    // Adicionar event listeners para favoritos
    this.attachFavoriteListeners();
  },

  renderPopularNovels(novels) {
    const container = document.getElementById('popular-novels');
    container.innerHTML = novels.map(novel => this.createNovelCard(novel)).join('');
    this.attachFavoriteListeners();
  },

  renderAllNovels(novels) {
    const container = document.getElementById('all-novels');
    container.innerHTML = novels.map(novel => this.createNovelCard(novel)).join('');
    this.attachFavoriteListeners();
  },

  renderFavorites(novels) {
    const container = document.getElementById('favorites-novels');
    if (novels.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <h3>Nenhum favorito ainda</h3>
          <p>Adicione novels aos seus favoritos para vê-las aqui!</p>
          <button class="btn btn-primary" onclick="PageManager.showPage('novels')">
            Explorar Novels
          </button>
        </div>
      `;
    } else {
      container.innerHTML = novels.map(novel => this.createNovelCard(novel)).join('');
      this.attachFavoriteListeners();
    }
  },

  createNovelCard(novel) {
    const isFavorite = AppState.user?.favorites?.includes(novel._id);
    return `
      <div class="novel-card">
        <div class="novel-image">
          <img src="${novel.cover}" alt="${novel.title}" loading="lazy">
          <div class="novel-overlay">
            <button class="quick-action favorite-btn ${isFavorite ? 'active' : ''}" 
                    data-novel-id="${novel._id}" title="Favoritar">
              ${isFavorite ? '❤️' : '🤍'}
            </button>
          </div>
          <div class="status-badge ${novel.status}">${Utils.translateStatus(novel.status)}</div>
        </div>
        <div class="novel-card-content">
          <h3 class="novel-title">${novel.title}</h3>
          <div class="novel-meta">
            <div class="genre-tags">
              ${novel.genres.slice(0, 2).map(genre => `<span class="tag">${genre}</span>`).join('')}
            </div>
            <div class="rating">
              <div class="stars">${Utils.generateStars(novel.rating)}</div>
              <span class="rating-value">${novel.rating}</span>
            </div>
          </div>
          <div class="novel-stats">
            <span>📖 ${novel.chapters}</span>
            <span>👁️ ${Utils.formatNumber(novel.views)}</span>
            <span>📅 ${novel.publishedYear}</span>
          </div>
          <div class="novel-actions">
            <button class="btn btn-primary btn-sm">Ler</button>
            <button class="btn btn-secondary btn-sm">Info</button>
          </div>
        </div>
      </div>
    `;
  },

  renderRanking(novels) {
    const tbody = document.getElementById('ranking-tbody');
    tbody.innerHTML = novels.map((novel, index) => {
      const position = index + 1;
      let rankClass = '';
      if (position === 1) rankClass = 'gold';
      else if (position === 2) rankClass = 'silver';
      else if (position === 3) rankClass = 'bronze';

      return `
        <tr>
          <td class="rank-position">
            <span class="rank-number ${rankClass}">${position}</span>
          </td>
          <td>
            <a href="#" class="novel-link">${novel.title}</a>
          </td>
          <td>${novel.genres.join(', ')}</td>
          <td class="views">${Utils.formatNumber(novel.views)}</td>
          <td>
            <div class="rating">
              <div class="stars">${Utils.generateStars(novel.rating)}</div>
              <span class="rating-value">${novel.rating}</span>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  renderPagination(pagination) {
    const container = document.getElementById('pagination');
    if (pagination.totalPages <= 1) {
      container.innerHTML = '';
      return;
    }

    let paginationHTML = '';

    // Botão anterior
    paginationHTML += `
      <button class="pagination-btn" ${!pagination.hasPrevPage ? 'disabled' : ''} 
              onclick="PageManager.changePage(${pagination.currentPage - 1})">
        ← Anterior
      </button>
    `;

    // Números das páginas
    const startPage = Math.max(1, pagination.currentPage - 2);
    const endPage = Math.min(pagination.totalPages, pagination.currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
      paginationHTML += `
        <button class="pagination-btn ${i === pagination.currentPage ? 'active' : ''}" 
                onclick="PageManager.changePage(${i})">
          ${i}
        </button>
      `;
    }

    // Botão próximo
    paginationHTML += `
      <button class="pagination-btn" ${!pagination.hasNextPage ? 'disabled' : ''} 
              onclick="PageManager.changePage(${pagination.currentPage + 1})">
        Próximo →
      </button>
    `;

    container.innerHTML = paginationHTML;
  },

  changePage(page) {
    AppState.pagination.currentPage = page;
    this.loadNovelsPage();
  },

  attachFavoriteListeners() {
    document.querySelectorAll('.favorite-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!AppState.isAuthenticated) {
          Toast.show('Faça login para favoritar novels', 'warning');
          return;
        }

        const novelId = btn.dataset.novelId;
        const isCurrentlyFavorite = btn.classList.contains('active');

        try {
          if (isCurrentlyFavorite) {
            await API.removeFromFavorites(novelId);
            btn.classList.remove('active');
            btn.innerHTML = '🤍';
            Toast.show('Removido dos favoritos', 'success');
            
            // Remover da lista local
            AppState.user.favorites = AppState.user.favorites.filter(id => id !== novelId);
          } else {
            await API.addToFavorites(novelId);
            btn.classList.add('active');
            btn.innerHTML = '❤️';
            Toast.show('Adicionado aos favoritos', 'success');
            
            // Adicionar à lista local
            AppState.user.favorites.push(novelId);
          }

          // Atualizar localStorage
          localStorage.setItem(CONFIG.STORAGE_KEYS.USER, JSON.stringify(AppState.user));

        } catch (error) {
          console.error('Erro ao favoritar:', error);
          Toast.show('Erro ao favoritar novel', 'error');
        }
      });
    });
  }
};

// ===== GERENCIADOR DE PESQUISA =====
const SearchManager = {
  init() {
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');

    // Debounced search
    const debouncedSearch = Utils.debounce(this.performSearch.bind(this), 300);

    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.trim();
      if (query.length >= 2) {
        debouncedSearch(query);
      } else {
        this.hideResults();
      }
    });

    searchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const query = searchInput.value.trim();
      if (query.length >= 2) {
        this.performSearch(query);
      }
    });

    // Fechar resultados ao clicar fora
    document.addEventListener('click', (e) => {
      if (!searchForm.contains(e.target)) {
        this.hideResults();
      }
    });
  },

  async performSearch(query) {
    const resultsContainer = document.getElementById('search-results');
    
    try {
      resultsContainer.innerHTML = '<div class="search-loading">Buscando...</div>';
      this.showResults();

      const data = await API.searchNovels(query);
      const novels = data.data.novels;

      if (novels.length === 0) {
        resultsContainer.innerHTML = '<div class="search-no-results">Nenhuma novel encontrada</div>';
      } else {
        resultsContainer.innerHTML = novels.map(novel => `
          <a href="#" class="search-result-item" onclick="PageManager.showPage('novels')">
            <div class="search-result-title">${novel.title}</div>
            <div class="search-result-type">${novel.type} • ${novel.genres.join(', ')}</div>
          </a>
        `).join('');
      }
    } catch (error) {
      console.error('Erro na pesquisa:', error);
      resultsContainer.innerHTML = '<div class="search-error">Erro na pesquisa</div>';
    }
  },

  showResults() {
    document.getElementById('search-results').classList.add('show');
  },

  hideResults() {
    document.getElementById('search-results').classList.remove('show');
  }
};

// ===== GERENCIADOR DE FILTROS =====
const FilterManager = {
  init() {
    const genreFilter = document.getElementById('genre-filter');
    const statusFilter = document.getElementById('status-filter');
    const sortFilter = document.getElementById('sort-filter');
    const clearButton = document.getElementById('clear-filters');

    [genreFilter, statusFilter, sortFilter].forEach(filter => {
      filter.addEventListener('change', () => {
        this.updateFilters();
        PageManager.loadNovelsPage();
      });
    });

    clearButton.addEventListener('click', () => {
      this.clearFilters();
      PageManager.loadNovelsPage();
    });
  },

  updateFilters() {
    AppState.filters = {
      genre: document.getElementById('genre-filter').value,
      status: document.getElementById('status-filter').value,
      sort: document.getElementById('sort-filter').value
    };
    AppState.pagination.currentPage = 1;
  },

  clearFilters() {
    document.getElementById('genre-filter').value = '';
    document.getElementById('status-filter').value = '';
    document.getElementById('sort-filter').value = 'views';
    
    AppState.filters = {
      genre: '',
      status: '',
      sort: 'views'
    };
    AppState.pagination.currentPage = 1;
  }
};

// ===== INICIALIZAÇÃO =====
document.addEventListener('DOMContentLoaded', () => {
  // Verificar autenticação
  const token = localStorage.getItem(CONFIG.STORAGE_KEYS.TOKEN);
  const userData = localStorage.getItem(CONFIG.STORAGE_KEYS.USER);
  
  if (token && userData) {
    AppState.isAuthenticated = true;
    AppState.user = JSON.parse(userData);
    Auth.updateUI();
  }

  // Inicializar gerenciadores
  SearchManager.init();
  FilterManager.init();

  // Event listeners para navegação
  document.querySelectorAll('[data-page]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const page = link.dataset.page;
      PageManager.showPage(page);
    });
  });

  // Carregar página inicial
  PageManager.showPage('home');

  // Remover loading overlay
  setTimeout(() => {
    const loadingOverlay = document.getElementById('loading-overlay');
    loadingOverlay.classList.add('fade-out');
    setTimeout(() => {
      loadingOverlay.style.display = 'none';
    }, 300);
  }, 1000);
});

// Expor funções globais necessárias
window.PageManager = PageManager;
window.Toast = Toast;

