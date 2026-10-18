import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useUserAuth } from '../context/UserAuthContext';
import {
  ShieldCheck,
  CreditCard,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Calendar,
  Users,
  Lock,
  Sparkles,
  Receipt,
  HelpCircle
} from 'lucide-react';

export default function Checkout() {
  const { user, token, cart, cartTotal, isAuthenticated, loading: authLoading, clearCart } = useUserAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Booking item from navigation state or from Cart
  const directStay = location.state?.directStay || null;
  const items = directStay ? [directStay] : cart;
  const isDirect = !!directStay;

  const [initiatingOrder, setInitiatingOrder] = useState(false);
  const [verifyingPayment, setVerifyingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [showTestModal, setShowTestModal] = useState(false);
  const [pendingOrderData, setPendingOrderData] = useState(null);

  // Guest details form state
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/checkout', state: location.state } } });
    }
  }, [authLoading, isAuthenticated, navigate, location.state]);

  useEffect(() => {
    if (user) {
      setGuestName(user.name || '');
      setGuestEmail(user.email || '');
      setGuestPhone(user.phone || '');
    }
  }, [user]);

  // Load Razorpay Script dynamically
  useEffect(() => {
    const scriptId = 'razorpay-checkout-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  if (authLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#caa34b] border-t-transparent" />
      </div>
    );
  }

  if (items.length === 0 && !paymentSuccess) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center space-y-4">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#f1ead7] text-[#94742f]">
          <CreditCard className="h-7 w-7" />
        </div>
        <h2 className="display-font text-2xl font-bold text-[#10281e]">No Stays Selected For Checkout</h2>
        <p className="text-xs text-[#59645a]">
          Your cart is currently empty. Please choose your homestay and room before proceeding to checkout.
        </p>
        <Link
          to="/homestays"
          className="inline-flex items-center gap-2 rounded-xl bg-[#10281e] px-6 py-3 text-xs font-semibold text-white shadow-md hover:bg-[#1a3d2e] transition"
        >
          <span>Explore Homestays</span>
        </Link>
      </div>
    );
  }

  const handleStartPayment = async () => {
    setErrorMessage('');
    setInitiatingOrder(true);

    try {
      // 1. Create order on backend (prices authoritatively calculated)
      const payload = isDirect
        ? {
            staySlug: directStay.stay_slug,
            roomName: directStay.room_name,
            checkIn: directStay.check_in,
            checkOut: directStay.check_out,
            guests: directStay.guests,
            fromCart: false
          }
        : { fromCart: true };

      const orderRes = await fetch('/api/bookings/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) {
        throw new Error(orderData.error || 'Failed to initiate booking order.');
      }

      setPendingOrderData(orderData);

      // 2. Check if official Razorpay checkout is available and key is configured
      if (window.Razorpay && orderData.keyId && !orderData.keyId.includes('public')) {
        const options = {
          key: orderData.keyId,
          amount: orderData.amount,
          currency: orderData.currency || 'INR',
          name: 'Samthar Hill-Stay',
          description: `Booking Reservation: ${orderData.bookingRef}`,
          image: '/samthar-mark.svg?v=2',
          order_id: orderData.razorpayOrderId,
          prefill: {
            name: guestName,
            email: guestEmail,
            contact: guestPhone
          },
          theme: {
            color: '#10281e'
          },
          handler: async function (response) {
            await handleVerifyPayment({
              bookingId: orderData.bookingId,
              razorpay_order_id: response.razorpay_order_id || orderData.razorpayOrderId,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });
          },
          modal: {
            ondismiss: function () {
              setErrorMessage('Payment window was closed. You can retry payment anytime.');
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', function (response) {
          setErrorMessage(response.error.description || 'Payment transaction failed. Please retry.');
        });
        rzp.open();
      } else {
        // Open the integrated test simulation gateway modal
        setShowTestModal(true);
      }
    } catch (err) {
      console.error('Payment Error:', err);
      setErrorMessage(err.message || 'Payment initiation error.');
    } finally {
      setInitiatingOrder(false);
    }
  };

  const handleVerifyPayment = async (verificationPayload) => {
    setVerifyingPayment(true);
    setErrorMessage('');
    setShowTestModal(false);

    try {
      const verifyRes = await fetch('/api/bookings/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(verificationPayload)
      });

      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) {
        throw new Error(verifyData.error || 'Payment verification failed on the server.');
      }

      setPaymentSuccess(verifyData.booking);
    } catch (err) {
      console.error('Verification error:', err);
      setErrorMessage(err.message || 'Could not verify payment signature.');
    } finally {
      setVerifyingPayment(false);
    }
  };

  const handleSimulatedSuccess = async () => {
    if (!pendingOrderData) return;
    const simulatedPaymentId = `pay_sim_${Date.now()}`;
    await handleVerifyPayment({
      bookingId: pendingOrderData.bookingId,
      razorpay_order_id: pendingOrderData.razorpayOrderId,
      razorpay_payment_id: simulatedPaymentId,
      razorpay_signature: `simulated_sig_${pendingOrderData.razorpayOrderId}_verified`
    });
  };

  const handleSimulatedFailure = () => {
    setShowTestModal(false);
    setErrorMessage('Payment cancelled by user. No funds were debited.');
  };

  // SUCCESS CONFIRMATION VIEW
  if (paymentSuccess) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <div className="overflow-hidden rounded-[32px] border border-[#d4cbb8] bg-[#fffdf8] shadow-2xl">
          <div className="bg-[#10281e] p-8 text-center text-white space-y-3">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#caa34b] text-[#10281e] shadow-lg animate-bounce">
              <CheckCircle className="h-8 w-8" />
            </div>
            <span className="inline-block rounded-full bg-[#caa34b]/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#caa34b]">
              Verified & Confirmed
            </span>
            <h1 className="display-font text-3xl font-bold">Booking Confirmed!</h1>
            <p className="text-xs text-white/80 max-w-md mx-auto">
              Your mountain getaway has been reserved successfully. A receipt voucher has been added to your dashboard.
            </p>
          </div>

          <div className="p-8 space-y-6">
            <div className="rounded-2xl border border-[#e5dfd1] bg-[#faf8f1] p-5 space-y-3 text-xs">
              <div className="flex justify-between items-center border-b border-[#eee8da] pb-3">
                <span className="text-[10px] uppercase font-bold text-[#59645a]">Booking Reference</span>
                <span className="font-mono font-bold text-sm text-[#7a5e1c]">{paymentSuccess.booking_ref}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#59645a]">Homestay</span>
                <span className="font-semibold text-[#10281e]">{paymentSuccess.stay_name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#59645a]">Room Tier</span>
                <span className="font-semibold text-[#10281e]">{paymentSuccess.room_name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#59645a]">Check-in / Check-out</span>
                <span className="font-semibold text-[#10281e]">{paymentSuccess.check_in} → {paymentSuccess.check_out}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#59645a]">Duration & Guests</span>
                <span className="font-semibold text-[#10281e]">{paymentSuccess.nights} Nights, {paymentSuccess.guests} Guests</span>
              </div>
              <div className="flex justify-between items-center border-t border-[#eee8da] pt-3 text-sm font-bold">
                <span className="text-[#10281e]">Amount Paid</span>
                <span className="text-emerald-700">${paymentSuccess.total_amount} (Paid via Razorpay)</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                to="/dashboard?tab=bookings"
                className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#10281e] py-3.5 text-xs font-semibold text-white shadow-md hover:bg-[#1a3d2e] transition"
              >
                <Receipt className="h-4 w-4 text-[#caa34b]" />
                <span>View My Bookings</span>
              </Link>
              <Link
                to="/homestays"
                className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-[#ded8c9] bg-[#faf8f1] py-3.5 text-xs font-semibold text-[#10281e] hover:bg-[#f1ead7] transition"
              >
                <span>Browse More Stays</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const computedSubtotal = items.reduce((acc, i) => acc + Number(i.total_price || 0), 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Back button */}
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 rounded-lg border border-[#ded8c9] bg-[#fffdf8] px-3 py-1.5 text-xs font-semibold text-[#59645a] hover:text-[#10281e] transition"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to previous page</span>
        </button>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr]">
        {/* Left Column: Guest Details & Review */}
        <div className="space-y-6">
          <div className="rounded-[28px] border border-[#e5dfd1] bg-[#fffdf8] p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#7a5e1c]">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
                <span>Step 1 of 2: Guest Details</span>
              </div>
              <h2 className="display-font text-2xl font-bold text-[#10281e] mt-1">Primary Guest Information</h2>
              <p className="text-xs text-[#59645a]">
                We use these details for your homestay check-in voucher and local host pickup coordination.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 text-xs">
              <div>
                <label className="block font-bold text-[#415044] uppercase tracking-wider text-[10px]">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-[#ded8c9] bg-[#faf8f1] px-3.5 py-2.5 text-sm text-[#10281e] outline-none focus:border-[#caa34b]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#415044] uppercase tracking-wider text-[10px]">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={guestEmail}
                  onChange={(e) => setGuestEmail(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-[#ded8c9] bg-[#faf8f1] px-3.5 py-2.5 text-sm text-[#10281e] outline-none focus:border-[#caa34b]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-[#415044] uppercase tracking-wider text-[10px]">
                  Phone Number for Arrival Coordination
                </label>
                <input
                  type="tel"
                  value={guestPhone}
                  onChange={(e) => setGuestPhone(e.target.value)}
                  placeholder="+91 98000 00000"
                  className="mt-1.5 w-full rounded-xl border border-[#ded8c9] bg-[#faf8f1] px-3.5 py-2.5 text-sm text-[#10281e] outline-none focus:border-[#caa34b]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-[#415044] uppercase tracking-wider text-[10px]">
                  Special Requests / Dietary Preferences (Optional)
                </label>
                <textarea
                  rows={2}
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="Vegetarian meals, early morning pickup from Kalimpong town, bonfire request..."
                  className="mt-1.5 w-full rounded-xl border border-[#ded8c9] bg-[#faf8f1] p-3 text-xs text-[#10281e] outline-none focus:border-[#caa34b]"
                />
              </div>
            </div>
          </div>

          {/* Stays Being Reserved */}
          <div className="rounded-[28px] border border-[#e5dfd1] bg-[#fffdf8] p-6 sm:p-8 shadow-sm space-y-4">
            <h3 className="display-font text-lg font-bold text-[#10281e]">Selected Accommodation</h3>
            <div className="space-y-3">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className="flex gap-4 rounded-2xl border border-[#eee8da] bg-[#faf8f1] p-4 items-center"
                >
                  <img
                    src={item.image || 'https://thepinegetaways.com/images/homestays/mairung.jpg'}
                    alt={item.stay_name}
                    className="h-16 w-16 rounded-xl object-cover shrink-0"
                  />
                  <div className="flex-1 space-y-1">
                    <h4 className="font-bold text-sm text-[#10281e]">{item.stay_name}</h4>
                    <p className="text-xs text-[#7a5e1c] font-semibold">{item.room_name}</p>
                    <div className="text-[11px] text-[#59645a] flex gap-3">
                      <span>{item.check_in} → {item.check_out}</span>
                      <span>({item.nights} nights, {item.guests} guests)</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-sm text-[#10281e]">${item.total_price}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Price Breakdown & Razorpay Trigger */}
        <div className="space-y-6">
          <div className="rounded-[28px] border border-[#e5dfd1] bg-[#fffdf8] p-6 sm:p-8 shadow-sm space-y-5">
            <div>
              <div className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-[#7a5e1c]">
                <Lock className="h-3.5 w-3.5 text-[#caa34b]" />
                <span>Step 2 of 2: Payment</span>
              </div>
              <h3 className="display-font text-xl font-bold text-[#10281e] mt-1">Payment Breakdown</h3>
            </div>

            {errorMessage && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700 animate-shake flex gap-2 items-start">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            <div className="space-y-3 text-xs text-[#59645a] border-b border-[#eee8da] pb-4">
              <div className="flex justify-between">
                <span>Room Charges ({items.length} stays)</span>
                <span className="font-semibold text-[#10281e]">${computedSubtotal}</span>
              </div>
              <div className="flex justify-between">
                <span>Himalayan Farm Breakfast & Dinner</span>
                <span className="font-semibold text-emerald-700">Included Free</span>
              </div>
              <div className="flex justify-between">
                <span>GST & Tourism Levies</span>
                <span className="font-semibold text-emerald-700">Included</span>
              </div>
              <div className="flex justify-between">
                <span>Host Coordination & Tea Rituals</span>
                <span className="font-semibold text-emerald-700">Included</span>
              </div>
            </div>

            <div className="flex items-baseline justify-between pt-1">
              <div>
                <span className="block text-xs uppercase font-bold text-[#10281e]">Grand Total</span>
                <span className="text-[10px] text-[#8a948b]">Approx ₹{Math.round(computedSubtotal * 85)}</span>
              </div>
              <span className="display-font text-3xl font-bold text-[#10281e]">
                ${computedSubtotal}
              </span>
            </div>

            <button
              onClick={handleStartPayment}
              disabled={initiatingOrder || verifyingPayment}
              className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-[var(--primary-color,#10281e)] py-4 text-sm font-semibold text-white shadow-lg transition hover:bg-[#1a3d2e] disabled:opacity-60"
            >
              {initiatingOrder ? (
                <span>Connecting to Gateway...</span>
              ) : verifyingPayment ? (
                <span>Verifying Signature...</span>
              ) : (
                <>
                  <CreditCard className="h-4 w-4 text-[#caa34b]" />
                  <span>Pay with Razorpay Gateway</span>
                </>
              )}
            </button>

            <div className="rounded-2xl border border-[#e5dfd1] bg-[#faf8f1] p-4 text-[11px] text-[#59645a] space-y-2">
              <div className="flex items-center gap-2 font-semibold text-[#10281e]">
                <ShieldCheck className="h-4 w-4 text-[#caa34b]" />
                <span>Razorpay 256-Bit SSL Protection</span>
              </div>
              <p className="text-[10px] leading-relaxed">
                Supports UPI, Credit/Debit Cards, NetBanking, and Wallets. Payments are cryptographically verified by server before booking confirmation.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Test Mode Simulation Modal (For test keys or sandbox environment) */}
      {showTestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md overflow-hidden rounded-[28px] border border-[#e5dfd1] bg-[#fffdf8] shadow-2xl">
            <div className="bg-[#10281e] p-6 text-white space-y-1">
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-[#caa34b]/20 px-2.5 py-0.5 text-[10px] font-bold text-[#caa34b]">
                  Razorpay Checkout Gateway
                </span>
                <button
                  onClick={() => setShowTestModal(false)}
                  className="text-white/60 hover:text-white"
                >
                  ✕
                </button>
              </div>
              <h3 className="display-font text-xl font-bold">Complete Reservation</h3>
              <p className="text-xs text-white/70">
                Order: <span className="font-mono text-[#caa34b]">{pendingOrderData?.razorpayOrderId}</span>
              </p>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="rounded-2xl bg-[#faf8f1] p-4 border border-[#e5dfd1] space-y-2">
                <div className="flex justify-between">
                  <span className="text-[#59645a]">Payable Amount</span>
                  <span className="font-bold text-sm text-[#10281e]">
                    ${pendingOrderData?.displayAmount} (₹{Math.round(pendingOrderData?.displayAmount * 85)})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#59645a]">Booking Ref</span>
                  <span className="font-mono font-bold text-[#7a5e1c]">{pendingOrderData?.bookingRef}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#59645a]">Gateway Mode</span>
                  <span className="text-blue-700 font-semibold">Test Sandbox Ready</span>
                </div>
              </div>

              <p className="text-[#59645a] leading-relaxed text-[11px]">
                Click below to simulate real-time card/UPI gateway confirmation and trigger server-side HMAC SHA-256 signature verification.
              </p>

              <div className="space-y-2 pt-2">
                <button
                  onClick={handleSimulatedSuccess}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-700 py-3 text-xs font-semibold text-white hover:bg-emerald-800 shadow transition"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Simulate Successful Razorpay Payment</span>
                </button>
                <button
                  onClick={handleSimulatedFailure}
                  className="w-full rounded-xl border border-red-200 bg-red-50 py-2.5 text-xs font-semibold text-red-700 hover:bg-red-100 transition"
                >
                  Simulate Gateway Cancellation / Failure
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
