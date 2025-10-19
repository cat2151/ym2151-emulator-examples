/**
 * YM2149 (PSG) Simple Example
 * 
 * This example plays a simple 440Hz tone using the YM2149 chip.
 * Used for comparison to determine if audio generation issues are YM2151-specific.
 */

import { Libymfm, SoundChipType } from './libymfm.js';
import Speaker from 'speaker';

// Configuration
const SOUND_SLOT_INDEX = 0;
const SAMPLING_RATE = 44100;
const SAMPLE_CHUNK_SIZE = 4096;
const SOUND_DRIVER_TICK_RATE = 60; // 60Hz tick rate
const YM2149_CLOCK = 2000000; // 2MHz clock

// Duration in seconds
const DURATION_SECONDS = 3;

/**
 * Initialize YM2149 chip for a simple tone
 * YM2149 is a PSG (Programmable Sound Generator), much simpler than YM2151
 */
function initializeYM2149(chip: Libymfm, slotId: number): void {
  // YM2149 Register Map:
  // 0x00-0x01: Channel A Tone Period (12-bit)
  // 0x02-0x03: Channel B Tone Period
  // 0x04-0x05: Channel C Tone Period
  // 0x06: Noise Period
  // 0x07: Mixer Control (Enable/Disable Tone and Noise)
  // 0x08-0x0A: Channel Volume (4-bit, 0-15)
  // 0x0B-0x0D: Envelope Period (16-bit)
  // 0x0E: Envelope Shape
  
  // Set tone period for ~440Hz on Channel A
  // Formula: Period = Clock / (16 * Frequency)
  // Period = 2000000 / (16 * 440) = 284 (approximately)
  const period = 284;
  chip.soundSlotWrite(slotId, SoundChipType.YM2149, 0, 0x00, period & 0xFF);        // Low byte
  chip.soundSlotWrite(slotId, SoundChipType.YM2149, 0, 0x01, (period >> 8) & 0x0F); // High 4 bits

  // Mixer: Enable tone on Channel A, disable noise
  // Bit 0: Tone A (0=on, 1=off)
  // Bit 3: Noise A (0=on, 1=off)
  chip.soundSlotWrite(slotId, SoundChipType.YM2149, 0, 0x07, 0x3E); // Enable tone A only

  // Set volume to maximum (15) on Channel A
  chip.soundSlotWrite(slotId, SoundChipType.YM2149, 0, 0x08, 0x0F);
}

/**
 * Main function
 */
async function main() {
  console.log('YM2149 PSG Simple Example');
  console.log('==========================');
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

  // Add YM2149 chip
  console.log('Adding YM2149 sound chip...');
  chip.soundSlotAddSoundDevice(
    SOUND_SLOT_INDEX,
    SoundChipType.YM2149,
    1,
    YM2149_CLOCK
  );
  console.log('✓ YM2149 chip added');

  // Initialize YM2149 for sound generation
  console.log('Configuring YM2149 for 440Hz tone...');
  initializeYM2149(chip, SOUND_SLOT_INDEX);
  console.log('✓ YM2149 configured');

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
    console.error('This indicates that the YM2149 chip is not generating any audio.');
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
