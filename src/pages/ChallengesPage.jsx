import React from 'react';
import { Zap, Wrench } from 'lucide-react';

export default function ChallengesPage() {
  return (
    <div className="space-y-6 animate-fade-up max-w-2xl mx-auto text-center py-20">
      <div className="flex justify-center mb-6">
        <div className="w-24 h-24 bg-slate-100 dark:bg-surface-card rounded-full flex items-center justify-center shadow-inner border border-slate-200 dark:border-surface-border">
          <Wrench size={48} className="text-slate-400 dark:text-slate-500 animate-pulse" />
        </div>
      </div>
      <h1 className="text-3xl font-black font-display text-slate-900 dark:text-white flex items-center justify-center gap-2">
        <Zap size={32} className="text-warning-500" /> Sección en Construcción
      </h1>
      <p className="text-slate-600 dark:text-slate-400 text-lg mt-4 max-w-md mx-auto">
        Estamos preparando nuevos y emocionantes retos diarios y semanales para que pongas a prueba tus habilidades.
      </p>
      <div className="mt-8 inline-block bg-accent-50 dark:bg-accent-500/10 border border-accent-200 dark:border-accent-500/30 text-accent-700 dark:text-accent-400 font-medium px-4 py-2 rounded-xl text-sm">
        Próximamente en Espacio Educa
      </div>
    </div>
  );
}
