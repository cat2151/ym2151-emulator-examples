/**
 * YM2151 (OPM) Emulator Example
 * 
 * This example demonstrates basic YM2151 sound generation using libymfm.wasm.
 * It plays a simple 440Hz tone (A4) using FM synthesis directly to the speakers.
 */

import { Libymfm, SoundChipType } from './libymfm.js';
import Speaker from 'speaker';

// Configuration
const SOUND_SLOT_INDEX = 0;
const SAMPLING_RATE = 44100;
const SAMPLE_CHUNK_SIZE = 4096;
const SOUND_DRIVER_TICK_RATE = 60; // 60Hz tick rate
const YM2151_CLOCK = 3579545; // Standard YM2151 clock rate

// Duration in seconds
const DURATION_SECONDS = 3;

// YM2151 register constants
const YM2151_KEY_ON_ALL_OPERATORS = 0x78; // Bits 6-3 set (M1, M2, C1, C2)

/**
 * Initialize YM2151 chip with basic settings for a simple tone
 */
function initializeYM2151(chip: Libymfm, slotId: number): void {
  // Reset all channels
  for (let channel = 0; channel < 8; channel++) {
    chip.soundSlotWrite(slotId, SoundChipType.YM2151, 0, 0x08, channel);
  }

  // Channel 0 configuration
  const channel = 0;

  // Pan: L+R (both speakers), FL: 7, CON: 7 (all carriers)
  // Register 0x20-0x27: RL, FL, CON
  chip.soundSlotWrite(slotId, SoundChipType.YM2151, 0, 0x20 + channel, 0xC7);

  // KC (Key Code) for ~440Hz: 0x4A
  // Register 0x28-0x2F: KC (Key Code)
  chip.soundSlotWrite(slotId, SoundChipType.YM2151, 0, 0x28 + channel, 0x4A);

  // KF (Key Fraction): 0x00
  // Register 0x30-0x37: KF (Key Fraction)
  chip.soundSlotWrite(slotId, SoundChipType.YM2151, 0, 0x30 + channel, 0x00);

  // Configure operators (M1, M2, C1, C2)
  const operators = [0, 8, 16, 24]; // Operator offsets
  
  for (const op of operators) {
    const opOffset = op + channel;

    // DT1: 0, MUL: 1 (1x frequency multiplier)
    // Register 0x40-0x5F: DT1, MUL
    chip.soundSlotWrite(slotId, SoundChipType.YM2151, 0, 0x40 + opOffset, 0x01);

    // TL (Total Level): 0 for carriers, 127 for modulators (in CON=7, all are carriers)
    // Register 0x60-0x7F: TL
    chip.soundSlotWrite(slotId, SoundChipType.YM2151, 0, 0x60 + opOffset, 0x00);

    // KS: 0, AR: 31 (fast attack)
    // Register 0x80-0x9F: KS, AR
    chip.soundSlotWrite(slotId, SoundChipType.YM2151, 0, 0x80 + opOffset, 0x1F);

    // AMS-EN: 0, D1R: 0 (no decay 1)
    // Register 0xA0-0xBF: AMS-EN, D1R
    chip.soundSlotWrite(slotId, SoundChipType.YM2151, 0, 0xA0 + opOffset, 0x00);

    // DT2: 0, D2R: 0 (no decay 2)
    // Register 0xC0-0xDF: DT2, D2R
    chip.soundSlotWrite(slotId, SoundChipType.YM2151, 0, 0xC0 + opOffset, 0x00);

    // D1L: 0, RR: 15 (fast release)
    // Register 0xE0-0xFF: D1L, RR
    chip.soundSlotWrite(slotId, SoundChipType.YM2151, 0, 0xE0 + opOffset, 0x0F);
  }

  // Key On for all operators on channel 0
  // Register 0x08: Key On/Off
  // Bits 6-3: Operator select (M1=bit3, M2=bit4, C1=bit5, C2=bit6)
  // Bits 2-0: Channel select
  chip.soundSlotWrite(slotId, SoundChipType.YM2151, 0, 0x08, YM2151_KEY_ON_ALL_OPERATORS | channel);
}

/**
 * Main function
 */
async function main() {
  console.log('YM2151 Emulator Example');
  console.log('=======================');
  console.log(`Sample Rate: ${SAMPLING_RATE}Hz`);
  console.log(`Chunk Size: ${SAMPLE_CHUNK_SIZE} samples`);
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

  // Add YM2151 chip
  console.log('Adding YM2151 sound chip...');
  chip.soundSlotAddSoundDevice(
    SOUND_SLOT_INDEX,
    SoundChipType.YM2151,
    1, // number of chips
    YM2151_CLOCK
  );
  console.log('✓ YM2151 chip added');

  // Initialize YM2151 for sound generation
  console.log('Configuring YM2151 for 440Hz tone...');
  initializeYM2151(chip, SOUND_SLOT_INDEX);
  console.log('✓ YM2151 configured');

  // Create speaker for direct audio playback
  console.log('');
  console.log('Initializing audio output...');
  const speaker = new Speaker({
    channels: 2,          // Stereo
    bitDepth: 16,         // 16-bit samples
    sampleRate: SAMPLING_RATE,
  });
  console.log('✓ Audio output initialized');

  // Play audio directly
  console.log('');
  console.log(`Playing audio for ${DURATION_SECONDS} seconds...`);
  console.log('Press Ctrl+C to stop.');
  console.log('');

  const totalSamples = SAMPLING_RATE * DURATION_SECONDS;
  const totalChunks = Math.ceil(totalSamples / SAMPLE_CHUNK_SIZE);

  let generatedChunks = 0;
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

        // Update sound driver (tick)
        // Note: The WASM module internally handles timing based on the configured tick rate (60Hz)
        // and will fill the output buffer when enough samples have been accumulated
        chip.soundSlotUpdate(SOUND_SLOT_INDEX, 1);

        // Check if stream buffer is filled
        if (chip.soundSlotIsStreamFilled(SOUND_SLOT_INDEX)) {
          // Generate samples
          chip.soundSlotStream(SOUND_SLOT_INDEX);
          
          // Get the audio buffer
          const buffer = chip.soundSlotGetSamplingRef(SOUND_SLOT_INDEX, SAMPLE_CHUNK_SIZE);
          
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
            // Continue immediately if buffer is not full
            setImmediate(generateNextChunk);
          } else {
            // Wait for drain event if buffer is full
            speaker.once('drain', generateNextChunk);
          }
        } else {
          // Buffer not ready, try again
          setImmediate(generateNextChunk);
        }
      };

      generateNextChunk();
    });
  };

  await playAudio();
  
  console.log('\n');
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
