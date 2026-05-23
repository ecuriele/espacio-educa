import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  loginWithCredentials,
  loginWithGoogle,
  registerWithEmail,
  selectAuthStatus,
  selectAuthError,
  selectIsAuthenticated,
  clearError,
} from '@store/slices/authSlice';
import { toggleTheme, selectTheme } from '@store/slices/uiSlice';
import { Eye, EyeOff, Wifi, AlertTriangle, Sun, Moon, UserPlus, LogIn, Flame } from 'lucide-react';
import clsx from 'clsx';
import { FIREBASE_CONFIGURED } from '@services/firebase/config';

const CAROUSEL_SLIDES = [
  {
    image: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80',
    title: 'Construimos el futuro de Venezuela, una línea de código a la vez.',
    subtitle: 'Aprende programación desde cero, sin necesidad de conexión a internet constante.',
  },
  {
    image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&q=80',
    title: 'Acompañamiento en cada paso',
    subtitle: 'Una plataforma diseñada para guiarte en tu aprendizaje técnico.',
  },
  {
    image: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&q=80',
    title: 'Tu salón de clases, en cualquier lugar',
    subtitle: 'Sincroniza tus progresos cuando tengas conexión y sigue aprendiendo offline.',
  }
];

export default function LoginPage() {
  const dispatch    = useDispatch();
  const navigate    = useNavigate();
  const [params]    = useSearchParams();
  const status      = useSelector(selectAuthStatus);
  const error       = useSelector(selectAuthError);
  const isAuth      = useSelector(selectIsAuthenticated);
  const theme       = useSelector(selectTheme);

  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', nombreMostrar: '', colegio: '', salon: '' });
  const [showPass, setShowPass] = useState(false);

  // Carrusel
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % CAROUSEL_SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const redirectTo = params.get('redirect') || '/panel';

  useEffect(() => {
    if (isAuth) navigate(redirectTo, { replace: true });
  }, [isAuth, navigate, redirectTo]);

  // Limpiar error al cambiar de modo
  const toggleMode = () => {
    dispatch(clearError());
    setForm({ email: '', password: '', nombreMostrar: '', colegio: '', salon: '' });
    setIsRegisterMode((v) => !v);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isRegisterMode) {
      dispatch(registerWithEmail(form));
    } else {
      dispatch(loginWithCredentials(form));
    }
  };

  const handleGoogleLogin = () => {
    if (!FIREBASE_CONFIGURED) {
      alert('El login con Google requiere configurar Firebase.\nPor ahora usa email y contraseña.');
      return;
    }
    dispatch(loginWithGoogle());
  };

  const isLoading = status === 'loading';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-surface-dark flex font-sans transition-colors duration-300">
      
      {/* Panel izquierdo — Carrusel (Oculto en móvil) */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col items-center justify-center overflow-hidden">
        {CAROUSEL_SLIDES.map((slide, index) => (
          <div 
            key={index}
            className={clsx(
              "absolute inset-0 transition-opacity duration-1000",
              currentSlide === index ? "opacity-100 z-10" : "opacity-0 z-0"
            )}
          >
            {/* Imagen de fondo */}
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${slide.image})` }}
            />
            {/* Overlay Oscuro para contraste */}
            <div className="absolute inset-0 bg-brand-900/80 mix-blend-multiply" />
            <div className="absolute inset-0 bg-gradient-to-t from-surface-dark via-surface-dark/60 to-transparent" />
            
            {/* Contenido del Slide */}
            <div className="absolute inset-0 flex flex-col justify-end p-16 pb-24">
              <div className="mb-8 w-16 h-2 bg-accent-500 rounded-full" />
              <h1 className="text-4xl lg:text-5xl font-bold font-display text-white mb-4 leading-tight">
                {slide.title}
              </h1>
              <p className="text-lg text-slate-300 max-w-lg leading-relaxed">
                {slide.subtitle}
              </p>
            </div>
          </div>
        ))}

        {/* Controles del carrusel */}
        <div className="absolute bottom-8 left-16 z-20 flex items-center gap-3">
          {CAROUSEL_SLIDES.map((_, i) => (
            <button 
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={clsx(
                "h-2 rounded-full transition-all duration-300",
                currentSlide === i ? "w-8 bg-accent-500" : "w-2 bg-white/30 hover:bg-white/50"
              )}
              aria-label={`Ir a la diapositiva ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Panel derecho — Formulario */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 relative">
        
        {/* Botón de tema */}
        <div className="absolute top-6 right-6">
          <button
            onClick={() => dispatch(toggleTheme())}
            className="p-2.5 bg-white dark:bg-surface-card border border-slate-200 dark:border-surface-border text-slate-500 hover:text-accent-500 dark:text-slate-400 dark:hover:text-white rounded-xl shadow-sm transition-all"
            title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>

        <div className="w-full max-w-md">
          {/* Logo Superior */}
            <div className="flex items-center h-12 mb-10">
              <img src="/brandboard/original/weeMesa%20de%20trabajo%201.svg" alt="Espacio Educa" className="h-full object-contain" />
            </div>

          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2 font-display">
            {isRegisterMode ? 'Crear cuenta' : 'Inicia sesión'}
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-8">
            {isRegisterMode
              ? 'Tu progreso se guardará en este dispositivo y se sincronizará cuando tengas conexión.'
              : 'Bienvenido de nuevo. Tu progreso te espera en tu dispositivo.'}
          </p>

          {/* Banner: modo demo sin Firebase */}
          {!FIREBASE_CONFIGURED && (
            <div className="mb-6 flex items-start gap-3 px-4 py-3.5 bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-xl">
              <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-amber-700 dark:text-amber-400">Modo demo — Firebase no configurado</p>
                <p className="text-xs text-amber-600 dark:text-amber-500 mt-0.5">
                  Puedes ingresar con cualquier email y contraseña. Los datos se guardarán solo en este dispositivo.
                </p>
              </div>
            </div>
          )}
          {/* Botón Google */}
          <button
            id="login-google-btn"
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className={clsx(
              'w-full py-3.5 mb-6 rounded-xl font-medium text-sm transition-all duration-200 flex items-center justify-center gap-3',
              'bg-white dark:bg-surface-card border border-slate-200 dark:border-surface-border',
              'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-surface-hover',
              'shadow-sm dark:shadow-none',
              isLoading && 'opacity-60 cursor-not-allowed'
            )}
          >
            {/* Google icon SVG */}
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continuar con Google
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-slate-200 dark:bg-surface-border" />
            <span className="text-xs text-slate-400">o con correo</span>
            <div className="flex-1 h-px bg-slate-200 dark:bg-surface-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Nombre (solo en registro) */}
            {isRegisterMode && (
              <div>
                <label htmlFor="login-name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Nombre completo
                </label>
                <input
                  id="login-name"
                  type="text"
                  required
                  placeholder="Tu nombre"
                  value={form.nombreMostrar}
                  onChange={(e) => setForm({ ...form, nombreMostrar: e.target.value })}
                  className="w-full px-4 py-3.5 bg-white dark:bg-surface-card/50 border border-slate-200 dark:border-surface-border rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#ea5837] transition-all text-sm shadow-sm dark:shadow-none"
                />
              </div>
            )}
            
            {/* Colegio (solo en registro) */}
            {isRegisterMode && (
              <div>
                <label htmlFor="login-colegio" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Colegio
                </label>
                <select
                  id="login-colegio"
                  required
                  value={form.colegio}
                  onChange={(e) => setForm({ ...form, colegio: e.target.value })}
                  className="w-full px-4 py-3.5 bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-surface-border rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#ea5837] transition-all text-sm cursor-pointer"
                >
                  <option value="" disabled>Selecciona tu colegio...</option>
                  <option value="María Inmaculada">María Inmaculada</option>
                  <option value="Campo Rico">Campo Rico</option>
                </select>
              </div>
            )}

            {/* Salón (solo en registro) */}
            {isRegisterMode && (
              <div>
                <label htmlFor="login-salon" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Curso
                </label>
                <select
                  id="login-salon"
                  required
                  value={form.salon}
                  onChange={(e) => setForm({ ...form, salon: e.target.value })}
                  className="w-full px-4 py-3.5 bg-slate-50 dark:bg-surface-dark border border-slate-200 dark:border-surface-border rounded-xl text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#ea5837] transition-all text-sm cursor-pointer"
                >
                  <option value="" disabled>Selecciona el curso...</option>
                  <option value="Básico">Básico</option>
                  <option value="Avanzado">Avanzado</option>
                </select>
              </div>
            )}

            {/* Email */}
            <div>
              <label htmlFor="login-email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Correo electrónico
              </label>
              <input
                id="login-email"
                type="email"
                required
                autoComplete="email"
                placeholder="tu@correo.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-4 py-3.5 bg-white dark:bg-surface-card/50 border border-slate-200 dark:border-surface-border rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#ea5837] transition-all text-sm font-mono shadow-sm dark:shadow-none"
              />
            </div>

            {/* Contraseña */}
            <div>
              <label htmlFor="login-password" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPass ? 'text' : 'password'}
                  required
                  autoComplete={isRegisterMode ? 'new-password' : 'current-password'}
                  placeholder={isRegisterMode ? 'Mínimo 6 caracteres' : '••••••••'}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-4 py-3.5 bg-white dark:bg-surface-card/50 border border-slate-200 dark:border-surface-border rounded-xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#ea5837] transition-all text-sm pr-12 font-mono shadow-sm dark:shadow-none"
                />
                <button
                  type="button"
                  id="toggle-password-visibility"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                  aria-label="Mostrar/ocultar contraseña"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div
                id="login-error-msg"
                className="flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm"
              >
                <AlertTriangle size={16} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <button
              id="login-submit-btn"
              type="submit"
              disabled={isLoading}
              className={clsx(
                'w-full py-4 mt-2 rounded-xl font-semibold text-white text-sm transition-all duration-300 flex items-center justify-center gap-2',
                'bg-[#ea5837] hover:bg-[#c84223]',
                'shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#f07659] focus:ring-offset-2 focus:ring-offset-slate-50 dark:focus:ring-offset-surface-dark',
                isLoading && 'opacity-60 cursor-not-allowed'
              )}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{isRegisterMode ? 'Creando cuenta...' : 'Iniciando sesión...'}</span>
                </>
              ) : (
                <>
                  {isRegisterMode ? <UserPlus size={16} /> : <LogIn size={16} />}
                  {isRegisterMode ? 'Crear mi cuenta' : 'Ingresar a la plataforma'}
                </>
              )}
            </button>
          </form>

          {/* Toggle login/registro */}
          <p className="text-center text-sm text-slate-500 dark:text-slate-400 mt-6">
            {isRegisterMode ? '¿Ya tienes cuenta? ' : '¿No tienes cuenta? '}
            <button
              id="toggle-auth-mode"
              onClick={toggleMode}
              className="text-[#ea5837] hover:underline font-semibold"
            >
              {isRegisterMode ? 'Inicia sesión' : 'Regístrate gratis'}
            </button>
          </p>

          {/* Aviso modo offline */}
          <div className="mt-8 p-5 bg-white dark:bg-surface-card/40 border border-slate-200 dark:border-surface-border rounded-xl flex items-start gap-3 shadow-sm dark:shadow-none">
            <Wifi className="text-brand-500 dark:text-brand-400 shrink-0 mt-0.5" size={18} />
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              <strong className="text-slate-900 dark:text-slate-200">Offline First.</strong> Si ya iniciaste sesión antes, tu progreso y código están guardados localmente. Puedes continuar sin conexión a internet.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
