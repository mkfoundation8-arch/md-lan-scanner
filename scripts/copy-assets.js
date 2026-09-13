import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const srcDir = path.join(__dirname, '..', 'dist');
const destDir = path.join(__dirname, '..', 'android', 'app', 'src', 'main', 'assets', 'www');

async function copyAssets() {
  try {
    // Ensure destination directory exists
    await fs.ensureDir(destDir);
    
    // Copy all files from dist to android assets
    await fs.copy(srcDir, destDir, { overwrite: true });
    
    console.log(`✓ Assets copied from ${srcDir} to ${destDir}`);
    console.log('✓ Android WebView assets are ready!');
  } catch (error) {
    console.error('✗ Error copying assets:', error);
    process.exit(1);
  }
}

copyAssets();