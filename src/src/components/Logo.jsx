// The AD mark: a forward-raked badge, hand-built letterforms (A with a red slash for a crossbar, D with a
// sharp counter) and two print plates sitting just out of register. Plates snap on hover, on twos.
export const MARK_PATHS = {
  badge: 'M10 0 H124 L114 64 H0 Z',
  a: 'M14 54 L31 9 H43 L60 54 H48.5 L37 21 L25.5 54 Z',
  slash: 'M22 40 L54 31 L56 37 L24 46 Z',
  d: 'M64 9 H86 Q110 9 110 31.5 Q110 54 86 54 H64 Z M75 19 V44 H85 Q98.5 44 98.5 31.5 Q98.5 19 85 19 Z',
};

export default function Logo({ size = 44 }) {
  const P = MARK_PATHS;
  return (
    <svg className="logo" viewBox="-4 -4 132 72" width={size * 2.06} height={size} aria-hidden="true" focusable="false">
      <path d={P.badge} className="logo__badge" />
      <g className="logo__plate logo__plate--c"><path d={P.a} /><path d={P.d} fillRule="evenodd" /></g>
      <g className="logo__plate logo__plate--m"><path d={P.a} /><path d={P.d} fillRule="evenodd" /></g>
      <g className="logo__ink"><path d={P.a} /><path d={P.d} fillRule="evenodd" /></g>
      <path d={P.slash} className="logo__slash" />
      <g className="logo__speed"><path d="M98 58 H124" /><path d="M104 62 H126" /></g>
    </svg>
  );
}
