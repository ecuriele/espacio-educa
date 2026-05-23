/**
 * ARCHIVO: authService.js
 *
 * SOLUCIÓN AL BUG DE SESIÓN FANTASMA (Nota para la tesis):
 *
 * El problema: al iniciar sesión, se lanza una llamada asíncrona a Firestore
 * para traer el perfil. Si el usuario hace logout rápido mientras esa llamada 
 * está pendiente, la llamada terminaba y restauraba la sesión incorrectamente.
 *
 * Mi solución: Usar un contador de "generación de sesión" (_sessionGeneration).
 * Cada logout incrementa el contador. Cuando Firestore responde, verifico si la 
 * generación sigue siendo la misma. Si cambió, descarto la sesión fantasma.
 */

import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { auth, db, FIREBASE_CONFIGURED } from './config';
import { doc, getDoc, setDoc, serverTimestamp, onSnapshot } from 'firebase/firestore';

let _sessionGeneration = 0; // Incrementa en cada logout
let _loggedOut         = false;

export const markLoggedOut   = () => { _loggedOut = true; _sessionGeneration++; };
export const clearLogoutFlag = () => { _loggedOut = false; };
export const wasLoggedOut    = () => _loggedOut;

const googleProvider = FIREBASE_CONFIGURED ? new GoogleAuthProvider() : null;
if (googleProvider) googleProvider.setCustomParameters({ prompt: 'select_account' });

function buildProfileFromFirebaseUser(firebaseUser, nombreMostrarOverride, colegio = '', salon = '') {
  return {
    id:          firebaseUser.uid,
    correo:      firebaseUser.email,
    nombreMostrar: nombreMostrarOverride || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuario',
    avatarUrl:   firebaseUser.photoURL || null,
    rol:         'estudiante', // Por defecto todos son estudiantes
    xp:          0, // Inicializar XP
    colegio:     colegio,
    salon:       salon,
    preferencias: { tema: 'dark', idioma: 'es', tamanoFuenteEditor: 14, notificaciones: true },
    creadoEn:    Date.now(),
    actualizadoEn: Date.now(),
  };
}

function buildLocalProfile(correo, nombreMostrar, colegio = '', salon = '') {
  return {
    id:          `local_${Date.now()}`,
    correo,
    nombreMostrar: nombreMostrar || correo.split('@')[0],
    avatarUrl:   null,
    rol:         'estudiante',
    xp:          0,
    colegio:     colegio,
    salon:       salon,
    preferencias: { tema: 'dark', idioma: 'es', tamanoFuenteEditor: 14, notificaciones: true },
    creadoEn:    Date.now(),
    actualizadoEn: Date.now(),
  };
}

function withTimeout(promise, ms, fallback) {
  return Promise.race([
    promise,
    new Promise((_, r) => setTimeout(() => r(new Error('timeout')), ms)),
  ]).catch((err) => {
    console.warn('[AuthService] Firestore timeout/error:', err.message);
    return fallback;
  });
}

async function getOrCreateUserProfile(firebaseUser, nombreMostrarOverride, colegio = '', salon = '') {
  const fallback = buildProfileFromFirebaseUser(firebaseUser, nombreMostrarOverride, colegio, salon);
  return withTimeout(
    (async () => {
      // Colección en español para la tesis
      const userRef  = doc(db, 'perfiles_usuarios', firebaseUser.uid);
      const snapshot = await getDoc(userRef);
      if (snapshot.exists()) {
        const data = snapshot.data();
        let needsUpdate = false;
        const updates = {};
        
        // Backfill missing critical fields for old or partially created users
        if (data.xp === undefined) { updates.xp = 0; needsUpdate = true; }
        if (!data.rol) { updates.rol = 'estudiante'; needsUpdate = true; }
        if (!data.preferencias) { updates.preferencias = { tema: 'dark', idioma: 'es', tamanoFuenteEditor: 14, notificaciones: true }; needsUpdate = true; }
        
        // Update user info if overrides provided
        if (colegio && data.colegio !== colegio) { updates.colegio = colegio; needsUpdate = true; }
        if (salon && data.salon !== salon) { updates.salon = salon; needsUpdate = true; }
        if (nombreMostrarOverride && data.nombreMostrar !== nombreMostrarOverride) { updates.nombreMostrar = nombreMostrarOverride; needsUpdate = true; }

        if (needsUpdate) {
          await setDoc(userRef, updates, { merge: true });
          Object.assign(data, updates);
        }

        // Siempre inyectar uid e id para que Redux los tenga disponibles
        return { id: firebaseUser.uid, uid: firebaseUser.uid, ...data };
      }

      const newProfile = {
        id:          firebaseUser.uid,
        uid:         firebaseUser.uid,
        correo:      firebaseUser.email,
        nombreMostrar: nombreMostrarOverride || firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuario',
        avatarUrl:   firebaseUser.photoURL || null,
        rol:         'estudiante',
        xp:          0,
        preferencias: { tema: 'dark', idioma: 'es', tamanoFuenteEditor: 14, notificaciones: true },
        creadoEn:    serverTimestamp(),
        actualizadoEn: serverTimestamp(),
      };

      if (colegio) newProfile.colegio = colegio;
      if (salon) newProfile.salon = salon;

      await setDoc(userRef, newProfile, { merge: true });
      return { ...newProfile, colegio: colegio || '', salon: salon || '', creadoEn: Date.now(), actualizadoEn: Date.now() };
    })(),
    5000,
    fallback
  );
}

//  Métodos públicos

export async function signInWithEmail(correo, password) {
  if (!FIREBASE_CONFIGURED) {
    clearLogoutFlag();
    return { firebaseUser: null, userProfile: buildLocalProfile(correo) };
  }
  clearLogoutFlag();
  const credential  = await signInWithEmailAndPassword(auth, correo, password);
  const userProfile = await getOrCreateUserProfile(credential.user);
  return { firebaseUser: credential.user, userProfile };
}

export async function registerWithEmail(correo, password, nombreMostrar, colegio, salon) {
  if (!FIREBASE_CONFIGURED) {
    clearLogoutFlag();
    return { firebaseUser: null, userProfile: buildLocalProfile(correo, nombreMostrar, colegio, salon) };
  }
  clearLogoutFlag();
  const credential = await createUserWithEmailAndPassword(auth, correo, password);
  await updateProfile(credential.user, { displayName: nombreMostrar });
  
  // Update the user document explicitly since onAuthStateChanged might have already created it empty
  const userRef = doc(db, 'perfiles_usuarios', credential.user.uid);
  await setDoc(userRef, {
    nombreMostrar: nombreMostrar || credential.user.displayName || 'Usuario',
    colegio: colegio || '',
    salon: salon || ''
  }, { merge: true });

  const userProfile = await getOrCreateUserProfile(credential.user, nombreMostrar, colegio, salon);
  return { firebaseUser: credential.user, userProfile };
}

export async function signInWithGoogle() {
  if (!FIREBASE_CONFIGURED) throw new Error('El login con Google requiere configurar Firebase.');
  clearLogoutFlag();
  const credential  = await signInWithPopup(auth, googleProvider);
  const userProfile = await getOrCreateUserProfile(credential.user);
  return { firebaseUser: credential.user, userProfile };
}

export async function signOut() {
  markLoggedOut();
  if (!FIREBASE_CONFIGURED) return;
  try { await firebaseSignOut(auth); } catch { /* ignorar */ }
}

export async function resetPassword(correo) {
  if (!FIREBASE_CONFIGURED) return;
  await sendPasswordResetEmail(auth, correo);
}

/**
 * Observer de cambios de Firebase Auth.
 *
 * PROTECCIÓN CONTRA SESIÓN FANTASMA:
 * Usamos _sessionGeneration para detectar si ocurrió un logout mientras
 * una operación async de Firestore estaba pendiente.
 * Si la generación cambió entre el inicio y el final de la operación async,
 * descartamos el resultado — no llamamos al callback con el usuario.
 */
export function subscribeToAuthChanges(callback) {
  if (!FIREBASE_CONFIGURED) {
    setTimeout(() => callback(null), 0);
    return () => {};
  }

  let profileUnsub = null;

  const authUnsub = onAuthStateChanged(auth, async (firebaseUser) => {
    // Capturar la generación actual AL INICIO del handler
    const myGeneration = _sessionGeneration;

    if (profileUnsub) {
      profileUnsub();
      profileUnsub = null;
    }

    // Si el usuario cerró sesión explícitamente → siempre null
    if (_loggedOut) {
      if (firebaseUser) {
        firebaseSignOut(auth).catch(() => {});
      }
      callback(null);
      return;
    }

    if (!firebaseUser) {
      callback(null);
      return;
    }

    // Enriquecer con Firestore ANTES de notificar a Redux para evitar
    // que el router redirija por culpa del rol temporal 'estudiante'.
    try {
      const fullProfile = await getOrCreateUserProfile(firebaseUser);

      // Si la generación cambió mientras esperábamos Firestore,
      // significa que el usuario hizo logout → DESCARTAR el resultado.
      if (_sessionGeneration !== myGeneration || _loggedOut) {
        console.warn('[AuthService] Descartando resultado de Firestore: logout detectado durante la espera.');
        return;
      }

      callback({ firebaseUser, userProfile: fullProfile });

      // Suscribirse a cambios en tiempo real en el perfil
      const userRef = doc(db, 'perfiles_usuarios', firebaseUser.uid);
      profileUnsub = onSnapshot(userRef, (snapshot) => {
        if (_sessionGeneration !== myGeneration || _loggedOut) return;
        if (snapshot.exists()) {
          const updatedProfile = { id: firebaseUser.uid, uid: firebaseUser.uid, ...snapshot.data() };
          callback({ firebaseUser, userProfile: updatedProfile });
        }
      });
    } catch { 
      // Si Firestore falla, caer en gracia con el perfil básico
      const basicProfile = buildProfileFromFirebaseUser(firebaseUser);
      callback({ firebaseUser, userProfile: basicProfile });
    }
  });

  return () => {
    if (profileUnsub) profileUnsub();
    authUnsub();
  };
}
