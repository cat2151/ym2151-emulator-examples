/**
 * YM2151 Random Parameter Example
 * 
 * This example runs until CTRL+C is pressed, toggling key on/off every 0.5 seconds.
 * All ADSR parameters and TL values are randomized on each toggle.
 * Volume-related registers are also randomized.
 */

import { Libymfm, SoundChipType } from './libymfm.js';
import Speaker from 'speaker';

// Configuration
const SOUND_SLOT_INDEX = 0;
const SAMPLING_RATE = 44100;
const SAMPLE_CHUNK_SIZE = 4096;
const SOUND_DRIVER_TICK_RATE = 60; // 60Hz tick rate
const YM2151_CLOCK = 3579545; // Standard YM2151 clock rate

// Toggle settings
const TOGGLE_INTERVAL_SECONDS = 0.5;

// YM2151 register constants
const YM2151_KEY_ON_ALL_OPERATORS = 0x78; // Bits 6-3 set (M1, M2, C1, C2)

/**
 * Get random integer between min and max (inclusive)
 */
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Initialize YM2151 chip with random parameters
 */
function initializeYM2151WithRandom(chip: Libymfm, slotId: number): void {
  // Reset all channels
  for (let channel = 0; channel < 8; channel++) {
    chip.soundSlotWrite(slotId, SoundChipType.YM2151, 0, 0x08, channel);
  }

  // Channel 0 configuration
  const channel = 0;

  // Pan: L+R (both speakers), FL: random, CON: 7 (all carriers for simplicity)
  const fl = randomInt(0, 7);
  chip.soundSlotWrite(slotId, SoundChipType.YM2151, 0, 0x20 + channel, 0xC0 | (fl << 3) | 0x07);

  // KC (Key Code) for ~440Hz: 0x4A (keep frequency constant for clarity)
  chip.soundSlotWrite(slotId, SoundChipType.YM2151, 0, 0x28 + channel, 0x4A);

  // KF (Key Fraction): random
  chip.soundSlotWrite(slotId, SoundChipType.YM2151, 0, 0x30 + channel, randomInt(0, 0xFF));

  // Configure operators (M1, M2, C1, C2) with random parameters
  const operators = [0, 8, 16, 24]; // Operator offsets
  
  console.log(`  Random parameters: FL=${fl}`);
  
  for (const op of operators) {
    const opOffset = op + channel;
    const opName = op === 0 ? 'M1' : op === 8 ? 'M2' : op === 16 ? 'C1' : 'C2';

    // DT1: random, MUL: random
    const dt1 = randomInt(0, 7);
    const mul = randomInt(0, 15);
    chip.soundSlotWrite(slotId, SoundChipType.YM2151, 0, 0x40 + opOffset, (dt1 << 4) | mul);

    // TL (Total Level): random (0-127)
    const tl = randomInt(0, 127);
    chip.soundSlotWrite(slotId, SoundChipType.YM2151, 0, 0x60 + opOffset, tl);

    // KS: random, AR: random (Attack Rate)
    const ks = randomInt(0, 3);
    const ar = randomInt(0, 31);
    chip.soundSlotWrite(slotId, SoundChipType.YM2151, 0, 0x80 + opOffset, (ks << 6) | ar);

    // AMS-EN: random, D1R: random (Decay 1 Rate)
    const amsEn = randomInt(0, 1);
    const d1r = randomInt(0, 31);
    chip.soundSlotWrite(slotId, SoundChipType.YM2151, 0, 0xA0 + opOffset, (amsEn << 7) | d1r);

    // DT2: random, D2R: random (Decay 2 Rate)
    const dt2 = randomInt(0, 3);
    const d2r = randomInt(0, 31);
    chip.soundSlotWrite(slotId, SoundChipType.YM2151, 0, 0xC0 + opOffset, (dt2 << 6) | d2r);

    // D1L: random, RR: random (Release Rate)
    const d1l = randomInt(0, 15);
    const rr = randomInt(0, 15);
    chip.soundSlotWrite(slotId, SoundChipType.YM2151, 0, 0xE0 + opOffset, (d1l << 4) | rr);

    console.log(`    ${opName}: TL=${tl}, AR=${ar}, D1R=${d1r}, D2R=${d2r}, RR=${rr}, KS=${ks}, DT1=${dt1}, DT2=${dt2}, MUL=${mul}`);
  }
}

/**
 * Toggle key on/off
 */
function toggleKey(chip: Libymfm, slotId: number, keyOn: boolean): void {
  const channel = 0;
  if (keyOn) {
    chip.soundSlotWrite(slotId, SoundChipType.YM2151, 0, 0x08, YM2151_KEY_ON_ALL_OPERATORS | channel);
  } else {
    chip.soundSlotWrite(slotId, SoundChipType.YM2151, 0, 0x08, channel);
  }
}

/**
 * Main function
 */
async function main() {
  console.log('YM2151 Random Parameter Example');
  console.log('=================================');
  console.log(`Sample Rate: ${SAMPLING_RATE}Hz`);
  console.log(`Key Toggle Interval: ${TOGGLE_INTERVAL_SECONDS} seconds`);
  console.log('Press CTRL+C to stop.');
  console.log('');

  // Initialize libymfm
  console.log('Initializing libymfm.wasm...');
  const chip = new Libymfm();
  await chip.init();
  console.log('✓ WASM module loaded');

  // Create sound slot
  console.log('Creating sound slot...');
  chip.soundSlotCreate(
    SOUND_SLOT_INDEX,
    SOUND_DRIVER_TICK_RATE,
    SAMPLING_RATE,
    SAMPLE_CHUNK_SIZE
  );
  console.log('✓ Sound slot created');

  // Add YM2151 chip
  console.log('Adding YM2151 sound chip...');
  chip.soundSlotAddSoundDevice(
    SOUND_SLOT_INDEX,
    SoundChipType.YM2151,
    1,
    YM2151_CLOCK
  );
  console.log('✓ YM2151 chip added');

  // Create speaker for direct audio playback
  console.log('');
  console.log('Initializing audio output...');
  const speaker = new Speaker({
    channels: 2,
    bitDepth: 16,
    sampleRate: SAMPLING_RATE,
  });
  console.log('✓ Audio output initialized');

  console.log('');
  console.log('Starting playback with random parameters...');
  console.log('');

  const samplesPerToggle = SAMPLING_RATE * TOGGLE_INTERVAL_SECONDS;

  let sampleCount = 0;
  let keyOn = false;
  let allBuffersAreZero = true;
  let isRunning = true;

  // Handle CTRL+C
  process.on('SIGINT', () => {
    console.log('\n');
    console.log('CTRL+C detected, stopping...');
    isRunning = false;
  });

  // Start with key ON and random parameters
  console.log('Setting initial random parameters and Key ON...');
  initializeYM2151WithRandom(chip, SOUND_SLOT_INDEX);
  toggleKey(chip, SOUND_SLOT_INDEX, true);
  keyOn = true;

  // Stream audio chunks directly to the speaker
  const playAudio = () => {
    return new Promise<void>((resolve, reject) => {
      speaker.on('error', reject);
      speaker.on('close', resolve);

      const generateNextChunk = () => {
        if (!isRunning) {
          speaker.end();
          return;
        }

        // Check if we need to toggle key
        const currentTogglePeriod = Math.floor(sampleCount / samplesPerToggle);
        const nextTogglePeriod = Math.floor((sampleCount + SAMPLE_CHUNK_SIZE) / samplesPerToggle);
        
        if (currentTogglePeriod !== nextTogglePeriod) {
          keyOn = !keyOn;
          
          if (keyOn) {
            // Key ON: Randomize all parameters before turning on
            console.log(`\nRandomizing parameters and Key ON (${(sampleCount / SAMPLING_RATE).toFixed(1)}s)...`);
            initializeYM2151WithRandom(chip, SOUND_SLOT_INDEX);
          }
          
          toggleKey(chip, SOUND_SLOT_INDEX, keyOn);
          
          if (!keyOn) {
            console.log(`Key OFF (${(sampleCount / SAMPLING_RATE).toFixed(1)}s)`);
          }
        }

        // Update sound driver
        chip.soundSlotUpdate(SOUND_SLOT_INDEX, 1);

        // Check if stream buffer is filled
        if (chip.soundSlotIsStreamFilled(SOUND_SLOT_INDEX)) {
          // Generate samples
          chip.soundSlotStream(SOUND_SLOT_INDEX);
          
          // Get the audio buffer
          const buffer = chip.soundSlotGetSamplingRef(SOUND_SLOT_INDEX, SAMPLE_CHUNK_SIZE);
          
          // Check if buffer contains non-zero values (only if we haven't found any yet)
          // This optimization skips the check once we've confirmed audio is being generated
          if (allBuffersAreZero) {
            for (let i = 0; i < buffer.length; i++) {
              if (buffer[i] !== 0) {
                allBuffersAreZero = false;
                console.log('✓ Non-zero audio detected!');
                break;
              }
            }
          }
          
          // Convert Int16Array to Buffer for speaker
          const audioBuffer = Buffer.from(buffer.buffer, buffer.byteOffset, buffer.byteLength);
          
          // Write to speaker
          const canContinue = speaker.write(audioBuffer);
          
          sampleCount += SAMPLE_CHUNK_SIZE;

          if (canContinue) {
            setImmediate(generateNextChunk);
          } else {
            speaker.once('drain', generateNextChunk);
          }
        } else {
          setImmediate(generateNextChunk);
        }
      };

      generateNextChunk();
    });
  };

  await playAudio();
  
  console.log('');
  
  // Check if all buffers were zero
  if (allBuffersAreZero) {
    console.error('ERROR: All generated audio buffers were zero! No sound was produced.');
    console.error('This indicates that the YM2151 chip is not generating any audio.');
    process.exit(1);
  }
  
  console.log('✓ Playback stopped');

  // Cleanup
  chip.soundSlotDrop(SOUND_SLOT_INDEX);

  console.log('');
  console.log('Done!');
}

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
