import React, { useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@store/slices/authSlice';
import {
  RETOS_BASICO,
  RETOS_AVANZADO,
  getRetoDiarioHoy,
  getRetoSemanalActual,
} from '../data/retos';
import {
  Zap,
  Calendar,
  Trophy,
  Star,
  Code2,
  ChevronRight,
  ChevronDown,
  Flame,
  BookOpen,
  Clock,
  CheckCircle2,
  Copy,
  Check,
  Tag,
  ArrowRight,
  Sparkles,
  LayoutGrid,
  List,
} from 'lucide-react';

// ─── Paleta por nivel ───────────────────────────────────────────────────────
const NIVEL_META = {
  basico: {
    label: 'Básico',
    sublabel: 'HTML · CSS · JavaScript',
    gradient: 'from-teal-500 to-cyan-400',
    badgeBg: 'bg-teal-500/10 dark:bg-teal-500/15',
    badgeText: 'text-teal-600 dark:text-teal-400',
    badgeBorder: 'border-teal-500/30',
    ring: 'ring-teal-500/30',
    glowCard: 'hover:border-teal-500/40 dark:hover:border-teal-500/30',
    dot: 'bg-teal-400',
  },
  avanzado: {
    label: 'Avanzado',
    sublabel: 'POO · JS Avanzado',
    gradient: 'from-violet-500 to-purple-400',
    badgeBg: 'bg-violet-500/10 dark:bg-violet-500/15',
    badgeText: 'text-violet-600 dark:text-violet-400',
    badgeBorder: 'border-violet-500/30',
    ring: 'ring-violet-500/30',
    glowCard: 'hover:border-violet-500/40 dark:hover:border-violet-500/30',
    dot: 'bg-violet-400',
  },
};

// ─── Paleta por tipo de reto ────────────────────────────────────────────────
const TIPO_META = {
  diario: {
    label: 'Diario',
    icon: <Flame size={13} />,
    bg: 'bg-warning-500/10',
    text: 'text-warning-500',
    border: 'border-warning-500/30',
  },
  semanal: {
    label: 'Semanal',
    icon: <Trophy size={13} />,
    bg: 'bg-accent-500/10',
    text: 'text-accent-500',
    border: 'border-accent-500/30',
  },
};

// ─── Helpers ────────────────────────────────────────────────────────────────
function NivelBadge({ nivel }) {
  const m = NIVEL_META[nivel];
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${m.badgeBg} ${m.badgeText} ${m.badgeBorder}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
      {m.label}
    </span>
  );
}

function TipoBadge({ tipo }) {
  const m = TIPO_META[tipo];
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${m.bg} ${m.text} ${m.border}`}>
      {m.icon}
      {m.label}
    </span>
  );
}

function XpBadge({ xp }) {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-300 border border-brand-500/20">
      <Star size={11} />
      {xp} XP
    </span>
  );
}

// ─── Botón de copiar código ─────────────────────────────────────────────────
function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };
  return (
    <button
      onClick={handleCopy}
      className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-700/60 hover:bg-slate-600/80 text-slate-300 hover:text-white transition-all"
      title="Copiar código"
    >
      {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
    </button>
  );
}

// ─── Tarjeta de reto expandible ─────────────────────────────────────────────
function RetoCard({ reto, destacado = false }) {
  const [abierto, setAbierto] = useState(destacado);
  const nivel = NIVEL_META[reto.nivel];

  return (
    <div
      className={`
        bg-white dark:bg-surface-card border rounded-2xl transition-all duration-200 shadow-sm dark:shadow-none
        ${destacado ? `border-2 ${reto.nivel === 'basico' ? 'border-teal-500/50' : 'border-violet-500/50'} dark:shadow-lg` : 'border-slate-200 dark:border-surface-border'}
        ${nivel.glowCard}
        hover:shadow-md dark:hover:shadow-brand-md
      `}
    >
      {/* Cabecera siempre visible */}
      <button
        className="w-full text-left p-5 flex items-start gap-4"
        onClick={() => setAbierto(v => !v)}
      >
        {/* Icono de tipo */}
        <div className={`flex-shrink-0 mt-0.5 w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${nivel.gradient} text-white shadow-md`}>
          {reto.tipo === 'diario' ? <Flame size={18} /> : <Trophy size={18} />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
            <TipoBadge tipo={reto.tipo} />
            <NivelBadge nivel={reto.nivel} />
            <XpBadge xp={reto.xp} />
            {destacado && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-warning-500/15 text-warning-500 border border-warning-500/30">
                <Sparkles size={11} /> Hoy
              </span>
            )}
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-sm leading-snug">
            {reto.titulo}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
            {reto.descripcion}
          </p>

          <div className="flex flex-wrap gap-1.5 mt-2">
            {reto.etiquetas.map(tag => (
              <span key={tag} className="flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-surface-hover text-slate-500 dark:text-slate-400">
                <Tag size={8} /> {tag}
              </span>
            ))}
          </div>
        </div>

        <div className={`flex-shrink-0 mt-1 transition-transform duration-200 text-slate-400 ${abierto ? 'rotate-0' : '-rotate-90'}`}>
          <ChevronDown size={18} />
        </div>
      </button>

      {/* Contenido expandible */}
      {abierto && (
        <div className="px-5 pb-5 space-y-4 border-t border-slate-100 dark:border-surface-border pt-4">
          {/* Descripción completa */}
          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
            {reto.descripcion}
          </p>

          {/* Instrucciones */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <List size={12} /> Instrucciones
            </h4>
            <ol className="space-y-1.5">
              {reto.instrucciones.map((inst, i) => (
                <li key={i} className="flex gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <span className="flex-shrink-0 w-5 h-5 rounded-full bg-brand-500/10 text-brand-600 dark:text-brand-400 flex items-center justify-center text-[11px] font-bold mt-0.5">
                    {i + 1}
                  </span>
                  <span>{inst}</span>
                </li>
              ))}
            </ol>
          </div>

          {/* Criterios de evaluación */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <CheckCircle2 size={12} /> Criterios de evaluación
            </h4>
            <ul className="space-y-1.5">
              {reto.criterios.map((crit, i) => (
                <li key={i} className="flex gap-2 text-sm text-slate-700 dark:text-slate-300">
                  <CheckCircle2 size={15} className="flex-shrink-0 mt-0.5 text-green-500 dark:text-green-400" />
                  <span>{crit}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Código inicial si aplica */}
          {reto.codigo_inicial && (
            <div>
              <h4 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Code2 size={12} /> Código de partida
              </h4>
              <div className="relative">
                <pre className="bg-slate-900 dark:bg-[#0d0f1a] text-slate-200 text-xs rounded-xl p-4 overflow-x-auto leading-relaxed font-mono border border-slate-700/50 max-h-72">
                  <code>{reto.codigo_inicial}</code>
                </pre>
                <CopyButton text={reto.codigo_inicial} />
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Clock size={12} />
              <span>Semana {reto.semana}{reto.dia ? ` · Día ${reto.dia}` : ''}</span>
              <span>·</span>
              <span className="capitalize">{reto.tipo_entrega === 'codigo' ? '🖥 Código' : reto.tipo_entrega === 'captura' ? '📸 Captura' : '🔗 URL'}</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-brand-600 dark:text-brand-400">
              <Star size={13} />
              {reto.xp} XP al completar
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Sección "Reto de hoy" ──────────────────────────────────────────────────
function RetosDeHoySection({ nivel }) {
  const retoDiario = getRetoDiarioHoy(nivel);
  const retoSemanal = getRetoSemanalActual(nivel);
  const m = NIVEL_META[nivel];

  return (
    <div className="space-y-4">
      <div className={`relative overflow-hidden rounded-2xl p-5 bg-gradient-to-br ${m.gradient}`}>
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, white 0%, transparent 60%)' }} />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={16} className="text-white/80" />
            <span className="text-white/80 text-xs font-semibold uppercase tracking-wider">Retos de hoy</span>
          </div>
          <h2 className="text-white font-black text-lg font-display">{m.label} · {m.sublabel}</h2>
          <p className="text-white/70 text-sm mt-0.5">Completa los retos para ganar XP y mantener tu racha</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {retoDiario && <RetoCard reto={retoDiario} destacado />}
        {retoSemanal && <RetoCard reto={retoSemanal} destacado />}
      </div>
    </div>
  );
}

// ─── Listado de todos los retos ─────────────────────────────────────────────
function TodosLosRetosSection({ nivel }) {
  const retos = nivel === 'basico' ? RETOS_BASICO : RETOS_AVANZADO;
  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroSemana, setFiltroSemana] = useState('todas');

  const semanas = useMemo(() => {
    const s = [...new Set(retos.map(r => r.semana))].sort((a, b) => a - b);
    return s;
  }, [retos]);

  const retosFiltrados = useMemo(() => {
    return retos.filter(r => {
      if (filtroTipo !== 'todos' && r.tipo !== filtroTipo) return false;
      if (filtroSemana !== 'todas' && r.semana !== Number(filtroSemana)) return false;
      return true;
    });
  }, [retos, filtroTipo, filtroSemana]);

  const m = NIVEL_META[nivel];

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Tipo:</span>
        {['todos', 'diario', 'semanal'].map(tipo => (
          <button
            key={tipo}
            onClick={() => setFiltroTipo(tipo)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
              filtroTipo === tipo
                ? `${m.badgeBg} ${m.badgeText} ${m.badgeBorder}`
                : 'bg-slate-100 dark:bg-surface-hover text-slate-600 dark:text-slate-400 border-transparent hover:border-slate-300 dark:hover:border-surface-border'
            }`}
          >
            {tipo === 'todos' ? 'Todos' : tipo === 'diario' ? '🔥 Diarios' : '🏆 Semanales'}
          </button>
        ))}

        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-2">Semana:</span>
        <select
          value={filtroSemana}
          onChange={e => setFiltroSemana(e.target.value)}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg border bg-slate-100 dark:bg-surface-hover text-slate-600 dark:text-slate-400 border-transparent dark:border-surface-border cursor-pointer"
        >
          <option value="todas">Todas</option>
          {semanas.map(s => (
            <option key={s} value={s}>Semana {s}</option>
          ))}
        </select>
      </div>

      {/* Contador */}
      <p className="text-xs text-slate-500 dark:text-slate-400">
        Mostrando <strong className={m.badgeText}>{retosFiltrados.length}</strong> retos
      </p>

      {/* Lista */}
      <div className="space-y-3">
        {retosFiltrados.map(reto => (
          <RetoCard key={reto.id} reto={reto} />
        ))}
        {retosFiltrados.length === 0 && (
          <div className="text-center py-12 text-slate-400 dark:text-slate-500">
            <Trophy size={40} className="mx-auto mb-3 opacity-40" />
            <p className="font-medium">No hay retos con esos filtros</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Estadísticas rápidas ───────────────────────────────────────────────────
function StatsRow({ nivel }) {
  const retos = nivel === 'basico' ? RETOS_BASICO : RETOS_AVANZADO;
  const diarios = retos.filter(r => r.tipo === 'diario').length;
  const semanales = retos.filter(r => r.tipo === 'semanal').length;
  const xpTotal = retos.reduce((sum, r) => sum + r.xp, 0);
  const semanas = [...new Set(retos.map(r => r.semana))].length;
  const m = NIVEL_META[nivel];

  const stats = [
    { icon: <Flame size={16} />, label: 'Retos diarios', valor: diarios, color: 'text-warning-500' },
    { icon: <Trophy size={16} />, label: 'Retos semanales', valor: semanales, color: 'text-accent-500' },
    { icon: <Star size={16} />, label: 'XP disponible', valor: xpTotal.toLocaleString(), color: 'text-brand-500 dark:text-brand-300' },
    { icon: <Calendar size={16} />, label: 'Semanas', valor: semanas, color: m.badgeText },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stats.map(s => (
        <div key={s.label} className="bg-white dark:bg-surface-card border border-slate-200 dark:border-surface-border rounded-xl p-3 flex items-center gap-3 shadow-sm dark:shadow-none">
          <span className={s.color}>{s.icon}</span>
          <div>
            <p className="text-xl font-black text-slate-900 dark:text-white leading-none">{s.valor}</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{s.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Página principal ────────────────────────────────────────────────────────
export default function ChallengesPage() {
  const user = useSelector(selectCurrentUser);

  // Determina el nivel del usuario (básico o avanzado) según su salón
  const nivelUsuario = useMemo(() => {
    if (!user?.salon) return 'basico';
    return user.salon.toLowerCase().includes('avanzad') ? 'avanzado' : 'basico';
  }, [user?.salon]);

  const [nivelTab, setNivelTab] = useState(nivelUsuario);
  const [vista, setVista] = useState('hoy'); // 'hoy' | 'todos'
  const m = NIVEL_META[nivelTab];

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Hero header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Zap size={20} className="text-warning-500" />
          <h1 className="text-2xl font-black font-display text-slate-900 dark:text-white">
            Banco de Retos
          </h1>
        </div>
        <p className="text-slate-600 dark:text-slate-400 text-sm">
          Pon a prueba tus habilidades con retos diarios y semanales. ¡Completa para ganar XP!
        </p>
      </div>

      {/* Tabs de nivel */}
      <div className="flex gap-2 p-1 bg-slate-100 dark:bg-surface-card rounded-xl border border-slate-200 dark:border-surface-border w-fit">
        {['basico', 'avanzado'].map(n => {
          const meta = NIVEL_META[n];
          const activo = nivelTab === n;
          return (
            <button
              key={n}
              onClick={() => setNivelTab(n)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 flex items-center gap-2 ${
                activo
                  ? `bg-gradient-to-r ${meta.gradient} text-white shadow-md`
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${activo ? 'bg-white/70' : meta.dot}`} />
              {meta.label}
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activo ? 'bg-white/20' : 'bg-slate-200 dark:bg-surface-hover'}`}>
                {meta.sublabel}
              </span>
            </button>
          );
        })}
      </div>

      {/* Stats */}
      <StatsRow nivel={nivelTab} />

      {/* Tabs hoy / todos */}
      <div className="flex gap-1 border-b border-slate-200 dark:border-surface-border">
        {[
          { id: 'hoy', label: '⚡ Retos de hoy', icon: <Sparkles size={14} /> },
          { id: 'todos', label: 'Banco completo', icon: <LayoutGrid size={14} /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setVista(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all -mb-px ${
              vista === tab.id
                ? `border-current ${m.badgeText}`
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Contenido */}
      {vista === 'hoy' ? (
        <RetosDeHoySection nivel={nivelTab} />
      ) : (
        <TodosLosRetosSection nivel={nivelTab} />
      )}

      {/* Nota para el profesor */}
      <div className="bg-slate-50 dark:bg-surface-card border border-slate-200 dark:border-surface-border rounded-2xl p-4">
        <div className="flex gap-3 items-start">
          <BookOpen size={18} className="flex-shrink-0 mt-0.5 text-brand-500" />
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">¿Cómo entregar un reto?</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Copia el código de partida, complétalo en el <strong>Sandbox</strong> o en tu editor,
              y cuando esté listo entrégalo en la sección de <strong>Mis Entregas</strong>.
              El profesor revisará que cumpla todos los criterios de evaluación listados en el reto.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
