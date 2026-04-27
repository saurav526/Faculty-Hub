import { useState, useEffect, useRef } from 'react';
import { X, Search, Eye, EyeOff, ChevronLeft, UserCheck, Mail, Lock, User, MapPin } from 'lucide-react';
import { MITSeal } from './MITLogo';
import { FACULTY_DATA } from '../data/faculty';
import { BLOCK_TO_FLOOR } from '../utils/floorUtils';
import type { FacultyRecord, FacultyTitle, BlockCode, FloorKey } from '../types';
import type { RegisterPayload } from '../api/client';

const TITLES: FacultyTitle[] = ['Dr.', 'Prof.', 'Mr.', 'Mrs.', 'Ms.', 'Miss.'];

const ALL_BLOCKS: BlockCode[] = [
  'S-001','N-003','S-211',
  'S-309',
  'S-402','S-411','S-415','N-409','N-410',
  'S-502','S-504','S-511','S-513','N-502','N-504',
  'S-602','S-616','LAB-S608',
  'J-901','S-901',
];

type Mode = 'signin' | 'signup';
type SignupStep = 'find' | 'credentials' | 'profile';

interface Props {
  linkedFacultyIds: Set<number>;
  onLogin: (email: string, pin: string) => Promise<string | null>;
  onRegister: (data: RegisterPayload) => Promise<string | null>;
  onClose: () => void;
}

const EMPTY_FORM = {
  email: '',
  pin: '',
  confirmPin: '',
  title: 'Dr.' as FacultyTitle,
  name: '',
  block: 'S-309' as BlockCode,
  floor: '3rd' as FloorKey,
  cabinPosition: '',
  phone: '',
};

export function AuthModal({ linkedFacultyIds, onLogin, onRegister, onClose }: Props) {
  const [mode, setMode] = useState<Mode>('signin');
  const [step, setStep] = useState<SignupStep>('find');
  const [search, setSearch] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<FacultyRecord | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof typeof EMPTY_FORM | 'general', string>>>({});
  const [showPin, setShowPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPin, setSignInPin] = useState('');
  const [signInError, setSignInError] = useState('');
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    setTimeout(() => emailRef.current?.focus(), 50);
  }, [mode]);

  const filtered = FACULTY_DATA.filter(f =>
    f.fullName.toLowerCase().includes(search.toLowerCase()) ||
    f.block.toLowerCase().includes(search.toLowerCase())
  );

  // ── Sign In ────────────────────────────────────────────────────────────────
  const handleSignIn = async () => {
    setSignInError('');
    const email = signInEmail.trim().toLowerCase();
    if (!email) { setSignInError('Please enter your email address.'); return; }
    if (signInPin.length < 4) { setSignInError('Please enter your 4-digit PIN.'); return; }

    setLoading(true);
    const err = await onLogin(email, signInPin);
    setLoading(false);

    if (err) {
      setSignInError(err);
      setSignInPin('');
    } else {
      setSuccess(true);
      setTimeout(() => onClose(), 900);
    }
  };

  // ── Sign Up: Step 1 — select record ───────────────────────────────────────
  const handleSelectRecord = (f: FacultyRecord) => {
    setSelectedRecord(f);
    setForm(prev => ({
      ...prev,
      title: f.title,
      name: f.name,
      block: f.block,
      floor: f.floor,
      cabinPosition: f.cabinPosition,
    }));
    setStep('credentials');
  };

  const handleSkipRecord = () => {
    setSelectedRecord(null);
    setStep('credentials');
  };

  // ── Sign Up: Step 2 — credentials ─────────────────────────────────────────
  const handleCredentialsNext = () => {
    const errs: typeof errors = {};
    const email = form.email.trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Enter a valid email address.';
    if (form.pin.length !== 4) errs.pin = 'PIN must be exactly 4 digits.';
    if (form.confirmPin !== form.pin) errs.confirmPin = 'PINs do not match.';
    setErrors(errs);
    if (Object.keys(errs).length === 0) setStep('profile');
  };

  // ── Sign Up: Step 3 — create account ──────────────────────────────────────
  const handleCreateAccount = async () => {
    const errs: typeof errors = {};
    if (!form.name.trim()) errs.name = 'Name is required.';
    if (!form.cabinPosition.trim()) errs.cabinPosition = 'Cabin / seat is required.';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const payload: RegisterPayload = {
      email: form.email.trim().toLowerCase(),
      pin: form.pin,
      title: form.title,
      name: form.name.trim(),
      fullName: `${form.title} ${form.name.trim()}`,
      block: form.block,
      floor: form.floor,
      cabinPosition: form.cabinPosition.trim(),
      phone: form.phone.trim() || undefined,
      linkedFacultyId: selectedRecord?.id,
    };

    setLoading(true);
    const err = await onRegister(payload);
    setLoading(false);

    if (err) {
      setErrors({ general: err });
    } else {
      setSuccess(true);
      setTimeout(() => onClose(), 1000);
    }
  };

  const setField = (key: keyof typeof EMPTY_FORM, value: string) => {
    setForm(prev => {
      const next = { ...prev, [key]: value };
      if (key === 'block') next.floor = BLOCK_TO_FLOOR[value as BlockCode] ?? prev.floor;
      return next;
    });
    setErrors(prev => ({ ...prev, [key]: undefined }));
  };

  const goBack = () => {
    if (step === 'credentials') setStep('find');
    else if (step === 'profile') setStep('credentials');
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    setStep('find');
    setSearch('');
    setSelectedRecord(null);
    setForm(EMPTY_FORM);
    setErrors({});
    setSignInError('');
    setSignInPin('');
    setSuccess(false);
  };

  const isSignup = mode === 'signup';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(15,23,42,0.7)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[92vh]">

        {/* ── Top bar ── */}
        <div className="bg-slate-900 px-5 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            {isSignup && step !== 'find' && (
              <button onClick={goBack} className="text-slate-400 hover:text-white">
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            <MITSeal size={32} />
            <div>
              <p className="text-white font-bold text-sm leading-tight">Faculty Hub</p>
              <p className="text-slate-400 text-xs leading-tight">MIT School of Computing</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Mode tabs ── */}
        {!success && (
          <div className="flex border-b border-slate-100 flex-shrink-0">
            {(['signin', 'signup'] as Mode[]).map(m => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={`flex-1 py-3 text-sm font-semibold transition-colors ${
                  mode === m
                    ? 'text-indigo-600 border-b-2 border-indigo-600'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {m === 'signin' ? 'Sign In' : 'Create Account'}
              </button>
            ))}
          </div>
        )}

        {/* ── Success screen ── */}
        {success && (
          <div className="flex flex-col items-center justify-center py-14 px-6 gap-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <UserCheck className="w-8 h-8 text-green-600" />
            </div>
            <div className="text-center">
              <p className="font-bold text-slate-800 text-xl">
                {isSignup ? 'Account Created!' : 'Welcome back!'}
              </p>
              <p className="text-sm text-slate-500 mt-1">
                {isSignup
                  ? `Hello, ${form.title} ${form.name.trim()}`
                  : `Signed in as ${signInEmail}`}
              </p>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════
            SIGN IN VIEW
        ══════════════════════════════════════════════ */}
        {!success && mode === 'signin' && (
          <div className="px-6 py-6 space-y-5 overflow-y-auto">
            <div>
              <h2 className="text-xl font-bold text-slate-800">Welcome back</h2>
              <p className="text-sm text-slate-500 mt-0.5">Sign in to your Faculty Hub account</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  ref={emailRef}
                  type="email"
                  value={signInEmail}
                  onChange={e => { setSignInEmail(e.target.value); setSignInError(''); }}
                  onKeyDown={e => { if (e.key === 'Enter') handleSignIn(); }}
                  placeholder="your.email@mituniversity.edu.in"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                4-Digit PIN
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPin ? 'text' : 'password'}
                  inputMode="numeric"
                  maxLength={4}
                  value={signInPin}
                  onChange={e => { setSignInPin(e.target.value.replace(/\D/g, '').slice(0, 4)); setSignInError(''); }}
                  onKeyDown={e => { if (e.key === 'Enter') handleSignIn(); }}
                  placeholder="• • • •"
                  className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 tracking-widest"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {signInError && (
              <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{signInError}</p>
            )}

            <button
              onClick={handleSignIn}
              disabled={loading}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white rounded-xl font-semibold text-sm transition-colors"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>

            <p className="text-center text-xs text-slate-500">
              Don't have an account?{' '}
              <button
                onClick={() => switchMode('signup')}
                className="text-indigo-600 hover:text-indigo-800 font-semibold"
              >
                Create one →
              </button>
            </p>
          </div>
        )}

        {/* ══════════════════════════════════════════════
            SIGN UP — STEP 1: Find yourself
        ══════════════════════════════════════════════ */}
        {!success && mode === 'signup' && step === 'find' && (
          <div className="flex flex-col overflow-hidden">
            <div className="px-6 pt-5 pb-3 flex-shrink-0">
              <div className="flex items-center gap-2 mb-1">
                <StepDots current={0} />
              </div>
              <h2 className="text-lg font-bold text-slate-800">Step 1 — Find yourself</h2>
              <p className="text-sm text-slate-500 mt-0.5">Search your name in the seating directory to pre-fill your details.</p>
            </div>

            <div className="px-6 pb-2 flex-shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search name or block…"
                  className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  autoFocus
                />
              </div>
            </div>

            <div className="overflow-y-auto flex-1 px-4 pb-2 space-y-0.5" style={{ minHeight: 220, maxHeight: 280 }}>
              {filtered.length === 0 ? (
                <p className="text-center text-sm text-slate-400 py-8">No results found</p>
              ) : (
                filtered.map(f => {
                  const alreadyLinked = linkedFacultyIds.has(f.id);
                  return (
                    <button
                      key={f.id}
                      onClick={() => !alreadyLinked && handleSelectRecord(f)}
                      disabled={alreadyLinked}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl border text-left transition-colors ${
                        alreadyLinked
                          ? 'border-transparent opacity-40 cursor-not-allowed'
                          : 'border-transparent hover:bg-indigo-50 hover:border-indigo-200'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                        f.title === 'Dr.' ? 'bg-indigo-100 text-indigo-700' : 'bg-violet-100 text-violet-700'
                      }`}>
                        {f.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-slate-700 truncate">{f.fullName}</p>
                        <p className="text-xs text-slate-400">{f.block} · {f.floor} Floor · {f.cabinPosition}</p>
                      </div>
                      {alreadyLinked ? (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex-shrink-0">Taken</span>
                      ) : (
                        <span className="text-xs text-indigo-500 font-medium flex-shrink-0">Select →</span>
                      )}
                    </button>
                  );
                })
              )}
            </div>

            <div className="px-6 py-4 border-t border-slate-100 flex-shrink-0">
              <button
                onClick={handleSkipRecord}
                className="w-full py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                Not in the list — enter details manually →
              </button>
              <p className="text-center text-xs text-slate-400 mt-2">
                Already have an account?{' '}
                <button onClick={() => switchMode('signin')} className="text-indigo-600 font-semibold">Sign in</button>
              </p>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════
            SIGN UP — STEP 2: Account credentials
        ══════════════════════════════════════════════ */}
        {!success && mode === 'signup' && step === 'credentials' && (
          <div className="px-6 py-5 space-y-4 overflow-y-auto">
            <div>
              <StepDots current={1} />
              <h2 className="text-lg font-bold text-slate-800 mt-1">Step 2 — Account details</h2>
              {selectedRecord ? (
                <p className="text-sm text-slate-500 mt-0.5">
                  Setting up account for <span className="font-medium text-slate-700">{selectedRecord.fullName}</span>
                </p>
              ) : (
                <p className="text-sm text-slate-500 mt-0.5">Enter your login credentials.</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Email Address <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  ref={emailRef}
                  type="email"
                  value={form.email}
                  onChange={e => setField('email', e.target.value)}
                  placeholder="your.email@mituniversity.edu.in"
                  className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 ${errors.email ? 'border-red-400' : 'border-slate-200'}`}
                />
              </div>
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Create a 4-Digit PIN <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPin ? 'text' : 'password'}
                  inputMode="numeric"
                  maxLength={4}
                  value={form.pin}
                  onChange={e => setField('pin', e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="• • • •"
                  className={`w-full pl-9 pr-9 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 tracking-widest ${errors.pin ? 'border-red-400' : 'border-slate-200'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPin(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.pin && <p className="text-xs text-red-500 mt-1">{errors.pin}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Confirm PIN <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type={showPin ? 'text' : 'password'}
                  inputMode="numeric"
                  maxLength={4}
                  value={form.confirmPin}
                  onChange={e => setField('confirmPin', e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="• • • •"
                  className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 tracking-widest ${errors.confirmPin ? 'border-red-400' : 'border-slate-200'}`}
                />
              </div>
              {errors.confirmPin && <p className="text-xs text-red-500 mt-1">{errors.confirmPin}</p>}
            </div>

            <button
              onClick={handleCredentialsNext}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm transition-colors"
            >
              Continue →
            </button>
          </div>
        )}

        {/* ══════════════════════════════════════════════
            SIGN UP — STEP 3: Profile details
        ══════════════════════════════════════════════ */}
        {!success && mode === 'signup' && step === 'profile' && (
          <div className="px-6 py-5 space-y-4 overflow-y-auto">
            <div>
              <StepDots current={2} />
              <h2 className="text-lg font-bold text-slate-800 mt-1">Step 3 — Your profile</h2>
              <p className="text-sm text-slate-500 mt-0.5">Review and complete your details. You can edit these later.</p>
            </div>

            <div className="flex gap-2">
              <div className="w-28 flex-shrink-0">
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Title</label>
                <div className="relative">
                  <User className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={form.title}
                    onChange={e => setField('title', e.target.value)}
                    className="w-full pl-7 pr-2 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white appearance-none"
                  >
                    {TITLES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setField('name', e.target.value)}
                  placeholder="First and Last name"
                  className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 ${errors.name ? 'border-red-400' : 'border-slate-200'}`}
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>
            </div>

            <div className="flex gap-2">
              <div className="flex-1 min-w-0">
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Block</label>
                <div className="relative">
                  <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={form.block}
                    onChange={e => setField('block', e.target.value)}
                    className="w-full pl-7 pr-2 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white appearance-none"
                  >
                    {ALL_BLOCKS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
              </div>
              <div className="w-28 flex-shrink-0">
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Floor</label>
                <input
                  type="text"
                  value={`${form.floor} Floor`}
                  readOnly
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-100 text-sm bg-slate-50 text-slate-500 cursor-default"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Cabin / Seat Position <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={form.cabinPosition}
                onChange={e => setField('cabinPosition', e.target.value)}
                placeholder="e.g. Cabin 1, Cubicle 3, A (Right First)…"
                className={`w-full px-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 ${errors.cabinPosition ? 'border-red-400' : 'border-slate-200'}`}
              />
              {errors.cabinPosition && <p className="text-xs text-red-500 mt-1">{errors.cabinPosition}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Phone (optional)</label>
              <input
                type="tel"
                value={form.phone}
                onChange={e => setField('phone', e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>

            {errors.general && (
              <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{errors.general}</p>
            )}

            <button
              onClick={handleCreateAccount}
              disabled={loading}
              className="w-full py-2.5 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
            >
              <UserCheck className="w-4 h-4" />
              {loading ? 'Creating account…' : 'Create Account & Sign In'}
            </button>

            <p className="text-center text-xs text-slate-400">
              By creating an account you confirm the details above are correct.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Small helpers ────────────────────────────────────────────────────────────

function StepDots({ current }: { current: number }) {
  return (
    <div className="flex items-center gap-1.5">
      {[0, 1, 2].map(i => (
        <div
          key={i}
          className={`rounded-full transition-all ${
            i === current ? 'w-5 h-2 bg-indigo-600' : i < current ? 'w-2 h-2 bg-indigo-300' : 'w-2 h-2 bg-slate-200'
          }`}
        />
      ))}
      <span className="text-xs text-slate-400 ml-1">Step {current + 1} of 3</span>
    </div>
  );
}
