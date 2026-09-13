export interface LanDevice {
  id: string;
  ip: string;
  mac: string;
  hostname: string;
  vendor: string;
  isOnline: boolean;
  latencyMs: number;
  openPorts: number[];
  isXampp: boolean;
  serverSoftware?: string;
  phpVersion?: string;
  xamppModules?: string[];
  osType?: 'Windows' | 'Linux' | 'macOS' | 'Android' | 'Router' | 'Unknown';
  projects?: XamppProject[];
  discoveredAt: string;
  isCustom?: boolean;
}

export interface XamppProject {
  id: string;
  name: string;
  folderName: string;
  url: string;
  type: 'WordPress' | 'Laravel' | 'Custom PHP' | 'HTML/JS' | 'phpMyAdmin' | 'API Backend';
  lastModified?: string;
  size?: string;
  description?: string;
}

export interface FavoriteProject {
  id: string;
  name: string;
  url: string;
  deviceIp: string;
  deviceName: string;
  serverSoftware?: string;
  type: string;
  notes?: string;
  savedAt: string;
}

export interface SubnetConfig {
  networkPrefix: string; // e.g., '192.168.1'
  mask: string; // '255.255.255.0'
  cidr: number; // 24
  gateway: string; // '192.168.1.1'
  startHost: number; // 1
  endHost: number; // 254
}

export interface ManualAddressEntry {
  id: string;
  url: string;
  host: string;
  port: number;
  path: string;
  name: string;
  isXampp: boolean;
  timestamp: string;
}

export type AppTab = 'scanner' | 'favorites' | 'network' | 'about';
