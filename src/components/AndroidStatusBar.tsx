import { useState, useEffect } from 'react';
import { Wifi, BatteryMedium, Signal } from 'lucide-react';

interface AndroidStatusBarProps {
  wifiSsid?: string;
}

export function AndroidStatusBar({ wifiSsid = 'Wi-Fi 5GHz' }: AndroidStatusBarProps) {
  const [time, setTime] = useState<string>('12:00');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      id="android-status-bar"
      className="w-full h-8 bg-slate-950/90 backdrop-blur-md px-4 flex items-center justify-between text-xs font-mono text-slate-300 select-none border-b border-slate-900/60 z-30"
    >
      <div className="flex items-center gap-2">
        <span className="font-semibold text-slate-200">{time}</span>
        <span className="text-[10px] bg-slate-800/80 text-teal-400 px-1.5 py-0.5 rounded tracking-wide hidden sm:inline-block">
          {wifiSsid}
        </span>
      </div>

      <div className="flex items-center gap-2.5">
        <span className="text-[10px] text-slate-400 font-sans tracking-wider hidden sm:inline">5G</span>
        <Signal className="w-3.5 h-3.5 text-slate-300" />
        <Wifi className="w-3.5 h-3.5 text-teal-400" />
        <div className="flex items-center gap-1">
          <span className="text-[10px] text-slate-300">96%</span>
          <BatteryMedium className="w-4 h-4 text-emerald-400" />
        </div>
      </div>
    </div>
  );
}
