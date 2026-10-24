import { cn } from "@/lib/utils";

/**
 * Glyphs from a 1.9 KB subset of Symbols Nerd Font (MIT). Only decoration:
 * the codepoints live in the private use area, so they are hidden from
 * assistive tech and never used as the only carrier of meaning.
 */
const GLYPHS = {
  ticket: "\u{f0516}",
  doorOpen: "\u{f081c}",
  accessPoint: "\u{f0003}",
  sparkle: "\u{f0ae2}",
  fileTable: "\u{f0c7e}",
  key: "\u{f0306}",
  shieldCheck: "\u{f0565}",
  qrScan: "\u{f0433}",
  calendarCheck: "\u{f00ef}",
  chair: "\u{f1061}",
  calendarClock: "\u{f00f0}",
  accountGroup: "\u{f0849}",
  chefHat: "\u{f0b7c}",
  checkCircle: "\u{f05e0}",
  clock: "\u{f0954}",
  mapMarker: "\u{f034e}",
} as const;

export type NerdGlyphName = keyof typeof GLYPHS;

export function NerdGlyph({
  name,
  className,
}: {
  name: NerdGlyphName;
  className?: string;
}) {
  return (
    <span aria-hidden className={cn("nf leading-none", className)}>
      {GLYPHS[name]}
    </span>
  );
}
