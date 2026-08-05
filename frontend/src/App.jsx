import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import WeatherHeader from './components/WeatherHeader';
import HourlyCarousel from './components/HourlyCarousel';
import UrbanPanel from './components/UrbanPanel';
import AgroPanel from './components/AgroPanel';
import MapSection from './components/MapSection';
import DailyForecastCards from './components/DailyForecastCards';
import ForecastChart from './components/ForecastChart';
import ComparisonTable from './components/ComparisonTable';
import SatelliteModal from './components/SatelliteModal';
import BottomNav from './components/BottomNav';
import DetailDrawer from './components/DetailDrawer';
import AqiDrawer from './components/AqiDrawer';
import HourlyForecastDrawer from './components/HourlyForecastDrawer';
import EstacionesCercanasModal from './components/EstacionesCercanasModal';
import LocationFallbackModal from './components/LocationFallbackModal';

const API_BASE = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:8000'
  : '';

export default function App() {
  const [modo, setModo] = useState('urbano');
  const [coords, setCoords] = useState({ lat: -33.4450, lon: -70.6830 });
  const [climaData, setClimaData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sateliteModalOpen, setSateliteModalOpen] = useState(false);
  const [cercanasModalOpen, setCercanasModalOpen] = useState(false);
  const [gpsFallbackOpen, setGpsFallbackOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('inicio');

  // Estado para el DetailDrawer de métricas y auditoría
  const [selectedMetric, setSelectedMetric] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  
  // Estado para Calidad del Aire (AQI)
  const [selectedAqiData, setSelectedAqiData] = useState(null);
  const [aqiDrawerOpen, setAqiDrawerOpen] = useState(false);

  // Estado para Pronóstico Horario
  const [selectedDayHourly, setSelectedDayHourly] = useState(null);
  const [hourlyDrawerOpen, setHourlyDrawerOpen] = useState(false);

  const mapRef = useRef(null);
  const forecastRef = useRef(null);

  // Obtener geolocalización GPS del usuario al iniciar
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({ lat: pos.coords.latitude, lon: pos.coords.longitude });
        },
        (err) => {
          console.log("Geolocalización predeterminada (Santiago):", err);
          setGpsFallbackOpen(true);
        },
        { timeout: 8000, enableHighAccuracy: true }
      );
    } else {
      setGpsFallbackOpen(true);
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

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (tabId === 'inicio') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (tabId === 'mapa') {
      if (mapRef.current) {
        mapRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (tabId === 'satelite') {
      setSateliteModalOpen(true);
    } else if (tabId === 'pronostico') {
      if (forecastRef.current) {
        forecastRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleSelectStation = (est) => {
    if (est.lat && est.lon) {
      setCoords({ lat: est.lat, lon: est.lon });
    }
  };

  const handleSelectMetric = (metricInfo) => {
    setSelectedMetric(metricInfo);
    setDrawerOpen(true);
  };

  const handleOpenAqi = (aqiData) => {
    setSelectedAqiData(aqiData);
    setAqiDrawerOpen(true);
  };

  const handleOpenHourly = (dayHourlyData) => {
    setSelectedDayHourly(dayHourlyData);
    setHourlyDrawerOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col font-sans selection:bg-sky-500 selection:text-slate-950">
      
      {/* NAVBAR NAVEGACIÓN PRINCIPAL */}
      <Navbar
        modo={modo}
        setModo={setModo}
        onSelectStation={handleSelectStation}
        apiBase={API_BASE}
      />

      {/* CONTENIDO PRINCIPAL COMPLETO CON SAFE AREA FOOTER PADDING */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6 pb-24 md:pb-8">
        
        {loading ? (
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-12 text-center space-y-4 my-12 shadow-2xl backdrop-blur-xl">
            <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <div className="text-base font-bold text-white">Sincronizando telemetría en vivo para Chile...</div>
            <p className="text-xs text-slate-400">Consultando 609 estaciones físicas DMC, Agromet INIA, RedMeteo y Google Earth Engine</p>
          </div>
        ) : (
          <>
            {/* CABECERA HERO ESTILO APPLE WEATHER */}
            <WeatherHeader
              climaData={climaData}
              onOpenEstacionesCercanas={() => setCercanasModalOpen(true)}
            />

            {/* SLIDER HORA A HORA (PRÓXIMAS 24 HORAS CON % REAL) */}
            <HourlyCarousel hourlyForecast={climaData?.pronostico_numerico_openmeteo?.horario} />

            {/* PANEL MODO URBANO & MODO AGRÍCOLA CON CARDS INTERACTIVAS */}
            {modo === 'urbano' ? (
              <UrbanPanel
                urbano={climaData?.modo_urbano}
                onSelectMetric={handleSelectMetric}
                stationInfo={climaData?.estacion}
                onOpenAqi={handleOpenAqi}
              />
            ) : (
              <AgroPanel
                agricola={climaData?.modo_agricola}
                onSelectMetric={handleSelectMetric}
                stationInfo={climaData?.estacion}
              />
            )}

            {/* SECCIÓN MAPA INTERACTIVO CON EMBED WINDY OFICIAL */}
            <div ref={mapRef}>
              <MapSection
                estacionSeleccionada={climaData?.estacion}
                apiBase={API_BASE}
                onOpenSateliteModal={() => setSateliteModalOpen(true)}
                onSelectStation={handleSelectStation}
              />
            </div>

            {/* SECCIÓN PRONÓSTICO Y GRÁFICO 48H */}
            <div ref={forecastRef} className="space-y-6">
              <DailyForecastCards
                dailyForecast={climaData?.pronostico_numerico_openmeteo?.diario_7dias}
                hourlyForecast={climaData?.pronostico_numerico_openmeteo?.horario}
                onSelectMetric={handleSelectMetric}
                onOpenHourly={handleOpenHourly}
              />

              <ComparisonTable
                estacionActual={climaData?.estacion}
                apiBase={API_BASE}
              />

              <ForecastChart
                dmcForecast={climaData?.pronostico_oficial_dmc}
                openMeteoForecast={climaData?.pronostico_numerico_openmeteo}
                onSelectMetric={handleSelectMetric}
              />
            </div>
          </>
        )}

      </main>

      {/* PIE DE PÁGINA */}
      <footer className="border-t border-slate-800/80 py-6 text-center text-xs text-slate-500 bg-slate-950 pb-20 md:pb-6">
        <p>MeteoPrecisa Chile v10.2 • Plataforma de Telemetría Hiperlocal & Google Earth Engine</p>
      </footer>

      {/* REPRODUCTOR SATELITAL BUCLE WEBP GOES-19 */}
      <SatelliteModal
        isOpen={sateliteModalOpen}
        onClose={() => {
          setSateliteModalOpen(false);
          setActiveTab('inicio');
        }}
        apiBase={API_BASE}
      />

      {/* MODAL 5 ESTACIONES MÁS CERCANAS */}
      <EstacionesCercanasModal
        isOpen={cercanasModalOpen}
        onClose={() => setCercanasModalOpen(false)}
        onSelectStation={handleSelectStation}
        apiBase={API_BASE}
      />

      {/* DRAWER DESPLEGABLE DE MÉTRICAS Y AUDITORÍA DE FUENTE */}
      <DetailDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        detailData={selectedMetric}
      />

      {/* DRAWER DESPLEGABLE CALIDAD DEL AIRE */}
      <AqiDrawer
        isOpen={aqiDrawerOpen}
        onClose={() => setAqiDrawerOpen(false)}
        data={selectedAqiData}
      />

      {/* DRAWER DESPLEGABLE PRONÓSTICO HORARIO */}
      <HourlyForecastDrawer
        isOpen={hourlyDrawerOpen}
        onClose={() => setHourlyDrawerOpen(false)}
        dayData={selectedDayHourly}
      />

      {/* FALLBACK DE UBICACIÓN */}
      <LocationFallbackModal
        isOpen={gpsFallbackOpen}
        onClose={() => setGpsFallbackOpen(false)}
        onSelect={(lat, lon) => setCoords({ lat, lon })}
      />

      {/* NAVEGACIÓN INFERIOR TÁCTIL (BOTTOM NAV BAR MÓVIL) */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={handleTabChange}
      />

    </div>
  );
}
