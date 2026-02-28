interface UserBubbleProps {
  content: string;
}

const UserBubble = ({ content }: UserBubbleProps) => (
  <div className="flex justify-end py-3">
    <div className="max-w-[80%] rounded-lg border-l-[3px] border-accent bg-tsf-bubble-user px-4 py-3">
      <p className="text-sm text-foreground leading-relaxed">{content}</p>
    </div>
  </div>
);

export default UserBubble;
