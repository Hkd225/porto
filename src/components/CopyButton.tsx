import { useEffect, useRef, useState } from 'react';
import { Check, Copy } from 'lucide-react';

interface CopyButtonProps {
  /** Text placed on the clipboard. */
  value: string;
  /** Visible label. */
  label?: string;
  /** Compact icon-only form, used inside dense card rows. */
  iconOnly?: boolean;
  className?: string;
}

/**
 * Clipboard write with a visible confirmation.
 *
 * `navigator.clipboard` is unavailable on insecure origins and throws on some
 * older Safari builds, so there is an `execCommand` fallback rather than a
 * silent failure — a copy button that does nothing reads as broken.
 */
export function CopyButton({ value, label = 'Copy link', iconOnly = false, className = '' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Clear the pending reset if the component unmounts mid-confirmation.
  useEffect(() => () => clearTimeout(timer.current), []);

  const copy = async () => {
    const ok = await writeClipboard(value);
    if (!ok) return;
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1800);
  };

  return (
    <button
      type="button"
      onClick={copy}
      aria-label={copied ? 'Copied to clipboard' : label}
      className={`mono-label inline-flex items-center gap-2 transition-colors hover:text-acid ${
        copied ? 'text-acid' : 'text-muted'
      } ${iconOnly ? 'px-1' : ''} ${className}`}
    >
      {copied ? (
        <Check size={13} aria-hidden="true" />
      ) : (
        <Copy size={13} aria-hidden="true" className={iconOnly ? '' : 'hidden'} />
      )}
      {!iconOnly && (copied ? 'Copied' : label)}
      {copied && <span className="sr-only" role="status">Copied to clipboard</span>}
    </button>
  );
}

async function writeClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through to the legacy path */
  }

  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}