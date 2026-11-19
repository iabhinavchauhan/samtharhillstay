import { useEffect, useState } from 'react';
import { Monitor, Tablet, Smartphone, X, RefreshCw } from 'lucide-react';

export default function LivePreviewModal({ isOpen, onClose, onPublish }) {
  const [device, setDevice] = useState(() => window.matchMedia('(max-width: 640px)').matches ? 'mobile' : 'desktop');
  const [key, setKey] = useState(1);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 640px)');
    const syncDevice = (event) => setDevice(event.matches ? 'mobile' : 'desktop');
    media.addEventListener('change', syncDevice);
    return () => media.removeEventListener('change', syncDevice);
  }, []);

  if (!isOpen) return null;

  const deviceWidths = {
    desktop: 'w-full',
    tablet: 'w-full max-w-[768px]',
    mobile: 'w-full max-w-[390px]'
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col overflow-hidden bg-[#07130e] text-white">
      {/* Top Bar Controls */}
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-[#0d1f17] px-3 py-2 sm:h-16 sm:flex-nowrap sm:gap-4 sm:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4">
          <span className="flex min-w-0 items-center gap-2 text-xs font-bold tracking-wide text-[#caa34b] sm:text-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="truncate">Live Preview Mode (Draft State)</span>
          </span>

          <div className="flex shrink-0 items-center rounded-xl border border-white/10 bg-[#0a1711] p-1">
            <button
              onClick={() => setDevice('desktop')}
              className={`p-1.5 rounded-lg flex items-center gap-1.5 text-xs transition ${
                device === 'desktop' ? 'bg-[#caa34b] text-[#10281e] font-bold' : 'text-white/60 hover:text-white'
              }`}
              title="Desktop View"
            >
              <Monitor className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Desktop</span>
            </button>
            <button
              onClick={() => setDevice('tablet')}
              className={`p-1.5 rounded-lg flex items-center gap-1.5 text-xs transition ${
                device === 'tablet' ? 'bg-[#caa34b] text-[#10281e] font-bold' : 'text-white/60 hover:text-white'
              }`}
              title="Tablet View"
            >
              <Tablet className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Tablet</span>
            </button>
            <button
              onClick={() => setDevice('mobile')}
              className={`p-1.5 rounded-lg flex items-center gap-1.5 text-xs transition ${
                device === 'mobile' ? 'bg-[#caa34b] text-[#10281e] font-bold' : 'text-white/60 hover:text-white'
              }`}
              title="Mobile View"
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Mobile</span>
            </button>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <button
            onClick={() => setKey((k) => k + 1)}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition text-xs flex items-center gap-1.5"
            title="Reload Preview Frame"
          >
            <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Refresh</span>
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
      <div className="flex min-h-0 flex-1 items-stretch justify-center overflow-auto bg-[#050d09] p-2 sm:items-center sm:p-4">
        <div
          className={`${deviceWidths[device]} min-h-full bg-white shadow-2xl sm:h-full sm:min-h-0 sm:max-h-[92vh] sm:rounded-2xl overflow-hidden transition-all duration-300 border border-white/20 relative`}
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

