const http = require('http');

function checkUrl(url) {
  return new Promise((resolve) => {
    http.get(url, (res) => {
      resolve({ url, status: res.statusCode, size: res.headers['content-length'] });
    }).on('error', (err) => {
      resolve({ url, error: err.message });
    });
  });
}

async function run() {
  const tests = [
    'http://localhost:3000/images/produce/cabbage.jpg',
    'http://localhost:3000/images/produce/cauliflower.jpg',
    'http://localhost:3000/images/produce/cucumber.jpg',
    'http://localhost:3000/images/produce/watermelon.jpg',
    'http://localhost:5000/images/produce/cabbage.jpg',
    'http://localhost:5000/images/produce/cauliflower.jpg',
    'http://localhost:5000/images/produce/cucumber.jpg',
    'http://localhost:5000/images/produce/watermelon.jpg'
  ];

  for (const url of tests) {
    const res = await checkUrl(url);
    console.log(`${res.status === 200 ? 'OK' : 'ERR'} [${res.status || 'FAIL'}] ${url} (${res.size || 'unknown'} B)`);
  }
}

run();
