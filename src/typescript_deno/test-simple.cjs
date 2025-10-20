// Simple test without speaker dependency to see if we can create the test
console.log('Simple test to check basic code structure');

// Configuration
const SAMPLING_RATE = 44100;
const DURATION_SECONDS = 0.5;

// Calculate samples
const samples = SAMPLING_RATE * DURATION_SECONDS;
const buffer = Buffer.alloc(samples * 4); // 2 channels * 16bit

console.log(`Samples: ${samples}`);
console.log(`Buffer size: ${buffer.length} bytes`);

// Generate a 440Hz sine wave
for (let i = 0; i < samples; i++) {
  const value = Math.sin(2 * Math.PI * 440 * i / SAMPLING_RATE) * 32767;
  buffer.writeInt16LE(value, i * 4);
  buffer.writeInt16LE(value, i * 4 + 2);
}

// Check if buffer has non-zero values
let hasNonZero = false;
for (let i = 0; i < buffer.length; i++) {
  if (buffer[i] !== 0) {
    hasNonZero = true;
    break;
  }
}

console.log(`Buffer has non-zero values: ${hasNonZero}`);
console.log(`First 40 bytes: ${Array.from(buffer.slice(0, 40))}`);
