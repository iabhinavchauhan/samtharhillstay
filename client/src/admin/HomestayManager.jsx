import { useEffect, useRef, useState } from 'react';
import {
  Building2,
  Plus,
  Trash2,
  Upload,
  Link2,
  Image as ImageIcon,
  Video,
} from 'lucide-react';
import ImagePickerModal from './ImagePickerModal';
import { CURRENCY_SYMBOL, formatPrice } from '../utils/currency';
import { apiFetch } from '../utils/api';
import { useAuth } from './AuthContext.js';
import { getVideoEmbedUrl, normalizeGalleryMedia } from '../utils/galleryMedia';
import { resolveImage } from '../utils/resolveImage';
import { homestays as defaultHomestays } from '../data/resortData';

function completeHomestays(savedHomestays = []) {
  const matchedSavedIndexes = new Set();
  const completedDefaults = defaultHomestays.map((defaultStay) => {
    const defaultName = (defaultStay.name || '').trim().toLowerCase();
    const savedIndex = savedHomestays.findIndex((stay, index) => (
      !matchedSavedIndexes.has(index) &&
      ((stay.slug && stay.slug === defaultStay.slug) || (stay.name || '').trim().toLowerCase() === defaultName)
    ));
    if (savedIndex === -1) return defaultStay;
    matchedSavedIndexes.add(savedIndex);
    const savedStay = savedHomestays[savedIndex];
    return { ...defaultStay, ...savedStay, contact: { ...defaultStay.contact, ...savedStay.contact } };
  });
  return [...completedDefaults, ...savedHomestays.filter((_, index) => !matchedSavedIndexes.has(index))];
}

export default function HomestayManager({ content, onChange }) {
  const { token } = useAuth();
  const contentRef = useRef(content);
  useEffect(() => {
    contentRef.current = content;
  }, [content]);
  const [selectedStayIndex, setSelectedStayIndex] = useState(0);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imageTargetCallback, setImageTargetCallback] = useState(null);
  const [galleryType, setGalleryType] = useState('image');
  const [galleryUrl, setGalleryUrl] = useState('');
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [galleryError, setGalleryError] = useState('');

  const homestays = content.homestayDefaultsReconciled
    ? (content.homestays || [])
    : completeHomestays(content.homestays || []);
  const currentStay = homestays[selectedStayIndex] || homestays[0];

  const openImagePicker = (cb) => {
    setImageTargetCallback(() => cb);
    setImageModalOpen(true);
  };

  const updateStayAt = (stayIndex, key, val) => {
    const latestContent = contentRef.current;
    const updated = latestContent.homestayDefaultsReconciled
      ? [...(latestContent.homestays || [])]
      : completeHomestays(latestContent.homestays || []);
    if (!updated[stayIndex]) return;
    updated[stayIndex] = {
      ...updated[stayIndex],
      [key]: val
    };
    onChange({ ...latestContent, homestays: updated, homestayDefaultsReconciled: true });
  };

  const updateStay = (key, val) => updateStayAt(selectedStayIndex, key, val);

  const addGalleryUrl = () => {
    const url = galleryUrl.trim();
    if (!url) return;
    if (!/^https?:\/\//i.test(url) && !url.startsWith('/uploads/')) {
      setGalleryError('Use a full http(s) URL or an uploaded /uploads/ path.');
      return;
    }
    const item = galleryType === 'video' ? { type: 'video', url } : url;
    updateStay('gallery', [...(currentStay.gallery || []), item]);
    setGalleryUrl('');
    setGalleryError('');
  };

  const uploadGalleryFile = async (event) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    const uploadStayIndex = selectedStayIndex;
    const isVideo = file.type.startsWith('video/');
    if (!isVideo && !file.type.startsWith('image/')) {
      setGalleryError('Choose an image or video file.');
      input.value = '';
      return;
    }

    setGalleryUploading(true);
    setGalleryError('');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('altText', `${currentStay.name} gallery ${file.name}`);
    try {
      const response = await apiFetch('/api/admin/homestay-gallery/upload', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });
      const data = await response.json();
      const item = isVideo ? { type: 'video', url: data.media.url } : data.media.url;
      const latestContent = contentRef.current;
      const latestHomestays = latestContent.homestayDefaultsReconciled
        ? (latestContent.homestays || [])
        : completeHomestays(latestContent.homestays || []);
      const latestStay = latestHomestays[uploadStayIndex];
      if (latestStay) updateStayAt(uploadStayIndex, 'gallery', [...(latestStay.gallery || []), item]);
    } catch (error) {
      setGalleryError(error.message || 'Could not upload this media file.');
    } finally {
      setGalleryUploading(false);
      input.value = '';
    }
  };

  const deleteGalleryItem = (mediaIndex) => {
    updateStay('gallery', (currentStay.gallery || []).filter((_, index) => index !== mediaIndex));
  };

  const updateRoom = (roomIdx, key, val) => {
    const rooms = [...(currentStay.rooms || [])];
    rooms[roomIdx] = { ...rooms[roomIdx], [key]: val };
    updateStay('rooms', rooms);
  };

  const addRoom = () => {
    const rooms = [...(currentStay.rooms || [])];
    rooms.push({
      name: 'New Luxury Suite',
      description: 'Spacious suite with balcony, wooden finishes, and forest vistas.',
      price: 110
    });
    updateStay('rooms', rooms);
  };

  const deleteRoom = (roomIdx) => {
    const rooms = currentStay.rooms.filter((_, idx) => idx !== roomIdx);
    updateStay('rooms', rooms);
  };

  const addNewStay = () => {
    const newStay = {
      slug: `homestay-${Date.now()}`,
      name: 'New Hillside Stay',
      location: 'Kalimpong Hills, West Bengal',
      tagline: 'A quiet mountain sanctuary surrounded by nature and bird songs.',
      description: 'Handcrafted rooms, local organic farm meals, and cozy verandas.',
      detail: 'Perfect for long peaceful stays, remote working, and valley outlooks.',
      mainImage: 'https://thepinegetaways.com/images/homestays/mairung.jpg',
      gallery: [
        'https://thepinegetaways.com/images/gallery/views-kanchenjunga.jpg',
        'https://thepinegetaways.com/images/gallery/rooms-blue-floral.jpg'
      ],
      points: ['Mountain valley views', 'Bonfire and BBQ', 'Warm host family'],
      amenities: ['Wi-Fi', 'Balcony', 'Breakfast Included'],
      attractions: ['Pine trails', 'Viewpoint'],
      priceStarting: 100,
      currency: 'INR',
      priceLabel: 'per night',
      badge: 'New Stay',
      rooms: [
        { name: 'Valley Room', description: 'Serene mountain views with pine wood interior.', price: 100 }
      ],
      contact: {
        phone: '+91 98046 00910',
        email: 'stay@samthar.com',
        whatsapp: '+91 98046 00910',
        address: 'Kalimpong, West Bengal'
      }
    };

    const updated = [...homestays, newStay];
    onChange({ ...content, homestays: updated, homestayDefaultsReconciled: true });
    setSelectedStayIndex(updated.length - 1);
  };

  const deleteCurrentStay = () => {
    if (homestays.length <= 1) {
      alert('You must keep at least one homestay on the website.');
      return;
    }
    if (!window.confirm(`Delete ${currentStay.name}?`)) return;

    const updated = homestays.filter((_, idx) => idx !== selectedStayIndex);
    onChange({ ...content, homestays: updated, homestayDefaultsReconciled: true });
    setSelectedStayIndex(0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#10281e] p-5 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#caa34b]" />
            Homestays & Offerings Management
          </h2>
          <p className="text-xs text-white/60 mt-1">
            Manage homestay listings, descriptions, room categories, pricing, and photo galleries.
          </p>
        </div>

        <button
          onClick={addNewStay}
          className="px-4 py-2.5 bg-[#caa34b] hover:bg-[#d8b85e] text-[#10281e] font-semibold text-xs rounded-xl flex items-center gap-2 transition shadow-md"
        >
          <Plus className="w-4 h-4" />
          Add New Homestay
        </button>
      </div>

      {/* Selector Tabs */}
      <div className="flex flex-wrap gap-2">
        {homestays.map((stay, idx) => (
          <button
            key={stay.slug || idx}
            onClick={() => setSelectedStayIndex(idx)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 border ${
              selectedStayIndex === idx
                ? 'bg-[#caa34b] text-[#10281e] border-[#caa34b] shadow-md'
                : 'bg-[#10281e] text-white/70 border-white/10 hover:border-white/30'
            }`}
          >
            <span>{stay.name}</span>
            <span className="text-[10px] opacity-80">
              ({formatPrice(stay.priceStarting)})
            </span>
          </button>
        ))}
      </div>

      {currentStay && (
        <div className="bg-[#10281e] p-6 rounded-2xl border border-white/10 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Editing: {currentStay.name}</span>
                <span className="text-[10px] bg-[#caa34b]/20 text-[#caa34b] px-2 py-0.5 rounded-full border border-[#caa34b]/40">
                  {currentStay.badge || 'Featured'}
                </span>
              </h3>
              <p className="text-xs text-white/50">{currentStay.location}</p>
            </div>

            <button
              onClick={deleteCurrentStay}
              className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-semibold rounded-lg flex items-center gap-1.5 border border-red-500/30 transition"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Homestay
            </button>
          </div>

          {/* Core Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1">Homestay Name</label>
              <input
                type="text"
                value={currentStay.name || ''}
                onChange={(e) => updateStay('name', e.target.value)}
                className="w-full bg-[#0a1711] border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-[#caa34b]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1">Location Label</label>
              <input
                type="text"
                value={currentStay.location || ''}
                onChange={(e) => updateStay('location', e.target.value)}
                className="w-full bg-[#0a1711] border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-[#caa34b]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1">Card Badge Tag</label>
              <input
                type="text"
                value={currentStay.badge || ''}
                onChange={(e) => updateStay('badge', e.target.value)}
                placeholder="e.g. Popular Choice"
                className="w-full bg-[#0a1711] border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-[#caa34b]"
              />
            </div>
          </div>

          {/* Pricing Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-[#0a1711] border border-white/10">
            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1">Starting Price Value</label>
              <input
                type="number"
                value={currentStay.priceStarting || 0}
                onChange={(e) => updateStay('priceStarting', parseFloat(e.target.value) || 0)}
                className="w-full bg-[#10281e] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1">Currency</label>
              <select
                value={currentStay.currency || 'INR'}
                onChange={(e) => updateStay('currency', e.target.value)}
                className="w-full bg-[#10281e] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
              >
                <option value="INR">INR (₹)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-white/70 mb-1">Price Unit Label</label>
              <input
                type="text"
                value={currentStay.priceLabel || 'per night'}
                onChange={(e) => updateStay('priceLabel', e.target.value)}
                className="w-full bg-[#10281e] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/70 mb-1">Tagline</label>
            <input
              type="text"
              value={currentStay.tagline || ''}
              onChange={(e) => updateStay('tagline', e.target.value)}
              className="w-full bg-[#0a1711] border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-[#caa34b]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-white/70 mb-1">Short Description</label>
            <textarea
              rows={2}
              value={currentStay.description || ''}
              onChange={(e) => updateStay('description', e.target.value)}
              className="w-full bg-[#0a1711] border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-[#caa34b]"
            />
          </div>

          {/* Featured Main Image */}
          <div className="pt-2">
            <label className="block text-xs font-semibold text-white/70 mb-2">Featured Main Image</label>
            <div className="flex items-center gap-4">
              <div className="w-40 h-24 rounded-xl overflow-hidden border border-white/15 bg-black/40 shrink-0">
                <img src={currentStay.mainImage} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
              </div>
              <button
                type="button"
                onClick={() => {
                  openImagePicker((newImg) => updateStay('mainImage', newImg));
                }}
                className="px-4 py-2 bg-[#caa34b] text-[#10281e] font-bold text-xs rounded-xl shadow hover:bg-[#d8b85e] transition"
              >
                Change Main Image
              </button>
            </div>
          </div>

          {/* Homestay Details Gallery */}
          <div className="space-y-4 border-t border-white/10 pt-5">
            <div>
              <h4 className="text-sm font-bold text-white">View Details Gallery</h4>
              <p className="mt-1 text-xs text-white/50">Add photos or videos from your computer, or paste a direct media link. Save and publish to show changes live.</p>
            </div>

            <div className="grid gap-3 rounded-xl border border-white/10 bg-[#0a1711] p-4 md:grid-cols-[150px_minmax(0,1fr)_auto_auto] md:items-end">
              <label className="block text-xs font-semibold text-white/70">Media type
                <select value={galleryType} onChange={(e) => setGalleryType(e.target.value)} className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#10281e] px-3 py-2.5 text-xs text-white">
                  <option value="image">Photo</option>
                  <option value="video">Video</option>
                </select>
              </label>
              <label className="block text-xs font-semibold text-white/70">Media URL
                <input value={galleryUrl} onChange={(e) => setGalleryUrl(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addGalleryUrl(); } }} placeholder={galleryType === 'video' ? 'MP4, YouTube, or Vimeo URL' : 'Image URL'} className="mt-1.5 w-full rounded-lg border border-white/10 bg-[#10281e] px-3 py-2.5 text-xs text-white placeholder:text-white/35" />
              </label>
              <button type="button" onClick={addGalleryUrl} disabled={!galleryUrl.trim()} className="inline-flex items-center justify-center gap-2 rounded-lg bg-white/10 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-40">
                <Link2 className="h-3.5 w-3.5" />Add URL
              </button>
              <label className={`inline-flex cursor-pointer items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold text-[#10281e] transition ${galleryUploading ? 'bg-[#caa34b]/60' : 'bg-[#caa34b] hover:bg-[#d8b85e]'}`}>
                <Upload className="h-3.5 w-3.5" />{galleryUploading ? 'Uploading…' : 'Upload from computer'}
                <input type="file" accept="image/*,video/*" className="hidden" onChange={uploadGalleryFile} disabled={galleryUploading} />
              </label>
            </div>
            {galleryError && <p role="alert" className="rounded-lg border border-red-400/25 bg-red-500/10 px-3 py-2 text-xs text-red-200">{galleryError}</p>}

            {(currentStay.gallery || []).length ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {currentStay.gallery.map((item, mediaIndex) => {
                  const media = normalizeGalleryMedia(item);
                  const embedUrl = media.type === 'video' ? getVideoEmbedUrl(media.url) : '';
                  const mediaUrl = resolveImage(media.url, `${currentStay.slug}-gallery-${mediaIndex}`);
                  return (
                    <div key={`${media.type}-${media.url || mediaIndex}`} className="group relative overflow-hidden rounded-xl border border-white/10 bg-black/30">
                      {media.type === 'video' ? embedUrl ? (
                        <iframe src={embedUrl} title={`${currentStay.name} video ${mediaIndex + 1}`} className="h-32 w-full border-0 sm:h-40" loading="lazy" allow="accelerometer; autoplay; encrypted-media; picture-in-picture" allowFullScreen />
                      ) : (
                        <video src={mediaUrl} poster={media.poster ? resolveImage(media.poster, `${currentStay.slug}-poster-${mediaIndex}`) : undefined} controls playsInline preload="metadata" className="h-32 w-full object-cover sm:h-40" />
                      ) : (
                        <img src={mediaUrl} alt={`${currentStay.name} gallery ${mediaIndex + 1}`} loading="lazy" decoding="async" className="h-32 w-full object-cover sm:h-40" />
                      )}
                      <div className="flex items-center justify-between gap-2 px-2.5 py-2">
                        <span className="flex min-w-0 items-center gap-1.5 truncate text-[10px] font-medium text-white/70"><span className="shrink-0 text-[#caa34b]">{media.type === 'video' ? <Video className="h-3.5 w-3.5" /> : <ImageIcon className="h-3.5 w-3.5" />}</span><span className="truncate">{media.type === 'video' ? 'Video' : 'Photo'} {mediaIndex + 1}</span></span>
                        <button type="button" onClick={() => deleteGalleryItem(mediaIndex)} aria-label={`Remove gallery item ${mediaIndex + 1}`} className="shrink-0 rounded-md p-1 text-red-300 transition hover:bg-red-500/15"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-white/15 px-4 py-8 text-center text-xs text-white/45">No gallery media yet. Add a photo or video above.</div>
            )}
          </div>

          {/* Rooms and Pricing Table */}
          <div className="pt-4 border-t border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-white">Room Types & Pricing Tiers</h4>
                <p className="text-xs text-white/50">Each homestay can offer distinct suites or room choices.</p>
              </div>
              <button
                type="button"
                onClick={addRoom}
                className="px-3 py-1.5 bg-[#caa34b] text-[#10281e] font-semibold text-xs rounded-lg flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Room Tier
              </button>
            </div>

            <div className="space-y-3">
              {(currentStay.rooms || []).map((room, rIdx) => (
                <div key={rIdx} className="p-4 bg-[#0a1711] rounded-xl border border-white/10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex-1 space-y-2 w-full">
                    <input
                      type="text"
                      value={room.name}
                      onChange={(e) => updateRoom(rIdx, 'name', e.target.value)}
                      placeholder="Room Name"
                      className="w-full bg-[#10281e] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white font-bold"
                    />
                    <input
                      type="text"
                      value={room.description}
                      onChange={(e) => updateRoom(rIdx, 'description', e.target.value)}
                      placeholder="Room Description"
                      className="w-full bg-[#10281e] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white/70"
                    />
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-[#caa34b] font-bold">
                        {CURRENCY_SYMBOL}
                      </span>
                      <input
                        type="number"
                        value={room.price}
                        onChange={(e) => updateRoom(rIdx, 'price', parseFloat(e.target.value) || 0)}
                        className="w-24 bg-[#10281e] border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white font-bold text-center"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => deleteRoom(rIdx)}
                      className="p-1.5 text-red-400 hover:text-red-300 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <ImagePickerModal
        isOpen={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        onSelect={(url) => {
          if (imageTargetCallback) imageTargetCallback(url);
        }}
      />
    </div>
  );
}

