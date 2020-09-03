
var express = require('express');
var app = express();
var serv = require('http').Server(app);
require('./Database');
require('./Entity');

app.get('/',function(req, res) {
	res.sendFile(__dirname + '/client/index.html');
});
app.use('/client',express.static(__dirname + '/client'));

serv.listen(process.env.PORT);
//serv.listen(3000);
console.log('Server Started.');
SOCKET_LIST = {};

io = require('socket.io')(serv,{});
io.sockets.on('connection', function(socket){
	socket.id = Math.random();
	SOCKET_LIST[socket.id] = socket;
	socket.on('signIn',function(data){
		Database.isValidPassword(data,function(res){
			if(res === 2){
				Player.onConnect(socket,data.username);
			}
			if(res === 1){
				for(var i in Player.list){
					if(Player.list[i].username === data.username){
						SOCKET_LIST[i].emit('eventChange','disconnected');
						Player.onDisconnect(SOCKET_LIST[i]);
						delete SOCKET_LIST[i];
					}
				}
				Player.onConnect(socket,data.username);
			}
			socket.emit('signInResponse',{success:res});
		});
	});
	socket.on('createAccount',function(data){
		Database.isUsernameTaken(data,function(res){
			if(res){
				socket.emit('createAccountResponse',{success:false});
			}
			else{
				Database.addUser(data,function(){
					socket.emit('createAccountResponse',{success:true});
				});
			}
		});
	});
	socket.on('deleteAccount',function(data){
		Database.isUsernameTaken(data,function(res){
			if(res){
				Database.removeUser(data,function(){
					socket.emit('deleteAccountResponse',{success:true});
				});
			}
			else{
				socket.emit('deleteAccountResponse',{success:false});
			}
		});
	});
	socket.on('disconnect',function(){
		socket.emit('eventChange','disconnected');
		Player.onDisconnect(socket);
		delete SOCKET_LIST[socket.id];
	});
});
pack = {};

setInterval(function(){
	updateCrashes();
	var packs = Entity.getFrameUpdateData();
	for(var i in SOCKET_LIST){
		var socket = SOCKET_LIST[i];
		if(Player.list[socket.id]){
			socket.emit('init',packs.initPack[Player.list[socket.id].map]);
			socket.emit('update',packs.updatePack[Player.list[socket.id].map]);
			socket.emit('remove',packs.removePack[Player.list[socket.id].map]);
		}
	}
},1000/25);
