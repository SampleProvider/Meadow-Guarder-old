
SERVER = 'heroku';

var express = require('express');
var app = express();
var serv = require('http').Server(app);
require('./Database');
require('./client/Inventory');
require('./collision');
require('./Entity');

app.get('/',function(req,res){
	res.sendFile(__dirname + '/client/index.html');
});
app.use('/client',express.static(__dirname + '/client'));
if(SERVER === 'localhost'){
	var port = serv.listen(3000);
}
else{
	var port = serv.listen(process.env.PORT);
}

console.log('Server Started on port ' + port.address().port);
require('./command');

SOCKET_LIST = {};
io = require('socket.io')(serv,{upgradeTimeout:50000});
io.sockets.on('connection',function(socket){
	socket.id = Math.random();
	SOCKET_LIST[socket.id] = socket;
	socket.on('signIn',function(data){
		Database.isValidPassword(data,function(res){
			if(res === 3){
				Player.onConnect(socket,data.username);
				storeDatabase();
			}
			if(res === 2){
				for(var i in Player.list){
					if(Player.list[i].username === data.username){
						if(SOCKET_LIST[i]){
							SOCKET_LIST[i].emit('disconnected');
							Player.onDisconnect(SOCKET_LIST[i]);
							delete SOCKET_LIST[i];
						}
					}
				}
			}
			socket.emit('signInResponse',{success:res,username:data.username});
		});
	});
	socket.on('createAccount',function(data){
		if(data.username.includes(' ')){
			socket.emit('createAccountResponse',{success:3});
		}
		else if(data.username.length > 3){
			Database.isUsernameTaken(data,function(res){
				if(res === 0){
					socket.emit('createAccountResponse',{success:0});
				}
				else{
					Database.addUser(data,function(){
						socket.emit('createAccountResponse',{success:1});
					});
				}
			});
		}
		else{
			socket.emit('createAccountResponse',{success:2});
		}
	});
	socket.on('deleteAccount',function(data){
		Database.isUsernameTaken(data,function(res){
			if(res){
				Database.removeUser(data,function(){
					socket.emit('deleteAccountResponse',{success:1});
				});
			}
			else{
				socket.emit('deleteAccountResponse',{success:2});
			}
		});
	});
	socket.on('disconnect',function(){
		socket.emit('disconnected');
		Player.onDisconnect(socket);
		delete SOCKET_LIST[socket.id];
	});
	socket.on('timeout',function(){
		socket.emit('disconnected');
		Player.onDisconnect(socket);
		delete SOCKET_LIST[socket.id];
	});
	socket.on('sendMsgToServer',function(data){
		if(Player.list[socket.id]){
			console.error(Player.list[socket.id].username + ': ' + data);
			for(var i in SOCKET_LIST){
				SOCKET_LIST[i].emit('addToChat','style="color: ' + Player.list[socket.id].textColor + '">' + Player.list[socket.id].username + ': ' + data);
			}
		}
		else{

		}
	});
	socket.on('sendDebugToServer',function(data){
		if(Player.list[socket.id]){
			if(Player.list[socket.id].username === 'sp' || Player.list[socket.id].username === 'the-real-tianmu' || Player.list[socket.id].username === 'Suvanth'){
				if(data === 'process.exit(0);' || data === 'process.exit(0)'){
					if(Player.list[socket.id].username === 'sp'){
						socket.emit('addToDebug','style="color: #00ff00">' + eval(data));
					}
					else{
						socket.emit('addToDebug','style="color: #ff0000">' + 'YOU DO NOT HAVE PERMISSION TO USE THE EXIT FUNCTION!!!');
					}
				}
				else{
					try{
						socket.emit('addToDebug','style="color: #00ff00">' + eval(data));
					}
					catch(e){
						socket.emit('addToDebug','style="color: #ffff00">' + 'Command resulted in server crash.');
					}
				}
			}
			else{
				socket.emit('addToDebug','style="color: #ff0000">' + 'YOU DO NOT HAVE PERMISSION TO USE THE EVAL FUNCTION!!!');
			}
		}
		else{

		}
	});
});

setInterval(function(){
	spawnEnemies();
	updateCrashes();
	var packs = Entity.getFrameUpdateData();
	for(var i in SOCKET_LIST){
		var socket = SOCKET_LIST[i];
		if(Player.list[socket.id]){
			var map = Player.list[socket.id].map;
			socket.emit('update',packs[map]);
		}
	}
},1000/20);
