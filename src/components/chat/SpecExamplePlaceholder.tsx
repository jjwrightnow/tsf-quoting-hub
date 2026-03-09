import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface SpecExamplePlaceholderProps {
  fieldName: string;
}

const SpecExamplePlaceholder = ({ fieldName }: SpecExamplePlaceholderProps) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="mt-1">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronDown
          size={12}
          className={`transition-transform duration-200 ${open ? 'rotate-0' : '-rotate-90'}`}
        />
        Show Example
      </button>
      {open && (
        <div className="mt-1.5 flex items-center justify-center rounded-lg border-2 border-dashed border-border bg-secondary/30 text-muted-foreground text-xs"
          style={{ width: '100%', maxWidth: 300, height: 200 }}
        >
          Illustration: {fieldName}
        </div>
      )}
    </div>
  );
};

export default SpecExamplePlaceholder;
