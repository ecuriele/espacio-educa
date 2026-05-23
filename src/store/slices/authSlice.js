/**
 * ARCHIVO: authSlice.js
 * Estado de autenticación Redux. En la tesis, lo modifiqué para soportar 
 * offline-first y conectarse con Firebase Auth de forma real.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { UserModel } from '@db/models';
import {
  signInWithEmail,
  signInWithGoogle as fbSignInWithGoogle,
  registerWithEmail as fbRegisterWithEmail,
  signOut as fbSignOut,
  markLoggedOut,
} from '@services/firebase/authService';

const initialState = {
  user: null,           // { id, correo, nombreMostrar, rol, avatarUrl, preferencias }
  isAuthenticated: false,
  sessionMode: null,    // 'online' | 'offline'
  status: 'idle',       // 'idle' | 'loading' | 'succeeded' | 'failed'
  error: null,
};


export const loginWithCredentials = createAsyncThunk(
  'auth/loginWithCredentials',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const { userProfile } = await signInWithEmail(email, password);
      await UserModel.create(userProfile);
      return { user: userProfile, sessionMode: 'online' };
    } catch (err) {
      const message =
        err.code === 'auth/invalid-credential' ? 'Correo o contraseña incorrectos' :
        err.code === 'auth/too-many-requests'  ? 'Demasiados intentos. Espera un momento.' :
        err.code === 'auth/network-request-failed' ? 'Sin conexión. Verifica tu red.' :
        err.message || 'Error al iniciar sesión';
      return rejectWithValue(message);
    }
  }
);

/**
 * Login con Google OAuth
 */
export const loginWithGoogle = createAsyncThunk(
  'auth/loginWithGoogle',
  async (_, { rejectWithValue }) => {
    try {
      const { userProfile } = await fbSignInWithGoogle();
      await UserModel.create(userProfile);
      return { user: userProfile, sessionMode: 'online' };
    } catch (err) {
      if (err.code === 'auth/popup-closed-by-user') return rejectWithValue(null); // cancelado por el usuario
      return rejectWithValue(err.message || 'Error al iniciar sesión con Google');
    }
  }
);

/**
 * Registro de nuevo usuario con Email/Contraseña
 */
export const registerWithEmail = createAsyncThunk(
  'auth/registerWithEmail',
  async ({ email, password, nombreMostrar, colegio, salon }, { rejectWithValue }) => {
    try {
      const { userProfile } = await fbRegisterWithEmail(email, password, nombreMostrar, colegio, salon);
      await UserModel.create(userProfile);
      return { user: userProfile, sessionMode: 'online' };
    } catch (err) {
      const message =
        err.code === 'auth/email-already-in-use' ? 'Este correo ya está registrado.' :
        err.code === 'auth/weak-password'         ? 'La contraseña debe tener al menos 6 caracteres.' :
        err.message || 'Error al crear la cuenta';
      return rejectWithValue(message);
    }
  }
);

/**
 * Inicializar sesión desde IndexedDB (fallback offline total)
 * Se usa cuando Firebase no puede conectarse y no hay caché del SDK
 */
export const initOfflineSession = createAsyncThunk(
  'auth/initOfflineSession',
  async (userId, { rejectWithValue }) => {
    try {
      const user = await UserModel.getById(userId);
      if (!user) throw new Error('No hay sesión local guardada');
      return { user, sessionMode: 'offline' };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/**
 * Logout — cierra sesión en Firebase y limpia el token local
 */
export const logout = createAsyncThunk(
  'auth/logout',
  async (userId, { rejectWithValue }) => {
    try {
      markLoggedOut(); // Marcar logout ANTES de todo para que el observer lo vea
      await fbSignOut();
      // Limpiar IndexedDB
      const { getDB, STORES } = await import('@db/schema');
      const db = await getDB();
      await db.clear(STORES.USERS);
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /**
     * Acción despachada por useAuthObserver cuando Firebase notifica un usuario.
     * Es la fuente principal de verdad para el estado de autenticación.
     */
    setAuthenticatedUser(state, action) {
      state.user          = action.payload.user;
      state.isAuthenticated = true;
      state.sessionMode   = action.payload.sessionMode;
      state.status        = 'succeeded';
      state.error         = null;
    },

    /**
     * Acción despachada por useAuthObserver cuando no hay usuario autenticado
     */
    clearAuthState(state) {
      state.user          = null;
      state.isAuthenticated = false;
      state.sessionMode   = null;
      state.status        = 'idle';
      state.error         = null;
    },

    /**
     * Marca el estado como cargando (mientras Firebase verifica la sesión)
     */
    setAuthLoading(state) {
      state.status = 'loading';
    },

    updatePreferences(state, action) {
      if (state.user) {
        state.user.preferencias = { ...state.user.preferencias, ...action.payload };
      }
    },

    updateUserProfile(state, action) {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
      }
    },

    setOfflineMode(state) { state.sessionMode = 'offline'; },
    setOnlineMode(state)  { state.sessionMode = 'online';  },
    clearError(state)     { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginWithCredentials.pending, (state) => {
        state.status = 'loading';
        state.error  = null;
      })
      .addCase(loginWithCredentials.fulfilled, (state, action) => {
        state.status        = 'succeeded';
        state.user          = action.payload.user;
        state.isAuthenticated = true;
        state.sessionMode   = action.payload.sessionMode;
      })
      .addCase(loginWithCredentials.rejected, (state, action) => {
        state.status = 'failed';
        state.error  = action.payload;
      });

    builder
      .addCase(loginWithGoogle.pending, (state) => {
        state.status = 'loading';
        state.error  = null;
      })
      .addCase(loginWithGoogle.fulfilled, (state, action) => {
        if (!action.payload) return; // cancelado por usuario
        state.status        = 'succeeded';
        state.user          = action.payload.user;
        state.isAuthenticated = true;
        state.sessionMode   = action.payload.sessionMode;
      })
      .addCase(loginWithGoogle.rejected, (state, action) => {
        state.status = 'failed';
        state.error  = action.payload;
      });

    builder
      .addCase(registerWithEmail.pending,  (state) => { state.status = 'loading'; state.error = null; })
      .addCase(registerWithEmail.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.user   = action.payload.user;
        state.isAuthenticated = true;
        state.sessionMode = action.payload.sessionMode;
      })
      .addCase(registerWithEmail.rejected, (state, action) => {
        state.status = 'failed';
        state.error  = action.payload;
      });

    builder
      .addCase(initOfflineSession.fulfilled, (state, action) => {
        state.user          = action.payload.user;
        state.isAuthenticated = true;
        state.sessionMode   = 'offline';
        state.status        = 'succeeded';
      })
      .addCase(initOfflineSession.rejected, (state) => {
        state.isAuthenticated = false;
        state.user            = null;
        state.sessionMode     = null;
      });

    builder.addCase(logout.fulfilled, (state) => {
      state.user          = null;
      state.isAuthenticated = false;
      state.sessionMode   = null;
      state.status        = 'idle';
    });
  },
});

export const {
  setAuthenticatedUser,
  clearAuthState,
  setAuthLoading,
  updatePreferences,
  updateUserProfile,
  setOfflineMode,
  setOnlineMode,
  clearError,
} = authSlice.actions;

export const selectCurrentUser      = (state) => state.auth.user;
export const selectIsAuthenticated  = (state) => state.auth.isAuthenticated;
export const selectSessionMode      = (state) => state.auth.sessionMode;
export const selectAuthStatus       = (state) => state.auth.status;
export const selectAuthError        = (state) => state.auth.error;
export const selectUserRole         = (state) => state.auth.user?.rol ?? 'estudiante';
export const selectIsTeacher        = (state) => state.auth.user?.rol === 'profesor';
export const selectIsOfflineSession = (state) => state.auth.sessionMode === 'offline';

export default authSlice.reducer;
