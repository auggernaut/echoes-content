import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
    root: './',
    server: {
        fs: {
            // Allow serving files from one level up (the project root)
            allow: ['..']
        }
    },
    resolve: {
        alias: {
            '@decks': path.resolve(__dirname, '..')
        }
    }
});
