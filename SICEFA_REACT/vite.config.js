import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const puertoDeLaApi = process.env.PUERTO || 3001
const puertoDeReact = Number(process.env.PUERTO_CLIENTE || 5173)

const reenviarALaApi = { '/api': `http://127.0.0.1:${puertoDeLaApi}` }

export default defineConfig({
  plugins: [react()],
  server: { host: '127.0.0.1', port: puertoDeReact, strictPort: true, proxy: reenviarALaApi },
  preview: { host: '127.0.0.1', port: 4173, proxy: reenviarALaApi },
})
