import React from 'react';
import { Sprout, Snowflake, Droplet, Sun, Wind, CloudRain, Cpu, Sparkles } from 'lucide-react';

export default function AgroPanel({ agricola }) {
  if (!agricola) return null;

  const {
    evapotranspiracion_eto_mm_dia,
    horas_frio_acumuladas_24h,
    alerta_helada_agrometeorologica,
    salud_vegetacion_ndvi,
    estado_vigor_vegetativo,
    humedad_suelo_volumetrica,
    estado_humedad_suelo,
    radiacion_solar_w_m2,
    rafagas_viento_kmh,
    lluvia_acumulada_hoy_mm,
    temperatura_minima_hoy_c,
    temperatura_maxima_hoy_c,
    fuente_agronomica
  } = agricola;

  return (
    <div className="space-y-6">
      
      {/* GRILLA DE MÉTRICAS AGROMETEOROLÓGICAS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* TARJETA 1: EVAPOTRANSPIRACIÓN ETo */}
        <div className="glass-panel p-4 flex items-center gap-3">
          <div className="p-3 bg-emerald-500/15 text-emerald-400 rounded-xl border border-emerald-500/20">
            <Sprout className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Evapotranspiración ETo</div>
            <div className="text-xl font-bold font-mono text-white">{evapotranspiracion_eto_mm_dia} <span className="text-xs font-sans text-slate-400">mm/día</span></div>
            <div className="text-[11px] text-slate-500">Consumo hídrico FAO-56</div>
          </div>
        </div>

        {/* TARJETA 2: HORAS FRÍO */}
        <div className="glass-panel p-4 flex items-center gap-3">
          <div className="p-3 bg-cyan-500/15 text-cyan-400 rounded-xl border border-cyan-500/20">
            <Snowflake className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Horas Frío (≤7°C)</div>
            <div className="text-xl font-bold font-mono text-white">{horas_frio_acumuladas_24h} <span className="text-xs font-sans text-slate-400">hrs</span></div>
            <div className="text-[11px] text-slate-500">Últimas 24 horas</div>
          </div>
        </div>

        {/* TARJETA 3: RADIACIÓN SOLAR */}
        <div className="glass-panel p-4 flex items-center gap-3">
          <div className="p-3 bg-amber-500/15 text-amber-400 rounded-xl border border-amber-500/20">
            <Sun className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Radiación Solar Global</div>
            <div className="text-xl font-bold font-mono text-white">{radiacion_solar_w_m2} <span className="text-xs font-sans text-slate-400">W/m²</span></div>
            <div className="text-[11px] text-slate-500">Insolación fotosintética</div>
          </div>
        </div>

        {/* TARJETA 4: RÁFAGAS & DERIVA */}
        <div className="glass-panel p-4 flex items-center gap-3">
          <div className="p-3 bg-teal-500/15 text-teal-400 rounded-xl border border-teal-500/20">
            <Wind className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Ráfagas de Viento</div>
            <div className="text-xl font-bold font-mono text-white">{rafagas_viento_kmh} <span className="text-xs font-sans text-slate-400">km/h</span></div>
            <div className="text-[11px] text-slate-500">Riesgo deriva fitosanitaria</div>
          </div>
        </div>

      </div>

      {/* FILA DE HELADAS & EXTREMAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* TARJETA ALERTA DE HELADAS */}
        <div className="glass-panel p-5 space-y-3 border-cyan-500/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Snowflake className="w-5 h-5 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">Riesgo de Heladas Agrometeorológicas</h3>
            </div>
            <span className="px-3 py-1 bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded-full text-xs font-bold">
              {alerta_helada_agrometeorologica?.riesgo_helada}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs bg-slate-900/60 p-3 rounded-xl border border-white/5">
            <span className="text-slate-400">Temperatura Punto de Rocío (Dew Point):</span>
            <span className="font-mono font-bold text-sky-400 text-sm">{alerta_helada_agrometeorologica?.temperatura_rocio_c}°C</span>
          </div>
          <p className="text-[11px] text-slate-400">
            💡 Un punto de rocío bajo cero o cercano a 0°C indica riesgo inminente de congelación y helada radiativa durante la madrugada.
          </p>
        </div>

        {/* TEMPERATURAS EXTREMAS Y PRECIPITACIÓN */}
        <div className="glass-panel p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CloudRain className="w-5 h-5 text-sky-400" />
              <h3 className="text-sm font-bold text-white">Agua & Extremas Diarias</h3>
            </div>
            <span className="px-3 py-1 bg-sky-500/20 text-sky-300 border border-sky-500/40 rounded-full text-xs font-bold font-mono">
              Lluvia: {lluvia_acumulada_hoy_mm} mm
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 text-xs pt-1">
            <div className="bg-slate-900/60 p-2.5 rounded-xl border border-white/5 text-center">
              <div className="text-[10px] text-slate-400">Mínima Hoy</div>
              <div className="text-base font-bold font-mono text-cyan-400">{temperatura_minima_hoy_c}°C</div>
            </div>
            <div className="bg-slate-900/60 p-2.5 rounded-xl border border-white/5 text-center">
              <div className="text-[10px] text-slate-400">Máxima Hoy</div>
              <div className="text-base font-bold font-mono text-amber-400">{temperatura_maxima_hoy_c}°C</div>
            </div>
          </div>
        </div>

      </div>

      {/* WIDGET MONITOREO DE SATÉLITES GOOGLE EARTH ENGINE */}
      <div className="glass-panel p-6 space-y-5 border-emerald-500/40 bg-gradient-to-br from-slate-900/90 via-slate-900/80 to-emerald-950/30">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
              <Cpu className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white">
                  Análisis Satelital Google Earth Engine
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30">
                  Sentinel-2 10m & ERA5
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Índices agronómicos procesados mediante la nube de Google
              </p>
            </div>
          </div>

          <div className="text-xs text-slate-400 italic">
            {fuente_agronomica || 'Google Earth Engine'}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* NDVI SALUD VEGETAL */}
          <div className="bg-slate-900/80 p-5 rounded-2xl border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                🌿 Salud de Vegetación (NDVI)
              </span>
              <span className="text-lg font-extrabold font-mono text-emerald-300 bg-emerald-500/20 px-3 py-1 rounded-xl border border-emerald-500/40">
                {salud_vegetacion_ndvi}
              </span>
            </div>
            <div className="text-sm font-semibold text-white">
              {estado_vigor_vegetativo}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-white/5">
              💡 Medido con reflectancia infrarroja B8/B4 del satélite Sentinel-2 de la Agencia Espacial Europea. Valores sobre 0.50 indican cultivos con abundante masa foliar activa.
            </p>
          </div>

          {/* HUMEDAD DE SUELO ERA5 */}
          <div className="bg-slate-900/80 p-5 rounded-2xl border border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                💧 Humedad Volumétrica de Suelo
              </span>
              <span className="text-lg font-extrabold font-mono text-sky-300 bg-sky-500/20 px-3 py-1 rounded-xl border border-sky-500/40">
                {humedad_suelo_volumetrica} <span className="text-xs font-sans">m³/m³</span>
              </span>
            </div>
            <div className="text-sm font-semibold text-white">
              {estado_humedad_suelo}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-white/5">
              💡 Estimado del contenido de agua en la capa superficial (0-7cm). Permite optimizar turnos de riego y detectar déficits hídricos antes del marchitamiento.
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
