package main

/*
#cgo CFLAGS: -I./nuked-opm-src
#include "opm.h"
#include "opm.c"
#include <stdlib.h>
*/
import "C"
import (
	"encoding/binary"
	"fmt"
	"os"
)

const (
	sampleRate = 48000
	duration   = 2 // seconds
)

// writeWAVHeader writes a WAV file header
func writeWAVHeader(f *os.File, dataSize int32) error {
	// RIFF chunk
	f.WriteString("RIFF")
	binary.Write(f, binary.LittleEndian, int32(36+dataSize))
	f.WriteString("WAVE")

	// fmt chunk
	f.WriteString("fmt ")
	binary.Write(f, binary.LittleEndian, int32(16)) // chunk size
	binary.Write(f, binary.LittleEndian, int16(1))  // PCM
	binary.Write(f, binary.LittleEndian, int16(2))  // stereo
	binary.Write(f, binary.LittleEndian, int32(sampleRate))
	binary.Write(f, binary.LittleEndian, int32(sampleRate*2*2)) // byte rate
	binary.Write(f, binary.LittleEndian, int16(4))              // block align
	binary.Write(f, binary.LittleEndian, int16(16))             // bits per sample

	// data chunk
	f.WriteString("data")
	binary.Write(f, binary.LittleEndian, dataSize)

	return nil
}

func main() {
	fmt.Println("YM2151 (OPM) Emulator Example - Go + Nuked-OPM")
	fmt.Println("===============================================")

	// Initialize OPM chip
	var chip C.opm_t
	C.OPM_Reset(&chip)

	fmt.Println("Chip initialized")

	// Configure a simple tone (440Hz A note)
	// Based on YM2151 register programming

	// Set Key Code (KC) and Key Fraction (KF) for channel 0 to produce ~440Hz
	// KC = 0x4D (approximate), KF = 0x00
	C.OPM_Write(&chip, 0, 0x28) // Channel 0 Key Code
	C.OPM_Write(&chip, 1, 0x4D)

	// Set connection algorithm and feedback for channel 0
	C.OPM_Write(&chip, 0, 0x20) // RL, FB, CON for channel 0
	C.OPM_Write(&chip, 1, 0xC7) // R+L output, Feedback=6, Algorithm=7 (simple)

	// Configure operator 0 (M1) - the only operator needed for algorithm 7
	// Set DT1, MUL for operator M1 of channel 0
	C.OPM_Write(&chip, 0, 0x40) // DT1, MUL for operator 0
	C.OPM_Write(&chip, 1, 0x01) // MUL=1

	// Set Total Level (TL) for operator 0
	C.OPM_Write(&chip, 0, 0x60) // TL for operator 0
	C.OPM_Write(&chip, 1, 0x20) // TL value (volume)

	// Set Key Scale (KS) and Attack Rate (AR) for operator 0
	C.OPM_Write(&chip, 0, 0x80) // KS, AR for operator 0
	C.OPM_Write(&chip, 1, 0x1F) // AR=31 (fast attack)

	// Set Amplitude Modulation Enable (AMS-EN) and D1R for operator 0
	C.OPM_Write(&chip, 0, 0xA0) // AMS-EN, D1R for operator 0
	C.OPM_Write(&chip, 1, 0x00) // D1R=0

	// Set DT2 and D2R for operator 0
	C.OPM_Write(&chip, 0, 0xC0) // DT2, D2R for operator 0
	C.OPM_Write(&chip, 1, 0x00) // D2R=0

	// Set D1L and RR for operator 0
	C.OPM_Write(&chip, 0, 0xE0) // D1L, RR for operator 0
	C.OPM_Write(&chip, 1, 0xFF) // D1L=15, RR=15 (sustain)

	fmt.Println("Registers configured for 440Hz tone")

	// Key ON for channel 0, all operators
	C.OPM_Write(&chip, 0, 0x08) // Key On/Off
	C.OPM_Write(&chip, 1, 0x78) // Channel 0, all slots on

	fmt.Println("Key ON - generating audio...")

	// Generate audio samples
	numSamples := sampleRate * duration
	samples := make([]int16, numSamples*2) // stereo

	for i := 0; i < numSamples; i++ {
		var output C.int
		var sh1, sh2, so C.uchar

		// Clock the chip multiple times per sample
		// YM2151 runs at 3.58 MHz, we need to clock it appropriately
		// For 48kHz output: 3580000 / 48000 ≈ 74.58 clocks per sample
		for j := 0; j < 75; j++ {
			C.OPM_Clock(&chip, &output, &sh1, &sh2, &so)
		}

		// The output is mono from OPM_Clock, we'll use it for both channels
		// Output range is typically -32768 to 32767
		sample := int16(output)
		samples[i*2] = sample     // left
		samples[i*2+1] = sample   // right

		// Progress indicator
		if i%(sampleRate/4) == 0 {
			progress := float64(i) / float64(numSamples) * 100
			fmt.Printf("\rProgress: %.1f%%", progress)
		}
	}

	fmt.Printf("\rProgress: 100.0%%\n")

	// Key OFF
	C.OPM_Write(&chip, 0, 0x08)
	C.OPM_Write(&chip, 1, 0x00)

	fmt.Println("Key OFF")

	// Write to WAV file
	filename := "output.wav"
	f, err := os.Create(filename)
	if err != nil {
		fmt.Printf("Error creating file: %v\n", err)
		return
	}
	defer f.Close()

	dataSize := int32(len(samples) * 2)
	if err := writeWAVHeader(f, dataSize); err != nil {
		fmt.Printf("Error writing WAV header: %v\n", err)
		return
	}

	// Write samples
	for _, sample := range samples {
		if err := binary.Write(f, binary.LittleEndian, sample); err != nil {
			fmt.Printf("Error writing sample: %v\n", err)
			return
		}
	}

	fmt.Printf("Audio saved to %s\n", filename)
	fmt.Println("Done!")
}
