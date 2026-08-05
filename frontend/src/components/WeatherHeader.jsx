import React from 'react';
import { MapPin, ShieldAlert, Radio, ShieldCheck, Share2, Clock } from 'lucide-react';
import { formatLocalTime } from '../utils/timeUtils';

export default function WeatherHeader({ climaData, onOpenEstacionesCercanas }) {
  if (!climaData) return null;

  const { estacion, modo_urbano, modo_agricola, metadatos, alerta_oficial_senapred, transparency_metadata } = climaData;

  const temp = modo_urbano?.temperatura_c ?? 18;
  const sensacion = modo_urbano?.sensacion_termica_c ?? 18;
  const tMin = modo_agricola?.temperatura_minima_hoy_c ?? 10;
  const tMax = modo_agricola?.temperatura_maxima_hoy_c ?? 22;

  const isoTimestamp = transparency_metadata?.last_fetched_timestamp;
  const { localTimeLabel, relativeTimeLabel } = formatLocalTime(isoTimestamp);

  const compartir = () => {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: `MeteoPrecisa Chile — ${estacion?.nombre || 'Clima'}`,
        text: `Revisa el clima en vivo para ${estacion?.nombre}:`,
        url: url
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      alert(`🔗 Enlace copiado al portapapeles: ${url}`);
    }
  };

  return (
    <div className="space-y-4">
      {/* BANNER ALERTA SENAPRED SI EXISTE */}
      {alerta_oficial_senapred && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-red-950/90 via-orange-950/80 to-slate-900 border border-red-500/50 text-red-200 flex items-start gap-3.5 shadow-2xl animate-pulse-soft">
          <ShieldAlert className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-[10px] font-bold bg-red-500/30 text-red-200 rounded-full border border-red-500/40 uppercase tracking-wider">
                Alerta SENAPRED Oficial
              </span>
              <span className="text-xs text-red-300 font-bold">{alerta_oficial_senapred.nivel}</span>
            </div>
            <h4 className="text-sm font-extrabold text-white">{alerta_oficial_senapred.evento || 'Alerta Meteorológica Nacional'}</h4>
            <p className="text-xs text-red-200/90 leading-relaxed">{alerta_oficial_senapred.comunas || alerta_oficial_senapred.descripcion}</p>
          </div>
        </div>
      )}

      {/* HERO CARD ESTILO APPLE WEATHER CON BOTÓN COMPARTIR Y VER ESTACIONES CERCANAS */}
      <div className="relative rounded-3xl p-6 md:p-8 bg-gradient-to-b from-slate-900/90 via-slate-900/70 to-slate-950/90 border border-slate-800/80 shadow-2xl backdrop-blur-2xl overflow-hidden text-center space-y-3">
        {/* Radial ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* BOTÓN COMPARTIR Y UBICACIÓN CERCANA (PUNTO 2 Y 6) */}
        <div className="flex items-center justify-between text-xs font-bold text-sky-400">
          <button 
            onClick={onOpenEstacionesCercanas}
            className="flex items-center gap-2 bg-sky-500/10 hover:bg-sky-500/20 px-3 py-1.5 rounded-xl border border-sky-500/30 text-sky-300 transition"
          >
            <MapPin className="w-3.5 h-3.5 text-sky-400" />
            <span>{estacion?.sector || 'Chile'} • A {metadatos?.distancia_km} km</span>
            <span className="text-[10px] text-sky-400 underline">(Ver 5 Cercanas)</span>
          </button>

          <button 
            onClick={compartir}
            className="flex items-center gap-1.5 bg-slate-800/80 hover:bg-slate-700/80 px-3 py-1.5 rounded-xl border border-slate-700 text-slate-200 transition"
          >
            <Share2 className="w-3.5 h-3.5 text-slate-300" />
            <span>Compartir</span>
          </button>
        </div>

        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
          {estacion?.nombre}
        </h1>

        {/* TEMPERATURA GIGANTE ESTILO APPLE WEATHER */}
        <div className="py-2 relative z-10 flex flex-col items-center justify-center">
          <div className="text-7xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-slate-100 to-slate-300 font-mono tracking-tighter drop-shadow-md">
            {temp}°
          </div>
          <div className="text-sm font-semibold text-slate-300 flex items-center justify-center gap-3 mt-1">
            <span>Sensación: <strong className="text-sky-300">{sensacion}°C</strong></span>
            <span className="text-slate-600">•</span>
            <span>Mín: <strong className="text-cyan-300">{tMin}°C</strong></span>
            <span className="text-slate-600">•</span>
            <span>Máx: <strong className="text-amber-300">{tMax}°C</strong></span>
          </div>
        </div>

        {/* PILLS DE RED Y TRANSPARENCIA CON HORA CERRADA (PUNTO 4) */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-500/15 text-sky-300 font-semibold rounded-full border border-sky-500/30">
            <Radio className="w-3.5 h-3.5 animate-pulse text-sky-400" />
            {estacion?.red_oficial || 'DMC Chile'}
          </span>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/15 text-emerald-300 font-semibold rounded-full border border-emerald-500/30">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            {localTimeLabel}
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800/80 text-slate-300 font-semibold rounded-full border border-slate-700">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            {relativeTimeLabel}
          </span>
        </div>

      </div>
    </div>
  );
}
