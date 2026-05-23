/**
 * ARCHIVO: config.js
 * En mi tesis configuré la persistencia offline de Firebase de forma nativa.
 * 
 * enableMultiTabIndexedDbPersistence permite que el profesor y el estudiante
 * vean los datos cacheados de Firestore (modulos, lecciones) aunque no haya internet. 
 * Las consultas automáticamente se resuelven desde el caché local si la red falla.
 */

import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  getFirestore,
  enableMultiTabIndexedDbPersistence,
  CACHE_SIZE_UNLIMITED,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const apiKey             = import.meta.env.VITE_FIREBASE_API_KEY;
const authDomain         = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
const projectId          = import.meta.env.VITE_FIREBASE_PROJECT_ID;
const storageBucket      = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET;
const messagingSenderId  = import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID;
const appId              = import.meta.env.VITE_FIREBASE_APP_ID;

const PLACEHOLDERS = ['PEGA_TU_API_KEY_AQUI', 'TU_API_KEY', undefined, null, ''];
export const FIREBASE_CONFIGURED = !PLACEHOLDERS.includes(apiKey);

if (!FIREBASE_CONFIGURED) {
  console.warn(
    '[Firebase] Credenciales no configuradas.\n' +
    'La app funcionará en modo OFFLINE usando solo IndexedDB.\n' +
    'Para activar Firebase: edita el archivo .env.local con tus credenciales.'
  );
}

let app     = null;
let auth    = null;
let db      = null;
let storage = null;

if (FIREBASE_CONFIGURED) {
  const firebaseConfig = { apiKey, authDomain, projectId, storageBucket, messagingSenderId, appId };

  // Singleton: evita re-inicializar en Hot Reload de Vite
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

  // Firebase Auth
  auth = getAuth(app);

  // Firestore con persistencia offline multi-tab (IndexedDB)
  // Para la tesis esto es vital: permite que la app siga funcionando sin internet.
  // persistentMultipleTabManager: si abren varias pestañas, comparten el caché.
  // CACHE_SIZE_UNLIMITED: sin límite de tamaño (perfecto para la PWA).
  if (getApps().length <= 1) {
    // initializeFirestore con persistencia nativa (Firestore v9.6+)
    db = initializeFirestore(app, {
      localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager(),
        cacheSizeBytes: CACHE_SIZE_UNLIMITED,
      }),
    });
  } else {
    db = getFirestore(app);
  }

  storage = getStorage(app);
}

export { auth, db, storage };
export default app;
