var xpLevels = [
    {xp:100,gems:0},
    {xp:500,gems:0},
    {xp:1000,gems:0},
    {xp:1500,gems:0},
    {xp:2000,gems:0},
    {xp:2500,gems:0},
    {xp:3000,gems:0},
    {xp:3500,gems:0},
    {xp:4000,gems:0},
    {xp:4500,gems:0},
    {xp:5000,gems:1},
    {xp:6000,gems:1},
    {xp:7000,gems:1},
    {xp:8000,gems:1},
    {xp:9000,gems:1},
    {xp:10000,gems:1},
    {xp:11000,gems:1},
    {xp:12000,gems:1},
    {xp:13000,gems:1},
    {xp:14000,gems:1},
    {xp:15000,gems:2},
    {xp:17500,gems:2},
    {xp:20000,gems:2},
    {xp:22500,gems:2},
    {xp:25000,gems:2},
    {xp:27500,gems:2},
    {xp:30000,gems:2},
    {xp:32500,gems:2},
    {xp:35000,gems:2},
    {xp:37500,gems:2},
    {xp:40000,gems:3},
    {xp:45000,gems:3},
    {xp:50000,gems:3},
    {xp:55000,gems:3},
    {xp:60000,gems:3},
    {xp:65000,gems:3},
    {xp:70000,gems:3},
    {xp:75000,gems:3},
    {xp:8000,gems:3},
    {xp:85000,gems:3},
    {xp:100000,gems:4},
    {xp:150000,gems:4},
    {xp:200000,gems:4},
    {xp:250000,gems:4},
    {xp:300000,gems:4},
    {xp:350000,gems:4},
    {xp:400000,gems:4},
    {xp:450000,gems:4},
    {xp:500000,gems:4},
    {xp:550000,gems:4},
    {xp:600000,gems:4},
    {xp:1000000000000,gems:4},
    {xp:1000000000000000,gems:5},
    {xp:0,gems:6},
];

s = {
    findPlayer:function(param){
        for(var i in Player.list){
            if(Player.list[i].username === param){
                return Player.list[i];
            }
        }
    },
    spawnMonster:function(param,pt){
        var monster = new Monster({
            spawnId:0,
            x:pt.x,
            y:pt.y,
            map:pt.map,
            moveSpeed:2,
            monsterType:param,
            onDeath:function(pt){
                pt.toRemove = true;
                for(var i in Projectile.list){
                    if(Projectile.list[i].parent === pt.id){
                        Projectile.list[i].toRemove = true;
                    }
                }
            },
        });
        return monster;
    },
    kick:function(username){
        for(var i in Player.list){
            if(Player.list[i].username === username){
                Player.onDisconnect(SOCKET_LIST[i]);
            }
        }
    },
    kickAll:function(){
        for(var i in Player.list){
            Player.onDisconnect(SOCKET_LIST[i]);
        }
    },
    findAll:function(){
        var pack = '';
        for(var i in Player.list){
            pack = pack + ' ' + Player.list[i].username;
        }
        return pack;
    },
};



var playerMap = {
    'Cave':0,
    'Starter House':0,
    'House':0,
    'Secret Base':0,
    'Secret Base Basement':0,
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
    self.type = 'Entity';
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
    var pack = {};
    for(var i in Player.list){
        if(Player.list[i]){
            Player.list[i].update();
            if(!pack[Player.list[i].map]){
                pack[Player.list[i].map] = {player:[],projectile:[],monster:[],npc:[]};
            }
            pack[Player.list[i].map].player.push(Player.list[i].getUpdatePack());
        }
    }
    for(var i in Monster.list){
        if(Monster.list[i]){
            Monster.list[i].update();
            if(Monster.list[i].toRemove){
                if(Monster.list[i].spawnId){
                    Spawner.list[Monster.list[i].spawnId].spawned = false;
                }
                delete Monster.list[i];
            }
            else{
                if(!pack[Monster.list[i].map]){
                    pack[Monster.list[i].map] = {player:[],projectile:[],monster:[],npc:[]};
                }
                pack[Monster.list[i].map].monster.push(Monster.list[i].getUpdatePack());
            }
        }
    }
    for(var i in Projectile.list){
        Projectile.list[i].update();
    }
    for(var i in Npc.list){
        Npc.list[i].update();
        if(!pack[Npc.list[i].map]){
            pack[Npc.list[i].map] = {player:[],projectile:[],monster:[],npc:[]};
        }
        pack[Npc.list[i].map].npc.push(Npc.list[i].getUpdatePack());
    }
	updateCrashes();
    for(var i in Projectile.list){
        if(!pack[Projectile.list[i].map]){
            pack[Projectile.list[i].map] = {player:[],projectile:[],monster:[],npc:[]};
        }
        if(Projectile.list[i].toRemove){
            delete Projectile.list[i];
        }
        else{
            pack[Projectile.list[i].map].projectile.push(Projectile.list[i].getUpdatePack());
        }
    }
    return pack;
}

Actor = function(param){
    var self = Entity(param);
    self.maxSpeed = param.moveSpeed;
    self.moveSpeed = param.moveSpeed;
    self.moveArray = [];
    self.randomPos = {walking:false,x:0,y:0,directionX:0,directionY:0};
    self.trackingEntity = undefined;
    self.canMove = true;
    self.transporter = {};
    self.invincible = false;
    self.mapWidth = Maps[self.map].width;
    self.mapHeight = Maps[self.map].height;
    self.type = 'Actor';
    self.animationDirection = 'up';
    self.animation = 0;
    self.state = 'none';
    self.mapChange = 100;
    var super_update = self.update;
    self.update = function(){
        self.mapChange += 1;
        self.moveSpeed = self.maxSpeed;
        for(var i = 0;i < self.moveSpeed;i++){
            self.updateMove();
            self.updateAnimation();
            if(self.canMove){
                super_update();
            }
            self.updateCollisions();
        }
        if(self.mapChange === 5){
            self.map = self.transporter.teleport;
            if(self.transporter.teleportx !== -1){
                self.x = self.transporter.teleportx;
            }
            if(self.transporter.teleporty !== -1){
                self.y = self.transporter.teleporty;
            }
            self.mapWidth = self.transporter.mapx;
            self.mapHeight = self.transporter.mapy;
            self.canMove = false;
        }
        if(self.mapChange === 10){
            self.canMove = true;
            self.invincible = false;
        }
    }
    self.updateMove = function(){
        self.lastX = self.x;
        self.lastY = self.y;
        if(self.moveArray[0]){
            self.spdX = 0;
            self.spdY = 0;
            if(self.x < self.moveArray[0].x){
                self.spdX = 1;
            }
            if(self.x > self.moveArray[0].x){
                self.spdX = -1;
            }
            if(self.y < self.moveArray[0].y){
                self.spdY = 1;
            }
            if(self.y > self.moveArray[0].y){
                self.spdY = -1;
            }
            if(self.x === self.moveArray[0].x && self.y === self.moveArray[0].y){
                self.moveArray.shift();
            }
        }
        else if(self.trackingEntity){
            self.spdX = 0;
            self.spdY = 0;
            if(self.trackingEntity.hp < 1){

            }
            else{
                if(self.x < self.trackingEntity.x){
                    self.spdX = 1;
                }
                if(self.x > self.trackingEntity.x){
                    self.spdX = -1;
                }
                if(self.y < self.trackingEntity.y){
                    self.spdY = 1;
                }
                if(self.y > self.trackingEntity.y){
                    self.spdY = -1;
                }
            }
            if(self.x === self.trackingEntity.x && self.y === self.trackingEntity.y){
                //self.trackingEntity = undefined;
            }
        }
        else if(self.randomPos.walking){
            if(self.x < self.randomPos.x && self.x > self.randomPos.x - 256 && self.randomPos.directionX === -1){
                self.spdX = -1;
                self.randomPos.directionX = -1;
            }
            else if(self.x < self.randomPos.x){
                self.spdX = 1;
                self.randomPos.directionX = 1;
            }
            else if(self.x > self.randomPos.x && self.x < self.randomPos.x + 256 && self.randomPos.directionX === 1){
                self.spdX = 1;
                self.randomPos.directionX = 1;
            }
            else if(self.x > self.randomPos.x){
                self.spdX = -1;
                self.randomPos.directionX = -1;
            }
            else{
                self.spdX = Math.round(Math.random() * 2 - 1);
                self.randomPos.directionX = self.spdX;
            }
            if(self.y < self.randomPos.y && self.y > self.randomPos.y - 256 && self.randomPos.directionY === -1){
                self.spdY = -1;
                self.randomPos.directionY = -1;
            }
            else if(self.y < self.randomPos.y){
                self.spdY = 1;
                self.randomPos.directionY = 1;
            }
            else if(self.y > self.randomPos.y && self.y < self.randomPos.y + 256 && self.randomPos.directionY === 1){
                self.spdY = 1;
                self.randomPos.directionY = 1;
            }
            else if(self.y > self.randomPos.y){
                self.spdY = -1;
                self.randomPos.directionY = -1;
            }
            else{
                self.spdY = Math.round(Math.random() * 2 - 1);
                self.randomPos.directionY = self.spdY;
            }
        }
    }
    self.updateAnimation = function(){
        if(self.spdX === 1){
            if(self.spdY === 1){
                self.animationDirection = "rightdown";
            }
            else if(self.spdY === -1){
                self.animationDirection = "rightup";
            }
            else if(self.spdY === 0){
                self.animationDirection = "right";
            }
        }
        else if(self.spdX === -1){
            if(self.spdY === 1){
                self.animationDirection = "leftdown";
            }
            else if(self.spdY === -1){
                self.animationDirection = "leftup";
            }
            else if(self.spdY === 0){
                self.animationDirection = "left";
            }
        }
        else if(self.spdX === 0){
            if(self.spdY === 1){
                self.animationDirection = "down";
            }
            else if(self.spdY === -1){
                self.animationDirection = "up";
            }
            else if(self.spdY === 0){
                self.animation = -1;
            }
        }
    }
    self.move = function(x,y){
        self.moveArray.push({x:x,y:y});
    }
    self.randomWalk = function(walking,x,y){
        self.randomPos.walking = walking;
        self.randomPos.x = x;
        self.randomPos.y = y;
    }
    self.teleport = function(x,y,map){
        if(playerMap[map] === undefined){
            return;
        }
        self.invincible = true;
        if(self.mapChange > 10){
            self.mapChange = -1;
        }
        self.transporter = {
            teleport:map,
            teleportx:x,
            teleporty:y,
            mapx:Maps[map].width,
            mapy:Maps[map].height,
        };
    }
    self.trackEntity = function(pt){
        self.trackingEntity = pt;
    }
    self.shootProjectile = function(id,parentType,angle,direction,projectileType,distance,stats){
		var projectile = Projectile({
            id:id,
            projectileType:projectileType,
			angle:angle,
			direction:direction,
			x:self.x + Math.cos(direction/180*Math.PI) * distance,
			y:self.y + Math.sin(direction/180*Math.PI) * distance,
            map:self.map,
            parentType:parentType,
            mapWidth:self.mapWidth,
            mapHeight:self.mapHeight,
            stats:stats,
            onCollision:function(self,pt){
                if(!pt.invincible && self.toRemove === false){
                    pt.hp -= Math.round(self.stats.attack * (50 + Math.random() * 50) / pt.stats.defense);
                }
                if(pt.hp < 1 && pt.isDead === false && self.toRemove === false){
                    if(parentType === 'Player'){
                        if(Math.random() < 0.1){
                            Player.list[self.parent].inventory.addItem('woodensword',1);
                        }
                        if(Math.random() < 0.01){
                            Player.list[self.parent].inventory.addItem('ironsword',1);
                        }
                        if(Math.random() < 0.001){
                            Player.list[self.parent].inventory.addItem('goldensword',1);
                        }
                        if(Math.random() < 0.1){
                            Player.list[self.parent].inventory.addItem('woodenhelmet',1);
                        }
                        if(Math.random() < 0.01){
                            Player.list[self.parent].inventory.addItem('ironhelmet',1);
                        }
                        if(Math.random() < 0.001){
                            Player.list[self.parent].inventory.addItem('goldenhelmet',1);
                        }
                        if(Math.random() < 0.1){
                            Player.list[self.parent].inventory.addItem('woodenamulet',1);
                        }
                        if(Math.random() < 0.01){
                            Player.list[self.parent].inventory.addItem('ironamulet',1);
                        }
                        if(Math.random() < 0.001){
                            Player.list[self.parent].inventory.addItem('goldenamulet',1);
                        }
                        if(Math.random() < 0.005){   
                            Player.list[self.parent].inventory.addItem('xpgem',1);
                        }
                        Player.list[self.parent].xp += Math.round(10 * Player.list[self.parent].stats.xp);
                    }
                    pt.isDead = true;
                    self.toRemove = true;
                }
            }
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

        self.moveSpeed = self.maxSpeed;

        if(SlowDown.list[firstTile]){
            self.doSlowDown(SlowDown.list[firstTile]);
        }
        if(SlowDown.list[secondTile]){
            self.doSlowDown(SlowDown.list[secondTile]);
        }
        if(SlowDown.list[thirdTile]){
            self.doSlowDown(SlowDown.list[thirdTile]);
        }
        if(SlowDown.list[fourthTile]){
            self.doSlowDown(SlowDown.list[fourthTile]);
        }

        if(Transporter.list[firstTile] && self.canMove){
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
        if(Transporter.list[secondTile] && self.canMove){
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
        if(Transporter.list[thirdTile] && self.canMove){
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
        if(Transporter.list[fourthTile] && self.canMove){
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
                    
                }
            }
            else{
                
            }
        }
    }
    self.doTransport = function(transporter){
        if(self.isColliding(transporter)){
            self.invincible = true;
            if(self.mapChange > 10){
                self.mapChange = 0;
            }
            self.transporter = transporter;
        }
    }
    self.doSlowDown = function(slowDown){
        if(self.isColliding(slowDown)){
            self.moveSpeed = self.maxSpeed / 2;
        }
    }
    return self;
}

Player = function(param){
    var self = Actor(param);
    var socket = SOCKET_LIST[self.id];
    self.x = 320;
    self.y = 320;
    self.lastX = 0;
    self.lastY = 0;
    self.spdX = 0;
    self.spdY = 0;
    self.mouseX = 0;
    self.mouseY = 0;
    self.width = 24;
    self.height = 28;
    self.moveSpeed = 20;
    self.maxSpeed = 20;
    self.img = 'player';
    self.animationDirection = 'up';
    self.animation = 0;
    self.hp = 1000;
    self.hpMax = 1000;
    self.mg = 1000;
    self.mgMax = 1000;
    self.xp = 0;
    self.xpMax = 100;
    self.level = 0;
    self.direction = 0;
    self.map = 'Starter House';
    playerMap[self.map] += 1;
    self.mapHeight = 640;
    self.mapWidth = 640;
    self.textColor = '#ffff00';
    self.quest = 'none';
    self.questStage = 0;
    self.questInfo = {};
    self.questDependent = {};
    self.type = 'Player';
    self.username = param.username;
    self.tag = '';
    if(self.username === 'sp'){
        self.textColor = 'ff0090';
    }
    if(self.username === 'Suvanth'){
        self.textColor = '0090ff';
    }
    if(self.username === 'the-real-tianmu'){
        self.textColor = '0090ff';
    }
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
        heal:32,
    };
    self.attackReload = 25;
    self.secondReload = 250;
    self.healReload = 500;
    self.attackTick = 40;
    self.secondTick = 160;
    self.healTick = 160;
    self.attackDirection = 0;
    self.secondDirection = 0;
    self.currentResponse = 0;
	self.questInventory = new QuestInventory(socket,true);
    self.inventory = new Inventory(socket,true);
    if(param.param.inventory){
        for(var i in param.param.inventory){
            if(param.param.inventory[i].id[0] === 'w' || param.param.inventory[i].id[0] === 'x' || param.param.inventory[i].id[0] === 'i' || param.param.inventory[i].id[0] === 'g'){
                self.inventory.addItem(param.param.inventory[i].id,param.param.inventory[i].amount);
            }
        }
    }
    if(param.param.equip){
        for(var i in param.param.equip){
            self.inventory.currentEquip[i] = param.param.equip[i];
        }
    }
    if(param.param.xp){
        self.xp = param.param.xp;
    }
    if(param.param.level){
        self.level = param.param.level;
        if(self.level < 53){
            self.xpMax = xpLevels[self.level].xp;
        }
    }
    self.inventory.refreshRender();
    self.questInventory.addQuestItem("potion",10);
    self.stats = {
        attack:1,
        defense:1,
        heal:1,
        xp:1,
    }
    var lastSelf = {};
    self.update = function(){
        self.mapChange += 1;
        self.moveSpeed = self.maxSpeed;
        for(var i = 0;i < self.moveSpeed;i++){
            self.updateSpd();
            self.updateMove();
            if(self.canMove){
                self.updatePosition();
            }
            self.updateCollisions();
        }
        if(self.animation === -1){
            self.animation = 0;
        }
        else{
            self.animation += 0.5;
            if(self.animation > 5){
                self.animation = 0;
            }
        }
        self.attackReload += 1;
        self.secondReload += 1;
        self.healReload += 1;
        self.attackTick += 1;
        self.secondTick += 1;
        self.healTick += 1;
        if(self.hp < 1){
            self.hp = 0;
            if(self.state !== 'dead'){
                Player.spectate(socket);
                var d = new Date();
                var m = '' + d.getMinutes();
                if(m.length === 1){
                    m = '' + 0 + m;
                }
                if(m === '0'){
                    m = '00';
                }
                console.error("[" + d.getHours() + ":" + m + "] " + self.username + ' died.');
                for(var i in SOCKET_LIST){
                    SOCKET_LIST[i].emit('addToChat',{
                        style:'style="color: #ff0000">',
                        message:self.username + ' died.',
                    });
                }
                self.state = 'dead';
            }
        }
        else{
            self.state = 'none';
            if(self.hp > self.hpMax){
                self.hp = self.hpMax;
            }
            else{
                if(self.healReload % 10 === 0){
                    self.hp += Math.round(self.stats.heal * (10 + Math.random() * 15));
                }
            }
        }
        if(self.hp > self.hpMax){
            self.hp = self.hpMax;
        }
        if(!self.invincible){
            self.updateAttack();
        }
        self.updateQuest();
        self.updateMap();
        self.updateStats();
        self.updateXp();
        if(self.hp > self.hpMax){
            self.hp = self.hpMax;
        }
    }
    self.updateQuest = function(){
        for(var i in Npc.list){
            if(Npc.list[i].map === self.map && Npc.list[i].username === 'bob' && self.mapChange > 20 && Npc.list[i].x - 32 < self.mouseX && Npc.list[i].x + 32 > self.mouseX && Npc.list[i].y - 32 < self.mouseY && Npc.list[i].y + 32 > self.mouseY && self.keyPress.attack){
                if(self.quest === 'none'){
                    self.quest = 'qWeirdHouse';
                    self.questStage = 1;
                }
                if(self.questStage === 1){
                    self.questStage += 1;
                    self.questInfo.started = false;
                    self.invincible = true;
                    socket.emit('dialougeLine',{
                        state:'ask',
                        message:'Can you inventigate a weird house?',
                        response1:'Sure.',
                        response2:'No.',
                    });
                }
                if(self.questStage === 12){
                    self.questStage += 1;
                    self.invincible = true;
                    socket.emit('dialougeLine',{
                        state:'ask',
                        message:'Thanks.',
                        response1:'*End conversation*',
                    });
                }
                self.keyPress.attack = false;
            }
            if(Npc.list[i].map === self.map && Npc.list[i].username === 'mark' && self.mapChange > 20 && Npc.list[i].x - 32 < self.mouseX && Npc.list[i].x + 32 > self.mouseX && Npc.list[i].y - 32 < self.mouseY && Npc.list[i].y + 32 > self.mouseY && self.keyPress.attack){
                if(self.quest === 'none'){
                    self.quest = 'qMinecartMonsters';
                    self.questStage = 1;
                }
                if(self.questStage === 1){
                    self.questStage += 1;
                    self.questInfo.started = false;
                    self.invincible = true;
                    socket.emit('dialougeLine',{
                        state:'ask',
                        message:'I am in charge of storing valuable gems that come from the mine, but today, instead of gems the minecarts contained monsters! Can you kill them for me?',
                        response1:'Sure.',
                        response2:'No.',
                    });
                }
                if(self.questStage === 8){
                    self.questStage += 1;
                    self.invincible = true;
                    socket.emit('dialougeLine',{
                        state:'ask',
                        message:'Thanks. Now I can get back to work.',
                        response1:'*End conversation*',
                    });
                }
                self.keyPress.attack = false;
            }
            if(Npc.list[i].map === self.map && Npc.list[i].username === 'john' && self.mapChange > 20 && Npc.list[i].x - 32 < self.mouseX && Npc.list[i].x + 32 > self.mouseX && Npc.list[i].y - 32 < self.mouseY && Npc.list[i].y + 32 > self.mouseY && self.keyPress.attack){
                if(self.quest === 'none'){
                    self.quest = 'qBridge';
                    self.questStage = 1;
                }
                if(self.questStage === 1){
                    self.questStage += 1;
                    self.questInfo.started = false;
                    self.invincible = true;
                    socket.emit('dialougeLine',{
                        state:'ask',
                        message:'Bet you can\'t make it across that bridge.',
                        response1:'I can.',
                        response2:'I can\'t.',
                    });
                }
                self.keyPress.attack = false;
            }
        }
        if(self.currentResponse === 1 && self.questStage === 2 && self.quest === 'qWeirdHouse'){
            self.questStage += 1;
            self.invincible = false;
            socket.emit('dialougeLine',{
                state:'remove',
            });
            socket.emit('questInfo',{
                questName:'Weird House',
                questDescription:'Investigate a weird house in the map River. Go on a big boss battle against the Monster Boss.',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 2 && self.questStage === 2 && self.quest === 'qWeirdHouse'){
            self.quest = 'none';
            socket.emit('dialougeLine',{
                state:'remove',
            });
            self.invincible = false;
            self.currentResponse = 0;
        }
        if(self.questInfo.started === true && self.questStage === 3 && self.quest === 'qWeirdHouse'){
            self.questStage += 1;
            self.invincible = true;
            socket.emit('dialougeLine',{
                state:'ask',
                message:'There is an old house in the map River. Go in and inventigate.',
                response1:'*End conversation*',
            });
        }
        if(self.currentResponse === 1 && self.questStage === 4 && self.quest === 'qWeirdHouse'){
            self.questStage += 1;
            self.invincible = false;
            socket.emit('dialougeLine',{
                state:'remove',
            });
            self.currentResponse = 0;
        }
        if(self.x < 896 && self.map === 'Secret Base Basement' && self.quest === 'qWeirdHouse' && self.questStage === 5 && self.mapChange > 10){
            self.questStage += 1;
            self.questInfo.monsterKilled = false;
            self.questDependent.monster = new Monster({
                spawnId:0,
                x:512,
                y:320,
                map:'Secret Base Basement',
                moveSpeed:0,
                monsterType:'red',
                stats:{
                    attack:100,
                    defense:100,
                    heal:1,
                },
                attackState:'none',
                onDeath:function(pt){
                    pt.toRemove = true;
                    for(var i in Projectile.list){
                        if(Projectile.list[i].parent === pt.id){
                            Projectile.list[i].toRemove = true;
                        }
                    }
                    self.questInfo.monsterKilled = true;
                },
            });
            self.questDependent.monster.invincible = true;
            self.invincible = true;
            socket.emit('dialougeLine',{
                state:'ask',
                message:'What are you doing here!',
                response1:'Uhh, nothing.',
                response2:'A guy called Bob told be to come here.',
                response3:'I am going to kill you.',
                response4:'I want the gold behind you.',
            });
        }
        if(self.currentResponse === 1 && self.questStage === 6 && self.quest === 'qWeirdHouse'){
            self.questStage += 1;
            socket.emit('dialougeLine',{
                state:'ask',
                message:'Then get out of my den!',
                response1:'*End conversation*',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 2 && self.questStage === 6 && self.quest === 'qWeirdHouse'){
            self.questStage += 2;
            socket.emit('dialougeLine',{
                state:'ask',
                message:'Bob? Oh, do you mean that person in the Village?',
                response1:'Yes. He said go investigate the weird house in the River.',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 3 && self.questStage === 6 && self.quest === 'qWeirdHouse'){
            self.questStage += 3;
            socket.emit('dialougeLine',{
                state:'ask',
                message:'You want to kill me? Then go ahead and try!',
                response1:'*End conversation*',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 4 && self.questStage === 6 && self.quest === 'qWeirdHouse'){
            self.questStage += 3;
            socket.emit('dialougeLine',{
                state:'ask',
                message:'You want the gold behind me? You\'ll have to kill me to get it!',
                response1:'*End conversation*',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 7 && self.quest === 'qWeirdHouse'){
            self.questStage = 5;
            socket.emit('dialougeLine',{
                state:'remove',
            });
            self.invincible = false;
            self.teleport(2816,1920,'River');
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 8 && self.quest === 'qWeirdHouse'){
            self.questStage += 2;
            socket.emit('dialougeLine',{
                state:'ask',
                message:'Bob is crazy. You shouldn\'t believe him.',
                response1:'*End conversation*',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 9 && self.quest === 'qWeirdHouse'){
            self.questStage += 2;
            socket.emit('dialougeLine',{
                state:'remove',
            });
            self.invincible = false;
            self.questDependent.monster.attackState = 'passive';
            self.questDependent.monster.invincible = false;
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 10 && self.quest === 'qWeirdHouse'){
            self.questStage = 5;
            socket.emit('dialougeLine',{
                state:'remove',
            });
            self.invincible = false;
            self.teleport(2816,1920,'River');
            self.currentResponse = 0;
        }
        if(self.questInfo.monsterKilled === true && self.questStage === 11 && self.quest === 'qWeirdHouse'){
            self.questStage += 1;
        }
        if(self.currentResponse === 1 && self.questStage === 13 && self.quest === 'qWeirdHouse'){
            self.quest = 'none';
            socket.emit('dialougeLine',{
                state:'remove',
            });
            self.invincible = false;
            self.xp += Math.round(2000 * self.stats.xp);
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 2 && self.quest === 'qMinecartMonsters'){
            self.questStage += 1;
            socket.emit('dialougeLine',{
                state:'remove',
            });
            self.invincible = false;
            socket.emit('questInfo',{
                questName:'Minecart Monsters',
                questDescription:'Defeat monsters that escaped the Mine.',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 2 && self.questStage === 2 && self.quest === 'qMinecartMonsters'){
            self.quest = 'none';
            self.invincible = false;
            socket.emit('dialougeLine',{
                state:'remove',
            });
            self.currentResponse = 0;
        }
        if(self.questInfo.started === true && self.questStage === 3 && self.quest === 'qMinecartMonsters'){
            self.questStage += 1;
            self.invincible = true;
            socket.emit('dialougeLine',{
                state:'ask',
                message:'Good. The monsters will come soon.',
                response1:'*End conversation*',
            });
        }
        if(self.currentResponse === 1 && self.questStage === 4 && self.quest === 'qMinecartMonsters'){
            self.questStage += 1;
            self.invincible = false;
            socket.emit('dialougeLine',{
                state:'remove',
            });
            self.currentResponse = 0;
        }
        if(self.map === 'Upper Mine Deposit' && self.quest === 'qMinecartMonsters' && self.questStage === 5 && self.mapChange > 10){
            for(var i in QuestInfo.list){
                if(QuestInfo.list[i].quest === 'qMinecartMonsters' && QuestInfo.list[i].info === 'activator' && self.isColliding(QuestInfo.list[i])){
                    self.questStage += 1;
                    self.questInfo.monstersKilled = 0;
                    self.questInfo.monsters = 0;
                }
            }
        }
        if(self.quest === 'qMinecartMonsters' && self.questStage === 6){
            for(var i in QuestInfo.list){
                if(QuestInfo.list[i].quest === 'qMinecartMonsters' && QuestInfo.list[i].info === 'spawner'){
                    self.questDependent[i] = new Monster({
                        spawnId:0,
                        x:QuestInfo.list[i].x,
                        y:QuestInfo.list[i].y,
                        map:'Upper Mine Deposit',
                        moveSpeed:15,
                        monsterType:'blue',
                        stats:{
                            attack:10,
                            defense:10,
                            heal:1,
                        },
                        onDeath:function(pt){
                            pt.toRemove = true;
                            for(var i in Projectile.list){
                                if(Projectile.list[i].parent === pt.id){
                                    Projectile.list[i].toRemove = true;
                                }
                            }
                            self.questInfo.monstersKilled += 1;
                        },
                    });
                    self.questInfo.monsters += 1;
                }
            }
            self.questStage += 1;
        }
        if(self.questInfo.monstersKilled === self.questInfo.monsters && self.questStage === 7 && self.quest === 'qMinecartMonsters'){
            self.questStage += 1;
        }
        if(self.currentResponse === 1 && self.questStage === 9 && self.quest === 'qMinecartMonsters'){
            self.quest = 'none';
            self.invincible = false;
            socket.emit('dialougeLine',{
                state:'remove',
            });
            self.xp += Math.round(2000 * self.stats.xp);
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 2 && self.quest === 'qBridge'){
            self.questStage += 1;
            self.invincible = false;
            socket.emit('dialougeLine',{
                state:'remove',
            });
            socket.emit('questInfo',{
                questName:'Bridge',
                questDescription:'Make it across a bridge.',
            });
            self.currentResponse = 0;
        }
        if(self.questInfo.started === true && self.questStage === 3 && self.quest === 'qBridge'){
            self.questStage += 1;
        }
        if(self.currentResponse === 2 && self.questStage === 2 && self.quest === 'qBridge'){
            self.quest = 'none';
            self.invincible = false;
            socket.emit('dialougeLine',{
                state:'remove',
            });
            self.currentResponse = 0;
        }
        if(self.map === 'The Bridge' && self.quest === 'qBridge' && self.questStage === 4 && self.mapChange > 10){
            for(var i in QuestInfo.list){
                if(QuestInfo.list[i].quest === 'qBridge' && QuestInfo.list[i].info === 'activator' && self.isColliding(QuestInfo.list[i]) && self.questStage === 4){
                    self.questStage += 1;
                }
            }
        }
        if(self.quest === 'qBridge' && self.questStage === 5){
            for(var i in QuestInfo.list){
                
                if(QuestInfo.list[i].quest === 'qBridge' && QuestInfo.list[i].info === 'teleport'){
                    self.teleport(QuestInfo.list[i].x,QuestInfo.list[i].y,QuestInfo.list[i].map);
                }
            }
            self.questStage += 1;
        }
        if(self.questStage === 6 && self.quest === 'qBridge'){
            self.questStage += 1;
            self.invincible = true;
            socket.emit('dialougeLine',{
                state:'ask',
                message:'See! I knew you couldn\'t make it!',
                response1:'I\'ll try again.',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 7 && self.quest === 'qBridge'){
            self.questStage += 1;
            for(var i in QuestInfo.list){
                if(QuestInfo.list[i].quest === 'qBridge' && QuestInfo.list[i].info === 'spawner'){
                    self.questDependent[i] = new Monster({
                        spawnId:0,
                        x:QuestInfo.list[i].x,
                        y:QuestInfo.list[i].y,
                        map:'The Bridge',
                        moveSpeed:0,
                        monsterType:'orange',
                        stats:{
                            attack:30,
                            defense:30,
                            heal:1,
                        },
                        onDeath:function(pt){
                            pt.toRemove = true;
                            for(var i in Projectile.list){
                                if(Projectile.list[i].parent === pt.id){
                                    Projectile.list[i].toRemove = true;
                                }
                            }
                        },
                    });
                }
            }
            self.invincible = false;
            socket.emit('dialougeLine',{
                state:'remove',
            });
            self.currentResponse = 0;
        }
        if(self.map === 'The Bridge' && self.quest === 'qBridge' && self.questStage === 8 && self.mapChange > 10){
            for(var i in QuestInfo.list){
                if(QuestInfo.list[i].quest === 'qBridge' && QuestInfo.list[i].info === 'complete' && self.isColliding(QuestInfo.list[i]) && self.questStage === 8){
                    self.questStage += 1;
                    self.invincible = true;
                    socket.emit('dialougeLine',{
                        state:'ask',
                        message:'Wow! I can\'t believe you made it!',
                        response1:'*End conversation*',
                    });
                }
            }
        }
        if(self.currentResponse === 1 && self.questStage === 9 && self.quest === 'qBridge'){
            self.quest = 'none';
            self.invincible = false;
            socket.emit('dialougeLine',{
                state:'remove',
            });
            self.xp += Math.round(2000 * self.stats.xp);
            self.currentResponse = 0;
        }
    }
    self.updateStats = function(){
        if(self.inventory.refresh){
            self.inventory.refresh = false;
            self.stats = {
                attack:1,
                defense:1,
                heal:1,
                xp:1,
            }
            self.hpMax = 1000;
            for(var i in self.inventory.currentEquip){
                if(self.inventory.currentEquip[i] !== ''){
                    try{
                        Item.list[self.inventory.currentEquip[i]].event(self);
                    }
                    catch(err){
                        console.log(err);
                    }
                }
            }
            for(var i in self.inventory.items){
                if(self.inventory.items[i].id === 'xpgem'){
                    try{
                        for(var j = 0;j < self.inventory.items[i].amount;j++){
                            Item.list[self.inventory.items[i].id].event(self);
                        }
                    }
                    catch(err){
                        console.log(err);
                    }
                }
            }
            self.hpMax = Math.round(self.hpMax);
            if(self.inventory.spawn === true){
                self.inventory.spawn = false;
                self.hp = self.hpMax;
            }
        }
    }
    self.updateMap = function(){
        if(self.mapChange === 0){
            self.canMove = false;
            socket.emit('changeMap',self.transporter);
        }
        if(self.mapChange === 5){
            var map = self.map;
            playerMap[self.map] -= 1;
            self.map = self.transporter.teleport;
            if(self.transporter.teleportx !== -1){
                self.x = self.transporter.teleportx;
            }
            if(self.transporter.teleporty !== -1){
                self.y = self.transporter.teleporty;
            }
            self.mapWidth = self.transporter.mapx;
            self.mapHeight = self.transporter.mapy;
            playerMap[self.map] += 1;
            if(map !== self.map){
                for(var i in Spawner.list){
                    if(Spawner.list[i].map === self.map && Spawner.list[i].spawned === false){
                        if(Math.random() < 0.00001){
                           monsterType = 'black';
                           var monster = new Monster({
                               spawnId:i,
                               x:Spawner.list[i].x,
                               y:Spawner.list[i].y,
                               map:Spawner.list[i].map,
                               moveSpeed:20,
                               monsterType:monsterType,
                               stats:{
                                   attack:Infinity,
                                   defense:1,
                                   heal:1,
                               },
                               onDeath:function(pt){
                                   pt.toRemove = true;
                                   if(pt.spawnId){
                                       Spawner.list[pt.spawnId].spawned = false;
                                   }
                                   for(var i in Projectile.list){
                                       if(Projectile.list[i].parent === pt.id){
                                           Projectile.list[i].toRemove = true;
                                       }
                                   }
                               },
                            });
                        }
                        else if(Math.random() < 0.000001){
                           monsterType = 'white';
                           var monster = new Monster({
                               spawnId:i,
                               x:Spawner.list[i].x,
                               y:Spawner.list[i].y,
                               map:Spawner.list[i].map,
                               moveSpeed:2.5,
                               monsterType:monsterType,
                               stats:{
                                   attack:1,
                                   defense: Infinity,
                                   heal:Infinity,
                               },
                               onDeath:function(pt){
                                   pt.toRemove = true;
                                   if(pt.spawnId){
                                       Spawner.list[pt.spawnId].spawned = false;
                                   }
                                   for(var i in Projectile.list){
                                       if(Projectile.list[i].parent === pt.id){
                                           Projectile.list[i].toRemove = true;
                                       }
                                   }
                               },
                            });
                        }
                        else {
                            var monsterType = 'purple';
                            if(Math.random() < 0.1){
                                monsterType = 'green';
                            }
                            if(Math.random() < 0.01){
                                monsterType = 'blue';
                            }
                            var monster = new Monster({
                                spawnId:i,
                                x:Spawner.list[i].x,
                                y:Spawner.list[i].y,
                                map:Spawner.list[i].map,
                                moveSpeed:2,
                                monsterType:monsterType,
                                onDeath:function(pt){
                                    pt.toRemove = true;
                                    if(pt.spawnId){
                                        Spawner.list[pt.spawnId].spawned = false;
                                    }
                                    for(var i in Projectile.list){
                                        if(Projectile.list[i].parent === pt.id){
                                            Projectile.list[i].toRemove = true;
                                        }
                                    }
                                },
                            });
                        }
                        Spawner.list[i].spawned = true;
                    }
                }
                var d = new Date();
                var m = '' + d.getMinutes();
                if(m.length === 1){
                    m = '' + 0 + m;
                }
                if(m === '0'){
                    m = '00';
                }
                console.error("[" + d.getHours() + ":" + m + "] " + self.username + " went to map " + self.map + ".");
                for(var i in SOCKET_LIST){
                    SOCKET_LIST[i].emit('addToChat',{
                        style:'style="color: ' + self.textColor + '">',
                        message:self.username + " went to map " + self.map + "."
                    });
                }
            }
            var pack = {player:[],projectile:[],monster:[],npc:[]};
            for(var i in Player.list){
                if(Player.list[i] && Player.list[i].map === self.map){
                    pack.player.push(Player.list[i].getInitPack());
                }
            }
            for(var i in Projectile.list){
                if(Projectile.list[i] && Projectile.list[i].map === self.map){
                    pack.projectile.push(Projectile.list[i].getInitPack());
                }
            }
            for(var i in Monster.list){
                if(Monster.list[i] && Monster.list[i].map === self.map){
                    pack.monster.push(Monster.list[i].getInitPack());
                }
            }
            for(var i in Npc.list){
                if(Npc.list[i] && Npc.list[i].map === self.map){
                    pack.npc.push(Npc.list[i].getInitPack());
                }
            }
            socket.emit('update',pack);
            for(var i in Player.list){
                if(Player.list[i]){
                    SOCKET_LIST[i].emit('initEntity',self.getInitPack());
                }
            }
        }
        if(self.mapChange === 10){
            self.canMove = true;
            self.invincible = false;
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
        if(self.state === 'dead'){
            self.spdX = 0;
            self.spdY = 0;
        }
        if(self.spdX === 1){
            if(self.spdY === 1){
                self.animationDirection = "rightdown";
            }
            else if(self.spdY === -1){
                self.animationDirection = "rightup";
            }
            else if(self.spdY === 0){
                self.animationDirection = "right";
            }
        }
        else if(self.spdX === -1){
            if(self.spdY === 1){
                self.animationDirection = "leftdown";
            }
            else if(self.spdY === -1){
                self.animationDirection = "leftup";
            }
            else if(self.spdY === 0){
                self.animationDirection = "left";
            }
        }
        else if(self.spdX === 0){
            if(self.spdY === 1){
                self.animationDirection = "down";
            }
            else if(self.spdY === -1){
                self.animationDirection = "up";
            }
            else if(self.spdY === 0){
                self.animation = -1;
                switch(Math.round(self.direction / 45)){
                    case 0:
                        self.animationDirection = "right"
                        break;
                    case 1:
                        self.animationDirection = "rightdown"
                        break;
                    case 2:
                        self.animationDirection = "down"
                        break;
                    case 3:
                        self.animationDirection = "leftdown"
                        break;
                    case 4:
                        self.animationDirection = "left"
                        break;
                    case -1:
                        self.animationDirection = "rightup"
                        break;
                    case -2:
                        self.animationDirection = "up"
                        break;
                    case -3:
                        self.animationDirection = "leftup"
                        break;
                    case -4:
                        self.animationDirection = "left"
                        break;
                }
            }
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
    self.updateXp = function(){
        if(self.level > 52){
            self.xpMax = self.xp;
            return;
        }
        if(self.xp >= self.xpMax){
            self.xp = self.xp - self.xpMax;
            self.level += 1;
            self.xpMax = xpLevels[self.level].xp;
            if(xpLevels[self.level].gems > 0){
                self.inventory.addItem('xpgem',xpLevels[self.level].gems);
            }
            var d = new Date();
            var m = '' + d.getMinutes();
            if(m.length === 1){
                m = '' + 0 + m;
            }
            if(m === '0'){
                m = '00';
            }
            console.error("[" + d.getHours() + ":" + m + "] " + self.username + ' is now level ' + self.level + '.');
            for(var i in SOCKET_LIST){
                SOCKET_LIST[i].emit('addToChat',{
                    style:'style="color: #00ff00">',
                    message:self.username + ' is now level ' + self.level + '.',
                });
            }
        }
    }
    self.updateAttack = function(){
        if(self.state !== 'dead'){
            if(self.keyPress.attack === true && self.attackReload > 15 && self.map !== "Village" && self.map !== "House" && self.map !== "Starter House" && self.map !== "Secret Base" && self.map !== "Cacti Farm" && self.map !== "The Guarded Citadel"){
                self.attackReload = 1;
                self.attackTick = 0;
            }
            if(self.keyPress.second === true && self.secondReload > 250 && self.map !== "Village" && self.map !== "House" && self.map !== "Starter House" && self.map !== "Secret Base" && self.map !== "Cacti Farm" && self.map !== "The Guarded Citadel"){
                self.secondReload = 1;
                self.secondTick = 0;
            }
            if(self.keyPress.heal === true && self.healReload > 500){
                self.healReload = 1;
                self.healTick = 0;
            }
        }
        if(self.attackTick === 0 && self.state !== 'dead' && self.map !== "Village" && self.map !== "House" && self.map !== "Starter House" && self.map !== "Secret Base" && self.map !== "Cacti Farm" && self.map !== "The Guarded Citadel"){
            self.shootProjectile(self.id,'Player',self.direction - 15,self.direction - 15,'Bullet',0,self.stats);
            self.shootProjectile(self.id,'Player',self.direction - 5,self.direction - 5,'Bullet',0,self.stats);
            self.shootProjectile(self.id,'Player',self.direction + 5,self.direction + 5,'Bullet',0,self.stats);
            self.shootProjectile(self.id,'Player',self.direction + 15,self.direction + 15,'Bullet',0,self.stats);
        }
        if(self.secondTick === 0 && self.state !== 'dead' && self.map !== "Village" && self.map !== "House" && self.map !== "Starter House" && self.map !== "Secret Base" && self.map !== "Cacti Farm" && self.map !== "The Guarded Citadel"){
            for(var i = 0;i < 10;i++){
                self.shootProjectile(self.id,'Player',i * 36,i * 36,'Bullet',0,self.stats);
            }
        }
        if(self.secondTick === 20 && self.state !== 'dead' && self.map !== "Village" && self.map !== "House" && self.map !== "Starter House" && self.map !== "Secret Base" && self.map !== "Cacti Farm" && self.map !== "The Guarded Citadel"){
            for(var i = 0;i < 10;i++){
                self.shootProjectile(self.id,'Player',i * 36,i * 36,'Bullet',0,self.stats);
            }
        }
        if(self.secondTick === 40 && self.state !== 'dead' && self.map !== "Village" && self.map !== "House" && self.map !== "Starter House" && self.map !== "Secret Base" && self.map !== "Cacti Farm" && self.map !== "The Guarded Citadel"){
            for(var i = 0;i < 10;i++){
                self.shootProjectile(self.id,'Player',i * 36,i * 36,'Bullet',0,self.stats);
            }
        }
        if(self.secondTick === 60 && self.state !== 'dead' && self.map !== "Village" && self.map !== "House" && self.map !== "Starter House" && self.map !== "Secret Base" && self.map !== "Cacti Farm" && self.map !== "The Guarded Citadel"){
            for(var i = 0;i < 10;i++){
                self.shootProjectile(self.id,'Player',i * 36,i * 36,'Bullet',0,self.stats);
            }
        }
        if(self.healTick === 0 && self.state !== 'dead'){
            self.hp += Math.round(self.stats.heal * 200);
        }
        if(self.healTick === 40 && self.state !== 'dead'){
            self.hp += Math.round(self.stats.heal * 200);
        }
        if(self.healTick === 80 && self.state !== 'dead'){
            self.hp += Math.round(self.stats.heal * 200);
        }
        if(self.healTick === 120 && self.state !== 'dead'){
            self.hp += Math.round(self.stats.heal * 200);
        }
    }
    self.getUpdatePack = function(){
        var pack = {};
        pack.id = self.id;
        if(lastSelf.x !== self.x){
            pack.x = self.x;
            lastSelf.x = self.x;
        }
        if(lastSelf.y !== self.y){
            pack.y = self.y;
            lastSelf.y = self.y;
        }
        if(lastSelf.spdX !== self.spdX){
            pack.spdX = self.spdX;
            lastSelf.spdX = self.spdX;
        }
        if(lastSelf.spdY !== self.spdY){
            pack.spdY = self.spdY;
            lastSelf.spdY = self.spdY;
        }
        if(lastSelf.hp !== self.hp){
            pack.hp = self.hp;
            lastSelf.hp = self.hp;
        }
        if(lastSelf.hpMax !== self.hpMax){
            pack.hpMax = self.hpMax;
            lastSelf.hpMax = self.hpMax;
        }
        if(lastSelf.xp !== self.xp){
            pack.xp = self.xp;
            lastSelf.xp = self.xp;
        }
        if(lastSelf.xpMax !== self.xpMax){
            pack.xpMax = self.xpMax;
            lastSelf.xpMax = self.xpMax;
        }
        if(lastSelf.level !== self.level){
            pack.level = self.level;
            lastSelf.level = self.level;
        }
        if(lastSelf.map !== self.map){
            pack.map = self.map;
            lastSelf.map = self.map;
        }
        if(lastSelf.username !== self.username){
            pack.username = self.username;
            lastSelf.username = self.username;
        }
        if(lastSelf.img !== self.img){
            pack.img = self.img;
            lastSelf.img = self.img;
        }
        if(lastSelf.animationDirection !== self.animationDirection){
            pack.animationDirection = self.animationDirection;
            lastSelf.animationDirection = self.animationDirection;
        }
        if(lastSelf.animation !== self.animation){
            pack.animation = self.animation;
            lastSelf.animation = self.animation;
        }
        if(lastSelf.attackReload !== self.attackReload){
            pack.attackReload = self.attackReload;
            lastSelf.attackReload = self.attackReload;
        }
        if(lastSelf.secondReload !== self.secondReload){
            pack.secondReload = self.secondReload;
            lastSelf.secondReload = self.secondReload;
        }
        if(lastSelf.healReload !== self.healReload){
            pack.healReload = self.healReload;
            lastSelf.healReload = self.healReload;
        }
        if(lastSelf.mapWidth !== self.mapWidth){
            pack.mapWidth = self.mapWidth;
            lastSelf.mapWidth = self.mapWidth;
        }
        if(lastSelf.mapHeight !== self.mapHeight){
            pack.mapHeight = self.mapHeight;
            lastSelf.mapHeight = self.mapHeight;
        }
        if(lastSelf.moveSpeed !== self.moveSpeed){
            pack.moveSpeed = self.moveSpeed;
            lastSelf.moveSpeed = self.moveSpeed;
        }
        if(lastSelf.direction !== self.direction){
            pack.direction = self.direction;
            lastSelf.direction = self.direction;
        }
        pack.stats = self.stats;
        return pack;
    }
    self.getInitPack = function(){
        var pack = {};
        pack.id = self.id;
        pack.x = self.x;
        pack.y = self.y;
        pack.spdX = self.spdX;
        pack.spdY = self.spdY;
        pack.hp = self.hp;
        pack.hpMax = self.hpMax;
        pack.xp = self.xp;
        pack.xpMax = self.xpMax;
        pack.level = self.level;
        pack.map = self.map;
        pack.username = self.username;
        pack.img = self.img;
        pack.direction = self.direction;
        pack.animationDirection = self.animationDirection;
        pack.animation = self.animation;
        pack.attackReload = self.attackReload;
        pack.secondReload = self.secondReload;
        pack.healReload = self.healReload;
        pack.mapWidth = self.mapWidth;
        pack.mapHeight = self.mapHeight;
        pack.stats = self.stats;
        pack.type = self.type;
        return pack;
    }
    Player.list[self.id] = self;
    return self;
}

Player.list = {};

Player.onConnect = function(socket,username){
    getDatabase(username,function(param){
        var player = Player({
            id:socket.id,
            username:username,
            moveSpeed:0,
            param:param,
        });
        socket.emit('selfId',{id:socket.id});

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
            if(data.inputId === 'releaseAll'){
                player.keyPress = {
                    up:false,
                    down:false,
                    left:false,
                    right:false,
                    attack:false,
                    second:false,
                    heal:false,
                };
            }
        });

        socket.on('diolougeResponse',function(data){
            player.currentResponse = data;
        });

        socket.on('respawn',function(data){
            player.hp = Math.round(player.hpMax / 2);
            var d = new Date();
			var m = '' + d.getMinutes();
			if(m.length === 1){
				m = '' + 0 + m;
			}
			if(m === '0'){
				m = '00';
			}
            console.error("[" + d.getHours() + ":" + m + "] " + player.username + ' respawned.');
            for(var i in SOCKET_LIST){
                SOCKET_LIST[i].emit('addToChat',{
                    style:'style="color: #00ff00">',
                    message:player.username + ' respawned.'
                });
            }
        });

        socket.on('startQuest',function(data){
            player.questInfo.started = true;
        });


        socket.on('init',function(data){
            var pack = {player:[],projectile:[],monster:[],npc:[]};
            for(var i in Player.list){
                if(Player.list[i].map === player.map){
                    pack.player.push(Player.list[i].getInitPack());
                }
            }
            for(var i in Projectile.list){
                if(Projectile.list[i].map === player.map){
                    pack.projectile.push(Projectile.list[i].getInitPack());
                }
            }
            for(var i in Monster.list){
                if(Monster.list[i].map === player.map){
                    pack.monster.push(Monster.list[i].getInitPack());
                }
            }
            for(var i in Npc.list){
                if(Npc.list[i].map === player.map){
                    pack.npc.push(Npc.list[i].getInitPack());
                }
            }
            socket.emit('update',pack);
        });
        var pack = {player:[],projectile:[],monster:[],npc:[]};
        for(var i in Player.list){
            if(Player.list[i].map === player.map){
                pack.player.push(Player.list[i].getInitPack());
            }
        }
        for(var i in Projectile.list){
            if(Projectile.list[i].map === player.map){
                pack.projectile.push(Projectile.list[i].getInitPack());
            }
        }
        for(var i in Monster.list){
            if(Monster.list[i].map === player.map){
                pack.monster.push(Monster.list[i].getInitPack());
            }
        }
        for(var i in Npc.list){
            if(Npc.list[i].map === player.map){
                pack.npc.push(Npc.list[i].getInitPack());
            }
        }
        socket.emit('update',pack);
    });
    var d = new Date();
    var m = '' + d.getMinutes();
    if(m.length === 1){
        m = '' + 0 + m;
    }
    if(m === '0'){
        m = '00';
    }
    console.error("[" + d.getHours() + ":" + m + "] " + username + " just logged on.");
    for(var i in SOCKET_LIST){
        SOCKET_LIST[i].emit('addToChat',{
            style:'style="color: #00ff00">',
            message:username + " just logged on.",
            logOnMessage:true,
        });
    }

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
        Player.list[socket.id].state = 'dead';
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
        storeDatabase(Player.list);
        for(var i in Player.list[socket.id].questDependent){
            delete Player.list[socket.id].questDependent[i];
        }
        var d = new Date();
        var m = '' + d.getMinutes();
        if(m.length === 1){
            m = '' + 0 + m;
        }
        if(m === '0'){
            m = '00';
        }
        console.error("[" + d.getHours() + ":" + m + "] " + Player.list[socket.id].username + " logged off.");
        for(var i in SOCKET_LIST){
            SOCKET_LIST[i].emit('addToChat',{
                style:'style="color: #ff0000">',
                message:Player.list[socket.id].username + " logged off."
            });
        }
        playerMap[Player.list[socket.id].map] -= 1;
        delete Player.list[socket.id];
    }
}



Npc = function(param){
	var self = Actor(param);
	self.id = Math.random();
    self.map = param.map;
    self.type = 'Npc';
    self.img = 'Npc';
    self.name = param.name;
    self.username = param.username;
    var lastSelf = {};
	var super_update = self.update;
    self.mapHeight = 3200;
    self.mapWidth = 3200;
    self.width = 24;
    self.height = 28;
    self.canMove = true;
    self.randomWalk(true,self.x,self.y);
	self.update = function(){
        self.mapChange += 1;
        self.moveSpeed = self.maxSpeed;
        for(var i = 0;i < self.moveSpeed;i++){
            self.updateMove();
            self.updateAnimation();
            if(self.canMove){
                self.x += self.spdX;
                self.y += self.spdY;
            }
            self.updateCollisions();
            if(self.randomPos.walking && self.x === self.lastX){
                self.spdX = Math.round(Math.random() * 2 - 1);
                self.randomPos.directionX = self.spdX;
            }
            if(self.randomPos.walking && self.y === self.lastY){
                self.spdY = Math.round(Math.random() * 2 - 1);
                self.randomPos.directionY = self.spdY;
            }
        }
        if(self.mapChange === 5){
            self.map = self.transporter.teleport;
            if(self.transporter.teleportx !== -1){
                self.x = self.transporter.teleportx;
            }
            if(self.transporter.teleporty !== -1){
                self.y = self.transporter.teleporty;
            }
            self.mapWidth = self.transporter.mapx;
            self.mapHeight = self.transporter.mapy;
            self.canMove = false;
            for(var i in Player.list){
                if(Player.list[i]){
                    SOCKET_LIST[i].emit('initEntity',self.getInitPack());
                }
            }
        }
        if(self.mapChange === 10){
            self.canMove = true;
            self.invincible = false;
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
        if(self.animation === -1){
            self.animation = 0;
        }
        else{
            self.animation += 0.5;
            if(self.animation > 5){
                self.animation = 0;
            }
        }
    }
	self.getUpdatePack = function(){
        var pack = {};
        pack.id = self.id;
        if(lastSelf.x !== self.x){
            pack.x = self.x;
            lastSelf.x = self.x;
        }
        if(lastSelf.y !== self.y){
            pack.y = self.y;
            lastSelf.y = self.y;
        }
        if(lastSelf.spdX !== self.spdX){
            pack.spdX = self.spdX;
            lastSelf.spdX = self.spdX;
        }
        if(lastSelf.spdY !== self.spdY){
            pack.spdY = self.spdY;
            lastSelf.spdY = self.spdY;
        }
        if(lastSelf.animationDirection !== self.animationDirection){
            pack.animationDirection = self.animationDirection;
            lastSelf.animationDirection = self.animationDirection;
        }
        if(lastSelf.animation !== self.animation){
            pack.animation = self.animation;
            lastSelf.animation = self.animation;
        }
        if(lastSelf.map !== self.map){
            pack.map = self.map;
            lastSelf.map = self.map;
        }
        return pack;
	}
    self.getInitPack = function(){
        var pack = {};
        pack.id = self.id;
        pack.x = self.x;
        pack.y = self.y;
        pack.spdX = self.spdX;
        pack.spdY = self.spdY;
        pack.map = self.map;
        pack.img = self.img;
        pack.animationDirection = self.animationDirection;
        pack.animation = self.animation;
        pack.name = self.name;
        pack.type = self.type;
        return pack;
    }
	Npc.list[self.id] = self;
	return self;
}
Npc.list = {};

QuestNpc = function(param){
    var self = Npc(param);
	self.id = Math.random();
    self.map = param.map;
    self.type = 'QuestNpc';
    self.img = param.img;
    self.name = param.name;
    self.username = param.username;
    var lastSelf = {};
	var super_update = self.update;
    self.mapHeight = Maps[self.map].height;
    self.mapWidth = Maps[self.map].width;
    self.width = 24;
    self.height = 28;
    self.canMove = true;
	self.update = function(){
        super_update();
    }
	self.getUpdatePack = function(){
        var pack = {};
        pack.id = self.id;
        if(lastSelf.x !== self.x){
            pack.x = self.x;
            lastSelf.x = self.x;
        }
        if(lastSelf.y !== self.y){
            pack.y = self.y;
            lastSelf.y = self.y;
        }
        if(lastSelf.spdX !== self.spdX){
            pack.spdX = self.spdX;
            lastSelf.spdX = self.spdX;
        }
        if(lastSelf.spdY !== self.spdY){
            pack.spdY = self.spdY;
            lastSelf.spdY = self.spdY;
        }
        if(lastSelf.animationDirection !== self.animationDirection){
            pack.animationDirection = self.animationDirection;
            lastSelf.animationDirection = self.animationDirection;
        }
        if(lastSelf.animation !== self.animation){
            pack.animation = self.animation;
            lastSelf.animation = self.animation;
        }
        if(lastSelf.map !== self.map){
            pack.map = self.map;
            lastSelf.map = self.map;
        }
        return pack;
	}
    self.getInitPack = function(){
        var pack = {};
        pack.id = self.id;
        pack.x = self.x;
        pack.y = self.y;
        pack.spdX = self.spdX;
        pack.spdY = self.spdY;
        pack.map = self.map;
        pack.img = self.img;
        pack.animationDirection = self.animationDirection;
        pack.animation = self.animation;
        pack.name = self.name;
        pack.type = self.type;
        return pack;
    }
	QuestNpc.list[self.id] = self;
	return self;
}

QuestNpc.list = [];


Monster = function(param){
    var self = Actor(param);
    self.spawnId = param.spawnId;
    self.attackState = "passive";
    self.direction = 0;
    self.width = 24;
    self.height = 24;
    self.toRemove = false;
    self.reload = 0;
    self.target = {};
    self.type = 'Monster';
    self.isDead = false;
    self.stats = {
        attack:1,
        defense:1,
        heal:1,
    }
    if(param.stats){
        self.stats = param.stats;
    }
    self.hp = 1000;
    self.hpMax = 1000;
    if(param.hpMax){
        self.hp = param.hpMax;
        self.hpMax = param.hpMax;
    }
    self.monsterType = param.monsterType;
    if(self.monsterType === 'red'){
        self.width = 48;
        self.height = 48;
    }
    if(self.monsterType === 'orange'){
        self.width = 96;
        self.height = 96;
    }
    if(param.attackState){
        self.attackState = param.attackState;
    }
    var lastSelf = {};
    var super_update = self.update;
    self.update = function(){
        super_update();
        self.updateAttack();
        if(self.target && self.target.state === "dead"){
            self.target = {};
            self.attackState = "passive";
        }
        if(self.hp < 1){
            param.onDeath(self);
        }
    }
    self.doTransport = function(transporter){

    }
    self.updateAttack = function(){
        if(self.target){
            self.direction = Math.atan2(self.target.y - self.y,self.target.x - self.x) / Math.PI * 180;
        }
        switch(self.attackState){
            case "passive":
                self.spdX = 0;
                self.spdY = 0;
                for(var i in Player.list){
                    if(Player.list[i].map === self.map && self.getDistance(Player.list[i]) < 512 && Player.list[i].state !== "dead" && Player.list[i].invincible === false && Player.list[i].mapChange > 10){
                        self.attackState = "move";
                        self.target = Player.list[i];
                    }
                }
                break;
            case "move":
                self.trackEntity(self.target);
                self.reload = 0;
                self.attackState = "attack";
                break;
            case "attack":
                if(self.reload % 20 === 0 && self.reload > 10 && self.target.invincible === false){
                    self.shootProjectile(self.id,'Monster',self.direction,self.direction,'W_Throw004 - Copy',0,self.stats);
                }
                if(self.reload % 100 < 5 && self.reload > 10 && self.target.invincible === false){
                    self.shootProjectile(self.id,'Monster',self.direction,self.direction,'W_Throw004 - Copy',0,self.stats);
                }
                self.reload += 1;
                if(self.getDistance(self.target) > 512 || self.target.state === 'dead'){
                    self.target = undefined;
                    self.attackState = 'passive';
                }
                break;
        }
    }
    self.getUpdatePack = function(){
        var pack = {};
        pack.id = self.id;
        if(lastSelf.x !== self.x){
            pack.x = self.x;
            lastSelf.x = self.x;
        }
        if(lastSelf.y !== self.y){
            pack.y = self.y;
            lastSelf.y = self.y;
        }
        if(lastSelf.hp !== self.hp){
            pack.hp = self.hp;
            lastSelf.hp = self.hp;
        }
        if(lastSelf.hpMax !== self.hpMax){
            pack.hpMax = self.hpMax;
            lastSelf.hpMax = self.hpMax;
        }
        if(lastSelf.map !== self.map){
            pack.map = self.map;
            lastSelf.map = self.map;
        }
        if(lastSelf.monsterType !== self.monsterType){
            pack.monsterType = self.monsterType;
            lastSelf.monsterType = self.monsterType;
        }
        return pack;
    }
    self.getInitPack = function(){
        var pack = {};
        pack.id = self.id;
        pack.x = self.x;
        pack.y = self.y;
        pack.hp = self.hp;
        pack.hpMax = self.hpMax;
        pack.map = self.map;
        pack.monsterType = self.monsterType;
        pack.type = self.type;
        return pack;
    }
    Monster.list[self.id] = self;
    return self;
}
Monster.list = {};



Pet = function(param){
	var self = Npc(param);
	self.id = Math.random();
    self.map = 'Village';
    self.parent = param.parent;
    self.reload = 0;
	var super_update = self.update;
    self.type = 'Pet';
    var lastSelf = {};
	self.update = function(){
        super_update();
        self.updateAttack();
    }
    self.updateAttack = function(){
        self.reload += 1;
        if(self.reload > 10){
            self.reload = 0;
            var direction = (Math.atan2(Player.list[self.parent].mouseY - Player.list[self.parent].y + self.y,Player.list[self.parent].mouseX - Player.list[self.parent].x + self.x) / Math.PI * 180);
            self.shootProjectile(self.parent,'Pet',direction,direction,'Bullet',35);
        }
    }
	self.getUpdatePack = function(){
        var pack = {};
        pack.id = self.id;
        if(lastSelf.x !== self.x){
            pack.x = self.x;
            lastSelf.x = self.x;
        }
        if(lastSelf.y !== self.y){
            pack.y = self.y;
            lastSelf.y = self.y;
        }
        if(lastSelf.hp !== self.hp){
            pack.hp = self.hp;
            lastSelf.hp = self.hp;
        }
        if(lastSelf.hpMax !== self.hpMax){
            pack.hpMax = self.hpMax;
            lastSelf.hpMax = self.hpMax;
        }
        if(lastSelf.map !== self.map){
            pack.map = self.map;
            lastSelf.map = self.map;
        }
        return pack;
	}
    self.getInitPack = function(){
        var pack = {};
        pack.id = self.id;
        pack.x = self.x;
        pack.y = self.y;
        pack.hp = self.hp;
        pack.hpMax = self.hpMax;
        pack.map = self.map;
        pack.type = self.type;
        return pack;
    }
	Pet.list[self.id] = self;
	return self;
}
Pet.list = {};



Projectile = function(param){
	var self = Entity(param);
	self.id = Math.random();
	self.parent = param.id;
	self.spdX = Math.cos(param.angle/180 * Math.PI) * 50;
    self.spdY = Math.sin(param.angle/180 * Math.PI) * 50;
    self.mapWidth = param.mapWidth;
    self.mapHeight = param.mapHeight;
    self.width = 48;
    self.height = 48;
	self.direction = param.direction;
	self.timer = 0;
	self.toRemove = false;
    self.type = 'Projectile';
    self.stats = param.stats;
    self.parentType = param.parentType;
    self.projectileType = param.projectileType;
    self.onCollision = param.onCollision;
    var lastSelf = {};
	var super_update = self.update;
	self.update = function(){
        super_update();
        self.timer += 1;
        if(self.timer > 30){
            self.toRemove = true;
        }
        if(self.x < self.width / 2){
            self.x = self.width / 2;
            self.toRemove = true;
        }
        if(self.x > self.mapWidth - self.width / 2){
            self.x = self.mapWidth - self.width / 2;
            self.toRemove = true;
        }
        if(self.y < self.height / 2){
            self.y = self.height / 2;
            self.toRemove = true;
        }
        if(self.y > self.mapHeight - self.height / 2){
            self.y = self.mapHeight - self.height / 2;
            self.toRemove = true;
        }
        self.direction += 25;
        self.updateCollisions();
    }
    self.updateCollisions = function(){
        var firstTile = "" + self.map + ":" + Math.round((self.x - 64) / 64) * 64 + ":" + Math.round((self.y - 64) / 64) * 64 + ":";
        var secondTile = "" + self.map + ":" + Math.round((self.x - 64) / 64) * 64 + ":" + Math.round(self.y / 64) * 64 + ":";
        var thirdTile = "" + self.map + ":" + Math.round(self.x / 64) * 64 + ":" + Math.round((self.y - 64) / 64) * 64 + ":";
        var fourthTile = "" + self.map + ":" + Math.round(self.x / 64) * 64 + ":" + Math.round(self.y / 64) * 64 + ":";
        if(Collision.list[firstTile]){
            if(self.isColliding(Collision.list[firstTile])){
                self.toRemove = true;
            }
        }
        if(Collision.list[secondTile]){
            if(self.isColliding(Collision.list[secondTile])){
                self.toRemove = true;
            }
        }
        if(Collision.list[thirdTile]){
            if(self.isColliding(Collision.list[thirdTile])){
                self.toRemove = true;
            }
        }
        if(Collision.list[fourthTile]){
            if(self.isColliding(Collision.list[fourthTile])){
                self.toRemove = true;
            }
        }
    }
	self.getUpdatePack = function(){
        var pack = {};
        pack.id = self.id;
        if(lastSelf.x !== self.x){
            pack.x = self.x;
            lastSelf.x = self.x;
        }
        if(lastSelf.y !== self.y){
            pack.y = self.y;
            lastSelf.y = self.y;
        }
        if(lastSelf.spdX !== self.spdX){
            pack.spdX = self.spdX;
            lastSelf.spdX = self.spdX;
        }
        if(lastSelf.spdY !== self.spdY){
            pack.spdY = self.spdY;
            lastSelf.spdY = self.spdY;
        }
        if(lastSelf.map !== self.map){
            pack.map = self.map;
            lastSelf.map = self.map;
        }
        if(lastSelf.projectileType !== self.projectileType){
            pack.projectileType = self.projectileType;
            lastSelf.projectileType = self.projectileType;
        }
        if(lastSelf.direction !== self.direction){
            pack.direction = self.direction;
            lastSelf.direction = self.direction;
        }
        return pack;
	}
    self.getInitPack = function(){
        var pack = {};
        pack.id = self.id;
        pack.x = self.x;
        pack.y = self.y;
        pack.spdX = self.spdX;
        pack.spdY = self.spdY;
        pack.map = self.map;
        pack.type = self.type;
        pack.projectileType = self.projectileType;
        pack.direction = self.direction;
        return pack;
    }
	Projectile.list[self.id] = self;
	return self;
}
Projectile.list = {};



var mapLocations = [
    ['','Lower Deadlands','',''],
    ['','The Outskirts','Forest',''],
    ['The Bridge','River','Village','The Pathway'],
    ['Lilypad Kingdom','Lilypad Path Part 1','Upper Mine Deposit',''],
    ['Lilypad Path Part 3','Lilypad Path Part 2','',''],
];
var renderLayer = function(layer,data,loadedMap){
    if(layer.type !== "tilelayer" && layer.visible === false){
        return;
    }
    var size = data.tilewidth;
    if(data.backgroundcolor){
        Maps[loadedMap] = {width:layer.width * size,height:layer.height * size};
        playerMap[loadedMap] = 0;
    }
    else{
        for(var i = 0;i < mapLocations.length;i++){
            for(var j = 0;j < mapLocations[i].length;j++){
                Maps[mapLocations[i][j]] = {width:3200,height:3200};
                playerMap[mapLocations[i][j]] = 0;
            }
        }
    }
    for(var i = 0;i < layer.data.length;i++){
        var tile_idx = layer.data[i];
        if(tile_idx){
            if(data.backgroundcolor){
                var x = (i % layer.width) * size;
                var y = ~~(i / layer.width) * size;
                var map = loadedMap;
            }
            else{
                var x = ((i % layer.width) * size) % 3200;
                var y = (~~(i / layer.width) * size) % 3200;
                var map = mapLocations[~~(~~(i / layer.width) * size / 3200)][~~((i % layer.width) * size / 3200)];
            }
            tile = data.tilesets[0];
            if(tile_idx === 2122){
                var collision = new Collision({
                    x:x + 32,
                    y:y + 32,
                    width:size,
                    height:size,
                    map:map,
                });
            }
            if(tile_idx === 2123){
                var collision = new Collision({
                    x:x + 32,
                    y:y + 48,
                    width:size,
                    height:size / 2,
                    map:map,
                });
            }
            if(tile_idx === 2124){
                var collision = new Collision({
                    x:x + 32,
                    y:y + 16,
                    width:size,
                    height:size / 2,
                    map:map,
                });
            }
            if(tile_idx === 2125){
                var collision = new Collision({
                    x:x + 16,
                    y:y + 32,
                    width:size / 2,
                    height:size,
                    map:map,
                });
            }
            if(tile_idx === 2126){
                var collision = new Collision({
                    x:x + 48,
                    y:y + 32,
                    width:size / 2,
                    height:size,
                    map:map,
                });
            }
            if(tile_idx === 1950){
                /*
                var projectileCollision = new ProjectileCollision({
                    x:x,
                    y:y,
                    size:size,
                    map:map,
                });*/
                var type = "";
                var typej = 0;
                var id = "";
                var idj = 0;
                var name = "";
                for(var j = 0;j < layer.name.length;j++){
                    if(layer.name[j] === ':'){
                        if(type === ""){
                            type = layer.name.substr(0,j);
                            typej = j;
                        }
                        else if(id === ""){
                            id = layer.name.substr(typej + 1,j - typej - 1);
                            idj = j;
                        }
                        else if(name === ""){
                            name = layer.name.substr(idj + 1,j - idj - 1);
                        }
                    }
                }
                if(type === 'Npc'){
                    var npc = new Npc({
                        x:x + 32,
                        y:y + 32,
                        name:name,
                        username:id,
                        map:map,
                        moveSpeed:3,
                    });
                }
            }
            if(tile_idx === 1864){
                var slowDown = new SlowDown({
                    x:x + 32,
                    y:y + 32,
                    width:size,
                    height:size,
                    map:map,
                });
            }
            if(tile_idx === 1865){
                var slowDown = new SlowDown({
                    x:x + 32,
                    y:y + 48,
                    width:size,
                    height:size / 2,
                    map:map,
                });
            }
            if(tile_idx === 1866){
                var slowDown = new SlowDown({
                    x:x + 32,
                    y:y + 16,
                    width:size,
                    height:size / 2,
                    map:map,
                });
            }
            if(tile_idx === 1867){
                var slowDown = new SlowDown({
                    x:x + 16,
                    y:y + 32,
                    width:size / 2,
                    height:size,
                    map:map,
                });
            }
            if(tile_idx === 1868){
                var slowDown = new SlowDown({
                    x:x + 48,
                    y:y + 32,
                    width:size / 2,
                    height:size,
                    map:map,
                });
            }
            if(tile_idx === 1778){
                var spawner = new Spawner({
                    x:x + 32,
                    y:y + 32,
                    width:size,
                    height:size,
                    map:map,
                });
            }
            if(tile_idx === 1692){
                var quest = "";
                var questj = 0;
                var info = "";
                for(var j = 0;j < layer.name.length;j++){
                    if(layer.name[j] === ':'){
                        if(quest === ""){
                            quest = layer.name.substr(0,j);
                            questj = j;
                        }
                        else if(info === ""){
                            info = layer.name.substr(questj + 1,j - questj - 1);
                        }
                    }
                }
                var questInfo = new QuestInfo({
                    x:x + 32,
                    y:y + 32,
                    width:size,
                    height:size,
                    map:map,
                    info:info,
                    quest:quest,
                });
            }
            if(tile_idx === 2036){
                var teleport = "";
                var teleportj = 0;
                var teleportx = "";
                var teleportxj = 0;
                var teleporty = "";
                var teleportyj = 0;
                var direction = "";
                var directionj = "";
                var requirements = "none";
                for(var j = 0;j < layer.name.length;j++){
                    if(layer.name[j] === ':'){
                        if(teleport === ""){
                            teleport = layer.name.substr(0,j);
                            teleportj = j;
                        }
                        else if(teleportx === ""){
                            teleportx = layer.name.substr(teleportj + 1,j - teleportj - 1);
                            teleportxj = j;
                        }
                        else if(teleporty === ""){
                            teleporty = layer.name.substr(teleportxj + 1,j - teleportxj - 1);
                            teleportyj = j;
                        }
                        else if(direction === ""){
                            direction = layer.name.substr(teleportyj + 1,j - teleportyj - 1);
                            directionj = j;
                        }
                        else if(direction === ""){
                            requirements = layer.name.substr(directionj + 1,j - directionj - 1);
                        }
                    }
                }
                var transporter = new Transporter({
                    x:x + 32,
                    y:y + 32,
                    width:size,
                    height:size,
                    size:size,
                    teleport:teleport,
                    teleportx:teleportx,
                    teleporty:teleporty,
                    direction:direction,
                    map:map,
                    requirements:requirements,
                });
            }
            if(tile_idx === 2037){
                var teleport = "";
                var teleportj = 0;
                var teleportx = "";
                var teleportxj = 0;
                var teleporty = "";
                var teleportyj = 0;
                var direction = "";
                var directionj = "";
                var requirements = "none";
                for(var j = 0;j < layer.name.length;j++){
                    if(layer.name[j] === ':'){
                        if(teleport === ""){
                            teleport = layer.name.substr(0,j);
                            teleportj = j;
                        }
                        else if(teleportx === ""){
                            teleportx = layer.name.substr(teleportj + 1,j - teleportj - 1);
                            teleportxj = j;
                        }
                        else if(teleporty === ""){
                            teleporty = layer.name.substr(teleportxj + 1,j - teleportxj - 1);
                            teleportyj = j;
                        }
                        else if(direction === ""){
                            direction = layer.name.substr(teleportyj + 1,j - teleportyj - 1);
                            directionj = j;
                        }
                        else if(direction === ""){
                            requirements = layer.name.substr(directionj + 1,j - directionj - 1);
                        }
                    }
                }
                var transporter = new Transporter({
                    x:x + 32,
                    y:y + 48,
                    width:size,
                    height:size / 2,
                    teleport:teleport,
                    teleportx:teleportx,
                    teleporty:teleporty,
                    direction:direction,
                    map:map,
                    requirements:requirements,
                });
            }
            if(tile_idx === 2038){
                var teleport = "";
                var teleportj = 0;
                var teleportx = "";
                var teleportxj = 0;
                var teleporty = "";
                var teleportyj = 0;
                var direction = "";
                var directionj = "";
                var requirements = "none";
                for(var j = 0;j < layer.name.length;j++){
                    if(layer.name[j] === ':'){
                        if(teleport === ""){
                            teleport = layer.name.substr(0,j);
                            teleportj = j;
                        }
                        else if(teleportx === ""){
                            teleportx = layer.name.substr(teleportj + 1,j - teleportj - 1);
                            teleportxj = j;
                        }
                        else if(teleporty === ""){
                            teleporty = layer.name.substr(teleportxj + 1,j - teleportxj - 1);
                            teleportyj = j;
                        }
                        else if(direction === ""){
                            direction = layer.name.substr(teleportyj + 1,j - teleportyj - 1);
                            directionj = j;
                        }
                        else if(direction === ""){
                            requirements = layer.name.substr(directionj + 1,j - directionj - 1);
                        }
                    }
                }
                var transporter = new Transporter({
                    x:x + 32,
                    y:y + 16,
                    width:size,
                    height:size / 2,
                    teleport:teleport,
                    teleportx:teleportx,
                    teleporty:teleporty,
                    direction:direction,
                    map:map,
                    requirements:requirements,
                });
            }
            if(tile_idx === 2039){
                var teleport = "";
                var teleportj = 0;
                var teleportx = "";
                var teleportxj = 0;
                var teleporty = "";
                var teleportyj = 0;
                var direction = "";
                var directionj = "";
                var requirements = "none";
                for(var j = 0;j < layer.name.length;j++){
                    if(layer.name[j] === ':'){
                        if(teleport === ""){
                            teleport = layer.name.substr(0,j);
                            teleportj = j;
                        }
                        else if(teleportx === ""){
                            teleportx = layer.name.substr(teleportj + 1,j - teleportj - 1);
                            teleportxj = j;
                        }
                        else if(teleporty === ""){
                            teleporty = layer.name.substr(teleportxj + 1,j - teleportxj - 1);
                            teleportyj = j;
                        }
                        else if(direction === ""){
                            direction = layer.name.substr(teleportyj + 1,j - teleportyj - 1);
                            directionj = j;
                        }
                        else if(direction === ""){
                            requirements = layer.name.substr(directionj + 1,j - directionj - 1);
                        }
                    }
                }
                var transporter = new Transporter({
                    x:x + 16,
                    y:y + 32,
                    width:size / 2,
                    height:size,
                    teleport:teleport,
                    teleportx:teleportx,
                    teleporty:teleporty,
                    direction:direction,
                    map:map,
                    requirements:requirements,
                });
            }
            if(tile_idx === 2040){
                var teleport = "";
                var teleportj = 0;
                var teleportx = "";
                var teleportxj = 0;
                var teleporty = "";
                var teleportyj = 0;
                var direction = "";
                var directionj = "";
                var requirements = "none";
                for(var j = 0;j < layer.name.length;j++){
                    if(layer.name[j] === ':'){
                        if(teleport === ""){
                            teleport = layer.name.substr(0,j);
                            teleportj = j;
                        }
                        else if(teleportx === ""){
                            teleportx = layer.name.substr(teleportj + 1,j - teleportj - 1);
                            teleportxj = j;
                        }
                        else if(teleporty === ""){
                            teleporty = layer.name.substr(teleportxj + 1,j - teleportxj - 1);
                            teleportyj = j;
                        }
                        else if(direction === ""){
                            direction = layer.name.substr(teleportyj + 1,j - teleportyj - 1);
                            directionj = j;
                        }
                        else if(direction === ""){
                            requirements = layer.name.substr(directionj + 1,j - directionj - 1);
                        }
                    }
                }
                var transporter = new Transporter({
                    x:x + 48,
                    y:y + 32,
                    width:size / 2,
                    height:size,
                    teleport:teleport,
                    teleportx:teleportx,
                    teleporty:teleporty,
                    direction:direction,
                    map:map,
                    requirements:requirements,
                });
            }
        }
    }
}
var renderLayers = function(data,loadedMap){
    for(var i = 0;i < data.layers.length;i++){
        renderLayer(data.layers[i],data,loadedMap);
    }
}
var load = function(name){
    if(SERVER === 'localhost'){
        renderLayers(require("C:/Users/gu/Documents/game/client/maps/" + name + ".json"),name);
    }
    else{
        renderLayers(require("/app/client/maps/" + name + ".json"),name);
    }
}
load("World");
load("Starter House");
load("Cave");
load("House");
load("Secret Base");
load("Secret Base Basement");
load("Cacti Farm");
load("The Guarded Citadel");

updateCrashes = function(){
    for(var i in Player.list){
        for(var j in Projectile.list){
            if(Player.list[i] && Projectile.list[j]){
                if(Player.list[i].getDistance(Projectile.list[j]) < 30 && "" + Projectile.list[j].parent !== i && Projectile.list[j].parentType !== 'Player' && Player.list[i].state !== 'dead' && Projectile.list[j].map === Player.list[i].map){
                    Projectile.list[j].onCollision(Projectile.list[j],Player.list[i]);
                }
            }
        }
    }
    for(var i in Monster.list){
        for(var j in Projectile.list){
            if(Monster.list[i] && Projectile.list[j]){
                if(Monster.list[i].getDistance(Projectile.list[j]) < 30 && "" + Projectile.list[j].parent !== i && Projectile.list[j].parentType !== 'Monster' && Projectile.list[j].map === Monster.list[i].map && Monster.list[i].invincible === false){
                    Projectile.list[j].onCollision(Projectile.list[j],Monster.list[i]);
                }
            }
        }
    }
    for(var i in Npc.list){
        for(var j in Projectile.list){
            if(Npc.list[i] && Projectile.list[j]){
                if(Npc.list[i].getDistance(Projectile.list[j]) < 30 && "" + Projectile.list[j].parent != i && Projectile.list[j].map === Npc.list[i].map){
                    Projectile.list[j].toRemove = true;
                }
            }
        }
    }
}

spawnEnemies = function(){
    for(var i in Monster.list){
        if(playerMap[Monster.list[i].map] === 0){
            if(Monster.list[i].spawnId){
                Spawner.list[Monster.list[i].spawnId].spawned = false;
            }
            delete Monster.list[i];
        }
    }
    for(var i in Spawner.list){
        if(playerMap[Spawner.list[i].map] !== 0){
            if(Math.random() < 0.0005 && Spawner.list[i].spawned === false){
                if(Math.random() < 0.00001){
                   monsterType = 'black';
                   var monster = new Monster({
                       spawnId:i,
                       x:Spawner.list[i].x,
                       y:Spawner.list[i].y,
                       map:Spawner.list[i].map,
                       moveSpeed:20,
                       monsterType:monsterType,
                       stats:{
                           attack:Infinity,
                           defense:1,
                           heal:1,
                       },
                       onDeath:function(pt){
                           pt.toRemove = true;
                           if(pt.spawnId){
                               Spawner.list[pt.spawnId].spawned = false;
                           }
                           for(var i in Projectile.list){
                               if(Projectile.list[i].parent === pt.id){
                                   Projectile.list[i].toRemove = true;
                               }
                           }
                       },
                    });
                }
                else if(Math.random() < 0.000001){
                   monsterType = 'white';
                   var monster = new Monster({
                       spawnId:i,
                       x:Spawner.list[i].x,
                       y:Spawner.list[i].y,
                       map:Spawner.list[i].map,
                       moveSpeed:2.5,
                       monsterType:monsterType,
                       stats:{
                           attack:1,
                           defense: Infinity,
                           heal:Infinity,
                       },
                       onDeath:function(pt){
                           pt.toRemove = true;
                           if(pt.spawnId){
                               Spawner.list[pt.spawnId].spawned = false;
                           }
                           for(var i in Projectile.list){
                               if(Projectile.list[i].parent === pt.id){
                                   Projectile.list[i].toRemove = true;
                               }
                           }
                       },
                    });
                }
                else {
                    var monsterType = 'purple';
                    if(Math.random() < 0.1){
                        monsterType = 'green';
                    }
                    if(Math.random() < 0.01){
                        monsterType = 'blue';
                    }
                    var monster = new Monster({
                        spawnId:i,
                        x:Spawner.list[i].x,
                        y:Spawner.list[i].y,
                        map:Spawner.list[i].map,
                        moveSpeed:2,
                        monsterType:monsterType,
                        onDeath:function(pt){
                            pt.toRemove = true;
                            if(pt.spawnId){
                                Spawner.list[pt.spawnId].spawned = false;
                            }
                            for(var i in Projectile.list){
                                if(Projectile.list[i].parent === pt.id){
                                    Projectile.list[i].toRemove = true;
                                }
                            }
                        },
                    });
                Spawner.list[i].spawned = true;
            }
        }
    }
}

