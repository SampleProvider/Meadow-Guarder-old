
var playerMap = {
    'Village':0,
    'Cave':0,
    'Starter House':0,
    'House':0,
    'River':0,
    'Secret Base':0,
    'Lilypad Path Part 1':0,
    'The Outskirts':0,
    'Lower Deadlands':0,
    'Forest':0,
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
    var pack = {
        'Village':{player:[],projectile:[],monster:[],npc:[]},
        'Starter House':{player:[],projectile:[],monster:[],npc:[]},
        'Cave':{player:[],projectile:[],monster:[],npc:[]},
        'House':{player:[],projectile:[],monster:[],npc:[]},
        'River':{player:[],projectile:[],monster:[],npc:[]},
        'Secret Base':{player:[],projectile:[],monster:[],npc:[]},
        'Lilypad Path Part 1':{player:[],projectile:[],monster:[],npc:[]},
        'The Outskirts':{player:[],projectile:[],monster:[],npc:[]},
        'Lower Deadlands':{player:[],projectile:[],monster:[],npc:[]},
        'Forest':{player:[],projectile:[],monster:[],npc:[]},
    };
    for(var i in Player.list){
        if(Player.list[i]){
            Player.list[i].update();
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
                pack[Monster.list[i].map].monster.push(Monster.list[i].getUpdatePack());
            }
        }
    }
    for(var i in Projectile.list){
        Projectile.list[i].update();
    }
    for(var i in Npc.list){
        Npc.list[i].update();
        pack[Npc.list[i].map].npc.push(Npc.list[i].getUpdatePack());
    }
    for(var i in Projectile.list){
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
            if(self.x === self.trackingEntity.x && self.y === self.trackingEntity.y){
                self.trackingEntity = undefined;
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
        self.x = x;
        self.y = y;
        self.spdX = 0;
        self.spdY = 0;
        self.map = map;
        self.moveArray = [];
        self.mapWidth = Maps[map].width;
        self.mapHeight = Maps[map].height;
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
            stats:stats,
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
    self.xpMax = 1000;
    self.direction = 0;
    self.map = 'Starter House';
    playerMap[self.map] += 1;
    self.mapHeight = 640;
    self.mapWidth = 640;
    self.textColor = '#000000';
    self.quest = 'none';
    self.questStage = 0;
    self.type = 'Player';
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
    self.questInventory.addQuestItem("potion",10);
    self.stats = {
        attack:1,
        defense:1,
        heal:1,
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
                console.error(self.username + ' died.');
                for(var i in SOCKET_LIST){
                    SOCKET_LIST[i].emit('addToChat','style="color: #ff0000">' + self.username + ' died.');
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
                    self.hp += Math.round(10 + Math.random() * 15);
                }
            }
        }
        if(self.hp > self.hpMax){
            self.hp = self.hpMax;
        }
        if(!self.invincible){
            self.updateAttack();
        }
        self.updateMap();
        self.updateQuest();
    }
    self.updateQuest = function(){
        for(var i in Npc.list){
            if(Npc.list[i].map === self.map && self.mapChange > 20 && Npc.list[i].x - 32 < self.mouseX && Npc.list[i].x + 32 > self.mouseX && Npc.list[i].y - 32 < self.mouseY && Npc.list[i].y + 32 > self.mouseY && self.keyPress.attack){
                if(self.quest === 'none'){
                    self.quest = 'test';
                    self.questStage = 1;
                }
                if(self.questStage === 1){
                    self.questStage += 1;
                    socket.emit('dialougeLine',{
                        state:'ask',
                        message:'Can you go to the Cave map?',
                        response1:'Sure.',
                        response2:'No.',
                    });
                }
                if(self.questStage === 4){
                    self.questStage += 1;
                    socket.emit('dialougeLine',{
                        state:'ask',
                        message:'Thank you.',
                        response1:'*End conversation*',
                    });
                }
                self.keyPress.attack = false;
            }
        }
        if(self.currentResponse === 1 && self.questStage === 2){
            self.questStage += 1;
            socket.emit('dialougeLine',{
                state:'remove',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 2 && self.questStage === 2){
            self.quest = 'none';
            socket.emit('dialougeLine',{
                state:'remove',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 5){
            self.quest = 'none';
            socket.emit('dialougeLine',{
                state:'remove',
            });
            self.currentResponse = 0;
        }
        if(self.map === "Cave" && self.quest === 'test' && self.questStage === 3){
            self.questStage += 1;
            socket.emit('dialougeLine',{
                state:'remove',
            });
        }
    }
    self.updateMap = function(){
        if(self.mapChange === 0){
            socket.emit('changeMap',self.transporter);
            self.canMove = false;
        }
        if(self.mapChange === 5){
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
            for(var i in Spawner.list){
                if(Spawner.list[i].map === self.map && Spawner.list[i].spawned === false){
                    var monster = new Monster({
                        spawnId:i,
                        x:Spawner.list[i].x,
                        y:Spawner.list[i].y,
                        map:Spawner.list[i].map,
                        moveSpeed:2,
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
            console.error(self.username + " went to map " + self.map + ".");
            for(var i in SOCKET_LIST){
                SOCKET_LIST[i].emit('addToChat','style="color: #000000">' + self.username + " went to map " + self.map + ".");
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
    self.updateAttack = function(){
        if(self.state !== 'dead'){
            if(self.keyPress.attack === true && self.attackReload > 15 && self.map !== "Village"){
                self.attackReload = 1;
                self.attackTick = 0;
            }
            if(self.keyPress.second === true && self.secondReload > 250 && self.map !== "Village"){
                self.secondReload = 1;
                self.secondTick = 0;
            }
            if(self.keyPress.heal === true && self.healReload > 500){
                self.healReload = 1;
                self.healTick = 0;
            }
        }
        if(self.attackTick === 0){
            self.shootProjectile(self.id,'Player',self.direction - 15,self.direction - 15,'Bullet',0,self.stats);
            self.shootProjectile(self.id,'Player',self.direction - 5,self.direction - 5,'Bullet',0,self.stats);
            self.shootProjectile(self.id,'Player',self.direction + 5,self.direction + 5,'Bullet',0,self.stats);
            self.shootProjectile(self.id,'Player',self.direction + 15,self.direction + 15,'Bullet',0,self.stats);
        }
        if(self.secondTick === 0){
            for(var i = 0;i < 10;i++){
                self.shootProjectile(self.id,'Player',i * 36,i * 36,'Bullet',0,self.stats);
            }
        }
        if(self.secondTick === 20){
            for(var i = 0;i < 10;i++){
                self.shootProjectile(self.id,'Player',i * 36,i * 36,'Bullet',0,self.stats);
            }
        }
        if(self.secondTick === 40){
            for(var i = 0;i < 10;i++){
                self.shootProjectile(self.id,'Player',i * 36,i * 36,'Bullet',0,self.stats);
            }
        }
        if(self.secondTick === 60){
            for(var i = 0;i < 10;i++){
                self.shootProjectile(self.id,'Player',i * 36,i * 36,'Bullet',0,self.stats);
            }
        }
        if(self.healTick === 0){
            self.hp += Math.round(self.stats.heal * 200);
        }
        if(self.healTick === 40){
            self.hp += Math.round(self.stats.heal * 200);
        }
        if(self.healTick === 80){
            self.hp += Math.round(self.stats.heal * 200);
        }
        if(self.healTick === 120){
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
        if(lastSelf.stats){
            if(lastSelf.stats.attack !== self.stats.attack || lastSelf.stats.defense !== self.stats.defense){
                pack.stats = self.stats;
                //lastSelf.stats = self.stats;
            }
        }
        else{
            pack.stats = self.stats;
            lastSelf.stats = self.stats;
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
        pack.hp = self.hp;
        pack.hpMax = self.hpMax;
        pack.map = self.map;
        pack.username = self.username;
        pack.img = self.img;
        pack.animationDirection = self.animationDirection;
        pack.animation = self.animation;
        pack.attackReload = self.attackReload;
        pack.secondReload = self.secondReload;
        pack.healReload = self.healReload;
        pack.mapWidth = self.mapWidth;
        pack.mapHeight = self.mapHeight;
        pack.type = self.type;
        pack.stats = self.stats;
        return pack;
    }
    Player.list[self.id] = self;
    return self;
}

Player.list = {};

Player.onConnect = function(socket,username){
    var player = Player({
		id:socket.id,
        username:username,
        moveSpeed:0,
	});

    console.error(username + " just logged on.");
    for(var i in SOCKET_LIST){
        SOCKET_LIST[i].emit('addToChat','style="color: #00ff00">' + username + " just logged on.");
    }

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
        player.hp = player.hpMax / 2;
        console.error(player.username + ' respawned.');
        for(var i in SOCKET_LIST){
            SOCKET_LIST[i].emit('addToChat','style="color: #00ff00">' + player.username + ' respawned.');
        }
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
        console.error(Player.list[socket.id].username + " logged off.");
        for(var i in SOCKET_LIST){
            SOCKET_LIST[i].emit('addToChat','style="color: #ffff00">' + Player.list[socket.id].username + " logged off.");
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
        pack.animationDirection = self.animationDirection;
        pack.animation = self.animation;
        pack.type = self.type;
        return pack;
    }
	Npc.list[self.id] = self;
	return self;
}
Npc.list = {};


Monster = function(param){
    var self = Actor(param);
    self.spawnId = param.spawnId;
    self.attackState = "passive";
    self.direction = 0;
    self.hp = 200;
    self.hpMax = 200;
    self.width = 24;
    self.height = 24;
    self.toRemove = false;
    self.reload = 0;
    self.target = {};
    self.type = 'Monster';
    self.stats = {
        attack:1,
        defense:1,
        heal:1,
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
    self.updateAttack = function(){
        if(self.target){
            self.direction = Math.atan2(self.target.y - self.y,self.target.x - self.x) / Math.PI * 180;
        }
        switch(self.attackState){
            case "passive":
                self.moveArray = [];
                self.spdX = 0;
                self.spdY = 0;
                for(var i in Player.list){
                    if(Player.list[i].map === self.map && self.getDistance(Player.list[i]) < 512 && Player.list[i].state !== "dead"){
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
                if(self.reload % 20 === 0){
                    self.shootProjectile(self.id,'Monster',self.direction,self.direction,'Bullet',0,self.stats);
                }
                if(self.reload % 100 < 5){
                    self.shootProjectile(self.id,'Monster',self.direction,self.direction,'Bullet',0,self.stats);
                }
                self.reload += 1;
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
    Monster.list[self.id] = self;
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
    self.width = 48;
    self.height = 48;
	self.direction = param.direction;
	self.timer = 0;
	self.toRemove = false;
    self.type = 'Projectile';
    self.stats = param.stats;
    self.parentType = param.parentType;
    self.projectileType = param.projectileType;
    //self.onCollision = param.onCollision;
    var lastSelf = {};
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
        return pack;
    }
	Projectile.list[self.id] = self;
	return self;
}
Projectile.list = {};



var data;
var tileset;
var layers;
var loadedMap;
var mapLocations = [
    ['Lower Deadlands',''],
    ['The Outskirts','Forest'],
    ['River','Village'],
    ['Lilypad Path Part 1',''],
];
var renderLayer = function(layer){
    if(layer.type !== "tilelayer" && layer.visible === false){
        return;
    }
    size = data.tilewidth;
    if(data.backgroundcolor){
        Maps[loadedMap] = {width:layer.width * size,height:layer.height * size};
    }
    else{
        for(var i = 0;i < mapLocations.length;i++){
            for(var j = 0;j < mapLocations[i].length;j++){
                Maps[mapLocations[i][j]] = {width:3200,height:3200};
            }
        }
    }
    if(layers.length < data.layers.length || 1){
        layer.data.forEach(function(tile_idx, i){
            if(!tile_idx){
                return;
            }
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
						else if(y === ""){
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
            if(tile_idx === 2036){
				var teleport = "";
				var teleportj = 0;
				var teleportx = "";
				var teleportxj = 0;
                var teleporty = "";
                var teleportyj = 0;
                var direction = "";
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
						}
					}
                }
                var transporter = new Transporter({
                    x:x,
                    y:y,
					size:size,
					teleport:teleport,
					teleportx:teleportx,
                    teleporty:teleporty,
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
    loadedMap = name;
    if(SERVER === 'localhost'){
        loadTileset(require("C:/Users/gu/Documents/game/client/maps/" + name + ".json"));
    }
    else{
        loadTileset(require("/app/client/maps/" + name + ".json"));
    }
}
load("World");
load("Starter House");
load("Cave");
load("House");
load("Secret Base");

updateCrashes = function(){
    for(var i in Player.list){
        for(var j in Projectile.list){
            if(Player.list[i] && Projectile.list[j]){
                if(Player.list[i].getDistance(Projectile.list[j]) < 30 && "" + Projectile.list[j].parent !== i && Player.list[i].state !== 'dead' && Projectile.list[j].parentType !== 'Player' && Projectile.list[j].map === Player.list[i].map){
                    Projectile.list[j].toRemove = true;
                    Player.list[i].hp -= Math.round(Projectile.list[j].stats.attack * (50 + Math.random() * 50) / Player.list[i].stats.defense);
                }
            }
        }
    }
    for(var i in Monster.list){
        for(var j in Projectile.list){
            if(Monster.list[i] && Projectile.list[j]){
                if(Monster.list[i].getDistance(Projectile.list[j]) < 30 && "" + Projectile.list[j].parent !== i && Projectile.list[j].parentType !== 'Monster' && Projectile.list[j].map === Monster.list[i].map){
                    Projectile.list[j].toRemove = true;
                    Monster.list[i].hp -= Math.round(Projectile.list[j].stats.attack * (50 + Math.random() * 50) / Monster.list[i].stats.defense);
                    if(Monster.list[i].hp < 1){
                        Player.list[Projectile.list[j].parent].inventory.addItem('sword',1);
                        Player.list[Projectile.list[j].parent].inventory.addItem('helmet',1);
                    }
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
                var monster = new Monster({
                    spawnId:i,
                    x:Spawner.list[i].x,
                    y:Spawner.list[i].y,
                    map:Spawner.list[i].map,
                    moveSpeed:2,
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


s = {
    findPlayers:function(param){
        var acceptableEntities = Player.list;
        if(param.username){
            for(var i in Player.list){
                if(Player.list[i].username !== param.username){
                    delete acceptableEntities[i];
                }
            }
        }
        if(param.map){
            for(var i in Player.list){
                if(Player.list[i].map !== param.map){
                    delete acceptableEntities[i];
                }
            }
        }
        if(param.id){
            for(var i in Player.list){
                if(Player.list[i].id !== param.id){
                    delete acceptableEntities[i];
                }
            }
        }
        if(acceptableEntities === {}){
            return 'None';
        }
        else{
            var pack = [];
            for(var i in acceptableEntities){
                pack.push(acceptableEntities[i]);
            }
            return pack;
        }
    },
    findEntities:function(param){
        var acceptableEntities = Entity.list;
        if(param.id){
            for(var i in Entity.list){
                if(Entity.list[i].id !== param.id){
                    delete acceptableEntities[i];
                }
            }
        }
        if(param.type){
            for(var i in Entity.list){
                if(Entity.list[i].type !== param.type){
                    delete acceptableEntities[i];
                }
            }
        }
        if(param.map){
            for(var i in Entity.list){
                if(Entity.list[i].map !== param.map){
                    delete acceptableEntities[i];
                }
            }
        }
        if(acceptableEntities === {}){
            return 'None';
        }
        else{
            var pack = [];
            for(var i in acceptableEntities){
                pack.push(acceptableEntities[i]);
            }
            return pack;
        }
    },
    spawnEntity:function(param){
        if(param.type){
            if(param.type === 'Monster'){
                var monster = new Monster({
                    spawnId:0,
                    x:param.x,
                    y:param.y,
                    map:param.map,
                    moveSpeed:param.moveSpeed,
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
            if(param.type === 'Npc'){
                var npc = new Npc({
                    x:param.x,
                    y:param.y,
                    name:param.name,
                    username:param.id,
                    map:param.map,
                    moveSpeed:param.moveSpeed,
                });
            }
        }
    },
};