import React, { useState } from 'react';
import CodeEditor from '@components/editor/CodeEditor';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@store/slices/authSlice';
import { Terminal, Send, Check, Loader2 } from 'lucide-react';
import { addEntrega } from '@services/firebase/firestoreService';

export default function EditorPage() {
  const user = useSelector(selectCurrentUser);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [code, setCode] = useState({ html: '', css: '', js: '' });

  const handleOnChange = (lang, value) => {
    setCode(prev => ({ ...prev, [lang]: value }));
  };

  const handleSubmit = async () => {
    if (!user) return alert('Debes iniciar sesión para entregar');
    setSubmitting(true);
    try {
      await addEntrega({
        estudianteId: user.uid || user.id,
        estudianteNombre: user.nombreMostrar || user.displayName || user.correo || 'Estudiante',
        moduloId: 'editor_libre',
        moduloTitulo: 'Editor de Código Libre',
        leccionId: 'practica',
        leccionTitulo: 'Práctica General',
        tipo: 'editor',
        htmlCode: code.html,
        cssCode: code.css,
        jsCode: code.js,
        xpReward: 30,
      });
      setSubmitted(true);
    } catch (err) {
      console.error('Error enviando el código:', err);
      alert('Hubo un error al enviar tu código. Intenta de nuevo.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 animate-fade-up">
      <div>
        <h1 className="text-xl font-black font-display text-slate-900 dark:text-white flex items-center gap-2">
          <Terminal size={24} className="text-brand-600 dark:text-brand-400" /> Editor de código
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-0.5">Practica y envía tus ejercicios directamente desde aquí.</p>
      </div>
      <CodeEditor showPreview onChange={handleOnChange} />
      <div className="flex justify-end">
        <button
          id="submit-exercise-btn"
          onClick={handleSubmit}
          disabled={submitting || submitted}
          className="px-6 py-2.5 bg-[#ea5837] hover:bg-[#c84223] disabled:opacity-60 text-white font-semibold rounded-xl text-sm transition-all shadow-sm dark:shadow-glow-accent flex items-center gap-2"
        >
          {submitting ? <><Loader2 size={18} className="animate-spin" /> Enviando...</> : submitted ? <><Check size={18} /> Enviado</> : <><Send size={18} /> Entregar ejercicio</>}
        </button>
      </div>
      {submitted && (
        <div className="p-4 bg-green-100 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30 rounded-xl text-green-700 dark:text-green-400 text-sm flex items-center gap-2">
          <Check size={16} /> ¡Tu código ha sido enviado al profesor exitosamente!
        </div>
      )}
    </div>
  );
}
