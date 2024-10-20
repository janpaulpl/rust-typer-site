const output = document.querySelector("#output");
const randomFileButton = document.getElementById("random-file-btn");
const fileUpload = document.getElementById("file-upload");
const fileGuessBtn = document.getElementById("file-guess-btn");
const fileGuessOutput = document.getElementById("file-guess-output");
const fileGuessInput = document.getElementById("file-guess");
let fullCode = '';
let currentChar = 0;
let currentFileName = '';
let testFinished = false;
let startTime;
let typedChars = 0;
let inTerminalMode = false;

// Create Terminal Mode button
const terminalModeBtn = document.createElement("button");
terminalModeBtn.innerHTML = "Terminal<code>.rs</code>";
terminalModeBtn.id = "terminal-mode-btn";

// Move Terminal Mode button to the top
const buttonContainer = document.createElement("div");
buttonContainer.id = "button-container";
buttonContainer.appendChild(randomFileButton);
buttonContainer.appendChild(terminalModeBtn);
document.body.insertBefore(buttonContainer, fileUpload);

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
    if (inTerminalMode) {
        let typedText = fullCode.substring(0, currentChar);
        output.innerHTML = `${applyRustHighlighting(typedText)}<span class="thick-cursor">█</span>`;
    } else {
        let typedText = fullCode.substring(0, currentChar);
        let nextChar = fullCode[currentChar] || '';
        let remainingText = fullCode.substring(currentChar + 1);

        let highlightedNextChar = nextChar;
        if (nextChar === ' ' || nextChar === '\n' || nextChar === '\t') {
            highlightedNextChar = '<span style="background-color: #3c3836;">␣</span>';
        }

        output.innerHTML = `<span class="highlighted">${applyRustHighlighting(typedText)}</span>` +
            `<span class="cursor">${highlightedNextChar}</span>` +
            `<span class="low-opacity">${applyRustHighlighting(remainingText)}</span>`;
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
            displayCode();

            if (currentChar >= fullCode.length) {
                endSpeedTypingTest();
            }
        } else {
            // Show wrong character in red
            let typedText = fullCode.substring(0, currentChar);
            let wrongChar = `<span style="color: #fb4934; background-color: #3c3836;">${event.key === ' ' ? '␣' : event.key}</span>`;
            let remainingText = fullCode.substring(currentChar);

            output.innerHTML = `<span class="highlighted">${applyRustHighlighting(typedText)}</span>` +
                wrongChar +
                `<span class="low-opacity">${applyRustHighlighting(remainingText)}</span>`;
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
randomFileButton.addEventListener("click", () => {
    loadRandomFile();
    fileGuessOutput.innerHTML = '';
    fileGuessInput.value = '';
    testFinished = false;
    inTerminalMode = false;
    terminalModeBtn.innerHTML = "Terminal<code>.rs</code>";
});

// File guessing game logic
fileGuessBtn.addEventListener('click', () => {
    const guess = fileGuessInput.value.trim();
    const wpm = calculateWPM();
    if (guess === currentFileName) {
        fileGuessOutput.innerHTML = `<span class="correct">You got it! Completing the code... Crab WPM: ${wpm} 🦀</span>`;
        inTerminalMode = false;
        terminalModeBtn.innerHTML = "Terminal<code>.rs</code>";
        output.innerHTML = applyRustHighlighting(fullCode);
        output.classList.remove('low-opacity');
        testFinished = true;
    } else {
        fileGuessOutput.innerHTML = `<span class="wrong">Wrong guess! Try again... Crab WPM: ${wpm} 🦀</span>`;
        output.innerHTML = `<img id="error-image" src="./assets/img/rust.jpg" alt="Error image" />`;
        document.getElementById("error-image").addEventListener('click', () => {
            loadRandomFile();
            inTerminalMode = true;
            terminalModeBtn.innerHTML = "<code>:q</code>";
            currentChar = 0;
            displayCode();
        });
    }
});

// Terminal Mode logic
function handleTerminalMode() {
    const charsToComplete = Math.floor(Math.random() * 6) + 5; // Complete 5 to 10 characters
    for (let i = 0; i < charsToComplete && currentChar < fullCode.length; i++) {
        currentChar++;
        typedChars++;
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
        currentChar = 0;
        startTypingTest();
    } else {
        terminalModeBtn.innerHTML = "<Terminal<code>.rs</code>";
    }
    displayCode();
});

// Add CSS for thick cursor
const style = document.createElement('style');
style.textContent = `
    .thick-cursor {
        font-weight: bold;
        background-color: #282828;
        color: #ebdbb2;
        margin-left: -2px;
    }
`;
document.head.appendChild(style);