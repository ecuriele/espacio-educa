import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { selectCurrentUser, selectIsTeacher } from '@store/slices/authSlice';
import ProgressBar from '@components/gamification/ProgressBar';
import {
  Sprout, Rocket, BookOpen, Lock, Clock, WifiOff, RefreshCw,
  CheckCircle2, Target, Calendar
} from 'lucide-react';
import {
  getModulos,
  getLeccionesByModulo,
  getProgresoPorModulo,
} from '@services/firebase/firestoreService';
import { FIREBASE_CONFIGURED } from '@services/firebase/config';

const LEVEL_LABELS = {
  basic:    {
    label: 'Módulo Básico',
    icon:  <Sprout size={24} />,
    color: 'text-accent-600 dark:text-accent-400',
    badge: 'bg-accent-100 dark:bg-accent-500/15 text-accent-700 dark:text-accent-400 border-accent-200 dark:border-accent-500/30',
  },
  advanced: {
    label: 'Módulo Avanzado',
    icon:  <Rocket size={24} />,
    color: 'text-slate-700 dark:text-brand-400',
    badge: 'bg-slate-100 dark:bg-brand-500/15 text-slate-700 dark:text-brand-400 border-slate-200 dark:border-brand-500/30',
  },
};

const FALLBACK_MODULES = [
  { id: 'html-basics', titulo: 'HTML Fundamentos', nivel: 'basico', orden: 1, totalLecciones: 4, etiquetas: ['HTML', 'Estructura'], horasEstimadas: 4, descripcion: 'Aprende la estructura base de las páginas web.', isPublished: true },
  { id: 'css-basics',  titulo: 'CSS Estilos',      nivel: 'basico', orden: 2, totalLecciones: 3, etiquetas: ['CSS', 'Diseño'],      horasEstimadas: 5, descripcion: 'Da vida a tus páginas con estilos visuales.',  isPublished: true },
  { id: 'js-basics',   titulo: 'JavaScript Básico', nivel: 'basico', orden: 3, totalLecciones: 3, etiquetas: ['JS', 'Lógica'],      horasEstimadas: 6, descripcion: 'Agrega interactividad a tus sitios web.',     isPublished: true },
];

export default function ModulesPage() {
  const user      = useSelector(selectCurrentUser);
  const isTeacher = useSelector(selectIsTeacher);
  const userId    = user?.uid || user?.id;

  const [modulos,    setModulos]    = useState([]);
  const [totalMap,   setTotalMap]   = useState({}); // { [moduloId]: totalLecciones }
  const [progresoMap,setProgresoMap]= useState({}); // { [moduloId]: leccionesEntregadas }
  const [loading,    setLoading]    = useState(true);
  const [fromCache,  setFromCache]  = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        if (!FIREBASE_CONFIGURED) {
          setModulos(FALLBACK_MODULES);
          return;
        }

        // 1. Cargar módulos
        const data = await getModulos();
        if (!mounted) return;
        const published = data.filter(m => m.isPublished || m.publicado);

        if (!navigator.onLine && data.length > 0) setFromCache(true);
        setModulos(published);
        if (mounted) setLoading(false);

        // 2. Cargar total de actividades (popcodes) por módulo
        const totales = {};
        await Promise.all(
          published.map(async m => {
            try {
              const lecs = await getLeccionesByModulo(m.id);
              let totalPopcodes = 0;
              lecs.forEach(lec => {
                const codeBlocks = (lec.bloques || []).filter(b => b.type === 'code');
                totalPopcodes += codeBlocks.length;
              });
              totales[m.id] = totalPopcodes;
            } catch {
              totales[m.id] = 0;
            }
          })
        );
        if (mounted) setTotalMap(totales);

        // 3. Cargar progreso real del estudiante (basado en entregas únicas)
        if (userId) {
          const prog = await getProgresoPorModulo(userId);
          if (mounted) setProgresoMap(prog);
        }
      } catch (err) {
        console.warn('[ModulesPage] Error cargando módulos:', err.message);
        if (mounted) setModulos([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    const onOnline  = () => { setFromCache(false); };
    const onOffline = () => {};
    window.addEventListener('online',  onOnline);
    window.addEventListener('offline', onOffline);

    return () => {
      mounted = false;
      window.removeEventListener('online',  onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, [userId, isTeacher]);

  const modulosBasicos    = modulos.filter(m => m.nivel === 'basico'   || m.level === 'basic');
  const modulosAvanzados  = modulos.filter(m => m.nivel === 'avanzado' || m.level === 'advanced');

  const renderLevel = (listaModulos, levelKey) => {
    if (listaModulos.length === 0) return null;
    const meta = LEVEL_LABELS[levelKey];
    return (
      <section key={levelKey}>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-slate-700 dark:text-slate-300">{meta.icon}</span>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">{meta.label}</h2>
          <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${meta.badge}`}>
            {listaModulos.length} módulo{listaModulos.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {listaModulos.map((modulo, idx) => {
            const total      = totalMap[modulo.id] ?? modulo.totalLecciones ?? 0;
            const completadas = progresoMap[modulo.id] ?? 0;
            const porcentaje  = total > 0 ? Math.round((completadas / total) * 100) : 0;
            const isLocked    = levelKey === 'advanced' && idx > 0;
            const completo    = porcentaje === 100 && total > 0;

            return (
              <div
                key={modulo.id}
                className={`bg-white dark:bg-surface-card border rounded-2xl p-5 flex flex-col gap-3 transition-all duration-200 shadow-sm dark:shadow-none ${
                  isLocked
                    ? 'border-slate-200 dark:border-surface-border opacity-60 cursor-not-allowed'
                    : completo
                      ? 'border-green-500/40 dark:border-green-500/30'
                      : 'border-slate-200 dark:border-surface-border hover:border-accent-500/40 dark:hover:border-brand-500/40 hover:shadow-glow-accent dark:hover:shadow-brand-md'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-semibold ${meta.color}`}>Módulo {modulo.orden ?? modulo.order}</span>
                      {isLocked && <span className="text-xs text-slate-500 flex items-center gap-1"><Lock size={12} /> Bloqueado</span>}
                      {completo && <span className="text-xs text-green-400 flex items-center gap-1"><CheckCircle2 size={12} /> Completo</span>}
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm leading-snug">{modulo.titulo ?? modulo.title}</h3>
                    {modulo.fechaLimite && (
                      <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1 font-medium">
                        <Calendar size={10} className="text-[#ea5837]" />
                        Límite: {new Date(modulo.fechaLimite + 'T23:59:59').toLocaleDateString('es-VE', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                  <span className="flex-shrink-0 ml-2 text-slate-700 dark:text-slate-300">{meta.icon}</span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{modulo.descripcion ?? modulo.description}</p>

                {/* Etiquetas */}
                <div className="flex flex-wrap gap-1.5">
                  {(modulo.etiquetas || modulo.tags || []).map(tag => (
                    <span key={tag} className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-surface-hover text-slate-600 dark:text-slate-400 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Progreso real */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 flex items-center gap-1.5">
                      <Target size={11} />
                      Progreso
                    </span>
                    <span className={`text-xs font-bold ${completo ? 'text-green-400' : 'text-slate-500 dark:text-slate-300'}`}>
                      {completadas}/{total} actividades
                    </span>
                  </div>
                  <ProgressBar
                    percent={porcentaje}
                    size="sm"
                    color={completo ? 'accent' : levelKey === 'basic' ? 'accent' : 'brand'}
                    showPercent={porcentaje > 0}
                  />
                </div>

                {/* Acción */}
                <div className="flex items-center justify-end mt-auto pt-1">
                  {!isLocked && (
                    <Link
                      to={`/modulos/${modulo.id}`}
                      id={`start-course-${modulo.id}`}
                      className="text-xs font-semibold px-3 py-1.5 bg-[#ea5837] hover:bg-[#c84223] text-white rounded-lg transition-colors shadow-sm dark:shadow-glow-accent"
                    >
                      {porcentaje === 100 && total > 0 ? '✓ Repasar' : porcentaje > 0 ? 'Continuar →' : 'Comenzar →'}
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    );
  };

  return (
    <div className="space-y-8 animate-fade-up">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black font-display text-slate-900 dark:text-white flex items-center gap-3">
          <BookOpen className="text-accent-600 dark:text-brand-400" size={28} />
          Módulos de aprendizaje
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
          Pensum organizado — el progreso se actualiza al entregar actividades.
        </p>
      </div>

      {/* Banner offline */}
      {fromCache && (
        <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-xl text-sm text-amber-700 dark:text-amber-400">
          <WifiOff size={16} className="shrink-0" />
          <span>Sin conexión — mostrando módulos guardados localmente.</span>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-3">
          <RefreshCw size={28} className="animate-spin" />
          <p className="text-sm">Cargando módulos...</p>
        </div>
      ) : modulos.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-surface-card border border-slate-200 dark:border-surface-border rounded-2xl">
          <BookOpen size={36} className="text-slate-200 dark:text-slate-700 mb-4" />
          <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-400 mb-1">
            Aún no hay módulos disponibles
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 text-center max-w-xs">
            Tu profesor está preparando el contenido. Vuelve pronto.
          </p>
        </div>
      ) : (
        <>
          {(!user || user.salon?.toLowerCase() === 'básico' || isTeacher) && renderLevel(modulosBasicos, 'basic')}
          {(!user || user.salon?.toLowerCase() === 'avanzado' || isTeacher) && renderLevel(modulosAvanzados, 'advanced')}
          {/* Si no tiene salon asignado, mostrar ambos */}
          {user && !user.salon && !isTeacher && (
            <>
              {renderLevel(modulosBasicos, 'basic')}
              {renderLevel(modulosAvanzados, 'advanced')}
            </>
          )}
        </>
      )}
    </div>
  );
}
