
initPack = {'forest':[]};
removePack = {'forest':[]};

Entity = function(param){
    var self = {};
    self.id = Math.random();
    self.x = 0;
    self.y = 0;
    self.spdX = 0;
    self.spdY = 0;
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
    return self;
}

Entity.getFrameUpdateData = function(){
    var pack = {initPack:initPack,updatePack:{'forest':{player:[],projectile:[]}},removePack:removePack};
    for(var i in Player.list){
        Player.list[i].update();
        pack.updatePack[Player.list[i].map].player.push(Player.list[i].getUpdatePack());
    }
    for(var i in Projectile.list){
        Projectile.list[i].update();
        if(Projectile.list[i].toRemove){
            removePack[Projectile.list[i].map].projectile.push(i);
            delete Projectile.list[i];
        }
        else{
            pack.updatePack[Projectile.list[i].map].projectile.push(Projectile.list[i].getUpdatePack());
        }
    }
    initPack = {'forest':{player:[],projectile:[]}};
    removePack = {'forest':{player:[],projectile:[]}};
    return pack;
}

Player = function(param){
    var self = Entity(param);
    self.x = 0;
    self.y = 0;
    self.spdX = 0;
    self.spdY = 0;
    self.moveSpeed = 10;
    self.img = 'player';
    self.hp = 1000;
    self.hpMax = 1000;
    self.direction = 0;
    self.map = 'forest';
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
    var super_update = self.update;
    self.update = function(){
        self.updateSpd();
        super_update();
        if(self.img === 'player'){
            if(self.keyPress.attack === true){
                self.shootProjectile();
            }
            if(self.keyPress.second === true){
                self.secondaryAttack();
            }
        }
    }
    self.updateSpd = function(){
        self.spdX = 0;
        self.spdY = 0;
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
    self.getInitPack = function(){
        return{
            id:self.id,
            x:self.x,
            y:self.y,
            spdX:self.spdX,
            spdY:self.spdY,
            hp:self.hp,
            hpMax:self.hpMax,
            username:self.username,
            img:self.img,
        }
    }
    self.getUpdatePack = function(){
        return{
            id:self.id,
            x:self.x,
            y:self.y,
            img:self.img,
        }
    }
    initPack[self.map].player.push(self.getInitPack());
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
        player.img = 'player';
    });

    socket.emit('init',{
		player:Player.getAllInitPack(),
		projectile:Projectile.getAllInitPack(),
	});
}

Player.spectate = function(socket){
    for(var i in Projectile.list){
        if(socket && Projectile.list[i].parent === socket.id){
            removePack[Projectile.list[i].map].projectile.push(i);
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
            removePack[Projectile.list[i].map].projectile.push(i);
            delete Projectile.list[i];
        }
    }
    if(!socket){
        return;
    }
	socket.emit("disconnected");
    if(Player.list[socket.id]){
        removePack[Player.list[socket.id].map].player.push(socket.id);
        delete Player.list[socket.id];
    }
}

Player.getAllInitPack = function(){
	var players = [];
	for(var i in Player.list)
		players.push(Player.list[i].getInitPack())
	return players;
}

Projectile = function(param){
	var self = Entity(param);
	self.id = Math.random();
	self.parent = param.id;
	self.spdX = Math.cos(param.angle/180 * Math.PI) * 20;
	self.spdY = Math.sin(param.angle/180 * Math.PI) * 20;
	self.direction = param.direction;
	self.timer = 0;
    self.map = 'forest';
	self.toRemove = false;
	var super_update = self.update;
	self.update = function(){
        super_update();
        self.timer += 1;
        if(self.timer > 30){
            self.toRemove = true;
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
    initPack[self.map].projectile.push(self.getInitPack());
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

updateCrashes = function(){
    for(var i in Player.list){
        for(var j in Projectile.list){
            if(Player.list[i] && Projectile.list[j]){
                if(Player.list[i].getDistance(Projectile.list[j]) < 30 && Projectile.list[j].parent != i && Player.list[i].img == 'player'){
                    Projectile.list[j].toRemove = true;
                    Player.spectate(SOCKET_LIST[i]);
                }
            }
        }
    }
}