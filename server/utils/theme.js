export const DEFAULT_BODY_FONT = 'Inter, sans-serif';
export const DEFAULT_DISPLAY_FONT = 'DM Sans, system-ui, sans-serif';

const SERIF_FAMILY = /(^|[\s,])serif($|[\s,])/i;
const SANS_FAMILY = /(^|[\s,])sans-serif($|[\s,])/i;

/**
 * The site is sans-serif only. A font stack counts as sans-serif unless it
 * resolves to a generic serif family.
 */
export function isSansSerifStack(value) {
  if (typeof value !== 'string' || !value.trim()) return false;
  if (SANS_FAMILY.test(value)) return true;
  return !SERIF_FAMILY.test(value);
}

/**
 * Replaces any serif font stack in a theme with the site's sans-serif defaults.
 */
export function sanitiseThemeFonts(theme) {
  if (!theme || typeof theme !== 'object') return theme;
  const next = { ...theme };
  if (!isSansSerifStack(next.fontFamily)) next.fontFamily = DEFAULT_BODY_FONT;
  if (!isSansSerifStack(next.displayFont)) next.displayFont = DEFAULT_DISPLAY_FONT;
  return next;
}

/**
 * Applies {@link sanitiseThemeFonts} to the theme of a site content payload.
 */
export function sanitiseContentFonts(data) {
  if (!data || typeof data !== 'object' || !data.theme) return data;
  return { ...data, theme: sanitiseThemeFonts(data.theme) };
}
