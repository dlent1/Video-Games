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
    var endTurnButton = { x: 1020, y: 440, width: 80, height: 30 };
    var endTurnButtonText = { x: 1022, y: 458 };
    var sleepButton = { x: 1115, y: 440, width: 50, height: 30 };
    var sleepButtonText = { x: 1117, y: 458 };
    var huntButton = { x: 1020, y: 490, width: 45, height: 30 };
    var huntButtonText = { x: 1022, y: 508 };
    var mouseLocation = { x: null, y: null };
    var origin = { x: 16, y: 0 };
    var movementInProgress = false;
    var adjacencyList = new Array();
    var sleptAlreadyThisTurn = false;

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

    var waterLikelihoodMatrix = [
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
        // End turn button
        context.fillStyle = "bisque";
        context.fillRect(endTurnButton.x, endTurnButton.y, endTurnButton.width, endTurnButton.height);
        context.strokeRect(endTurnButton.x, endTurnButton.y, endTurnButton.width, endTurnButton.height);
        context.fillStyle = "red";
        context.fillText("End Turn", endTurnButtonText.x, endTurnButtonText.y);

        // Sleep button
        context.fillStyle = "bisque";
        context.fillRect(sleepButton.x, sleepButton.y, sleepButton.width, sleepButton.height);
        context.strokeRect(sleepButton.x, sleepButton.y, sleepButton.width, sleepButton.height);
        context.fillStyle = "red";
        context.fillText("Sleep", sleepButtonText.x, sleepButtonText.y);

        // Hunt button
        context.fillStyle = "bisque";
        context.fillRect(huntButton.x, huntButton.y, huntButton.width, huntButton.height);
        context.strokeRect(huntButton.x, huntButton.y, huntButton.width, huntButton.height);
        context.fillStyle = "red";
        context.fillText("Hunt", huntButtonText.x, huntButtonText.y);

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
        var targetHexPixelCoordinates = {};
        var tile = {};
        var huntResult;
        var huntLikelihood;

        if (event.layerX || event.layerX == 0) { // Firefox
            mouseLocation.x = event.layerX;
            mouseLocation.y = event.layerY;
        } else if (event.offsetX || event.offsetX == 0) { // Opera
            mouseLocation.x = event.offsetX;
            mouseLocation.y = event.offsetY;
        }

        // Check if adjacent hex was clicked
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

        // Check if the end turn button is clicked
        if (mouseLocation.x >= endTurnButton.x && mouseLocation.y >= endTurnButton.y) {
            if (mouseLocation.x <= (endTurnButton.x + endTurnButton.width) && mouseLocation.y <= (endTurnButton.y + endTurnButton.height)) 
                endTurn();
        }

        // Check if the hunt button is clicked
        if (mouseLocation.x >= huntButton.x && mouseLocation.y >= huntButton.y) {
            if (mouseLocation.x <= (huntButton.x + huntButton.width) && mouseLocation.y <= (huntButton.y + huntButton.height)) {
                if (actionPoints > 0) {
                    actionPoints--;

                    huntResult = Math.floor(Math.random() * 10);

                    switch (terrainCostMatrix[playerCounter.y][playerCounter.x]) {
                        case 4:
                            huntLikelihood = 5;
                            break;
                        case 3:
                            huntLikelihood = 7;
                            break;
                        case 2:
                            huntLikelihood = 6;
                        case 1:
                            huntLikelihood = 7;
                    }

                    if (huntResult >= huntLikelihood) {
                        foodAmount += 10 - huntResult;

                        if (foodAmount > 3)
                            foodAmount = 3; // Max food is 3

                        if (waterLikelihoodMatrix[playerCounter.y][playerCounter.x] == 1)
                            alert("You caught some fish! You now have " + foodAmount + " " + "days of food");
                        else
                            alert("Successful hunt! You now have " + foodAmount + " " + "days of food");
                    }
                    else {
                        alert("Your hunt was unsuccessful.");
                    }

                    targetHexPixelCoordinates = HexGridObject.getLocationOfHex(playerCounter.x, playerCounter.y, centeringAdjustmentX, centeringAdjustmentY);
                    refreshScreen(crashedPlane, targetHexPixelCoordinates.columnPixel, targetHexPixelCoordinates.rowPixel);
                }
                else
                    setTimeout(function () {
                        alert("You are out of action points and cannot hunt.  Your turn has ended!");
                        endTurn();

                    }, 100);

                return;
                
            }
                
        }

        // Check if sleep button is clicked
        if (mouseLocation.x >= sleepButton.x && mouseLocation.y >= sleepButton.y) {
            if (mouseLocation.x <= (sleepButton.x + sleepButton.width) && mouseLocation.y <= (sleepButton.y + sleepButton.height)) {
                if (actionPoints > 0) {
                    if (sleptAlreadyThisTurn == false) {
                        if (exhaustion > 0) {
                            targetHexPixelCoordinates = HexGridObject.getLocationOfHex(playerCounter.x, playerCounter.y, centeringAdjustmentX, centeringAdjustmentY);
                            actionPoints--;
                            exhaustion--;
                            sleptAlreadyThisTurn = true;
                            movementInProgress = false;
                            refreshScreen(crashedPlane, targetHexPixelCoordinates.columnPixel, targetHexPixelCoordinates.rowPixel);
                        }
                        else
                            alert("You not able to fall sleep this turn, because you have 0 exhaustion!");
                    }
                    else
                        alert("You can't sleep, because you already slept once this turn!");
                }
                else
                    alert("You need at least 1 action point to sleep!");
            }
        }

        // Check if player counter was clicked
        if (!movementInProgress) {
            tile = HexGridObject.getSelectedTile(mouseLocation.x, mouseLocation.y, origin.x, origin.y);

            if (tile.column == playerCounter.x && tile.row == playerCounter.y) {
                adjacencyList = HexGridObject.getAdjacentHexList(playerCounter.x, playerCounter.y, numRows, numColumns);

                adjacencyList.forEach(function (hex) {
                    if ((terrainCostMatrix[hex.y][hex.x] <= actionPoints) && (terrainCostMatrix[hex.y][hex.x] != 5)) {
                        targetHexPixelCoordinates = HexGridObject.getLocationOfHex(hex.x, hex.y, centeringAdjustmentX, centeringAdjustmentY);
                        context.drawImage(greenXImage, targetHexPixelCoordinates.columnPixel, targetHexPixelCoordinates.rowPixel);
                        context.font = "18px serif";
                        context.fillStyle = "#000";
                        context.textBaseline = "top";
                        context.fillText(terrainCostMatrix[hex.y][hex.x], targetHexPixelCoordinates.columnPixel + textCenteringAdjustmentX, targetHexPixelCoordinates.rowPixel + textCenteringAdjustmentY);
                    }
                });

                if (actionPoints <= 0) {
                    setTimeout(function () {
                        alert("You are out of action points.  Your turn has ended!");
                        endTurn();

                    }, 100);
                    
                    return;
                }

                movementInProgress = true;
            }
        }

        playSound("MouseClick", .5, soundPool, MAX_SOUNDS, PATH);
    }

    function endTurn() {
        var targetHexPixelCoordinates = HexGridObject.getLocationOfHex(playerCounter.x, playerCounter.y, centeringAdjustmentX, centeringAdjustmentY);
        movementInProgress = false;
        actionPoints = 4;
        exhaustion++;
        sleptAlreadyThisTurn = false;

        // Check if you've won the game
        if (playerCounter.x == 0 && playerCounter.y == 0) {
            endGame(true);
            return;
        }

        if (exhaustion > 3)
            lifePoints--;

        if (foodAmount > 0)
            foodAmount--;
        else
            lifePoints--;

        if (waterAmount > 0)
            waterAmount--;
        else
            lifePoints -= 2; 

        if (lifePoints <= 0) {
            endGame(false);
            return;
        }    
        else
            refreshScreen(crashedPlane, targetHexPixelCoordinates.columnPixel, targetHexPixelCoordinates.rowPixel);
    }

    function endGame(won) {
        lifePoints = 10;
        waterAmount = 4;
        foodAmount = 3;
        exhaustion = 0;

        if (!won) {
            alert("Game over.  Your life points fell to zero.  Try again.");
            startGame();
        }
        else {
            alert("Congratulation!  You have made it to civilization and won the game!")
            startGame();
        }
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

