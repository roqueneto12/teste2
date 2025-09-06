import axios from 'axios'

const api = axios.create({
    baseURL:
'https://5000-inuaf7hocct3751zp1j48-9e13dd0f.manusvm.computer',
    headers:{
        'Content-Type':'application/json'
    }
} )

api.interceptors.request.use(
    (config)=>{
        const token = localStorage.getItem('token')

        if(token){
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error)=>{
        return Promise.reject(error)
    }
)

export default api;
