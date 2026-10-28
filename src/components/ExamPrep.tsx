import { useState } from 'react';
import { CalendarClock, Send, RotateCcw, Flag, Clock, BookOpen } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { LoadingSpinner, DemoBanner, ErrorAlert, EmptyState } from '@/components/ui';
import { generateExamPlan } from '@/lib/ai';
import { parseSchedule } from '@/lib/parse';
import type { AppData, StudyBlock } from '@/types';

type ExamProps = {
  onUpdate: (updater: (d: AppData) => AppData) => void;
};

const priorityColors: Record<string, string> = {
  High: 'bg-red-500/10 text-red-400 border-red-500/30',
  Medium: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  Low: 'bg-navy-700 text-navy-300 border-navy-600',
};

export default function ExamPrep({ onUpdate }: ExamProps) {
  const [subject, setSubject] = useState('');
  const [unit, setUnit] = useState('');
  const [studyTime, setStudyTime] = useState('');
  const [priorities, setPriorities] = useState('');
  const [schedule, setSchedule] = useState<StudyBlock[]>([]);
  const [isDemo, setIsDemo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasResult, setHasResult] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !unit.trim() || !studyTime.trim()) return;
    setLoading(true);
    setError('');
    setSchedule([]);
    setHasResult(false);
    try {
      const result = await generateExamPlan(
        subject.trim(),
        unit.trim(),
        studyTime.trim(),
        priorities.trim() || 'No specific priorities',
      );
      const parsed = parseSchedule(result.content);
      if (!parsed || parsed.length === 0) {
        setError('Could not generate a study schedule. Please try again with different details.');
        return;
      }
      setSchedule(parsed);
      setIsDemo(result.isDemo);
      setHasResult(true);
      onUpdate((d) => ({
        ...d,
        activities: [
          {
            id: crypto.randomUUID(),
            type: 'exam' as const,
            title: `Study plan: ${subject.slice(0, 40)}`,
            detail: `${parsed.length} sessions`,
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

  const handleReset = () => {
    setSubject('');
    setUnit('');
    setStudyTime('');
    setPriorities('');
    setSchedule([]);
    setHasResult(false);
    setError('');
  };

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Exam Preparation Mode"
        subtitle="Enter your subject details and available time — get a prioritized study schedule."
        icon={<CalendarClock className="w-5 h-5" />}
      />

      {(!hasResult || loading) && (
        <form onSubmit={handleSubmit} className="card p-5 mb-6">
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="exam-subject" className="label-text">Subject</label>
              <input
                id="exam-subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Engineering Mathematics"
                className="input-field"
                disabled={loading}
                required
              />
            </div>
            <div>
              <label htmlFor="exam-unit" className="label-text">Unit / Chapter</label>
              <input
                id="exam-unit"
                type="text"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="e.g. Unit 3: Differential Equations"
                className="input-field"
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label htmlFor="exam-time" className="label-text">Available Study Time</label>
            <input
              id="exam-time"
              type="text"
              value={studyTime}
              onChange={(e) => setStudyTime(e.target.value)}
              placeholder="e.g. 4 days, 3 hours per day"
              className="input-field"
              disabled={loading}
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="exam-priority" className="label-text">
              Topic Priorities <span className="text-navy-300 font-normal">(optional)</span>
            </label>
            <textarea
              id="exam-priority"
              value={priorities}
              onChange={(e) => setPriorities(e.target.value)}
              placeholder="e.g. Focus on first-order ODEs (hard), skip basics (easy)..."
              rows={2}
              className="input-field resize-none"
              disabled={loading}
            />
            <p className="text-xs text-navy-300 mt-1.5">
              Mention which topics are difficult or important so the schedule can prioritize them.
            </p>
          </div>

          <button type="submit" className="btn-primary" disabled={loading || !subject.trim() || !unit.trim() || !studyTime.trim()}>
            <Send className="w-4 h-4" />
            {loading ? 'Creating schedule...' : 'Generate Study Plan'}
          </button>
        </form>
      )}

      {error && <ErrorAlert message={error} />}

      {loading && <LoadingSpinner label="Building your personalized schedule..." />}

      {!loading && !hasResult && !error && (
        <div className="card">
          <EmptyState
            icon={<CalendarClock className="w-7 h-7" />}
            title="No study plan yet"
            description="Fill in your subject, unit, and available time to get a realistic study schedule."
          />
        </div>
      )}

      {hasResult && !loading && schedule.length > 0 && (
        <div className="space-y-4">
          <div className="card p-5">
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-display text-lg font-bold text-navy-50">
                Study Plan: {subject}
              </h2>
              <button onClick={handleReset} className="btn-ghost text-xs">
                <RotateCcw className="w-4 h-4" />
                New Plan
              </button>
            </div>
            <p className="text-sm text-navy-200 mb-4">
              {unit} · {studyTime} · {schedule.length} sessions
            </p>
            <DemoBanner isDemo={isDemo} />
          </div>

          {/* Schedule timeline */}
          <div className="space-y-3">
            {schedule.map((block, i) => (
              <div
                key={i}
                className="card p-4 hover:shadow-card-hover transition-shadow"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-neon-300/10 flex items-center justify-center text-neon-300 flex-shrink-0">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="text-sm font-bold text-navy-50">{block.day}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${priorityColors[block.priority] ?? priorityColors.Medium}`}>
                        <Flag className="w-3 h-3 inline mr-1" />
                        {block.priority}
                      </span>
                    </div>
                    <h3 className="text-sm font-semibold text-navy-100 mb-1">{block.topic}</h3>
                    <div className="flex items-center gap-1.5 text-xs text-navy-300 mb-1">
                      <Clock className="w-3.5 h-3.5" />
                      {block.timeSlot}
                    </div>
                    <p className="text-sm text-navy-200">{block.activity}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <button onClick={handleReset} className="btn-secondary">
              <RotateCcw className="w-4 h-4" />
              Create New Plan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
