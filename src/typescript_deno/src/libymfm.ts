/**
 * libymfm.wasm TypeScript Wrapper
 * Provides a high-level interface to the YM2151 emulator
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Sound chip types supported by libymfm
 */
export enum SoundChipType {
  YM2149 = 0,
  YM2151 = 1,
  YM2203 = 2,
  YM2413 = 3,
  YM2608 = 4,
  YM2610 = 5,
  YM2612 = 6,
  YM3526 = 7,
  Y8950 = 8,
  YM3812 = 9,
  YMF262 = 10,
  YMF278B = 11,
  SEGAPSG = 12,
  SN76489 = 13,
  PWM = 14,
  SEGAPCM = 15,
  OKIM6258 = 16,
  C140 = 17,
  C219 = 18,
  OKIM6295 = 19,
}

/**
 * libymfm.wasm wrapper class
 */
export class Libymfm {
  private instance: WebAssembly.Instance | null = null;
  private memory: WebAssembly.Memory | null = null;
  private exports: any = null;

  /**
   * Initialize the WASM module
   */
  async init(): Promise<void> {
    const wasmPath = join(__dirname, '..', 'wasm', 'libymfm.wasm');
    const wasmBuffer = readFileSync(wasmPath);
    
    const wasmModule = await WebAssembly.compile(wasmBuffer);
    
    // Create memory for WASM
    this.memory = new WebAssembly.Memory({ 
      initial: 256,
      maximum: 512 
    });
    
    const importObject = {
      env: {
        memory: this.memory,
        abort: () => {
          throw new Error('WASM abort called');
        },
      },
      wasi_snapshot_preview1: {
        proc_exit: (code: number) => {
          if (code !== 0) {
            console.error(`WASM process exited with code ${code}`);
          }
        },
        fd_close: () => 0,
        fd_write: () => 0,
        fd_read: () => 0,
        fd_seek: () => 0,
        fd_fdstat_get: () => 0,
        fd_fdstat_set_flags: () => 0,
        fd_prestat_get: () => 0,
        fd_prestat_dir_name: () => 0,
        path_open: () => 0,
        path_filestat_get: () => 0,
        environ_sizes_get: () => 0,
        environ_get: () => 0,
        clock_time_get: () => 0,
        clock_res_get: () => 0,
        random_get: () => 0,
        args_sizes_get: () => 0,
        args_get: () => 0,
        poll_oneoff: () => 0,
        sched_yield: () => 0,
      }
    };
    
    this.instance = await WebAssembly.instantiate(wasmModule, importObject);
    this.exports = this.instance.exports;
  }

  /**
   * Create a sound slot
   */
  soundSlotCreate(
    slotId: number,
    externalTickRate: number,
    outputSamplingRate: number,
    outputSampleChunkSize: number
  ): void {
    this.exports.sound_slot_create(
      slotId,
      externalTickRate,
      outputSamplingRate,
      outputSampleChunkSize
    );
  }

  /**
   * Add a sound device to a sound slot
   */
  soundSlotAddSoundDevice(
    slotId: number,
    chipType: SoundChipType,
    numberOfChips: number,
    clock: number
  ): void {
    this.exports.sound_slot_add_sound_device(
      slotId,
      chipType,
      numberOfChips,
      clock
    );
  }

  /**
   * Write data to a sound chip register
   */
  soundSlotWrite(
    slotId: number,
    chipType: SoundChipType,
    chipIndex: number,
    port: number,
    data: number
  ): void {
    this.exports.sound_slot_write(
      slotId,
      chipType,
      chipIndex,
      port,
      data
    );
  }

  /**
   * Update the sound slot (tick the sound driver)
   */
  soundSlotUpdate(slotId: number, ticks: number): void {
    this.exports.sound_slot_update(slotId, ticks);
  }

  /**
   * Check if the stream buffer is filled
   */
  soundSlotIsStreamFilled(slotId: number): number {
    return this.exports.sound_slot_is_stream_filled(slotId);
  }

  /**
   * Stream the sound slot (generate audio samples)
   */
  soundSlotStream(slotId: number): void {
    this.exports.sound_slot_stream(slotId);
  }

  /**
   * Get the sampling buffer reference (as Int16Array for interleaved stereo)
   * Note: The chunk size must be known from the soundSlotCreate call
   */
  soundSlotGetSamplingRef(slotId: number, chunkSize: number): Int16Array {
    if (!this.memory) {
      throw new Error('WASM memory not initialized');
    }
    
    const ptr = this.exports.sound_slot_sampling_s16le_ref(slotId);
    
    // The buffer is interleaved stereo (L, R, L, R, ...)
    return new Int16Array(
      this.memory.buffer,
      ptr,
      chunkSize * 2  // * 2 for stereo
    );
  }

  /**
   * Drop a sound slot
   */
  soundSlotDrop(slotId: number): void {
    this.exports.sound_slot_drop(slotId);
  }

  /**
   * Get the memory instance (for direct access if needed)
   */
  getMemory(): WebAssembly.Memory | null {
    return this.memory;
  }
}
