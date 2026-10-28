import { useState, useMemo } from 'react';
import { ListChecks, Send, CheckCircle2, XCircle, RotateCcw, Award, ChevronRight, GraduationCap, BookOpen } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { ErrorAlert, EmptyState } from '@/components/ui';
import { generateLevelQuiz } from '@/lib/quizGenerator';
import { getSubjectsForLevel, getTopicsForSubject, getLevelById } from '@/lib/curriculum';
import type { AppData, QuizQuestion, EducationProfile } from '@/types';

type QuizProps = {
  onUpdate: (updater: (d: AppData) => AppData) => void;
  data: AppData;
};

type QuizState = 'idle' | 'active' | 'results';
type Difficulty = 'Easy' | 'Medium' | 'Hard';

const QUESTION_COUNTS = [5, 10, 15];

export default function QuizGenerator({ onUpdate, data }: QuizProps) {
  const edu: EducationProfile = data.education;
  const hasLevel = !!edu.levelId;
  const level = getLevelById(edu.levelId);
  const needsSub = level?.subType !== undefined;
  const subReady = !needsSub || !!edu.subSelection;
  const canTakeQuiz = hasLevel && subReady;

  const availableSubjects = useMemo(
    () => getSubjectsForLevel(edu.levelId, edu.subSelection),
    [edu.levelId, edu.subSelection],
  );

  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('All Topics');
  const [customTopic, setCustomTopic] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');
  const [numQuestions, setNumQuestions] = useState(5);
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [state, setState] = useState<QuizState>('idle');
  const [error, setError] = useState('');
  const [currentQ, setCurrentQ] = useState(0);

  const availableTopics = useMemo(
    () => subject ? getTopicsForSubject(edu.levelId, subject) : [],
    [edu.levelId, subject],
  );

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canTakeQuiz) return;

    const selectedTopic = customTopic.trim() || topic;
    const result = generateLevelQuiz({
      levelId: edu.levelId!,
      subSelection: edu.subSelection,
      subject,
      topic: selectedTopic,
      difficulty,
      numQuestions,
    });

    if (result.error) {
      setError(result.error);
      setQuestions([]);
      return;
    }

    setError('');
    setQuestions(result.questions);
    setAnswers(new Array(result.questions.length).fill(null));
    setCurrentQ(0);
    setState('active');
  };

  const selectAnswer = (qIndex: number, optionIndex: number) => {
    if (state !== 'active') return;
    setAnswers((prev) => {
      const next = [...prev];
      next[qIndex] = optionIndex;
      return next;
    });
  };

  const allAnswered = answers.every((a) => a !== null);
  const correctCount = answers.filter((a, i) => a === questions[i]?.correctIndex).length;
  const score = questions.length > 0 ? Math.round((correctCount / questions.length) * 100) : 0;

  const handleSubmit = () => {
    if (!allAnswered) return;
    setState('results');
    const quizTopic = `${subject}${topic && topic !== 'All Topics' ? `: ${topic}` : ''}`;

    onUpdate((d) => {
      const quizAttempts = [
        {
          id: crypto.randomUUID(),
          topic: quizTopic,
          totalQuestions: questions.length,
          correctAnswers: correctCount,
          score,
          createdAt: Date.now(),
        },
        ...d.quizAttempts,
      ].slice(0, 20);

      const existingIdx = d.mastery.findIndex((m) => m.topic.toLowerCase() === quizTopic.toLowerCase());
      let mastery;
      if (existingIdx >= 0) {
        const existing = d.mastery[existingIdx];
        const allScores = [...d.quizAttempts.filter((q) => q.topic.toLowerCase() === quizTopic.toLowerCase()).map((q) => q.score), score];
        mastery = d.mastery.map((m, i) =>
          i === existingIdx
            ? {
                ...m,
                attempts: m.attempts + 1,
                bestScore: Math.max(m.bestScore, score),
                lastScore: score,
                avgScore: Math.round(allScores.reduce((s, v) => s + v, 0) / allScores.length),
                lastPracticedAt: Date.now(),
              }
            : m,
        );
      } else {
        mastery = [
          {
            id: crypto.randomUUID(),
            topic: quizTopic,
            attempts: 1,
            bestScore: score,
            lastScore: score,
            avgScore: score,
            lastPracticedAt: Date.now(),
          },
          ...d.mastery,
        ];
      }

      let revisionQueue = d.revisionQueue;
      if (score < 70) {
        revisionQueue = revisionQueue.filter((r) => r.topic.toLowerCase() !== quizTopic.toLowerCase());
        revisionQueue = [
          {
            id: crypto.randomUUID(),
            topic: quizTopic,
            reason: score < 50 ? 'weak-score' as const : 'deadline-approaching' as const,
            priority: score < 50 ? 100 - score : 70 - score + 20,
            detail: score < 50
              ? `Last quiz score: ${score}%. This topic needs urgent revision.`
              : `Last quiz score: ${score}%. Practice recommended to strengthen mastery.`,
            createdAt: Date.now(),
          },
          ...revisionQueue,
        ];
      } else if (score >= 85) {
        revisionQueue = revisionQueue.filter((r) => r.topic.toLowerCase() !== quizTopic.toLowerCase());
      }

      return {
        ...d,
        quizAttempts,
        mastery,
        revisionQueue,
        activities: [
          {
            id: crypto.randomUUID(),
            type: 'quiz' as const,
            title: `Quiz: ${quizTopic.slice(0, 50)}`,
            detail: `${correctCount}/${questions.length} (${score}%)`,
            timestamp: Date.now(),
          },
          ...d.activities,
        ].slice(0, 50),
      };
    });
  };

  const handleReset = () => {
    setState('idle');
    setQuestions([]);
    setAnswers([]);
    setError('');
    setCustomTopic('');
  };

  // === No education level selected ===
  if (!canTakeQuiz) {
    return (
      <div className="animate-fade-in">
        <PageHeader
          title="Quiz Generator"
          subtitle="Take quizzes personalized to your education level."
          icon={<ListChecks className="w-5 h-5" />}
        />
        <div className="card-cozy">
          <EmptyState
            icon={<GraduationCap className="w-7 h-7" />}
            title="Select your education level first"
            description={
              !hasLevel
                ? 'Go to your Profile settings to select your class or college year. This ensures you get age-appropriate questions.'
                : 'Please complete your profile by selecting your branch or year in Settings.'
            }
          />
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Quiz Generator"
        subtitle={`Personalized for ${level?.label}${edu.subSelection ? ` — ${edu.subSelection}` : ''}`}
        icon={<ListChecks className="w-5 h-5" />}
      />

      {/* Level badge */}
      <div className="flex items-center gap-2 mb-4 px-4 py-2 rounded-xl bg-lavender-300/8 border border-lavender-300/15 w-fit">
        <GraduationCap className="w-4 h-4 text-lavender-300" />
        <span className="text-sm font-semibold text-navy-50">{level?.label}</span>
        {edu.subSelection && <span className="text-xs text-navy-200">· {edu.subSelection}</span>}
      </div>

      {(state === 'idle') && (
        <form onSubmit={handleGenerate} className="card-cozy p-5 mb-6">
          {/* Subject selection */}
          <label htmlFor="quiz-subject" className="label-text flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-lavender-300" /> Subject
          </label>
          <select
            id="quiz-subject"
            value={subject}
            onChange={(e) => { setSubject(e.target.value); setTopic('All Topics'); setCustomTopic(''); }}
            className="input-field mb-4"
            required
          >
            <option value="">Choose a subject...</option>
            {availableSubjects.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {/* Custom subject option */}
          <input
            type="text"
            value={subject === '__custom' ? customTopic : ''}
            onChange={(e) => { setSubject('__custom'); setCustomTopic(e.target.value); }}
            placeholder="Or type a custom subject..."
            className="input-field mb-4 text-sm"
          />

          {/* Topic selection */}
          {subject && subject !== '__custom' && availableTopics.length > 0 && (
            <>
              <label htmlFor="quiz-topic" className="label-text">Chapter / Topic</label>
              <select
                id="quiz-topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="input-field mb-4"
              >
                <option value="All Topics">All Topics (mixed)</option>
                {availableTopics.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </>
          )}

          {/* Custom topic */}
          {subject && (
            <>
              <label htmlFor="quiz-custom-topic" className="label-text">Custom Topic (optional)</label>
              <input
                id="quiz-custom-topic"
                type="text"
                value={customTopic}
                onChange={(e) => setCustomTopic(e.target.value)}
                placeholder="Type a specific topic or chapter..."
                className="input-field mb-4"
              />
            </>
          )}

          {/* Difficulty */}
          <label className="label-text">Difficulty</label>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {(['Easy', 'Medium', 'Hard'] as Difficulty[]).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setDifficulty(d)}
                className={`px-3 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                  difficulty === d
                    ? 'border-lavender-300 bg-lavender-300/10 text-navy-50'
                    : 'border-navy-600 hover:border-lavender-300/50 text-navy-100'
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          {/* Number of questions */}
          <label className="label-text">Number of Questions</label>
          <div className="grid grid-cols-3 gap-3 mb-5">
            {QUESTION_COUNTS.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setNumQuestions(n)}
                className={`px-3 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                  numQuestions === n
                    ? 'border-lavender-300 bg-lavender-300/10 text-navy-50'
                    : 'border-navy-600 hover:border-lavender-300/50 text-navy-100'
                }`}
              >
                {n} Questions
              </button>
            ))}
          </div>

          <button type="submit" className="btn-primary w-full" disabled={!subject || (subject === '__custom' && !customTopic.trim())}>
            <Send className="w-4 h-4" /> Generate Quiz
          </button>
        </form>
      )}

      {error && <ErrorAlert message={error} />}

      {state === 'idle' && !error && (
        <div className="card-cozy">
          <EmptyState
            icon={<ListChecks className="w-7 h-7" />}
            title="Ready when you are"
            description={`Select a subject and topic above to generate a ${numQuestions}-question quiz at the ${difficulty} level.`}
          />
        </div>
      )}

      {/* === Active quiz === */}
      {state === 'active' && questions.length > 0 && (
        <div className="card-cozy p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-bold text-navy-50">
              Quiz: {subject}{topic !== 'All Topics' ? ` — ${topic}` : ''}
            </h2>
            <span className="text-sm text-navy-200 font-medium">
              {currentQ + 1} / {questions.length}
            </span>
          </div>

          <div className="w-full h-2 bg-navy-900 rounded-full mb-6 overflow-hidden">
            <div
              className="h-full bg-neon-400 rounded-full transition-all duration-300"
              style={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
            />
          </div>

          <div className="mb-6">
            <h3 className="text-base font-semibold text-navy-50 mb-4">
              {currentQ + 1}. {questions[currentQ].question}
            </h3>
            <div className="space-y-2.5">
              {questions[currentQ].options.map((opt, i) => {
                const selected = answers[currentQ] === i;
                return (
                  <button
                    key={i}
                    onClick={() => selectAnswer(currentQ, i)}
                    className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${
                      selected
                        ? 'border-neon-300 bg-neon-300/10 text-navy-50'
                        : 'border-navy-600 hover:border-neon-300/50 hover:bg-navy-900 text-navy-100'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                          selected ? 'bg-neon-300 text-navy-950' : 'bg-navy-700 text-navy-200'
                        }`}
                      >
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className="text-sm">{opt}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 pt-4 border-t border-navy-600/50">
            <button onClick={() => setCurrentQ((q) => Math.max(0, q - 1))} className="btn-ghost" disabled={currentQ === 0}>
              Previous
            </button>
            <div className="flex gap-1.5">
              {questions.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentQ(i)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i === currentQ ? 'bg-neon-400' : answers[i] !== null ? 'bg-neon-300/50' : 'bg-navy-600'
                  }`}
                  aria-label={`Go to question ${i + 1}`}
                />
              ))}
            </div>
            {currentQ < questions.length - 1 ? (
              <button onClick={() => setCurrentQ((q) => Math.min(questions.length - 1, q + 1))} className="btn-secondary">
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={handleSubmit} className="btn-primary" disabled={!allAnswered} title={!allAnswered ? 'Answer all questions first' : 'Submit quiz'}>
                <Award className="w-4 h-4" />
                Submit Quiz
              </button>
            )}
          </div>

          {!allAnswered && (
            <p className="text-xs text-navy-300 mt-3 text-center">
              {answers.filter((a) => a !== null).length} of {questions.length} answered
            </p>
          )}
        </div>
      )}

      {/* === Results === */}
      {state === 'results' && questions.length > 0 && (
        <div className="space-y-4">
          <div className="card-cozy p-6 text-center">
            <div
              className={`w-16 h-16 rounded-2xl mx-auto flex items-center justify-center mb-3 ${
                score >= 80 ? 'bg-teal-400/10 text-teal-400' : score >= 50 ? 'bg-amber-500/10 text-amber-400' : 'bg-red-500/10 text-red-400'
              }`}
            >
              <Award className="w-8 h-8" />
            </div>
            <h2 className="font-display text-2xl font-bold text-navy-50">You scored {score}%</h2>
            <p className="text-navy-200 mt-1">{correctCount} out of {questions.length} correct</p>
            {score < 70 && (
              <p className="text-sm text-amber-300 mt-2">
                This topic was added to your Revision Queue for practice.
              </p>
            )}
            {score >= 85 && (
              <p className="text-sm text-teal-300 mt-2">
                Great work! Mastery updated — this topic is marked as well-practiced.
              </p>
            )}
            <button onClick={handleReset} className="btn-primary mt-4">
              <RotateCcw className="w-4 h-4" />
              New Quiz
            </button>
          </div>

          <div className="space-y-3">
            {questions.map((q, qi) => {
              const userAnswer = answers[qi];
              const correct = userAnswer === q.correctIndex;
              return (
                <div key={qi} className="card-cozy p-5">
                  <div className="flex items-start gap-3 mb-3">
                    {correct ? (
                      <CheckCircle2 className="w-5 h-5 text-teal-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    )}
                    <h3 className="text-sm font-semibold text-navy-50 flex-1">
                      {qi + 1}. {q.question}
                    </h3>
                  </div>
                  <div className="space-y-1.5 ml-8">
                    {q.options.map((opt, oi) => {
                      const isCorrect = oi === q.correctIndex;
                      const isUserPick = oi === userAnswer;
                      let cls = 'text-navy-200';
                      if (isCorrect) cls = 'text-teal-300 font-medium bg-teal-400/10 rounded-lg px-2 py-1';
                      else if (isUserPick && !isCorrect) cls = 'text-red-300 bg-red-500/10 rounded-lg px-2 py-1';
                      return (
                        <div key={oi} className={`text-sm ${cls} flex items-center gap-2`}>
                          <span className="text-xs font-bold w-5">{String.fromCharCode(65 + oi)}</span>
                          {opt}
                          {isCorrect && <CheckCircle2 className="w-4 h-4 text-teal-400" />}
                          {isUserPick && !isCorrect && <XCircle className="w-4 h-4 text-red-400" />}
                        </div>
                      );
                    })}
                  </div>
                  {q.explanation && (
                    <div className="mt-3 ml-8 p-3 rounded-xl bg-neon-300/5 border border-neon-300/20">
                      <p className="text-xs text-neon-200">
                        <strong>Explanation:</strong> {q.explanation}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="text-center">
            <button onClick={handleReset} className="btn-secondary">
              <RotateCcw className="w-4 h-4" />
              Start New Quiz
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
