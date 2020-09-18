
var playerMap = {
    'Village':0,
};

Maps = {};


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
        if(param.width){
            self.width = param.width;
        }
        if(param.height){
            self.height = param.height;
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
        if(pt.x + pt.width / 2 > self.x - self.width / 2 && pt.x - pt.width / 2 < self.x + self.width / 2 && pt.y + pt.height / 2 > self.y - self.height / 2 && pt.y - pt.height / 2 < self.y + self.height / 2){
            return true;
        }
        return false;
    }
    return self;
}

Entity.getFrameUpdateData = function(){
    var pack = {'Village':{player:[],projectile:[],pet:[]},'Starter House':{player:[],projectile:[],pet:[]},'Cave':{player:[],projectile:[],pet:[]}};
    for(var i in Player.list){
        if(Player.list[i]){
            Player.list[i].update();
            pack[Player.list[i].map].player.push(Player.list[i].getInitPack());
        }
    }
    for(var i in Pet.list){
        if(Pet.list[i]){
            Pet.list[i].update();
            pack[Pet.list[i].map].pet.push(Pet.list[i].getInitPack());
        }
    }
    for(var i in Projectile.list){
        Projectile.list[i].update();
    }
    for(var i in ProjectileCollision.list){
        if(ProjectileCollision.list[i]){
            ProjectileCollision.list[i].update();
        }
    }
    for(var i in Projectile.list){
        if(Projectile.list[i].toRemove){
            delete Projectile.list[i];
        }
        else{
            pack[Projectile.list[i].map].projectile.push(Projectile.list[i].getInitPack());
        }
    }
    return pack;
}

Actor = function(param){
    var self = Entity(param);
    self.moveSpeed = param.moveSpeed;
    self.moveArray = [];
    self.moveDoneX = 0;
    self.moveDoneY = 0;
    self.mapChange = false;
    var super_update = self.update;
    self.update = function(){
        for(var i = 0;i < self.moveSpeed;i++){
            self.updateMove();
            super_update();
            self.updateCollisions();
        }
    }
    self.updateMove = function(){
        self.lastX = self.x;
        self.lastY = self.y;
        if(self.moveArray[0]){
            if(self.x < self.moveArray[0][0] - 1 && !self.moveDoneX){
                self.spdX = 1;
            }
            else if(self.x > self.moveArray[0][0] + 1 && !self.moveDoneX){
                self.spdX = -1;
            }
            else{
                self.moveDoneX = 1;
                self.spdX = 0;
            }
            if(self.y < self.moveArray[0][1] - 1 && !self.moveDoneY){
                self.spdY = 1;
            }
            else if(self.y > self.moveArray[0][1] + 1 && !self.moveDoneY){
                self.spdY = -1;
            }
            else{
                self.moveDoneY = 1;
                self.spdY = 0;
            }
            if(self.moveDoneX === 1 && self.moveDoneY === 1){
                self.moveDoneX = 0;
                self.moveDoneY = 0;
                self.moveArray.shift();
                self.spdX = 0;
                self.spdY = 0;
            }
        }
    }
    self.move = function(x,y){
        self.moveArray.push([x,y]);
    }
    self.teleport = function(x,y,map){
        self.x = x;
        self.y = y;
        self.spdX = 0;
        self.spdY = 0;
        self.map = map;
        self.moveArray = [];
    }
    self.shootProjectile = function(id,angle,direction,type,distance){
		var projectile = Projectile({
            id:id,
            type:type,
			angle:angle,
			direction:direction,
			x:self.x + Math.cos(direction/180*Math.PI) * distance,
			y:self.y + Math.sin(direction/180*Math.PI) * distance,
			map:self.map,
		});
    }
    self.updateCollisions = function(){
        var firstTile = "" + self.map + ":" + Math.round((self.x - 64) / 64) * 64 + ":" + Math.round((self.y - 64) / 64) * 64 + ":";
        var secondTile = "" + self.map + ":" + Math.round((self.x - 64) / 64) * 64 + ":" + Math.round(self.y / 64) * 64 + ":";
        var thirdTile = "" + self.map + ":" + Math.round(self.x / 64) * 64 + ":" + Math.round((self.y - 64) / 64) * 64 + ":";
        var fourthTile = "" + self.map + ":" + Math.round(self.x / 64) * 64 + ":" + Math.round(self.y / 64) * 64 + ":";
        
        if(self.spdX < 0){
            if(self.spdY < 0){
                if(Collision.list[fourthTile]){
                    self.doCollision(Collision.list[fourthTile]);
                }
                if(Collision.list[thirdTile]){
                    self.doCollision(Collision.list[thirdTile]);
                }
                if(Collision.list[secondTile]){
                    self.doCollision(Collision.list[secondTile]);
                }
                if(Collision.list[firstTile]){
                    self.doCollision(Collision.list[firstTile]);
                }
            }
            else if(self.spdY > 0){
                if(Collision.list[thirdTile]){
                    self.doCollision(Collision.list[thirdTile]);
                }
                if(Collision.list[fourthTile]){
                    self.doCollision(Collision.list[fourthTile]);
                }
                if(Collision.list[firstTile]){
                    self.doCollision(Collision.list[firstTile]);
                }
                if(Collision.list[secondTile]){
                    self.doCollision(Collision.list[secondTile]);
                }
            }
            else{
                if(Collision.list[fourthTile]){
                    self.doCollision(Collision.list[fourthTile]);
                }
                if(Collision.list[thirdTile]){
                    self.doCollision(Collision.list[thirdTile]);
                }
                if(Collision.list[secondTile]){
                    self.doCollision(Collision.list[secondTile]);
                }
                if(Collision.list[firstTile]){
                    self.doCollision(Collision.list[firstTile]);
                }
            }
        }
        else if(self.spdX > 0){
            if(self.spdY < 0){
                if(Collision.list[secondTile]){
                    self.doCollision(Collision.list[secondTile]);
                }
                if(Collision.list[firstTile]){
                    self.doCollision(Collision.list[firstTile]);
                }
                if(Collision.list[fourthTile]){
                    self.doCollision(Collision.list[fourthTile]);
                }
                if(Collision.list[thirdTile]){
                    self.doCollision(Collision.list[thirdTile]);
                }
            }
            else if(self.spdY > 0){
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
            }
            else{
                if(Collision.list[secondTile]){
                    self.doCollision(Collision.list[secondTile]);
                }
                if(Collision.list[firstTile]){
                    self.doCollision(Collision.list[firstTile]);
                }
                if(Collision.list[fourthTile]){
                    self.doCollision(Collision.list[fourthTile]);
                }
                if(Collision.list[thirdTile]){
                    self.doCollision(Collision.list[thirdTile]);
                }
            }
        }
        else{
            if(self.spdY < 0){
                if(Collision.list[fourthTile]){
                    self.doCollision(Collision.list[fourthTile]);
                }
                if(Collision.list[thirdTile]){
                    self.doCollision(Collision.list[thirdTile]);
                }
                if(Collision.list[secondTile]){
                    self.doCollision(Collision.list[secondTile]);
                }
                if(Collision.list[firstTile]){
                    self.doCollision(Collision.list[firstTile]);
                }
            }
            else if(self.spdY > 0){
                if(Collision.list[thirdTile]){
                    self.doCollision(Collision.list[thirdTile]);
                }
                if(Collision.list[fourthTile]){
                    self.doCollision(Collision.list[fourthTile]);
                }
                if(Collision.list[firstTile]){
                    self.doCollision(Collision.list[firstTile]);
                }
                if(Collision.list[secondTile]){
                    self.doCollision(Collision.list[secondTile]);
                }
            }
            else{
    
            }
        }

        if(Transporter.list[firstTile]){
            var direction = Transporter.list[firstTile].teleportdirection;
            if(direction === "up" && self.spdY < 0){
                self.doTransport(Transporter.list[firstTile]);
            }
            if(direction === "down" && self.spdY > 0){
                self.doTransport(Transporter.list[firstTile]);
            }
            if(direction === "left" && self.spdX < 0){
                self.doTransport(Transporter.list[firstTile]);
            }
            if(direction === "right" && self.spdX > 0){
                self.doTransport(Transporter.list[firstTile]);
            }
        }
        if(Transporter.list[secondTile]){
            var direction = Transporter.list[secondTile].teleportdirection;
            if(direction === "up" && self.spdY < 0){
                self.doTransport(Transporter.list[secondTile]);
            }
            if(direction === "down" && self.spdY > 0){
                self.doTransport(Transporter.list[secondTile]);
            }
            if(direction === "left" && self.spdX < 0){
                self.doTransport(Transporter.list[secondTile]);
            }
            if(direction === "right" && self.spdX > 0){
                self.doTransport(Transporter.list[secondTile]);
            }
        }
        if(Transporter.list[thirdTile]){
            var direction = Transporter.list[thirdTile].teleportdirection;
            if(direction === "up" && self.spdY < 0){
                self.doTransport(Transporter.list[thirdTile]);
            }
            if(direction === "down" && self.spdY > 0){
                self.doTransport(Transporter.list[thirdTile]);
            }
            if(direction === "left" && self.spdX < 0){
                self.doTransport(Transporter.list[thirdTile]);
            }
            if(direction === "right" && self.spdX > 0){
                self.doTransport(Transporter.list[thirdTile]);
            }
        }
        if(Transporter.list[fourthTile]){
            var direction = Transporter.list[fourthTile].teleportdirection;
            if(direction === "up" && self.spdY < 0){
                self.doTransport(Transporter.list[fourthTile]);
            }
            if(direction === "down" && self.spdY > 0){
                self.doTransport(Transporter.list[fourthTile]);
            }
            if(direction === "left" && self.spdX < 0){
                self.doTransport(Transporter.list[fourthTile]);
            }
            if(direction === "right" && self.spdX > 0){
                self.doTransport(Transporter.list[fourthTile]);
            }
        }
    }
    self.doCollision = function(collision){
        if(self.isColliding(collision)){
            var x = self.x;
            self.x = self.lastX;
            if(self.isColliding(collision)){
                self.x = x;
                self.y = self.lastY;
                if(self.isColliding(collision)){
                    self.x = self.lastX;
                    self.y = self.lastY;
                }
                else{
                    if(self.spdY > 0){
                        self.y = self.lastY - 1;
                    }
                    else if(self.spdY < 0){
                        self.y = self.lastY + 1;
                    }
                }
            }
            else{
                if(self.spdX > 0){
                    self.x = self.lastX - 1;
                }
                else if(self.spdX < 0){
                    self.x = self.lastX + 1;
                }
            }
        }
    }
    self.doTransport = function(transporter){
        if(self.isColliding(transporter)){
            setTimeout(function(){
                self.map = transporter.teleport;
                self.x = transporter.teleportx;
                self.y = transporter.teleporty;
                self.mapWidth = transporter.mapx;
                self.mapHeight = transporter.mapy;
            },1000);
            self.mapChange = true;
        }
    }
    return self;
}

Player = function(param){
    var self = Actor(param);
    var socket = SOCKET_LIST[self.id];
    self.x = 0;
    self.y = 0;
    self.lastX = 0;
    self.lastY = 0;
    self.spdX = 0;
    self.spdY = 0;
    self.mouseX = 0;
    self.mouseY = 0;
    self.width = 24;
    self.height = 20;
    self.moveSpeed = 10;
    self.img = 'player';
    self.hp = 1000;
    self.hpMax = 1000;
    self.direction = 0;
    self.map = 'Village';
    playerMap[self.map] += 1;
    self.state = 'game';
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
    self.update = function(){
        for(var i = 0;i < self.moveSpeed;i++){
            self.updateSpd();
            self.updateMove();
            self.updatePosition();
            self.updateCollisions();
        }
        self.updateAttack();
        self.updateMap();
    }
    self.updateMap = function(){
        if(self.mapChange){
            self.mapChange = false;
            socket.emit('changeMap');
        }
    }
    self.updateSpd = function(){
        self.spdX = 0;
        self.spdY = 0;
        self.lastX = self.x;
        self.lastY = self.y;
        if(self.keyPress.up){
            self.spdY = -1;
        }
        if(self.keyPress.down){
            self.spdY = 1;
        }
        if(self.keyPress.left){
            self.spdX = -1;
        }
        if(self.keyPress.right){
            self.spdX = 1;
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
                self.shootProjectile(self.id,self.direction,self.direction,0,20);
                self.attackReload = 1;
            }
            if(self.keyPress.second === true && self.secondReload > 250){
                for(var i = 10;i < 80;i+=10){
                    self.shootProjectile(self.id,0,0,0,i);
                    self.shootProjectile(self.id,90,90,0,i);
                    self.shootProjectile(self.id,180,180,0,i);
                    self.shootProjectile(self.id,-90,-90,0,i);
                }
                self.secondReload = 1;
            }
        }
        if(self.hp < 1){
            Player.spectate(socket);
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
            player.mouseX = data.state.x + player.x;
            player.mouseY = data.state.y + player.y;
		}
    });

    socket.on('respawn',function(data){
        player.hp = 1000;
        player.img = 'player';
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
    for(var i in Pet.list){
        if(socket && Pet.list[i].parent === socket.id){
            delete Pet.list[i];
        }
    }
    if(!socket){
        return;
    }
	socket.emit("disconnected");
    if(Player.list[socket.id]){
        playerMap[Player.list[socket.id].map] -= 1;
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


Npc = function(param){
	var self = Actor(param);
	self.id = Math.random();
    self.map = 'Village';
	var super_update = self.update;
	self.update = function(){
        super_update();
    }
	self.getInitPack = function(){
		return {
			x:self.x,
			y:self.y,
			id:self.id,
			direction:self.direction,
			map:self.map,
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
	Npc.list[self.id] = self;
	return self;
}
Npc.list = {};

Npc.getAllInitPack = function(){
	var npcs = [];
	for(var i in Npc.list)
        npcs.push(Npc.list[i].getInitPack())
	return npcs;
}

Npc.getMapInitPack = function(map){
	var npcs = [];
	for(var i in Npc.list){
        if(Npc.list[i].map === map){
            npcs.push(Npc.list[i].getInitPack());
        }
    }
	return npcs;
}

Pet = function(param){
	var self = Npc(param);
	self.id = Math.random();
    self.map = 'Village';
    self.parent = param.parent;
    self.reload = 0;
	var super_update = self.update;
	self.update = function(){
        super_update();
        self.updateAttack();
    }
    self.updateAttack = function(){
        self.reload += 1;
        if(self.reload > 10){
            self.reload = 0;
            var direction = (Math.atan2(Player.list[self.parent].mouseY - Player.list[self.parent].y + self.y,Player.list[self.parent].mouseX - Player.list[self.parent].x + self.x) / Math.PI * 180);
            self.shootProjectile(self.parent,direction,direction,0,35);
        }
    }
	self.getInitPack = function(){
		return {
			x:self.x,
			y:self.y,
			id:self.id,
			direction:self.direction,
			map:self.map,
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
	Pet.list[self.id] = self;
	return self;
}
Pet.list = {};

Pet.getAllInitPack = function(){
	var pets = [];
	for(var i in Pet.list)
        pets.push(Pet.list[i].getInitPack())
	return pets;
}

Pet.getMapInitPack = function(map){
	var pets = [];
	for(var i in Pet.list){
        if(Pet.list[i].map === map){
            pets.push(Pet.list[i].getInitPack());
        }
    }
	return pets;
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


var data;
var tileset;
var layers;
var map;
var renderLayer = function(layer){
    if(layer.type !== "tilelayer" && layer.visible === false){
        return;
    }
    size = data.tilewidth;
    Maps[map] = {width:layer.width * size,height:layer.height * size};
    if(layers.length < data.layers.length || 1){
        layer.data.forEach(function(tile_idx, i){
            if(!tile_idx){
                return;
            }
            tile = data.tilesets[0];
            if(tile_idx === 2122){
                var collision = new Collision({
                    x:(i % layer.width) * size + 32,
                    y:~~(i / layer.width) * size + 32,
                    width:size,
                    height:size,
                    map:map,
                });
			}
            if(tile_idx === 2123){
                var collision = new Collision({
                    x:(i % layer.width) * size + 32,
                    y:~~(i / layer.width) * size + 48,
                    width:size,
                    height:size / 2,
                    map:map,
                });
			}
            if(tile_idx === 2124){
                var collision = new Collision({
                    x:(i % layer.width) * size + 32,
                    y:~~(i / layer.width) * size + 16,
                    width:size,
                    height:size / 2,
                    map:map,
                });
			}
            if(tile_idx === 1950){
                var projectileCollision = new ProjectileCollision({
                    x:(i % layer.width) * size,
                    y:~~(i / layer.width) * size,
                    size:size,
                    map:map,
                });
			}
            if(tile_idx === 2036){
				var teleport = "";
				var teleportj = 0;
				var x = "";
				var xj = 0;
                var y = "";
                var yj = 0;
                var direction = "";
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
							yj = j;
						}
						else if(direction === ""){
							direction = layer.name.substr(yj + 1,j - yj - 1);
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
                    direction:direction,
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
    if(SERVER === 'localhost'){
        loadTileset(require("C:/Users/gu/Documents/game/client/maps/" + name + ".json"));
    }
    else{
        loadTileset(require("/app/client/maps/" + name + ".json"));
    }
}
load("Village");
load("Starter House");
load("Cave");

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
    for(var i in Npc.list){
        for(var j in Projectile.list){
            if(Npc.list[i] && Projectile.list[j]){
                if(Npc.list[i].getDistance(Projectile.list[j]) < 30 && Projectile.list[j].parent != i){
                    Projectile.list[j].toRemove = true;
                }
            }
        }
    }
}