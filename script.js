/*
 * DBV Teleprompter — PWA + app de escritorio para leer texto en scroll
 * Copyright (c) 2025-2026 David Bueno Vallejo · https://davidbuenov.com
 * Desarrollado por David Bueno Vallejo con la asistencia de IA.
 *
 * Este software se distribuye bajo la Licencia MIT.
 * Consulta el archivo LICENSE para más detalles:
 * https://github.com/davidbuenov/dbv-teleprompter/blob/main/LICENSE
 */

// Todo el fichero vive dentro de esta IIFE. Los scripts clasicos comparten un unico ambito
// global, y ahi Tauri inyecta nombres propios (`isTauri`, `__TAURI__`) con Object.defineProperty:
// una colision no da un error depurable, rompe el fichero entero en *parseo* y ni su primera
// linea llega a correr. Ver dbv-specs-ops/docs/ARCHITECTURE.md y NATIVE_DESKTOP_APPS.md §3.
(function () {

// ─────────────────────────────────────────────
// Translations (i18n) — English & Spanish
// ─────────────────────────────────────────────
const translations = {
    en: {
        header: {
            subtitle: 'Untitled script',
            titleAria: 'Script title',
            keys: 'Keys',
            keysTitle: 'Key configuration (Escape to close)',
            themeLight: 'Light',
            themeDark: 'Dark',
            langToggle: 'ES',
            langAria: 'Switch to Spanish'
        },
        script: {
            label: 'Script',
            placeholder: 'Paste your script here…',
            statsWord: 'word',
            statsWords: 'words'
        },
        file: {
            open: 'Open',
            openAria: 'Open script file',
            openTitle: 'Open script (Ctrl+O / ⌘O)',
            save: 'Save',
            saveAria: 'Save script to file',
            saveTitle: 'Save script (Ctrl+S / ⌘S)',
            loadedToast: 'Script loaded',
            savedToast: 'Script saved',
            emptyToast: 'Nothing to save'
        },
        controls: {
            speed: 'Scroll speed',
            speed_decrease: 'Decrease scroll speed',
            speed_increase: 'Increase scroll speed',
            fontsize: 'Font size',
            fontsize_decrease: 'Decrease font size',
            fontsize_increase: 'Increase font size'
        },
        shortcuts: {
            title: 'While running',
            playpause: 'Play / pause',
            speed: 'Speed',
            fontsize: 'Font size',
            nudge: 'Nudge',
            exit: 'Exit'
        },
        transport: {
            ready: 'Ready',
            configure_keys: 'Configure keys',
            start: 'Start prompter',
            startTitle: 'Start prompter (Ctrl+Enter / ⌘Enter)'
        },
        keyconfig: {
            title: 'Key configuration',
            close: 'Close',
            instructions: 'Click a field and press the key you want to assign.',
            playpause: 'Play / Pause',
            speedup: 'Speed up',
            speeddown: 'Speed down',
            fontup: 'Font up',
            fontdown: 'Font down',
            nudgeforward: 'Nudge forward',
            nudgebackward: 'Nudge back',
            exit: 'Exit prompter',
            save: 'Save config',
            reset: 'Reset defaults',
            credits: 'Built by <a href="https://davidbuenov.com" target="_blank" rel="noopener noreferrer">David Bueno Vallejo</a> · <a href="https://github.com/davidbuenov/dbv-teleprompter" target="_blank" rel="noopener noreferrer">GitHub</a> · <a href="privacy.html">Privacy</a>',
            pressKey: 'Press a key...',
            savedToast: 'Key configuration saved',
            pasteFirstToast: 'Paste your script first'
        },
        keys: {
            space: 'Space'
        }
    },
    es: {
        header: {
            subtitle: 'Guion sin título',
            titleAria: 'Título del guion',
            keys: 'Teclas',
            keysTitle: 'Configuración de teclas (Escape para cerrar)',
            themeLight: 'Claro',
            themeDark: 'Oscuro',
            langToggle: 'EN',
            langAria: 'Cambiar a inglés'
        },
        script: {
            label: 'Guion',
            placeholder: 'Pega tu guion aquí…',
            statsWord: 'palabra',
            statsWords: 'palabras'
        },
        file: {
            open: 'Abrir',
            openAria: 'Abrir archivo de guion',
            openTitle: 'Abrir guion (Ctrl+O / ⌘O)',
            save: 'Guardar',
            saveAria: 'Guardar guion en archivo',
            saveTitle: 'Guardar guion (Ctrl+S / ⌘S)',
            loadedToast: 'Guion cargado',
            savedToast: 'Guion guardado',
            emptyToast: 'Nada que guardar'
        },
        controls: {
            speed: 'Velocidad',
            speed_decrease: 'Disminuir velocidad',
            speed_increase: 'Aumentar velocidad',
            fontsize: 'Tamaño de fuente',
            fontsize_decrease: 'Disminuir tamaño de fuente',
            fontsize_increase: 'Aumentar tamaño de fuente'
        },
        shortcuts: {
            title: 'Durante la lectura',
            playpause: 'Reproducir / pausar',
            speed: 'Velocidad',
            fontsize: 'Tamaño de fuente',
            nudge: 'Ajuste fino',
            exit: 'Salir'
        },
        transport: {
            ready: 'Listo',
            configure_keys: 'Configurar teclas',
            start: 'Iniciar teleprompter',
            startTitle: 'Iniciar teleprompter (Ctrl+Enter / ⌘Enter)'
        },
        keyconfig: {
            title: 'Configuración de teclas',
            close: 'Cerrar',
            instructions: 'Haz clic en un campo y presiona la tecla que desees asignar.',
            playpause: 'Reproducir / Pausar',
            speedup: 'Aumentar velocidad',
            speeddown: 'Disminuir velocidad',
            fontup: 'Aumentar tamaño',
            fontdown: 'Disminuir tamaño',
            nudgeforward: 'Avanzar un poco',
            nudgebackward: 'Retroceder un poco',
            exit: 'Salir del teleprompter',
            save: 'Guardar configuración',
            reset: 'Restablecer por defecto',
            credits: 'Creado por <a href="https://davidbuenov.com" target="_blank" rel="noopener noreferrer">David Bueno Vallejo</a> · <a href="https://github.com/davidbuenov/dbv-teleprompter" target="_blank" rel="noopener noreferrer">GitHub</a> · <a href="privacidad.html">Privacidad</a>',
            pressKey: 'Presiona una tecla...',
            savedToast: 'Configuración de teclas guardada',
            pasteFirstToast: 'Pega tu guion primero'
        },
        keys: {
            space: 'Espacio'
        }
    }
};

let currentLang = 'en';

function t(path) {
    const getVal = (obj) => path.split('.').reduce((o, k) => o?.[k], obj);
    return getVal(translations[currentLang]) ?? getVal(translations.en) ?? path;
}

// No renombrar a `isTauri`: colisiona con un global que Tauri inyecta y mata este fichero entero.
// El porque y la comprobacion que lo impide viven en `scripts/sync-frontend.mjs`.
const runningInTauri = () => typeof window.__TAURI__?.core?.invoke === 'function';

// DOM Elements
const textInput = document.getElementById('text-input');
const scriptTitleInput = document.getElementById('script-title-input');
const scriptPanel = document.getElementById('script-panel');
const btnOpenFile = document.getElementById('btn-open-file');
const btnSaveFile = document.getElementById('btn-save-file');
const fileInput = document.getElementById('file-input');
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
const langBtnEs = document.getElementById('lang-es');
const langBtnEn = document.getElementById('lang-en');

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

    const wordLabel = words === 1 ? t('script.statsWord') : t('script.statsWords');
    scriptStats.textContent = `${words} ${wordLabel} · ${minutes}:${String(seconds).padStart(2, '0')}`;
}

// ─────────────────────────────────────────────
// Language & Localization Application
// ─────────────────────────────────────────────
function applyLanguage(lang) {
    currentLang = (lang === 'es' || lang === 'en') ? lang : 'en';
    document.documentElement.setAttribute('lang', currentLang);
    try {
        localStorage.setItem('teleprompterLang', currentLang);
    } catch (e) { /* localStorage unavailable */ }

    // Update segmented buttons state (active class and aria-pressed)
    if (langBtnEs && langBtnEn) {
        langBtnEs.classList.toggle('active', currentLang === 'es');
        langBtnEn.classList.toggle('active', currentLang === 'en');
        langBtnEs.setAttribute('aria-pressed', String(currentLang === 'es'));
        langBtnEn.setAttribute('aria-pressed', String(currentLang === 'en'));
    }

    // Translate static DOM elements with data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        el.textContent = t(key);
    });

    // Translate placeholder attributes
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        el.setAttribute('placeholder', t(key));
    });

    // Translate aria-label attributes
    document.querySelectorAll('[data-i18n-aria]').forEach(el => {
        const key = el.getAttribute('data-i18n-aria');
        el.setAttribute('aria-label', t(key));
    });

    // Translate HTML contents (e.g. credits with links)
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
        const key = el.getAttribute('data-i18n-html');
        el.innerHTML = t(key);
    });

    // Translate title attributes (tooltips)
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
        const key = el.getAttribute('data-i18n-title');
        el.setAttribute('title', t(key));
    });

    // Refresh theme toggle button label (since words are localized)
    applyTheme(currentTheme(), false);

    // Refresh dynamic stats
    updateScriptStats();

    // Refresh key footer display (e.g. Space vs Espacio)
    updateKeyDisplayFooter();
}

// ─────────────────────────────────────────────
// Script Title & File Management (Dual Mode)
// ─────────────────────────────────────────────
function loadScriptTitle() {
    if (!scriptTitleInput) return;
    const savedTitle = localStorage.getItem('teleprompterScriptTitle');
    if (savedTitle) {
        scriptTitleInput.value = savedTitle;
    }
}

function saveScriptTitle() {
    if (!scriptTitleInput) return;
    localStorage.setItem('teleprompterScriptTitle', scriptTitleInput.value.trim());
}

function loadFileContent(file) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        const content = event.target.result;
        textInput.value = content;
        localStorage.setItem('teleprompterLastText', content);

        // Derive script title from filename without extension
        const baseName = file.name.replace(/\.[^/.]+$/, "");
        if (baseName && scriptTitleInput) {
            scriptTitleInput.value = baseName;
            saveScriptTitle();
        }

        updateScriptStats();
        showToast(`${t('file.loadedToast')}: ${baseName || file.name}`);
    };
    reader.onerror = () => {
        showToast('Error reading file');
    };
    reader.readAsText(file);
}

function handleFileSelect(event) {
    const files = event.target.files;
    if (files && files.length > 0) {
        loadFileContent(files[0]);
    }
    // Reset file input so selecting the same file again triggers change
    event.target.value = '';
}

async function openFileDialog() {
    // 1. If running in Tauri, use the native OS file picker via Rust command
    if (runningInTauri()) {
        try {
            const result = await window.__TAURI__.core.invoke('open_file_dialog');
            if (result) {
                const [title, content] = result;
                textInput.value = content;
                localStorage.setItem('teleprompterLastText', content);
                if (title && scriptTitleInput) {
                    scriptTitleInput.value = title;
                    saveScriptTitle();
                }
                updateScriptStats();
                showToast(`${t('file.loadedToast')}: ${title}`);
            }
            return;
        } catch (err) {
            console.error('Tauri open dialog error, falling back to web file input:', err);
        }
    }

    // 2. Web fallback: click hidden <input type="file">
    if (fileInput) {
        fileInput.click();
    }
}

async function saveScriptFile() {
    const text = textInput.value;
    if (!text.trim()) {
        showToast(t('file.emptyToast'));
        textInput.focus();
        return;
    }

    const rawTitle = scriptTitleInput?.value.trim();
    const safeTitle = (rawTitle || t('header.subtitle') || 'script').replace(/[<>:"/\\|?*]+/g, '_');
    const filename = `${safeTitle}.txt`;

    // 1. If running in Tauri, open the native OS "Save As" file dialog via Rust command
    if (runningInTauri()) {
        try {
            const saved = await window.__TAURI__.core.invoke('save_file_dialog', {
                defaultName: filename,
                content: text
            });
            if (saved) {
                showToast(`${t('file.savedToast')} (${filename})`);
            }
            return;
        } catch (err) {
            console.error('Tauri save dialog error, falling back to web methods:', err);
        }
    }

    // 2. Modern Web Browser: File System Access API (Native "Guardar como..." dialog)
    if (typeof window.showSaveFilePicker === 'function') {
        try {
            const handle = await window.showSaveFilePicker({
                suggestedName: filename,
                types: [{
                    description: 'Text Files (*.txt, *.md)',
                    accept: { 'text/plain': ['.txt', '.md'] }
                }]
            });
            const writable = await handle.createWritable();
            await writable.write(text);
            await writable.close();
            showToast(`${t('file.savedToast')} (${handle.name || filename})`);
            return;
        } catch (err) {
            if (err.name === 'AbortError') return; // User cancelled the dialog
            console.warn('showSaveFilePicker failed, falling back to blob download:', err);
        }
    }

    // 3. Fallback: Blob download
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const downloadLink = document.createElement('a');
    downloadLink.href = url;
    downloadLink.download = filename;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    setTimeout(() => URL.revokeObjectURL(url), 1000);

    showToast(`${t('file.savedToast')} (${filename})`);
}

function setupDragAndDrop() {
    if (!scriptPanel) return;

    const preventDefaults = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        window.addEventListener(eventName, preventDefaults, false);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
        scriptPanel.addEventListener(eventName, () => {
            scriptPanel.classList.add('is-dragover');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        scriptPanel.addEventListener(eventName, () => {
            scriptPanel.classList.remove('is-dragover');
        }, false);
    });

    scriptPanel.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files && files.length > 0) {
            loadFileContent(files[0]);
        }
    }, false);
}

// ─────────────────────────────────────────────
// Theme — persisted in localStorage, initial value already applied by the inline
// script in index.html's <head> (before first paint, to avoid a flash of the wrong theme).
// ─────────────────────────────────────────────
function currentTheme() {
    return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
}

function applyTheme(theme, persist = true) {
    document.documentElement.setAttribute('data-theme', theme);
    if (persist) {
        try {
            localStorage.setItem('teleprompterTheme', theme);
        } catch (e) { /* localStorage unavailable — theme still applies for this session */ }
    }

    if (themeToggleButton) {
        // The button always offers the *other* theme
        themeToggleButton.textContent = theme === 'dark' ? t('header.themeLight') : t('header.themeDark');
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

function formatKeyName(keyVal) {
    if (keyVal === ' ') return t('keys.space');
    return keyVal;
}

function updateKeyDisplayFooter() {
    dispPlayPause.textContent = formatKeyName(keyConfig.playPause || ' ');
    dispSpeedUp.textContent = keyConfig.speedUp === '=' ? '+' : (keyConfig.speedUp || '+');
    dispSpeedDown.textContent = keyConfig.speedDown || '-';
    dispFontUp.textContent = keyConfig.fontUp || 'PageUp';
    dispFontDown.textContent = keyConfig.fontDown || 'PageDown';
    dispNudgeFwd.textContent = keyConfig.nudgeForward || 'ArrowDown';
    dispNudgeBack.textContent = keyConfig.nudgeBackward || 'ArrowUp';
    dispExit.textContent = keyConfig.exit || 'Escape';
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
    document.getElementById('key-playpause').value = formatKeyName(keyConfig.playPause);
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
    // Read from input fields, handling localized "Space" / "Espacio"
    const playPauseInput = document.getElementById('key-playpause').value;
    keyConfig.playPause = (playPauseInput === 'Space' || playPauseInput === 'Espacio' || playPauseInput === t('keys.space')) ? ' ' : playPauseInput;
    keyConfig.speedUp = document.getElementById('key-speedup').value;
    keyConfig.speedDown = document.getElementById('key-speeddown').value;
    keyConfig.fontUp = document.getElementById('key-fontup').value;
    keyConfig.fontDown = document.getElementById('key-fontdown').value;
    keyConfig.nudgeForward = document.getElementById('key-nudgeforward').value;
    keyConfig.nudgeBackward = document.getElementById('key-nudgebackward').value;
    keyConfig.exit = document.getElementById('key-exit').value;
    localStorage.setItem('teleprompterKeyConfig', JSON.stringify(keyConfig));
    showToast(t('keyconfig.savedToast'));
    updateKeyDisplayFooter();
}

function setupKeyConfigListeners() {
    const inputs = document.querySelectorAll('#key-config-container input[type="text"]');
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.dataset.originalValue = input.value; // Store original value
            input.value = t('keyconfig.pressKey');
            input.select(); // Select text for easy overwrite
        });
        input.addEventListener('keydown', (event) => {
            event.preventDefault();
            input.value = event.key === ' ' ? t('keys.space') : event.key;
            input.blur(); // Remove focus after setting
        });
        input.addEventListener('blur', () => { // If blurred without keypress, restore
            if (input.value === t('keyconfig.pressKey') || input.value === 'Press a key...' || input.value === 'Presiona una tecla...') {
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
    // Guarda deliberada: si algun dia alguien cablea este handler por referencia
    // (addEventListener('click', changeSpeed)), `amount` seria el objeto Event y currentSpeed
    // pasaria a NaN sin que nada avisara. Falla ruidoso en vez de silencioso.
    if (!Number.isFinite(amount)) {
        console.error('changeSpeed esperaba un numero y recibio:', amount);
        return;
    }
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
    if (!Number.isFinite(amount)) {
        console.error('changeFontSize esperaba un numero y recibio:', amount);
        return;
    }
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
    }
    animationFrameId = requestAnimationFrame(scrollLoop);
}

function startPrompter() {
    const text = textInput.value;
    if (!text.trim()) {
        showToast(t('keyconfig.pasteFirstToast'));
        textInput.focus();
        return;
    }
    // `textContent`, no `innerHTML`: el guion sale de un fichero que abre el usuario, y con
    // `csp: null` + `withGlobalTauri` un `<img onerror>` incrustado tendria acceso a `invoke`.
    // Los saltos de linea no necesitan <br>: #teleprompter-text ya es `white-space: pre-wrap`.
    teleprompterText.textContent = text;
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
if (langBtnEs) langBtnEs.addEventListener('click', () => applyLanguage('es'));
if (langBtnEn) langBtnEn.addEventListener('click', () => applyLanguage('en'));
if (btnOpenFile) btnOpenFile.addEventListener('click', openFileDialog);
if (btnSaveFile) btnSaveFile.addEventListener('click', saveScriptFile);
if (fileInput) fileInput.addEventListener('change', handleFileSelect);

document.addEventListener('keydown', (event) => {
    const isCmdOrCtrl = event.metaKey || event.ctrlKey;

    // 1. Universal Desktop Shortcuts (Ctrl/Cmd + S to Save, Ctrl/Cmd + O to Open, Ctrl/Cmd + Enter to Start)
    if (isCmdOrCtrl && !event.altKey && !event.shiftKey) {
        const keyLower = event.key.toLowerCase();
        if (keyLower === 's') {
            event.preventDefault();
            saveScriptFile();
            return;
        }
        if (keyLower === 'o') {
            event.preventDefault();
            openFileDialog();
            return;
        }
        if (event.key === 'Enter') {
            event.preventDefault();
            if (teleprompterView.style.display !== 'block') {
                startPrompter();
            }
            return;
        }
    }

    if (document.activeElement && (document.activeElement.closest('#key-config-container input[type="text"]'))) {
        return; // Ignore if actively configuring keys in the key config overlay
    }

    // While the key configuration panel is open, only Escape (to close it) is handled here.
    if (keyConfigContainer && keyConfigContainer.classList.contains('is-open')) {
        if (event.key === 'Escape') {
            event.preventDefault();
            toggleKeyConfig();
        }
        return;
    }

    // If typing in title input and Escape is pressed, blur input
    if (document.activeElement === scriptTitleInput) {
        if (event.key === 'Escape') {
            scriptTitleInput.blur();
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
        else if (event.key === keyConfig.exit || event.key === 'Escape') { event.preventDefault(); exitPrompter(); }
    } else if (setupContainer.style.display !== 'none') { // Setup screen is active
        // Allow +/- for speed/font on setup screen IF NOT typing in textarea
        if (document.activeElement && document.activeElement.tagName.toLowerCase() !== 'textarea') {
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
    const initialLang = document.documentElement.getAttribute('lang') || 'en';
    applyLanguage(initialLang);
    applyTheme(currentTheme()); // sync the toggle button label with the theme set in <head>
    loadKeyConfig();
    setupKeyConfigListeners();
    setupDragAndDrop();
    updateSpeedDisplay();
    updateFontSizeDisplay();
    loadScriptTitle();

    const savedText = localStorage.getItem('teleprompterLastText');
    if (savedText) {
        textInput.value = savedText;
    }
    updateScriptStats();

    textInput.addEventListener('input', () => {
        localStorage.setItem('teleprompterLastText', textInput.value);
        updateScriptStats();
    });

    if (scriptTitleInput) {
        scriptTitleInput.addEventListener('input', saveScriptTitle);
    }

    wireControls();
});

// Sustituye a los atributos `onclick=` que vivian en index.html. Dejaron de ser viables al
// encerrar este fichero en su IIFE: un atributo inline no puede resolver una funcion que ya no
// es global. Ver dbv-specs-ops/docs/ARCHITECTURE.md, seccion Estilo de Codigo.
//
// REGLA: siempre arrow explicita, nunca referencia directa — ni siquiera en los handlers sin
// argumento. `addEventListener('click', changeSpeed)` entregaria el Event como `amount`. Y con
// `loadKeyConfig` colaria por accidente, porque el Event es truthy; un patron incorrecto que
// aparenta funcionar es como se propaga. Por eso la regla es uniforme y sin excepciones.
//
// Los importes numericos son literales aqui, no `data-*` del DOM: un atributo mal escrito o
// ausente daria NaN en silencio, que es justo el fallo que estamos cerrando.
function wireControls() {
    const on = (el, handler) => { if (el) el.addEventListener('click', handler); };

    document.querySelectorAll('[data-action="toggle-keys"]')
        .forEach(el => el.addEventListener('click', () => toggleKeyConfig()));

    on(document.getElementById('btn-speed-down'), () => changeSpeed(-0.1));
    on(document.getElementById('btn-speed-up'), () => changeSpeed(0.1));
    on(document.getElementById('btn-font-down'), () => changeFontSize(-2));
    on(document.getElementById('btn-font-up'), () => changeFontSize(2));
    on(document.getElementById('btn-save-keys'), () => saveKeyConfig());
    on(document.getElementById('btn-reset-keys'), () => loadKeyConfig(true));
}

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

  if (!runningInTauri()) {
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
})();
