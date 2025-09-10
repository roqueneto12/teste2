import api from '@/services/api'

const state = {
    produtos: [],
    loading: false,
    error: null
}

const mutations = {
    SET_LOADING(state, status){
        state.loading = status
    },
    SET_PRODUTOS(state, produtos){
        state.produtos = produtos
    },
    ADD_PRODUTO(state, produto){
        state.produtos.push(produto)
    },
    UPDATE_PRODUTO(state, produtoAtualizado){
        const index = state.produtos.findIndex(p => p._id == produtoAtualizado._id)

        if(index !== -1){
            state.produtos.splice(index,1, produtoAtualizado)
        }
    },
    DELETE_PRODUTO(state, produtoId){
        state.produtos = state.produtos.filter(p=>p._id != produtoId)
    },
    SET_ERROR(state, error){
        state.error = error
    }
}

const actions = {
    async fetchProdutos({ commit }){
        commit('SET_LOADING', true)
        commit('SET_ERROR', null)

        try{
            const response = await api.get('/produtos')
            commit('SET_PRODUTOS', response.data)
        }catch(error){
            console.error('Error ao buscar produtos: ', error)
            commit('SET_ERROR', error.response?.data?.message || 'Error ao carregar produtos')            
        } finally{
            commit('SET_LOADING', false)
        }
    },

    async createProduto({ commit }, produto){
        try{
            const response = await api.post('/produtos', {
                nome: produto.nome,
                preco: parseFloat(produto.preco)
            })
            commit('ADD_PRODUTO', response.data)
            return { success: true}
        }catch(error){
            console.error('Error ao criar o produto: ', error)
            return {
                success: false,
                message: error.response?.data?.message || 'Error ao criar produto'
            }
        }
    },

    async updateProduto({commit}, produto){
        try{
            const response = await api.put(`/produtos/${produto._id}`,{
                nome:produto.nome,
                preco: parseFloat(produto.preco)
            })
            commit('UPDATE_PRODUTO', response.data)
            return{ success:true}
        }catch(error){
            console.error('Error ao atualizar produto: ', error)
            return{
                success:false,
                message: error.response?.data?.message || 'Error ao atualizar produto'
            }
        }
    },
    async deleteProduto({ commit }, produtoId){
        try{
            await api.delete(`/produtos/${produtoId}`)
            commit('DELETE_PRODUTO', produtoId)
            return { success: true}
        }catch(error){
            console.error('Error ao deletar produto: ', error)
            return {
                success:false,
                message: error.response?.data?.message || 'Error ao deletar produto'
            }
        }
    }
}

const getters = {
    produtos: state => state.produtos,
    loading: state => state.loading,
    error: state => state.error
}

export default{
    namespaced: true,
    state,
    mutations,
    actions,
    getters
}