import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useUserAuth } from '../context/UserAuthContext';
import { formatPrice } from '../utils/currency';
import {
  User,
  ShoppingBag,
  Calendar,
  CreditCard,
  Clock,
  LogOut,
  Edit2,
  Lock,
  Trash2,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  MapPin,
  Users,
  ChevronRight,
  Shield,
  Receipt,
  ArrowRight
} from 'lucide-react';

export default function Dashboard() {
  const {
    user,
    isAuthenticated,
    loading: authLoading,
    logout,
    updateProfile,
    changePassword,
    cart,
    cartTotal,
    removeFromCart,
    updateCartItem,
    fetchBookings,
    fetchPayments,
    fetchRecentViews
  } = useUserAuth();

  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'profile';
  const navigate = useNavigate();

  // Tab data states
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [recentViews, setRecentViews] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Profile Edit states
  const [editingProfile, setEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [profileMsg, setProfileMsg] = useState({ type: '', text: '' });
  const [profileSaving, setProfileSaving] = useState(false);

  // Password Change states
  const [changingPassword, setChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });
  const [passwordSaving, setPasswordSaving] = useState(false);

  // Selected Booking Details Modal
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Redirect if unauthenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/dashboard' } } });
    }
  }, [authLoading, isAuthenticated, navigate]);

  // Load active tab data
  useEffect(() => {
    if (!isAuthenticated) return;

    let isMounted = true;
    setDataLoading(true);

    const loadData = async () => {
      try {
        const [bookingsData, paymentsData, viewsData] = await Promise.all([
          fetchBookings().catch(() => []),
          fetchPayments().catch(() => []),
          fetchRecentViews().catch(() => [])
        ]);

        if (isMounted) {
          setBookings(bookingsData);
          setPayments(paymentsData);
          setRecentViews(viewsData);
        }
      } catch (err) {
        console.warn('Dashboard data fetch warning:', err);
      } finally {
        if (isMounted) setDataLoading(false);
      }
    };

    loadData();

    if (user) {
      setEditName(user.name || '');
      setEditPhone(user.phone || '');
      setEditEmail(user.email || '');
    }

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, user, fetchBookings, fetchPayments, fetchRecentViews]);

  const handleTabChange = (tabId) => {
    setSearchParams({ tab: tabId });
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileMsg({ type: '', text: '' });
    setProfileSaving(true);
    try {
      await updateProfile({ name: editName, phone: editPhone, email: editEmail });
      setProfileMsg({ type: 'success', text: 'Profile information updated successfully!' });
      setEditingProfile(false);
    } catch (err) {
      setProfileMsg({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordMsg({ type: '', text: '' });

    if (newPassword.length < 6) {
      setPasswordMsg({ type: 'error', text: 'New password must be at least 6 characters long.' });
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setPasswordMsg({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    setPasswordSaving(true);
    try {
      await changePassword(currentPassword, newPassword);
      setPasswordMsg({ type: 'success', text: 'Password changed successfully!' });
      setChangingPassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
    } catch (err) {
      setPasswordMsg({ type: 'error', text: err.message || 'Failed to change password.' });
    } finally {
      setPasswordSaving(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center space-y-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#caa34b] border-t-transparent mx-auto" />
          <p className="text-xs uppercase tracking-widest text-[#7a5e1c]">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const tabs = [
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'cart', label: `My Cart (${cart.length})`, icon: ShoppingBag },
    { id: 'recent', label: 'Recent Stays', icon: Clock },
    { id: 'bookings', label: `My Bookings (${bookings.length})`, icon: Calendar },
    { id: 'payments', label: `Payment History (${payments.length})`, icon: CreditCard }
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header Profile Hero Card */}
      <div className="relative overflow-hidden rounded-[32px] border border-[#e5dfd1] bg-gradient-to-br from-[#10281e] to-[#1a3d2e] p-6 sm:p-8 text-white shadow-xl">
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#caa34b]/15 blur-3xl" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="flex h-16 w-16 sm:h-20 sm:w-20 shrink-0 items-center justify-center rounded-full border-2 border-[#caa34b] bg-[#caa34b]/20 text-2xl sm:text-3xl font-bold text-[#caa34b] shadow-inner">
              {(user.name || user.email || 'G')[0].toUpperCase()}
            </div>
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#caa34b]">
                <Shield className="h-3 w-3" />
                <span>Verified Guest Account</span>
              </div>
              <h1 className="display-font text-2xl sm:text-3xl font-bold tracking-tight">{user.name || 'Traveler'}</h1>
              <p className="text-xs sm:text-sm text-white/75">{user.email}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-white/20"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Sign Out</span>
            </button>
            <Link
              to="/homestays"
              className="flex items-center gap-2 rounded-xl bg-[var(--accent-gold,#caa34b)] px-4 py-2.5 text-xs font-semibold text-[#10281e] shadow-md transition hover:bg-[#d8b85e]"
            >
              <span>Explore Stays</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* Horizontal Navigation Tabs */}
        <div className="mt-8 flex gap-2 overflow-x-auto border-t border-white/10 pt-4 no-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 whitespace-nowrap rounded-xl px-4 py-2.5 text-xs font-semibold transition ${
                  active
                    ? 'bg-[#caa34b] text-[#10281e] shadow-md'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mt-8">
        {/* ==================================================== */}
        {/* SECTION A: MY PROFILE */}
        {/* ==================================================== */}
        {activeTab === 'profile' && (
          <div className="grid gap-6 md:grid-cols-2">
            {/* Account Details Box */}
            <div className="rounded-[28px] border border-[#e5dfd1] bg-[#fffdf8] p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-[#eee8da] pb-4">
                <div>
                  <h2 className="display-font text-xl font-bold text-[#10281e]">Personal Profile</h2>
                  <p className="text-xs text-[#59645a]">Your verified customer details and contact preferences.</p>
                </div>
                {!editingProfile && (
                  <button
                    onClick={() => setEditingProfile(true)}
                    className="flex items-center gap-1.5 rounded-lg border border-[#caa34b]/40 bg-[#f7f2e4] px-3 py-1.5 text-xs font-semibold text-[#7a5e1c] hover:bg-[#f1ead7] transition"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    <span>Edit Profile</span>
                  </button>
                )}
              </div>

              {profileMsg.text && (
                <div
                  className={`rounded-xl p-3 text-xs font-medium ${
                    profileMsg.type === 'success'
                      ? 'border border-emerald-200 bg-emerald-50 text-emerald-800'
                      : 'border border-red-200 bg-red-50 text-red-700'
                  }`}
                >
                  {profileMsg.text}
                </div>
              )}

              {editingProfile ? (
                <form onSubmit={handleProfileSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#415044]">Full Name</label>
                    <input
                      type="text"
                      required
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-[#ded8c9] bg-[#faf8f1] px-4 py-2.5 text-sm text-[#10281e] outline-none focus:border-[#caa34b]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#415044]">Email Address</label>
                    <input
                      type="email"
                      required
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="mt-1.5 w-full rounded-xl border border-[#ded8c9] bg-[#faf8f1] px-4 py-2.5 text-sm text-[#10281e] outline-none focus:border-[#caa34b]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#415044]">Phone Number</label>
                    <input
                      type="tel"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      placeholder="+91 98000 00000"
                      className="mt-1.5 w-full rounded-xl border border-[#ded8c9] bg-[#faf8f1] px-4 py-2.5 text-sm text-[#10281e] outline-none focus:border-[#caa34b]"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      disabled={profileSaving}
                      className="rounded-xl bg-[#10281e] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1a3d2e] transition"
                    >
                      {profileSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingProfile(false)}
                      className="rounded-xl border border-[#ded8c9] px-4 py-2 text-xs font-semibold text-[#59645a] hover:bg-[#f2ece0] transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid gap-4 text-sm">
                  <div className="flex justify-between py-2 border-b border-[#eee8da]/60">
                    <span className="text-xs uppercase tracking-wider text-[#59645a]">Full Name</span>
                    <span className="font-semibold text-[#10281e]">{user.name}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#eee8da]/60">
                    <span className="text-xs uppercase tracking-wider text-[#59645a]">Email Address</span>
                    <span className="font-semibold text-[#10281e]">{user.email}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#eee8da]/60">
                    <span className="text-xs uppercase tracking-wider text-[#59645a]">Phone Number</span>
                    <span className="font-semibold text-[#10281e]">{user.phone || 'Not provided'}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[#eee8da]/60">
                    <span className="text-xs uppercase tracking-wider text-[#59645a]">Account Created</span>
                    <span className="font-semibold text-[#10281e]">
                      {user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Verified Member'}
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-xs uppercase tracking-wider text-[#59645a]">Account Security</span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                      <CheckCircle className="h-3.5 w-3.5" />
                      <span>Password & Token Protected</span>
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Change Password Box */}
            <div className="rounded-[28px] border border-[#e5dfd1] bg-[#fffdf8] p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-[#eee8da] pb-4">
                <div>
                  <h2 className="display-font text-xl font-bold text-[#10281e]">Security & Password</h2>
                  <p className="text-xs text-[#59645a]">Manage your account login credentials and security.</p>
                </div>
                {!changingPassword && (
                  <button
                    onClick={() => setChangingPassword(true)}
                    className="flex items-center gap-1.5 rounded-lg border border-[#caa34b]/40 bg-[#f7f2e4] px-3 py-1.5 text-xs font-semibold text-[#7a5e1c] hover:bg-[#f1ead7] transition"
                  >
                    <Lock className="h-3.5 w-3.5" />
                    <span>Change Password</span>
                  </button>
                )}
              </div>

              {passwordMsg.text && (
                <div
                  className={`rounded-xl p-3 text-xs font-medium ${
                    passwordMsg.type === 'success'
                      ? 'border border-emerald-200 bg-emerald-50 text-emerald-800'
                      : 'border border-red-200 bg-red-50 text-red-700'
                  }`}
                >
                  {passwordMsg.text}
                </div>
              )}

              {changingPassword ? (
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#415044]">Current Password</label>
                    <input
                      type="password"
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="mt-1.5 w-full rounded-xl border border-[#ded8c9] bg-[#faf8f1] px-4 py-2.5 text-sm text-[#10281e] outline-none focus:border-[#caa34b]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#415044]">New Password</label>
                    <input
                      type="password"
                      required
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="mt-1.5 w-full rounded-xl border border-[#ded8c9] bg-[#faf8f1] px-4 py-2.5 text-sm text-[#10281e] outline-none focus:border-[#caa34b]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#415044]">Confirm New Password</label>
                    <input
                      type="password"
                      required
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      className="mt-1.5 w-full rounded-xl border border-[#ded8c9] bg-[#faf8f1] px-4 py-2.5 text-sm text-[#10281e] outline-none focus:border-[#caa34b]"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      type="submit"
                      disabled={passwordSaving}
                      className="rounded-xl bg-[#10281e] px-4 py-2 text-xs font-semibold text-white hover:bg-[#1a3d2e] transition"
                    >
                      {passwordSaving ? 'Updating...' : 'Update Password'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setChangingPassword(false)}
                      className="rounded-xl border border-[#ded8c9] px-4 py-2 text-xs font-semibold text-[#59645a] hover:bg-[#f2ece0] transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4 text-sm text-[#59645a]">
                  <p className="leading-relaxed">
                    Your password is encrypted with modern <strong>bcrypt</strong> hashing on our server. For optimal protection, use a unique password of at least 8 characters.
                  </p>
                  <div className="rounded-2xl border border-[#e5dfd1] bg-[#faf8f1] p-4 text-xs space-y-2">
                    <div className="flex items-center gap-2 font-semibold text-[#10281e]">
                      <Shield className="h-4 w-4 text-[#caa34b]" />
                      <span>Account Safeguards</span>
                    </div>
                    <p className="text-[11px] text-[#59645a]">
                      Every booking, cart item, and payment record is strictly tied to your account ID ({user.id}) and is never accessible to other guests.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* SECTION B: MY CART */}
        {/* ==================================================== */}
        {activeTab === 'cart' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="display-font text-2xl font-bold text-[#10281e]">Saved Stays in Your Cart</h2>
                <p className="text-xs text-[#59645a]">Review selected mountain homestays, dates, and room tiers.</p>
              </div>
              <span className="rounded-full border border-[#caa34b]/40 bg-[#f7f2e4] px-3.5 py-1 text-xs font-bold text-[#7a5e1c]">
                {cart.length} {cart.length === 1 ? 'Stay' : 'Stays'}
              </span>
            </div>

            {cart.length === 0 ? (
              <div className="rounded-[28px] border border-dashed border-[#d8d0bf] bg-[#fffdf8] p-12 text-center space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f1ead7] text-[#94742f]">
                  <ShoppingBag className="h-8 w-8" />
                </div>
                <h3 className="display-font text-xl font-bold text-[#10281e]">Your cart is currently empty</h3>
                <p className="mx-auto max-w-md text-xs text-[#59645a] leading-relaxed">
                  Browse our tranquil homestays in Kalimpong, choose your preferred room and travel dates, and reserve them seamlessly.
                </p>
                <Link
                  to="/homestays"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#10281e] px-6 py-3 text-xs font-semibold text-white shadow-md hover:bg-[#1a3d2e] transition"
                >
                  <span>Explore Homestays</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            ) : (
              <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
                {/* Cart Items List */}
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-[24px] border border-[#e5dfd1] bg-[#fffdf8] p-5 shadow-sm transition hover:shadow-md"
                    >
                      <div className="flex flex-col sm:flex-row gap-4">
                        <img
                          src={item.image || 'https://thepinegetaways.com/images/homestays/mairung.jpg'}
                          alt={item.stay_name}
                          className="h-28 w-full sm:w-36 rounded-2xl object-cover shrink-0"
                        />
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <Link
                                to={`/homestays/${item.stay_slug}`}
                                className="font-bold text-base text-[#10281e] hover:text-[#caa34b] transition flex items-center gap-1.5"
                              >
                                <span>{item.stay_name}</span>
                                <ExternalLink className="h-3 w-3 text-[#7a5e1c]" />
                              </Link>
                              <span className="inline-block rounded-md bg-[#f1ead7] px-2 py-0.5 text-[10px] font-semibold text-[#7a5e1c]">
                                {item.room_name}
                              </span>
                            </div>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-red-500 hover:text-red-700 p-1 rounded-lg hover:bg-red-50 transition"
                              title="Remove stay"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>

                          {/* Editable Date Pickers */}
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 text-xs">
                            <div>
                              <label className="text-[10px] font-bold text-[#59645a] uppercase">Check-in</label>
                              <input
                                type="date"
                                value={item.check_in}
                                onChange={(e) => updateCartItem(item.id, { checkIn: e.target.value })}
                                className="mt-0.5 w-full rounded-lg border border-[#ded8c9] bg-[#faf8f1] px-2 py-1 text-xs text-[#10281e]"
                              />
                            </div>
                            <div>
                              <label className="text-[10px] font-bold text-[#59645a] uppercase">Check-out</label>
                              <input
                                type="date"
                                value={item.check_out}
                                onChange={(e) => updateCartItem(item.id, { checkOut: e.target.value })}
                                className="mt-0.5 w-full rounded-lg border border-[#ded8c9] bg-[#faf8f1] px-2 py-1 text-xs text-[#10281e]"
                              />
                            </div>
                            <div className="col-span-2 sm:col-span-1">
                              <label className="text-[10px] font-bold text-[#59645a] uppercase">Guests</label>
                              <select
                                value={item.guests}
                                onChange={(e) => updateCartItem(item.id, { guests: parseInt(e.target.value, 10) })}
                                className="mt-0.5 w-full rounded-lg border border-[#ded8c9] bg-[#faf8f1] px-2 py-1 text-xs text-[#10281e]"
                              >
                                {[1, 2, 3, 4, 5, 6].map((num) => (
                                  <option key={num} value={num}>
                                    {num} {num === 1 ? 'Guest' : 'Guests'}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div className="flex items-center justify-between border-t border-[#eee8da] pt-2 text-xs">
                            <span className="text-[#59645a]">
                              {formatPrice(item.price_per_night)} × {item.nights} {item.nights === 1 ? 'night' : 'nights'}
                            </span>
                            <span className="font-bold text-sm text-[#10281e]">
                              {formatPrice(item.total_price)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Checkout Summary Card */}
                <div className="rounded-[28px] border border-[#e5dfd1] bg-[#fffdf8] p-6 shadow-sm space-y-5 h-fit">
                  <h3 className="display-font text-lg font-bold text-[#10281e]">Reservation Summary</h3>
                  <div className="space-y-3 text-xs text-[#59645a] border-b border-[#eee8da] pb-4">
                    <div className="flex justify-between">
                      <span>Subtotal ({cart.length} stays)</span>
                      <span className="font-semibold text-[#10281e]">{formatPrice(cartTotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Farm Breakfast & Local Dinners</span>
                      <span className="font-semibold text-emerald-700">Included</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Taxes & Village Amenities</span>
                      <span className="font-semibold text-emerald-700">Included</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-baseline pt-1">
                    <span className="text-xs uppercase font-bold text-[#10281e]">Total Payable</span>
                      <span className="display-font text-2xl font-bold text-[#10281e]">{formatPrice(cartTotal)}</span>
                  </div>

                  <Link
                    to="/checkout"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary-color,#10281e)] py-3.5 text-xs font-semibold text-white shadow-md transition hover:bg-[#1a3d2e]"
                  >
                    <span>Proceed to Razorpay Checkout</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>

                  <p className="text-[10px] text-center text-[#8a948b]">
                    Prices validated and calculated by server. Guaranteed authentic rates.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* SECTION C: RECENT STAYS */}
        {/* ==================================================== */}
        {activeTab === 'recent' && (
          <div className="space-y-10">
            {/* 1. Recently Viewed */}
            <div className="space-y-4">
              <div>
                <h2 className="display-font text-2xl font-bold text-[#10281e]">Recently Viewed Homestays</h2>
                <p className="text-xs text-[#59645a]">Places you explored during your recent sessions in Samthar.</p>
              </div>

              {recentViews.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#d8d0bf] bg-[#fffdf8] p-8 text-center text-xs text-[#59645a]">
                  No recently viewed homestays yet. Explore our hillside accommodations!
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {recentViews.map((stay) => (
                    <div
                      key={stay.slug}
                      className="group overflow-hidden rounded-[24px] border border-[#e5dfd1] bg-[#fffdf8] shadow-sm transition hover:shadow-md hover:-translate-y-1"
                    >
                      <div className="relative h-44 overflow-hidden">
                        <img
                          src={stay.mainImage}
                          alt={stay.name}
                          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                        />
                        <span className="absolute bottom-3 left-3 rounded-md bg-[#10281e]/85 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-sm">
                          {formatPrice(stay.priceStarting)} / night
                        </span>
                      </div>
                      <div className="p-4 space-y-2">
                        <div className="flex items-center gap-1 text-[10px] font-bold text-[#7a5e1c]">
                          <MapPin className="h-3 w-3" />
                          <span>{stay.location}</span>
                        </div>
                        <h3 className="display-font text-base font-bold text-[#10281e]">{stay.name}</h3>
                        <p className="line-clamp-2 text-xs text-[#59645a]">{stay.description}</p>
                        <Link
                          to={`/homestays/${stay.slug}`}
                          className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#caa34b] hover:underline"
                        >
                          <span>View Property Details</span>
                          <ArrowRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Recently Booked Stays */}
            <div className="space-y-4 border-t border-[#eee8da] pt-8">
              <div>
                <h2 className="display-font text-2xl font-bold text-[#10281e]">Your Past & Confirmed Stays</h2>
                <p className="text-xs text-[#59645a]">Homestays you have reserved with verified booking numbers.</p>
              </div>

              {bookings.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-[#d8d0bf] bg-[#fffdf8] p-8 text-center text-xs text-[#59645a]">
                  You have not booked any stays yet. Reserve your first peaceful mountain getaway today.
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {bookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="rounded-[24px] border border-[#e5dfd1] bg-[#fffdf8] p-5 shadow-sm space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[10px] font-bold text-[#7a5e1c]">
                          {booking.booking_ref}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                            booking.status === 'confirmed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {booking.status}
                        </span>
                      </div>
                      <div className="flex gap-3 items-center">
                        <img
                          src={booking.image || 'https://thepinegetaways.com/images/homestays/mairung.jpg'}
                          alt={booking.stay_name}
                          className="h-14 w-14 rounded-xl object-cover shrink-0"
                        />
                        <div>
                          <h4 className="font-bold text-sm text-[#10281e]">{booking.stay_name}</h4>
                          <p className="text-xs text-[#59645a]">{booking.room_name}</p>
                        </div>
                      </div>
                      <div className="text-[11px] text-[#59645a] space-y-1 border-t border-[#eee8da] pt-2">
                        <div>
                          Dates: {booking.check_in} → {booking.check_out} ({booking.nights} nights)
                        </div>
                        <div className="font-semibold text-[#10281e]">
                          Total Paid: {formatPrice(booking.total_amount)}
                        </div>
                      </div>
                      <Link
                        to={`/homestays/${booking.stay_slug}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#caa34b] hover:underline pt-1"
                      >
                        <span>Revisit Stay Listing</span>
                        <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* SECTION D: MY BOOKINGS */}
        {/* ==================================================== */}
        {activeTab === 'bookings' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="display-font text-2xl font-bold text-[#10281e]">All Confirmed Bookings</h2>
                <p className="text-xs text-[#59645a]">Complete record of your reservations, voucher references, and room tiers.</p>
              </div>
              <span className="rounded-full border border-[#caa34b]/40 bg-[#f7f2e4] px-3.5 py-1 text-xs font-bold text-[#7a5e1c]">
                {bookings.length} {bookings.length === 1 ? 'Reservation' : 'Reservations'}
              </span>
            </div>

            {bookings.length === 0 ? (
              <div className="rounded-[28px] border border-dashed border-[#d8d0bf] bg-[#fffdf8] p-12 text-center space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#f1ead7] text-[#94742f]">
                  <Calendar className="h-8 w-8" />
                </div>
                <h3 className="display-font text-xl font-bold text-[#10281e]">No bookings found</h3>
                <p className="mx-auto max-w-md text-xs text-[#59645a]">
                  When you reserve a homestay through our secure Razorpay gateway, your full booking reservation receipt will appear here.
                </p>
                <Link
                  to="/homestays"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#10281e] px-6 py-3 text-xs font-semibold text-white shadow-md hover:bg-[#1a3d2e] transition"
                >
                  <span>Book a Stay</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="rounded-[24px] border border-[#e5dfd1] bg-[#fffdf8] p-6 shadow-sm transition hover:shadow-md"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#eee8da] pb-4">
                      <div className="flex items-center gap-3">
                        <span className="rounded-lg bg-[#f1ead7] px-2.5 py-1 font-mono text-xs font-bold text-[#7a5e1c]">
                          Ref: {booking.booking_ref}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                            booking.payment_status === 'paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          Payment: {booking.payment_status}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                            booking.status === 'confirmed'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          Status: {booking.status}
                        </span>
                      </div>
                      <span className="text-[11px] text-[#59645a]">
                        Booked on {new Date(booking.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </span>
                    </div>

                    <div className="mt-4 flex flex-col sm:flex-row gap-5 items-start sm:items-center justify-between">
                      <div className="flex items-center gap-4">
                        <img
                          src={booking.image || 'https://thepinegetaways.com/images/homestays/mairung.jpg'}
                          alt={booking.stay_name}
                          className="h-20 w-20 rounded-2xl object-cover shrink-0"
                        />
                        <div className="space-y-1">
                          <h3 className="display-font text-lg font-bold text-[#10281e]">{booking.stay_name}</h3>
                          <p className="text-xs font-semibold text-[#7a5e1c]">{booking.room_name}</p>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[#59645a]">
                            <span>Check-in: <strong>{booking.check_in}</strong></span>
                            <span>Check-out: <strong>{booking.check_out}</strong></span>
                            <span>Nights: <strong>{booking.nights}</strong></span>
                            <span>Guests: <strong>{booking.guests}</strong></span>
                          </div>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3">
                        <div className="text-left sm:text-right">
                          <span className="block text-[10px] uppercase tracking-wider text-[#59645a]">Total Amount</span>
                          <span className="display-font text-xl font-bold text-[#10281e]">{formatPrice(booking.total_amount)}</span>
                        </div>
                        <button
                          onClick={() => setSelectedBooking(booking)}
                          className="flex items-center gap-1 rounded-xl border border-[#ded8c9] bg-[#faf8f1] px-3 py-1.5 text-xs font-semibold text-[#10281e] hover:bg-[#f1ead7] transition"
                        >
                          <Receipt className="h-3.5 w-3.5 text-[#7a5e1c]" />
                          <span>View Voucher</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ==================================================== */}
        {/* SECTION E: PAYMENT HISTORY */}
        {/* ==================================================== */}
        {activeTab === 'payments' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="display-font text-2xl font-bold text-[#10281e]">Verified Payment History</h2>
                <p className="text-xs text-[#59645a]">Cryptographically verified transactions processed via Razorpay Gateway.</p>
              </div>
              <span className="rounded-full border border-[#caa34b]/40 bg-[#f7f2e4] px-3.5 py-1 text-xs font-bold text-[#7a5e1c]">
                {payments.length} {payments.length === 1 ? 'Transaction' : 'Transactions'}
              </span>
            </div>

            {payments.length === 0 ? (
              <div className="rounded-[28px] border border-dashed border-[#d8d0bf] bg-[#fffdf8] p-12 text-center space-y-3">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#f1ead7] text-[#94742f]">
                  <CreditCard className="h-7 w-7" />
                </div>
                <h3 className="display-font text-lg font-bold text-[#10281e]">No payment records yet</h3>
                <p className="text-xs text-[#59645a]">
                  All successful payments, transaction IDs, and settlement stamps will be itemized here.
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-[24px] border border-[#e5dfd1] bg-[#fffdf8] shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-[#eee8da] bg-[#f9f6ed] text-[10px] font-bold uppercase tracking-wider text-[#59645a]">
                      <tr>
                        <th className="px-5 py-3.5">Transaction ID</th>
                        <th className="px-5 py-3.5">Booking Ref</th>
                        <th className="px-5 py-3.5">Amount</th>
                        <th className="px-5 py-3.5">Method</th>
                        <th className="px-5 py-3.5">Date & Time</th>
                        <th className="px-5 py-3.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#eee8da] text-[#10281e]">
                      {payments.map((p) => (
                        <tr key={p.id} className="hover:bg-[#faf8f1] transition">
                          <td className="px-5 py-4 font-mono font-bold text-[#7a5e1c]">{p.transaction_id}</td>
                          <td className="px-5 py-4 font-semibold">{p.booking_ref}</td>
                          <td className="px-5 py-4 font-bold text-sm">{formatPrice(p.amount)}</td>
                          <td className="px-5 py-4 text-[#59645a]">{p.payment_method || 'Razorpay'}</td>
                          <td className="px-5 py-4 text-[#59645a]">
                            {new Date(p.created_at).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
                                p.payment_status === 'successful'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : p.payment_status === 'pending'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              <CheckCircle className="h-3 w-3" />
                              <span>{p.payment_status}</span>
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Selected Booking Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg overflow-hidden rounded-[28px] border border-[#e5dfd1] bg-[#fffdf8] shadow-2xl">
            <div className="border-b border-[#eee8da] bg-[#10281e] p-6 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#caa34b]">Reservation Voucher</span>
                <h3 className="display-font text-xl font-bold">{selectedBooking.stay_name}</h3>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="grid h-8 w-8 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20 transition"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 rounded-2xl bg-[#faf8f1] p-4 border border-[#e5dfd1]">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#59645a]">Booking Ref</span>
                  <p className="font-mono font-bold text-sm text-[#7a5e1c]">{selectedBooking.booking_ref}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#59645a]">Payment Status</span>
                  <p className="font-bold text-sm text-emerald-700 capitalize">{selectedBooking.payment_status}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#59645a]">Check-in</span>
                  <p className="font-bold text-[#10281e]">{selectedBooking.check_in}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#59645a]">Check-out</span>
                  <p className="font-bold text-[#10281e]">{selectedBooking.check_out}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#59645a]">Room Tier</span>
                  <p className="font-bold text-[#10281e]">{selectedBooking.room_name}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#59645a]">Guests</span>
                  <p className="font-bold text-[#10281e]">{selectedBooking.guests} Guests ({selectedBooking.nights} Nights)</p>
                </div>
              </div>

              <div className="space-y-1.5 border-t border-[#eee8da] pt-3">
                <div className="flex justify-between">
                  <span className="text-[#59645a]">Guest Name</span>
                  <span className="font-semibold text-[#10281e]">{selectedBooking.user_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#59645a]">Guest Email</span>
                  <span className="font-semibold text-[#10281e]">{selectedBooking.user_email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#59645a]">Transaction / Razorpay ID</span>
                  <span className="font-mono text-[#7a5e1c]">{selectedBooking.razorpay_payment_id || 'Verified'}</span>
                </div>
                <div className="flex justify-between text-sm font-bold pt-2 border-t border-[#eee8da]">
                  <span className="text-[#10281e]">Total Paid</span>
                  <span className="text-[#10281e]">{formatPrice(selectedBooking.total_amount)}</span>
                </div>
              </div>

              <div className="rounded-xl bg-[#f1ead7]/50 p-3 text-[11px] text-[#765c20]">
                ✦ Please present this reservation reference upon arrival at Samthar. Home-cooked Himalayan meals and mountain tea are prepared fresh for your arrival.
              </div>
            </div>

            <div className="border-t border-[#eee8da] p-4 bg-[#faf8f1] flex justify-end">
              <button
                onClick={() => setSelectedBooking(null)}
                className="rounded-xl bg-[#10281e] px-5 py-2 text-xs font-semibold text-white hover:bg-[#1a3d2e] transition"
              >
                Close Voucher
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
