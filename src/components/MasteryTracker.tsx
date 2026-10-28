import { Gauge, TrendingUp, Award, Flame, BarChart3 } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { EmptyState } from '@/components/ui';
import type { AppData, MasteryTopic } from '@/types';

type MasteryProps = {
  data: AppData;
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

function masteryLevel(avg: number): { label: string; color: string; pct: number } {
  if (avg >= 85) return { label: 'Mastered', color: 'text-teal-300 bg-teal-500/10', pct: 100 };
  if (avg >= 70) return { label: 'Proficient', color: 'text-neon-300 bg-neon-500/10', pct: 80 };
  if (avg >= 50) return { label: 'Developing', color: 'text-amber-300 bg-amber-500/10', pct: 55 };
  return { label: 'Needs Work', color: 'text-red-300 bg-red-500/10', pct: 25 };
}

export default function MasteryTracker({ data }: MasteryProps) {
  const topics = data.mastery;
  const totalQuizzes = data.quizAttempts.length;
  const overallAvg =
    totalQuizzes > 0
      ? Math.round(data.quizAttempts.reduce((s, q) => s + q.score, 0) / totalQuizzes)
      : 0;
  const masteredCount = topics.filter((t) => t.avgScore >= 85).length;
  const weakTopics = topics.filter((t) => t.avgScore < 50).length;

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Mastery Tracker"
        subtitle="Quiz scores feed into per-topic mastery. See exactly where you stand."
        icon={<Gauge className="w-5 h-5" />}
      />

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Award} label="Quizzes Taken" value={String(totalQuizzes)} color="text-neon-400 bg-neon-500/10" />
        <StatCard icon={TrendingUp} label="Overall Avg" value={`${overallAvg}%`} color="text-teal-400 bg-teal-500/10" />
        <StatCard icon={Flame} label="Mastered Topics" value={String(masteredCount)} color="text-teal-400 bg-teal-500/10" />
        <StatCard icon={BarChart3} label="Needs Work" value={String(weakTopics)} color="text-red-400 bg-red-500/10" />
      </div>

      {/* Topic mastery list */}
      {topics.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<Gauge className="w-7 h-7" />}
            title="No mastery data yet"
            description="Take a quiz in the Quiz Generator to start building mastery scores per topic."
          />
        </div>
      ) : (
        <div className="space-y-3">
          <h2 className="font-display text-lg font-bold text-white">Topic Mastery Breakdown</h2>
          {topics
            .slice()
            .sort((a, b) => b.avgScore - a.avgScore)
            .map((t) => (
              <MasteryCard key={t.id} topic={t} />
            ))}
        </div>
      )}

      {/* Quiz history */}
      {data.quizAttempts.length > 0 && (
        <div className="card p-5 mt-6">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-neon-400" />
            <h2 className="font-display text-lg font-bold text-white">Recent Quiz Results</h2>
          </div>
          <div className="space-y-2">
            {data.quizAttempts
              .slice()
              .sort((a, b) => b.createdAt - a.createdAt)
              .slice(0, 8)
              .map((quiz) => (
                <div
                  key={quiz.id}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-navy-900/50"
                >
                  <div>
                    <div className="text-sm font-medium text-white">{quiz.topic}</div>
                    <div className="text-xs text-navy-300">
                      {quiz.correctAnswers}/{quiz.totalQuestions} correct · {timeAgo(quiz.createdAt)}
                    </div>
                  </div>
                  <div
                    className={`px-2.5 py-1 rounded-lg text-sm font-bold ${
                      quiz.score >= 80
                        ? 'bg-teal-500/10 text-teal-300'
                        : quiz.score >= 50
                          ? 'bg-amber-500/10 text-amber-300'
                          : 'bg-red-500/10 text-red-300'
                    }`}
                  >
                    {quiz.score}%
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MasteryCard({ topic }: { topic: MasteryTopic }) {
  const level = masteryLevel(topic.avgScore);
  return (
    <div className="card p-4 hover:border-neon-500/20 transition-all">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-semibold text-white text-sm">{topic.topic}</h3>
          <div className="text-xs text-navy-300 mt-0.5">
            {topic.attempts} attempt{topic.attempts !== 1 ? 's' : ''} · Best: {topic.bestScore}% · Last: {topic.lastScore}%
            {topic.lastPracticedAt && ` · ${timeAgo(topic.lastPracticedAt)}`}
          </div>
        </div>
        <span className={`text-xs px-2.5 py-1 rounded-lg font-bold ${level.color}`}>
          {level.label}
        </span>
      </div>
      {/* Progress bar */}
      <div className="w-full h-2.5 bg-navy-900 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${
            topic.avgScore >= 85 ? 'bg-teal-400' : topic.avgScore >= 70 ? 'bg-neon-400' : topic.avgScore >= 50 ? 'bg-amber-400' : 'bg-red-400'
          }`}
          style={{ width: `${Math.max(topic.avgScore, 3)}%` }}
        />
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: typeof Award;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="card p-4">
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-2xl font-bold text-white">{value}</div>
      <div className="text-xs text-navy-300 mt-0.5">{label}</div>
    </div>
  );
}
