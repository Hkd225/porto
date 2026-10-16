/**
 * Prop types for the vendored React Bits components.
 *
 * The implementations live alongside this file as plain `.jsx` (upstream source,
 * unmodified — see README). TypeScript infers awkward required properties from
 * their destructuring, so the public surface is re-declared here and applied in
 * `index.ts`.
 */

export type Keyframe = Record<string, string | number>;
export type MagnetAxis = 'x' | 'y' | 'both';

/** React.CSSProperties has no index for vendor-agnostic CSS custom properties,
    but the vendored component styles are driven through `--component-*` vars —
    this is the accepted surface for passing them inline. */
export type CSSPropertiesWithVars = React.CSSProperties & {
  [customProperty: `--${string}`]: string | number;
};

export interface BlurTextProps {
  text?: string;
  /** Per-segment delay in ms. */
  delay?: number;
  className?: string;
  animateBy?: 'words' | 'letters';
  direction?: 'top' | 'bottom';
  /** IntersectionObserver threshold that triggers the reveal. */
  threshold?: number;
  rootMargin?: string;
  animationFrom?: Keyframe;
  animationTo?: Keyframe[];
  easing?: (t: number) => number;
  onAnimationComplete?: () => void;
  stepDuration?: number;
}

export interface MagnetProps {
  children?: React.ReactNode;
  /** Distance in px beyond the element edge where the field still applies. */
  padding?: number;
  disabled?: boolean;
  /** Multiplier on pointer displacement. Keep it subtle: 1–3. */
  magnetStrength?: number;
  maxOffset?: number;
  /** When true, only one magnet claims the pointer at a time. */
  exclusive?: boolean;
  axis?: MagnetAxis;
  tilt?: number;
  scale?: number;
  spring?: { stiffness: number; damping: number; mass: number };
  onActiveChange?: (active: boolean) => void;
  wrapperClassName?: string;
  innerClassName?: string;
  style?: React.CSSProperties;
  className?: string;
}

export interface DotGridProps {
  dotSize?: number;
  gap?: number;
  baseColor?: string;
  activeColor?: string;
  proximity?: number;
  strength?: number;
  bounce?: number;
  tension?: number;
  returnDuration?: number;
  shockRadius?: number;
  shockStrength?: number;
  swell?: number;
  stretch?: number;
  glow?: number;
  shape?: 'circle' | 'square';
  fade?: number;
  opacity?: number;
  intro?: boolean;
  mouseInteraction?: boolean;
  clickShock?: boolean;
  /** Freeze the render loop — use when offscreen or under reduced motion. */
  paused?: boolean;
  /** Device pixel ratio override. Pass 1 on low-power devices to save fill rate. */
  dpr?: number;
  /**
   * Called once if the field cannot run — no WebGL2 context, or a shader that
   * fails to link. The canvas renders nothing for the rest of the page's life,
   * so the caller needs to know to put a CSS stand-in behind it.
   */
  onUnavailable?: () => void;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}

/* ------------------------------------------------------------------ */
/* Text animations                                                     */
/* ------------------------------------------------------------------ */

export interface ShuffleProps {
  text?: string;
  effect?: 'slide' | 'flip' | 'blur';
  shuffleDirection?: 'left' | 'right' | 'up' | 'down';
  /** Duration of one letter's shuffle, in seconds. */
  duration?: number;
  /** Longest random start delay, in seconds (animationMode: 'random'). */
  maxDelay?: number;
  /** Any GSAP ease string or function. */
  ease?: string | ((progress: number) => number);
  /** Portion of the element that must be in view before it runs. */
  threshold?: number;
  rootMargin?: string;
  tag?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span';
  textAlign?: React.CSSProperties['textAlign'];
  onShuffleComplete?: () => void;
  /** Interim glyphs each letter passes through before landing. */
  shuffleTimes?: number;
  animationMode?: 'evenodd' | 'sequence' | 'center' | 'random';
  loop?: boolean;
  /** Seconds between loop repeats. */
  loopDelay?: number;
  /** Seconds between letters starting. */
  stagger?: number;
  /** Charset for interim glyphs; empty keeps original copies. */
  scrambleCharset?: string;
  motionBlur?: boolean;
  color?: string;
  /** Color of the interim glyphs while letters are in flight. */
  accentColor?: string;
  colorFrom?: string;
  colorTo?: string;
  triggerOnce?: boolean;
  respectReducedMotion?: boolean;
  /** Replay the shuffle on hover once the first run completes. */
  triggerOnHover?: boolean;
  /** Only letters within this px radius of the pointer reshuffle; 0 replays all. */
  hoverRadius?: number;
  className?: string;
  style?: React.CSSProperties;
}

export interface ShinyTextProps {
  text?: string;
  children?: React.ReactNode;
  color?: string;
  shineColor?: string;
  /** Seconds for one sweep. */
  speed?: number;
  /** Seconds of rest between sweeps. */
  delay?: number;
  /** Tilt of the band of light, in degrees. */
  angle?: number;
  /** Band width as a percentage of the text. */
  shineWidth?: number;
  /** Band edge softness, 0 (crisp) to 1 (soft sheen). */
  softness?: number;
  /** Number of following bands of light, 1–3. */
  bands?: number;
  /** Soft bloom that travels with the band, 0–1. */
  glow?: number;
  direction?: 'left' | 'right';
  easing?: 'smooth' | 'linear' | 'snappy';
  trigger?: 'loop' | 'hover' | 'view';
  yoyo?: boolean;
  followPointer?: boolean;
  pauseOnHover?: boolean;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export interface GradientTextProps {
  children?: React.ReactNode;
  colors?: string[];
  /** Seconds the gradient takes to complete one movement. */
  animationSpeed?: number;
  variant?: 'linear' | 'flow' | 'conic';
  /** Fallback angle when `direction` is unset. */
  angle?: number;
  direction?: 'horizontal' | 'vertical' | 'diagonal';
  /** How much of the palette repeats within the text, 1–6. */
  scale?: number;
  yoyo?: boolean;
  /** Soft bloom behind the text, 0–1. */
  glow?: number;
  showBorder?: boolean;
  borderWidth?: number;
  pauseOnHover?: boolean;
  followPointer?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export interface DecryptedTextProps {
  text?: string;
  /** ms between engine ticks. */
  speed?: number;
  maxIterations?: number;
  /** Reveal letters one at a time, in order. */
  sequential?: boolean;
  revealDirection?: 'start' | 'end' | 'center' | 'random';
  useOriginalCharsOnly?: boolean;
  characters?: string;
  /** Class applied to revealed letters (e.g. a highlight color). */
  className?: string;
  parentClassName?: string;
  /** Class applied to still-encrypted letters. */
  encryptedClassName?: string;
  animateOn?: 'hover' | 'view' | 'inViewHover' | 'click';
  clickMode?: 'once' | 'toggle';
  effect?: 'scramble' | 'fade' | 'flip';
  /** Color blended into scrambled glyphs; empty keeps currentColor. */
  scrambleColor?: string;
  loop?: boolean;
  /** ms between loop cycles. */
  loopDelay?: number;
  /** With a radius, letters heat up individually near the pointer. */
  hoverRadius?: number;
}

/* ------------------------------------------------------------------ */
/* Scroll and layout                                                   */
/* ------------------------------------------------------------------ */

export interface ScrollExpandProps {
  src?: string;
  mediaType?: 'image' | 'video';
  poster?: string;
  alt?: string;
  title?: string;
  scrollHint?: string;
  /** Frame width/height at rest, as a percentage of the stage. */
  startWidth?: number;
  startHeight?: number;
  startRadius?: number;
  endRadius?: number;
  /** Media zoom at rest; eases back to 1 as the frame opens. */
  mediaZoom?: number;
  /** Scroll length of the expansion, in multiples of stage height. */
  scrollDistance?: number;
  /** Extra scroll pinned at full bleed before releasing. */
  holdDistance?: number;
  /** Follow time in seconds; 0 locks to the scrollbar exactly. */
  smoothing?: number;
  /** Strength of the readability scrim over the expanded media. */
  overlayScrim?: number;
  /** Drive the expansion from page scroll instead of the component's own. */
  useWindowScroll?: boolean;
  enabled?: boolean;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  /** Forwarded to the root element so nav tracking can observe the bridge. */
  id?: string;
}

export interface FadeContentProps {
  children?: React.ReactNode;
  /** Scroller that drives the fade, as a selector string or element. */
  container?: string | HTMLElement;
  effect?: 'fade' | 'focus' | 'develop' | 'dissolve' | 'mist' | 'pixel';
  blur?: boolean | number;
  /** Seconds. */
  duration?: number;
  ease?: string;
  /** Seconds before it starts. */
  delay?: number;
  threshold?: number;
  initialOpacity?: number;
  /** Seconds between direct children fading in turn; 0 disables. */
  stagger?: number;
  staggerFrom?: 'start' | 'end' | 'center' | 'edges' | 'random';
  trigger?: 'scroll' | 'mount';
  once?: boolean;
  /** Fade back out when scrolled past, and again when coming back. */
  exit?: boolean;
  /** Tie the fade to scroll position; a number smooths it, in seconds. */
  scrub?: boolean | number;
  /** Fade out again after this many seconds; 0 keeps it shown. */
  disappearAfter?: number;
  disappearDuration?: number;
  disappearEase?: string;
  onStart?: () => void;
  onComplete?: () => void;
  onDisappearanceComplete?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

/* ------------------------------------------------------------------ */
/* Media swap and galleries                                            */
/* ------------------------------------------------------------------ */

export type PixelSwapPattern =
  | 'pointer'
  | 'random'
  | 'center'
  | 'edges'
  | 'left-to-right'
  | 'right-to-left'
  | 'top-to-bottom'
  | 'bottom-to-top'
  | 'diagonal'
  | 'spiral';

export type LogoItem =
  | { node: React.ReactNode; title?: string; href?: string; ariaLabel?: string; hoverColor?: string }
  | { src: string; srcSet?: string; sizes?: string; width?: number; height?: number; alt?: string; title?: string; href?: string; hoverColor?: string };

export interface LogoLoopProps {
  logos: LogoItem[];
  /** Pixels per second; negative reverses. */
  speed?: number;
  direction?: 'left' | 'right' | 'up' | 'down';
  width?: number | string;
  logoHeight?: number;
  gap?: number;
  /** Speed while hovered; 0 pauses. */
  hoverSpeed?: number;
  /** Set false to keep full speed on hover; ignored when hoverSpeed is set. */
  pauseOnHover?: boolean;
  fadeOut?: boolean;
  /** Each end fade as a fraction of the length, 0–0.5. */
  fadeOutWidth?: number;
  scaleOnHover?: boolean;
  layout?: 'line' | 'wave' | 'arc' | 'orbit';
  /** Path bend, -1 to 1. Negative values flip it. */
  bend?: number;
  /** Center lens, 0–1: center logos grow, outer ones dim. */
  focus?: number;
  /** Dock-style magnification under the cursor, 0–1. */
  magnify?: number;
  /** 3D tilt, in degrees, -60 to 60. */
  tiltX?: number;
  tiltY?: number;
  /** Move one logo at a time, pausing centered on each. */
  step?: boolean;
  /** Greyscale/dim logos until hovered or centered, 0–1. */
  muted?: number;
  labels?: 'none' | 'inline' | 'below' | 'hover';
  draggable?: boolean;
  /** Speed up on page scroll and reverse when scrolling up, 0–1. */
  scrollBoost?: number;
  intro?: boolean;
  renderItem?: (item: LogoItem, key: React.Key) => React.ReactNode;
  ariaLabel?: string;
  className?: string;
  style?: React.CSSProperties;
}

export interface PixelSwapProps {
  firstContent?: React.ReactNode;
  secondContent?: React.ReactNode;
  pattern?: PixelSwapPattern;
  /** Edge length of each pixel, in px. */
  pixelSize?: number;
  /** Space between pixels while they grow, in px. */
  gap?: number;
  /** Corner rounding while growing, as a percentage (50 starts as dots). */
  pixelRadius?: number;
  /** Start size of each pixel, 0–0.9. */
  pixelScale?: number;
  /** Degrees each pixel turns as it grows in. */
  pixelSpin?: number;
  /** ms for the wave to cross the content. */
  duration?: number;
  /** ms for one pixel to grow. */
  pixelDuration?: number;
  /** Noise in the pattern, 0 (clean wave) to 1 (scatter). */
  randomness?: number;
  /** Overshoot before settling, 0–1. */
  bounce?: number;
  trigger?: 'hover' | 'click' | 'none';
  /** Build the first content in from pixels on mount. */
  intro?: boolean;
  initialActive?: boolean;
  active?: boolean;
  onActiveChange?: (active: boolean) => void;
  onComplete?: (active: boolean) => void;
  aspectRatio?: string;
  className?: string;
  style?: React.CSSProperties;
}

export interface CursorGridProps {
  cellSize?: number;
  color?: string;
  gridColor?: string;
  radius?: number;
  falloff?: 'smooth' | 'linear' | 'sharp';
  highlight?: 'area' | 'cell';
  holdTime?: number;
  fadeDuration?: number;
  lineWidth?: number;
  maxOpacity?: number;
  fillOpacity?: number;
  gridOpacity?: number;
  gridStyle?: 'lines' | 'dashed' | 'dots' | 'crosses';
  cellRadius?: number;
  cellGap?: number;
  spotlight?: number;
  clickPulse?: boolean;
  /** Click ring speed, px per second. */
  pulseSpeed?: number;
  /** Random self-glowing cells, 0–1. */
  ambient?: number;
  /** Grid fade at the edges, 0–0.5. */
  edgeFade?: number;
  /** Draw the grid out from the center on mount. */
  intro?: boolean;
  lightMode?: boolean;
  dpr?: number;
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export interface FlexCarouselItem {
  src: string;
  alt?: string;
  title?: string;
  subtitle?: string;
}

export type FlexCarouselItemOrIndex = FlexCarouselItem | number;

export interface FlexCarouselProps {
  items?: FlexCarouselItem[];
  preset?: 'liquid' | 'ribbon' | 'vortex' | 'arch';
  intro?: 'rise' | 'bloom' | 'spin' | 'deal' | 'none';
  fit?: 'natural' | 'portrait' | 'square' | 'landscape';
  /** Card height as a fraction of container height. */
  cardHeight?: number;
  gap?: number;
  radius?: number;
  lensWidth?: number;
  lensHeight?: number;
  tilt?: number;
  /** Glass shape, 0 (rounded rect) to 1 (ellipse). */
  roundness?: number;
  bend?: number;
  reach?: number;
  curl?: 'twist' | 'rise' | 'fall';
  dispersion?: number;
  liquid?: number;
  followCursor?: boolean;
  /** Card shrink while the row moves fast, 0–1. */
  squeeze?: number;
  focusOnClick?: boolean;
  autoplay?: boolean;
  /** Seconds between autoplay steps. */
  interval?: number;
  captions?: boolean;
  captureWheel?: boolean;
  onChange?: (index: number, item: FlexCarouselItem) => void;
  onSelect?: (index: number, item: FlexCarouselItem) => void;
  className?: string;
  style?: React.CSSProperties;
}

/* ------------------------------------------------------------------ */
/* Frames and accents                                                  */
/* ------------------------------------------------------------------ */

export type StarBorderHover = 'lap' | 'brighten' | 'reveal' | 'none';

export interface StarBorderProps extends React.HTMLAttributes<HTMLElement> {
  /** Rendered element: `button` by default, `a` for link CTAs, `div` for plates. */
  as?: 'button' | 'a' | 'div';
  children?: React.ReactNode;
  /** Star head color; the trail defaults to the same color. */
  color?: string;
  trailColor?: string;
  /** Seconds per full orbit at rest. */
  duration?: number;
  /** Track width, px (minimum 0.5). */
  thickness?: number;
  /** Corner radius, px. `999` gives a pill. */
  radius?: number;
  /** Trail length as a fraction of the orbit, 0–1. */
  trailLength?: number;
  /** 1–6 evenly spaced stars. */
  stars?: number;
  /** Bloom strength around the head, 0–1. */
  glow?: number;
  /** Emit dust motes and ray spikes from the head. */
  sparkle?: boolean;
  direction?: 'clockwise' | 'counterclockwise';
  /** Pointer response: quick extra orbit (lap), bloom up (brighten),
      star hides until approach (reveal), or nothing. */
  hover?: StarBorderHover;
  /** Ripple pulses from the click point. */
  clickPulse?: boolean;
  /** Default surface/text/track palette. */
  theme?: 'dark' | 'light';
  /** Surface, text, and track-color overrides; defaults come from `theme`. */
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  /** Anchor passthrough when `as="a"`. */
  href?: string;
  target?: string;
  rel?: string;
  /** Button passthrough when `as` is unset. */
  type?: 'button' | 'submit' | 'reset';
}

/* ------------------------------------------------------------------ */
/* Cursor-reactive surfaces                                            */
/* ------------------------------------------------------------------ */

export interface SpotlightCardProps {
  children?: React.ReactNode;
  className?: string;
  /** Accepts `--spotlight-card-*` custom properties for surface/border/shadow. */
  style?: CSSPropertiesWithVars;
  /** Spotlight color — drives the center fill, rim glow, and flare. */
  spotlightColor?: string;
  /** Center fill strength, 0–1 (scaled by theme). */
  intensity?: number;
  /** Spotlight radius, px. */
  spotlightSize?: number;
  /** Edge softness, 0 (hard core) to 1 (wide bloom). */
  softness?: number;
  shape?: 'circle' | 'beam';
  /** Hover ring glow strength, 0–1. */
  borderGlow?: number;
  /** Distance beyond the card edge where the field still reacts, px. */
  proximity?: number;
  /** Light-follow smoothing, 0 (snap) to 1 (slow). */
  smoothing?: number;
  /** Drift the light when no pointer is near; keeps the paint loop warm. */
  ambient?: boolean;
  /** Bloom flare while pressed. */
  flare?: boolean;
  /** Noise-streak grain over the light, 0–1. */
  grain?: number;
  theme?: 'dark' | 'light';
}

export type GlareHoverVariant = 'streak' | 'twin' | 'sheen';
export type GlareHoverMode = 'hover' | 'follow' | 'click' | 'loop';

export interface GlareHoverProps {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  /** Root size; pass '100%' to fill a grid cell or column. */
  width?: string;
  height?: string;
  /** Own surface — set transparent to wrap an existing card untreated. */
  background?: string;
  borderRadius?: string;
  borderColor?: string;
  /** Band color/opacity/angle (-45° sweeps corner to corner). */
  glareColor?: string;
  glareOpacity?: number;
  glareAngle?: number;
  /** Band width as a % of the root diagonal. */
  glareSize?: number;
  softness?: number;
  variant?: GlareHoverVariant;
  blendMode?: string;
  /** Sweep a 1px rim highlight with the band. */
  rimGlint?: boolean;
  mode?: GlareHoverMode;
  transitionDuration?: number;
  /** Seconds between auto sweeps in loop mode. */
  interval?: number;
  /** A single sweep instead of an enter/exit pair. */
  playOnce?: boolean;
  /** Sweep once the first time the card is roughly in view. */
  intro?: boolean;
}

export interface VariableProximityProps {
  label?: string;
  /** CSS font-variation-settings strings, e.g. "'wght' 300". Only axes that
      exist on the loaded variable font take effect. */
  fromFontVariationSettings?: string;
  toFontVariationSettings?: string;
  /** Element whose box gates the field; unset = react anywhere. */
  containerRef?: React.RefObject<HTMLElement | null>;
  /** Field radius, px. */
  radius?: number;
  falloff?: 'linear' | 'exponential' | 'gaussian';
  /** Pointer-follow smoothing, 0–1. */
  smoothing?: number;
  /** Rest and nearest colors; composed via color-mix while approaching. */
  fromColor?: string;
  toColor?: string;
  /** Extra growth at full proximity, 0–1. */
  scale?: number;
  /** em rise at full proximity. */
  lift?: number;
  /** Ambient wave while idle; keeps a paint loop running. */
  idleWave?: boolean;
  fontSize?: number | string;
  className?: string;
  style?: React.CSSProperties;
  onClick?: (event: React.MouseEvent<HTMLElement>) => void;
}

/* ------------------------------------------------------------------ */
/* Kinetic type (GSAP SplitText) and scroll-velocity type               */
/* ------------------------------------------------------------------ */

export interface SplitTextProps {
  text: string;
  className?: string;
  /** Milliseconds between successive chars / words / lines. */
  delay?: number;
  duration?: number;
  /** Any GSAP ease string, e.g. 'expo.out'. */
  ease?: string;
  splitType?: 'chars' | 'words' | 'lines';
  /** Full GSAP from/to vars; overrides the built-in effect presets. */
  from?: Record<string, unknown>;
  to?: Record<string, unknown>;
  /** 0–1 — portion of the element that must be on screen for a 'view' run. */
  threshold?: number;
  /** ScrollTrigger root margin for the 'view' trigger, e.g. '-100px'. */
  rootMargin?: string;
  textAlign?: 'left' | 'center' | 'right' | 'justify';
  tag?: 'h1' | 'h2' | 'h3' | 'p' | 'span' | 'div';
  staggerFrom?: 'start' | 'end' | 'center' | 'edges' | 'random' | number;
  /** Mask each unit so it rises out of its own clipped line. */
  mask?: boolean;
  effect?: 'rise' | 'fade' | 'blur' | 'flip' | 'pop' | 'skew' | 'wave';
  /** 'load' = run at mount; 'view' = wait for the element; 'hover' / 'click' replay. */
  trigger?: 'load' | 'view' | 'hover' | 'click';
  loop?: boolean;
  loopDelay?: number;
  /** Pointer lift / wave applied after the reveal. */
  hoverEffect?: 'none' | 'lift' | 'wave';
  color?: string;
  /** Starting tint each unit flashes before returning to the text color. */
  accentColor?: string;
  onLetterAnimationComplete?: () => void;
}

export interface ScrollVelocityProps {
  /** Entries run left; every odd entry runs the opposite way. */
  texts?: React.ReactNode[];
  /** px/s drift at rest. */
  velocity?: number;
  numCopies?: number;
  velocityMapping?: { input: number[]; output: number[] };
  damping?: number;
  stiffness?: number;
  className?: string;
  parallaxClassName?: string;
  scrollerClassName?: string;
  parallaxStyle?: React.CSSProperties;
  scrollerStyle?: React.CSSProperties;
  separator?: React.ReactNode;
  pauseOnHover?: boolean;
  fadeEdges?: boolean;
  skewWithVelocity?: number;
  scaleWithVelocity?: number;
  outlineAlternate?: boolean;
  gap?: number;
  fontSize?: number | string;
  fontWeight?: number | string;
  color?: string;
  scrollContainerRef?: React.RefObject<HTMLElement | null>;
  draggable?: boolean;
}

/* ------------------------------------------------------------------ */
/* Canvas-animated text                                                 */
/* ------------------------------------------------------------------ */

export interface FuzzyTextProps {
  children?: React.ReactNode;
  fontSize?: number | string;
  fontWeight?: number | string;
  fontFamily?: string;
  color?: string;
  enableHover?: boolean;
  /** Rest-state fuzz, 0–1. */
  baseIntensity?: number;
  /** Pointer fuzz, 0–1. */
  hoverIntensity?: number;
  /** Max slice shift, px. */
  fuzzRange?: number;
  fps?: number;
  direction?: 'horizontal' | 'vertical' | 'both';
  transitionDuration?: number;
  clickEffect?: boolean;
  glitchMode?: boolean;
  glitchInterval?: number;
  glitchDuration?: number;
  gradient?: string[] | null;
  letterSpacing?: number;
  sliceSize?: number;
  /** 'hover' = fuzz on pointer; 'always' = continuous loop; 'click' = on click. */
  trigger?: 'hover' | 'always' | 'click';
  intro?: boolean;
  introDuration?: number;
  /** RGB slice split for analog-chromatic edges, 0–1. */
  colorSplit?: number;
  className?: string;
}