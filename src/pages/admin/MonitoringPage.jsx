import React, { useEffect, useState, useMemo } from 'react';
import {
  Users, Search, RefreshCw, AlertCircle, WifiOff,
  Flame, BookOpen, GraduationCap, Clock, ShieldPlus
} from 'lucide-react';
import {
  subscribeToAllProgresoEstudiantes,
  computeEstadoEstudiante,
  updateUserRole,
  getModulos,
  getLeccionesByModulo
} from '@services/firebase/firestoreService';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@services/firebase/config';

export function timeAgo(timestamp) {
  if (!timestamp) return 'Nunca';
  const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
  const diff  = Date.now() - date.getTime();
  const mins  = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days  = Math.floor(diff / 86400000);
  if (mins < 1)   return 'Ahora mismo';
  if (mins < 60)  return `Hace ${mins} min`;
  if (hours < 24) return `Hace ${hours}h`;
  return `Hace ${days} día${days !== 1 ? 's' : ''}`;
}


export function StatusBadge({ status }) {
  const cfg = {
    activo:   { label: 'Activo',      className: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' },
    en_riesgo:{ label: 'En riesgo',   className: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400' },
    desconectado:  { label: 'Sin conexión',className: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400' },
  };
  const { label, className } = cfg[status] || cfg.desconectado;
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${className}`}>
      {label}
    </span>
  );
}

export function MiniProgress({ pct }) {
  const color = pct >= 75 ? 'bg-green-500' : pct >= 40 ? 'bg-amber-400' : 'bg-red-400';
  return (
    <div className="flex items-center gap-2 min-w-[90px]">
      <div className="flex-1 h-1.5 bg-slate-100 dark:bg-surface-border rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-slate-500 dark:text-slate-400 w-8 text-right font-medium">{pct}%</span>
    </div>
  );
}

export function FullStudentRow({ student, entregas, totalBasico, totalAvanzado }) {
  const status = computeEstadoEstudiante(student);
  const studentEntregas = entregas.filter(e => e.estudianteId === student.id);
  
  // Promedio Notas
  const calificados = studentEntregas.filter(e => e.revisado && e.calificacion != null);
  const avgNota = calificados.length > 0
    ? Math.round(calificados.reduce((s, c) => s + Number(c.calificacion), 0) / calificados.length)
    : 0;

  // Participación (Popcodes entregados / Total esperados del nivel)
  const level = (student.salon || 'basico').toLowerCase();
  const totalExpected = level === 'avanzado' ? totalAvanzado : totalBasico;
  const uniqueEntregas = new Set(studentEntregas.map(e => `${e.leccionId}_${e.popcodeIndex}`));
  const participacionPct = Math.min(100, Math.round((uniqueEntregas.size / totalExpected) * 100));

  const handleMakeTeacher = async () => {
    const isSure = window.confirm(`¿Estás seguro de que quieres promover a ${student.nombreMostrar || 'este usuario'} a Profesor?`);
    if (!isSure) return;
    try {
      await updateUserRole(student.id, 'profesor');
      alert(`¡Listo! ${student.nombreMostrar || 'El usuario'} ahora tiene rol de profesor.`);
    } catch (e) {
      alert('Error al promover: ' + e.message);
    }
  };

  return (
    <tr className="hover:bg-slate-50 dark:hover:bg-surface-hover transition-colors border-b border-slate-100 dark:border-surface-border last:border-0">
      {/* Estudiante */}
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#ea5837] to-[#c84223] flex items-center justify-center text-white text-sm font-bold shrink-0">
            {student.nombreMostrar?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-900 dark:text-white leading-tight truncate max-w-[150px] sm:max-w-[200px]">
              {student.nombreMostrar ?? 'Sin nombre'}
            </p>
            <p className="text-xs text-slate-400 truncate max-w-[150px] sm:max-w-[200px]">{student.correo ?? ''}</p>
          </div>
        </div>
      </td>

      {/* Institución */}
      <td className="px-4 py-3.5 hidden sm:table-cell">
        <div className="flex flex-col">
          <span className="text-sm text-slate-700 dark:text-slate-300 flex items-center gap-1.5 truncate max-w-[160px]">
            <BookOpen size={14} className="text-slate-400" />
            {student.colegio || <span className="text-slate-400 italic">No especificado</span>}
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 ml-5 truncate max-w-[150px]">
            Sección: {student.salon || 'N/A'}
          </span>
        </div>
      </td>

      {/* Estado */}
      <td className="px-4 py-3.5">
        <StatusBadge status={status} />
      </td>

      {/* Participación */}
      <td className="px-4 py-3.5">
        <div className="flex flex-col gap-1">
          <MiniProgress pct={participacionPct} />
          <span className="text-[10px] text-slate-400 ml-1">Participación</span>
        </div>
      </td>

      {/* Promedio Notas */}
      <td className="px-4 py-3.5 hidden lg:table-cell">
        <div className="flex flex-col gap-1">
          <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
            {calificados.length > 0 ? `${avgNota} / 20` : 'S/N'}
          </span>
          <span className="text-[10px] text-slate-400">Promedio</span>
        </div>
      </td>

      {/* Racha / XP */}
      <td className="px-4 py-3.5 hidden md:table-cell">
        <div className="flex flex-col gap-1">
          <span className="flex items-center gap-1 text-sm font-bold text-amber-500">
            {student.totalXp ?? 0} <span className="text-[10px] text-slate-400 font-normal">XP</span>
          </span>
          <span className="flex items-center gap-1 text-xs font-semibold text-slate-700 dark:text-slate-300">
            <Flame size={12} className={student.currentStreak > 0 ? 'text-orange-400' : 'text-slate-300'} />
            Racha: {student.currentStreak ?? 0}
          </span>
        </div>
      </td>

      {/* Última conexión */}
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
          <Clock size={14} className="shrink-0" />
          <span>{timeAgo(student.lastSyncAt || student.ultimaSincronizacionEn || student.actualizadoEn || student.creadoEn)}</span>
        </div>
      </td>

      {/* Acciones */}
      <td className="px-4 py-3.5 text-right">
        <button
          onClick={handleMakeTeacher}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:text-indigo-400 dark:bg-indigo-500/10 dark:hover:bg-indigo-500/20 rounded-lg transition-colors whitespace-nowrap"
          title="Otorgar permisos de administrador/profesor"
        >
          <ShieldPlus size={14} />
          <span className="hidden xl:inline">Hacer Profesor</span>
        </button>
      </td>
    </tr>
  );
}

export default function MonitoringPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const [entregas, setEntregas] = useState([]);
  const [totalBasico, setTotalBasico] = useState(1);
  const [totalAvanzado, setTotalAvanzado] = useState(1);

  useEffect(() => {
    setLoading(true);
    
    // 1. Suscribirse a perfiles
    const unsub = subscribeToAllProgresoEstudiantes((data) => {
      setStudents(data);
      setLoading(false);
    });

    // 2. Traer todas las entregas de una vez para promedios
    getDocs(collection(db, 'entregas')).then(snap => {
      const allEntregas = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setEntregas(allEntregas);
    }).catch(console.error);

    // 3. Calcular totales de ejercicios (popcodes) por nivel
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

    return () => unsub?.();
  }, []);

  const filteredStudents = useMemo(() => {
    let result = students;

    if (filterStatus !== 'all') {
      result = result.filter(s => computeEstadoEstudiante(s) === filterStatus);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(s => 
        (s.nombreMostrar || '').toLowerCase().includes(term) ||
        (s.colegio || '').toLowerCase().includes(term) ||
        (s.email || '').toLowerCase().includes(term)
      );
    }

    // Ordenar: Los en riesgo o desconectados primero
    return result.sort((a, b) => {
      const order = { desconectado: 0, en_riesgo: 1, activo: 2 };
      return (order[computeEstadoEstudiante(a)] ?? 2) - (order[computeEstadoEstudiante(b)] ?? 2);
    });
  }, [students, searchTerm, filterStatus]);

  return (
    <div className="space-y-6 animate-fade-up h-full flex flex-col">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Users size={28} className="text-[#ea5837]" />
            Monitoreo de Estudiantes
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Revisa el progreso completo, institución y estado de conexión de tus alumnos.
          </p>
        </div>
      </div>

      {/* Controles de Filtro */}
      <div className="bg-white dark:bg-surface-card border border-slate-200 dark:border-surface-border rounded-2xl p-4 flex flex-col md:flex-row gap-4 shrink-0 shadow-sm">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, correo o colegio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-surface-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent-500/20 text-slate-800 dark:text-slate-200"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-surface-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent-500/20 text-slate-700 dark:text-slate-300 min-w-[160px] cursor-pointer"
        >
          <option value="all">Todos los estados</option>
          <option value="activo">Activos</option>
          <option value="en_riesgo">En riesgo</option>
          <option value="desconectado">Desconectados</option>
        </select>
      </div>

      {/* Leyenda de Estados */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 px-2 shrink-0 bg-slate-100 dark:bg-surface-card py-2.5 rounded-xl border border-slate-200 dark:border-surface-border">
        <span className="text-xs font-bold text-slate-600 dark:text-slate-300">¿Qué significan los estados?</span>
        <div className="flex items-center gap-2">
          <StatusBadge status="activo" />
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Conectado en las últimas 48 horas.</span>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status="en_riesgo" />
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Sin conexión entre 3 y 7 días.</span>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status="desconectado" />
          <span className="text-[11px] text-slate-500 dark:text-slate-400">Más de 7 días sin actividad.</span>
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white dark:bg-surface-card border border-slate-200 dark:border-surface-border rounded-2xl shadow-sm flex-1 flex flex-col min-h-0 overflow-hidden">
        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-slate-400">
            <RefreshCw size={32} className="animate-spin mb-4 text-[#ea5837]" />
            <p className="text-sm font-medium">Cargando base de datos de estudiantes...</p>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-surface-hover flex items-center justify-center mb-4">
              <Users size={28} className="text-slate-300 dark:text-slate-600" />
            </div>
            <h3 className="text-base font-bold text-slate-700 dark:text-slate-300 mb-1">
              No se encontraron estudiantes
            </h3>
            <p className="text-sm text-slate-400 dark:text-slate-500 max-w-sm">
              Intenta cambiar los filtros de búsqueda o el estado seleccionado.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto flex-1 h-full">
            <table className="w-full text-left min-w-[700px]">
              <thead className="sticky top-0 bg-slate-50 dark:bg-surface-hover z-10">
                <tr className="border-b border-slate-100 dark:border-surface-border">
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Estudiante</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider hidden sm:table-cell">Institución / Sección</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Estado</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Participación</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden lg:table-cell">Notas</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider hidden md:table-cell">Métricas</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Última Conexión</th>
                  <th className="px-4 py-3 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-surface-border">
                {filteredStudents.map((student) => (
                  <FullStudentRow 
                    key={student.id} 
                    student={student} 
                    entregas={entregas}
                    totalBasico={totalBasico}
                    totalAvanzado={totalAvanzado}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      {/* Stats footer */}
      {!loading && students.length > 0 && (
        <div className="shrink-0 flex items-center justify-between px-2 text-xs text-slate-500 font-medium">
          <p>Mostrando {filteredStudents.length} de {students.length} estudiantes registrados</p>
        </div>
      )}
    </div>
  );
}
