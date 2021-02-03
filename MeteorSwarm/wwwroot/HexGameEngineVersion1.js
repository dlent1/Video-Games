// David Lent: 12-15-2020 Copyright (C) David Lent 2020// A hex game engine that uses javascript, modernizer and HTML5 canvas// Some parts adapted from https://github.com/rrreese/Hexagon.js/blob/master/hexagon.js// ------------- HexGrid classclass HexGrid {	constructor(context, radius, xOriginCoordinate, yOriginCoordinate) {		this.radius = radius;		this.height = Math.sqrt(3) * radius;		this.width = 2 * radius;		this.side = (3 / 2) * radius;		this.context = context;		this.xOriginCoordinate = xOriginCoordinate;        this.yOriginCoordinate = yOriginCoordinate;	}    drawHexGrid(rows, cols, originX, originY, showCoordinates) {        this.xOriginCoordinate = originX;        this.yOriginCoordinate = originY;        var xCoordinate;        var yCoordinate;        var coordinates = "";        var offsetColumn = false;        for (var col = 0; col < cols; col++) {            for (var row = 0; row < rows; row++) {                if (!offsetColumn) {                    xCoordinate = (col * this.side) + originX;                    yCoordinate = (row * this.height) + originY;                } else {                    xCoordinate = col * this.side + originX;                    yCoordinate = (row * this.height) + originY + (this.height * 0.5);                }                if (showCoordinates) {                    coordinates = col + "," + row;                }                // If you want a fillColor put it as "#ddd"                this.drawHex(xCoordinate, yCoordinate, false, coordinates);            }            offsetColumn = !offsetColumn;        }    }    drawHexAtColRow(column, row, color) {        var y = column % 2 == 0 ? (row * this.height) + this.yOriginCoordinate : (row * this.height) + this.yOriginCoordinate + (this.height / 2);        var x = (column * this.side) + this.xOriginCoordinate;        this.drawHex(x, y, color, "", false);    }    getLocationOfHex(x, y, centeringAdjustmentX, centeringAdjustmentY) {
        var row = x % 2 == 0 ? (y * this.height) + this.yOriginCoordinate : (y * this.height) + this.yOriginCoordinate + (this.height / 2);
        var column = (x * this.side) + this.xOriginCoordinate;

        // Adjust to properly center the counter
        row += (this.side / centeringAdjustmentY);
        column += (this.side / centeringAdjustmentX);

        return { row: row, column: column };
    }    drawHex(x, y, fillColor, coordinates) {        this.context.strokeStyle = "#000";        this.context.beginPath();        this.context.moveTo(x + this.width - this.side, y);        this.context.lineTo(x + this.side, y);        this.context.lineTo(x + this.width, y + (this.height / 2));        this.context.lineTo(x + this.side, y + this.height);        this.context.lineTo(x + this.width - this.side, y + this.height);        this.context.lineTo(x, y + (this.height / 2));        if (fillColor) {            this.context.fillStyle = fillColor;            this.context.fill();        }        this.context.closePath();        this.context.stroke();        if (coordinates) {            this.context.font = "10px serif";            this.context.fillStyle = "#000";            this.context.fillText(coordinates, x + (this.width / 2) - (this.width / 4), y + (this.height - 5));        }    };    // Dave Lent: Not sure if this is needed    //Recusivly step up to the body to calculate canvas offset.    getRelativeCanvasOffset() {        var x = 0, y = 0;        var layoutElement = this.canvas;        if (layoutElement.offsetParent) {            do {                x += layoutElement.offsetLeft;                y += layoutElement.offsetTop;            } while (layoutElement = layoutElement.offsetParent);            return { x: x, y: y };        }    }    //Uses a grid overlay algorithm to determine hexagon location    //Left edge of grid has a test to acuratly determine correct hex    getSelectedTile(mouseX, mouseY) {        var offSet = this.getRelativeCanvasOffset();        mouseX -= offSet.x;        mouseY -= offSet.y;        var column = Math.floor((mouseX) / this.side);        var row = Math.floor(            column % 2 == 0                ? Math.floor((mouseY) / this.height)                : Math.floor(((mouseY + (this.height * 0.5)) / this.height)) - 1);        //Test if on left side of frame                    if (mouseX > (column * this.side) && mouseX < (column * this.side) + this.width - this.side) {            //Now test which of the two triangles we are in             //Top left triangle points            var p1 = new Object();            p1.x = column * this.side;            p1.y = column % 2 == 0                ? row * this.height                : (row * this.height) + (this.height / 2);            var p2 = new Object();            p2.x = p1.x;            p2.y = p1.y + (this.height / 2);            var p3 = new Object();            p3.x = p1.x + this.width - this.side;            p3.y = p1.y;            var mousePoint = new Object();            mousePoint.x = mouseX;            mousePoint.y = mouseY;            if (this.isPointInTriangle(mousePoint, p1, p2, p3)) {                column--;                if (column % 2 != 0) {                    row--;                }            }            //Bottom left triangle points            var p4 = new Object();            p4 = p2;            var p5 = new Object();            p5.x = p4.x;            p5.y = p4.y + (this.height / 2);            var p6 = new Object();            p6.x = p5.x + (this.width - this.side);            p6.y = p5.y;            if (this.isPointInTriangle(mousePoint, p4, p5, p6)) {                column--;                if (column % 2 == 0) {                    row++;                }            }        }        return { row: row, column: column };    }
    getAdjacentHexList(x, y, rows, columns) {
        const adjacencyList = new Array();

        // Check above 
        if (y - 1 > 0)
            adjacencyList.push({ x: x, y: y - 1 });

        // check below
        if (y + 1 < rows)
            adjacencyList.push({ x: x, y: y + 1 });

        // Check if even column
        if (x % 2 == 0) {
            if (x - 1 > 0) {
                adjacencyList.push({ x: x - 1, y: y});
                if (y - 1 > 0)
                    adjacencyList.push({ x: x - 1, y: y - 1 });
            }
            if (x + 1 < columns) {
                adjacencyList.push({ x: x + 1, y: y });
                if (y - 1 > 0)
                adjacencyList.push({ x: x + 1, y: y - 1 });
            }          
        }
        else {
            if (x - 1 > 0) {
                adjacencyList.push({ x: x - 1, y: y });
                if (y + 1 > rows)
                    adjacencyList.push({ x: x - 1, y: y + 1 });
            }
            if (x + 1 < columns) {
                adjacencyList.push({ x: x + 1, y: y });
                if (y + 1 > rows)
                    adjacencyList.push({ x: x + 1, y: y + 1 });
            }            
        }

        return adjacencyList;
    }    sign (p1, p2, p3) {        return (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);    }    //TODO: Replace with optimized barycentric coordinate method    isPointInTriangle(pt, v1, v2, v3) {        var b1, b2, b3;        b1 = this.sign(pt, v1, v2) < 0.0;        b2 = this.sign(pt, v2, v3) < 0.0;        b3 = this.sign(pt, v3, v1) < 0.0;        return ((b1 == b2) && (b2 == b3));    }}// -------------------- End HexGrid classfunction supportedAudioFormat(audio) {	var returnExtension = "";	if (audio.canPlayType("audio/ogg") == "probably" || audio.canPlayType("audio/ogg") == "maybe") {		returnExtension = "ogg";	} else if (audio.canPlayType("audio/wav") == "probably" || audio.canPlayType("audio/wav") == "maybe") {		returnExtension = "wav";	} else if (audio.canPlayType("audio/mp3") == "probably" || audio.canPlayType("audio/mp3") == "maybe") {		returnExtension = "mp3";	}	return returnExtension;}function playSound(sound, volume, soundPool, MAX_SOUNDS, path) {
    var soundFound = false;
    var soundIndex = 0;
    var tempSound;

    if (soundPool.length > 0) {
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
        tempSound = soundPool[soundIndex].element;
        tempSound.volume = volume;
        tempSound.play();

    } else if (soundPool.length < MAX_SOUNDS) {
        tempSound = document.createElement("audio");
        tempSound.setAttribute("src", path + sound + "." + audioType);
        tempSound.volume = volume;
        tempSound.play();
        soundPool.push({ name: sound, element: tempSound, type: audioType, played: true });
    }
}// Check if browser supports canvasfunction canvasSupport() {	return Modernizr.canvas;}