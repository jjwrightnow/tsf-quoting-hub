// Minimal SVG cross-section illustrations for each profile type
// Each shows a letter "A" cross-section with arrows indicating light direction

const iconSize = 64;
const strokeColor = 'hsl(240, 33%, 75%)';
const arrowColor = 'hsl(200, 100%, 50%)';
const pinkArrow = 'hsl(340, 100%, 59%)';

const LetterBody = () => (
  <>
    <rect x="22" y="16" width="20" height="32" rx="2" fill="none" stroke={strokeColor} strokeWidth="1.5" />
  </>
);

export const HaloLitIcon = () => (
  <svg width={iconSize} height={iconSize} viewBox="0 0 64 64" fill="none">
    <LetterBody />
    {/* Arrows behind/around the letter */}
    <line x1="18" y1="24" x2="12" y2="20" stroke={arrowColor} strokeWidth="1.5" markerEnd="url(#ah)" />
    <line x1="18" y1="32" x2="10" y2="32" stroke={arrowColor} strokeWidth="1.5" markerEnd="url(#ah)" />
    <line x1="18" y1="40" x2="12" y2="44" stroke={arrowColor} strokeWidth="1.5" markerEnd="url(#ah)" />
    <line x1="46" y1="24" x2="52" y2="20" stroke={arrowColor} strokeWidth="1.5" markerEnd="url(#ah)" />
    <line x1="46" y1="32" x2="54" y2="32" stroke={arrowColor} strokeWidth="1.5" markerEnd="url(#ah)" />
    <line x1="46" y1="40" x2="52" y2="44" stroke={arrowColor} strokeWidth="1.5" markerEnd="url(#ah)" />
    <defs>
      <marker id="ah" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
        <path d="M0,0 L6,3 L0,6" fill={arrowColor} />
      </marker>
    </defs>
  </svg>
);

export const FrontLitIcon = () => (
  <svg width={iconSize} height={iconSize} viewBox="0 0 64 64" fill="none">
    <LetterBody />
    {/* Arrows coming out of the front face */}
    <line x1="28" y1="28" x2="28" y2="10" stroke={arrowColor} strokeWidth="1.5" markerEnd="url(#af)" />
    <line x1="32" y1="28" x2="32" y2="8" stroke={arrowColor} strokeWidth="1.5" markerEnd="url(#af)" />
    <line x1="36" y1="28" x2="36" y2="10" stroke={arrowColor} strokeWidth="1.5" markerEnd="url(#af)" />
    <defs>
      <marker id="af" markerWidth="6" markerHeight="6" refX="3" refY="5" orient="auto">
        <path d="M0,6 L3,0 L6,6" fill={arrowColor} />
      </marker>
    </defs>
  </svg>
);

export const BackLitIcon = () => (
  <svg width={iconSize} height={iconSize} viewBox="0 0 64 64" fill="none">
    <LetterBody />
    {/* Arrows going down/back behind the letter */}
    <line x1="28" y1="36" x2="28" y2="54" stroke={arrowColor} strokeWidth="1.5" markerEnd="url(#ab)" />
    <line x1="32" y1="36" x2="32" y2="56" stroke={arrowColor} strokeWidth="1.5" markerEnd="url(#ab)" />
    <line x1="36" y1="36" x2="36" y2="54" stroke={arrowColor} strokeWidth="1.5" markerEnd="url(#ab)" />
    <defs>
      <marker id="ab" markerWidth="6" markerHeight="6" refX="3" refY="1" orient="auto">
        <path d="M0,0 L3,6 L6,0" fill={arrowColor} />
      </marker>
    </defs>
  </svg>
);

export const FrontBackLitIcon = () => (
  <svg width={iconSize} height={iconSize} viewBox="0 0 64 64" fill="none">
    <LetterBody />
    {/* Front arrows */}
    <line x1="29" y1="24" x2="29" y2="10" stroke={arrowColor} strokeWidth="1.5" markerEnd="url(#afb1)" />
    <line x1="35" y1="24" x2="35" y2="10" stroke={arrowColor} strokeWidth="1.5" markerEnd="url(#afb1)" />
    {/* Back arrows */}
    <line x1="29" y1="40" x2="29" y2="54" stroke={pinkArrow} strokeWidth="1.5" markerEnd="url(#afb2)" />
    <line x1="35" y1="40" x2="35" y2="54" stroke={pinkArrow} strokeWidth="1.5" markerEnd="url(#afb2)" />
    <defs>
      <marker id="afb1" markerWidth="6" markerHeight="6" refX="3" refY="5" orient="auto">
        <path d="M0,6 L3,0 L6,6" fill={arrowColor} />
      </marker>
      <marker id="afb2" markerWidth="6" markerHeight="6" refX="3" refY="1" orient="auto">
        <path d="M0,0 L3,6 L6,0" fill={pinkArrow} />
      </marker>
    </defs>
  </svg>
);

export const NonIlluminatedIcon = () => (
  <svg width={iconSize} height={iconSize} viewBox="0 0 64 64" fill="none">
    <LetterBody />
    {/* No arrows — just the letter body with a subtle fill */}
    <rect x="22" y="16" width="20" height="32" rx="2" fill="hsl(240, 27%, 14%)" stroke={strokeColor} strokeWidth="1.5" />
  </svg>
);

export const OpenFaceNeonIcon = () => (
  <svg width={iconSize} height={iconSize} viewBox="0 0 64 64" fill="none">
    {/* Open channel letter with glowing tube */}
    <rect x="22" y="16" width="20" height="32" rx="2" fill="none" stroke={strokeColor} strokeWidth="1.5" />
    {/* No top face — open */}
    <line x1="22" y1="16" x2="42" y2="16" stroke="hsl(240, 18%, 8%)" strokeWidth="2" />
    {/* Neon tube */}
    <ellipse cx="32" cy="32" rx="6" ry="10" fill="none" stroke={pinkArrow} strokeWidth="2" opacity="0.8" />
    <ellipse cx="32" cy="32" rx="6" ry="10" fill="none" stroke={pinkArrow} strokeWidth="4" opacity="0.15" />
  </svg>
);

export const EdgeLitIcon = () => (
  <svg width={iconSize} height={iconSize} viewBox="0 0 64 64" fill="none">
    {/* Thin panel */}
    <rect x="24" y="20" width="16" height="24" rx="1" fill="hsl(200, 100%, 50%, 0.08)" stroke={strokeColor} strokeWidth="1.5" />
    {/* Light from edges */}
    <line x1="24" y1="26" x2="16" y2="22" stroke={arrowColor} strokeWidth="1.5" markerEnd="url(#ae)" />
    <line x1="24" y1="38" x2="16" y2="42" stroke={arrowColor} strokeWidth="1.5" markerEnd="url(#ae)" />
    <line x1="40" y1="26" x2="48" y2="22" stroke={arrowColor} strokeWidth="1.5" markerEnd="url(#ae)" />
    <line x1="40" y1="38" x2="48" y2="42" stroke={arrowColor} strokeWidth="1.5" markerEnd="url(#ae)" />
    <defs>
      <marker id="ae" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
        <path d="M0,0 L6,3 L0,6" fill={arrowColor} />
      </marker>
    </defs>
  </svg>
);

export const FlatCutIcon = () => (
  <svg width={iconSize} height={iconSize} viewBox="0 0 64 64" fill="none">
    {/* Flat, thin letter shape */}
    <rect x="22" y="26" width="20" height="12" rx="1" fill="hsl(240, 27%, 14%)" stroke={strokeColor} strokeWidth="1.5" />
    {/* Mounting pins */}
    <line x1="28" y1="38" x2="28" y2="46" stroke={strokeColor} strokeWidth="1" strokeDasharray="2 2" />
    <line x1="36" y1="38" x2="36" y2="46" stroke={strokeColor} strokeWidth="1" strokeDasharray="2 2" />
    <circle cx="28" cy="47" r="1.5" fill={strokeColor} />
    <circle cx="36" cy="47" r="1.5" fill={strokeColor} />
  </svg>
);

export const PROFILE_ICONS: Record<string, React.FC> = {
  'Halo Lit': HaloLitIcon,
  'Front Lit': FrontLitIcon,
  'Back Lit': BackLitIcon,
  'Front & Back Lit': FrontBackLitIcon,
  'Non-Illuminated': NonIlluminatedIcon,
  'Open Face Neon': OpenFaceNeonIcon,
  'Edge Lit': EdgeLitIcon,
  'Flat Cut': FlatCutIcon,
};

export const PROFILE_DESCRIPTIONS: Record<string, string> = {
  'Halo Lit': 'Light glows behind the letter against the wall',
  'Front Lit': 'Light shines through the face of the letter',
  'Back Lit': 'Light projects behind, silhouetting the letter',
  'Front & Back Lit': 'Light from both face and back for maximum impact',
  'Non-Illuminated': 'No lighting — solid dimensional letters',
  'Open Face Neon': 'Exposed neon tubes in an open channel',
  'Edge Lit': 'Light emits from edges of a clear panel',
  'Flat Cut': 'Thin flat-cut metal letters, pin-mounted',
};
