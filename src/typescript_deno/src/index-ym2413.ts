/**
 * YM2413 (OPLL) Simple Example
 * 
 * This example plays a simple 440Hz tone using the YM2413 chip.
 * Used for comparison to determine if audio generation issues are YM2151-specific.
 */

import { Libymfm, SoundChipType } from './libymfm.js';
import Speaker from 'speaker';

// Configuration
const SOUND_SLOT_INDEX = 0;
const SAMPLING_RATE = 44100;
const SAMPLE_CHUNK_SIZE = 4096;
const SOUND_DRIVER_TICK_RATE = 60; // 60Hz tick rate
const YM2413_CLOCK = 3579545; // Standard OPLL clock

// Duration in seconds
const DURATION_SECONDS = 3;

/**
 * Initialize YM2413 chip for a simple tone
 * YM2413 (OPLL) is a simplified FM chip with built-in instruments
 */
function initializeYM2413(chip: Libymfm, slotId: number): void {
  // YM2413 Register Map:
  // 0x10-0x18: F-Number Low (8 bits) for channels 0-8
  // 0x20-0x28: Key On, Block, F-Number High (4 bits) for channels 0-8
  // 0x30-0x38: Instrument, Volume for channels 0-8
  
  const channel = 0;
  
  // Calculate F-Number for 440Hz
  // F-Number = (Frequency * 2^19) / (Clock / 72)
  // For 440Hz with 3.579545MHz clock:
  // F-Number ≈ 440 * 524288 / 49715.9 ≈ 4636
  const fnum = 4636;
  const block = 4; // Octave
  
  // Set instrument to 0 (Piano) and volume to maximum (0 = loudest in YM2413)
  chip.soundSlotWrite(slotId, SoundChipType.YM2413, 0, 0x30 + channel, 0x00);
  
  // Set F-Number low byte
  chip.soundSlotWrite(slotId, SoundChipType.YM2413, 0, 0x10 + channel, fnum & 0xFF);
  
  // Set Key On (bit 4), Block (bits 3-1), F-Number high (bit 0)
  const fnumHigh = (fnum >> 8) & 0x01;
  const keyOnBit = 1 << 4;
  chip.soundSlotWrite(slotId, SoundChipType.YM2413, 0, 0x20 + channel, keyOnBit | (block << 1) | fnumHigh);
}

/**
 * Main function
 */
async function main() {
  console.log('YM2413 OPLL Simple Example');
  console.log('===========================');
  console.log(`Sample Rate: ${SAMPLING_RATE}Hz`);
  console.log(`Duration: ${DURATION_SECONDS} seconds`);
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

  // Add YM2413 chip
  console.log('Adding YM2413 sound chip...');
  chip.soundSlotAddSoundDevice(
    SOUND_SLOT_INDEX,
    SoundChipType.YM2413,
    1,
    YM2413_CLOCK
  );
  console.log('✓ YM2413 chip added');

  // Initialize YM2413 for sound generation
  console.log('Configuring YM2413 for 440Hz tone...');
  initializeYM2413(chip, SOUND_SLOT_INDEX);
  console.log('✓ YM2413 configured');

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
  console.log(`Playing audio for ${DURATION_SECONDS} seconds...`);
  console.log('');

  const totalSamples = SAMPLING_RATE * DURATION_SECONDS;
  const totalChunks = Math.ceil(totalSamples / SAMPLE_CHUNK_SIZE);

  let generatedChunks = 0;
  let allBuffersAreZero = true;
  const startTime = Date.now();

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

        // Update sound driver
        chip.soundSlotUpdate(SOUND_SLOT_INDEX, 1);

        // Check if stream buffer is filled
        if (chip.soundSlotIsStreamFilled(SOUND_SLOT_INDEX)) {
          // Generate samples
          chip.soundSlotStream(SOUND_SLOT_INDEX);
          
          // Get the audio buffer
          const buffer = chip.soundSlotGetSamplingRef(SOUND_SLOT_INDEX, SAMPLE_CHUNK_SIZE);
          
          // Check if buffer contains non-zero values
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

          // Progress indicator
          const progress = Math.floor((generatedChunks / totalChunks) * 100);
          const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
          process.stdout.write(`\rProgress: ${progress}% (${elapsed}s)`);

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
  
  console.log('\n');
  
  // Check if all buffers were zero
  if (allBuffersAreZero) {
    console.error('ERROR: All generated audio buffers were zero! No sound was produced.');
    console.error('This indicates that the YM2413 chip is not generating any audio.');
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
