import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import WeatherHeader from './components/WeatherHeader';
import UrbanPanel from './components/UrbanPanel';
import AgroPanel from './components/AgroPanel';
import MapSection from './components/MapSection';
import DailyForecastCards from './components/DailyForecastCards';
import ForecastChart from './components/ForecastChart';
import ComparisonTable from './components/ComparisonTable';
import SatelliteModal from './components/SatelliteModal';

const API_BASE = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:8000'
  : '';


export default function App() {
  const [modo, setModo] = useState('urbano');
  const [coords, setCoords] = useState({ lat: -33.4450, lon: -70.6830 });
  const [climaData, setClimaData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sateliteModalOpen, setSateliteModalOpen] = useState(false);

  // Obtener geolocalización GPS del usuario al iniciar
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        },
        (err) => console.log("Geolocalización predeterminada (Santiago):", err)
      );
    }
  }, []);

  // Consultar clima hiperlocal en vivo
  useEffect(() => {
    setLoading(true);
    fetch(`${API_BASE}/api/v1/clima-hiperlocal?lat=${coords.lat}&lon=${coords.lon}`)
      .then((res) => res.json())
      .then((data) => {
        setClimaData(data);
      })
      .catch((err) => console.error("Error consultando clima:", err))
      .finally(() => setLoading(false));
  }, [coords]);

  const handleSelectStation = (est) => {
    if (est.lat && est.lon) {
      setCoords({ lat: est.lat, lon: est.lon });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-500 selection:text-slate-950">
      
      {/* NAVBAR NAVEGACIÓN PRINCIPAL CON ESTADO TIPO MDO */}
      <Navbar
        modo={modo}
        setModo={setModo}
        onSelectStation={handleSelectStation}
        apiBase={API_BASE}
      />

      {/* CONTENIDO PRINCIPAL COMPLETO */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">
        
        {loading ? (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center space-y-4 my-12 shadow-xl">
            <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <div className="text-base font-bold text-white">Sincronizando telemetría en vivo para Chile...</div>
            <p className="text-xs text-slate-400">Consultando 609 estaciones físicas DMC, Agromet INIA, RedMeteo y Google Earth Engine</p>
          </div>
        ) : (
          <>
            {/* CABECERA DE CLIMA E INDICADORES DE ESTACIÓN & ALERTAS SENAPRED */}
            <WeatherHeader climaData={climaData} />

            {/* PANEL MODO URBANO & MODO AGRÍCOLA (RESTAURADOS AL 100%) */}
            {modo === 'urbano' ? (
              <UrbanPanel urbano={climaData?.modo_urbano} />
            ) : (
              <AgroPanel agricola={climaData?.modo_agricola} />
            )}

            {/* TARJETAS DEL PRONÓSTICO A 7 DÍAS */}
            <DailyForecastCards
              dailyForecast={climaData?.pronostico_numerico_openmeteo?.diario_7dias}
            />

            {/* VISOR INTERACTIVO SOBRE FOTO SATELITAL REAL ESRI WORLD IMAGERY */}
            <MapSection
              estacionSeleccionada={climaData?.estacion}
              apiBase={API_BASE}
              onOpenSateliteModal={() => setSateliteModalOpen(true)}
              onSelectStation={handleSelectStation}
            />

            {/* TABLA COMPARATIVA MULTIRED (DMC VS AGROMET VS REDMETEO) */}
            <ComparisonTable
              estacionActual={climaData?.estacion}
              apiBase={API_BASE}
            />

            {/* PRONÓSTICO BOLETÍN DMC & CURVA HORA A HORA 48 HORAS */}
            <ForecastChart
              dmcForecast={climaData?.pronostico_oficial_dmc}
              openMeteoForecast={climaData?.pronostico_numerico_openmeteo}
            />
          </>
        )}

      </main>

      {/* PIE DE PÁGINA */}
      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500 bg-slate-950">
        <p>MeteoPrecisa Chile © 2026 — Plataforma Open Source de Meteorología & Agrometeorología Nacional</p>
      </footer>

      {/* REPRODUCTOR SATELITAL FLUIDO GOES-19 */}
      <SatelliteModal
        isOpen={sateliteModalOpen}
        onClose={() => setSateliteModalOpen(false)}
        apiBase={API_BASE}
      />

    </div>
  );
}
