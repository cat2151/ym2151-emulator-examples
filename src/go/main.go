package main

/*
#cgo CFLAGS: -I./nuked-opm-src
#cgo pkg-config: portaudio-2.0
#include "opm.h"
#include "opm.c"
#include <stdlib.h>
*/
import "C"
import (
	"fmt"
	"time"

	"github.com/gordonklaus/portaudio"
)

const (
	sampleRate = 48000
	duration   = 2 // seconds
)

func main() {
	fmt.Println("YM2151 (OPM) Emulator Example - Go + Nuked-OPM")
	fmt.Println("===============================================")

	// Initialize PortAudio
	if err := portaudio.Initialize(); err != nil {
		fmt.Printf("Error initializing PortAudio: %v\n", err)
		return
	}
	defer portaudio.Terminate()

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

	fmt.Println("Key ON - playing audio...")

	// Create audio stream callback
	// The callback generates audio samples in real-time
	stream, err := portaudio.OpenDefaultStream(
		0,          // no input channels
		2,          // stereo output
		sampleRate, // sample rate
		512,        // frames per buffer
		func(out [][]float32) {
			// Generate samples for this buffer
			for i := range out[0] {
				var output C.int
				var sh1, sh2, so C.uchar

				// Clock the chip multiple times per sample
				// YM2151 runs at 3.58 MHz, we need to clock it appropriately
				// For 48kHz output: 3580000 / 48000 ≈ 74.58 clocks per sample
				for j := 0; j < 75; j++ {
					C.OPM_Clock(&chip, &output, &sh1, &sh2, &so)
				}

				// Convert to float32 for PortAudio (-1.0 to 1.0 range)
				sample := float32(output) / 32768.0
				out[0][i] = sample // left channel
				out[1][i] = sample // right channel
			}
		},
	)
	if err != nil {
		fmt.Printf("Error opening audio stream: %v\n", err)
		return
	}
	defer stream.Close()

	// Start the audio stream
	if err := stream.Start(); err != nil {
		fmt.Printf("Error starting audio stream: %v\n", err)
		return
	}

	// Play for the specified duration
	fmt.Printf("Playing for %d seconds...\n", duration)
	time.Sleep(time.Duration(duration) * time.Second)

	// Key OFF
	C.OPM_Write(&chip, 0, 0x08)
	C.OPM_Write(&chip, 1, 0x00)
	fmt.Println("Key OFF")

	// Stop the audio stream
	if err := stream.Stop(); err != nil {
		fmt.Printf("Error stopping audio stream: %v\n", err)
		return
	}

	fmt.Println("Done!")
}
