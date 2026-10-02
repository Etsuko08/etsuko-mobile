const fs = require('fs');
const path = require('path');

const root = __dirname;
const www = path.join(root, 'www');

if (fs.existsSync(www)) {
  fs.rmSync(www, { recursive: true, force: true });
}
fs.mkdirSync(www, { recursive: true });

function copyRecursive(src, dst) {
  if (!fs.existsSync(src)) return;
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    if (!fs.existsSync(dst)) fs.mkdirSync(dst, { recursive: true });
    for (const file of fs.readdirSync(src)) {
      copyRecursive(path.join(src, file), path.join(dst, file));
    }
  } else {
    fs.copyFileSync(src, dst);
  }
}

copyRecursive(path.join(root, 'index.html'), path.join(www, 'index.html'));
copyRecursive(path.join(root, 'manifest.json'), path.join(www, 'manifest.json'));
copyRecursive(path.join(root, 'sw.js'), path.join(www, 'sw.js'));
copyRecursive(path.join(root, 'css'), path.join(www, 'css'));
copyRecursive(path.join(root, 'js'), path.join(www, 'js'));
copyRecursive(path.join(root, 'assets'), path.join(www, 'assets'));
copyRecursive(path.join(root, 'curated_trending.json'), path.join(www, 'curated_trending.json'));
copyRecursive(path.join(root, 'version.json'), path.join(www, 'version.json'));

console.log('Synchronized web assets to www/ directory!');
