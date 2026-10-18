import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useUserAuth } from '../context/UserAuthContext';
import { Eye, EyeOff, UserPlus, Lock, Mail, User, Phone, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { signup } = useUserAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify your entries.');
      return;
    }

    setSubmitting(true);

    try {
      await signup(name, email, password, phone);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-[32px] border border-[#e5dfd1] bg-[#fffdf8] p-8 shadow-xl">
        <div className="text-center space-y-2">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-[#caa34b]/40 bg-[#f7f2e4] px-3.5 py-1 text-xs font-semibold uppercase tracking-widest text-[#7a5e1c]">
            <Sparkles className="h-3.5 w-3.5 text-[#caa34b]" />
            <span>New Traveler</span>
          </div>
          <h1 className="display-font text-3xl font-bold tracking-tight text-[#10281e]">Create Account</h1>
          <p className="text-xs text-[#59645a]">
            Join Samthar to book serene homestays, save favorites, and enjoy instant checkouts.
          </p>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-xs font-medium text-red-700 animate-shake">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#415044]">
              Full Name
            </label>
            <div className="relative mt-1.5">
              <User className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-[#8a948b]" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Rohan Sharma"
                className="w-full rounded-xl border border-[#ded8c9] bg-[#faf8f1] pl-10 pr-4 py-3 text-sm text-[#10281e] outline-none transition focus:border-[#caa34b] focus:ring-2 focus:ring-[#caa34b]/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#415044]">
              Email Address
            </label>
            <div className="relative mt-1.5">
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
            <label className="block text-xs font-bold uppercase tracking-wider text-[#415044]">
              Phone Number (Optional)
            </label>
            <div className="relative mt-1.5">
              <Phone className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-[#8a948b]" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98000 00000"
                className="w-full rounded-xl border border-[#ded8c9] bg-[#faf8f1] pl-10 pr-4 py-3 text-sm text-[#10281e] outline-none transition focus:border-[#caa34b] focus:ring-2 focus:ring-[#caa34b]/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#415044]">
              Password
            </label>
            <div className="relative mt-1.5">
              <Lock className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-[#8a948b]" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
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

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#415044]">
              Confirm Password
            </label>
            <div className="relative mt-1.5">
              <Lock className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-[#8a948b]" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="w-full rounded-xl border border-[#ded8c9] bg-[#faf8f1] pl-10 pr-4 py-3 text-sm text-[#10281e] outline-none transition focus:border-[#caa34b] focus:ring-2 focus:ring-[#caa34b]/20"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[var(--primary-color,#10281e)] py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#1a3d2e] disabled:opacity-60"
          >
            {submitting ? (
              <span>Creating account...</span>
            ) : (
              <>
                <UserPlus className="h-4 w-4" />
                <span>Create Account</span>
              </>
            )}
          </button>
        </form>

        <div className="border-t border-[#eee8da] pt-6 text-center text-xs text-[#59645a]">
          Already have an account?{' '}
          <Link
            to="/login"
            state={{ from: location.state?.from }}
            className="font-bold text-[#caa34b] hover:underline"
          >
            Sign in here <ArrowRight className="inline h-3 w-3" />
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
