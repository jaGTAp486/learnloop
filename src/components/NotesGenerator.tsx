import { useState } from 'react';
import { FileText, Send, Copy, Check } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { LoadingSpinner, DemoBanner, ErrorAlert, EmptyState } from '@/components/ui';
import { generateNotes } from '@/lib/ai';
import { renderMarkdown } from '@/lib/markdown';
import type { AppData } from '@/types';

type NotesProps = {
  onUpdate: (updater: (d: AppData) => AppData) => void;
};

export default function NotesGenerator({ onUpdate }: NotesProps) {
  const [topic, setTopic] = useState('');
  const [simpleEnglish, setSimpleEnglish] = useState(false);
  const [notes, setNotes] = useState('');
  const [isDemo, setIsDemo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const t = topic.trim();
    if (!t) return;
    setLoading(true);
    setError('');
    setNotes('');
    try {
      const result = await generateNotes(t, simpleEnglish);
      setNotes(result.content);
      setIsDemo(result.isDemo);
      onUpdate((d) => ({
        ...d,
        notesHistory: [
          { id: crypto.randomUUID(), topic: t, createdAt: Date.now() },
          ...d.notesHistory,
        ].slice(0, 20),
        activities: [
          {
            id: crypto.randomUUID(),
            type: 'notes' as const,
            title: `Notes: ${t.slice(0, 50)}`,
            detail: result.isDemo ? 'Demo notes' : 'AI notes',
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

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(notes);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard may be blocked
    }
  };

  const sampleTopics = [
    'Recursion in programming',
    ' Kirchhoff\'s Voltage Law',
    'Object-Oriented Programming basics',
    'Thermodynamics: First Law',
  ];

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="AI Notes Generator"
        subtitle="Enter a topic and get structured notes with definitions, key points, and a revision summary."
        icon={<FileText className="w-5 h-5" />}
      />

      <form onSubmit={handleSubmit} className="card p-5 mb-6">
        <label htmlFor="notes-input" className="label-text">
          Topic or Subject
        </label>
        <textarea
          id="notes-input"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g. Data Structures: Trees and Graphs"
          rows={3}
          className="input-field resize-none mb-3"
          disabled={loading}
        />

        <label className="flex items-center gap-2 text-sm text-navy-200 cursor-pointer mb-4">
          <input
            type="checkbox"
            checked={simpleEnglish}
            onChange={(e) => setSimpleEnglish(e.target.checked)}
            className="w-4 h-4 rounded text-neon-300 focus:ring-neon-300"
            disabled={loading}
          />
          Simple English notes
        </label>

        <button type="submit" className="btn-primary" disabled={loading || !topic.trim()}>
          <Send className="w-4 h-4" />
          {loading ? 'Generating notes...' : 'Generate Notes'}
        </button>

        <div className="mt-4 pt-4 border-t border-navy-600/50">
          <p className="text-xs text-navy-300 mb-2">Try a sample topic:</p>
          <div className="flex flex-wrap gap-2">
            {sampleTopics.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTopic(t.trim())}
                className="text-xs px-3 py-1.5 rounded-lg bg-neon-300/10 text-neon-300 hover:bg-neon-300/15 transition-colors"
                disabled={loading}
              >
                {t.trim()}
              </button>
            ))}
          </div>
        </div>
      </form>

      {error && <ErrorAlert message={error} />}

      {loading && <LoadingSpinner label="Writing your notes..." />}

      {!loading && !notes && !error && (
        <div className="card">
          <EmptyState
            icon={<FileText className="w-7 h-7" />}
            title="No notes yet"
            description="Enter a topic above and I'll create structured study notes for you."
          />
        </div>
      )}

      {notes && !loading && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-4">
            <DemoBanner isDemo={isDemo} />
            <button
              onClick={handleCopy}
              className="btn-ghost text-xs flex-shrink-0 ml-2"
            >
              {copied ? <Check className="w-4 h-4 text-teal-400" /> : <Copy className="w-4 h-4" />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
          <div
            className="prose-studymate max-w-none"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(notes) }}
          />
        </div>
      )}
    </div>
  );
}
