import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

function apiDevPlugin() {
  return {
    name: 'api-dev-server',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url && req.url.startsWith('/api/scrape-cover')) {
          try {
            const handlerModule = await import('../api/scrape-cover.js');
            const urlObj = new URL(req.url, 'http://localhost');
            const query = Object.fromEntries(urlObj.searchParams.entries());
            const mockReq = { method: req.method, query };
            const mockRes = {
              statusCode: 200,
              status(code) {
                this.statusCode = code;
                res.statusCode = code;
                return this;
              },
              setHeader(name, value) {
                res.setHeader(name, value);
                return this;
              },
              json(data) {
                res.setHeader('Content-Type', 'application/json');
                res.statusCode = this.statusCode || 200;
                res.end(JSON.stringify(data));
                return this;
              },
              end(data) {
                res.end(data);
                return this;
              }
            };
            return handlerModule.default(mockReq, mockRes);
          } catch (err) {
            console.error('Erro no Vite API dev plugin:', err);
            return next();
          }
        }
        next();
      });
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), apiDevPlugin()]
})
