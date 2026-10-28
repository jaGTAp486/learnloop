import {
  HelpCircle,
  FileText,
  ListChecks,
  CalendarClock,
  MessageSquare,
  Rocket,
  Gauge,
  Users,
  Zap,
  Plus,
  Target,
  TrendingUp,
  Clock,
  Award,
  CheckCircle2,
  Circle,
  Trash2,
  Sparkles,
  Flame,
  BookOpen,
  Compass,
  Sofa,
} from 'lucide-react';
import type { AppData, Feature } from '@/types';
import { useState } from 'react';
import { StudyMascot, moodMessages } from '@/components/StudyMascot';

type DashboardProps = {
  data: AppData;
  onNavigate: (f: Feature) => void;
  onUpdate: (updater: (d: AppData) => AppData) => void;
  userName?: string;
};

const coreFeatures: {
  id: Feature;
  title: string;
  desc: string;
  icon: typeof Rocket;
  accent: string;
}[] = [
  { id: 'missions', title: 'Topic Missions', desc: 'Quests to conquer your subjects', icon: Rocket, accent: 'bg-lavender-300/10 text-lavender-300' },
  { id: 'mastery', title: 'Mastery Tracker', desc: 'Track your growing mastery levels', icon: Gauge, accent: 'bg-teal-400/10 text-teal-400' },
  { id: 'circles', title: 'Learning Circles', desc: 'Cozy group study with peers', icon: Users, accent: 'bg-lavender-300/10 text-lavender-300' },
  { id: 'revision', title: 'Revision Queue', desc: 'Gentle reminders for weak spots', icon: Zap, accent: 'bg-neon-300/10 text-neon-300' },
  { id: 'cozy-missions', title: 'Study Missions', desc: 'Guided cozy study quests with XP', icon: Compass, accent: 'bg-lavender-300/10 text-lavender-300' },
  { id: 'study-room', title: 'Study Room', desc: 'Decorate your virtual bedroom', icon: Sofa, accent: 'bg-lamp-200/10 text-lamp-200' },
];

const aiTools: {
  id: Feature;
  title: string;
  desc: string;
  icon: typeof HelpCircle;
  accent: string;
}[] = [
  { id: 'doubt', title: 'Doubt Solver', desc: 'Get clear, friendly explanations', icon: HelpCircle, accent: 'bg-neon-300/10 text-neon-300' },
  { id: 'notes', title: 'Notes Generator', desc: 'Structured study notes', icon: FileText, accent: 'bg-teal-400/10 text-teal-400' },
  { id: 'quiz', title: 'Quiz Generator', desc: 'Test your knowledge gently', icon: ListChecks, accent: 'bg-neon-300/10 text-neon-300' },
  { id: 'exam', title: 'Exam Prep Mode', desc: 'Plan your study time calmly', icon: CalendarClock, accent: 'bg-teal-400/10 text-teal-400' },
  { id: 'chat', title: 'Chat Assistant', desc: 'Ask follow-up questions', icon: MessageSquare, accent: 'bg-neon-300/10 text-neon-300' },
];

const activityIcons: Record<string, typeof HelpCircle> = {
  doubt: HelpCircle,
  notes: FileText,
  quiz: ListChecks,
  exam: CalendarClock,
  chat: MessageSquare,
  mission: Rocket,
  circle: Users,
  arcade: Zap,
};

const activityLabels: Record<string, string> = {
  doubt: 'Doubt Solved',
  notes: 'Notes Generated',
  quiz: 'Quiz Completed',
  exam: 'Study Plan Created',
  chat: 'Chat Message',
  mission: 'Mission Update',
  circle: 'Circle Activity',
  arcade: 'Arcade Game',
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

export default function Dashboard({ data, onNavigate, onUpdate, userName }: DashboardProps) {
  const [newGoal, setNewGoal] = useState('');

  const totalQuizzes = data.quizAttempts.length;
  const avgScore =
    totalQuizzes > 0
      ? Math.round(data.quizAttempts.reduce((s, q) => s + q.score, 0) / totalQuizzes)
      : 0;
  const activeMissions = data.missions.filter((m) => m.status === 'active');
  const completedMissions = data.missions.filter((m) => m.status === 'completed');
  const totalActivities = data.activities.length;
  const totalXP = data.arcade.totalXP;
  const goalsDone = data.goals.filter((g) => g.done).length;
  const goalsTotal = data.goals.length;
  const dailyProgress = goalsTotal > 0 ? Math.round((goalsDone / goalsTotal) * 100) : 0;

  // Streak: count consecutive days with activity
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  const hasActivityToday = data.activities.some((a) => new Date(a.timestamp).toDateString() === today);
  const hasActivityYesterday = data.activities.some((a) => new Date(a.timestamp).toDateString() === yesterday);
  const streak = hasActivityToday ? (hasActivityYesterday ? 2 : 1) : 0;

  // Mascot mood based on state
  const mascotMood = completedMissions.length > 0 && activeMissions.length === 0
    ? 'celebrate'
    : activeMissions.length > 0
      ? 'encourage'
      : 'welcome';

  const addGoal = () => {
    const title = newGoal.trim();
    if (!title) return;
    onUpdate((d) => ({
      ...d,
      goals: [
        ...d.goals,
        { id: crypto.randomUUID(), title, done: false, createdAt: Date.now() },
      ],
    }));
    setNewGoal('');
  };

  const toggleGoal = (id: string) => {
    onUpdate((d) => ({
      ...d,
      goals: d.goals.map((g) => (g.id === id ? { ...g, done: !g.done } : g)),
    }));
  };

  const deleteGoal = (id: string) => {
    onUpdate((d) => ({ ...d, goals: d.goals.filter((g) => g.id !== id) }));
  };

  const recentActivities = [...data.activities].sort((a, b) => b.timestamp - a.timestamp).slice(0, 6);
  const nextMissions = activeMissions.slice(0, 3);
  const revisionItems = data.revisionQueue.slice(0, 3);

  return (
    <div className="animate-fade-in cozy-room-bg rounded-3xl">
      {/* === Cozy Study Room Header === */}
      <div className="card-cozy p-6 mb-6 overflow-hidden relative">
        {/* Decorative room elements — subtle, behind content */}
        <div className="absolute top-0 right-0 w-40 h-40 opacity-[0.07] pointer-events-none hidden sm:block">
          {/* Window with rain */}
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <rect x="10" y="10" width="80" height="70" rx="4" fill="none" stroke="#78E5F5" strokeWidth="2" />
            <line x1="50" y1="10" x2="50" y2="80" stroke="#78E5F5" strokeWidth="1" />
            <line x1="10" y1="45" x2="90" y2="45" stroke="#78E5F5" strokeWidth="1" />
            {/* Rain drops */}
            <line x1="25" y1="20" x2="23" y2="28" stroke="#78E5F5" strokeWidth="0.5" opacity="0.6" />
            <line x1="65" y1="25" x2="63" y2="33" stroke="#78E5F5" strokeWidth="0.5" opacity="0.6" />
            <line x1="40" y1="55" x2="38" y2="63" stroke="#78E5F5" strokeWidth="0.5" opacity="0.6" />
          </svg>
        </div>
        {/* Lamp glow */}
        <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-lamp-200/8 blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 relative">
          {/* Mascot */}
          <div className="flex-shrink-0 animate-float">
            <StudyMascot mood={mascotMood} size={100} />
          </div>

          {/* Welcome text */}
          <div className="flex-1">
            <h1 className="font-display text-2xl font-bold text-navy-50">
              Welcome back to your little study space{userName ? `, ${userName}` : ''}
            </h1>
            <p className="text-navy-200 text-sm mt-2 leading-relaxed max-w-md">
              {moodMessages[mascotMood]}
            </p>
          </div>
        </div>

        {/* XP + Streak display */}
        <div className="flex items-center gap-4 mt-5 relative">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-lavender-300/8 border border-lavender-300/15">
            <Sparkles className="w-4 h-4 text-lavender-300" />
            <span className="text-sm font-bold text-navy-50">{totalXP}</span>
            <span className="text-xs text-navy-200">XP</span>
          </div>
          {streak > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-lamp-200/8 border border-lamp-200/15">
              <Flame className="w-4 h-4 text-lamp-200" />
              <span className="text-sm font-bold text-navy-50">{streak}</span>
              <span className="text-xs text-navy-200">day streak</span>
            </div>
          )}
        </div>
      </div>

      {/* === Daily Progress + Quick Stats === */}
      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        {/* Daily progress bar */}
        <div className="card-cozy p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target className="w-4 h-4 text-neon-300" />
              <h3 className="font-semibold text-navy-50 text-sm">Today's Progress</h3>
            </div>
            <span className="text-sm font-bold text-neon-300">{dailyProgress}%</span>
          </div>
          <div className="progress-cozy">
            <div className="progress-cozy-fill" style={{ width: `${dailyProgress}%` }} />
          </div>
          <p className="text-xs text-navy-300 mt-2">
            {goalsTotal === 0
              ? 'Add a study goal below to start tracking your daily progress.'
              : `${goalsDone} of ${goalsTotal} goals completed today. Keep going!`}
          </p>
        </div>

        {/* Quick stat */}
        <div className="card-cozy p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="w-4 h-4 text-teal-400" />
            <h3 className="font-semibold text-navy-50 text-sm">Quiz Average</h3>
          </div>
          <div className="text-3xl font-bold text-navy-50">{avgScore}%</div>
          <p className="text-xs text-navy-300 mt-1">{totalQuizzes} quizzes taken</p>
        </div>
      </div>

      {/* === Today's Missions as Quest Cards === */}
      {nextMissions.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-lg font-bold text-navy-50 flex items-center gap-2">
              <Rocket className="w-5 h-5 text-lavender-300" />
              Today's Quests
            </h2>
            <button onClick={() => onNavigate('missions')} className="text-xs text-lavender-300 hover:text-lavender-200 transition-colors font-medium">
              View all
            </button>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {nextMissions.map((m) => (
              <button
                key={m.id}
                onClick={() => onNavigate('missions')}
                className="card-cozy p-4 text-left hover:-translate-y-0.5 transition-all group"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${m.difficulty === 'Advanced' ? 'bg-red-500/10 text-red-400' : m.difficulty === 'Intermediate' ? 'bg-lamp-200/10 text-lamp-200' : 'bg-teal-400/10 text-teal-400'}`}>
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <span className="text-xs text-navy-300">{m.subject}</span>
                </div>
                <h3 className="font-semibold text-navy-50 text-sm mb-1 group-hover:text-lavender-300 transition-colors">{m.title}</h3>
                <p className="text-xs text-navy-200 line-clamp-2">{m.description}</p>
                <div className="mt-3 flex items-center gap-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${m.difficulty === 'Advanced' ? 'bg-red-500/10 text-red-400' : m.difficulty === 'Intermediate' ? 'bg-lamp-200/10 text-lamp-200' : 'bg-teal-400/10 text-teal-400'}`}>
                    {m.difficulty}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* === Quick Revision + Next Session === */}
      <div className="grid lg:grid-cols-2 gap-4 mb-6">
        {/* Quick revision */}
        <div className="card-cozy p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-neon-300" />
              <h3 className="font-semibold text-navy-50 text-sm">Quick Revision</h3>
            </div>
            <button onClick={() => onNavigate('revision')} className="text-xs text-neon-300 hover:text-neon-200 transition-colors font-medium">
              Open queue
            </button>
          </div>
          {revisionItems.length === 0 ? (
            <p className="text-sm text-navy-300 py-3 text-center">Your revision queue is clear. Take a quiz to populate it!</p>
          ) : (
            <ul className="space-y-2">
              {revisionItems.map((r) => (
                <li key={r.id} className="flex items-center gap-3 px-3 py-2 rounded-xl bg-navy-900/60">
                  <div className="w-7 h-7 rounded-lg bg-neon-300/10 flex items-center justify-center flex-shrink-0">
                    <Zap className="w-3.5 h-3.5 text-neon-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-navy-100 truncate">{r.topic}</div>
                    <div className="text-xs text-navy-300">Priority: {r.priority}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Next study session suggestion */}
        <div className="card-cozy p-5">
          <div className="flex items-center gap-2 mb-3">
            <CalendarClock className="w-4 h-4 text-lavender-300" />
            <h3 className="font-semibold text-navy-50 text-sm">Next Study Session</h3>
          </div>
          {activeMissions.length > 0 ? (
            <div>
              <p className="text-sm text-navy-100 mb-3">You have {activeMissions.length} active mission{activeMissions.length !== 1 ? 's' : ''} ready to work on.</p>
              <button onClick={() => onNavigate('missions')} className="btn-primary text-sm">
                <Rocket className="w-4 h-4" /> Start studying
              </button>
            </div>
          ) : totalQuizzes === 0 ? (
            <div>
              <p className="text-sm text-navy-100 mb-3">No missions yet. Try generating a quiz to discover what to study!</p>
              <button onClick={() => onNavigate('quiz')} className="btn-primary text-sm">
                <ListChecks className="w-4 h-4" /> Take a quiz
              </button>
            </div>
          ) : (
            <div>
              <p className="text-sm text-navy-100 mb-3">You're all caught up on missions. Time for a cozy review session?</p>
              <button onClick={() => onNavigate('revision')} className="btn-primary text-sm">
                <Zap className="w-4 h-4" /> Review topics
              </button>
            </div>
          )}
        </div>
      </div>

      {/* === Feature cards === */}
      <h2 className="font-display text-lg font-bold text-navy-50 mb-3">Your Study Tools</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {coreFeatures.map((f) => (
          <button
            key={f.id}
            onClick={() => onNavigate(f.id)}
            className="card-cozy p-5 text-left hover:-translate-y-0.5 transition-all duration-200 group"
          >
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 ${f.accent}`}>
              <f.icon className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-navy-50 mb-1 group-hover:text-lavender-300 transition-colors">
              {f.title}
            </h3>
            <p className="text-sm text-navy-200">{f.desc}</p>
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {aiTools.map((f) => (
          <button
            key={f.id}
            onClick={() => onNavigate(f.id)}
            className="card-cozy p-5 text-left hover:-translate-y-0.5 transition-all duration-200 group"
          >
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 ${f.accent}`}>
              <f.icon className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-navy-50 mb-1 group-hover:text-neon-300 transition-colors">
              {f.title}
            </h3>
            <p className="text-sm text-navy-200">{f.desc}</p>
          </button>
        ))}
      </div>

      {/* === Goals + Recent Activity === */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Goals */}
        <div className="card-cozy p-5">
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-5 h-5 text-neon-300" />
            <h2 className="font-display text-lg font-bold text-navy-50">Study Goals</h2>
          </div>

          <div className="flex gap-2 mb-4">
            <input
              type="text"
              value={newGoal}
              onChange={(e) => setNewGoal(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addGoal()}
              placeholder="Add a study goal..."
              className="input-field text-sm"
            />
            <button onClick={addGoal} className="btn-primary px-3 flex-shrink-0" aria-label="Add goal">
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {data.goals.length === 0 ? (
            <p className="text-sm text-navy-300 py-4 text-center">
              No goals yet. Add one above to stay on track!
            </p>
          ) : (
            <ul className="space-y-2">
              {data.goals.map((goal) => (
                <li
                  key={goal.id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-navy-900/60 group transition-all"
                >
                  <button onClick={() => toggleGoal(goal.id)} className="flex-shrink-0">
                    {goal.done ? (
                      <CheckCircle2 className="w-5 h-5 text-teal-400 animate-celebrate" />
                    ) : (
                      <Circle className="w-5 h-5 text-navy-400 hover:text-neon-300 transition-colors" />
                    )}
                  </button>
                  <span
                    className={`flex-1 text-sm ${
                      goal.done ? 'line-through text-navy-400' : 'text-navy-100'
                    }`}
                  >
                    {goal.title}
                  </span>
                  <button
                    onClick={() => deleteGoal(goal.id)}
                    className="text-navy-400 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                    aria-label="Delete goal"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Recent activity */}
        <div className="card-cozy p-5">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-5 h-5 text-lavender-300" />
            <h2 className="font-display text-lg font-bold text-navy-50">Recent Activity</h2>
          </div>

          {recentActivities.length === 0 ? (
            <p className="text-sm text-navy-300 py-4 text-center">
              No activity yet. Try solving a doubt or generating notes!
            </p>
          ) : (
            <ul className="space-y-2">
              {recentActivities.map((act) => {
                const Icon = activityIcons[act.type] ?? HelpCircle;
                return (
                  <li key={act.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-navy-900/60">
                    <div className="w-8 h-8 rounded-lg bg-navy-700 flex items-center justify-center text-lavender-300 flex-shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-navy-100 truncate">{act.title}</div>
                      <div className="text-xs text-navy-300">
                        {activityLabels[act.type] ?? 'Activity'} · {timeAgo(act.timestamp)}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Quiz history */}
      {data.quizAttempts.length > 0 && (
        <div className="card-cozy p-5 mt-6">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-neon-300" />
            <h2 className="font-display text-lg font-bold text-navy-50">Quiz History</h2>
          </div>
          <div className="space-y-2">
            {data.quizAttempts
              .slice()
              .sort((a, b) => b.createdAt - a.createdAt)
              .slice(0, 5)
              .map((quiz) => (
                <div
                  key={quiz.id}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-navy-900/60"
                >
                  <div>
                    <div className="text-sm font-medium text-navy-100">{quiz.topic}</div>
                    <div className="text-xs text-navy-300">
                      {quiz.correctAnswers}/{quiz.totalQuestions} correct · {timeAgo(quiz.createdAt)}
                    </div>
                  </div>
                  <div
                    className={`px-2.5 py-1 rounded-lg text-sm font-bold ${
                      quiz.score >= 80
                        ? 'bg-teal-400/10 text-teal-300'
                        : quiz.score >= 50
                          ? 'bg-lamp-200/10 text-lamp-200'
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

      {/* Break reminder after study activity */}
      {totalActivities > 0 && totalActivities % 5 === 0 && (
        <div className="card-cozy p-4 mt-6 flex items-center gap-3 border-lavender-300/20">
          <StudyMascot mood="resting" size={48} />
          <p className="text-sm text-navy-100">
            You've been busy! How about a short break? Rest is part of learning too.
          </p>
        </div>
      )}
    </div>
  );
}
