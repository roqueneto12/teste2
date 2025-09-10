<template>
  <div class="dashboard">
    <!-- Header -->
    <header class="dashboard-header">
      <div class="header-content">
        <div class="header-left">
          <h1>SiGeT Dashboard</h1>
          <p v-if="company">{{ company.name }}</p>
        </div>
        <div class="header-right">
          <button @click="showUserModal = true" class="btn btn-secondary">
            Gerenciar Usuários
          </button>
          <button @click="logout" class="btn btn-outline">
            Sair
          </button>
        </div>
      </div>
    </header>

    <!-- Filters -->
    <div class="filters">
      <div class="filter-group">
        <label>Status:</label>
        <select v-model="filters.status" @change="loadTestCards">
          <option value="">Todos</option>
          <option value="todo">A Fazer</option>
          <option value="in_progress">Em Progresso</option>
          <option value="testing">Testando</option>
          <option value="done">Concluído</option>
          <option value="blocked">Bloqueado</option>
        </select>
      </div>
      
      <div class="filter-group">
        <label>Prioridade:</label>
        <select v-model="filters.priority" @change="loadTestCards">
          <option value="">Todas</option>
          <option value="low">Baixa</option>
          <option value="medium">Média</option>
          <option value="high">Alta</option>
          <option value="critical">Crítica</option>
        </select>
      </div>
      
      <div class="filter-group">
        <label>Responsável:</label>
        <select v-model="filters.assignee" @change="loadTestCards">
          <option value="">Todos</option>
          <option v-for="user in users" :key="user._id" :value="user._id">
            {{ user.name }}
          </option>
        </select>
      </div>
      
      <button @click="showCardModal = true" class="btn btn-primary">
        Novo Cartão
      </button>
    </div>

    <!-- Kanban Board -->
    <div class="kanban-board">
      <div class="kanban-column" v-for="status in statuses" :key="status.key">
        <div class="column-header">
          <h3>{{ status.label }}</h3>
          <span class="card-count">{{ getCardsByStatus(status.key).length }}</span>
        </div>
        
        <draggable
          v-model="cardsByStatus[status.key]"
          group="cards"
          @change="handleCardMove"
          class="card-list"
          item-key="_id"
        >
          <template #item="{ element: card }">
            <div
              class="test-card"
              :class="[`priority-${card.priority}`, `result-${card.testResult}`]"
              @click="editCard(card)"
            >
              <div class="card-header">
                <h4>{{ card.title }}</h4>
                <span class="priority-badge">{{ getPriorityLabel(card.priority) }}</span>
              </div>
              
              <p class="card-description">{{ card.description }}</p>
              
              <div class="card-footer">
                <div class="assignee" v-if="card.assignee">
                  <span>{{ card.assignee.name }}</span>
                </div>
                <div class="test-result">
                  <span :class="`result-${card.testResult}`">
                    {{ getTestResultLabel(card.testResult) }}
                  </span>
                </div>
              </div>
            </div>
          </template>
        </draggable>
      </div>
    </div>

    <!-- Card Modal -->
    <div v-if="showCardModal" class="modal-overlay" @click="closeCardModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>{{ editingCard ? 'Editar Cartão' : 'Novo Cartão' }}</h3>
          <button @click="closeCardModal" class="close-btn">&times;</button>
        </div>
        
        <form @submit.prevent="saveCard" class="modal-form">
          <div class="form-group">
            <label>Título:</label>
            <input v-model="cardForm.title" type="text" required />
          </div>
          
          <div class="form-group">
            <label>Descrição:</label>
            <textarea v-model="cardForm.description" rows="3"></textarea>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>Status:</label>
              <select v-model="cardForm.status">
                <option value="todo">A Fazer</option>
                <option value="in_progress">Em Progresso</option>
                <option value="testing">Testando</option>
                <option value="done">Concluído</option>
                <option value="blocked">Bloqueado</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Prioridade:</label>
              <select v-model="cardForm.priority">
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
                <option value="critical">Crítica</option>
              </select>
            </div>
          </div>
          
          <div class="form-row">
            <div class="form-group">
              <label>Responsável:</label>
              <select v-model="cardForm.assignee">
                <option value="">Nenhum</option>
                <option v-for="user in users" :key="user._id" :value="user._id">
                  {{ user.name }}
                </option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Resultado do Teste:</label>
              <select v-model="cardForm.testResult">
                <option value="pending">Pendente</option>
                <option value="passed">Aprovado</option>
                <option value="failed">Reprovado</option>
                <option value="blocked">Bloqueado</option>
              </select>
            </div>
          </div>
          
          <div class="modal-actions">
            <button type="button" @click="closeCardModal" class="btn btn-secondary">
              Cancelar
            </button>
            <button v-if="editingCard" type="button" @click="deleteCard" class="btn btn-danger">
              Excluir
            </button>
            <button type="submit" class="btn btn-primary">
              {{ editingCard ? 'Salvar' : 'Criar' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- User Modal -->
    <div v-if="showUserModal" class="modal-overlay" @click="closeUserModal">
      <div class="modal" @click.stop>
        <div class="modal-header">
          <h3>Gerenciar Usuários</h3>
          <button @click="closeUserModal" class="close-btn">&times;</button>
        </div>
        
        <div class="user-list">
          <div v-for="user in users" :key="user._id" class="user-item">
            <div class="user-info">
              <strong>{{ user.name }}</strong>
              <span>{{ user.email }}</span>
              <span class="role">{{ user.role }}</span>
            </div>
          </div>
        </div>
        
        <form @submit.prevent="createUser" class="modal-form">
          <h4>Adicionar Usuário</h4>
          
          <div class="form-group">
            <label>Nome:</label>
            <input v-model="userForm.name" type="text" required />
          </div>
          
          <div class="form-group">
            <label>Email:</label>
            <input v-model="userForm.email" type="email" required />
          </div>
          
          <div class="form-group">
            <label>Função:</label>
            <select v-model="userForm.role">
              <option value="tester">Testador</option>
              <option value="developer">Desenvolvedor</option>
              <option value="manager">Gerente</option>
            </select>
          </div>
          
          <div class="modal-actions">
            <button type="submit" class="btn btn-primary">
              Adicionar Usuário
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import draggable from 'vuedraggable'
import api from '../services/api'

export default {
  name: 'Dashboard',
  components: {
    draggable
  },
  setup() {
    const router = useRouter()
    
    const company = ref(null)
    const testCards = ref([])
    const users = ref([])
    const showCardModal = ref(false)
    const showUserModal = ref(false)
    const editingCard = ref(null)
    
    const filters = ref({
      status: '',
      priority: '',
      assignee: ''
    })
    
    const cardForm = ref({
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      assignee: '',
      testResult: 'pending'
    })
    
    const userForm = ref({
      name: '',
      email: '',
      role: 'tester'
    })
    
    const statuses = [
      { key: 'todo', label: 'A Fazer' },
      { key: 'in_progress', label: 'Em Progresso' },
      { key: 'testing', label: 'Testando' },
      { key: 'done', label: 'Concluído' },
      { key: 'blocked', label: 'Bloqueado' }
    ]

    const cardsByStatus = computed(() => {
      const grouped = {}
      statuses.forEach(status => {
        grouped[status.key] = testCards.value.filter(card => card.status === status.key)
      })
      return grouped
    })

    const loadTestCards = async () => {
      try {
        const response = await api.testCards.getAll(filters.value)
        testCards.value = response.data
      } catch (error) {
        console.error('Erro ao carregar cartões:', error)
      }
    }
    
    const loadUsers = async () => {
      try {
        const response = await api.users.getAll()
        users.value = response.data
      } catch (error) {
        console.error('Erro ao carregar usuários:', error)
      }
    }
    
    const getCardsByStatus = (status) => {
      return testCards.value.filter(card => card.status === status)
    }
    
    const getPriorityLabel = (priority) => {
      const labels = {
        low: 'Baixa',
        medium: 'Média',
        high: 'Alta',
        critical: 'Crítica'
      }
      return labels[priority] || priority
    }
    
    const getTestResultLabel = (result) => {
      const labels = {
        pending: 'Pendente',
        passed: 'Aprovado',
        failed: 'Reprovado',
        blocked: 'Bloqueado'
      }
      return labels[result] || result
    }
    
    const editCard = (card) => {
      editingCard.value = card
      cardForm.value = {
        title: card.title,
        description: card.description,
        status: card.status,
        priority: card.priority,
        assignee: card.assignee?._id || '',
        testResult: card.testResult
      }
      showCardModal.value = true
    }
    
    const saveCard = async () => {
      try {
        if (editingCard.value) {
          await api.testCards.update(editingCard.value._id, cardForm.value)
        } else {
          await api.testCards.create(cardForm.value)
        }
        
        await loadTestCards()
        closeCardModal()
      } catch (error) {
        console.error('Erro ao salvar cartão:', error)
      }
    }
    
    const deleteCard = async () => {
      if (confirm('Tem certeza que deseja excluir este cartão?')) {
        try {
          await api.testCards.delete(editingCard.value._id)
          await loadTestCards()
          closeCardModal()
        } catch (error) {
          console.error('Erro ao excluir cartão:', error)
        }
      }
    }
    
    const createUser = async () => {
      try {
        await api.users.create(userForm.value)
        await loadUsers()
        userForm.value = { name: '', email: '', role: 'tester' }
      } catch (error) {
        console.error('Erro ao criar usuário:', error)
      }
    }
    
    const handleCardMove = async (event) => {
      if (event.moved) {
        const card = event.moved.element
        const newStatus = Object.keys(cardsByStatus.value).find(status => 
          cardsByStatus.value[status].includes(card)
        )
        
        if (newStatus && card.status !== newStatus) {
          try {
            await api.testCards.update(card._id, { status: newStatus })
            card.status = newStatus
          } catch (error) {
            console.error('Erro ao mover cartão:', error)
            await loadTestCards()
          }
        }
      }
    }
    
    const closeCardModal = () => {
      showCardModal.value = false
      editingCard.value = null
      cardForm.value = {
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        assignee: '',
        testResult: 'pending'
      }
    }
    
    const closeUserModal = () => {
      showUserModal.value = false
    }
    
    const logout = () => {
      localStorage.removeItem('token')
      localStorage.removeItem('company')
      router.push('/login')
    }

    onMounted(async () => {
      company.value = JSON.parse(localStorage.getItem('company') || '{}')
      await loadTestCards()
      await loadUsers()
    })

    return {
      company,
      testCards,
      users,
      showCardModal,
      showUserModal,
      editingCard,
      filters,
      cardForm,
      userForm,
      statuses,
      cardsByStatus,
      loadTestCards,
      loadUsers,
      getCardsByStatus,
      getPriorityLabel,
      getTestResultLabel,
      editCard,
      saveCard,
      deleteCard,
      createUser,
      handleCardMove,
      closeCardModal,
      closeUserModal,
      logout
    }
  }
}
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  background-color: #f5f7fa;
}

.dashboard-header {
  background: white;
  border-bottom: 1px solid #e1e5e9;
  padding: 20px 0;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left h1 {
  margin: 0;
  color: #333;
  font-size: 1.8rem;
}

.header-left p {
  margin: 5px 0 0 0;
  color: #666;
}

.header-right {
  display: flex;
  gap: 12px;
}

.filters {
  max-width: 1200px;
  margin: 20px auto;
  padding: 0 20px;
  display: flex;
  gap: 20px;
  align-items: end;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.filter-group label {
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
}

.filter-group select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
}

.kanban-board {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px 40px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
}

.kanban-column {
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.column-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid #f0f0f0;
}

.column-header h3 {
  margin: 0;
  color: #333;
  font-size: 1.1rem;
}

.card-count {
  background: #667eea;
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
}

.card-list {
  min-height: 200px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.test-card {
  background: white;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-left: 4px solid #ddd;
}

.test-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.test-card.priority-low {
  border-left-color: #28a745;
}

.test-card.priority-medium {
  border-left-color: #ffc107;
}

.test-card.priority-high {
  border-left-color: #fd7e14;
}

.test-card.priority-critical {
  border-left-color: #dc3545;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 8px;
}

.card-header h4 {
  margin: 0;
  color: #333;
  font-size: 1rem;
  line-height: 1.3;
}

.priority-badge {
  background: #f8f9fa;
  color: #666;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
}

.card-description {
  color: #666;
  font-size: 0.9rem;
  margin: 0 0 12px 0;
  line-height: 1.4;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
}

.assignee {
  color: #667eea;
  font-weight: 600;
}

.test-result .result-pending {
  color: #6c757d;
}

.test-result .result-passed {
  color: #28a745;
}

.test-result .result-failed {
  color: #dc3545;
}

.test-result .result-blocked {
  color: #fd7e14;
}

/* Buttons */
.btn {
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  display: inline-block;
}

.btn-primary {
  background: #667eea;
  color: white;
}

.btn-primary:hover {
  background: #5a6fd8;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
}

.btn-outline {
  background: transparent;
  color: #667eea;
  border: 1px solid #667eea;
}

.btn-outline:hover {
  background: #667eea;
  color: white;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover {
  background: #c82333;
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal {
  background: white;
  border-radius: 12px;
  padding: 0;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e1e5e9;
}

.modal-header h3 {
  margin: 0;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #666;
}

.modal-form {
  padding: 20px;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 600;
  color: #333;
}

.form-group input,
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e1e5e9;
}

.user-list {
  padding: 20px;
  max-height: 200px;
  overflow-y: auto;
}

.user-item {
  padding: 12px;
  border: 1px solid #e1e5e9;
  border-radius: 6px;
  margin-bottom: 8px;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-info .role {
  color: #667eea;
  font-size: 0.9rem;
  text-transform: capitalize;
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
  
  .filters {
    flex-direction: column;
    align-items: stretch;
  }
  
  .kanban-board {
    grid-template-columns: 1fr;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>

