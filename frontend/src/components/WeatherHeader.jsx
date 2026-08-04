import React from 'react';
import { MapPin, Navigation, ShieldAlert, Radio, Clock } from 'lucide-react';

export default function WeatherHeader({ climaData }) {
  if (!climaData) return null;

  const { estacion, modo_urbano, metadatos, alerta_oficial_senapred } = climaData;

  return (
    <div className="space-y-4">
      {/* BANNER ALERTA SENAPRED SI EXISTE */}
      {alerta_oficial_senapred && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-red-950/80 via-orange-950/80 to-slate-900 border border-red-500/40 text-red-200 flex items-start gap-3.5 shadow-xl animate-pulse-soft">
          <ShieldAlert className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[10px] font-bold bg-red-500/30 text-red-300 rounded-full border border-red-500/40 uppercase tracking-wider">
                Alerta SENAPRED Oficial
              </span>
              <span className="text-xs text-red-400 font-semibold">{alerta_oficial_senapred.nivel}</span>
            </div>
            <h4 className="text-sm font-bold text-white">{alerta_oficial_senapred.evento || 'Alerta Meteorológica Nacional'}</h4>
            <p className="text-xs text-red-200/90 leading-relaxed">{alerta_oficial_senapred.comunas || alerta_oficial_senapred.descripcion}</p>
          </div>
        </div>
      )}

      {/* TARJETA CABECERA DE CLIMA EN VIVO */}
      <div className="glass-panel p-6 relative overflow-hidden">
        {/* Glow de fondo */}
        <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          
          {/* INFORMACIÓN DE LA ESTACIÓN */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs text-sky-400 font-medium">
              <MapPin className="w-4 h-4 text-sky-400" />
              <span>{estacion?.sector || 'Chile'}</span>
              <span className="text-slate-600">•</span>
              <span className="flex items-center gap-1 text-slate-400">
                <Navigation className="w-3.5 h-3.5 text-slate-400" />
                a {metadatos?.distancia_km} km ({metadatos?.orientacion})
              </span>
            </div>

            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              {estacion?.nombre}
            </h2>

            <div className="flex items-center gap-2 pt-1">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-sky-500/15 text-sky-300 text-xs font-semibold rounded-full border border-sky-500/30">
                <Radio className="w-3.5 h-3.5 animate-pulse text-sky-400" />
                {estacion?.red_oficial}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-800/80 text-slate-400 text-xs rounded-full border border-white/10">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Sincronizado cada 60 min
              </span>
            </div>
          </div>

          {/* TEMPERATURA GRANDE & SENSACIÓN */}
          <div className="flex items-center gap-6 bg-slate-900/60 p-4 rounded-2xl border border-white/10 backdrop-blur-md">
            <div className="text-right">
              <div className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-300 font-mono tracking-tighter">
                {modo_urbano?.temperatura_c}°<span className="text-3xl text-sky-400">C</span>
              </div>
              <div className="text-xs text-slate-400 font-medium mt-1">
                Sensación Térmica: <span className="text-sky-300 font-bold">{modo_urbano?.sensacion_termica_c}°C</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
