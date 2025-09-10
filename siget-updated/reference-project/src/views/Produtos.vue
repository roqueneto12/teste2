<template>
    <div class="produtos-container">
        <!-- Loading Overlay -->
        <div v-if="loading" class="loading-overlay">
            <div class="loading-spinner"></div>
            <p>Carregando produtos...</p>
        </div>

        <!-- Header -->
        <header class="header-container">
            <div class="header-content">
                <h1 class="header-title">
                    🧪 SiGeT - Gerenciar Produtos
                </h1>
                
                <div class="header-actions">
                    <button @click="showForm = true" class="btn btn-primary">
                        ➕ Novo Produto
                    </button>
                    <button @click="logout" class="btn btn-secondary">
                        🚪 Sair
                    </button>
                </div>
            </div>
        </header>

        <!-- Modal de Editar/Cadastrar -->
        <div v-if="showForm" class="modal active">
            <div class="modal-overlay" @click="cancelForm"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3 class="modal-title">
                        {{ editingProduct ? '✏️ Editar Produto' : '➕ Novo Produto' }}
                    </h3>
                    <button class="modal-close" @click="cancelForm">✕</button>
                </div>
                <div class="modal-body">
                    <form @submit.prevent="handleSubmit" class="auth-form">
                        <div class="form-group">
                            <label class="form-label">Nome:</label>
                            <input 
                                type="text" 
                                v-model="form.nome" 
                                class="form-input"
                                placeholder="Digite o nome do produto"
                                required 
                            />
                        </div>
                        <div class="form-group">
                            <label class="form-label">Preço (R$):</label>
                            <input 
                                type="number" 
                                v-model="form.preco" 
                                class="form-input"
                                placeholder="0,00"
                                step="0.01" 
                                required 
                            />
                        </div>
                        <div class="form-actions">
                            <button type="submit" class="btn btn-primary">
                                {{ editingProduct ? '💾 Salvar' : '➕ Criar' }}
                            </button>
                            <button type="button" @click="cancelForm" class="btn btn-secondary">
                                ❌ Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>

        <!-- Main Content -->
        <main class="main-content">
            <!-- Stats Section -->
            <section class="stats-section">
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-icon">📦</div>
                        <div class="stat-info">
                            <h3>{{ produtos.length }}</h3>
                            <p>Total de Produtos</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">💰</div>
                        <div class="stat-info">
                            <h3>R$ {{ totalValue.toFixed(2) }}</h3>
                            <p>Valor Total</p>
                        </div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-icon">📊</div>
                        <div class="stat-info">
                            <h3>R$ {{ averagePrice.toFixed(2) }}</h3>
                            <p>Preço Médio</p>
                        </div>
                    </div>
                </div>
            </section>

            <!-- Products Section -->
            <section class="produtos-section">
                <h2 class="section-title">📋 Lista de Produtos</h2>
                
                <div v-if="produtos.length === 0 && !loading" class="empty-state">
                    <div class="empty-icon">📦</div>
                    <h3>Nenhum produto encontrado</h3>
                    <p>Comece criando seu primeiro produto!</p>
                    <button @click="showForm = true" class="btn btn-primary">
                        ➕ Criar Primeiro Produto
                    </button>
                </div>

                <div v-else class="produtos-grid">
                    <div v-for="produto in produtos" :key="produto._id" class="produto-card">
                        <div class="card-header">
                            <h3 class="produto-nome">{{ produto.nome }}</h3>
                            <div class="produto-preco">R$ {{ parseFloat(produto.preco).toFixed(2) }}</div>
                        </div>
                        
                        <div class="card-content">
                            <div class="produto-info">
                                <span class="info-label">ID:</span>
                                <span class="info-value">{{ produto._id }}</span>
                            </div>
                        </div>
                        
                        <div class="card-actions">
                            <button @click="editProdutos(produto)" class="btn-action btn-edit">
                                ✏️ Editar
                            </button>
                            <button @click="deleteProduto(produto._id)" class="btn-action btn-delete">
                                🗑️ Deletar
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        </main>

        <!-- Toast Container -->
        <div id="toast-container" class="toast-container"></div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
    name:'Produtos',
    data() {
        return {
            showForm: false,
            editingProduct: null,
            form:{ nome:'', preco:''}
        }
    },
    computed:{
        ...mapGetters({
            produtos: 'produtos/produtos',
            loading: 'produtos/loading',
            error: 'produtos/error'
        }),
        totalValue() {
            return this.produtos.reduce((sum, produto) => sum + parseFloat(produto.preco || 0), 0);
        },
        averagePrice() {
            return this.produtos.length > 0 ? this.totalValue / this.produtos.length : 0;
        }
    },
    async mounted() {
        await this.$store.dispatch('produtos/fetchProdutos')
    },
    methods:{
        async handleSubmit(){
            const action = this.editingProduct ? 'produtos/updateProduto' : 'produtos/createProduto'
            const data = this.editingProduct ? 
                            { ...this.form, _id: this.editingProduct._id} :
                            this.form;
            const result = await this.$store.dispatch(action,data)

            if(result.success){
                this.showToast('success', this.editingProduct ? 'Produto atualizado com sucesso!' : 'Produto criado com sucesso!');
                this.cancelForm()
            } else {
                this.showToast('error', result.message);
            }
        },
        editProdutos(produto){
            this.editingProduct = produto
            this.form = {...produto}
            this.showForm = true
        },
        async deleteProduto(id){
            if(confirm('Tem certeza que deseja excluir este produto?')){
                const result = await this.$store.dispatch('produtos/deleteProduto', id)
                if(result.success){
                    this.showToast('success', 'Produto excluído com sucesso!');
                } else {
                    this.showToast('error', result.message);
                }        
            }
        },
        cancelForm(){
            this.showForm=false
            this.editingProduct=null
            this.form = {nome:'',preco:''}
        },
        logout(){
            this.$store.dispatch('auth/logout')
            this.$router.push('/login')
        },
        showToast(type, message) {
            const toast = document.createElement('div');
            toast.className = `toast toast-${type} show`;
            toast.innerHTML = `
                <span>${message}</span>
                <button class="toast-close" onclick="this.parentElement.remove()">✕</button>
            `;
            
            const container = document.getElementById('toast-container') || document.body;
            container.appendChild(toast);
            
            setTimeout(() => {
                toast.classList.add('hide');
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        }
    }
}
</script>

<style scoped>
/* Variáveis CSS */
:root {
  --bg-primary: #0f1419;
  --bg-secondary: #1a1f2e;
  --bg-tertiary: #2a2f3e;
  --bg-card: #1e2332;
  
  --text-primary: #ffffff;
  --text-secondary: #b3b8c4;
  --text-muted: #8a8f9a;
  
  --accent-primary: #00d4ff;
  --accent-secondary: #0099cc;
  --accent-hover: #00b8e6;
  --accent-success: #00ff88;
  --accent-warning: #ffaa00;
  --accent-error: #ff4444;
  
  --shadow-primary: 0 4px 6px rgba(0, 0, 0, 0.3);
  --shadow-card: 0 8px 25px rgba(0, 0, 0, 0.4);
  --shadow-blue: 0 0 20px rgba(0, 212, 255, 0.2);
  
  --transition-fast: 0.2s ease;
  --transition-normal: 0.3s ease;
  
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  --spacing-2xl: 3rem;
  
  --border-radius-sm: 0.375rem;
  --border-radius-md: 0.5rem;
  --border-radius-lg: 0.75rem;
  --border-radius-xl: 1rem;
  
  --z-dropdown: 1000;
  --z-sticky: 1020;
  --z-modal: 1040;
}

.produtos-container {
    min-height: 100vh;
    background: var(--bg-primary);
    color: var(--text-primary);
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* Loading */
.loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: var(--bg-primary);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 9999;
    transition: opacity var(--transition-normal);
}

.loading-spinner {
    width: 50px;
    height: 50px;
    border: 3px solid rgba(0, 212, 255, 0.3);
    border-top: 3px solid var(--accent-primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: var(--spacing-md);
}

@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

/* Header */
.header-container {
    background: rgba(42, 47, 62, 0.95);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    padding: var(--spacing-lg) var(--spacing-xl);
    position: sticky;
    top: 0;
    z-index: var(--z-sticky);
}

.header-content {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--spacing-xl);
    flex-wrap: wrap;
}

.header-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--accent-primary);
    text-shadow: 0 0 10px rgba(0, 212, 255, 0.3);
    margin: 0;
}

.header-actions {
    display: flex;
    gap: var(--spacing-md);
}

/* Main Content */
.main-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: var(--spacing-xl);
}

/* Stats Section */
.stats-section {
    margin-bottom: var(--spacing-2xl);
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--spacing-lg);
}

.stat-card {
    background: var(--bg-card);
    padding: var(--spacing-lg);
    border-radius: var(--border-radius-lg);
    box-shadow: var(--shadow-card);
    border: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    transition: all var(--transition-normal);
}

.stat-card:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-blue);
    border-color: var(--accent-primary);
}

.stat-icon {
    font-size: 2rem;
    background: rgba(0, 212, 255, 0.1);
    padding: var(--spacing-md);
    border-radius: var(--border-radius-md);
}

.stat-info h3 {
    color: var(--accent-primary);
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
}

.stat-info p {
    color: var(--text-secondary);
    margin: 0;
    font-size: 0.9rem;
}

/* Products Section */
.produtos-section {
    margin-bottom: var(--spacing-2xl);
}

.section-title {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: var(--spacing-xl);
    color: var(--text-primary);
}

.empty-state {
    text-align: center;
    padding: var(--spacing-2xl);
    background: var(--bg-card);
    border-radius: var(--border-radius-xl);
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.empty-icon {
    font-size: 4rem;
    margin-bottom: var(--spacing-lg);
    opacity: 0.5;
}

.empty-state h3 {
    color: var(--text-primary);
    margin-bottom: var(--spacing-md);
}

.empty-state p {
    color: var(--text-secondary);
    margin-bottom: var(--spacing-lg);
}

.produtos-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: var(--spacing-lg);
}

.produto-card {
    background: var(--bg-card);
    border-radius: var(--border-radius-xl);
    box-shadow: var(--shadow-card);
    border: 1px solid rgba(255, 255, 255, 0.1);
    transition: all var(--transition-normal);
    overflow: hidden;
}

.produto-card:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow-blue);
    border-color: var(--accent-primary);
}

.card-header {
    padding: var(--spacing-lg);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: var(--spacing-md);
}

.produto-nome {
    color: var(--text-primary);
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
    flex: 1;
}

.produto-preco {
    color: var(--accent-success);
    font-size: 1.2rem;
    font-weight: 700;
    background: rgba(0, 255, 136, 0.1);
    padding: var(--spacing-sm) var(--spacing-md);
    border-radius: var(--border-radius-md);
}

.card-content {
    padding: var(--spacing-lg);
}

.produto-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--spacing-sm);
}

.info-label {
    color: var(--text-secondary);
    font-size: 0.9rem;
}

.info-value {
    color: var(--text-muted);
    font-size: 0.8rem;
    font-family: monospace;
}

.card-actions {
    padding: var(--spacing-lg);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    gap: var(--spacing-sm);
}

.btn-action {
    flex: 1;
    padding: var(--spacing-sm) var(--spacing-md);
    border: none;
    border-radius: var(--border-radius-md);
    font-weight: 600;
    cursor: pointer;
    transition: all var(--transition-fast);
    font-size: 0.9rem;
}

.btn-edit {
    background: rgba(255, 170, 0, 0.1);
    color: var(--accent-warning);
    border: 1px solid rgba(255, 170, 0, 0.2);
}

.btn-edit:hover {
    background: var(--accent-warning);
    color: white;
}

.btn-delete {
    background: rgba(255, 68, 68, 0.1);
    color: var(--accent-error);
    border: 1px solid rgba(255, 68, 68, 0.2);
}

.btn-delete:hover {
    background: var(--accent-error);
    color: white;
}

/* Buttons */
.btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-md) var(--spacing-lg);
    border-radius: var(--border-radius-md);
    font-weight: 600;
    text-decoration: none;
    transition: all var(--transition-fast);
    cursor: pointer;
    border: none;
    font-size: 1rem;
    gap: var(--spacing-sm);
}

.btn-primary {
    background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
    color: white;
}

.btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: var(--shadow-blue);
}

.btn-secondary {
    background: transparent;
    color: var(--accent-primary);
    border: 2px solid var(--accent-primary);
}

.btn-secondary:hover {
    background: var(--accent-primary);
    color: white;
}

/* Modal */
.modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: var(--z-modal);
    opacity: 0;
    visibility: hidden;
    transition: all var(--transition-normal);
}

.modal.active {
    opacity: 1;
    visibility: visible;
}

.modal-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(5px);
}

.modal-content {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: var(--bg-card);
    border-radius: var(--border-radius-xl);
    box-shadow: var(--shadow-card);
    width: 90%;
    max-width: 500px;
    max-height: 90vh;
    overflow-y: auto;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--spacing-lg);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.modal-title {
    color: var(--accent-primary);
    margin: 0;
}

.modal-close {
    background: none;
    border: none;
    color: var(--text-secondary);
    font-size: 1.5rem;
    cursor: pointer;
    padding: var(--spacing-sm);
    border-radius: var(--border-radius-sm);
    transition: all var(--transition-fast);
}

.modal-close:hover {
    background: rgba(255, 255, 255, 0.1);
    color: var(--text-primary);
}

.modal-body {
    padding: var(--spacing-lg);
}

/* Forms */
.auth-form {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-lg);
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
}

.form-label {
    font-weight: 600;
    color: var(--text-primary);
    font-size: 0.9rem;
}

.form-input {
    padding: var(--spacing-md);
    background: var(--bg-secondary);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: var(--border-radius-md);
    color: var(--text-primary);
    font-size: 1rem;
    transition: all var(--transition-fast);
}

.form-input::placeholder {
    color: var(--text-muted);
}

.form-input:focus {
    outline: none;
    border-color: var(--accent-primary);
    box-shadow: 0 0 0 3px rgba(0, 212, 255, 0.1);
}

.form-actions {
    display: flex;
    gap: var(--spacing-md);
    justify-content: flex-end;
}

/* Toast Notifications */
.toast-container {
    position: fixed;
    top: var(--spacing-lg);
    right: var(--spacing-lg);
    z-index: 9999;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-sm);
}

.toast {
    display: flex;
    align-items: center;
    gap: var(--spacing-md);
    padding: var(--spacing-md) var(--spacing-lg);
    border-radius: var(--border-radius-md);
    box-shadow: var(--shadow-card);
    min-width: 300px;
    transform: translateX(100%);
    transition: transform var(--transition-normal);
}

.toast.show {
    transform: translateX(0);
}

.toast.hide {
    transform: translateX(100%);
}

.toast-success {
    background: var(--accent-success);
    color: white;
}

.toast-error {
    background: var(--accent-error);
    color: white;
}

.toast-close {
    background: none;
    border: none;
    color: inherit;
    cursor: pointer;
    font-size: 1.2rem;
    margin-left: auto;
}

/* Responsive */
@media (max-width: 768px) {
    .header-content {
        flex-direction: column;
        gap: var(--spacing-md);
    }
    
    .header-actions {
        width: 100%;
        justify-content: center;
    }
    
    .main-content {
        padding: var(--spacing-md);
    }
    
    .stats-grid {
        grid-template-columns: 1fr;
    }
    
    .produtos-grid {
        grid-template-columns: 1fr;
    }
    
    .form-actions {
        flex-direction: column;
    }
    
    .toast {
        min-width: auto;
        width: calc(100vw - 2rem);
    }
    
    .toast-container {
        left: var(--spacing-md);
        right: var(--spacing-md);
    }
}

@media (max-width: 480px) {
    .modal-content {
        width: 95%;
    }
    
    .modal-header,
    .modal-body {
        padding: var(--spacing-md);
    }
    
    .card-header {
        flex-direction: column;
        align-items: flex-start;
        gap: var(--spacing-sm);
    }
    
    .produto-preco {
        align-self: flex-end;
    }
}
</style>

