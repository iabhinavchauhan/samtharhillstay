import React, { useState } from 'react';
import {
  Palette,
  Type,
  Layout,
  Sliders,
  CheckCircle,
  RotateCcw,
  Sparkles,
  Smartphone,
  Eye
} from 'lucide-react';

export default function ThemeCustomizer({ theme, onChange, onReset }) {
  const [activeTab, setActiveTab] = useState('colors');

  const update = (key, val) => {
    onChange({ ...theme, [key]: val });
  };

  const presetThemes = [
    {
      name: 'Samthar Pine Classic (Default)',
      primaryColor: '#10281e',
      primaryDark: '#0b1d15',
      accentGold: '#caa34b',
      accentGoldHover: '#d8b85e',
      backgroundColor: '#faf8f1',
      textColor: '#1b2b22'
    },
    {
      name: 'Alpine Deep Cedar',
      primaryColor: '#1a332a',
      primaryDark: '#0f201a',
      accentGold: '#d4af37',
      accentGoldHover: '#e5c158',
      backgroundColor: '#f6f4ee',
      textColor: '#15241c'
    },
    {
      name: 'Misty Blue Ridge',
      primaryColor: '#1e2b37',
      primaryDark: '#121c24',
      accentGold: '#38bdf8',
      accentGoldHover: '#60a5fa',
      backgroundColor: '#f8fafc',
      textColor: '#0f172a'
    },
    {
      name: 'Sunset Terracotta',
      primaryColor: '#2b1b17',
      primaryDark: '#1a0e0b',
      accentGold: '#e07a5f',
      accentGoldHover: '#f28482',
      backgroundColor: '#fbf8f5',
      textColor: '#291e1c'
    }
  ];

  const applyPreset = (preset) => {
    onChange({
      ...theme,
      primaryColor: preset.primaryColor,
      primaryDark: preset.primaryDark,
      accentGold: preset.accentGold,
      accentGoldHover: preset.accentGoldHover,
      backgroundColor: preset.backgroundColor,
      textColor: preset.textColor
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#10281e] p-5 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Palette className="w-5 h-5 text-[#caa34b]" />
            Visual Theme & Styling Engine
          </h2>
          <p className="text-xs text-white/60 mt-1">
            Customize global palette colors, typography, border radiuses, and surface styling across the website.
          </p>
        </div>

        <button
          onClick={onReset}
          className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset Theme Defaults
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 gap-2">
        <button
          onClick={() => setActiveTab('colors')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition flex items-center gap-2 ${
            activeTab === 'colors'
              ? 'bg-[#10281e] text-[#caa34b] border-t border-x border-white/10'
              : 'text-white/60 hover:text-white'
          }`}
        >
          <Palette className="w-4 h-4" />
          Color System
        </button>
        <button
          onClick={() => setActiveTab('typography')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition flex items-center gap-2 ${
            activeTab === 'typography'
              ? 'bg-[#10281e] text-[#caa34b] border-t border-x border-white/10'
              : 'text-white/60 hover:text-white'
          }`}
        >
          <Type className="w-4 h-4" />
          Typography & Fonts
        </button>
        <button
          onClick={() => setActiveTab('layout')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition flex items-center gap-2 ${
            activeTab === 'layout'
              ? 'bg-[#10281e] text-[#caa34b] border-t border-x border-white/10'
              : 'text-white/60 hover:text-white'
          }`}
        >
          <Layout className="w-4 h-4" />
          Border Radius & Geometry
        </button>
      </div>

      {/* Tab 1: Colors */}
      {activeTab === 'colors' && (
        <div className="space-y-6">
          {/* Quick Presets */}
          <div className="bg-[#10281e] p-5 rounded-2xl border border-white/10">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white/70 mb-3 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#caa34b]" />
              Designer Color Presets
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {presetThemes.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => applyPreset(preset)}
                  className="p-3 bg-[#0a1711] border border-white/10 hover:border-[#caa34b] rounded-xl text-left transition group cursor-pointer"
                >
                  <p className="text-xs font-semibold text-white group-hover:text-[#caa34b] mb-2 truncate">
                    {preset.name}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-md border border-white/20" style={{ backgroundColor: preset.primaryColor }} />
                    <span className="w-5 h-5 rounded-md border border-white/20" style={{ backgroundColor: preset.accentGold }} />
                    <span className="w-5 h-5 rounded-md border border-white/20" style={{ backgroundColor: preset.backgroundColor }} />
                    <span className="w-5 h-5 rounded-md border border-white/20" style={{ backgroundColor: preset.textColor }} />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Color Pickers Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Primary Dark Green */}
            <div className="bg-[#10281e] p-5 rounded-2xl border border-white/10 space-y-3">
              <label className="block text-xs font-bold uppercase text-white/80">Primary Brand (Forest Green)</label>
              <p className="text-[11px] text-white/50">Used for navigation bars, primary headings, buttons, and headers.</p>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={theme.primaryColor || '#10281e'}
                  onChange={(e) => update('primaryColor', e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer border border-white/20 bg-transparent"
                />
                <input
                  type="text"
                  value={theme.primaryColor || '#10281e'}
                  onChange={(e) => update('primaryColor', e.target.value)}
                  className="flex-1 bg-[#0a1711] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>
            </div>

            {/* Accent Gold */}
            <div className="bg-[#10281e] p-5 rounded-2xl border border-white/10 space-y-3">
              <label className="block text-xs font-bold uppercase text-white/80">Accent Color (Gold / Mustard)</label>
              <p className="text-[11px] text-white/50">Used for call-to-actions, badges, icons, highlights, and stars.</p>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={theme.accentGold || '#caa34b'}
                  onChange={(e) => update('accentGold', e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer border border-white/20 bg-transparent"
                />
                <input
                  type="text"
                  value={theme.accentGold || '#caa34b'}
                  onChange={(e) => update('accentGold', e.target.value)}
                  className="flex-1 bg-[#0a1711] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>
            </div>

            {/* Accent Hover */}
            <div className="bg-[#10281e] p-5 rounded-2xl border border-white/10 space-y-3">
              <label className="block text-xs font-bold uppercase text-white/80">Accent Hover State</label>
              <p className="text-[11px] text-white/50">Hover highlight shade on action buttons and interactive pills.</p>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={theme.accentGoldHover || '#d8b85e'}
                  onChange={(e) => update('accentGoldHover', e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer border border-white/20 bg-transparent"
                />
                <input
                  type="text"
                  value={theme.accentGoldHover || '#d8b85e'}
                  onChange={(e) => update('accentGoldHover', e.target.value)}
                  className="flex-1 bg-[#0a1711] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>
            </div>

            {/* Background Color */}
            <div className="bg-[#10281e] p-5 rounded-2xl border border-white/10 space-y-3">
              <label className="block text-xs font-bold uppercase text-white/80">Website Canvas Background</label>
              <p className="text-[11px] text-white/50">The gentle background wash of the public pages (e.g. warm cream).</p>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={theme.backgroundColor || '#faf8f1'}
                  onChange={(e) => update('backgroundColor', e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer border border-white/20 bg-transparent"
                />
                <input
                  type="text"
                  value={theme.backgroundColor || '#faf8f1'}
                  onChange={(e) => update('backgroundColor', e.target.value)}
                  className="flex-1 bg-[#0a1711] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>
            </div>

            {/* Text Color */}
            <div className="bg-[#10281e] p-5 rounded-2xl border border-white/10 space-y-3">
              <label className="block text-xs font-bold uppercase text-white/80">Primary Body Text Color</label>
              <p className="text-[11px] text-white/50">Default readable typography tone for articles, descriptions, and lists.</p>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={theme.textColor || '#1b2b22'}
                  onChange={(e) => update('textColor', e.target.value)}
                  className="w-10 h-10 rounded-lg cursor-pointer border border-white/20 bg-transparent"
                />
                <input
                  type="text"
                  value={theme.textColor || '#1b2b22'}
                  onChange={(e) => update('textColor', e.target.value)}
                  className="flex-1 bg-[#0a1711] border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Typography */}
      {activeTab === 'typography' && (
        <div className="bg-[#10281e] p-6 rounded-2xl border border-white/10 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase text-white/80 mb-2">
                Display & Heading Font Family
              </label>
              <select
                value={theme.displayFont || 'DM Sans, system-ui, sans-serif'}
                onChange={(e) => update('displayFont', e.target.value)}
                className="w-full bg-[#0a1711] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#caa34b]"
              >
                <option value="DM Sans, system-ui, sans-serif">DM Sans (Clean & Warm Sans)</option>
                <option value="Plus Jakarta Sans, sans-serif">Plus Jakarta Sans (Modern Clean Sans)</option>
                <option value="Inter, sans-serif">Inter (High Legibility Neo-Grotesque)</option>
                <option value="system-ui, sans-serif">System Native Sans</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-white/80 mb-2">
                Body & Interface Font Family
              </label>
              <select
                value={theme.fontFamily || 'Inter, sans-serif'}
                onChange={(e) => update('fontFamily', e.target.value)}
                className="w-full bg-[#0a1711] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#caa34b]"
              >
                <option value="Inter, sans-serif">Inter (Modern & Highly Readable)</option>
                <option value="Plus Jakarta Sans, sans-serif">Plus Jakarta Sans</option>
                <option value="Manrope, sans-serif">Manrope</option>
                <option value="system-ui, sans-serif">System UI</option>
              </select>
            </div>
          </div>

          {/* Sample Typography Preview */}
          <div className="mt-4 p-6 rounded-2xl border border-white/10 bg-[#0a1711] space-y-3">
            <p className="text-[10px] uppercase font-bold text-[#caa34b] tracking-widest">
              Live Type Specimen
            </p>
            <h2
              className="text-2xl font-bold text-white"
              style={{ fontFamily: theme.displayFont }}
            >
              Samthar Hill-Stay Kalimpong
            </h2>
            <p
              className="text-xs text-white/70 leading-relaxed"
              style={{ fontFamily: theme.fontFamily }}
            >
              Quiet mountain stays shaped for slow mornings and view-filled evenings. Handcrafted hill retreats with warm hospitality, regional food, and cozy spaces built for rest.
            </p>
          </div>
        </div>
      )}

      {/* Tab 3: Border Radius & Geometry */}
      {activeTab === 'layout' && (
        <div className="bg-[#10281e] p-6 rounded-2xl border border-white/10 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase text-white/80 mb-2">
                Section & Card Corner Radius: {theme.borderRadius || '20px'}
              </label>
              <input
                type="range"
                min="0"
                max="40"
                step="2"
                value={parseInt(theme.borderRadius) || 20}
                onChange={(e) => update('borderRadius', `${e.target.value}px`)}
                className="w-full accent-[#caa34b] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-white/40 mt-1">
                <span>0px (Sharp)</span>
                <span>20px (Rounded)</span>
                <span>40px (Curved)</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase text-white/80 mb-2">
                Button & Pill Corner Radius: {theme.buttonRadius || '10px'}
              </label>
              <input
                type="range"
                min="0"
                max="99"
                step="2"
                value={parseInt(theme.buttonRadius) || 10}
                onChange={(e) => update('buttonRadius', `${e.target.value}px`)}
                className="w-full accent-[#caa34b] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-white/40 mt-1">
                <span>0px (Square)</span>
                <span>10px (Soft)</span>
                <span>99px (Full Pill)</span>
              </div>
            </div>
          </div>

          {/* Preview Component */}
          <div className="p-6 bg-[#0a1711] rounded-2xl border border-white/10 flex flex-wrap items-center gap-4">
            <div
              className="p-4 bg-[#10281e] text-white text-xs border border-white/15"
              style={{ borderRadius: theme.borderRadius }}
            >
              Sample Card with Radius: <b>{theme.borderRadius}</b>
            </div>
            <button
              className="px-5 py-2.5 font-bold text-xs"
              style={{
                backgroundColor: theme.accentGold,
                color: theme.primaryColor,
                borderRadius: theme.buttonRadius
              }}
            >
              Sample Interactive Button
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

