import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { selectCurrentUser } from '@store/slices/authSlice';
import { selectStreak, selectTotalXp, selectRank, selectRankProgress, recordDailyActivity, setInitialXp } from '@store/slices/gamificationSlice';
import { selectProgressSummary, loadProgressSummary } from '@store/slices/progressSlice';
import { selectIsOnline } from '@store/slices/uiSlice';
import ProgressBar from '@components/gamification/ProgressBar';
import { BookOpen, Terminal, Rocket, CheckCircle2, ChevronRight, Hand, Trophy, Flame, Star, Calendar, Target } from 'lucide-react';
import StreakBadge from '@components/gamification/StreakBadge';
import { getIconForEmoji } from '@utils/iconMap';
import { getModulos, getLeccionesByModulo, getProgresoPorModulo } from '@services/firebase/firestoreService';

export default function DashboardPage() {
  const dispatch  = useDispatch();
  const user      = useSelector(selectCurrentUser);
  const streak    = useSelector(selectStreak);
  const totalXp   = useSelector(selectTotalXp);
  const rank      = useSelector(selectRank);
  const rankPct   = useSelector(selectRankProgress);
  const summary   = useSelector(selectProgressSummary);
  const isOnline  = useSelector(selectIsOnline);
  const [allModules, setAllModules] = useState([]);
  const [totalMap, setTotalMap] = useState({});
  const [progresoMap, setProgresoMap] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      if (totalXp === 0 && user.xp > 0) {
        dispatch(setInitialXp(user.xp));
      }
      dispatch(recordDailyActivity(user.id));
      dispatch(loadProgressSummary(user.id));
    }
    getModulos().then(async (mods) => {
      const published = mods.filter(m => m.isPublished || m.publicado);
      const userLevel = user?.salon?.toLowerCase() === 'avanzado' ? 'avanzado' : 'basico';
      const filteredMods = published.filter(m => {
        if (user?.rol === 'profesor' || user?.rol === 'admin') return true;
        const modLevel = (m.nivel || m.level || 'basico').toLowerCase();
        return modLevel === userLevel;
      });
      setAllModules(filteredMods);
      const totales = {};
      await Promise.all(
        filteredMods.map(async m => {
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
      setTotalMap(totales);
      if (user?.id) {
        getProgresoPorModulo(user.id).then(prog => {
          setProgresoMap(prog);
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    });
  }, [dispatch, user]);

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return '¡Buenos días';
    if (h < 18) return '¡Buenas tardes';
    return '¡Buenas noches';
  };

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h1 className="text-2xl font-black font-display text-slate-900 dark:text-white">
          {greeting()}, {user?.nombreMostrar?.split(' ')[0] ?? 'Estudiante'}! <Hand size={28} className="inline-block text-warning-500 dark:text-warning-400 animate-badge-pop" />
        </h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
          {isOnline ? 'Estás conectado. Tu progreso se sincroniza automáticamente.' : 'Estás offline. Sigue aprendiendo, todo se guardará aquí.'}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Racha */}
        <div className="bg-white dark:bg-surface-card border border-slate-200 dark:border-surface-border rounded-2xl p-4 shadow-sm dark:shadow-none">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-2">Racha actual</p>
          <div className="flex items-center gap-2">
            <span className="text-warning-500"><Flame size={28} /></span>
            <span className="text-3xl font-black text-warning-500 dark:text-warning-400">{streak?.rachaActual ?? 0}</span>
            <span className="text-sm text-slate-500 dark:text-slate-400">días</span>
          </div>
        </div>

        {/* XP Total */}
        <div className="bg-white dark:bg-surface-card border border-slate-200 dark:border-surface-border rounded-2xl p-4 shadow-sm dark:shadow-none">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-2">XP Total</p>
          <div className="flex items-center gap-2">
            <span className="text-brand-500"><Star size={28} /></span>
            <span className="text-3xl font-black text-slate-800 dark:text-brand-300">{totalXp?.toLocaleString() ?? 0}</span>
          </div>
        </div>

        {/* Rango */}
        <div className="bg-white dark:bg-surface-card border border-slate-200 dark:border-surface-border rounded-2xl p-4 shadow-sm dark:shadow-none">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-2">Rango</p>
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center">{getIconForEmoji(rank?.icon, 28)}</span>
            <span className="text-lg font-bold text-slate-900 dark:text-white">{rank?.label}</span>
          </div>
          <ProgressBar percent={rankPct} size="sm" color="brand" showPercent={false} className="mt-2" />
        </div>

        {/* Días activos */}
        <div className="bg-white dark:bg-surface-card border border-slate-200 dark:border-surface-border rounded-2xl p-4 shadow-sm dark:shadow-none">
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-2">Días activos</p>
          <div className="flex items-center gap-2">
            <span className="text-accent-500"><Calendar size={28} /></span>
            <span className="text-3xl font-black text-accent-500 dark:text-accent-400">{streak?.totalDiasActivos ?? 0}</span>
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-surface-card border border-slate-200 dark:border-surface-border rounded-2xl p-5 shadow-sm dark:shadow-none">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen size={18} className="text-accent-600 dark:text-brand-400" /> 
            {Object.keys(progresoMap || {}).length === 0 ? 'Módulos recomendados' : 'Continuar aprendizaje'}
          </h2>
          <Link to="/modulos" className="text-sm text-accent-600 dark:text-brand-400 hover:text-accent-700 dark:hover:text-brand-300 font-medium transition-colors">
            Ver todos
          </Link>
        </div>
        
        {isLoading ? (
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">Cargando módulos...</p>
        ) : allModules.length === 0 ? (
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">No se encuentran módulos disponibles en este momento.</p>
        ) : Object.keys(progresoMap || {}).length === 0 ? (
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">Aún no has comenzado ningún módulo. Aquí tienes algunas recomendaciones:</p>
        ) : null}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {(() => {
            const notCompleted = allModules.filter(m => {
              const total = totalMap[m.id] ?? m.totalLecciones ?? 0;
              const completadas = progresoMap[m.id] ?? 0;
              return total === 0 || completadas < total;
            });
            const toShow = notCompleted.slice(0, 3);

            if (isLoading) {
              return (
                <div className="col-span-full text-center py-8">
                  <p className="text-slate-600 dark:text-slate-400 text-sm">Cargando módulos...</p>
                </div>
              );
            }
            if (toShow.length === 0) {
              return null;
            }

            return toShow.map((mod, idx) => {
              const total = totalMap[mod.id] ?? mod.totalLecciones ?? 0;
              const completadas = progresoMap[mod.id] ?? 0;
                const porcentaje = total > 0 ? Math.round((completadas / total) * 100) : 0;
                const completo = porcentaje === 100 && total > 0;

                return (
                  <div key={mod.id} className={`bg-white dark:bg-surface-card border rounded-2xl p-5 flex flex-col gap-3 transition-all duration-200 shadow-sm dark:shadow-none ${
                    completo
                      ? 'border-green-500/40 dark:border-green-500/30'
                      : 'border-slate-200 dark:border-surface-border hover:border-accent-500/40 dark:hover:border-brand-500/40 hover:shadow-glow-accent dark:hover:shadow-brand-md'
                  }`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-accent-600 dark:text-accent-400">Módulo {mod.orden ?? mod.order}</span>
                        </div>
                        <h3 className="font-bold text-slate-900 dark:text-white text-sm leading-snug">{mod.titulo || mod.title}</h3>
                        {mod.fechaLimite && (
                          <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1 font-medium">
                            <Calendar size={10} className="text-[#ea5837]" />
                            Límite: {new Date(mod.fechaLimite + 'T23:59:59').toLocaleDateString('es-VE', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </p>
                        )}
                      </div>
                      <span className="flex-shrink-0 ml-2 text-slate-700 dark:text-slate-300">
                        <BookOpen size={24} />
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed line-clamp-2">{mod.descripcion || mod.description}</p>

                    <div className="flex flex-wrap gap-1.5">
                      {(mod.etiquetas || mod.tags || []).map(tag => (
                        <span key={tag} className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-surface-hover text-slate-600 dark:text-slate-400 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="space-y-1.5 mt-auto">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-slate-500 flex items-center gap-1.5">
                          <Target size={11} />
                          Progreso
                        </span>
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-300">
                          {completadas}/{total} actividades
                        </span>
                      </div>
                      <ProgressBar
                        percent={porcentaje}
                        size="sm"
                        color="brand"
                        showPercent={false}
                      />
                    </div>

                    <div className="flex items-center justify-end mt-2 pt-1">
                      <Link
                        to={`/modulos/${mod.id}`}
                        className="text-xs font-semibold px-3 py-1.5 bg-[#ea5837] hover:bg-[#c84223] text-white rounded-lg transition-colors shadow-sm dark:shadow-glow-accent"
                      >
                        Comenzar →
                      </Link>
                    </div>
                  </div>
                );
              });
          })()}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { to: '/sandbox', icon: <Rocket size={28} className="text-accent-400" />, label: 'Sandbox libre', desc: 'Experimenta sin límites', color: 'accent' },
          { to: '/retos', icon: <Trophy size={28} className="text-warning-400" />, label: 'Reto del día', desc: 'Gana XP extra', color: 'warning' },
        ].map(({ to, icon, label, desc }) => (
          <Link
            key={to}
            to={to}
            className="group bg-white dark:bg-surface-card hover:bg-slate-50 dark:hover:bg-surface-hover border border-slate-200 dark:border-surface-border rounded-2xl p-5 flex items-center gap-4 transition-all duration-200 hover:shadow-md dark:hover:shadow-brand-md dark:hover:border-brand-500/30 shadow-sm dark:shadow-none"
          >
            <span className="group-hover:scale-110 transition-transform">{icon}</span>
            <div>
              <p className="font-semibold text-slate-900 dark:text-white text-sm">{label}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400">{desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
