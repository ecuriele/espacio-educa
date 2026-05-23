import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { selectCurrentUser } from '@store/slices/authSlice';
import { addPendingNotification, addXp } from '@store/slices/gamificationSlice';
import { SandboxModel, AchievementModel } from '@db/models';
import CodeEditor from '@components/editor/CodeEditor';
import toast from 'react-hot-toast';
import { generateId } from '@utils/helpers';
import { createRepo, pushFiles } from '@services/githubService';
import { GitHubLinkModel } from '@db/models';
import { useNavigate } from 'react-router-dom';
import { FlaskConical, Save, Plus, FileCode, CheckCircle2, Trash2, Github } from 'lucide-react';

export default function SandboxPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(selectCurrentUser);
  const [snippets, setSnippets] = useState([]);
  const [currentSnippet, setCurrentSnippet] = useState(null);
  const [isExporting, setIsExporting] = useState(false);
  const [code, setCode] = useState({ html: '', css: '', js: '' });
  const [title, setTitle] = useState('Nuevo proyecto');
  const [editorKey, setEditorKey] = useState('initial');

  useEffect(() => {
    if (user?.uid || user?.id) loadSnippets();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid, user?.id]);

  const loadSnippets = async () => {
    const userId = user?.uid || user?.id;
    if (!userId) return;
    const data = await SandboxModel.getByUser(userId);
    const sorted = data.sort((a, b) => b.updatedAt - a.updatedAt);
    setSnippets(sorted);
  };

  const handleCodeChange = (lang, value) => {
    setCode((prev) => ({ ...prev, [lang]: value }));
  };

  const handleSave = useCallback(async () => {
    const userId = user?.uid || user?.id;
    if (!userId) return;
    try {
      const snippetData = {
        id: currentSnippet?.id || generateId(),
        usuarioId: userId,
        title: title || 'Sin título',
        ...code,
      };
      const saved = await SandboxModel.save(snippetData);
      setCurrentSnippet(saved);
      await loadSnippets();
      
      const allSnippets = await SandboxModel.getByUser(userId);
      if (allSnippets.length >= 10) {
        const unlocked = await AchievementModel.unlock(userId, 'sandbox_10');
        if (unlocked) {
          dispatch(addPendingNotification(unlocked));
          if (unlocked.xp > 0) {
            dispatch(addXp({ userId, amount: unlocked.xp, reason: 'Logro desbloqueado: Explorador' }));
          }
        }
      }

      toast.custom((t) => (
        <div className={`max-w-xs w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl dark:shadow-emerald-900/20 p-3 flex items-center gap-3 transition-all duration-300 relative overflow-hidden ${t.visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-95 pointer-events-none'}`}>
          <div className="relative flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 p-[2px] shadow-lg shadow-emerald-500/30">
            <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[10px] flex items-center justify-center">
              <CheckCircle2 size={18} className="text-emerald-500" />
            </div>
            <div className="absolute -inset-1 bg-gradient-to-br from-green-400 to-emerald-600 rounded-xl blur opacity-30 -z-10"></div>
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight mb-0.5">Guardado con éxito</p>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">El proyecto se guardó localmente</p>
          </div>
        </div>
      ), { duration: 3000, position: 'top-right' });
    } catch (err) {
      toast.error('Error al guardar el proyecto');
    }
  }, [user, code, title, currentSnippet]);

  const handleExportToGithub = async () => {
    const userId = user?.uid || user?.id;
    if (!userId) return;

    // Verificar vinculación
    const ghData = await GitHubLinkModel.get(userId);
    if (!ghData?.githubToken) {
      toast('Debes vincular tu token de GitHub primero', { icon: 'ℹ️' });
      navigate('/dashboard/github');
      return;
    }

    const repoName = prompt('Ingresa el nombre para el nuevo repositorio de GitHub:', title || 'mi-proyecto-sandbox');
    if (!repoName) return;

    setIsExporting(true);
    const toastId = toast.loading('Creando repositorio y subiendo archivos...');
    try {
      // 1. Crear repo
      const repo = await createRepo(ghData.githubToken, repoName, 'Proyecto exportado desde Espacio Educa Sandbox');
      
      // 2. Subir archivos
      const filesToPush = [];
      if (code.html) filesToPush.push({ path: 'index.html', content: code.html });
      if (code.css) filesToPush.push({ path: 'style.css', content: code.css });
      if (code.js) filesToPush.push({ path: 'script.js', content: code.js });

      await pushFiles(ghData.githubToken, repo.owner.login, repo.name, filesToPush);

      toast.success('¡Proyecto subido a GitHub con éxito!', { id: toastId });
      window.open(repo.html_url, '_blank');
    } catch (err) {
      console.error(err);
      toast.error('Error al exportar a GitHub: ' + err.message, { id: toastId });
    } finally {
      setIsExporting(false);
    }
  };

  const handleNew = () => {
    setCurrentSnippet(null);
    setCode({ html: '<!-- Nuevo proyecto -->\n<h1>Hola Mundo</h1>', css: 'body { font-family: sans-serif; }', js: '' });
    setTitle('Nuevo proyecto');
    setEditorKey(Date.now().toString());
  };

  const handleLoad = (snippet) => {
    setCurrentSnippet(snippet);
    setCode({ html: snippet.html, css: snippet.css, js: snippet.js });
    setTitle(snippet.title);
    setEditorKey(snippet.id + '-' + Date.now().toString());
  };

  const handleDelete = async (snippetId) => {
    await SandboxModel.delete(snippetId);
    if (currentSnippet?.id === snippetId) handleNew();
    await loadSnippets();
    toast.custom((t) => (
      <div className={`max-w-xs w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl dark:shadow-rose-900/20 p-3 flex items-center gap-3 transition-all duration-300 relative overflow-hidden ${t.visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-95 pointer-events-none'}`}>
        <div className="relative flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-red-400 to-rose-600 p-[2px] shadow-lg shadow-rose-500/30">
          <div className="w-full h-full bg-white dark:bg-slate-900 rounded-[10px] flex items-center justify-center">
            <Trash2 size={18} className="text-rose-500" />
          </div>
          <div className="absolute -inset-1 bg-gradient-to-br from-red-400 to-rose-600 rounded-xl blur opacity-30 -z-10"></div>
        </div>
        <div className="flex-1 min-w-0 pt-0.5">
          <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight mb-0.5">Proyecto eliminado</p>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">El código ha sido borrado</p>
        </div>
      </div>
    ), { duration: 3000, position: 'top-right' });
  };

  return (
    <div className="space-y-4 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-black font-display text-slate-900 dark:text-white flex items-center gap-2">
            <FlaskConical size={24} className="text-brand-500" /> Sandbox
            <span className="text-xs font-normal bg-accent-50 dark:bg-accent-500/15 text-accent-600 dark:text-accent-400 px-2 py-0.5 rounded-full border border-accent-200 dark:border-accent-500/30">
              Sin afectar tu progreso
            </span>
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">Experimenta libremente. Todo se guarda en tu dispositivo.</p>
        </div>
        <div className="flex gap-2">
          <button
            id="sandbox-new-btn"
            onClick={handleNew}
            className="px-3 py-2 text-sm flex items-center gap-1.5 text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white bg-white dark:bg-surface-card hover:bg-slate-50 dark:hover:bg-surface-hover border border-slate-200 dark:border-surface-border rounded-xl transition-all shadow-sm dark:shadow-none"
          >
            <Plus size={16} /> Nuevo
          </button>
          <button
            onClick={handleExportToGithub}
            disabled={isExporting}
            className="px-4 py-2 flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-all shadow-sm disabled:opacity-50"
          >
            <Github size={16} /> {isExporting ? 'Subiendo...' : 'A GitHub'}
          </button>
          
          <button
            id="sandbox-save-btn"
            onClick={handleSave}
            className="px-4 py-2 flex items-center gap-1.5 text-sm font-medium text-white bg-[#ea5837] hover:bg-[#c84223] dark:bg-brand-600 dark:hover:bg-brand-500 rounded-xl transition-all shadow-sm dark:shadow-brand-md"
          >
            <Save size={16} /> Guardar
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Lista de snippets guardados */}
        <div className="lg:col-span-1 bg-white dark:bg-surface-card border border-slate-200 dark:border-surface-border rounded-2xl p-3 space-y-1 max-h-[600px] overflow-y-auto shadow-sm dark:shadow-none">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-2 mb-2">
            Mis proyectos ({snippets.length})
          </p>
          {snippets.length === 0 && (
            <p className="text-xs text-slate-500 px-2 py-4 text-center">Aún no hay proyectos guardados.</p>
          )}
          {snippets.map((s) => (
            <div
              key={s.id}
              className={`group flex items-center justify-between px-3 py-2 rounded-xl cursor-pointer transition-all text-sm ${
                currentSnippet?.id === s.id
                  ? 'bg-accent-50 dark:bg-brand-600/20 text-accent-600 dark:text-brand-300 ring-1 ring-accent-200 dark:ring-brand-500/30'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-surface-hover'
              }`}
              onClick={() => handleLoad(s)}
            >
              <span className="truncate flex items-center gap-1.5"><FileCode size={16} className="text-slate-400" /> {s.title}</span>
              <button
                onClick={(e) => { e.stopPropagation(); handleDelete(s.id); }}
                className="opacity-0 group-hover:opacity-100 text-danger-400 hover:text-danger-300 transition-all text-xs ml-1 flex-shrink-0"
                aria-label="Eliminar snippet"
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        {/* Editor */}
        <div className="lg:col-span-3 space-y-3">
          {/* Nombre del proyecto */}
          <input
            id="sandbox-title-input"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Nombre del proyecto..."
            className="w-full px-4 py-2.5 bg-white dark:bg-surface-card border border-slate-200 dark:border-surface-border rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-accent-500 text-sm shadow-sm dark:shadow-none"
          />
          <CodeEditor
            key={editorKey}
            html={code.html}
            css={code.css}
            js={code.js}
            onChange={handleCodeChange}
            isSandbox
            showPreview
          />
        </div>
      </div>
    </div>
  );
}
