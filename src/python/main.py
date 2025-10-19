#!/usr/bin/env python3
"""
YM2151 (OPM) Emulator Example - Python Implementation

This is a minimal example of using the Nuked-OPM emulator to generate
and play audio from the YM2151 FM synthesis chip.
"""
import numpy as np
import sounddevice as sd
from nuked_opm import NukedOPM


# YM2151 clock frequency (approximately 4MHz)
YM2151_CLOCK = 4_000_000

# Output sample rate (48kHz)
SAMPLE_RATE = 48_000

# Duration in seconds
DURATION = 2.0


def setup_ym2151_basic_sound(chip: NukedOPM):
    """
    Configure YM2151 registers for a basic FM sound.
    
    This sets up a simple FM tone on channel 0 with:
    - Basic algorithm (0) - cascade connection
    - Moderate feedback
    - Simple envelope
    - Note: A4 (440 Hz)
    """
    
    # Reset all channels
    for ch in range(8):
        chip.write_register(0x08, ch)  # Key off for all channels
    
    # Configure Channel 0
    channel = 0
    
    # RL (Left/Right output), FB (Feedback), CON (Connection/Algorithm)
    # Register 0x20-0x27: RL_FB_CON for each channel
    # Bit 7-6: RL (11 = both speakers)
    # Bit 5-3: FB (feedback level)
    # Bit 2-0: CON (algorithm/connection)
    chip.write_register(0x20 + channel, 0xC4)  # RL=11, FB=2, CON=4
    
    # KC (Key Code) - determines pitch
    # Register 0x28-0x2F: KC for each channel
    # For A4 (440Hz): KC ≈ 0x4C
    chip.write_register(0x28 + channel, 0x4C)
    
    # KF (Key Fraction) - fine pitch adjustment
    # Register 0x30-0x37: KF for each channel
    chip.write_register(0x30 + channel, 0x00)
    
    # PMS (Phase Modulation Sensitivity) and AMS (Amplitude Modulation Sensitivity)
    # Register 0x38-0x3F: PMS_AMS for each channel
    chip.write_register(0x38 + channel, 0x00)
    
    # Configure operators for channel 0
    # YM2151 has 4 operators per channel (M1, M2, C1, C2)
    # Operator slots: channel * 8 + operator (0-3 for operators, but register layout differs)
    
    for op in range(4):
        # Operator offset in registers
        # The register layout groups operators: 0, 8, 16, 24 for channel 0
        op_offset = channel + (op * 8)
        
        # DT1 (Detune) and MUL (Multiple)
        # Register 0x40-0x5F: DT1_MUL
        # MUL=1 means 1x frequency
        chip.write_register(0x40 + op_offset, 0x01)  # DT1=0, MUL=1
        
        # TL (Total Level) - output level/attenuation
        # Register 0x60-0x7F: TL
        # Lower values = louder (0 = max, 127 = silent)
        if op == 3:  # Carrier operator (last in algorithm 4)
            chip.write_register(0x60 + op_offset, 0x10)  # Moderate volume
        else:  # Modulator operators
            chip.write_register(0x60 + op_offset, 0x30)  # Lower volume for modulators
        
        # KS (Key Scaling) and AR (Attack Rate)
        # Register 0x80-0x9F: KS_AR
        chip.write_register(0x80 + op_offset, 0x1F)  # KS=0, AR=31 (fast attack)
        
        # AMS-EN (AM Enable) and D1R (Decay 1 Rate)
        # Register 0xA0-0xBF: AMS_D1R
        chip.write_register(0xA0 + op_offset, 0x05)  # AMS=0, D1R=5
        
        # DT2 (Detune 2) and D2R (Decay 2 Rate)
        # Register 0xC0-0xDF: DT2_D2R
        chip.write_register(0xC0 + op_offset, 0x05)  # DT2=0, D2R=5
        
        # D1L (Decay 1 Level) and RR (Release Rate)
        # Register 0xE0-0xFF: D1L_RR
        chip.write_register(0xE0 + op_offset, 0xA7)  # D1L=10, RR=7
    
    # Key ON - trigger the note
    # Register 0x08: Key On/Off
    # Bit 6-4: Operator enable bits (M1=bit4, M2=bit5, C1=bit6, C2=bit7)
    # Bit 2-0: Channel number
    chip.write_register(0x08, 0x78 | channel)  # All operators ON for channel 0


def generate_audio(chip: NukedOPM, duration: float, sample_rate: int) -> np.ndarray:
    """
    Generate audio samples from the YM2151 chip.
    
    Args:
        chip: NukedOPM instance
        duration: Duration in seconds
        sample_rate: Output sample rate in Hz
        
    Returns:
        Numpy array of audio samples (stereo)
    """
    num_samples = int(duration * sample_rate)
    
    # Calculate how many chip clocks per output sample
    # YM2151 outputs samples at clock_rate / 64
    ym2151_sample_rate = YM2151_CLOCK / 64
    clocks_per_sample = ym2151_sample_rate / sample_rate
    
    print(f"Generating {num_samples} samples...")
    print(f"YM2151 internal sample rate: {ym2151_sample_rate:.0f} Hz")
    print(f"Output sample rate: {sample_rate} Hz")
    print(f"Clocks per output sample: {clocks_per_sample:.2f}")
    
    # Generate samples
    audio_data = np.zeros((num_samples, 2), dtype=np.int32)
    
    clock_accumulator = 0.0
    for i in range(num_samples):
        # Advance the accumulator
        clock_accumulator += clocks_per_sample
        
        # Generate samples by clocking the chip
        sample_sum = 0
        num_clocks = int(clock_accumulator)
        clock_accumulator -= num_clocks
        
        left_sum = 0
        right_sum = 0
        for _ in range(num_clocks):
            left, right, _, _, _ = chip.clock()
            left_sum += left
            right_sum += right
        
        # Average the samples if we clocked multiple times
        if num_clocks > 0:
            avg_left = left_sum // num_clocks
            avg_right = right_sum // num_clocks
        else:
            avg_left = 0
            avg_right = 0
        
        # Store as stereo
        audio_data[i] = [avg_left, avg_right]
        
        # Progress indicator
        if (i + 1) % (num_samples // 10) == 0:
            print(f"Progress: {100 * (i + 1) // num_samples}%")
    
    # Normalize to float32 range [-1.0, 1.0]
    # YM2151 output range is approximately ±32768 (16-bit)
    audio_float = audio_data.astype(np.float32) / 32768.0
    
    # Clip to valid range
    audio_float = np.clip(audio_float, -1.0, 1.0)
    
    return audio_float


def main():
    """Main function"""
    print("=" * 60)
    print("YM2151 (OPM) Emulator - Python Implementation")
    print("=" * 60)
    print()
    
    # Initialize the YM2151 chip
    print("Initializing YM2151 chip...")
    chip = NukedOPM()
    
    # Configure for basic sound
    print("Configuring registers for A4 (440 Hz) tone...")
    setup_ym2151_basic_sound(chip)
    
    # Generate audio
    print()
    audio_data = generate_audio(chip, DURATION, SAMPLE_RATE)
    
    # Play audio
    print()
    print(f"Playing {DURATION} seconds of audio...")
    print("Press Ctrl+C to stop")
    print()
    
    try:
        sd.play(audio_data, SAMPLE_RATE, blocking=True)
        print("Playback complete!")
    except KeyboardInterrupt:
        print("\nPlayback interrupted by user")
        sd.stop()
    except Exception as e:
        print(f"Error during playback: {e}")
        return 1
    
    print()
    print("=" * 60)
    print("Done!")
    print("=" * 60)
    
    return 0


if __name__ == "__main__":
    import sys
    sys.exit(main())
