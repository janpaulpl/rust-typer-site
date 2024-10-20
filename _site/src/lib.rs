use wasm_bindgen::prelude::*;
use serde::Deserialize;

// Rust file for WebAssembly support

// External function to write output to the DOM
#[wasm_bindgen]
extern {
    fn write_output(s: &str);
}

// Shitpost message for non-Rust files
#[wasm_bindgen]
pub fn get_shitpost() -> String {
    "What is this, JavaScript? Upload Rust files only, hacker! 🦀".to_string()
}

// Apply Rust syntax highlighting (similar logic as before)
#[wasm_bindgen]
pub fn apply_rust_highlighting(text: &str) -> String {
    let mut highlighted_text = text.to_string();
    highlighted_text = highlighted_text
        .replace("fn", "<span class='keyword'>fn</span>")
        .replace("let", "<span class='keyword'>let</span>")
        .replace("const", "<span class='keyword'>const</span>")
        .replace("use", "<span class='keyword'>use</span>")
        .replace("mod", "<span class='keyword'>mod</span>")
        .replace("impl", "<span class='keyword'>impl</span>")
        .replace("struct", "<span class='keyword'>struct</span>")
        .replace("enum", "<span class='keyword'>enum</span>");

    highlighted_text = highlighted_text
        .replace("i32", "<span class='type'>i32</span>")
        .replace("u32", "<span class='type'>u32</span>")
        .replace("String", "<span class='type'>String</span>")
        .replace("Vec", "<span class='type'>Vec</span>");

    highlighted_text = highlighted_text
        .replace("{", "<span class='symbol'>{</span>")
        .replace("}", "<span class='symbol'>}</span>")
        .replace("(", "<span class='symbol'>(</span>")
        .replace(")", "<span class='symbol'>)</span>")
        .replace("=>", "<span class='symbol'>=></span>")
        .replace("::", "<span class='symbol'>::</span>")
        .replace(",", "<span class='symbol'>,</span>")
        .replace(";", "<span class='symbol'>;</span>");
        
    highlighted_text
}

// Simulate typing functionality
#[wasm_bindgen]
pub fn simulate_typing(text: &str) -> String {
    // In this simplified version, we'll just return the full content as a string
    let mut typed_text = String::new();
    typed_text.push_str(text);
    typed_text
}
