import { useState, useRef, useEffect } from 'react';
import { X, Camera, Mail, Phone, MapPin, User, Lock, Eye, EyeOff, Trash2, Save, LogOut, CheckCircle } from 'lucide-react';
import { BLOCK_TO_FLOOR } from '../utils/floorUtils';
import type { FacultyAccount, FacultyTitle, BlockCode } from '../types';

const TITLES: FacultyTitle[] = ['Dr.', 'Prof.', 'Mr.', 'Mrs.', 'Ms.', 'Miss.'];

const ALL_BLOCKS: BlockCode[] = [
  'S-001','N-003','S-211',
  'S-309',
  'S-402','S-411','S-415','N-409','N-410',
  'S-502','S-504','S-511','S-513','N-502','N-504',
  'S-602','S-616','LAB-S608',
  'J-901','S-901',
];

interface Props {
  account: FacultyAccount;
  onSave: (updates: Partial<Omit<FacultyAccount, 'email' | 'createdAt'>>) => Promise<void>;
  onChangePin: (currentPin: string, newPin: string) => Promise<string | null>;
  onLogout: () => void;
  onDeleteAccount: () => void;
  onClose: () => void;
}

type Section = 'profile' | 'security';

export function AccountModal({ account, onSave, onChangePin, onLogout, onDeleteAccount, onClose }: Props) {
  const [section, setSection] = useState<Section>('profile');
  const [saved, setSaved] = useState(false);

  // Profile fields
  const [photo, setPhoto] = useState(account.photoDataUrl ?? '');
  const [title, setTitle] = useState(account.title);
  const [name, setName] = useState(account.name);
  const [block, setBlock] = useState(account.block);
  const [floor, setFloor] = useState(account.floor);
  const [cabin, setCabin] = useState(account.cabinPosition);
  const [phone, setPhone] = useState(account.phone ?? '');
  const [profileErrors, setProfileErrors] = useState<Partial<Record<string, string>>>({});

  // PIN change fields
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [pinErrors, setPinErrors] = useState<Partial<Record<string, string>>>({});
  const [pinSaved, setPinSaved] = useState(false);

  // Delete confirm
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);

  // Escape key
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) { alert('Image must be under 3 MB.'); return; }
    const reader = new FileReader();
    reader.onload = ev => setPhoto(ev.target?.result as string ?? '');
    reader.readAsDataURL(file);
  };

  const handleBlockChange = (b: BlockCode) => {
    setBlock(b);
    setFloor(BLOCK_TO_FLOOR[b] ?? floor);
  };

  const handleSaveProfile = async () => {
    const errs: typeof profileErrors = {};
    if (!name.trim()) errs.name = 'Name is required.';
    if (!cabin.trim()) errs.cabin = 'Cabin / seat is required.';
    setProfileErrors(errs);
    if (Object.keys(errs).length > 0) return;

    await onSave({
      title,
      name: name.trim(),
      fullName: `${title} ${name.trim()}`,
      block,
      floor,
      cabinPosition: cabin.trim(),
      phone: phone.trim() || undefined,
      photoDataUrl: photo || undefined,
    });

    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleSavePin = async () => {
    const errs: typeof pinErrors = {};
    if (newPin.length !== 4) errs.newPin = 'New PIN must be exactly 4 digits.';
    if (confirmPin !== newPin) errs.confirmPin = 'PINs do not match.';
    setPinErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const err = await onChangePin(currentPin, newPin);
    if (err) {
      setPinErrors({ currentPin: err });
      return;
    }
    setCurrentPin(''); setNewPin(''); setConfirmPin('');
    setPinSaved(true);
    setTimeout(() => setPinSaved(false), 2500);
  };

  const initials = name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase() || '?';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(15,23,42,0.7)' }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[92vh] overflow-hidden">

        {/* ── Header ── */}
        <div className="bg-slate-900 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <p className="font-bold text-white">My Account</p>
            <p className="text-xs text-slate-400">{account.email}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { onLogout(); onClose(); }}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
            <button onClick={onClose} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Section tabs ── */}
        <div className="flex border-b border-slate-100 flex-shrink-0">
          {(['profile', 'security'] as Section[]).map(s => (
            <button
              key={s}
              onClick={() => setSection(s)}
              className={`flex-1 py-3 text-sm font-semibold capitalize transition-colors ${
                section === s
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {s === 'profile' ? '👤 Profile' : '🔒 Security'}
            </button>
          ))}
        </div>

        {/* ═══════════════════════════════════════
            PROFILE SECTION
        ═══════════════════════════════════════ */}
        {section === 'profile' && (
          <div className="overflow-y-auto flex-1">
            <div className="px-6 py-5 space-y-5">

              {/* Photo */}
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  {photo ? (
                    <img
                      src={photo}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover border-4 border-indigo-100 shadow-md"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-indigo-100 flex items-center justify-center text-3xl font-bold text-indigo-700 border-4 border-indigo-100 shadow-md">
                      {initials}
                    </div>
                  )}
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="absolute bottom-0 right-0 w-8 h-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center shadow-md transition-colors"
                  >
                    <Camera className="w-4 h-4" />
                  </button>
                </div>
                <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handlePhotoChange} />
                <div className="flex items-center gap-3">
                  <button onClick={() => fileRef.current?.click()} className="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                    {photo ? 'Change photo' : 'Upload photo'}
                  </button>
                  {photo && (
                    <button onClick={() => setPhoto('')} className="text-xs text-red-400 hover:text-red-600">
                      Remove
                    </button>
                  )}
                </div>
                <p className="text-xs text-slate-400">JPG, PNG or WEBP · Max 3 MB</p>
              </div>

              {/* ── Personal info ── */}
              <fieldset className="space-y-3">
                <legend className="text-xs font-bold text-slate-500 uppercase tracking-widest pb-1 border-b border-slate-100 w-full">Personal Info</legend>

                <div className="flex gap-2">
                  {/* Title */}
                  <div className="w-28 flex-shrink-0">
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Title</label>
                    <div className="relative">
                      <User className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                      <select
                        value={title}
                        onChange={e => setTitle(e.target.value as FacultyTitle)}
                        className="w-full pl-7 pr-2 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white appearance-none"
                      >
                        {TITLES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>
                  {/* Name */}
                  <div className="flex-1 min-w-0">
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Full Name <span className="text-red-400">*</span></label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => { setName(e.target.value); setProfileErrors(p => ({ ...p, name: undefined })); }}
                      placeholder="First and Last name"
                      className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 ${profileErrors.name ? 'border-red-400' : 'border-slate-200'}`}
                    />
                    {profileErrors.name && <p className="text-xs text-red-500 mt-0.5">{profileErrors.name}</p>}
                  </div>
                </div>

                {/* Email (read-only) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Email (login — cannot change)</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input type="email" value={account.email} readOnly className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-100 text-sm bg-slate-50 text-slate-400 cursor-default" />
                  </div>
                </div>
              </fieldset>

              {/* ── Location ── */}
              <fieldset className="space-y-3">
                <legend className="text-xs font-bold text-slate-500 uppercase tracking-widest pb-1 border-b border-slate-100 w-full">Location</legend>

                <div className="flex gap-2">
                  <div className="flex-1 min-w-0">
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Block</label>
                    <div className="relative">
                      <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                      <select
                        value={block}
                        onChange={e => handleBlockChange(e.target.value as BlockCode)}
                        className="w-full pl-7 pr-2 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 bg-white appearance-none"
                      >
                        {ALL_BLOCKS.map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="w-28 flex-shrink-0">
                    <label className="block text-xs font-semibold text-slate-500 mb-1">Floor</label>
                    <input
                      type="text"
                      value={`${floor} Floor`}
                      readOnly
                      className="w-full px-3 py-2 rounded-lg border border-slate-100 text-sm bg-slate-50 text-slate-400 cursor-default"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Cabin / Seat <span className="text-red-400">*</span></label>
                  <input
                    type="text"
                    value={cabin}
                    onChange={e => { setCabin(e.target.value); setProfileErrors(p => ({ ...p, cabin: undefined })); }}
                    placeholder="e.g. Cabin 1, Cubicle 3…"
                    className={`w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 ${profileErrors.cabin ? 'border-red-400' : 'border-slate-200'}`}
                  />
                  {profileErrors.cabin && <p className="text-xs text-red-500 mt-0.5">{profileErrors.cabin}</p>}
                </div>
              </fieldset>

              {/* ── Contact ── */}
              <fieldset className="space-y-3">
                <legend className="text-xs font-bold text-slate-500 uppercase tracking-widest pb-1 border-b border-slate-100 w-full">Contact</legend>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Phone (optional)</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    />
                  </div>
                </div>
              </fieldset>

              {/* Save button */}
              <div className="pt-1">
                <button
                  onClick={handleSaveProfile}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                >
                  {saved ? (
                    <><CheckCircle className="w-4 h-4" /> Changes Saved!</>
                  ) : (
                    <><Save className="w-4 h-4" /> Save Changes</>
                  )}
                </button>
              </div>

              {/* ── Danger zone ── */}
              <div className="border border-red-200 rounded-xl p-4 space-y-3 bg-red-50">
                <p className="text-xs font-bold text-red-600 uppercase tracking-wider">Danger Zone</p>
                {!showDeleteConfirm ? (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center gap-2 text-sm text-red-600 hover:text-red-800 font-medium"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete my account
                  </button>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-red-700 font-medium">Are you sure? This cannot be undone.</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => { onDeleteAccount(); onLogout(); onClose(); }}
                        className="flex-1 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors"
                      >
                        Yes, delete
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="flex-1 py-1.5 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════
            SECURITY SECTION
        ═══════════════════════════════════════ */}
        {section === 'security' && (
          <div className="overflow-y-auto flex-1">
            <div className="px-6 py-5 space-y-5">
              <div>
                <h3 className="font-bold text-slate-800">Change PIN</h3>
                <p className="text-sm text-slate-500 mt-0.5">Your 4-digit PIN is used to sign in.</p>
              </div>

              {/* Current PIN */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Current PIN</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPin ? 'text' : 'password'}
                    inputMode="numeric"
                    maxLength={4}
                    value={currentPin}
                    onChange={e => { setCurrentPin(e.target.value.replace(/\D/g, '').slice(0, 4)); setPinErrors(p => ({ ...p, currentPin: undefined })); }}
                    placeholder="• • • •"
                    className={`w-full pl-9 pr-9 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 tracking-widest ${pinErrors.currentPin ? 'border-red-400' : 'border-slate-200'}`}
                  />
                  <button type="button" onClick={() => setShowPin(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {pinErrors.currentPin && <p className="text-xs text-red-500 mt-1">{pinErrors.currentPin}</p>}
              </div>

              {/* New PIN */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">New PIN</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPin ? 'text' : 'password'}
                    inputMode="numeric"
                    maxLength={4}
                    value={newPin}
                    onChange={e => { setNewPin(e.target.value.replace(/\D/g, '').slice(0, 4)); setPinErrors(p => ({ ...p, newPin: undefined })); }}
                    placeholder="• • • •"
                    className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 tracking-widest ${pinErrors.newPin ? 'border-red-400' : 'border-slate-200'}`}
                  />
                </div>
                {pinErrors.newPin && <p className="text-xs text-red-500 mt-1">{pinErrors.newPin}</p>}
              </div>

              {/* Confirm PIN */}
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">Confirm New PIN</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type={showPin ? 'text' : 'password'}
                    inputMode="numeric"
                    maxLength={4}
                    value={confirmPin}
                    onChange={e => { setConfirmPin(e.target.value.replace(/\D/g, '').slice(0, 4)); setPinErrors(p => ({ ...p, confirmPin: undefined })); }}
                    placeholder="• • • •"
                    className={`w-full pl-9 pr-3 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400 tracking-widest ${pinErrors.confirmPin ? 'border-red-400' : 'border-slate-200'}`}
                  />
                </div>
                {pinErrors.confirmPin && <p className="text-xs text-red-500 mt-1">{pinErrors.confirmPin}</p>}
              </div>

              <button
                onClick={handleSavePin}
                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm transition-colors flex items-center justify-center gap-2"
              >
                {pinSaved ? (
                  <><CheckCircle className="w-4 h-4" /> PIN Updated!</>
                ) : (
                  <><Save className="w-4 h-4" /> Save New PIN</>
                )}
              </button>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                <p className="text-xs text-amber-700">
                  <strong>Tip:</strong> Choose a PIN you can remember — there is no PIN recovery option in this app.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
