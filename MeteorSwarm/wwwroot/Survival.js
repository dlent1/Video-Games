const DISPLAY_TITLE_SCREEN = 10;
const STATE_RESET = 20;
const MAX_SOUNDS = 5;
const PATH = "https://centurionsreview.com/Survival/";

var HexGridObject = {};
var numRows = 9;
var numColumns = 14;
var radius = 46;
var monsterAlive = false;
var monster = [{ name: "Stegasaurus", imageURL: "https://centurionsreview.com/Survival/StegasaurusFinal.png", sound: "StegasaurusGrowl", hp: 2, attack: 2 },
{ name: "Triceratops", imageURL: "https://centurionsreview.com/Survival/TriceratopsFinal.png", sound: "TriceratopsGrowl", hp: 3, attack: 3 },
{ name: "Tyrannosaurus Rex", imageURL: "https://centurionsreview.com/Survival/TyrannosaurusRexFinal.png", sound: "TRexScream", hp: 4, attack: 4 }
];

var theCanvas;
var context;

var titleStarted = true;
var gameState = "DISPLAY_TITLE_SCREEN";

var backgroundImage = new Image();
var pilotImage = new Image();
var greenXImage = new Image();
var crashedPlaneImage = new Image();
var dinosaurImage = new Image();
var clickSound;
var tRexSound;
var stegasaurusSound;
var triceratopsSound;
var laserPistolSound;

var currentMonster = 0;
var currentMonsterWounds = 0;
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
var textCenteringAdjustmentX = .6 * radius;
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
var waterButton = { x: 1080, y: 490, width: 113, height: 30 };
var waterButtonText = { x: 1082, y: 508 };
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
    [10, 10, 2, 3, 2, 2, 4, 4, 1, 1, 1, 4, 3, 2],
    [10, 10, 10, 3, 3, 4, 4, 10, 10, 10, 3, 3, 3, 1],
    [2, 10, 3, 3, 3, 4, 4, 1, 10, 10, 10, 10, 1, 1],
    [2, 4, 10, 4, 3, 10, 3, 2, 10, 1, 1, 1, 1, 2],
    [4, 3, 4, 3, 2, 10, 3, 2, 1, 0, 0, 2, 2, 1],
    [3, 3, 3, 2, 2, 10, 0, 0, 0, 0, 0, 10, 1, 2],
    [3, 2, 2, 10, 10, 10, 0, 10, 0, 1, 1, 2, 2, 1],
    [2, 2, 2, 2, 2, 10, 10, 10, 10, 1, 2, 2, 2, 1],
    [2, 2, 2, 1, 1, 10, 10, 10, 1, 1, 2, 1, 2, 1]
];

function survivalApp() {
    theCanvas = document.getElementById("survivalCanvas");
    context = theCanvas.getContext("2d");

    initializeImagesAndSounds();
    theCanvas.addEventListener("mousedown", eventMouseDown, false);
    jQuery("#survivalStartButton").attr("disabled", "disabled"); // Disable start button
    startGame(true);

    function eventMouseDown(event) {
        var targetHexPixelCoordinates = {};
        var tile = {};

        if (event.layerX || event.layerX == 0) { // Firefox
            mouseLocation.x = event.layerX;
            mouseLocation.y = event.layerY;
        } else if (event.offsetX || event.offsetX == 0) { // Opera
            mouseLocation.x = event.offsetX;
            mouseLocation.y = event.offsetY;
        }

        if (!monsterAlive) {
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
                    targetHexPixelCoordinates = HexGridObject.getLocationOfHex(tile.column, tile.row, centeringAdjustmentX, centeringAdjustmentY);
                    playerCounter = { x: tile.column, y: tile.row };
                    var cost = terrainCostMatrix[tile.row][tile.column];
                    actionPoints -= cost; // Pay cost of entering hex

                    if (actionPoints >= 0) {
                        if (playerCounter.x == 6 && playerCounter.y == 2) { // It's the cave
                            actionPoints = 4;
                            exhaustion = 0;
                            if (lifePoints <= 8)
                                lifePoints += 2;
                            if (lifePoints == 9)
                                lifePoints = 10;
                        }

                        refreshScreen(crashedPlaneImage, targetHexPixelCoordinates.columnPixel, targetHexPixelCoordinates.rowPixel);

                        if (playerCounter.x == 6 && playerCounter.y == 2) 
                            triggerGenericDialog("You're well rested!", "You rested in the cave and regained your action points, gained 2 life points and are no longer exhausted!");
                    }

                    // Check for monster
                    monsterCheck();
                }

                movementInProgress = false;
            }

            // Check if the end turn button is clicked
            if (mouseLocation.x >= endTurnButton.x && mouseLocation.y >= endTurnButton.y) {
                if (mouseLocation.x <= (endTurnButton.x + endTurnButton.width) && mouseLocation.y <= (endTurnButton.y + endTurnButton.height)) {
                    animateButton(0);
                    setTimeout(function () {
                        endTurn();
                    }, 300); 
                }
            }

            // Check if the gather water button was clicked
            if (mouseLocation.x >= waterButton.x && mouseLocation.y >= waterButton.y) {
                if (mouseLocation.x <= (waterButton.x + waterButton.width) && mouseLocation.y <= (waterButton.y + waterButton.height)) {
                    gatherWater();
                }
            }

            // Check if the hunt button was clicked
            if (mouseLocation.x >= huntButton.x && mouseLocation.y >= huntButton.y) {
                if (mouseLocation.x <= (huntButton.x + huntButton.width) && mouseLocation.y <= (huntButton.y + huntButton.height)) 
                    hunt();
            }

            // Check if sleep button is clicked
            if (mouseLocation.x >= sleepButton.x && mouseLocation.y >= sleepButton.y) {
                if (mouseLocation.x <= (sleepButton.x + sleepButton.width) && mouseLocation.y <= (sleepButton.y + sleepButton.height)) 
                    sleepNow();
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
                        if (!monsterAlive) {
                                triggerGenericDialog("No action points!", "You are out of action points.  Your turn has ended!");
                                endTurn();
                        }
                        
                        return;
                    }

                    movementInProgress = true;
                }
            }

            playSound("MouseClick", .5, soundPool, MAX_SOUNDS, PATH);
        }   
    }

    function monsterCheck() {
        var tile;
        var targetHexPixelCoordinates;

        tile = HexGridObject.getSelectedTile(mouseLocation.x, mouseLocation.y, origin.x, origin.y);
        targetHexPixelCoordinates = HexGridObject.getLocationOfHex(tile.column, tile.row, centeringAdjustmentX, centeringAdjustmentY);

        if ((Math.floor(Math.random() * 10) < 2) && terrainCostMatrix[tile.row][tile.column] != 3) {
            monsterAlive = true;

            // Randomly determine monster type
            currentMonster = Math.floor(Math.random() * 3);

            dinosaurImage.src = monster[currentMonster].imageURL;

            // Display monster image and refresh
            refreshScreen(dinosaurImage, targetHexPixelCoordinates.columnPixel, targetHexPixelCoordinates.rowPixel);
            playSound(monster[currentMonster].sound, .5, soundPool, MAX_SOUNDS, PATH);

            setTimeout(function () {
                jQuery('#shootButtonDiv').show();
                jQuery('#closeButtonDiv').hide();
                jQuery('#dialogParagraph').text("You are being attacked by a " + monster[currentMonster].name + ".  " + "Shoot your laser pistol to try and kill it.");
                jQuery('#survivalDialog').dialog('open'); 
            }, 100);   
        }   
    }

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

        crashedPlaneImage.onload = itemLoaded;
        crashedPlaneImage.src = "https://centurionsreview.com/Survival/CrashedPlane.gif";

        dinosaurImage.onload = itemLoaded;
        dinosaurImage.src = "https://centurionsreview.com/Survival/StegasaurusFinal.png";

        clickSound = document.createElement("audio");
        document.body.appendChild(clickSound);
        audioType = supportedAudioFormat(clickSound);
        clickSound.setAttribute("src", "https://centurionsreview.com/Survival/MouseClick." + audioType);
        clickSound.addEventListener("canplaythrough", itemLoaded, false);

        // The audio file gets reset for the current dinosaur in play
        dinosaurSound = document.createElement("audio");
        document.body.appendChild(dinosaurSound);
        audioType = supportedAudioFormat(dinosaurSound);
        dinosaurSound.setAttribute("src", "https://centurionsreview.com/Survival/TRexScream." + audioType);
        dinosaurSound.addEventListener("canplaythrough", itemLoaded, false);

        laserPistolSound = document.createElement("audio");
        document.body.appendChild(laserPistolSound);
        audioType = supportedAudioFormat(laserPistolSound);
        laserPistolSound.setAttribute("src", "https://centurionsreview.com/Survival/LaserPistolShot." + audioType);
        laserPistolSound.addEventListener("canplaythrough", itemLoaded, false);

        return true; // Don't remove
    }

    function itemLoaded(event) {

        loadCount++;
        if (loadCount >= itemsToLoad) {
            clickSound.removeEventListener("canplaythrough", itemLoaded, false);
            
            soundPool.push({ name: "MouseClick", element: clickSound, played: false });
            soundPool.push({ name: "DinosaurGrowl", element: dinosaurSound, played: false });
        }
    }
}

function shoot() {
    tile = HexGridObject.getSelectedTile(mouseLocation.x, mouseLocation.y, origin.x, origin.y);
    targetHexPixelCoordinates = HexGridObject.getLocationOfHex(tile.column, tile.row, centeringAdjustmentX, centeringAdjustmentY);

    playSound("LaserPistolShot", .5, soundPool, MAX_SOUNDS, PATH);

    // Determine if pistol hits and if monster is still alive... monster attacks.
    if (Math.floor(Math.random() * 10) < 5) {
        currentMonsterWounds += 1;

        // Check if monster is dead
        if (monster[currentMonster].hp <= currentMonsterWounds) {
            jQuery('#shootButtonDiv').hide();
            jQuery('#closeButtonDiv').show();
            jQuery('#dialogParagraph').text("Your pistol hit and killed the " + monster[currentMonster].name + ".  " + "Click close to go back to your travels.");
            monsterAlive = false;
            currentMonsterWounds = 0;
            movementInProgress = false;
        }
        else {
            if (Math.floor(Math.random() * 10) <= monster[currentMonster].attack) {
                lifePoints -= 1;
                if (lifePoints > 0)
                    jQuery('#dialogParagraph').text("Your pistol hit and did one damage to the " + monster[currentMonster].name + ".  " + "He fought back and did one wound to you. " + "Shoot him again!");
                else {
                    jQuery('#dialogParagraph').text("Your pistol hit and did one damage to the " + monster[currentMonster].name + ".  " + "He fought back and killed you. " + "Game over!");
                    jQuery('#closeButtonDiv').show();
                    jQuery('#shootButtonDiv').hide();
                    startGame();
                    return;
                }
            }
            else {
                jQuery('#dialogParagraph').text("Your pistol hit and did one damage to the " + monster[currentMonster].name + ".  " + "He fought back and missed. " + "Shoot him again!");
            }
        }
    }
    else {
        if (Math.floor(Math.random() * 10) <= monster[currentMonster].attack) {
            lifePoints -= 1;
            if (lifePoints > 0)
                jQuery('#dialogParagraph').text("Your pistol missed the " + monster[currentMonster].name + ".  " + "He fought back and did one wound to you. " + "Shoot him again!");
            else {
                jQuery('#dialogParagraph').text("Your pistol hit and did one damage to the " + monster[currentMonster].name + ".  " + "He fought back and killed you. " + "Game over!");
                jQuery('#closeButtonDiv').show();
                jQuery('#shootButtonDiv').hide();
                startGame();
                return;
            }
        }
        else {
            jQuery('#dialogParagraph').text("Your pistol missed the " + monster[currentMonster].name + ".  " + "He fought back, but missed also.  " + "Shoot at him again!");
        }
    }

    // Refresh the screen
    if (monsterAlive)
        refreshScreen(dinosaurImage, targetHexPixelCoordinates.columnPixel, targetHexPixelCoordinates.rowPixel);
    else
        refreshScreen(crashedPlaneImage, targetHexPixelCoordinates.columnPixel, targetHexPixelCoordinates.rowPixel);
}

function refreshScreen(pictureImage, targetHexX, targetHexY) {
    drawBackgroundAndGrid();
    drawPictureImage(pictureImage);
    drawRightColumn();
    context.drawImage(pilotImage, targetHexX, targetHexY);
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

function animateButton(button) {
    context.font = "20px serif";
    context.textBaseline = "middle";
    context.fillStyle = "white";
    switch (button) {
        case 0:
            context.fillRect(endTurnButton.x, endTurnButton.y, endTurnButton.width, endTurnButton.height);
            context.strokeRect(endTurnButton.x, endTurnButton.y, endTurnButton.width, endTurnButton.height);
            context.fillStyle = "red";
            context.fillText("End Turn", endTurnButtonText.x, endTurnButtonText.y);
            break;

        case 1:
            context.fillRect(sleepButton.x, sleepButton.y, sleepButton.width, sleepButton.height);
            context.strokeRect(sleepButton.x, sleepButton.y, sleepButton.width, sleepButton.height);
            context.fillStyle = "red";
            context.fillText("Sleep", sleepButtonText.x, sleepButtonText.y);
            break;

        case 2:
            context.fillRect(huntButton.x, huntButton.y, huntButton.width, huntButton.height);
            context.strokeRect(huntButton.x, huntButton.y, huntButton.width, huntButton.height);
            context.fillStyle = "red";
            context.fillText("Hunt", huntButtonText.x, huntButtonText.y);
            break;

        case 3:
            context.fillRect(waterButton.x, waterButton.y, waterButton.width, waterButton.height);
            context.strokeRect(waterButton.x, waterButton.y, waterButton.width, waterButton.height);
            context.fillStyle = "red";
            context.fillText("Gather Water", waterButtonText.x, waterButtonText.y);
            break;
    }
   
    //setTimeout(function () {
    //    context.fillStyle = "bisque";
    //    context.fillRect(endTurnButton.x, endTurnButton.y, endTurnButton.width, endTurnButton.height);
    //    context.strokeRect(endTurnButton.x, endTurnButton.y, endTurnButton.width, endTurnButton.height);
    //    context.fillStyle = "red";
    //    context.fillText("End Turn", endTurnButtonText.x, endTurnButtonText.y);
    //    return;
    //}, 200); 
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

    // Water button
    context.fillStyle = "bisque";
    context.fillRect(waterButton.x, waterButton.y, waterButton.width, waterButton.height);
    context.strokeRect(waterButton.x, waterButton.y, waterButton.width, waterButton.height);
    context.fillStyle = "red";
    context.fillText("Gather Water", waterButtonText.x, waterButtonText.y);

    // Set back to original values
    context.font = "10px serif";
    context.fillStyle = "red";
}

function startGame(firstGame) {
    // If the browser doesn't support canvas exit
    if (!canvasSupport()) {
        return;
    }

    // Reset these values in case startGame is called after a game over
    actionPoints = 4;
    lifePoints = 10;
    waterAmount = 4;
    foodAmount = 3;
    exhaustion = 0;
    monsterAlive = false;
    currentMonsterWounds = 0;
    movementInProgress = false;

    // Display background and grid
    drawBackgroundAndGrid();

    // Place counter on random position on bottom of map
    placeCounterRandomly(HexGridObject, context);

    drawPictureImage(crashedPlaneImage);
    drawRightColumn();
    
    setTimeout(function () {
        if (firstGame) {
            jQuery('#genericDialog').dialog({ autoOpen: false, title: "Oh No!" });
            jQuery('#genericDialog').attr('title', 'Oh No!');
        }
        else {
            jQuery('#genericDialog').dialog({ autoOpen: false, title: "You died! Restarting the game." });
            jQuery('#genericDialog').attr('title', 'You died!  Restarting the game.');
        }

        jQuery('#genericCloseButtonDiv').show();
        
        jQuery('#genericDialogParagraph').text("You have crashed on a mysterious Earth-like planet.  Suddenly, you detect radio transmissions from the North West.  Go there to find help.  You have a laser pistol and limited food and water. However, you can hunt and dig for water if you need to.");
        jQuery('#genericDialog').dialog('open');
    }, 300);
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
}

function gatherWater() {
    var targetHexPixelCoordinates = {};

    animateButton(3);
    setTimeout(function () {
        if (actionPoints > 0) {
            actionPoints--;

            waterResult = Math.floor(Math.random() * 10) + 1;

            if (waterResult <= waterLikelihoodMatrix[playerCounter.y][playerCounter.x]) {
                waterAmount = 4;
                triggerGenericDialog("You found Water!", "You have found water and filled all four of your bottles!");
            }
            else
                triggerGenericDialog("Failed!", "You didn't find any water.");

            targetHexPixelCoordinates = HexGridObject.getLocationOfHex(playerCounter.x, playerCounter.y, centeringAdjustmentX, centeringAdjustmentY);
            refreshScreen(crashedPlaneImage, targetHexPixelCoordinates.columnPixel, targetHexPixelCoordinates.rowPixel);
        }
        else {
            triggerGenericDialog("Out of action points!", "You are out of action points and cannot gather water.  Your turn has ended!");
            endTurn();
            return;
        }
    }, 300);
}

function hunt() {
    var targetHexPixelCoordinates = {};
    var huntLikelihood;
    var huntResult;

    animateButton(2);
    setTimeout(function () {
        if (actionPoints > 0) {
            actionPoints--;

            huntResult = Math.floor(Math.random() * 10) + 1;

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
                foodAmount += 10 - huntResult + 1;

                if (foodAmount > 3)
                    foodAmount = 3; // Max food is 3

                if (waterLikelihoodMatrix[playerCounter.y][playerCounter.x] == 10)
                    triggerGenericDialog("You caught fish!", "You caught some fish! You now have " + foodAmount + " " + "days of food");
                else {
                    triggerGenericDialog("Successful hunt!", "Successful hunt! You now have " + foodAmount + " " + "days of food");
                }
            }
            else
                triggerGenericDialog("Failed hunt!", "Your hunt was unsuccessful.");

            targetHexPixelCoordinates = HexGridObject.getLocationOfHex(playerCounter.x, playerCounter.y, centeringAdjustmentX, centeringAdjustmentY);
            refreshScreen(crashedPlaneImage, targetHexPixelCoordinates.columnPixel, targetHexPixelCoordinates.rowPixel);
        }
        else {
            triggerGenericDialog("Can't hunt!", "You are out of action points and cannot hunt.  Your turn has ended!");
            endTurn();

            return;
        }


    }, 300);
}

function sleepNow() {
    animateButton(1);
    targetHexPixelCoordinates = HexGridObject.getLocationOfHex(playerCounter.x, playerCounter.y, centeringAdjustmentX, centeringAdjustmentY);

    setTimeout(function () {
        if (actionPoints > 0) {
            if (sleptAlreadyThisTurn == false) {
                if (exhaustion > 0) {
                    actionPoints--;
                    exhaustion--;
                    sleptAlreadyThisTurn = true;
                    movementInProgress = false;
                    triggerGenericDialog("ZZZZ!", "You slept well and have one less exhaustion!");
                }
                else
                    triggerGenericDialog("Can't sleep!", "You're not able to fall sleep this turn, because you have 0 exhaustion!");
            }
            else
                triggerGenericDialog("Can't sleep!", "You can't sleep, because you already slept once this turn!");
        }
        else
            triggerGenericDialog("Not enough action points!", "You need at least 1 action point to sleep!");

        refreshScreen(crashedPlaneImage, targetHexPixelCoordinates.columnPixel, targetHexPixelCoordinates.rowPixel);
    }, 300);
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
        refreshScreen(crashedPlaneImage, targetHexPixelCoordinates.columnPixel, targetHexPixelCoordinates.rowPixel);
}

function endGame(won) {
    if (!won) {
        triggerGenericDialog("You lost!", "Game over.  Your life points fell to zero.  Try again.");
        won = false;
    }
    else {
        triggerGenericDialog("You won!", "Congratulation!  You have made it to civilization and won the game!");
        won = true;
    }

    setTimeout(function () {
        startGame(won);
    }, 3000);
}

function triggerGenericDialog(title, paragraphText) {
    setTimeout(function () {
        jQuery('#genericDialog').dialog({ autoOpen: false, title: title })
        jQuery('#genericCloseButtonDiv').show();
        jQuery('#genericDialog').attr('title', title);
        jQuery('#genericDialogParagraph').text(paragraphText);
        jQuery('#genericDialog').dialog('open');
    }, 100);
}