/**
 * ARCHIVO: uiSlice.js
 * 
 * En este slice de Redux manejo el estado global de la interfaz de la PWA.
 * Cosas como el tema (claro/oscuro), si la barra lateral está abierta, y
 * la conectividad (si estamos offline o online).
 */

import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  theme: 'dark',           // 'dark' | 'light'
  sidebarOpen: true,       // Sidebar en desktop
  sidebarMobileOpen: false,// Sidebar en mobile (drawer)
  activeSection: 'dashboard', // Sección activa en el sidebar
  // Conectividad
  isOnline: navigator.onLine,
  showOfflineBanner: !navigator.onLine,
  // Modales globales
  modals: {
    achievementUnlocked: null, // achievement object | null
    confirmAction: null,       // { title, message, onConfirm } | null
  },
  // Carga global
  globalLoading: false,
  loadingMessage: '',
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleTheme(state) {
      state.theme = state.theme === 'dark' ? 'light' : 'dark';
      // Aplicar clase al elemento HTML raíz
      document.documentElement.classList.toggle('dark', state.theme === 'dark');
    },
    setTheme(state, action) {
      state.theme = action.payload;
      document.documentElement.classList.toggle('dark', action.payload === 'dark');
    },
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
    toggleMobileSidebar(state) {
      state.sidebarMobileOpen = !state.sidebarMobileOpen;
    },
    closeMobileSidebar(state) {
      state.sidebarMobileOpen = false;
    },
    setActiveSection(state, action) {
      state.activeSection = action.payload;
      state.sidebarMobileOpen = false; // Cierra en mobile al navegar
    },
    setOnlineStatus(state, action) {
      state.isOnline = action.payload;
      state.showOfflineBanner = !action.payload;
    },
    dismissOfflineBanner(state) {
      state.showOfflineBanner = false;
    },
    openAchievementModal(state, action) {
      state.modals.achievementUnlocked = action.payload;
    },
    closeAchievementModal(state) {
      state.modals.achievementUnlocked = null;
    },
    openConfirmModal(state, action) {
      state.modals.confirmAction = action.payload;
    },
    closeConfirmModal(state) {
      state.modals.confirmAction = null;
    },
    setGlobalLoading(state, action) {
      state.globalLoading = action.payload.loading;
      state.loadingMessage = action.payload.message || '';
    },
  },
});

export const {
  toggleTheme, setTheme, toggleSidebar, toggleMobileSidebar, closeMobileSidebar,
  setActiveSection, setOnlineStatus, dismissOfflineBanner,
  openAchievementModal, closeAchievementModal,
  openConfirmModal, closeConfirmModal, setGlobalLoading,
} = uiSlice.actions;

export const selectTheme          = (state) => state.ui.theme;
export const selectSidebarOpen    = (state) => state.ui.sidebarOpen;
export const selectMobileSidebar  = (state) => state.ui.sidebarMobileOpen;
export const selectActiveSection  = (state) => state.ui.activeSection;
export const selectIsOnline       = (state) => state.ui.isOnline;
export const selectShowOffline    = (state) => state.ui.showOfflineBanner;
export const selectModals         = (state) => state.ui.modals;
export const selectGlobalLoading  = (state) => state.ui.globalLoading;

export default uiSlice.reducer;
