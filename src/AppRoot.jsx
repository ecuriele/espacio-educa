import React, { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import useAuthObserver from '@hooks/useAuthObserver';
import router from './router';

// Limpiar cualquier auth persistida por versiones anteriores de redux-persist.
// Antes el slice de auth se guardaba en localStorage; ahora solo Firebase maneja
// la sesión nativamente. Sin este cleanup, la app restauraría isAuthenticated:true
// desde localStorage aunque Firebase diga que no hay sesión.
(function cleanLegacyAuthPersist() {
  try {
    const keys = Object.keys(localStorage).filter(
      (k) => k === 'persist:auth' || k.startsWith('persist:auth')
    );
    keys.forEach((k) => localStorage.removeItem(k));
  } catch { /* ignorar si localStorage no está disponible */ }
})();

export default function AppRoot() {
  // Monta el listener de Firebase Auth una sola vez para toda la app.
  // Este hook sincroniza automáticamente Firebase ↔ Redux ↔ IndexedDB.
  useAuthObserver();

  return <RouterProvider router={router} />;
}
