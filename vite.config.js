import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        proxy: {
            '/api': 'https://english-mastery-website-server.onrender.com'
        }
    }
})

// '/api': 'http://localhost:5000'