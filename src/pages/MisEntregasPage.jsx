import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@services/firebase/config';
import { selectCurrentUser } from '@store/slices/authSlice';
import { createRepo, pushFiles } from '@services/githubService';
import { GitHubLinkModel } from '@db/models';
import toast from 'react-hot-toast';
import {
  Send, CheckCircle2, Clock, Star, MessageSquare,
  Code2, ChevronDown, ChevronUp, Loader2, AlertTriangle, BookOpen, Eye, Github
} from 'lucide-react';
import clsx from 'clsx';

function MiEntregaCard({ entrega, userId }) {
  const [expanded, setExpanded] = useState(false);
  const [viewMode, setViewMode] = useState('code');
  const [isExporting, setIsExporting] = useState(false);

  const fecha = entrega.entregadoEn?.toDate
    ? entrega.entregadoEn.toDate()
    : entrega.entregadoEn
      ? new Date(entrega.entregadoEn)
      : null;

  const fechaStr = fecha
    ? fecha.toLocaleDateString('es-VE', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
    : 'Sin fecha';

  const calificacion = entrega.calificacion != null && entrega.calificacion !== '' ? Number(entrega.calificacion) : null;
  const revisado     = entrega.revisado;

  // Color de calificación (escala 0–20)
  const notaColor = calificacion === null ? 'text-slate-400'
    : calificacion >= 17 ? 'text-green-400'
    : calificacion >= 12 ? 'text-amber-400'
    : calificacion >= 8  ? 'text-orange-400'
    : 'text-red-400';

  const handleExportToGithub = async () => {
    if (!userId) return;

    const ghData = await GitHubLinkModel.get(userId);
    if (!ghData?.githubToken) {
      toast('Debes vincular tu token de GitHub en la sección de Integración GitHub primero', { icon: 'ℹ️' });
      return;
    }

    const defaultName = (entrega.leccionTitulo || 'entrega').toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const repoName = prompt('Ingresa el nombre para el nuevo repositorio de GitHub:', defaultName);
    if (!repoName) return;

    setIsExporting(true);
    const toastId = toast.loading('Exportando entrega a GitHub...');
    try {
      const repo = await createRepo(ghData.githubToken, repoName, `Entrega: ${entrega.leccionTitulo || 'Proyecto'}`);
      
      const filesToPush = [];
      if (entrega.htmlCode) filesToPush.push({ path: 'index.html', content: entrega.htmlCode });
      if (entrega.cssCode) filesToPush.push({ path: 'style.css', content: entrega.cssCode });
      if (entrega.jsCode) filesToPush.push({ path: 'script.js', content: entrega.jsCode });

      if (filesToPush.length === 0) {
        throw new Error("No hay código para exportar");
      }

      await pushFiles(ghData.githubToken, repo.owner.login, repo.name, filesToPush);
      toast.success('¡Entrega exportada a GitHub exitosamente!', { id: toastId });
      window.open(repo.html_url, '_blank');
    } catch (err) {
      console.error(err);
      toast.error('Error al exportar a GitHub: ' + err.message, { id: toastId });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className={clsx(
      'bg-surface-card border rounded-2xl overflow-hidden transition-all',
      revisado ? 'border-green-500/30' : 'border-surface-border'
    )}>
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer select-none hover:bg-surface-hover/30 transition-all"
        onClick={() => setExpanded(v => !v)}
      >
        {/* Estado */}
        <div className={clsx(
          'w-8 h-8 rounded-full flex items-center justify-center shrink-0',
          revisado ? 'bg-green-500/20 text-green-400' : 'bg-amber-500/10 text-amber-400'
        )}>
          {revisado ? <CheckCircle2 size={16} /> : <Clock size={16} />}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">
            {entrega.leccionTitulo || 'Lección'}
          </p>
          <p className="text-xs text-slate-500">
            {fechaStr}
            {entrega.popcodeTitulo && ` · ${entrega.popcodeTitulo}`}
          </p>
        </div>

        {/* Calificación */}
        {revisado && calificacion != null ? (
          <div className={clsx('flex items-center gap-1 font-bold text-sm shrink-0', notaColor)}>
            <Star size={13} />
            <span>{calificacion}<span className="text-xs font-normal text-slate-500">/20</span></span>
          </div>
        ) : revisado ? (
          <span className="text-xs text-slate-400 shrink-0">Revisado</span>
        ) : (
          <span className="text-xs text-amber-400 shrink-0">Pendiente</span>
        )}

        {/* Expand arrow */}
        <div className="text-slate-500 shrink-0">
          {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </div>

      {/* Detalle expandido */}
      {expanded && (
        <div className="px-4 pb-4 space-y-4 border-t border-surface-border">
          {/* Comentario del profesor */}
          {entrega.comentarioProfesor && (
            <div className="mt-3 bg-brand-500/10 border border-brand-500/20 rounded-xl p-3 space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-brand-300">
                <MessageSquare size={12} /> Comentario del profesor
              </div>
              <p className="text-sm text-slate-200 whitespace-pre-wrap">
                {entrega.comentarioProfesor}
              </p>
            </div>
          )}

          {/* Tu código o Vista Previa */}
          {(entrega.htmlCode || entrega.cssCode || entrega.jsCode) && (
            <div className="space-y-3 mt-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <Code2 size={12} /> Tu entrega
                </p>
                <div className="flex gap-1 bg-surface-dark border border-surface-border rounded-lg p-0.5">
                  <button onClick={() => setViewMode('code')} className={clsx('px-2 py-1 text-xs rounded-md transition-all flex items-center gap-1', viewMode === 'code' ? 'bg-surface-card text-white shadow-sm' : 'text-slate-500 hover:text-white')}>
                    <Code2 size={12}/> Código
                  </button>
                  <button onClick={() => setViewMode('preview')} className={clsx('px-2 py-1 text-xs rounded-md transition-all flex items-center gap-1', viewMode === 'preview' ? 'bg-surface-card text-white shadow-sm' : 'text-slate-500 hover:text-white')}>
                    <Eye size={12}/> Vista Previa
                  </button>
                  <button 
                    onClick={handleExportToGithub}
                    disabled={isExporting}
                    className="px-2 py-1 text-xs rounded-md transition-all flex items-center gap-1 text-slate-500 hover:text-white hover:bg-surface-card disabled:opacity-50"
                  >
                    <Github size={12}/> {isExporting ? 'Subiendo...' : 'A GitHub'}
                  </button>
                </div>
              </div>

              {viewMode === 'code' ? (
                <div className="space-y-2">
                  {entrega.htmlCode && (
                    <div>
                      <p className="text-[10px] text-slate-500 mb-1">HTML</p>
                      <pre className="text-xs text-green-300 bg-slate-900 rounded-lg p-3 overflow-x-auto font-mono max-h-48 overflow-y-auto">
                        {entrega.htmlCode}
                      </pre>
                    </div>
                  )}
                  {entrega.cssCode && (
                    <div>
                      <p className="text-[10px] text-slate-500 mb-1">CSS</p>
                      <pre className="text-xs text-blue-300 bg-slate-900 rounded-lg p-3 overflow-x-auto font-mono max-h-32 overflow-y-auto">
                        {entrega.cssCode}
                      </pre>
                    </div>
                  )}
                  {entrega.jsCode && (
                    <div>
                      <p className="text-[10px] text-slate-500 mb-1">JavaScript</p>
                      <pre className="text-xs text-yellow-300 bg-slate-900 rounded-lg p-3 overflow-x-auto font-mono max-h-32 overflow-y-auto">
                        {entrega.jsCode}
                      </pre>
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative w-full bg-white rounded-lg border border-surface-border overflow-hidden" style={{ height: '300px' }}>
                  <iframe
                    title="Vista previa"
                    sandbox="allow-scripts allow-same-origin"
                    className="absolute inset-0 w-full h-full"
                    style={{ border: 'none' }}
                    srcDoc={`<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${entrega.cssCode || ''}</style>
</head>
<body>
${entrega.htmlCode || ''}
<script>
  try {
    ${entrega.jsCode || ''}
  } catch(e) { console.error(e); }
</script>
</body>
</html>`}
                  />
                </div>
              )}
            </div>
          )}

          {/* Sin revisión aún */}
          {!revisado && (
            <div className="flex items-center gap-2 text-xs text-amber-400 bg-amber-500/5 border border-amber-500/20 rounded-xl p-3">
              <Clock size={14} className="shrink-0" />
              Tu entrega está esperando revisión del profesor.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function MisEntregasPage() {
  const user = useSelector(selectCurrentUser);
  const [entregas,  setEntregas]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [filtro,    setFiltro]    = useState('todas'); // 'todas' | 'pendiente' | 'revisada'

  const userId = user?.uid || user?.id;

  useEffect(() => {
    if (!userId) { setLoading(false); return; }

    // Solo las entregas de este estudiante
    const q = query(
      collection(db, 'entregas'),
      where('estudianteId', '==', userId),
      orderBy('entregadoEn', 'desc')
    );

    const unsub = onSnapshot(q, snap => {
      setEntregas(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }, err => {
      console.error(err);
      setLoading(false);
    });

    return () => unsub();
  }, [userId]);

  const entregasFiltradas = useMemo(() => entregas.filter(e => {
    if (filtro === 'pendiente') return !e.revisado;
    if (filtro === 'revisada')  return e.revisado;
    return true;
  }), [entregas, filtro]);

  // Agrupar por módulo
  const modulosUnicos = useMemo(() => {
    const seen = new Map();
    entregas.forEach(e => {
      if (!seen.has(e.moduloId)) {
        seen.set(e.moduloId, e.moduloId || 'Sin módulo');
      }
    });
    return [...seen.keys()];
  }, [entregas]);

  const pendientes = entregas.filter(e => !e.revisado).length;
  const revisadas  = entregas.filter(e =>  e.revisado).length;

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white flex items-center gap-2">
          <Send size={22} className="text-[#ea5837]" />
          Mis Entregas
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          {loading ? 'Cargando...' : `${entregas.length} entrega${entregas.length !== 1 ? 's' : ''} en total`}
          {pendientes > 0 && (
            <span className="text-amber-400 ml-2">· {pendientes} pendiente{pendientes !== 1 ? 's' : ''}</span>
          )}
          {revisadas > 0 && (
            <span className="text-green-400 ml-2">· {revisadas} revisada{revisadas !== 1 ? 's' : ''}</span>
          )}
        </p>
      </div>

      {/* Resumen visual */}
      {!loading && entregas.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-surface-card border border-surface-border rounded-2xl p-4 text-center">
            <p className="text-2xl font-black text-white">{entregas.length}</p>
            <p className="text-xs text-slate-400 mt-1">Total</p>
          </div>
          <div className="bg-surface-card border border-green-500/20 rounded-2xl p-4 text-center">
            <p className="text-2xl font-black text-green-400">{revisadas}</p>
            <p className="text-xs text-slate-400 mt-1">Revisadas</p>
          </div>
          <div className="bg-surface-card border border-amber-500/20 rounded-2xl p-4 text-center">
            <p className="text-2xl font-black text-amber-400">{pendientes}</p>
            <p className="text-xs text-slate-400 mt-1">Pendientes</p>
          </div>
        </div>
      )}

      {/* Filtros */}
      {!loading && entregas.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {[
            ['todas',     '📋 Todas'],
            ['pendiente', '⏳ Pendientes'],
            ['revisada',  '✅ Revisadas'],
          ].map(([val, lbl]) => (
            <button key={val} onClick={() => setFiltro(val)}
              className={clsx('px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                filtro === val
                  ? 'bg-[#ea5837] text-white border-[#ea5837]'
                  : 'text-slate-400 border-surface-border hover:border-[#ea5837]/50 hover:text-white')}>
              {lbl}
            </button>
          ))}
        </div>
      )}

      {/* Lista */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 size={28} className="animate-spin text-[#ea5837]" />
        </div>
      ) : !userId ? (
        <div className="flex flex-col items-center py-16 text-center">
          <AlertTriangle size={32} className="text-amber-400 mb-3" />
          <p className="text-slate-400">Inicia sesión para ver tus entregas.</p>
        </div>
      ) : entregasFiltradas.length === 0 ? (
        <div className="flex flex-col items-center py-16 bg-surface-card border border-surface-border rounded-2xl text-center">
          <Send size={36} className="text-slate-600 mb-4" />
          <p className="text-slate-300 font-semibold text-lg">
            {filtro === 'todas' ? 'No has entregado nada aún' : `No tienes entregas ${filtro === 'pendiente' ? 'pendientes' : 'revisadas'}`}
          </p>
          <p className="text-slate-500 text-sm mt-2 max-w-xs">
            {filtro === 'todas'
              ? 'Cuando entregues un Popcode en una lección, aparecerá aquí con su calificación.'
              : 'Prueba cambiando el filtro.'}
          </p>
        </div>
      ) : (
        // Agrupado por lección
        (() => {
          // Agrupar por leccionId
          const grupoPorLeccion = entregasFiltradas.reduce((acc, e) => {
            const key = e.leccionId || 'sin-leccion';
            if (!acc[key]) acc[key] = { titulo: e.leccionTitulo, entregas: [] };
            acc[key].entregas.push(e);
            return acc;
          }, {});

          return Object.entries(grupoPorLeccion).map(([leccionId, grupo]) => (
            <div key={leccionId} className="space-y-2">
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2 px-1">
                <BookOpen size={12} className="text-[#ea5837]" />
                {grupo.titulo || 'Lección'}
                <span className="text-slate-600 normal-case font-normal">({grupo.entregas.length})</span>
              </h2>
              {grupo.entregas.map(e => (
                <MiEntregaCard key={e.id} entrega={e} userId={userId} />
              ))}
            </div>
          ));
        })()
      )}
    </div>
  );
}
