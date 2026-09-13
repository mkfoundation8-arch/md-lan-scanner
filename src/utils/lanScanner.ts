import { LanDevice, XamppProject } from '../types';

/**
 * Attempts to detect the user's local IP address via WebRTC ICE candidates.
 * Note: Modern browsers may obfuscate local IPs with mDNS .local hostnames,
 * so we provide a safe fallback to 192.168.1.100.
 */
export async function detectLocalIpAddress(): Promise<string> {
  return new Promise((resolve) => {
    try {
      const pc = new RTCPeerConnection({
        iceServers: [],
      });
      pc.createDataChannel('');
      pc.createOffer()
        .then((offer) => pc.setLocalDescription(offer))
        .catch(() => resolve('192.168.1.189'));

      const timeout = setTimeout(() => {
        try {
          pc.close();
        } catch {}
        resolve('192.168.1.189');
      }, 1500);

      pc.onicecandidate = (event) => {
        if (!event || !event.candidate || !event.candidate.candidate) return;
        const line = event.candidate.candidate;
        // Search for IPv4 pattern
        const match = line.match(/([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3})/);
        if (match && match[1] && !match[1].startsWith('127.') && match[1] !== '0.0.0.0') {
          clearTimeout(timeout);
          try {
            pc.close();
          } catch {}
          resolve(match[1]);
        }
      };
    } catch {
      resolve('192.168.1.189');
    }
  });
}

/**
 * Attempt to ping/probe an HTTP endpoint with a timeout
 */
export async function probeHttpEndpoint(
  ip: string,
  port: number = 80,
  timeoutMs: number = 1200
): Promise<{ reachable: boolean; latencyMs: number; isApache?: boolean; isXampp?: boolean }> {
  const startTime = performance.now();
  const url = `http://${ip}:${port}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    // Mode 'no-cors' allows detecting if an HTTP host responds even if CORS isn't permitted
    const res = await fetch(url, {
      method: 'GET',
      mode: 'no-cors',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    const latencyMs = Math.round(performance.now() - startTime);
    return {
      reachable: true,
      latencyMs,
      isApache: true,
      isXampp: true,
    };
  } catch (err: any) {
    clearTimeout(timeoutId);
    // If it aborted due to timeout, it's unreachable
    if (err.name === 'AbortError') {
      return { reachable: false, latencyMs: timeoutMs };
    }
    // Often in browsers, a network reset or connection refused fails fast (latency < 100ms),
    // whereas an open server might throw CORS TypeError after responding.
    const latencyMs = Math.round(performance.now() - startTime);
    return { reachable: latencyMs < 800, latencyMs };
  }
}

/**
 * Local storage key for saved favorites
 */
const FAVORITES_STORAGE_KEY = 'md_lan_scanner_favorites_v1';
const RECENT_MANUAL_STORAGE_KEY = 'md_lan_scanner_recent_manual_v1';

export function getStoredFavorites(): any[] {
  try {
    const raw = localStorage.getItem(FAVORITES_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load favorites from localStorage', e);
    return [];
  }
}

export function saveStoredFavorites(favorites: any[]): void {
  try {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
  } catch (e) {
    console.error('Failed to save favorites to localStorage', e);
  }
}

export interface ParsedAddress {
  fullUrl: string;
  protocol: 'http:' | 'https:';
  host: string;
  port: number;
  path: string;
  suggestedName: string;
  isLikelyXampp: boolean;
}

/**
 * Parses user-typed manual addresses like:
 * - "192.168.1.50"
 * - "192.168.1.50:8080"
 * - "192.168.1.50/dashboard"
 * - "localhost:80/phpmyadmin"
 * - "http://10.0.0.15:8000/api"
 * - "https://myserver.local"
 */
export function parseManualAddress(raw: string): ParsedAddress {
  let cleaned = raw.trim();
  if (!cleaned) {
    cleaned = '192.168.1.1';
  }

  let protocol: 'http:' | 'https:' = 'http:';
  if (cleaned.startsWith('https://')) {
    protocol = 'https:';
    cleaned = cleaned.substring(8);
  } else if (cleaned.startsWith('http://')) {
    protocol = 'http:';
    cleaned = cleaned.substring(7);
  }

  // Extract path if present
  let hostAndPort = cleaned;
  let path = '/';
  const firstSlashIdx = cleaned.indexOf('/');
  if (firstSlashIdx !== -1) {
    hostAndPort = cleaned.substring(0, firstSlashIdx);
    path = cleaned.substring(firstSlashIdx);
    if (!path.startsWith('/')) path = `/${path}`;
  }

  // Extract host & port
  let host = hostAndPort;
  let port = protocol === 'https:' ? 443 : 80;

  if (hostAndPort.includes(':')) {
    const parts = hostAndPort.split(':');
    host = parts[0];
    const parsedPort = parseInt(parts[1], 10);
    if (!isNaN(parsedPort) && parsedPort > 0 && parsedPort <= 65535) {
      port = parsedPort;
    }
  }

  // Normalise full URL
  const portSegment = (protocol === 'http:' && port === 80) || (protocol === 'https:' && port === 443)
    ? ''
    : `:${port}`;

  const fullUrl = `${protocol}//${host}${portSegment}${path.startsWith('/') ? path : `/${path}`}`;

  // Check if likely XAMPP
  const isLikelyXampp =
    path.toLowerCase().includes('dashboard') ||
    path.toLowerCase().includes('phpmyadmin') ||
    path.toLowerCase().includes('xampp') ||
    path.toLowerCase().includes('webalizer') ||
    port === 80 ||
    port === 8080;

  // Auto-generate a friendly name
  let suggestedName = host;
  if (path !== '/' && path !== '') {
    const slug = path.replace(/^\/+|\/+$/g, '').split('/')[0];
    if (slug) {
      suggestedName = `${slug.toUpperCase()} on ${host}`;
    }
  } else if (port !== 80 && port !== 443) {
    suggestedName = `Local Server ${host}:${port}`;
  } else {
    suggestedName = `Host ${host}`;
  }

  return {
    fullUrl,
    protocol,
    host,
    port,
    path,
    suggestedName,
    isLikelyXampp,
  };
}

export function getStoredRecentManualAddresses(): any[] {
  try {
    const raw = localStorage.getItem(RECENT_MANUAL_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to load recent manual addresses', e);
    return [];
  }
}

export function saveStoredRecentManualAddress(entry: {
  url: string;
  name: string;
  host: string;
  port: number;
  path: string;
  isXampp: boolean;
}): any[] {
  try {
    const existing = getStoredRecentManualAddresses();
    const filtered = existing.filter((item: any) => item.url !== entry.url);
    const updated = [
      {
        id: `manual-${Date.now()}`,
        ...entry,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
      ...filtered,
    ].slice(0, 10); // Keep last 10 entries

    localStorage.setItem(RECENT_MANUAL_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to save recent manual address', e);
    return [];
  }
}

export function clearStoredRecentManualAddresses(): void {
  try {
    localStorage.removeItem(RECENT_MANUAL_STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear recent manual addresses', e);
  }
}

