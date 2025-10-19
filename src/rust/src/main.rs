use cpal::traits::{DeviceTrait, HostTrait, StreamTrait};
use cpal::{FromSample, SizedSample};

/// FFI bindings to Nuked-OPM library
#[repr(C)]
struct OpmChip {
    _opaque: [u8; 0],
}

extern "C" {
    fn OPM_Clock(
        chip: *mut OpmChip,
        output: *mut i32,
        sh1: *mut u8,
        sh2: *mut u8,
        so: *mut u8,
    );
    fn OPM_Write(chip: *mut OpmChip, port: u32, data: u8);
    fn OPM_Reset(chip: *mut OpmChip);
}

/// Safe wrapper around the Nuked-OPM chip
struct Ym2151 {
    chip: Box<[u8; 2048]>, // Large enough to hold the opm_t struct
}

impl Ym2151 {
    fn new() -> Self {
        let mut chip = Box::new([0u8; 2048]);
        
        // SAFETY: We're initializing the chip via OPM_Reset
        unsafe {
            let chip_ptr = chip.as_mut_ptr() as *mut OpmChip;
            OPM_Reset(chip_ptr);
        }

        Self { chip }
    }

    fn chip_ptr(&mut self) -> *mut OpmChip {
        self.chip.as_mut_ptr() as *mut OpmChip
    }

    /// Write to a YM2151 register
    fn write(&mut self, address: u8, data: u8) {
        unsafe {
            // Write address
            OPM_Write(self.chip_ptr(), 0, address);
            // Write data
            OPM_Write(self.chip_ptr(), 1, data);
        }
    }

    /// Generate one sample from the chip
    fn generate_sample(&mut self) -> (i16, i16) {
        let mut output = [0i32, 0i32];
        let mut sh1 = 0u8;
        let mut sh2 = 0u8;
        let mut so = 0u8;

        unsafe {
            // Clock the chip multiple times to generate one sample
            // YM2151 runs at ~3.58 MHz, and we need to clock it many times per sample
            for _ in 0..64 {
                OPM_Clock(
                    self.chip_ptr(),
                    output.as_mut_ptr(),
                    &mut sh1,
                    &mut sh2,
                    &mut so,
                );
            }
        }

        // Convert to 16-bit samples
        let left = (output[0] >> 5).clamp(-32768, 32767) as i16;
        let right = (output[1] >> 5).clamp(-32768, 32767) as i16;

        (left, right)
    }

    /// Initialize a simple 440Hz tone
    fn init_simple_tone(&mut self) {
        // Reset all channels
        for ch in 0..8 {
            self.write(0x08, ch); // Key off
        }

        // Configure channel 0 for a simple tone
        // Set frequency (440 Hz = A4)
        // KC (Key Code) and KF (Key Fraction) for 440Hz
        self.write(0x28, 0x4A); // KC for channel 0 (approximately 440Hz)
        self.write(0x30, 0x00); // KF for channel 0

        // Configure operators for channel 0
        // We'll use a simple algorithm with just one operator
        self.write(0x20, 0x07); // RL=3, FB=0, CONNECT=7 (simple algorithm)

        // Configure operator M1 (first operator of channel 0)
        let op = 0; // Operator M1 of channel 0

        // DT1/MUL
        self.write(0x40 + op, 0x01); // DT1=0, MUL=1

        // TL (Total Level - volume)
        self.write(0x60 + op, 0x18); // TL=24 (moderate volume)

        // KS/AR (Key Scale / Attack Rate)
        self.write(0x80 + op, 0x1F); // KS=0, AR=31 (fast attack)

        // AMS-EN/D1R (AM Enable / Decay Rate 1)
        self.write(0xA0 + op, 0x00); // AMS=0, D1R=0

        // DT2/D2R (Decay Rate 2)
        self.write(0xC0 + op, 0x00); // DT2=0, D2R=0

        // D1L/RR (Decay Level / Release Rate)
        self.write(0xE0 + op, 0x0F); // D1L=0, RR=15

        // Key on for channel 0, all operators
        self.write(0x08, 0x78); // Key on for all 4 operators of channel 0
    }
}

fn main() {
    println!("🎵 YM2151 (Nuked-OPM) Example");
    println!("Playing a 440Hz tone using real YM2151 emulator...");

    let mut chip = Ym2151::new();
    chip.init_simple_tone();

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

    // Build and run the audio stream
    match config.sample_format() {
        cpal::SampleFormat::F32 => run::<f32>(&device, config.into(), chip)
            .expect("Failed to build audio stream"),
        cpal::SampleFormat::I16 => run::<i16>(&device, config.into(), chip)
            .expect("Failed to build audio stream"),
        cpal::SampleFormat::U16 => run::<u16>(&device, config.into(), chip)
            .expect("Failed to build audio stream"),
        sample_format => panic!(
            "Unsupported sample format: {}. Supported formats are F32, I16, and U16",
            sample_format
        ),
    }
}

fn run<T>(
    device: &cpal::Device,
    config: cpal::StreamConfig,
    mut chip: Ym2151,
) -> Result<(), Box<dyn std::error::Error>>
where
    T: SizedSample + FromSample<f32>,
{
    let channels = config.channels as usize;
    let sample_rate = config.sample_rate.0;
    let mut time = 0.0;
    let duration = 3.0; // Play for 3 seconds

    let err_fn = |err| eprintln!("Stream error: {}", err);

    let stream = device.build_output_stream(
        &config,
        move |data: &mut [T], _: &cpal::OutputCallbackInfo| {
            for frame in data.chunks_mut(channels) {
                let (left, right) = chip.generate_sample();

                // Convert to float and normalize
                let left_f = left as f32 / 32768.0;
                let right_f = right as f32 / 32768.0;

                // Apply volume scaling (30%)
                let left_scaled = left_f * 0.3;
                let right_scaled = right_f * 0.3;

                // Write to output
                if channels == 1 {
                    frame[0] = T::from_sample((left_scaled + right_scaled) * 0.5);
                } else {
                    frame[0] = T::from_sample(left_scaled);
                    if channels > 1 {
                        frame[1] = T::from_sample(right_scaled);
                    }
                }

                time += 1.0 / sample_rate as f32;
                if time >= duration {
                    // Fill rest with silence
                    for sample in frame.iter_mut() {
                        *sample = T::from_sample(0.0);
                    }
                    return;
                }
            }
        },
        err_fn,
        None,
    )?;

    stream.play()?;

    // Keep the stream alive for the duration
    println!("Playing... ({}s)", duration);
    std::thread::sleep(std::time::Duration::from_secs((duration + 1.0) as u64));

    println!("Done!");
    Ok(())
}

