import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Inyecta el Service Worker automáticamente en index.html
      injectRegister: 'auto',
      // Estrategia de caché: generateSW usa Workbox para generar el SW automáticamente
      strategies: 'generateSW',
      workbox: {
        // Caché de activos del build (JS, CSS, HTML, imágenes, fuentes)
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // Tamaño máximo de archivo a cachear (5 MB)
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        // Runtime caching: estrategias para recursos dinámicos
        runtimeCaching: [
          {
            // Cache First para Google Fonts
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // Network First para llamadas a la API — fallback a caché si offline
            urlPattern: /^https:\/\/api\.espacioeduca\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 * 7 },
              cacheableResponse: { statuses: [0, 200] },
              networkTimeoutSeconds: 10,
            },
          },
          {
            // Stale While Revalidate para CDN de librerías (CodeMirror, etc.)
            urlPattern: /^https:\/\/cdn\.jsdelivr\.net\/.*/i,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'cdn-libs-cache' },
          },
          {
            // CacheFirst para archivos de Firebase Storage (PDFs, imágenes)
            // Los PDFs y recursos estáticos se cachean al primer acceso
            urlPattern: /^https:\/\/firebasestorage\.googleapis\.com\/.*\.(pdf|png|jpg|jpeg|svg)/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'firebase-storage-static',
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 30 }, // 30 días
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          {
            // CacheFirst para videos de Firebase Storage con soporte Range Requests.
            // Los Range Requests (HTTP 206) permiten streaming progresivo.
            // Se limita a 10 videos y 7 días para no saturar el dispositivo.
            urlPattern: /^https:\/\/firebasestorage\.googleapis\.com\/.*\.mp4/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'course-videos',
              expiration: {
                maxEntries: 10,                    // Máximo 10 videos en caché
                maxAgeSeconds: 60 * 60 * 24 * 7,  // 7 días
              },
              cacheableResponse: {
                statuses: [0, 200, 206],           // 206 = Partial Content (streaming)
              },
            },
          },
          {
            // NetworkFirst para tokens y APIs de Firebase Auth
            urlPattern: /^https:\/\/(securetoken|identitytoolkit)\.googleapis\.com\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'firebase-auth-cache',
              networkTimeoutSeconds: 5,
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
        // Background Sync para subir evaluaciones y progreso offline
        // Se configura en el SW personalizado (src/sw-custom.js)
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
      },
      manifest: {
        name: 'Espacio Educa',
        short_name: 'EspacioEduca',
        description: 'Plataforma offline-first para aprender programación web',
        theme_color: '#6d28d9',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'any',
        start_url: '/',
        scope: '/',
        lang: 'es',
        icons: [
          { src: '/icons/icon-72x72.png',   sizes: '72x72',   type: 'image/png' },
          { src: '/icons/icon-96x96.png',   sizes: '96x96',   type: 'image/png' },
          { src: '/icons/icon-128x128.png', sizes: '128x128', type: 'image/png' },
          { src: '/icons/icon-144x144.png', sizes: '144x144', type: 'image/png' },
          { src: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
          { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
          { src: '/icons/icon-384x384.png', sizes: '384x384', type: 'image/png' },
          { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
        ],
        categories: ['education', 'productivity'],
        shortcuts: [
          {
            name: 'Editor Sandbox',
            short_name: 'Sandbox',
            description: 'Practica código libremente',
            url: '/sandbox',
            icons: [{ src: '/icons/shortcut-sandbox.png', sizes: '96x96' }],
          },
          {
            name: 'Mis Módulos',
            short_name: 'Módulos',
            description: 'Continúa tu aprendizaje',
            url: '/modules',
            icons: [{ src: '/icons/shortcut-modules.png', sizes: '96x96' }],
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@store': path.resolve(__dirname, './src/store'),
      '@db': path.resolve(__dirname, './src/db'),
      '@services': path.resolve(__dirname, './src/services'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@styles': path.resolve(__dirname, './src/styles'),
    },
  },
  optimizeDeps: {
    // Pre-bundlear CodeMirror para faster dev startup
    include: [
      'codemirror',
      '@codemirror/view',
      '@codemirror/state',
      '@codemirror/lang-html',
      '@codemirror/lang-css',
      '@codemirror/lang-javascript',
    ],
  },
});
