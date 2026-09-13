import { Radar, Star, Network, Info } from 'lucide-react';
import { AppTab } from '../types';

interface AndroidBottomNavProps {
  activeTab: AppTab;
  onChangeTab: (tab: AppTab) => void;
  favoritesCount: number;
}

export function AndroidBottomNav({
  activeTab,
  onChangeTab,
  favoritesCount,
}: AndroidBottomNavProps) {
  const tabs: { id: AppTab; label: string; icon: typeof Radar; badge?: number }[] = [
    { id: 'scanner', label: 'Scanner', icon: Radar },
    { id: 'favorites', label: 'Favorites', icon: Star, badge: favoritesCount },
    { id: 'network', label: 'Subnet Tools', icon: Network },
    { id: 'about', label: 'App Info', icon: Info },
  ];

  return (
    <nav
      id="android-bottom-navigation"
      className="bg-slate-900/95 border-t border-slate-800/80 px-2 py-1.5 flex items-center justify-around sticky bottom-0 z-20 backdrop-blur-md"
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            id={`nav-tab-${tab.id}`}
            onClick={() => onChangeTab(tab.id)}
            className="flex flex-col items-center justify-center flex-1 py-1 px-2 relative group cursor-pointer focus:outline-none"
          >
            {/* MD3 Active Indicator Pill */}
            <div
              className={`px-4 py-1 rounded-full transition-all duration-200 flex items-center justify-center relative ${
                isActive
                  ? 'bg-teal-500/20 text-teal-300 ring-1 ring-teal-500/40'
                  : 'text-slate-400 group-hover:text-slate-200'
              }`}
            >
              <Icon className="w-5 h-5" />
              {Boolean(tab.badge && tab.badge > 0) && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-slate-950 text-[10px] font-bold px-1.5 min-w-4 h-4 rounded-full flex items-center justify-center shadow">
                  {tab.badge}
                </span>
              )}
            </div>
            <span
              className={`text-[11px] mt-1 font-medium transition-colors ${
                isActive ? 'text-teal-300 font-semibold' : 'text-slate-400'
              }`}
            >
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
