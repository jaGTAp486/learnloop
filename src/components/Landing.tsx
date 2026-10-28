import {
  Rocket,
  Gauge,
  Users,
  Zap,
  HelpCircle,
  FileText,
  ListChecks,
  CalendarClock,
  MessageSquare,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import { LearnLoopMark } from '@/components/Logo';

type LandingProps = {
  onEnter: () => void;
};

const coreFeatures = [
  {
    icon: Rocket,
    title: 'Topic Mission Engine',
    desc: 'Create, edit, complete, and delete study missions. Break complex subjects into achievable goals.',
    gradient: 'from-neon-500/20 to-neon-500/5',
    iconColor: 'text-neon-400',
  },
  {
    icon: Gauge,
    title: 'Mastery Tracker',
    desc: 'Track quiz scores and mastery levels per topic. See exactly where you stand and what needs work.',
    gradient: 'from-teal-500/20 to-teal-500/5',
    iconColor: 'text-teal-400',
  },
  {
    icon: Users,
    title: 'Peer Learning Circles',
    desc: 'Join study groups, post questions, and learn together with peers in your subject area.',
    gradient: 'from-purple-500/20 to-purple-500/5',
    iconColor: 'text-purple-400',
  },
  {
    icon: Zap,
    title: 'Smart Revision Queue',
    desc: 'Transparent rules prioritize weak topics and approaching deadlines so you always revise what matters.',
    gradient: 'from-neon-500/20 to-purple-500/5',
    iconColor: 'text-neon-300',
  },
];

const aiTools = [
  { icon: HelpCircle, title: 'AI Doubt Solver', desc: 'Step-by-step explanations with a curated knowledge base.' },
  { icon: FileText, title: 'AI Notes Generator', desc: 'Structured notes from any topic with revision summaries.' },
  { icon: ListChecks, title: 'AI Quiz Generator', desc: 'Auto-generate quizzes, test yourself, get instant scores.' },
  { icon: CalendarClock, title: 'Exam Prep Mode', desc: 'Prioritized study schedules from your available time.' },
  { icon: MessageSquare, title: 'AI Chat Assistant', desc: 'Conversational tutoring with follow-up questions.' },
];

export default function Landing({ onEnter }: LandingProps) {
  return (
    <div className="min-h-screen bg-navy-950">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-neon-500/10 rounded-full blur-[120px]" />
        <div className="absolute top-1/3 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-teal-500/5 rounded-full blur-[120px]" />
      </div>

      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-navy-950/80 backdrop-blur-md border-b border-navy-600/30">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <LearnLoopMark size={36} />
            <span className="font-display font-bold text-lg text-white">LearnLoop</span>
          </div>
          <button onClick={onEnter} className="btn-primary text-sm">
            Launch App
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative">
        <div className="relative max-w-6xl mx-auto px-5 pt-20 pb-28 text-center">
          {/* Hero logo mark */}
          <div className="flex justify-center mb-8 animate-slide-up">
            <div className="w-20 h-20 rounded-3xl bg-navy-800 border border-neon-500/20 shadow-neon-glow flex items-center justify-center">
              <LearnLoopMark size={72} />
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-neon-500/10 border border-neon-500/20 text-neon-300 text-sm font-medium mb-6 animate-fade-in">
            <Sparkles className="w-4 h-4" />
            Learn together. Master every loop.
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight max-w-3xl mx-auto animate-slide-up">
            Learn together.<br />
            <span className="bg-gradient-to-r from-neon-400 to-purple-400 bg-clip-text text-transparent">Master every loop.</span>
          </h1>

          <p className="mt-6 text-lg text-navy-200 max-w-2xl mx-auto leading-relaxed animate-slide-up">
            LearnLoop turns studying into a continuous loop: set missions, track mastery,
            learn with peers, and revise smart — powered by AI tools that explain, quiz, and plan.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center animate-slide-up">
            <button onClick={onEnter} className="btn-primary text-base px-7 py-3">
              Start Learning Free
              <ArrowRight className="w-5 h-5" />
            </button>
            <a href="#features" className="btn-secondary text-base px-7 py-3">
              Explore Features
            </a>
          </div>

          <div className="mt-12 flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-navy-300">
            {['No sign-up required', 'Works on any device', 'Your progress is saved'].map((t) => (
              <div key={t} className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-neon-400" />
                {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Features */}
      <section id="features" className="relative max-w-6xl mx-auto px-5 py-20">
        <div className="text-center mb-14">
          <h2 className="font-display text-3xl sm:text-4xl font-bold text-white">
            Four pillars to close the loop
          </h2>
          <p className="mt-3 text-navy-300 max-w-2xl mx-auto">
            Built for hackathon-grade learning: missions, mastery, peers, and smart revision.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          {coreFeatures.map((f) => (
            <div
              key={f.title}
              className={`card p-6 hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 bg-gradient-to-br ${f.gradient}`}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-navy-800 border border-navy-600/40 flex items-center justify-center flex-shrink-0">
                  <f.icon className={`w-6 h-6 ${f.iconColor}`} />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-white mb-2">{f.title}</h3>
                  <p className="text-sm text-navy-200 leading-relaxed">{f.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* AI Tools */}
      <section className="relative max-w-6xl mx-auto px-5 py-12">
        <div className="text-center mb-10">
          <h2 className="font-display text-2xl font-bold text-white">AI Study Tools</h2>
          <p className="mt-2 text-navy-300 text-sm">Carried over from StudyMate — now with curated demo knowledge.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {aiTools.map((f) => (
            <div key={f.title} className="card p-5 hover:border-neon-500/30 transition-all">
              <div className="flex items-center gap-3 mb-2">
                <f.icon className="w-5 h-5 text-neon-400 flex-shrink-0" />
                <h3 className="font-semibold text-white text-sm">{f.title}</h3>
              </div>
              <p className="text-xs text-navy-300 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative max-w-6xl mx-auto px-5 pb-24">
        <div className="relative rounded-3xl bg-gradient-to-br from-neon-500/10 via-navy-800 to-purple-500/10 border border-neon-500/20 px-8 py-14 text-center overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-neon-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative">
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-white">
              Ready to close the loop?
            </h2>
            <p className="mt-3 text-navy-200 max-w-xl mx-auto">
              Launch LearnLoop and start mastering your subjects today.
            </p>
            <button
              onClick={onEnter}
              className="mt-8 inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-neon-500 text-navy-950 font-bold text-base hover:bg-neon-400 hover:shadow-neon-glow transition-all active:scale-[0.98]"
            >
              Launch LearnLoop
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-navy-600/30">
        <div className="max-w-6xl mx-auto px-5 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-navy-200">
            <LearnLoopMark size={28} />
            <span className="font-display font-semibold">LearnLoop</span>
          </div>
          <p className="text-sm text-navy-400">
            Learn together. Master every loop. — Built for hackathon learning.
          </p>
        </div>
      </footer>
    </div>
  );
}
