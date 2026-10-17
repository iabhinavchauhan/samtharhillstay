const fs = require('fs');
const path = require('path');
const files = [
  'src/data/resortData.js',
  'src/data/destinations.js',
  'src/data/adventures.js',
  'src/data/foodPlaces.js',
  'src/data/hotels.js',
];
function makeImageUrl(tag, seed) {
  return `https://loremflickr.com/1200/800/${encodeURIComponent(tag)}?random=${seed}`;
}
function sanitizeContext(text) {
  return text.toLowerCase().replace(/['"`\[\]]/g, ' ');
}
function findTagFromContext(lines, index) {
  const context = sanitizeContext(lines.slice(Math.max(0, index - 8), index + 4).join(' '));

  if (/category\s*:\s*homestays/.test(context)) return 'mountain cottage';
  if (/category\s*:\s*rooms/.test(context)) return 'hotel room';
  if (/category\s*:\s*food/.test(context)) return 'food';
  if (/category\s*:\s*nature/.test(context)) return 'forest retreat';
  if (/category\s*:\s*experiences/.test(context)) return 'adventure travel';

  if (/mainimage\s*:\s*/.test(context) || /gallery\s*:\s*/.test(context)) {
    if (/slug\s*:\s*samthar/.test(context)) return 'mountain hotel';
    if (/slug\s*:\s*suviksha/.test(context)) return 'forest cottage';
    if (/slug\s*:\s*asher/.test(context)) return 'mountain lodge';
    if (/slug\s*:\s*cedar/.test(context)) return 'wooden cottage';
  }

  if (/food|dish|meal|cuisine|breakfast|dining|seafood|indian food|dessert|spice|momos|thali/.test(context)) {
    if (/seafood|fish|prawn|shrimp|crab/.test(context)) return 'seafood';
    if (/tea|chai/.test(context)) return 'tea house';
    return 'authentic food';
  }

  if (/hotel|homestay|cottage|suite|room|retreat|villa|resort/.test(context)) {
    if (/forest|woods|trees|cabin/.test(context)) return 'forest cottage';
    if (/mountain|hill|ridge|valley/.test(context)) return 'mountain lodge';
    if (/lake|river|waterfall/.test(context)) return 'water resort';
    if (/garden|terrace|view/.test(context)) return 'resort garden';
    return 'hotel room';
  }

  if (/beach|sea|ocean|coast|island/.test(context)) return 'beach resort';
  if (/desert|dune/.test(context)) return 'desert camp';
  if (/forest|trees|wood|wildlife|safari/.test(context)) return 'forest retreat';
  if (/lake|backwater|river/.test(context)) return 'lake resort';
  if (/waterfall|cascade/.test(context)) return 'waterfall';
  if (/snow|winter/.test(context)) return 'snow lodge';
  if (/rafting|boating|camping|trekking|paragliding|zipline|safari/.test(context)) return 'adventure activity';

  const titleMatch = context.match(/title\s*:\s*([a-z0-9 ]+)/);
  if (titleMatch) {
    const title = titleMatch[1];
    if (/room|suite|hotel|cottage|villa|resort/.test(title)) return 'hotel room';
    if (/food|dining|meal|breakfast|tea|cuisine|dish/.test(title)) return 'food';
    if (/beach|ocean|coast|island/.test(title)) return 'beach resort';
    if (/mountain|hill|forest|lake|river/.test(title)) return 'nature retreat';
  }

  if (/description\s*:\s*.*hotel|description\s*:\s*.*cottage|description\s*:\s*.*homestay/.test(context)) return 'hotel room';
  if (/description\s*:\s*.*food|description\s*:\s*.*dish/.test(context)) return 'authentic food';

  return 'travel';
}

let total = 0;
for (const file of files) {
  const fullPath = path.join(__dirname, file);
  const text = fs.readFileSync(fullPath, 'utf8');
  const lines = text.split('\n');
  const newLines = lines.map((line, index) => {
    if (!line.includes('https://picsum.photos/seed/')) return line;
    const match = line.match(/https:\/\/picsum\.photos\/seed\/([0-9a-f]{8})\/1200\/800/);
    if (!match) return line;
    const seed = match[1];
    const tag = findTagFromContext(lines, index);
    total += 1;
    return line.replace(match[0], makeImageUrl(tag, seed));
  });
  fs.writeFileSync(fullPath, newLines.join('\n'), 'utf8');
}
console.log('replaced', total, 'image URLs');
