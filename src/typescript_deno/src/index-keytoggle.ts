/**
 * YM2151 Key Toggle Example
 * 
 * This example plays 3 seconds with key on/off toggling every 0.5 seconds.
 * - Maximum attack speed (AR=31)
 * - Minimum decay speed (D1R=0, D2R=0)
 * - Minimum TL (Total Level = 0)
 */

import { Libymfm, SoundChipType } from './libymfm.js';
import Speaker from 'speaker';

// Configuration
const SOUND_SLOT_INDEX = 0;
const SAMPLING_RATE = 44100;
const SAMPLE_CHUNK_SIZE = 4096;
const SOUND_DRIVER_TICK_RATE = 60; // 60Hz tick rate
const YM2151_CLOCK = 3579545; // Standard YM2151 clock rate

// Duration and toggle settings
const DURATION_SECONDS = 3;
const TOGGLE_INTERVAL_SECONDS = 0.5;

// YM2151 register constants
const YM2151_KEY_ON_ALL_OPERATORS = 0x78; // Bits 6-3 set (M1, M2, C1, C2)

/**
 * Initialize YM2151 chip with fast attack and slow decay
 */
function initializeYM2151(chip: Libymfm, slotId: number): void {
  // Reset all channels
  for (let channel = 0; channel < 8; channel++) {
    chip.soundSlotWrite(slotId, SoundChipType.YM2151, 0, 0x08, channel);
  }

  // Channel 0 configuration
  const channel = 0;

  // Pan: L+R (both speakers), FL: 7, CON: 7 (all carriers)
  chip.soundSlotWrite(slotId, SoundChipType.YM2151, 0, 0x20 + channel, 0xC7);

  // KC (Key Code) for ~440Hz: 0x4A
  chip.soundSlotWrite(slotId, SoundChipType.YM2151, 0, 0x28 + channel, 0x4A);

  // KF (Key Fraction): 0x00
  chip.soundSlotWrite(slotId, SoundChipType.YM2151, 0, 0x30 + channel, 0x00);

  // Configure operators (M1, M2, C1, C2)
  const operators = [0, 8, 16, 24]; // Operator offsets
  
  for (const op of operators) {
    const opOffset = op + channel;

    // DT1: 0, MUL: 1 (1x frequency multiplier)
    chip.soundSlotWrite(slotId, SoundChipType.YM2151, 0, 0x40 + opOffset, 0x01);

    // TL (Total Level): 0 (minimum = maximum volume)
    chip.soundSlotWrite(slotId, SoundChipType.YM2151, 0, 0x60 + opOffset, 0x00);

    // KS: 0, AR: 31 (maximum attack speed)
    chip.soundSlotWrite(slotId, SoundChipType.YM2151, 0, 0x80 + opOffset, 0x1F);

    // AMS-EN: 0, D1R: 0 (minimum decay 1 speed)
    chip.soundSlotWrite(slotId, SoundChipType.YM2151, 0, 0xA0 + opOffset, 0x00);

    // DT2: 0, D2R: 0 (minimum decay 2 speed)
    chip.soundSlotWrite(slotId, SoundChipType.YM2151, 0, 0xC0 + opOffset, 0x00);

    // D1L: 0, RR: 15 (fast release)
    chip.soundSlotWrite(slotId, SoundChipType.YM2151, 0, 0xE0 + opOffset, 0x0F);
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
  console.log('YM2151 Key Toggle Example');
  console.log('==========================');
  console.log(`Sample Rate: ${SAMPLING_RATE}Hz`);
  console.log(`Duration: ${DURATION_SECONDS} seconds`);
  console.log(`Key Toggle Interval: ${TOGGLE_INTERVAL_SECONDS} seconds`);
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

  // Initialize YM2151 for sound generation
  console.log('Configuring YM2151 with fast attack/slow decay...');
  initializeYM2151(chip, SOUND_SLOT_INDEX);
  console.log('✓ YM2151 configured');

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
  console.log(`Playing audio with key toggle for ${DURATION_SECONDS} seconds...`);
  console.log('');

  const totalSamples = SAMPLING_RATE * DURATION_SECONDS;
  const totalChunks = Math.ceil(totalSamples / SAMPLE_CHUNK_SIZE);
  const samplesPerToggle = SAMPLING_RATE * TOGGLE_INTERVAL_SECONDS;

  let generatedChunks = 0;
  let sampleCount = 0;
  let keyOn = false;
  let allBuffersAreZero = true;
  const startTime = Date.now();

  // Start with key ON
  toggleKey(chip, SOUND_SLOT_INDEX, true);
  keyOn = true;
  console.log('Key ON');

  // Stream audio chunks directly to the speaker
  const playAudio = () => {
    return new Promise<void>((resolve, reject) => {
      speaker.on('error', reject);
      speaker.on('close', resolve);

      const generateNextChunk = () => {
        if (generatedChunks >= totalChunks) {
          speaker.end();
          return;
        }

        // Check if we need to toggle key
        const currentTogglePeriod = Math.floor(sampleCount / samplesPerToggle);
        const nextTogglePeriod = Math.floor((sampleCount + SAMPLE_CHUNK_SIZE) / samplesPerToggle);
        
        if (currentTogglePeriod !== nextTogglePeriod) {
          keyOn = !keyOn;
          toggleKey(chip, SOUND_SLOT_INDEX, keyOn);
          console.log(`Key ${keyOn ? 'ON' : 'OFF'} (${(sampleCount / SAMPLING_RATE).toFixed(1)}s)`);
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
                break;
              }
            }
          }
          
          // Convert Int16Array to Buffer for speaker
          const audioBuffer = Buffer.from(buffer.buffer, buffer.byteOffset, buffer.byteLength);
          
          // Write to speaker
          const canContinue = speaker.write(audioBuffer);
          
          generatedChunks++;
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
  
  console.log('✓ Playback complete');

  // Cleanup
  chip.soundSlotDrop(SOUND_SLOT_INDEX);

  console.log('');
  console.log('Done!');
}

main().catch(error => {
  console.error('Error:', error);
  process.exit(1);
});
