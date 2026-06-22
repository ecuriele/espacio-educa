import React, { useState } from 'react';
import { pdfjs, Document, Page } from 'react-pdf';
import { ChevronLeft, ChevronRight, Maximize, ZoomIn, ZoomOut, Loader2 } from 'lucide-react';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Usar el worker estático desde la carpeta public para máxima estabilidad
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

export default function PdfViewer({ url }) {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [loading, setLoading] = useState(true);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setLoading(false);
  }

  function changePage(offset) {
    setPageNumber(prevPageNumber => Math.min(Math.max(1, prevPageNumber + offset), numPages));
  }

  return (
    <div className="flex flex-col bg-slate-900 border border-slate-700 rounded-xl overflow-hidden shadow-xl">
      {/* Barra de herramientas */}
      <div className="flex flex-wrap items-center justify-between p-2 bg-slate-800 border-b border-slate-700 gap-2">
        <div className="flex items-center gap-2">
          <button 
            onClick={() => changePage(-1)} 
            disabled={pageNumber <= 1}
            className="p-1.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 rounded-md text-white transition-colors"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-xs text-slate-300 font-medium select-none min-w-[60px] text-center">
            {numPages ? `${pageNumber} de ${numPages}` : '-- de --'}
          </span>
          <button 
            onClick={() => changePage(1)} 
            disabled={pageNumber >= numPages}
            className="p-1.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 rounded-md text-white transition-colors"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button onClick={() => setScale(s => Math.max(0.5, s - 0.2))} className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded-md text-white transition-colors">
            <ZoomOut size={16} />
          </button>
          <span className="text-xs text-slate-300 min-w-[40px] text-center">{Math.round(scale * 100)}%</span>
          <button onClick={() => setScale(s => Math.min(3, s + 0.2))} className="p-1.5 bg-slate-700 hover:bg-slate-600 rounded-md text-white transition-colors">
            <ZoomIn size={16} />
          </button>
          <div className="w-px h-5 bg-slate-600 mx-1"></div>
          <a href={url} target="_blank" rel="noopener noreferrer" className="p-1.5 bg-teal-600 hover:bg-teal-500 rounded-md text-white transition-colors" title="Pantalla completa / Descargar">
            <Maximize size={16} />
          </a>
        </div>
      </div>

      {/* Visualizador */}
      <div className="relative flex justify-center bg-slate-900/50 overflow-auto min-h-[300px] max-h-[600px] p-4 custom-scrollbar">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 gap-3">
            <Loader2 size={32} className="animate-spin text-teal-500" />
            <span className="text-sm font-medium">Cargando presentación...</span>
          </div>
        )}
        <Document
          file={url}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={null}
          error={<div className="text-red-400 text-sm p-4 text-center">Error al cargar el PDF. Verifica tu conexión o intenta descargarlo.</div>}
          className="flex justify-center"
        >
          <Page 
            pageNumber={pageNumber} 
            scale={scale} 
            renderTextLayer={true}
            renderAnnotationLayer={true}
            className="shadow-2xl"
            loading={null}
          />
        </Document>
      </div>
    </div>
  );
}
