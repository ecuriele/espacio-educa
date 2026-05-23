import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectIsOnline } from '@store/slices/uiSlice';
import { selectCurrentUser, selectSessionMode } from '@store/slices/authSlice';
import CodeEditor from '@components/editor/CodeEditor';
import {
  BookOpen, Terminal, Paperclip, Send, VideoOff,
  CheckCircle2, Loader2, FileText, ExternalLink, ChevronLeft, ChevronRight, AlertTriangle
} from 'lucide-react';
import {
  getModulo, getLeccion, getLeccionesByModulo, crearEntrega,
} from '@services/firebase/firestoreService';
import { addXp, recordDailyActivity, checkSubmissionAchievements } from '@store/slices/gamificationSlice';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@services/firebase/config';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import clsx from 'clsx';

function toVideoEmbed(url) {
  if (!url) return null;
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?\s]+)/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const drive = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (drive) return `https://drive.google.com/file/d/${drive[1]}/preview`;
  return url;
}

function toPresentacionEmbed(url) {
  if (!url) return null;
  const gSlides = url.match(/docs\.google\.com\/presentation\/d\/([^/]+)/);
  if (gSlides) return `https://docs.google.com/presentation/d/${gSlides[1]}/embed?start=false&loop=false&delayms=3000`;
  return url;
}

function PopcodeEditor({ popcode, index, leccion, modulo, user, isOffline }) {
  const [code, setCode]             = useState({ html: popcode.baseCode || '', css: popcode.cssCode || '', js: popcode.jsCode || '' });
  const [entregando, setEntregando] = useState(false);
  const [entregado, setEntregado]   = useState(false);
  const [isEdit, setIsEdit]         = useState(false);
  const [error, setError]           = useState('');
  const dispatch = useDispatch();

  const userId = user?.uid || user?.id;

  // Cargar entrega existente
  useEffect(() => {
    if (!userId || isOffline || !leccion?.id) return;
    const fetchEntrega = async () => {
      try {
        const ref = doc(db, 'entregas', `${userId}_${leccion.id}_${index}`);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setCode({ html: data.htmlCode || '', css: data.cssCode || '', js: data.jsCode || '' });
          setIsEdit(true);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchEntrega();
  }, [userId, leccion?.id, index, isOffline]);

  const handleChange = useCallback((lang, val) => {
    setCode(prev => ({ ...prev, [lang]: val }));
    setEntregado(false);
  }, []);

  const handleEntregar = async () => {
    if (!userId) return setError('No se encontró tu sesión. Intenta recargar la página.');

    if (modulo?.fechaLimite) {
      const limite = new Date(modulo.fechaLimite + 'T23:59:59');
      if (new Date() > limite && isEdit) {
        return setError('El plazo para editar esta entrega ha finalizado.');
      }
    }

    setEntregando(true);
    setError('');
    try {
      await crearEntrega({
        estudianteId:     userId,
        estudianteNombre: user.displayName || user.nombreMostrar || user.email || 'Estudiante',
        leccionId:        leccion.id,
        leccionTitulo:    leccion.title || 'Sin título',
        moduloId:         modulo?.id || '',
        popcodeIndex:     index,
        popcodeTitulo:    popcode.instrucciones?.slice(0, 60) || `Popcode ${index + 1}`,
        htmlCode:         code.html,
        cssCode:          code.css,
        jsCode:           code.js,
      });

      if (!isEdit) {
        dispatch(addXp({ userId, amount: 50, reason: 'Popcode entregado' }));
        dispatch(recordDailyActivity(userId));
        dispatch(checkSubmissionAchievements(userId));
      }

      // Firestore SDK guarda localmente si está offline y sincroniza automáticamente
      setEntregado(true);
      setIsEdit(true);
    } catch (err) {
      console.error(err);
      setError('Error inesperado. Intenta de nuevo.');
    } finally {
      setEntregando(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Instrucciones del popcode */}
      {popcode.instrucciones && (
        <div className="bg-slate-900/60 border border-green-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Terminal size={13} className="text-green-400" />
            <span className="text-xs text-green-400 font-semibold uppercase tracking-wide">
              Popcode {index + 1} — Instrucciones
            </span>
          </div>
          <p className="text-sm text-slate-300 whitespace-pre-wrap">{popcode.instrucciones}</p>
        </div>
      )}

      {/* Editor */}
      <CodeEditor
        html={code.html}
        css={code.css}
        js={code.js}
        onChange={handleChange}
        showPreview
      />

      {/* Banner offline */}
      {isOffline && (
        <div className="flex items-center gap-2 px-3 py-2 bg-amber-500/10 border border-amber-500/20 rounded-lg">
          <span className="text-amber-400 text-xs">📡 Sin conexión — tu entrega se guardará automáticamente cuando vuelva la red.</span>
        </div>
      )}

      {/* Botón entregar */}
      <div className="flex flex-col gap-3 mt-4">
        {error && (
          <div className="flex items-center gap-3 p-3.5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-sm font-medium shadow-sm shadow-red-500/10 animate-fade-up">
            <AlertTriangle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
        )}
        <div className="flex items-center justify-end">
          {entregado ? (
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-2 px-5 py-2.5 bg-green-500/20 border border-green-500/30 text-green-400 rounded-xl text-sm font-semibold">
                <CheckCircle2 size={16} /> ¡Entregado!
              </div>
              {isOffline && <span className="text-xs text-amber-400">Se sincronizará al reconectarse</span>}
            </div>
          ) : (
            <button
              id={`submit-popcode-${index}`}
              onClick={handleEntregar}
              disabled={entregando}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#ea5837] hover:bg-[#c84223] disabled:opacity-60 text-white font-semibold rounded-xl text-sm transition-all"
            >
              {entregando ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              {entregando ? (isEdit ? 'Actualizando...' : 'Entregando...') : (isEdit ? 'Actualizar Entrega' : 'Entregar Popcode')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LessonPage() {
  const { moduloId, leccionId } = useParams();
  const [pestana, setPestana]   = useState('guia');
  const [activePopcode, setActivePopcode] = useState(0); // índice del popcode activo en tab Ejercicio
  const isOnline  = useSelector(selectIsOnline);
  const user      = useSelector(selectCurrentUser);
  const sesionMode = useSelector(selectSessionMode);
  const isOffline  = sesionMode === 'offline' || !isOnline;
  const [modulo,  setModulo]  = useState(null);
  const [leccion, setLeccion] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        const mod = await getModulo(moduloId);
        let lec = null;
        if (leccionId) {
          lec = await getLeccion(leccionId);
        } else {
          const lecciones = await getLeccionesByModulo(moduloId);
          if (lecciones?.length > 0) lec = lecciones[0];
        }
        if (mounted) { setModulo(mod); setLeccion(lec); }
      } catch (err) {
        console.error('Error al cargar la lección:', err);
      }
    };
    fetchData();
    return () => { mounted = false; };
  }, [moduloId, leccionId]);

  const bloques     = leccion?.bloques || [];
  const codeBlocks  = bloques.filter(b => b.type === 'code');
  // Recursos: solo desde bloques (ya no hay campo separado para evitar duplicados)
  const recursos    = bloques.filter(b => b.type === 'recurso' || b.type === 'presentacion');
  const hayEjercicio = codeBlocks.length > 0;
  const hayRecursos  = recursos.length > 0;

  return (
    <div className="space-y-4 animate-fade-up">
      {/* Botón Volver */}
      <div>
        <Link to={`/modulos/${moduloId}`} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition-colors">
          <ChevronLeft size={16} /> Volver a clases
        </Link>
      </div>

      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <Link to="/modulos" className="hover:text-brand-300 transition-colors">Módulos</Link>
        <span>›</span>
        <Link to={`/modulos/${moduloId}`} className="hover:text-brand-300 transition-colors">
          {modulo ? (modulo.titulo || modulo.title) : moduloId?.replace(/-/g, ' ')}
        </Link>
        <span>›</span>
        <span className="text-white truncate">{leccion ? (leccion.titulo || leccion.title) : 'Lección'}</span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-card border border-surface-border rounded-xl p-1 w-fit flex-wrap">
        {[
          { id: 'guia',      label: <><BookOpen  size={15} className="inline-block mr-1.5" />Guía</>,      show: true },
          { id: 'ejercicio', label: <><Terminal   size={15} className="inline-block mr-1.5" />Ejercicios{codeBlocks.length > 1 ? ` (${codeBlocks.length})` : ''}</>, show: hayEjercicio },
        ].filter(t => t.show).map(t => (
          <button key={t.id} id={`lesson-tab-${t.id}`}
            onClick={() => setPestana(t.id)}
            className={clsx('px-4 py-2 rounded-lg text-sm font-medium transition-all',
              pestana === t.id ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white')}>
            {t.label}
          </button>
        ))}
      </div>

      {pestana === 'guia' && (
        <div className="bg-surface-card border border-surface-border rounded-2xl p-6 space-y-6">
          <h1 className="text-xl font-bold text-white">{leccion?.title || 'Cargando...'}</h1>

          {bloques.length > 0 ? (
            <div className="space-y-6">
              {bloques.map((b, bIdx) => {
                // Texto/Markdown
                if (b.type === 'text') return (
                  <div key={b.id || bIdx} className="prose prose-invert prose-sm max-w-none">
                    {b.content
                      ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{b.content}</ReactMarkdown>
                      : null}
                  </div>
                );

                // Video
                if (b.type === 'video') {
                  const embed = toVideoEmbed(b.url);
                  return (
                    <div key={b.id || bIdx} className="space-y-1.5">
                      {b.titulo      && <p className="text-sm font-semibold text-white">{b.titulo}</p>}
                      {b.descripcion && <p className="text-xs text-slate-400">{b.descripcion}</p>}
                      {embed ? (
                        isOnline
                          ? <div className="rounded-xl overflow-hidden border border-surface-border aspect-video"><iframe src={embed} className="w-full h-full" allowFullScreen title={b.titulo || 'Video'} /></div>
                          : <div className="flex flex-col items-center justify-center py-8 rounded-xl border border-surface-border bg-slate-900/50 text-center"><VideoOff size={24} className="text-slate-500 mb-2" /><p className="text-slate-400 text-sm">Video no disponible sin conexión</p></div>
                      ) : null}
                    </div>
                  );
                }

                // Presentación
                if (b.type === 'presentacion') {
                  const embed = toPresentacionEmbed(b.url);
                  return (
                    <div key={b.id || bIdx} className="space-y-1.5">
                      {b.titulo && <p className="text-sm font-semibold text-white flex items-center gap-1"><FileText size={13} className="text-pink-400" />{b.titulo}</p>}
                      {b.descripcion && <p className="text-xs text-slate-400">{b.descripcion}</p>}
                      {embed
                        ? <div className="rounded-xl overflow-hidden border border-surface-border" style={{ aspectRatio: '16/9' }}><iframe src={embed} className="w-full h-full" allowFullScreen title={b.titulo || 'Presentación'} /></div>
                        : null}
                    </div>
                  );
                }

                // Reto de código → solo instrucciones + botón (sin preview del código)
                if (b.type === 'code') {
                  const popcodeIdx = bloques.slice(0, bIdx).filter(x => x.type === 'code').length;
                  return (
                    <div key={b.id || bIdx} className="bg-slate-900/50 border border-green-500/20 rounded-xl p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <Terminal size={14} className="text-green-400" />
                        <span className="text-xs text-green-400 font-semibold uppercase tracking-wide">
                          Reto de Código {codeBlocks.length > 1 ? `— Popcode ${popcodeIdx + 1}` : ''}
                        </span>
                      </div>
                      {b.instrucciones && <p className="text-sm text-slate-300 whitespace-pre-wrap">{b.instrucciones}</p>}
                      <button
                        id={`lesson-open-editor-btn-${popcodeIdx}`}
                        onClick={() => { setActivePopcode(popcodeIdx); setPestana('ejercicio'); }}
                        className="flex items-center gap-2 text-sm font-semibold text-white bg-green-600 hover:bg-green-500 px-4 py-2 rounded-lg transition-all"
                      >
                        <Terminal size={15} />
                        {codeBlocks.length > 1 ? `Abrir Popcode ${popcodeIdx + 1}` : 'Abrir Editor'}
                      </button>
                    </div>
                  );
                }

                // Recurso / enlace → tarjeta compacta inline
                if (b.type === 'recurso' || b.type === 'link') {
                  const tipo = b.url?.match(/\.pdf/i) ? '📄' : b.url?.match(/youtube|youtu\.be|vimeo/i) ? '🎥' : '🔗';
                  return (
                    <a key={b.id || bIdx} href={b.url || '#'} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-surface-hover border border-surface-border rounded-xl hover:border-brand-500/50 transition-all group">
                      <span className="text-lg shrink-0">{tipo}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-200 truncate">{b.nombre || b.titulo || 'Recurso'}</p>
                        {b.descripcion && <p className="text-xs text-slate-500 mt-0.5">{b.descripcion}</p>}
                      </div>
                      <ExternalLink size={13} className="text-slate-600 group-hover:text-brand-400 shrink-0" />
                    </a>
                  );
                }

                return null;
              })}
            </div>
          ) : (
            // Fallback legacy
            <div className="prose prose-invert prose-sm max-w-none">
              {leccion?.content
                ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{leccion.content}</ReactMarkdown>
                : <p className="text-slate-400">No hay contenido disponible para esta lección.</p>}
            </div>
          )}


        </div>
      )}

      {pestana === 'ejercicio' && (
        <div className="space-y-4">
          {/* Selector de Popcode si hay varios */}
          {codeBlocks.length > 1 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-slate-400 shrink-0">Popcode:</span>
              {codeBlocks.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActivePopcode(i)}
                  className={clsx(
                    'px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all',
                    activePopcode === i
                      ? 'bg-green-600 text-white border-green-500'
                      : 'text-green-400 border-green-500/30 hover:bg-green-500/10'
                  )}
                >
                  Popcode {i + 1}
                </button>
              ))}
              {/* Flechas prev/next */}
              <div className="flex gap-1 ml-auto">
                <button
                  onClick={() => setActivePopcode(p => Math.max(0, p - 1))}
                  disabled={activePopcode === 0}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 border border-surface-border"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  onClick={() => setActivePopcode(p => Math.min(codeBlocks.length - 1, p + 1))}
                  disabled={activePopcode === codeBlocks.length - 1}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white disabled:opacity-30 border border-surface-border"
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}

          {/* Editor activo */}
          {codeBlocks[activePopcode] ? (
            <PopcodeEditor
              key={`popcode-${activePopcode}`}
              popcode={codeBlocks[activePopcode]}
              index={activePopcode}
              leccion={leccion}
              modulo={modulo}
              user={user}
              isOffline={isOffline}
            />
          ) : (
            <p className="text-slate-400 text-sm">No hay ejercicios para esta lección.</p>
          )}
        </div>
      )}
    </div>
  );
}
