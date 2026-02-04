import { defineConfig } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('[Card Studio Config] Loading from:', __dirname);

export default defineConfig({
    root: './',
    plugins: [
        {
            name: 'card-studio-api',
            configureServer(server) {
                server.middlewares.use((req, res, next) => {
                    // Test endpoint
                    if (req.url.startsWith('/api/ping')) {
                        console.log('[Card Studio API] Ping received');
                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify({ message: 'pong' }));
                        return;
                    }

                    // List snapshots
                    if (req.url.startsWith('/api/snapshots') && req.method === 'GET') {
                        const exportsDir = path.resolve(__dirname, 'exports');
                        if (!fs.existsSync(exportsDir)) {
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.end(JSON.stringify([]));
                            return;
                        }
                        const files = fs.readdirSync(exportsDir)
                            .filter(f => f.endsWith('.html'))
                            .sort((a, b) => fs.statSync(path.join(exportsDir, b)).mtimeMs - fs.statSync(path.join(exportsDir, a)).mtimeMs);

                        res.statusCode = 200;
                        res.setHeader('Content-Type', 'application/json');
                        res.end(JSON.stringify(files));
                        return;
                    }

                    if (req.url.startsWith('/api/save-snapshot') && req.method === 'POST') {
                        console.log('[Card Studio API] Handling save-snapshot...');
                        let body = '';
                        req.on('data', chunk => { body += chunk.toString(); });
                        req.on('end', () => {
                            res.setHeader('Content-Type', 'application/json');
                            try {
                                if (!body) throw new Error('Empty request body');
                                const { filename, content } = JSON.parse(body);
                                const exportsDir = path.resolve(__dirname, 'exports');
                                if (!fs.existsSync(exportsDir)) {
                                    fs.mkdirSync(exportsDir);
                                }
                                const filePath = path.join(exportsDir, filename);
                                fs.writeFileSync(filePath, content);
                                console.log(`[Card Studio API] Snapshot saved: ${filename}`);
                                res.statusCode = 200;
                                res.end(JSON.stringify({ message: `Saved to ${filename}` }));
                            } catch (err) {
                                console.error('[Card Studio API] Error:', err.message);
                                res.statusCode = 500;
                                res.end(JSON.stringify({ error: err.message }));
                            }
                        });
                        return;
                    }
                    next();
                });
            }
        }
    ],
    server: {
        fs: {
            allow: ['..']
        }
    },
    resolve: {
        alias: {
            '@decks': path.resolve(__dirname, '..')
        }
    }
});
