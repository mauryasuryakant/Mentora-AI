import axios from 'axios'

// All API calls go through this single file.
// The base URL uses Vite's proxy in dev (/api → localhost:3000/api)
const http = axios.create({
  baseURL: '/api',
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
  health:     ()       => http.get('/health'),
  studyPlan:  (data)   => http.post('/study-plan', data),
  quiz:       (data)   => http.post('/quiz', data),
  evaluate:   (data)   => http.post('/evaluate', data),
  progress:   ()       => http.get('/progress'),
  chat:       (data)   => http.post('/chat', data),
}
