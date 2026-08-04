import React from 'react';
import { X, CheckCircle2, ExternalLink, ShieldCheck, Info, BarChart3 } from 'lucide-react';

export default function DetailDrawer({ isOpen, onClose, detailData }) {
  if (!isOpen || !detailData) return null;

  const { title, value, unit, description, advice, stationId, rawSourceUrl, isLiveData, category } = detailData;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/80 backdrop-blur-md transition-opacity duration-300">
      <div className="relative w-full max-w-md bg-slate-900 border-l border-slate-800 h-full p-6 overflow-y-auto space-y-6 shadow-2xl flex flex-col justify-between">
        
        {/* CABECERA CON BOTÓN CERRAR */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-2 text-sky-400 font-bold text-xs uppercase tracking-wider">
              <BarChart3 className="w-4 h-4" />
              <span>Desglose Detallado</span>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* TÍTULO Y VALOR PRINCIPAL */}
          <div className="space-y-2">
            {category && (
              <span className="px-2.5 py-1 bg-sky-500/10 border border-sky-500/30 text-sky-300 text-[11px] font-bold rounded-full inline-block">
                {category}
              </span>
            )}
            <h2 className="text-2xl font-bold text-white tracking-tight">{title}</h2>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-sky-400">{value}</span>
              {unit && <span className="text-lg text-slate-400 font-medium">{unit}</span>}
            </div>
          </div>

          {/* EXPLICACIÓN Y RECOMENDACIÓN */}
          <div className="space-y-3 bg-slate-950/50 p-4 rounded-xl border border-slate-800/80">
            <div className="flex items-start gap-2.5">
              <Info className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-300 leading-relaxed">{description}</p>
            </div>
            {advice && (
              <div className="pt-2 border-t border-slate-800 text-xs text-emerald-300 font-medium">
                🌱 <span className="font-bold">Recomendación:</span> {advice}
              </div>
            )}
          </div>
        </div>

        {/* AUDITORÍA DE FUENTE Y TRANSPARENCIA */}
        <div className="space-y-3 border-t border-slate-800 pt-4 bg-slate-950/80 p-4 rounded-xl border border-slate-800/60">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
            <ShieldCheck className="w-4 h-4" />
            <span>Auditoría de Fuente & Transparencia</span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-400">
              <span>Código Estación:</span>
              <span className="font-mono text-slate-200 font-bold">{stationId || 'DMC_CL_OFFICIAL'}</span>
            </div>

            <div className="flex items-center justify-between text-slate-400">
              <span>Estado Telemetría:</span>
              <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Dato Real en Vivo
              </span>
            </div>

            {rawSourceUrl && (
              <div className="pt-2 border-t border-slate-800">
                <a
                  href={rawSourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition border border-slate-700"
                >
                  <span>Verificar Fuente Oficial ({new URL(rawSourceUrl).hostname})</span>
                  <ExternalLink className="w-3.5 h-3.5 text-sky-400" />
                </a>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
