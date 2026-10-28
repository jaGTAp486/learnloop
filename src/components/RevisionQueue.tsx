import { Zap, AlertTriangle, Clock, TrendingDown, Info, RotateCcw } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { EmptyState } from '@/components/ui';
import type { AppData, RevisionItem } from '@/types';

type RevisionProps = {
  data: AppData;
  onUpdate: (updater: (d: AppData) => AppData) => void;
};

const reasonConfig: Record<RevisionItem['reason'], { icon: typeof Zap; color: string; label: string }> = {
  'weak-score': { icon: TrendingDown, color: 'bg-red-500/10 text-red-400 border-red-500/30', label: 'Weak Score' },
  'deadline-approaching': { icon: Clock, color: 'bg-amber-500/10 text-amber-400 border-amber-500/30', label: 'Needs Practice' },
  'not-practiced': { icon: AlertTriangle, color: 'bg-purple-500/10 text-purple-300 border-purple-500/30', label: 'Not Practiced' },
};

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function RevisionQueue({ data, onUpdate }: RevisionProps) {
  const items = data.revisionQueue;

  // Sort by priority descending (higher = more urgent), then by createdAt
  const sorted = [...items].sort((a, b) => b.priority - a.priority || b.createdAt - a.createdAt);

  const dismiss = (id: string) => {
    onUpdate((d) => ({ ...d, revisionQueue: d.revisionQueue.filter((r) => r.id !== id) }));
  };

  const dismissAll = () => {
    onUpdate((d) => ({ ...d, revisionQueue: [] }));
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Smart Revision Queue"
        subtitle="Weak quiz scores and gaps are automatically prioritized for revision."
        icon={<Zap className="w-5 h-5" />}
      />

      {/* Transparent rules explanation */}
      <div className="card p-5 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Info className="w-5 h-5 text-neon-300" />
          <h2 className="font-display text-lg font-bold text-navy-50">How Prioritization Works</h2>
        </div>
        <div className="space-y-2 text-sm text-navy-100">
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-lg bg-red-500/10 text-red-400 flex items-center justify-center flex-shrink-0 text-xs font-bold">1</span>
            <p><strong className="text-navy-50">Weak Score (Priority 51-100):</strong> Quiz scores below 50% trigger urgent revision. Priority = 100 - score.</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center flex-shrink-0 text-xs font-bold">2</span>
            <p><strong className="text-navy-50">Needs Practice (Priority 20-50):</strong> Quiz scores 50-69% are flagged for practice. Priority = 70 - score + 20.</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="w-6 h-6 rounded-lg bg-purple-500/10 text-purple-300 flex items-center justify-center flex-shrink-0 text-xs font-bold">3</span>
            <p><strong className="text-navy-50">Auto-removal:</strong> Topics scoring 85%+ are removed from the queue — you've mastered them.</p>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-navy-600/50 text-xs text-navy-300">
          Items are ordered by priority (highest first). Take quizzes in the Quiz Generator to populate this queue automatically.
        </div>
      </div>

      {/* Queue */}
      {sorted.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<Zap className="w-7 h-7" />}
            title="Your revision queue is empty"
            description="Take a quiz in the Quiz Generator — topics scoring below 70% will appear here automatically, ordered by priority."
          />
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-lg font-bold text-navy-50">
              {sorted.length} item{sorted.length !== 1 ? 's' : ''} to revise
            </h2>
            <button onClick={dismissAll} className="btn-ghost text-xs">
              <RotateCcw className="w-3.5 h-3.5" />
              Clear All
            </button>
          </div>
          <div className="space-y-3">
            {sorted.map((item) => {
              const cfg = reasonConfig[item.reason];
              return (
                <div key={item.id} className="card p-4 group">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 ${cfg.color}`}>
                      <cfg.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <h3 className="font-semibold text-navy-50 text-sm">{item.topic}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${cfg.color}`}>
                          {cfg.label}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-navy-700 text-navy-200 font-bold">
                          Priority: {item.priority}
                        </span>
                      </div>
                      <p className="text-sm text-navy-200 mb-1">{item.detail}</p>
                      <p className="text-xs text-navy-300">Added {timeAgo(item.createdAt)}</p>
                    </div>
                    <button
                      onClick={() => dismiss(item.id)}
                      className="btn-ghost text-xs opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Mastery summary */}
      {data.mastery.length > 0 && (
        <div className="card p-5 mt-6">
          <h2 className="font-display text-lg font-bold text-navy-50 mb-3">Mastery Overview</h2>
          <div className="space-y-2">
            {data.mastery
              .slice()
              .sort((a, b) => a.avgScore - b.avgScore)
              .map((m) => (
                <div key={m.id} className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-navy-900">
                  <div>
                    <div className="text-sm font-medium text-navy-100">{m.topic}</div>
                    <div className="text-xs text-navy-300">Avg: {m.avgScore}% · Best: {m.bestScore}%</div>
                  </div>
                  <div className={`text-xs px-2.5 py-1 rounded-lg font-bold ${
                    m.avgScore >= 85 ? 'bg-teal-400/10 text-teal-300'
                      : m.avgScore >= 50 ? 'bg-amber-500/10 text-amber-300'
                      : 'bg-red-500/10 text-red-300'
                  }`}>
                    {m.avgScore >= 85 ? 'Mastered' : m.avgScore >= 50 ? 'Developing' : 'Needs Work'}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
