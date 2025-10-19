#!/bin/bash
# Build script for Nuked-OPM shared library
#
# This script clones Nuked-OPM and builds it as a shared library
# for use with the Python ctypes wrapper.

set -e

echo "Building Nuked-OPM shared library..."
echo

# Create temporary directory
TEMP_DIR=$(mktemp -d)
echo "Using temporary directory: $TEMP_DIR"

# Clone Nuked-OPM
echo "Cloning Nuked-OPM..."
cd "$TEMP_DIR"
git clone https://github.com/nukeykt/Nuked-OPM.git
cd Nuked-OPM

# Determine the platform and build accordingly
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    echo "Building for Linux..."
    gcc -shared -fPIC -O2 -o libnukedopm.so opm.c
    LIB_FILE="libnukedopm.so"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    echo "Building for macOS..."
    gcc -shared -fPIC -O2 -o libnukedopm.dylib opm.c
    LIB_FILE="libnukedopm.dylib"
else
    echo "Unsupported platform: $OSTYPE"
    echo "Please build manually using:"
    echo "  gcc -shared -fPIC -O2 -o libnukedopm.so opm.c    # Linux"
    echo "  gcc -shared -fPIC -O2 -o libnukedopm.dylib opm.c # macOS"
    exit 1
fi

# Copy the library and header
echo "Copying library and header to $SCRIPT_DIR..."
cp "$LIB_FILE" "$SCRIPT_DIR/"
cp opm.h "$SCRIPT_DIR/"

# Cleanup
echo "Cleaning up..."
cd /
rm -rf "$TEMP_DIR"

echo
echo "✓ Build complete!"
echo "  Library: $SCRIPT_DIR/$LIB_FILE"
echo "  Header: $SCRIPT_DIR/opm.h"
echo
echo "You can now run the Python examples:"
echo "  python main.py"
