import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Layers, Wind, CloudRain, Satellite, Sprout, Droplets, Radio } from 'lucide-react';
import WindParticlesLayer from './WindParticlesLayer';

const createIcon = (color = '#38bdf8', isSelected = false) => {
  const size = isSelected ? 18 : 12;
  const shadow = isSelected ? '0 0 16px #f59e0b' : `0 0 10px ${color}`;
  return L.divIcon({
    className: 'custom-station-pin',
    html: `<div style="background-color: ${color}; width: ${size}px; height: ${size}px; border-radius: 50%; border: 2px solid white; box-shadow: ${shadow};"></div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2]
  });
};

function ChangeView({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 9, { duration: 1.5 });
    }
  }, [center, map]);
  return null;
}

// INYECCIÓN DINÁMICA DE CAPAS EN LEAFLET CON Z-INDEX 500
function DynamicLayerOverlay({ capaActiva, capas }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    let activeLayer = null;

    if (capaActiva === 'radar' && capas.lluvia_radar_precipitaciones?.url_tile) {
      activeLayer = L.tileLayer(capas.lluvia_radar_precipitaciones.url_tile, {
        opacity: 0.85,
        zIndex: 500
      });
    } else if (capaActiva === 'gee_ndvi' && capas.gee_ndvi_vegetacion?.tile_url) {
      activeLayer = L.tileLayer(capas.gee_ndvi_vegetacion.tile_url, {
        opacity: 0.85,
        zIndex: 500
      });
    } else if (capaActiva === 'gee_soil' && capas.gee_humedad_suelo?.tile_url) {
      activeLayer = L.tileLayer(capas.gee_humedad_suelo.tile_url, {
        opacity: 0.85,
        zIndex: 500
      });
    }

    if (activeLayer) {
      activeLayer.addTo(map);
    }

    return () => {
      if (activeLayer && map.hasLayer(activeLayer)) {
        map.removeLayer(activeLayer);
      }
    };
  }, [capaActiva, capas, map]);

  return null;
}

export default function MapSection({ estacionSeleccionada, apiBase, onOpenSateliteModal, onSelectStation }) {
  const [capas, setCapas] = useState({});
  const [capaActiva, setCapaActiva] = useState('viento');
  const [estacionesList, setEstacionesList] = useState([]);

  const centerLat = estacionSeleccionada?.coordenadas?.latitud || -33.4450;
  const centerLon = estacionSeleccionada?.coordenadas?.longitud || -70.6830;

  // Cargar lista de capas desde backend
  useEffect(() => {
    fetch(`${apiBase}/api/v1/capas-mapa`)
      .then(res => res.json())
      .then(data => {
        if (data.capas) setCapas(data.capas);
      })
      .catch(err => console.error("Error cargando capas mapa:", err));
  }, [apiBase]);

  // Cargar las 609 estaciones físicas de Chile
  useEffect(() => {
    fetch(`${apiBase}/api/v1/buscar-estaciones?limite=650`)
      .then(res => res.json())
      .then(data => setEstacionesList(data))
      .catch(err => console.error("Error buscando estaciones mapa:", err));
  }, [apiBase]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
      
      {/* CABECERA CON CONTROLES DE CAPAS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-500/20 text-blue-400 rounded-xl border border-blue-500/30">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              Visor Interactivo sobre Imagen Satelital de Chile
            </h3>
            <p className="text-xs text-slate-400">
              Basemap Esri World Imagery con capas superpuestas y los 609 pines de estaciones siempre activos
            </p>
          </div>
        </div>

        {/* BOTONERA DE CAPAS */}
        <div className="flex flex-wrap items-center gap-2">
          
          <button
            type="button"
            onClick={() => setCapaActiva('viento')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition duration-200 cursor-pointer ${
              capaActiva === 'viento'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 ring-2 ring-blue-400'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
            }`}
          >
            <Wind className="w-4 h-4 text-sky-300" />
            <span>Viento Animado</span>
          </button>

          <button
            type="button"
            onClick={() => setCapaActiva('estaciones')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition duration-200 cursor-pointer ${
              capaActiva === 'estaciones'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-500/30 ring-2 ring-amber-400'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
            }`}
          >
            <Radio className="w-4 h-4 text-amber-300" />
            <span>609 Estaciones</span>
          </button>

          <button
            type="button"
            onClick={() => setCapaActiva('radar')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition duration-200 cursor-pointer ${
              capaActiva === 'radar'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 ring-2 ring-emerald-400'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
            }`}
          >
            <CloudRain className="w-4 h-4 text-emerald-300" />
            <span>Radar Lluvia</span>
          </button>

          <button
            type="button"
            onClick={() => setCapaActiva('gee_ndvi')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition duration-200 cursor-pointer ${
              capaActiva === 'gee_ndvi'
                ? 'bg-teal-600 text-white shadow-lg shadow-teal-500/30 ring-2 ring-teal-400'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
            }`}
          >
            <Sprout className="w-4 h-4 text-teal-300" />
            <span>NDVI Cultivos GEE</span>
          </button>

          <button
            type="button"
            onClick={() => setCapaActiva('gee_soil')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition duration-200 cursor-pointer ${
              capaActiva === 'gee_soil'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30 ring-2 ring-indigo-400'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
            }`}
          >
            <Droplets className="w-4 h-4 text-indigo-300" />
            <span>Humedad Suelo GEE</span>
          </button>

          <button
            type="button"
            onClick={onOpenSateliteModal}
            className="px-3.5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30 flex items-center gap-2 hover:opacity-90 transition cursor-pointer"
          >
            <Satellite className="w-4 h-4 text-purple-200" />
            <span>GOES-19 Animado (24H)</span>
          </button>

        </div>
      </div>

      {/* MAPA LEAFLET CON BASEMAP SATELITAL DE ALTA RESOLUCIÓN */}
      <div className="h-[520px] w-full rounded-xl overflow-hidden border border-slate-800 relative z-0">
        <MapContainer
          center={[centerLat, centerLon]}
          zoom={8}
          scrollWheelZoom={false}
          dragging={!L.Browser.mobile}
          touchZoom={true}
          className="h-full w-full"
        >

          <ChangeView center={[centerLat, centerLon]} />

          {/* BASEMAP SATELITAL ESRI WORLD IMAGERY (OPCIÓN A) */}
          <TileLayer
            key="base-satellite-esri"
            attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          />

          {/* ETIQUETAS Y LÍMITES POLÍTICOS TRANSPARENTES SOBRE EL SATÉLITE */}
          <TileLayer
            key="base-satellite-labels"
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png"
            opacity={0.8}
            zIndex={400}
          />

          {/* CAPAS DINÁMICAS SUPERPUESTAS */}
          <DynamicLayerOverlay capaActiva={capaActiva} capas={capas} />

          {/* PARTÍCULAS DE VIENTO ANIMADAS */}
          <WindParticlesLayer active={capaActiva === 'viento'} />

          {/* PINES DE LAS 609 ESTACIONES SIEMPRE VISIBLES Y CLICABLES (OPCIÓN A) */}
          {estacionesList.map((est) => {
            const isSelected = est.id === estacionSeleccionada?.id;
            return (
              <Marker
                key={est.id}
                position={[est.lat, est.lon]}
                icon={createIcon(isSelected ? '#f59e0b' : '#38bdf8', isSelected)}
                eventHandlers={{
                  click: () => {
                    if (onSelectStation) onSelectStation(est);
                  }
                }}
              >
                <Popup>
                  <div className="space-y-1.5 text-slate-800 p-1 font-sans">
                    <div className="font-bold text-xs">{est.nombre}</div>
                    <div className="text-[11px] text-blue-600 font-semibold">{est.sector}</div>
                    <div className="text-[10px] text-slate-500">Red: {est.red}</div>
                    <button
                      onClick={() => onSelectStation && onSelectStation(est)}
                      className="mt-1 w-full bg-blue-600 text-white font-bold text-[10px] py-1 px-2 rounded hover:bg-blue-700 transition"
                    >
                      Ver Telemetría en Vivo
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}

        </MapContainer>
      </div>

    </div>
  );
}
