import React, { useState, useEffect, useRef } from 'react';
import { X, Play, Pause, RotateCcw, FastForward, Satellite, Clock } from 'lucide-react';

export default function SatelliteModal({ isOpen, onClose, apiBase }) {
  const [frames, setFrames] = useState([]);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [fps, setFps] = useState(10);
  const [loading, setLoading] = useState(true);
  const [imagesLoaded, setImagesLoaded] = useState(0);

  const timerRef = useRef(null);

  // Cargar fotogramas al abrir el modal y precargar en memoria
  useEffect(() => {
    if (!isOpen) return;

    setLoading(true);
    setImagesLoaded(0);

    fetch(`${apiBase}/api/v1/satelite-goes19?resolucion=1800x1080&ventana_horas=24`)
      .then((res) => res.json())
      .then((data) => {
        if (data.frames && data.frames.length > 0) {
          setFrames(data.frames);
          setCurrentFrame(0);

          // Precargar todas las imágenes en el caché del navegador para animación fluida
          let loadedCount = 0;
          data.frames.forEach((src) => {
            const img = new Image();
            img.onload = () => {
              loadedCount++;
              setImagesLoaded(loadedCount);
            };
            img.onerror = () => {
              loadedCount++;
              setImagesLoaded(loadedCount);
            };
            img.src = src;
          });
        }
      })
      .catch((err) => console.error("Error cargando fotogramas satélite:", err))
      .finally(() => setLoading(false));
  }, [isOpen, apiBase]);

  // Bucle de animación continua
  useEffect(() => {
    if (!isPlaying || frames.length === 0) return;

    const intervalMs = Math.round(1000 / fps);
    timerRef.current = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % frames.length);
    }, intervalMs);

    return () => clearInterval(timerRef.current);
  }, [isPlaying, frames, fps]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-2xl">
      <div className="glass-panel w-full max-w-5xl overflow-hidden border border-purple-500/30 flex flex-col max-h-[90vh]">
        
        {/* CABECERA DEL REPRODUCTOR */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/20 text-purple-400 rounded-xl border border-purple-500/30">
              <Satellite className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-white">
                  Reproductor Satelital NOAA GOES-19 (24H Chile)
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-purple-500/20 text-purple-300 rounded-full border border-purple-500/30">
                  {frames.length} Fotogramas
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Secuencia temporal infrarroja GeoColor de las últimas 24 horas
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ÁREA DE IMAGEN SATELITAL */}
        <div className="flex-1 bg-black relative flex items-center justify-center min-h-[350px] overflow-hidden p-2">
          {loading ? (
            <div className="text-center space-y-3">
              <Satellite className="w-10 h-10 text-purple-400 animate-spin mx-auto" />
              <div className="text-sm font-semibold text-slate-300">Descargando fotogramas GOES-19...</div>
            </div>
          ) : frames.length > 0 ? (
            <div className="relative w-full h-full flex items-center justify-center">
              <img
                key={frames[currentFrame]}
                src={frames[currentFrame]}
                alt={`Fotograma Satelital GOES-19 ${currentFrame + 1}`}
                className="max-h-[60vh] w-auto object-contain transition-opacity duration-75"
              />
            </div>
          ) : (
            <div className="text-sm text-slate-400">No se pudieron cargar las imágenes satelitales.</div>
          )}

          {/* CONTADOR Y BARRA DE PRECARGA */}
          <div className="absolute top-4 right-4 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-white/10 text-xs font-mono text-purple-300 backdrop-blur-md flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-purple-400" />
            <span>Fotograma {currentFrame + 1} / {frames.length}</span>
            {imagesLoaded < frames.length && (
              <span className="text-[10px] text-slate-400 ml-1">
                (Precargando: {Math.round((imagesLoaded / (frames.length || 1)) * 100)}%)
              </span>
            )}
          </div>
        </div>

        {/* CONTROLES DE REPRODUCCIÓN */}
        <div className="p-4 bg-slate-900/90 border-t border-white/10 space-y-3">
          
          {/* BARRA DE TIEMPO / TIMELINE */}
          <input
            type="range"
            min={0}
            max={frames.length > 0 ? frames.length - 1 : 0}
            value={currentFrame}
            onChange={(e) => setCurrentFrame(Number(e.target.value))}
            className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
          />

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
            
            {/* BOTONES PLAY/PAUSA/REINICIO */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="p-3 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-2xl shadow-lg shadow-purple-500/30 transition flex items-center gap-2 text-xs"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                <span>{isPlaying ? 'Pausar' : 'Reproducir'}</span>
              </button>

              <button
                onClick={() => setCurrentFrame(0)}
                className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition"
                title="Reiniciar al fotograma 1"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* CONTROL DE VELOCIDAD FPS */}
            <div className="flex items-center gap-3 bg-slate-950/60 px-4 py-2 rounded-2xl border border-white/5 text-xs">
              <FastForward className="w-4 h-4 text-purple-400" />
              <span className="text-slate-400">Velocidad:</span>
              <button
                onClick={() => setFps(5)}
                className={`px-2.5 py-1 rounded-lg font-mono font-bold transition ${fps === 5 ? 'bg-purple-500 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              >
                0.5x (Lento)
              </button>
              <button
                onClick={() => setFps(10)}
                className={`px-2.5 py-1 rounded-lg font-mono font-bold transition ${fps === 10 ? 'bg-purple-500 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              >
                1.0x (Normal)
              </button>
              <button
                onClick={() => setFps(18)}
                className={`px-2.5 py-1 rounded-lg font-mono font-bold transition ${fps === 18 ? 'bg-purple-500 text-white' : 'text-slate-400 hover:text-slate-200'}`}
              >
                2.0x (Rápido)
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
