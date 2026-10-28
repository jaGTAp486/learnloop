import { useState } from 'react';
import {
  Mail, Lock, User as UserIcon, Eye, EyeOff, ArrowRight, ArrowLeft,
  AlertCircle, Loader2, CheckCircle2, Sparkles,
} from 'lucide-react';
import { LearnLoopMark } from '@/components/Logo';
import { StudyMascot } from '@/components/StudyMascot';

type AuthMode = 'login' | 'signup' | 'forgot';

type AuthPageProps = {
  mode: AuthMode;
  onModeChange: (mode: AuthMode) => void;
  onSignIn: (email: string, password: string) => Promise<void>;
  onSignUp: (fullName: string, email: string, password: string) => Promise<void>;
  onResetPassword: (email: string) => Promise<void>;
};

export default function AuthPage({ mode, onModeChange, onSignIn, onSignUp, onResetPassword }: AuthPageProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [info, setInfo] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');

    if (mode === 'signup') {
      if (!fullName.trim()) return setError('Please enter your full name.');
      if (fullName.trim().length < 2) return setError('Name must be at least 2 characters.');
      if (!validateEmail(email)) return setError('Please enter a valid email address.');
      if (password.length < 6) return setError('Password must be at least 6 characters.');
      if (password !== confirmPassword) return setError('Passwords do not match.');
    }

    if (mode === 'login') {
      if (!validateEmail(email)) return setError('Please enter a valid email address.');
      if (!password) return setError('Please enter your password.');
    }

    if (mode === 'forgot') {
      if (!validateEmail(email)) return setError('Please enter a valid email address.');
    }

    setLoading(true);
    try {
      if (mode === 'login') {
        await onSignIn(email, password);
      } else if (mode === 'signup') {
        await onSignUp(fullName.trim(), email, password);
      } else if (mode === 'forgot') {
        await onResetPassword(email);
        setInfo('If an account exists for that email, a password reset link has been sent. Check your inbox.');
        setEmail('');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
      setError(friendlyError(msg));
    } finally {
      setLoading(false);
    }
  };

  const titles: Record<AuthMode, { title: string; subtitle: string }> = {
    login: { title: 'Welcome back', subtitle: 'Sign in to continue your learning loop.' },
    signup: { title: 'Create your account', subtitle: 'Join LearnLoop and start mastering every subject.' },
    forgot: { title: 'Reset your password', subtitle: 'Enter your email and we\'ll send you a reset link.' },
  };

  return (
    <div className="min-h-screen cozy-room-bg flex items-center justify-center px-4 py-8">
      {/* Background glow — cozy lamp light */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-lavender-300/6 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-lamp-200/6 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-neon-300/4 rounded-full blur-[100px]" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo + Mascot */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-navy-800 border border-lavender-300/15 shadow-cozy flex items-center justify-center mb-3">
            <LearnLoopMark size={56} />
          </div>
          <h1 className="font-display font-bold text-xl text-white">LearnLoop</h1>
          <p className="text-xs text-lavender-300/60 mt-0.5">Your cozy study space</p>
          <div className="mt-3 animate-float">
            <StudyMascot mood="welcome" size={72} />
          </div>
        </div>

        {/* Card */}
        <div className="card p-6 sm:p-8">
          <div className="mb-6">
            <h2 className="font-display text-2xl font-bold text-navy-50">{titles[mode].title}</h2>
            <p className="text-sm text-navy-200 mt-1">{titles[mode].subtitle}</p>
          </div>

          {error && (
            <div className="flex items-start gap-2 rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-sm text-red-300 mb-4 animate-fade-in">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {info && (
            <div className="flex items-start gap-2 rounded-xl bg-teal-400/10 border border-teal-400/30 px-4 py-3 text-sm text-teal-300 mb-4 animate-fade-in">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{info}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="label-text" htmlFor="fullName">Full Name</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-300" />
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Jane Doe"
                    className="input-field pl-10"
                    autoComplete="name"
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            <div>
              <label className="label-text" htmlFor="email">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-300" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input-field pl-10"
                  autoComplete="email"
                  disabled={loading}
                />
              </div>
            </div>

            {mode !== 'forgot' && (
              <div>
                <label className="label-text" htmlFor="password">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-300" />
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input-field pl-10 pr-10"
                    autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-300 hover:text-navy-100 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {mode === 'signup' && (
              <div>
                <label className="label-text" htmlFor="confirmPassword">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-300" />
                  <input
                    id="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input-field pl-10 pr-10"
                    autoComplete="new-password"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-navy-300 hover:text-navy-100 transition-colors"
                    aria-label={showConfirm ? 'Hide password' : 'Show password'}
                    tabIndex={-1}
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}

            {mode === 'login' && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => { onModeChange('forgot'); setError(''); setInfo(''); }}
                  className="text-xs text-neon-300 hover:text-neon-200 transition-colors"
                >
                  Forgot password?
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-base py-3"
            >
              {loading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Please wait...</>
              ) : (
                <>
                  {mode === 'login' && <>Sign In <ArrowRight className="w-4 h-4" /></>}
                  {mode === 'signup' && <>Create Account <ArrowRight className="w-4 h-4" /></>}
                  {mode === 'forgot' && <>Send Reset Link <ArrowRight className="w-4 h-4" /></>}
                </>
              )}
            </button>
          </form>

          {/* Mode switching */}
          {mode !== 'forgot' && (
            <div className="mt-5 text-center text-sm text-navy-300">
              {mode === 'login' ? (
                <>Don't have an account?{' '}
                  <button onClick={() => { onModeChange('signup'); setError(''); setInfo(''); }}
                    className="text-neon-300 hover:text-neon-200 font-semibold transition-colors">
                    Sign up free
                  </button>
                </>
              ) : (
                <>Already have an account?{' '}
                  <button onClick={() => { onModeChange('login'); setError(''); setInfo(''); }}
                    className="text-neon-300 hover:text-neon-200 font-semibold transition-colors">
                    Sign in
                  </button>
                </>
              )}
            </div>
          )}

          {mode === 'forgot' && (
            <div className="mt-5 text-center">
              <button
                onClick={() => { onModeChange('login'); setError(''); setInfo(''); }}
                className="inline-flex items-center gap-1 text-sm text-navy-300 hover:text-navy-100 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back to sign in
              </button>
            </div>
          )}
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-navy-400 mt-6 flex items-center justify-center gap-1.5">
          <Sparkles className="w-3 h-3 text-lavender-300/60" />
          Secured by Supabase Auth. Your data stays private.
        </p>
      </div>
    </div>
  );
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function friendlyError(msg: string): string {
  const lower = msg.toLowerCase();
  if (lower.includes('invalid login credentials')) return 'Invalid email or password. Please try again.';
  if (lower.includes('user already registered') || lower.includes('already been registered')) return 'An account with this email already exists. Try signing in instead.';
  if (lower.includes('password should be at least')) return 'Password must be at least 6 characters.';
  if (lower.includes('rate limit') || lower.includes('too many')) return 'Too many attempts. Please wait a moment and try again.';
  if (lower.includes('network') || lower.includes('fetch')) return 'Network error. Check your connection and try again.';
  return msg;
}
