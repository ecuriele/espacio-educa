import React, { useEffect, useRef, useState, useCallback } from 'react';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, lineNumbers, highlightActiveLine, drawSelection } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap, indentWithTab } from '@codemirror/commands';
import { syntaxHighlighting, defaultHighlightStyle, bracketMatching, foldGutter } from '@codemirror/language';
import { autocompletion, completionKeymap, closeBrackets } from '@codemirror/autocomplete';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { javascript } from '@codemirror/lang-javascript';
import { oneDark } from '@codemirror/theme-one-dark';
import { useSelector } from 'react-redux';
import { selectTheme } from '@store/slices/uiSlice';
import clsx from 'clsx';
import { Maximize, Minimize, Columns, Code, MonitorPlay, FlaskConical, GripVertical, GripHorizontal } from 'lucide-react';

const LANGUAGE_EXTENSIONS = {
  html: html({ autoCloseTags: true }),
  css:  css(),
  js:   javascript({ jsx: false }),
};

const TAB_LABELS = {
  html: { label: 'HTML', color: 'text-orange-400',  bg: 'bg-orange-400/10' },
  css:  { label: 'CSS',  color: 'text-blue-400',    bg: 'bg-blue-400/10'   },
  js:   { label: 'JS',   color: 'text-yellow-400',  bg: 'bg-yellow-400/10' },
};

function buildExtensions(lang, theme) {
  return [
    lineNumbers(),
    highlightActiveLine(),
    drawSelection(),
    bracketMatching(),
    closeBrackets(),
    history(),
    foldGutter(),
    autocompletion(),
    syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
    keymap.of([...defaultKeymap, ...historyKeymap, ...completionKeymap, indentWithTab]),
    LANGUAGE_EXTENSIONS[lang],
    ...(theme === 'dark' ? [oneDark] : []),
    EditorView.lineWrapping,
    EditorView.theme({
      '&': { fontSize: '13.5px', fontFamily: "'JetBrains Mono', 'Fira Code', monospace" },
      '.cm-scroller': { overflow: 'auto', height: '100%' },
      '.cm-content': { padding: '8px 0' },
      '&.cm-focused': { outline: 'none' },
    }),
  ];
}


/**
 * @param {Object} props
 * @param {string} props.html           - Código HTML inicial
 * @param {string} props.css            - Código CSS inicial
 * @param {string} props.js             - Código JS inicial
 * @param {function} props.onChange     - callback(lang, value) al cambiar código
 * @param {boolean} props.readOnly      - modo solo lectura
 * @param {boolean} props.showPreview   - mostrar panel de vista previa
 * @param {string}  props.className     - clase extra para el wrapper
 * @param {boolean} props.isSandbox     - si true, sin restricciones de guardado
 */
export default function CodeEditor({
  html: initialHtml = '<!-- Escribe tu HTML aquí -->\n<h1>¡Hola Mundo!</h1>\n<p>Tu primera página web.</p>',
  css:  initialCss  = '/* Estilos CSS */\nbody {\n  font-family: sans-serif;\n  background: #f0f4f8;\n  padding: 2rem;\n}\nh1 { color: #6d28d9; }',
  js:   initialJs   = '// JavaScript\nconsole.log("¡Espacio Educa cargado!");',
  onChange,
  readOnly = false,
  showPreview = true,
  className = '',
  isSandbox = false,
}) {
  const theme = useSelector(selectTheme);

  const [activeTab, setActiveTab] = useState('html');
  const [code, setCode] = useState({ html: initialHtml, css: initialCss, js: initialJs });
  const [previewKey, setPreviewKey] = useState(0);
  const [isLivePreview, setIsLivePreview] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [previewLayout, setPreviewLayout] = useState('split');
  const [debouncedSrcDoc, setDebouncedSrcDoc] = useState('');

  // splitRatio: % del ancho ocupado por el editor (solo en split, desktop)
  const [splitRatio, setSplitRatio]   = useState(50); // 50%
  // editorHeight: altura total del área editor+preview en px
  const [editorHeight, setEditorHeight] = useState(500);

  const editorContainerRef = useRef(null);
  const editorViewRef      = useRef(null);
  const wrapperRef         = useRef(null);   // div contenedor del split
  const isDraggingH        = useRef(false);  // dragging horizontal divisor
  const isDraggingV        = useRef(false);  // dragging vertical (height) handle

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
      setEditorHeight(Math.max(250, Math.min(900, startH + delta)));
    };

    const onUp = () => {
      isDraggingV.current = false;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  }, [editorHeight]);

  useEffect(() => {
    if (!editorContainerRef.current) return;

    const view = new EditorView({
      state: EditorState.create({
        doc: code[activeTab],
        extensions: [
          ...buildExtensions(activeTab, theme),
          EditorView.editable.of(!readOnly),
          EditorView.updateListener.of((update) => {
            if (update.docChanged) {
              const newValue = update.state.doc.toString();
              setCode((prev) => ({ ...prev, [activeTab]: newValue }));
              onChange?.(activeTab, newValue);
            }
          }),
        ],
      }),
      parent: editorContainerRef.current,
    });

    editorViewRef.current = view;

    return () => {
      view.destroy();
      editorViewRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, theme, readOnly, previewLayout]);

  const getSrcDoc = useCallback(() => {
    return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${code.css}</style>
</head>
<body>
${code.html}
<script>
  window.onerror = function(msg, src, line, col) {
    const el = document.getElementById('__ee_error__');
    if (el) el.textContent = msg + ' (línea ' + line + ')';
    return true;
  };
  try {
    ${code.js}
  } catch(e) {
    const div = document.createElement('div');
    div.id = '__ee_error__';
    div.style.cssText = 'position:fixed;bottom:0;left:0;right:0;background:#ef4444;color:#fff;padding:8px;font-family:monospace;font-size:12px;z-index:9999';
    div.textContent = '⚠ Error JS: ' + e.message;
    document.body.appendChild(div);
  }
<\/script>
</body>
</html>`;
  }, [code]);

  // Carga inicial
  useEffect(() => {
    setDebouncedSrcDoc(getSrcDoc());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isLivePreview) {
      const debounce = setTimeout(() => {
        setDebouncedSrcDoc(getSrcDoc());
      }, 500);
      return () => clearTimeout(debounce);
    }
  }, [code, isLivePreview, getSrcDoc]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleRunManual = () => {
    setDebouncedSrcDoc(getSrcDoc());
    setPreviewKey((k) => k + 1);
  };

  // Detectar si es móvil (sin resize)
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  return (
    <div
      className={clsx(
        'flex flex-col bg-white dark:bg-surface-card rounded-2xl border border-slate-200 dark:border-surface-border overflow-hidden shadow-sm dark:shadow-card-dark',
        isFullscreen && 'fixed inset-0 z-50 rounded-none',
        className
      )}
    >
      <div className="flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-surface-dark border-b border-slate-200 dark:border-surface-border shrink-0">
        {/* Tabs de lenguaje */}
        <div className="flex gap-1">
          {(['html', 'css', 'js']).map((lang) => (
            <button
              key={lang}
              id={`editor-tab-${lang}`}
              onClick={() => handleTabChange(lang)}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all duration-200',
                activeTab === lang
                  ? `${TAB_LABELS[lang].bg} ${TAB_LABELS[lang].color} ring-1 ring-current`
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-surface-hover'
              )}
            >
              {TAB_LABELS[lang].label}
            </button>
          ))}
        </div>

        {/* Controles de vista */}
        <div className="flex items-center gap-2">
          {/* Toggle Live Preview */}
          <button
            id="toggle-live-preview"
            onClick={() => setIsLivePreview((v) => !v)}
            className={clsx(
              'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all',
              isLivePreview
                ? 'bg-accent-50 dark:bg-accent-500/20 text-accent-600 dark:text-accent-400 ring-1 ring-accent-500/50'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-surface-hover'
            )}
            title="Vista previa en tiempo real"
          >
            <span className={clsx('h-1.5 w-1.5 rounded-full', isLivePreview ? 'bg-accent-400 animate-pulse' : 'bg-slate-600')} />
            Live
          </button>

          {/* Ejecutar manualmente */}
          {!isLivePreview && (
            <button
              id="run-code-btn"
              onClick={handleRunManual}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-[#ea5837] hover:bg-[#c84223] dark:bg-brand-600 dark:hover:bg-brand-500 text-white rounded-lg text-xs font-medium transition-colors"
            >
              ▶ Ejecutar
            </button>
          )}

          {/* Layout toggle */}
          <div className="flex gap-0.5 bg-slate-200 dark:bg-surface-hover rounded-lg p-0.5">
            {[
              { id: 'split',   icon: <Columns size={16} />, title: 'Split' },
              { id: 'code',    icon: <Code size={16} />,   title: 'Solo código' },
              { id: 'preview', icon: <MonitorPlay size={16} />,   title: 'Solo preview' },
            ].map(({ id, icon, title }) => (
              <button
                key={id}
                id={`layout-${id}`}
                onClick={() => setPreviewLayout(id)}
                title={title}
                className={clsx(
                  'px-2 py-1 rounded-md text-xs transition-all',
                  previewLayout === id ? 'bg-white text-slate-900 dark:bg-surface-card dark:text-slate-100 shadow-sm dark:shadow-none' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                )}
              >
                {icon}
              </button>
            ))}
          </div>

          {/* Fullscreen */}
          <button
            id="editor-fullscreen-btn"
            onClick={() => setIsFullscreen((f) => !f)}
            className="p-1.5 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-surface-hover rounded-lg transition-all"
            title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
          >
            {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
          </button>
        </div>
      </div>

      <div
        ref={wrapperRef}
        style={isFullscreen ? {} : { height: `${editorHeight}px` }}
        className={clsx(
          'flex w-full overflow-hidden',
          isFullscreen ? 'flex-1' : 'shrink-0'
        )}
      >
        {/* Panel del Editor */}
        {previewLayout !== 'preview' && (
          <div
            ref={editorContainerRef}
            className="overflow-auto h-full"
            style={{
              width: previewLayout === 'split'
                ? `${splitRatio}%`
                : '100%',
              flexShrink: 0,
            }}
          />
        )}

        {showPreview && previewLayout === 'split' && !isMobile && (
          <div
            onMouseDown={onMouseDownDivider}
            className="w-1.5 shrink-0 flex items-center justify-center bg-slate-200 dark:bg-surface-border hover:bg-[#ea5837]/60 dark:hover:bg-[#ea5837]/50 cursor-col-resize transition-colors select-none group"
            title="Arrastra para cambiar el tamaño"
          >
            <GripVertical size={14} className="text-slate-400 group-hover:text-white transition-colors" />
          </div>
        )}

        {/* Panel de Preview */}
        {showPreview && previewLayout !== 'code' && (
          <div
            className="flex flex-col h-full overflow-hidden"
            style={{
              flex: previewLayout === 'split' ? '1 1 0' : undefined,
              width: previewLayout !== 'split' ? '100%' : undefined,
            }}
          >
            {/* Header de preview */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 dark:bg-surface-dark border-b border-slate-200 dark:border-surface-border shrink-0">
              <div className="flex gap-1">
                <span className="h-3 w-3 rounded-full bg-red-500/60" />
                <span className="h-3 w-3 rounded-full bg-yellow-500/60" />
                <span className="h-3 w-3 rounded-full bg-green-500/60" />
              </div>
              <span className="text-xs text-slate-500 font-mono">Vista previa</span>
            </div>
            {/* iframe de preview */}
            <iframe
              key={previewKey}
              id="code-preview-iframe"
              title="Vista previa del código"
              sandbox="allow-scripts allow-same-origin"
              srcDoc={debouncedSrcDoc}
              className="flex-1 bg-white"
              style={{ border: 'none', width: '100%', height: '100%', display: 'block', minHeight: '100%' }}
            />
          </div>
        )}
      </div>

      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-50 dark:bg-surface-dark border-t border-slate-200 dark:border-surface-border text-xs text-slate-500 shrink-0">
        <span>{activeTab.toUpperCase()} · {code[activeTab].split('\n').length} líneas</span>
        {isSandbox && (
          <span className="text-accent-400 font-medium flex items-center gap-1.5"><FlaskConical size={14} className="text-brand-500" /> Modo Sandbox — Sin afectar tu progreso</span>
        )}
        <div className="flex items-center gap-2">
          <span>UTF-8 · LF</span>
          {/* Handle de altura — solo desktop y cuando no fullscreen */}
          {!isFullscreen && !isMobile && (
            <button
              onMouseDown={onMouseDownHeightHandle}
              className="cursor-row-resize flex items-center gap-1 px-2 py-0.5 rounded hover:bg-slate-200 dark:hover:bg-surface-hover transition-colors select-none"
              title={`Arrastra para cambiar la altura (actual: ${editorHeight}px)`}
            >
              <GripHorizontal size={13} className="text-slate-400" />
              <span className="text-[10px] text-slate-400">{editorHeight}px</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
