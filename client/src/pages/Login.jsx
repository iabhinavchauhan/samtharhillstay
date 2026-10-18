import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useUserAuth } from '../context/UserAuthContext';
import { Eye, EyeOff, LogIn, Lock, Mail, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

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
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to sign in. Please verify your email and password.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoFill = () => {
    setEmail('traveler@samthar.com');
    setPassword('password123');
    setError('');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-[32px] border border-[#e5dfd1] bg-[#fffdf8] p-8 shadow-xl">
        <div className="text-center space-y-2">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-[#caa34b]/40 bg-[#f7f2e4] px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-[#7a5e1c]">
            <Sparkles className="h-3.5 w-3.5 text-[#caa34b]" />
            <span>Guest Portal</span>
          </div>
          <h1 className="display-font text-3xl font-bold tracking-tight text-[#10281e]">Welcome Back</h1>
          <p className="text-xs text-[#59645a]">
            Sign in to manage your stays, view your cart, and track booking reservations.
          </p>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-700 animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#415044]">
              Email Address
            </label>
            <div className="relative mt-2">
              <Mail className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-[#8a948b]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full rounded-xl border border-[#ded8c9] bg-[#faf8f1] pl-10 pr-4 py-3 text-sm text-[#10281e] outline-none transition focus:border-[#caa34b] focus:ring-2 focus:ring-[#caa34b]/20"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#415044]">
                Password
              </label>
            </div>
            <div className="relative mt-2">
              <Lock className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-[#8a948b]" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl border border-[#ded8c9] bg-[#faf8f1] pl-10 pr-10 py-3 text-sm text-[#10281e] outline-none transition focus:border-[#caa34b] focus:ring-2 focus:ring-[#caa34b]/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-3.5 text-[#8a948b] hover:text-[#10281e]"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary-color,#10281e)] py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#1a3d2e] disabled:opacity-60"
          >
            {submitting ? (
              <span>Signing in...</span>
            ) : (
              <>
                <LogIn className="h-4 w-4" />
                <span>Sign In to Account</span>
              </>
            )}
          </button>
        </form>

        <div className="pt-2">
          <button
            type="button"
            onClick={handleDemoFill}
            className="w-full rounded-xl border border-dashed border-[#caa34b] bg-[#f9f5eb] py-2 text-xs font-semibold text-[#765c20] transition hover:bg-[#f1ead7]"
          >
            Fill Demo Guest Credentials (traveler@samthar.com)
          </button>
        </div>

        <div className="border-t border-[#eee8da] pt-6 text-center text-xs text-[#59645a]">
          Don't have an account yet?{' '}
          <Link
            to="/signup"
            state={{ from: location.state?.from }}
            className="font-bold text-[#caa34b] hover:underline"
          >
            Create an account <ArrowRight className="inline h-3 w-3" />
          </Link>
        </div>

        <div className="flex items-center justify-center gap-2 text-[10px] text-[#8a948b]">
          <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
          <span>Encrypted Session · Razorpay Protected Checkout</span>
        </div>
      </div>
    </div>
  );
}
