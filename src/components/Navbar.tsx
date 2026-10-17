import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';

import { NAV_ITEMS, TRACKED_IDS } from '../data/nav';
import { profile } from '../data/profile';
import { useActiveSection } from '../hooks/useActiveSection';
import { scrollToSection } from '../hooks/useSmoothScroll';

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const active = useActiveSection(TRACKED_IDS);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const go = (id: string) => {
    setOpen(false);
    scrollToSection(`#${id}`);
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-500 ${
        scrolled || open ? 'border-b border-line bg-ink/80 backdrop-blur-md' : 'border-b border-transparent'
      }`}
    >
      <div className="wrap flex h-16 items-center justify-between">
        <button
          type="button"
          onClick={() => go('index')}
          aria-label="Back to top"
          className="group flex items-baseline gap-1"
        >
          <span className="font-display text-[1.4rem] italic leading-none">{profile.navMark}</span>
        </button>

        <nav className="hidden items-center gap-7 md:flex" aria-label="Sections">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => go(item.id)}
              className={`group relative font-mono text-[11px] uppercase tracking-[0.22em] transition-colors duration-200 ${
                active === item.id ? 'text-bone' : 'text-dim hover:text-muted'
              }`}
              aria-current={active === item.id ? 'true' : undefined}
            >
              {item.label}
              <span
                className={`absolute -bottom-2 left-0 h-px bg-bone transition-all duration-300 ${
                  active === item.id ? 'w-full' : 'w-0 group-hover:w-full'
                }`}
                aria-hidden="true"
              />
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={`mailto:${profile.links.email}`}
            className="hidden rounded-full border border-line px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-muted transition-colors duration-200 hover:border-line-2 hover:text-bone md:inline-block"
          >
            Email
          </a>
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-bone md:hidden"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X size={17} strokeWidth={1.5} /> : <Menu size={17} strokeWidth={1.5} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 top-16 z-[45] bg-ink/[0.98] md:hidden">
          <nav className="wrap flex flex-col py-14" aria-label="Sections, mobile">
            {NAV_ITEMS.map((item, i) => (
              <button
                key={item.id}
                type="button"
                onClick={() => go(item.id)}
                className="flex items-baseline justify-between border-b border-line-soft py-6 text-left"
              >
                <span className="font-display text-[2rem] italic">{item.label}</span>
                <span className="num">0{i + 1}</span>
              </button>
            ))}
            <a
              href={`mailto:${profile.links.email}`}
              className="mt-10 w-fit rounded-full border border-line px-6 py-3 font-mono text-[11px] uppercase tracking-[0.18em] text-muted"
              onClick={() => setOpen(false)}
            >
              Email me
            </a>
          </nav>
        </div>
      )}
    </header>
  );
}
