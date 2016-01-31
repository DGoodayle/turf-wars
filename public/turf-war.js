var game = new Phaser.Game(800, 800, Phaser.CANVAS, 'turf-war', { create: create });
var socket = io();
var spriteWidth = 50;
var spriteHeight = 50;

var data;
var canvas;
var canvasBG;
var pmap = [0,1,2,3,4,5,6,7,8,9,'A','B','C','D','E','F'];
var canvasZoom = 16;

var color = 0;
var palette = 0;
socket.on('data_updated', function(msg){       
        data = msg.dataPacket;
         $("#totalClicks").addClass("blink");
         $("#yourClicks").addClass("blink");
         if($("#greenWins").text() != msg.gWins){
            $("#greenWins").addClass("blink");
        }
         if($("#redWins").text() != msg.rWins){
             $("#redWins").addClass("blink");
         }
          setTimeout(function () {
          $("#totalClicks").removeClass("blink");
          $("#yourClicks").removeClass("blink");
          $("#greenWins").removeClass("blink");
          $("#redWins").removeClass("blink");
              }, 500);
        $("#totalClicks").text(msg.total);
        $("#yourClicks").text(msg.pClicks)
        $("#greenWins").text(msg.gWins);
        $("#redWins").text(msg.rWins);
        refresh();
      });
 socket.on('user_count', function(msg){
        if(msg.number > 1){
          $("#plural").show();
        } else {
          $("#plural").hide();
        }
        $("#usercounter").text(msg.number);
         $("#usercounter").addClass("blink");
          setTimeout(function () {
          $("#usercounter").removeClass("blink");
              }, 500);
      });
function create() {
    createDrawingArea();
    setColor(3);

    game.input.mouse.capture = true;
    game.input.onDown.add(onDown, this);
}

function createDrawingArea() {
 
    game.create.grid('drawingGrid', spriteWidth*canvasZoom, spriteHeight*canvasZoom, canvasZoom, canvasZoom, 'rgba(0,191,243,0.2)');
    canvasBG = game.make.bitmapData((spriteWidth * canvasZoom)-1, (spriteHeight * canvasZoom)-1);


    var x = 0;
    var y = 0;

    canvasBG.addToWorld(x, y);
    canvasGrid = game.add.sprite(x - 1, y - 1, 'drawingGrid');
    canvasGrid.crop(new Phaser.Rectangle(0, 0, spriteWidth * canvasZoom, spriteHeight * canvasZoom));

}
function onDown(pointer) { 
    isDown = true;
    if (pointer.rightButton.isDown)
    {
        isErase = true;
    }
    else
    {
        isErase = false;
    }
    paint(pointer);
}

function refresh() {


    for (var y = 0; y < spriteHeight; y++)
    {
        for (var x = 0; x < spriteWidth; x++)
        {
            var i = data[y][x];

            if (i !== '.' && i !== ' ')
            {
                color = game.create.palettes[0][i];
                canvasBG.rect(x * canvasZoom, y * canvasZoom, canvasZoom, canvasZoom, color);
            }
        }
    }

}
function setColor(i, p) {

    if (i < 0)
    {
        i = 15;
    }
    else if (i >= 16)
    {
        i = 0;
    }

    colorIndex = i;
    color = game.create.palettes[0][pmap[colorIndex]];


}

function paint(pointer) {

    //  Get the grid loc from the pointer
    var x = game.math.snapToFloor(pointer.x, canvasZoom) / canvasZoom;
    var y = game.math.snapToFloor(pointer.y, canvasZoom) / canvasZoom;

    if (x < 0 || x >= spriteWidth || y < 0 || y >= spriteHeight)
    {
        return;
    }


    if (!isDown)
    {
        return;
    }
    socket.emit("paint", {posX:x,posY:y});
}

