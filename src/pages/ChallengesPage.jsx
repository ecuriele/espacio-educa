import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@store/slices/authSlice';
import { crearEntrega } from '@services/firebase/firestoreService';
import { RETOS_BASICO, RETOS_AVANZADO } from '../data/retos';
import CodeEditor from '@components/editor/CodeEditor';
import toast from 'react-hot-toast';
import {
  Zap, Trophy, Flame, Star, CheckCircle2, Send,
  ChevronDown, ChevronUp, Clock, List, Sparkles,
  RotateCcw, BookOpen, AlertTriangle,
} from 'lucide-react';

// ─── Obtener reto del día / semana ──────────────────────────────────────────
function getDayOfYear() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now - start) / 86400000);
}

function getWeekOfYear() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  return Math.ceil(((now - start) / 86400000 + start.getDay() + 1) / 7);
}

function getRetoDiario(nivel) {
  const pool = (nivel === 'avanzado' ? RETOS_AVANZADO : RETOS_BASICO)
    .filter(r => r.tipo === 'diario');
  return pool[getDayOfYear() % pool.length];
}

function getRetoSemanal(nivel) {
  const pool = (nivel === 'avanzado' ? RETOS_AVANZADO : RETOS_BASICO)
    .filter(r => r.tipo === 'semanal');
  return pool[getWeekOfYear() % pool.length];
}

// ─── Helpers de tiempo ───────────────────────────────────────────────────────
function tiempoRestanteDiario() {
  const now = new Date();
  const fin = new Date(now);
  fin.setHours(23, 59, 59, 999);
  const diff = fin - now;
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  return `${h}h ${m}m`;
}

function tiempoRestanteSemanal() {
  const now = new Date();
  const fin = new Date(now);
  const diasHastaDomingo = 7 - now.getDay();
  fin.setDate(now.getDate() + diasHastaDomingo);
  fin.setHours(23, 59, 59, 999);
  const diff = fin - now;
  const d = Math.floor(diff / 86400000);
  const h = Math.floor((diff % 86400000) / 3600000);
  return `${d}d ${h}h`;
}

// ─── Panel expandible de instrucciones ──────────────────────────────────────
function InstruccionesPanel({ reto, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-surface-border rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-surface-hover transition-colors"
      >
        <span className="flex items-center gap-2">
          <List size={15} />
          Instrucciones y criterios
        </span>
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>

      {open && (
        <div className="px-4 pb-4 space-y-4 border-t border-slate-200 dark:border-surface-border">
          {/* Descripción */}
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
            {reto.descripcion}
          </p>

          {/* Instrucciones */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
              Qué hacer
            </p>
            <ol className="space-y-2">
              {reto.instrucciones.map((inst, i) => (
                <li key={i} className="flex gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#ea5837]/10 text-[#ea5837] flex items-center justify-center text-[11px] font-bold mt-0.5">
                    {i + 1}
                  </span>
                  {inst}
                </li>
              ))}
            </ol>
          </div>

          {/* Criterios */}
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
              Criterios de evaluación
            </p>
            <ul className="space-y-1.5">
              {reto.criterios.map((c, i) => (
                <li key={i} className="flex gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <CheckCircle2 size={15} className="flex-shrink-0 mt-0.5 text-green-500" />
                  {c}
                </li>
              ))}
            </ul>
          </div>

          {/* Etiquetas */}
          <div className="flex flex-wrap gap-1.5 pt-1">
            {reto.etiquetas.map(tag => (
              <span key={tag} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-200 dark:bg-surface-hover text-slate-500 dark:text-slate-400 font-medium">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Bloque de un reto con editor integrado ──────────────────────────────────
function RetoConEditor({ reto, tipo, userId, userName, onEntregado }) {
  // Estado del editor
  const [code, setCode] = useState(() => {
    const base = reto.codigo_inicial || '';
    // Detectar si es HTML completo o solo JS
    const esHTML = base.trimStart().startsWith('<!DOCTYPE') || base.trimStart().startsWith('<');
    if (esHTML) {
      return { html: base, css: '', js: '' };
    }
    return { html: '', css: '', js: base };
  });

  const [editorKey, setEditorKey] = useState('initial');
  const [enviando, setEnviando] = useState(false);
  const [entregado, setEntregado] = useState(false);

  const handleCodeChange = useCallback((lang, value) => {
    setCode(prev => ({ ...prev, [lang]: value }));
  }, []);

  const handleReset = () => {
    const base = reto.codigo_inicial || '';
    const esHTML = base.trimStart().startsWith('<!DOCTYPE') || base.trimStart().startsWith('<');
    setCode(esHTML ? { html: base, css: '', js: '' } : { html: '', css: '', js: base });
    setEditorKey(Date.now().toString());
  };

  const handleEntregar = async () => {
    if (!userId) {
      toast.error('Debes iniciar sesión para entregar');
      return;
    }
    if (enviando) return;

    // Verificar que hay algo escrito
    const hayContenido = code.html.trim() || code.css.trim() || code.js.trim();
    if (!hayContenido) {
      toast.error('Escribe algo antes de entregar 😊');
      return;
    }

    setEnviando(true);
    try {
      await crearEntrega({
        estudianteId: userId,
        estudianteNombre: userName || 'Estudiante',
        // Usamos el id del reto como "leccionId" para que aparezca en Mis Entregas
        leccionId: `reto_${reto.id}`,
        leccionTitulo: `${tipo === 'diario' ? '🔥 Reto Diario' : '🏆 Reto Semanal'}: ${reto.titulo}`,
        moduloId: `retos_${reto.nivel}`,
        popcodeIndex: 0,
        popcodeTitulo: reto.titulo,
        htmlCode: code.html,
        cssCode: code.css,
        jsCode: code.js,
      });

      setEntregado(true);
      onEntregado?.();

      toast.custom((t) => (
        <div className={`max-w-sm w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl p-4 flex items-center gap-3 transition-all duration-300 ${t.visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg flex-shrink-0">
            <Trophy size={22} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-slate-900 dark:text-white text-sm">¡Reto entregado!</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Tu profesor lo revisará y te asignará la nota pronto
            </p>
          </div>
        </div>
      ), { duration: 4000, position: 'top-center' });

    } catch (err) {
      console.error(err);
      toast.error('Error al entregar. Intenta de nuevo.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Instrucciones colapsables */}
      <InstruccionesPanel reto={reto} defaultOpen={false} />

      {/* Editor */}
      <CodeEditor
        key={editorKey}
        html={code.html}
        css={code.css}
        js={code.js}
        onChange={handleCodeChange}
        showPreview={true}
        isSandbox={false}
      />

      {/* Barra de acciones */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <button
          onClick={handleReset}
          className="flex items-center gap-1.5 px-3 py-2 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white border border-slate-200 dark:border-surface-border rounded-xl hover:bg-slate-50 dark:hover:bg-surface-hover transition-all"
        >
          <RotateCcw size={14} />
          Reiniciar código
        </button>

        {entregado ? (
          <div className="flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-xl text-green-600 dark:text-green-400 text-sm font-semibold">
            <CheckCircle2 size={16} />
            ¡Entregado! Esperando revisión del profesor
          </div>
        ) : (
          <button
            onClick={handleEntregar}
            disabled={enviando}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#ea5837] hover:bg-[#c84223] disabled:opacity-60 text-white rounded-xl font-semibold text-sm transition-all shadow-sm hover:shadow-md"
          >
            {enviando ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Enviando...
              </>
            ) : (
              <>
                <Send size={16} />
                Entregar reto
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Tarjeta de reto (header + editor) ──────────────────────────────────────
function RetoCard({ reto, tipo, userId, userName }) {
  const [expanded, setExpanded] = useState(true);
  const [entregado, setEntregado] = useState(false);

  const esDiario = tipo === 'diario';
  const tiempoRestante = esDiario ? tiempoRestanteDiario() : tiempoRestanteSemanal();

  const headerGradient = esDiario
    ? 'from-amber-500 to-orange-500'
    : 'from-violet-600 to-purple-500';

  return (
    <div className="bg-white dark:bg-surface-card border border-slate-200 dark:border-surface-border rounded-2xl overflow-hidden shadow-sm dark:shadow-none">
      {/* Header del reto */}
      <div className={`relative bg-gradient-to-r ${headerGradient} p-5`}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 90% 10%, white 0%, transparent 60%)' }} />
        <div className="relative z-10">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-inner flex-shrink-0">
                {esDiario ? <Flame size={22} className="text-white" /> : <Trophy size={22} className="text-white" />}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="text-white/80 text-xs font-semibold uppercase tracking-wider">
                    {esDiario ? 'Reto del Día' : 'Reto de la Semana'}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] font-bold bg-white/20 text-white px-2 py-0.5 rounded-full">
                    <Star size={9} /> {reto.xp} XP
                  </span>
                  {entregado && (
                    <span className="flex items-center gap-1 text-[10px] font-bold bg-green-400/30 text-white px-2 py-0.5 rounded-full">
                      <CheckCircle2 size={9} /> Entregado
                    </span>
                  )}
                </div>
                <h2 className="text-white font-black text-lg font-display leading-snug">
                  {reto.titulo}
                </h2>
              </div>
            </div>

            <button
              onClick={() => setExpanded(v => !v)}
              className="flex-shrink-0 mt-1 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-all"
            >
              {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </button>
          </div>

          {/* Metadatos */}
          <div className="flex items-center gap-3 mt-3 flex-wrap">
            <span className="flex items-center gap-1.5 text-white/70 text-xs">
              <Clock size={12} />
              Expira en {tiempoRestante}
            </span>
            <span className="text-white/40">·</span>
            <span className="text-white/70 text-xs">
              Semana {reto.semana}{reto.dia ? ` · Día ${reto.dia}` : ''}
            </span>
            <span className="text-white/40">·</span>
            <span className="text-white/70 text-xs capitalize">
              {reto.nivel === 'basico' ? '🌱 Básico' : '🚀 Avanzado'}
            </span>
          </div>
        </div>
      </div>

      {/* Editor y controles */}
      {expanded && (
        <div className="p-4 space-y-3">
          <RetoConEditor
            reto={reto}
            tipo={tipo}
            userId={userId}
            userName={userName}
            onEntregado={() => setEntregado(true)}
          />
        </div>
      )}
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function ChallengesPage() {
  const user = useSelector(selectCurrentUser);
  const userId = user?.uid || user?.id;
  const userName = user?.nombreMostrar || user?.displayName || 'Estudiante';

  // Nivel según el salón del usuario
  const nivelUsuario = useMemo(() => {
    if (!user?.salon) return 'basico';
    return user.salon.toLowerCase().includes('avanzad') ? 'avanzado' : 'basico';
  }, [user?.salon]);

  const retoDiario = useMemo(() => getRetoDiario(nivelUsuario), [nivelUsuario]);
  const retoSemanal = useMemo(() => getRetoSemanal(nivelUsuario), [nivelUsuario]);

  // Contador regresivo del tiempo restante del día (actualiza cada minuto)
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 60000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="space-y-6 animate-fade-up">

      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl font-black font-display text-slate-900 dark:text-white flex items-center gap-2">
          <Zap size={24} className="text-warning-500" />
          Retos de Hoy
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Un reto diario y uno semanal. Completa en el editor y entrega directamente aquí.
        </p>
      </div>

      {/* ── Aviso de nivel ── */}
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border text-sm ${
        nivelUsuario === 'avanzado'
          ? 'bg-violet-500/5 border-violet-500/20 text-violet-600 dark:text-violet-400'
          : 'bg-teal-500/5 border-teal-500/20 text-teal-600 dark:text-teal-400'
      }`}>
        <Sparkles size={16} className="flex-shrink-0" />
        <span>
          Mostrando retos del curso <strong>{nivelUsuario === 'avanzado' ? 'Avanzado (POO & JS)' : 'Básico (HTML, CSS & JS)'}</strong>.
          Los retos cambian automáticamente cada día y cada semana.
        </span>
      </div>

      {/* ── Reto Diario ── */}
      {retoDiario ? (
        <RetoCard
          reto={retoDiario}
          tipo="diario"
          userId={userId}
          userName={userName}
        />
      ) : (
        <div className="flex items-center gap-3 p-5 bg-slate-50 dark:bg-surface-card border border-slate-200 dark:border-surface-border rounded-2xl text-slate-500 dark:text-slate-400">
          <AlertTriangle size={18} />
          <span className="text-sm">No hay reto diario disponible hoy.</span>
        </div>
      )}

      {/* ── Reto Semanal ── */}
      {retoSemanal ? (
        <RetoCard
          reto={retoSemanal}
          tipo="semanal"
          userId={userId}
          userName={userName}
        />
      ) : (
        <div className="flex items-center gap-3 p-5 bg-slate-50 dark:bg-surface-card border border-slate-200 dark:border-surface-border rounded-2xl text-slate-500 dark:text-slate-400">
          <AlertTriangle size={18} />
          <span className="text-sm">No hay reto semanal disponible esta semana.</span>
        </div>
      )}

      {/* ── Nota informativa ── */}
      <div className="flex gap-3 items-start px-4 py-3.5 bg-slate-50 dark:bg-surface-card border border-slate-200 dark:border-surface-border rounded-2xl">
        <BookOpen size={16} className="flex-shrink-0 mt-0.5 text-brand-500" />
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Una vez entregado, tu profesor recibirá tu código en el panel de revisión.
          Puedes ver el estado de todas tus entregas en{' '}
          <a href="/mis-entregas" className="text-[#ea5837] font-semibold hover:underline">
            Mis Entregas
          </a>.
          Los XP se acreditan automáticamente al entregar.
        </p>
      </div>
    </div>
  );
}
