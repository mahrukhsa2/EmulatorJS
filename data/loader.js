(function() {
    // Function to initialize the emulator
    function initializeEmulator() {
        if (!window.EJS_player) {
            console.error("EmulatorJS player is not defined.");
            return;
        }

        const core = window.EJS_core || "nes"; // Default to NES if core is not specified
        const gameUrl = window.EJS_gameUrl || "";
        const biosUrl = window.EJS_biosUrl || "";
        const pathToData = window.EJS_pathtodata || "data/";

        if (!gameUrl) {
            console.error("Game URL is not specified.");
            return;
        }

        // Create a new emulator instance and configure it
        const emulator = new Emulator({
            core: core,
            gameUrl: gameUrl,
            biosUrl: biosUrl,
            pathToData: pathToData,
            startOnLoaded: true
        });

        // Initialize and start the emulator
        emulator.initialize().then(() => {
            console.log("Emulator initialized successfully.");
            return emulator.loadGame(gameUrl);
        }).then(() => {
            console.log("Game loaded successfully.");
            emulator.startGame();
        }).catch(error => {
            console.error("Error initializing or starting the emulator:", error);
        });
    }

    // Check if the document is ready and then initialize the emulator
    function onDocumentReady() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initializeEmulator);
        } else {
            initializeEmulator();
        }
    }

    // Initialize the emulator when the document is ready
    onDocumentReady();
})(); 
