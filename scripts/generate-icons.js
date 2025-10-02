#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Icon sizes needed for iOS
const iconSizes = {
  'icon.png': 1024,              // Main app icon
  'adaptive-icon.png': 1024,     // Android adaptive icon  
  'favicon.png': 48,             // Web favicon
  'splash-icon.png': 1024,       // Splash screen icon
};

const sourceSVG = path.join(__dirname, '../assets/nanquim-icon.svg');
const assetsDir = path.join(__dirname, '../assets');

console.log('🚀 Generating app icons from SVG...');

// Check if SVG exists
if (!fs.existsSync(sourceSVG)) {
  console.error('❌ Source SVG not found:', sourceSVG);
  process.exit(1);
}

// Function to convert SVG to PNG using librsvg (if available) or ImageMagick
function convertSvgToPng(inputSvg, outputPng, size) {
  try {
    // Try using rsvg-convert first (more accurate)
    try {
      execSync(`rsvg-convert -w ${size} -h ${size} "${inputSvg}" -o "${outputPng}"`);
      return true;
    } catch (e) {
      // Fallback to ImageMagick convert
      try {
        execSync(`convert -background transparent -size ${size}x${size} "${inputSvg}" "${outputPng}"`);
        return true;
      } catch (e) {
        console.warn(`⚠️  Could not convert ${path.basename(outputPng)} - you may need to install rsvg-convert or ImageMagick`);
        return false;
      }
    }
  } catch (error) {
    console.error(`❌ Error converting ${path.basename(outputPng)}:`, error.message);
    return false;
  }
}

// Generate all icon sizes
for (const [filename, size] of Object.entries(iconSizes)) {
  const outputPath = path.join(assetsDir, filename);
  console.log(`📱 Generating ${filename} (${size}x${size})...`);
  
  const success = convertSvgToPng(sourceSVG, outputPath, size);
  if (success) {
    console.log(`✅ Created ${filename}`);
  } else {
    console.log(`⚠️  Skipped ${filename} - manual conversion needed`);
  }
}

console.log('\n🎉 Icon generation complete!');
console.log('\n📋 Next steps:');
console.log('1. Verify all icons look correct');
console.log('2. Test the app on device/simulator');
console.log('3. Submit update to App Store');
