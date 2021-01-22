function survivalApp() {
    const DISPLAY_TITLE_SCREEN = 10;
    const STATE_RESET = 20;

    theCanvas = document.getElementById("survivalCanvas");
    context = theCanvas.getContext("2d");

    var titleStarted = true;
    var gameState = "DISPLAY_TITLE_SCREEN";

    var backgroundImage = new Image();
    var pilotImage = new Image();
    var greenXImage = new Image();
    var crashedPlane = new Image();

    var soundPool = new Array();
    var clickSound;
    var theCanvas;
    var context;
    var loadCount = 0;
    var itemsToLoad = 0;
    var gameState = DISPLAY_TITLE_SCREEN;
    var playerCounter = { x: 0, y: 0 };
    var centeringAdjustmentX = 5;
    var centeringAdjustmentY = 9;
    var actionPoints = 4;
    var lifePoints = 10;
    var waterAmount = 4;
    var foodAmount = 3;
    var exhaustion = 0;

    var terrainCostMatrix = [
        [1, 5, 1, 1, 1, 1, 3, 3, 1, 1, 1, 2, 1, 1],
        [1, 4, 1, 2, 2, 3, 3, 3, 4, 4, 2, 2, 2, 1],
        [1, 4, 2, 2, 3, 3, 3, 1, 4, 4, 1, 1, 1, 1],
        [1, 3, 4, 3, 3, 2, 2, 1, 1, 1, 1, 1, 1, 1],
        [3, 3, 3, 2, 2, 4, 1, 1, 1, 2, 2, 2, 2, 1],
        [2, 2, 2, 1, 1, 4, 1, 2, 2, 2, 2, 1, 1, 1],
        [2, 1, 1, 1, 1, 4, 2, 1, 2, 1, 1, 2, 1, 1],
        [1, 1, 1, 1, 1, 4, 3, 1, 1, 1, 2, 2, 2, 1],
        [2, 2, 2, 2, 1, 4, 5, 1, 1, 1, 1, 1, 1, 1]
    ];

    var waterLiklihoodMatrix = [
        [.2, 1, .2, .3, .2, .2, .4, .4, .1, .1, .1, .4, .3, .2],
        [.2, 1, .2, .3, .3, .4, .4, 1, 1, 1, .3, .3, .3, .1],
        [.2, 1, .3, .3, .3, .4, .4, .1, 1, 1, 1, 1, .1, .1],
        [.2, .4, 1, .4, .3, 1, .3, .2, 1, .1, .1, .1, .1, .2],
        [.4, .3, .4, .3, .2, 1, .3, .2, .1, 0, 0, 2, .2, .1],
        [.3, .3, .3, .2, 1, 1, 0, 0, 0, 0, 0, 1, .1, .2],
        [.3, .2, .2, 1, 1, 1, 0, 1, 0, .1, .1, .2, .2, .1],
        [.2, .2, .2, .2, .2, 1, 1, 1, 1, .1, .2, .2, .2, .1],
        [.2, .2, .2, .1, .1, 1, 1, 1, .1, .1, .2, .1, .2, .1]
    ];

    initializeImagesAndSounds();
    startGame();
    theCanvas.addEventListener("mouseup", eventMouseUp, false);
    startGame();

    function startGame() {
        // If the browser doesn't support canvas exit
        if (!canvasSupport()) {
            return;
        }

        // Display background
        context.drawImage(backgroundImage, 0, 0);

        const hexGrid = new HexGrid(context, 46, 0, 0);
        hexGrid.drawHexGrid(9, 14, 16, 0, true)

        // Place counter on random position on bottom of map
        placeCounterRandomly(hexGrid, context);

        // For test: remove
        context.drawImage(greenXImage, 0, 0);

        drawPictureImage(crashedPlane);
        drawRightColumn();

        // Next step: determine adjacent hexes within movement points and display a green X on them

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

    function drawPictureImage(currentImage) {
        context.drawImage(currentImage, 1018, 20);
    }

    function drawRightColumn() {
        context.font = "20px serif"
        context.fillStyle = "white";

        context.fillText("Action Points: " + actionPoints, 1020, 290);
        context.fillText("Days of Water: " + waterAmount, 1020, 320);
        context.fillText("Days of Food: " + foodAmount, 1020, 350);
        context.fillText("Life Points: " + lifePoints, 1020, 380);

        // Set back to original values
        context.font = "10px serif";
        context.fillStyle = "red";
    }

    function eventMouseUp(event) {
        alert("mouseUp");
    }

    // Place the counter on a random location on the bottom of the map
    function placeCounterRandomly(hexGrid, context) {
        var tempRandomNumber = Math.floor(Math.random() * 14);

        if (tempRandomNumber == 5 || tempRandomNumber == 6)
            playerCounter.x = 7;
        else
            playerCounter.x = tempRandomNumber;

        playerCounter.y = 8;

        var targetHex = hexGrid.getLocationOfHex(playerCounter.x, playerCounter.y, centeringAdjustmentX, centeringAdjustmentY);

        context.drawImage(pilotImage, targetHex.column, targetHex.row);
        //alert("column = " + playerCounter.x + " row = " + playerCounter.y);
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

        pilotImage.onload = itemLoaded;
        pilotImage.src = "https://centurionsreview.com/Survival/FighterPilotCounter.gif"

        greenXImage.onload = itemLoaded;
        greenXImage.src = "https://centurionsreview.com/Survival/greenX.gif"

        crashedPlane.onload = itemLoaded;
        crashedPlane.src = "https://centurionsreview.com/Survival/CrashedPlane.gif"

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

