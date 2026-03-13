import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

/* ── FAQ data ─────────────────────────────────────────── */
const FAQ: { q: string; a: string }[] = [
  { q: 'What is SignMaker.ai?', a: 'SignMaker.ai is a wholesale quoting platform for verified sign companies. Upload artwork, spec out your sign, and receive a manufacturer quote — all through a guided chat experience.' },
  { q: 'Who can sign up?', a: 'Access is limited to verified sign companies. When you enter your work email we check your domain against our approved list. If your company isn\'t listed yet, you can request access on the login page.' },
  { q: 'How do I get a quote?', a: 'Once logged in, start a new project, upload your artwork, and our guided wizard will walk you through sign specs (profile, material, finish, illumination, etc.). A quote is generated and sent to your dashboard.' },
  { q: 'What sign types do you support?', a: 'We support channel letters (front lit, back lit, halo lit), cabinet signs, flat cut letters, open-face neon, and more. Each type has its own spec wizard.' },
  { q: 'How long does quoting take?', a: 'Most quotes are returned within 24 hours. Complex multi-sign projects may take a bit longer.' },
  { q: 'Is there a cost to use the platform?', a: 'No — SignMaker.ai is free for verified sign companies. You only pay when you approve a quote and place an order.' },
];

type Msg = { role: 'bot' | 'user'; text: string };

const GREETING: Msg = { role: 'bot', text: 'Hi! I can answer common questions about SignMaker.ai. Pick a topic below or type your own question.' };

/* ── Component ────────────────────────────────────────── */
const LoginChatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [typing, setTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const pushBotReply = (text: string) => {
    setTyping(true);
    setTimeout(() => {
      setMessages((prev) => [...prev, { role: 'bot', text }]);
      setTyping(false);
    }, 600);
  };

  const handleFaqClick = (faq: (typeof FAQ)[number]) => {
    setMessages((prev) => [...prev, { role: 'user', text: faq.q }]);
    pushBotReply(faq.a);
  };

  const handleFreeText = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setMessages((prev) => [...prev, { role: 'user', text: trimmed }]);

    // Simple keyword match
    const lower = trimmed.toLowerCase();
    const match = FAQ.find(
      (f) =>
        f.q.toLowerCase().includes(lower) ||
        lower.includes(f.q.toLowerCase().replace('?', '').split(' ').slice(-2).join(' '))
    );
    if (match) {
      pushBotReply(match.a);
    } else {
      pushBotReply(
        'I don\'t have a specific answer for that yet. For detailed help, email jj@thesignagefactory.co or request access and explore the platform!'
      );
    }
  };

  return (
    <>
      {/* Floating trigger */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-5 right-5 z-50 flex h-12 w-12 items-center justify-center rounded-full gradient-pink-blue shadow-lg transition-transform hover:scale-105 active:scale-95"
          aria-label="Open FAQ chat"
        >
          <MessageCircle className="h-5 w-5 text-foreground" />
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-5 right-5 z-50 flex w-80 flex-col overflow-hidden rounded-xl border border-border bg-card shadow-[0_8px_40px_rgba(0,0,0,0.5)] animate-fade-in-up">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full gradient-pink-blue">
                <div className="h-2.5 w-2.5 rounded-sm bg-primary-foreground/90" />
              </div>
              <span className="text-sm font-semibold text-foreground">SignMaker.ai</span>
            </div>
            <button onClick={() => setOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors" aria-label="Close chat">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3" style={{ maxHeight: 340 }}>
            {messages.map((msg, i) => (
              <div key={i} className={cn('flex', msg.role === 'user' ? 'justify-end' : 'justify-start')}>
                <div
                  className={cn(
                    'max-w-[85%] rounded-lg px-3 py-2 text-xs leading-relaxed',
                    msg.role === 'bot'
                      ? 'bg-secondary text-foreground rounded-tl-sm'
                      : 'bg-tsf-bubble-user text-foreground rounded-tr-sm'
                  )}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {typing && (
              <div className="flex justify-start">
                <div className="flex items-center gap-1 rounded-lg rounded-tl-sm bg-secondary px-3 py-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent typing-dot" style={{ animationDelay: '0s' }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-accent typing-dot" style={{ animationDelay: '0.2s' }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-accent typing-dot" style={{ animationDelay: '0.4s' }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick-pick FAQ chips */}
          {messages.length <= 2 && (
            <div className="flex flex-wrap gap-1.5 border-t border-border px-4 py-2.5">
              {FAQ.map((faq, i) => (
                <button
                  key={i}
                  onClick={() => handleFaqClick(faq)}
                  className="rounded-full border border-border bg-secondary px-2.5 py-1 text-[10px] text-muted-foreground hover:text-foreground hover:border-primary transition-colors"
                >
                  {faq.q}
                </button>
              ))}
            </div>
          )

          {/* Input */}
          <ChatInput onSend={handleFreeText} disabled={typing} />
        </div>
      )}
    </>
  );
};

/* ── Sub-component: input bar ────────────────────────── */
const ChatInput = ({ onSend, disabled }: { onSend: (t: string) => void; disabled: boolean }) => {
  const [value, setValue] = useState('');

  const submit = () => {
    if (!value.trim() || disabled) return;
    onSend(value);
    setValue('');
  };

  return (
    <div className="flex items-center gap-2 border-t border-border px-3 py-2.5">
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
        placeholder="Ask a question…"
        disabled={disabled}
        className="flex-1 bg-transparent text-xs text-foreground placeholder:text-muted-foreground outline-none"
      />
      <button onClick={submit} disabled={disabled || !value.trim()} className="text-primary disabled:opacity-30 transition-opacity" aria-label="Send">
        <Send className="h-4 w-4" />
      </button>
    </div>
  );
};

export default LoginChatbot;
