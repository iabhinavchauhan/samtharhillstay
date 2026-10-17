import React, { useState, useEffect } from 'react';
import { History, RotateCcw, ShieldAlert, CheckCircle, Clock, User, Download, UploadCloud, AlertCircle } from 'lucide-react';
import { useAuth } from './AuthContext';

export default function RevisionBackup({ onRestoreSuccess }) {
  const { token } = useAuth();
  const [revisions, setRevisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');
  const [error, setError] = useState('');

  const fetchRevisions = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/revisions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setRevisions(Array.isArray(data) ? data : []);
    } catch (err) {
      setError('Failed to fetch revisions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRevisions();
  }, []);

  const handleRestore = async (id, note) => {
    const confirmed = window.confirm(
      `Are you sure you want to restore Revision #${id}?\n\n"${note || 'No note'}"\n\nThis will safely overwrite your current live and draft configurations with this previous snapshot. (A new backup revision will also be created automatically).`
    );
    if (!confirmed) return;

    try {
      setActionMsg('Restoring snapshot...');
      const res = await fetch(`/api/admin/revisions/${id}/restore`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Restore failed');

      setActionMsg(`Success: Revision #${id} restored!`);
      await fetchRevisions();
      if (onRestoreSuccess) onRestoreSuccess();
    } catch (err) {
      setError(err.message);
    } finally {
      setTimeout(() => setActionMsg(''), 4000);
    }
  };

  const handleDownloadBackup = async () => {
    try {
      const res = await fetch('/api/admin/backup', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `samthar-website-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to download backup JSON');
    }
  };

  const handleUploadBackup = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const confirmed = window.confirm(
      'Warning: Restoring from this backup file will update all website pages, homestays, prices, colors and sections. Proceed?'
    );
    if (!confirmed) return;

    try {
      const text = await file.text();
      const backupJson = JSON.parse(text);

      const res = await fetch('/api/admin/restore-backup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ backup: backupJson })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to restore');

      setActionMsg('External backup successfully restored!');
      await fetchRevisions();
      if (onRestoreSuccess) onRestoreSuccess();
    } catch (err) {
      setError(err.message || 'Invalid JSON file');
    }
  };

  const handleResetToDefault = async () => {
    const confirmed = window.confirm(
      'CRITICAL CONFIRMATION: Reset entire website to factory default template? This will revert all custom headings, homestays, prices, and color customizations to initial clean values.'
    );
    if (!confirmed) return;

    try {
      const res = await fetch('/api/admin/content/reset-default', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setActionMsg('Website reset to default system configuration.');
      await fetchRevisions();
      if (onRestoreSuccess) onRestoreSuccess();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-8">
      {/* Backup & Restore Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-[#10281e] border border-white/10 p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-white font-bold text-sm flex items-center gap-2">
              <Download className="w-4 h-4 text-[#caa34b]" />
              Export Full Backup
            </h3>
            <p className="text-xs text-white/60 mt-1">
              Download complete database snapshot (JSON) including all pages, colors, homestays, and navigation.
            </p>
          </div>
          <button
            onClick={handleDownloadBackup}
            className="mt-4 px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl flex items-center justify-center gap-2 transition"
          >
            <Download className="w-4 h-4" />
            Download Backup JSON
          </button>
        </div>

        <div className="bg-[#10281e] border border-white/10 p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-white font-bold text-sm flex items-center gap-2">
              <UploadCloud className="w-4 h-4 text-emerald-400" />
              Restore Backup File
            </h3>
            <p className="text-xs text-white/60 mt-1">
              Upload a previously exported backup file to restore complete website configuration.
            </p>
          </div>
          <label className="mt-4 px-4 py-2.5 bg-[#caa34b] hover:bg-[#d8b85e] text-[#10281e] font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer transition">
            <UploadCloud className="w-4 h-4" />
            <span>Select JSON File</span>
            <input type="file" accept=".json" onChange={handleUploadBackup} className="hidden" />
          </label>
        </div>

        <div className="bg-[#10281e] border border-red-500/20 p-5 rounded-2xl flex flex-col justify-between">
          <div>
            <h3 className="text-red-300 font-bold text-sm flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              Reset to Factory Default
            </h3>
            <p className="text-xs text-white/60 mt-1">
              Revert all website sections, components, colors, and content back to the pristine clean defaults.
            </p>
          </div>
          <button
            onClick={handleResetToDefault}
            className="mt-4 px-4 py-2.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 font-semibold text-xs rounded-xl flex items-center justify-center gap-2 border border-red-500/30 transition"
          >
            Reset Everything to Default
          </button>
        </div>
      </div>

      {actionMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-400" />
          <span>{actionMsg}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Revision History List */}
      <div className="bg-[#10281e] border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <History className="w-5 h-5 text-[#caa34b]" />
              Revision History & Snapshots
            </h3>
            <p className="text-xs text-white/60 mt-0.5">
              Every time you publish changes, an audit snapshot is recorded. You can rollback anytime.
            </p>
          </div>
          <span className="text-xs text-[#caa34b] font-semibold bg-[#caa34b]/10 px-3 py-1 rounded-full border border-[#caa34b]/30">
            {revisions.length} Snapshots Saved
          </span>
        </div>

        {loading ? (
          <div className="py-8 text-center text-white/40 text-xs">Loading revision snapshots...</div>
        ) : revisions.length === 0 ? (
          <div className="py-8 text-center text-white/40 text-xs">No revisions found yet.</div>
        ) : (
          <div className="divide-y divide-white/5 overflow-hidden">
            {revisions.map((rev, index) => (
              <div
                key={rev.id}
                className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-white/[0.02] px-2 rounded-xl transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-[#caa34b] bg-white/5 px-2 py-0.5 rounded">
                      #{rev.id}
                    </span>
                    <span className="text-sm font-semibold text-white">
                      {rev.note || 'Published changes update'}
                    </span>
                    {index === 0 && (
                      <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-full border border-emerald-500/40">
                        Current Live
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-white/50">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(rev.created_at).toLocaleString()}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5" />
                      {rev.created_by || 'Admin'}
                    </span>
                    <span>Size: {(rev.size / 1024).toFixed(1)} KB</span>
                  </div>
                </div>

                <button
                  onClick={() => handleRestore(rev.id, rev.note)}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 transition"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Restore This Snapshot
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

