

Entity = function(param){
    var self = {};
    self.id = Math.random();
    self.x = 0;
    self.y = 0;
    self.width = 0;
    self.heigth = 0;
    self.spdX = 0;
    self.spdY = 0;
    self.map = '';
    if(param){
        if(param.id){
            self.id = param.id;
        }
        if(param.x){
            self.x = param.x;
        }
        if(param.y){
            self.y = param.y;
        }
        if(param.spdX){
            self.spdX = param.spdX;
        }
        if(param.spdY){
            self.spdY = param.spdY;
        }
        if(param.map){
            self.map = param.map;
        }
    }
    self.update = function(){
        self.updatePosition();
    }
    self.updatePosition = function(){
        self.x += self.spdX;
        self.y += self.spdY;
    }
	self.getDistance = function(pt){
		return Math.sqrt(Math.pow(self.x-pt.x,2) + Math.pow(self.y-pt.y,2))
    }
    self.isColliding = function(pt){
        if(pt.x + pt.width / 2 > self.x && pt.x  - pt.width / 2 < self.x + self.width / 2 && pt.y + pt.height / 2 > self.y && pt.y - pt.height / 2 < self.y + self.height / 2){
            return true;
        }
        return false;
    }
    return self;
}

Entity.getFrameUpdateData = function(){
    var pack = {'river':{player:[],projectile:[]},'House':{player:[],projectile:[]}};
    for(var i in Player.list){
        if(Player.list[i]){
            Player.list[i].update();
        }
    }
    for(var i in Projectile.list){
        Projectile.list[i].update();
        if(Projectile.list[i].toRemove){
            delete Projectile.list[i];
        }
        else{
            pack[Projectile.list[i].map].projectile.push(Projectile.list[i].getInitPack());
        }
    }
    for(var i in Player.list){
        if(Player.list[i]){
            pack[Player.list[i].map].player.push(Player.list[i].getInitPack());
        }
    }
    return pack;
}

Player = function(param){
    var self = Entity(param);
    var socket = SOCKET_LIST[self.id];
    self.x = 0;
    self.y = 0;
    self.lastX = 0;
    self.lastY = 0;
    self.spdX = 0;
    self.spdY = 0;
    self.width = 32;
    self.height = 48;
    self.moveSpeed = 10;
    self.img = 'player';
    self.hp = 1000;
    self.hpMax = 1000;
    self.direction = 0;
    self.map = 'river';
    self.state = 'game';
    self.changeMap = true;
    self.animation = 0;
    self.mapHeight = 3200;
    self.mapWidth = 3200;
    self.username = param.username;
	self.keyPress = {
        up:false,
        down:false,
        left:false,
        right:false,
        attack:false,
        second:false,
        heal:false,
    };
    self.keyMap = {
        up:87,
        down:83,
        left:65,
        right:68,
        attack:'attack',
        second:'second',
        heal:'second',
    };
    self.attackReload = 25;
    self.secondReload = 250;
    var super_update = self.update;
    self.update = function(){
        self.updateSpd();
        super_update();
        self.updateAttack();
        self.updateCollisions();
        if(self.changeMap){
            self.changeMap = false;
            socket.emit('changeMap',[self.map,{
                player:Player.getMapInitPack(),
                projectile:Projectile.getMapInitPack(),
            }]);
        }
    }
    self.updateSpd = function(){
        self.spdX = 0;
        self.spdY = 0;
        self.lastX = self.x;
        self.lastY = self.y;
        if(self.keyPress.up){
            self.spdY -= self.moveSpeed;
        }
        if(self.keyPress.down){
            self.spdY += self.moveSpeed;
        }
        if(self.keyPress.left){
            self.spdX -= self.moveSpeed;
        }
        if(self.keyPress.right){
            self.spdX += self.moveSpeed;
        }
        if(self.keyPress.up === false && self.keyPress.down === false && self.keyPress.left === false && self.keyPress.right === false){
            self.animation = 0;
        }
        if(self.x < self.width / 2){
            self.x = self.width / 2;
        }
        if(self.x > self.mapWidth - self.width / 2){
            self.x = self.mapWidth - self.width / 2;
        }
        if(self.y < self.height / 2){
            self.y = self.height / 2;
        }
        if(self.y > self.mapHeight - self.height / 2){
            self.y = self.mapHeight - self.height / 2;
        }
    }
    self.updateAttack = function(){
        self.attackReload += 1;
        self.secondReload += 1;
        if(self.img === 'player'){
            if(self.keyPress.attack === true && self.attackReload > 25){
                self.shootProjectile();
                self.attackReload = 1;
            }
            if(self.keyPress.second === true && self.secondReload > 250){
                self.secondaryAttack();
                self.secondReload = 1;
            }
        }
        if(self.hp < 1){
            Player.spectate(socket);
        }
    }
    self.shootProjectile = function(){
		var projectile = Projectile({
			id:self.id,
			angle:self.direction,
			direction:self.direction,
			x:self.x + Math.cos(self.direction/180*Math.PI) * 20,
			y:self.y + Math.sin(self.direction/180*Math.PI) * 20,
			map:self.map,
		});
    }
    self.secondaryAttack = function(){
        for(var i = 0; i < 11; i++){
            var projectile = Projectile({
            id:self.id,
            angle:i * 36 + self.direction,
            direction:i * 36 + self.direction,
            x:self.x + Math.cos((i * 36 + self.direction)/180*Math.PI) * 40,
            y:self.y + Math.sin((i * 36 + self.direction)/180*Math.PI) * 40,
            map:self.map,
            });
        }
        
    }
    self.updateCollisions = function(){
        var firstTile = "" + self.map + ":" + Math.round((self.x - 64) / 64) * 64 + ":" + Math.round((self.y - 64) / 64) * 64 + ":";
        var secondTile = "" + self.map + ":" + Math.round((self.x - 64) / 64) * 64 + ":" + Math.round(self.y / 64) * 64 + ":";
        var thirdTile = "" + self.map + ":" + Math.round(self.x / 64) * 64 + ":" + Math.round((self.y - 64) / 64) * 64 + ":";
        var fourthTile = "" + self.map + ":" + Math.round(self.x / 64) * 64 + ":" + Math.round(self.y / 64) * 64 + ":";
        if(Collision.list[firstTile]){
            self.doCollision(Collision.list[firstTile]);
        }
        if(Collision.list[secondTile]){
            self.doCollision(Collision.list[secondTile]);
        }
        if(Collision.list[thirdTile]){
            self.doCollision(Collision.list[thirdTile]);
        }
        if(Collision.list[fourthTile]){
            self.doCollision(Collision.list[fourthTile]);
        }
        if(Transporter.list[firstTile]){
            if(self.isColliding(Transporter.list[firstTile])){
                self.map = Transporter.list[firstTile].teleport;
                self.x = Transporter.list[firstTile].teleportx;
                self.y = Transporter.list[firstTile].teleporty;
                socket.emit('changeMap',self.map);
            }
        }
        if(Transporter.list[secondTile]){
            if(self.isColliding(Transporter.list[secondTile])){
                self.map = Transporter.list[secondTile].teleport;
                self.x = Transporter.list[secondTile].teleportx;
                self.y = Transporter.list[secondTile].teleporty;
                socket.emit('changeMap',self.map);
            }
        }
        if(Transporter.list[thirdTile]){
            if(self.isColliding(Transporter.list[thirdTile])){
                self.map = Transporter.list[thirdTile].teleport;
                self.x = Transporter.list[thirdTile].teleportx;
                self.y = Transporter.list[thirdTile].teleporty;
                socket.emit('changeMap',self.map);
            }
        }
        if(Transporter.list[fourthTile]){
            if(self.isColliding(Transporter.list[fourthTile])){
                self.map = Transporter.list[fourthTile].teleport;
                self.x = Transporter.list[fourthTile].teleportx;
                self.y = Transporter.list[fourthTile].teleporty;
                socket.emit('changeMap',self.map);
            }
        }
    }
    self.doCollision = function(collsiion){
        if(self.isColliding(collsiion)){
            if(self.spdX !== 0 && self.spdY !== 0){
                var x = self.x;
                self.x = self.lastX;
                if(self.isColliding(collsiion)){
                    self.x = x;
                    self.y = self.lastY;
                    if(self.isColliding(collsiion)){
                        self.x = self.lastX;
                        self.y = self.lastY;
                    }
                    else{

                    }
                }
                else{

                }
            }
            else if(self.spdX === 0 && self.spdY === 0){

            }
            else{
                self.x = self.lastX;
                self.y = self.lastY;
            }
        }
    }
    self.getInitPack = function(){
        return{
            id:self.id,
            x:self.x,
            y:self.y,
            spdX:self.spdX,
            spdY:self.spdY,
            hp:self.hp,
            hpMax:self.hpMax,
            map:self.map,
            username:self.username,
            img:self.img,
            attackReload:self.attackReload,
            secondReload:self.secondReload,
        }
    }
    self.getUpdatePack = function(){
        return{
            id:self.id,
            x:self.x,
            y:self.y,
            img:self.img,
            hp:self.hp,
            map:self.map,
            attackReload:self.attackReload,
            secondReload:self.secondReload,
            mapWidth:self.mapWidth,
            mapHeight:self.mapHeight,
        }
    }
    Player.list[self.id] = self;
    return self;
}

Player.list = {};

Player.onConnect = function(socket,username){
    var player = Player({
		id:socket.id,
        username:username,
	});


    socket.emit('selfId',socket.id);

	socket.on('keyPress',function(data){
		if(data.inputId === player.keyMap.left){
			player.keyPress.left = data.state;
		}
		if(data.inputId === player.keyMap.right){
			player.keyPress.right = data.state;
		}
		if(data.inputId === player.keyMap.up){
			player.keyPress.up = data.state;
		}
		if(data.inputId === player.keyMap.down){
			player.keyPress.down = data.state;
		}
		if(data.inputId === player.keyMap.attack){
			player.keyPress.attack = data.state;
		}
		if(data.inputId === player.keyMap.second){
			player.keyPress.second = data.state;
		}
		if(data.inputId === player.keyMap.heal){
			player.keyPress.heal = data.state;
		}
		if(data.inputId === 'direction'){
			player.direction = (Math.atan2(data.state.y,data.state.x) / Math.PI * 180);
		}
    });

    socket.on('respawn',function(data){
        player.hp = 1000;
        player.img = 'player';
    });

    socket.emit('init',{
		player:Player.getMapInitPack(),
		projectile:Projectile.getMapInitPack(),
    });
    
}

Player.spectate = function(socket){
    for(var i in Projectile.list){
        if(socket && Projectile.list[i].parent === socket.id){
            delete Projectile.list[i];
        }
    }
    if(!socket){
        return;
    }
	socket.emit("spectator");
    if(Player.list[socket.id]){
        Player.list[socket.id].img = 'none';
    }
}
Player.onDisconnect = function(socket){
    for(var i in Projectile.list){
        if(socket && Projectile.list[i].parent === socket.id){
            delete Projectile.list[i];
        }
    }
    if(!socket){
        return;
    }
	socket.emit("disconnected");
    if(Player.list[socket.id]){
        delete Player.list[socket.id];
    }
}

Player.getAllInitPack = function(){
	var players = [];
	for(var i in Player.list)
		players.push(Player.list[i].getInitPack())
	return players;
}
Player.getMapInitPack = function(map){
	var players = [];
	for(var i in Player.list){
        if(Player.list[i].map === map){
            players.push(Player.list[i].getInitPack());
        }
    }
	return players;
}

Projectile = function(param){
	var self = Entity(param);
	self.id = Math.random();
	self.parent = param.id;
	self.spdX = Math.cos(param.angle/180 * Math.PI) * 20;
    self.spdY = Math.sin(param.angle/180 * Math.PI) * 20;
    self.width = 48;
    self.height = 48;
	self.direction = param.direction;
	self.timer = 0;
	self.toRemove = false;
	var super_update = self.update;
	self.update = function(){
        super_update();
        self.timer += 1;
        if(self.timer > 30){
            self.toRemove = true;
        }
        self.updateCollisions();
    }
    self.updateCollisions = function(){
        var firstTile = "" + self.map + ":" + Math.round((self.x - 64) / 64) * 64 + ":" + Math.round((self.y - 64) / 64) * 64 + ":";
        var secondTile = "" + self.map + ":" + Math.round((self.x - 64) / 64) * 64 + ":" + Math.round(self.y / 64) * 64 + ":";
        var thirdTile = "" + self.map + ":" + Math.round(self.x / 64) * 64 + ":" + Math.round((self.y - 64) / 64) * 64 + ":";
        var fourthTile = "" + self.map + ":" + Math.round(self.x / 64) * 64 + ":" + Math.round(self.y / 64) * 64 + ":";
        if(Collision.list[firstTile]){
            if(self.isColliding(firstTile)){
                self.toRemove = true;
            }
        }
        if(Collision.list[secondTile]){
            if(self.isColliding(secondTile)){
                self.toRemove = true;
            }
        }
        if(Collision.list[thirdTile]){
            if(self.isColliding(thirdTile)){
                self.toRemove = true;
            }
        }
        if(Collision.list[fourthTile]){
            if(self.isColliding(fourthTile)){
                self.toRemove = true;
            }
        }
    }
	self.getInitPack = function(){
		return {
			x:self.x,
			y:self.y,
			id:self.id,
			direction:self.direction,
			map:self.map,
			parent:self.parent,
		}
	}
	self.getUpdatePack = function(){
		return {
			x:self.x,
			y:self.y,
			id:self.id,
			direction:self.direction,
		}
	}
	Projectile.list[self.id] = self;
	return self;
}
Projectile.list = {};

Projectile.getAllInitPack = function(){
	var projectiles = [];
	for(var i in Projectile.list)
        projectiles.push(Projectile.list[i].getInitPack())
	return projectiles;
}

Projectile.getMapInitPack = function(map){
	var projectiles = [];
	for(var i in Projectile.list){
        if(Projectile.list[i].map === map){
            projectiles.push(Projectile.list[i].getInitPack());
        }
    }
	return projectiles;
}

var fs = require('fs');

var data;
var tileset;
var layers;
var map;
var renderLayer = function(layer){
    console.log(layer.name);
    if(layer.type !== "tilelayer" || layer.opacity){
        return;
    }
    size = data.tilewidth;
    if(layers.length < data.layers.length || 1){
        layer.data.forEach(function(tile_idx, i){
            if(!tile_idx){
                return;
            }
            tile = data.tilesets[0];
            if(tile_idx === 1690){
                var collision = new Collision({
                    x:(i % layer.width) * size,
                    y:~~(i / layer.width) * size,
                    size:size,
                    map:map,
                });
			}
            if(tile_idx === 1622){
				var teleport = "";
				var teleportj = 0;
				var x = "";
				var xj = 0;
                var y = "";
				for(var j = 0;j < layer.name.length;j++){
					if(layer.name[j] === ':'){
						if(teleport === ""){
							teleport = layer.name.substr(0,j);
							teleportj = j;
						}
						else if(x === ""){
							x = layer.name.substr(teleportj + 1,j - teleportj - 1);
							xj = j;
						}
						else if(y === ""){
							y = layer.name.substr(xj + 1,j - xj - 1);
						}
					}
				}
                var transporter = new Transporter({
                    x:(i % layer.width) * size,
                    y:~~(i / layer.width) * size,
					size:size,
					teleport:teleport,
					teleportx:x,
                    teleporty:y,
                    map:map,
                });
			}
        });
    }
}
var renderLayers = function(){
    if(Array.isArray(layers) === false){
        layers = data.layers;
    }
    layers.forEach(renderLayer);
}
var loadTileset = function(json){
    data = json;
    layers = undefined;
    tileset = json.tilesets[0].image;
    tileset.onload = renderLayers();
}
var load = function(name){
    map = name;
	//var rawdata = fs.readFileSync("/client/maps/" + name + ".json");
    //loadTileset(JSON.parse(rawdata));
    loadTileset(require("~/client/maps/" + name + ".json"));
}
load("river");
load("House");


updateCrashes = function(){
    for(var i in Player.list){
        for(var j in Projectile.list){
            if(Player.list[i] && Projectile.list[j]){
                if(Player.list[i].getDistance(Projectile.list[j]) < 30 && Projectile.list[j].parent != i && Player.list[i].img == 'player'){
                    Projectile.list[j].toRemove = true;
                    Player.list[i].hp -= 100;
                }
            }
        }
    }
}