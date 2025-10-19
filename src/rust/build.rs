// Build script to compile Nuked-OPM C library

fn main() {
    // Compile the Nuked-OPM library
    cc::Build::new()
        .file("nuked-opm/opm.c")
        .warnings(false) // Disable warnings for external C code
        .compile("nuked_opm");

    // Tell Cargo to rerun this build script if the C source changes
    println!("cargo:rerun-if-changed=nuked-opm/opm.c");
    println!("cargo:rerun-if-changed=nuked-opm/opm.h");
}
