import { useState } from 'react';

interface Props {
  className?: string;
  compact?: boolean;
}

/** Accurate SVG seal matching the real MIT-ADT University logo */
export function MITSeal({ size }: { size: number }) {
  // Dot ring around the gold border
  const dotCount = 60;
  const dotRadius = 94.5;
  const dots = Array.from({ length: dotCount }, (_, i) => {
    const angle = (i / dotCount) * 2 * Math.PI - Math.PI / 2;
    return {
      x: 100 + dotRadius * Math.cos(angle),
      y: 100 + dotRadius * Math.sin(angle),
    };
  });

  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="MIT-ADT University"
    >
      {/* ── Outer gold fill circle ── */}
      <circle cx="100" cy="100" r="99" fill="#c9a227" />

      {/* ── Thin dark ring just inside the gold ── */}
      <circle cx="100" cy="100" r="97" fill="#7a5200" />

      {/* ── Small gold dots ring ── */}
      {dots.map((d, i) => (
        <circle key={i} cx={d.x} cy={d.y} r="1.6" fill="#c9a227" />
      ))}

      {/* ── Inner gold divider ring ── */}
      <circle cx="100" cy="100" r="90" fill="none" stroke="#c9a227" strokeWidth="1.5" />
      <circle cx="100" cy="100" r="87" fill="none" stroke="#c9a227" strokeWidth="0.6" />

      {/* ── Main purple fill ── */}
      <circle cx="100" cy="100" r="88.5" fill="#5a1a8c" />

      {/* ═══════════════════════════════════════════
          TEXT PATHS
      ═══════════════════════════════════════════ */}
      {/* Top arc: "MIT UNIVERSITY" */}
      <defs>
        <path id="mitTopArc"    d="M 22,100 A 78,78 0 0,1 178,100" />
        <path id="mitBottomArc" d="M 21,100 A 79,79 0 0,0 179,100" />
      </defs>

      <text
        fontFamily="'Times New Roman', Georgia, serif"
        fontSize="14"
        fontWeight="bold"
        fill="#c9a227"
        letterSpacing="3"
      >
        <textPath href="#mitTopArc" startOffset="50%" textAnchor="middle">
          MIT UNIVERSITY
        </textPath>
      </text>

      <text
        fontFamily="'Times New Roman', Georgia, serif"
        fontSize="9.5"
        fontWeight="bold"
        fill="#c9a227"
        letterSpacing="1.5"
      >
        <textPath href="#mitBottomArc" startOffset="50%" textAnchor="middle">
          ART, DESIGN &amp; TECHNOLOGY
        </textPath>
      </text>

      {/* ═══════════════════════════════════════════
          GOLD STAR DECORATORS (left & right of text)
      ═══════════════════════════════════════════ */}
      <text x="30" y="103.5" textAnchor="middle" fontSize="10" fill="#c9a227" fontFamily="serif">✦</text>
      <text x="170" y="103.5" textAnchor="middle" fontSize="10" fill="#c9a227" fontFamily="serif">✦</text>

      {/* ═══════════════════════════════════════════
          LAUREL WREATHS (left & right of building)
      ═══════════════════════════════════════════ */}
      {/* Left laurel */}
      <g stroke="#c9a227" strokeWidth="0.9" fill="none">
        <ellipse cx="65" cy="78" rx="4" ry="6.5" transform="rotate(-40 65 78)" />
        <ellipse cx="61" cy="85" rx="4" ry="6.5" transform="rotate(-50 61 85)" />
        <ellipse cx="59" cy="93" rx="4" ry="6.5" transform="rotate(-60 59 93)" />
        <ellipse cx="62" cy="100" rx="4" ry="6" transform="rotate(-70 62 100)" />
        <line x1="67" y1="76" x2="60" y2="103" strokeWidth="1.2" />
      </g>
      {/* Right laurel */}
      <g stroke="#c9a227" strokeWidth="0.9" fill="none">
        <ellipse cx="135" cy="78" rx="4" ry="6.5" transform="rotate(40 135 78)" />
        <ellipse cx="139" cy="85" rx="4" ry="6.5" transform="rotate(50 139 85)" />
        <ellipse cx="141" cy="93" rx="4" ry="6.5" transform="rotate(60 141 93)" />
        <ellipse cx="138" cy="100" rx="4" ry="6" transform="rotate(70 138 100)" />
        <line x1="133" y1="76" x2="140" y2="103" strokeWidth="1.2" />
      </g>

      {/* ═══════════════════════════════════════════
          BUILDING — classical domed pavilion
      ═══════════════════════════════════════════ */}

      {/* Dome (semi-ellipse) */}
      <path
        d="M 78,77 Q 100,52 122,77"
        fill="none"
        stroke="white"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      {/* Dome ribs */}
      <path d="M 100,54 L 100,77" stroke="white" strokeWidth="0.7" fill="none" />
      <path d="M 87,59 Q 88,67 88,77" stroke="white" strokeWidth="0.7" fill="none" />
      <path d="M 113,59 Q 112,67 112,77" stroke="white" strokeWidth="0.7" fill="none" />
      {/* Finial at top of dome */}
      <circle cx="100" cy="53" r="2" fill="white" />
      <line x1="100" y1="51" x2="100" y2="54" stroke="white" strokeWidth="1" />

      {/* Top entablature (beam above columns) */}
      <rect x="76" y="77" width="48" height="3" fill="white" rx="0.5" />

      {/* Five columns */}
      <rect x="79"   y="80" width="2.5" height="17" fill="white" rx="0.8" />
      <rect x="88"   y="80" width="2.5" height="17" fill="white" rx="0.8" />
      <rect x="98.75" y="80" width="2.5" height="17" fill="white" rx="0.8" />
      <rect x="109.5" y="80" width="2.5" height="17" fill="white" rx="0.8" />
      <rect x="118.5" y="80" width="2.5" height="17" fill="white" rx="0.8" />

      {/* Bottom entablature */}
      <rect x="76" y="97" width="48" height="2.5" fill="white" rx="0.5" />

      {/* Three steps */}
      <rect x="73"  y="99.5"  width="54" height="2.5" fill="white" rx="0.5" />
      <rect x="69"  y="102"   width="62" height="2.5" fill="white" rx="0.5" />
      <rect x="65"  y="104.5" width="70" height="2.5" fill="white" rx="0.5" />

      {/* ═══════════════════════════════════════════
          SANSKRIT MOTTO + ESTD.
      ═══════════════════════════════════════════ */}
      <text
        x="100" y="113"
        textAnchor="middle"
        fontFamily="serif"
        fontSize="5.5"
        fill="#d4af37"
        letterSpacing="0.5"
      >
        ॥ अर्थतः ज्ञान विज्ञासा ॥
      </text>
      <text
        x="100" y="121"
        textAnchor="middle"
        fontFamily="'Times New Roman', Georgia, serif"
        fontSize="7"
        fontStyle="italic"
        fill="#d4af37"
        letterSpacing="0.8"
      >
        Estd. 2015
      </text>
    </svg>
  );
}

/** MIT-ADT University logo — loads /mit-logo.png, falls back to accurate SVG seal */
export function MITLogo({ className = '', compact = false }: Props) {
  const [imgFailed, setImgFailed] = useState(false);

  if (!imgFailed) {
    return (
      <img
        src="/mit-logo.png"
        alt="MIT-ADT University"
        onError={() => setImgFailed(true)}
        className={compact ? `h-10 w-auto object-contain ${className}` : `h-20 w-auto object-contain ${className}`}
      />
    );
  }

  if (compact) {
    return <MITSeal size={44} />;
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <MITSeal size={80} />
      <div className="leading-tight">
        <p className="font-black text-slate-800" style={{ fontSize: 15, letterSpacing: '-0.3px' }}>
          MIT-ADT
        </p>
        <p className="font-bold text-slate-700" style={{ fontSize: 10, letterSpacing: '0.5px' }}>
          UNIVERSITY
        </p>
        <p className="text-slate-500" style={{ fontSize: 8 }}>
          ART, DESIGN &amp; TECHNOLOGY · PUNE
        </p>
      </div>
    </div>
  );
}
