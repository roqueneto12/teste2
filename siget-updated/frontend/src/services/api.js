import axios from 'axios'

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json'
    }
})

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Interceptor para tratar respostas
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token')
            localStorage.removeItem('company')
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

export default {
    // Autenticação
    auth: {
        login: (credentials) => api.post('/auth/login', credentials),
        register: (data) => api.post('/auth/register', data)
    },

    // Cartões de teste
    testCards: {
        getAll: (filters = {}) => api.get('/test-cards', { params: filters }),
        getById: (id) => api.get(`/test-cards/${id}`),
        create: (data) => api.post('/test-cards', data),
        update: (id, data) => api.put(`/test-cards/${id}`, data),
        delete: (id) => api.delete(`/test-cards/${id}`)
    },

    // Usuários
    users: {
        getAll: () => api.get('/users'),
        getById: (id) => api.get(`/users/${id}`),
        create: (data) => api.post('/users', data),
        update: (id, data) => api.put(`/users/${id}`, data),
        delete: (id) => api.delete(`/users/${id}`)
    }
}

