import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import {defineConfig} from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig(() => {
  return {
    base：'/good-food-time-XinZhuang/',
    plugins: [
      react(),
      tailwindcss(),
      viteSingleFile(),
      {
        name: 'copy-to-root',
        closeBundle() {
          try {
            const srcPath = path.resolve(__dirname, 'dist/index.html');
            const destPath = path.resolve(__dirname, '新莊廟街虛擬遊戲_單一網頁.html');
            if (fs.existsSync(srcPath)) {
              let htmlContent = fs.readFileSync(srcPath, 'utf8');
              
              // Replace <script type="module" crossorigin> or <script type="module"> with classic <script> tag for file:// support
              // Since format is now 'iife', it contains classic JS with no top-level ESM syntax, which fits inside standard script tags.
              htmlContent = htmlContent.replace(/<script\s+type="module"\s+crossorigin\s*>/g, '<script>');
              htmlContent = htmlContent.replace(/<script\s+type="module"\s*>/g, '<script>');
              
              // Remove modulepreload code snippet or modulepreload links that can block file:// rendering
              htmlContent = htmlContent.replace(/<link\s+rel="modulepreload"\s+href="[^"]*"\s*\/?>/g, '');
              
              fs.writeFileSync(destPath, htmlContent);
              console.log('Successfully copied single file HTML to root and patched classic script tag for file:// local access!');
            }
          } catch (err) {
            console.error('Error copying single HTML file to root:', err);
          }
        }
      }
    ],
    build: {
      minify: true,
      cssCodeSplit: false,
      rollupOptions: {
        output: {
          format: 'iife',
          entryFileNames: 'assets/[name].js',
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
