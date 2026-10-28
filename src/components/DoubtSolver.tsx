import { useState } from 'react';
import { HelpCircle, Send, Sparkles } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { LoadingSpinner, DemoBanner, ErrorAlert, EmptyState } from '@/components/ui';
import { solveDoubt } from '@/lib/ai';
import { renderMarkdown } from '@/lib/markdown';
import type { AppData } from '@/types';

type DoubtProps = {
  onUpdate: (updater: (d: AppData) => AppData) => void;
};

export default function DoubtSolver({ onUpdate }: DoubtProps) {
  const [question, setQuestion] = useState('');
  const [simpleEnglish, setSimpleEnglish] = useState(false);
  const [answer, setAnswer] = useState('');
  const [isDemo, setIsDemo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = question.trim();
    if (!q) return;
    setLoading(true);
    setError('');
    setAnswer('');
    try {
      const result = await solveDoubt(q, simpleEnglish);
      setAnswer(result.content);
      setIsDemo(result.isDemo);
      onUpdate((d) => ({
        ...d,
        doubtsHistory: [
          { id: crypto.randomUUID(), question: q, createdAt: Date.now() },
          ...d.doubtsHistory,
        ].slice(0, 20),
        activities: [
          {
            id: crypto.randomUUID(),
            type: 'doubt' as const,
            title: q.slice(0, 60),
            detail: result.isDemo ? 'Demo answer' : 'AI answer',
            timestamp: Date.now(),
          },
          ...d.activities,
        ].slice(0, 50),
      }));
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong. Please try again.',
      );
    } finally {
      setLoading(false);
    }
  };

  const sampleQuestions = [
    'Explain Newton\'s Second Law of Motion',
    'What is meant by Kirchhoff\'s law?',
    'What is the difference between AC and DC current?',
    'Explain binary search with an example',
    'What is Ohm\'s Law?',
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="AI Doubt Solver"
        subtitle="Ask any academic question and get a clear, step-by-step explanation."
        icon={<HelpCircle className="w-5 h-5" />}
      />

      <form onSubmit={handleSubmit} className="card p-5 mb-6">
        <label htmlFor="doubt-input" className="label-text">
          Your Question
        </label>
        <textarea
          id="doubt-input"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g. Explain how a transistor works, with an example..."
          rows={4}
          className="input-field resize-none mb-3"
          disabled={loading}
        />

        <div className="flex items-center gap-3 mb-4">
          <label className="flex items-center gap-2 text-sm text-navy-200 cursor-pointer">
            <input
              type="checkbox"
              checked={simpleEnglish}
              onChange={(e) => setSimpleEnglish(e.target.checked)}
              className="w-4 h-4 rounded text-neon-300 focus:ring-neon-300"
              disabled={loading}
            />
            Simple English explanation
          </label>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button type="submit" className="btn-primary" disabled={loading || !question.trim()}>
            <Send className="w-4 h-4" />
            {loading ? 'Getting answer...' : 'Get Answer'}
          </button>
        </div>

        {/* Sample questions */}
        <div className="mt-4 pt-4 border-t border-navy-600/50">
          <p className="text-xs text-navy-300 mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Try a sample question:
          </p>
          <div className="flex flex-wrap gap-2">
            {sampleQuestions.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => setQuestion(q)}
                className="text-xs px-3 py-1.5 rounded-lg bg-neon-300/10 text-neon-300 hover:bg-neon-300/15 transition-colors"
                disabled={loading}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </form>

      {error && <ErrorAlert message={error} />}

      {loading && <LoadingSpinner label="Thinking through your question..." />}

      {!loading && !answer && !error && (
        <div className="card">
          <EmptyState
            icon={<HelpCircle className="w-7 h-7" />}
            title="No answer yet"
            description="Type a question above and I'll break it down step by step with examples."
          />
        </div>
      )}

      {answer && !loading && (
        <div className="card p-6">
          <DemoBanner isDemo={isDemo} />
          <div
            className="prose-studymate max-w-none"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(answer) }}
          />
        </div>
      )}
    </div>
  );
}
