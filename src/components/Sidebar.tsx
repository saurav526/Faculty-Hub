import { LayoutDashboard, Users, Map, LogIn, LogOut, UserCircle } from 'lucide-react';
import { MITLogo, MITSeal } from './MITLogo';
import type { FacultyAccount } from '../types';

export type View = 'dashboard' | 'grid' | 'floor';

interface Props {
  activeView: View;
  onViewChange: (v: View) => void;
  loggedInAccount?: FacultyAccount | null;
  onLoginClick: () => void;
  onAccountClick: () => void;
  onLogout: () => void;
}

interface MobileNavProps {
  activeView: View;
  onViewChange: (v: View) => void;
  isLoggedIn: boolean;
  onLoginClick: () => void;
}

const NAV_ITEMS: { view: View; label: string; icon: React.ReactNode }[] = [
  { view: 'dashboard', label: 'Dashboard',         icon: <LayoutDashboard className="w-5 h-5" /> },
  { view: 'grid',      label: 'Faculty Directory', icon: <Users className="w-5 h-5" /> },
  { view: 'floor',     label: 'Floor Map',         icon: <Map className="w-5 h-5" /> },
];

export function Sidebar({ activeView, onViewChange, loggedInAccount, onLoginClick, onAccountClick, onLogout }: Props) {
  const initials = loggedInAccount
    ? loggedInAccount.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
    : '';

  return (
    <aside className="hidden md:flex flex-col w-64 min-h-screen bg-slate-900 flex-shrink-0">

      {/* ── MIT-ADT Logo ── */}
      <div className="px-4 py-5 border-b border-slate-800 flex flex-col items-center gap-3">
        <MITLogo />
        <div className="flex items-center gap-2">
          <MITSeal size={28} />
          <div>
            <p className="font-bold text-white text-xs leading-tight">Faculty Hub</p>
            <p className="text-xs text-slate-400 leading-tight">MIT School of Computing</p>
          </div>
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(item => {
          const isActive = activeView === item.view;
          return (
            <button
              key={item.view}
              onClick={() => onViewChange(item.view)}
              className={`nav-item w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* ── Footer / Auth ── */}
      <div className="px-4 py-4 border-t border-slate-800 space-y-2">
        {loggedInAccount ? (
          <>
            {/* Account chip */}
            <button
              onClick={onAccountClick}
              className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-slate-800 transition-colors group"
            >
              {loggedInAccount.photoDataUrl ? (
                <img
                  src={loggedInAccount.photoDataUrl}
                  alt={loggedInAccount.name}
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0 border-2 border-indigo-500"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                  {initials}
                </div>
              )}
              <div className="min-w-0 text-left">
                <p className="text-xs font-semibold text-white truncate group-hover:text-indigo-300 transition-colors">
                  {loggedInAccount.fullName}
                </p>
                <p className="text-xs text-slate-400 truncate">{loggedInAccount.email}</p>
              </div>
              <UserCircle className="w-4 h-4 text-slate-500 flex-shrink-0" />
            </button>

            {/* Sign out */}
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </>
        ) : (
          <button
            onClick={onLoginClick}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
          >
            <LogIn className="w-4 h-4" />
            Faculty Login
          </button>
        )}
        <p className="text-xs text-slate-600 text-center pt-1">Seating Arrangement 2026</p>
      </div>
    </aside>
  );
}

/** Bottom navigation bar for mobile */
export function MobileNav({ activeView, onViewChange, isLoggedIn, onLoginClick }: MobileNavProps) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-slate-200 px-2 py-2 flex">
      {NAV_ITEMS.map(item => {
        const isActive = activeView === item.view;
        return (
          <button
            key={item.view}
            onClick={() => onViewChange(item.view)}
            className={`flex-1 flex flex-col items-center gap-1 py-1 rounded-xl transition-colors text-xs font-medium ${
              isActive ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <span className={`p-1.5 rounded-lg transition-colors ${isActive ? 'bg-indigo-100' : ''}`}>
              {item.icon}
            </span>
            <span>{item.label}</span>
          </button>
        );
      })}

      <button
        onClick={onLoginClick}
        className={`flex-1 flex flex-col items-center gap-1 py-1 rounded-xl transition-colors text-xs font-medium ${
          isLoggedIn ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
        }`}
      >
        <span className={`p-1.5 rounded-lg transition-colors ${isLoggedIn ? 'bg-indigo-100' : ''}`}>
          <LogIn className="w-5 h-5" />
        </span>
        <span>{isLoggedIn ? 'Account' : 'Login'}</span>
      </button>
    </nav>
  );
}
