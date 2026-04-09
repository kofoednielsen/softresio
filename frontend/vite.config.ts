import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    watch: {
      usePolling: true,
    },
    allowedHosts: ["pxh1tn.tunnel.pyjam.as", ".tunnel.pyjam.as"],
    proxy: {
      "/api": {
        target: "http://backend:8000",
        ws: true
      },
      "/favicon.ico": {
        target: "http://backend:8000"
      }
    },
  },
})
