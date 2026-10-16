import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { scrollToSection } from '../hooks/useSmoothScroll';

/**
 * Persistent back-to-top control.
 *
 * The footer already has one, but it is unreachable until the very end of the
 * page — which is exactly when nobody needs it. This fades in past the first
 * viewport and stays out of the way of the custom cursor layer.
 */
export function BackToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.9);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <button
      type="button"
      onClick={() => scrollToSection('#index', 0)}
      aria-label="Back to top"
      data-cursor-label="Top"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      className={`fixed right-5 bottom-5 z-[140] flex h-11 w-11 items-center justify-center rounded-full border border-line bg-ink/80 backdrop-blur-md transition-[opacity,transform,border-color,color] duration-500 ease-[cubic-bezier(.16,1,.3,1)] hover:border-acid hover:text-acid ${
        visible ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-3 opacity-0'
      }`}
    >
      <ArrowUp size={16} aria-hidden="true" />
    </button>
  );
}