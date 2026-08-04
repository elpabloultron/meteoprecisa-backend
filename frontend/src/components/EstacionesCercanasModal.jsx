import React, { useState, useEffect } from 'react';
import { X, MapPin, Radio } from 'lucide-react';

export default function EstacionesCercanasModal({ isOpen, onClose, onSelectStation, apiBase }) {
  const [estaciones, setEstaciones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    fetch(`${apiBase}/api/v1/buscar-estaciones?limite=6`)
      .then((res) => res.json())
      .then((data) => {
        setEstaciones(data.slice(0, 5));
      })
      .catch((err) => console.error("Error buscando estaciones cercanas:", err))
      .finally(() => setLoading(false));
  }, [isOpen, apiBase]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-2xl">
      <div className="glass-panel w-full max-w-lg overflow-hidden border border-sky-500/30 p-6 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-sky-400" />
            <h3 className="text-lg font-extrabold text-white">
              5 Estaciones Más Cercanas
            </h3>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800">
            <X className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="text-center text-xs text-slate-400 py-6">Calculando distancia a estaciones cercanas...</div>
        ) : (
          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {estaciones.map((est) => (
              <div
                key={est.id}
                onClick={() => {
                  onSelectStation(est);
                  onClose();
                }}
                className="p-3.5 bg-slate-900 hover:bg-slate-800/90 border border-slate-800 hover:border-sky-500/40 rounded-2xl flex items-center justify-between cursor-pointer transition"
              >
                <div>
                  <div className="font-bold text-white text-xs flex items-center gap-1.5">
                    <span>{est.nombre}</span>
                  </div>
                  <div className="text-[11px] text-slate-400">{est.sector}</div>
                </div>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-sky-500/20 text-sky-300 text-[10px] font-bold rounded-full border border-sky-500/30">
                  <Radio className="w-3 h-3 text-sky-400" />
                  {est.red}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
