import React from 'react';
import { MapPin, Navigation, ShieldAlert, Radio, Clock, Sun, CloudSun, CloudRain, ShieldCheck } from 'lucide-react';

export default function WeatherHeader({ climaData }) {
  if (!climaData) return null;

  const { estacion, modo_urbano, modo_agricola, metadatos, alerta_oficial_senapred, transparency_metadata } = climaData;

  const temp = modo_urbano?.temperatura_c ?? 18;
  const sensacion = modo_urbano?.sensacion_termica_c ?? 18;
  const tMin = modo_agricola?.temperatura_minima_hoy_c ?? 10;
  const tMax = modo_agricola?.temperatura_maxima_hoy_c ?? 22;

  const updatedAgo = transparency_metadata?.updated_ago_str || "Se actualizó hace un instante";

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

      {/* APPLE WEATHER STYLE HERO CARD */}
      <div className="relative rounded-3xl p-6 md:p-8 bg-gradient-to-b from-slate-900/90 via-slate-900/70 to-slate-950/90 border border-slate-800/80 shadow-2xl backdrop-blur-2xl overflow-hidden text-center space-y-3">
        {/* Radial ambient glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* NOMBRE DE LA COMUNA / SECTOR */}
        <div className="flex items-center justify-center gap-2 text-xs font-bold tracking-wide text-sky-400 uppercase">
          <MapPin className="w-4 h-4 text-sky-400" />
          <span>{estacion?.sector || 'Chile'}</span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-400 font-normal normal-case">
            A {metadatos?.distancia_km} km ({metadatos?.orientacion})
          </span>
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

        {/* PILLS DE RED Y TRANSPARENCIA */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-500/15 text-sky-300 font-semibold rounded-full border border-sky-500/30">
            <Radio className="w-3.5 h-3.5 animate-pulse text-sky-400" />
            {estacion?.red_oficial || 'DMC Chile'}
          </span>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/15 text-emerald-300 font-semibold rounded-full border border-emerald-500/30">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            {updatedAgo}
          </span>
        </div>

      </div>
    </div>
  );
}
