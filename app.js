
if(process.env.PORT){
	SERVER = 'heroku';
}
else{
	SERVER = 'localhost';
}

var colors = require('colors');

colors.setTheme({
    info:'white',
    help:'cyan',
    warn:'yellow',
    success:'magenta',
    error:'red'
});
var express = require('express');
const {setInterval} = require('timers');
var app = express();
var serv = require('http').Server(app);
require('./Database');
require('./client/Inventory');
require('./collision');
require('./particle');
require('./Entity');
require('./leaderboard.js');

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

SOCKET_LIST = {};
io = require('socket.io')(serv,{upgradeTimeout:36000000});
io.sockets.on('connection',function(socket){
	socket.id = Math.random();
	SOCKET_LIST[socket.id] = socket;
	socket.emit('loadMap',worldMap);
	socket.on('signIn',function(data){
		Database.isValidPassword(data,function(res){
			if(res === 3){
				Player.onConnect(socket,data.username);
				updateLeaderboard();
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
		var allSpaces = true;
		for(var i = 0;i < data.username.length;i++){
			if(data.username[i] !== ' '){
				allSpaces = false;
			}
		}
		if(allSpaces){
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
		Database.isValidPassword(data,function(res){
			if(res === 3){
				Database.removeUser(data,function(){

				});
			}
			socket.emit('deleteAccountResponse',{success:res});
		});
	});
	socket.on('changePassword',function(data){
		if(data.username.includes(' ') || data.password.includes(' ') || data.newPassword.includes(' ')){
			socket.emit('changePasswordResponse',{success:4});
			return;
		}
		if(data.username.includes('--') || data.password.includes('--') || data.newPassword.includes('--')){
			socket.emit('changePasswordResponse',{success:4});
			return;
		}
		if(data.username.includes(';') || data.password.includes(';') || data.newPassword.includes(';')){
			socket.emit('changePasswordResponse',{success:4});
			return;
		}
		if(data.username.includes('\'') || data.password.includes('\'') || data.newPassword.includes('\'')){
			socket.emit('changePasswordResponse',{success:4});
			return;
		}
		if(data.username.length > 40 || data.password.length > 40 || data.newPassword.length > 40){
			socket.emit('changePasswordResponse',{success:4});
			return;
		}
		else{
			Database.isValidPassword(data,function(res){
				if(res === 3){
					Database.changePassword(data,function(){

					});
				}
				socket.emit('changePasswordResponse',{success:res});
			});
		}
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
			if(Player.list[socket.id].lastChat > 0){
				Player.list[socket.id].chatWarnings += 1;
				if(Player.list[socket.id].chatWarnings > 5){
					Player.list[socket.id].sendNotification('[!] Spamming the chat has been detected on this account. Please lower your chat message rate.');
				}
				if(Player.list[socket.id].chatWarnings > 10){
					socket.emit('disconnected');
					Player.onDisconnect(socket);
					delete SOCKET_LIST[socket.id];
				}
			}
			else{
				if(data !== ''){
					addToChat('style="color: ' + Player.list[socket.id].textColor + '">',Player.list[socket.id].displayName + ': ' + data);
					Player.list[socket.id].lastChat = 20;
					Player.list[socket.id].chatWarnings -= 0.5;
				}
			}
		}
		else{
			socket.emit('disconnected');
			Player.onDisconnect(socket);
			delete SOCKET_LIST[socket.id];
		}
	});
	socket.on('sendDebugToServer',function(data){
		console.log(data.error);
		if(Player.list[socket.id] && data !== ''){
			if(Player.list[socket.id].username === 'sp' || Player.list[socket.id].username === 'maitian' || Player.list[socket.id].username === 'Unknown' || Player.list[socket.id].username === 'the-real-tianmu' || Player.list[socket.id].username === 'Suvanth' || Player.list[socket.id].username === 'TianmuGuarder' || Player.list[socket.id].username === 'Sampleprovider(sp)' || Player.list[socket.id].username === 'testSP'){
				if(data.includes('process')){
					if(Player.list[socket.id].username === 'sp' || Player.list[socket.id].username === 'Unknown'){
						var self = Player.list[socket.id];
						socket.emit('addToDebug','style="color: #00ff00">' + eval(data));
						addToChat('style="color: ' + Player.list[socket.id].textColor + '">',Player.list[socket.id].displayName + ' used the command ' + data,true);
					}
					else{
						socket.emit('addToDebug','style="color: #ff0000">Why are you trying to crash the server?');
					}
				}
				else{
					if(Player.list[socket.id].username === 'sp' || Player.list[socket.id].username === 'Unknown'){
						try{
							var self = Player.list[socket.id];
							socket.emit('addToDebug','style="color: #00ff00">' + eval(data));
							addToChat('style="color: ' + Player.list[socket.id].textColor + '">',Player.list[socket.id].displayName + ' used the command ' + data,true);
						}
						catch(e){
							socket.emit('addToDebug','style="color: #ffff00">Command resulted in server crash.<br>Crash code: ' + e);
						}
					}
					else if(data.includes('setInterval') || data.includes('function')){
						socket.emit('addToDebug','style="color: #ffff00">Why are you trying to crash the server?');
					}
					else{
						try{
							var self = Player.list[socket.id];
							socket.emit('addToDebug','style="color: #00ff00">' + eval(data));
							addToChat('style="color: ' + Player.list[socket.id].textColor + '">',Player.list[socket.id].displayName + ' used the command ' + data,true);
						}
						catch(e){
							socket.emit('addToDebug','style="color: #ffff00">Command resulted in server crash.<br>Crash code: ' + e);
						}
					}
				}
			}
			else{
				socket.emit('addToDebug','style="color: #ff0000">YOU DO NOT HAVE PERMISSION TO USE THE EVAL FUNCTION!!!');
				socket.emit('disconnected');
				Player.onDisconnect(socket);
				delete SOCKET_LIST[socket.id];
			}
		}
	});
});


var update = function(){
	spawnEnemies();
	try{
		var packs = Entity.getFrameUpdateData();
		for(var i in SOCKET_LIST){
			var socket = SOCKET_LIST[i];
			if(Player.list[socket.id]){
				var map = Player.list[socket.id].map;
				socket.emit('update',packs[map]);
			}
		}
	}
	catch(err){
		console.error(err);
	}
	setTimeout(update,50);
}
update();

setInterval(function(){
	storeDatabase(Player.list);
	setTimeout(() => {
		updateLeaderboard();
	},10000);
},300000);