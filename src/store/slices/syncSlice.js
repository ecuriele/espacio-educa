/**
 * ARCHIVO: syncSlice.js
 * 
 * En mi tesis, diseñé esta cola de "Background Sync" para la PWA.
 * Guarda los avances del alumno mientras no hay internet, y los
 * sincroniza cuando vuelve la conexión.
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { SyncQueueModel, ProgressModel } from '@db/models';

const initialState = {
  pendingCount: 0,
  isSyncing: false,
  lastSyncAt: null,
  syncError: null,
};

/**
 * Intentar sincronizar todos los items pendientes de la cola
 * Se llama cuando se detecta conexión a internet
 */
export const syncPendingItems = createAsyncThunk(
  'sync/syncPending',
  async (_, { rejectWithValue }) => {
    try {
      const pending = await SyncQueueModel.getPending();
      if (!pending.length) return { synced: 0 };

      let synced = 0;
      for (const item of pending) {
        try {
          await SyncQueueModel.markProcessing(item.id);

          // Procesar según tipo de operación
          if (item.tipo === 'progress_update') {
            // Ejemplo: si existiera una API real haríamos fetch
            await ProgressModel.markSynced(item.payload.usuarioId, item.payload.leccionId);
            await SyncQueueModel.remove(item.id);
            synced++;
          } else if (item.tipo === 'submission') {
            await SyncQueueModel.remove(item.id);
            synced++;
          } else if (item.tipo === 'achievement_claim') {
            await SyncQueueModel.remove(item.id);
            synced++;
          }
        } catch (itemErr) {
          await SyncQueueModel.markFailed(item.id);
        }
      }
      return { synced, timestamp: Date.now() };
    } catch (err) {
      return rejectWithValue(err.message);
    }
  }
);

/** Cargar el conteo de items pendientes de sync */
export const loadPendingCount = createAsyncThunk(
  'sync/loadPendingCount',
  async () => {
    const pending = await SyncQueueModel.getPending();
    return pending.length;
  }
);

const syncSlice = createSlice({
  name: 'sync',
  initialState,
  reducers: {
    incrementPendingCount(state) {
      state.pendingCount += 1;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(syncPendingItems.pending, (state) => { state.isSyncing = true; state.syncError = null; })
      .addCase(syncPendingItems.fulfilled, (state, action) => {
        state.isSyncing = false;
        state.lastSyncAt = action.payload.timestamp || Date.now();
        state.pendingCount = Math.max(0, state.pendingCount - (action.payload.synced || 0));
      })
      .addCase(syncPendingItems.rejected, (state, action) => {
        state.isSyncing = false;
        state.syncError = action.payload;
      })
      .addCase(loadPendingCount.fulfilled, (state, action) => {
        state.pendingCount = action.payload;
      });
  },
});

export const { incrementPendingCount } = syncSlice.actions;
export const selectPendingCount = (state) => state.sync.pendingCount;
export const selectIsSyncing    = (state) => state.sync.isSyncing;
export const selectLastSyncAt   = (state) => state.sync.lastSyncAt;
export default syncSlice.reducer;
