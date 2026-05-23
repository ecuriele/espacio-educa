/**
 * hooks/useAuthObserver.js
 * Observador único de Firebase Auth. Se monta una sola vez en AppRoot.
 *
 * Reglas de la sesión:
 *  1. Si wasLoggedOut() → ignorar SIEMPRE cualquier sesión (logout explícito)
 *  2. Si Firebase tiene usuario con datos válidos → autenticar en Redux + IndexedDB
 *  3. Si Firebase devuelve null + sin internet → intentar IndexedDB (modo offline)
 *  4. En cualquier otro caso → limpiar estado e ir al login
 */

import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { subscribeToAuthChanges, wasLoggedOut } from '@services/firebase/authService';
import { FIREBASE_CONFIGURED } from '@services/firebase/config';
import { UserModel } from '@db/models';
import {
  setAuthenticatedUser,
  clearAuthState,
  setAuthLoading,
} from '@store/slices/authSlice';

/** Verifica que el perfil de usuario tenga los datos mínimos necesarios */
function isValidProfile(profile) {
  return profile && profile.id && (profile.email || profile.correo);
}

/** Garantiza que nombreMostrar nunca sea vacío */
function sanitizeProfile(profile) {
  const correo = profile.correo || profile.email;
  return {
    ...profile,
    correo:        correo,
    nombreMostrar: profile.nombreMostrar || profile.displayName || correo?.split('@')[0] || 'Usuario',
    rol:           profile.rol || profile.role || 'student',
    xp:            profile.xp || 0,
    colegio:       profile.colegio || null,
    salon:         profile.salon || null,
    preferencias:  profile.preferencias || profile.preferences || { theme: 'dark', language: 'es', editorFontSize: 14, notifications: true },
  };
}

export default function useAuthObserver() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setAuthLoading());
    let isFirstCall = true;

    const unsubscribe = subscribeToAuthChanges(async (authData) => {
      const first = isFirstCall;
      isFirstCall = false;

      // La bandera _loggedOut en authService indica que el usuario
      // cerró sesión manualmente. Ignoramos cualquier sesión de Firebase.
      if (wasLoggedOut()) {
        dispatch(clearAuthState());
        return;
      }

      if (authData && isValidProfile(authData.userProfile)) {
        const profile = sanitizeProfile(authData.userProfile);

        // Persistir en IndexedDB para futuro arranque offline
        try {
          await UserModel.create({
            id:            profile.id,
            correo:        profile.correo,
            nombreMostrar: profile.nombreMostrar,
            avatarUrl:     profile.avatarUrl,
            rol:           profile.rol,
            colegio:       profile.colegio,
            salon:         profile.salon,
            preferencias:  profile.preferencias,
          });
        } catch (err) {
          console.warn('[useAuthObserver] IndexedDB:', err.message);
        }

        dispatch(setAuthenticatedUser({
          user: {
            id:            profile.id,
            correo:        profile.correo,
            nombreMostrar: profile.nombreMostrar,
            avatarUrl:     profile.avatarUrl  || null,
            rol:           profile.rol,
            xp:            profile.xp,
            colegio:       profile.colegio,
            salon:         profile.salon,
            preferencias:  profile.preferencias,
          },
          sessionMode: navigator.onLine ? 'online' : 'offline',
        }));
        return;
      }

      // Solo intentamos IndexedDB si: es la primera llamada del observer
      // Y no hay internet (el SDK no pudo verificar la sesión en el servidor)
      if (first && !navigator.onLine && FIREBASE_CONFIGURED) {
        try {
          const { getDB, STORES } = await import('@db/schema');
          const idb = await getDB();
          const users = await idb.getAll(STORES.USERS);
          const local = users.find((u) => isValidProfile(u));

          if (local) {
            dispatch(setAuthenticatedUser({
              user: sanitizeProfile(local),
              sessionMode: 'offline',
            }));
            return;
          }
        } catch { /* ignorar */ }
      }

      // Limpiar IndexedDB de sesiones antiguas
      try {
        const { getDB, STORES } = await import('@db/schema');
        const idb = await getDB();
        await idb.clear(STORES.USERS);
      } catch { /* ignorar */ }

      dispatch(clearAuthState());
    });

    return () => unsubscribe();
  }, [dispatch]);
}
