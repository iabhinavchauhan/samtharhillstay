import React, { useState } from 'react';
import { Monitor, Tablet, Smartphone, ExternalLink, X, RefreshCw } from 'lucide-react';

export default function LivePreviewModal({ isOpen, onClose, previewData, onPublish }) {
  const [device, setDevice] = useState('desktop');
  const [key, setKey] = useState(1);

  if (!isOpen) return null;

  const deviceWidths = {
    desktop: 'w-full',
    tablet: 'w-[768px]',
    mobile: 'w-[390px]'
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-[#07130e] text-white">
      {/* Top Bar Controls */}
      <div className="h-16 border-b border-white/10 px-6 flex items-center justify-between bg-[#0d1f17]">
        <div className="flex items-center gap-4">
          <span className="font-bold text-sm tracking-wide text-[#caa34b] flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            Live Preview Mode (Draft State)
          </span>

          <div className="hidden sm:flex items-center bg-[#0a1711] p-1 rounded-xl border border-white/10">
            <button
              onClick={() => setDevice('desktop')}
              className={`p-1.5 rounded-lg flex items-center gap-1.5 text-xs transition ${
                device === 'desktop' ? 'bg-[#caa34b] text-[#10281e] font-bold' : 'text-white/60 hover:text-white'
              }`}
              title="Desktop View"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Desktop</span>
            </button>
            <button
              onClick={() => setDevice('tablet')}
              className={`p-1.5 rounded-lg flex items-center gap-1.5 text-xs transition ${
                device === 'tablet' ? 'bg-[#caa34b] text-[#10281e] font-bold' : 'text-white/60 hover:text-white'
              }`}
              title="Tablet View"
            >
              <Tablet className="w-3.5 h-3.5" />
              <span>Tablet</span>
            </button>
            <button
              onClick={() => setDevice('mobile')}
              className={`p-1.5 rounded-lg flex items-center gap-1.5 text-xs transition ${
                device === 'mobile' ? 'bg-[#caa34b] text-[#10281e] font-bold' : 'text-white/60 hover:text-white'
              }`}
              title="Mobile View"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setKey((k) => k + 1)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition text-xs flex items-center gap-1.5"
            title="Reload Preview Frame"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Refresh</span>
          </button>

          {onPublish && (
            <button
              onClick={() => {
                onPublish();
                onClose();
              }}
              className="px-4 py-2 bg-[#caa34b] hover:bg-[#d8b85e] text-[#10281e] text-xs font-bold rounded-xl transition shadow-md"
            >
              Publish Now
            </button>
          )}

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Frame Container */}
      <div className="flex-1 bg-[#050d09] p-4 flex items-center justify-center overflow-auto">
        <div
          className={`${deviceWidths[device]} h-full max-h-[92vh] bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 border border-white/20 relative`}
        >
          {/* We point iframe to /?preview=true so the preview frame loads draft context */}
          <iframe
            key={key}
            src="/?preview=true"
            title="Website Live Preview"
            className="w-full h-full border-0 bg-[#faf8f1]"
          />
        </div>
      </div>
    </div>
  );
}

