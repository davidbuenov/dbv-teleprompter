/*
 * DBV Teleprompter — PWA + app de escritorio para leer texto en scroll
 * Copyright (c) 2025-2026 David Bueno Vallejo · https://davidbuenov.com
 * Desarrollado por David Bueno Vallejo con la asistencia de IA.
 *
 * Este software se distribuye bajo la Licencia MIT.
 * Consulta el archivo LICENSE para más detalles:
 * https://github.com/davidbuenov/dbv-teleprompter/blob/main/LICENSE
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

// Script stats
const scriptStats = document.getElementById('script-stats');
const wordCountDisplay = document.getElementById('word-count');
const readTimeDisplay = document.getElementById('read-time');

// Toast
const toastElement = document.getElementById('toast');
let toastTimeoutId;

// Key display elements in footer
const dispPlayPause = document.getElementById('disp-playpause');
const dispSpeedUp = document.getElementById('disp-speedup');
const dispSpeedDown = document.getElementById('disp-speeddown');
const dispFontUp = document.getElementById('disp-fontup');
const dispFontDown = document.getElementById('disp-fontdown');
const dispNudgeFwd = document.getElementById('disp-nudgeforward');
const dispNudgeBack = document.getElementById('disp-nudgebackward');
const dispExit = document.getElementById('disp-exit');

// Key hints shown next to the speed / font steppers
const hintSpeedUp = document.getElementById('hint-speedup');
const hintSpeedDown = document.getElementById('hint-speeddown');
const hintFontUp = document.getElementById('hint-fontup');
const hintFontDown = document.getElementById('hint-fontdown');


// State Variables
let currentSpeed = 1.0; // Pixels per frame
let currentFontSize = 40; // px
let isRunning = false;
let animationFrameId;
let currentScrollY = 0;
const nudgeAmount = 50; // pixels to nudge by
const wordsPerMinute = 140; // average speaking pace, used for the duration estimate

// Shows a short message at the bottom of the screen. Replaces alert(): native dialogs look foreign
// inside the app and behave inconsistently across Tauri's WebViews on each platform.
function showToast(message) {
    if (!toastElement) return;
    toastElement.textContent = message;
    toastElement.classList.add('is-visible');
    clearTimeout(toastTimeoutId);
    toastTimeoutId = setTimeout(() => toastElement.classList.remove('is-visible'), 2400);
}

// Word count + estimated spoken duration. Useful when preparing a recording: knowing a script runs
// ~2:40 is working information, not decoration.
function updateScriptStats() {
    if (!wordCountDisplay || !readTimeDisplay) return;

    const words = textInput.value.trim().split(/\s+/).filter(Boolean).length;
    wordCountDisplay.textContent = words === 1 ? '1 word' : `${words} words`;

    const totalSeconds = Math.round((words / wordsPerMinute) * 60);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    readTimeDisplay.textContent = `${minutes}:${String(seconds).padStart(2, '0')}`;

    scriptStats.classList.toggle('is-active', words > 0);
}

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

// Compact key names for the hints next to the steppers, where horizontal space is tight and a long
// name ("PageDown") would push its stepper out of line with the other one. The reference table below
// has room, so it keeps the full names.
const shortKeyLabels = {
    ' ': 'Space',
    'PageUp': 'PgUp',
    'PageDown': 'PgDn',
    'ArrowUp': '↑',
    'ArrowDown': '↓',
    'ArrowLeft': '←',
    'ArrowRight': '→',
    'Escape': 'Esc',
    '=': '+'
};

function shortKeyLabel(key) {
    return shortKeyLabels[key] || key;
}

function updateKeyDisplayFooter() {
    const speedUpLabel = keyConfig.speedUp === '=' ? '+' : keyConfig.speedUp;

    dispPlayPause.textContent = keyConfig.playPause === ' ' ? 'Space' : keyConfig.playPause;
    dispSpeedUp.textContent = speedUpLabel;
    dispSpeedDown.textContent = keyConfig.speedDown;
    dispFontUp.textContent = keyConfig.fontUp;
    dispFontDown.textContent = keyConfig.fontDown;
    dispNudgeFwd.textContent = keyConfig.nudgeForward;
    dispNudgeBack.textContent = keyConfig.nudgeBackward;
    dispExit.textContent = keyConfig.exit;

    // Keep the hints next to each stepper in sync with the configured keys
    hintSpeedUp.textContent = shortKeyLabel(keyConfig.speedUp);
    hintSpeedDown.textContent = shortKeyLabel(keyConfig.speedDown);
    hintFontUp.textContent = shortKeyLabel(keyConfig.fontUp);
    hintFontDown.textContent = shortKeyLabel(keyConfig.fontDown);
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
    showToast('Key configuration saved');
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
        showToast('Paste your script first');
        textInput.focus();
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
    updateScriptStats();

    textInput.addEventListener('input', () => {
        localStorage.setItem('teleprompterLastText', textInput.value);
        updateScriptStats();
    });
});
// PWA Service Worker Registration — web mode only.
//
// In the desktop build the assets already travel inside the binary, so the Service Worker adds
// nothing offline and actively causes harm: it serves cache-first, which means an old copy of the
// interface survives a binary update. If one was registered by an earlier build, tear it down.
//
// Wrapped in an IIFE on purpose. Classic scripts share one global scope, and `withGlobalTauri: true`
// already defines names of its own there — a top-level `const` that collides kills this whole file
// with a *parse* error, so not even the first line runs. See dbv-specs-ops/docs/NATIVE_DESKTOP_APPS.md §3.
(function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;

  const runningInTauri = typeof window !== 'undefined' && !!window.__TAURI__;

  if (!runningInTauri) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then(registration => {
          console.log('ServiceWorker registration successful with scope: ', registration.scope);
        })
        .catch(error => {
          console.log('ServiceWorker registration failed: ', error);
        });
    });
    return;
  }

  navigator.serviceWorker.getRegistrations()
    .then(registrations => registrations.forEach(registration => registration.unregister()))
    .catch(() => { /* nothing registered, nothing to clean up */ });

  if (window.caches && caches.keys) {
    caches.keys()
      .then(names => names.forEach(name => caches.delete(name)))
      .catch(() => { /* no cache storage available */ });
  }
})();