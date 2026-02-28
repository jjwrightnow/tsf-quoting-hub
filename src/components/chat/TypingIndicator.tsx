const TypingIndicator = () => (
  <div className="flex gap-3 py-3">
    <div className="flex-shrink-0 mt-1">
      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary">
        <div className="h-2.5 w-2.5 rounded-sm bg-primary-foreground/90" />
      </div>
    </div>
    <div className="rounded-lg border-l-[3px] border-primary bg-tsf-bubble-assistant px-4 py-3">
      <div className="flex items-center gap-1">
        <span className="h-2 w-2 rounded-full bg-accent typing-dot" style={{ animationDelay: '0s' }} />
        <span className="h-2 w-2 rounded-full bg-accent typing-dot" style={{ animationDelay: '0.2s' }} />
        <span className="h-2 w-2 rounded-full bg-accent typing-dot" style={{ animationDelay: '0.4s' }} />
      </div>
    </div>
  </div>
);

export default TypingIndicator;
