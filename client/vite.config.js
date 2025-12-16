import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        port: 3001,
    },
    resolve: {
        alias: {
            '@mui/styled-engine': '@mui/styled-engine-sc',
            components: path.resolve(__dirname, 'src/components'),
            pages: path.resolve(__dirname, 'src/pages'),
            utils: path.resolve(__dirname, 'src/utils'),
            hooks: path.resolve(__dirname, 'src/hooks'),
            store: path.resolve(__dirname, 'src/store'),
            styles: path.resolve(__dirname, 'src/styles'),
        },
    },
    esbuild: {
        loader: 'jsx',
        include: /src\/.*\.jsx?$/,
        exclude: [],
    },
    optimizeDeps: {
        esbuildOptions: {
            loader: {
                '.js': 'jsx',
            },
        },
    },
});
