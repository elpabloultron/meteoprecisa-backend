import React, { useState, useEffect } from 'react';
import { CloudSun, Search, Building2, Sprout, CheckCircle2, AlertTriangle, Radio } from 'lucide-react';

export default function Navbar({ modo, setModo, onSelectStation, apiBase }) {
  const [query, setQuery] = useState('');
  const [resultados, setResultados] = useState([]);
  const [buscando, setBuscando] = useState(false);
  const [mensajeEstado, setMensajeEstado] = useState(null);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResultados([]);
      setMensajeEstado(null);
      return;
    }

    setBuscando(true);
    setMensajeEstado({ tipo: 'info', texto: '🔎 Buscando en 609 estaciones...' });

    const timer = setTimeout(async () => {
      try {
        const resp = await fetch(`${apiBase}/api/v1/buscar-estaciones?q=${encodeURIComponent(query)}`);
        if (resp.ok) {
          const data = await resp.json();
          setResultados(data);
          if (data.length > 0) {
            setMensajeEstado({ tipo: 'exito', texto: `✓ ${data.length} estaciones encontradas` });
          } else {
            setMensajeEstado({ tipo: 'advertencia', texto: '⚠ Sin coincidencias directas' });
          }
        }
      } catch (err) {
        setMensajeEstado({ tipo: 'error', texto: '❌ Error de conexión' });
      } finally {
        setBuscando(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, apiBase]);

  return (
    <header className="sticky top-0 z-50 bg-slate-900 border-b border-slate-800 shadow-md px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* TITULAR Y MARCA */}
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-600 text-white font-bold shadow-md">
            <CloudSun className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight">
                MeteoPrecisa Chile
              </h1>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-500/20 text-blue-300 rounded border border-blue-500/30">
                v9.0 Motor Activo
              </span>
            </div>
            <p className="text-xs text-slate-400">Telemetría hiperlocal & Satélites para todo Chile</p>
          </div>
        </div>

        {/* BUSCADOR CON MENSAJE DE ESTADO INSPIRADO EN EL HTML MDO */}
        <div className="relative w-full md:w-96">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar comuna, ciudad o estación..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-700 bg-slate-950 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition duration-200"
            />
          </div>

          {/* MENSAJE DE ESTADO EN TIEMPO REAL */}
          {mensajeEstado && (
            <p className={`text-xs mt-1 font-semibold transition ${
              mensajeEstado.tipo === 'exito' ? 'text-emerald-400' :
              mensajeEstado.tipo === 'advertencia' ? 'text-amber-400' :
              mensajeEstado.tipo === 'error' ? 'text-red-400' : 'text-blue-400'
            }`}>
              {mensajeEstado.texto}
            </p>
          )}

          {/* DESPLEGABLE RESULTADOS */}
          {resultados.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-700 rounded-lg shadow-2xl max-h-60 overflow-y-auto z-50">
              {resultados.map((est) => (
                <button
                  key={est.id}
                  onClick={() => {
                    onSelectStation(est);
                    setQuery('');
                    setResultados([]);
                    setMensajeEstado(null);
                  }}
                  className="w-full text-left px-4 py-2.5 hover:bg-slate-800 border-b border-slate-800 last:border-0 transition flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-100">{est.nombre}</div>
                    <div className="text-slate-400 text-[11px]">{est.sector}</div>
                  </div>
                  <span className="px-2 py-0.5 bg-slate-800 text-blue-400 rounded text-[10px] font-semibold border border-slate-700">
                    {est.red}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* SELECTOR DE MODOS CON BOTONES PRIMARIOS HIGHLIGHTED */}
        <div className="flex items-center p-1 bg-slate-950 border border-slate-800 rounded-xl">
          <button
            type="button"
            onClick={() => setModo('urbano')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition duration-200 cursor-pointer ${
              modo === 'urbano'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Modo Urbano</span>
          </button>

          <button
            type="button"
            onClick={() => setModo('agricola')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition duration-200 cursor-pointer ${
              modo === 'agricola'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Sprout className="w-4 h-4" />
            <span>Modo Agrícola</span>
          </button>
        </div>

      </div>
    </header>
  );
}
