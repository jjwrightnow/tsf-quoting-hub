import { ReviewFlag } from '@/stores/reviewStore';
import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface FlagCardProps {
  flag: ReviewFlag;
  onDelete: () => void;
}

const typeBadge = (type: string) => {
  switch (type) {
    case 'spec_change':
      return <Badge className="bg-primary/20 text-primary border-primary/30">Spec Change</Badge>;
    case 'warning':
      return <Badge className="bg-[hsl(var(--tsf-status-review))]/20 text-[hsl(var(--tsf-status-review))] border-[hsl(var(--tsf-status-review))]/30">Warning</Badge>;
    default:
      return <Badge variant="secondary">Note</Badge>;
  }
};

const FlagCard = ({ flag, onDelete }: FlagCardProps) => {
  return (
    <div className="group relative rounded-md border border-border bg-card p-3 animate-fade-in-up">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-sm font-medium text-foreground">{flag.issue_description}</p>
          {flag.sign_page_ref && (
            <p className="text-xs text-muted-foreground">{flag.sign_page_ref}</p>
          )}
          <div className="flex items-center gap-2">
            {typeBadge(flag.flag_type)}
            {flag.spec_field && flag.customer_value && flag.recommended_value && (
              <span className="text-xs text-muted-foreground">
                {flag.spec_field}: {flag.customer_value} → {flag.recommended_value}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={onDelete}
          className="shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default FlagCard;
