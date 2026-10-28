import { useState } from 'react';
import {
  Rocket, Clock, Target, Send, CheckCircle2, XCircle, RotateCcw,
  Award, ChevronRight, BookOpen, Zap, Sparkles, Lightbulb, Loader2,
} from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { LoadingSpinner, DemoBanner, ErrorAlert, EmptyState } from '@/components/ui';
import { StudyMascot, moodMessages } from '@/components/StudyMascot';
import { generateQuiz } from '@/lib/ai';
import { parseQuiz } from '@/lib/parse';
import type { AppData, CozyMission, QuizQuestion, CozyMissionStep } from '@/types';

type CozyMissionsProps = {
  data: AppData;
  onUpdate: (updater: (d: AppData) => AppData) => void;
};

type Phase = 'setup' | 'loading' | 'active' | 'results';

const DURATIONS = [
  { label: 'Quick (10 min)', value: 10, qCount: 3 },
  { label: 'Standard (15 min)', value: 15, qCount: 5 },
  { label: 'Deep (25 min)', value: 25, qCount: 7 },
];

/** Transparent rule-based demo questions used when AI is not configured.
 *  These are clearly labeled as Demo Mode — never presented as real AI. */
function generateDemoQuestions(topic: string, count: number): QuizQuestion[] {
  const t = topic.trim();
  const questions: QuizQuestion[] = [
    {
      question: `What is the primary focus when studying "${t}"?`,
      options: [
        `Understanding core concepts of ${t}`,
        `Memorizing random facts`,
        `Skipping the fundamentals`,
        `Only reading the summary`,
      ],
      correctIndex: 0,
      explanation: `Starting with core concepts builds a strong foundation for deeper understanding of ${t}.`,
    },
    {
      question: `Which approach helps retain "${t}" knowledge best over time?`,
      options: [
        `Cramming once before an exam`,
        `Spaced repetition and regular practice`,
        `Reading passively without notes`,
        `Watching videos without taking action`,
      ],
      correctIndex: 1,
      explanation: `Spaced repetition strengthens memory by revisiting material at increasing intervals.`,
    },
    {
      question: `What is a good first step when tackling a problem in "${t}"?`,
      options: [
        `Jump straight to the answer`,
        `Break it into smaller, manageable parts`,
        `Ask someone else to solve it`,
        `Skip it and move on`,
      ],
      correctIndex: 1,
      explanation: `Decomposition — breaking problems into smaller parts — is a fundamental study skill.`,
    },
    {
      question: `Why is it useful to create summary notes for "${t}"?`,
      options: [
        `They look nice but serve no purpose`,
        `They help consolidate and review key points efficiently`,
        `They replace the need for practice entirely`,
        `They are only for beginners`,
      ],
      correctIndex: 1,
      explanation: `Summary notes condense information, making review faster and more effective.`,
    },
    {
      question: `What signals that you've mastered a topic in "${t}"?`,
      options: [
        `You can explain it simply to someone else`,
        `You can read through it quickly`,
        `You have notes about it`,
        `You attended a lecture on it`,
      ],
      correctIndex: 0,
      explanation: `The Feynman technique: if you can explain it simply, you truly understand it.`,
    },
    {
      question: `When you get stuck on a problem in "${t}", what should you do?`,
      options: [
        `Give up immediately`,
        `Review related fundamentals and try a different approach`,
        `Guess randomly`,
        `Wait for inspiration without action`,
      ],
      correctIndex: 1,
      explanation: `Going back to fundamentals often reveals what was missed. Trying alternative approaches builds problem-solving flexibility.`,
    },
    {
      question: `How does teaching "${t}" to a study partner help you learn?`,
      options: [
        `It doesn't — teaching wastes study time`,
        `It reveals gaps in your understanding and reinforces what you know`,
        `It only helps the partner, not you`,
        `It replaces the need for solo study`,
      ],
      correctIndex: 1,
      explanation: `Teaching forces you to organize your knowledge and exposes areas that need more work.`,
    },
  ];
  return questions.slice(0, Math.min(count, questions.length));
}

function buildSteps(qCount: number): CozyMissionStep[] {
  const steps: CozyMissionStep[] = [
    { type: 'learn', label: 'Review the learning goals', done: false },
    { type: 'practice', label: `Answer ${qCount} practice questions`, done: false },
    { type: 'review', label: 'Review incorrect answers for revision', done: false },
  ];
  return steps;
}

function buildGoals(topic: string, duration: number): string[] {
  return [
    `Understand the key concepts of ${topic}`,
    `Apply concepts through practice questions`,
    `Identify and review any weak areas`,
    `Build confidence for the next ${duration}-minute session`,
  ];
}

export default function CozyStudyMissions({ data, onUpdate }: CozyMissionsProps) {
  const [phase, setPhase] = useState<Phase>('setup');
  const [topic, setTopic] = useState('');
  const [duration, setDuration] = useState(15);
  const [qCount, setQCount] = useState(5);
  const [error, setError] = useState('');
  const [isDemo, setIsDemo] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [activeMission, setActiveMission] = useState<CozyMission | null>(null);
  const [answeredQuestions, setAnsweredQuestions] = useState<(number | null)[]>([]);

  const completedMissions = data.cozyMissions.filter((m) => m.completedAt !== null);
  const totalXpFromMissions = data.cozyMissions.reduce((s, m) => s + m.xpEarned, 0);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = topic.trim();
    if (!t) return;

    setPhase('loading');
    setError('');

    let questions: QuizQuestion[] = [];
    let demo = false;

    try {
      const result = await generateQuiz(t);
      if (result.isDemo || !result.content) {
        demo = true;
        questions = generateDemoQuestions(t, qCount);
      } else {
        const parsed = parseQuiz(result.content);
        if (parsed && parsed.length > 0) {
          questions = parsed.slice(0, qCount);
        } else {
          demo = true;
          questions = generateDemoQuestions(t, qCount);
        }
      }
    } catch {
      demo = true;
      questions = generateDemoQuestions(t, qCount);
    }

    if (questions.length === 0) {
      setError('Could not create a mission for this topic. Please try a different topic.');
      setPhase('setup');
      return;
    }

    const mission: CozyMission = {
      id: crypto.randomUUID(),
      topic: t,
      duration,
      goals: buildGoals(t, duration),
      questions,
      answers: new Array(questions.length).fill(null),
      steps: buildSteps(questions.length),
      score: null,
      xpEarned: 0,
      createdAt: Date.now(),
      completedAt: null,
    };

    setActiveMission(mission);
    setAnsweredQuestions(mission.answers);
    setIsDemo(demo);
    setCurrentQ(0);
    setPhase('active');
  };

  const selectAnswer = (qIndex: number, optionIndex: number) => {
    if (phase !== 'active') return;
    const next = [...answeredQuestions];
    next[qIndex] = optionIndex;
    setAnsweredQuestions(next);
  };

  const allAnswered = activeMission ? answeredQuestions.every((a) => a !== null) : false;
  const correctCount = activeMission
    ? answeredQuestions.filter((a, i) => a === activeMission.questions[i]?.correctIndex).length
    : 0;
  const score = activeMission && activeMission.questions.length > 0
    ? Math.round((correctCount / activeMission.questions.length) * 100)
    : 0;

  const handleComplete = () => {
    if (!activeMission || !allAnswered) return;

    const xpEarned = Math.max(10, score * 2);
    const incorrectQuestions = activeMission.questions
      .map((q, i) => ({ q, userAnswer: answeredQuestions[i], isCorrect: answeredQuestions[i] === q.correctIndex }))
      .filter((r) => !r.isCorrect);

    const updatedSteps = activeMission.steps.map((s) => {
      if (s.type === 'practice') return { ...s, done: true };
      if (s.type === 'review' && incorrectQuestions.length === 0) return { ...s, done: true };
      return s;
    });

    const completedMission: CozyMission = {
      ...activeMission,
      answers: answeredQuestions,
      score,
      xpEarned,
      steps: updatedSteps,
      completedAt: Date.now(),
    };

    // Add revision items for incorrect questions
    const revisionItems = incorrectQuestions.map((r) => ({
      id: crypto.randomUUID(),
      topic: activeMission.topic,
      reason: 'weak-score' as const,
      priority: 100 - score,
      detail: `Missed: "${r.q.question.slice(0, 60)}..." — Review this concept.`,
      createdAt: Date.now(),
    }));

    onUpdate((d) => {
      const existingRevision = revisionItems.length > 0
        ? [
            ...revisionItems,
            ...d.revisionQueue.filter((r) => r.topic.toLowerCase() !== activeMission.topic.toLowerCase()),
          ]
        : d.revisionQueue.filter((r) => r.topic.toLowerCase() !== activeMission.topic.toLowerCase() && score >= 85);

      return {
        ...d,
        cozyMissions: [completedMission, ...d.cozyMissions].slice(0, 30),
        arcade: {
          ...d.arcade,
          totalXP: d.arcade.totalXP + xpEarned,
        },
        revisionQueue: revisionItems.length > 0 ? revisionItems : existingRevision,
        activities: [
          {
            id: crypto.randomUUID(),
            type: 'mission' as const,
            title: `Cozy Mission: ${activeMission.topic.slice(0, 40)}`,
            detail: `${correctCount}/${activeMission.questions.length} correct · +${xpEarned} XP`,
            timestamp: Date.now(),
          },
          ...d.activities,
        ].slice(0, 50),
        studyRoom: {
          ...d.studyRoom,
          // Unlock a room item when XP crosses thresholds
          unlockedItems: checkUnlocks(d.studyRoom.unlockedItems, d.arcade.totalXP + xpEarned),
        },
      };
    });

    setActiveMission(completedMission);
    setPhase('results');
  };

  const handleReset = () => {
    setPhase('setup');
    setActiveMission(null);
    setAnsweredQuestions([]);
    setTopic('');
    setError('');
  };

  const sampleTopics = ['Data Structures', 'Cell Biology', 'World War II', 'Linear Algebra', 'Newton\'s Laws'];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Cozy Study Missions"
        subtitle="Pick a topic, choose your time, and embark on a guided study quest with your mascot buddy."
        icon={<Rocket className="w-5 h-5" />}
      />

      {/* XP summary */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-lavender-300/8 border border-lavender-300/15">
          <Sparkles className="w-4 h-4 text-lavender-300" />
          <span className="text-sm font-bold text-navy-50">{totalXpFromMissions}</span>
          <span className="text-xs text-navy-200">XP from missions</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-teal-400/8 border border-teal-400/15">
          <Award className="w-4 h-4 text-teal-400" />
          <span className="text-sm font-bold text-navy-50">{completedMissions.length}</span>
          <span className="text-xs text-navy-200">completed</span>
        </div>
      </div>

      {/* === SETUP PHASE === */}
      {(phase === 'setup' || phase === 'loading') && (
        <form onSubmit={handleCreate} className="card-cozy p-5 mb-6">
          <label htmlFor="cozy-topic" className="label-text">What do you want to study?</label>
          <input
            id="cozy-topic"
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. Photosynthesis, Integration by Parts, World War II..."
            className="input-field mb-4"
            disabled={phase === 'loading'}
          />

          <label className="label-text">Choose your study duration</label>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {DURATIONS.map((d) => (
              <button
                key={d.value}
                type="button"
                onClick={() => { setDuration(d.value); setQCount(d.qCount); }}
                disabled={phase === 'loading'}
                className={`flex flex-col items-center gap-1 px-3 py-3 rounded-xl border-2 transition-all ${
                  duration === d.value
                    ? 'border-lavender-300 bg-lavender-300/10 text-navy-50'
                    : 'border-navy-600 hover:border-lavender-300/50 text-navy-100'
                }`}
              >
                <Clock className="w-4 h-4 text-lavender-300" />
                <span className="text-xs font-semibold">{d.label}</span>
                <span className="text-[10px] text-navy-300">{d.qCount} questions</span>
              </button>
            ))}
          </div>

          <button type="submit" className="btn-primary w-full" disabled={phase === 'loading' || !topic.trim()}>
            {phase === 'loading' ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Creating your mission...</>
            ) : (
              <><Rocket className="w-4 h-4" /> Start Cozy Mission</>
            )}
          </button>

          <div className="mt-4 pt-4 border-t border-navy-600/30">
            <p className="text-xs text-navy-300 mb-2">Or try a sample topic:</p>
            <div className="flex flex-wrap gap-2">
              {sampleTopics.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTopic(t)}
                  className="text-xs px-3 py-1.5 rounded-lg bg-lavender-300/10 text-lavender-300 hover:bg-lavender-300/15 transition-colors"
                  disabled={phase === 'loading'}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
        </form>
      )}

      {phase === 'loading' && <LoadingSpinner label="Building your study mission..." />}

      {/* === ACTIVE PHASE === */}
      {phase === 'active' && activeMission && (
        <div className="space-y-4">
          {/* Mission overview card */}
          <div className="card-cozy p-5">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 animate-float">
                <StudyMascot mood="studying" size={64} />
              </div>
              <div className="flex-1">
                <h2 className="font-display text-lg font-bold text-navy-50">{activeMission.topic}</h2>
                <p className="text-sm text-navy-200 mt-1">{moodMessages.studying}</p>
                <div className="flex items-center gap-3 mt-3">
                  <span className="flex items-center gap-1 text-xs text-navy-300">
                    <Clock className="w-3.5 h-3.5" /> {activeMission.duration} min
                  </span>
                  <span className="flex items-center gap-1 text-xs text-navy-300">
                    <Target className="w-3.5 h-3.5" /> {activeMission.goals.length} goals
                  </span>
                  <span className="flex items-center gap-1 text-xs text-navy-300">
                    <BookOpen className="w-3.5 h-3.5" /> {activeMission.questions.length} questions
                  </span>
                </div>
              </div>
            </div>

            {/* Learning goals */}
            <div className="mt-4 pt-4 border-t border-navy-600/30">
              <h3 className="text-sm font-semibold text-navy-50 mb-2 flex items-center gap-2">
                <Target className="w-4 h-4 text-lavender-300" /> Learning Goals
              </h3>
              <ul className="space-y-1.5">
                {activeMission.goals.map((g, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-navy-100">
                    <span className="w-5 h-5 rounded-full bg-lavender-300/10 flex items-center justify-center text-[10px] font-bold text-lavender-300 flex-shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    {g}
                  </li>
                ))}
              </ul>
            </div>

            {/* Mission steps */}
            <div className="mt-4 pt-4 border-t border-navy-600/30">
              <h3 className="text-sm font-semibold text-navy-50 mb-2 flex items-center gap-2">
                <Zap className="w-4 h-4 text-neon-300" /> Mission Steps
              </h3>
              <div className="space-y-2">
                {activeMission.steps.map((s, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    {s.done ? (
                      <CheckCircle2 className="w-4 h-4 text-teal-400" />
                    ) : (
                      <span className="w-4 h-4 rounded-full border border-navy-500" />
                    )}
                    <span className={s.done ? 'text-navy-300 line-through' : 'text-navy-100'}>{s.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Demo banner */}
          {isDemo && <DemoBanner isDemo={true} />}

          {/* Question card */}
          <div className="card-cozy p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-base font-bold text-navy-50">
                Question {currentQ + 1} of {activeMission.questions.length}
              </h3>
              <span className="text-sm text-navy-200 font-medium">{currentQ + 1}/{activeMission.questions.length}</span>
            </div>

            <div className="w-full h-2 bg-navy-900 rounded-full mb-6 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${((currentQ + 1) / activeMission.questions.length) * 100}%`,
                  background: 'linear-gradient(90deg, #78E5F5, #B9A5FF)',
                }}
              />
            </div>

            <h4 className="text-base font-semibold text-navy-50 mb-4">
              {activeMission.questions[currentQ].question}
            </h4>

            <div className="space-y-2.5">
              {activeMission.questions[currentQ].options.map((opt, i) => {
                const selected = answeredQuestions[currentQ] === i;
                return (
                  <button
                    key={i}
                    onClick={() => selectAnswer(currentQ, i)}
                    className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${
                      selected
                        ? 'border-lavender-300 bg-lavender-300/10 text-navy-50'
                        : 'border-navy-600 hover:border-lavender-300/50 hover:bg-navy-900 text-navy-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                        selected ? 'bg-lavender-300 text-navy-950' : 'bg-navy-700 text-navy-200'
                      }`}>
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className="text-sm">{opt}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between gap-3 pt-4 mt-4 border-t border-navy-600/30">
              <button onClick={() => setCurrentQ((q) => Math.max(0, q - 1))} className="btn-ghost" disabled={currentQ === 0}>
                Previous
              </button>
              <div className="flex gap-1.5">
                {activeMission.questions.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentQ(i)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      i === currentQ ? 'bg-lavender-300' : answeredQuestions[i] !== null ? 'bg-lavender-300/50' : 'bg-navy-600'
                    }`}
                    aria-label={`Go to question ${i + 1}`}
                  />
                ))}
              </div>
              {currentQ < activeMission.questions.length - 1 ? (
                <button onClick={() => setCurrentQ((q) => Math.min(activeMission.questions.length - 1, q + 1))} className="btn-secondary">
                  Next <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button onClick={handleComplete} className="btn-primary" disabled={!allAnswered}>
                  <CheckCircle2 className="w-4 h-4" /> Complete Mission
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* === RESULTS PHASE === */}
      {phase === 'results' && activeMission && (
        <div className="space-y-4">
          {/* Score card with mascot */}
          <div className="card-cozy p-6 text-center">
            <div className="flex justify-center mb-4 animate-float">
              <StudyMascot mood={score >= 70 ? 'celebrate' : 'encourage'} size={80} />
            </div>
            <div className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-3 ${
              score >= 80 ? 'bg-teal-400/10 text-teal-400' : score >= 50 ? 'bg-lamp-200/10 text-lamp-200' : 'bg-red-500/10 text-red-400'
            }`}>
              <Award className="w-8 h-8" />
            </div>
            <h2 className="font-display text-2xl font-bold text-navy-50">You scored {score}%</h2>
            <p className="text-navy-200 mt-1">
              {correctCount} out of {activeMission.questions.length} correct
            </p>
            <p className="text-sm text-lavender-300 mt-2 font-semibold">
              +{activeMission.xpEarned} XP earned!
            </p>
            <p className="text-sm text-navy-200 mt-3 max-w-sm mx-auto">
              {moodMessages[score >= 70 ? 'celebrate' : 'encourage']}
            </p>
            <button onClick={handleReset} className="btn-primary mt-5">
              <RotateCcw className="w-4 h-4" /> New Mission
            </button>
          </div>

          {/* Completed steps */}
          <div className="card-cozy p-5">
            <h3 className="font-semibold text-navy-50 mb-3 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-teal-400" /> Completed Steps
            </h3>
            <div className="space-y-2">
              {activeMission.steps.map((s, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className={`w-4 h-4 ${s.done ? 'text-teal-400' : 'text-navy-500'}`} />
                  <span className={s.done ? 'text-navy-100' : 'text-navy-400'}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Review incorrect answers */}
          {activeMission.questions.some((q, i) => answeredQuestions[i] !== q.correctIndex) && (
            <div className="card-cozy p-5">
              <h3 className="font-semibold text-navy-50 mb-3 flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-lamp-200" /> Topics to Review
              </h3>
              <div className="space-y-3">
                {activeMission.questions.map((q, i) => {
                  const isCorrect = answeredQuestions[i] === q.correctIndex;
                  if (isCorrect) return null;
                  return (
                    <div key={i} className="rounded-xl bg-navy-900/60 p-4 border border-red-500/15">
                      <div className="flex items-start gap-2 mb-2">
                        <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                        <span className="text-sm font-medium text-navy-100">{q.question}</span>
                      </div>
                      <div className="text-xs text-teal-400 mb-1">
                        Correct: {q.options[q.correctIndex]}
                      </div>
                      {answeredQuestions[i] !== null && (
                        <div className="text-xs text-red-400 mb-1">
                          Your answer: {q.options[answeredQuestions[i]!]}
                        </div>
                      )}
                      <div className="text-xs text-navy-200 mt-2 italic">
                        {q.explanation}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* All correct celebration */}
          {activeMission.questions.every((q, i) => answeredQuestions[i] === q.correctIndex) && (
            <div className="card-cozy p-5 text-center border-teal-400/20">
              <Sparkles className="w-6 h-6 text-teal-400 mx-auto mb-2" />
              <p className="text-sm text-navy-100">Perfect score! No revision needed — you've mastered this topic.</p>
            </div>
          )}
        </div>
      )}

      {/* === PAST MISSIONS === */}
      {data.cozyMissions.length > 0 && phase === 'setup' && (
        <div>
          <h2 className="font-display text-lg font-bold text-navy-50 mb-3">Past Missions</h2>
          <div className="space-y-2">
            {data.cozyMissions.slice(0, 8).map((m) => (
              <div key={m.id} className="card-cozy p-4 flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-navy-100 truncate">{m.topic}</div>
                  <div className="text-xs text-navy-300">
                    {m.questions.length} questions · {m.completedAt ? `${m.score}%` : 'In progress'}
                  </div>
                </div>
                {m.completedAt && (
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs font-bold text-lavender-300">+{m.xpEarned} XP</span>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                      (m.score ?? 0) >= 80 ? 'bg-teal-400/10 text-teal-400' : (m.score ?? 0) >= 50 ? 'bg-lamp-200/10 text-lamp-200' : 'bg-red-500/10 text-red-400'
                    }`}>
                      {m.score}%
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {phase === 'setup' && data.cozyMissions.length === 0 && (
        <div className="card-cozy">
          <EmptyState
            icon={<Rocket className="w-7 h-7" />}
            title="No missions yet"
            description="Enter a topic above to start your first cozy study mission. Your mascot buddy will guide you through goals, questions, and review steps."
          />
        </div>
      )}
    </div>
  );
}

/** Check if new XP thresholds unlock room items. Returns updated unlocked items list. */
function checkUnlocks(currentUnlocked: string[], totalXP: number): string[] {
  // Import ROOM_ITEMS dynamically would be async; instead use the static list
  const thresholds: Record<string, number> = {
    'stack-books': 50,
    'potted-plant': 80,
    'wall-poster': 120,
    'string-lights': 150,
    'rug': 200,
    'cat-plush': 250,
    'rain-window': 300,
    'star-poster': 350,
    'tea-mug': 400,
    'bookshelf': 500,
  };
  const newUnlocked = [...currentUnlocked];
  for (const [itemId, cost] of Object.entries(thresholds)) {
    if (totalXP >= cost && !newUnlocked.includes(itemId)) {
      newUnlocked.push(itemId);
    }
  }
  return newUnlocked;
}
