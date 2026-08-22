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
const keyConfigOverlay = document.getElementById('key-config-overlay');
const scriptStats = document.getElementById('script-stats');
const themeToggleButton = document.getElementById('theme-toggle');

// Toast
const toastElement = document.getElementById('toast');
let toastTimeoutId;

// Key display elements in the "While running" reference list
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
const wordsPerMinute = 150; // average speaking pace, used for the duration estimate

// Shows a short message at the bottom of the screen. Replaces alert(): native dialogs look foreign
// inside the app and behave inconsistently across Tauri's WebViews on each platform.
function showToast(message) {
    if (!toastElement) return;
    toastElement.textContent = message;
    toastElement.classList.add('is-visible');
    clearTimeout(toastTimeoutId);
    toastTimeoutId = setTimeout(() => toastElement.classList.remove('is-visible'), 2400);
}

// Word count + estimated spoken duration, at the current scroll speed. Useful when preparing a
// recording: knowing a script runs ~2:40 at this pace is working information, not decoration.
function updateScriptStats() {
    if (!scriptStats) return;

    const words = textInput.value.trim().split(/\s+/).filter(Boolean).length;
    const totalSeconds = Math.round((words / wordsPerMinute) * 60 / currentSpeed);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    scriptStats.textContent = `${words} word${words === 1 ? '' : 's'} · ${minutes}:${String(seconds).padStart(2, '0')}`;
}

// ─────────────────────────────────────────────
// Theme — persisted in localStorage, initial value already applied by the inline
// script in index.html's <head> (before first paint, to avoid a flash of the wrong theme).
// ─────────────────────────────────────────────
function currentTheme() {
    return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    try {
        localStorage.setItem('teleprompterTheme', theme);
    } catch (e) { /* localStorage unavailable — theme still applies for this session */ }

    if (themeToggleButton) {
        // The button always offers the *other* theme, so it reads "Light" while dark is active.
        themeToggleButton.textContent = theme === 'dark' ? 'Light' : 'Dark';
    }
}

function toggleTheme() {
    applyTheme(currentTheme() === 'dark' ? 'light' : 'dark');
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

// Slide-in panel, opened from the header or the transport bar. Same logic as the section it
// replaces (an open/closed toggle) — only the container changed, from style.display to a class
// that drives the CSS transform, so it can animate in and out.
function toggleKeyConfig() {
    const willOpen = !keyConfigContainer.classList.contains('is-open');
    keyConfigContainer.classList.toggle('is-open', willOpen);
    keyConfigOverlay.classList.toggle('is-open', willOpen);
    keyConfigContainer.setAttribute('aria-hidden', String(!willOpen));
}


// Control Functions
function updateSpeedDisplay() {
    speedDisplay.textContent = currentSpeed.toFixed(1) + '×';
    updateScriptStats(); // duration estimate depends on speed too
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

    setupContainer.style.display = 'none';
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
    setupContainer.style.display = 'flex';
}

// Event Listeners
startButton.addEventListener('click', startPrompter);
if (themeToggleButton) themeToggleButton.addEventListener('click', toggleTheme);

document.addEventListener('keydown', (event) => {
    if (document.activeElement && document.activeElement.closest('#key-config-container input[type="text"]')) {
        return; // Ignore if configuring keys — that input's own listener captures the next keypress
    }

    // While the key configuration panel is open, only Escape (to close it) is handled here.
    if (keyConfigContainer.classList.contains('is-open')) {
        if (event.key === 'Escape') {
            event.preventDefault();
            toggleKeyConfig();
        }
        return;
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
    } else if (setupContainer.style.display !== 'none') { // Setup screen is active
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
    applyTheme(currentTheme()); // sync the toggle button label with the theme set in <head>
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
