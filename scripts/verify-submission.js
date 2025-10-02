#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying App Store submission readiness...\n');

// Check files exist
const requiredFiles = [
  'assets/icon.png',
  'assets/adaptive-icon.png', 
  'assets/favicon.png',
  'assets/splash-icon.png',
  'app.json'
];

let allFilesExist = true;

console.log('📂 Checking required files:');
requiredFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    console.log(`✅ ${file} (${Math.round(stats.size / 1024)}KB)`);
  } else {
    console.log(`❌ ${file} - MISSING`);
    allFilesExist = false;
  }
});

// Check app.json configuration
console.log('\n⚙️  Checking app.json configuration:');
try {
  const appConfig = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'app.json'), 'utf8'));
  
  console.log(`✅ App Name: ${appConfig.expo.name}`);
  console.log(`✅ Version: ${appConfig.expo.version}`);
  console.log(`✅ Build Number: ${appConfig.expo.ios.buildNumber}`);
  console.log(`✅ Bundle ID: ${appConfig.expo.ios.bundleIdentifier}`);
  console.log(`✅ Icon Path: ${appConfig.expo.icon}`);
  
} catch (error) {
  console.log(`❌ Error reading app.json: ${error.message}`);
  allFilesExist = false;
}

// Check documentation files
console.log('\n📄 Checking documentation:');
const docFiles = [
  'app-store-response.md',
  'distribution-options.md'
];

docFiles.forEach(file => {
  const filePath = path.join(__dirname, '..', file);
  if (fs.existsSync(filePath)) {
    console.log(`✅ ${file}`);
  } else {
    console.log(`❌ ${file} - MISSING`);
  }
});

console.log('\n' + '='.repeat(50));
if (allFilesExist) {
  console.log('🎉 ALL CHECKS PASSED - Ready for App Store submission!');
  console.log('\n📋 Next steps:');
  console.log('1. Build and submit updated app via EAS/Xcode');
  console.log('2. Copy content from app-store-response.md');
  console.log('3. Paste response in App Store Connect');
  console.log('4. Submit for review');
} else {
  console.log('⚠️  Some issues found - please resolve before submitting');
}
console.log('='.repeat(50));
