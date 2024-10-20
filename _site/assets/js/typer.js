const output = document.querySelector("#output");
const randomFileButton = document.getElementById("random-file-btn");
const fileUpload = document.getElementById("file-upload");
const guessInput = document.getElementById("guess-input");
const guessButton = document.getElementById("guess-button");
const guessResult = document.getElementById("guess-result");

let lines = [];
let currentLine = 0;
let currentChar = 0;
let buffer = '';  // Buffer to hold the characters of the current line
let currentFileName = '';  // Holds the name of the current file

// Rust-themed shitpost message
const rustShitpost = `What is this, JavaScript? Upload Rust files only, hacker! 🦀`;

// Fetches the list of available Rust files from files.json
async function loadRandomFile() {
    try {
        output.textContent = 'Loading a random file...';

        // Fetching the list of files from files.json in the relative assets/data directory
        const fileListResponse = await fetch('./assets/data/files.json');
        if (!fileListResponse.ok) throw new Error('Could not fetch files.json');

        const fileListData = await fileListResponse.json();
        const files = fileListData.files;

        if (files.length === 0) {
            throw new Error('No files available in the data directory.');
        }

        // Choose a random file from the list
        const randomFile = files[Math.floor(Math.random() * files.length)];
        currentFileName = randomFile;  // Set the current file name for guessing

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

// Rust-like function to apply basic syntax highlighting
function applyRustHighlighting(text) {
    return text
        .replace(/\b(fn|let|const|use|mod|pub|impl|struct|enum)\b/g, '<span class="keyword">$1</span>')
        .replace(/\b(i32|u32|String|Vec)\b/g, '<span class="type">$1</span>')
        .replace(/({|}|\(|\)|=>|::|,|;)/g, '<span class="symbol">$1</span>');
}

// Displays the next 5-10 characters in the current file with Rust syntax highlighting
function displayNextChars() {
    if (currentLine >= lines.length) {
        return;  // Stop typing when the file is done
    }

    const line = lines[currentLine];
    const charsToLoad = Math.floor(Math.random() * 6) + 5;  // Load 5-10 characters

    if (currentChar < line.length) {
        buffer += line.slice(currentChar, currentChar + charsToLoad);  // Load the next chunk of characters
        currentChar += charsToLoad;

        output.innerHTML = applyRustHighlighting(buffer);  // Apply syntax highlighting
    } else {
        buffer += "\n";  // Add a line break when the full line is complete
        currentLine++;
        currentChar = 0;
        output.innerHTML = applyRustHighlighting(buffer);  // Reapply syntax highlighting
    }
}

// Guess the current file name game
function checkGuess() {
    const guess = guessInput.value.trim();
    if (guess === currentFileName) {
        guessResult.textContent = "Correct!";
        guessResult.style.color = "green";
    } else {
        guessResult.textContent = "Incorrect, loser!";
        guessResult.style.color = "red";
    }
}

// Add event listener for guessing game
guessButton.addEventListener("click", checkGuess);

// Add file upload and keypress event listeners
fileUpload.addEventListener('change', (event) => {
    const file = event.target.files[0];

    if (file) {
        if (!file.name.endsWith('.rs')) {
            output.innerHTML = rustShitpost;
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
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

// Load a new random file when the button is clicked
randomFileButton.addEventListener("click", () => {
    loadRandomFile();  // Load a new random file
    buffer = '';  // Reset buffer for new file
    output.innerHTML = '';  // Clear output for new content
});

// Listen for keypress events to simulate typing
document.addEventListener("keypress", (event) => {
    if (event.key.length === 1) {
        displayNextChars();
    }
});

// Load a random file at the start
loadRandomFile();
