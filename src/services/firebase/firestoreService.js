/**
 * ARCHIVO: firestoreService.js
 * 
 * Para mi tesis, decidí usar Firebase Firestore como la base de datos principal en la nube.
 * Este archivo centraliza todas las consultas (CRUD) y las suscripciones en tiempo real.
 * Si el colegio se queda sin internet, Firestore tiene un caché local que permite 
 * que la app siga funcionando de forma transparente (offline-first).
 * 
 * Colecciones usadas: modulos, lecciones, entregas, progreso_estudiantes.
 */

import { db } from './config';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  writeBatch,
  getDocsFromCache,
  getDocFromCache,
  increment as firestoreIncrement,
  getCountFromServer,
} from 'firebase/firestore';

// FUNCIONES AUXILIARES

/**
 * Convierte el resultado de Firestore (QuerySnapshot) en un array normal de JavaScript.
 * Le inyecto el ID del documento porque Firestore lo trae separado de los datos.
 */
const snapshotToArray = (snapshot) =>
  snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

export async function deleteAllCurriculumData() {
  const collectionsToClear = ['modulos', 'lecciones', 'entregas'];
  for (const colName of collectionsToClear) {
    const q = query(collection(db, colName));
    const snapshot = await getDocs(q);
    let batch = writeBatch(db);
    let count = 0;
    for (const document of snapshot.docs) {
      batch.delete(doc(db, colName, document.id));
      count++;
      if (count === 400) {
        await batch.commit();
        batch = writeBatch(db);
        count = 0;
      }
    }
    if (count > 0) await batch.commit();
  }
}

// MÓDULOS (colección: 'modulos')

export async function getModulos() {
  const q = query(collection(db, 'modulos'), orderBy('order'));
  try {
    const snapshot = await getDocs(q);
    return snapshotToArray(snapshot);
  } catch (networkErr) {
    console.warn('[firestoreService] getModulos – sin conexión, usando caché:', networkErr.message);
    try {
      const cached = await getDocsFromCache(q);
      return snapshotToArray(cached);
    } catch (cacheErr) {
      console.error('[firestoreService] getModulos – caché vacío:', cacheErr.message);
      return [];
    }
  }
}

export async function getModulo(moduloId) {
  const ref = doc(db, 'modulos', moduloId);
  try {
    const snapshot = await getDoc(ref);
    if (!snapshot.exists()) return null;
    return { id: snapshot.id, ...snapshot.data() };
  } catch (networkErr) {
    console.warn('[firestoreService] getModulo – sin conexión, usando caché:', networkErr.message);
    try {
      const cached = await getDocFromCache(ref);
      if (!cached.exists()) return null;
      return { id: cached.id, ...cached.data() };
    } catch (cacheErr) {
      console.error('[firestoreService] getModulo – caché vacío:', cacheErr.message);
      return null;
    }
  }
}

export async function createModulo(data) {
  const ref = await addDoc(collection(db, 'modulos'), {
    ...data,
    publicado: false,
    creadoEn: serverTimestamp(),
    actualizadoEn: serverTimestamp(),
  });
  return ref.id;
}

export async function updateModulo(moduloId, data) {
  const ref = doc(db, 'modulos', moduloId);
  await updateDoc(ref, {
    ...data,
    actualizadoEn: serverTimestamp(),
  });
}

export async function deleteModulo(moduloId) {
  await deleteDoc(doc(db, 'modulos', moduloId));
}

export function subscribeToModulos(callback) {
  const q = query(collection(db, 'modulos'), orderBy('order'));
  return onSnapshot(q, (snapshot) => {
    callback(snapshotToArray(snapshot));
  }, (err) => {
    console.error('[firestoreService] Error en subscribeToModulos:', err);
  });
}

// LECCIONES (colección: 'lecciones')

export async function getLeccionesByModulo(moduloId) {
  const q = query(
    collection(db, 'lecciones'),
    where('moduloId', '==', moduloId)
  );

  try {
    const snapshot = await getDocs(q);
    const results = snapshotToArray(snapshot);
    // Ordenar en memoria para evitar errores de índices compuestos en Firebase
    return results.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  } catch (networkErr) {
    console.warn('[firestoreService] getLeccionesByModulo - offline fallback:', networkErr.message);
    try {
      const cached = await getDocsFromCache(q);
      const results = snapshotToArray(cached);
      return results.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    } catch (cacheErr) {
      console.error('[firestoreService] getLeccionesByModulo - caché miss:', cacheErr.message);
      return [];
    }
  }
}

export async function getLeccion(leccionId) {
  const ref = doc(db, 'lecciones', leccionId);
  try {
    const snapshot = await getDoc(ref);
    if (!snapshot.exists()) return null;
    return { id: snapshot.id, ...snapshot.data() };
  } catch (networkErr) {
    console.warn('[firestoreService] getLeccion – offline fallback:', networkErr.message);
    try {
      const cached = await getDocFromCache(ref);
      if (!cached.exists()) return null;
      return { id: cached.id, ...cached.data() };
    } catch (cacheErr) {
      console.error('[firestoreService] getLeccion – caché miss:', cacheErr.message);
      return null;
    }
  }
}

export async function createLeccion(moduloId, data) {
  const ref = await addDoc(collection(db, 'lecciones'), {
    ...data,
    moduloId,
    publicado: false,
    creadoEn: serverTimestamp(),
    actualizadoEn: serverTimestamp(),
  });
  return ref.id;
}

export async function updateLeccion(leccionId, data) {
  const ref = doc(db, 'lecciones', leccionId);
  await updateDoc(ref, {
    ...data,
    actualizadoEn: serverTimestamp(),
  });
}

export async function deleteLeccion(leccionId) {
  await deleteDoc(doc(db, 'lecciones', leccionId));
}

// ENTREGAS (colección: 'entregas')

export async function getEntregas(filtros = {}) {
  const constraints = [orderBy('enviadoEn', 'desc')];
  if (filtros.estado) constraints.unshift(where('estado', '==', filtros.estado));
  if (filtros.moduloId) constraints.unshift(where('moduloId', '==', filtros.moduloId));

  const q = query(collection(db, 'entregas'), ...constraints);
  try {
    const snapshot = await getDocs(q);
    return snapshotToArray(snapshot);
  } catch (networkErr) {
    console.warn('[firestoreService] getEntregas – offline fallback:', networkErr.message);
    try {
      const cached = await getDocsFromCache(q);
      return snapshotToArray(cached);
    } catch (cacheErr) {
      console.error('[firestoreService] getEntregas – caché miss:', cacheErr.message);
      return [];
    }
  }
}

export function subscribeToEntregas(callback) {
  const q = query(
    collection(db, 'entregas'),
    orderBy('enviadoEn', 'desc'),
  );
  return onSnapshot(q, (snapshot) => {
    callback(snapshotToArray(snapshot));
  }, (err) => {
    console.error('[firestoreService] Error en subscribeToEntregas:', err);
  });
}

export async function reviewEntrega(entregaId, { calificacion, retroalimentacion, revisadoPor }) {
  const ref = doc(db, 'entregas', entregaId);
  await updateDoc(ref, {
    estado: 'revisado',
    calificacion,
    retroalimentacion: retroalimentacion ?? '',
    revisadoPor,
    revisadoEn: serverTimestamp(),
  });
}

export async function addEntrega(data) {
  const ref = await addDoc(collection(db, 'entregas'), {
    ...data,
    estado: 'pendiente',
    enviadoEn: serverTimestamp(),
  });
  return ref.id;
}

// PROGRESO DE ESTUDIANTES (colección: 'progreso_estudiantes')

export async function getProgresoEstudiante(estudianteId) {
  const ref = doc(db, 'progreso_estudiantes', estudianteId);
  try {
    const snapshot = await getDoc(ref);
    if (!snapshot.exists()) return null;
    return { id: snapshot.id, ...snapshot.data() };
  } catch (networkErr) {
    console.warn('[firestoreService] getProgresoEstudiante – offline fallback:', networkErr.message);
    try {
      const cached = await getDocFromCache(ref);
      if (!cached.exists()) return null;
      return { id: cached.id, ...cached.data() };
    } catch (cacheErr) {
      console.error('[firestoreService] getProgresoEstudiante – caché miss:', cacheErr.message);
      return null;
    }
  }
}

export async function getAllProgresoEstudiantes() {
  const col = collection(db, 'progreso_estudiantes');
  try {
    const snapshot = await getDocs(col);
    return snapshotToArray(snapshot);
  } catch (networkErr) {
    console.warn('[firestoreService] getAllProgresoEstudiantes – offline fallback:', networkErr.message);
    try {
      const cached = await getDocsFromCache(col);
      return snapshotToArray(cached);
    } catch (cacheErr) {
      console.error('[firestoreService] getAllProgresoEstudiantes – caché miss:', cacheErr.message);
      return [];
    }
  }
}

export async function upsertProgresoEstudiante(estudianteId, data) {
  const ref = doc(db, 'progreso_estudiantes', estudianteId);
  await setDoc(ref, {
    ...data,
    actualizadoEn: serverTimestamp(),
  }, { merge: true });
}

export function subscribeToAllProgresoEstudiantes(callback) {
  const col = collection(db, 'perfiles_usuarios');
  const q = query(col, where('rol', '==', 'estudiante'));
  return onSnapshot(q, (snapshot) => {
    callback(snapshotToArray(snapshot));
  }, (err) => {
    console.error('[firestoreService] Error en subscribeToAllProgresoEstudiantes:', err);
  });
}

// UTILIDADES PARA ESTADÍSTICAS (puro cálculo de tesis, no toca Firebase)

/**
 * Con esta función calculo si un alumno está usando la plataforma, 
 * en riesgo de abandono o desconectado, basado en su última sincronización.
 */
export function computeEstadoEstudiante(progreso) {
  const syncField = progreso?.lastSyncAt || progreso?.ultimaSincronizacionEn || progreso?.actualizadoEn || progreso?.creadoEn;
  if (!syncField) return 'desconectado';

  const lastSync = typeof syncField.toDate === 'function' ? syncField.toDate() : new Date(syncField);

  const diffMs = Date.now() - lastSync.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  if (diffDays <= 2) return 'activo';
  if (diffDays <= 7) return 'en_riesgo';
  return 'desconectado';
}

export function computePorcentajeCompletitud(progreso, totalLecciones) {
  if (!totalLecciones || totalLecciones <= 0) return 0;
  const completadas = progreso?.leccionesCompletadas?.length ?? 0;
  return Math.min(100, Math.round((completadas / totalLecciones) * 100));
}


/**
 * Obtener la tabla de posiciones global ordenada por XP.
 */
export async function getLeaderboard(salonQuery = 'all', limitCount = 50) {
  const q = query(
    collection(db, 'perfiles_usuarios'),
    where('rol', '==', 'estudiante')
  );
  try {
    const snapshot = await getDocs(q);
    let arr = snapshotToArray(snapshot);
    if (salonQuery !== 'all') {
      arr = arr.filter(u => (u.salon || 'basico').toLowerCase() === salonQuery.toLowerCase());
    }
    arr = arr.map(u => ({ ...u, xp: u.xp || 0 })).sort((a, b) => b.xp - a.xp);
    return arr.slice(0, limitCount);
  } catch (err) {
    console.error('[firestoreService] getLeaderboard error:', err.message);
    try {
      const cached = await getDocsFromCache(q);
      let arr = snapshotToArray(cached);
      if (salonQuery !== 'all') {
        arr = arr.filter(u => (u.salon || 'basico').toLowerCase() === salonQuery.toLowerCase());
      }
      arr = arr.map(u => ({ ...u, xp: u.xp || 0 })).sort((a, b) => b.xp - a.xp);
      return arr.slice(0, limitCount);
    } catch (cacheErr) {
      return [];
    }
  }
}

/**
 * Actualizar el XP de un estudiante en su perfil.
 */
export async function updateUserXp(userId, newXp) {
  try {
    const userRef = doc(db, 'perfiles_usuarios', userId);
    await updateDoc(userRef, {
      xp: newXp,
      actualizadoEn: serverTimestamp()
    });
  } catch (err) {
    console.error('[firestoreService] updateUserXp error:', err.message);
  }
}

// ENTREGAS DE POPCODES (colección: 'entregas')

/**
 * Guarda la entrega de un Popcode por un estudiante.
 * Cada entrega es un documento único por (estudianteId + leccionId + popcodeIndex).
 * Si el alumno re-entrega sobreescribe la entrega anterior.
 */
export async function crearEntrega({ estudianteId, estudianteNombre, leccionId, leccionTitulo, moduloId, popcodeIndex, popcodeTitulo, htmlCode, cssCode, jsCode }) {
  // ID determinístico para poder re-entregar sin duplicar
  const entregaId = `${estudianteId}_${leccionId}_${popcodeIndex}`;
  const ref = doc(db, 'entregas', entregaId);

  const snap = await getDoc(ref);
  if (snap.exists()) {
    await updateDoc(ref, {
      htmlCode,
      cssCode,
      jsCode,
      revisado: false,
      calificacion: null,
      comentarioProfesor: '',
      actualizadoEn: serverTimestamp(),
      ediciones: firestoreIncrement(1)
    });
  } else {
    await setDoc(ref, {
      estudianteId,
      estudianteNombre,
      leccionId,
      leccionTitulo,
      moduloId,
      popcodeIndex,
      popcodeTitulo,
      htmlCode,
      cssCode,
      jsCode,
      revisado: false,
      calificacion: null,
      comentarioProfesor: '',
      entregadoEn: serverTimestamp(),
      ediciones: 0,
      tipo: 'popcode'
    }, { merge: false });
  }
  
  return entregaId;
}

export async function getUserSubmissionCount(userId) {
  let total = 0;
  try {
    const q1 = query(collection(db, 'entregas'), where('estudianteId', '==', userId));
    const snap1 = await getCountFromServer(q1);
    total += snap1.data().count;
    
    // Check legacy collection just in case
    const q2 = query(collection(db, 'submissions'), where('studentId', '==', userId));
    const snap2 = await getCountFromServer(q2);
    total += snap2.data().count;
  } catch (err) {
    console.warn('Error getting submission count:', err);
  }
  return total;
}

export async function getUserHighestGrade(userId) {
  let highest = 0;
  try {
    const q = query(collection(db, 'entregas'), where('estudianteId', '==', userId));
    const snap = await getDocs(q);
    snap.forEach(doc => {
      const calificacion = Number(doc.data().calificacion) || 0;
      if (calificacion > highest) highest = calificacion;
    });
  } catch (err) {
    console.warn('Error getting highest grade:', err);
  }
  return highest;
}

/**
 * Obtiene todas las entregas de una lección para el panel del profesor.
 */
export async function getEntregasByLeccion(leccionId) {
  const q = query(
    collection(db, 'entregas'),
    where('leccionId', '==', leccionId),
    orderBy('entregadoEn', 'desc')
  );
  try {
    const snapshot = await getDocs(q);
    return snapshotToArray(snapshot);
  } catch (err) {
    console.error('[firestoreService] getEntregasByLeccion error:', err.message);
    return [];
  }
}

/**
 * Obtiene todas las entregas de un estudiante (para su perfil).
 */
export async function getEntregasByEstudiante(estudianteId) {
  const q = query(
    collection(db, 'entregas'),
    where('estudianteId', '==', estudianteId),
    orderBy('entregadoEn', 'desc')
  );
  try {
    const snapshot = await getDocs(q);
    return snapshotToArray(snapshot);
  } catch (err) {
    console.error('[firestoreService] getEntregasByEstudiante error:', err.message);
    return [];
  }
}

/**
 * Suscripción en tiempo real a entregas de una lección (para el panel del profesor).
 */
export function subscribeEntregasByLeccion(leccionId, callback) {
  const q = query(
    collection(db, 'entregas'),
    where('leccionId', '==', leccionId),
    orderBy('entregadoEn', 'desc')
  );
  return onSnapshot(q, (snapshot) => callback(snapshotToArray(snapshot)));
}

/**
 * El profesor marca una entrega como revisada y puede dejar calificación/comentario.
 */
export async function revisarEntrega(entregaId, { calificacion, comentarioProfesor }) {
  const ref = doc(db, 'entregas', entregaId);
  await updateDoc(ref, {
    revisado: true,
    calificacion,
    comentarioProfesor,
    revisadoEn: serverTimestamp(),
  });
}

/**
 * Incrementa el XP de un estudiante de forma atómica usando FieldValue.increment.
 * Más seguro que updateUserXp ya que no necesita leer el valor actual.
 */
export async function incrementUserXp(userId, xpToAdd) {
  if (!userId || !xpToAdd || xpToAdd <= 0) return;
  try {
    const userRef = doc(db, 'perfiles_usuarios', userId);
    await updateDoc(userRef, {
      xp: firestoreIncrement(xpToAdd),
      actualizadoEn: serverTimestamp(),
    });
  } catch (err) {
    console.error('[firestoreService] incrementUserXp error:', err.message);
  }
}

/**
 * Para la vista de módulos: obtiene las leccionIds únicas de entregas del estudiante
 * agrupadas por moduloId. Sirve para calcular el progreso real de participación.
 * Retorna: { [moduloId]: Set<leccionId> }
 */
export async function getProgresoPorModulo(estudianteId) {
  if (!estudianteId) return {};
  const q = query(
    collection(db, 'entregas'),
    where('estudianteId', '==', estudianteId)
  );
  try {
    const snapshot = await getDocs(q);
    const progreso = {};
    snapshot.docs.forEach((d) => {
      const { moduloId, leccionId, popcodeIndex } = d.data();
      if (!moduloId || !leccionId) return;
      if (!progreso[moduloId]) progreso[moduloId] = new Set();
      // Contar cada Popcode como una entrega única en este módulo
      progreso[moduloId].add(`${leccionId}_${popcodeIndex ?? 0}`);
    });
    // Convertir Set → número (count)
    const result = {};
    Object.entries(progreso).forEach(([mid, set]) => {
      result[mid] = set.size;
    });
    return result;
  } catch (err) {
    console.error('[firestoreService] getProgresoPorModulo error:', err.message);
    return {};
  }
}

/**
 * Actualiza el rol de un usuario en su perfil (ej. de estudiante a profesor)
 */
export async function updateUserRole(userId, newRole) {
  try {
    const userRef = doc(db, 'perfiles_usuarios', userId);
    await updateDoc(userRef, { rol: newRole });
  } catch (error) {
    console.error('[firestoreService] Error actualizando rol:', error);
    throw error;
  }
}

export { writeBatch };
