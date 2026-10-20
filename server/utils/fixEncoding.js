const CP1252_HIGH = {
  0x20ac: 0x80, 0x0081: 0x81, 0x201a: 0x82, 0x0192: 0x83, 0x201e: 0x84,
  0x2026: 0x85, 0x2020: 0x86, 0x2021: 0x87, 0x02c6: 0x88, 0x2030: 0x89,
  0x0160: 0x8a, 0x2039: 0x8b, 0x0152: 0x8c, 0x008d: 0x8d, 0x017d: 0x8e,
  0x008f: 0x8f, 0x0090: 0x90, 0x2018: 0x91, 0x2019: 0x92, 0x201c: 0x93,
  0x201d: 0x94, 0x2022: 0x95, 0x2013: 0x96, 0x2014: 0x97, 0x02dc: 0x98,
  0x2122: 0x99, 0x0161: 0x9a, 0x203a: 0x9b, 0x0153: 0x9c, 0x009d: 0x9d,
  0x017e: 0x9e, 0x0178: 0x9f,
};

// Character pairs that only ever appear when UTF-8 bytes have been decoded as
// Windows-1252: a lead byte marker (Ã / Â / â) followed by a CP1252 artifact.
const MOJIBAKE_PATTERN = new RegExp(
  '[\\u00C3][\\u00A2\\u00A3\\u0192\\u201A\\u00AC\\u20AC\\u008D\\u009D]' +
  '|[\\u00C2][\\u00A2\\u00A0\\u00A3\\u00A6\\u00A9\\u00AC\\u00B0\\u00B1\\u00B7]' +
  '|[\\u00E2][\\u20AC\\u201A\\u201E\\u2020\\u2021\\u2030\\u2039\\u203A\\u0153' +
  '\\u0161\\u017E\\u2122\\u02C6\\u02DC\\u2026\\u2019\\u201C\\u201D\\u009D\\u008D' +
  '\\u00A6\\u00B0\\u00B1\\u00A2\\u00AC]' +
  '|[\\u00EF][\\u00BF][\\u00BD]',
);

function toCp1252Bytes(str) {
  const bytes = [];
  for (const ch of str) {
    const cp = ch.codePointAt(0);
    if (CP1252_HIGH[cp] !== undefined) {
      bytes.push(CP1252_HIGH[cp]);
      continue;
    }
    if (cp >= 0x00 && cp <= 0xff) {
      bytes.push(cp);
      continue;
    }
    return null;
  }
  return Buffer.from(bytes);
}

function decodeOnce(str) {
  const bytes = toCp1252Bytes(str);
  if (!bytes) return null;
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    return null;
  }
}

function looksMojibake(str) {
  return MOJIBAKE_PATTERN.test(str);
}

/**
 * Repairs UTF-8 text that was decoded as Windows-1252 (or Latin-1) one or more
 * times, restoring the original characters such as "->", "--", "(c)", ".".
 */
export function fixMojibake(text) {
  if (typeof text !== 'string' || !/[^\x00-\x7F]/.test(text)) return text;

  let current = text;
  let best = text;
  const seen = new Set([text]);

  for (let i = 0; i < 5; i++) {
    const next = decodeOnce(current);
    if (next === null || next === current || seen.has(next)) break;
    seen.add(next);
    current = next;
    if (!looksMojibake(next)) best = next;
  }

  return best;
}

/**
 * Walks any JSON-like value and repairs every string it contains.
 */
export function fixMojibakeDeep(value) {
  if (typeof value === 'string') return fixMojibake(value);
  if (Array.isArray(value)) return value.map(fixMojibakeDeep);
  if (value && typeof value === 'object') {
    const output = {};
    for (const [key, item] of Object.entries(value)) {
      output[key] = fixMojibakeDeep(item);
    }
    return output;
  }
  return value;
}

export function containsMojibake(value) {
  if (typeof value === 'string') return looksMojibake(value);
  if (Array.isArray(value)) return value.some(containsMojibake);
  if (value && typeof value === 'object') {
    return Object.values(value).some(containsMojibake);
  }
  return false;
}
