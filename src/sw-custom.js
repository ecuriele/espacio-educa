// Workbox en modo injectManifest inyecta aquí el precacheManifest
// self.__WB_MANIFEST se reemplaza automáticamente en el build
import { precacheAndRoute, cleanupOutdatedCaches, createHandlerBoundToURL } from 'workbox-precaching';
import { registerRoute, NavigationRoute }  from 'workbox-routing';
import { NetworkFirst, CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { BackgroundSyncPlugin } from 'workbox-background-sync';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

precacheAndRoute(self.__WB_MANIFEST || []);
cleanupOutdatedCaches();

registerRoute(
  new NavigationRoute(createHandlerBoundToURL('/index.html'))
);

registerRoute(
  ({ url }) => url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com',
  new CacheFirst({
    cacheName: 'google-fonts',
    plugins: [
      new CacheableResponsePlugin({ statuses: [0, 200] }),
      new ExpirationPlugin({ maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 }),
    ],
  })
);

registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-responses',
    networkTimeoutSeconds: 10,
    plugins: [
      new CacheableResponsePlugin({ statuses: [200] }),
      new ExpirationPlugin({ maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 7 }),
    ],
  })
);


/** Plugin para sincronizar actualizaciones de progreso */
const progressSyncPlugin = new BackgroundSyncPlugin('progress-sync-queue', {
  maxRetentionTime: 7 * 24 * 60,  // Reintentar hasta 7 días
  onSync: async ({ queue }) => {
    let entry;
    while ((entry = await queue.shiftRequest())) {
      try {
        await fetch(entry.request);
        console.log('[SW] Progress sync exitoso:', entry.request.url);
      } catch (err) {
        console.error('[SW] Error sync progreso, volviendo a encolar:', err);
        await queue.unshiftRequest(entry);
        throw err;
      }
    }
  },
});

/** Plugin para sincronizar entregas de evaluaciones */
const submissionSyncPlugin = new BackgroundSyncPlugin('submissions-sync-queue', {
  maxRetentionTime: 14 * 24 * 60,  // 14 días — evaluaciones son más críticas
});

// Registrar rutas de API con Background Sync
registerRoute(
  ({ url, request }) => url.pathname.startsWith('/api/progress') && request.method !== 'GET',
  new NetworkFirst({ plugins: [progressSyncPlugin] }),
  'POST'
);

registerRoute(
  ({ url, request }) => url.pathname.startsWith('/api/submissions') && request.method !== 'GET',
  new NetworkFirst({ plugins: [submissionSyncPlugin] }),
  'POST'
);

self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};
  const options = {
    body: data.body || 'Tienes una nueva notificación',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: data.tag || 'espacio-educa-notification',
    renotify: true,
    actions: data.actions || [],
    data: data.url ? { url: data.url } : {},
  };
  event.waitUntil(
    self.registration.showNotification(data.title || 'Espacio Educa', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((windowClients) => {
      const existingWindow = windowClients.find((c) => c.url === url && 'focus' in c);
      return existingWindow ? existingWindow.focus() : clients.openWindow(url);
    })
  );
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('[SW] Espacio Educa Service Worker activado ✓');
