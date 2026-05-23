import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-surface-dark flex flex-col items-center justify-center text-center p-6">
      <span className="text-7xl mb-6">🚀</span>
      <h1 className="text-3xl font-black font-display text-white mb-2">¡Página no encontrada!</h1>
      <p className="text-slate-400 mb-8 max-w-sm">Parece que esta ruta no existe. ¿Te perdiste en el espacio?</p>
      <Link
        to="/panel"
        className="px-6 py-3 bg-brand-600 hover:bg-brand-500 text-white font-semibold rounded-xl transition-all shadow-brand-md"
      >
        Volver al inicio
      </Link>
    </div>
  );
}
