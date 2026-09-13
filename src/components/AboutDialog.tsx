import { X, CheckCircle2, Shield, Wifi, Flame, Sparkles } from 'lucide-react';

interface AboutDialogProps {
  onClose: () => void;
}

export function AboutDialog({ onClose }: AboutDialogProps) {
  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-sm w-full p-6 space-y-5 shadow-2xl relative text-center">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Launcher Icon Display */}
        <div className="flex flex-col items-center">
          <div className="w-24 h-24 rounded-3xl overflow-hidden shadow-2xl ring-4 ring-teal-500/40 p-0.5 bg-slate-950 mx-auto transform transition-transform hover:scale-105">
            <img
              src="/launcher-icon.png"
              alt="MD LAN Scanner Android Launcher Icon"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover rounded-[22px]"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/src/assets/images/lan_scanner_icon_1789163820136.jpg';
              }}
            />
          </div>

          <h2 className="text-lg font-extrabold text-white mt-3">MD LAN Scanner</h2>
          <p className="text-xs text-teal-400 font-mono font-semibold">
            Version 2.4.0 (Material Design 3)
          </p>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          High-performance Android Wi-Fi subnet discovery utility built to instantly detect local Apache & XAMPP development servers, explore htdocs projects, and launch in WebView.
        </p>

        <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 text-left text-xs space-y-2">
          <div className="flex items-center gap-2 text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-teal-400 flex-shrink-0" />
            <span>Wi-Fi Subnet Scanner (/24, /16, /8)</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <Flame className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>XAMPP Apache & phpMyAdmin Auto-Detection</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-teal-400 flex-shrink-0" />
            <span>In-App Android WebView Browser</span>
          </div>
          <div className="flex items-center gap-2 text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-teal-400 flex-shrink-0" />
            <span>Starred Projects & Persistence</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-teal-500/20 transition-colors cursor-pointer"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
