import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useUserAuth } from '../context/UserAuthContext';
import { Eye, EyeOff, LogIn, Lock, Mail, ArrowRight, ShieldCheck, Sparkles, Mountain, User } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useUserAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login(email, password);
      navigate(from, { replace: true, state: location.state?.from?.state });
    } catch (err) {
      setError(err.message || 'Failed to sign in. Please verify your email and password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#07130e] px-4 py-8 relative overflow-hidden font-sans">
      {/* Background High-res Scenery with Soft Dark Parallax Gradient */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat scale-105 transition-transform duration-1000 opacity-25"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1615751440098-f4ae06aa209e?auto=format&fit=crop&w=2400&q=85')`
        }}
      />

      {/* Atmospheric lighting layers */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#07130e] via-[#07130e]/85 to-[#07130e]/70" />
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#caa34b]/15 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none animate-pulse" />

      {/* Main Login Card - Split Layout with Visual Showcase & Form */}
      <motion.div
        initial={{ opacity: 0, y: 25, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative w-full max-w-4xl bg-[#0f241a]/95 border border-white/15 rounded-3xl shadow-2xl backdrop-blur-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 z-10"
      >
        {/* Left Side: Pictures & Branding Showcase */}
        <div className="relative hidden md:flex flex-col justify-between p-10 bg-gradient-to-br from-[#123123] to-[#0a1b13] border-r border-white/10 overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-overlay"
            style={{
              backgroundImage: `url('https://thepinegetaways.com/images/homestays/mairung.jpg')`
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a1b13] via-transparent to-transparent" />

          {/* Top Logo */}
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#caa34b]/20 border border-[#caa34b]/40 text-[#caa34b] flex items-center justify-center shadow-lg">
              <Mountain className="w-6 h-6" />
            </div>
            <div>
              <span className="display-font block text-xl font-bold tracking-wide text-white">Samthar</span>
              <span className="block text-[9px] font-bold uppercase tracking-[.25em] text-[#caa34b]">Kalimpong · West Bengal</span>
            </div>
          </div>

          {/* Center Visual Callout */}
          <div className="relative z-10 space-y-4 my-8">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-[#caa34b] text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Guest Portal</span>
            </div>
            <h2 className="text-2xl font-bold text-white leading-tight">
              Serene Stays, Simpler Bookings
            </h2>
            <p className="text-xs text-white/70 leading-relaxed">
              Sign in to manage your homestay reservations, track bookings, and enjoy faster checkouts.
            </p>
          </div>

          {/* Bottom Security Assurance */}
          <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] text-white/50">
            <span>Encrypted Guest Session</span>
            <span className="text-[#caa34b] flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
              Protected Portal
            </span>
          </div>
        </div>

        {/* Right Side: Clean Sign In Form */}
        <div className="p-8 sm:p-10 flex flex-col justify-center">
          <div className="text-center md:text-left mb-8">
            <div className="inline-flex md:hidden items-center justify-center w-14 h-14 rounded-2xl bg-[#caa34b]/20 border border-[#caa34b]/40 text-[#caa34b] mb-4">
              <Mountain className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-wide">Welcome Back</h1>
            <p className="text-xs text-emerald-100/70 mt-1">Sign in to manage your stays and bookings.</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-3.5 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200 text-xs flex items-center gap-2.5"
            >
              <ShieldCheck className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-emerald-200/80 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-300/50">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  autoFocus
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-10 pr-4 py-3 bg-[#07130e] border border-white/15 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#caa34b] focus:ring-1 focus:ring-[#caa34b] text-xs transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-emerald-200/80 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-300/50">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-3 bg-[#07130e] border border-white/15 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-[#caa34b] focus:ring-1 focus:ring-[#caa34b] text-xs transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-white/40 hover:text-white transition"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-[#caa34b] hover:bg-[#d8b85e] active:scale-[0.99] text-[#10281e] font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition duration-200 cursor-pointer disabled:opacity-50 mt-2"
            >
              {submitting ? (
                <span>Signing in...</span>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In to Account</span>
                </>
              )}
            </button>
          </form>

          <div className="border-t border-white/10 pt-6 text-center text-xs text-white/50">
            Don't have an account yet?{' '}
            <Link
              to="/signup"
              state={{ from: location.state?.from }}
              className="font-bold text-[#caa34b] hover:underline"
            >
              Create an account <ArrowRight className="inline h-3 w-3" />
            </Link>
          </div>

          <div className="flex items-center justify-center gap-2 text-[10px] text-white/50 mt-6">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>Encrypted Session · Razorpay Protected Checkout</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
