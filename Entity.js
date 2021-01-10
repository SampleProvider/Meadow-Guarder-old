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
var PF = require('pathfinding');

worldMap = [];
require('./env.js');

s = {
    findPlayer:function(param){
        for(var i in Player.list){
            if(Player.list[i].username === param){
                return Player.list[i];
            }
        }
    },
    spawnMonster:function(param,pt){
        for(var i in monsterData){
            if(i === param){
                var monsterHp = 200;
                var monsterStats = {
                    attack:1,
                    defense:1,
                    heal:1,
                }
                monsterHp *= monsterData[i].hp;
                monsterStats.attack *= monsterData[i].stats.attack;
                monsterStats.defense *= monsterData[i].stats.defense;
                monsterStats.heal *= monsterData[i].stats.heal;
                var monster = new Monster({
                    spawnId:false,
                    x:pt.x + Math.random() * 128 - 64,
                    y:pt.y + Math.random() * 128 - 64,
                    map:pt.map,
                    moveSpeed:monsterData[i].moveSpeed,
                    stats:monsterStats,
                    hp:Math.round(monsterHp),
                    monsterType:i,
                    attackState:monsterData[i].attackState,
                    width:monsterData[i].width,
                    height:monsterData[i].height,
                    xpGain:monsterData[i].xpGain,
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
            }
        }
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
    smite:function(param){
        var player = s.findPlayer(param);
        player.invincible = false;
        s.spawnMonster('redCherryBomb',player);
    },
    smiteAll:function(){
        for(var i in Player.list){
            s.smite(Player.list[i].username);
        }
    },
    kill:function(param){
        var player = s.findPlayer(param);
        player.invincible = false;
        player.hp = 0;
        player.isDead = true;
        player.willBeDead = true;
        player.toRemove = true;
    },
};

var monsterData = require('./monsters.json');
var projectileData = require('./projectiles.json');

var spawnMonster = function(spawner,spawnId){
    var monsterSeed = Math.random();
    var monsterTotal = 0;
    for(var i in monsterData){
        monsterTotal += monsterData[i].spawnChance;
    }
    monsterSeed *= monsterTotal;
    for(var i in monsterData){
        if(monsterSeed > 0 && monsterSeed < monsterData[i].spawnChance){
            var monsterHp = 0;
            var monsterStats = {
                attack:0,
                defense:0,
                heal:0,
            }
            for(var j in Player.list){
                if(Player.list[j].map === spawner.map){
                    monsterHp += Player.list[j].hpMax / 6;
                    monsterStats.attack += Player.list[j].stats.attack / 6;
                    monsterStats.defense += Player.list[j].stats.defense / 6;
                    monsterStats.heal += Player.list[j].stats.heal / 6;
                }
            }
            monsterHp = monsterHp / playerMap[spawner.map];
            monsterStats.attack = monsterStats.attack / playerMap[spawner.map];
            monsterStats.defense = monsterStats.defense / playerMap[spawner.map];
            monsterStats.heal = monsterStats.heal / playerMap[spawner.map];
            monsterHp *= monsterData[i].hp;
            monsterStats.attack *= monsterData[i].stats.attack;
            monsterStats.defense *= monsterData[i].stats.defense;
            monsterStats.heal *= monsterData[i].stats.heal;
            monsterHp += monsterData[i].baseHp;
            monsterStats.attack += monsterData[i].baseStats.attack;
            monsterStats.defense += monsterData[i].baseStats.defense;
            monsterStats.heal += monsterData[i].baseStats.heal;
            var monster = new Monster({
                spawnId:spawnId,
                x:spawner.x,
                y:spawner.y,
                map:spawner.map,
                moveSpeed:monsterData[i].moveSpeed,
                stats:monsterStats,
                hp:Math.round(monsterHp),
                monsterType:i,
                attackState:monsterData[i].attackState,
                width:monsterData[i].width,
                height:monsterData[i].height,
                xpGain:monsterData[i].xpGain,
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
            return;
        }
        monsterSeed -= monsterData[i].spawnChance;
    }
}

addToChat = function(style,message,debug){
    var d = new Date();
    var m = '' + d.getMinutes();
    var h = d.getHours() + 24;
    if(SERVER !== 'localhost'){
        h -= 5;
    }
    h = h % 24;
    h = '' + h;
    if(m.length === 1){
        m = '' + 0 + m;
    }
    if(m === '0'){
        m = '00';
    }
    console.error("[" + h + ":" + m + "] " + message);
    for(var i in Player.list){
        SOCKET_LIST[i].emit('addToChat',{
            style:style,
            message:message,
            debug:debug,
        });
    }
}


var playerMap = {};

Maps = {};

tiles = [];

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
    self.updateNextFrame = true;
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
	self.getSquareDistance = function(pt){
		return Math.max(Math.abs(self.x - pt.x),Math.abs(self.y - pt.y));
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
                    pack[Monster.list[i].map] = {player:[],projectile:[],monster:[],npc:[],pet:[],particle:[]};
                }
                var updatePack = Monster.list[i].getUpdatePack();
                pack[Monster.list[i].map].monster.push(updatePack);
            }
        }
    }
    for(var i in Player.list){
        if(Player.list[i]){
            Player.list[i].update();
            if(!pack[Player.list[i].map]){
                pack[Player.list[i].map] = {player:[],projectile:[],monster:[],npc:[],pet:[],particle:[]};
            }
            var updatePack = Player.list[i].getUpdatePack();
            pack[Player.list[i].map].player.push(updatePack);
        }
    }
    for(var i in Projectile.list){
        Projectile.list[i].update();
    }
    for(var i in Npc.list){
        if(playerMap[Npc.list[i].map] > 0){
            Npc.list[i].update();
            if(playerMap[Npc.list[i].map] > 0){
                if(!pack[Npc.list[i].map]){
                    pack[Npc.list[i].map] = {player:[],projectile:[],monster:[],npc:[],pet:[],particle:[]};
                }
                if(Npc.list[i].toRemove){
                    delete Npc.list[i];
                }
                else{
                    var updatePack = Npc.list[i].getUpdatePack();
                    pack[Npc.list[i].map].npc.push(updatePack);
                }
            }
        }
    }
    for(var i in Particle.list){
        if(playerMap[Particle.list[i].map] > 0){
            Particle.list[i].update();
            if(playerMap[Particle.list[i].map] > 0){
                if(!pack[Particle.list[i].map]){
                    pack[Particle.list[i].map] = {player:[],projectile:[],monster:[],npc:[],pet:[],particle:[]};
                }
                if(Particle.list[i].toRemove){
                    delete Particle.list[i];
                }
                else{
                    var updatePack = Particle.list[i].getUpdatePack();
                    pack[Particle.list[i].map].particle.push(updatePack);
                }
            }
        }
    }
    for(var i in Pet.list){
        Pet.list[i].update();
        if(!pack[Pet.list[i].map]){
            pack[Pet.list[i].map] = {player:[],projectile:[],monster:[],npc:[],pet:[],particle:[]};
        }
        if(Pet.list[i].toRemove){
            delete Pet.list[i];
        }
        else{
            var updatePack = Pet.list[i].getUpdatePack();
            pack[Pet.list[i].map].pet.push(updatePack);
        }
    }
    for(var i in Player.list){
        if(Player.list[i].willBeDead){
            Player.list[i].isDead = true;
            Player.list[i].willBeDead = false;
        }
    }
    for(var i in Monster.list){
        if(Monster.list[i].willBeDead){
            Monster.list[i].isDead = true;
            Monster.list[i].willBeDead = false;
        }
    }
    for(var i in Npc.list){
        if(Npc.list[i].willBeDead){
            Npc.list[i].isDead = true;
            Npc.list[i].willBeDead = false;
        }
    }
    for(var i in Pet.list){
        if(Pet.list[i].willBeDead){
            Pet.list[i].isDead = true;
            Pet.list[i].willBeDead = false;
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
            pack[Projectile.list[i].map] = {player:[],projectile:[],monster:[],npc:[],pet:[],particle:[]};
        }
        if(Projectile.list[i].updateNextFrame){
            pack[Projectile.list[i].map].projectile.push(Projectile.list[i].getUpdatePack());
        }
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
    self.trackingPos = {x:undefined,y:undefined};
    self.trackingPath = [];
    self.trackTime = 100;
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
    self.mapChange = 100;
    self.toRemove = false;
    self.isHostile = false;
    self.isDead = false;
    self.willBeDead = false;
    self.pushPower = 3;
    self.dazed = 0;
    self.animate = true;
    self.eventQ = [];
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
            self.dazed -= 1;
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
                var size = 33;
                var dx = Math.floor(self.x / 64) - size / 2 + 0.5;
                var dy = Math.floor(self.y / 64) - size / 2 + 0.5;
                var trackX = Math.floor(self.trackingEntity.x / 64) - dx;
                var trackY = Math.floor(self.trackingEntity.y / 64) - dy;
                self.trackTime += 1;
                if(trackX !== self.trackingPos.x || trackY !== self.trackingPos.y){
                    if(self.trackTime > 50 + 50 * Math.random()){
                        self.trackTime = 0;
                        self.trackingPos.x = trackX;
                        self.trackingPos.y = trackY;
                        var finder = new PF.BiAStarFinder({
                            allowDiagonal:true,
                            dontCrossCorners:true,
                        });
                        var grid = new PF.Grid(size,size);
                        for(var i = 0;i < size;i++){
                            for(var j = 0;j < size;j++){
                                var x = dx * 64 + i * 64;
                                var y = dy * 64 + j * 64;
                                if(Collision.list['' + self.map + ':' + x + ':' + y + ':'] !== undefined){
                                    grid.setWalkableAt(i,j,false);
                                }
                                if(Collision2.list['' + self.map + ':' + x + ':' + y + ':'] !== undefined){
                                    grid.setWalkableAt(i,j,false);
                                }
                                if(Collision3.list['' + self.map + ':' + x + ':' + y + ':'] !== undefined){
                                    grid.setWalkableAt(i,j,false);
                                }
                                if(x < 0 || x > self.mapWidth || y < 0 || y > self.mapHeight){
                                    grid.setWalkableAt(i,j,false);
                                }
                            }
                        }
                        var nx = Math.floor(self.x / 64) - dx;
                        var ny = Math.floor(self.y / 64) - dy;
                        if(nx < size && nx > 0 && ny < size && ny > 0 && trackX < size && trackX > 0 && trackY < size && trackY > 0){
                            var path = finder.findPath(nx,ny,trackX,trackY,grid);
                            self.trackingPath = PF.Util.compressPath(path);
                            for(var i in self.trackingPath){
                                self.trackingPath[i][0] += dx;
                                self.trackingPath[i][1] += dy;
                            }
                            self.trackingPath.shift();
                        }
                    }
                }
                if(self.trackingPath[0]){
                    if(self.x / 64 < self.trackingPath[0][0] + 0.5){
                        self.spdX = 1;
                    }
                    if(self.x / 64 > self.trackingPath[0][0] + 0.5){
                        self.spdX = -1;
                    }
                    if(self.y / 64 < self.trackingPath[0][1] + 0.5){
                        self.spdY = 1;
                    }
                    if(self.y / 64 > self.trackingPath[0][1] + 0.5){
                        self.spdY = -1;
                    }
                    if(self.spdX === 0 && self.spdY === 0){
                        self.trackingPath.shift();
                    }
                }
            }
        }
        else if(self.randomPos.walking){
            if(self.randomPos.waypoint){
                if(self.randomPos.currentWaypoint){
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
                    self.trackEntity(self.randomPos.currentWaypoint);
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
        if(self.pushPt !== undefined && self.invincible === false){
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
        if(self.dazed < 1){
            self.pushPt = pt;
            self.onCollision(pt,pushPower * self.pushPower / 10);
        }
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
        self.trackingPath = [];
        self.trackingPos = {x:undefined,y:undefined};
    }
    self.onHit = function(pt){
    }
    self.onCollision = function(pt,strength){
        if(!self.invincible && pt.toRemove === false){
            var damage = Math.round(pt.stats.attack * (strength + Math.random() * strength) / self.stats.defense);
            damage = Math.min(self.hp,damage);
            self.hp -= damage;
            self.onHit(pt);
            if(damage){
                var particle = new Particle({
                    x:self.x + Math.random() * 64 - 32,
                    y:self.y + Math.random() * 64 - 32,
                    map:self.map,
                    particleType:'redDamage',
                    value:'-' + damage,
                });
            }
        }
        if(self.hp < 1 && self.willBeDead === false && self.isDead === false && self.toRemove === false && pt.toRemove === false && pt.isDead === false){
            if(pt.parentType === 'Player' && self.type === 'Monster'){
                if(Player.list[pt.parent].isDead === false){
                    var items = Player.list[pt.parent].inventory.addRandomizedEnchantments(Player.list[pt.parent].stats.luck);
                    while(items.length > 0){
                        for(var i in items){
                            addToChat('style="color: ' + Player.list[pt.parent].textColor + '">',Player.list[pt.parent].displayName + " got a " + items[i].name + ".");
                        }
                        items = Player.list[pt.parent].inventory.addRandomizedEnchantments(Player.list[pt.parent].stats.luck);
                    }
                    Player.list[pt.parent].xp += self.xpGain * Math.round((10 + Math.random() * 10) * Player.list[pt.parent].stats.xp);
                }
            }
            if(pt.type === 'Player' && self.type === 'Monster'){
                var items = pt.inventory.addRandomizedEnchantments(pt.stats.luck);
                while(items.length > 0){
                    for(var i in items){
                        addToChat('style="color: ' + pt.textColor + '">',pt.displayName + " got a " + items[i].name + ".");
                    }
                    items = pt.inventory.addRandomizedEnchantments(pt.stats.luck);
                }
                pt.xp += Math.round(self.xpGain * (10 + Math.random() * 10) * pt.stats.xp);
            }
            self.willBeDead = true;
            self.toRemove = true;
        }
    }
    self.shootProjectile = function(id,parentType,angle,direction,projectileType,distance,stats){
        var projectileWidth = 0;
        var projectileHeight = 0;
        for(var i in projectileData){
            if(i === projectileType){
                projectileWidth = projectileData[i].width;
                projectileHeight = projectileData[i].height;
            }
        }
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
            width:projectileWidth,
            height:projectileHeight,
            stats:stats,
            onCollision:function(self,pt){
                self.toRemove = true;
            }
		});
    }
    self.addToEventQ = function(event,time){
        self.eventQ.push({event:event,time:time});
        var sortByTime = function(a,b){
            if(a.time === b.time){
                return 0;
            }
            else{
                if(a.time < b.time){
                    return -1;
                }
                return 1;
            }
        }
        self.eventQ.sort(sortByTime);
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
                if(Collision3.list[fourthTile]){
                    self.doCollision(Collision3.list[fourthTile]);
                }
                if(Collision3.list[thirdTile]){
                    self.doCollision(Collision3.list[thirdTile]);
                }
                if(Collision3.list[secondTile]){
                    self.doCollision(Collision3.list[secondTile]);
                }
                if(Collision3.list[firstTile]){
                    self.doCollision(Collision3.list[firstTile]);
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
                if(Collision3.list[thirdTile]){
                    self.doCollision(Collision3.list[thirdTile]);
                }
                if(Collision3.list[fourthTile]){
                    self.doCollision(Collision3.list[fourthTile]);
                }
                if(Collision3.list[firstTile]){
                    self.doCollision(Collision3.list[firstTile]);
                }
                if(Collision3.list[secondTile]){
                    self.doCollision(Collision3.list[secondTile]);
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
                if(Collision3.list[fourthTile]){
                    self.doCollision(Collision3.list[fourthTile]);
                }
                if(Collision3.list[thirdTile]){
                    self.doCollision(Collision3.list[thirdTile]);
                }
                if(Collision3.list[secondTile]){
                    self.doCollision(Collision3.list[secondTile]);
                }
                if(Collision3.list[firstTile]){
                    self.doCollision(Collision3.list[firstTile]);
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
                if(Collision3.list[secondTile]){
                    self.doCollision(Collision3.list[secondTile]);
                }
                if(Collision3.list[firstTile]){
                    self.doCollision(Collision3.list[firstTile]);
                }
                if(Collision3.list[fourthTile]){
                    self.doCollision(Collision3.list[fourthTile]);
                }
                if(Collision3.list[thirdTile]){
                    self.doCollision(Collision3.list[thirdTile]);
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
                if(Collision3.list[firstTile]){
                    self.doCollision(Collision3.list[firstTile]);
                }
                if(Collision3.list[secondTile]){
                    self.doCollision(Collision3.list[secondTile]);
                }
                if(Collision3.list[thirdTile]){
                    self.doCollision(Collision3.list[thirdTile]);
                }
                if(Collision3.list[fourthTile]){
                    self.doCollision(Collision3.list[fourthTile]);
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
                if(Collision3.list[secondTile]){
                    self.doCollision(Collision3.list[secondTile]);
                }
                if(Collision3.list[firstTile]){
                    self.doCollision(Collision3.list[firstTile]);
                }
                if(Collision3.list[fourthTile]){
                    self.doCollision(Collision3.list[fourthTile]);
                }
                if(Collision3.list[thirdTile]){
                    self.doCollision(Collision3.list[thirdTile]);
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
                if(Collision3.list[fourthTile]){
                    self.doCollision(Collision3.list[fourthTile]);
                }
                if(Collision3.list[thirdTile]){
                    self.doCollision(Collision3.list[thirdTile]);
                }
                if(Collision3.list[secondTile]){
                    self.doCollision(Collision3.list[secondTile]);
                }
                if(Collision3.list[firstTile]){
                    self.doCollision(Collision3.list[firstTile]);
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
                if(Collision3.list[thirdTile]){
                    self.doCollision(Collision3.list[thirdTile]);
                }
                if(Collision3.list[fourthTile]){
                    self.doCollision(Collision3.list[fourthTile]);
                }
                if(Collision3.list[firstTile]){
                    self.doCollision(Collision3.list[firstTile]);
                }
                if(Collision3.list[secondTile]){
                    self.doCollision(Collision3.list[secondTile]);
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
        if(self.hp < 1){
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
    self.rawMouseX = 0;
    self.rawMouseY = 0;
    self.width = 32;
    self.height = 28;
    self.moveSpeed = 20;
    self.maxSpeed = 20;
    self.img = {
        body:[-1,-1,-1,0.5],
        shirt:[255,0,0,0.5],
        pants:[0,0,255,0.6],
        hair:[0,255,0,0.7],
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
    self.pet = undefined;
    self.quest = false;
    self.questStage = 0;
    self.questInfo = {
        quest:false,
    };
    self.questDependent = {};
    self.questStats = {
        "Missing Person":false,
        "Weird Tower":false,
        "Clear River":false,
    }
    self.type = 'Player';
    self.username = param.username;
    self.displayName = param.username;
    self.textColor = '#ffff00';
    if(self.username === 'Unknown'){
        self.textColor = '#000000';
        var player = self;var color = 0;setInterval(()=>{if(color > 150){color = 0}color += 1;if(color < 51){player.img.hair[0] = 5 * (50 - color);player.img.hair[1] = 5 * color;player.img.hair[2] = 0;}else if(color < 101){player.img.hair[0] = 0;player.img.hair[1] = 5 * (100 - color);player.img.hair[2] = 5 * (color - 50);}else{player.img.hair[0] = 5 * (color - 100);player.img.hair[1] = 0;player.img.hair[2] = 5 * (150 - color);}player.img.body = player.img.shirt = player.img.pants = player.img.hair;},30);
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
    self.attackReload = 20;
    self.secondReload = 200;
    self.healReload = 400;
    self.attackTick = self.attackReload;
    self.secondTick = self.secondReload;
    self.healTick = self.healReload;
    self.ability = {
        attackAbility:'baseAttack',
        secondAbility:'baseSecond',
        healAbility:'baseHeal',
        attackPattern:[0],
        secondPattern:[0],
        healPattern:[0,20,40,60],
    }
    self.currentResponse = 0;
    self.inventory = new Inventory(socket,true);
    if(param.param.inventory !== undefined){
        for(var i in param.param.inventory){
            self.inventory.addItem(param.param.inventory[i].id,param.param.inventory[i].enchantments);
        }
    }
    if(param.param.currentEquip !== undefined){
        for(var i in param.param.currentEquip){
            self.inventory.currentEquip[i] = param.param.currentEquip[i];
        }
    }
    if(param.param.xp !== undefined){
        self.xp = param.param.xp;
    }
    if(param.param.level !== undefined){
        self.level = param.param.level;
        if(self.level < xpLevels.length){
            self.xpMax = xpLevels[self.level];
        }
    }
    if(param.param.questStats !== undefined){
        for(var i in param.param.questStats){
            if(self.questStats[i] !== undefined){
                self.questStats[i] = param.param.questStats[i];
            }
        }
    }
    if(param.param.img !== undefined){
        for(var i in param.param.img){
            if(self.img[i] !== undefined){
                self.img[i] = param.param.img[i];
            }
        }
    }
    if(param.param.ability !== undefined){
        for(var i in param.param.ability){
            self.ability[i] = param.param.ability[i];
        }
    }
    self.inventory.refreshRender();
    self.stats = {
        attack:1,
        defense:1,
        heal:1,
        xp:1,
        luck:1,
        range:1,
        speed:1,
    }
    self.permStats = {
        attack:1,
        defense:1,
        heal:1,
        xp:1,
        luck:1,
        range:1,
        speed:1,
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
            self.updateCollisions();
        }
        self.mouseX = self.rawMouseX + self.x;
        self.mouseY = self.rawMouseY + self.y;
        if(self.animation === -1){
            self.animation = 0;
        }
        else{
            self.animation += 0.5;
            if(self.animation > 5){
                self.animation = 0;
            }
        }
        self.attackTick += 1;
        self.secondTick += 1;
        self.healTick += 1;
        if(self.hp < 1){
            self.hp = 0;
            if(self.willBeDead){
                Player.spectate(socket);
                addToChat('style="color: #ff0000">',self.displayName + ' died.');
            }
        }
        else{
            if(self.hp > self.hpMax){
                self.hp = self.hpMax;
            }
            else{
                if(self.healTick % 10 === 0){
                    var heal = Math.round(self.stats.heal * (5 + Math.random() * 10));
                    heal = Math.min(self.hpMax - self.hp,heal);
                    self.hp += heal;
                    if(heal){
                        var particle = new Particle({
                            x:self.x + Math.random() * 64 - 32,
                            y:self.y + Math.random() * 64 - 32,
                            map:self.map,
                            particleType:'greenDamage',
                            value:'+' + heal,
                        });
                    }
                }
            }
        }
        if(!self.invincible && self.isDead === false){
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
            if(Npc.list[i].map === self.map && Npc.list[i].entityId === 'fisherman' && self.mapChange > 20 && Npc.list[i].x - 32 < self.mouseX && Npc.list[i].x + 32 > self.mouseX && Npc.list[i].y - 32 < self.mouseY && Npc.list[i].y + 32 > self.mouseY && self.keyPress.attack === true){
                if(self.quest === false && self.questInfo.quest === false && self.questStats["Weird Tower"] === false){
                    self.questStage = 1;
                    self.invincible = true;
                    self.questInfo.quest = 'Clear River';
                    socket.emit('dialougeLine',{
                        state:'ask',
                        message:'Go away. I\'m fishing.',
                        response1:'*End conversation*',
                    });
                }
                if(self.quest === false && self.questInfo.quest === false && self.questStats["Weird Tower"] === true){
                    self.questStage = 2;
                    self.invincible = true;
                    self.questInfo.quest = 'Clear River';
                    socket.emit('dialougeLine',{
                        state:'ask',
                        message:'You talked to John and defeated the monsters in that weird tower right?',
                        response1:'Yeah!',
                        response2:'No.',
                    });
                }
                if(self.questStage === 6 && self.quest === 'Clear River'){
                    self.questStage += 1;
                    self.invincible = true;
                    socket.emit('dialougeLine',{
                        state:'ask',
                        message:'Ok, go kill those Monsters!',
                        response1:'*End conversation*',
                    });
                }
                if(self.questStage === 11 && self.quest === 'Clear River'){
                    self.questStage += 1;
                    self.invincible = true;
                    socket.emit('dialougeLine',{
                        state:'ask',
                        message:'You did it? Thanks! Here is a reward.',
                        response1:'*End conversation*',
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
            addToChat('style="color: ' + self.textColor + '">',self.displayName + " completed the quest " + self.quest + ".");
            self.questStats[self.quest] = true;
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
                        width:monsterData['blueBall'].width,
                        height:monsterData['blueBall'].height,
                        xpGain:monsterData['blueBall'].xpGain * 10,
                        stats:{
                            attack:self.stats.attack * 0.5,
                            defense:self.stats.defense * 5,
                            heal:0,
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
                        monsterType:'blueCherryBomb',
                        attackState:'passiveCherryBomb',
                        width:monsterData['blueCherryBomb'].width,
                        height:monsterData['blueCherryBomb'].height,
                        xpGain:monsterData['blueCherryBomb'].xpGain * 10,
                        stats:{
                            attack:self.stats.attack * 2,
                            defense:self.stats.defense,
                            heal:self.stats.heal,
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
                        parent:self.id,
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
                SOCKET_LIST[i].emit('removeSameTiles',{
                    map:self.map,
                    tile_idx:3547,
                });
            }
            var newTiles = [];
            for(var i in tiles){
                if(tiles[i].parent !== self.id){
                    newTiles.push(tiles[i]);
                }
            }
            tiles = newTiles;
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
            addToChat('style="color: ' + self.textColor + '">',self.displayName + " completed the quest " + self.quest + ".");
            self.questStats[self.quest] = true;
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

        if(self.currentResponse === 1 && self.questStage === 1 && self.questInfo.quest === 'Clear River'){
            self.invincible = false;
            self.questInfo = {
                quest:false,
            };
            socket.emit('dialougeLine',{
                state:'remove',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 2 && self.questInfo.quest === 'Clear River'){
            self.questStage += 1;
            socket.emit('dialougeLine',{
                state:'ask',
                message:'Mark keeps complaining about Monsters attacking him while he is collecting wood. I don\'t have a weapon or anything, just a wooden fishing pole. And how do I fight monsters with that? Anyway, if you defeated the Monsters on that weird tower, you should be able to defeat all the Monsters in the map The River. Remember, Monsters will spawn natually.',
                response1:'Ok, I can defeat all the Monsters in the map The River.',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 2 && self.questStage === 2 && self.questInfo.quest === 'Clear River'){
            self.invincible = false;
            self.questInfo = {
                quest:false,
            };
            socket.emit('dialougeLine',{
                state:'remove',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 3 && self.questInfo.quest === 'Clear River'){
            self.questInfo.started = false;
            self.questStage += 1;
            self.invincible = false;
            socket.emit('dialougeLine',{
                state:'remove',
            });
            socket.emit('questInfo',{
                questName:'Clear River',
                questDescription:'Defeat all the Monsters in the map The River. This quest was suggested by Suvanth. You can suggest quests <a class="UI-link-light" href="https://github.com/maitian352/Meadow-Guarder/issues">here</a>.',
            });
            self.currentResponse = 0;
        }
        if(self.questInfo.started === true && self.questStage === 4 && self.questInfo.quest === 'Clear River'){
            self.quest = 'Clear River';
            self.questStage += 1;
            self.invincible = true;
            socket.emit('dialougeLine',{
                state:'ask',
                message:'I should talk with Fisherman.',
                response1:'...',
            });
        }
        if(self.currentResponse === 1 && self.questStage === 5 && self.quest === 'Clear River'){
            self.questStage += 1;
            self.invincible = false;
            socket.emit('dialougeLine',{
                state:'remove',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 7 && self.quest === 'Clear River'){
            self.questStage += 1;
            self.invincible = false;
            socket.emit('dialougeLine',{
                state:'remove',
            });
            self.currentResponse = 0;
        }
        if(self.questStage === 8 && self.quest === 'Clear River' && self.map === 'The River' && self.mapChange > 10){
            var monstersCleared = true;
            for(var i in Spawner.list){
                if(Spawner.list[i].spawned === true && Spawner.list[i].map === 'The River'){
                    monstersCleared = false;
                }
            }
            if(monstersCleared === true){
                self.questStage += 1;
            }
        }
        if(self.questStage === 9 && self.quest === 'Clear River'){
            self.questStage += 1;
            self.invincible = true;
            socket.emit('dialougeLine',{
                state:'ask',
                message:'I did it! I defeated all the Monsters in the map The River! Let me go tell Fisherman.',
                response1:'...',
            });
        }
        if(self.currentResponse === 1 && self.questStage === 10 && self.quest === 'Clear River'){
            self.questStage += 1;
            self.invincible = false;
            socket.emit('dialougeLine',{
                state:'remove',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 12 && self.questInfo.quest === 'Clear River'){
            addToChat('style="color: ' + self.textColor + '">',self.displayName + " completed the quest " + self.quest + ".");
            self.questStats[self.quest] = true;
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
            self.xp += Math.round(5000 * self.stats.xp);
        }
    }
    self.updateStats = function(){
        if(self.inventory.refresh){
            self.inventory.refresh = false;
            self.stats = Object.create(self.permStats);
            self.textColor = '#ffff00';
            self.hpMax = 1000;
            self.attackReload = 20;
            self.secondReload = 200;
            self.healReload = 400;
            self.ability = {
                attackAbility:'baseAttack',
                secondAbility:'baseSecond',
                healAbility:'baseHeal',
                attackPattern:[0],
                secondPattern:[0],
                healPattern:[0,20,40,60],
            }
            self.maxSpeed = 20;
            self.pushPower = 3;
            for(var i in self.inventory.currentEquip){
                if(self.inventory.currentEquip[i].id !== undefined){
                    try{
                        eval(Item.list[self.inventory.currentEquip[i].id].event);
                        for(var j in self.inventory.currentEquip[i].enchantments){
                            var enchantment = Enchantment.list[self.inventory.currentEquip[i].enchantments[j].id];
                            for(var k = 0;k < self.inventory.currentEquip[i].enchantments[j].level;k++){
                                eval(enchantment.event);
                            }
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
                        spawnMonster(Spawner.list[i],i);
                    }
                }
                addToChat('style="color: ' + self.textColor + '">',self.displayName + " went to map " + self.map + ".");
            }
            Player.getAllInitPack(socket);
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
        if(self.isDead){
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
        if(self.level > xpLevels.length - 1){
            self.xpMax = self.xp;
            return;
        }
        if(self.xp >= self.xpMax){
            self.xp = self.xp - self.xpMax;
            self.level += 1;
            self.xpMax = xpLevels[self.level];
            addToChat('style="color: #00ff00">',self.displayName + ' is now level ' + self.level + '.');
            if(Pet.list[self.pet]){
                Pet.list[self.pet].name = 'Kiol Lvl.' + self.level;
                Pet.list[self.pet].maxSpeed = 5 + self.level / 5;
            }
        }
    }
    self.updateAttack = function(){
        var isFireMap = false;
        for(var i in worldMap){
            if(worldMap[i].fileName.slice(0,-4) === self.map){
                isFireMap = true;
            }
        }
        if(self.map === 'The Village'){
            isFireMap = false;
        }
        if(ENV.PVP){
            isFireMap = true;
        }
        for(var i = 0;i < self.eventQ.length;i++){
            if(self.eventQ[i] !== undefined){
                if(self.eventQ[i].time === 0){
                    switch(self.eventQ[i].event){
                        case "baseHeal":
                            var heal = 100 * self.stats.heal;
                            heal = Math.min(self.hpMax - self.hp,heal);
                            self.hp += heal;
                            if(heal){
                                var particle = new Particle({
                                    x:self.x + Math.random() * 64 - 32,
                                    y:self.y + Math.random() * 64 - 32,
                                    map:self.map,
                                    particleType:'greenDamage',
                                    value:'+' + heal,
                                });
                            }
                            break;
                        case "earthHeal1":
                            var heal = 110 * self.stats.heal;
                            heal = Math.min(self.hpMax - self.hp,heal);
                            self.hp += heal;
                            if(heal){
                                var particle = new Particle({
                                    x:self.x + Math.random() * 64 - 32,
                                    y:self.y + Math.random() * 64 - 32,
                                    map:self.map,
                                    particleType:'greenDamage',
                                    value:'+' + heal,
                                });
                            }
                            break;
                        case "earthHeal2":
                            var heal = 120 * self.stats.heal;
                            heal = Math.min(self.hpMax - self.hp,heal);
                            self.hp += heal;
                            if(heal){
                                var particle = new Particle({
                                    x:self.x + Math.random() * 64 - 32,
                                    y:self.y + Math.random() * 64 - 32,
                                    map:self.map,
                                    particleType:'greenDamage',
                                    value:'+' + heal,
                                });
                            }
                            break;
                        case "earthHeal3":
                            var heal = 130 * self.stats.heal;
                            heal = Math.min(self.hpMax - self.hp,heal);
                            self.hp += heal;
                            if(heal){
                                var particle = new Particle({
                                    x:self.x + Math.random() * 64 - 32,
                                    y:self.y + Math.random() * 64 - 32,
                                    map:self.map,
                                    particleType:'greenDamage',
                                    value:'+' + heal,
                                });
                            }
                            break;
                        case "earthHeal4":
                            var heal = 135 * self.stats.heal;
                            heal = Math.min(self.hpMax - self.hp,heal);
                            self.hp += heal;
                            if(heal){
                                var particle = new Particle({
                                    x:self.x + Math.random() * 64 - 32,
                                    y:self.y + Math.random() * 64 - 32,
                                    map:self.map,
                                    particleType:'greenDamage',
                                    value:'+' + heal,
                                });
                            }
                            if(isFireMap){
                                for(var j = 0;j < 10;j++){
                                    self.shootProjectile(self.id,'Player',j * 36,j * 36,'playerBullet',0,self.stats);
                                }
                            }
                            break;
                        case "earthHeal5":
                            var heal = 140 * self.stats.heal;
                            heal = Math.min(self.hpMax - self.hp,heal);
                            self.hp += heal;
                            if(heal){
                                var particle = new Particle({
                                    x:self.x + Math.random() * 64 - 32,
                                    y:self.y + Math.random() * 64 - 32,
                                    map:self.map,
                                    particleType:'greenDamage',
                                    value:'+' + heal,
                                });
                            }
                            if(isFireMap){
                                for(var j = 0;j < 15;j++){
                                    self.shootProjectile(self.id,'Player',j * 24,j * 24,'playerBullet',0,self.stats);
                                }
                            }
                            break;
                        case "fireHeal1":
                            var heal = 75 * self.stats.heal;
                            heal = Math.min(self.hpMax - self.hp,heal);
                            self.hp += heal;
                            if(heal){
                                var particle = new Particle({
                                    x:self.x + Math.random() * 64 - 32,
                                    y:self.y + Math.random() * 64 - 32,
                                    map:self.map,
                                    particleType:'greenDamage',
                                    value:'+' + heal,
                                });
                            }
                            break;
                        case "fireHeal2":
                            var heal = 85 * self.stats.heal;
                            heal = Math.min(self.hpMax - self.hp,heal);
                            self.hp += heal;
                            if(heal){
                                var particle = new Particle({
                                    x:self.x + Math.random() * 64 - 32,
                                    y:self.y + Math.random() * 64 - 32,
                                    map:self.map,
                                    particleType:'greenDamage',
                                    value:'+' + heal,
                                });
                            }
                            break;
                        case "fireHeal3":
                            var heal = 95 * self.stats.heal;
                            heal = Math.min(self.hpMax - self.hp,heal);
                            self.hp += heal;
                            if(heal){
                                var particle = new Particle({
                                    x:self.x + Math.random() * 64 - 32,
                                    y:self.y + Math.random() * 64 - 32,
                                    map:self.map,
                                    particleType:'greenDamage',
                                    value:'+' + heal,
                                });
                            }
                            break;
                        case "fireHeal4":
                            var heal = 105 * self.stats.heal;
                            heal = Math.min(self.hpMax - self.hp,heal);
                            self.hp += heal;
                            if(heal){
                                var particle = new Particle({
                                    x:self.x + Math.random() * 64 - 32,
                                    y:self.y + Math.random() * 64 - 32,
                                    map:self.map,
                                    particleType:'greenDamage',
                                    value:'+' + heal,
                                });
                            }
                            break;
                        case "fireHeal5":
                            var heal = 110 * self.stats.heal;
                            heal = Math.min(self.hpMax - self.hp,heal);
                            self.hp += heal;
                            if(heal){
                                var particle = new Particle({
                                    x:self.x + Math.random() * 64 - 32,
                                    y:self.y + Math.random() * 64 - 32,
                                    map:self.map,
                                    particleType:'greenDamage',
                                    value:'+' + heal,
                                });
                            }
                            break;
                        case "fireHeal6":
                            var heal = 115 * self.stats.heal;
                            heal = Math.min(self.hpMax - self.hp,heal);
                            self.hp += heal;
                            if(heal){
                                var particle = new Particle({
                                    x:self.x + Math.random() * 64 - 32,
                                    y:self.y + Math.random() * 64 - 32,
                                    map:self.map,
                                    particleType:'greenDamage',
                                    value:'+' + heal,
                                });
                            }
                            break;
                        case "baseAttack":
                            if(isFireMap){
                                self.shootProjectile(self.id,'Player',self.direction,self.direction,'playerBullet',0,self.stats);
                            }
                            break;
                        case "earthAttack1":
                            if(isFireMap){
                                self.shootProjectile(self.id,'Player',self.direction - 5,self.direction - 5,'playerBullet',0,self.stats);
                                self.shootProjectile(self.id,'Player',self.direction + 5,self.direction + 5,'playerBullet',0,self.stats);
                            }
                            break;
                        case "earthAttack2":
                            if(isFireMap){
                                self.shootProjectile(self.id,'Player',self.direction - 5,self.direction - 5,'playerBullet',0,self.stats);
                                self.shootProjectile(self.id,'Player',self.direction,self.direction,'playerBullet',0,self.stats);
                                self.shootProjectile(self.id,'Player',self.direction + 5,self.direction + 5,'playerBullet',0,self.stats);
                            }
                            break;
                        case "earthAttack3":
                            if(isFireMap){
                                for(var j = -5;j < 6;j++){
                                    self.shootProjectile(self.id,'Player',self.direction + j * 5,self.direction + j * 5,'playerBullet',0,self.stats);
                                }
                            }
                            break;
                        case "earthAttack4":
                            if(isFireMap){
                                for(var j = -7;j < 8;j++){
                                    self.shootProjectile(self.id,'Player',self.direction + j * 5,self.direction + j * 5,'playerBullet',0,self.stats);
                                }
                            }
                            break;
                        case "fireAttack1":
                            if(isFireMap){
                                for(var j = -1;j < 2;j++){
                                    self.shootProjectile(self.id,'Player',self.direction + j * 5,self.direction + j * 5,'fireBullet',-20,self.stats);
                                }
                            }
                            break;
                        case "fireAttack2":
                            if(isFireMap){
                                for(var j = -2;j < 3;j++){
                                    self.shootProjectile(self.id,'Player',self.direction + j * 10,self.direction + j * 10,'fireBullet',-20,self.stats);
                                }
                                for(var j = -2;j < 3;j++){
                                    self.shootProjectile(self.id,'Player',self.direction + j * 10 + 180,self.direction + j * 10 + 180,'fireBullet',-20,self.stats);
                                }
                            }
                            break;
                        case "fireAttack3":
                            if(isFireMap){
                                var speed = self.stats.speed;
                                self.stats.speed = 0;
                                for(var j = 0;j < 20;j++){
                                    self.shootProjectile(self.id,'Player',j * 18,j * 18,'fireBullet',128,self.stats);
                                }
                                self.stats.speed = speed;
                                for(var j = -2;j < 3;j++){
                                    self.shootProjectile(self.id,'Player',self.direction + j * 10,self.direction + j * 10,'fireBullet',-20,self.stats);
                                }
                                for(var j = -2;j < 3;j++){
                                    self.shootProjectile(self.id,'Player',self.direction + j * 10 + 180,self.direction + j * 10 + 180,'fireBullet',-20,self.stats);
                                }
                            }
                            break;
                        case "fireAttack4":
                            if(isFireMap){
                                var speed = self.stats.speed;
                                self.stats.speed = 0;
                                for(var j = 0;j < 20;j++){
                                    self.shootProjectile(self.id,'Player',j * 18,j * 18,'fireBullet',128,self.stats);
                                }
                                self.stats.speed = speed;
                                for(var j = -2;j < 3;j++){
                                    self.shootProjectile(self.id,'Player',self.direction + j * 10,self.direction + j * 10,'fireBullet',-20,self.stats);
                                }
                                for(var j = -2;j < 3;j++){
                                    self.shootProjectile(self.id,'Player',self.direction + j * 10 + 120,self.direction + j * 10 + 120,'fireBullet',-20,self.stats);
                                }
                                for(var j = -2;j < 3;j++){
                                    self.shootProjectile(self.id,'Player',self.direction + j * 10 + 240,self.direction + j * 10 + 240,'fireBullet',-20,self.stats);
                                }
                            }
                            break;
                        case "fireAttack5":
                            if(isFireMap){
                                var speed = self.stats.speed;
                                self.stats.speed = 0;
                                for(var j = 0;j < 20;j++){
                                    self.shootProjectile(self.id,'Player',j * 18,j * 18,'fireBullet',128,self.stats);
                                }
                                for(var j = 0;j < 10;j++){
                                    self.shootProjectile(self.id,'Player',j * 36,j * 36,'fireBullet',64,self.stats);
                                }
                                self.stats.speed = speed;
                                for(var j = -2;j < 3;j++){
                                    self.shootProjectile(self.id,'Player',self.direction + j * 10,self.direction + j * 10,'fireBullet',-20,self.stats);
                                }
                                for(var j = -2;j < 3;j++){
                                    self.shootProjectile(self.id,'Player',self.direction + j * 10 + 120,self.direction + j * 10 + 120,'fireBullet',-20,self.stats);
                                }
                                for(var j = -2;j < 3;j++){
                                    self.shootProjectile(self.id,'Player',self.direction + j * 10 + 240,self.direction + j * 10 + 240,'fireBullet',-20,self.stats);
                                }
                            }
                            break;
                        case "fireAttack6":
                            if(isFireMap){
                                var speed = self.stats.speed;
                                self.stats.speed = 0;
                                for(var j = 0;j < 20;j++){
                                    self.shootProjectile(self.id,'Player',j * 18,j * 18,'fireBullet',128,self.stats);
                                }
                                for(var j = 0;j < 10;j++){
                                    self.shootProjectile(self.id,'Player',j * 36,j * 36,'fireBullet',64,self.stats);
                                }
                                self.stats.speed = speed;
                                for(var j = -2;j < 3;j++){
                                    self.shootProjectile(self.id,'Player',self.direction + j * 10,self.direction + j * 10,'fireBullet',-20,self.stats);
                                }
                                for(var j = -2;j < 3;j++){
                                    self.shootProjectile(self.id,'Player',self.direction + j * 10 + 90,self.direction + j * 10 + 90,'fireBullet',-20,self.stats);
                                }
                                for(var j = -2;j < 3;j++){
                                    self.shootProjectile(self.id,'Player',self.direction + j * 10 + 180,self.direction + j * 10 + 180,'fireBullet',-20,self.stats);
                                }
                                for(var j = -2;j < 3;j++){
                                    self.shootProjectile(self.id,'Player',self.direction + j * 10 + 270,self.direction + j * 10 + 270,'fireBullet',-20,self.stats);
                                }
                            }
                            break;
                        case "baseSecond":
                            if(isFireMap){
                                for(var j = 0;j < 10;j++){
                                    self.shootProjectile(self.id,'Player',j * 36,j * 36,'playerBullet',0,self.stats);
                                }
                            }
                            break;
                        case "earthSecond1":
                            if(isFireMap){
                                var tile = new Collision3({
                                    x:Math.floor(self.mouseX / 64) * 64 + 32,
                                    y:Math.floor(self.mouseY / 64) * 64 + 32,
                                    width:64,
                                    height:64,
                                    map:self.map,
                                });
                                var tile_idx = Math.round(56.5 + Math.random() * 3);
                                tile.tile_idx = tile_idx;
                                tiles.push({
                                    x:Math.floor(self.mouseX / 64) * 64,
                                    y:Math.floor(self.mouseY / 64) * 64,
                                    map:self.map,
                                    tile_idx:tile_idx,
                                    canvas:'lower',
                                    parent:self.id,
                                });
                                for(var j in SOCKET_LIST){
                                    SOCKET_LIST[j].emit('drawTile',{
                                        x:Math.floor(self.mouseX / 64) * 64,
                                        y:Math.floor(self.mouseY / 64) * 64,
                                        map:self.map,
                                        tile_idx:tile_idx,
                                        canvas:'lower',
                                    });
                                }
                                setTimeout(function(){
                                    var newTiles = [];
                                    for(var j in tiles){
                                        if(tiles[j].x === tile.x && tiles[j].y === tile.y && tiles[j].map === tile.map){
                                            
                                        }
                                        else{
                                            newTiles.push(tiles[j]);
                                        }
                                    }
                                    tiles = newTiles;
                                    for(var j in SOCKET_LIST){
                                        SOCKET_LIST[j].emit('removeTile',{
                                            x:tile.x - 32,
                                            y:tile.y - 32,
                                            map:tile.map,
                                            tile_idx:tile.tile_idx,
                                            canvas:'lower',
                                        });
                                    }
                                    delete Collision3.list[tile.id];
                                },5000);
                            }
                            break;
                        case "earthSecond2":
                            if(isFireMap){
                                var tile = new Collision3({
                                    x:Math.floor(self.mouseX / 64) * 64 + 32,
                                    y:Math.floor(self.mouseY / 64) * 64 + 32,
                                    width:64,
                                    height:64,
                                    map:self.map,
                                });
                                var tile_idx = Math.round(56.5 + Math.random() * 3);
                                tile.tile_idx = tile_idx;
                                tiles.push({
                                    x:Math.floor(self.mouseX / 64) * 64,
                                    y:Math.floor(self.mouseY / 64) * 64,
                                    map:self.map,
                                    tile_idx:tile_idx,
                                    canvas:'lower',
                                    parent:self.id,
                                });
                                for(var j in SOCKET_LIST){
                                    SOCKET_LIST[j].emit('drawTile',{
                                        x:Math.floor(self.mouseX / 64) * 64,
                                        y:Math.floor(self.mouseY / 64) * 64,
                                        map:self.map,
                                        tile_idx:tile_idx,
                                        canvas:'lower',
                                    });
                                }
                                setTimeout(function(){
                                    var newTiles = [];
                                    for(var j in tiles){
                                        if(tiles[j].x === tile.x && tiles[j].y === tile.y && tiles[j].map === tile.map){
                                            
                                        }
                                        else{
                                            newTiles.push(tiles[j]);
                                        }
                                    }
                                    tiles = newTiles;
                                    for(var j in SOCKET_LIST){
                                        SOCKET_LIST[j].emit('removeTile',{
                                            x:tile.x - 32,
                                            y:tile.y - 32,
                                            map:tile.map,
                                            tile_idx:tile.tile_idx,
                                            canvas:'lower',
                                        });
                                    }
                                    delete Collision3.list[tile.id];
                                },10000);
                            }
                            break;
                        case "earthSecond3":
                            if(isFireMap){
                                var tile = new Collision3({
                                    x:Math.floor(self.mouseX / 64) * 64 + 32,
                                    y:Math.floor(self.mouseY / 64) * 64 + 32,
                                    width:64,
                                    height:64,
                                    map:self.map,
                                });
                                var tile_idx = Math.round(56.5 + Math.random() * 3);
                                tile.tile_idx = tile_idx;
                                tiles.push({
                                    x:Math.floor(self.mouseX / 64) * 64,
                                    y:Math.floor(self.mouseY / 64) * 64,
                                    map:self.map,
                                    tile_idx:tile_idx,
                                    canvas:'lower',
                                    parent:self.id,
                                });
                                for(var j in SOCKET_LIST){
                                    SOCKET_LIST[j].emit('drawTile',{
                                        x:Math.floor(self.mouseX / 64) * 64,
                                        y:Math.floor(self.mouseY / 64) * 64,
                                        map:self.map,
                                        tile_idx:tile_idx,
                                        canvas:'lower',
                                    });
                                }
                                setTimeout(function(){
                                    var newTiles = [];
                                    for(var j in tiles){
                                        if(tiles[j].x === tile.x && tiles[j].y === tile.y && tiles[j].map === tile.map){
                                            
                                        }
                                        else{
                                            newTiles.push(tiles[j]);
                                        }
                                    }
                                    tiles = newTiles;
                                    for(var j in SOCKET_LIST){
                                        SOCKET_LIST[j].emit('removeTile',{
                                            x:tile.x - 32,
                                            y:tile.y - 32,
                                            map:tile.map,
                                            tile_idx:tile.tile_idx,
                                            canvas:'lower',
                                        });
                                    }
                                    delete Collision3.list[tile.id];
                                },20000);
                            }
                            break;
                        case "earthSecond4":
                            if(isFireMap){
                                var tile = new Collision3({
                                    x:Math.floor(self.mouseX / 64) * 64 + 32,
                                    y:Math.floor(self.mouseY / 64) * 64 + 32,
                                    width:64,
                                    height:64,
                                    map:self.map,
                                });
                                var tile_idx = Math.round(56.5 + Math.random() * 3);
                                tile.tile_idx = tile_idx;
                                tiles.push({
                                    x:Math.floor(self.mouseX / 64) * 64,
                                    y:Math.floor(self.mouseY / 64) * 64,
                                    map:self.map,
                                    tile_idx:tile_idx,
                                    canvas:'lower',
                                    parent:self.id,
                                });
                                for(var j in SOCKET_LIST){
                                    SOCKET_LIST[j].emit('drawTile',{
                                        x:Math.floor(self.mouseX / 64) * 64,
                                        y:Math.floor(self.mouseY / 64) * 64,
                                        map:self.map,
                                        tile_idx:tile_idx,
                                        canvas:'lower',
                                    });
                                }
                                setTimeout(function(){
                                    var newTiles = [];
                                    for(var j in tiles){
                                        if(tiles[j].x === tile.x && tiles[j].y === tile.y && tiles[j].map === tile.map){
                                            
                                        }
                                        else{
                                            newTiles.push(tiles[j]);
                                        }
                                    }
                                    tiles = newTiles;
                                    for(var j in SOCKET_LIST){
                                        SOCKET_LIST[j].emit('removeTile',{
                                            x:tile.x - 32,
                                            y:tile.y - 32,
                                            map:tile.map,
                                            tile_idx:tile.tile_idx,
                                            canvas:'lower',
                                        });
                                    }
                                    delete Collision3.list[tile.id];
                                },20000);
                                for(var j = 0;j < 10;j++){
                                    self.shootProjectile(self.id,'Player',j * 36,j * 36,'playerBullet',0,self.stats);
                                }
                            }
                            break;
                        case "fireSecond1":
                            if(isFireMap){
                                var speed = self.stats.speed;
                                self.stats.speed = 0;
                                for(var j = 0;j < 20;j++){
                                    self.shootProjectile(self.id,'Player',j * 18,j * 18,'fireBullet',128,self.stats);
                                }
                                self.stats.speed = speed;
                            }
                            break;
                        case "fireSecond2":
                            if(isFireMap){
                                var speed = self.stats.speed;
                                self.stats.speed = 0;
                                for(var j = 0;j < 20;j++){
                                    self.shootProjectile(self.id,'Player',j * 18,j * 18,'fireBullet',128,self.stats);
                                }
                                for(var j = 0;j < 10;j++){
                                    self.shootProjectile(self.id,'Player',j * 36,j * 36,'fireBullet',64,self.stats);
                                }
                                self.stats.speed = speed;
                            }
                            break;
                        case "fireSecond3":
                            if(isFireMap){
                                var speed = self.stats.speed;
                                self.stats.speed = 0;
                                for(var j = 0;j < 30;j++){
                                    self.shootProjectile(self.id,'Player',j * 12,j * 12,'fireBullet',192,self.stats);
                                }
                                for(var j = 0;j < 20;j++){
                                    self.shootProjectile(self.id,'Player',j * 18,j * 18,'fireBullet',128,self.stats);
                                }
                                for(var j = 0;j < 10;j++){
                                    self.shootProjectile(self.id,'Player',j * 36,j * 36,'fireBullet',64,self.stats);
                                }
                                self.stats.speed = speed;
                            }
                            break;
                        case "fireSecond4":
                            if(isFireMap){
                                var speed = self.stats.speed;
                                self.stats.speed = 0;
                                for(var j = 0;j < 30;j++){
                                    self.shootProjectile(self.id,'Player',j * 12,j * 12,'fireBullet',192,self.stats);
                                }
                                for(var j = 0;j < 20;j++){
                                    self.shootProjectile(self.id,'Player',j * 18,j * 18,'fireBullet',128,self.stats);
                                }
                                for(var j = 0;j < 10;j++){
                                    self.shootProjectile(self.id,'Player',j * 36,j * 36,'fireBullet',64,self.stats);
                                }
                                self.stats.speed = speed;
                                for(var j = 0;j < 10;j++){
                                    self.shootProjectile(self.id,'Player',j * 36,j * 36,'fireBullet',-20,self.stats);
                                }
                            }
                            break;
                        case "fireSecond5":
                            if(isFireMap){
                                var speed = self.stats.speed;
                                self.stats.speed = 0;
                                for(var j = 0;j < 30;j++){
                                    self.shootProjectile(self.id,'Player',j * 12,j * 12,'fireBullet',192,self.stats);
                                }
                                for(var j = 0;j < 20;j++){
                                    self.shootProjectile(self.id,'Player',j * 18,j * 18,'fireBullet',128,self.stats);
                                }
                                for(var j = 0;j < 10;j++){
                                    self.shootProjectile(self.id,'Player',j * 36,j * 36,'fireBullet',64,self.stats);
                                }
                                self.stats.speed = speed;
                                for(var j = 0;j < 20;j++){
                                    self.shootProjectile(self.id,'Player',j * 36,j * 36,'fireBullet',-20,self.stats);
                                }
                            }
                            break;
                        case "fireSecond6":
                            if(isFireMap){
                                var speed = self.stats.speed;
                                self.stats.speed = 0;
                                for(var j = 0;j < 40;j++){
                                    self.shootProjectile(self.id,'Player',j * 9,j * 9,'fireBullet',256,self.stats);
                                }
                                for(var j = 0;j < 30;j++){
                                    self.shootProjectile(self.id,'Player',j * 12,j * 12,'fireBullet',192,self.stats);
                                }
                                for(var j = 0;j < 20;j++){
                                    self.shootProjectile(self.id,'Player',j * 18,j * 18,'fireBullet',128,self.stats);
                                }
                                for(var j = 0;j < 10;j++){
                                    self.shootProjectile(self.id,'Player',j * 36,j * 36,'fireBullet',64,self.stats);
                                }
                                self.stats.speed = speed;
                                for(var j = 0;j < 20;j++){
                                    self.shootProjectile(self.id,'Player',j * 36,j * 36,'fireBullet',-20,self.stats);
                                }
                            }
                            break;
                    }
                    self.eventQ.splice(i,1);
                    i -= 1;
                }
                else{
                    self.eventQ[i].time -= 1;
                }
            }
        }
        if(self.keyPress.heal === true && self.healTick > self.healReload){
            self.healTick = 0;
            for(var i in self.ability.healPattern){
                self.addToEventQ(self.ability.healAbility,self.ability.healPattern[i]);
            }
        }
        if(isFireMap === false){
            return;
        }
        if(self.keyPress.attack === true && self.attackTick > self.attackReload){
            self.attackTick = 0;
            for(var i in self.ability.attackPattern){
                self.addToEventQ(self.ability.attackAbility,self.ability.attackPattern[i]);
            }
        }
        if(self.keyPress.second === true && self.secondTick > self.secondReload){
            self.secondTick = 0;
            for(var i in self.ability.secondPattern){
                self.addToEventQ(self.ability.secondAbility,self.ability.secondPattern[i]);
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
        if(lastSelf.displayName !== self.displayName){
            pack.displayName = self.displayName;
            lastSelf.displayName = self.displayName;
        }
        for(var i in self.img){
            if(lastSelf.img){
                if(lastSelf.img[i]){
                    if(Array.isArray(lastSelf.img[i])){
                        for(var j in lastSelf.img[i]){
                            if(self.img[i][j] !== lastSelf.img[i][j]){
                                pack.img = self.img;
                                lastSelf.img = Object.create(self.img);
                            }
                        }
                    }
                    else{
                        pack.img = self.img;
                        lastSelf.img = Object.create(self.img);
                    }
                }
                else{
                    pack.img = self.img;
                    lastSelf.img = Object.create(self.img);
                }
            }
            else{
                pack.img = self.img;
                lastSelf.img = Object.create(self.img);
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
        if(lastSelf.attackTick !== self.attackTick){
            pack.attackTick = self.attackTick;
            lastSelf.attackTick = self.attackTick;
        }
        if(lastSelf.secondTick !== self.secondTick){
            pack.secondTick = self.secondTick;
            lastSelf.secondTick = self.secondTick;
        }
        if(lastSelf.healTick !== self.healTick){
            pack.healTick = self.healTick;
            lastSelf.healTick = self.healTick;
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
                        lastSelf.stats = Object.create(self.stats);
                    }
                }
                else{
                    pack.stats = self.stats;
                    lastSelf.stats = Object.create(self.stats);
                }
            }
            else{
                pack.stats = self.stats;
                lastSelf.stats = Object.create(self.stats);
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
        pack.displayName = self.displayName;
        pack.img = self.img;
        pack.direction = self.direction;
        pack.animationDirection = self.animationDirection;
        pack.animation = self.animation;
        pack.attackTick = self.attackTick;
        pack.secondTick = self.secondTick;
        pack.healTick = self.healTick;
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
        var pet = Pet({
            parent:player.id,
            x:player.x,
            y:player.y,
            name:'Kiol Lvl.' + player.level,
            moveSpeed:5 + player.level / 5,
        });
        player.pet = pet.id;
        for(var i in SOCKET_LIST){
            SOCKET_LIST[i].emit('initEntity',player.getInitPack());
            SOCKET_LIST[i].emit('initEntity',pet.getInitPack());
        }
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
                player.rawMouseX = data.state.x;
                player.rawMouseY = data.state.y;
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
            if(data.inputId === 'imgBodyOpacity'){
                player.img.body[3] = parseInt(data.state,10) / 10;
            }
            if(data.inputId === 'imgShirtOpacity'){
                player.img.shirt[3] = parseInt(data.state,10) / 10;
            }
            if(data.inputId === 'imgPantsOpacity'){
                player.img.pants[3] = parseInt(data.state,10) / 10;
            }
            if(data.inputId === 'imgHairOpacity'){
                player.img.hair[3] = parseInt(data.state,10) / 10;
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
                else if(parseInt(data.state,10) === 6){
                    player.img.hairType = 'mohawkHair';
                }
            }
        });

        socket.on('diolougeResponse',function(data){
            player.currentResponse = data;
        });

        socket.on('respawn',function(data){
            if(player.isDead === false){
                addToChat('style="color: #ff0000">',player.displayName + ' cheated using respawn.');
                Player.onDisconnect(SOCKET_LIST[player.id]);
                return;
            }
            player.hp = Math.round(player.hpMax / 2);
            player.isDead = false;
            player.willBeDead = false;
            player.toRemove = false;
            player.dazed = 0;
            addToChat('style="color: #00ff00">',player.displayName + ' respawned.');
        });

        socket.on('startQuest',function(data){
            player.questInfo.started = true;
        });


        socket.on('init',function(data){
            Player.getAllInitPack(socket);
        });
        Player.getAllInitPack(socket);
        addToChat('style="color: #00ff00">',player.displayName + " just logged on.");
        for(var i in tiles){
            socket.emit('drawTile',tiles[i]);
        }
    });
}
Player.spectate = function(socket){
    if(ENV.Hardcore){
        setTimeout(function(){
            Player.onDisconnect(socket);
        },1);
        return;
    }
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
        Player.list[socket.id].isDead = true;
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
        var newTiles = [];
        for(var i in tiles){
            if(tiles[i].parent !== socket.id){
                newTiles.push(tiles[i]);
            }
        }
        tiles = newTiles;
        addToChat('style="color: #ff0000">',Player.list[socket.id].displayName + " logged off.");
        playerMap[Player.list[socket.id].map] -= 1;
        delete Player.list[socket.id];
    }
}
Player.getAllInitPack = function(socket){
    var player = Player.list[socket.id];
    var pack = {player:[],projectile:[],monster:[],npc:[],pet:[],particle:[]};
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
    for(var i in Pet.list){
        if(Pet.list[i].map === player.map){
            pack.pet.push(Pet.list[i].getInitPack());
        }
    }
    for(var i in Particle.list){
        if(Particle.list[i].map === player.map){
            pack.particle.push(Particle.list[i].getInitPack());
        }
    }
    socket.emit('update',pack);
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
                                lastSelf.img = Object.create(self.img);
                            }
                        }
                    }
                    else{
                        pack.img = self.img;
                        lastSelf.img = Object.create(self.img);
                    }
                }
                else{
                    pack.img = self.img;
                    lastSelf.img = Object.create(self.img);
                }
            }
            else{
                pack.img = self.img;
                lastSelf.img = Object.create(self.img);
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
    self.width = param.width;
    self.height = param.height;
    self.xpGain = param.xpGain;
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
        range:1,
        speed:1,
    }
    if(param.stats){
        for(var i in param.stats){
            self.stats[i] = param.stats[i];
        }
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
    self.animation = 0;
    self.animate = false;
    self.healReload = 0;
    self.canChangeMap = false;
    self.damaged = false;
    self.damagedEntity = false;
    self.onHit = function(pt){
        if(pt.parent){
            self.target = Player.list[pt.parent];
            self.damagedEntity = pt;
            self.damaged = true;
        }
        else if(pt.type === 'Player'){
            self.target = pt;
            self.damagedEntity = pt;
            self.damaged = true;
        }
    }
    self.randomWalk(true,false,self.x,self.y);
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
                var heal = Math.round(self.stats.heal * (10 + Math.random() * 15));
                heal = Math.min(self.hpMax - self.hp,heal);
                if(heal){
                    self.hp += heal;
                    var particle = new Particle({
                        x:self.x + Math.random() * 64 - 32,
                        y:self.y + Math.random() * 64 - 32,
                        map:self.map,
                        particleType:'greenDamage',
                        value:'+' + heal,
                    });
                }
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
                self.animate = true;
                for(var i in Player.list){
                    if(Player.list[i].map === self.map && self.getSquareDistance(Player.list[i]) < 512 && Player.list[i].isDead === false && Player.list[i].invincible === false && Player.list[i].mapChange > 10){
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
                self.animation = 0;
                self.attackState = "attackBird";
                break;
            case "attackBird":
                if(!self.target){
                    self.target = undefined;
                    self.attackState = 'passiveBird';
                    self.damagedEntity = false;
                    self.damaged = false;
                    break;
                }
                if(self.target.isDead){
                    self.target = undefined;
                    self.attackState = 'passiveBird';
                    self.damagedEntity = false;
                    self.damaged = false;
                    break;
                }
                if(self.target.toRemove){
                    self.target = undefined;
                    self.attackState = 'passiveBird';
                    self.damagedEntity = false;
                    self.damaged = false;
                    break;
                }
                if(self.reload % 20 === 0 && self.reload > 10 && self.target.invincible === false){
                    self.shootProjectile(self.id,'Monster',self.direction,self.direction,'ninjaStar',0,self.stats);
                }
                if(self.reload % 100 < 5 && self.reload > 10 && self.target.invincible === false){
                    self.shootProjectile(self.id,'Monster',self.direction,self.direction,'ninjaStar',0,self.stats);
                }
                self.reload += 1;
                if(self.hp < 0.5 * self.hpMax){
                    if(Spawner.list[self.spawnId]){
                        self.attackState = 'retreatBird';
                        self.maxSpeed *= 1.5;
                        self.damaged = false;
                    }
                    break;
                }
                if(self.getSquareDistance(self.target) > 512 || self.target.isDead){
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
                var bestSpawner = undefined;
                for(var i in Spawner.list){
                    if(Spawner.list[i].map === self.map){
                        if(bestSpawner === undefined){
                            if(Spawner.list[i].getSquareDistance(self.target) < 16 * 64){
                                bestSpawner = Spawner.list[i];
                            }
                        }
                        else if(Spawner.list[i].getSquareDistance(self.target) > bestSpawner.getSquareDistance(self.target) && Spawner.list[i].getSquareDistance(self.target) < 16 * 64){
                            bestSpawner = Spawner.list[i];
                        }
                    }
                }
                if(bestSpawner !== undefined){
                    if(self.trackingEntity.id !== bestSpawner.id){
                        self.trackEntity(bestSpawner);
                    }
                }
                if(self.hp > 0.8 * self.hpMax){
                    self.attackState = 'passiveBird';
                    self.maxSpeed = param.moveSpeed;
                    self.target = undefined;
                    self.trackingEntity = undefined;
                }
                break;
            case "passiveBall":
                for(var i in Player.list){
                    if(Player.list[i].map === self.map && self.getSquareDistance(Player.list[i]) < 512 && Player.list[i].isDead === false && Player.list[i].invincible === false && Player.list[i].mapChange > 10){
                        self.attackState = "moveBall";
                        self.target = Player.list[i];
                        self.damaged = false;
                    }
                }
                if(self.damaged){
                    self.attackState = "moveBall";
                }
                break;
            case "moveBall":
                self.trackEntity(self.target);
                self.reload = 0;
                self.animation = 0;
                self.attackState = "attackBall";
                break;
            case "attackBall":
                if(!self.target){
                    self.target = undefined;
                    self.attackState = 'passiveBall';
                    self.damagedEntity = false;
                    self.damaged = false;
                    break;
                }
                if(self.target.isDead){
                    self.target = undefined;
                    self.attackState = 'passiveBall';
                    self.damagedEntity = false;
                    self.damaged = false;
                    break;
                }
                if(self.target.toRemove){
                    self.target = undefined;
                    self.attackState = 'passiveBall';
                    self.damagedEntity = false;
                    self.damaged = false;
                    break;
                }
                if(self.reload % 60 < 16 && self.reload > 49 && self.target.invincible === false){
                    self.animation += 0.5;
                    if(self.animation >= 8){
                        self.animation = 0;
                    }
                    for(var i = 0;i < 4;i++){
                        self.shootProjectile(self.id,'Monster',self.animation * 45 + i * 90,self.animation * 45 + i * 90,'ballBullet',-20,self.stats);
                    }
                }
                self.reload += 1;
                if(self.getSquareDistance(self.target) > 512 || self.target.isDead){
                    if(!self.damaged){
                        self.target = undefined;
                        self.attackState = 'passiveBall';
                    }
                }
                break;
            case "passiveCherryBomb":
                for(var i in Player.list){
                    if(Player.list[i].map === self.map && self.getSquareDistance(Player.list[i]) < 512 && Player.list[i].isDead === false && Player.list[i].invincible === false && Player.list[i].mapChange > 10){
                        self.attackState = "moveCherryBomb";
                        self.target = Player.list[i];
                        self.damaged = false;
                    }
                }
                if(self.damaged){
                    self.attackState = "moveCherryBomb";
                }
                break;
            case "moveCherryBomb":
                self.trackEntity(self.target);
                self.reload = 0;
                self.animation = 0;
                self.attackState = "attackCherryBomb";
                break;
            case "attackCherryBomb":
                if(!self.target){
                    self.target = undefined;
                    self.attackState = 'passiveCherryBomb';
                    self.damagedEntity = false;
                    self.damaged = false;
                    break;
                }
                if(self.target.isDead){
                    self.target = undefined;
                    self.attackState = 'passiveCherryBomb';
                    self.damagedEntity = false;
                    self.damaged = false;
                    break;
                }
                if(self.target.toRemove){
                    self.target = undefined;
                    self.attackState = 'passiveCherryBomb';
                    self.damagedEntity = false;
                    self.damaged = false;
                    break;
                }
                self.reload += 1;
                if(self.getSquareDistance(self.target) < 64){
                    if(self.target.mapChange !== undefined){
                        if(self.target.mapChange > 10){
                            self.stats.defense *= 200;
                            self.stats.attack *= 200;
                            self.attackState = 'explodeCherryBomb';
                        }
                    }
                    else{
                        self.stats.defense *= 200;
                        self.stats.attack *= 200;
                        self.attackState = 'explodeCherryBomb';
                    }
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
                if(self.damaged && self.damagedEntity.type === 'Player'){
                    self.stats.defense *= 200;
                    self.stats.attack *= 200;
                    self.attackState = 'explodeCherryBomb';
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
                    param.onDeath(self);
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
	var self = Actor(param);
	self.id = Math.random();
    self.map = 'The Village';
    self.parent = param.parent;
    self.reload = 0;
	var super_update = self.update;
    self.type = 'Pet';
    self.name = param.name;
    self.width = 40;
    self.height = 28;
    self.canChangeMap = false;
    self.trackEntity(Player.list[self.parent]);
    var lastSelf = {};
	self.update = function(){
        super_update();
        if(self.map !== Player.list[self.parent].map){
            self.x = Player.list[self.parent].x;
            self.y = Player.list[self.parent].y;
            self.map = Player.list[self.parent].map;
            for(var i in Player.list){
                if(Player.list[i]){
                    SOCKET_LIST[i].emit('initEntity',self.getInitPack());
                }
            }
        }
        self.updateAttack();
    }
    self.updateAttack = function(){
        var isFireMap = false;
        for(var i in worldMap){
            if(worldMap[i].fileName.slice(0,-4) === self.map){
                isFireMap = true;
            }
        }
        if(self.map === 'The Village'){
            isFireMap = false;
        }
        if(ENV.PVP){
            isFireMap = true;
        }
        self.reload += 1;
        if(self.reload > 10 && isFireMap === true && Player.list[self.parent].isDead === false){
            self.reload = 0;
            var direction = (Math.atan2(Player.list[self.parent].mouseY - self.y,Player.list[self.parent].mouseX - self.x) / Math.PI * 180);
            for(var i = -5;i < 6;i++){
                self.shootProjectile(self.parent,'Player',direction + i * 5,direction + i * 5,'sword',0,Player.list[self.parent].stats);
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
        if(lastSelf.map !== self.map){
            pack.map = self.map;
            lastSelf.map = self.map;
        }
        if(lastSelf.name !== self.name){
            pack.name = self.name;
            lastSelf.name = self.name;
        }
        return pack;
	}
    self.getInitPack = function(){
        var pack = {};
        pack.id = self.id;
        pack.x = self.x;
        pack.y = self.y;
        pack.map = self.map;
        pack.name = self.name;
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
    if(param.stats.speed !== undefined){
        self.spdX = Math.cos(param.angle/180 * Math.PI) * 50 * param.stats.speed;
        self.spdY = Math.sin(param.angle/180 * Math.PI) * 50 * param.stats.speed;
    }
    else{
        self.spdX = Math.cos(param.angle/180 * Math.PI) * 50;
        self.spdY = Math.sin(param.angle/180 * Math.PI) * 50;
    }
    self.mapWidth = param.mapWidth;
    self.mapHeight = param.mapHeight;
	self.direction = param.direction;
	self.timer = 0;
    self.toRemove = false;
    self.isDead = false;
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
        if(param.stats.range !== undefined){
            if(self.timer > 20 * param.stats.range){
                self.toRemove = true;
            }
        }
        else{
            if(self.timer > 20){
                self.toRemove = true;
            }
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
        if(self.spdX === 0 && self.spdY === 0){
            return;
        }
        var firstTile = "" + self.map + ":" + Math.round((self.x - 64) / 64) * 64 + ":" + Math.round((self.y - 64) / 64) * 64 + ":";
        var secondTile = "" + self.map + ":" + Math.round((self.x - 64) / 64) * 64 + ":" + Math.round(self.y / 64) * 64 + ":";
        var thirdTile = "" + self.map + ":" + Math.round(self.x / 64) * 64 + ":" + Math.round((self.y - 64) / 64) * 64 + ":";
        var fourthTile = "" + self.map + ":" + Math.round(self.x / 64) * 64 + ":" + Math.round(self.y / 64) * 64 + ":";
        if(Collision.list[firstTile]){
            if(self.isColliding(Collision.list[firstTile])){
                self.toRemove = true;
                self.updateNextFrame = false;
            }
        }
        if(Collision.list[secondTile]){
            if(self.isColliding(Collision.list[secondTile])){
                self.toRemove = true;
                self.updateNextFrame = false;
            }
        }
        if(Collision.list[thirdTile]){
            if(self.isColliding(Collision.list[thirdTile])){
                self.toRemove = true;
                self.updateNextFrame = false;
            }
        }
        if(Collision.list[fourthTile]){
            if(self.isColliding(Collision.list[fourthTile])){
                self.toRemove = true;
                self.updateNextFrame = false;
            }
        }
        if(Collision2.list[firstTile]){
            if(self.isColliding(Collision2.list[firstTile])){
                self.toRemove = true;
                self.updateNextFrame = false;
            }
        }
        if(Collision2.list[secondTile]){
            if(self.isColliding(Collision2.list[secondTile])){
                self.toRemove = true;
                self.updateNextFrame = false;
            }
        }
        if(Collision2.list[thirdTile]){
            if(self.isColliding(Collision2.list[thirdTile])){
                self.toRemove = true;
                self.updateNextFrame = false;
            }
        }
        if(Collision2.list[fourthTile]){
            if(self.isColliding(Collision2.list[fourthTile])){
                self.toRemove = true;
                self.updateNextFrame = false;
            }
        }
        if(Collision3.list[firstTile]){
            if(self.isColliding(Collision3.list[firstTile])){
                self.toRemove = true;
                self.updateNextFrame = false;
            }
        }
        if(Collision3.list[secondTile]){
            if(self.isColliding(Collision3.list[secondTile])){
                self.toRemove = true;
                self.updateNextFrame = false;
            }
        }
        if(Collision3.list[thirdTile]){
            if(self.isColliding(Collision3.list[thirdTile])){
                self.toRemove = true;
                self.updateNextFrame = false;
            }
        }
        if(Collision3.list[fourthTile]){
            if(self.isColliding(Collision3.list[fourthTile])){
                self.toRemove = true;
                self.updateNextFrame = false;
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
load("Tiny House");
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
                if(Player.list[i].isColliding(Projectile.list[j]) && "" + Projectile.list[j].parent !== i && Player.list[i].isDead === false && Projectile.list[j].map === Player.list[i].map){
                    if(ENV.PVP){
                        Player.list[i].onCollision(Projectile.list[j],50);
                        Projectile.list[j].onCollision(Projectile.list[j],Player.list[i]);
                    }
                    else if(Projectile.list[j].parentType !== 'Player'){
                        Player.list[i].onCollision(Projectile.list[j],50);
                        Projectile.list[j].onCollision(Projectile.list[j],Player.list[i]);
                    }
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

