import { useState, useEffect, useRef } from 'react';
import { LanDevice, XamppProject, FavoriteProject, SubnetConfig, AppTab } from './types';
import { INITIAL_LAN_DEVICES } from './data/mockDevices';
import { detectLocalIpAddress, getStoredFavorites, saveStoredFavorites } from './utils/lanScanner';
import { AndroidStatusBar } from './components/AndroidStatusBar';
import { AndroidHeader } from './components/AndroidHeader';
import { AndroidBottomNav } from './components/AndroidBottomNav';
import { LanDiscoveryScreen } from './components/LanDiscoveryScreen';
import { AndroidWebView } from './components/AndroidWebView';
import { FavoritesScreen } from './components/FavoritesScreen';
import { NetworkToolsScreen } from './components/NetworkToolsScreen';
import { AboutDialog } from './components/AboutDialog';
import { ManualAddressDialog } from './components/ManualAddressDialog';

export default function App() {
  const [activeTab, setActiveTab] = useState<AppTab>('scanner');
  const [devices, setDevices] = useState<LanDevice[]>(INITIAL_LAN_DEVICES);
  const [favorites, setFavorites] = useState<FavoriteProject[]>([]);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(254);
  const [scannedIpText, setScannedIpText] = useState<string>('192.168.1.254');
  const [isPhoneFrame, setIsPhoneFrame] = useState<boolean>(false);
  const [showAbout, setShowAbout] = useState<boolean>(false);
  const [showManualModal, setShowManualModal] = useState<boolean>(false);

  // Active WebView state
  const [activeWebView, setActiveWebView] = useState<{
    url: string;
    title: string;
    project?: XamppProject;
    device?: LanDevice;
  } | null>(null);

  // Subnet Configuration
  const [subnetConfig, setSubnetConfig] = useState<SubnetConfig>({
    networkPrefix: '192.168.1',
    mask: '255.255.255.0',
    cidr: 24,
    gateway: '192.168.1.1',
    startHost: 1,
    endHost: 254,
  });

  const scanIntervalRef = useRef<any>(null);

  // Load favorites & detect initial local IP
  useEffect(() => {
    const saved = getStoredFavorites();
    if (saved && saved.length > 0) {
      setFavorites(saved);
    } else {
      // Preload 2 initial favorites so the user sees immediate value
      const defaultFavs: FavoriteProject[] = [
        {
          id: 'proj-pma',
          name: 'phpMyAdmin Database Panel',
          url: 'http://192.168.1.45/phpmyadmin/',
          deviceIp: '192.168.1.45',
          deviceName: 'DESKTOP-DEV-STUDIO',
          serverSoftware: 'Apache/2.4.58 (Win64) PHP/8.2.12',
          type: 'phpMyAdmin',
          notes: 'Main local MariaDB database administration dashboard.',
          savedAt: new Date().toISOString(),
        },
        {
          id: 'proj-wordpress',
          name: 'Client WordPress Blog & CMS',
          url: 'http://192.168.1.45/client-wp/',
          deviceIp: '192.168.1.45',
          deviceName: 'DESKTOP-DEV-STUDIO',
          serverSoftware: 'Apache/2.4.58 (Win64) PHP/8.2.12',
          type: 'WordPress',
          notes: 'Corporate client staging website.',
          savedAt: new Date().toISOString(),
        },
      ];
      setFavorites(defaultFavs);
      saveStoredFavorites(defaultFavs);
    }

    // Try detecting local IP from browser
    detectLocalIpAddress().then((ip) => {
      const parts = ip.split('.');
      if (parts.length === 4) {
        const prefix = `${parts[0]}.${parts[1]}.${parts[2]}`;
        setSubnetConfig((prev) => ({
          ...prev,
          networkPrefix: prefix,
          gateway: `${prefix}.1`,
        }));
      }
    });
  }, []);

  // Save favorites whenever they change
  const handleToggleFavorite = (project: {
    id: string;
    name: string;
    url: string;
    deviceIp: string;
    deviceName: string;
    type: string;
    serverSoftware?: string;
  }) => {
    setFavorites((prev) => {
      const exists = prev.some((f) => f.url === project.url);
      let updated: FavoriteProject[];
      if (exists) {
        updated = prev.filter((f) => f.url !== project.url);
      } else {
        const newFav: FavoriteProject = {
          id: project.id,
          name: project.name,
          url: project.url,
          deviceIp: project.deviceIp,
          deviceName: project.deviceName,
          type: project.type,
          serverSoftware: project.serverSoftware,
          savedAt: new Date().toISOString(),
          notes: '',
        };
        updated = [newFav, ...prev];
      }
      saveStoredFavorites(updated);
      return updated;
    });
  };

  const handleRemoveFavorite = (id: string) => {
    setFavorites((prev) => {
      const updated = prev.filter((f) => f.id !== id);
      saveStoredFavorites(updated);
      return updated;
    });
  };

  const handleUpdateNotes = (id: string, notes: string) => {
    setFavorites((prev) => {
      const updated = prev.map((f) => (f.id === id ? { ...f, notes } : f));
      saveStoredFavorites(updated);
      return updated;
    });
  };

  // Start LAN Scan Loop
  const handleStartScan = () => {
    if (isScanning) return;
    setIsScanning(true);
    setScanProgress(1);

    if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);

    let currentHost = 1;
    scanIntervalRef.current = setInterval(() => {
      currentHost += 3;
      if (currentHost > 254) currentHost = 254;

      setScanProgress(currentHost);
      setScannedIpText(`${subnetConfig.networkPrefix}.${currentHost}`);

      if (currentHost >= 254) {
        clearInterval(scanIntervalRef.current);
        setIsScanning(false);
      }
    }, 50);
  };

  const handleStopScan = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
    }
    setIsScanning(false);
  };

  // Open WebView
  const handleOpenWebView = (
    url: string,
    title: string,
    project?: XamppProject,
    device?: LanDevice
  ) => {
    setActiveWebView({
      url,
      title,
      project,
      device,
    });
  };

  const handleBackFromWebView = () => {
    setActiveWebView(null);
  };

  // Add Custom Host
  const handleAddCustomHost = (
    ip: string,
    port: number,
    name: string,
    isXampp: boolean,
    path?: string
  ) => {
    const primaryPath = path && path !== '/' ? path : (isXampp ? '/dashboard/' : '/');
    const primaryUrl = `http://${ip}:${port}${primaryPath.startsWith('/') ? primaryPath : `/${primaryPath}`}`;
    const primaryProject: XamppProject = {
      id: `proj-custom-${Date.now()}-primary`,
      name: name || 'Custom Target Project',
      folderName: primaryPath.replace(/^\/+|\/+$/g, '') || 'root',
      url: primaryUrl,
      type: isXampp ? 'Custom PHP' : 'HTML/JS',
      description: `Target entry on ${ip}:${port}`,
    };

    const newDevice: LanDevice = {
      id: `custom-dev-${Date.now()}`,
      ip,
      mac: 'FA:C2:55:' + Math.floor(Math.random() * 89 + 10) + ':DE:91',
      hostname: name,
      vendor: 'Custom Local Host',
      isOnline: true,
      latencyMs: Math.floor(Math.random() * 10) + 4,
      openPorts: [port, 443, 3306],
      isXampp,
      serverSoftware: isXampp
        ? 'Apache/2.4.58 (Win64) OpenSSL/3.1.3 PHP/8.2.12'
        : 'HTTP Web Server',
      phpVersion: isXampp ? 'PHP 8.2.12' : undefined,
      xamppModules: isXampp ? ['Apache', 'MySQL', 'phpMyAdmin'] : undefined,
      osType: isXampp ? 'Windows' : 'Linux',
      discoveredAt: 'Just now',
      isCustom: true,
      projects: isXampp
        ? [
            primaryProject,
            {
              id: `proj-custom-${Date.now()}-1`,
              name: 'XAMPP Dashboard',
              folderName: 'dashboard',
              url: `http://${ip}:${port}/dashboard/`,
              type: 'Custom PHP',
              description: 'Apache Friends XAMPP Server welcome panel.',
            },
            {
              id: `proj-custom-${Date.now()}-2`,
              name: 'phpMyAdmin',
              folderName: 'phpmyadmin',
              url: `http://${ip}:${port}/phpmyadmin/`,
              type: 'phpMyAdmin',
              description: 'MySQL database web client.',
            },
          ]
        : [primaryProject],
    };

    setDevices((prev) => [newDevice, ...prev]);
  };

  const xamppCount = devices.filter((d) => d.isXampp).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-start selection:bg-teal-500 selection:text-slate-950 font-sans">
      {/* Outer Shell Wrapper (Supports Android Phone Frame or Fluid Full-Screen) */}
      <div
        className={`w-full transition-all duration-300 flex flex-col ${
          isPhoneFrame
            ? 'max-w-[430px] my-4 rounded-[42px] border-[10px] border-slate-850 shadow-2xl overflow-hidden min-h-[850px] max-h-[92vh] bg-slate-950 ring-1 ring-slate-700'
            : 'max-w-4xl min-h-screen bg-slate-950 border-x border-slate-900 shadow-2xl'
        }`}
      >
        {/* Android System Status Bar */}
        <AndroidStatusBar wifiSsid={`Wi-Fi: ${subnetConfig.networkPrefix}.x`} />

        {/* In-App WebView Mode */}
        {activeWebView ? (
          <AndroidWebView
            url={activeWebView.url}
            title={activeWebView.title}
            project={activeWebView.project}
            device={activeWebView.device}
            onBack={handleBackFromWebView}
            isFavorited={favorites.some((f) => f.url === activeWebView.url)}
            onToggleFavorite={() => {
              handleToggleFavorite({
                id: activeWebView.project?.id || `fav-${Date.now()}`,
                name: activeWebView.title,
                url: activeWebView.url,
                deviceIp: activeWebView.device?.ip || '192.168.1.45',
                deviceName: activeWebView.device?.hostname || 'Local Apache Server',
                type: activeWebView.project?.type || 'Custom PHP',
                serverSoftware: activeWebView.device?.serverSoftware,
              });
            }}
          />
        ) : (
          /* Normal App Mode with Top Bar, Tabs & Bottom Navigation */
          <div className="flex-1 flex flex-col overflow-hidden relative">
            <AndroidHeader
              activeTab={activeTab}
              isScanning={isScanning}
              onScanToggle={isScanning ? handleStopScan : handleStartScan}
              onOpenAbout={() => setShowAbout(true)}
              onOpenManualEntry={() => setShowManualModal(true)}
              isPhoneFrame={isPhoneFrame}
              onTogglePhoneFrame={() => setIsPhoneFrame(!isPhoneFrame)}
              foundCount={devices.length}
              xamppCount={xamppCount}
            />

            {/* Main Tab Screen Content */}
            {activeTab === 'scanner' && (
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
            )}

            {activeTab === 'favorites' && (
              <FavoritesScreen
                favorites={favorites}
                onOpenWebView={(url, title) => handleOpenWebView(url, title)}
                onRemoveFavorite={handleRemoveFavorite}
                onUpdateNotes={handleUpdateNotes}
                onSwitchToScanner={() => setActiveTab('scanner')}
              />
            )}

            {activeTab === 'network' && (
              <NetworkToolsScreen
                subnetConfig={subnetConfig}
                onUpdateSubnet={setSubnetConfig}
              />
            )}

            {activeTab === 'about' && (
              <div className="flex-1 overflow-y-auto pb-24 p-4">
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center space-y-4 max-w-md mx-auto">
                  <div className="w-24 h-24 rounded-3xl overflow-hidden shadow-2xl ring-4 ring-teal-500/40 p-0.5 bg-slate-950 mx-auto">
                    <img
                      src="/launcher-icon.png"
                      alt="MD LAN Scanner Launcher Icon"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover rounded-[22px]"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/src/assets/images/lan_scanner_icon_1789163820136.jpg';
                      }}
                    />
                  </div>
                  <h2 className="text-xl font-extrabold text-white">MD LAN Scanner</h2>
                  <p className="text-xs text-teal-400 font-mono font-bold">Android Material 3 • v2.4.0</p>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Designed for web developers and network administrators to seamlessly scan Wi-Fi subnets, auto-detect Apache XAMPP servers, explore htdocs projects, and open local test sites in an embedded Android WebView.
                  </p>
                  <div className="pt-2">
                    <button
                      onClick={() => setActiveTab('scanner')}
                      className="px-6 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs transition-colors shadow cursor-pointer"
                    >
                      Open LAN Discovery
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Android MD3 Bottom Navigation Bar */}
            <AndroidBottomNav
              activeTab={activeTab}
              onChangeTab={setActiveTab}
              favoritesCount={favorites.length}
            />
          </div>
        )}

        {/* About & Launcher Icon Dialog */}
        {showAbout && <AboutDialog onClose={() => setShowAbout(false)} />}

        {/* Global Manual Server & URL Entry Dialog */}
        {showManualModal && (
          <ManualAddressDialog
            onClose={() => setShowManualModal(false)}
            onOpenWebView={(url, title, isXampp) => {
              handleOpenWebView(url, title);
            }}
            onAddCustomHost={(ip, port, name, isXampp, path) => {
              handleAddCustomHost(ip, port, name, isXampp, path);
            }}
            onAddToFavorites={handleToggleFavorite}
          />
        )}
      </div>
    </div>
  );
}
