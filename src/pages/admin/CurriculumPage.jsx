import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen, Plus, Pencil, Trash2, ChevronDown, ChevronRight,
  GripVertical, Save, X, AlertTriangle, RefreshCw, CheckCircle2,
  FileText, Calendar, Globe, EyeOff, Loader2, Video, Upload
} from 'lucide-react';
import clsx from 'clsx';
import {
  subscribeToModulos as subscribeToCourses,
  createModulo as createCourse,
  updateModulo as updateCourse,
  deleteModulo as deleteCourse,
  getLeccionesByModulo as getLessonsByCourse,
  createLeccion as createLesson,
  updateLeccion as updateLesson,
  deleteLeccion as deleteLesson,
  deleteAllCurriculumData,
} from '@services/firebase/firestoreService';
import { subirArchivo } from '@services/firebase/storageService';

const EMPTY_COURSE = { title: '', level: 'basic', description: '', fechaLimite: '', tags: '' };

function CourseForm({ initial = EMPTY_COURSE, onSave, onCancel, saving }) {
  const [form, setForm] = useState({
    ...EMPTY_COURSE,
    ...initial,
    tags: Array.isArray(initial.tags) ? initial.tags.join(', ') : initial.tags ?? '',
  });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="bg-blue-50 dark:bg-blue-500/5 border border-blue-200 dark:border-blue-500/20 rounded-xl p-4 space-y-3">
      <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
        {initial.id ? 'Editar módulo' : 'Nuevo módulo'}
      </p>
      <input
        type="text" placeholder="Título del módulo *" value={form.title}
        onChange={(e) => set('title', e.target.value)}
        className="w-full px-3 py-2 text-sm bg-white dark:bg-surface-card border border-slate-200 dark:border-surface-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ea5837]"
      />
      <textarea
        placeholder="Descripción breve..." value={form.description}
        onChange={(e) => set('description', e.target.value)}
        rows={2}
        className="w-full px-3 py-2 text-sm bg-white dark:bg-surface-card border border-slate-200 dark:border-surface-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ea5837] resize-none"
      />
      <input
        type="text" placeholder="Tags (separados por coma): HTML, Estructura..." value={form.tags}
        onChange={(e) => set('tags', e.target.value)}
        className="w-full px-3 py-2 text-sm bg-white dark:bg-surface-card border border-slate-200 dark:border-surface-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ea5837]"
      />
      <div className="flex gap-3 flex-wrap">
        <select
          value={form.level} onChange={(e) => set('level', e.target.value)}
          className="flex-1 min-w-[140px] px-3 py-2 text-sm bg-white dark:bg-surface-card border border-slate-200 dark:border-surface-border rounded-lg focus:outline-none"
        >
          <option value="basic">Básico</option>
          <option value="advanced">Avanzado</option>
        </select>
        <div className="flex-1 min-w-[200px] space-y-1">
          <label className="text-xs text-slate-500">Duración del módulo</label>
          <input
            type="date"
            value={form.fechaLimite || ''}
            onChange={(e) => set('fechaLimite', e.target.value)}
            className="w-full px-3 py-2 text-sm bg-white dark:bg-surface-card border border-slate-200 dark:border-surface-border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ea5837]"
          />
          <p className="text-[10px] text-slate-400">Las entregas luego de esta fecha serán marcadas como atrasadas.</p>
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <button onClick={onCancel} className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-500 hover:bg-slate-200 dark:hover:bg-surface-hover rounded-lg transition-all">
          <X size={14} /> Cancelar
        </button>
        <button
          onClick={() => form.title && onSave({
            ...form,
            tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
          })}
          disabled={!form.title || saving}
          className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold bg-[#ea5837] hover:bg-[#c84223] disabled:opacity-50 text-white rounded-lg transition-all"
        >
          {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
          {saving ? 'Guardando...' : 'Guardar módulo'}
        </button>
      </div>
    </div>
  );
}



const TYPE_BADGE = {
  text:      { label: 'Texto',   color: 'bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400' },
  video:     { label: 'Video',   color: 'bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400' },
  challenge: { label: 'Reto',    color: 'bg-orange-100 text-orange-600 dark:bg-orange-500/20 dark:text-orange-400' },
  quiz:      { label: 'Quiz',    color: 'bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400' },
};

function CourseRow({ course, onEdit, onDelete }) {
  const [open,        setOpen]        = useState(false);
  const [lessons,     setLessons]     = useState([]);
  const [loadingLessons, setLoadingLessons] = useState(false);

  const LEVEL_BADGE = {
    basic:    'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
    advanced: 'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400',
  };

  const handleToggle = async () => {
    setOpen((v) => !v);
    if (!open && lessons.length === 0) {
      setLoadingLessons(true);
      try {
        const data = await getLessonsByCourse(course.id);
        setLessons(data);
      } finally {
        setLoadingLessons(false);
      }
    }
  };



  const handleDeleteLesson = async (lessonId) => {
    if (!confirm('¿Eliminar esta lección?')) return;
    await deleteLesson(lessonId);
    setLessons((prev) => prev.filter((l) => l.id !== lessonId));
  };

  return (
    <div className="bg-white dark:bg-surface-card border border-slate-200 dark:border-surface-border rounded-2xl overflow-hidden shadow-sm">
      {/* Header del módulo */}
      <div className="flex items-center gap-3 px-5 py-4">
        <GripVertical size={16} className="text-slate-300 shrink-0 cursor-grab" />
        <button onClick={handleToggle} className="flex-1 flex items-center gap-3 text-left">
          {open ? <ChevronDown size={18} className="text-[#ea5837]" /> : <ChevronRight size={18} className="text-slate-400" />}
          <div>
            <p className="font-bold text-slate-900 dark:text-white text-sm">{course.title}</p>
            {course.description && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{course.description}</p>
            )}
          </div>
        </button>
        <div className="flex items-center gap-2 shrink-0">
          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${LEVEL_BADGE[course.level] ?? LEVEL_BADGE.basic}`}>
            {course.level === 'basic' ? 'Básico' : 'Avanzado'}
          </span>
          {(course.isPublished || course.publicado)
            ? <span className="flex items-center gap-1 text-[10px] text-green-600 dark:text-green-400 font-medium"><Globe size={11} /> Publicado</span>
            : <span className="flex items-center gap-1 text-[10px] text-slate-400 font-medium"><EyeOff size={11} /> Borrador</span>
          }
          <span className="text-xs text-slate-400 hidden sm:block">{course.totalLessons ?? lessons.length} lecciones</span>
          <button 
            onClick={async (e) => {
              e.stopPropagation();
              await updateCourse(course.id, { 
                isPublished: !(course.isPublished || course.publicado),
                publicado: !(course.isPublished || course.publicado)
              });
            }} 
            className={`p-1.5 rounded-lg transition-all ${
              (course.isPublished || course.publicado) 
                ? 'text-green-500 hover:bg-green-50 dark:hover:bg-green-500/10' 
                : 'text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10'
            }`}
            title={(course.isPublished || course.publicado) ? 'Marcar como Borrador' : 'Publicar módulo'}
          >
            {(course.isPublished || course.publicado) ? <EyeOff size={14} /> : <Globe size={14} />}
          </button>
          <button onClick={(e) => { e.stopPropagation(); onEdit(course); }} className="p-1.5 text-slate-400 hover:text-blue-500 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all">
            <Pencil size={14} />
          </button>
          <button onClick={(e) => { e.stopPropagation(); onDelete(course.id); }} className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 transition-all">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Lecciones desplegadas */}
      {open && (
        <div className="border-t border-slate-100 dark:border-surface-border px-5 py-3 space-y-2">
          {loadingLessons ? (
            <div className="flex items-center justify-center py-4 text-slate-400 gap-2">
              <RefreshCw size={16} className="animate-spin" />
              <span className="text-sm">Cargando lecciones...</span>
            </div>
          ) : lessons.length === 0 ? (
            <div className="text-center py-4 text-slate-400 text-xs">
              Este módulo no tiene lecciones aún. Añade la primera.
            </div>
          ) : (
            lessons.map((lesson) => (
              <div key={lesson.id} className="flex items-center gap-3 py-2 px-3 bg-slate-50 dark:bg-surface-hover rounded-xl">
                <GripVertical size={14} className="text-slate-300 cursor-grab shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-700 dark:text-slate-300 truncate">
                    {lesson.title}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar size={11} /> 
                    {lesson.creadoEn?.toDate 
                      ? lesson.creadoEn.toDate().toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) 
                      : (lesson.creadoEn ? new Date(lesson.creadoEn).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) : 'Hoy')}
                  </span>
                  <span className="text-xs text-amber-500 font-medium">{lesson.xpReward ?? 0}xp</span>
                  <Link
                    to={`/admin/builder/${course.id}?leccionId=${lesson.id}`}
                    className="flex items-center gap-1 p-1 px-2 text-xs text-blue-400 hover:text-white hover:bg-blue-500 rounded-lg transition-all border border-blue-500/30"
                    title="Editar con el Builder"
                  >
                    <Pencil size={11} /> Builder
                  </Link>
                  <button onClick={() => handleDeleteLesson(lesson.id)} className="p-1 text-slate-300 hover:text-red-400 transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))
          )}

          <Link
            to={`/admin/builder/${course.id}`}
            className="flex items-center justify-center gap-2 py-2 text-xs font-semibold text-white bg-[#ea5837] hover:bg-[#c84223] rounded-xl transition-all shadow-sm"
          >
            <FileText size={14} /> Crear clase con Builder
          </Link>
        </div>
      )}
    </div>
  );
}

export default function CurriculumPage() {
  const [courses,    setCourses]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [isAdding,   setIsAdding]   = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [saving,     setSaving]     = useState(false);

  useEffect(() => {
    setLoading(true);
    const unsub = subscribeToCourses((data) => {
      setCourses(data);
      setLoading(false);
    });
    return () => unsub?.();
  }, []);

  const handleAddCourse = async (data) => {
    setSaving(true);
    try {
      // El orden se auto-asigna según cuántos módulos hay ya
      const nextOrder = courses.length + 1;
      await createCourse({ ...data, order: nextOrder, totalLessons: 0 });
      setIsAdding(false);
    } finally {
      setSaving(false);
    }
  };

  const handleEditCourse = async (data) => {
    setSaving(true);
    try {
      await updateCourse(editingCourse.id, data);
      setEditingCourse(null);
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCourse = async (id) => {
    if (!confirm('¿Eliminar este módulo y todas sus lecciones? Esta acción no se puede deshacer.')) return;
    await deleteCourse(id);
  };

  const handleWipeData = async () => {
    const code = prompt("🚨 PELIGRO 🚨\n\nEsta acción BORRARÁ TODOS los módulos, clases y entregas actuales para empezar desde cero.\n\nEscribe 'BORRAR TODO' para confirmar:");
    if (code === 'BORRAR TODO') {
      setSaving(true);
      try {
        await deleteAllCurriculumData();
        alert('✅ ¡Limpieza completada! La base de datos de módulos y entregas está vacía, lista para el testeo real.');
      } catch (e) {
        alert('Hubo un error al limpiar: ' + e.message);
      } finally {
        setSaving(false);
      }
    } else if (code !== null) {
      alert('Cancelado: El texto de confirmación no coincide.');
    }
  };

  const basicCourses    = courses.filter((c) => c.level === 'basic');
  const advancedCourses = courses.filter((c) => c.level === 'advanced');

  return (
    <div className="space-y-5 animate-fade-up">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpen size={24} className="text-[#ea5837]" /> Gestión del Pensum
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Crea y organiza los módulos y lecciones. Los cambios se reflejan inmediatamente en la app del estudiante.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap items-center justify-end">
          <button
            onClick={handleWipeData}
            className="flex items-center gap-2 px-4 py-2.5 bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-500/10 dark:hover:bg-red-500/20 dark:text-red-400 text-sm font-semibold rounded-xl transition-all shadow-sm"
          >
            <Trash2 size={18} /> Limpiar todo (Tests)
          </button>
          <button
            onClick={() => { setIsAdding(true); setEditingCourse(null); }}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#ea5837] hover:bg-[#c84223] text-white text-sm font-semibold rounded-xl transition-all shadow-sm"
          >
            <Plus size={18} /> Nuevo módulo
          </button>
        </div>
      </div>

      {/* Form de nuevo módulo */}
      {isAdding && !editingCourse && (
        <CourseForm saving={saving} onSave={handleAddCourse} onCancel={() => setIsAdding(false)} />
      )}

      {/* Cargando */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white dark:bg-surface-card border border-slate-200 dark:border-surface-border rounded-2xl p-5 animate-pulse">
              <div className="flex gap-3 items-center">
                <div className="w-6 h-6 bg-slate-200 dark:bg-surface-hover rounded" />
                <div className="h-5 bg-slate-200 dark:bg-surface-hover rounded w-48" />
              </div>
            </div>
          ))}
        </div>
      ) : courses.length === 0 ? (
        /* Estado vacío */
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-surface-card border border-slate-200 dark:border-surface-border rounded-2xl">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-surface-hover flex items-center justify-center mb-4">
            <BookOpen size={28} className="text-slate-300 dark:text-slate-600" />
          </div>
          <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
            El pensum está vacío
          </h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 text-center max-w-xs">
            Crea el primer módulo usando el botón "Nuevo módulo". Los estudiantes verán los cambios al instante.
          </p>
        </div>
      ) : (
        /* Lista de cursos agrupada por nivel */
        <div className="space-y-6">
          {[{ level: 'basic', label: 'Módulos Básicos', items: basicCourses },
            { level: 'advanced', label: 'Módulos Avanzados', items: advancedCourses }]
            .filter(({ items }) => items.length > 0)
            .map(({ level, label, items }) => (
              <div key={level}>
                <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3">{label}</h2>
                <div className="space-y-3">
                  {items.map((course) =>
                    editingCourse?.id === course.id ? (
                      <CourseForm
                        key={course.id}
                        initial={editingCourse}
                        saving={saving}
                        onSave={handleEditCourse}
                        onCancel={() => setEditingCourse(null)}
                      />
                    ) : (
                      <CourseRow
                        key={course.id}
                        course={course}
                        onEdit={(c) => { setEditingCourse(c); setIsAdding(false); }}
                        onDelete={handleDeleteCourse}
                      />
                    )
                  )}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* Aviso de sincronización */}
      <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 rounded-xl">
        <AlertTriangle size={18} className="text-amber-500 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700 dark:text-amber-400">
          <strong>Nota:</strong> Los módulos marcados como "Borrador" no son visibles para los estudiantes. Cuando publiques un módulo, aparecerá en la app del estudiante inmediatamente.
        </p>
      </div>
    </div>
  );
}
