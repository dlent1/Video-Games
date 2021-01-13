function survivalApp() {
    const DISPLAY_TITLE_SCREEN = 10;
    const STATE_RESET = 20;

    var titleStarted = true;
    var gameState = "DISPLAY_TITLE_SCREEN";

    var backgroundImage = new Image();
    var soundPool = new Array();
    var clickSound;
    var theCanvas;
    var context;
    var loadCount = 0;
    var itemsToLoad = 0;
    var gameState = DISPLAY_TITLE_SCREEN;

    initializeImagesAndSounds();
    startGame();

    function startGame() {
        theCanvas = document.getElementById("survivalCanvas");
        context = theCanvas.getContext("2d");

        // If the browser doesn't support canvas exit
        if (!canvasSupport()) {
            return;
        }

        if (titleStarted) { // Async bullshit: complete added to make sure this doesn't run until the images and sounds fully load
            // Display background
            context.drawImage(backgroundImage, 0, 0);

            const hexGrid = new HexGrid(context, 46, 0, 0);
            hexGrid.drawHexGrid(9, 14, 16, 0, true)

            // Display title screen and instructions
        }

        //else {
            //wait for space key click
         //   if (keyPressList[32] == true) {
                //ConsoleLog.log("space pressed");
                // switchGameState(GAME_STATE_NEW_GAME);
                //titleStarted = false;
                // call setinterval to begin the main game loop

        //    }
            //else
            //startGame(); // Recursively call this function until the space is pressed
        //}
    }

    // Once the game loads disable the start button
    //function eventWindowLoaded() {
    //    jQuery("#survivalStartButton").attr("disabled", "disabled");
    //    canvasApp();

    //}

    // The return method makes sure the calling function waits for this to complete before going on to the next step
    // Note: the background image is preloaded on Survival.html to eliminate wait time and async problems
    function initializeImagesAndSounds() {
        itemsToLoad = 10;
        backgroundImage.onload = itemLoaded;
        backgroundImage.src = "https://centurionsreview.com/Survival/SurvivalMap.gif";

        return true; // Don't remove
    }

    function itemLoaded(event) {

        loadCount++;
        if (loadCount >= itemsToLoad) {
            //ufoSound.removeEventListener("canplaythrough", itemLoaded, false);
            //shootSound.removeEventListener("canplaythrough", itemLoaded, false);
            //shootSound2.removeEventListener("canplaythrough", itemLoaded, false);
            //shootSound3.removeEventListener("canplaythrough", itemLoaded, false);
            //explodeSound.removeEventListener("canplaythrough", itemLoaded, false);
            //explodeSound2.removeEventListener("canplaythrough", itemLoaded, false);
            //explodeSound3.removeEventListener("canplaythrough", itemLoaded, false);
            //soundPool.push({ name: "explode1", element: explodeSound, played: false });
            //soundPool.push({ name: "explode1", element: explodeSound2, played: false });
            //soundPool.push({ name: "explode1", element: explodeSound3, played: false });
            //soundPool.push({ name: "shoot1", element: shootSound, played: false });
            //soundPool.push({ name: "shoot1", element: shootSound2, played: false });
            //soundPool.push({ name: "shoot1", element: shootSound3, played: false });
            //soundPool.push({ name: "UFOSound", element: ufoSound, played: false });

            gameState = STATE_RESET;

        }

    }
}

