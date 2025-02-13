// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'

// // https://vitejs.dev/config/
// export default defineConfig({
//   plugins: [react()],
// })

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Proxy for attendance API
      '/api/attendance': {
        target: 'http://localhost:8080', // Attendance API backend
        changeOrigin: true, // Handles CORS issues
        // rewrite: (path) => path.replace(/^\/api\/attendance/, '/api'), // Adjust if the backend does not use /api/attendance
      },
      // Proxy for leave API
      '/api/employees': {
        target: 'http://localhost:8082', // Leave API backend
        changeOrigin: true, // Handles CORS issues
        // rewrite: (path) => path.replace(/^\/api\/leave/, '/api'), // Adjust if the backend does not use /api/leave
      },
      '/api/admin': {
        target: 'http://localhost:8082', // Leave API backend
        changeOrigin: true, // Handles CORS issues
        // rewrite: (path) => path.replace(/^\/api\/leave/, '/api'), // Adjust if the backend does not use /api/leave
      },
    },
  },
})
