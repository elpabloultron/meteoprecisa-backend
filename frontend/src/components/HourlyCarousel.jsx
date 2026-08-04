import React from 'react';
import { Sun, Cloud, CloudSun, CloudRain, CloudLightning, Snowflake, Droplets, Clock } from 'lucide-react';

function getWeatherIcon(code, temp) {
  if (code === undefined || code === null) return <CloudSun className="w-6 h-6 text-amber-400" />;
  if (code === 0) return <Sun className="w-6 h-6 text-amber-400" />;
  if (code >= 1 && code <= 3) return <CloudSun className="w-6 h-6 text-sky-400" />;
  if (code >= 51 && code <= 67) return <CloudRain className="w-6 h-6 text-blue-400" />;
  if (code >= 71 && code <= 77) return <Snowflake className="w-6 h-6 text-cyan-300" />;
  if (code >= 95) return <CloudLightning className="w-6 h-6 text-purple-400" />;
  return <Cloud className="w-6 h-6 text-slate-400" />;
}

export default function HourlyCarousel({ hourlyForecast }) {
  if (!hourlyForecast || !hourlyForecast.time || hourlyForecast.time.length === 0) return null;

  const times = hourlyForecast.time.slice(0, 24);
  const temps = hourlyForecast.temperature_2m?.slice(0, 24) || [];
  const precips = hourlyForecast.precipitation_probability?.slice(0, 24) || [];
  const precipMms = hourlyForecast.precipitation?.slice(0, 24) || [];
  const humidities = hourlyForecast.relative_humidity_2m?.slice(0, 24) || [];
  const codes = hourlyForecast.weather_code?.slice(0, 24) || [];

  return (
    <div className="glass-panel p-5 space-y-3 border-slate-800/80 bg-slate-900/60 backdrop-blur-2xl">
      <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
        <Clock className="w-4 h-4 text-sky-400" />
        <span>Pronóstico Hora a Hora (Próximas 24 horas)</span>
      </div>

      <div className="flex items-center gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent snap-x">
        {times.map((t, idx) => {
          const hourLabel = idx === 0 ? 'Ahora' : t.split('T')[1]?.slice(0, 5) || t;
          const tempVal = Math.round(temps[idx] ?? 15);
          const pMm = precipMms[idx] || 0;
          const pProb = precips[idx] || (pMm > 0 ? Math.min(100, Math.round(pMm * 35)) : (humidities[idx] > 80 ? Math.round((humidities[idx] - 75) * 2) : 0));
          const codeVal = codes[idx];

          return (
            <div
              key={t + idx}
              className="flex-shrink-0 snap-start w-20 bg-slate-950/50 border border-slate-800/80 hover:border-sky-500/40 p-3 rounded-2xl text-center space-y-2 transition duration-200 hover:scale-105"
            >
              <div className="text-xs font-semibold text-slate-300">{hourLabel}</div>
              <div className="flex justify-center my-1">
                {getWeatherIcon(codeVal, tempVal)}
              </div>
              <div className="text-base font-extrabold text-white font-mono">{tempVal}°</div>
              <div className="flex items-center justify-center gap-0.5 text-[10px] text-sky-400 font-bold">
                <Droplets className="w-3 h-3" />
                <span>{pProb}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
