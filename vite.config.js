import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    watch: {
      ignored: ['**/server/**']
    }
  },
  optimizeDeps: {
    exclude: [
      'express',
      '@prisma/client',
      'serverless-http',
      'bcryptjs',
      'cors',
      'dotenv',
      'jsonwebtoken'
    ]
  }
});
