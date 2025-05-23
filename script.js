/*
 * DBV PWA Teleprompter
 * Copyright (c) 2024 David Bueno Vallejo
 * Desarrollado por David Bueno Vallejo con la asistencia de la IA de Google.
 *
 * Este software se distribuye bajo la Licencia MIT.
 * Consulta el archivo LICENSE para más detalles:
 * https://github.com/davidbuenov/DBVTeleprompter/blob/main/LICENSE
 */

// DOM Elements
const textInput = document.getElementById('text-input');
const startButton = document.getElementById('start-button');
const teleprompterView = document.getElementById('teleprompter-view');
const teleprompterText = document.getElementById('teleprompter-text');
const setupContainer = document.getElementById('setup-container');
const speedDisplay = document.getElementById('speed-display');
const fontSizeDisplay = document.getElementById('fontsize-display');
const keyConfigContainer = document.getElementById('key-config-container');
const showKeyConfigButton = document.getElementById('show-key-config');

// Key display elements in footer
const dispPlayPause = document.getElementById('disp-playpause');
const dispSpeedUp = document.getElementById('disp-speedup');
const dispSpeedDown = document.getElementById('disp-speeddown');
const dispFontUp = document.getElementById('disp-fontup');
const dispFontDown = document.getElementById('disp-fontdown');
const dispNudgeFwd = document.getElementById('disp-nudgeforward');
const dispNudgeBack = document.getElementById('disp-nudgebackward');
const dispExit = document.getElementById('disp-exit');


// State Variables
let currentSpeed = 1.0; // Pixels per frame
let currentFontSize = 40; // px
let isRunning = false;
let animationFrameId;
let currentScrollY = 0;
const nudgeAmount = 50; // pixels to nudge by

// Key Configuration
let keyConfig = {};
const defaultKeyConfig = {
    playPause: ' ', // Spacebar
    speedUp: '=', 
    speedDown: '-',
    fontUp: 'PageUp',
    fontDown: 'PageDown',
    nudgeForward: 'ArrowDown',
    nudgeBackward: 'ArrowUp',
    exit: 'Escape'
};

function updateKeyDisplayFooter() {
    dispPlayPause.textContent = keyConfig.playPause === ' ' ? 'Space' : keyConfig.playPause;
    dispSpeedUp.textContent = keyConfig.speedUp === '=' ? '+' : keyConfig.speedUp;
    dispSpeedDown.textContent = keyConfig.speedDown;
    dispFontUp.textContent = keyConfig.fontUp;
    dispFontDown.textContent = keyConfig.fontDown;
    dispNudgeFwd.textContent = keyConfig.nudgeForward;
    dispNudgeBack.textContent = keyConfig.nudgeBackward;
    dispExit.textContent = keyConfig.exit;
}

function loadKeyConfig(forceDefaults = false) {
    const storedConfig = localStorage.getItem('teleprompterKeyConfig');
    if (storedConfig && !forceDefaults) {
        try {
            keyConfig = JSON.parse(storedConfig);
            // Ensure all keys are present, falling back to defaults if a key is missing
            for (const key in defaultKeyConfig) {
                if (!keyConfig.hasOwnProperty(key)) {
                    keyConfig[key] = defaultKeyConfig[key];
                }
            }
        } catch (e) {
            console.error("Error parsing stored key config, using defaults.", e);
            keyConfig = { ...defaultKeyConfig };
        }
    } else {
        keyConfig = { ...defaultKeyConfig };
    }
    // Populate input fields
    document.getElementById('key-playpause').value = keyConfig.playPause === ' ' ? 'Space' : keyConfig.playPause;
    document.getElementById('key-speedup').value = keyConfig.speedUp;
    document.getElementById('key-speeddown').value = keyConfig.speedDown;
    document.getElementById('key-fontup').value = keyConfig.fontUp;
    document.getElementById('key-fontdown').value = keyConfig.fontDown;
    document.getElementById('key-nudgeforward').value = keyConfig.nudgeForward;
    document.getElementById('key-nudgebackward').value = keyConfig.nudgeBackward;
    document.getElementById('key-exit').value = keyConfig.exit;
    updateKeyDisplayFooter();
}

function saveKeyConfig() {
    // Read from input fields, handling "Space" display
    keyConfig.playPause = document.getElementById('key-playpause').value === 'Space' ? ' ' : document.getElementById('key-playpause').value;
    keyConfig.speedUp = document.getElementById('key-speedup').value;
    keyConfig.speedDown = document.getElementById('key-speeddown').value;
    keyConfig.fontUp = document.getElementById('key-fontup').value;
    keyConfig.fontDown = document.getElementById('key-fontdown').value;
    keyConfig.nudgeForward = document.getElementById('key-nudgeforward').value;
    keyConfig.nudgeBackward = document.getElementById('key-nudgebackward').value;
    keyConfig.exit = document.getElementById('key-exit').value;
    localStorage.setItem('teleprompterKeyConfig', JSON.stringify(keyConfig));
    alert('Key configuration saved!');
    updateKeyDisplayFooter();
}

function setupKeyConfigListeners() {
    const inputs = document.querySelectorAll('#key-config-container input[type="text"]');
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.dataset.originalValue = input.value; // Store original value
            input.value = 'Press a key...';
            input.select(); // Select text for easy overwrite
        });
        input.addEventListener('keydown', (event) => {
            event.preventDefault();
            input.value = event.key === ' ' ? 'Space' : event.key; // Display "Space" for spacebar
            input.blur(); // Remove focus after setting
        });
        input.addEventListener('blur', () => { // If blurred without keypress, restore
            if (input.value === 'Press a key...') {
                input.value = input.dataset.originalValue || 'Unknown';
            }
        });
    });
}

function toggleKeyConfig() {
    if (keyConfigContainer.style.display === 'none') {
        keyConfigContainer.style.display = 'block';
        showKeyConfigButton.textContent = 'Hide Key Config';
    } else {
        keyConfigContainer.style.display = 'none';
        showKeyConfigButton.textContent = 'Configure Keys';
    }
}


// Control Functions
function updateSpeedDisplay() {
    speedDisplay.textContent = currentSpeed.toFixed(1);
}

function changeSpeed(amount) {
    currentSpeed += amount;
    if (currentSpeed < 0.1) currentSpeed = 0.1;
    if (currentSpeed > 10) currentSpeed = 10;
    updateSpeedDisplay();
}

function updateFontSizeDisplay() {
    fontSizeDisplay.textContent = currentFontSize;
    if (teleprompterView.style.display === 'block') {
         teleprompterText.style.fontSize = currentFontSize + 'px';
    }
}

function changeFontSize(amount) {
    currentFontSize += amount;
    if (currentFontSize < 10) currentFontSize = 10;
    if (currentFontSize > 200) currentFontSize = 200;
    updateFontSizeDisplay();
}

// Core Prompter Logic
function scrollLoop() {
    if (!isRunning) return;

    currentScrollY += currentSpeed;
    teleprompterText.style.transform = `translateY(-${currentScrollY}px)`;

    const textHeight = teleprompterText.scrollHeight;
    const viewHeight = teleprompterView.clientHeight;
    if (currentScrollY > textHeight + viewHeight * 0.2) {
        stopPrompter();
        // exitPrompter(); // Optionally exit automatically
    }
    animationFrameId = requestAnimationFrame(scrollLoop);
}

function startPrompter() {
    const text = textInput.value;
    if (!text.trim()) {
        alert("Please paste some text first.");
        return;
    }
    teleprompterText.innerHTML = text.replace(/\n/g, '<br>'); // Ensure line breaks are rendered
    teleprompterText.style.fontSize = currentFontSize + 'px';
    
    currentScrollY = 0; 
    teleprompterText.style.transform = `translateY(0px)`;

    document.querySelector('.setup-wrapper').style.display = 'none'; // Hide the whole setup wrapper
    teleprompterView.style.display = 'block';
    isRunning = true;
    scrollLoop();
}

function stopPrompter() {
    isRunning = false;
    cancelAnimationFrame(animationFrameId);
}

function togglePlayPause() {
    if (teleprompterView.style.display !== 'block') return;
    if (isRunning) {
        stopPrompter();
    } else {
        isRunning = true;
        scrollLoop();
    }
}

function nudgeScroll(direction) { 
    if (teleprompterView.style.display !== 'block') return;
    
    const wasRunning = isRunning;
    if (wasRunning) stopPrompter();

    currentScrollY -= direction * nudgeAmount; 
    if (currentScrollY < 0) currentScrollY = 0;

    const textHeight = teleprompterText.scrollHeight;
    const viewHeight = teleprompterView.clientHeight;
    if (currentScrollY > textHeight + viewHeight * 0.2) {
        currentScrollY = textHeight + viewHeight * 0.2;
    }
    teleprompterText.style.transform = `translateY(-${currentScrollY}px)`;
    
    if (wasRunning) {
         isRunning = true;
         scrollLoop();
    }
}

function exitPrompter() {
    stopPrompter();
    teleprompterView.style.display = 'none';
    document.querySelector('.setup-wrapper').style.display = 'flex'; // Show setup wrapper
}

// Event Listeners
startButton.addEventListener('click', startPrompter);

document.addEventListener('keydown', (event) => {
    if (document.activeElement && document.activeElement.closest('#key-config-container input[type="text"]')) {
        return; // Ignore if configuring keys
    }
    // Make sure keyConfig is loaded
    if (Object.keys(keyConfig).length === 0) loadKeyConfig();


    if (teleprompterView.style.display === 'block') {
        if (event.key === keyConfig.playPause) { event.preventDefault(); togglePlayPause(); }
        else if (event.key === keyConfig.speedUp) { event.preventDefault(); changeSpeed(0.1); }
        else if (event.key === keyConfig.speedDown) { event.preventDefault(); changeSpeed(-0.1); }
        else if (event.key === keyConfig.fontUp) { event.preventDefault(); changeFontSize(2); }
        else if (event.key === keyConfig.fontDown) { event.preventDefault(); changeFontSize(-2); }
        else if (event.key === keyConfig.nudgeForward) { event.preventDefault(); nudgeScroll(-1); }
        else if (event.key === keyConfig.nudgeBackward) { event.preventDefault(); nudgeScroll(1); }
        else if (event.key === keyConfig.exit) { event.preventDefault(); exitPrompter(); }
    } else if (document.getElementById('setup-container').style.display !== 'none') { // Setup screen is active
        // Allow +/- for speed/font on setup screen IF NOT typing in textarea
        if (document.activeElement.tagName.toLowerCase() !== 'textarea') {
             if (event.key === keyConfig.speedUp || (keyConfig.speedUp === '=' && event.key === '+')) {
                event.preventDefault();
                changeSpeed(0.1);
            } else if (event.key === keyConfig.speedDown) {
                event.preventDefault();
                changeSpeed(-0.1);
            } else if (event.key === keyConfig.fontUp) {
                event.preventDefault();
                changeFontSize(2);
            } else if (event.key === keyConfig.fontDown) {
                event.preventDefault();
                changeFontSize(-2);
            }
        }
    }
});

// Initial Load
document.addEventListener('DOMContentLoaded', () => {
    loadKeyConfig();
    setupKeyConfigListeners();
    updateSpeedDisplay();
    updateFontSizeDisplay();

    const savedText = localStorage.getItem('teleprompterLastText');
    if (savedText) {
        textInput.value = savedText;
    }
    textInput.addEventListener('input', () => {
        localStorage.setItem('teleprompterLastText', textInput.value);
    });
});
// PWA Service Worker Registration
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(registration => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      })
      .catch(error => {
        console.log('ServiceWorker registration failed: ', error);
      });
  });
}