import { defineConfig } from 'vite';

export default defineConfig({
  base: '/chromecast_stream/', // Required for GitHub Pages deployment
  server: {
    open: true, // Automatically open the app in the browser
    host: true, // Allow access from network devices (for Chromecast testing)
    port: 5173, // Default Vite port
    strictPort: true, // Fail if port is already in use
    watch: {
      usePolling: true, // Improves reliability in some dev environments
    },
  },
});