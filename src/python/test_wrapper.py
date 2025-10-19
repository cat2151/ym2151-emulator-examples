#!/usr/bin/env python3
"""
Test script to verify the Nuked-OPM wrapper is working correctly.

This script tests basic functionality of the YM2151 emulator wrapper:
- Library loading
- Chip initialization
- Register writes
- Clock cycles
"""

from nuked_opm import NukedOPM


def test_initialization():
    """Test chip initialization"""
    print("Testing chip initialization...")
    chip = NukedOPM()
    print("  ✓ Chip initialized")
    return chip


def test_register_write(chip):
    """Test register writes"""
    print("\nTesting register writes...")
    
    # Write to TEST register
    chip.write_register(0x01, 0x00)
    print("  ✓ Write to register 0x01 (TEST)")
    
    # Write to channel 0 configuration
    chip.write_register(0x20, 0xC7)
    print("  ✓ Write to register 0x20 (Channel 0 RL/FB/CON)")
    
    # Write key code
    chip.write_register(0x28, 0x50)
    print("  ✓ Write to register 0x28 (Key Code)")
    
    # Write KEY ON/OFF
    chip.write_register(0x08, 0x78)
    print("  ✓ Write to register 0x08 (KEY ON)")


def test_clock_cycles(chip):
    """Test clock cycles"""
    print("\nTesting clock cycles...")
    
    # Clock the chip a few times
    for i in range(10):
        left, right, sh1, sh2, so = chip.clock()
        if i == 0:
            print(f"  Sample 0: L={left}, R={right}, sh1={sh1}, sh2={sh2}, so={so}")
    
    print(f"  ✓ Clocked chip 10 times")


def test_sample_generation(chip):
    """Test sample generation"""
    print("\nTesting sample generation...")
    
    samples = chip.generate_samples(100)
    print(f"  ✓ Generated {len(samples)} samples")
    print(f"  First sample: L={samples[0][0]}, R={samples[0][1]}")
    print(f"  Last sample: L={samples[-1][0]}, R={samples[-1][1]}")


def main():
    """Main test function"""
    print("=" * 60)
    print("YM2151 Wrapper Test Suite")
    print("=" * 60)
    print()
    
    try:
        # Run tests
        chip = test_initialization()
        test_register_write(chip)
        test_clock_cycles(chip)
        test_sample_generation(chip)
        
        print()
        print("=" * 60)
        print("✓ All tests passed!")
        print("=" * 60)
        print()
        print("Note: Audio output verification requires additional testing")
        print("with actual YM2151 register sequences.")
        
        return 0
        
    except Exception as e:
        print()
        print("=" * 60)
        print(f"✗ Test failed: {e}")
        print("=" * 60)
        import traceback
        traceback.print_exc()
        return 1


if __name__ == "__main__":
    import sys
    sys.exit(main())
