import init, { apply_rust_highlighting, get_shitpost, simulate_typing } from './pkg/rust_typer.js';

async function run() {
    await init();

    const output = document.getElementById("output");
    const randomFileButton = document.getElementById("random-file-btn");
    const fileUpload = document.getElementById("file-upload");

    // Handle file upload and show the content in the game
    fileUpload.addEventListener('change', (event) => {
        const file = event.target.files[0];

        if (file) {
            if (!file.name.endsWith('.rs')) {
                output.innerHTML = get_shitpost();  // Call Rust function for shitpost
                return;
            }

            const reader = new FileReader();
            reader.onload = function(e) {
                const content = e.target.result;
                output.innerHTML = apply_rust_highlighting(content);  // Call Rust function for highlighting
            };
            reader.readAsText(file);
        }
    });

    randomFileButton.addEventListener("click", () => {
        output.innerHTML = simulate_typing("fn main() { println!(\"Hello, world!\"); }");  // Call Rust function for typing simulation
    });
}

run();
