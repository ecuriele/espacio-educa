/**
 * store/index.js — Redux Toolkit + redux-persist con IndexedDB
 *
 * Configuración:
 * - Persistencia en localStorage para el estado de sesión auth
 * - Estado de UI (tema, sidebar) no se persiste entre sesiones
 * - El progreso detallado vive en IndexedDB (via modelos), Redux solo guarda resúmenes
 */

import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import storage from 'redux-persist/lib/storage'; // localStorage

import authReducer     from './slices/authSlice';
import uiReducer       from './slices/uiSlice';
import progressReducer from './slices/progressSlice';
import gamificationReducer from './slices/gamificationSlice';
import coursesReducer  from './slices/coursesSlice';
import syncReducer     from './slices/syncSlice';

// NOTA: El auth slice NO se persiste con redux-persist.
// Firebase Auth ya maneja su propia persistencia de sesión de forma nativa
// (guarda el token en IndexedDB del navegador automáticamente).
// Si persistiéramos isAuthenticated en localStorage, habría conflictos
// al hacer logout: redux-persist restauraría isAuthenticated:true
// aunque Firebase ya hubiera cerrado la sesión.

const progressPersistConfig = {
  key: 'progress',
  storage,
  // Solo persistir resúmenes, no el detalle completo (eso está en IndexedDB)
  whitelist: ['summary', 'totalXp', 'currentRank'],
};

const gamificationPersistConfig = {
  key: 'gamification',
  storage,
  whitelist: ['streak', 'badges', 'rank', 'pendingNotifications', 'totalXp'],
};

const rootReducer = combineReducers({
  auth:         authReducer,           // NO persiste — Firebase maneja su propia sesión
  ui:           uiReducer,             // NO persiste — se recalcula en mount
  progress:     persistReducer(progressPersistConfig, progressReducer),
  gamification: persistReducer(gamificationPersistConfig, gamificationReducer),
  courses:      coursesReducer,
  sync:         syncReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // redux-persist dispara acciones no serializables; las ignoramos
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
  devTools: import.meta.env.DEV,
});

export const persistor = persistStore(store);

export default store;
