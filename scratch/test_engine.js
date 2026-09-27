const path = require('path');
const { identifyProduce, getProduceImage } = require(path.join(__dirname, '../backend/utils/produceImages'));

const testCases = [
  { input: 'Cabbage', expected: '/images/produce/cabbage.jpg', expectedId: 'cabbage' },
  { input: 'Fresh Green Cabbage 50kg', expected: '/images/produce/cabbage.jpg', expectedId: 'cabbage' },
  { input: 'Cauliflower', expected: '/images/produce/cauliflower.jpg', expectedId: 'cauliflower' },
  { input: 'Gobi / Cauliflower', expected: '/images/produce/cauliflower.jpg', expectedId: 'cauliflower' },
  { input: 'Cucumber', expected: '/images/produce/cucumber.jpg', expectedId: 'cucumber' },
  { input: 'Tomato', expected: '/images/produce/tomato.jpg', expectedId: 'tomato' },
  { input: 'Carrot', expected: '/images/produce/carrot.jpg', expectedId: 'carrot' },
  { input: 'Onion', expected: '/images/produce/onion.jpg', expectedId: 'onion' },
  { input: 'Potato', expected: '/images/produce/potato.jpg', expectedId: 'potato' },
  { input: 'Apple', expected: '/images/produce/apple.jpg', expectedId: 'apple' },
  { input: 'Pineapple', expected: '/images/produce/pineapple.jpg', expectedId: 'pineapple' },
  { input: 'Custard Apple', expected: '/images/produce/custard_apple.jpg', expectedId: 'custard_apple' },
  { input: 'Mango', expected: '/images/produce/mango.jpg', expectedId: 'mango' },
  { input: 'Banana', expected: '/images/produce/banana.jpg', expectedId: 'banana' },
  { input: 'Orange', expected: '/images/produce/orange.jpg', expectedId: 'orange' },
  { input: 'Grapes', expected: '/images/produce/grapes.jpg', expectedId: 'grapes' },
  { input: 'Pomegranate', expected: '/images/produce/pomegranate.jpg', expectedId: 'pomegranate' },
  { input: 'Guava', expected: '/images/produce/guava.jpg', expectedId: 'guava' },
  { input: 'Watermelon', expected: '/images/produce/watermelon.jpg', expectedId: 'watermelon' },
  { input: 'Exotic Unknown Herb XYZ', expected: null, expectedId: null }
];

console.log('--- TESTING PRODUCE RESOLUTION ENGINE ---');
let allPassed = true;
testCases.forEach(tc => {
  const result = getProduceImage(tc.input);
  const identified = identifyProduce(tc.input);
  const idMatch = (identified?.id || null) === tc.expectedId;
  const imgMatch = result === tc.expected;
  const passed = idMatch && imgMatch;
  if (!passed) allPassed = false;
  console.log(`[${passed ? 'PASS' : 'FAIL'}] "${tc.input}" -> id: ${identified?.id || 'null'}, image: ${result}`);
});

console.log('\nAll tests passed:', allPassed);
process.exit(allPassed ? 0 : 1);
