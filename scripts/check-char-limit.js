#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'app-store-response-short.md');

if (!fs.existsSync(filePath)) {
  console.log('❌ File not found:', filePath);
  process.exit(1);
}

const content = fs.readFileSync(filePath, 'utf8');
const charCount = content.length;
const limit = 4000;

console.log('📏 Apple App Store Response Character Count');
console.log('==========================================');
console.log(`Characters: ${charCount}/${limit}`);
console.log(`Remaining: ${limit - charCount} characters`);

if (charCount <= limit) {
  console.log('✅ WITHIN LIMIT - Ready to submit!');
} else {
  console.log('❌ EXCEEDS LIMIT - Please shorten the response');
}

console.log('\n📋 Copy content from: app-store-response-short.md');
console.log('📝 Paste into App Store Connect response field');
