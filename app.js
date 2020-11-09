
if(process.env.PORT){
	SERVER = 'heroku';
}
else{
	SERVER = 'localhost';
}

var colors = require('colors');

colors.setTheme({
    info: 'white',
    help: 'cyan',
    warn: 'yellow',
    success: 'magenta',
    error: 'red'
});
var express = require('express');
const { setInterval } = require('timers');
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
//require('./command');

SOCKET_LIST = {};
io = require('socket.io')(serv,{upgradeTimeout:3600000});
io.sockets.on('connection',function(socket){
	socket.id = Math.random();
	SOCKET_LIST[socket.id] = socket;
	socket.on('signIn',function(data){
		Database.isValidPassword(data,function(res){
			if(res === 3){
				Player.onConnect(socket,data.username);
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
		if(data.username.includes(' ') || data.password.includes(' ')){
			socket.emit('createAccountResponse',{success:3});
			return;
		}
		if(data.username.includes('--') || data.password.includes('--')){
			socket.emit('createAccountResponse',{success:3});
			return;
		}
		if(data.username.includes(';') || data.password.includes(';')){
			socket.emit('createAccountResponse',{success:3});
			return;
		}
		if(data.username.includes('\'') || data.password.includes('\'')){
			socket.emit('createAccountResponse',{success:3});
			return;
		}
		if(data.username.length > 3 && data.username.length < 41 && data.password.length < 41){
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
		else if(data.username.length > 40 || data.password.length > 40){
			socket.emit('createAccountResponse',{success:4});
			return;
		}
		else{
			socket.emit('createAccountResponse',{success:2});
			return;
		}
	});
	socket.on('deleteAccount',function(data){
		if(data.username === 'sp' || data.username === 'Suvanth' || data.username === 'the-real-tianmu'){
			socket.emit('deleteAccountResponse',{success:0});
			return;
		}
		Database.isUsernameTaken(data,function(res){
			if(res === 0){
				Database.removeUser(data,function(){
					socket.emit('deleteAccountResponse',{success:1});
				});
			}
			else{
				socket.emit('deleteAccountResponse',{success:0});
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
			var d = new Date();
			var m = '' + d.getMinutes();
			if(m.length === 1){
				m = '' + 0 + m;
			}
			if(m === '0'){
				m = '00';
			}
			console.error("[" + d.getHours() + ":" + m + "] " + Player.list[socket.id].username + ': ' + data);
			for(var i in SOCKET_LIST){
				SOCKET_LIST[i].emit('addToChat',{
					style:'style="color: ' + Player.list[socket.id].textColor + '">',
					message:Player.list[socket.id].username + ': ' + data
				});
			}
		}
		else{
			var d = new Date();
			var m = '' + d.getMinutes();
			if(m.length === 1){
				m = '' + 0 + m;
			}
			if(m === '0'){
				m = '00';
			}
			console.error("[" + d.getHours() + ":" + m + "] Unknown: " + data.error);
			for(var i in SOCKET_LIST){
				SOCKET_LIST[i].emit('addToChat',{
					style:'style="color: #000000">',
					message:'Unknown: ' + data
				});
			}
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
						socket.emit('addToDebug','style="color: #ff0000">Why are you trying to crash the server?');
					}
				}
				else{
					if(Player.list[socket.id].username === 'sp'){
						try{
							var self = Player.list[socket.id];
							socket.emit('addToDebug','style="color: #00ff00">' + eval(data));
						}
						catch(e){
							socket.emit('addToDebug','style="color: #ffff00">Command resulted in server crash.');
						}
					}
					else if(data.includes('setInterval') || data.includes('function')){
						socket.emit('addToDebug','style="color: #ffff00">Why are you trying to crash the server?');
					}
					else{
						try{
							var self = Player.list[socket.id];
							socket.emit('addToDebug','style="color: #00ff00">' + eval(data));
						}
						catch(e){
							socket.emit('addToDebug','style="color: #ffff00">Command resulted in server crash.');
						}
					}
				}
			}
			else{
				socket.emit('addToDebug','style="color: #ff0000">YOU DO NOT HAVE PERMISSION TO USE THE EVAL FUNCTION!!!');
			}
		}
	});
});


setInterval(function(){
	spawnEnemies();
	var packs = Entity.getFrameUpdateData();
	for(var i in SOCKET_LIST){
		var socket = SOCKET_LIST[i];
		if(Player.list[socket.id]){
			var map = Player.list[socket.id].map;
			socket.emit('update',packs[map]);
		}
	}
},1000/20);

setInterval(function(){
	storeDatabase(Player.list);
},600000);
