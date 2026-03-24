import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle, ChevronDown } from 'lucide-react';
import { useShellStore } from '@/stores/shellStore';
import { supabase } from '@/integrations/supabase/client';

interface LetterManChatProps {
  mode: 'embedded' | 'overlay';
  onClose?: () => void;
}

export const LetterManChat: React.FC<LetterManChatProps> = ({ mode, onClose }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState('');
  const [cannedQuestions, setCannedQuestions] = useState<string[]>([]);
  const store = useShellStore() as any;
  const scrollRef = useRef<HTMLDivElement>(null);
  const isEmbedded = mode === 'embedded';

  useEffect(() => {
    const fetchConfig = async () => {
      const { data } = await supabase
        .from('operator_config')
        .select('context_instruction, chatbot_name, canned_questions')
        .single();
      if (data) {
        setSystemPrompt(data.context_instruction || '');
        setCannedQuestions(data.canned_questions || []);
      }
    };
    fetchConfig();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText) return;

    const userMessage = { role: 'user' as const, content: messageText };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-5',
          max_tokens: 1000,
          system: systemPrompt,
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await response.json();
      const assistantContent = data?.content?.[0]?.text || 'Sorry I could not process that.';
      setMessages(prev => [...prev, { role: 'assistant', content: assistantContent }]);

      const sessionId = localStorage.getItem('chat_session_id');
      if (sessionId) {
        await supabase.from('chat_messages').insert([
          { session_id: sessionId, role: 'user', content: messageText },
          { session_id: sessionId, role: 'assistant', content: assistantContent },
        ]);
      }
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Connection error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex flex-col h-full bg-[#111120] ${!isEmbedded ? 'rounded-t-2xl' : ''}`}>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="flex flex-col gap-2 pt-4">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground text-center mb-2">
              Ask me anything about our products
            </p>
            {cannedQuestions.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSend(q)}
                className="text-left text-xs text-muted-foreground border border-[#1e1e35] rounded-lg px-3 py-2 hover:border-blue-500/40 hover:text-foreground transition-colors bg-[#0d0d1a]"
              >
                {q}
              </button>
            ))}
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'bg-blue-600 text-white rounded-br-sm'
                : 'bg-[#1a1a2e] border border-[#1e1e35] text-foreground rounded-bl-sm'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-[#1a1a2e] border border-[#1e1e35] rounded-2xl rounded-bl-sm px-4 py-2">
              <div className="flex gap-1 items-center h-4">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-3 border-t border-[#1e1e35] bg-[#0d0d1a]">
        <div className="flex items-center gap-2 bg-[#1a1a2e] rounded-xl px-3 py-2 border border-[#1e1e35] focus-within:border-blue-500/50 transition-colors">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Ask a technical question..."
            className="flex-1 bg-transparent border-none text-sm text-white focus:ring-0 focus:outline-none placeholder:text-muted-foreground/50"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className="text-blue-500 hover:text-blue-400 disabled:opacity-30 p-1 transition-colors"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LetterManChat;
