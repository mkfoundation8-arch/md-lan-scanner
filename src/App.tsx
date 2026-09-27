import { useMemo, useState } from 'react';
import { AboutDialog } from './components/AboutDialog';
import { AndroidBottomNav } from './components/AndroidBottomNav';
import { AndroidHeader } from './components/AndroidHeader';
import { AndroidWebView } from './components/AndroidWebView';
import { FavoritesScreen } from './components/FavoritesScreen';
import { LanDiscoveryScreen } from './components/LanDiscoveryScreen';
import { ManualAddressDialog } from './components/ManualAddressDialog';
import { NetworkToolsScreen } from './components/NetworkToolsScreen';
import { INITIAL_LAN_DEVICES } from './data/mockDevices';
import type { AppTab, FavoriteProject, LanDevice, SubnetConfig, XamppProject } from './types';
import { detectLocalIpAddress, probeHttpEndpoint } from './utils/lanScanner';

const defaultSubnetConfig: SubnetConfig = {
  networkPrefix: '192.168.1',
  mask: '255.255.255.0',
  cidr: 24,
  gateway: '192.168.1.1',
  startHost: 1,
  endHost: 254,
};

function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('scanner');
  const [devices, setDevices] = useState<LanDevice[]>(INITIAL_LAN_DEVICES);
  const [favorites, setFavorites] = useState<FavoriteProject[]>([]);
  const [subnetConfig, setSubnetConfig] = useState<SubnetConfig>(defaultSubnetConfig);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scannedIpText, setScannedIpText] = useState('192.168.1.1');
  const [showAboutDialog, setShowAboutDialog] = useState(false);
  const [showManualDialog, setShowManualDialog] = useState(false);
  const [isPhoneFrame, setIsPhoneFrame] = useState(true);
  const [webView, setWebView] = useState<{
    url: string;
    title: string;
    project?: XamppProject;
    device?: LanDevice;
  } | null>(null);

  const xamppCount = useMemo(() => devices.filter((device) => device.isXampp).length, [devices]);

  const handleStartScan = async () => {
    setIsScanning(true);
    setScanProgress(0);

    let resolvedPrefix = subnetConfig.networkPrefix;
    try {
      const localIp = await detectLocalIpAddress();
      const prefix = localIp.split('.').slice(0, 3).join('.');
      resolvedPrefix = prefix;
      setSubnetConfig((current) => ({
        ...current,
        networkPrefix: prefix,
        gateway: `${prefix}.1`,
      }));
    } catch {
      // fall back to subnet config already in the app
    }

    const start = subnetConfig.startHost || 1;
    const end = subnetConfig.endHost || 254;
    const discovered: LanDevice[] = [];

    for (let host = start; host <= end; host += 1) {
      if (!isScanning) {
        break;
      }

      const ip = `${resolvedPrefix}.${host}`;
      setScannedIpText(ip);
      setScanProgress(Math.round(((host - start) / Math.max(end - start, 1)) * 100));

      const http80 = await probeHttpEndpoint(ip, 80, 600);
      const http8080 = await probeHttpEndpoint(ip, 8080, 600);
      const http443 = await probeHttpEndpoint(ip, 443, 600);
      const reachable = [http80, http8080, http443].some((result) => result.reachable);

      if (reachable) {
        const isXampp = http80.isXampp || http8080.isXampp || http443.isXampp;
        discovered.push({
          id: `scan-${ip}`,
          ip,
          mac: '00:00:00:00:00:00',
          hostname: isXampp ? `XAMPP-${host}` : `Host-${host}`,
          vendor: isXampp ? 'Apache / XAMPP' : 'LAN Device',
          isOnline: true,
          latencyMs: Math.min(http80.latencyMs, http8080.latencyMs || 9999, http443.latencyMs || 9999),
          openPorts: [80, 443, 8080].filter((port) => {
            const result = port === 80 ? http80 : port === 443 ? http443 : http8080;
            return result.reachable;
          }),
          isXampp,
          serverSoftware: isXampp ? 'Apache HTTP Server' : 'Custom local service',
          discoveredAt: 'Just now',
          osType: isXampp ? 'Windows' : 'Linux',
          projects: isXampp
            ? [
                {
                  id: `proj-${ip}`,
                  name: 'Discovered LAN Project',
                  folderName: 'discovered-project',
                  url: `http://${ip}/`,
                  type: 'Custom PHP',
                  description: 'Discovered during the live subnet scan.',
                },
              ]
            : undefined,
        });
      }
    }

    if (discovered.length > 0) {
      setDevices((current) => [...discovered, ...current.filter((device) => !discovered.some((next) => next.ip === device.ip))]);
    }

    setScanProgress(100);
    setIsScanning(false);
  };

  const handleStopScan = () => {
    setIsScanning(false);
    setScanProgress(100);
  };

  const handleToggleFavorite = (project: {
    id: string;
    name: string;
    url: string;
    deviceIp: string;
    deviceName: string;
    type: string;
    serverSoftware?: string;
  }) => {
    setFavorites((current) => {
      const existingIndex = current.findIndex((favorite) => favorite.url === project.url);
      if (existingIndex >= 0) {
        return current.filter((favorite) => favorite.url !== project.url);
      }

      const entry: FavoriteProject = {
        id: project.id || `favorite-${Date.now()}`,
        name: project.name,
        url: project.url,
        deviceIp: project.deviceIp,
        deviceName: project.deviceName,
        type: project.type,
        serverSoftware: project.serverSoftware,
        notes: '',
        savedAt: new Date().toISOString(),
      };

      return [entry, ...current];
    });
  };

  const handleRemoveFavorite = (id: string) => {
    setFavorites((current) => current.filter((favorite) => favorite.id !== id));
  };

  const handleUpdateNotes = (id: string, notes: string) => {
    setFavorites((current) =>
      current.map((favorite) =>
        favorite.id === id
          ? {
              ...favorite,
              notes,
            }
          : favorite,
      ),
    );
  };

  const handleOpenWebView = (
    url: string,
    title: string,
    project?: XamppProject,
    device?: LanDevice,
  ) => {
    setWebView({ url, title, project, device });
    setActiveTab('scanner');
  };

  const handleAddCustomHost = (
    ip: string,
    port: number,
    name: string,
    isXampp: boolean,
    path = '/',
  ) => {
    const host: LanDevice = {
      id: `custom-${Date.now()}`,
      ip,
      mac: '00:00:00:00:00:00',
      hostname: name,
      vendor: 'Custom LAN Host',
      isOnline: true,
      latencyMs: 12,
      openPorts: port ? [port] : [],
      isXampp,
      serverSoftware: isXampp ? 'Apache HTTP Server' : 'Custom Web Service',
      discoveredAt: 'Just now',
      osType: isXampp ? 'Windows' : 'Unknown',
      projects: path && path !== '/' ? [{
        id: `proj-${Date.now()}`,
        name,
        folderName: path.replace(/^\/+|\/+$/g, '') || 'custom-project',
        url: `http://${ip}${port !== 80 ? `:${port}` : ''}${path}`,
        type: isXampp ? 'Custom PHP' : 'HTML/JS',
        description: 'Custom host added manually from the LAN scanner.',
      }] : undefined,
    };

    setDevices((current) => [host, ...current]);
  };

  const isCurrentUrlFavorited = webView ? favorites.some((favorite) => favorite.url === webView.url) : false;

  const renderMainContent = () => {
    if (webView) {
      return (
        <AndroidWebView
          url={webView.url}
          title={webView.title}
          project={webView.project}
          device={webView.device}
          onBack={() => setWebView(null)}
          isFavorited={isCurrentUrlFavorited}
          onToggleFavorite={() => {
            if (!webView) {
              return;
            }

            handleToggleFavorite({
              id: webView.project?.id ?? `favorite-${Date.now()}`,
              name: webView.title,
              url: webView.url,
              deviceIp: webView.device?.ip ?? 'unknown',
              deviceName: webView.device?.hostname ?? 'Local Device',
              type: webView.project?.type ?? 'Custom',
              serverSoftware: webView.device?.serverSoftware,
            });
          }}
        />
      );
    }

    switch (activeTab) {
      case 'favorites':
        return (
          <FavoritesScreen
            favorites={favorites}
            onOpenWebView={(url, title) => handleOpenWebView(url, title)}
            onRemoveFavorite={handleRemoveFavorite}
            onUpdateNotes={handleUpdateNotes}
            onSwitchToScanner={() => setActiveTab('scanner')}
          />
        );
      case 'network':
        return <NetworkToolsScreen subnetConfig={subnetConfig} onUpdateSubnet={setSubnetConfig} />;
      case 'about':
        return (
          <div className="flex-1 overflow-y-auto p-4">
            <div className="mx-auto max-w-xl rounded-3xl border border-slate-800 bg-slate-900 p-6 text-center shadow-2xl">
              <h2 className="text-xl font-bold text-white">MD LAN Scanner</h2>
              <p className="mt-2 text-sm text-slate-400">
                Android-style subnet discovery tool for local development environments and XAMPP-powered projects.
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2 text-left text-sm text-slate-300">
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                  <div className="text-xs uppercase tracking-wide text-slate-500">Discovered hosts</div>
                  <div className="mt-1 text-lg font-bold text-teal-300">{devices.length}</div>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                  <div className="text-xs uppercase tracking-wide text-slate-500">XAMPP servers</div>
                  <div className="mt-1 text-lg font-bold text-amber-300">{xamppCount}</div>
                </div>
              </div>
            </div>
          </div>
        );
      case 'scanner':
      default:
        return (
          <LanDiscoveryScreen
            devices={devices}
            isScanning={isScanning}
            scanProgress={scanProgress}
            scannedIpText={scannedIpText}
            onStartScan={handleStartScan}
            onStopScan={handleStopScan}
            onOpenWebView={handleOpenWebView}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            subnetConfig={subnetConfig}
            onUpdateSubnet={setSubnetConfig}
            onAddCustomHost={handleAddCustomHost}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div
        className={`mx-auto flex min-h-screen flex-col ${
          isPhoneFrame ? 'max-w-[440px] border-x border-slate-800 bg-slate-950 shadow-2xl shadow-slate-950/60' : 'max-w-full'
        }`}
      >
        <AndroidHeader
          activeTab={activeTab}
          isScanning={isScanning}
          onScanToggle={() => {
            if (isScanning) {
              handleStopScan();
              return;
            }

            void handleStartScan();
          }}
          onOpenAbout={() => setShowAboutDialog(true)}
          onOpenManualEntry={() => setShowManualDialog(true)}
          isPhoneFrame={isPhoneFrame}
          onTogglePhoneFrame={() => setIsPhoneFrame((current) => !current)}
          foundCount={devices.length}
          xamppCount={xamppCount}
        />

        {renderMainContent()}

        <AndroidBottomNav
          activeTab={activeTab}
          onChangeTab={(tab) => {
            if (tab === 'about') {
              setShowAboutDialog(true);
              return;
            }
            setActiveTab(tab);
          }}
          favoritesCount={favorites.length}
        />
      </div>

      {showAboutDialog && <AboutDialog onClose={() => setShowAboutDialog(false)} />}

      {showManualDialog && (
        <ManualAddressDialog
          initialAddress="192.168.1.45:80/dashboard/"
          onClose={() => setShowManualDialog(false)}
          onOpenWebView={(url, title, isXampp) => {
            handleOpenWebView(url, title, {
              id: `manual-${Date.now()}`,
              name: title,
              folderName: 'manual-project',
              url,
              type: isXampp ? 'Custom PHP' : 'HTML/JS',
            });
          }}
          onAddCustomHost={handleAddCustomHost}
          onAddToFavorites={(project) => {
            handleToggleFavorite(project);
          }}
        />
      )}
    </div>
  );
}

export default App;