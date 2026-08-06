import React from 'react';
import { CloudSun, Map, Satellite, CalendarDays } from 'lucide-react';

export default function BottomNav({ activeTab, setActiveTab }) {
  const navItems = [
    { id: 'inicio', label: 'Inicio', icon: CloudSun },
    { id: 'mapa', label: 'Mapa', icon: Map },
    { id: 'satelite', label: 'Satélite', icon: Satellite },
    { id: 'pronostico', label: 'Pronóstico', icon: CalendarDays },
  ];

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 block md:hidden w-[95%] max-w-sm mb-safe">
      <div className="flex items-center justify-around h-16 bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl px-2 shadow-2xl">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-200 ${
                isActive
                  ? 'text-sky-400 font-bold scale-105'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div
                className={`p-1.5 rounded-full transition-all ${
                  isActive ? 'bg-sky-500/15 border border-sky-500/30' : ''
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
