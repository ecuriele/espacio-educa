/**
 * ARCHIVO: progressSlice.js
 * 
 * En mi tesis, el progreso se calcula por módulo (no por "course").
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ProgressModel, ModuleModel } from '@db/models';

const initialState = {
  summary: {}, // { [courseId]: { completed: number, total: number, percent: number } }
  totalXp: 0,
  currentRank: null,
  status: 'idle',
  error: null,
};

export const loadProgressSummary = createAsyncThunk(
  'progress/loadSummary',
  async (userId) => {
    const allProgress = await ProgressModel.getByUser(userId);
    const modulos = await ModuleModel.getAll();
    const summary = {};
    for (const modulo of modulos) {
      const progresoModulo = allProgress.filter((p) => p.moduloId === modulo.id);
      const completados = progresoModulo.filter((p) => p.estado === 'completado').length;
      const total = modulo.totalLecciones || 0;
      summary[modulo.id] = {
        completadas: completados,
        total: total,
        porcentaje: total ? Math.round((completados / total) * 100) : 0,
        titulo: modulo.titulo,
        nivel: modulo.nivel,
      };
    }
    return summary;
  }
);

const progressSlice = createSlice({
  name: 'progress',
  initialState,
  reducers: {
    updateCourseSummary(state, action) {
      const { moduloId, completadas, total } = action.payload;
      state.summary[moduloId] = {
        ...state.summary[moduloId],
        completadas,
        total,
        porcentaje: total ? Math.round((completadas / total) * 100) : 0,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadProgressSummary.pending, (state) => { state.status = 'loading'; })
      .addCase(loadProgressSummary.fulfilled, (state, action) => {
        state.summary = action.payload;
        state.status = 'succeeded';
      })
      .addCase(loadProgressSummary.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export const { updateCourseSummary } = progressSlice.actions;
export const selectProgressSummary = (state) => state.progress.summary;
export default progressSlice.reducer;
