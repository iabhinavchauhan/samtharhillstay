import React, { useState } from 'react';
import { Image, X } from 'lucide-react';
import MediaLibrary from './MediaLibrary';

export default function ImagePickerModal({ isOpen, onClose, onSelect }) {
  const [directUrl, setDirectUrl] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-[#10281e] border border-white/15 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <Image className="w-5 h-5 text-[#caa34b]" />
            <h3 className="font-bold text-base">Select or Upload Image</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 bg-[#0a1711] border-b border-white/10 flex items-center gap-2">
          <input
            type="text"
            placeholder="Or enter direct image URL (Unsplash, external link, or path)..."
            value={directUrl}
            onChange={(e) => setDirectUrl(e.target.value)}
            className="flex-1 bg-[#10281e] border border-white/10 rounded-xl px-4 py-2 text-xs text-white placeholder-white/40 focus:outline-none focus:border-[#caa34b]"
          />
          <button
            onClick={() => {
              if (directUrl.trim()) {
                onSelect(directUrl.trim());
                onClose();
              }
            }}
            disabled={!directUrl.trim()}
            className="px-4 py-2 bg-[#caa34b] text-[#10281e] font-semibold text-xs rounded-xl disabled:opacity-40"
          >
            Use Direct URL
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <MediaLibrary
            selectMode={true}
            onSelectImage={(url) => {
              onSelect(url);
              onClose();
            }}
          />
        </div>
      </div>
    </div>
  );
}

