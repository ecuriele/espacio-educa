/**
 * ARCHIVO: coursesSlice.js
 * 
 * En mi tesis, llamamos "Módulos" al pensum.
 * Este slice guarda los módulos cacheados para uso offline.
 */
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { ModuleModel } from '@db/models';

const initialState = {
  items: [],
  selectedCourse: null,
  status: 'idle',
  error: null,
};

export const loadCourses = createAsyncThunk('courses/loadAll', async () => {
  return ModuleModel.getAll();
});

const coursesSlice = createSlice({
  name: 'courses',
  initialState,
  reducers: {
    selectCourse(state, action) {
      state.selectedCourse = state.items.find((c) => c.id === action.payload) || null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadCourses.pending, (state) => { state.status = 'loading'; })
      .addCase(loadCourses.fulfilled, (state, action) => {
        state.items = action.payload;
        state.status = 'succeeded';
      })
      .addCase(loadCourses.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      });
  },
});

export const { selectCourse } = coursesSlice.actions;
export const selectAllCourses = (state) => state.courses.items;
export const selectSelectedCourse = (state) => state.courses.selectedCourse;
export default coursesSlice.reducer;
