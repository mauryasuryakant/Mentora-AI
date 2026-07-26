import axios from 'axios'

// Dynamically determine baseURL:
// If running on standard ports (Vite dev server 5173 or Express backend 3000), use '/api'.
// If opened via Live Server (port 5500), file:// protocol, or any custom port, fall back directly to http://localhost:3000/api.
let baseURL = '/api'
if (typeof window !== 'undefined') {
  const { protocol, port } = window.location
  if (protocol === 'file:' || (port && port !== '3000' && port !== '5173')) {
    baseURL = 'http://localhost:3000/api'
  }
}

const http = axios.create({
  baseURL,
  timeout: 30000, // 30s — AI calls can be slow
  headers: { 'Content-Type': 'application/json' }
})

// Unwrap the data automatically and throw plain error messages
http.interceptors.response.use(
  res  => res.data,
  err  => {
    const msg = err.response?.data?.error || err.message || 'Something went wrong'
    return Promise.reject(new Error(msg))
  }
)

export const api = {
  health:    ()     => http.get('/health'),
  studyPlan: (data) => http.post('/study-plan', data),
  quiz:      (data) => http.post('/quiz', data),
  evaluate:  (data) => http.post('/evaluate', data),
  chat:      (data) => http.post('/chat', data),
}
