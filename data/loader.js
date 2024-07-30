(async function() {
    const scripts = [
        "emulator.js",
        "nipplejs.js",
        "shaders.js",
        "storage.js",
        "gamepad.js",
        "GameManager.js",
        "socket.io.min.js"
    ];

    // Utility function to determine the script path
    const folderPath = (path) => path.substring(0, path.length - path.split('/').pop().length);
    let scriptPath = (typeof window.EJS_pathtodata === "string") ? window.EJS_pathtodata : folderPath((new URL(document.currentScript.src)).pathname);
    if (!scriptPath.endsWith('/')) scriptPath += '/';

    // Function to load a script
    function loadScript(file) {
        return new Promise((resolve, reject) => {
            let script = document.createElement('script');
            script.src = function() {
                if (typeof EJS_paths !== 'undefined' && typeof EJS_paths[file] === 'string') {
                    return EJS_paths[file];
                } else if (file.endsWith("emulator.min.js")) {
                    return scriptPath + file;
                } else {
                    return scriptPath + "src/" + file;
                }
            }();
            script.onload = resolve;
            script.onerror = () => {
                filesmissing(file).then(() => resolve());
            };
            document.head.appendChild(script);
        });
    }

    // Function to load a stylesheet
    function loadStyle(file) {
        return new Promise((resolve, reject) => {
            let css = document.createElement('link');
            css.rel = 'stylesheet';
            css.href = function() {
                if (typeof EJS_paths !== 'undefined' && typeof EJS_paths[file] === 'string') {
                    return EJS_paths[file];
                } else {
                    return scriptPath + file;
                }
            }();
            css.onload = resolve;
            css.onerror = () => {
                filesmissing(file).then(() => resolve());
            };
            document.head.appendChild(css);
        });
    }

    // Handle missing files
    async function filesmissing(file) {
        console.error("Failed to load " + file);
        let minifiedFailed = file.includes(".min.") && !file.includes("socket");
        console[minifiedFailed ? "warn" : "error"]("Failed to load " + file + " because it's likely that the minified files are missing.\nTo fix this, you have 3 options:\n1. Download the zip from the latest release here: https://github.com/EmulatorJS/EmulatorJS/releases/latest - Stable\n2. Download the zip from here: https://cdn.emulatorjs.org/latest/data/emulator.min.zip and extract it to the data/ folder. (easiest option) - Beta\n3. Build the files by running `npm i && npm run build` in the data/minify folder. (hardest option) - Beta\nNote: You will probably need to do the same for the cores, extracting them to the data/cores/ folder.");
        if (minifiedFailed) {
            console.log("Attempting to load non-minified files");
            if (file === "emulator.min.js") {
                for (let i = 0; i < scripts.length; i++) {
                    await loadScript(scripts[i]);
                }
            } else {
                await loadStyle('emulator.css');
            }
        }
    }

    // Load scripts and styles based on debug mode
    if (typeof EJS_DEBUG_XX !== 'undefined' && EJS_DEBUG_XX === true) {
        for (let i = 0; i < scripts.length; i++) {
            await loadScript(scripts[i]);
        }
        await loadStyle('emulator.css');
    } else {
        await loadScript('emulator.min.js');
        await loadStyle('emulator.min.css');
    }

    // Set up the emulator configuration
    const config = {
        gameUrl: window.EJS_gameUrl || "",
        dataPath: scriptPath,
        system: window.EJS_core || "nes",
        biosUrl: window.EJS_biosUrl || "",
        gameName: window.EJS_gameName || "",
        color: window.EJS_color || "",
        adUrl: window.EJS_AdUrl || "",
        adMode: window.EJS_AdMode || "",
        adTimer: window.EJS_AdTimer || 0,
        adSize: window.EJS_AdSize || "",
        alignStartButton: window.EJS_alignStartButton || false,
        VirtualGamepadSettings: window.EJS_VirtualGamepadSettings || {},
        buttonOpts: window.EJS_Buttons || {},
        volume: window.EJS_volume || 1,
        defaultControllers: window.EJS_defaultControls || {},
        startOnLoad: window.EJS_startOnLoaded || true,
        fullscreenOnLoad: window.EJS_fullscreenOnLoaded || false,
        filePaths: window.EJS_paths || {},
        loadState: window.EJS_loadStateURL || "",
        cacheLimit: window.EJS_CacheLimit || 100,
        cheats: window.EJS_cheats || [],
        defaultOptions: window.EJS_defaultOptions || {},
        gamePatchUrl: window.EJS_gamePatchUrl || "",
        gameParentUrl: window.EJS_gameParentUrl || "",
        netplayUrl: window.EJS_netplayServer || "",
        gameId: window.EJS_gameID || "",
        backgroundImg: window.EJS_backgroundImage || "",
        backgroundBlur: window.EJS_backgroundBlur || 0,
        backgroundColor: window.EJS_backgroundColor || "#000000",
        controlScheme: window.EJS_controlScheme || "",
        threads: window.EJS_threads || 1,
        disableCue: window.EJS_disableCue || false,
        startBtnName: window.EJS_startButtonName || "",
        softLoad: window.EJS_softLoad || false,
        screenRecording: window.EJS_screenRecording || false,
        externalFiles: window.EJS_externalFiles || [],
        disableDatabases: window.EJS_disableDatabases || false,
        disableLocalStorage: window.EJS_disableLocalStorage || false,
        forceLegacyCores: window.EJS_forceLegacyCores || false,
        noAutoFocus: window.EJS_noAutoFocus || false,
        shaders: Object.assign({}, window.EJS_SHADERS, window.EJS_shaders || {})
    };

    // Load language if specified
    if (typeof window.EJS_language === "string" && window.EJS_language !== "en-US") {
        try {
            let path;
            if (typeof EJS_paths !== 'undefined' && typeof EJS_paths[window.EJS_language] === 'string') {
                path = EJS_paths[window.EJS_language];
            } else {
                path = scriptPath + "localization/" + window.EJS_language + ".json";
            }
            config.language = window.EJS_language;
            config.langJson = JSON.parse(await (await fetch(path)).text());
        } catch (e) {
            console.error("Failed to load language file:", e);
            config.langJson = {};
        }
    }

    // Initialize the emulator
    try {
        window.EJS_emulator = new EmulatorJS(EJS_player, config);
        console.log("Emulator initialized successfully.");

        // Set up event handlers if defined
        if (typeof window.EJS_ready === "function") {
            window.EJS_emulator.on("ready", window.EJS_ready);
        }
        if (typeof window.EJS_onGameStart === "function") {
            window.EJS_emulator.on("start", window.EJS_onGameStart);
        }
        if (typeof window.EJS_onLoadState === "function") {
            window.EJS_emulator.on("loadState", window.EJS_onLoadState);
        }
        if (typeof window.EJS_onSaveState === "function") {
            window.EJS_emulator.on("saveState", window.EJS_onSaveState);
        }
        if (typeof window.EJS_onLoadSave === "function") {
            window.EJS_emulator.on("loadSave", window.EJS_onLoadSave);
        }
        if (typeof window.EJS_onSaveSave === "function") {
            window.EJS_emulator.on("saveSave", window.EJS_onSaveSave);
        }
    } catch (e) {
        console.error("Failed to initialize emulator:", e);
    }
})();
