import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '@store/index';
import AppRoot from './AppRoot';
import './styles/index.css';
import { registerSW } from 'virtual:pwa-register';
import { Rocket } from 'lucide-react';

// El auth slice ya NO usa redux-persist (Firebase maneja su propia sesión).
// Borramos persist:auth para que PersistGate no rehydrate isAuthenticated:true.
try {
  localStorage.removeItem('persist:auth');
  localStorage.removeItem('persist:root'); // Limpiar posible configuración vieja
} catch { /* ignorar */ }

const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('Nueva versión de Espacio Educa disponible. ¿Actualizar ahora?')) {
      updateSW(true);
    }
  },
  onOfflineReady() {
    console.log('[PWA] App lista para uso offline ✓');
  },
  onRegistered(r) {
    console.log('[PWA] Service Worker registrado:', r);
  },
  onRegisterError(error) {
    console.error('[PWA] Error al registrar SW:', error);
  },
});

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-surface-dark flex flex-col items-center justify-center gap-4">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#ea5837] to-[#c84223] flex items-center justify-center shadow-brand-lg animate-pulse-ring">
        <Rocket size={32} className="text-white" />
      </div>
      <div className="text-center">
        <p className="text-white font-bold text-xl font-display">Espacio Educa</p>
        <p className="text-slate-400 text-sm mt-1">Verificando sesión...</p>
      </div>
      <div className="flex gap-1.5 mt-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-brand-500 animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={<LoadingScreen />} persistor={persistor}>
        {/*
          AppRoot está dentro del Provider para poder usar hooks de Redux.
          Ahí se monta el observer de Firebase Auth que sincroniza
          Firebase ↔ Redux ↔ IndexedDB automáticamente.
        */}
        <AppRoot />
      </PersistGate>
    </Provider>
  </React.StrictMode>
);
