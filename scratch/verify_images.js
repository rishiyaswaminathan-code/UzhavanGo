const fs = require('fs');
const path = require('path');

const fe = 'c:/Users/acer/Documents/UzhavanGo/frontend/public/images/produce';
const be = 'c:/Users/acer/Documents/UzhavanGo/backend/public/images/produce';
const targets = [
  'cabbage', 'cauliflower', 'cucumber', 'tomato', 'carrot', 'onion', 'potato',
  'apple', 'mango', 'banana', 'orange', 'grapes', 'watermelon', 'pineapple',
  'pomegranate', 'guava'
];

console.log('--- CHECKING PRODUCE IMAGES ---');
let allGood = true;
targets.forEach(t => {
  const feP = path.join(fe, t + '.jpg');
  const beP = path.join(be, t + '.jpg');
  const feSize = fs.existsSync(feP) ? fs.statSync(feP).size : null;
  const beSize = fs.existsSync(beP) ? fs.statSync(beP).size : null;
  if (!feSize || !beSize || feSize < 1000 || beSize < 1000) {
    allGood = false;
  }
  console.log(`${t.padEnd(15)} FE: ${feSize ? feSize + ' B' : 'MISSING'} | BE: ${beSize ? beSize + ' B' : 'MISSING'}`);
});
console.log('All targets valid:', allGood);
