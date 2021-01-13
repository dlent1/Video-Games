﻿function canvasSupport () {
  	return Modernizr.canvas;
}

function supportedAudioFormat(audio) {
	var returnExtension = " ";
	if (audio.canPlayType(" audio/ogg") == "probably" || audio.canPlayType("audio/ogg") == "maybe" ) {
            returnExtension="ogg" ;
	}
	else if (audio.canPlayType("audio/wav") == "probably" || audio.canPlayType("audio/wav") == "maybe") {
            returnExtension="wav" ;
	}
	else if (audio.canPlayType("audio/wav") == "probably" || audio.canPlayType("audio/wav") == "maybe") {
            returnExtension="mp3" ;
	}

    return returnExtension;
}

function canvasApp(){
	if (!canvasSupport()) {
		return;
	}
	else {
		theCanvas = document.getElementById('canvas');
		context = theCanvas.getContext('2d');
	}
	//sounds
	const SOUND_EXPLODE="explode1" ;
	const SOUND_SHOOT="shoot1" ;
	const SOUND_SAUCER_SHOOT="saucershoot"
	const MAX_SOUNDS=9;
	var soundPool=new Array();
	var explodeSound;
	var explodeSound2;
	var explodeSound3;
	var shootSound;
	var shootSound2;
	var shootSound3;
	var saucershootSound;
	var saucershootSound2;
	var saucershootSound3;
	var audioType;
	//application states
	const GAME_STATE_INIT=0;
	const GAME_STATE_WAIT_FOR_LOAD=5;
	const GAME_STATE_TITLE=10;
	const GAME_STATE_NEW_GAME=20;
	const GAME_STATE_NEW_LEVEL=30;
	const GAME_STATE_PLAYER_START=40;
	const GAME_STATE_PLAY_LEVEL=50;
	const GAME_STATE_PLAYER_DIE=60;
	const GAME_STATE_GAME_OVER=70;
	var currentGameState=0;
	var currentGameStateFunction=null;
	//title screen
	var titleStarted=false;
	//gameover screen
	var gameOverStarted=false;
	//objects for game play
	//game environment
	var score=0;
	var level=0;
	var extraShipAtEach=10000;
	var extraShipsEarned=0;
	var playerShips=3;
	//playfield
	var xMin=0;
	var xMax=400;
	var yMin=0;
	var yMax=400;
	//score values
	var bigRockScore=50;
	var medRockScore=75;
	var smlRockScore=100;
	var saucerScore=300;
	//rock scale constants
	const ROCK_SCALE_LARGE=1;
	const ROCK_SCALE_MEDIUM=2;
	const ROCK_SCALE_SMALL=3;
	//create game objects and arrays
	var player={};
	var rocks=[];
	var saucers=[];
	var playerMissiles=[];
	var particles=[];
	var saucerMissiles=[];
	var particlePool=[];
	var maxParticles=200;
	var newPartcile;
	var tempParticle;
	//level specific
	var levelRockMaxSpeedAdjust=1;
	var levelSaucerMax = 1;
	var totalSaucer = 1;
	var levelSaucerOccurenceRate=25; //this will be multiplied by the level and a max can be se
	var levelSaucerSpeed=1;
	var levelSaucerFireDelay=300;
	var levelSaucerFireRate=30;
	var levelSaucerMissileSpeed=1;
	//keyPresses
	var keyPressList=[];
	//tile sheets
	var shipTiles;
	var shipTiles2;
	var saucerTiles;
	var largeRockTiles;
	var mediumRockTiles;
	var smallRockTiles;
	var particleTiles;
	//***sounds
	function itemLoaded(event) {
		loadCount++;
		////console.log("loading:" + loadCount)
		if (loadCount>= itemsToLoad) {

		shootSound.removeEventListener("canplaythrough",itemLoaded, false);
		shootSound2.removeEventListener("canplaythrough",itemLoaded, false);
		shootSound3.removeEventListener("canplaythrough",itemLoaded, false);
		explodeSound.removeEventListener("canplaythrough",itemLoaded,false);
		explodeSound2.removeEventListener("canplaythrough",itemLoaded,false);
		explodeSound3.removeEventListener("canplaythrough",itemLoaded,false);
		saucershootSound.removeEventListener("canplaythrough",itemLoaded,false);
		saucershootSound2.removeEventListener("canplaythrough",itemLoaded,false);
		saucershootSound3.removeEventListener("canplaythrough",itemLoaded,false);

		soundPool.push({name:"explode1", element:explodeSound, played:false});
		soundPool.push({name:"explode1", element:explodeSound2, played:false});
		soundPool.push({name:"explode1", element:explodeSound3, played:false});
		soundPool.push({name:"shoot1", element:shootSound, played:false});
		soundPool.push({name:"shoot1", element:shootSound2, played:false});
		soundPool.push({name:"shoot1", element:shootSound3, played:false});
		soundPool.push({name:"saucershoot", element:saucershootSound, played:false});
		soundPool.push({name:"saucershoot", element:saucershootSound2, played:false});
		soundPool.push({name:"saucershoot", element:saucershootSound3, played:false});

		switchGameState(GAME_STATE_TITLE)
	}

}
function playSound(sound,volume) {
	ConsoleLog.log("play sound" + sound);
	var soundFound = false;
	var soundIndex = 0;
	var tempSound;

	if (soundPool.length> 0) {
		while (!soundFound && soundIndex < soundPool.length) {

			var tSound = soundPool[soundIndex];
			if ((tSound.element.ended || !tSound.played) && tSound.name == sound) {
				soundFound = true;
				tSound.played = true;
			} else {
				soundIndex++;
			}

		}
	}
	if (soundFound) {
		ConsoleLog.log("sound found");
		tempSound = soundPool[soundIndex].element;
		//tempSound.setAttribute("src", sound + "." + audioType);
		//tempSound.loop = false;
		//tempSound.volume = volume;
		tempSound.play();

	} else if (soundPool.length < MAX_SOUNDS){
		ConsoleLog.log("sound not found");
		tempSound = document.createElement("audio");
		tempSound.setAttribute("src", sound + "." + audioType);
		tempSound.volume = volume;
		tempSound.play();
		soundPool.push({name:sound, element:tempSound, type:audioType, played:true});
	}
}


function runGame(){
	currentGameStateFunction();
}

function switchGameState(newState) {
	currentGameState=newState;
	switch (currentGameState) {

		case GAME_STATE_INIT:
			currentGameStateFunction=gameStateInit;
			break;
		case GAME_STATE_WAIT_FOR_LOAD:
			currentGameStateFunction=gameStateWaitForLoad;
			break;
		case GAME_STATE_TITLE:
				currentGameStateFunction=gameStateTitle;
				break;
		case GAME_STATE_NEW_GAME:
				currentGameStateFunction=gameStateNewGame;
				break;
		case GAME_STATE_NEW_LEVEL:
				currentGameStateFunction=gameStateNewLevel;
				break;
		case GAME_STATE_PLAYER_START:
				currentGameStateFunction=gameStatePlayerStart;
				break;
		case GAME_STATE_PLAY_LEVEL:
				currentGameStateFunction=gameStatePlayLevel;
				break;
		case GAME_STATE_PLAYER_DIE:
				currentGameStateFunction=gameStatePlayerDie;
				break;

		case GAME_STATE_GAME_OVER:
				currentGameStateFunction=gameStateGameOver;
				break;

	}

}


function gameStateWaitForLoad(){
	//do nothing while loading events occur
	//console.log("doing nothing...")
}

function createObjectPools(){
	for (var ctr=0;ctr<maxParticles;ctr++){
		var newParticle={};
		particlePool.push(newParticle)
	}
	////console.log("particlePool=" + particlePool.length)
}

function gameStateInit() {
	createObjectPools();

	loadCount=0;
	itemsToLoad = 16;


	explodeSound = document.createElement("audio");
	document.body.appendChild(explodeSound);
	audioType = supportedAudioFormat(explodeSound);
	explodeSound.setAttribute("src", "explode1." + audioType);
	explodeSound.addEventListener("canplaythrough",itemLoaded,false);

	explodeSound2 = document.createElement("audio");
	document.body.appendChild(explodeSound2);
	explodeSound2.setAttribute("src", "explode1." + audioType);
	explodeSound2.addEventListener("canplaythrough",itemLoaded,false);

	explodeSound3 = document.createElement("audio");
	document.body.appendChild(explodeSound3);
	explodeSound3.setAttribute("src", "explode1." + audioType);
	explodeSound3.addEventListener("canplaythrough",itemLoaded,false);

	shootSound = document.createElement("audio");
	audioType = supportedAudioFormat(shootSound);
	document.body.appendChild(shootSound);
	shootSound.setAttribute("src", "shoot1." + audioType);
	shootSound.addEventListener("canplaythrough",itemLoaded,false);

	shootSound2 = document.createElement("audio");
	document.body.appendChild(shootSound2);
	shootSound2.setAttribute("src", "shoot1." + audioType);
	shootSound2.addEventListener("canplaythrough",itemLoaded,false);

	shootSound3 = document.createElement("audio");
	document.body.appendChild(shootSound3);
	shootSound3.setAttribute("src", "shoot1." + audioType);
	shootSound3.addEventListener("canplaythrough",itemLoaded,false);

	saucershootSound = document.createElement("audio");
	audioType = supportedAudioFormat(saucershootSound);
	document.body.appendChild(saucershootSound);
	saucershootSound.setAttribute("src", "saucershoot." + audioType);
	saucershootSound.addEventListener("canplaythrough",itemLoaded,false);

	saucershootSound2 = document.createElement("audio");
	document.body.appendChild(saucershootSound2);
	saucershootSound2.setAttribute("src", "saucershoot." + audioType);
	saucershootSound2.addEventListener("canplaythrough",itemLoaded,false);

	saucershootSound3 = document.createElement("audio");
	document.body.appendChild(saucershootSound3);
	saucershootSound3.setAttribute("src", "saucershoot." + audioType);
	saucershootSound3.addEventListener("canplaythrough",itemLoaded,false);


	shipTiles = new Image();
	shipTiles.src = "ship_tiles.png";
	shipTiles.onload = itemLoaded;

	shipTiles2 = new Image();
	shipTiles2.src = "ship_tiles2.png";
	shipTiles2.onload = itemLoaded;

	saucerTiles= new Image();
	saucerTiles.src = "saucer.png";
	saucerTiles.onload = itemLoaded;

	largeRockTiles = new Image();
	largeRockTiles.src = "largerocks.png";
	largeRockTiles.onload = itemLoaded;

	mediumRockTiles = new Image();
	mediumRockTiles.src = "mediumrocks.png";
	mediumRockTiles.onload = itemLoaded;

	smallRockTiles = new Image();
	smallRockTiles.src = "smallrocks.png";
	smallRockTiles.onload = itemLoaded;

	particleTiles = new Image();
	particleTiles.src = "parts.png";
	particleTiles.onload = itemLoaded;

	switchGameState(GAME_STATE_WAIT_FOR_LOAD);
}

function gameStateTitle() {
	if (titleStarted !=true){
		fillBackground();
		setTextStyleTitle();
		context.fillText  ("Geo Blaster X-ten-d", 120, 70);

		setTextStyle();
		context.fillText  ("Press Space To Play", 130, 140);

		setTextStyleCredits();
		context.fillText  ("An HTML5 Example Game", 125, 200);
		context.fillText  ("From our upcomming HTML5 Canvas", 100, 215);
		context.fillText  ("book on O'Reilly Press", 130, 230);

		context.fillText  ("Game Code - Jeff Fulton", 130, 260);
		context.fillText  ("Sound Manager - Steve Fulton", 120, 275);


		titleStarted=true;
	}
	else {
		//wait for space key click
		if (keyPressList[32]==true){
			ConsoleLog.log("space pressed");
			switchGameState(GAME_STATE_NEW_GAME);
			titleStarted=false;

		}


	}
}

function gameStateNewGame(){
	//ConsoleLog.log("gameStateNewGame")
	//setup new game
	level=0;
	score=0;
	playerShips=3;
	player.maxVelocity=5;
	player.width=32;
	player.height=32;
	player.halfWidth=16;
	player.halfHeight=16;
	player.hitWidth=24;
	player.hitHeight=24;
	player.rotationalVelocity=10; //how many degrees to turn the ship
	player.thrustAcceleration=.05;
	player.missileFrameDelay=5;
	player.thrust=false;
	player.alpha=1;
	player.rotation=0;
	player.x=0;
	player.y=0;

	fillBackground();
	renderScoreBoard();
	switchGameState(GAME_STATE_NEW_LEVEL)


}

function gameStateNewLevel(){
	rocks=[];
	saucers=[];
	playerMissiles=[];
	particles=[];
	saucerMissiles=[];
	level++;
	levelRockMaxSpeedAdjust=level*.25;
	if (levelRockMaxSpeedAdjust > 3){
		levelRockMaxSpeed=3;
	}

	//levelSaucerMax=1+Math.floor(level/10);
	levelSaucerMax = level;
	totalSaucer = 0;
	if (levelSaucerMax > 5){
		levelSaucerMax=5;
	}
	levelSaucerOccurenceRate = 10 + 3 * level;
	if (levelSaucerOccurenceRate > 35){
		levelSaucerOccurenceRate=35;
	}
	levelSaucerSpeed=1+.5*level;
	if (levelSaucerSpeed>5){
		levelSaucerSpeed=5;
	}
	levelSaucerFireDelay=120-10*level;
	if (levelSaucerFireDelay<20) {
		levelSaucerFireDelay=20;
	}

	levelSaucerFireRate=20 + 3*level;
	if (levelSaucerFireRate<50) {
		levelSaucerFireRate=50;
	}

	levelSaucerMissileSpeed=1+.2*level;
	if (levelSaucerMissileSpeed > 4){
		levelSaucerMissileSpeed=4;
	}
	//create level rocks
	for (var newRockctr=0;newRockctr<level;newRockctr++){
			var newRock={};

			newRock.scale=1;
			//scale
			//1=large
			//2=medium
			//3=small
			//these will be used as the devisor for the new size
			//50/1=50
			//50/2=25
			//50/3=16
			newRock.width=64;
			newRock.height=64;
			newRock.halfWidth=32;
			newRock.halfHeight=32;

			newRock.hitWidth=48;
			newRock.hitHeight=48;

			//start all new rocks in upper left for ship safety
			newRock.x=Math.floor(Math.random()*50);
			//ConsoleLog.log("newRock.x=" + newRock.x);
			newRock.y=Math.floor(Math.random()*50);
			//ConsoleLog.log("newRock.y=" + newRock.y);
			newRock.dx=(Math.random()*2)+levelRockMaxSpeedAdjust;
			if (Math.random()<.5){
				newRock.dx*=-1;
			}
			newRock.dy=(Math.random()*2)+levelRockMaxSpeedAdjust;
			if (Math.random()<.5){
				newRock.dy*=-1;
			}
			//rotation speed and direction

			if (Math.random()<.5){
				newRock.rotationInc=-1;
			}else{
				newRock.rotationInc=1;
			}

			newRock.animationDelay=Math.floor(Math.random()*3+1);
			newRock.animationCount=0;

			newRock.scoreValue=bigRockScore;
			newRock.rotation=0;

			rocks.push(newRock);
			//ConsoleLog.log("rock created rotationInc=" + newRock.rotationInc);
		}
	resetPlayer();
	switchGameState(GAME_STATE_PLAYER_START);
}

function gameStatePlayerStart(){

	fillBackground();
	renderScoreBoard();
	if (player.alpha < 1){
		player.alpha+=.01;

		ConsoleLog.log("player.alpha=" + context.globalAlpha)
	}else{
		switchGameState(GAME_STATE_PLAY_LEVEL);
		player.safe=false; // added chapter 9

	}

	//renderPlayerShip(player.x, player.y,270,1);
	context.globalAlpha=1;
	//new in chapter 9
	checkKeys();
	update();
	render(); //added chapter 9
	checkCollisions();
	checkForExtraShip();
	checkForEndOfLevel();
	frameRateCounter.countFrames();



}

function gameStatePlayLevel(){
	checkKeys();
	update();
	render();
	checkCollisions();
	checkForExtraShip();
	checkForEndOfLevel();
	frameRateCounter.countFrames();

}

function resetPlayer() {
	player.rotation=270;
	player.x=.5*xMax;
	player.y=.5*yMax;
	player.facingX=0;
	player.facingY=0;
	player.movingX=0;
	player.movingY=0;
	player.alpha=0;
	player.missileFrameCount=0;
	//added chapter 9
	player.safe=true;
}

function checkForExtraShip() {
	if (Math.floor(score/extraShipAtEach) > extraShipsEarned) {
		playerShips++
		extraShipsEarned++;
	}
}

function checkForEndOfLevel(){
	if (rocks.length==0) {
		switchGameState(GAME_STATE_NEW_LEVEL);
	}
}

function gameStatePlayerDie(){
	if (particles.length >0 || playerMissiles.length>0) {
		fillBackground();
		renderScoreBoard();
		updateRocks();
		updateSaucers();
		updateParticles();
		updateSaucerMissiles();
		updatePlayerMissiles();
		renderRocks();
		renderSaucers();
		renderParticles();
		renderSaucerMissiles();
		renderPlayerMissiles();
		frameRateCounter.countFrames();

	}
	else {
		playerShips--;
		if (playerShips<1) {
			switchGameState(GAME_STATE_GAME_OVER);
		}else{
			//resetPlayer();
			switchGameState(GAME_STATE_PLAYER_START);
		}
	}
}


function gameStateGameOver() {
	//ConsoleLog.log("Game Over State");
	if (gameOverStarted !=true){
		fillBackground();
		renderScoreBoard();
		setTextStyle();
		context.fillText  ("Game Over!", 160, 70);
		context.fillText  ("Press Space To Play", 130, 140);

		gameOverStarted=true;
	}else{
		//wait for space key click
		if (keyPressList[32]==true){
			ConsoleLog.log("space pressed");
			switchGameState(GAME_STATE_TITLE);
			gameOverStarted=false;

		}


	}
}

function fillBackground() {
	// draw background and text
	context.fillStyle = '#000000';
	context.fillRect(xMin, yMin, xMax, yMax);

}

function setTextStyle() {
	context.fillStyle    = '#ffffff';
	context.font         = '15px _sans';
	context.textBaseline = 'top';
}

function setTextStyleTitle() {
	context.fillStyle    = '#54ebeb';
	context.font         = '20px _sans';
	context.textBaseline = 'top';
}

function setTextStyleCredits() {
	context.fillStyle    = '#ffffff';
	context.font         = '12px _sans';
	context.textBaseline = 'top';
}

function renderScoreBoard() {

	context.fillStyle = "#ffffff";
	context.fillText('Score: ' + score, 10, 20);
	renderPlayerShip(200,16,270,.75)
	context.fillText('X ' + playerShips, 220, 20);

	context.fillText('FPS: ' + frameRateCounter.lastFrameCount, 300,20)
}

function checkKeys() {
	//check keys

	if (keyPressList[38]==true){
	//thrust
		var angleInRadians = player.rotation * Math.PI / 180;
		player.facingX=Math.cos(angleInRadians);
		player.facingY=Math.sin(angleInRadians);

		var movingXNew=player.movingX+player.thrustAcceleration*player.facingX;
		var movingYNew=player.movingY+player.thrustAcceleration*player.facingY;

		var currentVelocity= Math.sqrt ((movingXNew*movingXNew) + (movingXNew*movingXNew));

		if (currentVelocity < player.maxVelocity) {
			player.movingX=movingXNew;
			player.movingY=movingYNew;
		}
		player.thrust=true;


	}else{
		player.thrust=false;
	}

	if (keyPressList[37]==true) {
		//rotate counter-clockwise
		player.rotation-=player.rotationalVelocity;
		if (player.rotation <0) {
			player.rotation=350
		}


	}

	if (keyPressList[39]==true) {
		//rotate clockwise
		player.rotation+=player.rotationalVelocity;
		if (player.rotation >350) {
			player.rotation=10
		}
	}

	if (keyPressList[32]==true) {
		//ConsoleLog.log("player.missileFrameCount=" + player.missileFrameCount);
		//ConsoleLog.log("player.missileFrameDelay=" + player.missileFrameDelay);
		if (player.missileFrameCount>player.missileFrameDelay){
			playSound(SOUND_SHOOT,.5);
			firePlayerMissile();
			player.missileFrameCount=0;

		}
	}
}

function update() {
	updatePlayer();
	updatePlayerMissiles();
	updateRocks();
	updateSaucers();
	updateSaucerMissiles();
	updateParticles();
}


function render() {
	fillBackground();
	renderScoreBoard();
	renderPlayerShip(player.x,player.y,player.rotation,1);
	renderPlayerMissiles();
	renderRocks();
	renderSaucers();
	renderSaucerMissiles();
	renderParticles();
}

function updatePlayer() {
	player.missileFrameCount++;

	player.x+=player.movingX*frameRateCounter.step;
	player.y+=player.movingY*frameRateCounter.step;

	if (player.x > xMax) {
		player.x=-player.width;
	}else if (player.x<-player.width){
		player.x=xMax;
	}

	if (player.y > yMax) {
		player.y=-player.height;
	}else if (player.y<-player.height){
		player.y=yMax;
	}
}

function updatePlayerMissiles() {
	var tempPlayerMissile={};
	var playerMissileLength=playerMissiles.length-1;
	//ConsoleLog.log("update playerMissileLength=" + playerMissileLength);
	for (var playerMissileCtr=playerMissileLength;playerMissileCtr>=0;playerMissileCtr--){
		//ConsoleLog.log("update player missile" + playerMissileCtr)
		tempPlayerMissile=playerMissiles[playerMissileCtr];
		tempPlayerMissile.x+=tempPlayerMissile.dx*frameRateCounter.step;
		tempPlayerMissile.y+=tempPlayerMissile.dy*frameRateCounter.step;
		if (tempPlayerMissile.x > xMax) {
			tempPlayerMissile.x=-tempPlayerMissile.width;
		}else if (tempPlayerMissile.x<-tempPlayerMissile.width){
			tempPlayerMissile.x=xMax;
		}

		if (tempPlayerMissile.y > yMax) {
			tempPlayerMissile.y=-tempPlayerMissile.height;
		}else if (tempPlayerMissile.y<-tempPlayerMissile.height){
			tempPlayerMissile.y=yMax;
		}


		tempPlayerMissile.lifeCtr++;
		if (tempPlayerMissile.lifeCtr > tempPlayerMissile.life){
			//ConsoleLog.log("removing player missile");
			playerMissiles.splice(playerMissileCtr,1)
			tempPlayerMissile=null;
		}
	}
}

function updateRocks(){
	var tempRock={};
	var rocksLength=rocks.length-1;
	//ConsoleLog.log("update rocks length=" + rocksLength);
	for (var rockCtr=rocksLength;rockCtr>=0;rockCtr--){
		tempRock=rocks[rockCtr]
		tempRock.x+=tempRock.dx*frameRateCounter.step;
		tempRock.y+=tempRock.dy*frameRateCounter.step;

		tempRock.animationCount++;
		if (tempRock.animationCount > tempRock.animationDelay){
			tempRock.animationCount=0;
			tempRock.rotation+=tempRock.rotationInc;

			if (tempRock.rotation > 4){
				tempRock.rotation=0;
			}
			else if (tempRock.rotation < 0) {
				tempRock.rotation=4;
			}
		}

		if (tempRock.x > xMax) {
			tempRock.x=xMin-tempRock.width;
		}
		else if (tempRock.x < xMin - tempRock.width) {
			tempRock.x=xMax;
		}

		if (tempRock.y > yMax) {
			tempRock.y=yMin-tempRock.width;
		}
		else if (tempRock.y < yMin - tempRock.width) {
			tempRock.y=yMax;
		}
		//ConsoleLog.log("update rock "+ rockCtr)
	}
}

function updateSaucers() {
	//first check to see is we want to add a saucer

	if (saucers.length < levelSaucerMax && totalSaucer < level){
		if (Math.floor(Math.random()*100)<=levelSaucerOccurenceRate){
			//ConsoleLog.log("create saucer")

			totalSaucer++;
			var newSaucer={};

			newSaucer.width=30;
			newSaucer.height=13;
			newSaucer.halfHeight=6.5;
			newSaucer.halfWidth=15;
			newSaucer.hitWidth=30;
			newSaucer.hitHeight=13;
			newSaucer.scoreValue=saucerScore;
			newSaucer.fireRate=levelSaucerFireRate;
			newSaucer.fireDelay=levelSaucerFireDelay;
			newSaucer.fireDelayCount=0;
			newSaucer.missileSpeed=levelSaucerMissileSpeed;
			newSaucer.dy=(Math.random()*2);
			if (Math.floor(Math.random)*2==1){
				newSaucer.dy*=-1;
			}

			//choose betweeen left or right edge to start
			if (Math.floor(Math.random()*2)==1){
				//start on right and go left
				newSaucer.x=450;
				newSaucer.dx=-1*levelSaucerSpeed;



			}
			else {
				//left to right
				newSaucer.x=-50;
				newSaucer.dx=levelSaucerSpeed;
			}

			newSaucer.missileSpeed=levelSaucerMissileSpeed;
			newSaucer.fireDelay=levelSaucerFireDelay;
			newSaucer.fireRate=levelSaucerFireRate;
			newSaucer.y=Math.floor(Math.random()*400);


			saucers.push(newSaucer);
		}


	}


	var tempSaucer={};
	var saucerLength=saucers.length-1;
	//ConsoleLog.log("update rocks length=" + rocksLength);
	for (var saucerCtr=saucerLength;saucerCtr>=0;saucerCtr--){
		tempSaucer=saucers[saucerCtr];

		//should saucer fire
		tempSaucer.fireDelayCount++;
		if (Math.floor(Math.random()*100) <=tempSaucer.fireRate && tempSaucer.fireDelayCount>tempSaucer.fireDelay ){
			playSound(SOUND_SAUCER_SHOOT,.5);
			fireSaucerMissile(tempSaucer)
			tempSaucer.fireDelayCount=0;
		}

		var remove=false;
		tempSaucer.x+=tempSaucer.dx*frameRateCounter.step;
		tempSaucer.y+=tempSaucer.dy*frameRateCounter.step;

		//remove saucers on left and right edges
		if (tempSaucer.dx > 0 && tempSaucer.x >xMax){
			remove=true;
		}else if (tempSaucer.dx <0 &&tempSaucer.x<xMin-tempSaucer.width){
			remove=true;
		}

		//bounce saucers off over vertical edges
		if (tempSaucer.y > yMax || tempSaucer.y<yMin-tempSaucer.width) {
			tempSaucer.dy*=-1
		}

		if (remove==true) {
			//remove the saucer
			ConsoleLog.log("saucer removed")
			saucers.splice(saucerCtr,1);
			tempSaucer=null;
		}




	}


}


function updateSaucerMissiles() {
	var tempSaucerMissile={};
	var saucerMissileLength=saucerMissiles.length-1;
	for (var saucerMissileCtr=saucerMissileLength;saucerMissileCtr>=0;saucerMissileCtr--){
		//ConsoleLog.log("update player missile" + playerMissileCtr)
		tempSaucerMissile=saucerMissiles[saucerMissileCtr];
		tempSaucerMissile.x+=tempSaucerMissile.dx*frameRateCounter.step;
		tempSaucerMissile.y+=tempSaucerMissile.dy*frameRateCounter.step;
		if (tempSaucerMissile.x > xMax) {
			tempSaucerMissile.x=-tempSaucerMissile.width;
		}else if (tempSaucerMissile.x<-tempSaucerMissile.width){
			tempSaucerMissile.x=xMax;
		}

		if (tempSaucerMissile.y > yMax) {
			tempSaucerMissile.y=-tempSaucerMissile.height;
		}else if (tempSaucerMissile.y<-tempSaucerMissile.height){
			tempSaucerMissile.y=yMax;
		}

		tempSaucerMissile.lifeCtr++;
		if (tempSaucerMissile.lifeCtr > tempSaucerMissile.life){
			//remove
			saucerMissiles.splice(saucerMissileCtr,1)
			tempSaucerMissile=null;
		}
	}
}

function updateParticles() {

	var particleLength=particles.length-1;
	ConsoleLog.log("particle=" + particleLength)
	ConsoleLog.log("particlePool=" + particlePool.length)
	for (var particleCtr=particleLength;particleCtr>=0;particleCtr--){
		var remove =false;
		tempParticle=particles[particleCtr];
		tempParticle.x+=tempParticle.dx*frameRateCounter.step;
		tempParticle.y+=tempParticle.dy*frameRateCounter.step;

		tempParticle.lifeCtr++;
		//ConsoleLog.log("particle.lifeCtr=" + tempParticle.lifeCtr);


		//try{
		if (tempParticle.lifeCtr > tempParticle.life){
			remove=true;

		} else if ((tempParticle.x > xMax) || (tempParticle.x<xMin) || (tempParticle.y > yMax) || (tempParticle.y<yMin)){
			remove=true;

		}
		//}
		//catch(err) {
		//	ConsoleLog.log ("error in particle");
		//	ConsoleLog.log("particle:" + particleCtr);

		//}

		if (remove) {
			particlePool.push(tempParticle)
			particles.splice(particleCtr,1)

		}
	}
}

function renderPlayerShip(x,y,rotation, scale) {
	//transformation
	context.save(); //save current state in stack
	context.globalAlpha = parseFloat(player.alpha);
	var angleInRadians = rotation * Math.PI / 180;
	var sourceX=Math.floor((player.rotation/10) % 10) * 32;
	////console.log("player.rotation", player.rotation)
	////console.log("sourceX", sourceX);
	////console.log("playert.x", player.x)
	var sourceY=Math.floor((player.rotation/10) /10) *32;
	//console.log("sourceY", sourceY);
	if (player.thrust){
		context.drawImage(shipTiles2, sourceX, sourceY,32,32,player.x,player.y,32,32);
	}else{
		context.drawImage(shipTiles, sourceX, sourceY,32,32,player.x,player.y,32,32);
	}

	//restore context
	context.restore(); //pop old state on to screen

	context.globalAlpha=1;

}

function renderPlayerMissiles() {
	var tempPlayerMissile={};
	var playerMissileLength=playerMissiles.length-1;
	//ConsoleLog.log("render playerMissileLength=" + playerMissileLength);
	for (var playerMissileCtr=playerMissileLength;playerMissileCtr>=0;playerMissileCtr--){
		//ConsoleLog.log("draw playert missile " + playerMissileCtr)
		tempPlayerMissile=playerMissiles[playerMissileCtr];
		context.save(); //save current state in stack
		var sourceX=Math.floor(1 % 4) * tempPlayerMissile.width;
		var sourceY=Math.floor(1 / 4) * tempPlayerMissile.height;

		context.drawImage(particleTiles, sourceX, sourceY,tempPlayerMissile.width,tempPlayerMissile.height,tempPlayerMissile.x,tempPlayerMissile.y,tempPlayerMissile.width,tempPlayerMissile.height);

		context.restore(); //pop old state on to screen
	}
}

function renderRocks() {
	var tempRock={};
	var rocksLength=rocks.length-1;
	for (var rockCtr=rocksLength;rockCtr>=0;rockCtr--){
		context.save(); //save current state in stack
		tempRock=rocks[rockCtr];
		var sourceX=Math.floor((tempRock.rotation) % 5) * tempRock.width;
		var sourceY=Math.floor((tempRock.rotation) /5) *tempRock.height;

		switch(tempRock.scale){
			case 1:
				context.drawImage(largeRockTiles, sourceX, sourceY,tempRock.width,tempRock.height,tempRock.x,tempRock.y,tempRock.width,tempRock.height);
				break;
			case 2:
				context.drawImage(mediumRockTiles, sourceX, sourceY,tempRock.width,tempRock.height,tempRock.x,tempRock.y,tempRock.width,tempRock.height);
				break;
			case 3:
				context.drawImage(smallRockTiles, sourceX, sourceY,tempRock.width,tempRock.height,tempRock.x,tempRock.y,tempRock.width,tempRock.height);
				break;

		}


		context.restore(); //pop old state on to screen

	}
}

function renderSaucers() {
	var tempSaucer={};
	var saucerLength=saucers.length-1;
	for (var saucerCtr=saucerLength;saucerCtr>=0;saucerCtr--){
		//ConsoleLog.log("saucer: " + saucerCtr);
		tempSaucer=saucers[saucerCtr];

		context.save(); //save current state in stack
		var sourceX=0;
		var sourceY=0;

		    context.drawImage(saucerTiles, sourceX, sourceY,30,15,tempSaucer.x,tempSaucer.y,30,15);
		context.restore(); //pop old state on to screen
	}
}

function renderSaucerMissiles() {
	var tempSaucerMissile={};
	var saucerMissileLength=saucerMissiles.length-1;
	//ConsoleLog.log("saucerMissiles= " + saucerMissiles.length)
	for (var saucerMissileCtr=saucerMissileLength;saucerMissileCtr>=0;saucerMissileCtr--){
		//ConsoleLog.log("draw playert missile " + playerMissileCtr)
		tempSaucerMissile=saucerMissiles[saucerMissileCtr];
		context.save(); //save current state in stack
		var sourceX=Math.floor(0 % 4) * tempSaucerMissile.width;
		var sourceY=Math.floor(0 / 4) * tempSaucerMissile.height;

		context.drawImage(particleTiles, sourceX, sourceY,tempSaucerMissile.width,tempSaucerMissile.height,tempSaucerMissile.x,tempSaucerMissile.y,tempSaucerMissile.width,tempSaucerMissile.height);

		context.restore(); //pop old state on to screen

	}
}

function renderParticles() {

	var tempParticle={};
	var particleLength=particles.length-1;
	for (var particleCtr=particleLength;particleCtr>=0;particleCtr--){
		tempParticle=particles[particleCtr];
		context.save(); //save current state in stack

		var tile;

		////console.log("part type=" + tempParticle.type)
		switch(tempParticle.type){
			case 0: // saucer
				tile=0;
				break;
			case 1: //large rock
				tile=2
				break;
			case 2: //medium rock
				tile=3;
				break;
			case 3: //small rock
				tile=0;
				break;
			case 4: //player
				tile=1;
				break;
		}

		var sourceX=Math.floor(tile % 4) * tempParticle.width;
		var sourceY=Math.floor(tile / 4) * tempParticle.height;

		context.drawImage(particleTiles, sourceX, sourceY,tempParticle.width,tempParticle.height,tempParticle.x,tempParticle.y,tempParticle.width,tempParticle.height);

		context.restore(); //pop old state on to screen
	}
}

function checkCollisions() {

	//loop through rocks then missiles. There will always be rocks and a ship, but there will not always be missiles
	var tempRock={};
	var rocksLength=rocks.length-1;
	var tempPlayerMissile={};
	var playerMissileLength=playerMissiles.length-1;
	var saucerLength=saucers.length-1;
	var tempSaucer={};
	var saucerMissileLength=saucerMissiles.length-1;


	rocks: for (var rockCtr=rocksLength;rockCtr>=0;rockCtr--){
		tempRock=rocks[rockCtr];

		missiles:for (var playerMissileCtr=playerMissileLength;playerMissileCtr>=0;playerMissileCtr--){
			tempPlayerMissile=playerMissiles[playerMissileCtr];


			if (boundingBoxCollide(tempRock,tempPlayerMissile)){
					//ConsoleLog.log("hit rock");
					createExplode(tempRock.x + tempRock.halfWidth, tempRock.y + tempRock.halfHeight, 10, tempRock.scale);

					if (tempRock.scale<3) {
						splitRock(tempRock.scale+1, tempRock.x, tempRock.y);
					}

					addToScore(tempRock.scoreValue);
					playerMissiles.splice(playerMissileCtr,1);
					tempPlayerMissile=null;

					rocks.splice(rockCtr,1);
					tempRock=null;

					break rocks;
					break missiles;
				}
			}

		saucers:for (var saucerCtr=saucerLength;saucerCtr>=0;saucerCtr--){
			tempSaucer=saucers[saucerCtr];

			if (boundingBoxCollide(tempRock,tempSaucer)){
					//ConsoleLog.log("hit rock");
					createExplode(tempSaucer.x+tempSaucer.halfWidth,tempSaucer.y+tempSaucer.halfHeight,10,0);
					createExplode(tempRock.x+tempRock.halfWidth,tempRock.y+tempRock.halfHeight,10,tempRock.scale);

					if (tempRock.scale<3) {
						splitRock(tempRock.scale+1, tempRock.x, tempRock.y);
					}

					saucers.splice(saucerCtr,1);
					tempSaucer=null;

					rocks.splice(rockCtr,1);
					tempRock=null;

					break rocks;
					break saucers;
				}
			}
		//saucer missiles against rocks
		//this is done here so we don't have to loop through rocks again as it would probably
		//be the biggest arrary
		saucerMissiles:for (var saucerMissileCtr=saucerMissileLength;saucerMissileCtr>=0;saucerMissileCtr--){
			tempSaucerMissile=saucerMissiles[saucerMissileCtr];


			if (boundingBoxCollide(tempRock,tempSaucerMissile)){
					//ConsoleLog.log("hit rock");

					createExplode(tempRock.x+tempRock.halfWidth,tempRock.y+tempRock.halfHeight,10,tempRock.scale);
					if (tempRock.scale<3) {
						splitRock(tempRock.scale+1, tempRock.x, tempRock.y);
					}

					saucerMissiles.splice(saucerCtr,1);
					tempSaucerMissile=null;


					rocks.splice(rockCtr,1);
					tempRock=null;


					break rocks;
					break saucerMissiles;
				}
			}

		//check player aginst rocks
		if (boundingBoxCollide(tempRock,player) && player.safe==false){
			//ConsoleLog.log("hit player");
			createExplode(tempRock.x+tempRock.halfWidth,tempRock.halfHeight,10,tempRock.scale);
			addToScore(tempRock.scoreValue);
			if (tempRock.scale<3) {
				splitRock(tempRock.scale+1, tempRock.x, tempRock.y);
			}
			rocks.splice(rockCtr,1);
			tempRock=null;

			playerDie();
		}
	}

	//now check player against saucers and then saucers against player missiles and finally player against saucer missiles
	playerMissileLength=playerMissiles.length-1;
	saucerLength=saucers.length-1;
	saucers:for (var saucerCtr=saucerLength;saucerCtr>=0;saucerCtr--){
		tempSaucer=saucers[saucerCtr];

		missiles:for (var playerMissileCtr=playerMissileLength;playerMissileCtr>=0;playerMissileCtr--){
			tempPlayerMissile=playerMissiles[playerMissileCtr];


			if (boundingBoxCollide(tempSaucer,tempPlayerMissile)){
				//ConsoleLog.log("hit rock");
				createExplode(tempSaucer.x+tempSaucer.halfWidth,tempSaucer.y+tempSaucer.halfHeight,10,0);
				addToScore(tempSaucer.scoreValue);

				playerMissiles.splice(playerMissileCtr,1);
				tempPlayerMissile=null;


				saucers.splice(saucerCtr,1);
				tempSaucer=null;


				break saucers;
				break missiles;
			}
		}

		//player against saucers
		if (boundingBoxCollide(tempSaucer,player) & player.safe==false){
			ConsoleLog.log("hit player");
			createExplode(tempSaucer.x+16,tempSaucer.y+16,10,tempRock.scale);
			addToScore(tempSaucer.scoreValue);

			saucers.splice(rockCtr,1);
			tempSaucer=null;

			playerDie();
		}
	}

	//saucerMissiles against player
	saucerMissileLength=saucerMissiles.length-1;

	saucerMissiles:for (var saucerMissileCtr=saucerMissileLength;saucerMissileCtr>=0;saucerMissileCtr--){

		tempSaucerMissile=saucerMissiles[saucerMissileCtr];

		if (boundingBoxCollide(player,tempSaucerMissile) & player.safe==false){
			ConsoleLog.log("saucer missile hit player");

			playerDie();
			saucerMissiles.splice(saucerCtr,1);
			tempSaucerMissile=null;

			break saucerMissiles;
		}
	}
}


function firePlayerMissile(){

	//ConsoleLog.log("fire playerMissile");
	var newPlayerMissile={};
	newPlayerMissile.dx=5*Math.cos(Math.PI*(player.rotation)/180);
	newPlayerMissile.dy=5*Math.sin(Math.PI*(player.rotation)/180);
	newPlayerMissile.x=player.x+player.halfWidth;
	newPlayerMissile.y=player.y+player.halfHeight;
	newPlayerMissile.life=60;
	newPlayerMissile.lifeCtr=0;
	newPlayerMissile.width=2;
	newPlayerMissile.height=2;
	newPlayerMissile.hitHeight=2;
	newPlayerMissile.hitWidth=2;
	playerMissiles.push(newPlayerMissile);
}

function fireSaucerMissile(saucer) {
	var newSaucerMissile={};
	newSaucerMissile.x=saucer.x+.5*saucer.width;
	newSaucerMissile.y=saucer.y+.5*saucer.height;

	newSaucerMissile.width=2;
	newSaucerMissile.height=2;
	newSaucerMissile.hitHeight=2;
	newSaucerMissile.hitWidth=2;
	newSaucerMissile.speed=saucer.missileSpeed;

	//ConsoleLog.log("saucer fire");
	//fire at player from small saucer
	var diffx = player.x-saucer.x;
	var diffy = player.y-saucer.y;
	var radians = Math.atan2(diffy, diffx);
	var degrees = 360 * radians / (2 * Math.PI);
	newSaucerMissile.dx=saucer.missileSpeed*Math.cos(Math.PI*(degrees)/180);
	newSaucerMissile.dy=saucer.missileSpeed*Math.sin(Math.PI*(degrees)/180);
	newSaucerMissile.life=160;
	newSaucerMissile.lifeCtr=0;
	saucerMissiles.push(newSaucerMissile);
}

function playerDie() {

	ConsoleLog.log("player die");
	createExplode(player.x+player.halfWidth, player.y+player.halfWidth,50,4);
	resetPlayer();
	switchGameState(GAME_STATE_PLAYER_DIE);
}


function createExplode(x,y,num,type) {
	playSound(SOUND_EXPLODE, .5);

	for (var partCtr=0;partCtr<num;partCtr++){
		if (particlePool.length > 0){

		    newParticle=particlePool.pop();
		newParticle.dx=Math.random()*3;
			if (Math.random()<.5){
				newParticle.dx*=-1;
			}
		newParticle.dy=Math.random()*3;
		if (Math.random()<.5){
			newParticle.dy*=-1;
		}

		newParticle.life=Math.floor(Math.random()*30+30);
		newParticle.lifeCtr=0;
		newParticle.x=x;
		newParticle.width=2;
		newParticle.height=2;
		newParticle.y=y;
		newParticle.type=type;
		//ConsoleLog.log("newParticle.life=" + newParticle.life);
		particles.push(newParticle);
		}
	}
}

function boundingBoxCollide(object1, object2) {
	var left1 = object1.x;
	var left2 = object2.x;
	var right1 = object1.x + object1.hitWidth;
	var right2 = object2.x + object2.hitWidth;
	var top1 = object1.y;
	var top2 = object2.y;
	var bottom1 = object1.y + object1.hitHeight;
	var bottom2 = object2.y + object2.hitHeight;

	if (bottom1 < top2) return(false);
	if (top1 > bottom2) return(false);

	if (right1 < left2) return(false);
	if (left1 > right2) return(false);

	return(true);
};

function splitRock(scale,x,y){
	for (var newRockctr=0;newRockctr<2;newRockctr++){
		var newRock={};
		//ConsoleLog.log("split rock");

		if (scale==2){
			newRock.scoreValue=medRockScore;
			newRock.width=32;
			newRock.height=32;
			newRock.halfWidth=16;
			newRock.halfHeight=16;
			newRock.hitWidth=24;
			newRock.hitHeight=24;

		}else {
			newRock.scoreValue=smlRockScore;
			newRock.width=24;
			newRock.height=24;
			newRock.halfWidth=12;
			newRock.halfHeight=12;
			newRock.hitWidth=16;
			newRock.hitHeight=16;
		}

		newRock.scale=scale;
		newRock.x=x;
		newRock.y=y;
		newRock.dx=Math.random()*3;
		if (Math.random()<.5){
			newRock.dx*=-1;
		}
		newRock.dy=Math.random()*3;
		if (Math.random()<.5){
			newRock.dy*=-1;
		}
		if (Math.random()<.5){
				newRock.rotationInc=-1;
		}else{
			newRock.rotationInc=1;
		}

		newRock.animationDelay=Math.floor(Math.random()*3+1);
		newRock.animationCount=0;

		newRock.rotation=0;
		ConsoleLog.log("new rock scale"+(newRock.scale));
		rocks.push(newRock);
	}
}

function addToScore(value){
	score+=value;
}

document.onkeydown=function(e){

	e=e?e:window.event;
	//ConsoleLog.log(e.keyCode + "down");
	keyPressList[e.keyCode]=true;
}

document.onkeyup=function(e){
//document.body.onkeyup=function(e){
	e=e?e:window.event;
	//ConsoleLog.log(e.keyCode + "up");
	keyPressList[e.keyCode]=false;
};

//*** application start
switchGameState(GAME_STATE_INIT);
const FRAME_RATE=40;
frameRateCounter=new FrameRateCounter(FRAME_RATE);
//**** application loop

var intervalTime=1000/FRAME_RATE;
setInterval(runGame, intervalTime );
}

//***** object prototypes *****

//*** consoleLog util object
//creat constructor
function ConsoleLog(){

}

//create function that will be added to the class
console_log=function(message) {
	if(typeof(console) !== 'undefined' && console != null) {
		//console.log(message);
	}
}
//add class/static function to class by assignment
ConsoleLog.log=console_log;

//*** end console log object

//***  new FrameRateCounter   object prototype
function FrameRateCounter(fps) {

	if (fps == undefined){
		this.fps=40
	}else{
		this.fps=fps
	}



	this.lastFrameCount=0;
	var dateTemp =new Date();
	this.frameLast=dateTemp.getTime();
	delete dateTemp;
	this.frameCtr=0;

	this.lastTime=dateTemp.getTime();
	this.step=1;
}

FrameRateCounter.prototype.countFrames=function() {
	var dateTemp =new Date();

	var timeDifference=dateTemp.getTime()-this.lastTime;
	this.step=(timeDifference/1000)*this.fps;
	this.lastTime=dateTemp.getTime();
	console.log("dateTemp.getTime()=", dateTemp.getTime())
	console.log("this.lastTime=", this.lastTime)
	console.log("timeDifference=", timeDifference)
	console.log("timeDifference/1000=", timeDifference/1000)
	console.log("step=",this.step)

	this.frameCtr++;
	if (dateTemp.getTime() >=this.frameLast+1000) {
		ConsoleLog.log("frame event");
		this.lastFrameCount=this.frameCtr;
		this.frameCtr=0;
		this.frameLast=dateTemp.getTime();
	}

	delete dateTemp;
}
