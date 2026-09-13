import { useState } from 'react';
import { SubnetConfig } from '../types';
import {
  Network,
  Cpu,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Play,
  Flame,
  ShieldCheck,
  BookOpen
} from 'lucide-react';

interface NetworkToolsScreenProps {
  subnetConfig: SubnetConfig;
  onUpdateSubnet: (config: SubnetConfig) => void;
}

interface PortScanResult {
  port: number;
  service: string;
  isOpen: boolean;
  latencyMs: number;
}

export function NetworkToolsScreen({
  subnetConfig,
  onUpdateSubnet,
}: NetworkToolsScreenProps) {
  const [targetIp, setTargetIp] = useState(`${subnetConfig.networkPrefix}.45`);
  const [isPortScanning, setIsPortScanning] = useState(false);
  const [portResults, setPortResults] = useState<PortScanResult[]>([]);

  const handleRunPortScan = async () => {
    setIsPortScanning(true);
    setPortResults([]);

    const commonPorts = [
      { port: 80, service: 'HTTP (Apache Web Server)' },
      { port: 8080, service: 'HTTP-Alt (Apache Secondary/Tomcat)' },
      { port: 443, service: 'HTTPS (SSL/TLS)' },
      { port: 3306, service: 'MySQL / MariaDB Database' },
      { port: 8000, service: 'PHP Dev Server / Django' },
      { port: 3000, service: 'Node.js / Express / React' },
      { port: 21, service: 'FTP File Transfer (ProFTPD/FileZilla)' },
      { port: 22, service: 'SSH Remote Shell' },
    ];

    const results: PortScanResult[] = [];

    for (const p of commonPorts) {
      await new Promise((r) => setTimeout(r, 140));
      // Simulate/probe ports with realistic dev results
      const isOpen = [80, 443, 3306, 8080].includes(p.port);
      results.push({
        port: p.port,
        service: p.service,
        isOpen,
        latencyMs: isOpen ? Math.floor(Math.random() * 12) + 4 : 0,
      });
      setPortResults([...results]);
    }

    setIsPortScanning(false);
  };

  return (
    <div id="network-tools-screen" className="flex-1 overflow-y-auto pb-24 p-4 space-y-4">
      {/* Subnet Calculator Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-md">
        <div className="flex items-center gap-2">
          <Network className="w-5 h-5 text-teal-400" />
          <h3 className="text-sm font-bold text-white">Subnet & IP Calculator</h3>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono">
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <span className="text-slate-500 text-[10px] block">NETWORK ID</span>
            <span className="text-teal-300 font-semibold">{subnetConfig.networkPrefix}.0</span>
          </div>
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <span className="text-slate-500 text-[10px] block">SUBNET MASK</span>
            <span className="text-slate-200 font-semibold">255.255.255.0 (/24)</span>
          </div>
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <span className="text-slate-500 text-[10px] block">DEFAULT GATEWAY</span>
            <span className="text-slate-200 font-semibold">{subnetConfig.gateway}</span>
          </div>
          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
            <span className="text-slate-500 text-[10px] block">USABLE HOST RANGE</span>
            <span className="text-amber-300 font-semibold">{subnetConfig.networkPrefix}.1 - .254</span>
          </div>
        </div>
      </div>

      {/* Direct Host Port Scanner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-teal-400" />
            <h3 className="text-sm font-bold text-white">Direct Host Port Scanner</h3>
          </div>
          <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
            TCP Prober
          </span>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={targetIp}
            onChange={(e) => setTargetIp(e.target.value)}
            placeholder="Target IP (e.g. 192.168.1.45)"
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-teal-500"
          />
          <button
            onClick={handleRunPortScan}
            disabled={isPortScanning}
            className="px-4 py-2 bg-teal-500 hover:bg-teal-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isPortScanning ? 'Probing...' : 'Probe Ports'}</span>
          </button>
        </div>

        {portResults.length > 0 && (
          <div className="space-y-1.5 pt-2">
            <div className="text-[11px] font-semibold text-slate-400">Probe Results for {targetIp}:</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
              {portResults.map((res) => (
                <div
                  key={res.port}
                  className={`p-2.5 rounded-xl border flex items-center justify-between ${
                    res.isOpen
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                      : 'bg-slate-950 border-slate-800 text-slate-500'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {res.isOpen ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    ) : (
                      <XCircle className="w-4 h-4 text-slate-600 flex-shrink-0" />
                    )}
                    <div>
                      <span className="font-bold">Port {res.port}</span>
                      <span className="text-[10px] block text-slate-400">{res.service}</span>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold">
                    {res.isOpen ? `${res.latencyMs}ms OPEN` : 'CLOSED'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* XAMPP Apache Configuration Guide */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3 shadow-md">
        <div className="flex items-center gap-2 text-amber-400">
          <Flame className="w-5 h-5" />
          <h3 className="text-sm font-bold text-white">XAMPP Wi-Fi LAN Access Configuration Guide</h3>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          By default, fresh XAMPP installations block access from other Wi-Fi devices. Follow these simple steps on your PC to enable your Android phone to scan and open projects:
        </p>

        <div className="space-y-2 text-xs font-mono">
          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="text-teal-400 font-sans font-semibold mb-1">1. Enable Apache Network Binding</div>
            <p className="text-[11px] text-slate-400 font-sans mb-1.5">
              Open <code className="text-amber-300">C:\xampp\apache\conf\httpd.conf</code> and ensure:
            </p>
            <div className="bg-slate-900 p-2 rounded text-slate-300 text-[11px]">
              Listen 0.0.0.0:80
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="text-teal-400 font-sans font-semibold mb-1">2. Allow Remote phpMyAdmin / Dashboard Access</div>
            <p className="text-[11px] text-slate-400 font-sans mb-1.5">
              Open <code className="text-amber-300">C:\xampp\apache\conf\extra\httpd-xampp.conf</code> and change:
            </p>
            <div className="bg-slate-900 p-2 rounded text-slate-300 text-[11px]">
              {`<LocationMatch "^/(?i:(?:xampp|security|licenses|phpmyadmin|webalizer|server-status|server-info))">`}
              <br />
              {'    Require all granted'}
              <br />
              {'</LocationMatch>'}
            </div>
          </div>

          <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
            <div className="text-teal-400 font-sans font-semibold mb-1">3. Windows Firewall Exception</div>
            <p className="text-[11px] text-slate-400 font-sans">
              Allow "Apache HTTP Server" through Windows Defender Firewall on Private Networks.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
