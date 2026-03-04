import { useState } from 'react';
import { PROFILE_TYPES } from '@/lib/sign-constants';
import { PROFILE_ICONS, PROFILE_DESCRIPTIONS } from '@/components/chat/ProfileIcons';
import { useIsMobile } from '@/hooks/use-mobile';

interface ProfileSelectorProps {
  signName: string;
  onSelect: (profile: string) => void;
}

const ProfileSelector = ({ signName, onSelect }: ProfileSelectorProps) => {
  const [filter, setFilter] = useState('');
  const isMobile = useIsMobile();

  const filtered = PROFILE_TYPES.filter((p) =>
    p.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="mt-4 space-y-4">
      {/* Filter input */}
      <input
        type="text"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        placeholder="Type to filter profiles..."
        className="w-full rounded-lg border border-border bg-transparent px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"
      />

      {/* Profile grid */}
      <div className={`grid gap-3 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
        {filtered.map((profile) => {
          const Icon = PROFILE_ICONS[profile];
          const desc = PROFILE_DESCRIPTIONS[profile];
          return (
            <button
              key={profile}
              onClick={() => onSelect(profile)}
              className="group flex flex-col items-center gap-2 rounded-xl border border-border bg-card p-5 text-center transition-all duration-200 hover:border-primary hover:shadow-[0_0_16px_rgba(0,170,255,0.15)]"
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-secondary">
                {Icon && <Icon />}
              </div>
              <span className="text-sm font-medium text-foreground">{profile}</span>
              <span className="text-xs text-muted-foreground leading-snug">{desc}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ProfileSelector;
