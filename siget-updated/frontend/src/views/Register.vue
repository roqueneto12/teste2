<template>
  <div class="register-container">
    <div class="register-card">
      <div class="register-header">
        <h1>Registrar Empresa</h1>
        <p>Crie sua conta no SiGeT</p>
      </div>
      
      <form @submit.prevent="handleRegister" class="register-form">
        <div class="form-group">
          <label for="name">Nome da Empresa</label>
          <input
            id="name"
            v-model="form.name"
            type="text"
            required
            placeholder="Digite o nome da empresa"
            :disabled="loading"
          />
        </div>
        
        <div class="form-group">
          <label for="cnpj">CNPJ</label>
          <input
            id="cnpj"
            v-model="form.cnpj"
            type="text"
            required
            placeholder="00.000.000/0000-00"
            :disabled="loading"
          />
        </div>
        
        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            required
            placeholder="Digite o email da empresa"
            :disabled="loading"
          />
        </div>
        
        <div class="form-group">
          <label for="password">Senha</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            required
            placeholder="Digite uma senha (mín. 6 caracteres)"
            :disabled="loading"
            minlength="6"
          />
        </div>
        
        <button type="submit" class="register-btn" :disabled="loading">
          {{ loading ? 'Registrando...' : 'Registrar' }}
        </button>
        
        <div class="login-link">
          <p>Já tem uma conta? 
            <RouterLink to="/login">Faça login aqui</RouterLink>
          </p>
        </div>
      </form>
      
      <div v-if="error" class="error-message">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import api from '../services/api'

export default {
  name: 'Register',
  setup() {
    const router = useRouter()
    const form = ref({
      name: '',
      cnpj: '',
      email: '',
      password: ''
    })
    const loading = ref(false)
    const error = ref('')

    const handleRegister = async () => {
      loading.value = true
      error.value = ''
      
      try {
        const response = await api.auth.register(form.value)
        
        // Salvar token e dados da empresa
        localStorage.setItem('token', response.data.token)
        localStorage.setItem('company', JSON.stringify(response.data.company))
        
        // Redirecionar para dashboard
        router.push('/dashboard')
      } catch (err) {
        error.value = err.response?.data?.message || 'Erro ao registrar empresa'
      } finally {
        loading.value = false
      }
    }

    return {
      form,
      loading,
      error,
      handleRegister
    }
  }
}
</script>

<style scoped>
.register-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.register-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  padding: 40px;
  width: 100%;
  max-width: 450px;
}

.register-header {
  text-align: center;
  margin-bottom: 30px;
}

.register-header h1 {
  color: #333;
  font-size: 2rem;
  margin: 0 0 10px 0;
  font-weight: 700;
}

.register-header p {
  color: #666;
  margin: 0;
  font-size: 1rem;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group label {
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
}

.form-group input {
  padding: 12px 16px;
  border: 2px solid #e1e5e9;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.form-group input:focus {
  outline: none;
  border-color: #667eea;
}

.form-group input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.register-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  padding: 14px;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.register-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
}

.register-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.login-link {
  text-align: center;
  margin-top: 20px;
}

.login-link p {
  color: #666;
  margin: 0;
}

.login-link a {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
}

.login-link a:hover {
  text-decoration: underline;
}

.error-message {
  background-color: #fee;
  color: #c33;
  padding: 12px;
  border-radius: 8px;
  margin-top: 20px;
  text-align: center;
  border: 1px solid #fcc;
}

@media (max-width: 480px) {
  .register-card {
    padding: 30px 20px;
  }
  
  .register-header h1 {
    font-size: 1.8rem;
  }
}
</style>

