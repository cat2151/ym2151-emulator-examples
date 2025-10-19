use cpal::traits::{DeviceTrait, HostTrait, StreamTrait};
use cpal::{FromSample, SizedSample};
use std::f32::consts::PI;

/// Simple FM synthesizer inspired by YM2151 (OPM)
/// This is a minimal implementation for demonstration purposes
struct SimpleFmSynth {
    sample_rate: f32,
    phase: f32,
    modulator_phase: f32,
    time: f32,
}

impl SimpleFmSynth {
    fn new(sample_rate: f32) -> Self {
        Self {
            sample_rate,
            phase: 0.0,
            modulator_phase: 0.0,
            time: 0.0,
        }
    }

    /// Generate next audio sample using FM synthesis
    /// Carrier frequency: 440Hz (A4 note)
    /// Modulator frequency: 880Hz (one octave higher)
    /// Modulation index: 2.0
    fn next_sample(&mut self) -> f32 {
        let carrier_freq = 440.0;
        let modulator_freq = 880.0;
        let modulation_index = 2.0;

        // Update modulator phase
        let modulator_delta = 2.0 * PI * modulator_freq / self.sample_rate;
        self.modulator_phase += modulator_delta;
        if self.modulator_phase >= 2.0 * PI {
            self.modulator_phase -= 2.0 * PI;
        }

        // Calculate modulator output
        let modulator_output = self.modulator_phase.sin();

        // Update carrier phase with FM modulation
        let carrier_delta = 2.0 * PI * carrier_freq / self.sample_rate;
        let modulated_phase = self.phase + modulation_index * modulator_output;

        // Calculate carrier output (final sound)
        let output = modulated_phase.sin();

        // Update carrier phase
        self.phase += carrier_delta;
        if self.phase >= 2.0 * PI {
            self.phase -= 2.0 * PI;
        }

        // Apply envelope (simple fade in/out)
        self.time += 1.0 / self.sample_rate;
        let duration = 3.0; // 3 seconds
        let envelope = if self.time < 0.1 {
            // Attack: fade in over 0.1 seconds
            self.time / 0.1
        } else if self.time > duration - 0.5 {
            // Release: fade out over 0.5 seconds
            (duration - self.time) / 0.5
        } else {
            // Sustain
            1.0
        };

        output * envelope * 0.3 // Scale volume to 30%
    }

    fn is_finished(&self) -> bool {
        self.time >= 3.0
    }
}

fn main() {
    println!("🎵 YM2151 FM Synthesis Example (Rust)");
    println!("Playing a 440Hz note with FM modulation for 3 seconds...");

    // Get default audio host
    let host = cpal::default_host();

    // Get default output device
    let device = host
        .default_output_device()
        .expect("Failed to get default output device");

    println!("Output device: {}", device.name().unwrap_or_default());

    // Get default output config
    let config = device
        .default_output_config()
        .expect("Failed to get default output config");

    println!("Sample rate: {} Hz", config.sample_rate().0);
    println!("Channels: {}", config.channels());

    // Build and run the audio stream
    match config.sample_format() {
        cpal::SampleFormat::F32 => run::<f32>(&device, &config.into())
            .expect("Failed to build audio stream"),
        cpal::SampleFormat::I16 => run::<i16>(&device, &config.into())
            .expect("Failed to build audio stream"),
        cpal::SampleFormat::U16 => run::<u16>(&device, &config.into())
            .expect("Failed to build audio stream"),
        sample_format => panic!(
            "Unsupported sample format: {}. Supported formats are F32, I16, and U16",
            sample_format
        ),
    }
}

fn run<T>(
    device: &cpal::Device,
    config: &cpal::StreamConfig,
) -> Result<(), Box<dyn std::error::Error>>
where
    T: SizedSample + FromSample<f32>,
{
    let sample_rate = config.sample_rate.0 as f32;
    let channels = config.channels as usize;

    let mut synth = SimpleFmSynth::new(sample_rate);
    let mut finished = false;

    let err_fn = |err| eprintln!("Stream error: {}", err);

    let stream = device.build_output_stream(
        config,
        move |data: &mut [T], _: &cpal::OutputCallbackInfo| {
            if finished {
                // Output silence
                for sample in data.iter_mut() {
                    *sample = T::from_sample(0.0);
                }
                return;
            }

            for frame in data.chunks_mut(channels) {
                let value = synth.next_sample();

                // Write same value to all channels
                for sample in frame.iter_mut() {
                    *sample = T::from_sample(value);
                }

                if synth.is_finished() {
                    finished = true;
                    break;
                }
            }
        },
        err_fn,
        None,
    )?;

    stream.play()?;

    // Keep the stream alive for the duration
    println!("Playing... Press Ctrl+C to stop early.");
    std::thread::sleep(std::time::Duration::from_secs(4));

    println!("Done!");
    Ok(())
}
