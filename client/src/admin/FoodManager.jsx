import React, { useState } from 'react';
import { Utensils, Plus, Trash2, Edit3, Image as ImageIcon } from 'lucide-react';
import ImagePickerModal from './ImagePickerModal';

export default function FoodManager({ content, onChange }) {
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [activeItemIndex, setActiveItemIndex] = useState(null);

  const foodItems = content.foodItems || [];

  const updateItem = (index, key, val) => {
    const updated = [...foodItems];
    updated[index] = { ...updated[index], [key]: val };
    onChange({ ...content, foodItems: updated });
  };

  const addItem = () => {
    const newItem = {
      id: `dish-${Date.now()}`,
      name: 'Fresh Himalayan Specialty',
      description: 'Slow-cooked local recipe using authentic organic valley herbs and seasonal vegetables.',
      type: 'Veg',
      price: '₹250',
      rating: 4.9,
      image: 'https://thepinegetaways.com/images/gallery/food-generous-spread.jpg',
      servedAt: ['SAMTHAR Hill-Stay']
    };
    onChange({ ...content, foodItems: [...foodItems, newItem] });
  };

  const deleteItem = (index) => {
    if (!window.confirm('Delete this food item?')) return;
    const updated = foodItems.filter((_, idx) => idx !== index);
    onChange({ ...content, foodItems: updated });
  };

  return (
    <div className="space-y-6">
      <div className="bg-[#10281e] p-5 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Utensils className="w-5 h-5 text-[#caa34b]" />
            Food & Dining Menu Management
          </h2>
          <p className="text-xs text-white/60 mt-1">
            Manage regional delicacies, tea rituals, pricing, vegetarian/non-veg tags, and photos.
          </p>
        </div>

        <button
          onClick={addItem}
          className="px-4 py-2.5 bg-[#caa34b] hover:bg-[#d8b85e] text-[#10281e] font-semibold text-xs rounded-xl flex items-center gap-2 transition shadow-md"
        >
          <Plus className="w-4 h-4" />
          Add Dish to Menu
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {foodItems.map((item, idx) => (
          <div key={item.id || idx} className="bg-[#10281e] rounded-2xl border border-white/10 overflow-hidden flex flex-col">
            <div className="h-40 relative group bg-black/40">
              <img src={item.image} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => {
                  setActiveItemIndex(idx);
                  setImageModalOpen(true);
                }}
                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[#caa34b] text-xs font-bold transition"
              >
                Change Food Photo
              </button>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => updateItem(idx, 'name', e.target.value)}
                    placeholder="Dish Name"
                    className="font-bold text-sm text-white bg-[#0a1711] border border-white/10 rounded-lg px-2.5 py-1 w-full"
                  />
                  <button
                    type="button"
                    onClick={() => deleteItem(idx)}
                    className="text-red-400 hover:text-red-300 p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={item.type}
                    onChange={(e) => updateItem(idx, 'type', e.target.value)}
                    className="bg-[#0a1711] text-xs text-white border border-white/10 rounded-lg px-2 py-1"
                  >
                    <option value="Veg">Vegetarian</option>
                    <option value="Non-Veg">Non-Vegetarian</option>
                  </select>

                  <input
                    type="text"
                    value={item.price || ''}
                    onChange={(e) => updateItem(idx, 'price', e.target.value)}
                    placeholder="Price (e.g. ₹280)"
                    className="bg-[#0a1711] text-xs text-[#caa34b] font-bold border border-white/10 rounded-lg px-2 py-1 w-28"
                  />
                </div>

                <textarea
                  rows={2}
                  value={item.description}
                  onChange={(e) => updateItem(idx, 'description', e.target.value)}
                  placeholder="Ingredients and culinary story..."
                  className="w-full bg-[#0a1711] text-xs text-white/80 border border-white/10 rounded-lg p-2"
                />
              </div>

              <div className="pt-2 border-t border-white/5">
                <label className="block text-[10px] uppercase font-bold text-white/50 mb-1">
                  Served At (comma separated)
                </label>
                <input
                  type="text"
                  value={(item.servedAt || []).join(', ')}
                  onChange={(e) =>
                    updateItem(
                      idx,
                      'servedAt',
                      e.target.value.split(',').map((s) => s.trim())
                    )
                  }
                  className="w-full bg-[#0a1711] text-[11px] text-white/70 border border-white/10 rounded px-2 py-1"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <ImagePickerModal
        isOpen={imageModalOpen}
        onClose={() => setImageModalOpen(false)}
        onSelect={(url) => {
          if (activeItemIndex !== null) {
            updateItem(activeItemIndex, 'image', url);
          }
        }}
      />
    </div>
  );
}

