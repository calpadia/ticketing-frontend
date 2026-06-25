import axios from 'axios'

const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})


api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const message = error.response?.data?.message

    // Dynamic import for toast
    import('../stores/toast').then(({ useToastStore }) => {
      const toast = useToastStore()

      switch (status) {
        case 401:
          if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
            localStorage.removeItem('token')
            localStorage.removeItem('user')
            window.location.href = '/login'
          }
          break
        case 403:
          toast.error(message || 'Anda tidak memiliki akses ke resource ini.')
          break
        case 413:
          toast.error('File terlalu besar. Maksimal ukuran file yang diizinkan telah terlampaui.')
          break
        case 422:
          toast.warning(message || 'Kuota telah habis.')
          break
        case 429:
          toast.warning('Terlalu banyak permintaan. Silakan tunggu beberapa saat dan coba lagi.')
          break
        case 500:
          const failUrl = error.config?.url || 'Unknown URL'
          toast.error(`Terjadi kesalahan pada server (500) saat mengakses: ${failUrl}`)
          break
      }
    }).catch(() => {})

    return Promise.reject(error)
  }
)

export default api
