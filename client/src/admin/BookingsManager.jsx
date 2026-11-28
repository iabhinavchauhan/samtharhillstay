import { useCallback, useEffect, useState } from 'react';
import { CalendarCheck, RefreshCw, User, Mail, Phone, MapPin, CreditCard, CheckCircle, Clock, XCircle } from 'lucide-react';
import { apiFetch } from '../utils/api';
import { useAuth } from './AuthContext.js';
import { CURRENCY_SYMBOL } from '../utils/currency';

const STATUS_STYLES = {
  confirmed: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  pending: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  completed: 'bg-sky-500/15 text-sky-300 border-sky-500/30',
  cancelled: 'bg-red-500/15 text-red-300 border-red-500/30',
};

const PAYMENT_LABELS = {
  paid: 'Payment Received',
  pending: 'Awaiting Payment',
  failed: 'Payment Failed',
};

function formatDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? String(value) : d.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatMoney(amount, currency = 'INR') {
  const value = Number(amount) || 0;
  return `${currency === 'INR' ? CURRENCY_SYMBOL : currency + ' '}${value.toLocaleString()}`;
}

export default function BookingsManager() {
  const { token } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState('');

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await apiFetch('/api/admin/bookings', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load bookings.');
      setBookings(Array.isArray(data.bookings) ? data.bookings : []);
    } catch (err) {
      setError(err.message || 'Failed to load bookings.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    // Initial load; network completion updates state asynchronously.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchBookings();
  }, [fetchBookings]);

  const updateStatus = async (id, status) => {
    try {
      setUpdatingId(id);
      const res = await apiFetch(`/api/admin/bookings/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update status.');
      setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
    } catch (err) {
      setError(err.message || 'Failed to update status.');
    } finally {
      setUpdatingId('');
    }
  };

  // Only bookings whose payment has actually been received count as "Booked".
  const paidBookings = bookings.filter((b) => b.payment_status === 'paid');
  const paidCount = paidBookings.length;
  const pendingCount = bookings.length - paidCount;
  const totalRevenue = paidBookings.reduce((sum, b) => sum + (Number(b.total_amount) || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-[#10281e]/80 p-5 rounded-2xl border border-white/10">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CalendarCheck className="w-5 h-5 text-[#caa34b]" />
            Booked Homestays
          </h2>
          <p className="text-xs text-white/60 mt-1">Confirmed bookings and the payments received from your guests.</p>
        </div>
        <button onClick={() => void fetchBookings()} disabled={loading} className="inline-flex items-center gap-2 self-start sm:self-auto rounded-lg bg-white/10 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-white/15 disabled:opacity-50">
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />Refresh
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-emerald-300/80 font-bold">Booked Stays</p>
          <p className="mt-2 text-3xl font-bold text-emerald-300">{paidCount}</p>
        </div>
        <div className="rounded-2xl border border-white/10 bg-[#0a1711] p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-white/50 font-bold">Payments Received</p>
          <p className="mt-2 text-3xl font-bold text-white">{formatMoney(totalRevenue)}</p>
        </div>
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5">
          <p className="text-xs uppercase tracking-[0.2em] text-amber-300/80 font-bold">Awaiting Payment</p>
          <p className="mt-2 text-3xl font-bold text-amber-300">{pendingCount}</p>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200 text-sm">{error}</div>
      )}

      {loading ? (
        <div className="py-12 text-center text-white/50 text-sm">Loading bookings…</div>
      ) : paidBookings.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-white/10 rounded-2xl p-8">
          <CalendarCheck className="w-12 h-12 text-white/20 mx-auto mb-3" />
          <p className="text-sm text-white/60 font-medium">No paid bookings yet.</p>
          <p className="text-xs text-white/40 mt-1">A stay appears here only after the guest's payment is received.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {paidBookings.map((b) => {
            const paid = b.payment_status === 'paid';
            return (
              <div key={b.id} className="rounded-2xl border border-white/10 bg-[#0a1711] overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-white/10 p-4 bg-[#10281e]/60">
                  <div className="flex items-center gap-3 min-w-0">
                    {b.image ? (
                      <img src={b.image} alt={b.stay_name} className="h-14 w-20 shrink-0 rounded-lg object-cover border border-white/15" />
                    ) : (
                      <div className="h-14 w-20 shrink-0 rounded-lg bg-black/40 border border-white/10" />
                    )}
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-white">{b.stay_name || 'Homestay'}</p>
                      <p className="truncate text-[11px] text-white/55">{b.booking_ref} · {b.room_name}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-bold ${paid ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' : b.payment_status === 'failed' ? 'bg-red-500/15 text-red-300 border-red-500/30' : 'bg-amber-500/15 text-amber-300 border-amber-500/30'}`}>
                      {paid ? <CheckCircle className="w-3 h-3" /> : b.payment_status === 'failed' ? <XCircle className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                      {PAYMENT_LABELS[b.payment_status] || b.payment_status}
                    </span>
                    <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold capitalize ${STATUS_STYLES[b.status] || 'bg-white/10 text-white/70 border-white/15'}`}>{b.status}</span>
                  </div>
                </div>

                <div className="grid gap-4 p-4 md:grid-cols-2">
                  <div className="space-y-2 text-xs text-white/70">
                    <p className="flex items-center gap-2"><User className="w-3.5 h-3.5 text-[#caa34b]" /><span className="font-semibold text-white/85">{b.user_name || 'Guest'}</span></p>
                    <p className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-[#caa34b]" />{b.user_email || '—'}</p>
                    <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-[#caa34b]" />{b.user_phone || '—'}</p>
                    <p className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-[#caa34b]" />{formatDate(b.check_in)} → {formatDate(b.check_out)} · {b.nights} night(s) · {b.guests} guest(s)</p>
                  </div>
                  <div className="space-y-2 text-xs text-white/70 md:border-l md:border-white/10 md:pl-4">
                    <p className="flex items-center gap-2"><CreditCard className="w-3.5 h-3.5 text-[#caa34b]" />{b.payment?.method || (b.payment_mode === 'simulation' ? 'Simulated Test Gateway' : 'Razorpay Gateway')}</p>
                    <p className="flex items-center justify-between gap-2"><span>Amount</span><span className="font-bold text-white">{formatMoney(b.total_amount, b.currency)}</span></p>
                    {b.payment?.transaction_id && <p className="truncate">Txn: {b.payment.razorpay_payment_id || b.payment.transaction_id}</p>}
                    {b.razorpay_order_id && <p className="truncate">Order: {b.razorpay_order_id}</p>}
                    <p>Booked on {formatDate(b.created_at)}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 border-t border-white/10 p-3">
                  <label className="text-[11px] font-semibold text-white/60">Booking status:</label>
                  <select
                    value={b.status}
                    disabled={updatingId === b.id}
                    onChange={(e) => updateStatus(b.id, e.target.value)}
                    className="bg-[#10281e] text-white text-[11px] rounded-lg border border-white/15 px-2 py-1 focus:outline-none focus:border-[#caa34b] disabled:opacity-50"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}