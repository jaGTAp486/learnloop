import { useState } from 'react';
import { Users, Send, MessageCircle, UserPlus, Check, ArrowLeft, Hash } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { EmptyState } from '@/components/ui';
import type { AppData, CircleGroup, CirclePost } from '@/types';

type CirclesProps = {
  onUpdate: (updater: (d: AppData) => AppData) => void;
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

export default function LearningCircles({ onUpdate, data }: CirclesProps) {
  const [selectedCircle, setSelectedCircle] = useState<CircleGroup | null>(null);
  const [postContent, setPostContent] = useState('');

  const joinedCircles = data.circles.filter((c) => c.joined);
  const availableCircles = data.circles.filter((c) => !c.joined);

  const joinCircle = (id: string) => {
    onUpdate((d) => ({
      ...d,
      circles: d.circles.map((c) =>
        c.id === id ? { ...c, joined: true, members: c.members + 1 } : c,
      ),
      activities: [
        {
          id: crypto.randomUUID(),
          type: 'circle' as const,
          title: `Joined circle: ${d.circles.find((c) => c.id === id)?.name.slice(0, 50)}`,
          detail: 'Joined',
          timestamp: Date.now(),
        },
        ...d.activities,
      ].slice(0, 50),
    }));
    const circle = data.circles.find((c) => c.id === id);
    if (circle) setSelectedCircle({ ...circle, joined: true });
  };

  const leaveCircle = (id: string) => {
    onUpdate((d) => ({
      ...d,
      circles: d.circles.map((c) =>
        c.id === id ? { ...c, joined: false, members: Math.max(0, c.members - 1) } : c,
      ),
    }));
    setSelectedCircle(null);
  };

  const postQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    const content = postContent.trim();
    if (!content || !selectedCircle) return;
    const post: CirclePost = {
      id: crypto.randomUUID(),
      circleId: selectedCircle.id,
      author: 'You',
      content,
      createdAt: Date.now(),
    };
    onUpdate((d) => ({ ...d, circlePosts: [post, ...d.circlePosts] }));
    setPostContent('');
  };

  const circlePosts = selectedCircle
    ? data.circlePosts.filter((p) => p.circleId === selectedCircle.id)
    : [];

  // ============ Circle Detail View ============
  if (selectedCircle) {
    return (
      <div className="animate-fade-in">
        <button
          onClick={() => setSelectedCircle(null)}
          className="btn-ghost mb-4 text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Circles
        </button>

        <div className="card p-5 mb-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Hash className="w-5 h-5 text-neon-400" />
                <h1 className="font-display text-xl font-bold text-white">{selectedCircle.name}</h1>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20">
                {selectedCircle.category}
              </span>
              <p className="text-sm text-navy-200 mt-3 max-w-lg">{selectedCircle.description}</p>
              <div className="flex items-center gap-2 mt-3 text-sm text-navy-300">
                <Users className="w-4 h-4" />
                {selectedCircle.members} members
              </div>
            </div>
            {selectedCircle.joined && (
              <button onClick={() => leaveCircle(selectedCircle.id)} className="btn-secondary text-sm">
                Leave Circle
              </button>
            )}
          </div>
        </div>

        {/* Posts */}
        <div className="mb-4">
          <h2 className="font-display text-lg font-bold text-white mb-3 flex items-center gap-2">
            <MessageCircle className="w-5 h-5 text-neon-400" />
            Questions & Discussion
          </h2>

          {selectedCircle.joined && (
            <form onSubmit={postQuestion} className="card p-4 mb-4">
              <textarea
                value={postContent}
                onChange={(e) => setPostContent(e.target.value)}
                placeholder="Post a question or start a discussion..."
                rows={3}
                className="input-field resize-none mb-3"
              />
              <button type="submit" className="btn-primary" disabled={!postContent.trim()}>
                <Send className="w-4 h-4" />
                Post Question
              </button>
            </form>
          )}

          {!selectedCircle.joined && (
            <div className="card p-4 mb-4">
              <p className="text-sm text-navy-200 text-center">
                Join this circle to post questions and participate in discussions.
              </p>
              <div className="text-center mt-3">
                <button onClick={() => joinCircle(selectedCircle.id)} className="btn-primary">
                  <UserPlus className="w-4 h-4" />
                  Join Circle
                </button>
              </div>
            </div>
          )}

          {circlePosts.length === 0 ? (
            <div className="card">
              <EmptyState
                icon={<MessageCircle className="w-7 h-7" />}
                title="No questions yet"
                description={selectedCircle.joined ? "Be the first to post a question!" : "Join to start posting."}
              />
            </div>
          ) : (
            <div className="space-y-3">
              {circlePosts.map((post) => (
                <div key={post.id} className="card p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-neon-500/10 flex items-center justify-center text-neon-400 text-sm font-bold flex-shrink-0">
                      {post.author.charAt(0)}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">{post.author}</div>
                      <div className="text-xs text-navy-400">{timeAgo(post.createdAt)}</div>
                    </div>
                  </div>
                  <p className="text-sm text-navy-100 whitespace-pre-wrap">{post.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ============ Circle List View ============
  return (
    <div className="animate-fade-in">
      <PageHeader
        title="Peer Learning Circles"
        subtitle="Join study groups, post questions, and learn together with peers."
        icon={<Users className="w-5 h-5" />}
      />

      {/* Joined circles */}
      {joinedCircles.length > 0 && (
        <div className="mb-6">
          <h2 className="font-display text-lg font-bold text-white mb-3 flex items-center gap-2">
            <Check className="w-5 h-5 text-teal-400" />
            Your Circles
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {joinedCircles.map((c) => (
              <CircleCard key={c.id} circle={c} joined onClick={() => setSelectedCircle(c)} />
            ))}
          </div>
        </div>
      )}

      {/* Available circles */}
      <h2 className="font-display text-lg font-bold text-white mb-3">Discover Circles</h2>
      {availableCircles.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={<Users className="w-7 h-7" />}
            title="You've joined all circles"
            description="Check your circles above to start posting questions."
          />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {availableCircles.map((c) => (
            <CircleCard key={c.id} circle={c} onClick={() => setSelectedCircle(c)} />
          ))}
        </div>
      )}

      {/* Demo notice */}
      <div className="mt-6 rounded-xl bg-navy-800/50 border border-navy-600/30 px-4 py-3 text-sm text-navy-300">
        <strong className="text-navy-100">Demo Notice:</strong> Circle members and groups are sample data. Posts are saved locally — no live collaboration or real-time sync is active.
      </div>
    </div>
  );
}

function CircleCard({
  circle,
  joined,
  onClick,
}: {
  circle: CircleGroup;
  joined?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="card p-5 text-left hover:border-neon-500/30 hover:-translate-y-0.5 transition-all group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <Hash className="w-5 h-5 text-purple-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm group-hover:text-neon-300 transition-colors">{circle.name}</h3>
            <span className="text-xs text-purple-300/70">{circle.category}</span>
          </div>
        </div>
        {joined && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-300 border border-teal-500/20 flex items-center gap-1">
            <Check className="w-3 h-3" /> Joined
          </span>
        )}
      </div>
      <p className="text-sm text-navy-200 mb-3 line-clamp-2">{circle.description}</p>
      <div className="flex items-center gap-1.5 text-xs text-navy-300">
        <Users className="w-3.5 h-3.5" />
        {circle.members} members
      </div>
    </button>
  );
}
