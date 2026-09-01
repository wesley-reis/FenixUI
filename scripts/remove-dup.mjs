const fs = require('fs');
let t = fs.readFileSync('src/docs/app.test.ts', 'utf8');
// Remove the duplicate drawer test (lines 188-207)
const lines = t.split('\n');
let start = -1, end = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('drawer') && lines[i].includes('fluxo real') && lines[i].includes('- 2')) {
    start = i - 1; // include the empty line before
    // Find the closing });
    for (let j = i; j < lines.length; j++) {
      if (lines[j].trim() === '});') { end = j; break; }
      if (lines[j].trim() === '});' && j > i + 5) { end = j; break; }
    }
    break;
  }
}
if (start >= 0 && end >= 0) {
  lines.splice(start, end - start + 1);
  fs.writeFileSync('src/docs/app.test.ts', lines.join('\n'));
  console.log('removed lines', start, 'to', end);
} else {
  console.log('not found', start, end);
}
