import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectCurrentUser } from '@store/slices/authSlice';
import {
  Users, FileText, BookOpen, Upload, TrendingUp, Clock,
  CheckCircle2, AlertCircle, Wifi, WifiOff, RefreshCw,
  Activity, Flame, ChevronRight,
} from 'lucide-react';
import {
  subscribeToAllProgresoEstudiantes,
  computeEstadoEstudiante,
  getModulos,
  getLeccionesByModulo
} from '@services/firebase/firestoreService';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@services/firebase/config';
import { FullStudentRow } from './MonitoringPage';

function greetingByHour() {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 18) return 'Buenas tardes';
  return 'Buenas noches';
}


function StatCard({ icon: Icon, label, value, sublabel, color, loading }) {
  return (
    <div className="bg-white dark:bg-surface-card border border-slate-200 dark:border-surface-border rounded-2xl p-5 flex items-start gap-4 shadow-sm">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div className="min-w-0">
        {loading ? (
          <div className="h-8 w-12 bg-slate-200 dark:bg-surface-hover rounded animate-pulse mb-1" />
        ) : (
          <p className="text-2xl font-black text-slate-900 dark:text-white">{value}</p>
        )}
        <p className="text-sm font-medium text-slate-600 dark:text-slate-400 truncate">{label}</p>
        {sublabel && <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{sublabel}</p>}
      </div>
    </div>
  );
}



/** Estado vacío de tabla */
function EmptyStudents() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-surface-hover flex items-center justify-center mb-4">
        <Users size={28} className="text-slate-300 dark:text-slate-600" />
      </div>
      <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
        Aún no hay estudiantes registrados
      </h3>
      <p className="text-xs text-slate-400 dark:text-slate-500 max-w-xs">
        Cuando los estudiantes se registren y comiencen a estudiar, sus métricas aparecerán aquí.
      </p>
    </div>
  );
}

/** Estado vacío de entregas */
function EmptySubmissions() {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-center">
      <FileText size={32} className="text-slate-200 dark:text-slate-700 mb-2" />
      <p className="text-sm text-slate-400">Sin entregas recientes</p>
    </div>
  );
}

export default function AdminDashboardPage() {
  const user = useSelector(selectCurrentUser);

  const [students,     setStudents]     = useState([]);
  const [submissions,  setSubmissions]  = useState([]);
  const [loadingStudents,  setLoadingStudents]  = useState(true);
  const [loadingSubmissions, setLoadingSubmissions] = useState(true);
  const [isOffline,    setIsOffline]    = useState(!navigator.onLine);

  const [totalBasico, setTotalBasico] = useState(1);
  const [totalAvanzado, setTotalAvanzado] = useState(1);

  // Listeners en tiempo real
  useEffect(() => {
    setLoadingStudents(true);
    const unsub = subscribeToAllProgresoEstudiantes((data) => {
      setStudents(data);
      setLoadingStudents(false);
    });
    return () => unsub?.();
  }, []);

  useEffect(() => {
    setLoadingSubmissions(true);
    const q = query(collection(db, 'entregas'), orderBy('entregadoEn', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      setSubmissions(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoadingSubmissions(false);
    }, (err) => {
      console.error('[Dashboard] entregas snapshot error:', err);
      setLoadingSubmissions(false);
    });
    
    // Calcular totales de popcodes
    getModulos().then(async (mods) => {
      let basico = 0, avanzado = 0;
      await Promise.all(mods.map(async m => {
        try {
          const lecs = await getLeccionesByModulo(m.id);
          const count = lecs.reduce((sum, lec) => sum + (lec.bloques || []).filter(bl => bl.type === 'code').length, 0);
          const nivel = (m.nivel || m.level || 'basico').toLowerCase();
          if (nivel === 'avanzado') avanzado += count;
          else basico += count;
        } catch(e) {}
      }));
      setTotalBasico(basico || 1);
      setTotalAvanzado(avanzado || 1);
    }).catch(console.error);

    return () => unsub();
  }, []);

  useEffect(() => {
    const onOnline  = () => setIsOffline(false);
    const onOffline = () => setIsOffline(true);
    window.addEventListener('online',  onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('online',  onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  const totalStudents      = students.length;
  const activeToday        = students.filter((s) => computeEstadoEstudiante(s) === 'activo').length;
  const atRisk             = students.filter((s) => computeEstadoEstudiante(s) === 'en_riesgo').length;
  const pendingSubmissions = submissions.filter((s) => !s.revisado).length;
  const recentSubmissions  = submissions.slice(0, 5);

  // Ordenar por estado (offline primero = más urgentes)
  const sortedStudents = [...students].sort((a, b) => {
    const order = { desconectado: 0, en_riesgo: 1, activo: 2 };
    return (order[computeEstadoEstudiante(a)] ?? 2) - (order[computeEstadoEstudiante(b)] ?? 2);
  });
  const topStudents = sortedStudents.slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-up">

      {/* Banner offline */}
      {isOffline && (
        <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-xl text-sm text-amber-700 dark:text-amber-400">
          <WifiOff size={16} className="shrink-0" />
          <span>Sin conexión — mostrando datos del caché local. Los cambios se sincronizarán cuando recuperes internet.</span>
        </div>
      )}

      {/* Encabezado */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            {greetingByHour()}, {user?.nombreMostrar?.split(' ')[0] ?? 'Profesor'}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Aquí está el resumen de la actividad de tus estudiantes.</p>
        </div>
        {!isOffline && (
          <span className="flex items-center gap-1.5 text-xs text-green-600 dark:text-green-400 font-medium">
            <Wifi size={14} /> En línea
          </span>
        )}
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Users}       label="Estudiantes"         value={totalStudents}
          color="bg-blue-500" sublabel="Total registrados" loading={loadingStudents}
        />
        <StatCard
          icon={Activity}    label="Activos hoy"          value={activeToday}
          color="bg-green-500" sublabel="Con sync reciente" loading={loadingStudents}
        />
        <StatCard
          icon={AlertCircle} label="Entregas pendientes"  value={pendingSubmissions}
          color="bg-[#ea5837]" sublabel="Sin revisar" loading={loadingSubmissions}
        />
        <StatCard
          icon={TrendingUp}  label="En riesgo"            value={atRisk}
          color="bg-amber-500" sublabel="Sin sync >2 días" loading={loadingStudents}
        />
      </div>

      {/* Accesos rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { to: '/admin/entregas', label: 'Ver entregas',     desc: 'Revisa y califica el código enviado',   icon: FileText, color: 'border-l-[#ea5837]' },
          { to: '/admin/pensum',  label: 'Gestionar pensum', desc: 'Crea o edita módulos y lecciones',      icon: BookOpen, color: 'border-l-blue-500'  },
        ].map(({ to, label, desc, icon: Icon, color }) => (
          <Link
            key={to} to={to}
            className={`flex items-start gap-4 p-5 bg-white dark:bg-surface-card border border-slate-200 dark:border-surface-border border-l-4 ${color} rounded-2xl shadow-sm hover:shadow-md transition-all group`}
          >
            <Icon size={22} className="text-slate-400 group-hover:text-[#ea5837] transition-colors shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-slate-900 dark:text-white text-sm">{label}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{desc}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Tabla de estudiantes */}
      <div className="bg-white dark:bg-surface-card border border-slate-200 dark:border-surface-border rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-surface-border">
          <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Users size={18} className="text-[#ea5837]" />
            Estudiantes prioritarios
            {!loadingStudents && totalStudents > 0 && (
              <span className="text-xs font-normal text-slate-400 ml-1">({topStudents.length} de {totalStudents})</span>
            )}
          </h2>
          <Link to="/admin/monitoreo" className="text-xs text-[#ea5837] hover:underline font-medium flex items-center gap-1">
            Ver todos <ChevronRight size={12} />
          </Link>

        </div>

        {loadingStudents ? (
          <div className="p-8 flex justify-center">
            <div className="flex flex-col items-center gap-3 text-slate-400">
              <RefreshCw size={24} className="animate-spin" />
              <p className="text-sm">Cargando estudiantes...</p>
            </div>
          </div>
        ) : totalStudents === 0 ? (
          <EmptyStudents />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 dark:border-surface-border bg-slate-50 dark:bg-surface-hover">
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Estudiante</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden sm:table-cell">Institución / Sección</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Estado</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Participación</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden lg:table-cell">Promedio Notas</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden xl:table-cell">Rendimiento (Racha/XP)</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Última conexión</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {topStudents.map((student) => (
                  <FullStudentRow
                    key={student.id}
                    student={student}
                    entregas={submissions}
                    totalBasico={totalBasico}
                    totalAvanzado={totalAvanzado}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Últimas entregas */}
      <div className="bg-white dark:bg-surface-card border border-slate-200 dark:border-surface-border rounded-2xl shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-surface-border">
          <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock size={18} className="text-[#ea5837]" />
            Entregas recientes
          </h2>
          <Link to="/admin/entregas" className="text-xs text-[#ea5837] hover:underline font-medium flex items-center gap-1">
            Ver todas <ChevronRight size={12} />
          </Link>
        </div>

        {loadingSubmissions ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-slate-100 dark:bg-surface-hover rounded-xl animate-pulse" />
            ))}
          </div>
        ) : recentSubmissions.length === 0 ? (
          <EmptySubmissions />
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-surface-border">
            {recentSubmissions.map((sub) => {
              const fechaStr = sub.entregadoEn?.toDate
                ? sub.entregadoEn.toDate().toLocaleString('es-VE', { dateStyle: 'short', timeStyle: 'short' })
                : '';
              const tipoLabel = sub.tipo === 'editor' ? '🖥 Editor' : `💻 Popcode ${(sub.popcodeIndex ?? 0) + 1}`;
              return (
                <div key={sub.id} className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-surface-hover transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{sub.estudianteNombre ?? 'Estudiante'}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{sub.leccionTitulo ?? '—'} · {tipoLabel} · {fechaStr}</p>
                  </div>
                  <span className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ml-3 ${
                    !sub.revisado
                      ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
                      : 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400'
                  }`}>
                    {!sub.revisado ? <AlertCircle size={10} /> : <CheckCircle2 size={10} />}
                    {!sub.revisado ? 'Pendiente' : 'Revisada'}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
