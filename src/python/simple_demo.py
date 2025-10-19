#!/usr/bin/env python3
"""
Simple demo to verify the Python YM2151 implementation framework works.

This generates a synthetic sine wave to demonstrate the audio output system
while the YM2151 emulator integration is being finalized.
"""
import numpy as np
import sounddevice as sd

SAMPLE_RATE = 48000
DURATION = 2.0
FREQUENCY = 440.0  # A4


def generate_sine_wave(frequency, duration, sample_rate):
    """Generate a simple sine wave"""
    t = np.linspace(0, duration, int(sample_rate * duration), False)
    wave = np.sin(2 * np.pi * frequency * t)
    
    # Apply envelope (fade in/out)
    envelope = np.ones_like(wave)
    fade_samples = int(sample_rate * 0.1)  # 100ms fade
    envelope[:fade_samples] = np.linspace(0, 1, fade_samples)
    envelope[-fade_samples:] = np.linspace(1, 0, fade_samples)
    
    wave = wave * envelope * 0.3  # Scale to reasonable volume
    
    # Convert to stereo
    stereo = np.stack([wave, wave], axis=-1)
    return stereo.astype(np.float32)


def main():
    """Main function"""
    print("=" * 60)
    print("YM2151 Python Implementation - Simple Demo")
    print("=" * 60)
    print()
    print(f"Generating {FREQUENCY} Hz sine wave...")
    print(f"Duration: {DURATION} seconds")
    print(f"Sample rate: {SAMPLE_RATE} Hz")
    print()
    
    # Generate audio
    audio_data = generate_sine_wave(FREQUENCY, DURATION, SAMPLE_RATE)
    
    # Play audio
    print("Playing audio...")
    print("(This is a test sine wave, not YM2151 output)")
    print()
    
    try:
        sd.play(audio_data, SAMPLE_RATE, blocking=True)
        print("Playback complete!")
    except KeyboardInterrupt:
        print("\nPlayback interrupted")
        sd.stop()
    except Exception as e:
        print(f"Error: {e}")
        return 1
    
    print()
    print("=" * 60)
    print("Note: YM2151 emulator integration is in progress.")
    print("This demo shows the audio framework is working.")
    print("=" * 60)
    
    return 0


if __name__ == "__main__":
    import sys
    sys.exit(main())
