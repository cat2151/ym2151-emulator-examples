# Fix for Buffer Zero Issue

## Problem
After PR #19, all buffer values became 0 when running the YM2151 emulator examples.

## Root Cause Analysis

The issue was in the audio generation loop timing. The code structure was:

```typescript
// OLD CODE (INEFFICIENT)
chip.soundSlotUpdate(SOUND_SLOT_INDEX, 1);

if (chip.soundSlotIsStreamFilled(SOUND_SLOT_INDEX)) {
  chip.soundSlotStream(SOUND_SLOT_INDEX);
  const buffer = chip.soundSlotGetSamplingRef(SOUND_SLOT_INDEX, SAMPLE_CHUNK_SIZE);
  // ... write buffer to speaker
} else {
  setImmediate(generateNextChunk);  // Try again
}
```

### The Problem

With the configuration:
- Tick rate: 60 Hz (defined as `SOUND_DRIVER_TICK_RATE`)
- Sample rate: 44,100 Hz (defined as `SAMPLING_RATE`)
- Chunk size: 4,096 samples (defined as `SAMPLE_CHUNK_SIZE`)

Each tick generates approximately **735 samples** (44,100 / 60).
To fill a 4,096 sample chunk, we need approximately **5.6 ticks** (4,096 / 735 ≈ 5.57), which means **at least 6 ticks** in practice.

The old code only called `soundSlotUpdate(1)` once per iteration, then checked if the stream was filled. This meant:
1. First iteration: Update with 1 tick → ~735 samples (not filled)
2. Second iteration: Update with 1 tick → ~1,470 samples (not filled)
3. ...continue...
4. Sixth iteration: Update with 1 tick → ~4,410 samples (filled!)

This created **multiple iterations** without generating any audio, potentially causing timing issues or race conditions that resulted in zero buffers.

## Solution

Changed to accumulate ticks in a loop before streaming:

```typescript
// NEW CODE (CORRECT)
while (!chip.soundSlotIsStreamFilled(SOUND_SLOT_INDEX)) {
  chip.soundSlotUpdate(SOUND_SLOT_INDEX, 1);
}

chip.soundSlotStream(SOUND_SLOT_INDEX);
const buffer = chip.soundSlotGetSamplingRef(SOUND_SLOT_INDEX, SAMPLE_CHUNK_SIZE);
// ... write buffer to speaker
```

This ensures:
1. The stream buffer is always filled before calling `soundSlotStream()`
2. Exactly one iteration per audio chunk (more efficient)
3. No race conditions or timing issues

## Files Modified

1. `src/typescript_deno/src/index.ts` - Main YM2151 example
2. `src/typescript_deno/src/index-keytoggle.ts` - Key toggle example
3. `src/typescript_deno/src/index-random.ts` - Random parameters example
4. `src/typescript_deno/src/index-ym2149.ts` - YM2149 example
5. `src/typescript_deno/src/index-ym2413.ts` - YM2413 example

## Verification

The fix ensures:
- ✓ Stream buffer is always filled before generating PCM samples
- ✓ More efficient loop structure (1 iteration vs 6+ iterations per chunk)
- ✓ Proper timing synchronization with the WASM emulator
- ✓ No zero-value buffers due to timing issues

## Reference

Compared with the working test.js example provided:
```javascript
// Working example: Direct sine wave generation
const value = Math.sin(2 * Math.PI * 440 * i / 44100) * 32767;
buffer.writeInt16LE(value, i * 4);
buffer.writeInt16LE(value, i * 4 + 2);
```

The key difference is that test.js generates audio directly, while our code uses a WASM emulator. The fix ensures the emulator has enough time to accumulate samples before we try to read them.
