import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, RotateCcw, User, Bot } from 'lucide-react';
import PageHeader from '@/components/PageHeader';
import { LoadingSpinner, DemoBanner, ErrorAlert } from '@/components/ui';
import { chatAssistant } from '@/lib/ai';
import { renderMarkdown } from '@/lib/markdown';
import type { AppData, ChatMessage } from '@/types';

type ChatProps = {
  onUpdate: (updater: (d: AppData) => AppData) => void;
};

const initialMessage: ChatMessage = {
  role: 'assistant',
  content:
    "Hi! I'm your AI StudyMate tutor. Ask me about any concept — engineering maths, programming, electronics, physics, and more. What would you like to understand today?",
  timestamp: Date.now(),
};

export default function ChatAssistant({ onUpdate }: ChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([initialMessage]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDemo, setIsDemo] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const msg = input.trim();
    if (!msg || loading) return;

    const userMsg: ChatMessage = {
      role: 'user',
      content: msg,
      timestamp: Date.now(),
    };
    const history = [...messages, userMsg];
    setMessages(history);
    setInput('');
    setLoading(true);
    setError('');

    try {
      const result = await chatAssistant(
        msg,
        history.map((m) => ({ role: m.role, content: m.content })),
      );
      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: result.content || 'No response received.',
        isDemo: result.isDemo,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      if (result.isDemo) setIsDemo(true);
      onUpdate((d) => ({
        ...d,
        activities: [
          {
            id: crypto.randomUUID(),
            type: 'chat' as const,
            title: msg.slice(0, 60),
            detail: result.isDemo ? 'Demo chat' : 'AI chat',
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
    setMessages([{ ...initialMessage, timestamp: Date.now() }]);
    setError('');
    setIsDemo(false);
  };

  const suggestions = [
    'Explain recursion simply',
    'What is a pointer in C?',
    'How does a half-adder work?',
    'Explain Big O notation',
  ];

  return (
    <div className="animate-fade-in flex flex-col h-[calc(100vh-7rem)] lg:h-[calc(100vh-9rem)]">
      <PageHeader
        title="AI Chat Assistant"
        subtitle="Have a conversation about any academic topic. Ask follow-up questions anytime."
        icon={<MessageSquare className="w-5 h-5" />}
      />

      <div className="card flex flex-col flex-1 min-h-0 overflow-hidden">
        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
            >
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  msg.role === 'user'
                    ? 'bg-navy-700 text-navy-100'
                    : 'bg-neon-400 text-navy-950'
                }`}
              >
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div
                className={`rounded-2xl px-4 py-3 max-w-[80%] ${
                  msg.role === 'user'
                    ? 'bg-neon-400 text-navy-950'
                    : 'bg-navy-900 text-navy-50'
                }`}
              >
                {msg.role === 'assistant' ? (
                  <div
                    className="prose-studymate max-w-none text-sm"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(msg.content) }}
                  />
                ) : (
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-lg bg-neon-400 text-navy-950 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-navy-900 rounded-2xl px-4 py-3">
                <LoadingSpinner label="Typing..." />
              </div>
            </div>
          )}
        </div>

        {/* Suggestions */}
        {messages.length <= 1 && !loading && (
          <div className="px-4 sm:px-5 pb-3">
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => setInput(s)}
                  className="text-xs px-3 py-1.5 rounded-lg bg-neon-300/10 text-neon-300 hover:bg-neon-300/15 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="px-4 sm:px-5 pb-3">
            <ErrorAlert message={error} />
          </div>
        )}

        {/* Demo banner */}
        {isDemo && (
          <div className="px-4 sm:px-5 pb-3">
            <DemoBanner isDemo={isDemo} />
          </div>
        )}

        {/* Input */}
        <form
          onSubmit={handleSend}
          className="border-t border-navy-600/50 p-3 sm:p-4 flex items-end gap-2 flex-shrink-0"
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
            placeholder="Type your question..."
            rows={1}
            className="input-field resize-none flex-1 max-h-24"
            disabled={loading}
          />
          <button
            type="submit"
            className="btn-primary px-3 flex-shrink-0"
            disabled={loading || !input.trim()}
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="btn-ghost px-3 flex-shrink-0"
            aria-label="Clear chat"
            title="Clear conversation"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
