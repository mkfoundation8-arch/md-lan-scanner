import { useState, useEffect, type FormEvent } from 'react';
import {
  Globe,
  ExternalLink,
  Plus,
  Play,
  Star,
  Clock,
  Trash2,
  Check,
  Copy,
  Server,
  Flame,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  HelpCircle,
  X,
  History,
  Laptop
} from 'lucide-react';
import {
  parseManualAddress,
  probeHttpEndpoint,
  getStoredRecentManualAddresses,
  saveStoredRecentManualAddress,
  clearStoredRecentManualAddresses
} from '../utils/lanScanner';
import { ManualAddressEntry } from '../types';

interface ManualAddressDialogProps {
  initialAddress?: string;
  onClose: () => void;
  onOpenWebView: (url: string, title: string, isXampp?: boolean) => void;
  onAddCustomHost: (ip: string, port: number, name: string, isXampp: boolean, path?: string) => void;
  onAddToFavorites?: (project: {
    id: string;
    name: string;
    url: string;
    deviceIp: string;
    deviceName: string;
    type: string;
    serverSoftware?: string;
  }) => void;
}

export function ManualAddressDialog({
  initialAddress = '',
  onClose,
  onOpenWebView,
  onAddCustomHost,
  onAddToFavorites,
}: ManualAddressDialogProps) {
  const [addressInput, setAddressInput] = useState(initialAddress || '192.168.1.45:80/dashboard/');
  const [protocol, setProtocol] = useState<'http' | 'https'>('http');
  const [customName, setCustomName] = useState('');
  const [isXampp, setIsXampp] = useState(true);
  const [recentEntries, setRecentEntries] = useState<ManualAddressEntry[]>([]);
  const [isProbing, setIsProbing] = useState(false);
  const [probeResult, setProbeResult] = useState<{
    reachable: boolean;
    latencyMs: number;
    tested: boolean;
  }>({ reachable: false, latencyMs: 0, tested: false });
  const [isCopied, setIsCopied] = useState(false);

  // Load recent entries
  useEffect(() => {
    const list = getStoredRecentManualAddresses();
    setRecentEntries(list);
  }, []);

  // Compute parsed details in real-time
  const parsed = parseManualAddress(
    addressInput.startsWith('http://') || addressInput.startsWith('https://')
      ? addressInput
      : `${protocol}://${addressInput}`
  );

  const displayName = customName.trim() || parsed.suggestedName;

  const handleProbe = async () => {
    setIsProbing(true);
    setProbeResult({ reachable: false, latencyMs: 0, tested: false });
    const res = await probeHttpEndpoint(parsed.host, parsed.port, 1500);
    setProbeResult({
      reachable: res.reachable,
      latencyMs: res.latencyMs,
      tested: true,
    });
    setIsProbing(false);
  };

  const handleLaunchWebView = () => {
    if (!parsed.fullUrl) return;
    saveStoredRecentManualAddress({
      url: parsed.fullUrl,
      name: displayName,
      host: parsed.host,
      port: parsed.port,
      path: parsed.path,
      isXampp,
    });
    onOpenWebView(parsed.fullUrl, displayName, isXampp);
    onClose();
  };

  const handleAddHost = () => {
    if (!parsed.host) return;
    saveStoredRecentManualAddress({
      url: parsed.fullUrl,
      name: displayName,
      host: parsed.host,
      port: parsed.port,
      path: parsed.path,
      isXampp,
    });
    onAddCustomHost(parsed.host, parsed.port, displayName, isXampp, parsed.path);
    onClose();
  };

  const handleSaveFavorite = () => {
    if (onAddToFavorites) {
      onAddToFavorites({
        id: `fav-manual-${Date.now()}`,
        name: displayName,
        url: parsed.fullUrl,
        deviceIp: parsed.host,
        deviceName: displayName,
        type: isXampp ? 'Apache XAMPP' : 'Local Web Server',
        serverSoftware: isXampp ? 'Apache/2.4 (Win64/Linux) PHP/8.x' : 'Custom HTTP Server',
      });
    }
    saveStoredRecentManualAddress({
      url: parsed.fullUrl,
      name: displayName,
      host: parsed.host,
      port: parsed.port,
      path: parsed.path,
      isXampp,
    });
    onClose();
  };

  const handlePickPreset = (presetUrl: string, presetName: string, presetXampp: boolean) => {
    setAddressInput(presetUrl);
    setCustomName(presetName);
    setIsXampp(presetXampp);
    setProbeResult({ reachable: false, latencyMs: 0, tested: false });
  };

  const handlePickRecent = (item: ManualAddressEntry) => {
    setAddressInput(item.url);
    setCustomName(item.name);
    setIsXampp(!!item.isXampp);
    setProbeResult({ reachable: false, latencyMs: 0, tested: false });
  };

  const handleClearHistory = () => {
    clearStoredRecentManualAddresses();
    setRecentEntries([]);
  };

  const handlePasteClipboard = async () => {
    try {
      if (navigator.clipboard?.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setAddressInput(text.trim());
          setProbeResult({ reachable: false, latencyMs: 0, tested: false });
        }
      }
    } catch {
      // Ignore clipboard permission issues
    }
  };

  return (
    <div
      id="manual-address-dialog"
      className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-fade-in"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-5 sm:p-6 space-y-4 shadow-2xl relative my-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
                Manual Server / URL Entry
              </h2>
              <p className="text-[11px] text-slate-400">
                Directly connect to any local IP, port, Apache, or web address
              </p>
            </div>
          </div>
          <button
            id="btn-close-manual-dialog"
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* URL / Address Input Form */}
        <div className="space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Target Server Address or URL
              </label>
              <button
                type="button"
                onClick={handlePasteClipboard}
                className="text-[11px] text-teal-400 hover:text-teal-300 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>Paste clipboard</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              {/* Protocol selector */}
              <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800">
                <button
                  type="button"
                  onClick={() => setProtocol('http')}
                  className={`px-2 py-1 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${
                    protocol === 'http'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  http://
                </button>
                <button
                  type="button"
                  onClick={() => setProtocol('https')}
                  className={`px-2 py-1 rounded-lg text-xs font-mono font-bold transition-colors cursor-pointer ${
                    protocol === 'https'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  https://
                </button>
              </div>

              {/* Input field */}
              <div className="relative flex-1">
                <input
                  id="input-manual-url-address"
                  type="text"
                  value={addressInput}
                  onChange={(e) => {
                    setAddressInput(e.target.value);
                    setProbeResult({ reachable: false, latencyMs: 0, tested: false });
                  }}
                  placeholder="e.g. 192.168.1.45:8080/dashboard"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono placeholder-slate-600 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500 transition-all"
                  autoFocus
                />
              </div>
            </div>
          </div>

          {/* Real-time Address Parsing breakdown Card */}
          <div className="bg-slate-950/80 rounded-2xl p-3 border border-slate-800/90 space-y-2">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-slate-400">Resolved Target:</span>
              <span className="text-teal-300 font-mono font-bold break-all">
                {parsed.fullUrl}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-[11px] font-mono">
              <div className="bg-slate-900/90 px-2 py-1 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[9px]">HOST</span>
                <span className="text-slate-200 truncate block">{parsed.host}</span>
              </div>
              <div className="bg-slate-900/90 px-2 py-1 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[9px]">PORT</span>
                <span className="text-amber-400 block">{parsed.port}</span>
              </div>
              <div className="bg-slate-900/90 px-2 py-1 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[9px]">PATH</span>
                <span className="text-slate-300 truncate block">{parsed.path}</span>
              </div>
            </div>

            {/* Live Connection Test Button & Latency Indicator */}
            <div className="flex items-center justify-between pt-1 border-t border-slate-900">
              <button
                type="button"
                id="btn-probe-manual-address"
                onClick={handleProbe}
                disabled={isProbing}
                className="text-[11px] font-medium text-slate-300 hover:text-teal-300 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Play className={`w-3 h-3 text-teal-400 ${isProbing ? 'animate-spin' : ''}`} />
                <span>{isProbing ? 'Probing target...' : 'Test Connection Latency'}</span>
              </button>

              {probeResult.tested && (
                <div className="flex items-center gap-1.5 text-[11px]">
                  {probeResult.reachable ? (
                    <span className="flex items-center gap-1 text-emerald-400 font-mono">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Reachable ({probeResult.latencyMs} ms)
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-amber-400 font-mono">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      Timeout / CORS ({probeResult.latencyMs} ms)
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Optional Name & XAMPP Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <div>
              <label className="block text-slate-400 text-[11px] mb-1">
                Custom Nickname (Optional)
              </label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder={parsed.suggestedName}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:border-teal-500 focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-5">
              <input
                type="checkbox"
                id="chk-manual-xampp"
                checked={isXampp}
                onChange={(e) => setIsXampp(e.target.checked)}
                className="w-4 h-4 rounded text-teal-500 bg-slate-950 border-slate-800 focus:ring-0 cursor-pointer"
              />
              <label htmlFor="chk-manual-xampp" className="text-xs text-slate-300 cursor-pointer">
                Apache XAMPP Server
                <span className="block text-[10px] text-slate-500">Auto-indexes htdocs projects</span>
              </label>
            </div>
          </div>

          {/* Quick Presets */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] text-slate-500 uppercase tracking-wider block">
              Quick Local Dev Presets:
            </span>
            <div className="flex flex-wrap gap-1.5 text-xs">
              <button
                type="button"
                onClick={() => handlePickPreset('192.168.1.45:80/dashboard/', 'XAMPP Dashboard', true)}
                className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-mono border border-slate-700/60 transition-colors cursor-pointer flex items-center gap-1"
              >
                <Flame className="w-3 h-3 text-amber-400" />
                XAMPP Dashboard
              </button>

              <button
                type="button"
                onClick={() => handlePickPreset('192.168.1.45:80/phpmyadmin/', 'phpMyAdmin', true)}
                className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-mono border border-slate-700/60 transition-colors cursor-pointer flex items-center gap-1"
              >
                <Server className="w-3 h-3 text-teal-400" />
                phpMyAdmin
              </button>

              <button
                type="button"
                onClick={() => handlePickPreset('localhost:8000', 'Local PHP/Laravel', false)}
                className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-mono border border-slate-700/60 transition-colors cursor-pointer flex items-center gap-1"
              >
                <Laptop className="w-3 h-3 text-orange-400" />
                localhost:8000
              </button>

              <button
                type="button"
                onClick={() => handlePickPreset('localhost:3000', 'Node/Vite Dev', false)}
                className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-mono border border-slate-700/60 transition-colors cursor-pointer"
              >
                localhost:3000
              </button>

              <button
                type="button"
                onClick={() => handlePickPreset('192.168.1.1', 'Wi-Fi Router Gateway', false)}
                className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-mono border border-slate-700/60 transition-colors cursor-pointer"
              >
                192.168.1.1
              </button>
            </div>
          </div>

          {/* Recent Manual Entries History */}
          {recentEntries.length > 0 && (
            <div className="pt-2 border-t border-slate-800/80 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400 flex items-center gap-1.5 font-medium">
                  <History className="w-3.5 h-3.5 text-slate-500" />
                  Recent Manual Addresses
                </span>
                <button
                  type="button"
                  onClick={handleClearHistory}
                  className="text-[10px] text-slate-500 hover:text-red-400 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  Clear
                </button>
              </div>

              <div className="max-h-28 overflow-y-auto space-y-1 pr-1">
                {recentEntries.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handlePickRecent(item)}
                    className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 hover:bg-slate-800 border border-slate-800/80 transition-all cursor-pointer group"
                  >
                    <div className="min-w-0 flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-400 flex-shrink-0" />
                      <div className="truncate">
                        <p className="text-xs text-white font-medium truncate group-hover:text-teal-300 transition-colors">
                          {item.name}
                        </p>
                        <p className="text-[10px] text-slate-400 font-mono truncate">
                          {item.url}
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] text-slate-500 font-mono flex-shrink-0 ml-2">
                      {item.timestamp}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row gap-2">
          {onAddToFavorites && (
            <button
              type="button"
              id="btn-manual-save-fav"
              onClick={handleSaveFavorite}
              className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Star className="w-3.5 h-3.5 text-amber-400" />
              <span>Save Favorite</span>
            </button>
          )}

          <button
            type="button"
            id="btn-manual-add-device"
            onClick={handleAddHost}
            className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-teal-400" />
            <span>Add to LAN Hosts</span>
          </button>

          <button
            type="button"
            id="btn-manual-launch-webview"
            onClick={handleLaunchWebView}
            className="flex-1 px-4 py-2.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-teal-500/20 transition-all cursor-pointer"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Open in Android WebView</span>
          </button>
        </div>
      </div>
    </div>
  );
}
