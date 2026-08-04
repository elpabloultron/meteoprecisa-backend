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
    <div className="fixed bottom-0 left-0 right-0 z-50 block md:hidden bg-slate-950/90 backdrop-blur-xl border-t border-slate-800/80 mb-safe shadow-2xl">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto px-2">
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
