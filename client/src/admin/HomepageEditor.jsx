import { useContext, useState } from 'react';
import {
  Home,
  Plus,
  Trash2,
  Edit3,
  MoveUp,
  MoveDown,
  Sparkles,
  Layers
} from 'lucide-react';
import ImagePickerModal from './ImagePickerModal';
import { occasionThemes } from '../utils/occasionThemes'
import { resolveImage } from '../utils/resolveImage'
import { ResortContext } from '../context/ResortContext.js'
import { homestays as defaultHomestays } from '../data/resortData'

const heroOccasionThemes = occasionThemes.filter((theme) => ['default', 'christmas'].includes(theme.value))

// Default welcome popup values (matching server/db.js defaults)
const defaultWelcomePopup = {
  visible: true,
  kicker: 'Welcome',
  title: 'Samthar Hillstay',
  tagline: 'YOUR HOME ABOVE THE HILLS',
  description: 'Find your quiet corner in the Kalimpong hills. Stay with welcoming local hosts, wake to mountain views, and take each day at your own pace.',
  highlights: [
    'Scenic mountain views',
    'Authentic homestay experience',
    'Comfortable accommodation',
    'Peaceful surroundings',
    'Family-friendly',
    'Perfect for couples and groups',
  ],
  primaryButtonText: 'Explore Homestays',
  primaryButtonLink: '/#homestays',
  secondaryButtonText: 'Maybe later',
  logo: '/favicon.png',
}

export default function HomepageEditor({ content, onChange, onNavigate }) {
  const { reviews = [] } = useContext(ResortContext)
  const [activeSectionKey, setActiveSectionKey] = useState('hero');
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imageTargetCallback, setImageTargetCallback] = useState(null);

  const homepage = content.homepage || {};
  const welcomePopup = homepage.welcomePopup || defaultWelcomePopup

  const openImagePicker = (callback) => {
    setImageTargetCallback(() => callback);
    setImageModalOpen(true);
  };

  const handleImageSelected = (url) => {
    if (imageTargetCallback) {
      imageTargetCallback(url);
    }
  };

  const updateHp = (section, key, val) => {
    const updated = {
      ...homepage,
      [section]: {
        ...homepage[section],
        [key]: val
      }
    };
    onChange({ ...content, homepage: updated });
  };

  // Section Ordering & Visibility
  const defaultOrder = [
    'hero',
    'welcomePopup',
    'stays',
    'reasons',
    'experiences',
    'destinations',
    'clusters',
    'gallery',
    'reviews',
    'contactPage'
  ];
  
  // Merge saved order with defaults, ensuring welcomePopup is included
  const savedOrder = homepage.sectionsOrder || [];
  const hasWelcomePopup = savedOrder.includes('welcomePopup');
  const mergedOrder = hasWelcomePopup
    ? savedOrder
    : [...savedOrder.filter(s => defaultOrder.includes(s)), ...defaultOrder.filter(s => !savedOrder.includes(s))];
  
  const configuredOrder = mergedOrder.filter((section) => section !== 'faq' && section !== 'contact');
  const sectionsOrder = [...configuredOrder, ...['stays', 'reviews'].filter((section) => !configuredOrder.includes(section))];

  const moveSection = (idx, dir) => {
    const targetIdx = idx + dir;
    if (targetIdx < 0 || targetIdx >= sectionsOrder.length) return;
    const newOrder = [...sectionsOrder];
    const [moved] = newOrder.splice(idx, 1);
    newOrder.splice(targetIdx, 0, moved);
    onChange({
      ...content,
      homepage: {
        ...homepage,
        sectionsOrder: newOrder
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#10281e] p-5 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Home className="w-5 h-5 text-[#caa34b]" />
            Homepage Section Builder & Content Manager
          </h2>
          <p className="text-xs text-white/60 mt-1">
            Edit text, headings, hero sliders, experiences, day trips, and section layouts on the homepage.
          </p>
        </div>
      </div>

      {/* Section Reordering Pill Navigator */}
      <div className="bg-[#10281e] p-4 rounded-2xl border border-white/10">
        <h3 className="text-xs font-bold uppercase tracking-wider text-white/70 mb-3 flex items-center gap-1.5">
          <Layers className="w-4 h-4 text-[#caa34b]" />
          Section Order & Layout Architecture
        </h3>
        <div className="flex flex-wrap gap-2">
          {sectionsOrder.map((sec, idx) => (
            <div
              key={sec}
              onClick={() => setActiveSectionKey(sec)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                activeSectionKey === sec
                  ? 'bg-[#caa34b] text-[#10281e] border-[#caa34b]'
                  : 'bg-[#0a1711] text-white/80 border-white/10 hover:border-white/30'
              }`}
            >
              <span className="capitalize">{sec}</span>
              <div className="flex items-center gap-0.5 ml-1">
                <button
                  type="button"
                  disabled={idx === 0}
                  onClick={(e) => {
                    e.stopPropagation();
                    moveSection(idx, -1);
                  }}
                  className="hover:text-white disabled:opacity-20"
                >
                  <MoveUp className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  disabled={idx === sectionsOrder.length - 1}
                  onClick={(e) => {
                    e.stopPropagation();
                    moveSection(idx, 1);
                  }}
                  className="hover:text-white disabled:opacity-20"
                >
                  <MoveDown className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Editor by Section */}

      {/* 1. HERO SECTION */}
      {activeSectionKey === 'hero' && (
        <div className="bg-[#10281e] p-6 rounded-2xl border border-white/10 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#caa34b]" />
              Hero Banner Section
            </h3>
            <label className="flex items-center gap-2 text-xs text-white/80 cursor-pointer">
              <input
                type="checkbox"
                checked={homepage.hero?.visible !== false}
                onChange={(e) => updateHp('hero', 'visible', e.target.checked)}
                className="rounded accent-[#caa34b]"
              />
              <span>Section Visible on Homepage</span>
            </label>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#0a1711] p-4">
            <label className="block text-xs font-semibold text-white/80 mb-2" htmlFor="hero-occasion-theme">Seasonal hero theme</label>
            <select
              id="hero-occasion-theme"
              value={heroOccasionThemes.some((theme) => theme.value === homepage.hero?.theme) ? homepage.hero.theme : 'default'}
              onChange={(e) => updateHp('hero', 'theme', e.target.value === 'default' ? '' : e.target.value)}
              className="w-full max-w-sm bg-[#10281e] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#caa34b]"
            >
              {heroOccasionThemes.map((theme) => <option key={theme.value} value={theme.value}>{theme.label}</option>)}
            </select>
            <p className="mt-2 text-[11px] text-white/50">Changes the hero styling only. Default keeps the current homepage appearance.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1">Top Tagline / Subtitle Pill</label>
              <input
                type="text"
                value={homepage.hero?.tagline || ''}
                onChange={(e) => updateHp('hero', 'tagline', e.target.value)}
                className="w-full bg-[#0a1711] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#caa34b]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1">Primary Call to Action Text</label>
              <input
                type="text"
                value={homepage.hero?.primaryButtonText || ''}
                onChange={(e) => updateHp('hero', 'primaryButtonText', e.target.value)}
                className="w-full bg-[#0a1711] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#caa34b]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/70 mb-1">Main Headline (H1)</label>
            <input
              type="text"
              value={homepage.hero?.title || ''}
              onChange={(e) => updateHp('hero', 'title', e.target.value)}
              className="w-full bg-[#0a1711] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-medium focus:outline-none focus:border-[#caa34b]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/70 mb-1">Hero Description Paragraph</label>
            <textarea
              rows={3}
              value={homepage.hero?.subtitle || ''}
              onChange={(e) => updateHp('hero', 'subtitle', e.target.value)}
              className="w-full bg-[#0a1711] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#caa34b]"
            />
          </div>

          {/* Hero Slider Images */}
          <div className="pt-4 border-t border-white/10">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase text-white/80">Hero Background Slideshow Images</h4>
              <button
                type="button"
                onClick={() => {
                  openImagePicker((newUrl) => {
                    const currentImages = homepage.hero?.images || [];
                    updateHp('hero', 'images', [...currentImages, newUrl]);
                  });
                }}
                className="px-3 py-1.5 bg-[#caa34b] text-[#10281e] font-semibold text-xs rounded-lg flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Slide Image
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {(homepage.hero?.images || []).map((imgUrl, i) => (
                <div key={i} className="group relative rounded-xl overflow-hidden border border-white/15 h-28 bg-black/40">
                  <img
                    key={`${i}-${imgUrl}`}
                    src={resolveImage(imgUrl, `hero-slide-${i}`)}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    onError={(event) => {
                      if (event.currentTarget.dataset.fallback === 'true') return
                      event.currentTarget.dataset.fallback = 'true'
                      event.currentTarget.src = i % 2 === 0
                        ? '/images/field-notes/morning-view.jpg'
                        : '/images/field-notes/village-path.jpg'
                    }}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition">
                    <button
                      type="button"
                      onClick={() => {
                        openImagePicker((repUrl) => {
                          const updated = [...homepage.hero.images];
                          updated[i] = repUrl;
                          updateHp('hero', 'images', updated);
                        });
                      }}
                      className="p-1.5 bg-[#caa34b] text-[#10281e] rounded-lg text-xs"
                      title="Replace Image"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = homepage.hero.images.filter((_, idx) => idx !== i);
                        updateHp('hero', 'images', updated);
                      }}
                      className="p-1.5 bg-red-500 text-white rounded-lg text-xs"
                      title="Remove Slide"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Welcome Popup Section */}
      {activeSectionKey === 'welcomePopup' && (
        <div className="bg-[#10281e] p-6 rounded-2xl border border-white/10 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#caa34b]" />
              Welcome Popup
            </h3>
            <label className="flex items-center gap-2 text-xs text-white/80 cursor-pointer">
              <input
                type="checkbox"
                checked={welcomePopup.visible !== false}
                onChange={(e) => updateHp('welcomePopup', 'visible', e.target.checked)}
                className="rounded accent-[#caa34b]"
              />
              <span>Popup Visible on Homepage</span>
            </label>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#0a1711] p-4 space-y-4">
            <h4 className="text-xs font-bold uppercase text-white/70 border-b border-white/10 pb-2">Basic Content</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">Top Kicker</label>
                <input
                  type="text"
                  value={welcomePopup.kicker}
                  onChange={(e) => updateHp('welcomePopup', 'kicker', e.target.value)}
                  className="w-full bg-[#10281e] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#caa34b]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">Main Title</label>
                <input
                  type="text"
                  value={welcomePopup.title}
                  onChange={(e) => updateHp('welcomePopup', 'title', e.target.value)}
                  className="w-full bg-[#10281e] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#caa34b]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">Tagline</label>
                <input
                  type="text"
                  value={welcomePopup.tagline}
                  onChange={(e) => updateHp('welcomePopup', 'tagline', e.target.value)}
                  className="w-full bg-[#10281e] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#caa34b]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">Logo Image URL</label>
                <input
                  type="text"
                  value={welcomePopup.logo}
                  onChange={(e) => updateHp('welcomePopup', 'logo', e.target.value)}
                  className="w-full bg-[#10281e] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#caa34b]"
                  placeholder="/favicon.png or https://..."
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1">Description</label>
              <textarea
                value={welcomePopup.description}
                onChange={(e) => updateHp('welcomePopup', 'description', e.target.value)}
                rows={3}
                className="w-full bg-[#10281e] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#caa34b]"
              />
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#0a1711] p-4 space-y-4">
            <h4 className="text-xs font-bold uppercase text-white/70 border-b border-white/10 pb-2">Highlights / Feature List</h4>
            <p className="text-[11px] text-white/50">Each highlight appears with a checkmark icon in the popup.</p>
            {(welcomePopup.highlights || []).map((highlight, idx) => (
              <div key={idx} className="flex items-center gap-3 rounded-lg border border-white/10 bg-[#10281e] p-2">
                <input
                  type="text"
                  value={highlight}
                  onChange={(e) => {
                    const updated = [...(homepage.welcomePopup?.highlights || [])];
                    updated[idx] = e.target.value;
                    updateHp('welcomePopup', 'highlights', updated);
                  }}
                  className="flex-1 bg-[#0a1711] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#caa34b]"
                />
                <button
                  type="button"
                  onClick={() => {
                    const updated = (welcomePopup.highlights || []).filter((_, i) => i !== idx);
                    updateHp('welcomePopup', 'highlights', updated);
                  }}
                  className="text-red-400 hover:text-red-300 p-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                const items = welcomePopup.highlights || [];
                updateHp('welcomePopup', 'highlights', [...items, 'New highlight']);
              }}
              className="px-3 py-1.5 bg-[#caa34b] text-[#10281e] font-semibold text-xs rounded-lg flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Highlight
            </button>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#0a1711] p-4 space-y-4">
            <h4 className="text-xs font-bold uppercase text-white/70 border-b border-white/10 pb-2">Action Buttons</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">Primary Button Text</label>
                <input
                  type="text"
                  value={welcomePopup.primaryButtonText}
                  onChange={(e) => updateHp('welcomePopup', 'primaryButtonText', e.target.value)}
                  className="w-full bg-[#10281e] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#caa34b]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">Primary Button Link</label>
                <input
                  type="text"
                  value={welcomePopup.primaryButtonLink}
                  onChange={(e) => updateHp('welcomePopup', 'primaryButtonLink', e.target.value)}
                  className="w-full bg-[#10281e] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#caa34b]"
                  placeholder="/#homestays"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">Secondary Button Text</label>
                <input
                  type="text"
                  value={welcomePopup.secondaryButtonText}
                  onChange={(e) => updateHp('welcomePopup', 'secondaryButtonText', e.target.value)}
                  className="w-full bg-[#10281e] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#caa34b]"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. REASONS / WHY STAY */}
      {activeSectionKey === 'reasons' && (
        <div className="bg-[#10281e] p-6 rounded-2xl border border-white/10 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h3 className="text-base font-bold text-white">Why Guests Stay With Us (Features & Benefits)</h3>
            <label className="flex items-center gap-2 text-xs text-white/80 cursor-pointer">
              <input
                type="checkbox"
                checked={homepage.reasons?.visible !== false}
                onChange={(e) => updateHp('reasons', 'visible', e.target.checked)}
                className="rounded accent-[#caa34b]"
              />
              <span>Section Visible</span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1">Section Heading</label>
              <input
                type="text"
                value={homepage.reasons?.heading || ''}
                onChange={(e) => updateHp('reasons', 'heading', e.target.value)}
                className="w-full bg-[#0a1711] border border-white/10 rounded-xl px-4 py-2 text-xs text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1">Subheading</label>
              <input
                type="text"
                value={homepage.reasons?.subheading || ''}
                onChange={(e) => updateHp('reasons', 'subheading', e.target.value)}
                className="w-full bg-[#0a1711] border border-white/10 rounded-xl px-4 py-2 text-xs text-white"
              />
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase text-white/80">Feature Cards</h4>
              <button
                type="button"
                onClick={() => {
                  const items = homepage.reasons?.items || [];
                  updateHp('reasons', 'items', [...items, { title: 'New Benefit Title', desc: 'Description of the service or feature.' }]);
                }}
                className="px-3 py-1.5 bg-[#caa34b] text-[#10281e] font-semibold text-xs rounded-lg flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Feature Card
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(homepage.reasons?.items || []).map((item, idx) => (
                <div key={idx} className="bg-[#0a1711] p-4 rounded-xl border border-white/10 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-[#caa34b] uppercase">Feature #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = homepage.reasons.items.filter((_, i) => i !== idx);
                        updateHp('reasons', 'items', updated);
                      }}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => {
                      const updated = [...homepage.reasons.items];
                      updated[idx].title = e.target.value;
                      updateHp('reasons', 'items', updated);
                    }}
                    placeholder="Feature Title"
                    className="w-full bg-[#10281e] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white font-medium"
                  />
                  <textarea
                    rows={2}
                    value={item.desc}
                    onChange={(e) => {
                      const updated = [...homepage.reasons.items];
                      updated[idx].desc = e.target.value;
                      updateHp('reasons', 'items', updated);
                    }}
                    placeholder="Description..."
                    className="w-full bg-[#10281e] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white/80"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. EXPERIENCES */}
      {activeSectionKey === 'experiences' && (
        <div className="bg-[#10281e] p-6 rounded-2xl border border-white/10 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h3 className="text-base font-bold text-white">Curated Experiences Cards</h3>
            <button
              type="button"
              onClick={() => {
                const items = homepage.experiences?.items || [];
                updateHp('experiences', 'items', [
                  ...items,
                  {
                    number: `0${items.length + 1}`,
                    title: 'New Mountain Experience',
                    desc: 'Details about this curated activity and landscape view.',
                    image: 'https://thepinegetaways.com/images/gallery/experiences-couple-sunrise.jpg',
                    alt: 'Experience photo'
                  }
                ]);
              }}
              className="px-3 py-1.5 bg-[#caa34b] text-[#10281e] font-semibold text-xs rounded-lg flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Experience
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(homepage.experiences?.items || []).map((exp, idx) => (
              <div key={idx} className="bg-[#0a1711] p-4 rounded-xl border border-white/10 flex gap-4">
                <div className="w-24 h-24 rounded-lg overflow-hidden shrink-0 border border-white/15 relative group">
                  <img src={resolveImage(exp.image, exp.title || exp.id || idx)} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      openImagePicker((newImg) => {
                        const updated = [...homepage.experiences.items];
                        updated[idx].image = newImg;
                        updateHp('experiences', 'items', updated);
                      });
                    }}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[#caa34b] text-xs font-bold"
                  >
                    Change
                  </button>
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[#caa34b]">{exp.number}</span>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = homepage.experiences.items.filter((_, i) => i !== idx);
                        updateHp('experiences', 'items', updated);
                      }}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={exp.title}
                    onChange={(e) => {
                      const updated = [...homepage.experiences.items];
                      updated[idx].title = e.target.value;
                      updateHp('experiences', 'items', updated);
                    }}
                    className="w-full bg-[#10281e] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white font-medium"
                  />
                  <textarea
                    rows={2}
                    value={exp.desc}
                    onChange={(e) => {
                      const updated = [...homepage.experiences.items];
                      updated[idx].desc = e.target.value;
                      updateHp('experiences', 'items', updated);
                    }}
                    className="w-full bg-[#10281e] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white/80"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. DESTINATIONS & DAY TRIPS */}
      {activeSectionKey === 'destinations' && (
        <div className="bg-[#10281e] p-6 rounded-2xl border border-white/10 space-y-6">
          <div className="flex flex-col gap-4 border-b border-white/10 pb-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h3 className="text-base font-bold text-white">Day Trips & Excursions (Destinations)</h3>
              <label className="mt-3 block text-xs font-semibold text-white/70" htmlFor="explore-occasion-theme">Seasonal explore theme</label>
              <select
                id="explore-occasion-theme"
                value={homepage.destinations?.theme || 'default'}
                onChange={(e) => updateHp('destinations', 'theme', e.target.value === 'default' ? '' : e.target.value)}
                className="mt-1 w-full max-w-sm bg-[#0a1711] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#caa34b]"
              >
                {occasionThemes.map((theme) => <option key={theme.value} value={theme.value}>{theme.label}</option>)}
              </select>
              <p className="mt-2 text-[11px] text-white/50">Default keeps the current appearance. Choose a theme for the occasion.</p>
            </div>
            <button
              type="button"
              onClick={() => {
                const items = homepage.destinations?.items || [];
                updateHp('destinations', 'items', [
                  ...items,
                  {
                    name: 'New Destination',
                    desc: 'Excursion details, scenery, and mountain views.',
                    image: 'https://thepinegetaways.com/images/destinations/darjeeling.jpg',
                    tags: ['Scenic', 'Day Trip']
                  }
                ]);
              }}
              className="self-start px-3 py-1.5 bg-[#caa34b] text-[#10281e] font-semibold text-xs rounded-lg flex items-center gap-1.5 lg:self-auto"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Excursion
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(homepage.destinations?.items || []).map((dest, idx) => (
              <div key={idx} className="bg-[#0a1711] p-4 rounded-xl border border-white/10 space-y-3">
                <div className="h-32 rounded-lg overflow-hidden border border-white/15 relative group">
                  <img src={resolveImage(dest.image, dest.name || dest.id || idx)} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      openImagePicker((newImg) => {
                        const updated = [...homepage.destinations.items];
                        updated[idx].image = newImg;
                        updateHp('destinations', 'items', updated);
                      });
                    }}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[#caa34b] text-xs font-bold"
                  >
                    Change Image
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    value={dest.name}
                    onChange={(e) => {
                      const updated = [...homepage.destinations.items];
                      updated[idx].name = e.target.value;
                      updateHp('destinations', 'items', updated);
                    }}
                    className="w-full bg-[#10281e] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const updated = homepage.destinations.items.filter((_, i) => i !== idx);
                      updateHp('destinations', 'items', updated);
                    }}
                    className="ml-2 text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <textarea
                  rows={2}
                  value={dest.desc}
                  onChange={(e) => {
                    const updated = [...homepage.destinations.items];
                    updated[idx].desc = e.target.value;
                    updateHp('destinations', 'items', updated);
                  }}
                  className="w-full bg-[#10281e] border border-white/10 rounded-lg px-2.5 py-1 text-xs text-white/80"
                />

                <input
                  type="text"
                  placeholder="Tags (comma separated)"
                  value={(dest.tags || []).join(', ')}
                  onChange={(e) => {
                    const updated = [...homepage.destinations.items];
                    updated[idx].tags = e.target.value.split(',').map((t) => t.trim());
                    updateHp('destinations', 'items', updated);
                  }}
                  className="w-full bg-[#10281e] border border-white/10 rounded-lg px-2.5 py-1 text-[11px] text-white/60"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. GALLERIES SECTION */}
      {activeSectionKey === 'clusters' && (
        <div className="bg-[#10281e] p-6 rounded-2xl border border-white/10 space-y-5">
          <div className="border-b border-white/10 pb-4">
            <h3 className="text-base font-bold text-white">Regional Highlights Colors</h3>
            <p className="mt-1 text-xs text-white/60">Customize the section, attraction cards, headings, and place tags. Defaults keep the current website colors.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              ['backgroundColor', 'Section background', '#faf8f1'],
              ['headingColor', 'Heading text', '#10281e'],
              ['accentColor', 'Section label & accent', '#9b782d'],
              ['cardBackgroundColor', 'Card background', '#fffdf8'],
              ['cardBorderColor', 'Card border', '#e5dfd1'],
              ['cardHeadingColor', 'Card heading', '#1b3527'],
              ['numberBackgroundColor', 'Number badge background', '#f5f0e1'],
              ['numberBorderColor', 'Number badge border', '#e5dbc0'],
              ['tagBackgroundColor', 'Place tag background', '#f8f6ef'],
              ['tagBorderColor', 'Place tag border', '#e8e2d5'],
              ['tagTextColor', 'Place tag text', '#73766d'],
            ].map(([key, label, defaultColor]) => (
              <label key={key} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#0a1711] px-3 py-2.5 text-xs text-white/80">
                <span>{label}</span>
                <input
                  type="color"
                  aria-label={label}
                  value={homepage.clusters?.[key] || defaultColor}
                  onChange={(e) => updateHp('clusters', key, e.target.value)}
                  className="h-8 w-10 cursor-pointer rounded border-0 bg-transparent p-0"
                />
              </label>
            ))}
          </div>
        </div>
      )}

      {/* 6. GALLERIES SECTION */}
      {activeSectionKey === 'gallery' && (
        <div className="bg-[#10281e] p-6 rounded-2xl border border-white/10 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h3 className="text-base font-bold text-white">Homepage Gallery Grid Photos</h3>
            <button
              type="button"
              onClick={() => {
                openImagePicker((newImg) => {
                  const items = homepage.gallerySection?.items || [];
                  updateHp('gallerySection', 'items', [
                    ...items,
                    { title: 'New Photo', type: 'Views', image: newImg }
                  ]);
                });
              }}
              className="px-3 py-1.5 bg-[#caa34b] text-[#10281e] font-semibold text-xs rounded-lg flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Photo
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {(homepage.gallerySection?.items || []).map((item, idx) => (
              <div key={idx} className="bg-[#0a1711] rounded-xl border border-white/10 overflow-hidden flex flex-col">
                <div className="h-28 relative group">
                  <img src={resolveImage(item.image, item.title || item.name || item.id || idx)} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      openImagePicker((repImg) => {
                        const updated = [...homepage.gallerySection.items];
                        updated[idx].image = repImg;
                        updateHp('gallerySection', 'items', updated);
                      });
                    }}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[#caa34b] text-xs font-bold"
                  >
                    Change
                  </button>
                </div>
                <div className="p-2 space-y-1 flex-1 flex flex-col justify-between">
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => {
                      const updated = [...homepage.gallerySection.items];
                      updated[idx].title = e.target.value;
                      updateHp('gallerySection', 'items', updated);
                    }}
                    className="w-full bg-[#10281e] border border-white/10 rounded px-2 py-1 text-[11px] text-white"
                  />
                  <div className="flex items-center justify-between pt-1">
                    <select
                      value={item.type}
                      onChange={(e) => {
                        const updated = [...homepage.gallerySection.items];
                        updated[idx].type = e.target.value;
                        updateHp('gallerySection', 'items', updated);
                      }}
                      className="bg-[#10281e] text-[10px] text-white/70 rounded px-1.5 py-0.5 border border-white/10"
                    >
                      <option value="Views">Views</option>
                      <option value="Rooms">Rooms</option>
                      <option value="Food">Food</option>
                      <option value="Experiences">Experiences</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = homepage.gallerySection.items.filter((_, i) => i !== idx);
                        updateHp('gallerySection', 'items', updated);
                      }}
                      className="text-red-400 hover:text-red-300 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeSectionKey === 'stays' && (
        <div className="bg-[#10281e] p-6 rounded-2xl border border-white/10 space-y-5">
          <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div><h3 className="text-base font-bold text-white">Homepage Stays Section</h3><p className="mt-1 text-xs text-white/60">These are the stays currently displayed on the homepage. Edit their details in Homestays & Pricing.</p></div>
            <label className="flex items-center gap-2 text-xs text-white/80"><input type="checkbox" checked={homepage.staysSection?.visible !== false} onChange={(e) => updateHp('staysSection', 'visible', e.target.checked)} className="accent-[#caa34b]" />Visible</label>
          </div>
          <div className="rounded-xl border border-white/10 bg-[#0a1711] p-4">
            <p className="mb-3 text-xs font-bold text-white/80">Currently shown stays ({homepageStays.length})</p>
            <div className="grid gap-3 sm:grid-cols-2">
              {homepageStays.map((stay, idx) => (
                <div key={stay.slug || stay.name || idx} className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#10281e] p-3">
                  <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg border border-white/15 bg-black/40">
                    <img
                      src={resolveImage(stay.mainImage || stay.image, `${stay.slug || stay.name}-main`)}
                      alt={stay.name}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-bold text-white">{stay.name}</p>
                    <p className="truncate text-[11px] text-white/50">{stay.location || 'Homestay'}</p>
                    <button
                      type="button"
                      onClick={() => {
                        openImagePicker((newImg) => {
                          const baseStays = content.homestays?.length ? content.homestays : defaultHomestays;
                          const updatedStays = baseStays.map((s, sIdx) => (
                            (s.slug && stay.slug ? s.slug === stay.slug : sIdx === idx)
                              ? { ...s, mainImage: newImg }
                              : s
                          ));
                          onChange({ ...content, homestays: updatedStays, homestayDefaultsReconciled: true });
                        });
                      }}
                      className="mt-2 rounded-lg bg-[#caa34b] px-2.5 py-1 text-[11px] font-bold text-[#10281e] transition hover:bg-[#d8b85e]"
                    >
                      Change Main Image
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <button type="button" onClick={() => onNavigate?.('homestays')} className="mt-4 rounded-lg bg-[#caa34b] px-3 py-2 text-xs font-semibold text-[#10281e]">Manage stays, photos & pricing</button>
          </div>
        </div>
      )}

      {activeSectionKey === 'reviews' && (
        <div className="bg-[#10281e] p-6 rounded-2xl border border-white/10 space-y-5">
          <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4"><div><h3 className="text-base font-bold text-white">Homepage Guest Reviews</h3><p className="mt-1 text-xs text-white/60">This is the same live review list rendered on the homepage.</p></div><label className="flex items-center gap-2 text-xs text-white/80"><input type="checkbox" checked={homepage.reviewsSection?.visible !== false} onChange={(e) => updateHp('reviewsSection', 'visible', e.target.checked)} className="accent-[#caa34b]" />Visible</label></div>
          <div className="space-y-2">{reviews.length ? reviews.slice(0, 8).map((review) => <div key={review.id} className="rounded-xl border border-white/10 bg-[#0a1711] p-3"><div className="flex justify-between gap-3 text-xs"><strong className="text-white">{review.author}</strong><span className="text-[#caa34b]">{'★'.repeat(review.rating || 5)}</span></div><p className="mt-1 line-clamp-2 text-xs text-white/65">{review.text}</p></div>) : <p className="rounded-xl border border-white/10 bg-[#0a1711] p-4 text-xs text-white/55">No reviews are currently published on the homepage.</p>}</div>
          <button type="button" onClick={() => onNavigate?.('reviews')} className="rounded-lg bg-[#caa34b] px-3 py-2 text-xs font-semibold text-[#10281e]">Manage homepage reviews</button>
        </div>
      )}

      {/* Contact Page Section */}
      {activeSectionKey === 'contactPage' && (
        <div className="bg-[#10281e] p-6 rounded-2xl border border-white/10 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Mail className="w-4 h-4 text-[#caa34b]" />
              Contact Page
            </h3>
            <label className="flex items-center gap-2 text-xs text-white/80 cursor-pointer">
              <input
                type="checkbox"
                checked={content.contactPage?.visible !== false}
                onChange={(e) => onChange({ ...content, contactPage: { ...content.contactPage, visible: e.target.checked } })}
                className="rounded accent-[#caa34b]"
              />
              <span>Contact Page Visible</span>
            </label>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#0a1711] p-4 space-y-4">
            <h4 className="text-xs font-bold uppercase text-white/70 border-b border-white/10 pb-2">Main Form Section</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">Top Kicker</label>
                <input
                  type="text"
                  value={content.contactPage?.kicker || ''}
                  onChange={(e) => onChange({ ...content, contactPage: { ...content.contactPage, kicker: e.target.value } })}
                  className="w-full bg-[#10281e] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#caa34b]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">Main Title</label>
                <input
                  type="text"
                  value={content.contactPage?.title || ''}
                  onChange={(e) => onChange({ ...content, contactPage: { ...content.contactPage, title: e.target.value } })}
                  className="w-full bg-[#10281e] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#caa34b]"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1">Subtitle / Description</label>
              <textarea
                rows={3}
                value={content.contactPage?.subtitle || ''}
                onChange={(e) => onChange({ ...content, contactPage: { ...content.contactPage, subtitle: e.target.value } })}
                className="w-full bg-[#10281e] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#caa34b]"
              />
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#0a1711] p-4 space-y-4">
            <h4 className="text-xs font-bold uppercase text-white/70 border-b border-white/10 pb-2">Homestay Contacts Section</h4>
            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1">Section Heading</label>
              <input
                type="text"
                value={content.contactPage?.contactsHeading || ''}
                onChange={(e) => onChange({ ...content, contactPage: { ...content.contactPage, contactsHeading: e.target.value } })}
                className="w-full bg-[#10281e] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#caa34b]"
              />
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-[#0a1711] p-4 space-y-4">
            <h4 className="text-xs font-bold uppercase text-white/70 border-b border-white/10 pb-2">Message Us Section</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">Section Heading</label>
                <input
                  type="text"
                  value={content.contactPage?.messageUsHeading || ''}
                  onChange={(e) => onChange({ ...content, contactPage: { ...content.contactPage, messageUsHeading: e.target.value } })}
                  className="w-full bg-[#10281e] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#caa34b]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">Main Title</label>
                <input
                  type="text"
                  value={content.contactPage?.messageUsTitle || ''}
                  onChange={(e) => onChange({ ...content, contactPage: { ...content.contactPage, messageUsTitle: e.target.value } })}
                  className="w-full bg-[#10281e] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#caa34b]"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1">Description</label>
              <textarea
                rows={3}
                value={content.contactPage?.messageUsDescription || ''}
                onChange={(e) => onChange({ ...content, contactPage: { ...content.contactPage, messageUsDescription: e.target.value } })}
                className="w-full bg-[#10281e] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#caa34b]"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">Button Text</label>
                <input
                  type="text"
                  value={content.contactPage?.messageUsButtonText || ''}
                  onChange={(e) => onChange({ ...content, contactPage: { ...content.contactPage, messageUsButtonText: e.target.value } })}
                  className="w-full bg-[#10281e] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#caa34b]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-white/70 mb-1">Button Link</label>
                <input
                  type="text"
                  value={content.contactPage?.messageUsButtonLink || ''}
                  onChange={(e) => onChange({ ...content, contactPage: { ...content.contactPage, messageUsButtonLink: e.target.value } })}
                  className="w-full bg-[#10281e] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#caa34b]"
                  placeholder="/homestays"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Picker Modal */}
      <ImagePickerModal
        isOpen={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        onSelect={handleImageSelected}
      />
    </div>
  );
}

