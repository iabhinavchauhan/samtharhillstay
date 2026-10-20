import React, { useState, useEffect } from 'react';
import { apiFetch } from '../utils/api';
import {
  Inbox,
  User,
  Phone,
  Calendar,
  Home,
  MessageSquare,
  Clock,
  RefreshCw
} from 'lucide-react';
import { useAuth } from './AuthContext';

export default function InquiriesManager() {
  const { token } = useAuth();
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInquiries = async () => {
    try {
      setLoading(true);
      const res = await apiFetch('/api/admin/inquiries', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setInquiries(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-[#10281e] p-5 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Inbox className="w-5 h-5 text-[#caa34b]" />
            Guest Inquiries & Booking Leads
          </h2>
          <p className="text-xs text-white/60 mt-1">
            Real-time messages, booking dates, guest counts, and inquiries submitted from the public contact forms.
          </p>
        </div>

        <button
          onClick={fetchInquiries}
          className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-xl flex items-center gap-2 transition"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh Leads
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-white/40 text-xs">Loading inquiries...</div>
      ) : inquiries.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-white/10 rounded-2xl p-8 bg-[#10281e]">
          <Inbox className="w-12 h-12 text-white/20 mx-auto mb-3" />
          <p className="text-sm text-white/60 font-medium">No booking inquiries received yet.</p>
          <p className="text-xs text-white/40 mt-1">
            When visitors fill out the booking form on the homepage or contact page, their leads will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {inquiries.map((inq) => (
            <div key={inq.id} className="bg-[#10281e] border border-white/10 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-white flex items-center gap-2">
                  <User className="w-4 h-4 text-[#caa34b]" />
                  {inq.name || 'Anonymous Guest'}
                </span>
                <span className="text-[10px] text-white/40 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(inq.created_at).toLocaleString()}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-[#0a1711] p-3 rounded-xl border border-white/5">
                <div>
                  <span className="text-white/40 block text-[10px]">Phone Number:</span>
                  <a href={`tel:${inq.phone}`} className="text-[#caa34b] font-medium hover:underline">
                    {inq.phone || 'N/A'}
                  </a>
                </div>
                <div>
                  <span className="text-white/40 block text-[10px]">Dates:</span>
                  <span className="text-white">{inq.dates || 'Not specified'}</span>
                </div>
                <div>
                  <span className="text-white/40 block text-[10px]">Homestay Choice:</span>
                  <span className="text-white font-medium">{inq.homestay || 'Any Stay'}</span>
                </div>
                <div>
                  <span className="text-white/40 block text-[10px]">Guests:</span>
                  <span className="text-white">{inq.guests} Guest(s)</span>
                </div>
              </div>

              {inq.message && (
                <div className="text-xs text-white/80 bg-white/[0.02] p-3 rounded-xl border border-white/5">
                  <span className="text-white/40 block text-[10px] mb-1">Message / Special Requests:</span>
                  <p>{inq.message}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

