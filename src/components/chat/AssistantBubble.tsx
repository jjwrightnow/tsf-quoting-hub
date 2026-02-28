interface AssistantBubbleProps {
  content: string;
  children?: React.ReactNode;
}

const AssistantBubble = ({ content, children }: AssistantBubbleProps) => (
  <div className="flex gap-3 py-3">
    <div className="flex-shrink-0 mt-1">
      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary">
        <div className="h-2.5 w-2.5 rounded-sm bg-primary-foreground/90" />
      </div>
    </div>
    <div className="min-w-0 flex-1">
      <div className="rounded-lg border-l-[3px] border-primary bg-tsf-bubble-assistant px-4 py-3">
        <p className="text-sm text-foreground leading-relaxed">{content}</p>
      </div>
      {children && <div className="mt-3">{children}</div>}
    </div>
  </div>
);

export default AssistantBubble;
