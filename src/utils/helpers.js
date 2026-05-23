/** Genera un UUID v4 compatible sin dependencias */
export function generateId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/** Formatea bytes en unidad legible */
export function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/** Clamp: limitar un número entre min y max */
export function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

/** Debounce simple */
export function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

/** Formatear fecha relativa simple */
export function timeAgo(timestamp) {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1)  return 'hace un momento';
  if (minutes < 60) return `hace ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24)   return `hace ${hours}h`;
  const days = Math.floor(hours / 24);
  return `hace ${days} día${days !== 1 ? 's' : ''}`;
}

/** Interpolar color entre dos valores (para indicadores de progreso) */
export function interpolateColor(percent) {
  if (percent < 30) return '#ef4444'; // rojo
  if (percent < 70) return '#f59e0b'; // ámbar
  return '#10b981'; // verde
}

export default { generateId, formatBytes, clamp, debounce, timeAgo, interpolateColor };
