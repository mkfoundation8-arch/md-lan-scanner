import { useState, type FormEvent } from 'react';
import {
  LanDevice,
  XamppProject,
  SubnetConfig,
  FavoriteProject
} from '../types';
import {
  Server,
  Laptop,
  Smartphone,
  Wifi,
  Globe,
  ExternalLink,
  Star,
  ChevronDown,
  ChevronUp,
  Flame,
  CheckCircle2,
  FolderGit2,
  HardDrive,
  Database,
  Search,
  Plus,
  Compass,
  Cpu,
  ArrowRight,
  SlidersHorizontal
} from 'lucide-react';
import { ManualAddressDialog } from './ManualAddressDialog';
import { parseManualAddress, saveStoredRecentManualAddress } from '../utils/lanScanner';

interface LanDiscoveryScreenProps {
  devices: LanDevice[];
  isScanning: boolean;
  scanProgress: number; // 0 to 254
  scannedIpText: string;
  onStartScan: () => void;
  onStopScan: () => void;
  onOpenWebView: (url: string, title: string, project?: XamppProject, device?: LanDevice) => void;
  favorites: FavoriteProject[];
  onToggleFavorite: (project: {
    id: string;
    name: string;
    url: string;
    deviceIp: string;
    deviceName: string;
    type: string;
    serverSoftware?: string;
  }) => void;
  subnetConfig: SubnetConfig;
  onUpdateSubnet: (config: SubnetConfig) => void;
  onAddCustomHost: (ip: string, port: number, name: string, isXampp: boolean, path?: string) => void;
}

export function LanDiscoveryScreen({
  devices,
  isScanning,
  scanProgress,
  scannedIpText,
  onStartScan,
  onStopScan,
  onOpenWebView,
  favorites,
  onToggleFavorite,
  subnetConfig,
  onUpdateSubnet,
  onAddCustomHost,
}: LanDiscoveryScreenProps) {
  const [filter, setFilter] = useState<'all' | 'xampp' | 'online' | 'servers'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedDeviceIds, setExpandedDeviceIds] = useState<Record<string, boolean>>({
    'dev-xampp-win': true,
    'dev-xampp-mac': true,
  });
  const [showManualModal, setShowManualModal] = useState(false);
  const [inlineAddress, setInlineAddress] = useState('');
  const [inlineProtocol, setInlineProtocol] = useState<'http' | 'https'>('http');

  const toggleExpand = (id: string) => {
    setExpandedDeviceIds((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const isFavorited = (url: string) => {
    return favorites.some((f) => f.url === url);
  };

  const handleInlineLaunchWebView = (e?: FormEvent) => {
    if (e) e.preventDefault();
    const target = inlineAddress.trim() || `${subnetConfig.networkPrefix}.45:80/dashboard/`;
    const full = target.startsWith('http://') || target.startsWith('https://')
      ? target
      : `${inlineProtocol}://${target}`;
    const parsed = parseManualAddress(full);
    saveStoredRecentManualAddress({
      url: parsed.fullUrl,
      name: parsed.suggestedName,
      host: parsed.host,
      port: parsed.port,
      path: parsed.path,
      isXampp: parsed.isLikelyXampp,
    });
    onOpenWebView(parsed.fullUrl, parsed.suggestedName);
  };

  const handleInlineAddHost = () => {
    const target = inlineAddress.trim() || `${subnetConfig.networkPrefix}.50`;
    const full = target.startsWith('http://') || target.startsWith('https://')
      ? target
      : `${inlineProtocol}://${target}`;
    const parsed = parseManualAddress(full);
    saveStoredRecentManualAddress({
      url: parsed.fullUrl,
      name: parsed.suggestedName,
      host: parsed.host,
      port: parsed.port,
      path: parsed.path,
      isXampp: parsed.isLikelyXampp,
    });
    onAddCustomHost(parsed.host, parsed.port, parsed.suggestedName, parsed.isLikelyXampp, parsed.path);
  };

  const filteredDevices = devices.filter((dev) => {
    if (filter === 'xampp' && !dev.isXampp) return false;
    if (filter === 'online' && !dev.isOnline) return false;
    if (filter === 'servers' && dev.openPorts.length === 0) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesHost = dev.hostname.toLowerCase().includes(q);
      const matchesIp = dev.ip.includes(q);
      const matchesVendor = dev.vendor.toLowerCase().includes(q);
      const matchesProjects = dev.projects?.some((p) => p.name.toLowerCase().includes(q) || p.folderName.toLowerCase().includes(q));
      return matchesHost || matchesIp || matchesVendor || matchesProjects;
    }
    return true;
  });

  const xamppCount = devices.filter((d) => d.isXampp).length;

  const handleSubnetPreset = (preset: string) => {
    onUpdateSubnet({
      ...subnetConfig,
      networkPrefix: preset,
      gateway: `${preset}.1`,
    });
  };

  const getDeviceIcon = (osType?: string, isXampp?: boolean) => {
    if (isXampp) return <Server className="w-5 h-5 text-amber-400" />;
    switch (osType) {
      case 'Windows':
        return <HardDrive className="w-5 h-5 text-blue-400" />;
      case 'macOS':
        return <Laptop className="w-5 h-5 text-slate-300" />;
      case 'Linux':
        return <Cpu className="w-5 h-5 text-orange-400" />;
      case 'Router':
        return <Wifi className="w-5 h-5 text-teal-400" />;
      case 'Android':
        return <Smartphone className="w-5 h-5 text-emerald-400" />;
      default:
        return <Globe className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="flex-1 overflow-y-auto pb-24">
      {/* Subnet & Network Header Card */}
      <div className="bg-slate-900 border-b border-slate-800 p-4 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse" />
            <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Target Wi-Fi Subnet
            </span>
            <span className="bg-slate-800 text-teal-300 font-mono text-xs px-2 py-0.5 rounded-md border border-slate-700">
              {subnetConfig.networkPrefix}.0/{subnetConfig.cidr}
            </span>
          </div>

          {/* Quick Subnet Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-xs py-1">
            <span className="text-slate-500 text-[11px] whitespace-nowrap">Subnet:</span>
            {['192.168.1', '192.168.0', '10.0.0', '172.16.1'].map((preset) => (
              <button
                key={preset}
                onClick={() => handleSubnetPreset(preset)}
                className={`px-2 py-1 rounded text-xs font-mono transition-all cursor-pointer ${
                  subnetConfig.networkPrefix === preset
                    ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40 font-semibold'
                    : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 border border-slate-700/60'
                }`}
              >
                {preset}.x
              </button>
            ))}
          </div>
        </div>

        {/* Scan Status & Animated Radar */}
        <div className="bg-slate-950/70 rounded-2xl p-3 border border-slate-800/90 flex items-center justify-between gap-3 shadow-inner">
          <div className="flex items-center gap-3 min-w-0">
            {/* Radar Animation / Icon */}
            <div className="relative w-11 h-11 rounded-full bg-slate-900 border border-teal-500/30 flex items-center justify-center flex-shrink-0">
              {isScanning ? (
                <>
                  <span className="absolute inset-0 rounded-full border border-teal-400/40 animate-ping" />
                  <Compass className="w-5 h-5 text-teal-400 animate-spin" />
                </>
              ) : (
                <Wifi className="w-5 h-5 text-teal-400" />
              )}
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="text-xs font-semibold text-white truncate">
                  {isScanning ? 'Scanning Wi-Fi Subnet...' : 'Subnet Discovery Ready'}
                </p>
                {isScanning && (
                  <span className="text-[10px] font-mono bg-teal-500/20 text-teal-300 px-1.5 py-0.2 rounded animate-pulse">
                    ACTIVE
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 truncate font-mono">
                {isScanning ? (
                  <span>Pinging {scannedIpText}... ({scanProgress}/254)</span>
                ) : (
                  <span>Gateway: {subnetConfig.gateway} • {devices.length} hosts located</span>
                )}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="btn-manual-add-host"
              onClick={() => setShowManualModal(true)}
              title="Manual Entry of URL or Local Server Address"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors cursor-pointer border border-slate-700/80 text-xs font-semibold"
            >
              <Globe className="w-4 h-4 text-teal-400" />
              <span className="hidden xs:inline">Manual URL</span>
            </button>

            <button
              id="btn-main-scan-toggle"
              onClick={isScanning ? onStopScan : onStartScan}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold cursor-pointer shadow-md transition-all flex items-center gap-1.5 ${
                isScanning
                  ? 'bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-amber-500/20'
                  : 'bg-teal-500 text-slate-950 hover:bg-teal-400 shadow-teal-500/20'
              }`}
            >
              {isScanning ? 'Stop' : 'Start Scan'}
            </button>
          </div>
        </div>

        {/* Scan Progress Bar */}
        {isScanning && (
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="bg-gradient-to-r from-teal-500 via-teal-300 to-amber-400 h-full transition-all duration-300 rounded-full"
              style={{ width: `${Math.max(4, Math.round((scanProgress / 254) * 100))}%` }}
            />
          </div>
        )}

        {/* Dedicated Manual Entry of URL or Local Server Address Card */}
        <div className="bg-slate-950/80 rounded-2xl p-3 border border-teal-500/30 shadow-md space-y-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/5 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-teal-400" />
              <span className="text-xs font-bold text-white tracking-tight">
                Manual Server & URL Quick Connect
              </span>
              <span className="text-[10px] font-semibold bg-teal-500/20 text-teal-300 border border-teal-500/30 px-1.5 py-0.2 rounded">
                Direct
              </span>
            </div>

            <button
              type="button"
              id="btn-open-advanced-manual-modal"
              onClick={() => setShowManualModal(true)}
              className="text-[11px] text-teal-400 hover:text-teal-300 flex items-center gap-1 font-medium transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="w-3 h-3" />
              <span>Full Config & History</span>
            </button>
          </div>

          <form onSubmit={handleInlineLaunchWebView} className="flex flex-col sm:flex-row gap-2">
            <div className="flex-1 flex items-center bg-slate-900/90 border border-slate-800 rounded-xl px-2.5 py-1.5 focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500 transition-all">
              <button
                type="button"
                onClick={() => setInlineProtocol(inlineProtocol === 'http' ? 'https' : 'http')}
                className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold mr-2 transition-colors cursor-pointer ${
                  inlineProtocol === 'http'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                }`}
                title="Toggle Protocol"
              >
                {inlineProtocol}://
              </button>
              <input
                id="input-inline-manual-address"
                type="text"
                placeholder="Enter IP, port, or local URL (e.g. 192.168.1.45:80/dashboard, localhost:8000)"
                value={inlineAddress}
                onChange={(e) => setInlineAddress(e.target.value)}
                className="w-full bg-transparent text-xs text-white placeholder-slate-500 font-mono focus:outline-none"
              />
              {inlineAddress && (
                <button
                  type="button"
                  onClick={() => setInlineAddress('')}
                  className="text-slate-500 hover:text-slate-300 text-xs px-1.5 cursor-pointer"
                  title="Clear input"
                >
                  ×
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="submit"
                id="btn-inline-launch-webview"
                className="flex-1 sm:flex-initial px-3.5 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-teal-500/20 transition-all cursor-pointer whitespace-nowrap"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Open WebView</span>
              </button>

              <button
                type="button"
                id="btn-inline-add-host"
                onClick={handleInlineAddHost}
                title="Add to Discovered LAN Hosts"
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700/80 text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
              >
                <Plus className="w-3.5 h-3.5 text-teal-400" />
                <span className="hidden xs:inline">Add Host</span>
              </button>
            </div>
          </form>

          {/* Quick local dev presets */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] pt-0.5">
            <span className="text-slate-500 text-[10px] whitespace-nowrap">Presets:</span>
            {[
              { label: 'XAMPP Dashboard', addr: `${subnetConfig.networkPrefix}.45:80/dashboard/` },
              { label: 'phpMyAdmin', addr: `${subnetConfig.networkPrefix}.45:80/phpmyadmin/` },
              { label: 'WordPress', addr: `${subnetConfig.networkPrefix}.45:80/client-wp/` },
              { label: 'localhost:8000', addr: 'localhost:8000' },
              { label: 'localhost:3000', addr: 'localhost:3000' },
              { label: 'Router :80', addr: `${subnetConfig.networkPrefix}.1` },
            ].map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => setInlineAddress(preset.addr)}
                className="px-2 py-0.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-teal-300 border border-slate-800 text-[10px] font-mono whitespace-nowrap transition-colors cursor-pointer"
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search IP, hostname, project, or vendor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto text-xs pb-1 sm:pb-0">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1.5 rounded-xl font-medium whitespace-nowrap transition-colors cursor-pointer ${
                filter === 'all'
                  ? 'bg-slate-700 text-white'
                  : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({devices.length})
            </button>
            <button
              onClick={() => setFilter('xampp')}
              className={`px-2.5 py-1.5 rounded-xl font-medium whitespace-nowrap transition-colors flex items-center gap-1 cursor-pointer ${
                filter === 'xampp'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-slate-800/60 text-slate-400 hover:text-amber-300'
              }`}
            >
              <Flame className="w-3 h-3 text-amber-400" />
              XAMPP ({xamppCount})
            </button>
            <button
              onClick={() => setFilter('online')}
              className={`px-2.5 py-1.5 rounded-xl font-medium whitespace-nowrap transition-colors cursor-pointer ${
                filter === 'online'
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                  : 'bg-slate-800/60 text-slate-400 hover:text-teal-300'
              }`}
            >
              Online
            </button>
            <button
              onClick={() => setFilter('servers')}
              className={`px-2.5 py-1.5 rounded-xl font-medium whitespace-nowrap transition-colors cursor-pointer ${
                filter === 'servers'
                  ? 'bg-slate-700 text-white'
                  : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
              }`}
            >
              Web Servers
            </button>
          </div>
        </div>
      </div>

      {/* Discovered Hosts List */}
      <div className="p-4 space-y-3">
        {filteredDevices.length === 0 ? (
          <div className="text-center py-12 px-4 bg-slate-900/50 rounded-2xl border border-dashed border-slate-800">
            <Server className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-300 mb-1">No Matching Devices Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
              Try adjusting your filter, changing the Wi-Fi subnet range, or click "Start Scan" to probe the network.
            </p>
            <button
              onClick={onStartScan}
              className="px-4 py-2 rounded-xl bg-teal-500 text-slate-950 text-xs font-semibold shadow hover:bg-teal-400 cursor-pointer"
            >
              Scan Subnet Now
            </button>
          </div>
        ) : (
          filteredDevices.map((device) => {
            const isExpanded = !!expandedDeviceIds[device.id];
            const projectCount = device.projects?.length || 0;

            return (
              <div
                key={device.id}
                id={`device-card-${device.id}`}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  device.isXampp
                    ? 'bg-slate-900/90 border-amber-500/40 hover:border-amber-500/60 shadow-lg shadow-amber-950/20 ring-1 ring-amber-500/10'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 shadow-sm'
                }`}
              >
                {/* Host Card Top Bar */}
                <div className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 min-w-0">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          device.isXampp
                            ? 'bg-amber-500/10 border border-amber-500/30'
                            : 'bg-slate-800 border border-slate-700'
                        }`}
                      >
                        {getDeviceIcon(device.osType, device.isXampp)}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-bold text-white tracking-tight truncate">
                            {device.hostname}
                          </h3>

                          {device.isXampp && (
                            <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-300 border border-amber-500/40">
                              <Flame className="w-3 h-3 text-amber-400" />
                              XAMPP APACHE
                            </span>
                          )}

                          {device.isOnline && (
                            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.2 rounded">
                              {device.latencyMs}ms
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-1 text-xs font-mono text-slate-300">
                          <span className="font-semibold text-teal-300">{device.ip}</span>
                          <span className="text-slate-600">•</span>
                          <span className="text-slate-400 text-[11px] truncate">{device.vendor}</span>
                        </div>

                        {device.serverSoftware && (
                          <p className="text-[11px] text-slate-400 mt-1 truncate">
                            Server:{' '}
                            <span className="text-slate-300 font-mono text-[10.5px]">
                              {device.serverSoftware}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Open in WebView Host Root Button */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {device.openPorts.includes(80) || device.openPorts.includes(8080) ? (
                        <button
                          id={`btn-open-webview-root-${device.id}`}
                          onClick={() =>
                            onOpenWebView(
                              `http://${device.ip}${device.openPorts.includes(8080) && !device.openPorts.includes(80) ? ':8080' : ''}/`,
                              device.hostname,
                              undefined,
                              device
                            )
                          }
                          className="px-3 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold transition-all shadow cursor-pointer flex items-center gap-1.5"
                          title="Open host root in Android WebView"
                        >
                          <Globe className="w-3.5 h-3.5" />
                          <span>WebView</span>
                        </button>
                      ) : null}

                      {projectCount > 0 && (
                        <button
                          onClick={() => toggleExpand(device.id)}
                          className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700"
                          title={isExpanded ? 'Collapse Projects' : 'Expand Projects'}
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Ports and Modules Pill Bar */}
                  <div className="flex items-center gap-1.5 flex-wrap mt-3 pt-2.5 border-t border-slate-800/60">
                    <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                      Open Ports:
                    </span>
                    {device.openPorts.length > 0 ? (
                      device.openPorts.map((port) => (
                        <span
                          key={port}
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                            port === 80 || port === 8080
                              ? 'bg-teal-500/10 text-teal-300 border-teal-500/30'
                              : port === 3306
                              ? 'bg-purple-500/10 text-purple-300 border-purple-500/30'
                              : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}
                        >
                          :{port} {port === 80 ? 'HTTP' : port === 443 ? 'HTTPS' : port === 3306 ? 'MySQL' : port === 8080 ? 'ALT-HTTP' : ''}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-slate-500 italic">No open web ports probed</span>
                    )}

                    {device.phpVersion && (
                      <span className="text-[10px] font-mono bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.5 rounded ml-auto">
                        {device.phpVersion}
                      </span>
                    )}
                  </div>
                </div>

                {/* XAMPP Detected Projects Section (htdocs) */}
                {projectCount > 0 && isExpanded && (
                  <div className="bg-slate-950/60 border-t border-slate-800/80 p-3 space-y-2">
                    <div className="flex items-center justify-between px-1">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                        <FolderGit2 className="w-3.5 h-3.5 text-amber-400" />
                        <span>XAMPP htdocs Web Projects ({projectCount})</span>
                      </div>
                      <span className="text-[10px] text-slate-500">Tap to load in WebView</span>
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                      {device.projects?.map((project) => {
                        const starred = isFavorited(project.url);
                        return (
                          <div
                            key={project.id}
                            id={`project-item-${project.id}`}
                            className="bg-slate-900/80 hover:bg-slate-800/90 border border-slate-800/80 hover:border-slate-700 rounded-xl p-2.5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <h4 className="text-xs font-semibold text-white truncate">
                                  {project.name}
                                </h4>
                                <span
                                  className={`text-[9px] px-1.5 py-0.2 rounded font-medium ${
                                    project.type === 'WordPress'
                                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                      : project.type === 'phpMyAdmin'
                                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                      : project.type === 'Laravel'
                                      ? 'bg-red-500/20 text-red-300 border border-red-500/30'
                                      : 'bg-slate-800 text-slate-300 border border-slate-700'
                                  }`}
                                >
                                  {project.type}
                                </span>
                              </div>
                              <p className="text-[11px] text-teal-400 font-mono truncate mt-0.5">
                                {project.url}
                              </p>
                              {project.description && (
                                <p className="text-[10px] text-slate-400 truncate mt-0.5">
                                  {project.description}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5 self-end sm:self-center flex-shrink-0">
                              {/* Star / Favorite toggle */}
                              <button
                                id={`btn-fav-${project.id}`}
                                onClick={() =>
                                  onToggleFavorite({
                                    id: project.id,
                                    name: project.name,
                                    url: project.url,
                                    deviceIp: device.ip,
                                    deviceName: device.hostname,
                                    type: project.type,
                                    serverSoftware: device.serverSoftware,
                                  })
                                }
                                title={starred ? 'Remove from Favorites' : 'Save to Favorites'}
                                className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                  starred
                                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                                    : 'bg-slate-800 text-slate-400 hover:text-amber-300 hover:bg-slate-700'
                                }`}
                              >
                                <Star className={`w-3.5 h-3.5 ${starred ? 'fill-amber-400' : ''}`} />
                              </button>

                              {/* Open in WebView */}
                              <button
                                id={`btn-webview-${project.id}`}
                                onClick={() =>
                                  onOpenWebView(project.url, project.name, project, device)
                                }
                                className="px-2.5 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                              >
                                <Globe className="w-3 h-3" />
                                <span>Open</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Manual Entry of URL or Local Server Address Dialog */}
      {showManualModal && (
        <ManualAddressDialog
          initialAddress={inlineAddress}
          onClose={() => setShowManualModal(false)}
          onOpenWebView={(url, title) => onOpenWebView(url, title)}
          onAddCustomHost={(ip, port, name, isXampp, path) =>
            onAddCustomHost(ip, port, name, isXampp, path)
          }
          onAddToFavorites={onToggleFavorite}
        />
      )}
    </div>
  );
}
