import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const iconsDir = path.join(__dirname, '../public/icons');
const distIconsDir = path.join(__dirname, '../dist/icons');

if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}
if (!fs.existsSync(distIconsDir)) {
  fs.mkdirSync(distIconsDir, { recursive: true });
}

// 1x1 cyan PNG buffer base
const base64Png = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
const buffer = Buffer.from(base64Png, 'base64');

['icon16.png', 'icon48.png', 'icon128.png'].forEach(file => {
  fs.writeFileSync(path.join(iconsDir, file), buffer);
  fs.writeFileSync(path.join(distIconsDir, file), buffer);
});

console.log("JARVIS Extension icons initialized.");
