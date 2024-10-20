const output = document.querySelector("#output");
const randomFileButton = document.getElementById("random-file-btn");
const fileUpload = document.getElementById("file-upload");
const fileGuessBtn = document.getElementById("file-guess-btn");
const fileGuessOutput = document.getElementById("file-guess-output");
const fileGuessInput = document.getElementById("file-guess");
let lines = [];
let currentLine = 0;
let currentChar = 0;
let buffer = '';  // Buffer to hold the characters of the current line
let currentFileName = ''; // Variable to hold the current file name

// Rust-themed shitpost message
const rustShitpost = `What is this, JavaScript? Upload Rust files only! 🦀`;

// Function to apply basic syntax highlighting
function applyRustHighlighting(text) {
    return text
        .replace(/\b(fn|let|const|use|mod|pub|impl|struct|enum)\b/g, '<span class="keyword">$1</span>')
        .replace(/\b(i32|u32|String|Vec)\b/g, '<span class="type">$1</span>')
        .replace(/({|}|\(|\)|=>|::|,|;)/g, '<span class="symbol">$1</span>');
}

// Handle file upload and show the content in the game
fileUpload.addEventListener('change', (event) => {
    const file = event.target.files[0];

    if (file) {
        // Check if the uploaded file is a Rust file
        if (!file.name.endsWith('.rs')) {
            // Display the Rust-themed shitpost if it's not a Rust file
            output.innerHTML = rustShitpost;
            return;  // Stop further processing
        }

        // If it's a Rust file, read and display the file content
        const reader = new FileReader();
        reader.onload = function(e) {
            const content = e.target.result;
            lines = content.split("\n"); // Split content by lines
            currentLine = 0;
            currentChar = 0;
            buffer = '';  // Reset the buffer
            output.innerHTML = ''; // Clear previous output
        };
        reader.readAsText(file);
    }
});

// Fetches a random file from the assets/data directory based on the files listed in files.json
async function loadRandomFile() {
    try {
        output.textContent = 'Loading a random file...';

        const fileListResponse = await fetch('./assets/data/files.json'); // Fetch the list of files
        if (!fileListResponse.ok) throw new Error('Could not fetch files.json');
        
        const fileListData = await fileListResponse.json();
        const files = fileListData.files;

        if (files.length === 0) {
            throw new Error('No files available in the data directory.');
        }

        // Choose a random file from the list
        const randomFile = files[Math.floor(Math.random() * files.length)];
        currentFileName = randomFile;

        // Fetch the content of the random file
        const response = await fetch(`./assets/data/${randomFile}`);
        if (!response.ok) throw new Error(`File not found: ${randomFile}`);

        // Read and split file content into lines
        const text = await response.text();
        lines = text.split("\n");
        currentLine = 0;
        currentChar = 0;
        buffer = '';  // Reset the buffer
        output.innerHTML = ''; // Clear previous output

        console.log(`Loaded file: ${randomFile}`);
    } catch (error) {
        console.error('Error loading file:', error);
        output.textContent = 'Error loading file. Check console for details.';
    }
}

// Automatically load a random file when the page loads
window.addEventListener('load', () => {
    loadRandomFile();
});

// Displays the next 5-10 characters in the current file with manual Rust highlighting
function displayNextChars() {
    if (currentLine >= lines.length) {
        return;  // Stop typing when the file is done
    }

    const line = lines[currentLine];

    // Determine how many characters to display (random between 5 and 10)
    const charsToDisplay = Math.floor(Math.random() * 6) + 5;  // Random number between 5 and 10
    let charsAdded = 0;

    // Add characters to the buffer, but only up to charsToDisplay
    while (currentChar < line.length && charsAdded < charsToDisplay) {
        buffer += line[currentChar];  // Accumulate characters in the buffer
        currentChar++;
        charsAdded++;
    }

    // If the end of the line is reached, move to the next line
    if (currentChar >= line.length) {
        buffer += "\n";  // Add a line break when the full line is complete
        currentLine++;
        currentChar = 0;
    }

    // Apply syntax highlighting and update the output
    output.innerHTML = applyRustHighlighting(buffer) + `<span class="cursor">█</span>`;  // Add the cursor
}

// Listen for keypress events to simulate typing
document.addEventListener('keypress', (event) => {
    if (event.key.length === 1) { // Only handle actual character input
        displayNextChars();  // Display 5-10 characters per keystroke
    }
});

// File guessing game logic
fileGuessBtn.addEventListener('click', () => {
    const guess = fileGuessInput.value.trim();
    if (guess === currentFileName) {
        // Correct guess
        fileGuessOutput.innerHTML = `<span class="correct">You got it! Completing the code...</span>`;
        output.innerHTML = applyRustHighlighting(lines.join("\n")); // Display full file
    } else {
        // Wrong guess
        fileGuessOutput.innerHTML = `<span class="wrong">Wrong guess! Loading an image...</span>`;
        output.innerHTML = ''; // Clear the text
        // Load and display the image
        output.innerHTML = `<img id="error-image" src="./assets/img/wrong-answer.jpg" alt="Error image" />`;
    }
});

// Reset game and load a new file when "Load New" button is clicked
randomFileButton.addEventListener("click", () => {
    loadRandomFile();  // Load a new random file
    buffer = '';  // Reset buffer for new file
    output.innerHTML = '';  // Clear output for new content
    fileGuessOutput.innerHTML = '';  // Clear the guess output
    fileGuessInput.value = '';  // Clear the input field
});
