import { useEffect, useState } from 'react';
import {
  CreditCard,
  ShieldCheck,
  RefreshCw,
  CircleAlert,
  CircleCheck,
  Loader2,
  KeyRound
} from 'lucide-react';
import { useAuth } from './AuthContext';

export default function PaymentGatewaySettings() {
  const { token } = useAuth();
  const [status, setStatus] = useState(null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    fetch('/api/payments/config')
      .then((res) => {
        if (!res.ok) throw new Error('Could not load the payment gateway status.');
        return res.json();
      })
      .then((data) => {
        if (active) setStatus(data);
      })
      .catch((err) => {
        if (active) setError(err.message);
      });
    return () => {
      active = false;
    };
  }, []);

  const verifyCredentials = async () => {
    setChecking(true);
    setError('');
    try {
      const res = await fetch('/api/admin/payments/verify-credentials', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Verification request failed.');

      setStatus((prev) => ({
        ...prev,
        paymentMode: data.ok ? 'razorpay' : 'simulation',
        keyId: data.ok ? (prev?.keyId || 'configured') : ''
      }));
      setError(data.ok ? '' : data.detail || 'Razorpay rejected the stored credentials.');
    } catch (err) {
      setError(err.message);
    } finally {
      setChecking(false);
    }
  };

  const liveMode = status?.paymentMode === 'razorpay';

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-[#10281e] to-[#0a1711] p-6 sm:p-8 rounded-3xl border border-white/10">
        <span className="text-xs font-bold uppercase tracking-widest text-[#caa34b]">
          Payments &amp; Checkout
        </span>
        <h1 className="mt-2 text-2xl sm:text-3xl font-bold text-white tracking-wide">
          Razorpay Gateway
        </h1>
        <p className="mt-2 text-xs text-white/60 leading-relaxed max-w-2xl">
          The live Razorpay checkout widget only opens when the server holds working API
          credentials. Until then, guests complete the reservation through the built-in
          sandbox checkout, which confirms the booking exactly the same way.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-[#0d1f17] p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/60">
            <CreditCard className="w-4 h-4 text-[#caa34b]" />
            Checkout Mode
          </div>
          <div className="flex items-center gap-2">
            {liveMode ? (
              <CircleCheck className="w-5 h-5 text-emerald-400" />
            ) : (
              <CircleAlert className="w-5 h-5 text-amber-400" />
            )}
            <span className="text-lg font-bold text-white">
              {liveMode ? 'Live Razorpay' : 'Sandbox Checkout'}
            </span>
          </div>
          <p className="text-[11px] text-white/50 leading-relaxed">
            {liveMode
              ? 'Real gateway orders are created and the Razorpay payment window opens for guests.'
              : 'Test payments are simulated in-app. Bookings, invoices and payment records are still created exactly as they would be for a live payment.'}
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#0d1f17] p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/60">
            <KeyRound className="w-4 h-4 text-[#caa34b]" />
            API Key ID
          </div>
          <p className="font-mono text-xs text-white/80 break-all">
            {status?.keyId || 'Not configured'}
          </p>
          <p className="text-[11px] text-white/50 leading-relaxed">
            The key secret is never displayed or sent to the browser.
          </p>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-[#0d1f17] p-5 space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/60">
          <ShieldCheck className="w-4 h-4 text-[#caa34b]" />
          Credential Check
        </div>
        <p className="text-[11px] text-white/60 leading-relaxed">
          Runs a read-only request against Razorpay using the keys stored in
          <span className="font-mono text-white/80"> server/.env</span>. No order is created.
        </p>

        <button
          onClick={verifyCredentials}
          disabled={checking}
          className="inline-flex items-center gap-2 rounded-xl bg-[#caa34b] px-4 py-2.5 text-xs font-bold text-[#10281e] transition hover:bg-[#d8b85e] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {checking ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          <span>{checking ? 'Verifying…' : 'Verify stored credentials'}</span>
        </button>

        {error && (
          <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 text-[11px] text-amber-200 leading-relaxed whitespace-pre-line">
            {error}
          </div>
        )}

        {!liveMode && !error && (
          <div className="rounded-2xl border border-white/10 bg-[#0a1711] p-4 text-[11px] text-white/60 leading-relaxed whitespace-pre-line">
            {`To enable live payments:
  1. Open Razorpay Dashboard → Settings → API Keys → Generate Test Key
  2. Add the values to server/.env:
       RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXXXXX
       RAZORPAY_KEY_SECRET=<your 32-character key secret>
  3. Save the file — the server restarts automatically and picks up the new keys
  4. Run "Verify stored credentials" above`}
          </div>
        )}
      </div>
    </div>
  );
}
