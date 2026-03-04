import { useSignStore } from '@/stores/signStore';

interface AssistantBubbleProps {
  content: string;
  children?: React.ReactNode;
}

const ContextBadge = () => {
  const sessionId = useSignStore((s) => s.sessionId);
  const signs = useSignStore((s) => s.signs);
  const currentSignIndex = useSignStore((s) => s.currentSignIndex);
  const chatPhase = useSignStore((s) => s.chatPhase);
  const uploadedFiles = useSignStore((s) => s.uploadedFiles);
  const pendingSignName = useSignStore((s) => s.pendingSignName);

  let label = 'LM';

  // During spec editing, show current sign name
  if ((chatPhase === 'spec_signs' || chatPhase === 'pick_profile') && pendingSignName) {
    label = pendingSignName.length > 4 ? pendingSignName.slice(0, 4) : pendingSignName;
  } else if (chatPhase === 'spec_signs' && signs[currentSignIndex]) {
    const name = signs[currentSignIndex].sign_name;
    label = name.length > 4 ? name.slice(0, 4) : name;
  } else if (sessionId && uploadedFiles.length > 0) {
    // Show first filename truncated
    const fname = uploadedFiles[0].name.replace(/\.[^.]+$/, '');
    label = fname.length > 4 ? fname.slice(0, 4) : fname;
  }

  return (
    <div className="flex h-8 w-8 items-center justify-center rounded-full gradient-pink-blue flex-shrink-0 mt-1">
      <span className="text-[10px] font-bold text-foreground leading-none tracking-tight">
        {label}
      </span>
    </div>
  );
};

const AssistantBubble = ({ content, children }: AssistantBubbleProps) => (
  <div className="flex gap-3 py-3">
    <ContextBadge />
    <div className="min-w-0 flex-1">
      {content && (
        <div className="rounded-lg border-l-[3px] border-primary bg-tsf-bubble-assistant px-5 py-4">
          <p className="text-sm text-foreground leading-relaxed">{content}</p>
        </div>
      )}
      {children && <div className={content ? 'mt-4' : ''}>{children}</div>}
    </div>
  </div>
);

export default AssistantBubble;
