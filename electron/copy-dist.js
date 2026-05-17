const fs = require('fs');
const path = require('path');

const frontendDist = path.join(__dirname, '../frontend/dist');
const electronDist = path.join(__dirname, 'frontend-dist');
const buildDir = path.join(__dirname, 'build');
const assetIcon = path.join(__dirname, '../frontend/src/assets/hero.png');
const buildIcon = path.join(buildDir, 'icon.png');

console.log('--- Anti Gravity OS Packaging Setup ---');

// 1. Stage Frontend Dist
console.log(`Checking frontend build directory: ${frontendDist}`);
if (!fs.existsSync(frontendDist)) {
  console.error('ERROR: Frontend dist directory not found!');
  console.error('Please build the frontend first by running: npm run build --prefix frontend');
  process.exit(1);
}

if (fs.existsSync(electronDist)) {
  console.log(`Cleaning existing electron/frontend-dist directory...`);
  fs.rmSync(electronDist, { recursive: true, force: true });
}

console.log(`Copying frontend build files to ${electronDist}...`);
fs.cpSync(frontendDist, electronDist, { recursive: true });
console.log('✔ Frontend distribution files successfully staged.');

// 2. Setup Build Resources (Icons)
console.log(`Checking build resources directory: ${buildDir}`);
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
}

if (fs.existsSync(assetIcon)) {
  console.log(`Copying app icon to ${buildIcon}...`);
  fs.copyFileSync(assetIcon, buildIcon);
  console.log('✔ Application icon successfully staged.');
} else {
  console.warn('⚠ Asset icon not found at ' + assetIcon);
}

console.log('✔ Anti Gravity OS is ready for Electron packaging!');
