import React, { useState, useEffect, useRef } from 'react';
import { Send, X, MessageCircle, Paperclip, Loader2, FileCheck, FileCode, ImageIcon, CornerDownLeft } from 'lucide-react';
import { useShellStore } from '@/stores/shellStore';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface LetterManChatProps {
  mode: 'embedded' | 'overlay';
  onClose?: () => void;
}

export const LetterManChat: React.FC<LetterManChatProps> = ({ mode, onClose }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [systemPrompt, setSystemPrompt] = useState('');
  const [cannedQuestions, setCannedQuestions] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const store = useShellStore() as any;
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isEmbedded = mode === 'embedded';

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const { data } = await supabase
          .from('operator_config')
          .select('context_instruction, chatbot_name, canned_questions')
          .single();
        if (data) {
          setSystemPrompt(data.context_instruction || '');
          setCannedQuestions(Array.isArray(data.canned_questions) ? data.canned_questions : []);
        }
      } catch (err) {
        console.error('LetterManChat config fetch error:', err);
        setSystemPrompt('You are a helpful AI assistant for a sign shop.');
      }
    };
    fetchConfig();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const getFileIcon = (file: File | null) => {
    if (!file) return null;
    if (file.type.startsWith('image/')) return <ImageIcon className="w-4 h-4 text-muted-foreground" />;
    if (file.name.endsWith('.ai') || file.name.endsWith('.eps') || file.type.includes('svg')) return <FileCode className="w-4 h-4 text-primary" />;
    return <FileCheck className="w-4 h-4 text-muted-foreground" />;
  };

  const onFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const allowedTypes = ['image/jpeg', 'image/png', 'image/svg+xml', 'application/pdf', 'application/postscript', 'application/vnd.adobe.illustrator'];
    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.ai') && !file.name.endsWith('.eps')) {
      toast.error('Invalid file type. Please upload a JPEG, PNG, SVG, AI, EPS, or PDF.');
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      toast.error('File is too large. Maximum size is 25MB.');
      return;
    }
    setSelectedFile(file);
  };

  const handleSend = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText && !selectedFile) return;

    const userMessage: any = {
      id: Date.now(),
      role: 'user',
      content: messageText || `Uploaded file: ${selectedFile?.name}`,
      created_at: new Date().toISOString(),
      metadata: {}
    };

    if (selectedFile) {
      setIsUploading(true);
      const sessionId = localStorage.getItem('chat_session_id') || 'guest_session';
      const fileName = `${Date.now()}_${selectedFile.name.replace(/\s+/g, '_')}`;
      const filePath = `${sessionId}/${fileName}`;
      try {
        const { data, error } = await supabase.storage
          .from('chat_attachments')
          .upload(filePath, selectedFile);
        if (error) throw error;
        const { data: { publicUrl } } = supabase.storage
          .from('chat_attachments')
          .getPublicUrl(filePath);
        userMessage.metadata = {
          file_url: publicUrl,
          file_name: selectedFile.name,
          file_type: selectedFile.name.split('.').pop(),
          storage_path: data.path
        };
        toast.success('File uploaded successfully.');
      } catch (error: any) {
        toast.error(`Upload failed: ${error.message}`);
        userMessage.content += ' (file upload failed)';
      } finally {
        setIsUploading(false);
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    }

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const fileContext = userMessage.metadata?.file_url
        ? `\n\nThe user has uploaded a file: ${userMessage.metadata.file_name} (${userMessage.metadata.file_type}). URL: ${userMessage.metadata.file_url}. If it appears to be a raster format (jpg/png), mention that vector art (.AI, .EPS, .SVG) is required for fabrication and offer the Vector Redraw service.`
        : '';

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': 'true',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-5',
          max_tokens: 1000,
          system: systemPrompt + fileContext,
          messages: updatedMessages.map((m: any) => ({ role: m.role, content: m.content })),
        }),
      });
      const data = await response.json();
      const assistantContent = data?.content?.[0]?.text || 'Sorry, I could not process that.';
      setMessages(prev => [...prev, { id: Date.now(), role: 'assistant', content: assistantContent }]);

      const sessionId = localStorage.getItem('chat_session_id');
      if (sessionId) {
        await supabase.from('chat_messages').insert([
          { session_id: sessionId, role: 'user', content: userMessage.content },
          { session_id: sessionId, role: 'assistant', content: assistantContent },
        ]);
      }
    } catch {
      setMessages(prev => [...prev, { id: Date.now(), role: 'assistant', content: 'Connection error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex flex-col h-full bg-secondary ${!isEmbedded ? 'rounded-t-2xl' : ''}`}>
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <div className="flex flex-col gap-2 pt-4">
            <div className="text-center py-6 opacity-40">
              <MessageCircle className="w-8 h-8 mx-auto mb-2 text-foreground" />
              <p className="text-[10px] uppercase tracking-widest font-semibold text-foreground">Ask about materials, lighting, or upload artwork</p>
            </div>
            {cannedQuestions.map((q: any, i: number) => {
              const questionText = typeof q === 'string' ? q : (q?.label || q?.value || '');
              return (
                <button
                  key={i}
                  onClick={() => handleSend(questionText)}
                  className="text-left text-xs text-muted-foreground border border-border rounded-lg px-3 py-2 hover:border-ring/40 hover:text-foreground transition-colors bg-card"
                >
                  {questionText}
                </button>
              );
            })}
          </div>
        )}
        {messages.map((msg: any) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'bg-primary text-primary-foreground rounded-br-sm'
                : 'bg-card border border-border text-foreground rounded-bl-sm'
            }`}>
              {msg.content}
              {msg.metadata?.file_url && (
                <div
                  className="mt-2 p-2 bg-muted rounded border border-border flex items-center gap-2 cursor-pointer"
                  onClick={() => window.open(msg.metadata.file_url, '_blank')}
                >
                  {msg.metadata.file_type === 'jpg' || msg.metadata.file_type === 'png'
                    ? <ImageIcon size={14} className="text-muted-foreground" />
                    : <FileCode size={14} className="text-primary" />
                  }
                  <div className="overflow-hidden">
                    <p className="text-[10px] font-mono text-foreground/70 truncate">{msg.metadata.file_name}</p>
                    <p className="text-[9px] text-muted-foreground uppercase font-bold">{msg.metadata.file_type}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-card border border-border rounded-2xl rounded-bl-sm px-4 py-2">
              <div className="flex gap-1 items-center h-4">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-3 border-t border-border bg-card relative">
        <input
          type="file"
          ref={fileInputRef}
          onChange={onFileSelect}
          accept=".ai,.eps,.svg,.jpg,.jpeg,.png,.pdf"
          className="hidden"
        />
        {selectedFile && (
          <div className="absolute bottom-[calc(100%+1px)] left-0 right-0 p-3 bg-card border-t border-border flex items-center gap-3">
            <div className="p-2 bg-muted rounded border border-border flex items-center gap-2 flex-1">
              {isUploading ? <Loader2 className="w-4 h-4 animate-spin text-primary" /> : getFileIcon(selectedFile)}
              <div className="flex-1 overflow-hidden">
                <p className="text-xs text-foreground truncate font-medium">{selectedFile.name}</p>
                <p className="text-[9px] text-muted-foreground uppercase font-bold">
                  {isUploading ? 'Uploading...' : `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB — Ready to send`}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setSelectedFile(null)} disabled={isUploading} className="h-8 w-8">
              <X size={16} />
            </Button>
          </div>
        )}
        <div className="flex items-center gap-2 bg-background rounded-xl px-3 py-2 border border-input focus-within:border-ring transition-colors">
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="text-muted-foreground hover:text-primary transition-colors p-1 disabled:opacity-30"
          >
            <Paperclip size={16} />
          </button>
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && !isUploading && handleSend()}
            placeholder={isUploading ? 'Uploading...' : 'Ask a technical question or attach artwork...'}
            disabled={isUploading}
            className="flex-1 bg-transparent border-none text-sm text-foreground focus:ring-0 focus:outline-none placeholder:text-muted-foreground/50"
          />
          <button
            onClick={() => handleSend()}
            disabled={isUploading || (!input.trim() && !selectedFile)}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary text-primary-foreground disabled:opacity-30 hover:bg-primary/90 transition-colors"
          >
            {isUploading ? <Loader2 size={14} className="animate-spin" /> : <CornerDownLeft size={14} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LetterManChat;
