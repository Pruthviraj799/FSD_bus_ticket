import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const manifestSrc = path.join(__dirname, '../manifest.json');
const manifestDest = path.join(__dirname, '../dist/manifest.json');

const iconsSrc = path.join(__dirname, '../public/icons');
const iconsDest = path.join(__dirname, '../dist/icons');

if (fs.existsSync(manifestSrc)) {
  fs.copyFileSync(manifestSrc, manifestDest);
}

if (!fs.existsSync(iconsDest)) {
  fs.mkdirSync(iconsDest, { recursive: true });
}

if (fs.existsSync(iconsSrc)) {
  fs.readdirSync(iconsSrc).forEach(file => {
    fs.copyFileSync(path.join(iconsSrc, file), path.join(iconsDest, file));
  });
}

console.log("JARVIS Chrome Extension Manifest V3 & Icons packaged to dist/.");
