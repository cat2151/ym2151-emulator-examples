"""
Python wrapper for Nuked-OPM YM2151 emulator using ctypes.
"""
import ctypes
import os
from typing import Tuple

# Get the directory of this script
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

# Load the Nuked-OPM shared library
# Try different platform-specific library names
_lib_names = ['libnukedopm.so', 'libnukedopm.dylib', 'libnukedopm.dll']
_lib = None
_lib_path = None

for lib_name in _lib_names:
    path = os.path.join(SCRIPT_DIR, lib_name)
    if os.path.exists(path):
        _lib_path = path
        try:
            _lib = ctypes.CDLL(_lib_path)
            break
        except OSError as e:
            print(f"Warning: Found {lib_name} but failed to load: {e}")

if _lib is None:
    raise FileNotFoundError(
        f"Nuked-OPM library not found in {SCRIPT_DIR}.\n"
        f"Expected one of: {', '.join(_lib_names)}\n"
        f"Run build_library.sh to build the library."
    )


# Define the opm_t structure (simplified, we'll treat it as opaque)
class OPM_t(ctypes.Structure):
    """OPM chip state structure (opaque)"""
    # We don't need to define all fields since we'll treat it as opaque
    # The structure is large and complex, so we allocate enough space
    _fields_ = [("_data", ctypes.c_byte * 4096)]


# Define function signatures
_lib.OPM_Reset.argtypes = [ctypes.POINTER(OPM_t)]
_lib.OPM_Reset.restype = None

_lib.OPM_Write.argtypes = [ctypes.POINTER(OPM_t), ctypes.c_uint32, ctypes.c_uint8]
_lib.OPM_Write.restype = None

_lib.OPM_Clock.argtypes = [
    ctypes.POINTER(OPM_t),
    ctypes.POINTER(ctypes.c_int32),
    ctypes.POINTER(ctypes.c_uint8),
    ctypes.POINTER(ctypes.c_uint8),
    ctypes.POINTER(ctypes.c_uint8)
]
_lib.OPM_Clock.restype = None


class NukedOPM:
    """High-level wrapper for Nuked-OPM YM2151 emulator"""
    
    def __init__(self):
        """Initialize the YM2151 chip"""
        self.chip = OPM_t()
        self.reset()
    
    def reset(self):
        """Reset the chip to initial state"""
        _lib.OPM_Reset(ctypes.byref(self.chip))
    
    def write(self, port: int, data: int):
        """
        Write data to chip register
        
        Args:
            port: Register port (0 for address, 1 for data)
            data: Data byte to write
        """
        _lib.OPM_Write(ctypes.byref(self.chip), port, data)
    
    def write_register(self, address: int, data: int):
        """
        Write to a specific register (convenience method)
        
        Args:
            address: Register address (0x00-0xFF)
            data: Data value (0x00-0xFF)
        """
        self.write(0, address)  # Write address
        self.write(1, data)     # Write data
    
    def clock(self) -> Tuple[int, int, int, int, int]:
        """
        Clock the chip once and get output
        
        Returns:
            Tuple of (left_sample, right_sample, sh1, sh2, so)
        """
        output = (ctypes.c_int32 * 2)()  # Stereo output array
        sh1 = ctypes.c_uint8()
        sh2 = ctypes.c_uint8()
        so = ctypes.c_uint8()
        
        _lib.OPM_Clock(
            ctypes.byref(self.chip),
            output,
            ctypes.byref(sh1),
            ctypes.byref(sh2),
            ctypes.byref(so)
        )
        
        return output[0], output[1], sh1.value, sh2.value, so.value
    
    def generate_samples(self, num_samples: int) -> list:
        """
        Generate audio samples
        
        Args:
            num_samples: Number of samples to generate
            
        Returns:
            List of stereo samples (left, right) tuples
        """
        samples = []
        for _ in range(num_samples):
            left, right, _, _, _ = self.clock()
            samples.append((left, right))
        return samples
