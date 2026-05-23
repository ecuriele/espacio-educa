import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectCurrentUser } from '@store/slices/authSlice';
import { addPendingNotification, addXp } from '@store/slices/gamificationSlice';
import { GitHubLinkModel, AchievementModel } from '@db/models';
import { fetchRepos } from '@services/githubService';
import toast from 'react-hot-toast';
import { Github, Folder, RefreshCw, ExternalLink, HelpCircle } from 'lucide-react';

export default function GitHubPage() {
  const dispatch = useDispatch();
  const user = useSelector(selectCurrentUser);
  const [githubData, setGithubData] = useState(null);
  const [username, setUsername] = useState('');
  const [token, setToken] = useState('');
  const [isLinking, setIsLinking] = useState(false);

  const [repos, setRepos] = useState([]);
  const [loadingRepos, setLoadingRepos] = useState(false);

  useEffect(() => {
    if (user?.id) {
      GitHubLinkModel.get(user.id).then(async (data) => {
        setGithubData(data);
        if (data?.githubToken) {
          setLoadingRepos(true);
          try {
            const fetchedRepos = await fetchRepos(data.githubToken);
            setRepos(fetchedRepos);
          } catch (err) {
            console.error('Error al obtener repos:', err);
            toast.error('Token inválido o expirado');
          } finally {
            setLoadingRepos(false);
          }
        }
      });
    }
  }, [user?.id]);

  const handleLink = async (e) => {
    e.preventDefault();
    if (!username.trim()) return;
    setIsLinking(true);
    try {
      await GitHubLinkModel.save({
        usuarioId: user.id,
        usuarioGithub: username,
        githubToken: token || null,
        repositorios: [],
      });
      const data = await GitHubLinkModel.get(user.id);
      setGithubData(data);
      
      // Otorgar el logro de GitHub
      const unlocked = await AchievementModel.unlock(user.id, 'github_link');
      if (unlocked) {
        dispatch(addPendingNotification(unlocked));
        if (unlocked.xp > 0) {
          dispatch(addXp({ userId: user.id, amount: unlocked.xp, reason: 'Logro desbloqueado: Open Source' }));
        }
      }
      
      toast.success('¡Cuenta de GitHub vinculada!');
    } catch (err) {
      toast.error('Error al vincular la cuenta');
    } finally {
      setIsLinking(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-up max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-black font-display text-slate-900 dark:text-white flex items-center gap-2"><Github size={28} className="text-slate-800 dark:text-white" /> Integración GitHub</h1>
        <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
          Vincula tu cuenta para gestionar tus proyectos y portafolio directamente desde Espacio Educa.
        </p>
      </div>

      {githubData ? (
        /* Ya vinculado */
        <div className="bg-white dark:bg-surface-card border border-accent-200 dark:border-accent-500/30 rounded-2xl p-6 shadow-sm dark:shadow-none">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400"><Github size={24} /></div>
            <div>
              <p className="font-bold text-slate-900 dark:text-white">@{githubData.usuarioGithub}</p>
              <p className="text-xs text-accent-600 dark:text-accent-400">✓ Cuenta vinculada</p>
            </div>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
            Tus repositorios se mostrarán aquí una vez que se conecte con la API de GitHub.
          </p>
          {/* Lista de repos */}
          <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
            {loadingRepos ? (
              <div className="text-center py-6 text-slate-500 text-sm flex flex-col items-center">
                <RefreshCw size={24} className="text-slate-400 mb-2 animate-spin" />
                Sincronizando repositorios...
              </div>
            ) : repos.length > 0 ? (
              repos.map((repo) => (
                <a
                  key={repo.id}
                  href={repo.html_url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
                >
                  <Folder size={18} className="text-slate-400 group-hover:text-accent-500 transition-colors" />
                  <span className="flex-1 text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                    {repo.name}
                  </span>
                  <ExternalLink size={14} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
              ))
            ) : (
              <div className="text-center py-6 text-slate-500 text-sm flex flex-col items-center">
                <Folder size={36} className="text-slate-400 mb-2" />
                {githubData.githubToken ? 'No tienes repositorios públicos en esta cuenta.' : 'Agrega un Token de Acceso para ver y sincronizar tus repositorios.'}
              </div>
            )}
          </div>
          <button
            id="github-unlink-btn"
            className="mt-4 w-full py-2.5 border border-danger-500/30 text-danger-400 hover:bg-danger-500/10 rounded-xl text-sm transition-all"
            onClick={async () => {
              if (window.confirm('¿Seguro que quieres desvincular tu cuenta de GitHub? Perderás la sincronización actual.')) {
                await GitHubLinkModel.remove(user.id);
                // ALSO delete the achievement so they can earn it and the XP again
                await AchievementModel.remove(user.id, 'github_link');
                
                setGithubData(null);
                setRepos([]);
                setToken('');
                setUsername('');
                toast.success('Cuenta desvinculada exitosamente');
              }
            }}
          >
            Desvincular cuenta
          </button>
        </div>
      ) : (
        /* Formulario de vinculación */
        <div className="bg-white dark:bg-surface-card border border-slate-200 dark:border-surface-border rounded-2xl p-6 shadow-sm dark:shadow-none">
          <h2 className="text-base font-bold text-slate-900 dark:text-white mb-4">Vincular cuenta</h2>
          <form onSubmit={handleLink} className="space-y-4">
            <div>
              <label htmlFor="github-username" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Nombre de usuario en GitHub
              </label>
              <input
                id="github-username"
                type="text"
                placeholder="tu-usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-surface-border rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-accent-500 text-sm"
              />
            </div>
            <div>
              <label htmlFor="github-token" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Token personal de acceso (PAT)</span>
                <a href="https://github.com/settings/tokens/new" target="_blank" rel="noreferrer" className="text-xs text-accent-600 hover:underline flex items-center gap-1">
                  <HelpCircle size={12} /> ¿Cómo generarlo?
                </a>
              </label>
              <input
                id="github-token"
                type="password"
                placeholder="ghp_..."
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-surface-border rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-accent-500 text-sm"
              />
              <div className="text-xs text-slate-500 mt-2 space-y-1">
                <p><strong>Para subir proyectos, necesitas un token de acceso:</strong></p>
                <ol className="list-decimal list-inside pl-1 space-y-0.5">
                  <li>Ve a Settings en GitHub {'>'} Developer settings {'>'} Personal access tokens.</li>
                  <li>Crea un token (Classic).</li>
                  <li><strong>Importante:</strong> Márcale la casilla de permisos llamada <strong>"repo"</strong>.</li>
                  <li>Copia el código que empiece por <code className="bg-slate-200 dark:bg-slate-800 px-1 rounded">ghp_</code> y pégalo aquí.</li>
                </ol>
                <p className="pt-1 italic">El token se guarda solo localmente en tu navegador por seguridad.</p>
              </div>
            </div>
            <button
              id="github-link-btn"
              type="submit"
              disabled={isLinking}
              className="w-full py-3 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2"
            >
              {isLinking ? <><RefreshCw size={18} className="animate-spin" /> Vinculando...</> : <><Github size={18} /> Vincular con GitHub</>}
            </button>
          </form>
        </div>
      )}

      {/* Info */}
      <div className="p-4 bg-slate-50 dark:bg-surface-card border border-slate-200 dark:border-surface-border rounded-xl text-xs text-slate-600 dark:text-slate-400 leading-relaxed shadow-sm dark:shadow-none">
        <p className="font-semibold text-slate-800 dark:text-slate-300 mb-1">¿Para qué sirve la integración de GitHub?</p>
        <ul className="list-disc list-inside space-y-1">
          <li>Vincular tus proyectos del sandbox a repositorios reales</li>
          <li>Entregar tus proyectos finales o guardarlos para mantenerlos siempre contigo</li>
        </ul>
      </div>
    </div>
  );
}
