<template>
    <div class="produtos-container">
        <div class="header">
            <h1>Gerenciar produtos</h1>
            <button @click="showForm = true" class="btn-primary">
                Novo Produto
            </button>
            <button @click="logout" class="btn-secondary">
                Sair
            </button>
        </div>
        <!-- Modal de Editar/Cadastrar -->
        <div v-if="showForm" class="modal">
            <div class="modal-content">
                <h3>{{ editingProduct ? 'Editar' : 'Novo' }}</h3>
                <form @submit.prevent="handleSubmit">
                    <div class="form-group">
                        <label>Nome:</label>
                        <input type="text" v-model="form.nome" required />
                    </div>
                    <div class="form-group">
                        <label>Preço: R$</label>
                        <input type="number" v-model="form.preco" step="0.01" required />
                    </div>
                    <div class="form-actions">
                        <button type="submit">Salvar</button>
                        <button type="button" @click="cancelForm">Cancelar</button>
                    </div>
                </form>
            </div>
        </div>
        <!-- Lista de Produtos -->
        <div class="produtos-list">
            <div v-if="loading" class="loading"> Carregando...</div>

            <div v-else-if="produtos.length === 0" class="empty">
                Nenhum produto encontrado
            </div>

            <div v-else class="produtos-grid">
                <div v-for="produto in produtos" :key="produto._id" class="produto-card">
                    <h3>{{ produto.nome }}</h3>
                    <p class="preco">R$ {{ produto.preco }}</p>
                    <div class="card-actions">
                        <button @click="editProdutos(produto)" class="btn-edit">Editar</button>
                        <button @click="deleteProduto(produto._id)" class="btn-delete">Deletar</button>
                    </div>
                </div>
            </div>
        </div>
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
            })
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
                    this.cancelForm()
                } else {
                    alert(result.message)
                }
            },
            editProdutos(produto){
                this.editingProduct = produto
                this.form = {...produto}
                this.showForm = true
            },
            async deleteProduto(id){
                if(confirm('Tem certeza que deseja excluir?')){
                    const result = await this.$store.dispatch('produtos/deleteProduto', id)
                    if(!result.success){
                        alert(result.message)
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
            }
        }
}
</script>

<style scoped>
.produtos-container{
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
}

.header{
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
}

.btn-primary{
    background-color: #007bff;
    color: white;
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.btn-secondary{
    background-color: #6c757d;
    color: white;
    padding: 0.5rem 1rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.modal{
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0,0,0,0.5);
    display: flex;
    justify-content: center;
    align-items: center;
}

.modal-content{
    background-color: white;
    padding: 2rem;
    border-radius: 8px;
    width: 98%;
    max-width: 500px;
}

.form-group{
    margin-bottom: 1rem;
}

.form-actions {
    display: flex;
    gap: 1rem;
    justify-content: flex-end;
}

.produtos-grid{
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1rem;
}

.produto-card{
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 1rem;
    background: white;
}

.preco{
    font-size: 1.2rem;
    font-weight: bold;
    color: #28a745;
}

.card-actions{
    display: flex;
    gap: 0.5rem;
    margin-top: 1rem;
}

.btn-edit{
    background-color: #ffc107;
    color: black;
    padding: 0.25rem 0.5rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.btn-delete{
    background-color: #dc3545;
    color: white;
    padding: 0.25rem 0.5rem;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.loading, .empty{
    text-align: center;
    padding: 2rem;
    color: #666;
}

</style>