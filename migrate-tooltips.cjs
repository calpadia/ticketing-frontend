const fs = require('fs');
const path = require('path');

const dir = 'd:\\Apps\\Kiro\\TMS\\frontend\\src\\';

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // 1. Replace title="Something" inside <button> with v-tooltip="'Something'"
  // We need to be careful with single vs double quotes.
  content = content.replace(/<button([^>]*)title="([^"]+)"([^>]*)>/g, (match, p1, p2, p3) => {
    // If it's binding like :title="expr", skip it
    return `<button${p1}v-tooltip="'${p2}'"${p3}>`;
  });

  // 2. Replace :title="expr" inside <button> with v-tooltip="expr"
  content = content.replace(/<button([^>]*):title="([^"]+)"([^>]*)>/g, (match, p1, p2, p3) => {
    return `<button${p1}v-tooltip="${p2}"${p3}>`;
  });

  // 3. Replace data-tooltip="text" class="has-tooltip ..." with v-tooltip="'text'"
  // Remove has-tooltip class
  content = content.replace(/data-tooltip="([^"]+)"/g, `v-tooltip="'$1'"`);
  content = content.replace(/has-tooltip\s*/g, '');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated:', filePath);
  }
}

function walk(directory) {
  const files = fs.readdirSync(directory);
  for (const file of files) {
    const fullPath = path.join(directory, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walk(fullPath);
    } else if (fullPath.endsWith('.vue')) {
      processFile(fullPath);
    }
  }
}

walk(dir);
console.log('Done.');
