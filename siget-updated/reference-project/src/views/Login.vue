<template>
    <div class="login-container">
        <!-- Loading Overlay -->
        <div v-if="loading" class="loading-overlay">
            <div class="loading-spinner"></div>
            <p>Entrando...</p>
        </div>

        <div class="login-form">
            <div class="login-header">
                <h2 class="login-title">🧪 SiGeT</h2>
                <p class="login-subtitle">Sistema de Gerenciamento de Testes</p>
            </div>
            
            <form @submit.prevent="handleLogin" class="auth-form">
                <div class="form-group">
                    <label class="form-label">Login:</label>
                    <input 
                        type="text" 
                        v-model="credentials.login" 
                        class="form-input"
                        required 
                        placeholder="Digite seu login"
                    />
                </div>
                
                <div class="form-group">
                    <label class="form-label">Senha:</label>
                    <div class="password-input">
                        <input 
                            :type="showPassword ? 'text' : 'password'" 
                            v-model="credentials.senha" 
                            class="form-input"
                            required 
                            placeholder="Digite sua senha"
                        />
                        <button 
                            type="button" 
                            class="password-toggle"
                            @click="showPassword = !showPassword"
                        >
                            {{ showPassword ? '🙈' : '👁️' }}
                        </button>
                    </div>
                </div>
                
                <button type="submit" class="btn btn-primary btn-full" :disabled="loading">
                    {{ loading ? 'Entrando...' : 'Entrar' }}
                </button>
                
                <div v-if="error" class="error-message">
                    {{ error }}
                </div>
            </form>               
        </div>
    </div>    
</template>

<script>
export default {
    name:'Login',
    data() {
        return {
            credentials:{
                login:'',
                senha:''
            },
            loading: false,
            error:'',
            showPassword: false
        }
    },
    methods: {
        async handleLogin(){
            this.loading = true
            this.error=''

            const result = await this.$store.dispatch('auth/login', this.credentials)

            if(result.success){
                this.$router.push('/produtos')
            } else {
                this.error= result.message
            }

            this.loading=false;
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
}

.login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    width: 100vw;    
    background: linear-gradient(135deg, var(--bg-primary), var(--bg-secondary));
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    position: relative;
}

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

.login-form {
    background: var(--bg-card);
    padding: var(--spacing-2xl);
    border-radius: var(--border-radius-xl);
    box-shadow: var(--shadow-card);
    width: 100%;
    max-width: 400px;
    border: 1px solid rgba(255, 255, 255, 0.1);
}

.login-header {
    text-align: center;
    margin-bottom: var(--spacing-xl);
}

.login-title {
    font-size: 2rem;
    font-weight: 700;
    color: var(--accent-primary);
    text-shadow: 0 0 10px rgba(0, 212, 255, 0.3);
    margin: 0 0 var(--spacing-sm) 0;
}

.login-subtitle {
    color: var(--text-secondary);
    margin: 0;
    font-size: 0.9rem;
}

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

.password-input {
    position: relative;
}

.password-toggle {
    position: absolute;
    right: var(--spacing-md);
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: var(--text-secondary);
    cursor: pointer;
    padding: var(--spacing-sm);
    transition: color var(--transition-fast);
}

.password-toggle:hover {
    color: var(--accent-primary);
}

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
}

.btn-primary {
    background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
    color: white;
}

.btn-primary:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: var(--shadow-blue);
}

.btn-full {
    width: 100%;
}

.btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
}

.error-message {
    background: rgba(255, 68, 68, 0.1);
    color: var(--accent-error);
    padding: var(--spacing-md);
    border-radius: var(--border-radius-md);
    border: 1px solid rgba(255, 68, 68, 0.2);
    text-align: center;
    font-size: 0.9rem;
}

/* Responsive */
@media (max-width: 480px) {
    .login-form {
        margin: var(--spacing-md);
        padding: var(--spacing-lg);
    }
    
    .login-title {
        font-size: 1.5rem;
    }
}
</style>

