/**
 * ARCHIVO: schema.js
 * 
 * Para mi tesis, uno de los retos más grandes fue lograr que la aplicación funcione
 * sin internet (offline-first). Decidí usar IndexedDB en el navegador para guardar
 * todos los datos localmente. Así, si el colegio se queda sin conexión, el alumno
 * puede seguir programando y viendo las lecciones.
 * 
 * Aquí defino la estructura de esa base de datos local. He separado la información
 * en diferentes "tablas" (Object Stores) como usuarios, módulos, lecciones, etc.
 * 
 * Object Stores:
 * - usuarios: Guarda el token y preferencias para mantener la sesión abierta.
 * - modulos: Descarga el pensum para leerlo sin conexión.
 * - lecciones: Guarda el contenido de la clase.
 * - progreso: Rastrea qué ha completado el alumno.
 * - logros: Medallas que gana el estudiante.
 * - retos: Ejercicios extra.
 * - rachas: Días consecutivos que el alumno entra a la app.
 * - proyectosSandbox: Código que el estudiante hace libremente.
 * - colaSincronizacion: Si no hay internet, las tareas se guardan aquí y se envían después.
 * - enlacesGithub: Repositorios vinculados.
 */

import { openDB } from 'idb';

/** Nombre y versión de la BD local. Le cambié la versión a 2 para evitar choques con pruebas anteriores de la tesis. */
export const DB_NAME    = 'espacio-educa-db-v2';
export const DB_VERSION = 2;

export const STORES = {
  USUARIOS:           'usuarios',
  MODULOS:            'modulos',
  LECCIONES:          'lecciones',
  PROGRESO:           'progreso',
  LOGROS:             'logros',
  RETOS:              'retos',
  RACHAS:             'rachas',
  SANDBOX:            'proyectosSandbox',
  COLA_SYNC:          'colaSincronizacion',
  ENLACES_GITHUB:     'enlacesGithub',
};

export async function openEspacioEducaDB() {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db, oldVersion, newVersion, transaction) {
      console.log(`[DB] Upgrading from v${oldVersion} → v${newVersion}`);

      // Guardamos la info del usuario. Usé el ID de Firebase como llave primaria.
      if (!db.objectStoreNames.contains(STORES.USUARIOS)) {
        const userStore = db.createObjectStore(STORES.USUARIOS, { keyPath: 'id' });
        userStore.createIndex('correo', 'correo', { unique: true });
        userStore.createIndex('rol',  'rol',  { unique: false });
        // rol: 'estudiante' | 'profesor' | 'admin'
      }

      // El pensum se descarga aquí para cuando se vaya el internet.
      if (!db.objectStoreNames.contains(STORES.MODULOS)) {
        const moduleStore = db.createObjectStore(STORES.MODULOS, { keyPath: 'id' });
        moduleStore.createIndex('nivel', 'nivel', { unique: false }); // 'basico' | 'avanzado'
        moduleStore.createIndex('orden', 'orden', { unique: false }); // posición en el pensum
      }

      // Contenido teórico y práctico.
      if (!db.objectStoreNames.contains(STORES.LECCIONES)) {
        const lessonStore = db.createObjectStore(STORES.LECCIONES, { keyPath: 'id' });
        lessonStore.createIndex('moduloId', 'moduloId', { unique: false });
        lessonStore.createIndex('orden',    'orden',    { unique: false });
        lessonStore.createIndex('tipo',     'tipo',     { unique: false });
      }

      // Usé un índice compuesto [usuarioId, leccionId] para saber qué lección hizo cada alumno.
      if (!db.objectStoreNames.contains(STORES.PROGRESO)) {
        const progressStore = db.createObjectStore(STORES.PROGRESO, {
          keyPath: ['usuarioId', 'leccionId'], 
        });
        progressStore.createIndex('usuarioId',   'usuarioId',   { unique: false });
        progressStore.createIndex('moduloId',    'moduloId',    { unique: false });
        progressStore.createIndex('estado',      'estado',      { unique: false });
        // estado: 'no_iniciado' | 'en_progreso' | 'completado' | 'enviado'
        progressStore.createIndex('sincronizado', 'sincronizado', { unique: false });
      }

      // Gamificación de la tesis: medallas y recompensas.
      if (!db.objectStoreNames.contains(STORES.LOGROS)) {
        const achStore = db.createObjectStore(STORES.LOGROS, {
          keyPath: ['usuarioId', 'logroId'],
        });
        achStore.createIndex('usuarioId', 'usuarioId', { unique: false });
        achStore.createIndex('tipo',   'tipo',   { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.RETOS)) {
        const chalStore = db.createObjectStore(STORES.RETOS, { keyPath: 'id' });
        chalStore.createIndex('tipo',      'tipo',      { unique: false }); 
        chalStore.createIndex('expiraEn', 'expiraEn', { unique: false });
        chalStore.createIndex('usuarioId', 'usuarioId', { unique: false });
        chalStore.createIndex('completado', 'completado', { unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.RACHAS)) {
        const streakStore = db.createObjectStore(STORES.RACHAS, { keyPath: 'usuarioId' });
        streakStore.createIndex('rachaActual', 'rachaActual', { unique: false });
      }

      // Para que jueguen con HTML sin dañar su progreso.
      if (!db.objectStoreNames.contains(STORES.SANDBOX)) {
        const sandboxStore = db.createObjectStore(STORES.SANDBOX, {
          keyPath: 'id',
          autoIncrement: false,
        });
        sandboxStore.createIndex('usuarioId', 'usuarioId', { unique: false });
        sandboxStore.createIndex('actualizadoEn', 'actualizadoEn', { unique: false });
      }

      // El corazón del offline-first: aquí se encolan las tareas cuando no hay WiFi.
      if (!db.objectStoreNames.contains(STORES.COLA_SYNC)) {
        const syncStore = db.createObjectStore(STORES.COLA_SYNC, {
          keyPath: 'id',
          autoIncrement: true,
        });
        syncStore.createIndex('tipo',      'tipo',      { unique: false });
        syncStore.createIndex('estado',    'estado',    { unique: false });
        syncStore.createIndex('creadoEn',  'creadoEn',  { unique: false });
        syncStore.createIndex('reintentos','reintentos',{ unique: false });
      }

      if (!db.objectStoreNames.contains(STORES.ENLACES_GITHUB)) {
        const ghStore = db.createObjectStore(STORES.ENLACES_GITHUB, { keyPath: 'usuarioId' });
        ghStore.createIndex('usuarioGithub', 'usuarioGithub', { unique: false });
      }
    },

    blocked(currentVersion, blockedVersion, event) {
      console.warn('[DB] La base de datos está bloqueada. Cierra otras pestañas.');
    },

    blocking(currentVersion, blockedVersion, event) {
      // Si esta pestaña bloquea una actualización, cierra la conexión
      event.target.close();
    },

    terminated() {
      console.error('[DB] La conexión con IndexedDB fue terminada inesperadamente.');
    },
  });
}

let _dbInstance = null;

export async function getDB() {
  if (!_dbInstance) {
    _dbInstance = await openEspacioEducaDB();
  }
  return _dbInstance;
}
