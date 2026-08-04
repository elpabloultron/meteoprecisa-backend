import React from 'react';
import { Wind, Thermometer, Droplets, Sun, Activity, ShieldCheck, AlertTriangle } from 'lucide-react';

export default function UrbanPanel({ urbano }) {
  if (!urbano) return null;

  const {
    temperatura_c,
    sensacion_termica_c,
    humedad_relativa_porcentaje,
    viento_velocidad_kmh,
    viento_direccion,
    presion_hpa,
    indice_uv,
    calidad_aire_sinca
  } = urbano;

  const sincaNom = calidad_aire_sinca?.norma_chilena || calidad_aire_sinca?.norma_chilena_mma?.categoria || 'Bueno';
  const aqiVal = calidad_aire_sinca?.aqi_us || calidad_aire_sinca?.tabla_internacional_aqi?.aqi_indice || 25;
  const mp25Val = calidad_aire_sinca?.mp25_ugm3 || calidad_aire_sinca?.mediciones_base?.mp25_ug_m3 || 12.0;


  // Determinar mensaje de estado inspirado en el panel MDO
  let statusBg = 'bg-emerald-950/50 border-emerald-500/40 text-emerald-200';
  let statusIcon = <ShieldCheck className="w-5 h-5 text-emerald-400" />;
  let statusText = `✓ Calidad del Aire Excelente (MP2.5: ${mp25Val} µg/m³ - Norma Cumplida)`;

  if (sincaNom.includes('Alerta') || aqiVal > 100) {
    statusBg = 'bg-amber-950/50 border-amber-500/40 text-amber-200';
    statusIcon = <AlertTriangle className="w-5 h-5 text-amber-400" />;
    statusText = `⚠ Alerta Ambiental por MP2.5 (${mp25Val} µg/m³ - Restricción de Humos Visible)`;
  } else if (sincaNom.includes('Preemergencia') || sincaNom.includes('Emergencia') || aqiVal > 150) {
    statusBg = 'bg-red-950/50 border-red-500/40 text-red-200';
    statusIcon = <AlertTriangle className="w-5 h-5 text-red-400" />;
    statusText = `🔴 Emergencia / Preemergencia Ambiental (${mp25Val} µg/m³ - Prohibido Calefactores a Leña)`;
  }

  return (
    <div className="space-y-4">
      
      {/* PANEL DE RESULTADO / CAJA DE RESPUESTA DE CALIDAD DEL AIRE */}
      <div className={`p-4 rounded-xl border flex items-center gap-3 font-medium text-sm ${statusBg}`}>
        {statusIcon}
        <div>
          <div className="font-bold">{statusText}</div>
          <p className="text-xs opacity-80 mt-0.5">
            Estación de Monitoreo SINCA MMA • Red de Calidad del Aire Ministerio del Medio Ambiente
          </p>
        </div>
      </div>

      {/* GRILLA DE METRICAS URBANAS PRINCIPALES */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        
        {/* TEMPERATURA */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Temperatura</span>
            <Thermometer className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">{temperatura_c}°C</div>
          <p className="text-[11px] text-slate-400">Sensación: <span className="text-amber-300 font-bold">{sensacion_termica_c}°C</span></p>
        </div>

        {/* HUMEDAD RELATIVA */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Humedad</span>
            <Droplets className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">{humedad_relativa_porcentaje}%</div>
          <p className="text-[11px] text-slate-400">Humedad en superficie</p>
        </div>

        {/* VIENTO */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Viento</span>
            <Wind className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">{viento_velocidad_kmh} <span className="text-xs text-slate-400 font-normal">km/h</span></div>
          <p className="text-[11px] text-slate-400">Dirección: <span className="text-sky-300 font-bold">{viento_direccion}</span></p>
        </div>

        {/* ÍNDICE UV */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Índice UV</span>
            <Sun className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">{indice_uv}</div>
          <p className="text-[11px] text-slate-400">Radiación Solar Máxima</p>
        </div>

        {/* CALIDAD DEL AIRE SINCA */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Norma MMA</span>
            <Activity className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-lg font-extrabold text-emerald-400">{sincaNom}</div>
          <p className="text-[11px] text-slate-400">MP2.5: <span className="font-mono font-bold text-white">{mp25Val} µg/m³</span></p>
        </div>

        {/* PRESIÓN ATMOSFÉRICA */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-md space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Presión</span>
            <Activity className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-black text-white font-mono">{presion_hpa} <span className="text-xs text-slate-400 font-normal">hPa</span></div>
          <p className="text-[11px] text-slate-400">Nivel del mar</p>
        </div>

      </div>
    </div>
  );
}
