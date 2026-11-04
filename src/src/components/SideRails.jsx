import { useEffect, useRef } from 'react';

// Wide screens only: the empty margins either side of the 1200px column become HUD rails.
// Left: scroll progress + section index. Right: a slow blade sign and a coordinates readout.
const SECTIONS = [['work', '01', 'CASE FILES'], ['memes', '02', 'MEMES'], ['photos', '03', 'PHOTOS'], ['contact', '04', 'CONTACT']];
const SIGN = '夜 間 配 達 · 高 速 · 未 来 · 2 F A S T 4 U · 東 京 ·';

export default function SideRails() {
  const root = useRef(null);
  useEffect(() => {
    let raf = 0;
    const on = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = root.current;
        if (!el) return;
        const max = document.documentElement.scrollHeight - innerHeight;
        el.classList.toggle('is-on', scrollY > innerHeight * 0.6); // stay off the full-bleed hero
        el.style.setProperty('--p', max > 0 ? (scrollY / max).toFixed(4) : 0);
        let cur = '';
        for (const [id] of SECTIONS) { const s = document.getElementById(id); if (s && s.getBoundingClientRect().top < innerHeight * 0.5) cur = id; }
        el.querySelectorAll('[data-sec]').forEach((a) => a.classList.toggle('on', a.dataset.sec === cur));
      });
    };
    on();
    addEventListener('scroll', on, { passive: true });
    addEventListener('resize', on);
    return () => { removeEventListener('scroll', on); removeEventListener('resize', on); cancelAnimationFrame(raf); };
  }, []);
  return (
    <div className="rails" ref={root}>
      <nav className="rail rail--l" aria-label="Sections">
        <span className="rail__track" aria-hidden="true"><i /></span>
        <ol>
          {SECTIONS.map(([id, n, name]) => (
            <li key={id}><a href={`#/#${id}`} data-sec={id} onClick={(e) => { e.preventDefault(); document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' }); }}><b>{n}</b><span>{name}</span></a></li>
          ))}
        </ol>
      </nav>
      <div className="rail rail--r" aria-hidden="true">
        <div className="rail__sign"><span>{SIGN} {SIGN}</span></div>
        <p className="rail__coord">35.6586° N<br />139.7454° E<br /><em>REC ●</em></p>
      </div>
    </div>
  );
}
