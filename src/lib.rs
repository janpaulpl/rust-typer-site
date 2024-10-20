use wasm_bindgen::prelude::*;
use getrandom::getrandom;

#[wasm_bindgen]
pub fn start_typing_simulation() -> String {
    // Simulated code lines
    let code_lines = vec![
        "fn main() {",
        "    println!(\"Hello, world!\");",
        "}",
        "for i in 0..10 {",
        "    println!(\"{}\", i);",
        "}",
        "// End of the simulated Rust code."
    ];

    // Get random bytes and convert them to an index
    let mut buf = [0u8; 1];  // 1 byte buffer, giving values from 0 to 255
    getrandom(&mut buf).expect("Failed to get random bytes");
    let random_index = (buf[0] as usize) % code_lines.len();  // Use modulus to get a valid index

    // Return the selected random code line to be displayed
    code_lines[random_index].to_string()
}
