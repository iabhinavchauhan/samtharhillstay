import React, { useState, useEffect } from 'react';
import { Upload, Trash2, Search, Check, Copy, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { useAuth } from './AuthContext';
import { apiFetch } from '../utils/api';

export default function MediaLibrary({ onSelectImage, selectMode = false }) {
  const { token } = useAuth();
  const [media, setMedia] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [error, setError] = useState('');

  const fetchMedia = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/api/admin/media', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setMedia(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Failed to load media.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('altText', file.name);

    try {
      const res = await apiFetch('/api/admin/media/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      
      await fetchMedia();
      if (selectMode && onSelectImage) {
        onSelectImage(data.media.url);
      }
    } catch (err) {
      setError(err.message || 'File upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this media file permanently?')) return;

    try {
      const res = await apiFetch(`/api/admin/media/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete media');
      setMedia(media.filter((item) => item.id !== id));
    } catch (err) {
      alert(err.message);
    }
  };

  const copyUrl = (url, id, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(window.location.origin + url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredMedia = media.filter((m) =>
    (m.filename || '').toLowerCase().includes(search.toLowerCase()) ||
    (m.alt_text || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#10281e]/80 p-5 rounded-2xl border border-white/10">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-[#caa34b]" />
            Image & Media Library
          </h2>
          <p className="text-xs text-white/60 mt-1">
            Upload, browse, inspect, and select persistent images for all website sections and components.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <label className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#caa34b] hover:bg-[#d8b85e] text-[#10281e] font-semibold text-xs rounded-xl cursor-pointer transition shadow-md w-full sm:w-auto">
            <Upload className="w-4 h-4" />
            <span>{uploading ? 'Uploading...' : 'Upload New Image'}</span>
            <input
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              onChange={handleUpload}
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search media by filename or alt text..."
          className="w-full pl-10 pr-4 py-2.5 bg-[#0a1711] border border-white/10 rounded-xl text-white placeholder-white/40 text-xs focus:outline-none focus:border-[#caa34b]"
        />
      </div>

      {loading ? (
        <div className="py-12 text-center text-white/50 text-sm">Loading media items...</div>
      ) : filteredMedia.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-white/10 rounded-2xl p-8">
          <ImageIcon className="w-12 h-12 text-white/20 mx-auto mb-3" />
          <p className="text-sm text-white/60 font-medium">No media items uploaded yet.</p>
          <p className="text-xs text-white/40 mt-1">Upload a photo to see it here and use it across the website.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredMedia.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                if (selectMode && onSelectImage) {
                  onSelectImage(item.url);
                }
              }}
              className={`group relative rounded-xl border border-white/10 bg-[#0a1711] overflow-hidden flex flex-col cursor-pointer transition hover:border-[#caa34b] ${
                selectMode ? 'ring-2 ring-transparent hover:ring-[#caa34b]' : ''
              }`}
            >
              <div className="h-36 w-full bg-black/40 overflow-hidden relative">
                <img
                  src={item.url}
                  alt={item.alt_text || item.filename}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
                {selectMode && (
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                    <span className="px-3 py-1 bg-[#caa34b] text-[#10281e] text-xs font-bold rounded-lg shadow">
                      Select Image
                    </span>
                  </div>
                )}
              </div>

              <div className="p-2.5 flex-1 flex flex-col justify-between">
                <p className="text-[11px] font-medium text-white truncate" title={item.filename}>
                  {item.filename}
                </p>
                <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5 text-[10px] text-white/50">
                  <span>{(item.size / 1024).toFixed(0)} KB</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={(e) => copyUrl(item.url, item.id, e)}
                      title="Copy URL"
                      className="p-1 rounded hover:bg-white/10 text-white/70 hover:text-white transition"
                    >
                      {copiedId === item.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      onClick={(e) => handleDelete(item.id, e)}
                      title="Delete Image"
                      className="p-1 rounded hover:bg-red-500/20 text-red-400 transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

