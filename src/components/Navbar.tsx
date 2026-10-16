import { useCallback, useEffect, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { profile } from '../data/profile';
import { scrollToSection } from '../hooks/useSmoothScroll';
import { SECTIONS, TRACKED } from '../data/sections';
import { gsap } from '../lib/gsap';

/**
 * Command key shown on the palette trigger. Both modifiers work everywhere, so
 * this is only a hint about which is idiomatic on the current platform.
 */
const isApple =
  typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.platform || '');

export function Navbar({ onSearch }: { onSearch: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>('index');

  const drawerRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const navListRef = useRef<HTMLUListElement>(null);
  const navIndicatorRef = useRef<HTMLSpanElement>(null);
  const navLinks = useRef(new Map<string, HTMLAnchorElement>());

  const registerNavLink = useCallback((id: string, node: HTMLAnchorElement | null) => {
    if (node) navLinks.current.set(id, node);
    else navLinks.current.delete(id);
  }, []);

  /* --- sliding active indicator ---
     One rule, animated to whatever is current. Positioned rather than
     transitioned in CSS so the travel stays smooth even when the item moves
     two slots in one step. */
  useEffect(() => {
    const bar = navIndicatorRef.current;
    const node = navLinks.current.get(active);
    if (!bar || !node) return;

    gsap.to(bar, {
      x: node.offsetLeft,
      width: node.offsetWidth,
      opacity: 1,
      duration: 0.55,
      ease: 'power3.out',
      overwrite: true,
    });
  }, [active]);

  /* The nav re-flows on resize; the indicator has to be re-measured, not just
     re-rendered, or it is left sitting at the old pixel offset. */
  useEffect(() => {
    const onResize = () => {
      const bar = navIndicatorRef.current;
      const node = navLinks.current.get(active);
      if (!bar || !node) return;
      gsap.set(bar, { x: node.offsetLeft, width: node.offsetWidth, opacity: 1 });
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [active]);

  /* --- compact on scroll --- */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* --- active section tracking ---
     Tracked blocks are observed with the nav sections; a block that is not a
     nav entry (the cover band) highlights the section it belongs to. */
  useEffect(() => {
    type Target = { node: HTMLElement; highlight: string };

    const targets: Target[] = [];
    for (const s of SECTIONS) {
      const node = document.getElementById(s.id);
      if (node) targets.push({ node, highlight: s.id });
    }
    for (const t of TRACKED) {
      const node = document.getElementById(t.id);
      if (node) targets.push({ node, highlight: t.highlight });
    }
    if (!targets.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Pick the section occupying the most of the viewport band just below the header.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const match = targets.find((t) => t.node === visible.target);
        if (match) setActive(match.highlight);
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: [0, 0.25, 0.5, 1] },
    );

    targets.forEach((t) => observer.observe(t.node));
    return () => observer.disconnect();
  }, []);

  /* --- drawer: lock scroll, Escape to close, return focus --- */
  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';

    // Move focus into the drawer so keyboard users aren't stranded behind it.
    const drawer = drawerRef.current;
    const toggle = toggleRef.current;
    drawer?.querySelector<HTMLElement>('a, button')?.focus();

    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      toggle?.focus();
    };
  }, [open]);

  const go = useCallback((e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setOpen(false);
    // Let the drawer unlock scroll before Lenis takes over.
    requestAnimationFrame(() => scrollToSection(id, -80));
  }, []);

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-[110] transition-[background-color,border-color,backdrop-filter] duration-700 ${
          scrolled
            ? 'border-b border-line bg-ink/70 backdrop-blur-xl'
            : 'border-b border-transparent'
        }`}
      >
        <nav
          aria-label="Primary"
          className={`container-x flex items-center justify-between transition-[padding] duration-700 ${
            scrolled ? 'py-3' : 'py-5'
          }`}
        >
          {/* Mark — text on purpose: a canvas fuzz at 16px reads as glitch
              noise, not as a mark. (FuzzyText stays vendored for a bigger
              surface if it ever earns one.) */}
          <a
            href="#index"
            onClick={(e) => go(e, '#index')}
            className="group flex items-baseline gap-2 font-display text-base tracking-[-0.03em]"
          >
            <span>{profile.navMark}</span>
            <span className="hidden font-mono text-[0.6rem] tracking-[0.2em] text-muted transition-colors group-hover:text-acid sm:inline">
              {profile.altMark}
            </span>
          </a>

          {/* Desktop links */}
          <ul ref={navListRef} className="relative hidden items-center gap-5 md:flex lg:gap-7">
            {/* One shared rule that slides between items instead of six
                independent underlines fading in and out. That is what makes
                it read as a single moving object rather than a class toggle. */}
            <span
              ref={navIndicatorRef}
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-1 left-0 h-px w-0 origin-left bg-acid"
            />
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  onClick={(e) => go(e, `#${s.id}`)}
                  ref={(n) => registerNavLink(s.id, n)}
                  aria-current={active === s.id ? 'true' : undefined}
                  className={`mono-label link-underline-center transition-colors duration-500 ${
                    active === s.id ? 'text-acid' : 'hover:text-bone'
                  }`}
                >
                  {s.label}
                </a>
              </li>
            ))}
          </ul>

          {/* Status + toggle */}
          <div className="flex items-center gap-4">
            <span className="mono-label hidden items-center gap-2 xl:flex">
              <i className="status-dot" aria-hidden="true" />
              {profile.availability}
            </span>

            <button
              type="button"
              onClick={onSearch}
              data-cursor-label="Search"
              className="mono-label hidden items-center gap-3 border border-line px-4 py-2 text-muted transition-colors hover:border-bone/40 hover:text-bone lg:inline-flex"
            >
              <Search size={12} aria-hidden="true" />
              Search
              <span className="font-mono text-[0.6rem] tracking-[0.1em] text-dim">
                {isApple ? '⌘K' : 'Ctrl K'}
              </span>
            </button>

            <button
              ref={toggleRef}
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-nav"
              className="relative z-[130] flex h-10 w-10 flex-col items-center justify-center gap-1.5 md:hidden"
            >
              <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
              <span
                className={`block h-px w-5 bg-bone transition-transform duration-300 ${
                  open ? 'translate-y-[3.5px] rotate-45' : ''
                }`}
              />
              <span
                className={`block h-px w-5 bg-bone transition-transform duration-300 ${
                  open ? '-translate-y-[3.5px] -rotate-45' : ''
                }`}
              />
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile drawer */}
      <div
        id="mobile-nav"
        ref={drawerRef}
        hidden={!open}
        className="fixed inset-0 z-[120] flex flex-col justify-between bg-ink px-6 pt-28 pb-10 md:hidden"
      >
        <ul className="flex flex-col gap-1">
          {SECTIONS.map((s, i) => (
            <li key={s.id} className="hairline">
              <a
                href={`#${s.id}`}
                onClick={(e) => go(e, `#${s.id}`)}
                className="flex items-baseline justify-between py-4 font-display text-3xl tracking-[-0.04em]"
              >
                <span className={active === s.id ? 'text-acid' : ''}>{s.label}</span>
                <span className="font-mono text-[0.6rem] tracking-[0.2em] text-muted">
                  0{i + 1}
                </span>
              </a>
            </li>
          ))}
        </ul>

        <div className="flex flex-col gap-3">
          <span className="mono-label flex items-center gap-2">
            <i className="status-dot" aria-hidden="true" />
            {profile.availability}
          </span>
          <div className="flex flex-wrap gap-4">
            <a
              href={profile.links.github}
              target="_blank"
              rel="noreferrer noopener"
              className="mono-label link-underline hover:text-bone"
            >
              GitHub
            </a>
            <a
              href={profile.links.huggingface}
              target="_blank"
              rel="noreferrer noopener"
              className="mono-label link-underline hover:text-bone"
            >
              Hugging Face
            </a>
          </div>
        </div>
      </div>
    </>
  );
}