const output = document.querySelector("#output");
const randomFileButton = document.getElementById("random-file-btn");
const fileUpload = document.getElementById("file-upload");
const fileGuessBtn = document.getElementById("file-guess-btn");
const fileGuessInput = document.getElementById("file-guess");
const terminalModeBtn = document.getElementById("terminal-mode-btn");
let fullCode = '';
let currentChar = 0;
let currentFileName = '';
let testFinished = false;
let startTime;
let typedChars = 0;
let inTerminalMode = false;
let terminalModeLastPosition = 0;

// Rust-themed shitpost message
const rustShitpost = `What is this, JavaScript? Upload Rust files only! 🦀`;

// Function to apply basic syntax highlighting
function applyRustHighlighting(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\b(fn|let|const|use|mod|pub|impl|struct|enum)\b/g, '<span class="keyword">$1</span>')
        .replace(/\b(i32|u32|String|Vec)\b/g, '<span class="type">$1</span>')
        .replace(/({|}|\(|\)|=>|::|,|;)/g, '<span class="symbol">$1</span>');
}

// Handle file upload and show the content in the game
fileUpload.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        if (!file.name.endsWith('.rs')) {
            output.innerHTML = rustShitpost;
            return;
        }
        const reader = new FileReader();
        reader.onload = function(e) {
            fullCode = e.target.result;
            currentChar = 0;
            output.innerHTML = '';
            displayCode();
            startTypingTest();
        };
        reader.readAsText(file);
    }
});

// Fetches a random file from the assets/data directory
async function loadRandomFile() {
    try {
        output.textContent = 'Loading a random file...';
        const fileListResponse = await fetch('./assets/data/files.json');
        if (!fileListResponse.ok) throw new Error('Could not fetch files.json');
        
        const fileListData = await fileListResponse.json();
        const files = fileListData.files;

        if (files.length === 0) {
            throw new Error('No files available in the data directory.');
        }

        const randomFile = files[Math.floor(Math.random() * files.length)];
        currentFileName = randomFile;

        const response = await fetch(`./assets/data/${randomFile}`);
        if (!response.ok) throw new Error(`File not found: ${randomFile}`);

        fullCode = await response.text();
        currentChar = 0;
        inTerminalMode = false;
        terminalModeBtn.innerHTML = "Terminal<code>.rs</code>";
        displayCode();
        startTypingTest();

        console.log(`Loaded file: ${randomFile}`);
    } catch (error) {
        console.error('Error loading file:', error);
        output.textContent = 'Error loading file. Check console for details.';
    }
}

// Automatically load a random file when the page loads
window.addEventListener('load', loadRandomFile);

// Prevent the spacebar from activating the page scrollbar
window.addEventListener('keydown', (event) => {
    if (event.code === "Space" && event.target === document.body) {
        event.preventDefault();
    }
});

// Function to display the code with proper highlighting
function displayCode() {
    let typedText = fullCode.substring(0, currentChar);
    let nextChar = fullCode[currentChar] || '';
    let remainingText = fullCode.substring(currentChar + 1);

    let highlightedNextChar = nextChar;
    if (nextChar === ' ' || nextChar === '\n') {
        highlightedNextChar = '<span style="background-color: #3c3836;">␣</span>';
    } else if (nextChar === '\t') {
        highlightedNextChar = '<span style="background-color: #3c3836;">␣␣␣␣</span>';
    }

    if (inTerminalMode) {
        output.innerHTML = applyRustHighlighting(typedText) + '<span class="thick-cursor" style="color: #ebdbb2; background-color: #ebdbb2;">█</span>';
    } else {
        output.innerHTML = `${applyRustHighlighting(typedText)}` +
            `<span class="cursor">${highlightedNextChar}</span>` +
            `<span class="low-opacity">${remainingText}</span>`;
    }

    // Scroll to keep the cursor in view
    const cursorElement = output.querySelector('.cursor') || output.querySelector('.thick-cursor');
    if (cursorElement) {
        cursorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

// Handle typing
document.addEventListener('keydown', (event) => {
    if (document.activeElement === fileGuessInput || testFinished) {
        return;
    }

    if (event.key === 'Shift' || event.key === 'Control' || event.key === 'Alt') {
        return; // Ignore modifier keys
    }

    event.preventDefault(); // Prevent default for all other keys

    if (inTerminalMode) {
        handleTerminalMode();
    } else if (currentChar < fullCode.length) {
        let expectedChar = fullCode[currentChar];

        if (event.key === expectedChar || 
           (expectedChar === '\n' && event.key === 'Enter') ||
           (expectedChar === '\t' && event.key === 'Tab')) {
            currentChar++;
            typedChars++;
            if (expectedChar === '\t') {
                currentChar += 3; // Skip three extra spaces for tab (4 spaces total)
                typedChars += 3; // Count tab as four characters
            }
            displayCode();

            if (currentChar >= fullCode.length) {
                endSpeedTypingTest();
            }
        } else {
            // Show wrong character in red
            let typedText = fullCode.substring(0, currentChar);
            let wrongChar = `<span style="color: #fb4934; background-color: #3c3836;">${event.key === ' ' ? '␣' : event.key}</span>`;
            let remainingText = fullCode.substring(currentChar);

            output.innerHTML = `${applyRustHighlighting(typedText)}` +
                wrongChar +
                `<span class="low-opacity">${remainingText}</span>`;
        }
    }
});

function startTypingTest() {
    startTime = new Date();
    typedChars = 0;
    testFinished = false;
}

function calculateWPM() {
    const endTime = new Date();
    const timeElapsed = (endTime - startTime) / 60000; // in minutes
    return Math.round((typedChars / 5) / timeElapsed); // Assuming average word length of 5 characters
}

function endSpeedTypingTest() {
    testFinished = true;
    const wpm = calculateWPM();
    output.innerHTML = applyRustHighlighting(fullCode);
    output.classList.remove('low-opacity');
    output.innerHTML += `<br><span style="color: green;">You Win! WPM: ${wpm}. Click "Random<code>.rs</code>" to play again.</span>`;
}

// Reset game and load a new file when "Load New" button is clicked
randomFileButton.addEventListener("click", loadRandomFile);

// File guessing game logic
fileGuessBtn.addEventListener('click', () => {
    const guess = fileGuessInput.value.trim();
    const wpm = calculateWPM();
    if (guess === currentFileName) {
        const successMessage = `<span style="color: #b8bb26;">Correct! Filename: ${currentFileName}. Crab WPM: ${wpm} 🦀</span>`;
        output.innerHTML = applyRustHighlighting(fullCode) + '<br>' + successMessage;
        output.classList.remove('low-opacity');
        testFinished = true;
    } else {
        const failureMessage = `<span style="color: #fb4934;">Wrong guess! Try again... Crab WPM: ${wpm} 🦀</span>`;
        output.innerHTML = failureMessage + '<br><img id="error-image" src="./assets/img/rust.jpg" alt="Error image" />';
        inTerminalMode = false;
        terminalModeBtn.innerHTML = "Terminal<code>.rs</code>";
    }
    fileGuessInput.value = '';
    output.scrollTop = 0; // Scroll to top when showing failure message
});

// Terminal Mode logic
function handleTerminalMode() {
    const charsToComplete = Math.floor(Math.random() * 6) + 5; // Complete 5 to 10 characters
    for (let i = 0; i < charsToComplete && currentChar < fullCode.length; i++) {
        currentChar++;
        typedChars++;
        if (fullCode[currentChar - 1] === '\t') {
            currentChar += 3; // Skip three extra spaces for tab (4 spaces total)
            typedChars += 3; // Count tab as four characters
        }
    }
    displayCode();

    if (currentChar >= fullCode.length) {
        endSpeedTypingTest();
        inTerminalMode = false;
        terminalModeBtn.innerHTML = "Terminal<code>.rs</code>";
    }
}

// Terminal Mode button event listener
terminalModeBtn.addEventListener("click", () => {
    inTerminalMode = !inTerminalMode;
    if (inTerminalMode) {
        terminalModeBtn.innerHTML = "<code>:q</code>";
        currentChar = terminalModeLastPosition;
        startTypingTest();
    } else {
        terminalModeBtn.innerHTML = "Terminal<code>.rs</code>";
        terminalModeLastPosition = currentChar;
    }
    displayCode();
});

// Add event listener for error image click
output.addEventListener('click', (event) => {
    if (event.target.id === 'error-image') {
        loadRandomFile();
    }
});

// Initialize the game
loadRandomFile();