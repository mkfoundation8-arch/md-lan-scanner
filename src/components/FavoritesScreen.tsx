import { useState } from 'react';
import { FavoriteProject } from '../types';
import {
  Star,
  Globe,
  Trash2,
  ExternalLink,
  Edit3,
  Check,
  Download,
  FolderGit2,
  Server,
  Flame,
  Search
} from 'lucide-react';

interface FavoritesScreenProps {
  favorites: FavoriteProject[];
  onOpenWebView: (url: string, title: string) => void;
  onRemoveFavorite: (id: string) => void;
  onUpdateNotes: (id: string, notes: string) => void;
  onSwitchToScanner: () => void;
}

export function FavoritesScreen({
  favorites,
  onOpenWebView,
  onRemoveFavorite,
  onUpdateNotes,
  onSwitchToScanner,
}: FavoritesScreenProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const handleStartEdit = (fav: FavoriteProject) => {
    setEditingId(fav.id);
    setNoteDraft(fav.notes || '');
  };

  const handleSaveNote = (id: string) => {
    onUpdateNotes(id, noteDraft);
    setEditingId(null);
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(favorites, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `md_lan_scanner_favorites_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const filteredFavorites = favorites.filter((fav) => {
    if (filterType !== 'all' && fav.type !== filterType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        fav.name.toLowerCase().includes(q) ||
        fav.url.toLowerCase().includes(q) ||
        fav.deviceName.toLowerCase().includes(q) ||
        (fav.notes && fav.notes.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div id="favorites-screen" className="flex-1 overflow-y-auto pb-24 p-4 space-y-4">
      {/* Header bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
            <h2 className="text-base font-bold text-white">Favorite XAMPP Projects</h2>
            <span className="bg-amber-500/20 text-amber-300 text-xs px-2 py-0.5 rounded-full font-bold border border-amber-500/30">
              {favorites.length}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Bookmarked local servers, phpMyAdmin instances, and development sites.
          </p>
        </div>

        {favorites.length > 0 && (
          <button
            onClick={handleExportJson}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer border border-slate-700 self-start sm:self-auto"
            title="Export favorites as JSON"
          >
            <Download className="w-3.5 h-3.5 text-teal-400" />
            <span>Export Backup</span>
          </button>
        )}
      </div>

      {/* Search and Filter */}
      {favorites.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search saved projects, notes, or IPs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto text-xs pb-1 sm:pb-0">
            {['all', 'WordPress', 'phpMyAdmin', 'Laravel', 'Custom PHP'].map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-2.5 py-1.5 rounded-xl font-medium whitespace-nowrap transition-colors cursor-pointer ${
                  filterType === t
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {t === 'all' ? 'All Types' : t}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Favorites List */}
      {favorites.length === 0 ? (
        <div className="text-center py-16 px-4 bg-slate-900/40 rounded-2xl border border-dashed border-slate-800">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-3">
            <Star className="w-6 h-6 text-amber-400" />
          </div>
          <h3 className="text-sm font-bold text-white mb-1">No Saved Favorites Yet</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mb-4 leading-relaxed">
            When you discover XAMPP Apache servers on your Wi-Fi subnet, tap the star icon next to any htdocs project or server to pin it here for instant 1-tap WebView access!
          </p>
          <button
            onClick={onSwitchToScanner}
            className="px-4 py-2 rounded-xl bg-teal-500 text-slate-950 text-xs font-bold shadow hover:bg-teal-400 cursor-pointer"
          >
            Explore LAN Scanner
          </button>
        </div>
      ) : filteredFavorites.length === 0 ? (
        <div className="text-center py-10 bg-slate-900/40 rounded-2xl border border-slate-800">
          <p className="text-xs text-slate-400">No favorites match your current search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredFavorites.map((fav) => (
            <div
              key={fav.id}
              id={`fav-card-${fav.id}`}
              className="bg-slate-900 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-4 transition-all shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
                    <Flame className="w-5 h-5 text-amber-400" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-white truncate">{fav.name}</h4>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-medium">
                        {fav.type}
                      </span>
                    </div>

                    <p className="text-xs text-teal-400 font-mono truncate mt-0.5">
                      {fav.url}
                    </p>

                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                      <span>Host: <strong className="text-slate-300">{fav.deviceName}</strong> ({fav.deviceIp})</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {/* Open in WebView */}
                  <button
                    onClick={() => onOpenWebView(fav.url, fav.name)}
                    className="px-3 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer shadow"
                    title="Launch project in in-app Android WebView"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>WebView</span>
                  </button>

                  {/* External tab */}
                  <a
                    href={fav.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700"
                    title="Open in System Browser"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  {/* Remove */}
                  <button
                    onClick={() => onRemoveFavorite(fav.id)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors border border-slate-700 cursor-pointer"
                    title="Remove Favorite"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Notes Section */}
              <div className="bg-slate-950/70 rounded-xl p-2.5 border border-slate-800/80 text-xs">
                {editingId === fav.id ? (
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={noteDraft}
                      onChange={(e) => setNoteDraft(e.target.value)}
                      placeholder="Add custom developer note or staging memo..."
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-teal-500"
                      autoFocus
                    />
                    <button
                      onClick={() => handleSaveNote(fav.id)}
                      className="p-1.5 bg-teal-500 text-slate-950 rounded-lg hover:bg-teal-400 cursor-pointer"
                      title="Save Note"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between group">
                    <p className="text-[11px] text-slate-400 italic truncate">
                      {fav.notes || 'No notes added. Click edit to add developer memo.'}
                    </p>
                    <button
                      onClick={() => handleStartEdit(fav)}
                      className="text-slate-500 hover:text-slate-300 p-1 rounded hover:bg-slate-800 cursor-pointer"
                      title="Edit note"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
