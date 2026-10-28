import { useState } from 'react';
import { Rocket, Plus, CheckCircle2, Circle, Trash2, Pencil, X, Target } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { EmptyState } from '@/components/ui';
import type { AppData, Mission } from '@/types';

type MissionsProps = {
  onUpdate: (updater: (d: AppData) => AppData) => void;
  data: AppData;
};

const difficultyColors: Record<Mission['difficulty'], string> = {
  Beginner: 'bg-teal-500/10 text-teal-300 border-teal-500/30',
  Intermediate: 'bg-neon-500/10 text-neon-300 border-neon-500/30',
  Advanced: 'bg-purple-500/10 text-purple-300 border-purple-500/30',
};

export default function MissionsEngine({ onUpdate, data }: MissionsProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [difficulty, setDifficulty] = useState<Mission['difficulty']>('Beginner');

  const resetForm = () => {
    setTitle('');
    setSubject('');
    setDescription('');
    setDifficulty('Beginner');
    setEditingId(null);
    setShowForm(false);
  };

  const startEdit = (m: Mission) => {
    setEditingId(m.id);
    setTitle(m.title);
    setSubject(m.subject);
    setDescription(m.description);
    setDifficulty(m.difficulty);
    setShowForm(true);
  };

  const saveMission = (e: React.FormEvent) => {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;

    if (editingId) {
      onUpdate((d) => ({
        ...d,
        missions: d.missions.map((m) =>
          m.id === editingId
            ? { ...m, title: t, subject: subject.trim(), description: description.trim(), difficulty }
            : m,
        ),
      }));
    } else {
      const mission: Mission = {
        id: crypto.randomUUID(),
        title: t,
        subject: subject.trim(),
        description: description.trim(),
        difficulty,
        status: 'active',
        createdAt: Date.now(),
        completedAt: null,
      };
      onUpdate((d) => ({
        ...d,
        missions: [mission, ...d.missions],
        activities: [
          {
            id: crypto.randomUUID(),
            type: 'mission' as const,
            title: `Mission created: ${t.slice(0, 50)}`,
            detail: difficulty,
            timestamp: Date.now(),
          },
          ...d.activities,
        ].slice(0, 50),
      }));
    }
    resetForm();
  };

  const toggleComplete = (id: string) => {
    onUpdate((d) => ({
      ...d,
      missions: d.missions.map((m) =>
        m.id === id
          ? {
              ...m,
              status: m.status === 'active' ? 'completed' : 'active',
              completedAt: m.status === 'active' ? Date.now() : null,
            }
          : m,
      ),
      activities: d.missions.find((m) => m.id === id && m.status === 'active')
        ? [
            {
              id: crypto.randomUUID(),
              type: 'mission' as const,
              title: `Mission completed: ${d.missions.find((m) => m.id === id)?.title.slice(0, 50)}`,
              detail: 'Completed',
              timestamp: Date.now(),
            },
            ...d.activities,
          ].slice(0, 50)
        : d.activities,
    }));
  };

  const deleteMission = (id: string) => {
    onUpdate((d) => ({ ...d, missions: d.missions.filter((m) => m.id !== id) }));
  };

  const active = data.missions.filter((m) => m.status === 'active');
  const completed = data.missions.filter((m) => m.status === 'completed');

  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Topic Mission Engine"
        subtitle="Break subjects into achievable missions. Create, edit, complete, and delete them."
        icon={<Rocket className="w-5 h-5" />}
      />

      <div className="flex items-center gap-3 mb-6">
        {!showForm && (
          <button onClick={() => setShowForm(true)} className="btn-primary">
            <Plus className="w-4 h-4" />
            New Mission
          </button>
        )}
        <div className="flex gap-4 text-sm text-navy-300">
          <span className="flex items-center gap-1.5"><Target className="w-4 h-4 text-neon-400" /> {active.length} active</span>
          <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-teal-400" /> {completed.length} completed</span>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={saveMission} className="card p-5 mb-6 animate-slide-up">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-white">{editingId ? 'Edit Mission' : 'Create Mission'}</h3>
            <button type="button" onClick={resetForm} className="btn-ghost p-2">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="label-text">Mission Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Master Kirchhoff's Laws"
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="label-text">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Circuit Analysis"
                className="input-field"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="label-text">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What will this mission cover? What's the goal?"
              rows={2}
              className="input-field resize-none"
            />
          </div>

          <div className="mb-4">
            <label className="label-text">Difficulty</label>
            <div className="flex gap-2">
              {(['Beginner', 'Intermediate', 'Advanced'] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDifficulty(d)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                    difficulty === d
                      ? difficultyColors[d]
                      : 'bg-navy-800 text-navy-300 border-navy-600/40 hover:border-navy-500'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={!title.trim()}>
            {editingId ? 'Save Changes' : 'Create Mission'}
          </button>
        </form>
      )}

      {/* Active missions */}
      {active.length > 0 && (
        <div className="mb-6">
          <h2 className="font-display text-lg font-bold text-white mb-3">Active Missions</h2>
          <div className="space-y-3">
            {active.map((m) => (
              <div key={m.id} className="card p-4 group hover:border-neon-500/30 transition-all">
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleComplete(m.id)}
                    className="mt-0.5 flex-shrink-0"
                    title="Mark as completed"
                  >
                    <Circle className="w-5 h-5 text-navy-300 hover:text-neon-400 transition-colors" />
                  </button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-semibold text-white text-sm">{m.title}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${difficultyColors[m.difficulty]}`}>
                        {m.difficulty}
                      </span>
                    </div>
                    {m.subject && <p className="text-xs text-neon-300/70 mb-1">{m.subject}</p>}
                    {m.description && <p className="text-sm text-navy-200">{m.description}</p>}
                  </div>
                  <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => startEdit(m)} className="p-2 rounded-lg hover:bg-navy-700 text-navy-300 hover:text-neon-300">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => deleteMission(m.id)} className="p-2 rounded-lg hover:bg-navy-700 text-navy-300 hover:text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed missions */}
      {completed.length > 0 && (
        <div>
          <h2 className="font-display text-lg font-bold text-white mb-3">Completed</h2>
          <div className="space-y-3">
            {completed.map((m) => (
              <div key={m.id} className="card p-4 group opacity-70">
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => toggleComplete(m.id)}
                    className="mt-0.5 flex-shrink-0"
                    title="Mark as active"
                  >
                    <CheckCircle2 className="w-5 h-5 text-teal-400" />
                  </button>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-navy-200 text-sm line-through">{m.title}</h3>
                    {m.subject && <p className="text-xs text-navy-400">{m.subject}</p>}
                  </div>
                  <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => deleteMission(m.id)} className="p-2 rounded-lg hover:bg-navy-700 text-navy-300 hover:text-red-400">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.missions.length === 0 && !showForm && (
        <div className="card">
          <EmptyState
            icon={<Rocket className="w-7 h-7" />}
            title="No missions yet"
            description="Create your first study mission to break a subject into achievable goals."
          />
        </div>
      )}
    </div>
  );
}
