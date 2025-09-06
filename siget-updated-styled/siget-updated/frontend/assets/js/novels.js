// ===== GERENCIADOR DE NOVELS =====
const NovelsManager = {
  // Cache para otimizar requisições
  cache: {
    featured: null,
    popular: null,
    stats: null
  },

  // Inicializar funcionalidades específicas de novels
  init() {
    // Event listeners para ações de novels
    this.attachEventListeners();
    
    // Carregar dados iniciais
    this.loadInitialData();
  },

  // Anexar event listeners
  attachEventListeners() {
    // Clique em cards de novels
    document.addEventListener('click', (e) => {
      // Clique no título da novel
      if (e.target.classList.contains('novel-title') || e.target.classList.contains('featured-title')) {
        this.handleNovelClick(e);
      }
      
      // Clique em botão de leitura
      if (e.target.textContent === 'Ler Agora' || e.target.textContent === 'Ler') {
        this.handleReadClick(e);
      }
      
      // Clique em botão de informações
      if (e.target.textContent === 'Info') {
        this.handleInfoClick(e);
      }
    });

    // Hover effects para cards
    document.addEventListener('mouseenter', (e) => {
      if (e.target.classList.contains('novel-card')) {
        this.handleCardHover(e.target, true);
      }
    }, true);

    document.addEventListener('mouseleave', (e) => {
      if (e.target.classList.contains('novel-card')) {
        this.handleCardHover(e.target, false);
      }
    }, true);
  },

  // Carregar dados iniciais
  async loadInitialData() {
    try {
      // Carregar em paralelo para melhor performance
      await Promise.all([
        this.loadStats(),
        this.loadFeaturedNovels(),
        this.loadPopularNovels()
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados iniciais:', error);
    }
  },

  // Carregar estatísticas
  async loadStats() {
    if (this.cache.stats) return this.cache.stats;

    try {
      const data = await API.getNovelStats();
      this.cache.stats = data.data;
      return this.cache.stats;
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      return null;
    }
  },

  // Carregar novels em destaque
  async loadFeaturedNovels() {
    if (this.cache.featured) return this.cache.featured;

    try {
      const data = await API.getFeaturedNovels();
      this.cache.featured = data.data.novels;
      return this.cache.featured;
    } catch (error) {
      console.error('Erro ao carregar novels em destaque:', error);
      return [];
    }
  },

  // Carregar novels populares
  async loadPopularNovels() {
    if (this.cache.popular) return this.cache.popular;

    try {
      const data = await API.getPopularNovels(8);
      this.cache.popular = data.data.novels;
      return this.cache.popular;
    } catch (error) {
      console.error('Erro ao carregar novels populares:', error);
      return [];
    }
  },

  // Lidar com clique na novel
  handleNovelClick(e) {
    e.preventDefault();
    
    // Aqui você poderia navegar para uma página de detalhes da novel
    // Por enquanto, vamos apenas mostrar uma mensagem
    const novelTitle = e.target.textContent;
    Toast.show(`Abrindo detalhes de "${novelTitle}"`, 'info');
    
    // Em uma implementação completa, você faria algo como:
    // window.location.href = `/novel/${novelId}`;
    // ou usar um roteador SPA
  },

  // Lidar com clique em "Ler"
  handleReadClick(e) {
    e.preventDefault();
    e.stopPropagation();
    
    // Encontrar o card pai para obter informações da novel
    const card = e.target.closest('.novel-card, .featured-card');
    if (card) {
      const title = card.querySelector('.novel-title, .featured-title').textContent;
      
      // Simular início da leitura
      Toast.show(`Iniciando leitura de "${title}"`, 'success');
      
      // Em uma implementação real, você redirecionaria para o leitor:
      // window.location.href = `/read/${novelId}/chapter/1`;
    }
  },

  // Lidar com clique em "Info"
  handleInfoClick(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const card = e.target.closest('.novel-card');
    if (card) {
      const title = card.querySelector('.novel-title').textContent;
      
      // Mostrar modal com informações (implementação simplificada)
      this.showNovelInfoModal(card);
    }
  },

  // Mostrar modal com informações da novel
  showNovelInfoModal(card) {
    const title = card.querySelector('.novel-title').textContent;
    const img = card.querySelector('img');
    const genres = Array.from(card.querySelectorAll('.tag')).map(tag => tag.textContent);
    const stats = Array.from(card.querySelectorAll('.novel-stats span')).map(stat => stat.textContent);
    
    // Criar modal dinâmico
    const modal = document.createElement('div');
    modal.className = 'modal active';
    modal.innerHTML = `
      <div class="modal-overlay"></div>
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">${title}</h3>
          <button class="modal-close">✕</button>
        </div>
        <div class="modal-body">
          <div class="novel-info-modal">
            <img src="${img.src}" alt="${title}" class="novel-info-cover">
            <div class="novel-info-details">
              <h4>Gêneros:</h4>
              <div class="genre-tags">
                ${genres.map(genre => `<span class="tag">${genre}</span>`).join('')}
              </div>
              <h4>Estatísticas:</h4>
              <div class="novel-stats">
                ${stats.map(stat => `<span>${stat}</span>`).join('')}
              </div>
              <div class="novel-actions">
                <button class="btn btn-primary">Ler Agora</button>
                <button class="btn btn-secondary">Adicionar aos Favoritos</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Event listeners para o modal
    modal.querySelector('.modal-close').addEventListener('click', () => {
      modal.remove();
    });
    
    modal.querySelector('.modal-overlay').addEventListener('click', () => {
      modal.remove();
    });
    
    // Auto-remover após 10 segundos
    setTimeout(() => {
      if (document.body.contains(modal)) {
        modal.remove();
      }
    }, 10000);
  },

  // Lidar com hover nos cards
  handleCardHover(card, isEntering) {
    const overlay = card.querySelector('.novel-overlay');
    const img = card.querySelector('img');
    
    if (isEntering) {
      // Adicionar efeitos de hover
      if (overlay) {
        overlay.style.opacity = '1';
      }
      
      if (img) {
        img.style.transform = 'scale(1.05)';
      }
      
      // Adicionar classe para animações CSS
      card.classList.add('hovered');
      
    } else {
      // Remover efeitos de hover
      if (overlay) {
        overlay.style.opacity = '0';
      }
      
      if (img) {
        img.style.transform = 'scale(1)';
      }
      
      card.classList.remove('hovered');
    }
  },

  // Filtrar novels por gênero
  filterByGenre(genre) {
    AppState.filters.genre = genre;
    AppState.pagination.currentPage = 1;
    
    // Atualizar select de filtro
    const genreSelect = document.getElementById('genre-filter');
    if (genreSelect) {
      genreSelect.value = genre;
    }
    
    // Navegar para página de novels e aplicar filtro
    PageManager.showPage('novels');
    PageManager.loadNovelsPage();
    
    Toast.show(`Filtrando por gênero: ${genre}`, 'info');
  },

  // Filtrar novels por status
  filterByStatus(status) {
    AppState.filters.status = status;
    AppState.pagination.currentPage = 1;
    
    // Atualizar select de filtro
    const statusSelect = document.getElementById('status-filter');
    if (statusSelect) {
      statusSelect.value = status;
    }
    
    // Navegar para página de novels e aplicar filtro
    PageManager.showPage('novels');
    PageManager.loadNovelsPage();
    
    Toast.show(`Filtrando por status: ${Utils.translateStatus(status)}`, 'info');
  },

  // Ordenar novels
  sortNovels(sortBy) {
    AppState.filters.sort = sortBy;
    AppState.pagination.currentPage = 1;
    
    // Atualizar select de ordenação
    const sortSelect = document.getElementById('sort-filter');
    if (sortSelect) {
      sortSelect.value = sortBy;
    }
    
    // Recarregar página atual
    PageManager.loadPageContent(AppState.currentPage);
    
    const sortLabels = {
      'views': 'Mais Populares',
      'rating': 'Melhor Avaliadas',
      'newest': 'Mais Recentes',
      'alphabetical': 'A-Z'
    };
    
    Toast.show(`Ordenando por: ${sortLabels[sortBy]}`, 'info');
  },

  // Buscar novels similares
  async findSimilarNovels(novelId, genres) {
    try {
      // Buscar novels com gêneros similares
      const params = {
        genre: genres[0], // Usar primeiro gênero
        limit: 6
      };
      
      const data = await API.getNovels(params);
      return data.data.novels.filter(novel => novel._id !== novelId);
      
    } catch (error) {
      console.error('Erro ao buscar novels similares:', error);
      return [];
    }
  },

  // Obter novels por tipo
  async getNovelsByType(type) {
    try {
      const params = { type, limit: 12 };
      const data = await API.getNovels(params);
      return data.data.novels;
    } catch (error) {
      console.error('Erro ao buscar novels por tipo:', error);
      return [];
    }
  },

  // Limpar cache
  clearCache() {
    this.cache = {
      featured: null,
      popular: null,
      stats: null
    };
  },

  // Atualizar cache
  updateCache(key, data) {
    if (this.cache.hasOwnProperty(key)) {
      this.cache[key] = data;
    }
  },

  // Obter dados do cache
  getFromCache(key) {
    return this.cache[key] || null;
  }
};

// ===== UTILITÁRIOS ESPECÍFICOS PARA NOVELS =====
const NovelUtils = {
  // Gerar URL de capa placeholder
  generateCoverPlaceholder(title, width = 300, height = 400) {
    const encodedTitle = encodeURIComponent(title);
    return `https://via.placeholder.com/${width}x${height}?text=${encodedTitle}`;
  },

  // Truncar descrição
  truncateDescription(description, maxLength = 150) {
    if (description.length <= maxLength) {
      return description;
    }
    
    return description.substring(0, maxLength).trim() + '...';
  },

  // Calcular tempo de leitura estimado
  calculateReadingTime(chapters, avgChapterLength = 2000, wordsPerMinute = 200) {
    const totalWords = chapters * avgChapterLength;
    const minutes = Math.ceil(totalWords / wordsPerMinute);
    
    if (minutes < 60) {
      return `${minutes} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}m`;
    }
  },

  // Gerar cor baseada no gênero
  getGenreColor(genre) {
    const colors = {
      'Ação': '#e74c3c',
      'Aventura': '#f39c12',
      'Comédia': '#f1c40f',
      'Drama': '#9b59b6',
      'Fantasia': '#3498db',
      'Isekai': '#1abc9c',
      'Romance': '#e91e63',
      'Sobrenatural': '#34495e',
      'Tragédia': '#95a5a6',
      'Slice of Life': '#2ecc71',
      'Mistério': '#8e44ad',
      'Horror': '#c0392b'
    };
    
    return colors[genre] || '#7f8c8d';
  },

  // Validar dados da novel
  validateNovelData(novel) {
    const required = ['_id', 'title', 'author', 'description'];
    
    for (const field of required) {
      if (!novel[field]) {
        console.warn(`Campo obrigatório ausente: ${field}`, novel);
        return false;
      }
    }
    
    return true;
  }
};

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  NovelsManager.init();
});

// Expor globalmente
window.NovelsManager = NovelsManager;
window.NovelUtils = NovelUtils;

