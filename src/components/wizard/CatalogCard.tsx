interface CatalogCardProps {
  label: string;
  selected?: boolean;
  onClick: () => void;
}

const CatalogCard = ({ label, selected, onClick }: CatalogCardProps) => (
  <button
    onClick={onClick}
    className={`
      flex-shrink-0 rounded-lg border px-4 py-3 text-left text-sm font-medium
      transition-all duration-300 min-w-[140px]
      ${selected
        ? 'border-accent border-2 neon-border-pink text-foreground'
        : 'border-border bg-tsf-surface text-muted-foreground hover:text-foreground hover:neon-border-blue hover:border-primary'
      }
    `}
  >
    {label}
  </button>
);

export default CatalogCard;
