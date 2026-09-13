import { useState, useEffect, type FormEvent } from 'react';
import {
  ArrowLeft,
  RefreshCw,
  Star,
  ExternalLink,
  ShieldAlert,
  Smartphone,
  Monitor,
  Copy,
  Check,
  Code2,
  Database,
  Flame,
  Globe,
  Terminal,
  FileCode,
  Layers,
  History,
  ChevronDown
} from 'lucide-react';
import { XamppProject, LanDevice } from '../types';
import {
  parseManualAddress,
  saveStoredRecentManualAddress,
  getStoredRecentManualAddresses
} from '../utils/lanScanner';

interface AndroidWebViewProps {
  url: string;
  title: string;
  project?: XamppProject;
  device?: LanDevice;
  onBack: () => void;
  isFavorited: boolean;
  onToggleFavorite: () => void;
}

export function AndroidWebView({
  url: initialUrl,
  title,
  project,
  device,
  onBack,
  isFavorited,
  onToggleFavorite,
}: AndroidWebViewProps) {
  const [currentUrl, setCurrentUrl] = useState(initialUrl);
  const [inputUrl, setInputUrl] = useState(initialUrl);
  const [viewportMode, setViewportMode] = useState<'mobile' | 'responsive'>('mobile');
  const [viewTab, setViewTab] = useState<'preview' | 'inspector' | 'iframe'>('preview');
  const [isCopied, setIsCopied] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<string>('home');
  const [sqlQuery, setSqlQuery] = useState('SELECT * FROM wp_posts LIMIT 5;');
  const [sqlResult, setSqlResult] = useState<any[] | null>(null);
  const [showRecentDropdown, setShowRecentDropdown] = useState(false);
  const [recentAddresses, setRecentAddresses] = useState<any[]>([]);

  useEffect(() => {
    setRecentAddresses(getStoredRecentManualAddresses());
  }, [currentUrl]);

  const handleNavigate = (e: FormEvent) => {
    e.preventDefault();
    let formatted = inputUrl.trim();
    if (!formatted.startsWith('http://') && !formatted.startsWith('https://')) {
      formatted = `http://${formatted}`;
    }
    setCurrentUrl(formatted);
    setInputUrl(formatted);
    setShowRecentDropdown(false);

    const parsed = parseManualAddress(formatted);
    saveStoredRecentManualAddress({
      url: parsed.fullUrl,
      name: parsed.suggestedName,
      host: parsed.host,
      port: parsed.port,
      path: parsed.path,
      isXampp: parsed.isLikelyXampp,
    });
  };

  const handleSelectRecent = (url: string) => {
    setCurrentUrl(url);
    setInputUrl(url);
    setShowRecentDropdown(false);
  };

  const handleCopy = () => {
    navigator.clipboard?.writeText(currentUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleRunSql = () => {
    setSqlResult([
      { id: 1, post_title: 'Welcome to our Local WordPress Staging', post_status: 'publish', post_date: '2026-09-10' },
      { id: 2, post_title: 'Apache VirtualHost Config for Subnet', post_status: 'publish', post_date: '2026-09-09' },
      { id: 3, post_title: 'Testing Mobile Responsive Layouts', post_status: 'draft', post_date: '2026-09-08' },
    ]);
  };

  return (
    <div id="android-webview-container" className="flex-1 flex flex-col bg-slate-950 text-slate-100 h-full overflow-hidden">
      {/* Android WebView Chrome Top Navigation */}
      <div className="bg-slate-900 border-b border-slate-800 p-2.5 space-y-2 z-20 shadow-md">
        <div className="flex items-center gap-2">
          {/* Back to LAN Scanner */}
          <button
            id="btn-webview-back"
            onClick={onBack}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
            title="Return to LAN Scanner"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* URL Bar Form */}
          <form onSubmit={handleNavigate} className="flex-1 flex items-center min-w-0 relative">
            <div className="w-full flex items-center bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 focus-within:border-teal-500 focus-within:ring-1 focus-within:ring-teal-500 transition-all">
              {currentUrl.startsWith('https://') ? (
                <span className="w-2 h-2 rounded-full bg-emerald-400 mr-2 flex-shrink-0" />
              ) : (
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400 mr-2 flex-shrink-0" title="HTTP Local Dev" />
              )}
              <input
                type="text"
                value={inputUrl}
                onChange={(e) => setInputUrl(e.target.value)}
                className="w-full bg-transparent text-xs text-slate-200 font-mono focus:outline-none truncate"
                placeholder="http://192.168.1.45/project"
              />
              {recentAddresses.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowRecentDropdown(!showRecentDropdown)}
                  className="text-slate-500 hover:text-teal-400 p-0.5 ml-1 transition-colors cursor-pointer"
                  title="Show recent addresses"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Recent Addresses Popover */}
            {showRecentDropdown && recentAddresses.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 z-50 max-h-48 overflow-y-auto space-y-1 text-xs">
                <div className="flex items-center justify-between px-1 pb-1 border-b border-slate-800 text-[10px] text-slate-400 font-medium">
                  <span className="flex items-center gap-1">
                    <History className="w-3 h-3 text-teal-400" />
                    Recent Manual Addresses
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowRecentDropdown(false)}
                    className="hover:text-white"
                  >
                    Close
                  </button>
                </div>
                {recentAddresses.map((addr) => (
                  <button
                    key={addr.id}
                    type="button"
                    onClick={() => handleSelectRecent(addr.url)}
                    className="w-full text-left p-1.5 rounded-lg hover:bg-slate-800/80 flex items-center justify-between group transition-colors cursor-pointer"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-[11px] font-semibold text-slate-200 truncate group-hover:text-teal-300">
                        {addr.name}
                      </p>
                      <p className="text-[10px] font-mono text-slate-400 truncate">
                        {addr.url}
                      </p>
                    </div>
                    {addr.isXampp && (
                      <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1 py-0.2 rounded font-medium shrink-0">
                        XAMPP
                      </span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </form>

          {/* Reload button */}
          <button
            onClick={() => {
              const u = currentUrl;
              setCurrentUrl('');
              setTimeout(() => setCurrentUrl(u), 100);
            }}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Reload Page"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          {/* Star Favorite */}
          <button
            id="btn-webview-favorite"
            onClick={onToggleFavorite}
            className={`p-1.5 rounded-xl transition-colors cursor-pointer ${
              isFavorited
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                : 'hover:bg-slate-800 text-slate-400 hover:text-amber-300'
            }`}
            title={isFavorited ? 'Remove from Favorites' : 'Save to Favorites'}
          >
            <Star className={`w-4 h-4 ${isFavorited ? 'fill-amber-400' : ''}`} />
          </button>

          {/* Copy URL */}
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Copy URL to Clipboard"
          >
            {isCopied ? <Check className="w-4 h-4 text-teal-400" /> : <Copy className="w-4 h-4" />}
          </button>

          {/* Open in external tab */}
          <a
            href={currentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Open in System Browser"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {/* View Mode & Diagnostics Tabs */}
        <div className="flex items-center justify-between gap-2 text-xs pt-1 border-t border-slate-800/60">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setViewTab('preview')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                viewTab === 'preview'
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Interactive View</span>
            </button>

            <button
              onClick={() => setViewTab('iframe')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                viewTab === 'iframe'
                  ? 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Raw iFrame</span>
            </button>

            <button
              onClick={() => setViewTab('inspector')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
                viewTab === 'inspector'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>HTTP Headers</span>
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setViewportMode('mobile')}
              className={`p-1 rounded-lg transition-colors cursor-pointer ${
                viewportMode === 'mobile' ? 'bg-slate-800 text-teal-400' : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Android Mobile Viewport (375px)"
            >
              <Smartphone className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewportMode('responsive')}
              className={`p-1 rounded-lg transition-colors cursor-pointer ${
                viewportMode === 'responsive' ? 'bg-slate-800 text-teal-400' : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Full Responsive Viewport"
            >
              <Monitor className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main WebView Content Area */}
      <div className="flex-1 overflow-y-auto bg-slate-950 flex justify-center p-2 sm:p-4">
        <div
          className={`h-full flex flex-col transition-all duration-300 ${
            viewportMode === 'mobile'
              ? 'w-full max-w-[400px] border border-slate-800 shadow-2xl rounded-2xl overflow-hidden bg-slate-900'
              : 'w-full bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden'
          }`}
        >
          {viewTab === 'iframe' ? (
            /* Standard Iframe Loading */
            <div className="h-full flex flex-col">
              <div className="bg-slate-950 px-3 py-1.5 border-b border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
                <span>Direct Frame Target: {currentUrl}</span>
                <span className="text-amber-400 font-mono text-[10px]">CORS/Mixed-Content Aware</span>
              </div>
              <iframe
                src={currentUrl}
                title={title}
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                className="w-full flex-1 bg-white border-0"
              />
            </div>
          ) : viewTab === 'inspector' ? (
            /* Developer Inspector / Server Response Headers */
            <div className="p-4 space-y-4 font-mono text-xs overflow-y-auto">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800 text-teal-400 font-bold">
                <Terminal className="w-4 h-4" />
                <span>HTTP Response Headers & Diagnostics</span>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-slate-400">
                  <span>HTTP Status:</span>
                  <span className="text-emerald-400 font-bold">200 OK (Keep-Alive)</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Server Engine:</span>
                  <span className="text-amber-300 font-semibold">{device?.serverSoftware || 'Apache/2.4.58 (Win64)'}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>PHP Runtime:</span>
                  <span className="text-indigo-300">{device?.phpVersion || 'PHP 8.2.12'}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Content-Type:</span>
                  <span className="text-slate-300">text/html; charset=UTF-8</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>X-Powered-By:</span>
                  <span className="text-slate-300">{device?.phpVersion || 'PHP/8.2.12'}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Document Root:</span>
                  <span className="text-teal-300">C:/xampp/htdocs/{project?.folderName || ''}</span>
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 space-y-1">
                <div className="text-slate-400 font-semibold mb-1">Active Apache Modules:</div>
                <div className="flex flex-wrap gap-1 text-[10px]">
                  {['mod_rewrite', 'mod_ssl', 'mod_headers', 'mod_proxy', 'mod_alias', 'mod_authz_core', 'mod_dir', 'mod_mime'].map((mod) => (
                    <span key={mod} className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded">
                      {mod}
                    </span>
                  ))}
                </div>
              </div>

              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="text-slate-400 font-semibold mb-1">Android WebView Client Settings:</div>
                <p className="text-[11px] text-slate-500">
                  JavaScript: Enabled • Mixed Content Mode: MIXED_CONTENT_ALWAYS_ALLOW • DOM Storage: Enabled • Cache: LOAD_DEFAULT
                </p>
              </div>
            </div>
          ) : (
            /* Interactive View: Renders high-fidelity project interface based on project type */
            <div className="flex-1 flex flex-col bg-slate-950 text-slate-100 overflow-y-auto">
              {currentUrl.includes('phpmyadmin') ? (
                /* phpMyAdmin Database Panel */
                <div className="p-4 space-y-4">
                  <div className="bg-gradient-to-r from-amber-600/30 to-orange-600/30 border border-amber-500/30 p-3 rounded-xl flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Database className="w-5 h-5 text-amber-400" />
                      <div>
                        <h4 className="text-xs font-bold text-white">phpMyAdmin 5.2.1</h4>
                        <p className="text-[10px] text-amber-300">Server: 127.0.0.1 via TCP/IP (MariaDB 10.4.32)</p>
                      </div>
                    </div>
                    <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-500/30">
                      root@localhost
                    </span>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                      <span>Databases in MySQL</span>
                      <span className="text-[10px] text-slate-500">Port 3306</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                      {['information_schema', 'wp_staging_db', 'laravel_ecommerce', 'client_crm_dev', 'phpmyadmin', 'test'].map((db) => (
                        <div key={db} className="bg-slate-950 p-2 rounded-lg border border-slate-800 flex items-center gap-1.5 text-slate-300">
                          <Database className="w-3.5 h-3.5 text-teal-400" />
                          <span className="truncate">{db}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                      <span>SQL Query Console</span>
                      <button
                        onClick={handleRunSql}
                        className="px-2.5 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg text-[11px] cursor-pointer"
                      >
                        Execute SQL
                      </button>
                    </div>
                    <textarea
                      value={sqlQuery}
                      onChange={(e) => setSqlQuery(e.target.value)}
                      rows={2}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 font-mono text-xs text-amber-300 focus:outline-none focus:border-amber-500"
                    />

                    {sqlResult && (
                      <div className="mt-2 space-y-1">
                        <span className="text-[10px] text-slate-400 font-semibold">Query Output ({sqlResult.length} rows):</span>
                        <div className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-[11px] font-mono space-y-1.5 overflow-x-auto">
                          {sqlResult.map((row) => (
                            <div key={row.id} className="flex items-center justify-between border-b border-slate-850 pb-1">
                              <span className="text-teal-300">#{row.id} {row.post_title}</span>
                              <span className="text-slate-400 text-[10px]">{row.post_status}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : currentUrl.includes('dashboard') ? (
                /* XAMPP Dashboard & Welcome Screen */
                <div className="p-4 space-y-4">
                  <div className="bg-slate-900 border border-amber-500/40 rounded-2xl p-4 shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                        <Flame className="w-6 h-6 text-amber-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                          Apache Friends XAMPP
                          <span className="text-[10px] bg-teal-500/20 text-teal-300 px-2 py-0.5 rounded">v8.2.12</span>
                        </h3>
                        <p className="text-xs text-slate-400">
                          Apache + MariaDB + PHP + Perl for local network development
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-4 text-xs font-mono">
                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-slate-500 text-[10px] block">APACHE STATUS</span>
                        <span className="text-emerald-400 font-bold">Running (Port 80, 443)</span>
                      </div>
                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                        <span className="text-slate-500 text-[10px] block">MYSQL STATUS</span>
                        <span className="text-emerald-400 font-bold">Running (Port 3306)</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-2">
                    <h4 className="text-xs font-semibold text-slate-300">Quick Diagnostics</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <button
                        onClick={() => {
                          setInputUrl(`${currentUrl}phpinfo.php`);
                          setCurrentUrl(`${currentUrl}phpinfo.php`);
                        }}
                        className="p-2.5 bg-slate-950 hover:bg-slate-850 rounded-xl border border-slate-800 text-left cursor-pointer transition-colors"
                      >
                        <div className="font-semibold text-teal-300">phpinfo() Viewer</div>
                        <div className="text-[10px] text-slate-500">Inspect PHP modules, ini settings & extensions</div>
                      </button>
                      <button
                        onClick={() => {
                          setInputUrl(`http://${device?.ip || '192.168.1.45'}/phpmyadmin/`);
                          setCurrentUrl(`http://${device?.ip || '192.168.1.45'}/phpmyadmin/`);
                        }}
                        className="p-2.5 bg-slate-950 hover:bg-slate-850 rounded-xl border border-slate-800 text-left cursor-pointer transition-colors"
                      >
                        <div className="font-semibold text-amber-300">phpMyAdmin Database</div>
                        <div className="text-[10px] text-slate-500">Manage MySQL databases & run queries</div>
                      </button>
                    </div>
                  </div>
                </div>
              ) : currentUrl.includes('api-storefront') ? (
                /* Laravel REST API Tester */
                <div className="p-4 space-y-4">
                  <div className="bg-red-500/10 border border-red-500/30 p-3 rounded-xl flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-red-300">Laravel 11 REST API</h4>
                      <p className="text-[10px] text-slate-400">Base URL: {currentUrl}</p>
                    </div>
                    <span className="text-[10px] bg-red-500/20 text-red-300 px-2 py-0.5 rounded font-mono">
                      PHP 8.2
                    </span>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-2">
                    <div className="text-xs font-semibold text-slate-300">Test API Endpoint:</div>
                    <div className="flex gap-2">
                      <span className="bg-emerald-500/20 text-emerald-300 font-mono text-xs px-2.5 py-1.5 rounded-lg border border-emerald-500/30 font-bold">
                        GET
                      </span>
                      <input
                        type="text"
                        readOnly
                        value="/api/v1/products"
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2 text-xs font-mono text-slate-300"
                      />
                    </div>

                    <div className="mt-2 bg-slate-950 rounded-xl p-3 border border-slate-800 font-mono text-[11px] text-slate-300 space-y-1">
                      <div className="text-slate-500">// Response 200 OK:</div>
                      <pre className="text-teal-300 whitespace-pre-wrap">
{`{
  "status": "success",
  "data": [
    { "id": 101, "name": "Mechanical Wireless Keyboard", "price": 89.99, "stock": 42 },
    { "id": 102, "name": "Ultra-Wide Gaming Monitor 34-inch", "price": 449.00, "stock": 8 },
    { "id": 103, "name": "Precision Ergonomic Mouse", "price": 54.50, "stock": 25 }
  ],
  "meta": { "total": 3, "latency_ms": 12 }
}`}
                      </pre>
                    </div>
                  </div>
                </div>
              ) : currentUrl.includes('client-wp') ? (
                /* WordPress Site Preview */
                <div className="p-4 space-y-4">
                  {/* WP Admin Bar */}
                  <div className="bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-2 text-slate-300 font-medium">
                      <span className="font-bold text-teal-400">W</span>
                      <span>Client WP Staging</span>
                    </div>
                    <span className="text-amber-400 font-mono text-[10px]">Dashboard • Edit Page</span>
                  </div>

                  {/* WP Hero & Articles */}
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3">
                    <h2 className="text-base font-bold text-white">Modern Living & Architecture</h2>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Welcome to the staging build of the corporate blog. This WordPress theme has been optimized for high performance Apache HTTP/2 environments.
                    </p>
                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Posted by Admin</span>
                      <span>September 10, 2026</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                      <h4 className="text-xs font-semibold text-slate-200 mb-1">Local Development Notes</h4>
                      <p className="text-[11px] text-slate-400">
                        Database connection configured to localhost:3306 (user: root, db: wp_staging_db). Permalinks set to /%postname%/.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                /* Generic Web Preview for Custom Projects */
                <div className="p-4 space-y-4">
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-center space-y-3">
                    <Globe className="w-10 h-10 text-teal-400 mx-auto" />
                    <div>
                      <h3 className="text-sm font-bold text-white">{title || 'Local Apache Web Service'}</h3>
                      <p className="text-xs text-teal-400 font-mono mt-0.5">{currentUrl}</p>
                    </div>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      Connected to local LAN host running {device?.serverSoftware || 'Apache Web Server'}.
                    </p>

                    <div className="pt-2 flex justify-center gap-2">
                      <a
                        href={currentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Launch in System Browser</span>
                      </a>
                      <button
                        onClick={() => setViewTab('inspector')}
                        className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                      >
                        <Terminal className="w-3.5 h-3.5" />
                        <span>Inspect Headers</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
