const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const root = path.join(__dirname, 'src');
const pattern = /https:\/\/images\.unsplash\.com\/[A-Za-z0-9\-_\=\?&%.:/]+/g;
let count = 0;
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(p);
      continue;
    }
    if (!p.endsWith('.js') && !p.endsWith('.jsx')) continue;
    let text = fs.readFileSync(p, 'utf8');
    const newText = text.replace(pattern, (match) => {
      count += 1;
      const seed = crypto.createHash('md5').update(match).digest('hex').slice(0, 8);
      return `https://picsum.photos/seed/${seed}/1200/800`;
    });
    if (newText !== text) fs.writeFileSync(p, newText, 'utf8');
  }
}
walk(root);
console.log('replaced', count, 'unsplash urls');
