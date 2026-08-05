import React, { useState, useEffect } from 'react';
import { X, Satellite, Clock, ShieldCheck, RefreshCw } from 'lucide-react';
import { formatLocalTime } from '../utils/timeUtils';

export default function SatelliteModal({ isOpen, onClose, apiBase, goesData }) {
  const [loopData, setLoopData] = useState(null);
  const [loading, setLoading] = useState(true);

  const isoTimestamp = loopData?.last_updated_ts ? new Date(loopData.last_updated_ts * 1000).toISOString() : null;
  const { localTimeLabel, relativeTimeLabel } = formatLocalTime(isoTimestamp);

  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);
    fetch(`${apiBase}/api/v1/satellite/latest-loop`)
      .then((res) => res.json())
      .then((data) => {
        setLoopData(data);
      })
      .catch((err) => console.error("Error cargando animación GOES-19:", err))
      .finally(() => setLoading(false));
  }, [isOpen, apiBase]);

  if (!isOpen) return null;

  const rawUrl = loopData?.video_url
    ? (loopData.video_url.startsWith('http') ? loopData.video_url : `${apiBase}${loopData.video_url}`)
    : `${apiBase}/static/goes19_loop.webp`;

  const videoUrl = `${rawUrl}?t=${Date.now()}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-2xl">
      <div className="glass-panel w-full max-w-4xl overflow-hidden border border-purple-500/30 flex flex-col max-h-[90vh] shadow-2xl">
        
        {/* CABECERA DEL REPRODUCTOR */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 text-purple-400 rounded-xl border border-purple-500/30">
              <Satellite className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white">
                  Reproductor Bucle Satelital NOAA GOES-19
                </h3>
                <span className="px-2.5 py-0.5 text-[10px] font-bold bg-purple-500/20 text-purple-300 rounded-full border border-purple-500/30">
                  {localTimeLabel || 'Actualizando...'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Secuencia GeoColor procesada en backend a 20 fps (Bucle liviano de las últimas 24 horas)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* VISOR DE ANIMACIÓN SATELITAL WEBP */}
        <div className="flex-1 bg-black relative flex items-center justify-center min-h-[360px] overflow-hidden p-2">
          {loading ? (
            <div className="text-center space-y-3">
              <RefreshCw className="w-10 h-10 text-purple-400 animate-spin mx-auto" />
              <div className="text-sm font-semibold text-slate-300">Cargando bucle animado procesado...</div>
            </div>
          ) : (
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                src={videoUrl}
                alt="Bucle Animado GOES-19 Chile"
                className="max-h-[62vh] w-auto object-contain rounded-lg shadow-2xl"
              />
            </div>
          )}

          {/* BADGE DE TIEMPO Y FUENTE EN VIVO */}
          <div className="absolute top-4 right-4 bg-slate-950/85 px-3 py-1.5 rounded-xl border border-purple-500/30 text-xs font-mono text-purple-300 backdrop-blur-md flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-purple-400" />
            <span className="font-semibold text-white">{localTimeLabel}</span>
            <span className="text-white/60 ml-2">({relativeTimeLabel})</span>
          </div>
        </div>

        {/* PIE DE PÁGINA CON AUDITORÍA Y FUENTE OFICIAL */}
        <div className="p-4 bg-slate-900/90 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-emerald-400 font-medium">
            <ShieldCheck className="w-4 h-4" />
            <span>Fuente Oficial: NOAA NESDIS / GOES-19 Sector SSA</span>
          </div>

          {loopData?.raw_source_url && (
            <a
              href={loopData.raw_source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-300 hover:text-purple-200 underline font-semibold flex items-center gap-1"
            >
              Inspeccionar Archivo Crudo NOAA ↗
            </a>
          )}
        </div>

      </div>
    </div>
  );
}
