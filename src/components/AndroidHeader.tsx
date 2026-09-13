import { RefreshCw, Info, Smartphone, Monitor, Globe } from 'lucide-react';
import { AppTab } from '../types';

interface AndroidHeaderProps {
  activeTab: AppTab;
  isScanning: boolean;
  onScanToggle: () => void;
  onOpenAbout: () => void;
  onOpenManualEntry: () => void;
  isPhoneFrame: boolean;
  onTogglePhoneFrame: () => void;
  foundCount: number;
  xamppCount: number;
}

export function AndroidHeader({
  activeTab,
  isScanning,
  onScanToggle,
  onOpenAbout,
  onOpenManualEntry,
  isPhoneFrame,
  onTogglePhoneFrame,
  foundCount,
  xamppCount,
}: AndroidHeaderProps) {
  return (
    <header
      id="android-top-bar"
      className="bg-slate-900/95 border-b border-slate-800/80 px-4 py-3 flex items-center justify-between sticky top-0 z-20 shadow-lg backdrop-blur-md"
    >
      <div className="flex items-center gap-3">
        {/* Launcher Icon supplied PNG */}
        <button
          id="launcher-icon-btn"
          onClick={onOpenAbout}
          title="App Info & Launcher Icon"
          className="relative group flex-shrink-0 cursor-pointer focus:outline-none"
        >
          <div className="w-10 h-10 rounded-2xl overflow-hidden shadow-md ring-2 ring-teal-500/40 group-hover:ring-teal-400 transition-all transform group-hover:scale-105 bg-slate-950 flex items-center justify-center">
            <img
              src="/launcher-icon.png"
              alt="MD LAN Scanner Launcher Icon"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              onError={(e) => {
                // Fallback to internal image if needed
                (e.target as HTMLImageElement).src = '/src/assets/images/lan_scanner_icon_1789163820136.jpg';
              }}
            />
          </div>
          {isScanning && (
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-teal-400 rounded-full animate-ping" />
          )}
        </button>

        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
              MD LAN Scanner
            </h1>
            <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-teal-500/20 text-teal-300 border border-teal-500/30">
              Android MD3
            </span>
          </div>
          <p className="text-xs text-slate-400 flex items-center gap-2">
            <span>{foundCount} devices</span>
            <span className="text-slate-600">•</span>
            <span className="text-amber-400 font-medium">{xamppCount} XAMPP Apache</span>
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        {/* Direct URL / Local Server Manual Entry Action */}
        <button
          id="btn-header-manual-url"
          onClick={onOpenManualEntry}
          title="Manual Entry of URL or Local Server Address"
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700/80 transition-all cursor-pointer"
        >
          <Globe className="w-3.5 h-3.5 text-teal-400" />
          <span className="hidden xs:inline">Direct URL</span>
        </button>

        {/* Toggle between Phone Mockup and Full-Width */}
        <button
          id="btn-toggle-frame"
          onClick={onTogglePhoneFrame}
          title={isPhoneFrame ? 'Switch to Full Screen' : 'Switch to Android Phone Frame'}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
        >
          {isPhoneFrame ? <Monitor className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
        </button>

        {/* Scan Trigger */}
        <button
          id="btn-quick-scan-toggle"
          onClick={onScanToggle}
          title={isScanning ? 'Stop Scan' : 'Run LAN Scan'}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-all ${
            isScanning
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
              : 'bg-teal-500 text-slate-950 font-semibold shadow-md shadow-teal-500/20 hover:bg-teal-400'
          }`}
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
          <span className="hidden xs:inline">{isScanning ? 'Scanning...' : 'Scan Wi-Fi'}</span>
        </button>

        {/* Info / About Modal */}
        <button
          id="btn-open-about"
          onClick={onOpenAbout}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          title="About MD LAN Scanner"
        >
          <Info className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
