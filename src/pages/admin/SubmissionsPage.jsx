import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  collection, query, orderBy, onSnapshot, doc, updateDoc, serverTimestamp, getDocs,
} from 'firebase/firestore';
import { db } from '@services/firebase/config';
import { incrementUserXp } from '@services/firebase/firestoreService';
import {
  CheckCircle2, Clock, Code2, ChevronDown, ChevronUp,
  Send, Loader2, Eye, EyeOff, MonitorPlay, SplitSquareHorizontal,
  FileText, RefreshCw, AlertTriangle, BookOpen,
} from 'lucide-react';
import clsx from 'clsx';

function buildSrcDoc(html = '', css = '', js = '') {
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${css}</style>
</head>
<body>
${html}
<script>
  window.onerror = function(msg, src, line) {
    var el = document.createElement('div');
    el.style.cssText = 'position:fixed;bottom:0;left:0;right:0;background:#ef4444;color:#fff;padding:8px;font-family:monospace;font-size:11px;z-index:9999';
    el.textContent = '⚠ Error JS (línea ' + line + '): ' + msg;
    document.body.appendChild(el);
    return true;
  };
  try { ${js} } catch(e) {}
<\/script>
</body>
</html>`;
}

function CodeViewer({ html, css, js }) {
  const [tab,    setTab]    = useState('preview'); // 'preview' | 'html' | 'css' | 'js'
  const [layout, setLayout] = useState('split');   // 'split' | 'code' | 'preview'
  const [splitRatio, setSplitRatio] = useState(50);
  const [editorHeight, setEditorHeight] = useState(300);

  const wrapperRef = useRef(null);
  const isDraggingH = useRef(false);
  const isDraggingV = useRef(false);

  const onMouseDownDivider = useCallback((e) => {
    e.preventDefault();
    isDraggingH.current = true;
    const onMove = (ev) => {
      if (!isDraggingH.current || !wrapperRef.current) return;
      const rect = wrapperRef.current.getBoundingClientRect();
      const x = ev.clientX - rect.left;
      const ratio = Math.min(80, Math.max(20, (x / rect.width) * 100));
      setSplitRatio(ratio);
    };
    const onUp = () => {
      isDraggingH.current = false;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, []);

  const onMouseDownHeightHandle = useCallback((e) => {
    e.preventDefault();
    isDraggingV.current = true;
    const startY = e.clientY;
    const startH = editorHeight;
    const onMove = (ev) => {
      if (!isDraggingV.current) return;
      const delta = ev.clientY - startY;
      setEditorHeight(Math.max(150, Math.min(800, startH + delta)));
    };
    const onUp = () => {
      isDraggingV.current = false;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [editorHeight]);

  const srcDoc = useMemo(() => buildSrcDoc(html, css, js), [html, css, js]);
  const codeContent = { html: html || '(vacío)', css: css || '(vacío)', js: js || '(vacío)' };

  return (
    <div className="rounded-xl overflow-hidden border border-surface-border bg-slate-950 flex flex-col">
      {/* Barra de control */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-surface-dark border-b border-surface-border shrink-0">
        {/* Tabs código */}
        <div className="flex gap-0.5">
          {[
            ['preview', '▶ Preview', 'text-green-400'],
            ['html',    'HTML',      'text-orange-400'],
            ['css',     'CSS',       'text-blue-400'],
            ['js',      'JS',        'text-yellow-400'],
          ].map(([id, label, color]) => (
            <button key={id} onClick={() => setTab(id)}
              className={clsx('px-2.5 py-1 text-xs font-mono font-semibold rounded transition-all',
                tab === id ? `${color} bg-white/5` : 'text-slate-500 hover:text-slate-200')}>
              {label}
            </button>
          ))}
        </div>

        {/* Layout toggle (solo para preview) */}
        {tab === 'preview' && (
          <div className="flex gap-0.5 bg-surface-hover rounded p-0.5">
            {[
              ['split',   <SplitSquareHorizontal size={13} />, 'Split'],
              ['preview', <MonitorPlay size={13} />,           'Solo preview'],
              ['code',    <Code2 size={13} />,                 'Solo código'],
            ].map(([id, icon, title]) => (
              <button key={id} title={title} onClick={() => setLayout(id)}
                className={clsx('px-1.5 py-1 rounded text-xs transition-all',
                  layout === id ? 'bg-surface-card text-white' : 'text-slate-500 hover:text-slate-200')}>
                {icon}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Contenido */}
      {tab === 'preview' ? (
        <div ref={wrapperRef} className="flex relative" style={layout !== 'code' ? { height: editorHeight } : {}}>
          {/* Panel código */}
          {layout !== 'preview' && (
            <div className="overflow-auto border-r border-surface-border" style={layout === 'split' ? { width: `${splitRatio}%` } : { width: '100%' }}>
              <div className="flex border-b border-surface-border sticky top-0 bg-slate-950 z-10">
                {[['html','HTML','text-orange-400'],['css','CSS','text-blue-400'],['js','JS','text-yellow-400']].map(([id, label, color]) => (
                  <button key={id} onClick={() => {}}
                    className={`px-2.5 py-1 text-xs font-mono ${color} opacity-50 cursor-default bg-slate-950`}>
                    {label}
                  </button>
                ))}
              </div>
              <div className="overflow-auto h-full">
                <div className="mb-0.5">
                  <span className="px-3 py-0.5 text-[10px] text-orange-400/60 uppercase tracking-wider">HTML</span>
                  <pre className="text-xs font-mono text-slate-300 px-3 pb-2 whitespace-pre-wrap">{html || '(vacío)'}</pre>
                </div>
                {css && <div>
                  <span className="px-3 py-0.5 text-[10px] text-blue-400/60 uppercase tracking-wider">CSS</span>
                  <pre className="text-xs font-mono text-slate-300 px-3 pb-2 whitespace-pre-wrap">{css}</pre>
                </div>}
                {js && <div>
                  <span className="px-3 py-0.5 text-[10px] text-yellow-400/60 uppercase tracking-wider">JS</span>
                  <pre className="text-xs font-mono text-slate-300 px-3 pb-2 whitespace-pre-wrap">{js}</pre>
                </div>}
              </div>
            </div>
          )}

          {/* Divisor horizontal */}
          {layout === 'split' && (
            <div
              className="hidden sm:block w-1.5 bg-surface-border hover:bg-brand-500/50 active:bg-brand-500 cursor-col-resize transition-colors shrink-0 z-20"
              onMouseDown={onMouseDownDivider}
            />
          )}

          {/* Panel preview */}
          {layout !== 'code' && (
            <div className="flex flex-col" style={layout === 'split' ? { width: `calc(${100 - splitRatio}% - 6px)` } : { width: '100%' }}>
              <div className="flex items-center gap-1.5 px-2 py-1 bg-surface-dark border-b border-surface-border">
                <span className="w-2 h-2 rounded-full bg-red-400/60" />
                <span className="w-2 h-2 rounded-full bg-yellow-400/60" />
                <span className="w-2 h-2 rounded-full bg-green-400/60" />
                <span className="text-[10px] text-slate-500 font-mono ml-1">Vista previa</span>
              </div>
              <iframe
                srcDoc={srcDoc}
                sandbox="allow-scripts allow-same-origin"
                title="Vista previa del estudiante"
                className="flex-1 bg-white"
                style={{ border: 'none' }}
              />
            </div>
          )}
        </div>
      ) : (
        /* Vista de un solo lenguaje */
        <pre className="text-xs font-mono text-slate-200 p-4 overflow-x-auto whitespace-pre-wrap" style={{ maxHeight: Math.max(editorHeight, 256) }}>
          {codeContent[tab]}
        </pre>
      )}

      {/* Manejador inferior para altura */}
      <div 
        className="hidden sm:flex h-3 bg-surface-dark border-t border-surface-border hover:bg-surface-hover cursor-row-resize items-center justify-center group shrink-0"
        onMouseDown={onMouseDownHeightHandle}
      >
        <div className="w-12 h-1 bg-surface-border group-hover:bg-brand-500/50 rounded-full transition-colors" />
      </div>
    </div>
  );
}

function EntregaCard({ entrega, atrasada }) {
  const [expanded,     setExpanded]     = useState(false);
  const [showCode,     setShowCode]     = useState(false);
  const [comentario,   setComentario]   = useState(entrega.comentarioProfesor || '');
  const [calificacion, setCalificacion] = useState(
    entrega.calificacion !== undefined && entrega.calificacion !== '' && entrega.calificacion !== null
      ? Number(entrega.calificacion)
      : ''
  );
  const [guardando,    setGuardando]    = useState(false);
  const [guardado,     setGuardado]     = useState(false);

  // XP base de la lección (si la entrega lo guarda, sino 50 por defecto)
  const xpBase = entrega.xpReward || 50;

  const fechaStr = entrega.entregadoEn?.toDate
    ? entrega.entregadoEn.toDate().toLocaleString('es-VE')
    : 'Sin fecha';

  // Detectar tipo de entrega
  const tipoLabel = entrega.tipo === 'editor'
    ? '🖥 Editor Libre'
    : entrega.tipo === 'sandbox'
      ? '🧪 Sandbox'
      : `💻 Popcode ${(entrega.popcodeIndex ?? 0) + 1}`;

  const handleGuardar = async () => {
    // Validar que la nota esté en el rango 0-20
    const nota = Number(calificacion);
    if (calificacion !== '' && (isNaN(nota) || nota < 0 || nota > 20)) {
      alert('La calificación debe ser un número entre 0 y 20.');
      return;
    }
    setGuardando(true);
    try {
      await updateDoc(doc(db, 'entregas', entrega.id), {
        revisado: true,
        calificacion: calificacion !== '' ? nota : null,
        comentarioProfesor: comentario,
        revisadoEn: serverTimestamp(),
      });

      // Otorgar XP al estudiante basado en nota/20 * xpBase
      if (calificacion !== '' && !isNaN(nota) && entrega.estudianteId) {
        const xpGanado = Math.round((nota / 20) * xpBase);
        if (xpGanado > 0) {
          await incrementUserXp(entrega.estudianteId, xpGanado);
        }
      }

      setGuardado(true);
      setTimeout(() => setGuardado(false), 2000);
    } catch (err) {
      console.error(err);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className={clsx(
      'border rounded-xl overflow-hidden transition-all',
      entrega.revisado
        ? 'border-green-500/20 bg-green-500/5'
        : 'border-surface-border bg-surface-card'
    )}>
      <div className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none"
        onClick={() => setExpanded(v => !v)}>
        <div className={clsx('w-7 h-7 rounded-full flex items-center justify-center shrink-0',
          entrega.revisado ? 'bg-green-500/20 text-green-400' : 'bg-surface-hover text-slate-500')}>
          {entrega.revisado ? <CheckCircle2 size={14} /> : <Clock size={14} />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-white truncate">{entrega.estudianteNombre}</p>
            {atrasada && (
              <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded">
                <AlertTriangle size={9} /> Atrasada
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500">
            {fechaStr} · {tipoLabel}
            {entrega.ediciones > 0 && <span className="text-brand-400 font-medium ml-1">· Editado {entrega.ediciones} {entrega.ediciones === 1 ? 'vez' : 'veces'}</span>}
          </p>
        </div>
        {entrega.calificacion != null && entrega.calificacion !== '' && (
          (() => {
            const n = Number(entrega.calificacion);
            const color = n >= 17 ? 'text-green-300 bg-green-500/10 border-green-500/30'
              : n >= 12 ? 'text-amber-300 bg-amber-500/10 border-amber-500/30'
              : n >= 8  ? 'text-orange-300 bg-orange-500/10 border-orange-500/30'
              : 'text-red-300 bg-red-500/10 border-red-500/30';
            return (
              <span className={`text-xs font-bold border px-2 py-0.5 rounded shrink-0 ${color}`}>
                {entrega.calificacion}/20
              </span>
            );
          })()
        )}
        {expanded
          ? <ChevronUp  size={16} className="text-slate-500 shrink-0" />
          : <ChevronDown size={16} className="text-slate-500 shrink-0" />}
      </div>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-surface-border pt-3">

          {/* Instrucciones del popcode si las tiene */}
          {entrega.popcodeTitulo && (
            <p className="text-xs text-slate-500 italic">"{entrega.popcodeTitulo}"</p>
          )}

          {/* Toggle código / preview */}
          <button onClick={() => setShowCode(v => !v)}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors">
            {showCode ? <EyeOff size={13} /> : <Eye size={13} />}
            {showCode ? 'Ocultar código y preview' : 'Ver código y preview'}
          </button>

          {showCode && (
            <CodeViewer
              html={entrega.htmlCode}
              css={entrega.cssCode}
              js={entrega.jsCode}
            />
          )}

          <div className="space-y-2 pt-1">
            <div className="flex gap-2 items-center">
              <label className="text-xs text-slate-400 shrink-0 w-24">Calificación:</label>
              <div className="flex-1 flex items-center gap-2">
                <input
                  type="number"
                  min={0}
                  max={20}
                  step={0.5}
                  value={calificacion}
                  onChange={e => {
                    const v = e.target.value;
                    setCalificacion(v === '' ? '' : Number(v));
                  }}
                  placeholder="0 — 20"
                  className="w-24 bg-surface-hover border border-surface-border rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-brand-500"
                />
                <span className="text-xs text-slate-500">/ 20</span>
                {/* XP preview */}
                {calificacion !== '' && !isNaN(Number(calificacion)) && (
                  <span className="text-xs text-yellow-400 font-semibold">
                    +{Math.round((Number(calificacion) / 20) * xpBase)} XP
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-2">
              <label className="text-xs text-slate-400 shrink-0 w-24 pt-1.5">Comentario:</label>
              <textarea
                value={comentario}
                onChange={e => setComentario(e.target.value)}
                rows={2}
                placeholder="Ej: Buen trabajo, pero usa h1 para los títulos..."
                className="flex-1 bg-surface-hover border border-surface-border rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-brand-500 resize-none"
              />
            </div>
            <div className="flex justify-end">
              <button onClick={handleGuardar} disabled={guardando}
                className={clsx(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                  guardado
                    ? 'bg-green-500 text-white'
                    : 'bg-[#ea5837] hover:bg-[#c84223] text-white disabled:opacity-60'
                )}>
                {guardado
                  ? <><CheckCircle2 size={13} /> Guardado</>
                  : guardando
                    ? <><Loader2 size={13} className="animate-spin" /> Guardando...</>
                    : <><Send size={13} /> Marcar revisado</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SubmissionsPage() {
  const [entregas,      setEntregas]      = useState([]);
  const [modulos,       setModulos]       = useState({}); // { [moduloId]: { titulo, fechaLimite } }
  const [loading,       setLoading]       = useState(true);
  const [filtroModulo,  setFiltroModulo]  = useState('');
  const [filtroEstado,  setFiltroEstado]  = useState('todas');

  // Cargar módulos (para nombres y fechas límite)
  useEffect(() => {
    getDocs(collection(db, 'modulos')).then(snap => {
      const map = {};
      snap.docs.forEach(d => {
        const data = d.data();
        map[d.id] = { titulo: data.title || data.titulo || d.id, fechaLimite: data.fechaLimite || null };
      });
      setModulos(map);
    }).catch(console.error);
  }, []);

  // Suscripción en tiempo real a entregas
  useEffect(() => {
    const q = query(collection(db, 'entregas'), orderBy('entregadoEn', 'desc'));
    const unsub = onSnapshot(q, snapshot => {
      setEntregas(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, err => {
      console.error(err);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  // Módulos únicos de las entregas
  const modulosUnicos = useMemo(() => {
    const seen = new Map();
    entregas.forEach(e => {
      if (!seen.has(e.moduloId)) {
        seen.set(e.moduloId, {
          id: e.moduloId,
          titulo: modulos[e.moduloId]?.titulo || e.moduloTitulo || e.moduloId || 'Sin módulo',
          fechaLimite: modulos[e.moduloId]?.fechaLimite || null,
        });
      }
    });
    return [...seen.values()];
  }, [entregas, modulos]);

  // Helper: ¿es atrasada esta entrega?
  const esAtrasada = (entrega) => {
    const mod = modulos[entrega.moduloId];
    if (!mod?.fechaLimite) return false;
    const limite = new Date(mod.fechaLimite + 'T23:59:59');
    const fecha  = entrega.entregadoEn?.toDate ? entrega.entregadoEn.toDate() : new Date(entrega.entregadoEn);
    return fecha > limite;
  };

  // Filtrado
  const entregasFiltradas = useMemo(() => entregas.filter(e => {
    if (filtroModulo && e.moduloId !== filtroModulo)              return false;
    if (filtroEstado === 'pendiente' && e.revisado)               return false;
    if (filtroEstado === 'revisada'  && !e.revisado)              return false;
    if (filtroEstado === 'atrasada'  && !esAtrasada(e))           return false;
    return true;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [entregas, filtroModulo, filtroEstado, modulos]);

  const pendientes = entregas.filter(e => !e.revisado).length;
  const atrasadas  = entregas.filter(e => esAtrasada(e)).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-white">Entregas</h1>
          <p className="text-slate-400 text-sm mt-0.5">
            {pendientes > 0 && <span className="text-amber-400 font-medium">{pendientes} pendiente{pendientes !== 1 ? 's' : ''}</span>}
            {pendientes > 0 && atrasadas > 0 && ' · '}
            {atrasadas > 0 && <span className="text-orange-400 font-medium">{atrasadas} atrasada{atrasadas !== 1 ? 's' : ''}</span>}
            {pendientes === 0 && atrasadas === 0 && 'Todas revisadas ✓'}
            {' · '}{entregas.length} en total
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
          Tiempo real
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 flex-wrap items-center">
        {/* Por módulo */}
        <select value={filtroModulo} onChange={e => setFiltroModulo(e.target.value)}
          className="bg-surface-card border border-surface-border rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-brand-500">
          <option value="">Todos los módulos</option>
          {modulosUnicos.map(m => (
            <option key={m.id} value={m.id}>{m.titulo}</option>
          ))}
        </select>

        {/* Por estado */}
        <div className="flex gap-1">
          {[['todas','Todas'],['pendiente','⏳ Pendientes'],['revisada','✅ Revisadas'],['atrasada','⚠️ Atrasadas']].map(([val, lbl]) => (
            <button key={val} onClick={() => setFiltroEstado(val)}
              className={clsx('px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all',
                filtroEstado === val
                  ? 'bg-brand-600 text-white border-brand-500'
                  : 'text-slate-400 border-surface-border hover:border-brand-500/50 hover:text-white')}>
              {lbl}
            </button>
          ))}
        </div>

        <span className="ml-auto text-xs text-slate-500 self-center">
          {entregasFiltradas.length} resultado{entregasFiltradas.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Lista */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={24} className="animate-spin text-brand-400" />
        </div>
      ) : entregasFiltradas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Code2 size={32} className="text-slate-600 mb-3" />
          <p className="text-slate-400 font-medium">No hay entregas todavía</p>
          <p className="text-slate-600 text-sm mt-1">
            Cuando los estudiantes entreguen sus trabajos aparecerán aquí
          </p>
        </div>
      ) : (
        // Agrupado por módulo → luego por lección
        modulosUnicos
          .filter(m => !filtroModulo || m.id === filtroModulo)
          .map(modulo => {
            const entregasDelModulo = entregasFiltradas.filter(e => e.moduloId === modulo.id);
            if (entregasDelModulo.length === 0) return null;

            // Lecciones dentro del módulo
            const leccionesEnModulo = [...new Map(
              entregasDelModulo.map(e => [e.leccionId, { id: e.leccionId, titulo: e.leccionTitulo }])
            ).values()];

            return (
              <div key={modulo.id} className="space-y-4">
                {/* Cabecera de módulo */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <BookOpen size={14} className="text-[#ea5837]" />
                    <h2 className="text-sm font-bold text-white">{modulo.titulo}</h2>
                    <span className="text-xs text-slate-500">({entregasDelModulo.length})</span>
                  </div>
                  {modulo.fechaLimite && (
                    <span className={clsx(
                      'text-[10px] font-semibold px-2 py-0.5 rounded-full border',
                      new Date() > new Date(modulo.fechaLimite + 'T23:59:59')
                        ? 'bg-red-500/10 text-red-400 border-red-500/20'
                        : 'bg-green-500/10 text-green-400 border-green-500/20'
                    )}>
                      📅 Límite: {new Date(modulo.fechaLimite).toLocaleDateString('es-VE', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  )}
                  <div className="flex-1 h-px bg-surface-border" />
                </div>

                {/* Lecciones dentro del módulo */}
                {leccionesEnModulo.map(leccion => {
                  const delLeccion = entregasDelModulo.filter(e => e.leccionId === leccion.id);
                  return (
                    <div key={leccion.id} className="space-y-2 pl-4 border-l-2 border-surface-border">
                      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                        <FileText size={11} />
                        {leccion.titulo || leccion.id}
                        <span className="text-slate-600 normal-case font-normal">({delLeccion.length})</span>
                      </h3>
                      {delLeccion.map(e => (
                        <EntregaCard key={e.id} entrega={e} atrasada={esAtrasada(e)} />
                      ))}
                    </div>
                  );
                })}
              </div>
            );
          })
      )}
    </div>
  );
}
