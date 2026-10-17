import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Trash2,
  Edit,
  DollarSign,
  MapPin,
  Tag,
  CheckCircle,
  Image as ImageIcon,
  ChevronRight
} from 'lucide-react';
import ImagePickerModal from './ImagePickerModal';

export default function HomestayManager({ content, onChange }) {
  const [selectedStayIndex, setSelectedStayIndex] = useState(0);
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imageTargetCallback, setImageTargetCallback] = useState(null);

  const homestays = content.homestays || [];
  const currentStay = homestays[selectedStayIndex] || homestays[0];

  const openImagePicker = (cb) => {
    setImageTargetCallback(() => cb);
    setImageModalOpen(true);
  };

  const updateStay = (key, val) => {
    const updated = [...homestays];
    updated[selectedStayIndex] = {
      ...updated[selectedStayIndex],
      [key]: val
    };
    onChange({ ...content, homestays: updated });
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
      currency: 'USD',
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
    onChange({ ...content, homestays: updated });
    setSelectedStayIndex(updated.length - 1);
  };

  const deleteCurrentStay = () => {
    if (homestays.length <= 1) {
      alert('You must keep at least one homestay on the website.');
      return;
    }
    if (!window.confirm(`Delete ${currentStay.name}?`)) return;

    const updated = homestays.filter((_, idx) => idx !== selectedStayIndex);
    onChange({ ...content, homestays: updated });
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
              ({stay.currency === 'INR' ? '₹' : '$'}{stay.priceStarting})
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
                value={currentStay.currency || 'USD'}
                onChange={(e) => updateStay('currency', e.target.value)}
                className="w-full bg-[#10281e] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white"
              >
                <option value="USD">USD ($)</option>
                <option value="INR">INR (₹)</option>
                <option value="EUR">EUR (€)</option>
                <option value="GBP">GBP (£)</option>
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
                <img src={currentStay.mainImage} alt="" className="w-full h-full object-cover" />
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
                        {currentStay.currency === 'INR' ? '₹' : '$'}
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

