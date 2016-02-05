var express = require('express');
var app = express();

var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000

var spriteWidth = 50;
var spriteHeight = 50;
var data = null;
var pmap = [0,1,2,3,4,5,6,7,8,9,'A','B','C','D','E','F'];
var nextTeamID = 3;

var greenWins = 0;
var redWins = 0;
var totalClicks = 0;

var count = 0;

function resetData() {
    data = [];
    for (var y = 0; y < spriteHeight; y++)
    {
        var a = [];
        for (var x = 0; x < spriteWidth; x++)
        {
            a.push(0);
        }
        data.push(a);
    }
    io.sockets.emit('data_updated', {
    	dataPacket : data
			    });
}
function canPlace(x,y,teamID) {
	if((x-1) < 0){
		return true;
	}
	if((y-1) < 0){
		return true;
	}
	if((x+1) >= spriteWidth){
		return true;
	}
	if((y+1) >= spriteHeight){
		return true;
	}
	north = data[y+1][x];
	south = data[y-1][x];
	east = data[y][x+1];
	west = data[y][x-1];

	//If one of the adjacent nodes is either occupied by your team or is the edge, you can place. Else, you can't.
	return north == teamID || south == teamID || east == teamID || west == teamID;
}
function checkWin(){
	g = 0;
	r = 0;
	for (var y = 0; y < spriteHeight; y++)
    {
        for (var x = 0; x < spriteWidth; x++)
        {
        	if(data[y][x] == 0)
        		return;
        	if(data[y][x] == pmap[11]){
        		r++;
        	}
        	if(data[y][x] == pmap[3]){
        		g++;
        	}
        }
    }
    if(g>r){
    	greenWins++;
    } else if(r>g){
    	redWins++;
    }
    resetData();
}
app.use(express.static(__dirname + '/public'));

io.sockets.on('connection', function (socket) {
var canClick = true;
	count++;
	 io.sockets.emit('user_count', {
	        number: count
	    });
	 socket.emit('data_updated', {
	    		dataPacket : data,
	    		total:totalClicks,
	    		gWins:greenWins,
	    		rWins:redWins
			});
	var teamID = nextTeamID;
	if(nextTeamID == 11){
		nextTeamID=3;
	} else if(nextTeamID == 3){
		nextTeamID = 11;
	}
	if(data == null){
		resetData();
	}
	 socket.on('disconnect', function () {
	        count--;
	        io.sockets.emit('user_count', {
	            number: count
	        });
	    });
	socket.on('paint', function(msg){	
	 if(canClick){
        canClick = false;
         setTimeout(function () {
            canClick= true;
          }, 200);	
		if(canPlace(msg.posX,msg.posY,pmap[teamID])){
			if( data[msg.posY][msg.posX] == 0){
            	data[msg.posY][msg.posX] = pmap[teamID];
			} else if( data[msg.posY][msg.posX] != pmap[teamID]){
            	data[msg.posY][msg.posX] = 0;
			} 
			totalClicks++;
			checkWin();
    		io.sockets.emit('data_updated', {
	    		dataPacket : data,
	    		total:totalClicks,
	    		gWins:greenWins,
	    		rWins:redWins
			});
    	}
    }
	});
});
http.listen(port, function(){
  console.log('listening on *:'+port);
});