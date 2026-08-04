import React from 'react';
import { Sun, CloudSun, CloudRain, Snowflake, Droplets, Calendar, Sprout } from 'lucide-react';

export default function DailyForecastCards({ dailyForecast }) {
  if (!dailyForecast || !dailyForecast.time || dailyForecast.time.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl text-center text-slate-400 text-xs">
        Cargando pronóstico diario a 7 días...
      </div>
    );
  }

  const {
    time = [],
    temperature_2m_max = [],
    temperature_2m_min = [],
    precipitation_sum = [],
    et0_fao_evapotranspiration = [],
    uv_index_max = []
  } = dailyForecast;

  const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <Calendar className="w-5 h-5 text-blue-400" />
          <h3 className="text-lg font-bold text-white">
            Pronóstico Meteorológico & Agrometeorológico a 7 Días
          </h3>
        </div>
        <span className="text-xs text-blue-400 font-bold bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
          Oficial DMC & Open-Meteo
        </span>
      </div>

      {/* GRILLA DE 7 DÍAS DESTACADA */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3 pt-2">
        {time.slice(0, 7).map((fechaStr, idx) => {
          const dateObj = new Date(fechaStr + 'T12:00:00');
          const esHoy = idx === 0;
          const nombreDia = esHoy ? 'Hoy' : diasSemana[dateObj.getDay()];
          const tMax = temperature_2m_max[idx] !== undefined ? Math.round(temperature_2m_max[idx]) : '--';
          const tMin = temperature_2m_min[idx] !== undefined ? Math.round(temperature_2m_min[idx]) : '--';
          const rain = precipitation_sum[idx] || 0.0;
          const eto = et0_fao_evapotranspiration[idx] || 0.0;
          const uv = uv_index_max[idx] || 0.0;

          // Seleccionar icono según lluvia y temperatura
          let IconComp = Sun;
          let iconColor = 'text-amber-400';
          if (rain > 1.0) {
            IconComp = CloudRain;
            iconColor = 'text-blue-400';
          } else if (tMin <= 2) {
            IconComp = Snowflake;
            iconColor = 'text-cyan-300';
          } else if (rain > 0.1 || tMax < 18) {
            IconComp = CloudSun;
            iconColor = 'text-teal-300';
          }

          return (
            <div
              key={fechaStr}
              className={`p-4 rounded-xl border transition-all flex flex-col justify-between space-y-3 ${
                esHoy
                  ? 'bg-gradient-to-b from-blue-950/90 to-slate-900 border-blue-500/60 shadow-lg shadow-blue-500/20 ring-1 ring-blue-500/50'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              {/* DIA Y FECHA */}
              <div className="text-center">
                <div className={`text-xs font-bold ${esHoy ? 'text-blue-300 uppercase tracking-wider' : 'text-slate-200'}`}>
                  {nombreDia}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  {dateObj.getDate()} / {dateObj.getMonth() + 1}
                </div>
              </div>

              {/* ICONO DEL TIEMPO */}
              <div className="flex justify-center py-1">
                <IconComp className={`w-9 h-9 ${iconColor}`} />
              </div>

              {/* TEMPERATURA MÁX / MÍN */}
              <div className="flex items-center justify-center gap-2 font-mono font-bold text-sm">
                <span className="text-amber-400 text-base">{tMax}°C</span>
                <span className="text-slate-600">/</span>
                <span className="text-cyan-400 text-base">{tMin}°C</span>
              </div>

              {/* MÉTRICAS SECUNDARIAS (LLUVIA & ETo) */}
              <div className="pt-2 border-t border-slate-800/80 space-y-1 text-[11px]">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-1 text-blue-400">
                    <Droplets className="w-3 h-3" />
                    Lluvia:
                  </span>
                  <span className="font-mono font-bold">{rain} mm</span>
                </div>

                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <Sprout className="w-3 h-3" />
                    ETo:
                  </span>
                  <span className="font-mono font-bold">{eto} mm</span>
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
