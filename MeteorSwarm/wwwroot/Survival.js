function survivalApp() {
    const DISPLAY_TITLE_SCREEN = 10;
    const STATE_RESET = 20;
    const MAX_SOUNDS = 5;
    const PATH = "https://centurionsreview.com/Survival/";

    var HexGridObject = {};
    var numRows = 9;
    var numColumns = 14;
    var radius = 46;

    theCanvas = document.getElementById("survivalCanvas");
    context = theCanvas.getContext("2d");

    var titleStarted = true;
    var gameState = "DISPLAY_TITLE_SCREEN";

    var backgroundImage = new Image();
    var pilotImage = new Image();
    var greenXImage = new Image();
    var crashedPlane = new Image();
    var clickSound;

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
    var textCenteringAdjustmentX= .6 * radius;
    var textCenteringAdjustmentY = .56 * radius;
    var actionPoints = 4;
    var lifePoints = 10;
    var waterAmount = 4;
    var foodAmount = 3;
    var exhaustion = 0;
    var moveButton = { x: 1020, y: 440, width: 50, height: 30 };
    var moveButtonText = { x: 1022, y: 458 };
    var endTurnButton = { x: 1085, y: 440, width: 80, height: 30 };
    var endTurnButtonText = { x: 1087, y: 458 };
    var mouseLocation = { x: null, y: null };
    var origin = { x: 16, y: 0 };
    var movementInProgress = false;
    var adjacencyList = new Array();

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
    theCanvas.addEventListener("mousedown", eventMouseDown, false);
    startGame();

    function startGame() {
        // If the browser doesn't support canvas exit
        if (!canvasSupport()) {
            return;
        }

        // Display background and grid
        drawBackgroundAndGrid();

        // Place counter on random position on bottom of map
        placeCounterRandomly(HexGridObject, context);

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

    function drawBackgroundAndGrid() {
        // Display background
        context.drawImage(backgroundImage, 0, 0);

        HexGridObject = new HexGrid(context, radius, 0, 0, theCanvas);
        HexGridObject.drawHexGrid(numRows, numColumns, origin.x, origin.y, true);
    }

    function drawPictureImage(currentImage) {
        context.drawImage(currentImage, 1018, 20);
    }

    function drawRightColumn() {
        context.font = "20px serif"
        context.fillStyle = "white";
        context.textBaseline = "middle";

        context.fillText("Action Points: " + actionPoints, 1020, 290);
        context.fillText("Days of Water: " + waterAmount, 1020, 320);
        context.fillText("Days of Food: " + foodAmount, 1020, 350);
        context.fillText("Life Points: " + lifePoints, 1020, 380);
        context.fillText("Exhaustion: " + exhaustion, 1020, 410);

        // Draw buttons
        // Move button
        context.fillStyle = "bisque";
        context.strokeStyle = "chocolate";
        context.lineWidth = 1;
        context.fillRect(moveButton.x, moveButton.y, moveButton.width, moveButton.height);
        context.strokeRect(moveButton.x, moveButton.y, moveButton.width, moveButton.height);
        context.fillStyle = "red";
        context.fillText("Move", moveButtonText.x, moveButtonText.y);

        // End turn button
        context.fillStyle = "bisque";
        context.fillRect(endTurnButton.x, endTurnButton.y, endTurnButton.width, endTurnButton.height);
        context.strokeRect(endTurnButton.x, endTurnButton.y, endTurnButton.width, endTurnButton.height);
        context.fillStyle = "red";
        context.fillText("End Turn", endTurnButtonText.x, endTurnButtonText.y);

        // Set back to original values
        context.font = "10px serif";
        context.fillStyle = "red";
    }

    function refreshScreen(pictureImage, targetHexX, targetHexY) {
        drawBackgroundAndGrid();
        drawPictureImage(crashedPlane);
        drawRightColumn();
        context.drawImage(pilotImage, targetHexX, targetHexY);
    }

    function eventMouseDown(event) {
        var targetHex = {};

        if (event.layerX || event.layerX == 0) { // Firefox
            mouseLocation.x = event.layerX;
            mouseLocation.y = event.layerY;
        } else if (event.offsetX || event.offsetX == 0) { // Opera
            mouseLocation.x = event.offsetX;
            mouseLocation.y = event.offsetY;
        }

        // Check if hex was clicked
        if (movementInProgress) {
            tile = HexGridObject.getSelectedTile(mouseLocation.x, mouseLocation.y, origin.x, origin.y);
            var adjacent = false;

            adjacencyList.forEach(function (hex) {
                if (hex.x == tile.column && hex.y == tile.row)
                    adjacent = true;
            });

            // Move to hex if it is adjacent and you have enough action points to do so.
            if (adjacent) {
                var targetHexPixelCoordinates = HexGridObject.getLocationOfHex(tile.column, tile.row, centeringAdjustmentX, centeringAdjustmentY);
                playerCounter = { x: tile.column, y: tile.row };
                var cost = terrainCostMatrix[tile.row][tile.column];
                actionPoints -= cost; // Pay cost of entering hex

                if (actionPoints >= 0) {
                    refreshScreen(crashedPlane, targetHexPixelCoordinates.columnPixel, targetHexPixelCoordinates.rowPixel);
                    movementInProgress = false;
                }
            }
            
            // Uncomment the following 4 lines to debug
            //context.strokeStyle = "red";
            //context.linewidth = 1;
            //context.strokeRect(mouseLocation.x, mouseLocation.y, 5, 5);
            //alert(tile.column + " " + tile.row + " " + mouseLocation.x + " " + mouseLocation.y);
        }

        // Check if the move button is clicked
        if (mouseLocation.x >= moveButton.x && mouseLocation.y >= moveButton.y) {
            if (mouseLocation.x <= (moveButton.x + moveButton.width) && mouseLocation.y <= (moveButton.y + moveButton.height)) {
                if (actionPoints <= 0) {
                    alert("You are out of action points.  Click \"End Turn\"");
                    return;
                }

                adjacencyList = HexGridObject.getAdjacentHexList(playerCounter.x, playerCounter.y, numRows, numColumns);

                adjacencyList.forEach(function (hex) {
                    if ((terrainCostMatrix[hex.y][hex.x] <= actionPoints) && (terrainCostMatrix[hex.y][hex.x] != 5)) {
                        var targetHex = HexGridObject.getLocationOfHex(hex.x, hex.y, centeringAdjustmentX, centeringAdjustmentY);
                        context.drawImage(greenXImage, targetHex.columnPixel, targetHex.rowPixel);
                        context.font = "18px serif";
                        context.fillStyle = "#000";
                        context.textBaseline = "top";
                        context.fillText(terrainCostMatrix[hex.y][hex.x], targetHex.columnPixel + textCenteringAdjustmentX, targetHex.rowPixel + textCenteringAdjustmentY);
                    }
                });
                movementInProgress = true;
            }
        }

        // Check if the end turn button is clicked
        if (mouseLocation.x >= endTurnButton.x && mouseLocation.y >= endTurnButton.y) {
            if (mouseLocation.x <= (endTurnButton.x + endTurnButton.width) && mouseLocation.y <= (endTurnButton.y + endTurnButton.height)) {
                var targetHexPixelCoordinates = HexGridObject.getLocationOfHex(playerCounter.x, playerCounter.y, centeringAdjustmentX, centeringAdjustmentY);
                movementInProgress = false;
                actionPoints = 4;
                exhaustion++;

                refreshScreen(crashedPlane, targetHexPixelCoordinates.columnPixel, targetHexPixelCoordinates.rowPixel);
            }
        }

        playSound("MouseClick", .5, soundPool, MAX_SOUNDS, PATH);
    }

    // Place the counter on a random location on the bottom of the map
    function placeCounterRandomly(HexGridObject, context) {
        var tempRandomNumber = Math.floor(Math.random() * 14);

        if (tempRandomNumber == 5 || tempRandomNumber == 6)
            playerCounter.x = 7;
        else
            playerCounter.x = tempRandomNumber;

        playerCounter.y = 8;

        var targetHex = HexGridObject.getLocationOfHex(playerCounter.x, playerCounter.y, centeringAdjustmentX, centeringAdjustmentY);

        context.drawImage(pilotImage, targetHex.columnPixel, targetHex.rowPixel);
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
        pilotImage.src = "https://centurionsreview.com/Survival/FighterPilotCounter.gif";

        greenXImage.onload = itemLoaded;
        greenXImage.src = "https://centurionsreview.com/Survival/greenX.gif";

        crashedPlane.onload = itemLoaded;
        crashedPlane.src = "https://centurionsreview.com/Survival/CrashedPlane.gif";

        clickSound = document.createElement("audio");
        document.body.appendChild(clickSound);
        audioType = supportedAudioFormat(clickSound);
        clickSound.setAttribute("src", "https://centurionsreview.com/Survival/MouseClick." + audioType);
        clickSound.addEventListener("canplaythrough", itemLoaded, false);

        return true; // Don't remove
    }

    function itemLoaded(event) {

        loadCount++;
        if (loadCount >= itemsToLoad) {
            clickSound.removeEventListener("canplaythrough", itemLoaded, false);
            
            soundPool.push({ name: "MouseClick", element: clickSound, played: false });
            //soundPool.push({ name: "explode1", element: explodeSound2, played: false });
            //soundPool.push({ name: "explode1", element: explodeSound3, played: false });
            //soundPool.push({ name: "shoot1", element: shootSound, played: false });
            //soundPool.push({ name: "shoot1", element: shootSound2, played: false });
            //soundPool.push({ name: "shoot1", element: shootSound3, played: false });
            //soundPool.push({ name: "UFOSound", element: ufoSound, played: false });

            //gameState = STATE_RESET;
        }

    }
}

