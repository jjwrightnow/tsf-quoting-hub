import { useEffect, useState } from 'react';
import { getQuotePortal, requestRevision } from '@/lib/supabase-functions';
import { markQuoteSeen } from '@/lib/unread';
import AssistantBubble from '@/components/chat/AssistantBubble';
import UserBubble from '@/components/chat/UserBubble';
import TypingIndicator from '@/components/chat/TypingIndicator';

interface QuoteDetailProps {
  quoteId: string;
}

interface QuoteData {
  id: string;
  project_name: string | null;
  status: string | null;
  final_price: number | null;
  lead_time: string | null;
  customer_notes: string | null;
  pdf_url: string | null;
  profile_type: string | null;
  illumination_style: string | null;
  material: string | null;
  finish: string | null;
  letter_height_in: number | null;
  quantity: number | null;
  quote_display_id: string | null;
}

const QuoteDetail = ({ quoteId }: QuoteDetailProps) => {
  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [revisionText, setRevisionText] = useState('');
  const [revisionMessages, setRevisionMessages] = useState<string[]>([]);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    setLoading(true);
    getQuotePortal({ action: 'detail', quoteId })
      .then((data) => {
        if (data?.quote) {
          setQuote(data.quote);
          markQuoteSeen(quoteId);
        }
      })
      .catch((err) => { console.error('[QuoteDetail] fetch error:', err); })
      .finally(() => setLoading(false));
  }, [quoteId]);

  const handleRevision = async () => {
    if (!revisionText.trim()) return;
    setSending(true);
    try {
      await requestRevision({ quoteId, message: revisionText });
      setRevisionMessages((prev) => [...prev, revisionText]);
      setRevisionText('');
    } catch (err) { console.error('[QuoteDetail] revision error:', err); }
    setSending(false);
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <TypingIndicator />
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-sm text-muted-foreground">Quote not found.</p>
      </div>
    );
  }

  const isQuoted = quote.status === 'Sent' || quote.status === 'Quoted' || quote.status === 'Approved';

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex-1 overflow-y-auto px-4 py-6 md:px-8">
        <div className="mx-auto max-w-2xl space-y-1">
          {/* Original submission summary */}
          <AssistantBubble content={`Quote ${quote.quote_display_id || quote.id} -- ${quote.project_name || 'Untitled'}`}>
            <div className="rounded-lg border border-border bg-secondary p-4 text-sm space-y-2 mt-2">
              {quote.profile_type && <DetailRow label="Profile" value={quote.profile_type} />}
              {quote.illumination_style && <DetailRow label="Illumination" value={quote.illumination_style} />}
              {quote.material && <DetailRow label="Material" value={quote.material} />}
              {quote.finish && <DetailRow label="Finish" value={quote.finish} />}
              {quote.letter_height_in && <DetailRow label="Height" value={`${quote.letter_height_in}"`} />}
              {quote.quantity && <DetailRow label="Quantity" value={String(quote.quantity)} />}
            </div>
          </AssistantBubble>

          {/* Status-specific content */}
          {isQuoted ? (
            <AssistantBubble content="Your quote is ready.">
              <div className="rounded-lg border border-border bg-secondary p-4 text-sm space-y-3 mt-2">
                {quote.final_price && (
                  <div className="text-lg font-bold text-foreground">
                    ${quote.final_price.toLocaleString()}
                  </div>
                )}
                {quote.lead_time && <DetailRow label="Lead Time" value={quote.lead_time} />}
                {quote.customer_notes && (
                  <p className="text-muted-foreground">{quote.customer_notes}</p>
                )}
                {quote.pdf_url && (
                  <a
                    href={quote.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block rounded-lg px-4 py-2 text-sm font-medium gradient-pink-blue text-foreground transition-all duration-300 hover:opacity-90"
                  >
                    Download Official Quote PDF
                  </a>
                )}
              </div>
            </AssistantBubble>
          ) : (
            <AssistantBubble content="Your quote is being reviewed by our production team. We'll notify you when it's ready." />
          )}

          {/* Revision messages */}
          {revisionMessages.map((msg, i) => (
            <UserBubble key={i} content={msg} />
          ))}
        </div>
      </div>

      {/* Revision input */}
      <div className="border-t border-border bg-card px-4 py-3 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]">
        <div className="mx-auto max-w-2xl flex gap-2">
          <input
            type="text"
            value={revisionText}
            onChange={(e) => setRevisionText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRevision()}
            placeholder="Request a revision..."
            className="flex-1 rounded-lg border border-border bg-transparent px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
          <button
            onClick={handleRevision}
            disabled={!revisionText.trim() || sending}
            className="rounded-lg px-4 py-2.5 gradient-pink-blue text-foreground text-sm font-medium transition-all duration-300 disabled:opacity-30"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between">
    <span className="text-muted-foreground">{label}</span>
    <span className="text-foreground">{value}</span>
  </div>
);

export default QuoteDetail;
