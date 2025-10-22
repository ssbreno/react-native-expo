#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

function getDirectorySize(dirPath) {
  let totalSize = 0;

  try {
    const items = fs.readdirSync(dirPath, { withFileTypes: true });

    for (const item of items) {
      const fullPath = path.join(dirPath, item.name);

      if (item.isDirectory()) {
        totalSize += getDirectorySize(fullPath);
      } else {
        const stats = fs.statSync(fullPath);
        totalSize += stats.size;
      }
    }
  } catch (error) {
    // Ignore errors for inaccessible files
  }

  return totalSize;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

function analyzeDirectory(dirPath, name) {
  const size = getDirectorySize(dirPath);
  return { name, size, formatted: formatBytes(size) };
}

console.log('\n📊 Bundle Size Analysis\n');
console.log('='.repeat(60));

const distPath = path.join(__dirname, 'dist');

if (!fs.existsSync(distPath)) {
  console.log('\n❌ No dist folder found. Run "npm run export:prod" first.\n');
  process.exit(1);
}

const results = [];

// Analyze main directories
const dirs = [
  { path: path.join(distPath, '_expo'), name: 'Expo Runtime' },
  { path: path.join(distPath, 'assets'), name: 'Assets' },
  { path: path.join(distPath, 'bundles'), name: 'App Bundles' },
];

for (const dir of dirs) {
  if (fs.existsSync(dir.path)) {
    results.push(analyzeDirectory(dir.path, dir.name));
  }
}

// Total size
const totalSize = getDirectorySize(distPath);
results.push({ name: 'TOTAL', size: totalSize, formatted: formatBytes(totalSize) });

// Print results
results.forEach(result => {
  const percentage =
    result.name === 'TOTAL' ? '' : ` (${((result.size / totalSize) * 100).toFixed(1)}%)`;
  console.log(`${result.name.padEnd(20)} ${result.formatted.padStart(12)}${percentage}`);
});

console.log('='.repeat(60));

// Detailed JS bundles
const jsPath = path.join(distPath, '_expo', 'static', 'js');
if (fs.existsSync(jsPath)) {
  console.log('\n📦 JavaScript Bundles:\n');

  const platforms = fs.readdirSync(jsPath);
  platforms.forEach(platform => {
    const platformPath = path.join(jsPath, platform);
    if (fs.statSync(platformPath).isDirectory()) {
      const files = fs.readdirSync(platformPath);
      console.log(`\n${platform.toUpperCase()}:`);

      files.forEach(file => {
        const filePath = path.join(platformPath, file);
        const stats = fs.statSync(filePath);
        console.log(`  ${file.padEnd(45)} ${formatBytes(stats.size).padStart(10)}`);
      });
    }
  });
}

// Font analysis
const fontsPath = path.join(distPath, 'assets', 'fonts');
if (fs.existsSync(fontsPath)) {
  console.log('\n🔤 Fonts:\n');
  const fonts = fs.readdirSync(fontsPath);
  const fontSizes = fonts
    .map(font => ({
      name: font,
      size: fs.statSync(path.join(fontsPath, font)).size,
    }))
    .sort((a, b) => b.size - a.size);

  fontSizes.forEach(font => {
    console.log(`  ${font.name.padEnd(50)} ${formatBytes(font.size).padStart(10)}`);
  });

  console.log(`\n  Total Fonts: ${formatBytes(fontSizes.reduce((sum, f) => sum + f.size, 0))}`);
}

console.log('\n' + '='.repeat(60));
console.log('\n💡 Tips to reduce bundle size:');
console.log('  • Remove unused icon fonts from @expo/vector-icons');
console.log('  • Use dynamic imports for large screens');
console.log('  • Enable Hermes (already enabled ✓)');
console.log('  • Review and remove unused dependencies');
console.log('  • Use image optimization for assets\n');
