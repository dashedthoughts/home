// Mixed media: a printed-collage layer for case files. Torn paper, true Ben-Day halftone gradients,
// cross-hatching, hand-lettered SFX, marker annotations, ink that "boils" on twos.
// All artwork is procedural and original.

const seeded = (str) => {
  let h = 2166136261;
  for (const c of str) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => ((h = Math.imul(h ^ (h >>> 15), 2246822507) ^ Math.imul(h ^ (h >>> 13), 3266489909)) >>> 0) / 4294967296;
};

// One-time SVG defs: three ink-roughness frames (cycled for line boil) and a torn-paper edge.
export function InkDefs() {
  const ink = (id, seed, scale, freq = 0.035) => (
    <filter id={id} x="-5%" y="-5%" width="110%" height="110%" key={id}>
      <feTurbulence type="fractalNoise" baseFrequency={freq} numOctaves="2" seed={seed} result="n" />
      <feDisplacementMap in="SourceGraphic" in2="n" scale={scale} xChannelSelector="R" yChannelSelector="G" />
    </filter>
  );
  return (
    <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
      <defs>
        {ink('ink-a', 3, 4.5)}
        {ink('ink-b', 11, 4.5)}
        {ink('ink-c', 23, 4.5)}
        {ink('ink-fine', 9, 2.5, 0.09)}
        <filter id="torn" x="-5%" y="-30%" width="110%" height="160%">
          <feTurbulence type="fractalNoise" baseFrequency="0.06 0.5" numOctaves="3" seed="7" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="9" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
    </svg>
  );
}

// Ben-Day dots whose radius grows toward a corner: drawn dot by dot, so it reads printed, not patterned.
export function Halftone({ cols = 34, rows = 18, color = 'currentColor', corner = 'br', className = '' }) {
  const dots = [];
  const cx = corner.includes('r') ? cols : 0, cy = corner.includes('b') ? rows : 0;
  const maxD = Math.hypot(cols, rows);
  for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
    const ox = x + (y % 2) * 0.5;
    const t = 1 - Math.hypot(ox - cx, y - cy) / maxD;
    const r = Math.max(0, (t - 0.35) * 0.95);
    if (r > 0.04) dots.push(<circle key={`${x}-${y}`} cx={ox + 0.5} cy={y + 0.5} r={Math.min(0.62, r)} />);
  }
  return (
    <svg className={`halftone-svg ${className}`} viewBox={`0 0 ${cols + 1} ${rows + 1}`} preserveAspectRatio="xMaxYMax slice" aria-hidden="true" fill={color}>
      {dots}
    </svg>
  );
}

// Cross-hatching inside a loose blob, for a printed shadow.
export function Hatch({ seed = 'x', className = '' }) {
  const r = seeded(seed);
  const lines = [];
  for (let i = -40; i < 140; i += 3.2) lines.push(<line key={`a${i}`} x1={i} y1={0} x2={i - 40} y2={60} />);
  for (let i = -40; i < 140; i += 5.5) lines.push(<line key={`b${i}`} x1={i} y1={0} x2={i + 30} y2={60} />);
  const pts = Array.from({ length: 9 }, (_, k) => {
    const a = (k / 9) * Math.PI * 2;
    return `${50 + Math.cos(a) * (36 + r() * 12)},${30 + Math.sin(a) * (20 + r() * 8)}`;
  }).join(' ');
  const id = `hc-${seed}`;
  return (
    <svg className={`hatch ${className}`} viewBox="0 0 100 60" preserveAspectRatio="none" aria-hidden="true">
      <clipPath id={id}><polygon points={pts} /></clipPath>
      <g clipPath={`url(#${id})`} className="boil">{lines}</g>
    </svg>
  );
}

// Torn paper strip.
export function Strip({ tone = 'signal', className = '', style }) {
  return <span className={`strip strip--${tone} ${className}`} style={style} aria-hidden="true" />;
}

// Hand-lettered SFX: each letter set at its own small angle and lift.
export function SFX({ word }) {
  const r = seeded(word);
  return (
    <span className="sfx" aria-hidden="true">
      {[...word].map((ch, i) => (
        <span key={i} className="sfx__ch" style={{ '--r': `${(r() - 0.5) * 14}deg`, '--y': `${(r() - 0.5) * 10}px`, '--s': 0.92 + r() * 0.2 }} data-ch={ch}>
          {ch}
        </span>
      ))}
    </span>
  );
}

// Marker annotation with a hand-drawn arrow.
export function Note({ children }) {
  return (
    <span className="note" aria-hidden="true">
      <svg className="note__arrow boil" viewBox="0 0 80 50">
        <path d="M74 6 C 52 4, 28 14, 14 38" />
        <path d="M6 30 L 14 40 L 25 34" />
      </svg>
      <em>{children}</em>
    </span>
  );
}

// Marker scribble ring around an element.
export function Scribble({ children }) {
  return (
    <span className="scribble">
      {children}
      <svg className="scribble__ring boil" viewBox="0 0 200 60" preserveAspectRatio="none" aria-hidden="true">
        <path d="M18 34 C 10 12, 70 4, 120 6 S 196 18, 190 34 S 120 58, 70 55 S 6 46, 22 22 S 90 2, 150 10" />
      </svg>
    </span>
  );
}

// Radial action lines (subtle, in the background).
export function ActionLines() {
  const lines = [];
  for (let i = 0; i < 56; i++) {
    const a = (i / 56) * Math.PI * 2 + (i % 3) * 0.02;
    const r0 = 34 + ((i * 7) % 12);
    lines.push(<line key={i} x1={50 + Math.cos(a) * r0} y1={50 + Math.sin(a) * r0 * 0.6} x2={50 + Math.cos(a) * 80} y2={50 + Math.sin(a) * 48} strokeWidth={0.2 + ((i * 13) % 5) * 0.1} />);
  }
  return (
    <svg className="action-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
      {lines}
    </svg>
  );
}

export function Caption({ children }) {
  return <span className="caption">{children}</span>;
}
