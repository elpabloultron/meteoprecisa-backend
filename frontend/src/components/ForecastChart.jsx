import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Calendar, FileText, CloudRain, Sun } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function ForecastChart({ dmcForecast, openMeteoForecast }) {
  const daily = openMeteoForecast?.diario_7dias || {};
  const hourly = openMeteoForecast?.horario || {};

  const timeLabels = (hourly.time || []).slice(0, 48).map((t) => {
    const date = new Date(t);
    return `${date.getHours()}:00`;
  });

  const temps = (hourly.temperature_2m || []).slice(0, 48);
  const precips = (hourly.precipitation || []).slice(0, 48);

  const chartData = {
    labels: timeLabels,
    datasets: [
      {
        type: 'line',
        label: 'Temperatura (°C)',
        data: temps,
        borderColor: '#38bdf8',
        backgroundColor: 'rgba(56, 189, 248, 0.15)',
        fill: true,
        tension: 0.4,
        pointRadius: 2,
        yAxisID: 'y'
      },
      {
        type: 'line',
        label: 'Precipitación (mm)',
        data: precips,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16, 185, 129, 0.4)',
        fill: true,
        tension: 0.2,
        pointRadius: 2,
        yAxisID: 'y1'
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#94a3b8', font: { family: 'Outfit', size: 12 } }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#f8fafc',
        bodyColor: '#38bdf8'
      }
    },
    scales: {
      x: {
        ticks: { color: '#64748b', maxTicksLimit: 12 },
        grid: { color: 'rgba(255, 255, 255, 0.05)' }
      },
      y: {
        type: 'linear',
        position: 'left',
        ticks: { color: '#38bdf8' },
        grid: { color: 'rgba(255, 255, 255, 0.05)' },
        title: { display: true, text: 'Temperatura (°C)', color: '#38bdf8' }
      },
      y1: {
        type: 'linear',
        position: 'right',
        ticks: { color: '#10b981' },
        grid: { drawOnChartArea: false },
        title: { display: true, text: 'Lluvia (mm)', color: '#10b981' }
      }
    }
  };

  return (
    <div className="space-y-6">
      
      {/* BOLETÍN NARRATIVO OFICIAL DMC */}
      {dmcForecast && dmcForecast.resumen_nacional && (
        <div className="glass-panel p-5 space-y-3 border-sky-500/30">
          <div className="flex items-center gap-2 text-sky-400 font-bold text-sm">
            <FileText className="w-5 h-5" />
            <span>Boletín Oficial Dirección Meteorológica de Chile (DMC)</span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed bg-slate-900/60 p-4 rounded-xl border border-white/5">
            {dmcForecast.resumen_nacional}
          </p>
        </div>
      )}

      {/* GRÁFICO INTERACTIVO HORA A HORA (48 HORAS) */}
      <div className="glass-panel p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-sky-400" />
            <h3 className="text-base font-extrabold text-white">
              Curva de Pronóstico Numérico Hora a Hora
            </h3>
          </div>
          <span className="text-xs text-slate-400">Próximas 48 horas</span>
        </div>

        <div className="h-72 w-full pt-2">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

    </div>
  );
}
