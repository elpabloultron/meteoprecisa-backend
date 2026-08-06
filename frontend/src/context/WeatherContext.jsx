import React, { createContext, useState, useEffect } from 'react';

export const WeatherContext = createContext();

const API_BASE = import.meta.env.VITE_API_URL || '';

export function WeatherProvider({ children }) {
  const [modo, setModo] = useState('urbano');
  const [coords, setCoords] = useState({ lat: -33.4450, lon: -70.6830 });
  const [climaData, setClimaData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [gpsFallbackOpen, setGpsFallbackOpen] = useState(false);

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

  const handleSelectStation = (est) => {
    if (est.lat && est.lon) {
      setCoords({ lat: est.lat, lon: est.lon });
    }
  };

  return (
    <WeatherContext.Provider value={{
      modo, setModo,
      coords, setCoords,
      climaData, setClimaData,
      loading, setLoading,
      gpsFallbackOpen, setGpsFallbackOpen,
      handleSelectStation,
      API_BASE
    }}>
      {children}
    </WeatherContext.Provider>
  );
}
