#!/usr/bin/env node

/**
 * Image Optimization Script
 *
 * This script helps identify large images that should be optimized.
 *
 * To actually optimize images, install sharp-cli:
 * npm install -g sharp-cli
 *
 * Then run:
 * sharp -i assets/images -o assets/images-optimized -q 80
 */

const fs = require('fs');
const path = require('path');

function getFileSizeInKB(filePath) {
  const stats = fs.statSync(filePath);
  return (stats.size / 1024).toFixed(2);
}

function findImages(dir, fileList = []) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      findImages(filePath, fileList);
    } else if (/\.(jpg|jpeg|png|gif|webp)$/i.test(file)) {
      const sizeKB = getFileSizeInKB(filePath);
      fileList.push({
        path: filePath,
        size: parseFloat(sizeKB),
        name: file,
      });
    }
  });

  return fileList;
}

console.log('\n🖼️  Image Optimization Analysis\n');
console.log('='.repeat(80));

const assetsDir = path.join(__dirname, '..', 'assets');

if (!fs.existsSync(assetsDir)) {
  console.log('\n❌ Assets directory not found at:', assetsDir);
  console.log("\nThis is normal if you don't have an assets folder yet.\n");
  process.exit(0);
}

const images = findImages(assetsDir);

if (images.length === 0) {
  console.log('\n✅ No images found in assets directory.\n');
  process.exit(0);
}

// Sort by size descending
images.sort((a, b) => b.size - a.size);

let totalSize = 0;
const largeImages = [];

console.log('\n📊 All Images:\n');

images.forEach(img => {
  totalSize += img.size;
  const relativePath = path.relative(path.join(__dirname, '..'), img.path);
  const sizeStr = `${img.size.toFixed(2)} KB`;

  console.log(`  ${relativePath.padEnd(60)} ${sizeStr.padStart(12)}`);

  // Flag images larger than 200KB
  if (img.size > 200) {
    largeImages.push(img);
  }
});

console.log('\n' + '='.repeat(80));
console.log(`\nTotal Images: ${images.length}`);
console.log(`Total Size: ${(totalSize / 1024).toFixed(2)} MB (${totalSize.toFixed(2)} KB)`);

if (largeImages.length > 0) {
  console.log('\n⚠️  Large Images (> 200 KB) - Consider Optimization:\n');

  largeImages.forEach(img => {
    const relativePath = path.relative(path.join(__dirname, '..'), img.path);
    console.log(`  • ${relativePath} (${img.size.toFixed(2)} KB)`);
  });

  console.log('\n💡 Optimization Recommendations:');
  console.log('\n  1. Install sharp-cli globally:');
  console.log('     npm install -g sharp-cli');
  console.log('\n  2. Optimize images:');
  console.log('     sharp -i assets/images -o assets/images-optimized -f webp -q 80');
  console.log('\n  3. Or use online tools:');
  console.log('     • TinyPNG: https://tinypng.com');
  console.log('     • Squoosh: https://squoosh.app');
  console.log('\n  4. Target compression:');
  console.log('     • PNGs: Use lossy compression or convert to WebP');
  console.log('     • JPEGs: Quality 70-80 is usually good enough');
  console.log('     • Consider WebP format for better compression');
} else {
  console.log('\n✅ All images are reasonably sized (< 200 KB each).');
}

console.log('\n' + '='.repeat(80) + '\n');

// Estimate potential savings
const estimatedSavings = largeImages.reduce((sum, img) => {
  // Assume 30-50% compression is achievable
  return sum + img.size * 0.4;
}, 0);

if (estimatedSavings > 0) {
  console.log(`📉 Estimated Potential Savings: ${(estimatedSavings / 1024).toFixed(2)} MB\n`);
}
