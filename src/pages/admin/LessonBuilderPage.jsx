import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  ArrowLeft, Save, Plus, Trash2, Eye, EyeOff,
  Code2, FileUp, Video, Type, Loader2, CheckCircle2,
  ChevronUp, ChevronDown, Smartphone, Monitor, Zap,
  BookOpen, Terminal, Paperclip, Link2, Presentation,
  ExternalLink, FileText, X, GripVertical,
} from 'lucide-react';
import clsx from 'clsx';
import {
  getModulo, getLeccion, createLeccion, updateLeccion, getLeccionesByModulo,
} from '@services/firebase/firestoreService';
import { subirArchivo } from '@services/firebase/storageService';

const uid = () => Math.random().toString(36).substring(2, 9);

// Convierte una URL de video a embed
function toVideoEmbed(url) {
  if (!url) return null;
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&?\s]+)/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const drive = url.match(/drive\.google\.com\/file\/d\/([^/]+)/);
  if (drive) return `https://drive.google.com/file/d/${drive[1]}/preview`;
  return url;
}

// Convierte una URL de presentación a embed
function toPresentationEmbed(url) {
  if (!url) return null;
  // Google Slides: /presentation/d/ID/edit → /presentation/d/ID/embed
  const gSlides = url.match(/docs\.google\.com\/presentation\/d\/([^/]+)/);
  if (gSlides) return `https://docs.google.com/presentation/d/${gSlides[1]}/embed?start=false&loop=false&delayms=3000`;
  // Canva: share link as-is
  if (url.includes('canva.com')) return url;
  // OneDrive / SharePoint embed
  if (url.includes('onedrive.live.com') || url.includes('sharepoint.com')) return url;
  return url;
}

// Detecta el tipo de recurso según la URL para mostrar el ícono correcto
function guessResourceType(url = '') {
  if (!url) return 'link';
  if (url.match(/\.(pdf)($|\?)/i) || url.includes('drive.google') && url.includes('pdf')) return 'pdf';
  if (url.match(/\.(pptx?|ppt)($|\?)/i) || url.includes('presentation')) return 'pptx';
  if (url.match(/\.(docx?)($|\?)/i)) return 'doc';
  return 'link';
}

const BLOCK_TYPES = [
  { type: 'text',         label: 'Texto / Markdown',   icon: Type,         color: 'text-blue-400',   bg: 'bg-blue-500/10   border-blue-500/30'   },
  { type: 'video',        label: 'Video',               icon: Video,        color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/30' },
  { type: 'recurso',      label: 'Recurso / Enlace',    icon: Link2,        color: 'text-orange-400', bg: 'bg-orange-500/10 border-orange-500/30' },
  { type: 'presentacion', label: 'Presentación',        icon: FileText,     color: 'text-pink-400',   bg: 'bg-pink-500/10   border-pink-500/30'   },
  { type: 'code',         label: 'Reto de Código',      icon: Code2,        color: 'text-green-400',  bg: 'bg-green-500/10  border-green-500/30'  },
];

const EMPTY_BLOCK = {
  text:         () => ({ id: uid(), type: 'text',         content: '' }),
  video:        () => ({ id: uid(), type: 'video',        url: '', titulo: '', descripcion: '' }),
  recurso:      () => ({ id: uid(), type: 'recurso',      url: '', nombre: '', descripcion: '', rutaFirebase: '' }),
  presentacion: () => ({ id: uid(), type: 'presentacion', url: '', titulo: '', descripcion: '' }),
  code:         () => ({ id: uid(), type: 'code', lenguaje: 'html', baseCode: `<!DOCTYPE html>\n<html>\n  <head>\n    <title>Popcode</title>\n  </head>\n  <body>\n    <!-- Programa aquí -->\n\n  </body>\n</html>`, cssCode: '', jsCode: '', instrucciones: '', esPopcode: true }),
};

function BlockWrapper({ children, onDelete, onMoveUp, onMoveDown, isFirst, isLast, color, bg, icon: Icon, label }) {
  return (
    <div className={clsx('border rounded-xl p-4 transition-all', bg)}>
      <div className="flex items-center justify-between mb-3">
        <div className={clsx('flex items-center gap-2 text-xs font-semibold uppercase tracking-wide', color)}>
          <Icon size={14} /><span>{label}</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={onMoveUp}   disabled={isFirst} className="p-1 rounded text-slate-500 hover:text-white disabled:opacity-20 transition-colors"><ChevronUp   size={14} /></button>
          <button onClick={onMoveDown} disabled={isLast}  className="p-1 rounded text-slate-500 hover:text-white disabled:opacity-20 transition-colors"><ChevronDown size={14} /></button>
          <button onClick={onDelete}                       className="p-1 rounded text-slate-500 hover:text-red-400 transition-colors ml-1"><Trash2 size={14} /></button>
        </div>
      </div>
      {children}
    </div>
  );
}

// Inputs reutilizables
const Field = ({ value, onChange, placeholder, multiline = false, rows = 3, mono = false, ring = 'focus:ring-blue-500/50' }) =>
  multiline ? (
    <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows}
      className={clsx('w-full bg-surface-dark/50 border border-surface-border rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 resize-y focus:outline-none focus:ring-2', ring, mono && 'font-mono')} />
  ) : (
    <input value={value} onChange={onChange} placeholder={placeholder}
      className={clsx('w-full bg-surface-dark/50 border border-surface-border rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2', ring)} />
  );

function TextBlock({ block, onChange, ...rest }) {
  const [preview, setPreview] = useState(false);
  return (
    <BlockWrapper {...rest} color="text-blue-400" bg="bg-blue-500/10 border-blue-500/30" icon={Type} label="Texto / Markdown">
      <div className="flex gap-1 mb-2">
        {['Editar', 'Preview'].map((l, i) => (
          <button key={l} onClick={() => setPreview(!!i)}
            className={clsx('px-2 py-0.5 text-xs rounded transition-all', preview === !!i ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white')}>
            {l}
          </button>
        ))}
      </div>
      {preview ? (
        <div className="min-h-[80px] prose prose-invert prose-sm max-w-none p-3 bg-surface-dark/50 rounded-lg border border-surface-border">
          {block.content
            ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{block.content}</ReactMarkdown>
            : <p className="text-slate-500 italic text-xs">Sin contenido aún...</p>}
        </div>
      ) : (
        <Field value={block.content} onChange={e => onChange({ ...block, content: e.target.value })}
          placeholder={'## Título\n**Negrita**, *cursiva*, `código`\n- Lista de items'}
          multiline rows={7} mono ring="focus:ring-blue-500/50" />
      )}
    </BlockWrapper>
  );
}

function VideoBlock({ block, onChange, ...rest }) {
  const embed = toVideoEmbed(block.url);
  return (
    <BlockWrapper {...rest} color="text-purple-400" bg="bg-purple-500/10 border-purple-500/30" icon={Video} label="Video">
      <div className="space-y-2">
        <Field value={block.titulo}      onChange={e => onChange({ ...block, titulo:      e.target.value })} placeholder="Título del video (opcional)"                        ring="focus:ring-purple-500/50" />
        <Field value={block.url}         onChange={e => onChange({ ...block, url:         e.target.value })} placeholder="URL del video - YouTube, Google Drive, Vimeo..."      ring="focus:ring-purple-500/50" />
        <Field value={block.descripcion} onChange={e => onChange({ ...block, descripcion: e.target.value })} placeholder="Descripción o contexto del video (opcional)..."    ring="focus:ring-purple-500/50" multiline rows={2} />
      </div>
      {embed && (
        <div className="mt-3 rounded-lg overflow-hidden border border-surface-border aspect-video">
          <iframe src={embed} className="w-full h-full" allowFullScreen title={block.titulo || 'Video'} />
        </div>
      )}
    </BlockWrapper>
  );
}

function RecursoBlock({ block, onChange, ...rest }) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress]   = useState(0);
  const [mode, setMode]           = useState(block.rutaFirebase ? 'upload' : 'url'); // 'url' | 'upload'
  const fileRef = useRef(null);
  const rtype   = guessResourceType(block.url);

  const handleFile = async (file) => {
    if (!file) return;
    setUploading(true); setProgress(0);
    try {
      const { url, rutaFirebase } = await subirArchivo(file, 'recursos_clases', p => setProgress(p));
      onChange({ ...block, nombre: block.nombre || file.name, url, rutaFirebase });
    } catch { alert('Error al subir. Verifica las reglas de Firebase Storage.'); }
    finally { setUploading(false); }
  };

  const ICON_MAP = { pdf: '📄', pptx: '📊', doc: '📝', link: '🔗' };

  return (
    <BlockWrapper {...rest} color="text-orange-400" bg="bg-orange-500/10 border-orange-500/30" icon={Link2} label="Recurso / Enlace">
      {/* Toggle modo */}
      <div className="flex gap-1 mb-3">
        {[['url', 'Pegar URL'], ['upload', 'Subir archivo']].map(([m, l]) => (
          <button key={m} onClick={() => setMode(m)}
            className={clsx('px-2 py-0.5 text-xs rounded transition-all', mode === m ? 'bg-orange-500 text-white' : 'text-slate-400 hover:text-white')}>
            {l}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <Field value={block.nombre} onChange={e => onChange({ ...block, nombre: e.target.value })}
          placeholder="Nombre del recurso (ej: Guía de estudio)" ring="focus:ring-orange-500/50" />

        {mode === 'url' ? (
          <Field value={block.url} onChange={e => onChange({ ...block, url: e.target.value, rutaFirebase: '' })}
            placeholder="URL del archivo o página web" ring="focus:ring-orange-500/50" />
        ) : (
          <>
            <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip" className="hidden"
              onChange={e => handleFile(e.target.files?.[0])} />
            {block.url && block.rutaFirebase ? (
              <div className="flex items-center gap-2 p-2 bg-surface-dark rounded-lg border border-surface-border text-sm">
                <span>{ICON_MAP[rtype]}</span>
                <span className="flex-1 truncate text-slate-300">{block.nombre || block.url}</span>
                <button onClick={() => onChange({ ...block, url: '', rutaFirebase: '' })} className="text-slate-500 hover:text-red-400"><X size={13} /></button>
              </div>
            ) : (
              <button onClick={() => fileRef.current?.click()} disabled={uploading}
                className="w-full border-2 border-dashed border-orange-500/30 rounded-lg p-4 flex flex-col items-center gap-2 text-orange-400 hover:bg-orange-500/5 transition-all disabled:opacity-50">
                {uploading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    <span className="text-xs">Subiendo... {progress}%</span>
                    <div className="w-full bg-surface-border rounded-full h-1">
                      <div className="bg-orange-400 h-1 rounded-full transition-all" style={{ width: `${progress}%` }} />
                    </div>
                  </>
                ) : (
                  <>
                    <FileUp size={20} />
                    <span className="text-xs font-medium">Haz clic para subir</span>
                    <span className="text-xs text-slate-500">PDF, Word, PowerPoint, ZIP</span>
                  </>
                )}
              </button>
            )}
          </>
        )}

        <Field value={block.descripcion} onChange={e => onChange({ ...block, descripcion: e.target.value })}
          placeholder="Descripción del recurso (ej: Esta es la tarea de la semana 1...)" multiline rows={2} ring="focus:ring-orange-500/50" />
      </div>

      {/* Vista previa del enlace */}
      {block.url && (
        <a href={block.url} target="_blank" rel="noopener noreferrer"
          className="mt-3 flex items-center gap-2 p-2 bg-surface-dark rounded-lg border border-surface-border text-xs text-slate-400 hover:text-orange-400 transition-colors">
          <ExternalLink size={12} />
          <span className="truncate">{block.url}</span>
        </a>
      )}
    </BlockWrapper>
  );
}

function PresentacionBlock({ block, onChange, ...rest }) {
  const embed = toPresentationEmbed(block.url);
  const [showEmbed, setShowEmbed] = useState(false);

  return (
    <BlockWrapper {...rest} color="text-pink-400" bg="bg-pink-500/10 border-pink-500/30" icon={FileText} label="Presentación">
      <div className="space-y-2">
        <Field value={block.titulo}      onChange={e => onChange({ ...block, titulo:      e.target.value })} placeholder="Título de la presentación (opcional)"                   ring="focus:ring-pink-500/50" />
        <Field value={block.url}         onChange={e => onChange({ ...block, url:         e.target.value })} placeholder="URL de la presentación - Google Slides, Canva, OneDrive..." ring="focus:ring-pink-500/50" />
        <Field value={block.descripcion} onChange={e => onChange({ ...block, descripcion: e.target.value })} placeholder="Descripción o instrucciones para el estudiante..."       ring="focus:ring-pink-500/50" multiline rows={2} />
      </div>

      {/* Tips de URL */}
      <div className="mt-2 flex flex-wrap gap-1.5">
        {[
          ['Google Slides', 'docs.google.com/presentation → compartir → "Publicar en la web"'],
          ['Canva', 'Compartir → "Ver enlace público"'],
          ['OneDrive', 'Compartir → "Insertar" → copiar src del iframe'],
        ].map(([p, t]) => (
          <span key={p} title={t} className="px-2 py-0.5 bg-pink-500/10 border border-pink-500/20 rounded text-xs text-pink-400 cursor-help">{p}</span>
        ))}
      </div>

      {embed && (
        <div className="mt-3">
          <button onClick={() => setShowEmbed(v => !v)}
            className="text-xs text-pink-400 hover:text-pink-300 transition-colors mb-2 flex items-center gap-1">
            <Eye size={12} /> {showEmbed ? 'Ocultar preview' : 'Ver preview de la presentación'}
          </button>
          {showEmbed && (
            <div className="rounded-lg overflow-hidden border border-surface-border" style={{ aspectRatio: '16/9' }}>
              <iframe src={embed} className="w-full h-full" allowFullScreen title={block.titulo || 'Presentación'} />
            </div>
          )}
        </div>
      )}
    </BlockWrapper>
  );
}

function CodeBlock({ block, onChange, ...rest }) {
  const [tab, setTab] = useState('instrucciones');

  return (
    <BlockWrapper {...rest} color="text-green-400" bg="bg-green-500/10 border-green-500/30" icon={Code2} label="Reto de Código">
      <div className="space-y-2">

        {/* Tabs */}
        <div className="flex gap-1 flex-wrap">
          {[
            ['instrucciones', 'Instrucciones'],
            ['html',          'HTML'],
            ['css',           'CSS'],
            ['js',            'JavaScript'],
          ].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)}
              className={clsx('px-2 py-0.5 text-xs rounded transition-all',
                tab === id ? 'bg-green-500 text-white' : 'text-slate-400 hover:text-white')}>
              {label}
            </button>
          ))}
        </div>

        {/* ── Instrucciones */}
        {tab === 'instrucciones' && (
          <div className="space-y-1">
            <p className="text-xs text-slate-500">El estudiante verá esto antes de abrir el editor.</p>
            <Field value={block.instrucciones}
              onChange={e => onChange({ ...block, instrucciones: e.target.value })}
              placeholder="Ej: Ve a la línea 8 y cambia el texto para que diga tu nombre. Luego cambia Ciudad y Escuela..."
              multiline rows={6} ring="focus:ring-green-500/50" />
          </div>
        )}

        {/* ── HTML */}
        {tab === 'html' && (
          <div className="space-y-1">
            <p className="text-xs text-slate-500">Pega aquí el contenido del <code className="bg-surface-card px-1 rounded">index.html</code> del Popcode.</p>
            <Field value={block.baseCode}
              onChange={e => onChange({ ...block, baseCode: e.target.value })}
              placeholder={'<!DOCTYPE html>\n<html>\n  <head>\n    <title>Popcode</title>\n  </head>\n  <body>\n    <!-- Programa aquí -->\n\n  </body>\n</html>'}
              multiline rows={11} mono ring="focus:ring-green-500/50" />
          </div>
        )}

        {/* ── CSS */}
        {tab === 'css' && (
          <div className="space-y-1">
            <p className="text-xs text-slate-500">Pega aquí el contenido del <code className="bg-surface-card px-1 rounded">estilo.css</code> del Popcode.</p>
            <Field value={block.cssCode || ''}
              onChange={e => onChange({ ...block, cssCode: e.target.value })}
              placeholder={`body {\n  background-color: #f54542;\n  color: white;\n}\n\ndiv {\n  border: 5px white solid;\n  border-radius: 200px 100px;\n  padding: 30px;\n}`}
              multiline rows={11} mono ring="focus:ring-green-500/50" />
          </div>
        )}

        {/* ── JavaScript */}
        {tab === 'js' && (
          <div className="space-y-1">
            <p className="text-xs text-slate-500">Pega aquí el <code className="bg-surface-card px-1 rounded">script.js</code> del Popcode (opcional, si usa JS).</p>
            <Field value={block.jsCode || ''}
              onChange={e => onChange({ ...block, jsCode: e.target.value })}
              placeholder={`// JavaScript del Popcode\n// document.querySelector('h1').textContent = 'Hola!';`}
              multiline rows={11} mono ring="focus:ring-green-500/50" />
          </div>
        )}

      </div>
    </BlockWrapper>
  );
}

function StudentPreview({ title, bloques, previewMode }) {
  const [tab, setTab] = useState('guia');

  // Resetear al tab guia si el bloque que lo justificaba fue eliminado
  const hayEjercicio  = bloques.some(b => b.type === 'code');
  const hayRecursos   = bloques.some(b => b.type === 'recurso' || b.type === 'presentacion');

  const wrapClass = previewMode === 'mobile'
    ? 'w-[375px] h-[700px] rounded-[2.5rem] border-4 border-slate-600 shadow-2xl overflow-hidden mx-auto'
    : 'w-full h-full rounded-xl border border-surface-border overflow-hidden';

  return (
    <div className="h-full flex flex-col items-center justify-start pt-4 overflow-y-auto">
      {previewMode === 'mobile' && (
        <div className="flex items-center gap-2 mb-3 text-xs text-slate-500">
          <Smartphone size={12} /><span>Vista del estudiante (móvil)</span>
        </div>
      )}
      <div className={wrapClass} style={{ background: '#0F111A' }}>
        {/* Header simulado */}
        <div className="bg-[#171A23] border-b border-white/5 px-3 pt-3 pb-0">
          <p className="text-xs text-slate-500 mb-2">Módulo › <span className="text-white font-semibold">{title || 'Sin título'}</span></p>
          <div className="flex gap-1 flex-wrap">
            {[
              { id: 'guia',      icon: BookOpen,   label: 'Guía',      show: true },
              { id: 'ejercicio', icon: Terminal,   label: 'Ejercicio', show: hayEjercicio },
              { id: 'recursos',  icon: Paperclip,  label: 'Recursos',  show: hayRecursos },
            ].filter(t => t.show).map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={clsx('flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-t-lg border-b-2 transition-all',
                  tab === t.id ? 'bg-[#ea5837]/20 text-[#ea5837] border-[#ea5837]' : 'text-slate-400 border-transparent hover:text-white')}>
                <t.icon size={10} />{t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Contenido */}
        <div className="p-4 overflow-y-auto" style={{ height: 'calc(100% - 75px)' }}>
          {tab === 'guia' && (
            <div className="space-y-4">
              {bloques.length === 0 && (
                <p className="text-slate-500 text-xs text-center mt-8">Agrega bloques para ver la vista previa...</p>
              )}
              {bloques.map(b => {
                if (b.type === 'text') return (
                  <div key={b.id} className="prose prose-invert prose-xs max-w-none text-sm">
                    {b.content
                      ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{b.content}</ReactMarkdown>
                      : <p className="text-slate-600 italic text-xs">Bloque de texto vacío...</p>}
                  </div>
                );
                if (b.type === 'video') {
                  const embed = toVideoEmbed(b.url);
                  return (
                    <div key={b.id} className="space-y-1.5">
                      {b.titulo && <p className="text-sm font-semibold text-white">{b.titulo}</p>}
                      {b.descripcion && <p className="text-xs text-slate-400">{b.descripcion}</p>}
                      {embed
                        ? <div className="rounded-lg overflow-hidden border border-surface-border aspect-video"><iframe src={embed} className="w-full h-full" allowFullScreen title={b.titulo || 'Video'} /></div>
                        : <div className="bg-surface-card border border-surface-border rounded-lg aspect-video flex items-center justify-center text-slate-600 text-xs">Sin URL de video</div>}
                    </div>
                  );
                }
                if (b.type === 'presentacion') {
                  const embed = toPresentationEmbed(b.url);
                  return (
                    <div key={b.id} className="space-y-1.5">
                      {b.titulo && <p className="text-sm font-semibold text-white flex items-center gap-1"><FileText size={13} className="text-pink-400" />{b.titulo}</p>}
                      {b.descripcion && <p className="text-xs text-slate-400">{b.descripcion}</p>}
                      {embed
                        ? <div className="rounded-lg overflow-hidden border border-surface-border" style={{ aspectRatio: '16/9' }}><iframe src={embed} className="w-full h-full" allowFullScreen title={b.titulo || 'Presentación'} /></div>
                        : <div className="bg-surface-card border border-pink-500/20 rounded-lg p-3 text-xs text-pink-400 flex items-center gap-2"><FileText size={14} /><span>Presentación — sin URL aún</span></div>}
                    </div>
                  );
                }
                if (b.type === 'recurso') {
                  const rtype = guessResourceType(b.url);
                  const ICONS = { pdf: '📄', pptx: '📊', doc: '📝', link: '🔗' };
                  return (
                    <a key={b.id} href={b.url || '#'} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-surface-card border border-surface-border rounded-lg hover:border-[#ea5837]/40 transition-all group">
                      <span className="text-xl shrink-0">{ICONS[rtype]}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-200 truncate">{b.nombre || 'Recurso'}</p>
                        {b.descripcion && <p className="text-xs text-slate-500 mt-0.5">{b.descripcion}</p>}
                      </div>
                      <ExternalLink size={13} className="text-slate-600 group-hover:text-[#ea5837] shrink-0 transition-colors" />
                    </a>
                  );
                }
                if (b.type === 'code') return (
                  <div key={b.id} className="bg-surface-card border border-green-500/20 rounded-lg p-3 space-y-2">
                    <p className="text-xs text-green-400 font-semibold flex items-center gap-1"><Zap size={10} />Reto de Código</p>
                    {b.instrucciones && <p className="text-xs text-slate-300 whitespace-pre-wrap">{b.instrucciones}</p>}
                    <button className="w-full bg-green-500/20 text-green-400 text-xs py-1.5 rounded-lg border border-green-500/30">Abrir Editor →</button>
                  </div>
                );
                return null;
              })}
            </div>
          )}
          {tab === 'recursos' && (
            <div className="space-y-2">
              {bloques.filter(b => b.type === 'recurso' || b.type === 'presentacion').map(b => {
                const rtype = b.type === 'presentacion' ? 'pptx' : guessResourceType(b.url);
                const ICONS = { pdf: '📄', pptx: '📊', doc: '📝', link: '🔗' };
                return (
                  <a key={b.id} href={b.url || '#'} target="_blank" rel="noopener noreferrer"
                    className="flex items-start gap-3 p-3 bg-surface-card border border-surface-border rounded-lg hover:border-[#ea5837]/40 transition-all">
                    <span className="text-xl shrink-0 mt-0.5">{ICONS[rtype]}</span>
                    <div className="min-w-0">
                      <p className="text-sm text-slate-200 font-medium truncate">{b.nombre || b.titulo || 'Recurso'}</p>
                      {b.descripcion && <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{b.descripcion}</p>}
                      <p className="text-xs text-slate-600 mt-1">{b.url ? 'Click para abrir ↗' : 'Sin enlace'}</p>
                    </div>
                  </a>
                );
              })}
            </div>
          )}
          {tab === 'ejercicio' && (
            <div className="space-y-2">
              {bloques.filter(b => b.type === 'code').map(b => (
                <div key={b.id} className="space-y-2">
                  {b.instrucciones && <p className="text-sm text-slate-300 bg-surface-card border border-surface-border rounded-lg p-3 whitespace-pre-wrap">{b.instrucciones}</p>}
                  <button className="w-full bg-[#ea5837] text-white text-sm py-2 rounded-lg font-semibold">Ejecutar Código</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function LessonBuilderPage() {
  const { moduloId }      = useParams();
  const [searchParams]    = useSearchParams();
  const leccionId         = searchParams.get('leccionId');
  const navigate          = useNavigate();

  const [modulo, setModulo]               = useState(null);
  const [title,  setTitle]                = useState('');
  const [xpReward, setXpReward]           = useState(50);
  const [order,  setOrder]                = useState(1);
  const [bloques, setBloques]             = useState([EMPTY_BLOCK.text()]);
  const [saving,  setSaving]              = useState(false);
  const [saved,   setSaved]               = useState(false);
  const [loading, setLoading]             = useState(true);
  const [previewMode, setPreviewMode]     = useState('desktop');
  const [showPreview, setShowPreview]     = useState(true);
  const [splitRatio,  setSplitRatio]      = useState(50); // % del editor en split
  const splitWrapperRef = useRef(null);
  const isDraggingRef   = useRef(false);

  // Drag del divisor editor/preview
  const onMouseDownDivider = useCallback((e) => {
    e.preventDefault();
    isDraggingRef.current = true;
    const onMove = (ev) => {
      if (!isDraggingRef.current || !splitWrapperRef.current) return;
      const rect = splitWrapperRef.current.getBoundingClientRect();
      const ratio = Math.min(80, Math.max(20, ((ev.clientX - rect.left) / rect.width) * 100));
      setSplitRatio(ratio);
    };
    const onUp = () => {
      isDraggingRef.current = false;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, []);

  // Cargar datos
  useEffect(() => {
    const load = async () => {
      try {
        const mod = await getModulo(moduloId);
        setModulo(mod);
        if (leccionId) {
          const lec = await getLeccion(leccionId);
          if (lec) {
            setTitle(lec.title || '');
            setXpReward(lec.xpReward || 50);
            setOrder(lec.order || 1);
            if (lec.bloques?.length > 0) setBloques(lec.bloques);
            else if (lec.content)         setBloques([{ id: uid(), type: 'text', content: lec.content }]);
          }
        } else {
          const existing = await getLeccionesByModulo(moduloId);
          setOrder((existing?.length || 0) + 1);
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    load();
  }, [moduloId, leccionId]);

  // Operaciones de bloques
  const addBlock    = useCallback(type  => setBloques(prev => [...prev, EMPTY_BLOCK[type]()]), []);
  const updateBlock = useCallback(updated => setBloques(prev => prev.map(b => b.id === updated.id ? updated : b)), []);
  const deleteBlock = useCallback(id    => setBloques(prev => prev.filter(b => b.id !== id)), []);
  const moveBlock   = useCallback((id, dir) => setBloques(prev => {
    const i = prev.findIndex(b => b.id === id);
    if (dir === 'up' && i === 0) return prev;
    if (dir === 'down' && i === prev.length - 1) return prev;
    const arr = [...prev];
    const j = dir === 'up' ? i - 1 : i + 1;
    [arr[i], arr[j]] = [arr[j], arr[i]];
    return arr;
  }), []);

  // Guardar
  const handleSave = async () => {
    if (!title.trim()) return alert('Escribe un título para la clase.');
    setSaving(true);
    try {
      const firstText = bloques.find(b => b.type === 'text');
      const payload = {
        title: title.trim(),
        xpReward: Number(xpReward) || 50,
        order:    Number(order)    || 1,
        bloques,
        content:  firstText?.content || '',
        // 'recursos' NO se duplica aquí: los recursos viven dentro de 'bloques'
        // y se leen desde ahí en LessonPage.
        // Campos de acceso rápido para el reto de código (Popcode)
        baseCode: bloques.find(b => b.type === 'code')?.baseCode || '',
        cssCode:  bloques.find(b => b.type === 'code')?.cssCode  || '',
        jsCode:   bloques.find(b => b.type === 'code')?.jsCode   || '',
        esPopcode: bloques.find(b => b.type === 'code')?.esPopcode ?? false,
        videoUrl: bloques.find(b => b.type === 'video')?.url     || '',
      };

      if (leccionId) await updateLeccion(leccionId, payload);
      else           await createLeccion(moduloId, payload);
      setSaved(true);
      setTimeout(() => { setSaved(false); navigate('/admin/pensum'); }, 1200);
    } catch (err) {
      console.error(err);
      alert('Error al guardar. Revisa la consola.');
    } finally { setSaving(false); }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-screen bg-surface-dark">
      <div className="flex flex-col items-center gap-3">
        <Loader2 size={32} className="animate-spin text-[#ea5837]" />
        <p className="text-slate-400 text-sm">Cargando editor...</p>
      </div>
    </div>
  );

  const blockProps = (block, idx) => ({
    key: block.id, block,
    onChange:   updateBlock,
    onDelete:   () => deleteBlock(block.id),
    onMoveUp:   () => moveBlock(block.id, 'up'),
    onMoveDown: () => moveBlock(block.id, 'down'),
    isFirst: idx === 0,
    isLast:  idx === bloques.length - 1,
  });

  return (
    <div className="h-screen flex flex-col bg-surface-dark overflow-hidden">
      <header className="h-14 bg-surface-card border-b border-surface-border flex items-center justify-between px-4 shrink-0 z-10">
        <div className="flex items-center gap-3 min-w-0">
          <Link to="/admin/pensum" className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-surface-hover transition-all shrink-0">
            <ArrowLeft size={18} />
          </Link>
          <div className="h-6 w-px bg-surface-border shrink-0" />
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs text-slate-500 shrink-0 hidden sm:block">{modulo?.title || 'Módulo'} ›</span>
            <input value={title} onChange={e => setTitle(e.target.value)}
              placeholder="Título de la clase..."
              className="bg-transparent text-white font-semibold text-sm focus:outline-none placeholder-slate-600 min-w-0 w-48 sm:w-64" />
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* XP + Orden */}
          <div className="hidden sm:flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-surface-hover rounded-lg px-2 py-1">
              <Zap size={12} className="text-yellow-400" />
              <input type="number" value={xpReward} min={5} step={5} onChange={e => setXpReward(Number(e.target.value))}
                className="w-10 bg-transparent text-yellow-400 text-xs font-semibold focus:outline-none" />
              <span className="text-xs text-slate-500">XP</span>
            </div>
            <div className="flex items-center gap-1 bg-surface-hover rounded-lg px-2 py-1">
              <span className="text-xs text-slate-500">#</span>
              <input type="number" value={order} min={1} onChange={e => setOrder(Number(e.target.value))}
                className="w-7 bg-transparent text-slate-300 text-xs font-semibold focus:outline-none" />
            </div>
          </div>

          {/* Toggle vista */}
          <div className="flex items-center bg-surface-hover rounded-lg p-0.5">
            <button onClick={() => setPreviewMode('desktop')}
              className={clsx('p-1.5 rounded-md transition-all', previewMode === 'desktop' ? 'bg-surface-card text-white shadow' : 'text-slate-500 hover:text-white')}>
              <Monitor size={14} />
            </button>
            <button onClick={() => setPreviewMode('mobile')}
              className={clsx('p-1.5 rounded-md transition-all', previewMode === 'mobile' ? 'bg-surface-card text-white shadow' : 'text-slate-500 hover:text-white')}>
              <Smartphone size={14} />
            </button>
          </div>

          <button onClick={() => setShowPreview(v => !v)}
            className={clsx('flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all',
              showPreview ? 'bg-brand-500/20 text-brand-300' : 'bg-surface-hover text-slate-400 hover:text-white')}>
            {showPreview ? <Eye size={14} /> : <EyeOff size={14} />}
            <span className="hidden sm:inline">{showPreview ? 'Ocultar' : 'Preview'}</span>
          </button>

          <button onClick={handleSave} disabled={saving || saved}
            className={clsx('flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all',
              saved ? 'bg-green-500 text-white' : 'bg-[#ea5837] hover:bg-[#c84223] text-white disabled:opacity-60')}>
            {saved ? <CheckCircle2 size={14} /> : saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
            {saved ? '¡Guardado!' : saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </header>

      <div ref={splitWrapperRef} className="flex-1 flex overflow-hidden">

        {/* Editor */}
        <div
          className="flex flex-col overflow-hidden border-r border-surface-border"
          style={{ width: showPreview ? `${splitRatio}%` : '100%', flexShrink: 0 }}
        >

          <div className="shrink-0 px-3 py-2 bg-surface-card border-b border-surface-border">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs text-slate-500 mr-1 shrink-0">+ Añadir:</span>
              {BLOCK_TYPES.map(({ type, label, icon: Icon, color, bg }) => (
                <button
                  key={type}
                  onClick={() => addBlock(type)}
                  title={label}
                  className={clsx(
                    'flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-medium transition-all hover:scale-[1.02] hover:brightness-110',
                    bg, color
                  )}
                >
                  <Icon size={12} />
                  <span className="hidden lg:inline">{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">

            {bloques.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-14 h-14 bg-surface-card border border-surface-border rounded-2xl flex items-center justify-center mb-3">
                  <Plus size={22} className="text-slate-500" />
                </div>
                <p className="text-slate-400 font-medium mb-1">El lienzo está vacío</p>
                <p className="text-slate-600 text-sm">Usa los botones de arriba para agregar bloques</p>
              </div>
            )}

            {bloques.map((block, idx) => {
              const p = blockProps(block, idx);
              if (block.type === 'text')         return <TextBlock         {...p} />;
              if (block.type === 'video')        return <VideoBlock        {...p} />;
              if (block.type === 'recurso')      return <RecursoBlock      {...p} />;
              if (block.type === 'presentacion') return <PresentacionBlock {...p} />;
              if (block.type === 'code')         return <CodeBlock         {...p} />;
              return null;
            })}

            <div className="h-4" />
          </div>
        </div>


        {showPreview && (
          <div
            onMouseDown={onMouseDownDivider}
            className="w-1.5 shrink-0 flex items-center justify-center bg-surface-border hover:bg-[#ea5837]/60 cursor-col-resize transition-colors select-none group"
            title="Arrastra para ajustar el tamaño"
          >
            <GripVertical size={14} className="text-slate-500 group-hover:text-white transition-colors" />
          </div>
        )}

        {/* Preview */}
        {showPreview && (
          <div className="flex flex-col overflow-hidden bg-surface-dark" style={{ flex: '1 1 0' }}>
            <div className="flex items-center justify-between px-4 py-2 border-b border-surface-border shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Vista del Estudiante</span>
              </div>
              <span className="text-xs text-slate-600">Tiempo real</span>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <StudentPreview title={title} bloques={bloques} previewMode={previewMode} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
