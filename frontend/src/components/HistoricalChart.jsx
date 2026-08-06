import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { Activity } from 'lucide-react';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function HistoricalChart({ lat, lon, apiBase }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!lat || !lon) return;

    let isMounted = true;
    setLoading(true);

    fetch(`${apiBase}/api/v1/weather/historico?lat=${lat}&lon=${lon}`)
      .then(res => res.json())
      .then(result => {
        if (isMounted) {
          if (result.historico_ndvi_12_meses) {
            setData(result.historico_ndvi_12_meses);
          } else {
            setError("No se encontraron datos históricos.");
          }
        }
      })
      .catch(err => {
        if (isMounted) setError("Error al conectar con Earth Engine.");
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => { isMounted = false; };
  }, [lat, lon, apiBase]);

  const chartData = {
    labels: data.map(d => d.fecha.substring(0, 7)), // YYYY-MM
    datasets: [
      {
        label: 'Índice de Vigor Vegetativo (NDVI)',
        data: data.map(d => d.ndvi),
        borderColor: '#22c55e', // text-green-500
        backgroundColor: 'rgba(34, 197, 94, 0.2)', // green-500 with opacity
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#fff',
        pointBorderColor: '#22c55e',
        pointRadius: 4,
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#fff',
        bodyColor: '#e2e8f0',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1
      },
    },
    scales: {
      y: {
        min: 0,
        max: 1,
        grid: {
          color: 'rgba(255, 255, 255, 0.05)',
        },
        ticks: {
          color: '#94a3b8'
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#94a3b8',
          maxRotation: 45,
          minRotation: 45
        }
      }
    }
  };

  return (
    <div className="bg-slate-900/40 backdrop-blur-md border border-slate-700/50 rounded-3xl p-6 mt-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-green-500/20 p-3 rounded-full">
          <Activity className="w-6 h-6 text-green-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Evolución Histórica NDVI</h3>
          <p className="text-sm text-slate-400">Salud Vegetal de los últimos 12 meses (Satélite Terra MODIS)</p>
        </div>
      </div>

      <div className="h-[250px] w-full relative">
        {loading ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center space-y-3 bg-slate-900/50 rounded-xl backdrop-blur-sm z-10">
            <div className="w-10 h-10 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-green-400 text-sm font-medium animate-pulse">Sintetizando colección satelital...</span>
          </div>
        ) : error ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-red-400 text-sm">{error}</span>
          </div>
        ) : data.length === 0 ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-slate-400 text-sm">Sin datos para esta ubicación.</span>
          </div>
        ) : (
          <Line data={chartData} options={options} />
        )}
      </div>
    </div>
  );
}
