import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const srcDir = path.join(projectRoot, 'dist');
const destDir = path.join(projectRoot, 'android', 'app', 'src', 'main', 'assets', 'www');

async function copyAssets() {
  try {
    await fs.rm(destDir, { recursive: true, force: true });
    await fs.mkdir(destDir, { recursive: true });
    await fs.cp(srcDir, destDir, { recursive: true });
    console.log(`✓ Assets copied from ${srcDir} to ${destDir}`);
  } catch (error) {
    console.error('✗ Error copying assets:', error);
    process.exitCode = 1;
  }
}

await copyAssets();