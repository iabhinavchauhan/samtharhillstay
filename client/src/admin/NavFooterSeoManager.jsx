import React, { useState } from 'react';
import {
  Menu,
  Phone,
  Share2,
  FileText,
  Search,
  Plus,
  Trash2,
  ExternalLink,
  Save,
  Globe
} from 'lucide-react';
import ImagePickerModal from './ImagePickerModal';

export default function NavFooterSeoManager({ content, onChange }) {
  const [activeTab, setActiveTab] = useState('nav');
  const [imageModalOpen, setImageModalOpen] = useState(false);

  const nav = content.navigation || {};
  const footer = content.footer || {};
  const contact = content.contact || {};
  const seo = content.seo || {};

  const updateNav = (key, val) => {
    onChange({ ...content, navigation: { ...nav, [key]: val } });
  };

  const updateFooter = (key, val) => {
    onChange({ ...content, footer: { ...footer, [key]: val } });
  };

  const updateContact = (key, val) => {
    onChange({ ...content, contact: { ...contact, [key]: val } });
  };

  const updateSeo = (key, val) => {
    onChange({ ...content, seo: { ...seo, [key]: val } });
  };

  return (
    <div className="space-y-6">
      {/* Tab Selector */}
      <div className="flex border-b border-white/10 gap-2">
        <button
          onClick={() => setActiveTab('nav')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition flex items-center gap-2 ${
            activeTab === 'nav'
              ? 'bg-[#10281e] text-[#caa34b] border-t border-x border-white/10'
              : 'text-white/60 hover:text-white'
          }`}
        >
          <Menu className="w-4 h-4" />
          Header & Navigation
        </button>

        <button
          onClick={() => setActiveTab('contact')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition flex items-center gap-2 ${
            activeTab === 'contact'
              ? 'bg-[#10281e] text-[#caa34b] border-t border-x border-white/10'
              : 'text-white/60 hover:text-white'
          }`}
        >
          <Phone className="w-4 h-4" />
          Contact & Social Channels
        </button>

        <button
          onClick={() => setActiveTab('footer')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition flex items-center gap-2 ${
            activeTab === 'footer'
              ? 'bg-[#10281e] text-[#caa34b] border-t border-x border-white/10'
              : 'text-white/60 hover:text-white'
          }`}
        >
          <Share2 className="w-4 h-4" />
          Footer Content & Links
        </button>

        <button
          onClick={() => setActiveTab('seo')}
          className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition flex items-center gap-2 ${
            activeTab === 'seo'
              ? 'bg-[#10281e] text-[#caa34b] border-t border-x border-white/10'
              : 'text-white/60 hover:text-white'
          }`}
        >
          <Globe className="w-4 h-4" />
          SEO & Meta Tags
        </button>
      </div>

      {/* 1. Header & Navigation */}
      {activeTab === 'nav' && (
        <div className="bg-[#10281e] p-6 rounded-2xl border border-white/10 space-y-6">
          <h3 className="text-base font-bold text-white">Header & Top Navbar Settings</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1">Logo Brand Text</label>
              <input
                type="text"
                value={nav.logoText || 'Samthar'}
                onChange={(e) => updateNav('logoText', e.target.value)}
                className="w-full bg-[#0a1711] border border-white/10 rounded-xl px-4 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1">Logo Subtitle</label>
              <input
                type="text"
                value={nav.logoSubtitle || 'Kalimpong · West Bengal'}
                onChange={(e) => updateNav('logoSubtitle', e.target.value)}
                className="w-full bg-[#0a1711] border border-white/10 rounded-xl px-4 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1">Header Button Label</label>
              <input
                type="text"
                value={nav.ctaText || 'Book Your Stay'}
                onChange={(e) => updateNav('ctaText', e.target.value)}
                className="w-full bg-[#0a1711] border border-white/10 rounded-xl px-4 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1">Header Button Link</label>
              <input
                type="text"
                value={nav.ctaLink || '/#contact'}
                onChange={(e) => updateNav('ctaLink', e.target.value)}
                className="w-full bg-[#0a1711] border border-white/10 rounded-xl px-4 py-2 text-xs text-white"
              />
            </div>
          </div>

          {/* Navigation Links Table */}
          <div className="pt-4 border-t border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase text-white/80">Menu Navigation Links</h4>
              <button
                type="button"
                onClick={() => {
                  const links = nav.links || [];
                  updateNav('links', [...links, { label: 'New Link', to: '/#', visible: true }]);
                }}
                className="px-3 py-1.5 bg-[#caa34b] text-[#10281e] font-semibold text-xs rounded-lg flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Nav Item
              </button>
            </div>

            <div className="space-y-2">
              {(nav.links || []).map((link, idx) => (
                <div key={idx} className="flex items-center gap-3 bg-[#0a1711] p-3 rounded-xl border border-white/10">
                  <input
                    type="text"
                    value={link.label}
                    onChange={(e) => {
                      const updated = [...nav.links];
                      updated[idx].label = e.target.value;
                      updateNav('links', updated);
                    }}
                    placeholder="Label"
                    className="flex-1 bg-[#10281e] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white font-medium"
                  />
                  <input
                    type="text"
                    value={link.to}
                    onChange={(e) => {
                      const updated = [...nav.links];
                      updated[idx].to = e.target.value;
                      updateNav('links', updated);
                    }}
                    placeholder="URL path (e.g. /#homestays)"
                    className="flex-1 bg-[#10281e] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const updated = nav.links.filter((_, i) => i !== idx);
                      updateNav('links', updated);
                    }}
                    className="text-red-400 hover:text-red-300 p-1.5"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. Contact & Social */}
      {activeTab === 'contact' && (
        <div className="bg-[#10281e] p-6 rounded-2xl border border-white/10 space-y-6">
          <h3 className="text-base font-bold text-white">Contact Channels & Info</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1">Phone Display</label>
              <input
                type="text"
                value={contact.phone || ''}
                onChange={(e) => updateContact('phone', e.target.value)}
                className="w-full bg-[#0a1711] border border-white/10 rounded-xl px-4 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1">Phone Dial Link (tel:)</label>
              <input
                type="text"
                value={contact.phoneLink || ''}
                onChange={(e) => updateContact('phoneLink', e.target.value)}
                className="w-full bg-[#0a1711] border border-white/10 rounded-xl px-4 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1">WhatsApp Number</label>
              <input
                type="text"
                value={contact.whatsapp || ''}
                onChange={(e) => updateContact('whatsapp', e.target.value)}
                className="w-full bg-[#0a1711] border border-white/10 rounded-xl px-4 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1">WhatsApp Direct Link</label>
              <input
                type="text"
                value={contact.whatsappLink || ''}
                onChange={(e) => updateContact('whatsappLink', e.target.value)}
                className="w-full bg-[#0a1711] border border-white/10 rounded-xl px-4 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1">Official Email Address</label>
              <input
                type="text"
                value={contact.email || ''}
                onChange={(e) => updateContact('email', e.target.value)}
                className="w-full bg-[#0a1711] border border-white/10 rounded-xl px-4 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1">Instagram Handle</label>
              <input
                type="text"
                value={contact.instagram || ''}
                onChange={(e) => updateContact('instagram', e.target.value)}
                className="w-full bg-[#0a1711] border border-white/10 rounded-xl px-4 py-2 text-xs text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/70 mb-1">Physical Location / Address</label>
            <input
              type="text"
              value={contact.address || ''}
              onChange={(e) => updateContact('address', e.target.value)}
              className="w-full bg-[#0a1711] border border-white/10 rounded-xl px-4 py-2 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/70 mb-1">Brochure PDF Download URL</label>
            <input
              type="text"
              value={contact.brochureUrl || '/samthar-brochure.pdf'}
              onChange={(e) => updateContact('brochureUrl', e.target.value)}
              className="w-full bg-[#0a1711] border border-white/10 rounded-xl px-4 py-2 text-xs text-white"
            />
          </div>
        </div>
      )}

      {/* 3. Footer Content */}
      {activeTab === 'footer' && (
        <div className="bg-[#10281e] p-6 rounded-2xl border border-white/10 space-y-6">
          <h3 className="text-base font-bold text-white">Footer Layout & Descriptions</h3>

          <div>
            <label className="block text-xs font-semibold text-white/70 mb-1">About Paragraph</label>
            <textarea
              rows={3}
              value={footer.aboutText || ''}
              onChange={(e) => updateFooter('aboutText', e.target.value)}
              className="w-full bg-[#0a1711] border border-white/10 rounded-xl px-4 py-2 text-xs text-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1">Copyright Note</label>
              <input
                type="text"
                value={footer.copyrightText || ''}
                onChange={(e) => updateFooter('copyrightText', e.target.value)}
                className="w-full bg-[#0a1711] border border-white/10 rounded-xl px-4 py-2 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1">Footer Tagline Accent</label>
              <input
                type="text"
                value={footer.tagline || ''}
                onChange={(e) => updateFooter('tagline', e.target.value)}
                className="w-full bg-[#0a1711] border border-white/10 rounded-xl px-4 py-2 text-xs text-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* 4. SEO Settings */}
      {activeTab === 'seo' && (
        <div className="bg-[#10281e] p-6 rounded-2xl border border-white/10 space-y-6">
          <h3 className="text-base font-bold text-white">Search Engine Optimization (SEO) & Metadata</h3>

          <div>
            <label className="block text-xs font-semibold text-white/70 mb-1">Meta Browser Title</label>
            <input
              type="text"
              value={seo.siteTitle || ''}
              onChange={(e) => updateSeo('siteTitle', e.target.value)}
              className="w-full bg-[#0a1711] border border-white/10 rounded-xl px-4 py-2 text-xs text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/70 mb-1">Meta Description (150-160 characters)</label>
            <textarea
              rows={3}
              value={seo.metaDescription || ''}
              onChange={(e) => updateSeo('metaDescription', e.target.value)}
              className="w-full bg-[#0a1711] border border-white/10 rounded-xl px-4 py-2 text-xs text-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1">Open Graph / Social Sharing Image</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={seo.ogImage || ''}
                  onChange={(e) => updateSeo('ogImage', e.target.value)}
                  className="flex-1 bg-[#0a1711] border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
                />
                <button
                  type="button"
                  onClick={() => setImageModalOpen(true)}
                  className="px-3 py-2 bg-[#caa34b] text-[#10281e] text-xs font-bold rounded-xl"
                >
                  Choose
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1">Canonical URL</label>
              <input
                type="text"
                value={seo.canonicalUrl || ''}
                onChange={(e) => updateSeo('canonicalUrl', e.target.value)}
                className="w-full bg-[#0a1711] border border-white/10 rounded-xl px-4 py-2 text-xs text-white"
              />
            </div>
          </div>
        </div>
      )}

      <ImagePickerModal
        isOpen={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        onSelect={(url) => updateSeo('ogImage', url)}
      />
    </div>
  );
}

