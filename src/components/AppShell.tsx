import { useState } from 'react';
import {
  LayoutDashboard,
  HelpCircle,
  FileText,
  ListChecks,
  CalendarClock,
  MessageSquare,
  Rocket,
  Gauge,
  Users,
  Zap,
  Gamepad2,
  Menu,
  X,
  Compass,
  Sofa,
} from 'lucide-react';
import type { Feature } from '@/types';
import { LearnLoopMark } from '@/components/Logo';
import ProfileMenu from '@/components/ProfileMenu';
import type { AuthUser } from '@/hooks/useAuth';

type SidebarProps = {
  current: Feature;
  onNavigate: (f: Feature) => void;
  user: AuthUser;
  onSignOut: () => void;
  children: React.ReactNode;
};

const navSections: { label: string; items: { id: Feature; label: string; icon: typeof LayoutDashboard }[] }[] = [
  {
    label: 'Overview',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    ],
  },
  {
    label: 'LearnLoop Core',
    items: [
      { id: 'missions', label: 'Topic Missions', icon: Rocket },
      { id: 'mastery', label: 'Mastery Tracker', icon: Gauge },
      { id: 'circles', label: 'Learning Circles', icon: Users },
      { id: 'revision', label: 'Revision Queue', icon: Zap },
    ],
  },
  {
    label: 'Study Arcade',
    items: [
      { id: 'arcade', label: 'Study Arcade', icon: Gamepad2 },
    ],
  },
  {
    label: 'Cozy World',
    items: [
      { id: 'cozy-missions', label: 'Study Missions', icon: Compass },
      { id: 'study-room', label: 'Study Room', icon: Sofa },
    ],
  },
  {
    label: 'AI Study Tools',
    items: [
      { id: 'doubt', label: 'Doubt Solver', icon: HelpCircle },
      { id: 'notes', label: 'Notes Generator', icon: FileText },
      { id: 'quiz', label: 'Quiz Generator', icon: ListChecks },
      { id: 'exam', label: 'Exam Prep Mode', icon: CalendarClock },
      { id: 'chat', label: 'Chat Assistant', icon: MessageSquare },
    ],
  },
];

export default function AppShell({ current, onNavigate, user, onSignOut, children }: SidebarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNav = (f: Feature) => {
    onNavigate(f);
    setMobileOpen(false);
  };

  const sidebar = (
    <aside className="w-64 bg-navy-900 border-r border-navy-600/30 flex flex-col h-full">
      {/* Logo */}
      <div className="h-16 flex items-center gap-2.5 px-5 border-b border-navy-600/30 flex-shrink-0">
        <LearnLoopMark size={36} />
        <div>
          <div className="font-display font-bold text-white leading-tight">LearnLoop</div>
          <div className="text-[11px] text-lavender-300/50 leading-tight">Your cozy study space</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-4 overflow-y-auto">
        {navSections.map((section) => (
          <div key={section.label}>
            <div className="px-3 mb-1.5 text-[10px] font-bold uppercase tracking-wider text-navy-300">
              {section.label}
            </div>
            <div className="space-y-1">
              {section.items.map((item) => {
                const active = current === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNav(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      active
                        ? 'bg-lavender-300/8 text-lavender-300 border border-lavender-300/15'
                        : 'text-navy-200 hover:bg-navy-700/40 hover:text-white border border-transparent'
                    }`}
                  >
                    <item.icon className={`w-5 h-5 ${active ? 'text-lavender-300' : 'text-navy-300'}`} />
                    {item.label}
                    {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-lavender-300 animate-pulse-soft" />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer — user profile + sign out */}
      <div className="px-3 py-4 border-t border-navy-600/30 flex-shrink-0">
        <ProfileMenu user={user} onSignOut={onSignOut} />
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-navy-950 overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden lg:block flex-shrink-0">{sidebar}</div>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-navy-950/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative z-10 animate-slide-in">{sidebar}</div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <div className="lg:hidden h-14 bg-navy-900 border-b border-navy-600/30 flex items-center justify-between px-4 flex-shrink-0">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 -ml-2 rounded-lg text-navy-100 hover:bg-navy-700/50"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <LearnLoopMark size={28} />
            <span className="font-display font-bold text-sm text-white">LearnLoop</span>
          </div>
          <div className="w-9" />
        </div>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
            {children}
          </div>
        </main>
      </div>

      {/* Close button overlay for mobile when open */}
      {mobileOpen && (
        <button
          onClick={() => setMobileOpen(false)}
          className="lg:hidden fixed top-3 right-3 z-[60] p-2 rounded-lg bg-navy-800 shadow-lg text-navy-100"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
