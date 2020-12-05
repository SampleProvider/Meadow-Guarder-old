var xpLevels = [
    500,
    1000,
    1500,
    2000,
    2500,
    3000,
    3500,
    4000,
    4500,
    5000,
    5500,
    6000,
    6500,
    7000,
    7500,
    8000,
    8500,
    9000,
    9500,
    10000,
    11000,
    12000,
    13000,
    14000,
    15000,
    16000,
    17000,
    18000,
    19000,
    20000,
    22000,
    24000,
    26000,
    28000,
    30000,
    40000,
    55000,
    70000,
    100000,
    140000,
    200000,
    275000,
    400000,
    725000,
    1000000,
    1500000,
    2500000,
    4000000,
    7000000,
    10000000,
];
var fs = require('fs');

worldMap = [];

s = {
    findPlayer:function(param){
        for(var i in Player.list){
            if(Player.list[i].username === param){
                return Player.list[i];
            }
        }
    },
    spawnMonster:function(param,pt){
        var monsterAttack = 'passiveBird';
        if(param === 'blueBall'){
            monsterAttack = 'passiveBall';
        }
        if(param === 'redCherryBomb'){
            monsterAttack = 'passiveCherryBomb';
        }
        var monster = new Monster({
            spawnId:0,
            x:pt.x + Math.random() * 2 - 1,
            y:pt.y + Math.random() * 2 - 1,
            map:pt.map,
            moveSpeed:2,
            monsterType:param,
            attackState:monsterAttack,
            onDeath:function(pt){
                pt.toRemove = true;
                for(var i in Projectile.list){
                    if(Projectile.list[i].parent === pt.id){
                        Projectile.list[i].toRemove = true;
                    }
                }
            },
        });
        for(var i in Player.list){
            if(Player.list[i].map === monster.map){
                SOCKET_LIST[i].emit('initEntity',monster.getInitPack());
            }
        }
        return monster;
    },
    spawnNpc:function(param,pt){
        var npc = new Npc({
            x:pt.x + Math.random() * 2 - 1,
            y:pt.y + Math.random() * 2 - 1,
            name:param,
            entityId:'spawnedNpc',
            map:pt.map,
            moveSpeed:5,
            info:{
                randomWalk:'wander',
                canChangeMap:false,
            },
        });
        for(var i in Player.list){
            if(Player.list[i].map === npc.map){
                SOCKET_LIST[i].emit('initEntity',npc.getInitPack());
            }
        }
        return npc;
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

var spawnMonster = function(spawner,spawnId){
    var monsterType = 'blueBird';
    var monsterAttack = 'passiveBird';
    if(Math.random() < 0.5){
        monsterType = 'greenBird';
    }
    if(Math.random() < 0.1){
        monsterType = 'blueBall';
        monsterAttack = 'passiveBall';
    }
    if(Math.random() < 0.05){
        monsterType = 'redCherryBomb';
        monsterAttack = 'passiveCherryBomb';
    }
    var monsterHp = 0;
    var monsterStats = {
        attack:0,
        defense:0,
        heal:0,
    }
    for(var j in Player.list){
        if(Player.list[j].map === spawner.map){
            monsterHp += Player.list[j].hpMax;
            monsterStats.attack += Player.list[j].stats.attack / 2;
            monsterStats.defense += Player.list[j].stats.defense / 2;
            monsterStats.heal += Player.list[j].stats.heal / 2;
        }
    }
    monsterHp = monsterHp / playerMap[spawner.map];
    var monster = new Monster({
        spawnId:spawnId,
        x:spawner.x,
        y:spawner.y,
        map:spawner.map,
        moveSpeed:2,
        stats:monsterStats,
        hp:Math.round(monsterHp),
        monsterType:monsterType,
        attackState:monsterAttack,
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
    spawner.spawned = true;
}

var playerMap = {};

Maps = {};

var tiles = [];

Entity = function(param){
    var self = {};
    self.id = Math.random();
    self.x = 0;
    self.y = 0;
    self.width = 0;
    self.heigth = 0;
    self.spdX = 0;
    self.spdY = 0;
    self.map = 'The Village';
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
        if(pt.map === self.map && pt.x + pt.width / 2 > self.x - self.width / 2 && pt.x - pt.width / 2 < self.x + self.width / 2 && pt.y + pt.height / 2 > self.y - self.height / 2 && pt.y - pt.height / 2 < self.y + self.height / 2){
            return true;
        }
        return false;
    }
    return self;
}

Entity.getFrameUpdateData = function(){
    var pack = {};
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
    for(var i in Player.list){
        if(Player.list[i]){
            Player.list[i].update();
            if(!pack[Player.list[i].map]){
                pack[Player.list[i].map] = {player:[],projectile:[],monster:[],npc:[]};
            }
            pack[Player.list[i].map].player.push(Player.list[i].getUpdatePack());
        }
    }
    for(var i in Projectile.list){
        Projectile.list[i].update();
    }
    for(var i in Npc.list){
        if(playerMap[Npc.list[i].map] > 0){
            Npc.list[i].update();
            if(!pack[Npc.list[i].map]){
                pack[Npc.list[i].map] = {player:[],projectile:[],monster:[],npc:[]};
            }
            if(Npc.list[i].toRemove){
                delete Npc.list[i];
            }
            else{
                pack[Npc.list[i].map].npc.push(Npc.list[i].getUpdatePack());
            }
        }
    }
    for(var i in Collision.list){
        if(Collision.list[i].toRemove){
            delete Collision.list[i];
        }
    }
    for(var i in Collision2.list){
        if(Collision2.list[i].toRemove){
            delete Collision2.list[i];
        }
    }
	updateCrashes();
    for(var i in Projectile.list){
        if(!pack[Projectile.list[i].map]){
            pack[Projectile.list[i].map] = {player:[],projectile:[],monster:[],npc:[]};
        }
        pack[Projectile.list[i].map].projectile.push(Projectile.list[i].getUpdatePack());
        if(Projectile.list[i].toRemove){
            delete Projectile.list[i];
        }
    }
    return pack;
}

Actor = function(param){
    var self = Entity(param);
    self.maxSpeed = param.moveSpeed;
    self.moveSpeed = param.moveSpeed;
    self.moveArray = [];
    self.randomPos = {
        walking:false,
        waypoint:false,
        currentWaypoint:undefined,
        waypointAttemptTime:0,
        x:0,
        y:0,
        directionX:0,
        directionY:0,
        timeX:0,
        timeY:0,
        walkTimeX:100,
        walkTimeY:100,
        waitTimeX:60,
        waitTimeY:60,
    };
    self.pushPt = undefined;
    self.trackingEntity = undefined;
    self.trackingState = true;
    self.entityId = undefined;
    self.canMove = true;
    self.canChangeMap = true;
    self.transporter = {};
    self.invincible = false;
    self.mapWidth = Maps[self.map].width;
    self.mapHeight = Maps[self.map].height;
    self.type = 'Actor';
    self.animationDirection = 'up';
    self.animation = 0;
    self.state = 'none';
    self.mapChange = 100;
    self.toRemove = false;
    self.isHostile = false;
    self.isDead = false;
    self.pushPower = 1;
    self.dazed = 0;
    self.animate = true;
    var super_update = self.update;
    self.update = function(){
        self.mapChange += 1;
        self.moveSpeed = self.maxSpeed;
        for(var i = 0;i < self.moveSpeed;i++){
            self.updateMove();
            self.updateAnimation();
            if(self.canMove && self.dazed < 1){
                super_update();
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
            self.dazed -= 1;
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
        if(self.pushPt){
            if(self.dazed < 1){
                self.dazed = self.maxSpeed * 2;
            }
        }
        self.pushPt = undefined;
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
            if(!self.trackingState){
                self.spdX = -self.spdX;
                self.spdY = -self.spdY;
            }
        }
        else if(self.randomPos.walking){
            if(self.randomPos.waypoint){
                if(self.randomPos.currentWaypoint){
                    self.spdX = 0;
                    self.spdY = 0;
                    if(self.x < self.randomPos.currentWaypoint.x){
                        self.spdX = 1;
                    }
                    if(self.x > self.randomPos.currentWaypoint.x){
                        self.spdX = -1;
                    }
                    if(self.y < self.randomPos.currentWaypoint.y){
                        self.spdY = 1;
                    }
                    if(self.y > self.randomPos.currentWaypoint.y){
                        self.spdY = -1;
                    }
                    if(self.x === self.randomPos.currentWaypoint.x && self.y === self.randomPos.currentWaypoint.y){
                        self.randomPos.currentWaypoint = undefined;
                        self.randomPos.waypointAttemptTime = 0;
                    }
                    else if(self.randomPos.waypointAttemptTime > 1200){
                        self.randomPos.currentWaypoint = undefined;
                        self.randomPos.waypointAttemptTime = 0;
                    }
                    else if(self.randomPos.currentWaypoint.map !== self.map){
                        self.randomPos.currentWaypoint = undefined;
                    }
                }
                else{
                    var waypoints = [];
                    for(var i in WayPoint.list){
                        if(WayPoint.list[i].info.id === self.entityId && WayPoint.list[i].map === self.map){
                            waypoints.push(WayPoint.list[i]);
                        }
                    }
                    self.randomPos.currentWaypoint = waypoints[Math.floor(Math.random() * waypoints.length)];
                }
                self.randomPos.waypointAttemptTime += 1;
            }
            else{
                if(self.spdX === 0 && self.randomPos.timeX > self.randomPos.walkTimeX){
                    self.spdX = Math.round(Math.random() * 2 - 1);
                    self.randomPos.timeX = 0;
                    self.randomPos.waitTimeX = 30 * Math.random() + 30;
                }
                else if(self.spdX !== 0 && self.randomPos.timeX > self.randomPos.waitTimeX){
                    self.spdX = 0;
                    self.randomPos.timeX = 0;
                    self.randomPos.walkTimeX = 50 * Math.random() + 50;
                }
                if(self.spdY === 0 && self.randomPos.timeY > self.randomPos.walkTimeY){
                    self.spdY = Math.round(Math.random() * 2 - 1);
                    self.randomPos.timeY = 0;
                    self.randomPos.waitTimeY = 30 * Math.random() + 30;
                }
                else if(self.spdY !== 0 && self.randomPos.timeY > self.randomPos.waitTimeY){
                    self.spdY = 0;
                    self.randomPos.timeY = 0;
                    self.randomPos.walkTimeY = 50 * Math.random() + 50;
                }
                self.randomPos.timeX += 1;
                self.randomPos.timeY += 1;
                if(Math.abs(self.x - self.randomPos.x) > 256){
                    self.spdX = -1 * Math.abs(self.x - self.randomPos.x) / (self.x - self.randomPos.x);
                }
                if(Math.abs(self.y - self.randomPos.y) > 256){
                    self.spdY = -1 * Math.abs(self.y - self.randomPos.y) / (self.y - self.randomPos.y);
                }
            }
        }
        if(self.pushPt){
            var pushPower = self.pushPt.pushPower * (Math.random() + 1);
            self.moveSpeed = 50 - self.getDistance(self.pushPt) + pushPower;
            if(self.x > self.pushPt.x){
                self.spdX = 1;
            }
            else if(self.x < self.pushPt.x){
                self.spdX = -1;
            }
            else{
                self.spdX = 0;
            }
            if(self.y > self.pushPt.y){
                self.spdY = 1;
            }
            else if(self.y < self.pushPt.y){
                self.spdY = -1;
            }
            else{
                self.spdY = 0;
            }
        }
    }
    self.updateAnimation = function(){
        if(!self.animate){
            return;
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
            }
        }
    }
    self.move = function(x,y){
        self.moveArray.push({x:x,y:y});
    }
    self.onPush = function(pt,pushPower){
        self.pushPt = pt;
        self.onCollision(pt,pushPower * self.pushPower);
    }
    self.randomWalk = function(walking,waypoint,x,y){
        self.randomPos.walking = walking;
        self.randomPos.waypoint = waypoint;
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
        self.trackingState = true;
    }
    self.escapeEntity = function(pt){
        self.trackingEntity = pt;
        self.trackingState = false;
    }
    self.onHit = function(pt){
    }
    self.onCollision = function(pt,strength){
        if(!self.invincible && pt.toRemove === false){
            self.hp -= Math.round(pt.stats.attack * (strength + Math.random() * strength) / self.stats.defense);
            self.onHit(pt);
        }
        if(self.hp < 1 && self.isDead === false && pt.toRemove === false){
            if(pt.parentType === 'Player'){
                var items = Player.list[pt.parent].inventory.addRandomizedItem(Player.list[pt.parent].stats.luck);
                while(items.length > 0){
                    for(var i in items){
                        var d = new Date();
                        var m = '' + d.getMinutes();
                        if(m.length === 1){
                            m = '' + 0 + m;
                        }
                        if(m === '0'){
                            m = '00';
                        }
                        console.error("[" + d.getHours() + ":" + m + "] " + Player.list[pt.parent].username + " got a " + items[i].name + ".");
                        for(var j in SOCKET_LIST){
                            SOCKET_LIST[j].emit('addToChat',{
                                style:'style="color: ' + Player.list[pt.parent].textColor + '">',
                                message:Player.list[pt.parent].username + " got a " + items[i].name + ".",
                            });
                        }
                    }
                    items = Player.list[pt.parent].inventory.addRandomizedItem(Player.list[pt.parent].stats.luck);
                }
                Player.list[pt.parent].xp += Math.round((10 + Math.random() * 10) * Player.list[pt.parent].stats.xp);
            }
            if(pt.type === 'Player'){
                var items = pt.inventory.addRandomizedItem(pt.stats.luck);
                while(items.length > 0){
                    for(var i in items){
                        var d = new Date();
                        var m = '' + d.getMinutes();
                        if(m.length === 1){
                            m = '' + 0 + m;
                        }
                        if(m === '0'){
                            m = '00';
                        }
                        console.error("[" + d.getHours() + ":" + m + "] " + pt.username + " got a " + items[i].name + ".");
                        for(var j in SOCKET_LIST){
                            SOCKET_LIST[j].emit('addToChat',{
                                style:'style="color: ' + pt.textColor + '">',
                                message:pt.username + " got a " + items[i].name + ".",
                            });
                        }
                    }
                    items = pt.inventory.addRandomizedItem(pt.stats.luck);
                }
                pt.xp += Math.round((10 + Math.random() * 10) * pt.stats.xp);
            }
            self.isDead = true;
            self.toRemove = true;
        }
    }
    self.shootProjectile = function(id,parentType,angle,direction,projectileType,distance,stats){
		var projectile = Projectile({
            id:id,
            projectileType:projectileType,
			angle:angle,
			direction:direction,
			x:self.x + Math.cos(direction / 180 * Math.PI) * distance,
			y:self.y + Math.sin(direction / 180 * Math.PI) * distance,
            map:self.map,
            parentType:parentType,
            mapWidth:self.mapWidth,
            mapHeight:self.mapHeight,
            stats:stats,
            onCollision:function(self,pt){
                self.toRemove = true;
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
                if(Collision2.list[fourthTile]){
                    self.doCollision(Collision2.list[fourthTile]);
                }
                if(Collision2.list[thirdTile]){
                    self.doCollision(Collision2.list[thirdTile]);
                }
                if(Collision2.list[secondTile]){
                    self.doCollision(Collision2.list[secondTile]);
                }
                if(Collision2.list[firstTile]){
                    self.doCollision(Collision2.list[firstTile]);
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
                if(Collision2.list[thirdTile]){
                    self.doCollision(Collision2.list[thirdTile]);
                }
                if(Collision2.list[fourthTile]){
                    self.doCollision(Collision2.list[fourthTile]);
                }
                if(Collision2.list[firstTile]){
                    self.doCollision(Collision2.list[firstTile]);
                }
                if(Collision2.list[secondTile]){
                    self.doCollision(Collision2.list[secondTile]);
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
                if(Collision2.list[fourthTile]){
                    self.doCollision(Collision2.list[fourthTile]);
                }
                if(Collision2.list[thirdTile]){
                    self.doCollision(Collision2.list[thirdTile]);
                }
                if(Collision2.list[secondTile]){
                    self.doCollision(Collision2.list[secondTile]);
                }
                if(Collision2.list[firstTile]){
                    self.doCollision(Collision2.list[firstTile]);
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
                if(Collision2.list[secondTile]){
                    self.doCollision(Collision2.list[secondTile]);
                }
                if(Collision2.list[firstTile]){
                    self.doCollision(Collision2.list[firstTile]);
                }
                if(Collision2.list[fourthTile]){
                    self.doCollision(Collision2.list[fourthTile]);
                }
                if(Collision2.list[thirdTile]){
                    self.doCollision(Collision2.list[thirdTile]);
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
                if(Collision2.list[firstTile]){
                    self.doCollision(Collision.list[firstTile]);
                }
                if(Collision2.list[secondTile]){
                    self.doCollision(Collision2.list[secondTile]);
                }
                if(Collision2.list[thirdTile]){
                    self.doCollision(Collision2.list[thirdTile]);
                }
                if(Collision2.list[fourthTile]){
                    self.doCollision(Collision2.list[fourthTile]);
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
                if(Collision2.list[secondTile]){
                    self.doCollision(Collision2.list[secondTile]);
                }
                if(Collision2.list[firstTile]){
                    self.doCollision(Collision2.list[firstTile]);
                }
                if(Collision2.list[fourthTile]){
                    self.doCollision(Collision2.list[fourthTile]);
                }
                if(Collision2.list[thirdTile]){
                    self.doCollision(Collision2.list[thirdTile]);
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
                if(Collision2.list[fourthTile]){
                    self.doCollision(Collision2.list[fourthTile]);
                }
                if(Collision2.list[thirdTile]){
                    self.doCollision(Collision2.list[thirdTile]);
                }
                if(Collision2.list[secondTile]){
                    self.doCollision(Collision2.list[secondTile]);
                }
                if(Collision2.list[firstTile]){
                    self.doCollision(Collision2.list[firstTile]);
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
                if(Collision2.list[thirdTile]){
                    self.doCollision(Collision2.list[thirdTile]);
                }
                if(Collision2.list[fourthTile]){
                    self.doCollision(Collision2.list[fourthTile]);
                }
                if(Collision2.list[firstTile]){
                    self.doCollision(Collision2.list[firstTile]);
                }
                if(Collision2.list[secondTile]){
                    self.doCollision(Collision2.list[secondTile]);
                }
            }
            else{
                
            }
        }

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
        if(!self.canChangeMap){
            return;
        }
        if(self.isDead || self.toRemove){
            return;
        }
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
    self.width = 32;
    self.height = 28;
    self.moveSpeed = 20;
    self.maxSpeed = 20;
    self.img = {
        body:[-1,-1,-1,0.5],
        shirt:[255,0,0,0.5],
        pants:[0,0,255,0.6],
        hair:[144,64,0,0.5],
        hairType:'bald',
    };
    self.imgwidth = 0;
    self.animationDirection = 'up';
    self.animation = 0;
    self.hp = 1000;
    self.hpMax = 1000;
    self.mg = 1000;
    self.mgMax = 1000;
    self.xp = 0;
    self.xpMax = 100;
    self.level = 0;
    self.levelMax = 50;
    self.direction = 0;
    self.map = 'The Village';
    playerMap[self.map] += 1;
    self.mapHeight = 3200;
    self.mapWidth = 3200;
    self.textColor = '#ffff00';
    self.quest = false;
    self.questStage = 0;
    self.questInfo = {
        quest:false,
    };
    self.questDependent = {};
    self.questStats = {
        "Missing Person":false,
        "Weird Tower":false,
    }
    self.type = 'Player';
    self.username = param.username;
    self.tag = '';
    if(self.username === 'Unknown'){
        self.textColor = '#000000';
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
        up:'w',
        down:'s',
        left:'a',
        right:'d',
        attack:'attack',
        second:'second',
        heal:' ',
    };
    self.secondKeyMap = {
        up:'ArrowUp',
        down:'ArrowDown',
        left:'ArrowLeft',
        right:'ArrowRight',
        attack:'attack',
        second:'second',
        heal:'Shift',
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
            self.inventory.addItem(param.param.inventory[i].id,param.param.inventory[i].amount);
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
        if(self.level < xpLevels.length){
            self.xpMax = xpLevels[self.level];
        }
    }
    if(param.param.questStats){
        self.questStats = param.param.questStats;
    }
    self.inventory.refreshRender();
    self.stats = {
        attack:1,
        defense:1,
        heal:1,
        xp:1,
        luck:1,
    }
    var lastSelf = {};
    self.update = function(){
        self.mapChange += 1;
        self.moveSpeed = self.maxSpeed;
        for(var i = 0;i < self.moveSpeed;i++){
            self.updateSpd();
            self.updateMove();
            if(self.canMove && self.dazed < 1){
                self.updatePosition();
            }
            self.dazed -= 1;
            self.updateCollisions();
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
        if(self.pushPt){
            self.dazed = self.maxSpeed * 2;
        }
        self.pushPt = undefined;
    }
    self.updateQuest = function(){
        for(var i in Npc.list){
            if(Npc.list[i].map === self.map && Npc.list[i].entityId === 'bob' && self.mapChange > 20 && Npc.list[i].x - 32 < self.mouseX && Npc.list[i].x + 32 > self.mouseX && Npc.list[i].y - 32 < self.mouseY && Npc.list[i].y + 32 > self.mouseY && self.keyPress.attack === true){
                if(self.quest === false && self.questInfo.quest === false){
                    self.questStage = 1;
                    self.invincible = true;
                    self.questInfo.quest = 'Missing Person';
                    socket.emit('dialougeLine',{
                        state:'ask',
                        message:'Hey, my friend Mark went to map The River to collect some wood. He hasn\'t come back in two hours! Can you rescue Mark for me?',
                        response1:'Sure, I can rescue Mark.',
                        response2:'No way. That isn\'t my problem.',
                    });
                }
                if(self.questStage === 4 && self.quest === 'Missing Person'){
                    self.questStage += 1;
                    self.invincible = true;
                    socket.emit('dialougeLine',{
                        state:'ask',
                        message:'Thanks. The map The River is to the west of The Village, which is where you are now.',
                        response1:'*End conversation*',
                    });
                }
                if(self.questStage === 11){
                    self.questStage += 1;
                    self.invincible = true;
                    socket.emit('dialougeLine',{
                        state:'ask',
                        message:'Oh, Mark is fine? That\'s great!',
                        response1:'*End conversation*',
                    });
                }
                self.keyPress.attack = false;
            }
            if(Npc.list[i].map === self.map && Npc.list[i].entityId === 'john' && self.mapChange > 20 && Npc.list[i].x - 32 < self.mouseX && Npc.list[i].x + 32 > self.mouseX && Npc.list[i].y - 32 < self.mouseY && Npc.list[i].y + 32 > self.mouseY && self.keyPress.attack === true){
                if(self.quest === false && self.questInfo.quest === false && self.questStats["Missing Person"] === false){
                    self.questStage = 1;
                    self.invincible = true;
                    self.questInfo.quest = 'Weird Tower';
                    socket.emit('dialougeLine',{
                        state:'ask',
                        message:'What do you want?',
                        response1:'Do you have a quest for me?',
                        response2:'Nothing.',
                    });
                }
                if(self.quest === false && self.questInfo.quest === false && self.questStats["Missing Person"] === true){
                    self.questStage = 3;
                    self.invincible = true;
                    self.questInfo.quest = 'Weird Tower';
                    socket.emit('dialougeLine',{
                        state:'ask',
                        message:'Can you go on a quest for me?',
                        response1:'Sure!',
                        response2:'No.',
                    });
                }
                if(self.questStage === 7 && self.quest === 'Weird Tower'){
                    self.questStage += 1;
                    self.invincible = true;
                    socket.emit('dialougeLine',{
                        state:'ask',
                        message:'Thanks. Go investigate that weird tower.',
                        response1:'*End conversation*',
                    });
                }
                if(self.questStage === 13){
                    self.questStage += 1;
                    self.invincible = true;
                    socket.emit('dialougeLine',{
                        state:'ask',
                        message:'What did you find?',
                        response1:'I found diamonds!',
                        response2:'There were Monsters protecting the tower.',
                        response3:'Nothing.',
                    });
                }
                self.keyPress.attack = false;
            }
        }
        if(self.currentResponse === 1 && self.questStage === 1 && self.questInfo.quest === 'Missing Person'){
            self.questInfo.started = false;
            self.questStage += 1;
            self.invincible = false;
            socket.emit('dialougeLine',{
                state:'remove',
            });
            socket.emit('questInfo',{
                questName:'Missing Person',
                questDescription:'Find Mark who has been missing in the map The River. Test out some new quest mechanics.',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 2 && self.questStage === 1 && self.questInfo.quest === 'Missing Person'){
            self.invincible = false;
            self.questInfo = {
                quest:false,
            };
            for(var i in self.questDependent){
                self.questDependent[i].toRemove = true;
            }
            socket.emit('dialougeLine',{
                state:'remove',
            });
            self.currentResponse = 0;
        }
        if(self.questInfo.started === true && self.questStage === 2 && self.questInfo.quest === 'Missing Person'){
            self.quest = 'Missing Person'
            self.questStage += 1;
            self.invincible = true;
            socket.emit('dialougeLine',{
                state:'ask',
                message:'I should talk with Bob.',
                response1:'...',
            });
        }
        if(self.currentResponse === 1 && self.questStage === 3 && self.quest === 'Missing Person'){
            self.questStage += 1;
            self.invincible = false;
            socket.emit('dialougeLine',{
                state:'remove',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 5 && self.quest === 'Missing Person'){
            self.questStage += 1;
            self.invincible = false;
            socket.emit('dialougeLine',{
                state:'remove',
            });
            self.currentResponse = 0;
        }
        if(self.questStage === 6 && self.quest === 'Missing Person' && self.mapChange > 10){
            for(var i in QuestInfo.list){
                if(QuestInfo.list[i].quest === 'Missing Person' && QuestInfo.list[i].info === 'activator' && self.isColliding(QuestInfo.list[i])){
                    self.questStage = 7;
                }
            }
        }
        if(self.questStage === 7 && self.quest === 'Missing Person' && self.mapChange > 10){
            for(var i in QuestInfo.list){
                if(QuestInfo.list[i].quest === 'Missing Person' && QuestInfo.list[i].info === 'spawner'){
                    self.questDependent.mark = new Npc({
                        x:QuestInfo.list[i].x,
                        y:QuestInfo.list[i].y,
                        map:QuestInfo.list[i].map,
                        name:'Mark',
                        entityId:'mark',
                        moveSpeed:5,
                        info:{
                            randomWalk:'wander',
                            canChangeMap:false,
                        },
                    });
                    for(var j in Player.list){
                        if(Player.list[j].map === self.map){
                            SOCKET_LIST[j].emit('initEntity',self.questDependent.mark.getInitPack());
                        }
                    }
                }
            }
            self.questStage += 1;
        }
        if(self.questStage === 8 && self.quest === 'Missing Person'){
            self.questStage += 1;
            self.invincible = true;
            socket.emit('dialougeLine',{
                state:'ask',
                message:'Oh! Hey, who are you?',
                response1:'Um, your friend Bob sent me to rescue you.',
            });
        }
        if(self.currentResponse === 1 && self.questStage === 9 && self.quest === 'Missing Person'){
            self.questStage += 1;
            socket.emit('dialougeLine',{
                state:'ask',
                message:'Oh, because I was gone for a long time? I\'m completely fine! Just collecting wood. Go tell Bob.',
                response1:'Ok, I can tell Bob you are fine.',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 10 && self.quest === 'Missing Person'){
            self.questStage += 1;
            self.invincible = false;
            socket.emit('dialougeLine',{
                state:'remove',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 12 && self.quest === 'Missing Person'){
            var d = new Date();
            var m = '' + d.getMinutes();
            if(m.length === 1){
                m = '' + 0 + m;
            }
            if(m === '0'){
                m = '00';
            }
            console.error("[" + d.getHours() + ":" + m + "] " + Player.list[socket.id].username + " completed the quest " + self.quest + ".");
            for(var i in SOCKET_LIST){
                SOCKET_LIST[i].emit('addToChat',{
                    style:'style="color: ' + self.textColor + '">',
                    message:Player.list[socket.id].username + " completed the quest " + self.quest + ".",
                });
            }
            self.quest = false;
            self.questInfo = {
                quest:false,
            };
            self.questStats["Missing Person"] = true;
            for(var i in self.questDependent){
                self.questDependent[i].toRemove = true;
            }
            self.invincible = false;
            socket.emit('dialougeLine',{
                state:'remove',
            });
            self.currentResponse = 0;
            self.xp += Math.round(1000 * self.stats.xp);
        }

        if(self.currentResponse === 1 && self.questStage === 1 && self.questInfo.quest === 'Weird Tower'){
            self.questStage += 1;
            socket.emit('dialougeLine',{
                state:'ask',
                message:'No, I don\'t have a quest for you. If you want a quest, talk to my friend Bob in the map The Village.',
                response1:'*End conversation*',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 2 && self.questStage === 1 && self.questInfo.quest === 'Weird Tower'){
            self.invincible = false;
            self.questInfo = {
                quest:false,
            };
            socket.emit('dialougeLine',{
                state:'remove',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 2 && self.questInfo.quest === 'Weird Tower'){
            self.invincible = false;
            self.questInfo = {
                quest:false,
            };
            socket.emit('dialougeLine',{
                state:'remove',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 3 && self.questInfo.quest === 'Weird Tower'){
            self.questStage += 1;
            socket.emit('dialougeLine',{
                state:'ask',
                message:'There is a weird tower in the map The River, and every time I go with Mark to collect wood, it gives me the creeps. Can you investigate that tower?',
                response1:'Ok.',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 2 && self.questStage === 3 && self.questInfo.quest === 'Weird Tower'){
            self.invincible = false;
            self.questInfo = {
                quest:false,
            };
            socket.emit('dialougeLine',{
                state:'remove',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 4 && self.questInfo.quest === 'Weird Tower'){
            self.questInfo.started = false;
            self.questStage += 1;
            self.invincible = false;
            socket.emit('dialougeLine',{
                state:'remove',
            });
            socket.emit('questInfo',{
                questName:'Weird Tower',
                questDescription:'Investigate a weird house in the map The River. Defeat Monsters to save The Village.',
            });
            self.currentResponse = 0;
        }
        if(self.questInfo.started === true && self.questStage === 5 && self.questInfo.quest === 'Weird Tower'){
            self.quest = 'Weird Tower';
            self.questStage += 1;
            self.invincible = true;
            socket.emit('dialougeLine',{
                state:'ask',
                message:'I should talk with John.',
                response1:'...',
            });
        }
        if(self.currentResponse === 1 && self.questStage === 6 && self.quest === 'Weird Tower'){
            self.questStage += 1;
            socket.emit('dialougeLine',{
                state:'remove',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 8 && self.quest === 'Weird Tower'){
            self.questStage += 1;
            socket.emit('dialougeLine',{
                state:'remove',
            });
            self.currentResponse = 0;
        }
        if(self.questStage === 9 && self.quest === 'Weird Tower' && self.mapChange > 10){
            for(var i in QuestInfo.list){
                if(QuestInfo.list[i].quest === 'Weird Tower' && QuestInfo.list[i].info === 'activator' && self.isColliding(QuestInfo.list[i])){
                    self.questStage = 10;
                    self.questInfo.monstersKilled = 0;
                    self.questInfo.maxMonsters = 0;
                }
            }
        }
        if(self.questStage === 10 && self.quest === 'Weird Tower' && self.mapChange > 10){
            for(var i in QuestInfo.list){
                if(QuestInfo.list[i].quest === 'Weird Tower' && QuestInfo.list[i].info === 'spawner'){
                    self.questDependent[i] = new Monster({
                        x:QuestInfo.list[i].x,
                        y:QuestInfo.list[i].y,
                        map:QuestInfo.list[i].map,
                        moveSpeed:2,
                        hp:1000,
                        monsterType:'blueBall',
                        attackState:'passiveBall',
                        stats:{
                            attack:5,
                            defense:5,
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
                            self.questInfo.monstersKilled += 1;
                        },
                    });
                    for(var j in Player.list){
                        if(Player.list[j].map === self.map){
                            SOCKET_LIST[j].emit('initEntity',self.questDependent[i].getInitPack());
                        }
                    }
                    self.questInfo.maxMonsters += 1;
                }
                if(QuestInfo.list[i].quest === 'Weird Tower' && QuestInfo.list[i].info === 'spawner2'){
                    self.questDependent[i] = new Monster({
                        x:QuestInfo.list[i].x,
                        y:QuestInfo.list[i].y,
                        map:QuestInfo.list[i].map,
                        moveSpeed:2,
                        hp:10,
                        monsterType:'greenBird',
                        attackState:'passiveBird',
                        stats:{
                            attack:5,
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
                            self.questInfo.monstersKilled += 1;
                        },
                    });
                    for(var j in Player.list){
                        if(Player.list[j].map === self.map){
                            SOCKET_LIST[j].emit('initEntity',self.questDependent[i].getInitPack());
                        }
                    }
                    self.questInfo.maxMonsters += 1;
                }
            }
            for(var i in QuestInfo.list){
                if(QuestInfo.list[i].quest === 'Weird Tower' && QuestInfo.list[i].info === 'collision'){
                    self.questDependent[i] = new Collision2({
                        x:QuestInfo.list[i].x,
                        y:QuestInfo.list[i].y,
                        width:64,
                        height:64,
                        map:QuestInfo.list[i].map,
                    });
                    tiles.push({
                        x:QuestInfo.list[i].x - 32,
                        y:QuestInfo.list[i].y - 32,
                        map:QuestInfo.list[i].map,
                        tile_idx:3547,
                        canvas:'lower',
                    });
                    for(var j in SOCKET_LIST){
                        SOCKET_LIST[j].emit('drawTile',{
                            x:QuestInfo.list[i].x - 32,
                            y:QuestInfo.list[i].y - 32,
                            map:QuestInfo.list[i].map,
                            tile_idx:3547,
                            canvas:'lower',
                        });
                    }
                }
            }
            self.questStage += 1;
        }
        if(self.questStage === 11 && self.quest === 'Weird Tower' && self.questInfo.monstersKilled === self.questInfo.maxMonsters){
            self.questStage += 1;
            self.invincible = true;
            socket.emit('dialougeLine',{
                state:'ask',
                message:'I killed the monsters, now I should talk back to John.',
                response1:'...',
            });
        }
        if(self.currentResponse === 1 && self.questStage === 12 && self.quest === 'Weird Tower'){
            self.questStage += 1;
            self.invincible = false;
            socket.emit('dialougeLine',{
                state:'remove',
            });
            for(var i in SOCKET_LIST){
                SOCKET_LIST[i].emit('removeTile',{
                    map:self.map,
                });
            }
            for(var i in tiles){
                if(tiles[i].map === self.map){
                    tiles.splice(i,1);
                }
            }
            for(var i in self.questDependent){
                if(self.questDependent[i].type === 'Collision2'){
                    self.questDependent[i].toRemove = true;
                }
            }
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 14 && self.questInfo.quest === 'Weird Tower'){
            self.questStage += 1;
            socket.emit('dialougeLine',{
                state:'ask',
                message:'You found diamonds! I guess that is your reward for finishing this quest.',
                response1:'What! That isn\'t fair!',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 2 && self.questStage === 14 && self.questInfo.quest === 'Weird Tower'){
            self.questStage += 2;
            socket.emit('dialougeLine',{
                state:'ask',
                message:'Monsters? Did you kill them?',
                response1:'Yes.',
                response2:'No.',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 3 && self.questStage === 14 && self.questInfo.quest === 'Weird Tower'){
            self.questStage += 3;
            socket.emit('dialougeLine',{
                state:'ask',
                message:'What! I know there is something in the tower! Go back and try again!',
                response1:'*End conversation*',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 15 && self.questInfo.quest === 'Weird Tower'){
            self.quest = false;
            self.questInfo = {
                quest:false,
            };
            for(var i in self.questDependent){
                self.questDependent[i].toRemove = true;
            }
            self.invincible = false;
            socket.emit('dialougeLine',{
                state:'remove',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 16 && self.questInfo.quest === 'Weird Tower'){
            self.questStage += 2;
            socket.emit('dialougeLine',{
                state:'ask',
                message:'Woo! Now I can go collect wood with Mark without worring about that tower.',
                response1:'*End conversation*',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 2 && self.questStage === 16 && self.questInfo.quest === 'Weird Tower'){
            self.questStage += 1;
            socket.emit('dialougeLine',{
                state:'ask',
                message:'You found the Monsters but you didn\'t kill them? Go back and kill them!',
                response1:'*End conversation*',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 17 && self.questInfo.quest === 'Weird Tower'){
            self.questStage = 9;
            self.invincible = false;
            socket.emit('dialougeLine',{
                state:'remove',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 18 && self.questInfo.quest === 'Weird Tower'){
            var d = new Date();
            var m = '' + d.getMinutes();
            if(m.length === 1){
                m = '' + 0 + m;
            }
            if(m === '0'){
                m = '00';
            }
            console.error("[" + d.getHours() + ":" + m + "] " + Player.list[socket.id].username + " completed the quest " + self.quest + ".");
            for(var i in SOCKET_LIST){
                SOCKET_LIST[i].emit('addToChat',{
                    style:'style="color: ' + self.textColor + '">',
                    message:Player.list[socket.id].username + " completed the quest " + self.quest + ".",
                });
            }
            self.quest = false;
            self.questInfo = {
                quest:false,
            };
            for(var i in self.questDependent){
                self.questDependent[i].toRemove = true;
            }
            self.invincible = false;
            socket.emit('dialougeLine',{
                state:'remove',
            });
            self.currentResponse = 0;
            self.xp += Math.round(2000 * self.stats.xp);
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
                luck:1,
            }
            self.textColor = '#ffff00';
            self.hpMax = 1000;
            for(var i in self.inventory.currentEquip){
                if(self.inventory.currentEquip[i] !== ''){
                    try{
                        eval(Item.list[self.inventory.currentEquip[i]].event);
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
                            eval(Item.list[self.inventory.items[i].id].event);
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
            if(self.username === 'Unknown'){
                self.textColor = '#000000';
            }
        }
    }
    self.updateMap = function(){
        if(self.mapChange === 0 && self.state !== 'dead'){
            self.canMove = false;
            socket.emit('changeMap',self.transporter);
        }
        if(self.mapChange === 5 && self.state !== 'dead'){
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
                        spawnMonster(Spawner.list[i],i);
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
                        message:self.username + " went to map " + self.map + ".",
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
        if(self.mapChange === 10 && self.state !== 'dead'){
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
    }
    self.updateXp = function(){
        if(self.level > xpLevels.length + 1){
            self.xpMax = self.xp;
            return;
        }
        if(self.xp >= self.xpMax){
            self.xp = self.xp - self.xpMax;
            self.level += 1;
            self.xpMax = xpLevels[self.level];
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
            if(self.keyPress.attack === true && self.attackReload > 15 && self.map !== "The Village" && self.map !== "House" && self.map !== "Starter House" && self.map !== "Secret Base" && self.map !== "Cacti Farm" && self.map !== "The Guarded Citadel"){
                self.attackReload = 1;
                self.attackTick = 0;
            }
            if(self.keyPress.second === true && self.secondReload > 250 && self.map !== "The Village" && self.map !== "House" && self.map !== "Starter House" && self.map !== "Secret Base" && self.map !== "Cacti Farm" && self.map !== "The Guarded Citadel"){
                self.secondReload = 1;
                self.secondTick = 0;
            }
            if(self.keyPress.heal === true && self.healReload > 500){
                self.healReload = 1;
                self.healTick = 0;
            }
        }
        if(self.attackTick === 0 && self.state !== 'dead' && self.map !== "The Village" && self.map !== "House" && self.map !== "Starter House" && self.map !== "Secret Base" && self.map !== "Cacti Farm" && self.map !== "The Guarded Citadel"){
            self.shootProjectile(self.id,'Player',self.direction - 15,self.direction - 15,'Bullet',0,self.stats);
            self.shootProjectile(self.id,'Player',self.direction - 5,self.direction - 5,'Bullet',0,self.stats);
            self.shootProjectile(self.id,'Player',self.direction + 5,self.direction + 5,'Bullet',0,self.stats);
            self.shootProjectile(self.id,'Player',self.direction + 15,self.direction + 15,'Bullet',0,self.stats);
        }
        if(self.secondTick === 0 && self.state !== 'dead' && self.map !== "The Village" && self.map !== "House" && self.map !== "Starter House" && self.map !== "Secret Base" && self.map !== "Cacti Farm" && self.map !== "The Guarded Citadel"){
            for(var i = 0;i < 10;i++){
                self.shootProjectile(self.id,'Player',i * 36,i * 36,'Bullet',0,self.stats);
            }
        }
        if(self.secondTick === 20 && self.state !== 'dead' && self.map !== "The Village" && self.map !== "House" && self.map !== "Starter House" && self.map !== "Secret Base" && self.map !== "Cacti Farm" && self.map !== "The Guarded Citadel"){
            for(var i = 0;i < 10;i++){
                self.shootProjectile(self.id,'Player',i * 36,i * 36,'Bullet',0,self.stats);
            }
        }
        if(self.secondTick === 40 && self.state !== 'dead' && self.map !== "The Village" && self.map !== "House" && self.map !== "Starter House" && self.map !== "Secret Base" && self.map !== "Cacti Farm" && self.map !== "The Guarded Citadel"){
            for(var i = 0;i < 10;i++){
                self.shootProjectile(self.id,'Player',i * 36,i * 36,'Bullet',0,self.stats);
            }
        }
        if(self.secondTick === 60 && self.state !== 'dead' && self.map !== "The Village" && self.map !== "House" && self.map !== "Starter House" && self.map !== "Secret Base" && self.map !== "Cacti Farm" && self.map !== "The Guarded Citadel"){
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
        for(var i in self.img){
            if(lastSelf.img){
                if(lastSelf.img[i]){
                    if(Array.isArray(lastSelf.img[i])){
                        for(var j in lastSelf.img[i]){
                            if(self.img[i][j] !== lastSelf.img[i][j]){
                                pack.img = self.img;
                                lastSelf.img = JSON.parse(JSON.stringify(self.img));
                            }
                        }
                    }
                    else{
                        if(self.img[i] !== lastSelf.img[i]){
                            pack.img = self.img;
                            lastSelf.img = JSON.parse(JSON.stringify(self.img));
                        }
                    }
                }
                else{
                    pack.img = self.img;
                    lastSelf.img = JSON.parse(JSON.stringify(self.img));
                }
            }
            else{
                pack.img = self.img;
                lastSelf.img = JSON.parse(JSON.stringify(self.img));
            }
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
        for(var i in self.stats){
            if(lastSelf.stats){
                if(lastSelf.stats[i]){
                    if(self.stats[i] !== lastSelf.stats[i]){
                        pack.stats = self.stats;
                        lastSelf.stats = JSON.parse(JSON.stringify(self.stats));
                    }
                }
                else{
                    pack.stats = self.stats;
                    lastSelf.stats = JSON.parse(JSON.stringify(self.stats));
                }
            }
            else{
                pack.stats = self.stats;
                lastSelf.stats = JSON.parse(JSON.stringify(self.stats));
            }
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
            if(data.inputId === player.keyMap.left || data.inputId === player.secondKeyMap.left){
                player.keyPress.left = data.state;
            }
            if(data.inputId === player.keyMap.right || data.inputId === player.secondKeyMap.right){
                player.keyPress.right = data.state;
            }
            if(data.inputId === player.keyMap.up || data.inputId === player.secondKeyMap.up){
                player.keyPress.up = data.state;
            }
            if(data.inputId === player.keyMap.down || data.inputId === player.secondKeyMap.down){
                player.keyPress.down = data.state;
            }
            if(data.inputId === player.keyMap.attack || data.inputId === player.secondKeyMap.attack){
                player.keyPress.attack = data.state;
            }
            if(data.inputId === player.keyMap.second || data.inputId === player.secondKeyMap.second){
                player.keyPress.second = data.state;
            }
            if(data.inputId === player.keyMap.heal || data.inputId === player.secondKeyMap.heal){
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
            if(data.inputId === 'imgBody'){
                if(parseInt(data.state,10) < 1){
                    player.img.body[0] = -1;
                    player.img.body[1] = -1;
                    player.img.body[2] = -1;
                }
                else if(parseInt(data.state,10) < 51){
                    player.img.body[0] = 5 * (50 - parseInt(data.state,10));
                    player.img.body[1] = 5 * parseInt(data.state,10);
                    player.img.body[2] = 0;
                }
                else if(parseInt(data.state,10) < 101){
                    player.img.body[0] = 0;
                    player.img.body[1] = 5 * (100 - parseInt(data.state,10));
                    player.img.body[2] = 5 * (parseInt(data.state,10) - 50);
                }
                else{
                    player.img.body[0] = 5 * (parseInt(data.state,10) - 100);
                    player.img.body[1] = 0;
                    player.img.body[2] = 5 * (150 - parseInt(data.state,10));
                }
            }
            if(data.inputId === 'imgShirt'){
                if(parseInt(data.state,10) < 51){
                    player.img.shirt[0] = 5 * (50 - parseInt(data.state,10));
                    player.img.shirt[1] = 5 * parseInt(data.state,10);
                    player.img.shirt[2] = 0;
                }
                else if(parseInt(data.state,10) < 101){
                    player.img.shirt[0] = 0;
                    player.img.shirt[1] = 5 * (100 - parseInt(data.state,10));
                    player.img.shirt[2] = 5 * (parseInt(data.state,10) - 50);
                }
                else{
                    player.img.shirt[0] = 5 * (parseInt(data.state,10) - 100);
                    player.img.shirt[1] = 0;
                    player.img.shirt[2] = 5 * (150 - parseInt(data.state,10));
                }
            }
            if(data.inputId === 'imgPants'){
                if(parseInt(data.state,10) < 51){
                    player.img.pants[0] = 5 * (50 - parseInt(data.state,10));
                    player.img.pants[1] = 5 * parseInt(data.state,10);
                    player.img.pants[2] = 0;
                }
                else if(parseInt(data.state,10) < 101){
                    player.img.pants[0] = 0;
                    player.img.pants[1] = 5 * (100 - parseInt(data.state,10));
                    player.img.pants[2] = 5 * (parseInt(data.state,10) - 50);
                }
                else{
                    player.img.pants[0] = 5 * (parseInt(data.state,10) - 100);
                    player.img.pants[1] = 0;
                    player.img.pants[2] = 5 * (150 - parseInt(data.state,10));
                }
            }
            if(data.inputId === 'imgHair'){
                if(parseInt(data.state,10) < 51){
                    player.img.hair[0] = 5 * (50 - parseInt(data.state,10));
                    player.img.hair[1] = 5 * parseInt(data.state,10);
                    player.img.hair[2] = 0;
                }
                else if(parseInt(data.state,10) < 101){
                    player.img.hair[0] = 0;
                    player.img.hair[1] = 5 * (100 - parseInt(data.state,10));
                    player.img.hair[2] = 5 * (parseInt(data.state,10) - 50);
                }
                else{
                    player.img.hair[0] = 5 * (parseInt(data.state,10) - 100);
                    player.img.hair[1] = 0;
                    player.img.hair[2] = 5 * (150 - parseInt(data.state,10));
                }
            }
            if(data.inputId === 'imgHairType'){
                if(parseInt(data.state,10) === 0){
                    player.img.hairType = 'bald';
                }
                else if(parseInt(data.state,10) === 1){
                    player.img.hairType = 'shortHair';
                }
                else if(parseInt(data.state,10) === 2){
                    player.img.hairType = 'longHair';
                }
                else if(parseInt(data.state,10) === 3){
                    player.img.hairType = 'shortHat';
                }
                else if(parseInt(data.state,10) === 4){
                    player.img.hairType = 'longHat';
                }
                else if(parseInt(data.state,10) === 5){
                    player.img.hairType = 'vikingHat';
                }
            }
        });

        socket.on('diolougeResponse',function(data){
            player.currentResponse = data;
        });

        socket.on('respawn',function(data){
            if(player.state !== 'dead'){
                var d = new Date();
                var m = '' + d.getMinutes();
                if(m.length === 1){
                    m = '' + 0 + m;
                }
                if(m === '0'){
                    m = '00';
                }
                console.error("[" + d.getHours() + ":" + m + "] " + player.username.error + ' cheated using respawn.'.error);
                for(var i in SOCKET_LIST){
                    SOCKET_LIST[i].emit('addToChat',{
                        style:'style="color: #ff0000">',
                        message:player.username + ' cheated using respawn.',
                    });
                }
                Player.onDisconnect(SOCKET_LIST[player.id]);
                return;
            }
            player.hp = Math.round(player.hpMax / 2);
            player.isDead = false;
            player.toRemove = false;
            player.state = 'none';
            player.dazed = 0;
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
                    message:player.username + ' respawned.',
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
            });
        }
        for(var i in tiles){
            socket.emit('drawTile',tiles[i]);
        }
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
            Player.list[socket.id].questDependent[i].toRemove = true;
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
    self.img = {
        body:[-1,-1,-1,0.5],
        shirt:[Math.random() * 255,Math.random() * 255,Math.random() * 255,0.5],
        pants:[Math.random() * 255,Math.random() * 255,Math.random() * 255,0.6],
        hair:[Math.random() * 255,Math.random() * 255,Math.random() * 255,0.5],
        hairType:'vikingHat',
    };
    var hairType = Math.random();
    if(hairType > 0.8){
        self.img.hairType = 'shortHair';
    }
    else if(hairType > 0.6){
        self.img.hairType = 'longHair';
    }
    else if(hairType > 0.4){
        self.img.hairType = 'shortHat';
    }
    else if(hairType > 0.2){
        self.img.hairType = 'longHat';
    }
    else if(hairType > 0.1){
        self.img.hairType = 'bald';
    }
    self.name = param.name;
    self.entityId = param.entityId;
    var lastSelf = {};
	var super_update = self.update;
    self.mapHeight = Maps[self.map].height;
    self.mapWidth = Maps[self.map].width;
    self.width = 32;
    self.height = 28;
    self.canMove = true;
    if(param.info.randomWalk === 'wander'){
        self.randomWalk(true,false,self.x,self.y);
    }
    else if(param.info.randomWalk === 'waypoint'){
        self.randomWalk(true,true,self.x,self.y);
    }
    self.canChangeMap = param.info.canChangeMap;
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
        for(var i in self.img){
            if(lastSelf.img){
                if(lastSelf.img[i]){
                    if(Array.isArray(lastSelf.img[i])){
                        for(var j in lastSelf.img[i]){
                            if(self.img[i][j] !== lastSelf.img[i][j]){
                                pack.img = self.img;
                                lastSelf.img = JSON.parse(JSON.stringify(self.img));
                            }
                        }
                    }
                    else{
                        if(self.img[i] !== lastSelf.img[i]){
                            pack.img = self.img;
                            lastSelf.img = JSON.parse(JSON.stringify(self.img));
                        }
                    }
                }
                else{
                    pack.img = self.img;
                    lastSelf.img = JSON.parse(JSON.stringify(self.img));
                }
            }
            else{
                pack.img = self.img;
                lastSelf.img = JSON.parse(JSON.stringify(self.img));
            }
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


Monster = function(param){
    var self = Actor(param);
    self.spawnId = param.spawnId;
    self.attackState = param.attackState;
    self.direction = 0;
    self.width = 44;
    self.height = 52;
    self.toRemove = false;
    self.reload = 0;
    self.target = {};
    self.type = 'Monster';
    self.isDead = false;
    self.isHostile = true;
    self.stats = {
        attack:1,
        defense:1,
        heal:1,
    }
    if(param.stats){
        self.stats = param.stats;
    }
    self.hp = 200;
    self.hpMax = 200;
    if(param.hp){
        self.hp = param.hp;
        self.hpMax = param.hp;
    }
    if(param.hpMax){
        self.hp = param.hpMax;
        self.hpMax = param.hpMax;
    }
    self.monsterType = param.monsterType;
    if(param.attackState){
        self.attackState = param.attackState;
    }
    if(self.monsterType === 'redBird'){
        self.width = 88;
        self.height = 104;
    }
    if(self.monsterType === 'blueBall'){
        self.width = 44;
        self.height = 44;
    }
    if(self.monsterType === 'cherryBomb'){
        self.width = 12 * 4;
        self.height = 10 * 4;
    }
    self.animation = 0;
    self.animate = false;
    self.healReload = 0;
    self.canChangeMap = false;
    self.damaged = false;
    self.onHit = function(pt){
        if(pt.parent){
            self.target = Player.list[pt.parent];
        }
        else{
            self.target = pt;
        }
        self.damaged = true;
    }
    var lastSelf = {};
    var super_update = self.update;
    self.update = function(){
        super_update();
        if(self.animate){
            if(self.animation === -1){
                self.animation = 0;
            }
            else{
                self.animation += 1;
            }
        }
        self.updateAttack();
        if(self.hp < 1){
            param.onDeath(self);
        }
        else{
            if(self.healReload % 10 === 0){
                self.hp += Math.round(self.stats.heal * (10 + Math.random() * 15));
            }
        }
        self.healReload += 1;
        if(self.hp > self.hpMax){
            self.hp = self.hpMax;
        }
    }
    self.updateAttack = function(){
        if(self.target){
            self.direction = Math.atan2(self.target.y - self.y,self.target.x - self.x) / Math.PI * 180;
        }
        switch(self.attackState){
            case "passiveBird":
                self.spdX = 0;
                self.spdY = 0;
                self.animate = true;
                for(var i in Player.list){
                    if(Player.list[i].map === self.map && self.getDistance(Player.list[i]) < 512 && Player.list[i].state !== "dead" && Player.list[i].invincible === false && Player.list[i].mapChange > 10){
                        self.attackState = "moveBird";
                        self.target = Player.list[i];
                    }
                }
                if(self.damaged){
                    self.attackState = "moveBird";
                }
                break;
            case "moveBird":
                self.trackEntity(self.target);
                self.reload = 0;
                self.damaged = false;
                self.attackState = "attackBird";
                break;
            case "attackBird":
                if(self.reload % 20 === 0 && self.reload > 10 && self.target.invincible === false){
                    self.shootProjectile(self.id,'Monster',self.direction,self.direction,'W_Throw004 - Copy',0,self.stats);
                }
                if(self.reload % 100 < 5 && self.reload > 10 && self.target.invincible === false){
                    self.shootProjectile(self.id,'Monster',self.direction,self.direction,'W_Throw004 - Copy',0,self.stats);
                }
                self.reload += 1;
                if(self.hp < 0.5 * self.hpMax){
                    self.escapeEntity(self.target);
                    self.attackState = 'retreatBird';
                    self.maxSpeed *= 3;
                    break;
                }
                if(self.getDistance(self.target) > 512 || self.target.state === 'dead'){
                    if(!self.damaged){
                        self.target = undefined;
                        self.trackingEntity = undefined;
                        self.attackState = 'passiveBird';
                    }
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
                break;
            case "retreatBird":
                if(self.hp > 0.8 * self.hpMax){
                    self.attackState = 'passiveBird';
                    self.maxSpeed = param.moveSpeed;
                    self.target = undefined;
                    self.trackingEntity = undefined;
                }
                break;
            case "passiveBall":
                self.spdX = 0;
                self.spdY = 0;
                for(var i in Player.list){
                    if(Player.list[i].map === self.map && self.getDistance(Player.list[i]) < 512 && Player.list[i].state !== "dead" && Player.list[i].invincible === false && Player.list[i].mapChange > 10){
                        self.attackState = "moveBall";
                        self.target = Player.list[i];
                    }
                }
                break;
            case "moveBall":
                self.trackEntity(self.target);
                self.reload = 0;
                self.animation = 0;
                self.attackState = "attackBall";
                self.damaged = false;
                break;
            case "attackBall":
                if(self.reload % 50 < 16 && self.reload > 49 && self.target.invincible === false){
                    self.animation += 0.5;
                    if(self.animation >= 8){
                        self.animation = 0;
                    }
                    for(var i = 0;i < 4;i++){
                        self.shootProjectile(self.id,'Monster',self.animation * 45 + i * 90,self.animation * 45 + i * 90,'Ball_Bullet',-20,self.stats);
                    }
                }
                self.reload += 1;
                if(self.getDistance(self.target) > 512 || self.target.state === 'dead'){
                    if(!self.damaged){
                        self.target = undefined;
                        self.attackState = 'passiveBall';
                    }
                }
                break;
            case "passiveCherryBomb":
                self.spdX = 0;
                self.spdY = 0;
                for(var i in Player.list){
                    if(Player.list[i].map === self.map && self.getDistance(Player.list[i]) < 512 && Player.list[i].state !== "dead" && Player.list[i].invincible === false && Player.list[i].mapChange > 10){
                        self.attackState = "moveCherryBomb";
                        self.target = Player.list[i];
                    }
                }
                break;
            case "moveCherryBomb":
                self.trackEntity(self.target);
                self.reload = 0;
                self.animation = 0;
                self.attackState = "attackCherryBomb";
                self.damaged = false;
                break;
            case "attackCherryBomb":
                self.reload += 1;
                if(self.getDistance(self.target) < 64){
                    self.stats.defense *= 10;
                    self.stats.attack *= 20;
                    self.attackState = 'explodeCherryBomb';
                    break;
                }
                else if(self.animation < 2){
                    if(self.animation === 0){
                        self.animation = 1;
                    }
                    else if(self.animation === 1){
                        self.animation = 0;
                    }
                }
                break;
            case "explodeCherryBomb":
                if(self.animation === 0){
                    self.animation = 1;
                }
                self.animation += 0.2;
                if(self.animation > 4){
                    self.width = 18 * 8;
                    self.height = 18 * 8;
                    self.pushPower = 300;
                }
                if(self.animation > 5){
                    self.toRemove = true;
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
        if(lastSelf.animation !== self.animation){
            pack.animation = self.animation;
            lastSelf.animation = self.animation;
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
        pack.animation = self.animation;
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
    self.map = 'The Village';
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
    self.width = 36;
    self.height = 36;
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
        if(Collision2.list[firstTile]){
            if(self.isColliding(Collision2.list[firstTile])){
                self.toRemove = true;
            }
        }
        if(Collision2.list[secondTile]){
            if(self.isColliding(Collision2.list[secondTile])){
                self.toRemove = true;
            }
        }
        if(Collision2.list[thirdTile]){
            if(self.isColliding(Collision2.list[thirdTile])){
                self.toRemove = true;
            }
        }
        if(Collision2.list[fourthTile]){
            if(self.isColliding(Collision2.list[fourthTile])){
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



var renderLayer = function(layer,data,loadedMap){
    if(layer.type !== "tilelayer" && layer.visible === false){
        return;
    }
    var size = data.tilewidth;
    size = 64;
    Maps[loadedMap] = {width:layer.width * size,height:layer.height * size};
    playerMap[loadedMap] = 0;
    for(var i = 0;i < layer.data.length;i++){
        var tile_idx = layer.data[i];
        if(tile_idx){
            var x = (i % layer.width) * size;
            var y = ~~(i / layer.width) * size;
            var map = loadedMap;
            tile = data.tilesets[0];
            tile_idx -= 1;
            if(tile_idx === 2121){
                var collision = new Collision({
                    x:x + size / 2,
                    y:y + size / 2,
                    width:size,
                    height:size,
                    map:map,
                });
            }
            if(tile_idx === 2122){
                var collision = new Collision({
                    x:x + size / 2,
                    y:y + 3 * size / 4,
                    width:size,
                    height:size / 2,
                    map:map,
                });
            }
            if(tile_idx === 2123){
                var collision = new Collision({
                    x:x + size / 2,
                    y:y + size / 4,
                    width:size,
                    height:size / 2,
                    map:map,
                });
            }
            if(tile_idx === 2124){
                var collision = new Collision({
                    x:x + size / 4,
                    y:y + size / 2,
                    width:size / 2,
                    height:size,
                    map:map,
                });
            }
            if(tile_idx === 2125){
                var collision = new Collision({
                    x:x + 3 * size / 4,
                    y:y + size / 2,
                    width:size / 2,
                    height:size,
                    map:map,
                });
            }
            if(tile_idx === 2126){
                var collision2 = new Collision2({
                    x:x + size / 2,
                    y:y + size / 2,
                    width:size,
                    height:size,
                    map:map,
                });
            }
            if(tile_idx === 2127){
                var collision = new Collision({
                    x:x + size / 2,
                    y:y + 3 * size / 4,
                    width:size,
                    height:size / 2,
                    map:map,
                });
            }
            if(tile_idx === 2128){
                var collision2 = new Collision2({
                    x:x + size / 2,
                    y:y + size / 4,
                    width:size,
                    height:size / 2,
                    map:map,
                });
            }
            if(tile_idx === 2129){
                var collision2 = new Collision2({
                    x:x + size / 4,
                    y:y + size / 2,
                    width:size / 2,
                    height:size,
                    map:map,
                });
            }
            if(tile_idx === 2130){
                var collision2 = new Collision2({
                    x:x + 3 * size / 4,
                    y:y + size / 2,
                    width:size / 2,
                    height:size,
                    map:map,
                });
            }
            if(tile_idx === 2207){
                var collision = new Collision({
                    x:x + size / 2,
                    y:y + size / 2,
                    width:size / 2,
                    height:size / 2,
                    map:map,
                });
            }
            if(tile_idx === 2208){
                var collision = new Collision({
                    x:x + size / 4,
                    y:y + 3 * size / 4,
                    width:size / 2,
                    height:size / 2,
                    map:map,
                });
            }
            if(tile_idx === 2209){
                var collision = new Collision({
                    x:x + 3 * size / 4,
                    y:y + 3 * size / 4,
                    width:size / 2,
                    height:size / 2,
                    map:map,
                });
            }
            if(tile_idx === 2210){
                var collision = new Collision({
                    x:x + 3 * size / 4,
                    y:y + size / 4,
                    width:size / 2,
                    height:size / 2,
                    map:map,
                });
            }
            if(tile_idx === 2211){
                var collision = new Collision({
                    x:x + size / 4,
                    y:y + size / 4,
                    width:size / 2,
                    height:size / 2,
                    map:map,
                });
            }
            if(tile_idx === 2212){
                var collision2 = new Collision2({
                    x:x + size / 2,
                    y:y + size / 2,
                    width:size / 2,
                    height:size / 2,
                    map:map,
                });
            }
            if(tile_idx === 2213){
                var collision2 = new Collision2({
                    x:x + size / 4,
                    y:y + 3 * size / 4,
                    width:size / 2,
                    height:size / 2,
                    map:map,
                });
            }
            if(tile_idx === 2214){
                var collision2 = new Collision2({
                    x:x + 3 * size / 4,
                    y:y + 3 * size / 4,
                    width:size / 2,
                    height:size / 2,
                    map:map,
                });
            }
            if(tile_idx === 2215){
                var collision2 = new Collision2({
                    x:x + 3 * size / 4,
                    y:y + size / 4,
                    width:size / 2,
                    height:size / 2,
                    map:map,
                });
            }
            if(tile_idx === 2216){
                var collision2 = new Collision2({
                    x:x + size / 4,
                    y:y + size / 4,
                    width:size / 2,
                    height:size / 2,
                    map:map,
                });
            }
            if(tile_idx === 1949){
                var type = "";
                var typej = 0;
                var id = "";
                var idj = 0;
                var name = "";
                var namej = 0;
                var info = "";
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
                            namej = j;
                        }
                        else if(info === ""){
                            info = layer.name.substr(namej + 1,layer.name.length - namej - 2);
                        }
                    }
                }
                if(type === 'Npc'){
                    var npc = new Npc({
                        x:x + size / 2,
                        y:y + size / 2,
                        name:name,
                        entityId:id,
                        map:map,
                        moveSpeed:5,
                        info:JSON.parse(info),
                    });
                }
                if(type === 'WayPoint'){
                    var waypoint = new WayPoint({
                        x:x + size / 2,
                        y:y + size / 2,
                        info:{id:id,info:name},
                        map:map,
                    });
                }
            }
            if(tile_idx === 1863){
                var slowDown = new SlowDown({
                    x:x + size / 2,
                    y:y + size / 2,
                    width:size,
                    height:size,
                    map:map,
                });
            }
            if(tile_idx === 1864){
                var slowDown = new SlowDown({
                    x:x + size / 2,
                    y:y + 3 * size / 4,
                    width:size,
                    height:size / 2,
                    map:map,
                });
            }
            if(tile_idx === 1865){
                var slowDown = new SlowDown({
                    x:x + size / 2,
                    y:y + size / 4,
                    width:size,
                    height:size / 2,
                    map:map,
                });
            }
            if(tile_idx === 1866){
                var slowDown = new SlowDown({
                    x:x + size / 4,
                    y:y + size / 2,
                    width:size / 2,
                    height:size,
                    map:map,
                });
            }
            if(tile_idx === 1867){
                var slowDown = new SlowDown({
                    x:x + 3 * size / 4,
                    y:y + size / 2,
                    width:size / 2,
                    height:size,
                    map:map,
                });
            }
            if(tile_idx === 1777){
                var spawner = new Spawner({
                    x:x + size / 2,
                    y:y + size / 2,
                    width:size,
                    height:size,
                    map:map,
                });
            }
            if(tile_idx === 1691){
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
                    x:x + size / 2,
                    y:y + size / 2,
                    width:size,
                    height:size,
                    map:map,
                    info:info,
                    quest:quest,
                });
            }
            if(tile_idx === 2035){
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
                    x:x + size / 2,
                    y:y + size / 2,
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
                    x:x + size / 2,
                    y:y + 3 * size / 4,
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
                    x:x + size / 2,
                    y:y + size / 4,
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
                    x:x + size / 4,
                    y:y + size / 2,
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
                    x:x + 3 * size / 4,
                    y:y + size / 2,
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
load("Town Hall");
load("Fishing Hut");
load("House");
var compareMaps = function(a,b){
    if(a.y === b.y){
        return a.x - b.x;
    }
    return a.y - b.y;
}
fs.readFile("./client/maps/World.world","utf8",function(err,data){
    worldMap = JSON.parse(data).maps;
    worldMap.sort(compareMaps);
    for(var i in worldMap){
        load(worldMap[i].fileName.slice(0,-4));
    }
});

updateCrashes = function(){
    for(var i in Player.list){
        for(var j in Projectile.list){
            if(Player.list[i] && Projectile.list[j]){
                if(Player.list[i].isColliding(Projectile.list[j]) && "" + Projectile.list[j].parent !== i && Projectile.list[j].parentType !== 'Player' && Player.list[i].state !== 'dead' && Projectile.list[j].map === Player.list[i].map){
                    Player.list[i].onCollision(Projectile.list[j],50);
                    Projectile.list[j].onCollision(Projectile.list[j],Player.list[i]);
                }
            }
        }
    }
    for(var i in Monster.list){
        for(var j in Projectile.list){
            if(Monster.list[i] && Projectile.list[j]){
                if(Monster.list[i].isColliding(Projectile.list[j]) && "" + Projectile.list[j].parent !== i && Projectile.list[j].parentType !== 'Monster' && Projectile.list[j].map === Monster.list[i].map && Monster.list[i].invincible === false){
                    Monster.list[i].onCollision(Projectile.list[j],50);
                    Projectile.list[j].onCollision(Projectile.list[j],Monster.list[i]);
                }
            }
        }
        for(var j in Player.list){
            if(Monster.list[i] && Player.list[j]){
                if(Monster.list[i].isColliding(Player.list[j]) && Player.list[j].invincible === false && Monster.list[i].invincible === false){
                    Player.list[j].onPush(Monster.list[i],20);
                    Monster.list[i].onPush(Player.list[j],20);
                }
            }
        }
        for(var j in Monster.list){
            if(Monster.list[i] && Monster.list[j]){
                if(Monster.list[i].isColliding(Monster.list[j]) && Monster.list[j].invincible === false && Monster.list[i].invincible === false && i !== j){
                    Monster.list[j].onPush(Monster.list[i],0);
                    Monster.list[i].onPush(Monster.list[j],0);
                }
            }
        }
    }
    for(var i in Npc.list){
        for(var j in Projectile.list){
            if(Npc.list[i] && Projectile.list[j]){
                if(Npc.list[i].isColliding(Projectile.list[j]) && "" + Projectile.list[j].parent != i && Projectile.list[j].map === Npc.list[i].map){
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
                spawnMonster(Spawner.list[i],i);
            }
        }
    }
}

