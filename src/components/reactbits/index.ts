/**
 * Typed facade for the vendored React Bits components.
 *
 * Source: https://github.com/DavidHDev/react-bits (MIT), installed as source
 * the way React Bits intends. Each `.jsx` file here is upstream, unmodified.
 *
 * The cast below is the single point where the untyped JS implementation meets
 * our prop contract — `types.ts` is the authoritative public API. Everything
 * else in the app imports from this file, so no call site is `any`.
 */

import type { ComponentType } from 'react';

import BlurTextImpl from './BlurText.jsx';
import MagnetImpl from './Magnet.jsx';
import DotGridImpl from './DotGrid.jsx';
import ShuffleImpl from './Shuffle.jsx';
import ShinyTextImpl from './ShinyText.jsx';
import GradientTextImpl from './GradientText.jsx';
import DecryptedTextImpl from './DecryptedText.jsx';
import ScrollExpandImpl from './ScrollExpand.jsx';
import FadeContentImpl from './FadeContent.jsx';
import LogoLoopImpl from './LogoLoop.jsx';
import PixelSwapImpl from './PixelSwap.jsx';
import CursorGridImpl from './CursorGrid.jsx';
import FlexCarouselImpl from './FlexCarousel.jsx';
import StarBorderImpl from './StarBorder.jsx';
import SpotlightCardImpl from './SpotlightCard.jsx';
import GlareHoverImpl from './GlareHover.jsx';
import VariableProximityImpl from './VariableProximity.jsx';
import SplitTextImpl from './SplitText.jsx';
import ScrollVelocityImpl from './ScrollVelocity.jsx';
import FuzzyTextImpl from './FuzzyText.jsx';
import ParticlesImpl from './Particles';
import RotatingTextImpl from './RotatingText';
import ScrollFloatImpl from './ScrollFloat';
import TextPressureImpl from './TextPressure';
import SilkImpl from './Silk.jsx';

import type {
  BlurTextProps,
  DotGridProps,
  MagnetProps,
  ShuffleProps,
  ShinyTextProps,
  GradientTextProps,
  DecryptedTextProps,
  ScrollExpandProps,
  FadeContentProps,
  LogoLoopProps,
  PixelSwapProps,
  CursorGridProps,
  FlexCarouselProps,
  StarBorderProps,
  SpotlightCardProps,
  GlareHoverProps,
  VariableProximityProps,
  SplitTextProps,
  ScrollVelocityProps,
  FuzzyTextProps,
  ParticlesProps,
  RotatingTextProps,
  ScrollFloatProps,
  TextPressureProps,
  SilkProps
} from './types';

export const BlurText = BlurTextImpl as ComponentType<BlurTextProps>;
export const Magnet = MagnetImpl as ComponentType<MagnetProps>;
export const DotGrid = DotGridImpl as ComponentType<DotGridProps>;
export const Shuffle = ShuffleImpl as ComponentType<ShuffleProps>;
export const ShinyText = ShinyTextImpl as ComponentType<ShinyTextProps>;
export const GradientText = GradientTextImpl as ComponentType<GradientTextProps>;
export const DecryptedText = DecryptedTextImpl as ComponentType<DecryptedTextProps>;
export const ScrollExpand = ScrollExpandImpl as ComponentType<ScrollExpandProps>;
export const FadeContent = FadeContentImpl as ComponentType<FadeContentProps>;
export const LogoLoop = LogoLoopImpl as ComponentType<LogoLoopProps>;
export const PixelSwap = PixelSwapImpl as ComponentType<PixelSwapProps>;
export const CursorGrid = CursorGridImpl as ComponentType<CursorGridProps>;
export const FlexCarousel = FlexCarouselImpl as ComponentType<FlexCarouselProps>;
export const StarBorder = StarBorderImpl as ComponentType<StarBorderProps>;
export const SpotlightCard = SpotlightCardImpl as ComponentType<SpotlightCardProps>;
export const GlareHover = GlareHoverImpl as ComponentType<GlareHoverProps>;
export const VariableProximity = VariableProximityImpl as ComponentType<VariableProximityProps>;
export const SplitText = SplitTextImpl as ComponentType<SplitTextProps>;
export const ScrollVelocity = ScrollVelocityImpl as ComponentType<ScrollVelocityProps>;
export const FuzzyText = FuzzyTextImpl as ComponentType<FuzzyTextProps>;
export const Particles = ParticlesImpl as ComponentType<ParticlesProps>;
export const RotatingText = RotatingTextImpl as ComponentType<RotatingTextProps>;
export const ScrollFloat = ScrollFloatImpl as ComponentType<ScrollFloatProps>;
export const TextPressure = TextPressureImpl as ComponentType<TextPressureProps>;
export const Silk = SilkImpl as ComponentType<SilkProps>;

export type {
  BlurTextProps,
  DotGridProps,
  MagnetProps,
  ShuffleProps,
  ShinyTextProps,
  GradientTextProps,
  DecryptedTextProps,
  ScrollExpandProps,
  FadeContentProps,
  LogoLoopProps,
  PixelSwapProps,
  CursorGridProps,
  FlexCarouselProps,
  StarBorderProps,
  SpotlightCardProps,
  GlareHoverProps,
  VariableProximityProps,
  SplitTextProps,
  ScrollVelocityProps,
  FuzzyTextProps,
  ParticlesProps,
  RotatingTextProps,
  ScrollFloatProps,
  TextPressureProps,
  SilkProps
};