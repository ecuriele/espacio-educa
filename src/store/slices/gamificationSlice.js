/**
 * ARCHIVO: gamificationSlice.js
 * 
 * Este es el motor de gamificación de mi proyecto de tesis.
 * Aquí manejo rachas, experiencia (XP), rangos, medallas y retos.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { StreakModel, AchievementModel, ACHIEVEMENT_CATALOG, ChallengeModel } from '@db/models';
import { getLeaderboard, incrementUserXp, getUserSubmissionCount, getUserHighestGrade } from '@services/firebase/firestoreService';

export const RANKS = [
  { id: 'newcomer', label: 'Novato',    minXp: 0,    icon: '🌱', color: '#94a3b8' },
  { id: 'bronze',   label: 'Bronce',   minXp: 500,  icon: '🥉', color: '#cd7f32' },
  { id: 'silver',   label: 'Plata',    minXp: 1500, icon: '🥈', color: '#c0c0c0' },
  { id: 'gold',     label: 'Oro',      minXp: 3000, icon: '🥇', color: '#ffd700' },
  { id: 'diamond',  label: 'Diamante', minXp: 6000, icon: '💎', color: '#7dd3fc' },
  { id: 'legend',   label: 'Leyenda',  minXp: 12000,icon: '🚀', color: '#a78bfa' },
];

/** Calcula el rango basado en XP total */
export function getRankForXp(xp) {
  let rank = RANKS[0];
  for (const r of RANKS) {
    if (xp >= r.minXp) rank = r;
  }
  return rank;
}

/** XP para pasar al siguiente rango */
export function getNextRankXp(xp) {
  const currentIndex = RANKS.findIndex((r) => r === getRankForXp(xp));
  return RANKS[currentIndex + 1]?.minXp ?? null;
}

const initialState = {
  // Racha
  streak: {
    currentStreak: 0,
    longestStreak: 0,
    lastActivityDate: null,
    totalActiveDays: 0,
    history: [],
  },
  // XP y rangos
  totalXp: 0,
  rank: RANKS[0],
  // Logros
  badges: [],             // IDs de badges desbloqueados
  pendingNotifications: [], // Logros recientes para mostrar en toast
  // Retos
  activeChallenges: [],
  completedChallengesCount: 0,
  // Leaderboard (datos desde API, fallback a cache)
  leaderboard: [],
  leaderboardStatus: 'idle',
  // Estado general
  status: 'idle',
  error: null,
};


/** Registrar actividad diaria y actualizar racha */
export const recordDailyActivity = createAsyncThunk(
  'gamification/recordDailyActivity',
  async (userId, { dispatch, getState }) => {
    const streakData = await StreakModel.recordActivity(userId);
    // Verificar si se ganó un badge de racha
    const { rachaActual } = streakData;
    if ([3, 7, 30].includes(rachaActual)) {
      const achievementId = `streak_${rachaActual}`;
      const achievement = await AchievementModel.unlock(userId, achievementId);
      if (achievement) {
        dispatch(addPendingNotification(achievement));
        if (achievement.xp > 0) {
          dispatch(addXp({ userId, amount: achievement.xp, reason: `Racha: ${achievement.titulo}` }));
        }
      }
    }
    return streakData;
  }
);

/** Agregar XP y comprobar si se sube de rango */
export const addXp = createAsyncThunk(
  'gamification/addXp',
  async ({ userId, amount, reason }, { getState, dispatch }) => {
    const state = getState();
    const currentXp = state.gamification.totalXp;
    const newXp = currentXp + amount;
    const oldRank = getRankForXp(currentXp);
    const newRank = getRankForXp(newXp);

    // ¿Subió de rango?
    if (newRank.id !== oldRank.id) {
      const achievement = await AchievementModel.unlock(userId, `rank_${newRank.id}`);
      if (achievement) {
        dispatch(addPendingNotification(achievement));
        if (achievement.xp > 0) {
          dispatch(addXp({ userId, amount: achievement.xp, reason: `Nuevo Rango: ${achievement.titulo}` }));
        }
      }
    }

    // Guardar el nuevo XP en Firestore usando incremento atómico
    await incrementUserXp(userId, amount);

    return { newXp, newRank, amount, reason };
  }
);

/** Comprobar logros por cantidad de entregas y notas */
export const checkSubmissionAchievements = createAsyncThunk(
  'gamification/checkSubmissionAchievements',
  async (userId, { dispatch }) => {
    const count = await getUserSubmissionCount(userId);
    const highestGrade = await getUserHighestGrade(userId);
    
    const achievementsToCheck = [
      { condition: count >= 1, id: 'first_lesson' },
      { condition: count >= 5, id: 'submit_5' },
      { condition: count >= 7, id: 'daily_7' },
      { condition: count >= 10, id: 'submit_10' },
      { condition: count >= 15, id: 'module_basic' },
      { condition: count >= 25, id: 'submit_25' },
      { condition: count >= 28, id: 'weekly_4' },
      { condition: count >= 30, id: 'module_advanced' },
      { condition: highestGrade >= 20, id: 'nota_perfect' },
      { condition: highestGrade >= 18, id: 'nota_excelente' },
      { condition: highestGrade >= 14, id: 'nota_buena' },
    ];

    for (const ach of achievementsToCheck) {
      if (ach.condition) {
        const unlocked = await AchievementModel.unlock(userId, ach.id);
        if (unlocked) {
          dispatch(addPendingNotification(unlocked));
          if (unlocked.xp > 0) {
            dispatch(addXp({ userId, amount: unlocked.xp, reason: `Logro desbloqueado: ${unlocked.titulo}` }));
          }
        }
      }
    }
    return count;
  }
);

/** Cargar logros del usuario desde IndexedDB */
export const loadUserAchievements = createAsyncThunk(
  'gamification/loadUserAchievements',
  async (userId) => {
    return AchievementModel.getByUser(userId);
  }
);

/** Cargar leaderboard desde API (con fallback vacío si offline) */
export const fetchLeaderboard = createAsyncThunk(
  'gamification/fetchLeaderboard',
  async (salonQuery = 'all', { rejectWithValue }) => {
    try {
      const data = await getLeaderboard(salonQuery, 50);
      return data.map((user, index) => ({
        userId: user.id,
        displayName: user.nombreMostrar,
        xp: user.xp || 0,
        rank: getRankForXp(user.xp || 0).id,
        avatar: user.avatarUrl || null,
        position: index + 1
      }));
    } catch (err) {
      return rejectWithValue('Sin conexión — mostrando último ranking disponible');
    }
  }
);

const gamificationSlice = createSlice({
  name: 'gamification',
  initialState,
  reducers: {
    addPendingNotification(state, action) {
      state.pendingNotifications.push(action.payload);
    },
    clearNotification(state, action) {
      state.pendingNotifications = state.pendingNotifications.filter(
        (n) => n.logroId !== action.payload
      );
    },
    clearAllNotifications(state) {
      state.pendingNotifications = [];
    },
    setActiveChallenges(state, action) {
      state.activeChallenges = action.payload;
    },
    incrementCompletedChallenges(state) {
      state.completedChallengesCount += 1;
    },
    setInitialXp(state, action) {
      state.totalXp = action.payload;
      state.rank = getRankForXp(action.payload);
    },
  },
  extraReducers: (builder) => {
    builder.addCase('auth/clearAuthState', () => {
      return initialState;
    });
    builder.addCase('auth/logout/fulfilled', () => {
      return initialState;
    });

    builder.addCase('auth/setAuthenticatedUser', (state, action) => {
      const user = action.payload?.user;
      if (user && user.xp !== undefined) {
        state.totalXp = user.xp;
        state.rank = getRankForXp(user.xp);
      }
    });

    builder.addCase(recordDailyActivity.fulfilled, (state, action) => {
      state.streak = action.payload;
    });

    builder.addCase(addXp.fulfilled, (state, action) => {
      state.totalXp = action.payload.newXp;
      state.rank    = action.payload.newRank;
    });

    builder.addCase(loadUserAchievements.fulfilled, (state, action) => {
      state.badges = action.payload.map((a) => a.logroId);
      // Notificar logros no vistos
      state.pendingNotifications = action.payload
        .filter((a) => !a.visto)
        .slice(0, 3); // Máximo 3 simultáneos
    });

    builder
      .addCase(fetchLeaderboard.pending, (state) => {
        state.leaderboardStatus = 'loading';
      })
      .addCase(fetchLeaderboard.fulfilled, (state, action) => {
        state.leaderboard = action.payload;
        state.leaderboardStatus = 'succeeded';
      })
      .addCase(fetchLeaderboard.rejected, (state, action) => {
        state.leaderboardStatus = 'failed';
        state.error = action.payload;
      });
  },
});

export const {
  addPendingNotification,
  clearNotification,
  clearAllNotifications,
  setActiveChallenges,
  incrementCompletedChallenges,
  setInitialXp,
} = gamificationSlice.actions;

export const selectStreak              = (state) => state.gamification.streak;
export const selectTotalXp             = (state) => state.gamification.totalXp;
export const selectRank                = (state) => state.gamification.rank;
export const selectBadges              = (state) => state.gamification.badges;
export const selectLeaderboard         = (state) => state.gamification.leaderboard;
export const selectPendingNotifications= (state) => state.gamification.pendingNotifications;
export const selectActiveChallenges    = (state) => state.gamification.activeChallenges;

/** Porcentaje de progreso hacia el siguiente rango */
export const selectRankProgress = (state) => {
  const xp = state.gamification.totalXp;
  const currentRank = getRankForXp(xp);
  const nextXp = getNextRankXp(xp);
  if (!nextXp) return 100;
  return Math.round(((xp - currentRank.minXp) / (nextXp - currentRank.minXp)) * 100);
};

export default gamificationSlice.reducer;
