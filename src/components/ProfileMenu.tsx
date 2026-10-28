import { useState, useRef, useEffect } from 'react';
import { User as UserIcon, LogOut, ChevronDown } from 'lucide-react';
import type { AuthUser } from '@/hooks/useAuth';

type ProfileMenuProps = {
  user: AuthUser;
  onSignOut: () => void;
};

export default function ProfileMenu({ user, onSignOut }: ProfileMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const initials = (user.fullName ?? user.email)
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-navy-200 hover:bg-navy-700/50 transition-colors"
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-lavender-300/20 to-neon-300/20 border border-lavender-300/25 flex items-center justify-center flex-shrink-0">
          <span className="text-xs font-bold text-lavender-300">{initials}</span>
        </div>
        <div className="flex-1 text-left min-w-0">
          <div className="text-sm font-semibold text-navy-50 truncate">{user.fullName ?? 'Student'}</div>
          <div className="text-xs text-navy-300 truncate">{user.email}</div>
        </div>
        <ChevronDown className={`w-4 h-4 text-navy-300 transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute bottom-full left-0 right-0 mb-2 card p-2 animate-fade-in">
          <div className="px-3 py-2.5 border-b border-navy-600/30 mb-1">
            <div className="flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-lavender-300" />
              <div className="min-w-0">
                <div className="text-sm font-semibold text-navy-50 truncate">{user.fullName ?? 'Student'}</div>
                <div className="text-xs text-navy-300 truncate">{user.email}</div>
              </div>
            </div>
          </div>
          <button
            onClick={() => { setOpen(false); onSignOut(); }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-300 hover:bg-red-500/10 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
