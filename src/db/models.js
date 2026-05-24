/**
 * ARCHIVO: models.js
 * 
 * En mi tesis, diseÃ±Ã© esta capa de "Modelos" para interactuar con IndexedDB.
 * La idea es abstraer las operaciones CRUD (crear, leer, actualizar, borrar)
 * para que el resto de la aplicaciÃ³n (como los componentes de React o Redux)
 * no tenga que lidiar con la complejidad de IndexedDB directamente.
 * Todas las funciones aquÃ­ son asÃ­ncronas porque IndexedDB es asÃ­ncrono,
 * lo cual es clave para no bloquear la interfaz grÃ¡fica del usuario.
 */

import { getDB, STORES } from './schema';
import { generateId } from '@utils/helpers';

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  USUARIOS
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

/**
 * Modelo de usuario:
 * {
 *   id: string,           // ID Ãºnico de Firebase
 *   correo: string,
 *   nombreMostrar: string,
 *   avatarUrl: string | null,
 *   rol: 'estudiante' | 'profesor' | 'admin',
 *   jwtToken: string | null,         // Token para seguridad
 *   jwtRefreshToken: string | null,
 *   jwtExpiraEn: number | null,      // timestamp
 *   githubToken: string | null,
 *   preferencias: {
 *     tema: 'dark' | 'light',
 *     idioma: 'es' | 'en',
 *     tamanoFuenteEditor: number,
 *     notificaciones: boolean,
 *   },
 *   creadoEn: number,   // timestamp
 *   actualizadoEn: number,
 * }
 */

export const UserModel = {
  async create(userData) {
    const db = await getDB();
    const now = Date.now();
    const user = {
      preferencias: { tema: 'dark', idioma: 'es', tamanoFuenteEditor: 14, notificaciones: true },
      jwtToken: null,
      jwtRefreshToken: null,
      jwtExpiraEn: null,
      githubToken: null,
      avatarUrl: null,
      ...userData,
      creadoEn: now,
      actualizadoEn: now,
    };
    await db.put(STORES.USUARIOS, user);
    return user;
  },

  async getById(usuarioId) {
    const db = await getDB();
    return db.get(STORES.USUARIOS, usuarioId);
  },

  async getByEmail(correo) {
    const db = await getDB();
    return db.getFromIndex(STORES.USUARIOS, 'correo', correo);
  },

  async update(usuarioId, changes) {
    const db = await getDB();
    const existing = await db.get(STORES.USUARIOS, usuarioId);
    if (!existing) throw new Error(`User ${usuarioId} not found`);
    const updated = { ...existing, ...changes, actualizadoEn: Date.now() };
    await db.put(STORES.USUARIOS, updated);
    return updated;
  },

  async saveToken(usuarioId, { jwtToken, jwtRefreshToken, jwtExpiraEn }) {
    return UserModel.update(usuarioId, { jwtToken, jwtRefreshToken, jwtExpiraEn });
  },

  async clearToken(usuarioId) {
    return UserModel.update(usuarioId, { jwtToken: null, jwtRefreshToken: null, jwtExpiraEn: null });
  },
};

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  MODULOS
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

/**
 * Modelo de mÃ³dulo (antes Course):
 * Para la tesis definimos que el pensum se divide en mÃ³dulos.
 * {
 *   id: string,
 *   titulo: string,
 *   descripcion: string,
 *   nivel: 'basico' | 'avanzado',
 *   orden: number,
 *   imagenPortada: string | null,
 *   totalLecciones: number,
 *   horasEstimadas: number,
 *   etiquetas: string[],
 *   creadoEn: number,
 *   actualizadoEn: number,
 * }
 */

export const ModuleModel = {
  async upsert(moduloData) {
    const db = await getDB();
    const now = Date.now();
    const modulo = { ...moduloData, actualizadoEn: now };
    if (!modulo.creadoEn) modulo.creadoEn = now;
    await db.put(STORES.MODULOS, modulo);
    return modulo;
  },

  async getAll() {
    const db = await getDB();
    return db.getAll(STORES.MODULOS);
  },

  async getById(moduloId) {
    const db = await getDB();
    return db.get(STORES.MODULOS, moduloId);
  },

  async getByLevel(nivel) {
    const db = await getDB();
    return db.getAllFromIndex(STORES.MODULOS, 'nivel', nivel);
  },
};

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  PROGRESO
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

/**
 * Modelo de progreso:
 * AsÃ­ guardo quÃ© lecciones hizo el estudiante en mi aplicaciÃ³n.
 * {
 *   usuarioId: string,
 *   leccionId: string,
 *   moduloId: string,
 *   estado: 'no_iniciado' | 'en_progreso' | 'completado' | 'enviado',
 *   nota: number | null,           // 0-20 (escala venezolana)
 *   intentos: number,
 *   tiempoInvertidoSegundos: number,
 *   ultimoCodigo: { html: string, css: string, js: string } | null,
 *   enviadoEn: number | null,
 *   completadoEn: number | null,
 *   sincronizado: boolean,                // false = pendiente de Background Sync
 *   actualizadoEn: number,
 * }
 */

export const ProgressModel = {
  async upsert(progressData) {
    const db = await getDB();
    const existing = await db.get(STORES.PROGRESO, [progressData.usuarioId, progressData.leccionId]);
    const now = Date.now();
    const merged = {
      estado: 'no_iniciado',
      nota: null,
      intentos: 0,
      tiempoInvertidoSegundos: 0,
      ultimoCodigo: null,
      enviadoEn: null,
      completadoEn: null,
      sincronizado: false,
      ...existing,
      ...progressData,
      actualizadoEn: now,
    };
    await db.put(STORES.PROGRESO, merged);
    return merged;
  },

  async getByUser(usuarioId) {
    const db = await getDB();
    return db.getAllFromIndex(STORES.PROGRESO, 'usuarioId', usuarioId);
  },

  async getUnsynced(usuarioId) {
    const db = await getDB();
    const all = await db.getAllFromIndex(STORES.PROGRESO, 'usuarioId', usuarioId);
    return all.filter((p) => !p.sincronizado);
  },

  async markSynced(usuarioId, leccionId) {
    return ProgressModel.upsert({ usuarioId, leccionId, sincronizado: true });
  },

  async getUserCourseProgress(usuarioId, moduloId) {
    const db = await getDB();
    const all = await db.getAllFromIndex(STORES.PROGRESO, 'moduloId', moduloId);
    return all.filter((p) => p.usuarioId === usuarioId);
  },
};

//  LOGROS

/**
 * Catalogo de logros predefinidos (constante):
 * Cada logro tiene: id, titulo, descripcion, icono, tipo, xp, requisito
 */
export const ACHIEVEMENT_CATALOG = [
  // Rachas
  { id: 'streak_3', titulo: '3 dias seguidos', descripcion: 'Inicia sesion 3 dias consecutivos', icono: 'fire', tipo: 'badge', xp: 50, requisito: '3 dias de racha' },
  { id: 'streak_7', titulo: 'Una semana activo', descripcion: 'Inicia sesion 7 dias seguidos', icono: 'bolt', tipo: 'medal', xp: 150, requisito: '7 dias de racha' },
  { id: 'streak_30', titulo: 'Mes imparable', descripcion: 'Mantente activo durante 30 dias', icono: 'muscle', tipo: 'trophy', xp: 500, requisito: '30 dias de racha' },
  // Entregas y participacion
  { id: 'first_lesson', titulo: 'Primer paso', descripcion: 'Entrega tu primera actividad', icono: 'sprout', tipo: 'badge', xp: 20, requisito: '1 entrega' },
  { id: 'submit_5', titulo: 'En marcha', descripcion: 'Entrega 5 actividades', icono: 'rocket', tipo: 'badge', xp: 80, requisito: '5 entregas' },
  { id: 'submit_10', titulo: 'Imparable', descripcion: 'Entrega 10 actividades', icono: 'target', tipo: 'medal', xp: 150, requisito: '10 entregas' },
  { id: 'submit_25', titulo: 'Dedicacion total', descripcion: 'Entrega 25 actividades', icono: 'wizard', tipo: 'trophy', xp: 400, requisito: '25 entregas' },
  { id: 'nota_perfect', titulo: 'Nota perfecta', descripcion: 'Saca 20/20 en una actividad', icono: 'trophy', tipo: 'badge', xp: 100, requisito: '20/20 en una actividad' },
  { id: 'nota_excelente', titulo: 'Excelente', descripcion: 'Saca 18 o mas en una actividad', icono: 'star', tipo: 'badge', xp: 60, requisito: '>=18/20 en una actividad' },
  { id: 'nota_buena', titulo: 'Buen estudiante', descripcion: 'Saca 14 o mas en una actividad', icono: 'thumb', tipo: 'badge', xp: 30, requisito: '>=14/20 en una actividad' },
  // Modulos
  { id: 'module_basic', titulo: 'Modulo Basico', descripcion: 'Completa todas las actividades del modulo basico', icono: 'grad', tipo: 'medal', xp: 300, requisito: 'Completar modulo basico' },
  { id: 'module_advanced', titulo: 'Modulo Avanzado', descripcion: 'Completa todas las actividades del modulo avanzado', icono: 'rocket', tipo: 'trophy', xp: 600, requisito: 'Completar modulo avanzado' },
  // Editor / Sandbox
  { id: 'sandbox_10', titulo: 'Explorador', descripcion: 'Guarda 10 proyectos en el sandbox', icono: 'flask', tipo: 'badge', xp: 80, requisito: '10 proyectos en sandbox' },
  { id: 'github_link', titulo: 'Open Source', descripcion: 'Vincula tu cuenta de GitHub', icono: 'octo', tipo: 'badge', xp: 100, requisito: 'Vincular GitHub' },
  // Retos
  { id: 'daily_7', titulo: 'Reto semanal', descripcion: 'Completa 7 retos diarios', icono: 'cal', tipo: 'medal', xp: 200, requisito: '7 retos diarios' },
  { id: 'weekly_4', titulo: 'Cuatro semanas', descripcion: 'Completa 4 retos semanales', icono: 'trophy', tipo: 'trophy', xp: 400, requisito: '4 retos semanales' },
  // Ranking
  { id: 'rank_bronze', titulo: 'Bronce', descripcion: 'Alcanza el rango Bronce', icono: 'bronze', tipo: 'rank', xp: 0, requisito: '500 XP' },
  { id: 'rank_silver', titulo: 'Plata', descripcion: 'Alcanza el rango Plata', icono: 'silver', tipo: 'rank', xp: 0, requisito: '1500 XP' },
  { id: 'rank_gold', titulo: 'Oro', descripcion: 'Alcanza el rango Oro', icono: 'gold', tipo: 'rank', xp: 0, requisito: '3000 XP' },
  { id: 'rank_diamond', titulo: 'Diamante', descripcion: 'Alcanza el rango Diamante', icono: 'diamond', tipo: 'rank', xp: 0, requisito: '6000 XP' },
];
export const AchievementModel = {
  async unlock(usuarioId, logroId) {
    const db = await getDB();
    const now = Date.now();
    const existing = await db.get(STORES.LOGROS, [usuarioId, logroId]);
    if (existing) return null; // ya desbloqueado, no retornar para no lanzar notificación de nuevo
    const catalogItem = ACHIEVEMENT_CATALOG.find((a) => a.id === logroId);
    const record = {
      usuarioId,
      logroId,
      ...catalogItem,
      desbloqueadoEn: now,
      visto: false,  // para mostrar notificaciÃ³n de nuevo logro en la UI
    };
    await db.put(STORES.LOGROS, record);
    return record;
  },

  async getByUser(usuarioId) {
    const db = await getDB();
    return db.getAllFromIndex(STORES.LOGROS, 'usuarioId', usuarioId);
  },

  async markSeen(usuarioId, logroId) {
    const db = await getDB();
    const existing = await db.get(STORES.LOGROS, [usuarioId, logroId]);
    if (existing) {
      await db.put(STORES.LOGROS, { ...existing, visto: true });
    }
  },
};

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  RACHAS
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

/**
/**
 * Modelo de racha:
 * {
 *   usuarioId: string,
 *   rachaActual: number,
 *   rachaMasLarga: number,
 *   fechaUltimaActividad: string,  // 'YYYY-MM-DD'
 *   totalDiasActivos: number,
 *   historial: string[],         // array de fechas 'YYYY-MM-DD' activas
 * }
 */

export const StreakModel = {
  async get(usuarioId) {
    const db = await getDB();
    return db.get(STORES.RACHAS, usuarioId);
  },

  async recordActivity(usuarioId) {
    const db = await getDB();
    const today = new Date().toISOString().split('T')[0];
    const existing = await db.get(STORES.RACHAS, usuarioId);

    if (!existing) {
      // Primera actividad
      const initial = {
        usuarioId,
        rachaActual: 1,
        rachaMasLarga: 1,
        fechaUltimaActividad: today,
        totalDiasActivos: 1,
        historial: [today],
      };
      await db.put(STORES.RACHAS, initial);
      return initial;
    }

    if (existing.fechaUltimaActividad === today) {
      return existing; // Ya registrado hoy
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    const isConsecutive = existing.fechaUltimaActividad === yesterdayStr;
    const newStreak = isConsecutive ? existing.rachaActual + 1 : 1;

    const updated = {
      ...existing,
      rachaActual: newStreak,
      rachaMasLarga: Math.max(newStreak, existing.rachaMasLarga),
      fechaUltimaActividad: today,
      totalDiasActivos: existing.totalDiasActivos + 1,
      historial: [...(existing.historial || []).slice(-90), today], // Ãºltimos 90 dÃ­as
    };
    await db.put(STORES.RACHAS, updated);
    return updated;
  },
};

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  RETOS
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

export const ChallengeModel = {
  async upsert(retoData) {
    const db = await getDB();
    await db.put(STORES.RETOS, { ...retoData, actualizadoEn: Date.now() });
  },

  async getActive(usuarioId) {
    const db = await getDB();
    const now = Date.now();
    const all = await db.getAllFromIndex(STORES.RETOS, 'usuarioId', usuarioId);
    return all.filter((c) => !c.completado && c.expiraEn > now);
  },

  async complete(retoId, usuarioId) {
    const db = await getDB();
    const ch = await db.get(STORES.RETOS, retoId);
    if (ch) {
      await db.put(STORES.RETOS, {
        ...ch,
        completado: true,
        completadoEn: Date.now(),
      });
    }
  },
};

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  PROYECTOS SANDBOX
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

/**
 * Modelo de cÃ³digo en sandbox:
 * Para la tesis definÃ­ el sandbox como una zona segura para el alumno.
 * {
 *   id: string,        // UUID generado en cliente
 *   usuarioId: string,
 *   titulo: string,
 *   html: string,
 *   css: string,
 *   js: string,
 *   creadoEn: number,
 *   actualizadoEn: number,
 * }
 */
export const SandboxModel = {
  async save(snippetData) {
    const db = await getDB();
    const now = Date.now();
    const snippet = {
      id: generateId(),
      ...snippetData,
      creadoEn: snippetData.creadoEn || now,
      actualizadoEn: now,
    };
    await db.put(STORES.SANDBOX, snippet);
    return snippet;
  },

  async getByUser(usuarioId) {
    const db = await getDB();
    return db.getAllFromIndex(STORES.SANDBOX, 'usuarioId', usuarioId);
  },

  async delete(snippetId) {
    const db = await getDB();
    await db.delete(STORES.SANDBOX, snippetId);
  },
};

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  COLA DE SINCRONIZACIÃ“N (OFFLINE FIRST)
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

export const SyncQueueModel = {
  async enqueue({ tipo, payload }) {
    const db = await getDB();
    return db.add(STORES.COLA_SYNC, {
      tipo,
      payload,
      estado: 'pendiente',
      reintentos: 0,
      creadoEn: Date.now(),
    });
  },

  async getPending() {
    const db = await getDB();
    return db.getAllFromIndex(STORES.COLA_SYNC, 'estado', 'pendiente');
  },

  async markProcessing(id) {
    const db = await getDB();
    const item = await db.get(STORES.COLA_SYNC, id);
    if (item) await db.put(STORES.COLA_SYNC, { ...item, estado: 'procesando' });
  },

  async remove(id) {
    const db = await getDB();
    await db.delete(STORES.COLA_SYNC, id);
  },

  async markFailed(id) {
    const db = await getDB();
    const item = await db.get(STORES.COLA_SYNC, id);
    if (item) {
      await db.put(STORES.COLA_SYNC, {
        ...item,
        estado: item.reintentos >= 3 ? 'fallido' : 'pendiente',
        reintentos: item.reintentos + 1,
      });
    }
  },
};

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
//  ENLACES GITHUB
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

export const GitHubLinkModel = {
  async save({ usuarioId, usuarioGithub, githubToken, repositorios = [] }) {
    const db = await getDB();
    await db.put(STORES.ENLACES_GITHUB, {
      usuarioId,
      usuarioGithub,
      githubToken,
      repositorios,
      vinculadoEn: Date.now(),
      actualizadoEn: Date.now(),
    });
  },

  async get(usuarioId) {
    const db = await getDB();
    return db.get(STORES.ENLACES_GITHUB, usuarioId);
  },

  async updateRepos(usuarioId, repositorios) {
    const db = await getDB();
    const existing = await db.get(STORES.ENLACES_GITHUB, usuarioId);
    if (existing) {
      await db.put(STORES.ENLACES_GITHUB, { ...existing, repositorios, actualizadoEn: Date.now() });
    }
  },

  async remove(usuarioId) {
    const db = await getDB();
    await db.delete(STORES.ENLACES_GITHUB, usuarioId);
  },
};
