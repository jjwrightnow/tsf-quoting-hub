import { useState } from 'react';

interface SignNameInputProps {
  onSubmit: (name: string) => void;
  isFirst: boolean;
}

const SignNameInput = ({ onSubmit, isFirst }: SignNameInputProps) => {
  const [name, setName] = useState('');

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onSubmit(trimmed);
    setName('');
  };

  return (
    <div className="mt-4 space-y-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              handleSubmit();
            }
          }}
          placeholder="e.g., Main Entrance, Pg 3, Suite 200"
          className="flex-1 rounded-lg border border-border bg-transparent px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"
          autoFocus
        />
        <button
          onClick={handleSubmit}
          disabled={!name.trim()}
          className="rounded-lg gradient-pink-blue px-5 py-3 text-sm font-medium text-foreground transition-all duration-300 hover:opacity-90 disabled:opacity-30"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default SignNameInput;
