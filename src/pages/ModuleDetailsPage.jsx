import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Loader2 } from 'lucide-react';
import { getModulo, getLeccionesByModulo } from '@services/firebase/firestoreService';

export default function ModuleDetailsPage() {
  const { moduloId } = useParams();
  const navigate = useNavigate();
  const [modulo, setModulo] = useState(null);
  const [lecciones, setLecciones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const mod = await getModulo(moduloId);
        if (!mod) {
          navigate('/modulos');
          return;
        }
        setModulo(mod);
        
        // Obtener las clases del módulo ordenadas por defecto
        const lecs = await getLeccionesByModulo(moduloId);
        setLecciones(lecs || []);
      } catch (err) {
        console.error('Error cargando detalles del módulo:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [moduloId, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 size={32} className="animate-spin text-brand-500" />
      </div>
    );
  }

  if (!modulo) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-up px-4 sm:px-0">
      {/* Header */}
      <div>
        <Link to="/modulos" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-300 transition-colors mb-4">
          <ArrowLeft size={16} /> Volver a módulos
        </Link>
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-500/10 text-brand-400 flex items-center justify-center shrink-0 border border-brand-500/20">
            <BookOpen size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{modulo.titulo || modulo.title}</h1>
            <p className="text-slate-400 text-sm mt-1">{modulo.descripcion || modulo.description}</p>
          </div>
        </div>
      </div>

      {/* Lista de Lecciones */}
      <div className="bg-surface-card border border-surface-border rounded-2xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Clases disponibles</h2>
        
        {lecciones.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-8">Aún no hay clases publicadas en este módulo.</p>
        ) : (
          <div className="space-y-3">
            {lecciones.map((leccion, index) => (
              <Link
                key={leccion.id}
                to={`/modulos/${moduloId}/leccion/${leccion.id}`}
                className="flex items-center justify-between p-4 rounded-xl border border-surface-border bg-surface-dark hover:border-brand-500/50 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-surface-hover text-slate-400 flex items-center justify-center group-hover:bg-brand-500/10 group-hover:text-brand-400 transition-colors shrink-0">
                    <span className="text-xs font-bold">{index + 1}</span>
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-200 group-hover:text-white transition-colors">
                      {leccion.titulo || leccion.title || `Clase ${index + 1}`}
                    </h3>
                  </div>
                </div>
                <div className="text-slate-500 group-hover:text-brand-400 transition-colors shrink-0">
                  <ArrowLeft size={16} className="rotate-180" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
