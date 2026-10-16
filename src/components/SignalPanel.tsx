import { useEffect, useRef } from 'react';
import { prefersReducedMotion } from '../lib/gsap';

/**
 * A live trace of the flagship project's core idea: an agent estimating its own
 * confidence on each turn, and a control layer deciding whether to answer, ask
 * for more evidence, or defer.
 *
 * The numbers are simulated — this is an illustration of the mechanism, not a
 * readout of a running system, and the panel is labelled accordingly so nobody
 * reads it as telemetry.
 */

/** Gate thresholds. Below `gather`, the agent is not confident enough to proceed. */
const ANSWER_ABOVE = 0.72;
const GATHER_ABOVE = 0.45;

const SAMPLES = 96;

/** Paint budget. The model advances at 30fps, not 60 — a data trace does not
    gain legibility from twice the frames, and it keeps the compositor cheap. */
const FRAME_MS = 1000 / 30;

type Gate = 'ANSWER' | 'GATHER' | 'DEFER';

function gateFor(confidence: number): Gate {
  if (confidence >= ANSWER_ABOVE) return 'ANSWER';
  if (confidence >= GATHER_ABOVE) return 'GATHER';
  return 'DEFER';
}

export function SignalPanel() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const confRef = useRef<HTMLElement>(null);
  const entropyRef = useRef<HTMLElement>(null);
  const gateRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const box = boxRef.current;
    if (!canvas || !box) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduced = prefersReducedMotion();

    /* ---- state ---- */
    const confidence: number[] = new Array(SAMPLES).fill(0.62);
    /** Pointer position inside the panel, 0..1. Injects a small bias. */
    const pointer = { x: 0.5, y: 0.5, active: false };

    let width = 0;
    let height = 0;
    let raf = 0;
    let phase = 0;

    const resize = () => {
      // 1.5x is the ceiling: this is a thin line on a dark panel, and full DPR
      // triples the raster cost for no visible gain.
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const rect = box.getBoundingClientRect();
      width = Math.max(1, Math.floor(rect.width));
      height = Math.max(1, Math.floor(rect.height));
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    /* ---- simulation ----
       A mean-reverting random walk, so the trace drifts plausibly instead of
       oscillating on a fixed period. */
    const step = () => {
      phase += 0.016;
      const bias = pointer.active ? (pointer.y - 0.5) * 0.35 : 0;
      const last = confidence[confidence.length - 1];

      const target = 0.6 + bias;
      const pull = (target - last) * 0.06;
      const noise = (Math.random() - 0.5) * 0.12 + Math.sin(phase * 1.7) * 0.02;

      confidence.push(Math.min(0.98, Math.max(0.02, last + pull + noise)));
      confidence.shift();
    };

    /* ---- paint ---- */
    const paint = () => {
      ctx.clearRect(0, 0, width, height);

      const padX = 12;
      const padY = 12;
      const plotH = height - padY * 2;
      const plotW = width - padX * 2;

      // Baseline grid
      ctx.strokeStyle = 'rgba(240,240,232,0.07)';
      ctx.lineWidth = 1;
      for (let i = 1; i < 4; i++) {
        const y = padY + (plotH / 4) * i;
        ctx.beginPath();
        ctx.moveTo(padX, y);
        ctx.lineTo(padX + plotW, y);
        ctx.stroke();
      }

      const yFor = (v: number) => padY + plotH * (1 - v);

      // Threshold bands
      ctx.fillStyle = 'rgba(200,255,77,0.05)';
      ctx.fillRect(padX, yFor(ANSWER_ABOVE), plotW, padY + plotH - yFor(ANSWER_ABOVE));
      ctx.fillStyle = 'rgba(240,240,232,0.03)';
      ctx.fillRect(padX, yFor(GATHER_ABOVE), plotW, yFor(ANSWER_ABOVE) - yFor(GATHER_ABOVE));

      const xFor = (i: number) => padX + (plotW / (SAMPLES - 1)) * i;

      // Filled area under the trace
      const gradient = ctx.createLinearGradient(0, padY, 0, padY + plotH);
      gradient.addColorStop(0, 'rgba(200,255,77,0.22)');
      gradient.addColorStop(1, 'rgba(200,255,77,0)');
      ctx.beginPath();
      ctx.moveTo(xFor(0), padY + plotH);
      confidence.forEach((v, i) => ctx.lineTo(xFor(i), yFor(v)));
      ctx.lineTo(xFor(SAMPLES - 1), padY + plotH);
      ctx.closePath();
      ctx.fillStyle = gradient;
      ctx.fill();

      // The trace itself
      ctx.beginPath();
      confidence.forEach((v, i) => (i ? ctx.lineTo(xFor(i), yFor(v)) : ctx.moveTo(xFor(0), yFor(v))));
      ctx.strokeStyle = '#c8ff4d';
      ctx.lineWidth = 1.5;
      ctx.lineJoin = 'round';
      ctx.stroke();

      // Leading marker
      const lastY = yFor(confidence[SAMPLES - 1]);
      ctx.beginPath();
      ctx.arc(xFor(SAMPLES - 1), lastY, 2.5, 0, Math.PI * 2);
      ctx.fillStyle = '#c8ff4d';
      ctx.fill();
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(box);

    let last = 0;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      // Throttled to FRAME_MS, and skipped entirely when the tab is hidden.
      if (document.hidden) return;
      if (now - last < FRAME_MS) return;
      last = now;
      step();
      paint();
    };

    const start = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };

    /* Stop simulating once the panel has scrolled away — there is no reason to
       keep a random walk and a canvas paint running for a section nobody is
       looking at. The readout interval is left alone; it is nearly free. */
    const io = new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()), {
      threshold: 0,
    });
    io.observe(box);

    const onVisibility = () => {
      if (document.hidden) stop();
      else if (box.getBoundingClientRect().bottom > 0) start();
    };
    document.addEventListener('visibilitychange', onVisibility);

    if (reduced) {
      // One static, plausible trace. No loop, no cost.
      for (let i = 0; i < 400; i++) step();
      paint();
    } else {
      start();
    }

    const onMove = (e: PointerEvent) => {
      const rect = box.getBoundingClientRect();
      pointer.x = (e.clientX - rect.left) / rect.width;
      pointer.y = (e.clientY - rect.top) / rect.height;
      pointer.active = pointer.y > 0 && pointer.y < 1 && pointer.x > 0 && pointer.x < 1;
    };
    const onLeave = () => (pointer.active = false);

    box.addEventListener('pointermove', onMove, { passive: true });
    box.addEventListener('pointerleave', onLeave);

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      box.removeEventListener('pointermove', onMove);
      box.removeEventListener('pointerleave', onLeave);
    };
  }, []);

  /* Readouts advance on their own clock. They are a separate, coarser
     simulation from the canvas trace — the panel is labelled "simulated", so a
     text value that does not sit exactly on the plotted line is acceptable;
     what matters is that the gate flips visibly over a few seconds. */
  useEffect(() => {
    if (prefersReducedMotion()) return;
    const t = setInterval(() => {
      const v = 0.45 + Math.random() * 0.45;
      if (confRef.current) confRef.current.textContent = String(Math.round(v * 100));
      if (entropyRef.current) entropyRef.current.textContent = (2 - v).toFixed(2);
      if (gateRef.current) {
        const gate = gateFor(v);
        gateRef.current.textContent = gate;
        gateRef.current.className = `mt-1 font-mono text-sm tabular-nums ${
          gate === 'ANSWER' ? 'text-acid' : gate === 'GATHER' ? 'text-bone' : 'text-muted'
        }`;
      }
    }, 240);
    return () => clearInterval(t);
  }, []);

  return (
    <div
      data-cursor="grow"
      data-cursor-label="Live"
      className="relative w-full max-w-sm select-none border border-line bg-ink/40 p-4 backdrop-blur-[2px]"
    >
      <div className="flex items-center justify-between gap-4">
        <span className="mono-label">Confidence trace</span>
        <span className="mono-label text-dim">Simulated</span>
      </div>

      {/*
        The canvas is absolutely positioned inside a fixed-height box on
        purpose. Sizing a canvas from its own measured parent is a feedback
        loop: setting the height feeds back into the parent's height, the
        ResizeObserver fires again, and the panel grows without bound.
      */}
      <div ref={boxRef} className="relative mt-3 h-20 w-full">
        <canvas ref={canvasRef} className="absolute inset-0 block h-full w-full" aria-hidden="true" />
      </div>

      <dl className="mt-3 grid grid-cols-3 gap-3 border-t border-line-soft pt-3">
        <div>
          <dt className="mono-label text-dim">Confidence</dt>
          <dd ref={confRef} className="mt-1 font-mono text-sm text-bone tabular-nums">
            72
          </dd>
        </div>
        <div>
          <dt className="mono-label text-dim">Entropy</dt>
          <dd ref={entropyRef} className="mt-1 font-mono text-sm text-bone tabular-nums">
            1.28
          </dd>
        </div>
        <div>
          <dt className="mono-label text-dim">Gate</dt>
          <dd ref={gateRef} className="mt-1 font-mono text-sm text-acid tabular-nums">
            ANSWER
          </dd>
        </div>
      </dl>

      <p className="mt-3 text-[0.7rem] leading-relaxed text-dim">
        Below threshold the agent gathers evidence instead of answering. Move the pointer across
        the panel to bias the trace.
      </p>
    </div>
  );
}