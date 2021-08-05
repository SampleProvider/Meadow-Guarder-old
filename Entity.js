var xpLevels = [
    500,
    1000,
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
    9000,
    10000,
    11000,
    12000,
    13000,
    14000,
    15000,
    16500,
    17500,
    18500,
    20000,
    22000,
    24000,
    26000,
    28000,
    30000,
    32500,
    35000,
    37500,
    40000,
    43000,
    47000,
    54000,
    62000,
    71000,
    89000,
    110000,
    163000,
    236000,
    380000,
    590000,
    870000,
    1420000,
    2840000,
    4940000,
    10000000,
];
var hpLevels = [
    500,
    551,
    605,
    673,
    737,
    796,
    851,
    924,
    1000,
    1107,
    1219,
    1326,
    1444,
    1562,
    1690,
    1828,
    2043,
    2235,
    2431,
    2644,
    2868,
    3117,
    3388,
    3662,
    3955,
    4250,
    4563,
    4899,
    5252,
    5591,
    5943,
    6366,
    6728,
    7184,
    7500,
    7842,
    8023,
    8155,
    8307,
    8411,
    8513,
    8604,
    8688,
    8729,
    8772,
    8811,
    8840,
    8865,
    8877,
    8883,
    8888,
];
var fs = require('fs');
var PF = require('pathfinding');


worldMap = [];
require('./env.js');

if(ENV.Difficulty === 'Expert'){
    ENV.MonsterStrength *= 2;
}

var firableMap = function(map){
    var isFireMap = false;
    for(var i in worldMap){
        if(worldMap[i].fileName.slice(0,-4) === map){
            isFireMap = true;
        }
    }
    if(map === 'The Village'){
        isFireMap = false;
    }
    if(map === 'Deserted Town'){
        isFireMap = false;
    }
    if(map === 'The Guarded Citadel'){
        isFireMap = false;
    }
    if(map === 'Town Cave'){
        isFireMap = true;
    }
    if(map === 'Mysterious Room'){
        isFireMap = true;
    }
    if(map.includes('Lilypad')){
        isFireMap = true;
    }
    if(map.includes('Arena')){
        isFireMap = true;
    }
    if(map === 'Lilypad Kingdom'){
        isFireMap = false;
    }
    if(map === 'Lilypad Castle'){
        isFireMap = false;
    }
    if(map === 'Lilypad Castle Basement'){
        isFireMap = false;
    }
    if(map === 'Lilypad Castle Upstairs'){
        isFireMap = false;
    }
    if(map === 'The Pet Arena'){
        isFireMap = false;
    }
    if(map === 'The Tutorial'){
        isFireMap = true;
    }
    if(map === 'The Battlefield'){
        isFireMap = true;
    }
    if(map === 'Garage'){
        isFireMap = true;
    }
    if(map === 'The Dripping Caverns'){
        isFireMap = true;
    }
    if(map === 'Secret Tunnel Part 1'){
        isFireMap = true;
    }
    if(ENV.PVP){
        isFireMap = true;
    }
    return isFireMap;
}

s = {
    findPlayer:function(param){
        for(var i in Player.list){
            if(Player.list[i].username === param){
                return Player.list[i];
            }
        }
    },
    spawnMonster:function(param,pt){
        if(firableMap(pt.map) === false){
            return;
        }
        var spawners = 0;
        for(var i in Spawner.list){
            if(Spawner.list[i].map === pt.map){
                spawners++;
            }
        }
        var spawnerNumber = Math.floor(Math.random() * spawners);
        var currentSpawner = 0;
        var spawner = undefined;
        for(var i in Spawner.list){
            if(Spawner.list[i].map === pt.map){
                if(currentSpawner === spawnerNumber){
                    spawner = Spawner.list[i];
                }
                currentSpawner += 1;
            }
        }
        for(var i in monsterData){
            if(i === param){
                var monsterHp = monsterData[i].hp;
                var monsterStats = Object.create(monsterData[i].stats);
                monsterHp *= ENV.MonsterStrength;
                monsterStats.attack *= ENV.MonsterStrength;
                var monster = new Monster({
                    spawnId:false,
                    x:spawner.x,
                    y:spawner.y,
                    map:pt.map,
                    moveSpeed:monsterData[i].moveSpeed,
                    stats:monsterStats,
                    hp:Math.round(monsterHp),
                    monsterType:i,
                    attackState:monsterData[i].attackState,
                    width:monsterData[i].width,
                    height:monsterData[i].height,
                    immuneDebuffs:monsterData[i].immuneDebuffs,
                    aggro:monsterData[i].aggro,
                    boss:monsterData[i].boss,
                    trackDistance:monsterData[i].trackDistance,
                    pushResist:monsterData[i].pushResist,
                    xpGain:monsterData[i].xpGain,
                    itemDrops:monsterData[i].itemDrops,
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
    createMonster:function(param,pt){
        for(var i in monsterData){
            if(i === param){
                var monsterHp = monsterData[i].hp;
                var monsterStats = Object.create(monsterData[i].stats);
                monsterHp *= ENV.MonsterStrength;
                monsterStats.attack *= ENV.MonsterStrength;
                var monster = new Monster({
                    spawnId:false,
                    x:pt.x,
                    y:pt.y,
                    map:pt.map,
                    moveSpeed:monsterData[i].moveSpeed,
                    stats:monsterStats,
                    hp:Math.round(monsterHp),
                    monsterType:i,
                    attackState:monsterData[i].attackState,
                    width:monsterData[i].width,
                    height:monsterData[i].height,
                    immuneDebuffs:monsterData[i].immuneDebuffs,
                    aggro:monsterData[i].aggro,
                    boss:monsterData[i].boss,
                    trackDistance:monsterData[i].trackDistance,
                    pushResist:monsterData[i].pushResist,
                    xpGain:monsterData[i].xpGain,
                    itemDrops:monsterData[i].itemDrops,
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
            id:Math.random(),
            x:pt.x + Math.random() * 2 - 1,
            y:pt.y + Math.random() * 2 - 1,
            name:param,
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
        s.createMonster('redCherryBomb',player);
    },
    smiteAll:function(){
        for(var i in Player.list){
            s.createMonster('redCherryBomb',Player.list[i].username);
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
    testDPS:function(){
        s.createMonster('sp',{x:1600,y:1600,map:'The Arena'});
    },
    tp:function(self,username){
        for(var i in Player.list){
            if(Player.list[i].username === username){
                self.teleport(Player.list[i].x,Player.list[i].y,Player.list[i].map)
            }
        }
    },
};

var monsterData = require('./monsters.json');
var worldData = require('./world.json');
var projectileData = require('./client/projectiles.json');
npcData = require('./npc.json');
var questData = require('./client/quest.json');

var spawnMonster = function(spawner,spawnId){
    if(ENV.Peaceful){
        return;
    }
    var monsterSeed = Math.random();
    var monsterTotal = 0;
    for(var i in worldData.maps[spawner.map]){
        monsterTotal += monsterData[worldData.maps[spawner.map][i]].spawnChance;
    }
    monsterSeed *= monsterTotal;
    for(var i in worldData.maps[spawner.map]){
        var currentMonster = monsterData[worldData.maps[spawner.map][i]];
        if(monsterSeed > 0 && monsterSeed < currentMonster.spawnChance){
            var monsterHp = currentMonster.hp;
            var monsterStats = Object.create(currentMonster.stats);
            monsterHp *= ENV.MonsterStrength;
            monsterStats.attack *= ENV.MonsterStrength;
            var xpGain = currentMonster.xpGain;
            var monster = new Monster({
                spawnId:spawnId,
                x:spawner.x,
                y:spawner.y,
                map:spawner.map,
                moveSpeed:currentMonster.moveSpeed,
                stats:monsterStats,
                hp:monsterHp,
                monsterType:worldData.maps[spawner.map][i],
                attackState:currentMonster.attackState,
                width:currentMonster.width,
                height:currentMonster.height,
                immuneDebuffs:currentMonster.immuneDebuffs,
                aggro:currentMonster.aggro,
                boss:currentMonster.boss,
                trackDistance:currentMonster.trackDistance,
                pushResist:currentMonster.pushResist,
                xpGain:xpGain,
                itemDrops:currentMonster.itemDrops,
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
        monsterSeed -= currentMonster.spawnChance;
    }
}

addToChat = function(style,message,debug){
    var d = new Date();
    var m = '' + d.getMinutes();
    var h = d.getHours() + 24;
    if(SERVER !== 'localhost'){
        h -= 4;
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
                    pack[Monster.list[i].map] = {player:[],projectile:[],monster:[],npc:[],pet:[],particle:[],droppedItem:[]};
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
                pack[Player.list[i].map] = {player:[],projectile:[],monster:[],npc:[],pet:[],particle:[],droppedItem:[]};
            }
            var updatePack = Player.list[i].getUpdatePack();
            pack[Player.list[i].map].player.push(updatePack);
        }
    }
    for(var i in Projectile.list){
        Projectile.list[i].update();
    }
    for(var i in Npc.list){
        if(Npc.list[i].type !== 'StaticNpc'){
            Npc.list[i].update();
            if(playerMap[Npc.list[i].map] > 0){
                if(!pack[Npc.list[i].map]){
                    pack[Npc.list[i].map] = {player:[],projectile:[],monster:[],npc:[],pet:[],particle:[],droppedItem:[]};
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
                    pack[Particle.list[i].map] = {player:[],projectile:[],monster:[],npc:[],pet:[],particle:[],droppedItem:[]};
                }
                var updatePack = Particle.list[i].getInitPack();
                pack[Particle.list[i].map].particle.push(updatePack);
            }
        }
        delete Particle.list[i];
    }
    for(var i in DroppedItem.list){
        if(!Player.list[DroppedItem.list[i].parent] && DroppedItem.list[i].allPlayers === false){
            delete DroppedItem.list[i];
        }
        else{
            DroppedItem.list[i].update();
            if(DroppedItem.list[i].toRemove === true){
                delete DroppedItem.list[i];
            }
            else if(playerMap[DroppedItem.list[i].map] > 0){
                if(!pack[DroppedItem.list[i].map]){
                    pack[DroppedItem.list[i].map] = {player:[],projectile:[],monster:[],npc:[],pet:[],particle:[],droppedItem:[]};
                }
                var updatePack = DroppedItem.list[i].getUpdatePack();
                pack[DroppedItem.list[i].map].droppedItem.push(updatePack);
            }
        }
    }
    for(var i in Pet.list){
        Pet.list[i].update();
        if(!pack[Pet.list[i].map]){
            pack[Pet.list[i].map] = {player:[],projectile:[],monster:[],npc:[],pet:[],particle:[],droppedItem:[]};
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
	updateCrashes();
    for(var i in Projectile.list){
        if(!pack[Projectile.list[i].map]){
            pack[Projectile.list[i].map] = {player:[],projectile:[],monster:[],npc:[],pet:[],particle:[],droppedItem:[]};
        }
        if(Projectile.list[i].updateNextFrame){
            pack[Projectile.list[i].map].projectile.push(Projectile.list[i].getUpdatePack());
        }
        if(Projectile.list[i].toRemove || playerMap[Projectile.list[i].map] === 0){
            delete Projectile.list[i];
        }
    }
    if(ENV.BossRush === true){
        var bossRushInProgress = false;
        for(var i in Monster.list){
            if(Monster.list[i].map === 'The Arena'){
                bossRushInProgress = true;
            }
        }
        var allPlayersDead = true;
        for(var i in Player.list){
            if(Player.list[i].hp > 0 && Player.list[i].map === 'The Arena'){
                allPlayersDead = false;
            }
        }
        if(allPlayersDead === true){
            ENV.BossRush = false;
            bossRushInProgress = true;
            addToChat('style="color: #ff0000">','Boss Rush has killed every player!');
            for(var i in Monster.list){
                if(Monster.list[i].map === 'The Arena'){
                   Monster.list[i].toRemove = true;
                }
            }
        }
        if(!bossRushInProgress){
            if(ENV.BossRushStage === 0){
                addToChat('style="color: #ff00ff">','The Boss Rush has begun!');
                addToChat('style="color: #00aadd">','Alright, let\'s get started. Not sure why you\'re bothering.');
                for(var i in monsterData){
                    if(i === 'greenLizard'){
                        var monsterHp = monsterData[i].hp;
                        var monsterStats = Object.create(monsterData[i].stats);
                        monsterHp *= ENV.MonsterStrength;
                        monsterStats.attack *= ENV.MonsterStrength;
                        monsterHp *= 50;
                        monsterStats.attack *= 10;
                        var monster = new Monster({
                            spawnId:false,
                            x:1600,
                            y:1600,
                            map:'The Arena',
                            moveSpeed:monsterData[i].moveSpeed,
                            stats:monsterStats,
                            hp:Math.round(monsterHp),
                            monsterType:i,
                            attackState:monsterData[i].attackState,
                            width:monsterData[i].width,
                            height:monsterData[i].height,
                            immuneDebuffs:monsterData[i].immuneDebuffs,
                            aggro:monsterData[i].aggro,
                            boss:monsterData[i].boss,
                            trackDistance:monsterData[i].trackDistance,
                            pushResist:monsterData[i].pushResist,
                            xpGain:monsterData[i].xpGain,
                            onDeath:function(pt){
                                pt.toRemove = true;
                                for(var i in Projectile.list){
                                    if(Projectile.list[i].parent === pt.id){
                                        Projectile.list[i].toRemove = true;
                                    }
                                }
                                ENV.BossRushStage += 1;
                            },
                        });
                        for(var i in Player.list){
                            if(Player.list[i].map === monster.map){
                                SOCKET_LIST[i].emit('initEntity',monster.getInitPack());
                            }
                        }
                    }
                }
            }
            else if(ENV.BossRushStage === 1){
                addToChat('style="color: #00aadd">','You seem so confident, even though you are painfully ignorant of what has yet to transpire.');
                for(var i in monsterData){
                    if(i === 'lostSpirit'){
                        var monsterHp = monsterData[i].hp;
                        var monsterStats = Object.create(monsterData[i].stats);
                        monsterHp *= ENV.MonsterStrength;
                        monsterStats.attack *= ENV.MonsterStrength;
                        monsterHp *= 150;
                        monsterStats.attack *= 10;
                        var monster = new Monster({
                            spawnId:false,
                            x:1600,
                            y:1600,
                            map:'The Arena',
                            moveSpeed:monsterData[i].moveSpeed,
                            stats:monsterStats,
                            hp:Math.round(monsterHp),
                            monsterType:i,
                            attackState:monsterData[i].attackState,
                            width:monsterData[i].width,
                            height:monsterData[i].height,
                            immuneDebuffs:monsterData[i].immuneDebuffs,
                            aggro:monsterData[i].aggro,
                            boss:monsterData[i].boss,
                            trackDistance:monsterData[i].trackDistance,
                            pushResist:monsterData[i].pushResist,
                            xpGain:monsterData[i].xpGain,
                            onDeath:function(pt){
                                pt.toRemove = true;
                                for(var i in Projectile.list){
                                    if(Projectile.list[i].parent === pt.id){
                                        Projectile.list[i].toRemove = true;
                                    }
                                }
                                ENV.BossRushStage += 1;
                            },
                        });
                        for(var i in Player.list){
                            if(Player.list[i].map === monster.map){
                                SOCKET_LIST[i].emit('initEntity',monster.getInitPack());
                            }
                        }
                    }
                }
            }
            else if(ENV.BossRushStage === 2){
                addToChat('style="color: #00aadd">','Impressive... but still not good enough!');
                for(var i in monsterData){
                    if(i === 'redBird'){
                        var monsterHp = monsterData[i].hp;
                        var monsterStats = Object.create(monsterData[i].stats);
                        monsterHp *= ENV.MonsterStrength;
                        monsterStats.attack *= ENV.MonsterStrength;
                        monsterHp *= 75;
                        monsterStats.attack *= 100;
                        var monster = new Monster({
                            spawnId:false,
                            x:1600,
                            y:1600,
                            map:'The Arena',
                            moveSpeed:monsterData[i].moveSpeed,
                            stats:monsterStats,
                            hp:Math.round(monsterHp),
                            monsterType:i,
                            attackState:monsterData[i].attackState,
                            width:monsterData[i].width,
                            height:monsterData[i].height,
                            immuneDebuffs:monsterData[i].immuneDebuffs,
                            aggro:monsterData[i].aggro,
                            boss:monsterData[i].boss,
                            trackDistance:monsterData[i].trackDistance,
                            pushResist:monsterData[i].pushResist,
                            xpGain:monsterData[i].xpGain,
                            onDeath:function(pt){
                                pt.toRemove = true;
                                for(var i in Projectile.list){
                                    if(Projectile.list[i].parent === pt.id){
                                        Projectile.list[i].toRemove = true;
                                    }
                                }
                                ENV.BossRushStage += 1;
                            },
                        });
                        for(var i in Player.list){
                            if(Player.list[i].map === monster.map){
                                SOCKET_LIST[i].emit('initEntity',monster.getInitPack());
                            }
                        }
                    }
                }
            }
            else if(ENV.BossRushStage === 3){
                addToChat('style="color: #00aadd">','How are you still alive!?');
                for(var i in monsterData){
                    if(i === 'lightningLizard'){
                        var monsterHp = monsterData[i].hp;
                        var monsterStats = Object.create(monsterData[i].stats);
                        monsterHp *= ENV.MonsterStrength;
                        monsterStats.attack *= ENV.MonsterStrength;
                        monsterHp *= 15;
                        monsterStats.attack *= 3;
                        var monster = new Monster({
                            spawnId:false,
                            x:1600,
                            y:1600,
                            map:'The Arena',
                            moveSpeed:monsterData[i].moveSpeed,
                            stats:monsterStats,
                            hp:Math.round(monsterHp),
                            monsterType:i,
                            attackState:monsterData[i].attackState,
                            width:monsterData[i].width,
                            height:monsterData[i].height,
                            immuneDebuffs:monsterData[i].immuneDebuffs,
                            aggro:monsterData[i].aggro,
                            boss:monsterData[i].boss,
                            trackDistance:monsterData[i].trackDistance,
                            pushResist:monsterData[i].pushResist,
                            xpGain:monsterData[i].xpGain,
                            onDeath:function(pt){
                                pt.toRemove = true;
                                for(var i in Projectile.list){
                                    if(Projectile.list[i].parent === pt.id){
                                        Projectile.list[i].toRemove = true;
                                    }
                                }
                                ENV.BossRushStage += 1;
                            },
                        });
                        for(var i in Player.list){
                            if(Player.list[i].map === monster.map){
                                SOCKET_LIST[i].emit('initEntity',monster.getInitPack());
                            }
                        }
                    }
                }
            }
            else if(ENV.BossRushStage === 4){
                addToChat('style="color: #00aadd">','I still have plenty of tricks up my sleeve...');
                for(var i in monsterData){
                    if(i === 'possessedSpirit'){
                        var monsterHp = monsterData[i].hp;
                        var monsterStats = Object.create(monsterData[i].stats);
                        monsterHp *= ENV.MonsterStrength;
                        monsterStats.attack *= ENV.MonsterStrength;
                        monsterHp *= 10;
                        monsterStats.attack *= 5;
                        var monster = new Monster({
                            spawnId:false,
                            x:1600,
                            y:1600,
                            map:'The Arena',
                            moveSpeed:monsterData[i].moveSpeed,
                            stats:monsterStats,
                            hp:Math.round(monsterHp),
                            monsterType:i,
                            attackState:monsterData[i].attackState,
                            width:monsterData[i].width,
                            height:monsterData[i].height,
                            immuneDebuffs:monsterData[i].immuneDebuffs,
                            aggro:monsterData[i].aggro,
                            boss:monsterData[i].boss,
                            trackDistance:monsterData[i].trackDistance,
                            pushResist:monsterData[i].pushResist,
                            xpGain:monsterData[i].xpGain,
                            onDeath:function(pt){
                                pt.toRemove = true;
                                for(var i in Projectile.list){
                                    if(Projectile.list[i].parent === pt.id){
                                        Projectile.list[i].toRemove = true;
                                    }
                                }
                                ENV.BossRushStage += 1;
                            },
                        });
                        for(var i in Player.list){
                            if(Player.list[i].map === monster.map){
                                SOCKET_LIST[i].emit('initEntity',monster.getInitPack());
                            }
                        }
                    }
                }
            }
            else if(ENV.BossRushStage === 5){
                addToChat('style="color: #00aadd">','Hmm... perhaps I should let the little ones out to play for a while.');
                for(var i in monsterData){
                    if(i === 'plantera'){
                        var monsterHp = monsterData[i].hp;
                        var monsterStats = Object.create(monsterData[i].stats);
                        monsterHp *= ENV.MonsterStrength;
                        monsterStats.attack *= ENV.MonsterStrength;
                        monsterHp *= 10;
                        monsterStats.attack *= 2;
                        var monster = new Monster({
                            spawnId:false,
                            x:1600,
                            y:1600,
                            map:'The Arena',
                            moveSpeed:monsterData[i].moveSpeed,
                            stats:monsterStats,
                            hp:Math.round(monsterHp),
                            monsterType:i,
                            attackState:monsterData[i].attackState,
                            width:monsterData[i].width,
                            height:monsterData[i].height,
                            immuneDebuffs:monsterData[i].immuneDebuffs,
                            aggro:monsterData[i].aggro,
                            boss:monsterData[i].boss,
                            trackDistance:monsterData[i].trackDistance,
                            pushResist:monsterData[i].pushResist,
                            xpGain:monsterData[i].xpGain,
                            onDeath:function(pt){
                                pt.toRemove = true;
                                for(var i in Projectile.list){
                                    if(Projectile.list[i].parent === pt.id){
                                        Projectile.list[i].toRemove = true;
                                    }
                                }
                                ENV.BossRushStage += 1;
                            },
                        });
                        for(var i in Player.list){
                            if(Player.list[i].map === monster.map){
                                SOCKET_LIST[i].emit('initEntity',monster.getInitPack());
                            }
                        }
                    }
                }
            }
            else if(ENV.BossRushStage === 6){
                addToChat('style="color: #00aadd">','Elemental Pairs, aid me!');
                for(var i in monsterData){
                    if(i === 'whirlwind'){
                        var monsterHp = monsterData[i].hp;
                        var monsterStats = Object.create(monsterData[i].stats);
                        monsterHp *= ENV.MonsterStrength;
                        monsterStats.attack *= ENV.MonsterStrength;
                        monsterHp *= 3;
                        var monster = new Monster({
                            spawnId:false,
                            x:1472,
                            y:1600,
                            map:'The Arena',
                            moveSpeed:monsterData[i].moveSpeed,
                            stats:monsterStats,
                            hp:Math.round(monsterHp),
                            monsterType:i,
                            attackState:monsterData[i].attackState,
                            width:monsterData[i].width,
                            height:monsterData[i].height,
                            immuneDebuffs:monsterData[i].immuneDebuffs,
                            aggro:monsterData[i].aggro,
                            boss:monsterData[i].boss,
                            trackDistance:monsterData[i].trackDistance,
                            pushResist:monsterData[i].pushResist,
                            xpGain:monsterData[i].xpGain,
                            onDeath:function(pt){
                                pt.toRemove = true;
                                for(var i in Projectile.list){
                                    if(Projectile.list[i].parent === pt.id){
                                        Projectile.list[i].toRemove = true;
                                    }
                                }
                                ENV.BossRushStage += 1;
                            },
                        });
                        for(var i in Player.list){
                            if(Player.list[i].map === monster.map){
                                SOCKET_LIST[i].emit('initEntity',monster.getInitPack());
                            }
                        }
                    }
                    if(i === 'fireSpirit'){
                        var monsterHp = monsterData[i].hp;
                        var monsterStats = Object.create(monsterData[i].stats);
                        monsterHp *= ENV.MonsterStrength;
                        monsterStats.attack *= ENV.MonsterStrength;
                        monsterHp *= 3;
                        var monster = new Monster({
                            spawnId:false,
                            x:1728,
                            y:1600,
                            map:'The Arena',
                            moveSpeed:monsterData[i].moveSpeed,
                            stats:monsterStats,
                            hp:Math.round(monsterHp),
                            monsterType:i,
                            attackState:monsterData[i].attackState,
                            width:monsterData[i].width,
                            height:monsterData[i].height,
                            immuneDebuffs:monsterData[i].immuneDebuffs,
                            aggro:monsterData[i].aggro,
                            boss:monsterData[i].boss,
                            trackDistance:monsterData[i].trackDistance,
                            pushResist:monsterData[i].pushResist,
                            xpGain:monsterData[i].xpGain,
                            onDeath:function(pt){
                                pt.toRemove = true;
                                for(var i in Projectile.list){
                                    if(Projectile.list[i].parent === pt.id){
                                        Projectile.list[i].toRemove = true;
                                    }
                                }
                                ENV.BossRushStage += 1;
                            },
                        });
                        for(var i in Player.list){
                            if(Player.list[i].map === monster.map){
                                SOCKET_LIST[i].emit('initEntity',monster.getInitPack());
                            }
                        }
                    }
                }
            }
            else if(ENV.BossRushStage === 8){
                var doSp = false;
                for(var i in Player.list){
                    if(Player.list[i].map === 'The Arena' && Player.list[i].questStats['sp'] === false){
                        doSp = true;
                    }
                }
                if(doSp){
                    addToChat('style="color: #ff0000">','You have no idea what you just did...');
                    for(var i in Player.list){
                        if(Player.list[i].map === 'The Arena'){
                            Player.list[i].xp += 5000 * Player.list[i].stats.xp;
                            Player.list[i].inventory.addItem('leaf',[]);
                            Player.list[i].inventory.addItem('purplefish',[]);
                            if(Math.random() < 0.1){
                                Player.list[i].inventory.addItem('halibutcannon',[]);
                            }
                            if(Math.random() < 0.1){
                                Player.list[i].inventory.addItem('bookofdeath',[]);
                            }
                            if(Math.random() < 0.1){
                                Player.list[i].inventory.addItem('holytrident',[]);
                            }
                        }
                    }
                    setTimeout(function(){
                        addToChat('style="color: #ff0000">','Impending Developer Approaches...');
                    },60000);
                    setTimeout(function(){
                        s.testDPS();
                    },70000);
                }
                else{
                    addToChat('style="color: #00aadd">','You expected a reward beyond this mere leaf? Patience, the true reward will come apparent in time...');
                    for(var i in Player.list){
                        if(Player.list[i].map === 'The Arena'){
                            Player.list[i].xp += 5000 * Player.list[i].stats.xp;
                            Player.list[i].inventory.addItem('leaf',[]);
                            Player.list[i].inventory.addItem('purplefish',[]);
                            if(Math.random() < 0.1){
                                Player.list[i].inventory.addItem('halibutcannon',[]);
                            }
                            if(Math.random() < 0.1){
                                Player.list[i].inventory.addItem('bookofdeath',[]);
                            }
                            if(Math.random() < 0.1){
                                Player.list[i].inventory.addItem('holytrident',[]);
                            }
                        }
                    }
                }
                ENV.BossRushStage = 0;
                ENV.BossRush = false;
            }
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
    self.trackDistance = 0;
    self.trackCircleDirection = 1;
    self.trackingEntityReached = false;
    self.trackTime = 100;
    self.canMove = true;
    self.canChangeMap = true;
    self.justCollided = false;
    self.transporter = {};
    self.invincible = false;
    self.mapWidth = Maps[self.map].width;
    self.mapHeight = Maps[self.map].height;
    self.type = 'Actor';
    self.animationDirection = 'up';
    self.animation = 0;
    self.mapChange = 100;
    self.canCollide = true;
    self.toRemove = false;
    self.isDead = false;
    self.willBeDead = false;
    self.pushPower = 1;
    self.pushResist = 0;
    self.dazed = 0;
    self.animate = true;
    self.stats = {
        attack:1,
        defense:1,
        heal:1,
        range:1,
        speed:1,
        critChance:0.04,
        damageReduction:0,
        knockback:1,
        debuffs:[],
    }
    self.startX = self.x;
    self.startY = self.y;
    self.oldStats = JSON.parse(JSON.stringify(self.stats));
    self.debuffs = [];
    self.immuneDebuffs = [];
    self.debuffTimer = 0;
    self.eventQ = [];
    var super_update = self.update;
    self.update = function(){
        self.startX = self.x;
        self.startY = self.y;
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
                self.justCollided = true;
            }
            if(self.x > self.mapWidth - self.width / 2){
                self.x = self.mapWidth - self.width / 2;
                self.justCollided = true;
            }
            if(self.y < self.height / 2){
                self.y = self.height / 2;
                self.justCollided = true;
            }
            if(self.y > self.mapHeight - self.height / 2){
                self.y = self.mapHeight - self.height / 2;
                self.justCollided = true;
            }
            self.updateCollisions();
        }
        self.doDebuffs();
        if(self.mapChange === 0){
            for(var i = 0;i < 25;i++){
                var particle = new Particle({
                    x:self.x + Math.random() * self.width - self.width / 2,
                    y:self.y + Math.random() * self.height - self.height / 2,
                    map:self.map,
                    particleType:'teleport',
                });
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
            for(var i = 0;i < 25;i++){
                var particle = new Particle({
                    x:self.x + Math.random() * self.width - self.width / 2,
                    y:self.y + Math.random() * self.height - self.height / 2,
                    map:self.map,
                    particleType:'teleport',
                });
            }
        }
        if(self.mapChange === 10){
            self.canMove = true;
            self.invincible = false;
        }
        if(self.pushPt){
            if(self.dazed < 1){
                //self.dazed = self.maxSpeed;
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
            else if(self.getDistance(self.trackingEntity) > self.trackDistance * 1.2){
                var size = 33;
                var dx = Math.floor(self.x / 64) - size / 2 + 0.5;
                var dy = Math.floor(self.y / 64) - size / 2 + 0.5;
                var trackX = Math.floor(self.trackingEntity.x / 64) - dx;
                var trackY = Math.floor(self.trackingEntity.y / 64) - dy;
                self.trackTime += 1;
                if(trackX !== self.trackingPos.x || trackY !== self.trackingPos.y || self.justCollided){
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
                                if(Collision.list[self.map][x / 64]){
                                    if(Collision.list[self.map][x / 64][y / 64]){
                                        grid.setWalkableAt(i,j,false);
                                    }
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
                    if(64 * Math.abs(self.x / 64 - self.trackingPath[0][0] - 0.5) < 2 && 64 * Math.abs(self.y / 64 - self.trackingPath[0][1] - 0.5) < 2){
                        self.trackingPath.shift();
                    }
                }
            }
            else{
                var angle = Math.atan2(self.y - self.trackingEntity.y,self.x - self.trackingEntity.x);
                self.spdX = -Math.sin(angle);
                self.spdY = Math.cos(angle);
                if(self.justCollided === true){
                    self.trackCircleDirection *= -1;
                }
                self.spdX *= self.trackCircleDirection;
                self.spdY *= self.trackCircleDirection;
                self.spdX += Math.cos(angle) * (self.trackDistance - self.getDistance(self.trackingEntity)) / self.trackDistance * 2;
                self.spdY += Math.sin(angle) * (self.trackDistance - self.getDistance(self.trackingEntity)) / self.trackDistance * 2;
                self.trackingEntityReached = true;
            }
        }
        else if(self.followingEntity){
            self.spdX = Math.cos(Math.atan2(self.followingEntity.y - self.y,self.followingEntity.x - self.x));
            self.spdY = Math.sin(Math.atan2(self.followingEntity.y - self.y,self.followingEntity.x - self.x));
        }
        if(self.randomPos.walking){
            if(self.randomPos.waypoint){
                if(self.randomPos.currentWaypoint){
                    if(self.trackingEntityReached){
                        self.randomPos.currentWaypoint = undefined;
                        self.trackingEntity = undefined;
                        self.randomPos.waypointAttemptTime = 0;
                        self.spdX = 0;
                        self.spdY = 0;
                    }
                    else if(self.randomPos.waypointAttemptTime > 1200){
                        self.randomPos.currentWaypoint = undefined;
                        self.trackingEntity = undefined;
                        self.randomPos.waypointAttemptTime = 0;
                        self.spdX = 0;
                        self.spdY = 0;
                    }
                    else if(self.randomPos.currentWaypoint.map !== self.map){
                        self.randomPos.currentWaypoint = undefined;
                        self.trackingEntity = undefined;
                        self.randomPos.waypointAttemptTime = 0;
                        self.spdX = 0;
                        self.spdY = 0;
                    }
                }
                else{
                    if(self.randomPos.waypointAttemptTime > 60 + Math.random() * 60){
                        var waypoints = [];
                        for(var i in WayPoint.list){
                            if(WayPoint.list[i].info.id === self.id && WayPoint.list[i].map === self.map && WayPoint.list[i].x > self.x - 14 * 64 && WayPoint.list[i].x < self.x + 14 * 64 && WayPoint.list[i].y > self.y - 14 * 64 && WayPoint.list[i].y < self.y + 14 * 64){
                                waypoints.push(WayPoint.list[i]);
                            }
                        }
                        self.randomPos.currentWaypoint = waypoints[Math.floor(Math.random() * waypoints.length)];
                        self.trackEntity(self.randomPos.currentWaypoint,0);
                    }
                }
                self.randomPos.waypointAttemptTime += 1;
            }
            else if(self.trackingEntity === undefined && self.followingEntity === undefined){
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
            if(pushPower !== 0){
                self.moveSpeed = pushPower * 5 * (1 - self.pushResist);
                self.spdX += self.pushPt.spdX / 6 * (1 - self.pushResist);
                self.spdY += self.pushPt.spdY / 6 * (1 - self.pushResist);
                if(self.x > self.pushPt.x){
                    self.spdX += 1 * (1 - self.pushResist);
                }
                else if(self.x < self.pushPt.x){
                    self.spdX += -1 * (1 - self.pushResist);
                }
                else{
                    self.spdX += 0;
                }
                if(self.y > self.pushPt.y){
                    self.spdY += 1 * (1 - self.pushResist);
                }
                else if(self.y < self.pushPt.y){
                    self.spdY += -1 * (1 - self.pushResist);
                }
                else{
                    self.spdY += 0;
                }
                if(self.pushResist === 1){
                    self.moveSpeed = self.maxSpeed;
                }
            }
            if(pushPower === 0){
                self.dazed = 0;
            }
        }
        self.justCollided = false;
    }
    self.updateAnimation = function(){
        if(!self.animate){
            return;
        }
        if(self.spdX >= 0.1){
            if(self.spdY >= 0.1){
                self.animationDirection = "rightdown";
            }
            else if(self.spdY <= -0.1){
                self.animationDirection = "rightup";
            }
            else{
                self.animationDirection = "right";
            }
        }
        else if(self.spdX <= -0.1){
            if(self.spdY >= 0.1){
                self.animationDirection = "leftdown";
            }
            else if(self.spdY <= -0.1){
                self.animationDirection = "leftup";
            }
            else{
                self.animationDirection = "left";
            }
        }
        else{
            if(self.spdY >= 0.1){
                self.animationDirection = "down";
            }
            else if(self.spdY <= -0.1){
                self.animationDirection = "up";
            }
            else{
                self.animation = -1;
            }
        }
    }
    self.move = function(x,y){
        self.moveArray.push({x:x,y:y});
    }
    self.onPush = function(pt,pushPower){
        self.onCollision(pt,pushPower);
        if(self.dazed < 1){
            self.pushPt = pt;
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
        if(self.mapChange > 10){
            self.invincible = true;
            self.mapChange = -1;
            self.transporter = {
                teleport:map,
                teleportx:x,
                teleporty:y,
                mapx:Maps[map].width,
                mapy:Maps[map].height,
            };
        }
    }
    self.trackEntity = function(pt,distance){
        self.trackingEntity = pt;
        self.trackingPath = [];
        self.trackDistance = distance;
        self.trackingPos = {x:undefined,y:undefined};
        self.trackCircleDirection = 1;
        self.trackingEntityReached = false;
    }
    self.followEntity = function(pt){
        self.followingEntity = pt;
    }
    self.dropItems = function(pt){
        if(pt.parentType === 'Player' && self.type === 'Monster'){
            for(var i in self.itemDrops){
                if(i === 'enchantmentbook'){
                    for(var enchantmentBook = 0;enchantmentBook < self.itemDrops[i];enchantmentBook++){
                        var enchantments = [];
                        for(var j in Item.list[i].enchantments){
                            for(var k in Enchantment.list){
                                if(k === Item.list[i].enchantments[j]){
                                    var enchantment = Enchantment.list[k];
                                    if(Math.random() < enchantment.dropChance * Player.list[pt.parent].stats.luck){
                                        enchantments.push({id:k,level:Math.min(Math.max(0.001,Math.round(enchantment.averageLevel * 1000 + (Math.random() * 2 - 1) * enchantment.deviation * 1000) / 1000),enchantment.maxLevel)});
                                    }
                                }
                            }
                        }
                        new DroppedItem({
                            id:pt.parent,
                            item:{id:i,enchantments:enchantments},
                            amount:1,
                            x:self.x,
                            y:self.y,
                            map:self.map,
                            leftPlayer:true,
                            allPlayers:false,
                        });
                    }
                }
                else if(self.itemDrops[i] * Player.list[pt.parent].stats.luck > Math.random()){
                    if(Item.list[i].maxStack !== 1){
                        var amount = Math.max(Math.round(self.itemDrops[i] * Player.list[pt.parent].stats.luck * (1 + Math.random())),1);
                    }
                    else{
                        var amount = 1;
                    }
                    var enchantments = [];
                    for(var j in Item.list[i].enchantments){
                        for(var k in Enchantment.list){
                            if(k === Item.list[i].enchantments[j]){
                                var enchantment = Enchantment.list[k];
                                if(Math.random() < enchantment.dropChance * Player.list[pt.parent].stats.luck){
                                    enchantments.push({id:k,level:Math.min(Math.max(0.001,Math.round(enchantment.averageLevel * 1000 + (Math.random() * 2 - 1) * enchantment.deviation * 1000) / 1000),enchantment.maxLevel)});
                                }
                            }
                        }
                    }
                    new DroppedItem({
                        id:pt.parent,
                        item:{id:i,enchantments:enchantments},
                        amount:amount,
                        x:self.x,
                        y:self.y,
                        map:self.map,
                        leftPlayer:true,
                        allPlayers:false,
                    });
                }
            }
            Player.list[pt.parent].xp += self.xpGain * Math.round((5 + Math.random() * 2) * Player.list[pt.parent].stats.xp);
            Player.list[pt.parent].coins += self.xpGain * Math.round((300 + Math.random() * 150) * Player.list[pt.parent].stats.xp);
        }
        if(pt.type === 'Player' && self.type === 'Monster'){
            for(var i in self.itemDrops){
                if(i === 'enchantmentbook'){
                    for(var enchantmentBook = 0;enchantmentBook < self.itemDrops[i];enchantmentBook++){
                        var enchantments = [];
                        for(var j in Item.list[i].enchantments){
                            for(var k in Enchantment.list){
                                if(k === Item.list[i].enchantments[j]){
                                    var enchantment = Enchantment.list[k];
                                    if(Math.random() < enchantment.dropChance * pt.stats.luck){
                                        enchantments.push({id:k,level:Math.min(Math.max(0.001,Math.round(enchantment.averageLevel * 1000 + (Math.random() * 2 - 1) * enchantment.deviation * 1000) / 1000),enchantment.maxLevel)});
                                    }
                                }
                            }
                        }
                        new DroppedItem({
                            id:pt.id,
                            item:{id:i,enchantments:enchantments},
                            amount:1,
                            x:self.x,
                            y:self.y,
                            map:self.map,
                            leftPlayer:true,
                            allPlayers:false,
                        });
                    }
                }
                else if(self.itemDrops[i] * pt.stats.luck > Math.random()){
                    if(Item.list[i].maxStack !== 1){
                        var amount = Math.max(Math.round(self.itemDrops[i] * pt.stats.luck * (1 + Math.random())),1);
                    }
                    else{
                        var amount = 1;
                    }
                    var enchantments = [];
                    for(var j in Item.list[i].enchantments){
                        for(var k in Enchantment.list){
                            if(k === Item.list[i].enchantments[j]){
                                var enchantment = Enchantment.list[k];
                                if(Math.random() < enchantment.dropChance * pt.stats.luck){
                                    enchantments.push({id:k,level:Math.min(Math.max(0.001,Math.round(enchantment.averageLevel * 1000 + (Math.random() * 2 - 1) * enchantment.deviation * 1000) / 1000),enchantment.maxLevel)});
                                }
                            }
                        }
                    }
                    new DroppedItem({
                        id:pt.id,
                        item:{id:i,enchantments:enchantments},
                        amount:amount,
                        x:self.x,
                        y:self.y,
                        map:self.map,
                        leftPlayer:true,
                        allPlayers:false,
                    });
                }
            }
            pt.xp += Math.round(self.xpGain * (5 + Math.random() * 2) * pt.stats.xp);
            pt.coins += Math.round(self.xpGain * (300 + Math.random() * 150) * pt.stats.xp);
        }
    }
    self.doDebuffs = function(){
        var hp = self.hp;
        if(self.invincible || self.type === 'Pet'){
            return;
        }
        self.debuffTimer += 1;
        //self.oldStats = JSON.parse(JSON.stringify(self.stats));
        var stats = JSON.parse(JSON.stringify(self.oldStats));
        var maxSpeed = self.oldMaxSpeed;
        var hpMax = self.oldHpMax;
        var manaRegen = self.oldManaRegen;
        var manaMax = self.oldManaMax;
        var debuffRemoveList = [];
        for(var i = self.debuffs.length - 1;i >= 0;i--){
            var debuffImmune = false;
            for(var j in self.immuneDebuffs){
                if(self.immuneDebuffs[j] === self.debuffs[i].id){
                    debuffRemoveList.push(i);
                    debuffImmune = true;
                }
            }
            if(debuffImmune === false){
                if(self.debuffs[i].id === 'burning' && self.debuffTimer % 2 === 0){
                    var damage = 1;
                    var particleType = 'redDamage';
                    self.hp -= damage;
                    if(damage){
                        var particle = new Particle({
                            x:self.x + Math.random() * 64 - 32,
                            y:self.y + Math.random() * 64 - 32,
                            map:self.map,
                            particleType:particleType,
                            value:'-' + Math.round(damage),
                        });
                        var particle = new Particle({
                            x:self.x + Math.random() * self.width - self.width / 2,
                            y:self.y + Math.random() * self.height - self.height / 2,
                            map:self.map,
                            particleType:'fire',
                        });
                    }
                }
                if(self.debuffs[i].id === 'electrified'){
                    var damage = 5;
                    var particleType = 'redDamage';
                    self.hp -= damage;
                    if(damage){
                        var particle = new Particle({
                            x:self.x + Math.random() * 64 - 32,
                            y:self.y + Math.random() * 64 - 32,
                            map:self.map,
                            particleType:particleType,
                            value:'-' + Math.round(damage),
                        });
                        var particle = new Particle({
                            x:self.x + Math.random() * self.width - self.width / 2,
                            y:self.y + Math.random() * self.height - self.height / 2,
                            map:self.map,
                            particleType:'electricity',
                        });
                    }
                    if(self.type === 'Player'){
                        stats.defense -= 40;
                    }
                }
                if(self.debuffs[i].id === 'death'){
                    var damage = 25;
                    var particleType = 'redDamage';
                    self.hp -= damage;
                    if(damage){
                        var particle = new Particle({
                            x:self.x + Math.random() * 64 - 32,
                            y:self.y + Math.random() * 64 - 32,
                            map:self.map,
                            particleType:particleType,
                            value:'-' + Math.round(damage),
                        });
                        var particle = new Particle({
                            x:self.x + Math.random() * self.width - self.width / 2,
                            y:self.y + Math.random() * self.height - self.height / 2,
                            map:self.map,
                            particleType:'death',
                        });
                    }
                }
                if(self.debuffs[i].id === 'frostburn' && self.debuffTimer % 2 === 0){
                    var damage = 2;
                    var particleType = 'redDamage';
                    self.hp -= damage;
                    if(damage){
                        var particle = new Particle({
                            x:self.x + Math.random() * 64 - 32,
                            y:self.y + Math.random() * 64 - 32,
                            map:self.map,
                            particleType:particleType,
                            value:'-' + Math.round(damage),
                        });
                        var particle = new Particle({
                            x:self.x + Math.random() * self.width - self.width / 2,
                            y:self.y + Math.random() * self.height - self.height / 2,
                            map:self.map,
                            particleType:'frost',
                        });
                    }
                }
                if(self.debuffs[i].id === 'frostbite' && self.debuffTimer % 2 === 0){
                    var damage = 20;
                    var particleType = 'redDamage';
                    self.hp -= damage;
                    if(damage){
                        var particle = new Particle({
                            x:self.x + Math.random() * 64 - 32,
                            y:self.y + Math.random() * 64 - 32,
                            map:self.map,
                            particleType:particleType,
                            value:'-' + Math.round(damage),
                        });
                        var particle = new Particle({
                            x:self.x + Math.random() * self.width - self.width / 2,
                            y:self.y + Math.random() * self.height - self.height / 2,
                            map:self.map,
                            particleType:'frost',
                        });
                    }
                    if(self.type === 'Player'){
                        stats.heal -= 0.8;
                    }
                }
                if(self.debuffs[i].id === 'frozen'){
                    self.spdX = 0;
                    self.spdY = 0;
                    self.x = self.startX;
                    self.y = self.startY;
                    var damage = 40;
                    var particleType = 'redDamage';
                    self.hp -= damage;
                    if(damage){
                        var particle = new Particle({
                            x:self.x + Math.random() * 64 - 32,
                            y:self.y + Math.random() * 64 - 32,
                            map:self.map,
                            particleType:particleType,
                            value:'-' + Math.round(damage),
                        });
                        var particle = new Particle({
                            x:self.x + Math.random() * self.width - self.width / 2,
                            y:self.y + Math.random() * self.height - self.height / 2,
                            map:self.map,
                            particleType:'frost',
                        });
                    }
                    stats.defense = 0;
                }
                if(self.debuffs[i].id === 'shocked'){
                    self.spdX = 0;
                    self.spdY = 0;
                    self.x = self.startX;
                    self.y = self.startY;
                    var damage = 25;
                    var particleType = 'redDamage';
                    self.hp -= damage;
                    if(damage){
                        var particle = new Particle({
                            x:self.x + Math.random() * 64 - 32,
                            y:self.y + Math.random() * 64 - 32,
                            map:self.map,
                            particleType:particleType,
                            value:'-' + Math.round(damage),
                        });
                        var particle = new Particle({
                            x:self.x + Math.random() * self.width - self.width / 2,
                            y:self.y + Math.random() * self.height - self.height / 2,
                            map:self.map,
                            particleType:'electricity',
                        });
                    }
                    stats.defense -= 150;
                }
                if(self.debuffs[i].id === 'wet'){
                    var particle = new Particle({
                        x:self.x + Math.random() * self.width - self.width / 2,
                        y:self.y + Math.random() * self.height - self.height / 2,
                        map:self.map,
                        particleType:'water',
                    });
                    maxSpeed *= 0.25;
                }
                if(self.debuffs[i].id === 'thundered'){
                    var damage = 2500;
                    var particleType = 'redDamage';
                    self.hp -= damage;
                    if(damage){
                        var particle = new Particle({
                            x:self.x + Math.random() * 64 - 32,
                            y:self.y + Math.random() * 64 - 32,
                            map:self.map,
                            particleType:particleType,
                            value:'-' + Math.round(damage),
                        });
                        var particle = new Particle({
                            x:self.x + Math.random() * self.width - self.width / 2,
                            y:self.y + Math.random() * self.height - self.height / 2,
                            map:self.map,
                            particleType:'electricity',
                        });
                    }
                    stats.defense -= 1500;
                }
                if(self.debuffs[i].id === 'incinerating' && self.debuffTimer % 2 === 0){
                    var damage = 15;
                    var particleType = 'redDamage';
                    self.hp -= damage;
                    if(damage){
                        var particle = new Particle({
                            x:self.x + Math.random() * 64 - 32,
                            y:self.y + Math.random() * 64 - 32,
                            map:self.map,
                            particleType:particleType,
                            value:'-' + Math.round(damage),
                        });
                        var particle = new Particle({
                            x:self.x + Math.random() * self.width - self.width / 2,
                            y:self.y + Math.random() * self.height - self.height / 2,
                            map:self.map,
                            particleType:'fire',
                        });
                    }
                }
                if(self.debuffs[i].id === 'apple'){
                    if(self.debuffTimer % 2 === 0){
                        var damage = 1;
                        var particleType = 'greenDamage';
                        self.hp += damage;
                        if(damage){
                            var particle = new Particle({
                                x:self.x + Math.random() * 64 - 32,
                                y:self.y + Math.random() * 64 - 32,
                                map:self.map,
                                particleType:particleType,
                                value:'+' + Math.round(damage),
                            });
                        }
                    }
                    stats.attack += 5;
                    stats.defense += 5;
                }
                if(self.debuffs[i].id === 'milk'){
                    var damage = 2;
                    var particleType = 'greenDamage';
                    self.hp += damage;
                    if(damage){
                        var particle = new Particle({
                            x:self.x + Math.random() * 64 - 32,
                            y:self.y + Math.random() * 64 - 32,
                            map:self.map,
                            particleType:particleType,
                            value:'+' + Math.round(damage),
                        });
                    }
                    stats.attack += 15;
                    stats.defense += 25;
                }
                if(self.debuffs[i].id === 'chocolatechipcookie'){
                    var damage = 5;
                    var particleType = 'greenDamage';
                    self.hp += damage;
                    if(damage){
                        var particle = new Particle({
                            x:self.x + Math.random() * 64 - 32,
                            y:self.y + Math.random() * 64 - 32,
                            map:self.map,
                            particleType:particleType,
                            value:'+' + Math.round(damage),
                        });
                    }
                    stats.attack += 35;
                    stats.defense += 25;
                }
                if(self.debuffs[i].id === 'lesserhealthboost'){
                    hpMax *= 1.1;
                }
                if(self.debuffs[i].id === 'lesserdefenseboost'){
                    stats.defense += 15;
                }
                if(self.debuffs[i].id === 'lesserspeedboost'){
                    maxSpeed *= 1.1;
                }
                if(self.debuffs[i].id === 'lessermanaboost'){
                    manaMax += 50;
                    manaRegen += 0.5;
                }
                if(self.debuffs[i].id === 'lesserregenboost'){
                    stats.heal += 0.5;
                }
                if(self.debuffs[i].id === 'lesserrandomboost1'){
                    hpMax *= 1.05;
                    stats.defense += 10;
                    stats.heal += 0.3;
                }
                if(self.debuffs[i].id === 'lesserrandomboost2'){
                    maxSpeed *= 1.05;
                    manaMax += 25;
                    manaRegen += 0.3;
                }
                if(self.debuffs[i].id === 'healthboost'){
                    hpMax *= 1.35;
                }
                if(self.debuffs[i].id === 'defenseboost'){
                    stats.defense += 40;
                }
                if(self.debuffs[i].id === 'speedboost'){
                    maxSpeed *= 1.35;
                }
                if(self.debuffs[i].id === 'manaboost'){
                    manaMax += 120;
                    manaRegen += 1;
                }
                if(self.debuffs[i].id === 'regenboost'){
                    stats.heal += 1;
                }
                if(self.debuffs[i].id === 'randomboost1'){
                    hpMax *= 1.15;
                    stats.defense += 30;
                    stats.heal += 0.5;
                }
                if(self.debuffs[i].id === 'randomboost2'){
                    maxSpeed *= 1.15;
                    manaMax += 60;
                    manaRegen += 0.5;
                }
                if(self.debuffs[i].id === 'greaterhealthboost'){
                    hpMax *= 1.5;
                }
                if(self.debuffs[i].id === 'greaterdefenseboost'){
                    stats.defense += 65;
                }
                if(self.debuffs[i].id === 'greaterspeedboost'){
                    maxSpeed *= 1.5;
                }
                if(self.debuffs[i].id === 'greatermanaboost'){
                    manaMax += 180;
                    manaRegen += 1.5;
                }
                if(self.debuffs[i].id === 'greaterregenboost'){
                    stats.heal += 1.5;
                }
                if(self.debuffs[i].id === 'greaterrandomboost1'){
                    hpMax *= 1.25;
                    stats.defense += 55;
                    stats.heal += 0.75;
                }
                if(self.debuffs[i].id === 'greaterrandomboost2'){
                    maxSpeed *= 1.25;
                    manaMax += 90;
                    manaRegen += 0.75;
                }
                if(self.debuffs[i].id === 'superrandomboost'){
                    hpMax *= 4.5;
                    stats.defense += 195;
                    maxSpeed *= 4.5;
                    manaMax += 540;
                    manaRegen += 4.5;
                    stats.heal += 4.5;
                }
            }
            self.debuffs[i].time -= 1;
            if(self.debuffs[i].time <= 0){
                debuffRemoveList.push(i);
            }
        }
        for(var i = debuffRemoveList.length - 1;i >= 0;i--){
            self.debuffs.splice(debuffRemoveList[i],1);
        }
        self.stats = JSON.parse(JSON.stringify(stats));
        self.hpMax = Math.round(hpMax);
        self.maxSpeed = Math.round(maxSpeed);
        self.manaRegen = manaRegen;
        self.manaMax = Math.round(manaMax);
        if(self.hp < 1 && self.debuffInflicted){
            if(Player.list[self.debuffInflicted]){
                var pt = Player.list[self.debuffInflicted];
            }
            else if(Projectile.list[self.debuffInflicted]){
                var pt = Projectile.list[self.debuffInflicted];
            }
            if(pt){
                if(self.willBeDead === false && self.isDead === false && self.toRemove === false && pt.toRemove === false && pt.isDead === false){
                    self.dropItems(pt);
                }
            }
            self.willBeDead = true;
            self.toRemove = true;
        }
        if(self.hp < 1){
            self.willBeDead = true;
            self.toRemove = true;
        }
        if(Player.list[self.debuffInflicted]){
            var pt = Player.list[self.debuffInflicted];
            pt.damageArray[19] += hp - self.hp;
        }
        else if(Projectile.list[self.debuffInflicted]){
            var pt = Projectile.list[self.debuffInflicted];
            Player.list[pt.parent].damageArray[19] += hp - self.hp;
        }
    }
    self.addDebuff = function(debuff,time){
        for(var j in self.debuffs){
            if(debuff === self.debuffs[j].id){
                self.debuffs[j].time = Math.max(time,self.debuffs[j].time);
                return;
            }
        }
        self.debuffs.push({id:debuff,time:time});
    }
    self.onHit = function(pt){
    }
    self.onCollision = function(pt,strength){
        if(!self.invincible && pt.toRemove === false && self.isDead === false){
            var particleType = 'redDamage';
            if(strength === 0 || pt.stats.attack === 0){
                var damage = 0;
            }
            else if(pt.stats.attack < 0){
                var damage = Math.round((pt.stats.attack - self.stats.defense) * strength * (1 + Math.random() / 5));
                particleType = 'greenDamage';
            }
            else{
                var damage = Math.max(Math.round((pt.stats.attack - self.stats.defense) * strength * (1 + Math.random() / 5) * (1 - self.stats.damageReduction)),1);
            }
            if(Math.random() < pt.stats.critChance){
                damage *= 2;
                particleType = 'bigOrangeDamage';
            }
            if(pt.stats.attack < 0){
                particleType = 'greenDamage';
            }
            //damage = Math.min(self.hp,damage);
            if(self.hp > 0){
                self.hp -= damage;
            }
            self.onHit(pt);
            if(damage){
                if(damage > 0){
                    var particle = new Particle({
                        x:self.x + Math.random() * 64 - 32,
                        y:self.y + Math.random() * 64 - 32,
                        map:self.map,
                        particleType:particleType,
                        value:'-' + Math.round(damage),
                    });
                }
                else{
                    var particle = new Particle({
                        x:self.x + Math.random() * 64 - 32,
                        y:self.y + Math.random() * 64 - 32,
                        map:self.map,
                        particleType:particleType,
                        value:'+' + Math.round(-1 * damage),
                    });
                    for(var i = 0;i < 25;i++){
                        var particle = new Particle({
                            x:self.x + Math.random() * self.width - self.width / 2,
                            y:self.y + Math.random() * self.height - self.height / 2,
                            map:self.map,
                            particleType:'heal',
                        });
                    }
                }
            }
            for(var i in pt.stats.debuffs){
                self.addDebuff(pt.stats.debuffs[i].id,pt.stats.debuffs[i].time);
            }
            if(pt.projectileType){
                if(pt.projectileType === 'fireBullet'){
                    var debuffAdded = false;
                    for(var j in self.debuffs){
                        if(self.debuffs[j].id === 'burning' && !debuffAdded){
                            self.debuffs[j].time = Math.max(30,self.debuffs[j].time);
                            debuffAdded = true;
                        }
                    }
                    if(!debuffAdded){
                        self.debuffs.push({id:'burning',time:30});
                    }
                }
                if(pt.projectileType === 'lightningSpit'){
                    var debuffAdded = false;
                    for(var j in self.debuffs){
                        if(self.debuffs[j].id === 'electrified' && !debuffAdded){
                            self.debuffs[j].time = 30;
                            debuffAdded = true;
                        }
                    }
                    if(!debuffAdded){
                        self.debuffs.push({id:'electrified',time:30});
                    }
                }
            }
            if(pt.type === 'Player' && self.type === 'Monster'){
                pt.damageArray[19] += damage;
            }
            if(pt.parentType === 'Player' && self.type === 'Monster'){
                Player.list[pt.parent].damageArray[19] += damage;
            }
        }
        if(self.hp < 1){
            for(var i = 0;i < 25;i++){
                var particle = new Particle({
                    x:self.x + Math.random() * self.width - self.width / 2,
                    y:self.y + Math.random() * self.height - self.height / 2,
                    map:self.map,
                    particleType:'kill',
                });
            }
        }
        if(self.hp < 1 && self.willBeDead === false && self.isDead === false && self.toRemove === false && pt.toRemove === false && pt.isDead === false){
            self.dropItems(pt);
            self.willBeDead = true;
            self.toRemove = true;
        }
    }
    self.shootProjectile = function(id,parentType,angle,direction,projectileType,distance,spin,pierce,stats,projectilePattern){
        var projectileWidth = 0;
        var projectileHeight = 0;
        var projectileStats = {};
        for(var i in projectileData){
            if(i === projectileType){
                projectileWidth = projectileData[i].width;
                projectileHeight = projectileData[i].height;
                projectileStats = Object.create(projectileData[i].stats);
            }
        }
        for(var i in projectileStats){
            projectileStats[i] *= stats[i];
        }
        projectileStats.damageReduction = 0;
        projectileStats.debuffs = stats.debuffs;
		var projectile = Projectile({
            id:id,
            projectileType:projectileType,
			angle:angle,
			direction:direction,
			x:self.x + Math.cos(direction / 180 * Math.PI) * distance,
			y:self.y + Math.sin(direction / 180 * Math.PI) * distance,
            distance:distance,
            map:self.map,
            parentType:parentType,
            mapWidth:self.mapWidth,
            mapHeight:self.mapHeight,
            width:projectileWidth,
            height:projectileHeight,
            spin:spin,
            pierce:pierce,
            projectilePattern:projectilePattern,
            stats:projectileStats,
            onCollision:function(self,pt){
                if(self.pierce === 0){
                    self.toRemove = true;
                }
                else{
                    self.pierce -= 1;
                }
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
        if(self.canCollide === false){
            return;
        }
        if(self.spdX <= 0){
            if(self.spdY <= 0){
                if(Collision.list[self.map][Math.round((self.x) / 64)]){
                    if(Collision.list[self.map][Math.round((self.x) / 64)][Math.round((self.y) / 64)]){
                        self.doCollision(self.map,Math.round((self.x) / 64),Math.round((self.y) / 64));
                    }
                }
                if(Collision.list[self.map][Math.round((self.x) / 64)]){
                    if(Collision.list[self.map][Math.round((self.x) / 64)][Math.round((self.y - 64) / 64)]){
                        self.doCollision(self.map,Math.round((self.x) / 64),Math.round((self.y - 64) / 64));
                    }
                }
                if(Collision.list[self.map][Math.round((self.x - 64) / 64)]){
                    if(Collision.list[self.map][Math.round((self.x - 64) / 64)][Math.round((self.y) / 64)]){
                        self.doCollision(self.map,Math.round((self.x - 64) / 64),Math.round((self.y) / 64));
                    }
                }
                if(Collision.list[self.map][Math.round((self.x - 64) / 64)]){
                    if(Collision.list[self.map][Math.round((self.x - 64) / 64)][Math.round((self.y - 64) / 64)]){
                        self.doCollision(self.map,Math.round((self.x - 64) / 64),Math.round((self.y - 64) / 64));
                    }
                }
            }
            else if(self.spdY > 0){
                if(Collision.list[self.map][Math.round((self.x) / 64)]){
                    if(Collision.list[self.map][Math.round((self.x) / 64)][Math.round((self.y - 64) / 64)]){
                        self.doCollision(self.map,Math.round((self.x) / 64),Math.round((self.y - 64) / 64));
                    }
                }
                if(Collision.list[self.map][Math.round((self.x) / 64)]){
                    if(Collision.list[self.map][Math.round((self.x) / 64)][Math.round((self.y) / 64)]){
                        self.doCollision(self.map,Math.round((self.x) / 64),Math.round((self.y) / 64));
                    }
                }
                if(Collision.list[self.map][Math.round((self.x - 64) / 64)]){
                    if(Collision.list[self.map][Math.round((self.x - 64) / 64)][Math.round((self.y - 64) / 64)]){
                        self.doCollision(self.map,Math.round((self.x - 64) / 64),Math.round((self.y - 64) / 64));
                    }
                }
                if(Collision.list[self.map][Math.round((self.x - 64) / 64)]){
                    if(Collision.list[self.map][Math.round((self.x - 64) / 64)][Math.round((self.y) / 64)]){
                        self.doCollision(self.map,Math.round((self.x - 64) / 64),Math.round((self.y) / 64));
                    }
                }
            }
        }
        else if(self.spdX > 0){
            if(self.spdY <= 0){
                if(Collision.list[self.map][Math.round((self.x - 64) / 64)]){
                    if(Collision.list[self.map][Math.round((self.x - 64) / 64)][Math.round((self.y) / 64)]){
                        self.doCollision(self.map,Math.round((self.x - 64) / 64),Math.round((self.y) / 64));
                    }
                }
                if(Collision.list[self.map][Math.round((self.x - 64) / 64)]){
                    if(Collision.list[self.map][Math.round((self.x - 64) / 64)][Math.round((self.y - 64) / 64)]){
                        self.doCollision(self.map,Math.round((self.x - 64) / 64),Math.round((self.y - 64) / 64));
                    }
                }
                if(Collision.list[self.map][Math.round((self.x) / 64)]){
                    if(Collision.list[self.map][Math.round((self.x) / 64)][Math.round((self.y) / 64)]){
                        self.doCollision(self.map,Math.round((self.x) / 64),Math.round((self.y) / 64));
                    }
                }
                if(Collision.list[self.map][Math.round((self.x) / 64)]){
                    if(Collision.list[self.map][Math.round((self.x) / 64)][Math.round((self.y - 64) / 64)]){
                        self.doCollision(self.map,Math.round((self.x) / 64),Math.round((self.y - 64) / 64));
                    }
                }
            }
            else if(self.spdY > 0){
                if(Collision.list[self.map][Math.round((self.x - 64) / 64)]){
                    if(Collision.list[self.map][Math.round((self.x - 64) / 64)][Math.round((self.y - 64) / 64)]){
                        self.doCollision(self.map,Math.round((self.x - 64) / 64),Math.round((self.y - 64) / 64));
                    }
                }
                if(Collision.list[self.map][Math.round((self.x - 64) / 64)]){
                    if(Collision.list[self.map][Math.round((self.x - 64) / 64)][Math.round((self.y) / 64)]){
                        self.doCollision(self.map,Math.round((self.x - 64) / 64),Math.round((self.y) / 64));
                    }
                }
                if(Collision.list[self.map][Math.round((self.x) / 64)]){
                    if(Collision.list[self.map][Math.round((self.x) / 64)][Math.round((self.y - 64) / 64)]){
                        self.doCollision(self.map,Math.round((self.x) / 64),Math.round((self.y - 64) / 64));
                    }
                }
                if(Collision.list[self.map][Math.round((self.x) / 64)]){
                    if(Collision.list[self.map][Math.round((self.x) / 64)][Math.round((self.y) / 64)]){
                        self.doCollision(self.map,Math.round((self.x) / 64),Math.round((self.y) / 64));
                    }
                }
            }
        }

        if(SlowDown.list[self.map][Math.round((self.x - 64) / 64)]){
            if(SlowDown.list[self.map][Math.round((self.x - 64) / 64)][Math.round((self.y - 64) / 64)]){
                self.doSlowDown(self.map,Math.round((self.x - 64) / 64),Math.round((self.y - 64) / 64));
            }
        }
        if(SlowDown.list[self.map][Math.round((self.x - 64) / 64)]){
            if(SlowDown.list[self.map][Math.round((self.x - 64) / 64)][Math.round((self.y) / 64)]){
                self.doSlowDown(self.map,Math.round((self.x - 64) / 64),Math.round((self.y) / 64));
            }
        }
        if(SlowDown.list[self.map][Math.round((self.x) / 64)]){
            if(SlowDown.list[self.map][Math.round((self.x) / 64)][Math.round((self.y - 64) / 64)]){
                self.doSlowDown(self.map,Math.round((self.x) / 64),Math.round((self.y - 64) / 64));
            }
        }
        if(SlowDown.list[self.map][Math.round((self.x) / 64)]){
            if(SlowDown.list[self.map][Math.round((self.x) / 64)][Math.round((self.y) / 64)]){
                self.doSlowDown(self.map,Math.round((self.x) / 64),Math.round((self.y) / 64));
            }
        }

        if(Collision.list[self.map][Math.round((self.x - 64) / 64)]){
            if(Collision.list[self.map][Math.round((self.x - 64) / 64)][Math.round((self.y - 64) / 64)]){
                self.justCollided = true;
            }
        }
        if(Collision.list[self.map][Math.round((self.x - 64) / 64)]){
            if(Collision.list[self.map][Math.round((self.x - 64) / 64)][Math.round((self.y) / 64)]){
                self.justCollided = true;
            }
        }
        if(Collision.list[self.map][Math.round((self.x) / 64)]){
            if(Collision.list[self.map][Math.round((self.x) / 64)][Math.round((self.y - 64) / 64)]){
                self.justCollided = true;
            }
        }
        if(Collision.list[self.map][Math.round((self.x) / 64)]){
            if(Collision.list[self.map][Math.round((self.x) / 64)][Math.round((self.y) / 64)]){
                self.justCollided = true;
            }
        }
    }
    self.doCollision = function(map,x,y){
        var collision = {
            map:map,
            x:x * 64,
            y:y * 64,
        };
        if(Collision.list[map][x][y] === 1){
            collision.width = 64;
            collision.height = 64;
            collision.x += 32;
            collision.y += 32;
        }
        if(Collision.list[map][x][y] === 2){
            collision.width = 64;
            collision.height = 32;
            collision.x += 32;
            collision.y += 48;
        }
        if(Collision.list[map][x][y] === 3){
            collision.width = 64;
            collision.height = 32;
            collision.x += 32;
            collision.y += 16;
        }
        if(Collision.list[map][x][y] === 4){
            collision.width = 32;
            collision.height = 64;
            collision.x += 16;
            collision.y += 32;
        }
        if(Collision.list[map][x][y] === 5){
            collision.width = 32;
            collision.height = 64;
            collision.x += 48;
            collision.y += 32;
        }
        if(Collision.list[map][x][y] === 6){
            collision.width = 32;
            collision.height = 32;
            collision.x += 32;
            collision.y += 32;
        }
        if(Collision.list[map][x][y] === 7){
            collision.width = 32;
            collision.height = 32;
            collision.x += 16;
            collision.y += 48;
        }
        if(Collision.list[map][x][y] === 8){
            collision.width = 32;
            collision.height = 32;
            collision.x += 48;
            collision.y += 48;
        }
        if(Collision.list[map][x][y] === 9){
            collision.width = 32;
            collision.height = 32;
            collision.x += 48;
            collision.y += 16;
        }
        if(Collision.list[map][x][y] === 10){
            collision.width = 32;
            collision.height = 32;
            collision.x += 16;
            collision.y += 16;
        }
        if(Collision.list[map][x][y] === 11){
            var collision2 = {
                map:map,
                x:x * 64 + 48,
                y:y * 64 + 32,
                width:32,
                height:64,
            };
            collision.width = 64;
            collision.height = 32;
            collision.x += 32;
            collision.y += 48;
        }
        if(Collision.list[map][x][y] === 12){
            var collision2 = {
                map:map,
                x:x * 64 + 16,
                y:y * 64 + 32,
                width:32,
                height:64,
            };
            collision.width = 64;
            collision.height = 32;
            collision.x += 32;
            collision.y += 16;
        }
        if(Collision.list[map][x][y] === 13){
            var collision2 = {
                map:map,
                x:x * 64 + 48,
                y:y * 64 + 32,
                width:32,
                height:64,
            };
            collision.width = 64;
            collision.height = 32;
            collision.x += 32;
            collision.y += 16;
        }
        if(Collision.list[map][x][y] === 14){
            var collision2 = {
                map:map,
                x:x * 64 + 16,
                y:y * 64 + 32,
                width:32,
                height:64,
            };
            collision.width = 64;
            collision.height = 32;
            collision.x += 32;
            collision.y += 48;
        }
        if(self.isColliding(collision)){
            var x1 = self.x;
            self.x = self.lastX;
            if(self.isColliding(collision)){
                self.x = x1;
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
        if(Collision.list[map][x]){
            if(Collision.list[map][x][y] > 10){
                if(self.isColliding(collision2)){
                    var x1 = self.x;
                    self.x = self.lastX;
                    if(self.isColliding(collision2)){
                        self.x = x1;
                        self.y = self.lastY;
                        if(self.isColliding(collision2)){
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
    self.doSlowDown = function(map,x,y){
        var slowDown = {
            map:map,
            x:x * 64,
            y:y * 64,
        };
        if(SlowDown.list[map][x][y] === 1){
            slowDown.width = 64;
            slowDown.height = 64;
            slowDown.x += 32;
            slowDown.y += 32;
        }
        if(SlowDown.list[map][x][y] === 2){
            slowDown.width = 64;
            slowDown.height = 32;
            slowDown.x += 32;
            slowDown.y += 48;
        }
        if(SlowDown.list[map][x][y] === 3){
            slowDown.width = 64;
            slowDown.height = 32;
            slowDown.x += 32;
            slowDown.y += 16;
        }
        if(SlowDown.list[map][x][y] === 4){
            slowDown.width = 32;
            slowDown.height = 64;
            slowDown.x += 16;
            slowDown.y += 32;
        }
        if(SlowDown.list[map][x][y] === 5){
            slowDown.width = 32;
            slowDown.height = 64;
            slowDown.x += 48;
            slowDown.y += 32;
        }
        if(SlowDown.list[map][x][y] === 6){
            slowDown.width = 32;
            slowDown.height = 32;
            slowDown.x += 32;
            slowDown.y += 32;
        }
        if(SlowDown.list[map][x][y] === 7){
            slowDown.width = 32;
            slowDown.height = 32;
            slowDown.x += 16;
            slowDown.y += 48;
        }
        if(SlowDown.list[map][x][y] === 8){
            slowDown.width = 32;
            slowDown.height = 32;
            slowDown.x += 48;
            slowDown.y += 48;
        }
        if(SlowDown.list[map][x][y] === 9){
            slowDown.width = 32;
            slowDown.height = 32;
            slowDown.x += 48;
            slowDown.y += 16;
        }
        if(SlowDown.list[map][x][y] === 10){
            slowDown.width = 32;
            slowDown.height = 32;
            slowDown.x += 16;
            slowDown.y += 16;
        }
        if(self.isColliding(slowDown)){
            self.moveSpeed = self.maxSpeed / 2;
        }
    }
    return self;
}

Player = function(param){
    var self = Actor(param);
    var socket = SOCKET_LIST[self.id];
    self.x = ENV.Spawnpoint.x;
    self.y = ENV.Spawnpoint.y;
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
    self.hp = 200;
    self.hpMax = 200;
    self.mana = 0;
    self.manaMax = 200;
    self.manaRefresh = 0;
    self.manaRegen = 1;
    self.weaponState = 0;
    self.xp = 0;
    self.xpMax = 500;
    self.level = 0;
    self.levelMax = 30;
    self.direction = 0;
    self.map = ENV.Spawnpoint.map;
    playerMap[self.map] += 1;
    self.mapHeight = 3200;
    self.mapWidth = 3200;
    self.pet = undefined;
    self.quest = false;
    self.questStage = 0;
    self.questInfo = {};
    self.questDependent = {};
    self.questTimeout = {};
    self.questStats = {
        "Tutorial":false,
        "Missing Person":false,
        "Monster Raid":false,
        "Secret Tunnels":false,
        "Broken Sword":false,
        "Lightning Lizard Boss":false,
        "Wood Delivery":false,
        "Possessed Spirit":false,
        "Plantera":false,
        "Whirlwind":false,
        "sp":false,
        "Lost Rubies":false,
        "Broken Piano":false,
        "Pet Training":false,
        "Monster Search":false,
        "Missing Candies":false,
        "Cherrier":false,
        "Sphere":false,
        "Thunderbird":false,
        "2021 Anniversary":false,
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
        switch:'e',
        heal:' ',
    };
    self.secondKeyMap = {
        up:'ArrowUp',
        down:'ArrowDown',
        left:'ArrowLeft',
        right:'ArrowRight',
        attack:'attack',
        second:'second',
        switch:'Tab',
        heal:'Shift',
    };
    self.thirdKeyMap = {
        up:'W',
        down:'S',
        left:'A',
        right:'D',
        attack:'attack',
        second:'second',
        switch:'E',
        heal:' ',
    };
    self.attackCost = 10;
    self.healCost = 50;
    self.cooldown = 5;
    self.useTime = 5;
    self.passiveCooldown = 0;
    self.offhandPassiveCooldown = 0;
    self.passiveUsetime = 10;
    self.offhandPassiveUsetime = 10;
    self.passive = '';
    self.offhandPassive = '';
    self.regenTick = 0;
    self.ability = {
        ability:'base',
        attackPattern:[0],
        healPattern:[0],
    }
    self.currentResponse = 0;
    self.inventory = new Inventory(socket,true);
    self.selectedItem = false;
    if(param.param.inventory !== undefined){
        var newAccount = true;
        for(var i in param.param.inventory){
            if(param.param.inventory[i]){
                if(param.param.inventory[i].id && param.param.inventory[i].stack === undefined){
                    newAccount = false;
                }
            }
            else{
                newAccount = false;
            }
        }
        if(newAccount === true){
            self.inventory.items = param.param.inventory;
        }
        else{
            for(var i in param.param.inventory){
                if(param.param.inventory[i]){
                    self.inventory.addItem(param.param.inventory[i].id,1,param.param.inventory[i].enchantments);
                }
            }
            self.inventory.refreshMenu();
        }
        for(var i in self.inventory.items){
            if(self.inventory.items[i].stack === undefined){
                self.inventory.items[i].stack = 1;
            }
            self.inventory.refreshItem(i);
        }
    }
    if(param.param.equips !== undefined){
        self.inventory.equips = param.param.equips;
        for(var i in self.inventory.equips){
            if(self.inventory.equips[i].stack === undefined){
                self.inventory.equips[i].stack = 1;
            }
            self.inventory.refreshItem(i);
        }
    }
    if(param.param.currentEquip !== undefined){
        self.inventory.equips = param.param.currentEquip;
        for(var i in self.inventory.equips){
            if(self.inventory.equips[i].stack === undefined){
                self.inventory.equips[i].stack = 1;
            }
            self.inventory.refreshItem(i);
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
        else{
            self.level = xpLevels.length;
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
    if(self.questStats.Tutorial === false){
        self.inventory.addItem('simplewoodensword');
        self.inventory.addItem('simplewoodenbow');
        self.inventory.addItem('simplewoodenstaff');
        self.quest = 'Tutorial';
        self.questStage = 1;
        self.questInfo.didQuest = false;
        self.teleport(352,1600,'The Tutorial');
    }
    self.hpMax = hpLevels[self.level];
    self.oldHpMax = self.hpMax;
    self.maxSpeed = 25;
    self.oldMaxSpeed = self.maxSpeed;
    self.oldManaRegen = self.manaRegen;
    self.oldManaMax = self.manaMax;
    self.stats = {
        attack:0,
        defense:0,
        heal:1,
        xp:1,
        luck:1,
        range:1,
        speed:1,
        critChance:0,
        damageType:'',
        damageReduction:0,
        knockback:0.3,
        debuffs:[],
        aggro:1,
    }
    self.oldStats = JSON.parse(JSON.stringify(self.stats));
    self.coins = 0;
    self.devCoins = 0;
    if(param.param.coins !== undefined){
        self.coins = param.param.coins;
    }
    if(param.param.devCoins !== undefined){
        //self.devCoins = param.param.devCoins;
    }
    self.lastChat = 0;
    self.chatWarnings = 0;
    self.currentItem = '';
    self.damageDone = 0;
    self.damageArray = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,];
    var lastSelf = {};
    self.update = function(){
        self.lastChat -= 1;
        self.startX = self.x;
        self.startY = self.y;
        self.mapChange += 1;
        self.moveSpeed = self.maxSpeed;
        for(var i = 0;i < self.moveSpeed;i++){
            self.updateSpd();
            self.updateMove();
            if(self.canMove){
                self.updatePosition();
            }
            self.dazed -= 1;
            if(self.x < self.width / 2){
                self.x = self.width / 2;
                self.justCollided = true;
            }
            if(self.x > self.mapWidth - self.width / 2){
                self.x = self.mapWidth - self.width / 2;
                self.justCollided = true;
            }
            if(self.y < self.height / 2){
                self.y = self.height / 2;
                self.justCollided = true;
            }
            if(self.y > self.mapHeight - self.height / 2){
                self.y = self.mapHeight - self.height / 2;
                self.justCollided = true;
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
        self.regenTick += 1;
        self.manaRefresh = Math.max(self.manaRefresh - 1,-10);
        self.cooldown -= 1;
        self.passiveCooldown -= 1;
        self.offhandPassiveCooldown -= 1;
        if(!self.invincible && self.isDead === false){
            if(self.manaRefresh <= -10){
                self.mana += 5 * self.manaRegen;
            }
            self.mana += 0.1 * self.manaRegen;
        }
        if(Math.round(self.mana) >= self.manaMax){
            self.mana = self.manaMax;
        }
        self.updateStats();
        if(!self.invincible && self.isDead === false){
            self.doDebuffs();
        }
        if(self.hp < 1){
            self.hp = 0;
            if(self.willBeDead){
                Player.spectate(socket);
                addToChat('style="color: #ff0000">',self.displayName + ' died.');
                if(self.quest !== false){
                    self.sendNotification('You failed the quest ' + self.quest + '.');
                }
                self.endQuest();
            }
        }
        else{
            if(self.hp > self.hpMax){
                self.hp = self.hpMax;
            }
            else{
                if(self.regenTick % 10 === 0 && self.invincible === false){
                    var heal = Math.round(self.stats.heal * (5 + Math.random() * 10));
                    heal = Math.min(self.hpMax - self.hp,heal);
                    self.hp += heal;
                    if(heal){
                        var particle = new Particle({
                            x:self.x + Math.random() * 64 - 32,
                            y:self.y + Math.random() * 64 - 32,
                            map:self.map,
                            particleType:'greenDamage',
                            value:'+' + Math.round(heal),
                        });
                    }
                }
            }
        }
        self.damageDone = 0;
        for(var i in self.damageArray){
            self.damageDone += self.damageArray[i];
        }
        self.updateQuest();
        if(!self.invincible && self.isDead === false){
            self.updateAttack();
        }
        self.updateMap();
        self.updateXp();
        if(self.hp > self.hpMax){
            self.hp = self.hpMax;
        }
        if(self.pushPt){
            //self.dazed = self.maxSpeed;
        }
        self.pushPt = undefined;
        self.damageArray.splice(0,1);
        self.damageArray.push(0);
    }
    self.useItem = function(event,index){
        eval(event);
    }
    self.checkQuestRequirements = function(quest){
        for(var i in questData){
            if(i === quest){
                for(var j in questData[i].requirements){
                    if(self.questStats[questData[i].requirements[j]] === false){
                        return false;
                    }
                    else if(questData[i].requirements[j].slice(0,4) === 'Lvl '){
                        if(parseInt(questData[i].requirements[j].slice(4,questData[i].requirements[j].length),10) > self.level){
                            return false;
                        }
                    }
                }
            }
        }
        return true;
    }
    self.checkNpcRequirements = function(npc){
        for(var i in npcData){
            if(i === npc){
                for(var j in npcData[i].requirements){
                    if(self.questStats[npcData[i].requirements[j]] === false){
                        return false;
                    }
                    else if(npcData[i].requirements[j].slice(0,4) === 'Lvl '){
                        if(parseInt(npcData[i].requirements[j].slice(4,npcData[i].requirements[j].length),10) > self.level){
                            return false;
                        }
                    }
                }
            }
        }
        return true;
    }
    self.startDialogue = function(message,response1,response2,response3,response4){
        self.invincible = true;
        socket.emit('dialogueLine',{
            state:'ask',
            message:message.replace('*username*',self.username),
            response1:response1,
            response2:response2,
            response3:response3,
            response4:response4,
        });
        self.currentResponse = 0;
    }
    self.endDialogue = function(){
        self.invincible = false;
        socket.emit('dialogueLine',{
            state:'remove',
        });
        self.currentResponse = 0;
    }
    self.startQuestObjective = function(questObjective){
        socket.emit('questObjective',{
            questName:self.quest,
            questObjective:questObjective,
        });
    }
    self.endQuestObjective = function(){
        socket.emit('questObjective',{
            questName:'',
            questObjective:'',
        });
    }
    self.sendNotification = function(notification){
        socket.emit('notification',notification);
    }
    if(self.questStats["2021 Anniversary"] === false){
        self.inventory.addItem('anniversarypresent');
        self.sendNotification('Happy First Anniversary! You got an anniversary gift!');
        self.questStats["2021 Anniversary"] = true;
    }
    self.startQuest = function(quest){
        self.quest = quest;
        self.questStage = 1;
        self.questInfo.didQuest = false;
        self.sendNotification('You started the quest ' + self.quest + '.');
    }
    self.endQuest = function(){
        self.quest = false;
        self.questInfo = {};
        for(var i in self.questDependent){
            self.questDependent[i].toRemove = true;
            if(self.questDependent[i].type === 'Collision'){
                Collision.list[self.questDependent[i].map][Math.round(self.questDependent[i].x / 64)][Math.round(self.questDependent[i].y / 64)] = self.questDependent[i].oldCollision;
                var newTiles = [];
                for(var j in tiles){
                    if(tiles[j].x === self.questDependent[i].x + 32 && tiles[j].y === self.questDependent[i].y + 32 && tiles[j].map === self.questDependent[i].map && tiles[j].tile_idx === self.questDependent[i].tile_idx && tiles[j].canvas === self.questDependent[i].canvas){
                        newTiles.push(tiles[j]);
                    }
                }
                tiles = newTiles;
                for(var j in SOCKET_LIST){
                    SOCKET_LIST[j].emit('removeTile',{
                        x:self.questDependent[i].x + 32,
                        y:self.questDependent[i].y + 32,
                        map:self.questDependent[i].map,
                        tile_idx:self.questDependent[i].tile_idx,
                        canvas:self.questDependent[i].canvas,
                    });
                }
            }
        }
        for(var i in self.questTimeout){
            clearTimeout(self.questTimeout[i]);
        }
        self.endDialogue();
        self.endQuestObjective();
    }
    self.completeQuest = function(){
        self.xp += Math.round(questData[self.quest].xp * self.stats.xp);
        self.sendNotification('You completed the quest ' + self.quest + '.');
        addToChat('style="color: ' + self.textColor + '">',self.displayName + " completed the quest " + self.quest + ".");
        if(questData[self.quest].items){
            var item = questData[self.quest].items[Math.floor(questData[self.quest].items.length * Math.random())];
            self.inventory.addItem(item,1);
            self.sendNotification('This quest gave you a ' + Item.list[item].name + '.');
        }
        if(questData[self.quest].materials){
            for(var i in questData[self.quest].materials){
                var amount = Math.round(questData[self.quest].materials[i].amount * (1 + Math.random()));
                self.inventory.addItem(questData[self.quest].materials[i].amount.id,amount);
                self.sendNotification('This quest gave you ' + Item.list[questData[self.quest].materials[i].id].name + ' x' + amount + '.');
            }
        }
        if(questData[self.quest].rewards){
            if(questData[self.quest].rewards === 'strongerPet' && self.questStats[self.quest] === false){
                self.sendNotification('Your pets are now 3 times stronger.');
            }
        }
        self.questStats[self.quest] = true;
        self.quest = false;
        self.questInfo = {};
        for(var i in self.questDependent){
            self.questDependent[i].toRemove = true;
            if(self.questDependent[i].type === 'Collision'){
                Collision.list[self.questDependent[i].map][Math.round(self.questDependent[i].x / 64)][Math.round(self.questDependent[i].y / 64)] = self.questDependent[i].oldCollision;
                var newTiles = [];
                for(var j in tiles){
                    if(tiles[j].x === self.questDependent[i].x + 32 && tiles[j].y === self.questDependent[i].y + 32 && tiles[j].map === self.questDependent[i].map && tiles[j].tile_idx === self.questDependent[i].tile_idx && tiles[j].canvas === self.questDependent[i].canvas){
                        newTiles.push(tiles[j]);
                    }
                }
                tiles = newTiles;
                for(var j in SOCKET_LIST){
                    SOCKET_LIST[j].emit('removeTile',{
                        x:self.questDependent[i].x + 32,
                        y:self.questDependent[i].y + 32,
                        map:self.questDependent[i].map,
                        tile_idx:self.questDependent[i].tile_idx,
                        canvas:self.questDependent[i].canvas,
                    });
                }
            }
        }
        for(var i in self.questTimeout){
            clearTimeout(self.questTimeout[i]);
        }
        self.endDialogue();
        self.endQuestObjective();
    }
    self.spawnQuestMonster = function(id,x,y,map,monsterType){
        self.questDependent[id] = new Monster({
            x:x,
            y:y,
            map:map,
            moveSpeed:monsterData[monsterType].moveSpeed,
            hp:monsterData[monsterType].hp * ENV.MonsterStrength,
            monsterType:monsterType,
            attackState:monsterData[monsterType].attackState,
            width:monsterData[monsterType].width,
            height:monsterData[monsterType].height,
            xpGain:monsterData[monsterType].xpGain,
            itemDrops:monsterData[monsterType].itemDrops,
            immuneDebuffs:monsterData[monsterType].immuneDebuffs,
            aggro:monsterData[monsterType].aggro,
            boss:monsterData[monsterType].boss,
            trackDistance:monsterData[monsterType].trackDistance,
            pushResist:monsterData[monsterType].pushResist,
            stats:{
                attack:monsterData[monsterType].stats.attack * ENV.MonsterStrength,
                defense:monsterData[monsterType].stats.defense,
                heal:monsterData[monsterType].stats.heal,
                speed:monsterData[monsterType].stats.speed,
                range:monsterData[monsterType].stats.range,
                critChance:monsterData[monsterType].stats.critChance,
                damageReduction:monsterData[monsterType].stats.damageReduction,
                knockback:monsterData[monsterType].stats.knockback,
                debuffs:monsterData[monsterType].stats.debuffs,
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
                delete self.questDependent[id];
                self.questInfo.monstersKilled += 1;
            },
        });
        for(var i in Player.list){
            if(Player.list[i].map === self.map){
                SOCKET_LIST[i].emit('initEntity',self.questDependent[id].getInitPack());
            }
        }
        self.questInfo.maxMonsters += 1;
    }
    self.spawnPet = function(){
        for(var i in Pet.list){
            if(Pet.list[i].parent === self.id){
                Pet.list[i].toRemove = true;
            }
        }
        var pet = Pet({
            parent:self.id,
            x:self.x + 128 * (Math.random() - 0.5),
            y:self.y + 128 * (Math.random() - 0.5),
            petType:self.petType,
            name:self.petType + ' Lvl.' + self.level,
            moveSpeed:5 + self.level / 5,
        });
        self.pet = pet.id;
        for(var i in SOCKET_LIST){
            SOCKET_LIST[i].emit('initEntity',pet.getInitPack());
        }
    }
    self.updateQuest = function(){
        if(self.quest !== false && self.quest !== 'Tutorial'){
            if(self.questInfo.didQuest === false){
                if(self.questStage === -1){
                    self.endQuest();
                }
                else if(questData[self.quest].data[self.questStage] === undefined){
                    self.completeQuest();
                }
                else{
                    for(var i in self.questTimeout){
                        clearTimeout(self.questTimeout[i]);
                    }
                    if(questData[self.quest].data[self.questStage].dialogue !== undefined){
                        if(questData[self.quest].data[self.questStage].dialogue.response2 === undefined){
                            self.startDialogue(questData[self.quest].data[self.questStage].dialogue.message,questData[self.quest].data[self.questStage].dialogue.response1.text);
                        }
                        else if(questData[self.quest].data[self.questStage].dialogue.response3 === undefined){
                            self.startDialogue(questData[self.quest].data[self.questStage].dialogue.message,questData[self.quest].data[self.questStage].dialogue.response1.text,questData[self.quest].data[self.questStage].dialogue.response2.text);
                        }
                        else if(questData[self.quest].data[self.questStage].dialogue.response4 === undefined){
                            self.startDialogue(questData[self.quest].data[self.questStage].dialogue.message,questData[self.quest].data[self.questStage].dialogue.response1.text,questData[self.quest].data[self.questStage].dialogue.response2.text,questData[self.quest].data[self.questStage].dialogue.response3.text);
                        }
                        else{
                            self.startDialogue(questData[self.quest].data[self.questStage].dialogue.message,questData[self.quest].data[self.questStage].dialogue.response1.text,questData[self.quest].data[self.questStage].dialogue.response2.text,questData[self.quest].data[self.questStage].dialogue.response3.text,questData[self.quest].data[self.questStage].dialogue.response4.text);
                        }
                    }
                    else{
                        self.endDialogue();
                    }
                    if(questData[self.quest].data[self.questStage].objective !== undefined){
                        self.startQuestObjective(questData[self.quest].data[self.questStage].objective);
                    }
                    if(questData[self.quest].data[self.questStage].notification !== undefined){
                        self.sendNotification(questData[self.quest].data[self.questStage].notification);
                    }
                    if(questData[self.quest].data[self.questStage].trigger !== undefined){
                        if(questData[self.quest].data[self.questStage].trigger.type === 'wait1Second'){
                            self.questTimeout[Math.random] = setTimeout(function(){
                                if(questData[self.quest]){
                                    self.questStage = questData[self.quest].data[self.questStage].trigger.next;
                                    self.questInfo.didQuest = false;
                                }
                            },1000);
                        }
                        if(questData[self.quest].data[self.questStage].trigger.type === 'wait2Seconds'){
                            self.questTimeout[Math.random] = setTimeout(function(){
                                if(questData[self.quest]){
                                    self.questStage = questData[self.quest].data[self.questStage].trigger.next;
                                    self.questInfo.didQuest = false;
                                }
                            },2000);
                        }
                        if(questData[self.quest].data[self.questStage].trigger.type === 'wait20Seconds'){
                            self.questTimeout[Math.random] = setTimeout(function(){
                                if(questData[self.quest]){
                                    self.questStage = questData[self.quest].data[self.questStage].trigger.next;
                                    self.questInfo.didQuest = false;
                                }
                            },20000);
                        }
                    }
                    self.questInfo.didQuest = true;
                }
            }
            else{
                if(self.currentResponse !== 0 && questData[self.quest].data[self.questStage].dialogue !== undefined){
                    if(questData[self.quest].data[self.questStage].dialogue['response' + self.currentResponse] !== undefined){
                        self.questStage = questData[self.quest].data[self.questStage].dialogue['response' + self.currentResponse].next;
                        self.questInfo.didQuest = false;
                    }
                }
                if(questData[self.quest].data[self.questStage]){
                    if(questData[self.quest].data[self.questStage].trigger !== undefined){
                        switch(questData[self.quest].data[self.questStage].trigger.type){
                            case 'playerCollision':
                                var firstTile = "" + self.map + ":" + Math.round((self.x - 64) / 64) * 64 + ":" + Math.round((self.y - 64) / 64) * 64 + ":";
                                var secondTile = "" + self.map + ":" + Math.round((self.x - 64) / 64) * 64 + ":" + Math.round(self.y / 64) * 64 + ":";
                                var thirdTile = "" + self.map + ":" + Math.round(self.x / 64) * 64 + ":" + Math.round((self.y - 64) / 64) * 64 + ":";
                                var fourthTile = "" + self.map + ":" + Math.round(self.x / 64) * 64 + ":" + Math.round(self.y / 64) * 64 + ":";
                                if(QuestInfo.list[firstTile]){
                                    if(QuestInfo.list[firstTile].quest === self.quest){
                                        if(questData[self.quest].data[self.questStage].trigger){
                                            if(QuestInfo.list[firstTile].info === questData[self.quest].data[self.questStage].trigger.questInfo){
                                                if(self.isColliding(QuestInfo.list[firstTile])){
                                                    self.questStage = questData[self.quest].data[self.questStage].trigger.next;
                                                    self.questInfo.didQuest = false;
                                                }
                                            }
                                        }
                                    }
                                }
                                if(QuestInfo.list[secondTile]){
                                    if(QuestInfo.list[secondTile].quest === self.quest){
                                        if(questData[self.quest].data[self.questStage].trigger){
                                            if(QuestInfo.list[secondTile].info === questData[self.quest].data[self.questStage].trigger.questInfo){
                                                if(self.isColliding(QuestInfo.list[secondTile])){
                                                    self.questStage = questData[self.quest].data[self.questStage].trigger.next;
                                                    self.questInfo.didQuest = false;
                                                }
                                            }
                                        }
                                    }
                                }
                                if(QuestInfo.list[thirdTile]){
                                    if(QuestInfo.list[thirdTile].quest === self.quest){
                                        if(questData[self.quest].data[self.questStage].trigger){
                                            if(QuestInfo.list[thirdTile].info === questData[self.quest].data[self.questStage].trigger.questInfo){
                                                if(self.isColliding(QuestInfo.list[thirdTile])){
                                                    self.questStage = questData[self.quest].data[self.questStage].trigger.next;
                                                    self.questInfo.didQuest = false;
                                                }
                                            }
                                        }
                                    }
                                }
                                if(QuestInfo.list[fourthTile]){
                                    if(QuestInfo.list[fourthTile].quest === self.quest){
                                        if(questData[self.quest].data[self.questStage].trigger){
                                            if(QuestInfo.list[fourthTile].info === questData[self.quest].data[self.questStage].trigger.questInfo){
                                                if(self.isColliding(QuestInfo.list[fourthTile])){
                                                    self.questStage = questData[self.quest].data[self.questStage].trigger.next;
                                                    self.questInfo.didQuest = false;
                                                }
                                            }
                                        }
                                    }
                                }
                                break;
                            case 'changeQuestStage':
                                if(self.questStats[questData[self.quest].data[self.questStage].trigger.quest]){
                                    self.questStage = questData[self.quest].data[self.questStage].trigger.next;
                                    self.questInfo.didQuest = false;
                                }
                                break;
                            case 'playerMap':
                                if(self.map === questData[self.quest].data[self.questStage].trigger.map){
                                    self.questStage = questData[self.quest].data[self.questStage].trigger.next;
                                    self.questInfo.didQuest = false;
                                }
                                break;
                            case 'resetKilledMonsters':
                                self.questInfo.maxMonsters = 0;
                                self.questInfo.monstersKilled = 0;
                                self.questStage = questData[self.quest].data[self.questStage].trigger.next;
                                self.questInfo.didQuest = false;
                                break;
                            case 'spawnMonster':
                                for(var i in QuestInfo.list){
                                    if(QuestInfo.list[i].quest === self.quest){
                                        if(QuestInfo.list[i].info === questData[self.quest].data[self.questStage].trigger.questInfo){
                                            self.spawnQuestMonster(i,QuestInfo.list[i].x,QuestInfo.list[i].y,QuestInfo.list[i].map,questData[self.quest].data[self.questStage].trigger.monsterType);
                                        }
                                    }
                                }
                                self.questStage = questData[self.quest].data[self.questStage].trigger.next;
                                self.questInfo.didQuest = false;
                                break;
                            case 'spawnMonsters':
                                for(var i in questData[self.quest].data[self.questStage].trigger.questInfo){
                                    for(var j in QuestInfo.list){
                                        if(QuestInfo.list[j].quest === self.quest){
                                            if(QuestInfo.list[j].info === questData[self.quest].data[self.questStage].trigger.questInfo[i]){
                                                self.spawnQuestMonster(j,QuestInfo.list[j].x,QuestInfo.list[j].y,QuestInfo.list[j].map,questData[self.quest].data[self.questStage].trigger.monsterType[i]);
                                            }
                                        }
                                    }
                                }
                                self.questStage = questData[self.quest].data[self.questStage].trigger.next;
                                self.questInfo.didQuest = false;
                                break;
                            case 'spawnNpc':
                                for(var i in QuestInfo.list){
                                    if(QuestInfo.list[i].quest === self.quest){
                                        if(QuestInfo.list[i].info === questData[self.quest].data[self.questStage].trigger.questInfo){
                                            self.questDependent[questData[self.quest].data[self.questStage].trigger.npcId] = new Npc({
                                                entityId:questData[self.quest].data[self.questStage].trigger.npcId,
                                                x:QuestInfo.list[i].x,
                                                y:QuestInfo.list[i].y,
                                                map:QuestInfo.list[i].map,
                                                name:questData[self.quest].data[self.questStage].trigger.npcName,
                                                moveSpeed:5,
                                                info:{
                                                    randomWalk:'none',
                                                    canChangeMap:false,
                                                    shop:false,
                                                },
                                            });
                                            for(var j in Player.list){
                                                if(Player.list[j].map === self.map){
                                                    SOCKET_LIST[j].emit('initEntity',self.questDependent[questData[self.quest].data[self.questStage].trigger.npcId].getInitPack());
                                                }
                                            }
                                        }
                                    }
                                }
                                self.questStage = questData[self.quest].data[self.questStage].trigger.next;
                                self.questInfo.didQuest = false;
                                break;
                            case 'killAllMonsters':
                                if(self.questInfo.monstersKilled === self.questInfo.maxMonsters && self.questInfo.maxMonsters !== 0){
                                    self.questStage = questData[self.quest].data[self.questStage].trigger.next;
                                    self.questInfo.didQuest = false;
                                }
                                break;
                            case 'talkToNpc':
                                var id = questData[self.quest].data[self.questStage].trigger.npcId;
                                if(Npc.list[id]){
                                    if(Npc.list[id].map === self.map && self.mapChange > 20 && Npc.list[id].x - 64 < self.mouseX && Npc.list[id].x + 64 > self.mouseX && Npc.list[id].y - 64 < self.mouseY && Npc.list[id].y + 64 > self.mouseY && self.keyPress.second === true){
                                        self.keyPress.second = false;
                                        self.questStage = questData[self.quest].data[self.questStage].trigger.next;
                                        self.questInfo.didQuest = false;
                                    }
                                }
                                else if(self.questDependent[id]){
                                    if(self.questDependent[id].map === self.map && self.mapChange > 20 && self.questDependent[id].x - 64 < self.mouseX && self.questDependent[id].x + 64 > self.mouseX && self.questDependent[id].y - 64 < self.mouseY && self.questDependent[id].y + 64 > self.mouseY && self.keyPress.second === true){
                                        self.keyPress.second = false;
                                        self.questStage = questData[self.quest].data[self.questStage].trigger.next;
                                        self.questInfo.didQuest = false;
                                    }
                                }
                                break;
                            case 'wait1Second':
                                break;
                            case 'wait2Seconds':
                                break;
                            case 'wait20Seconds':
                                break;
                            case 'spawnCollision':
                                for(var i in QuestInfo.list){
                                    if(QuestInfo.list[i].quest === self.quest){
                                        if(QuestInfo.list[i].info === questData[self.quest].data[self.questStage].trigger.questInfo){
                                            var collision = Collision.list[QuestInfo.list[i].map][Math.floor((QuestInfo.list[i].x) / 64)][Math.floor((QuestInfo.list[i].y) / 64)];
                                            self.questDependent[i] = new Collision({
                                                x:QuestInfo.list[i].x - 64,
                                                y:QuestInfo.list[i].y - 64,
                                                map:QuestInfo.list[i].map,
                                                type:questData[self.quest].data[self.questStage].trigger.collisionType,
                                            });
                                            self.questDependent[i].oldCollision = collision;
                                            self.questDependent[i].oldCollision = collision;
                                            self.questDependent[i].tile_idx = questData[self.quest].data[self.questStage].trigger.tile_idx;
                                            self.questDependent[i].canvas = questData[self.quest].data[self.questStage].trigger.canvas;
                                            tiles.push({
                                                x:QuestInfo.list[i].x - 32,
                                                y:QuestInfo.list[i].y - 32,
                                                map:QuestInfo.list[i].map,
                                                tile_idx:questData[self.quest].data[self.questStage].trigger.tile_idx,
                                                canvas:questData[self.quest].data[self.questStage].trigger.canvas,
                                            });
                                            for(var j in SOCKET_LIST){
                                                SOCKET_LIST[j].emit('drawTile',{
                                                    x:QuestInfo.list[i].x - 32,
                                                    y:QuestInfo.list[i].y - 32,
                                                    map:QuestInfo.list[i].map,
                                                    tile_idx:questData[self.quest].data[self.questStage].trigger.tile_idx,
                                                    canvas:questData[self.quest].data[self.questStage].trigger.canvas,
                                                });
                                            }
                                            for(var j in Player.list){
                                                if(Player.list[j].map === self.map && Player.list[j].isColliding(self.questDependent[i])){
                                                    Player.list[j].teleport(ENV.Spawnpoint.x,ENV.Spawnpoint.y,ENV.Spawnpoint.map);
                                                }
                                            }
                                        }
                                    }
                                }
                                self.questStage = questData[self.quest].data[self.questStage].trigger.next;
                                self.questInfo.didQuest = false;
                                break;
                            case 'removeCollision':
                                for(var i in QuestInfo.list){
                                    if(QuestInfo.list[i].quest === self.quest){
                                        if(QuestInfo.list[i].info === questData[self.quest].data[self.questStage].trigger.questInfo){
                                            for(var j in self.questDependent){
                                                if(self.questDependent[j].type === 'Collision'){
                                                    if(self.questDependent[j].x === QuestInfo.list[i].x - 64 && self.questDependent[j].y === QuestInfo.list[i].y - 64 && self.questDependent[j].map === QuestInfo.list[i].map){
                                                        self.questDependent[j].toRemove = true;
                                                        Collision.list[self.questDependent[j].map][Math.round(self.questDependent[j].x / 64)][Math.round(self.questDependent[j].y / 64)] = self.questDependent[j].oldCollision;
                                                    }
                                                }
                                            }
                                            var newTiles = [];
                                            for(var j in tiles){
                                                if(tiles[j].x === QuestInfo.list[i].x - 32 && tiles[j].y === QuestInfo.list[i].y - 32 && tiles[j].map === QuestInfo.list[i].map && tiles[j].tile_idx === questData[self.quest].data[self.questStage].trigger.tile_idx && tiles[j].canvas === questData[self.quest].data[self.questStage].trigger.canvas){
                                                    newTiles.push(tiles[j]);
                                                }
                                            }
                                            tiles = newTiles;
                                            for(var j in SOCKET_LIST){
                                                SOCKET_LIST[j].emit('removeTile',{
                                                    x:QuestInfo.list[i].x - 32,
                                                    y:QuestInfo.list[i].y - 32,
                                                    map:QuestInfo.list[i].map,
                                                    tile_idx:questData[self.quest].data[self.questStage].trigger.tile_idx,
                                                    canvas:questData[self.quest].data[self.questStage].trigger.canvas,
                                                });
                                            }
                                        }
                                    }
                                }
                                self.questStage = questData[self.quest].data[self.questStage].trigger.next;
                                self.questInfo.didQuest = false;
                                break;
                            case 'teleportPlayer':
                                self.teleport(questData[self.quest].data[self.questStage].trigger.x,questData[self.quest].data[self.questStage].trigger.y,questData[self.quest].data[self.questStage].trigger.map);
                                self.questStage = questData[self.quest].data[self.questStage].trigger.next;
                                self.questInfo.didQuest = false;
                                break;
                            case 'teleportNpc':
                                Npc.list[questData[self.quest].data[self.questStage].trigger.npcId].teleport(questData[self.quest].data[self.questStage].trigger.x,questData[self.quest].data[self.questStage].trigger.y,questData[self.quest].data[self.questStage].trigger.map);
                                self.questStage = questData[self.quest].data[self.questStage].trigger.next;
                                self.questInfo.didQuest = false;
                                break;
                            case 'moveNpc':
                                self.questDependent[questData[self.quest].data[self.questStage].trigger.npcId].move(questData[self.quest].data[self.questStage].trigger.x,questData[self.quest].data[self.questStage].trigger.y);
                                self.questStage = questData[self.quest].data[self.questStage].trigger.next;
                                self.questInfo.didQuest = false;
                                break;
                            case 'resetPianoParts':
                                self.questInfo.pianoParts = 1;
                                self.questInfo.activators = {
                                    'activator1':false,
                                    'activator2':false,
                                    'activator3':false,
                                    'activator4':false,
                                }
                                self.questStage = questData[self.quest].data[self.questStage].trigger.next;
                                self.questInfo.didQuest = false;
                                break;
                            case 'searchForPianoParts':
                                var pianoPartGained = false;
                                for(var i in QuestInfo.list){
                                    if(QuestInfo.list[i].quest === self.quest && self.isColliding(QuestInfo.list[i])){
                                        for(var j in self.questInfo.activators){
                                            if(j === QuestInfo.list[i].info && self.questInfo.activators[j] === false){
                                                pianoPartGained = true;
                                                self.questInfo.activators[j] = true;
                                            }
                                        }
                                    }
                                }
                                if(pianoPartGained){
                                    self.questInfo.pianoParts += 1;
                                    self.sendNotification('' + self.questInfo.pianoParts + ' / 5 Piano Parts');
                                    self.startQuestObjective('Find the other ' + (5 - self.questInfo.pianoParts) + ' Piano Parts.');
                                    if(self.questInfo.pianoParts === 4){
                                        self.startQuestObjective('Find the last Piano Part.');
                                    }
                                    if(self.questInfo.pianoParts === 5){
                                        self.startQuestObjective('Return to Mia.');
                                        self.questStage = questData[self.quest].data[self.questStage].trigger.next;
                                        self.questInfo.didQuest = false;
                                    }
                                }
                                break;
                            default:
                                self.sendNotification('An error with ' + self.quest + ' has occurred. Please post this as a bug on Github.');
                                break;
                        }
                    }
                }
            }
        }

        if(self.keyPress.second === true){
            for(var i in Npc.list){
                if(Npc.list[i].map === self.map){
                    if(i === 'tutorialguard' && self.mapChange > 20 && Npc.list[i].x - 64 < self.mouseX && Npc.list[i].x + 64 > self.mouseX && Npc.list[i].y - 64 < self.mouseY && Npc.list[i].y + 64 > self.mouseY){
                        self.keyPress.second = false;
                        if(self.questStage === 7 && self.quest === 'Tutorial'){
                            self.questStage = 8;
                            self.startDialogue('You came just in time! The Monster King is sending Monsters to invade The Village! Use Left Click to attack and kill these Monsters!','*End conversation*');
                        }
                        else{
                            self.keyPress.second = true;
                        }
                    }
                    if(self.mapChange > 20 && Npc.list[i].x - 64 < self.mouseX && Npc.list[i].x + 64 > self.mouseX && Npc.list[i].y - 64 < self.mouseY && Npc.list[i].y + 64 > self.mouseY && self.invincible === false){
                        var response1 = undefined;
                        var response2 = undefined;
                        var response3 = undefined;
                        var response4 = undefined;
                        self.questInfo.response1 = undefined;
                        self.questInfo.response2 = undefined;
                        self.questInfo.response3 = undefined;
                        self.questInfo.response4 = undefined;
                        for(var j in questData){
                            if(questData[j].startNpc === i){
                                if(self.checkQuestRequirements(j)){
                                    if(self.quest === false){
                                        if(response1 === undefined){
                                            response1 = '*Start the quest ' + j + '*';
                                            self.questInfo.response1 = j;
                                        }
                                        else if(response2 === undefined){
                                            response2 = '*Start the quest ' + j + '*';
                                            self.questInfo.response2 = j;
                                        }
                                        else if(response3 === undefined){
                                            response3 = '*Start the quest ' + j + '*';
                                            self.questInfo.response3 = j;
                                        }
                                        else if(response4 === undefined){
                                            response4 = '*Start the quest ' + j + '*';
                                            self.questInfo.response4 = j;
                                        }
                                    }
                                    else{
                                        if(response1 === undefined){
                                            response1 = '<span style="color:#aaaaaa">*Start the quest ' + j + '*</span> <span style="font-size:13px; float:right; color:#aaaaaa">Finish the quest ' + self.quest + '.</span>';
                                            self.questInfo.response1 = 'None';
                                        }
                                        else if(response2 === undefined){
                                            response2 = '<span style="color:#aaaaaa">*Start the quest ' + j + '*</span> <span style="font-size:13px; float:right; color:#aaaaaa">Finish the quest ' + self.quest + '.</span>';
                                            self.questInfo.response2 = 'None';
                                        }
                                        else if(response3 === undefined){
                                            response3 = '<span style="color:#aaaaaa">*Start the quest ' + j + '*</span> <span style="font-size:13px; float:right; color:#aaaaaa">Finish the quest ' + self.quest + '.</span>';
                                            self.questInfo.response3 = 'None';
                                        }
                                        else if(response4 === undefined){
                                            response4 = '<span style="color:#aaaaaa">*Start the quest ' + j + '*</span> <span style="font-size:13px; float:right; color:#aaaaaa">Finish the quest ' + self.quest + '.</span>';
                                            self.questInfo.response4 = 'None';
                                        }
                                    }
                                }
                                else{
                                    var requirements = 'Requires ';
                                    for(var k in questData[j].requirements){
                                        if(self.questStats[questData[j].requirements[k]] === false){
                                            if(requirements === 'Requires '){
                                                requirements += questData[j].requirements[k];
                                            }
                                            else{
                                                requirements += ' and ' + questData[j].requirements[k];
                                            }
                                        }
                                        else if(questData[j].requirements[k].slice(0,4) === 'Lvl '){
                                            if(parseInt(questData[j].requirements[k].slice(4,questData[j].requirements[k].length),10) > self.level){
                                                if(requirements === 'Requires '){
                                                    requirements += 'Level ' + questData[j].requirements[k].slice(4,questData[j].requirements[k].length);
                                                }
                                                else{
                                                    requirements += ' and Level ' + questData[j].requirements[k].slice(4,questData[j].requirements[k].length);
                                                }
                                            }
                                        }
                                    }
                                    if(response1 === undefined){
                                        response1 = '<span style="color:#aaaaaa">*Start the quest ' + j + '*</span> <span style="font-size:13px; float:right; color:#aaaaaa">' + requirements + '.</span>';
                                        self.questInfo.response1 = 'None';
                                    }
                                    else if(response2 === undefined){
                                        response2 = '<span style="color:#aaaaaa">*Start the quest ' + j + '*</span> <span style="font-size:13px; float:right; color:#aaaaaa">' + requirements + '.</span>';
                                        self.questInfo.response2 = 'None';
                                    }
                                    else if(response3 === undefined){
                                        response3 = '<span style="color:#aaaaaa">*Start the quest ' + j + '*</span> <span style="font-size:13px; float:right; color:#aaaaaa">' + requirements + '.</span>';
                                        self.questInfo.response3 = 'None';
                                    }
                                    else if(response4 === undefined){
                                        response4 = '<span style="color:#aaaaaa">*Start the quest ' + j + '*</span> <span style="font-size:13px; float:right; color:#aaaaaa">' + requirements + '.</span>';
                                        self.questInfo.response4 = 'None';
                                    }
                                }
                            }
                        }
                        if(Npc.list[i].mainItem){
                            if(self.checkNpcRequirements(i)){
                                if(response1 === undefined){
                                    response1 = '*Buy ' + Npc.list[i].mainItem + '*';
                                    self.questInfo.response1 = Npc.list[i].mainItem;
                                }
                                else if(response2 === undefined){
                                    response2 = '*Buy ' + Npc.list[i].mainItem + '*';
                                    self.questInfo.response2 = Npc.list[i].mainItem;
                                }
                                else if(response3 === undefined){
                                    response3 = '*Buy ' + Npc.list[i].mainItem + '*';
                                    self.questInfo.response3 = Npc.list[i].mainItem;
                                }
                                else if(response4 === undefined){
                                    response4 = '*Buy ' + Npc.list[i].mainItem + '*';
                                    self.questInfo.response4 = Npc.list[i].mainItem;
                                }
                            }
                            else{
                                var requirements = 'Requires ';
                                for(var j in npcData[i].requirements){
                                    if(self.questStats[npcData[i].requirements[j]] === false){
                                        if(requirements === 'Requires '){
                                            requirements += npcData[i].requirements[j];
                                        }
                                        else{
                                            requirements += ' and ' + npcData[i].requirements[j];
                                        }
                                    }
                                    else if(npcData[i].requirements[j].slice(0,4) === 'Lvl '){
                                        if(parseInt(npcData[i].requirements[j].slice(4,npcData[i].requirements[j].length),10) > self.level){
                                            if(requirements === 'Requires '){
                                                requirements += 'Level ' + npcData[i].requirements[j].slice(4,npcData[i].requirements[j].length);
                                            }
                                            else{
                                                requirements += ' and Level ' + npcData[i].requirements[j].slice(4,npcData[i].requirements[j].length);
                                            }
                                        }
                                    }
                                }
                                if(response1 === undefined){
                                    response1 = '<span style="color:#aaaaaa">*Buy ' + Npc.list[i].mainItem + '*</span> <span style="font-size:13px; float:right; color:#aaaaaa">' + requirements + '.</span>';
                                    self.questInfo.response1 = 'None';
                                }
                                else if(response2 === undefined){
                                    response2 = '<span style="color:#aaaaaa">*Buy ' + Npc.list[i].mainItem + '*</span> <span style="font-size:13px; float:right; color:#aaaaaa">' + requirements + '.</span>';
                                    self.questInfo.response2 = 'None';
                                }
                                else if(response3 === undefined){
                                    response3 = '<span style="color:#aaaaaa">*Buy ' + Npc.list[i].mainItem + '*</span> <span style="font-size:13px; float:right; color:#aaaaaa">' + requirements + '.</span>';
                                    self.questInfo.response3 = 'None';
                                }
                                else if(response4 === undefined){
                                    response4 = '<span style="color:#aaaaaa">*Buy ' + Npc.list[i].mainItem + '*</span> <span style="font-size:13px; float:right; color:#aaaaaa">' + requirements + '.</span>';
                                    self.questInfo.response4 = 'None';
                                }
                            }
                        }
                        if(Npc.list[i].mainCraft){
                            if(self.checkNpcRequirements(i)){
                                if(response1 === undefined){
                                    response1 = '*Craft ' + Npc.list[i].mainCraft + '*';
                                    self.questInfo.response1 = Npc.list[i].mainCraft;
                                }
                                else if(response2 === undefined){
                                    response2 = '*Craft ' + Npc.list[i].mainCraft + '*';
                                    self.questInfo.response2 = Npc.list[i].mainCraft;
                                }
                                else if(response3 === undefined){
                                    response3 = '*Craft ' + Npc.list[i].mainCraft + '*';
                                    self.questInfo.response3 = Npc.list[i].mainCraft;
                                }
                                else if(response4 === undefined){
                                    response4 = '*Craft ' + Npc.list[i].mainCraft + '*';
                                    self.questInfo.response4 = Npc.list[i].mainCraft;
                                }
                            }
                            else{
                                var requirements = 'Requires ';
                                for(var j in npcData[i].requirements){
                                    if(self.questStats[npcData[i].requirements[j]] === false){
                                        if(requirements === 'Requires '){
                                            requirements += npcData[i].requirements[j];
                                        }
                                        else{
                                            requirements += ' and ' + npcData[i].requirements[j];
                                        }
                                    }
                                    else if(npcData[i].requirements[j].slice(0,4) === 'Lvl '){
                                        if(parseInt(npcData[i].requirements[j].slice(4,npcData[i].requirements[j].length),10) > self.level){
                                            if(requirements === 'Requires '){
                                                requirements += 'Level ' + npcData[i].requirements[j].slice(4,npcData[i].requirements[j].length);
                                            }
                                            else{
                                                requirements += ' and Level ' + npcData[i].requirements[j].slice(4,npcData[i].requirements[j].length);
                                            }
                                        }
                                    }
                                }
                                if(response1 === undefined){
                                    response1 = '<span style="color:#aaaaaa">*Craft ' + Npc.list[i].mainCraft + '*</span> <span style="font-size:13px; float:right; color:#aaaaaa">' + requirements + '.</span>';
                                    self.questInfo.response1 = 'None';
                                }
                                else if(response2 === undefined){
                                    response2 = '<span style="color:#aaaaaa">*Craft ' + Npc.list[i].mainCraft + '*</span> <span style="font-size:13px; float:right; color:#aaaaaa">' + requirements + '.</span>';
                                    self.questInfo.response2 = 'None';
                                }
                                else if(response3 === undefined){
                                    response3 = '<span style="color:#aaaaaa">*Craft ' + Npc.list[i].mainCraft + '*</span> <span style="font-size:13px; float:right; color:#aaaaaa">' + requirements + '.</span>';
                                    self.questInfo.response3 = 'None';
                                }
                                else if(response4 === undefined){
                                    response4 = '<span style="color:#aaaaaa">*Craft ' + Npc.list[i].mainCraft + '*</span> <span style="font-size:13px; float:right; color:#aaaaaa">' + requirements + '.</span>';
                                    self.questInfo.response4 = 'None';
                                }
                            }
                        }
                        if(i === 'petmaster'){
                            if(response1 === undefined){
                                response1 = '*Upgrade your Pet*';
                                self.questInfo.response1 = 'Pet Upgrade';
                            }
                            else if(response2 === undefined){
                                response2 = '*Upgrade your Pet*';
                                self.questInfo.response2 = 'Pet Upgrade';
                            }
                            else if(response3 === undefined){
                                response3 = '*Upgrade your Pet*';
                                self.questInfo.response3 = 'Pet Upgrade';
                            }
                            else if(response4 === undefined){
                                response4 = '*Upgrade your Pet*';
                                self.questInfo.response4 = 'Pet Upgrade';
                            }
                        }
                        if(response1 === undefined){
                            response1 = '*End conversation*';
                            self.questInfo.response1 = 'End';
                        }
                        else if(response2 === undefined){
                            response2 = '*End conversation*';
                            self.questInfo.response2 = 'End';
                        }
                        else if(response3 === undefined){
                            response3 = '*End conversation*';
                            self.questInfo.response3 = 'End';
                        }
                        else if(response4 === undefined){
                            response4 = '*End conversation*';
                            self.questInfo.response4 = 'End';
                        }
                        if(Npc.list[i].dialogues !== undefined){
                            var dialogue = Math.floor(Math.random() * Npc.list[i].dialogues.length);
                            self.startDialogue(Npc.list[i].dialogues[dialogue],response1,response2,response3,response4);
                        }
                        else{
                            self.startDialogue('',response1,response2,response3,response4);
                        }
                        self.keyPress.second = false;
                    }
                }
            }
        }
        if(self.currentResponse !== 0){
            var response = 'response' + self.currentResponse;
            for(var i in questData){
                if(i === self.questInfo[response]){
                    self.endDialogue();
                    socket.emit('questInfo',{
                        questName:i,
                    });
                }
            }
            for(var i in Npc.list){
                if(Npc.list[i].mainItem){
                    if(Npc.list[i].mainItem === self.questInfo[response]){
                        self.endDialogue();
                        self.inventory.shopItems = {items:Npc.list[i].shop,prices:Npc.list[i].shopPrices};
                        socket.emit('openShop',{name:Npc.list[i].name,quote:Npc.list[i].quote,inventory:{items:Npc.list[i].shop,prices:Npc.list[i].shopPrices}});
                    }
                }
                if(Npc.list[i].mainCraft){
                    if(Npc.list[i].mainCraft === self.questInfo[response]){
                        self.endDialogue();
                        self.inventory.craftItems = Npc.list[i].crafts;
                        socket.emit('openCraft',{name:Npc.list[i].name,quote:Npc.list[i].quote,crafts:Npc.list[i].crafts});
                    }
                }
            }
            if(self.questInfo[response] === 'End'){
                self.endDialogue();
            }
            if(self.questInfo[response] === 'Pet Upgrade'){
                self.questInfo.petUpgrade = true;
                self.questInfo.questStage = 1;
            }
            if(self.questInfo[response] !== 'None'){
                self.questInfo.response1 = undefined;
                self.questInfo.response2 = undefined;
                self.questInfo.response3 = undefined;
                self.questInfo.response4 = undefined;
            }
        }

        if(self.questStage === 1 && self.quest === 'Tutorial'){
            self.questStage = 2;
            self.startDialogue('Use WASD or Arrow keys to move. Press [I] to open your inventory and equip a weapon.','...');
            self.startQuestObjective('Equip a weapon from your inventory.');
        }
        if(self.currentResponse === 1 && self.questStage === 2 && self.quest === 'Tutorial'){
            self.questStage = 3;
            self.endDialogue();
        }
        if(self.questStage === 3 && self.quest === 'Tutorial'){
            if(self.inventory.equips.weapon.id){
                self.questStage = 4;
                self.startQuestObjective('Walk towards the guard.');
            }
        }
        if(self.questStage === 3 && self.quest === 'Tutorial' && self.mapChange > 10){
            for(var i in QuestInfo.list){
                if(QuestInfo.list[i].quest === self.quest && QuestInfo.list[i].info === 'activator1' && self.isColliding(QuestInfo.list[i])){
                    self.questStage = 10;
                }
            }
        }
        if(self.questStage === 4 && self.quest === 'Tutorial' && self.mapChange > 10){
            for(var i in QuestInfo.list){
                if(QuestInfo.list[i].quest === self.quest && QuestInfo.list[i].info === 'activator1' && self.isColliding(QuestInfo.list[i])){
                    self.questStage = 5;
                }
            }
        }
        if(self.questStage === 5 && self.quest === 'Tutorial'){
            self.questStage = 6;
            self.startDialogue('Right Click to talk to the guard.','...');
            self.startQuestObjective('Talk to the guard.');
        }
        if(self.currentResponse === 1 && self.questStage === 6 && self.quest === 'Tutorial'){
            self.questStage = 7;
            self.endDialogue();
        }
        if(self.questStage === 10 && self.quest === 'Tutorial'){
            self.questStage = 2;
            self.move(864,1600);
            self.startDialogue('Make sure you have a weapon equipped. You can open your inventory by pressing [I].','...');
        }
        if(self.questStage === 7 && self.quest === 'Tutorial'){
            for(var i in QuestInfo.list){
                if(QuestInfo.list[i].quest === self.quest && QuestInfo.list[i].info === 'collision' && self.isColliding(QuestInfo.list[i])){
                    self.move(1502,1502);
                    self.invincible = true;
                    socket.emit('dialogueLine',{
                        state:'ask',
                        message:'Talk to the guard first.',
                        response1:'...',
                    });
                    self.questStage = 6;
                }
            }
        }
        if(self.currentResponse === 1 && self.questStage === 8 && self.quest === 'Tutorial'){
            setTimeout(function(){
                self.questStage = 9;
            },500);
            self.endDialogue();
        }
        if(self.questStage === 9 && self.quest === 'Tutorial'){
            self.questStage = 11;
            self.startDialogue('The Monsters are here! Quick, kill them!','*End conversation*');
            self.startQuestObjective('Kill the Birds.');
        }
        if(self.currentResponse === 1 && self.questStage === 11 && self.quest === 'Tutorial' && self.mapChange > 10){
            self.questStage = 12;
            self.endDialogue();
            self.questInfo.monstersKilled = 0;
            self.questInfo.maxMonsters = 0;
            for(var i in QuestInfo.list){
                if(QuestInfo.list[i].quest === self.quest && QuestInfo.list[i].info === 'spawner'){
                    self.spawnQuestMonster(i,QuestInfo.list[i].x,QuestInfo.list[i].y,QuestInfo.list[i].map,'greenBird');
                }
                if(QuestInfo.list[i].quest === self.quest && QuestInfo.list[i].info === 'spawner2'){
                    self.spawnQuestMonster(i,QuestInfo.list[i].x,QuestInfo.list[i].y,QuestInfo.list[i].map,'blueBird');
                }
            }
        }
        if(self.questStage === 12 && self.quest === 'Tutorial' && self.mapChange > 10){
            for(var i in QuestInfo.list){
                if(QuestInfo.list[i].quest === self.quest && QuestInfo.list[i].info === 'activator2' && self.isColliding(QuestInfo.list[i])){
                    for(var i in QuestInfo.list){
                        if(QuestInfo.list[i].quest === self.quest && QuestInfo.list[i].info === 'collision'){
                            self.questDependent[i] = new Collision({
                                x:QuestInfo.list[i].x - 64,
                                y:QuestInfo.list[i].y - 64,
                                map:QuestInfo.list[i].map,
                                type:1,
                            });
                            tiles.push({
                                x:QuestInfo.list[i].x - 32,
                                y:QuestInfo.list[i].y - 32,
                                map:QuestInfo.list[i].map,
                                tile_idx:2030,
                                canvas:'lower',
                                parent:self.id,
                            });
                            for(var j in SOCKET_LIST){
                                SOCKET_LIST[j].emit('drawTile',{
                                    x:QuestInfo.list[i].x - 32,
                                    y:QuestInfo.list[i].y - 32,
                                    map:QuestInfo.list[i].map,
                                    tile_idx:2030,
                                    canvas:'lower',
                                });
                            }
                            for(var j in Player.list){
                                if(Player.list[j].map === self.map && Player.list[j].isColliding(self.questDependent[i])){
                                    Player.list[j].teleport(352,1600,'The Tutorial');
                                }
                            }
                        }
                    }
                    self.questStage = 13;
                }
            }
        }
        if(self.questStage === 13 && self.quest === 'Tutorial' && self.questInfo.monstersKilled === self.questInfo.maxMonsters){
            self.questStage = 14;
            self.startDialogue('Good Job! Now walk into the blue transporter to head to The Village! Once you are there, you will be able to interact with other players to save The Village!','Thanks!');
            self.startQuestObjective('Walk to the blue transporter.');
            for(var i in SOCKET_LIST){
                SOCKET_LIST[i].emit('removeSameTiles',{
                    map:self.map,
                    tile_idx:2030,
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
                if(self.questDependent[i].type === 'Collision'){
                    self.questDependent[i].toRemove = true;
                    Collision.list[self.questDependent[i].map][Math.round(self.questDependent[i].x / 64)][Math.round(self.questDependent[i].y / 64)] = 0;
                }
            }
        }
        if(self.currentResponse === 1 && self.questStage === 14 && self.quest === 'Tutorial'){
            self.questStage = 15;
            self.endDialogue();
        }
        if(self.questStage === 15 && self.quest === 'Tutorial' && self.map === 'The Village'){
            self.xp += Math.round(500 * self.stats.xp);
            self.sendNotification('You completed the quest ' + self.quest + '.');
            addToChat('style="color: ' + self.textColor + '">',self.displayName + " completed the quest " + self.quest + ".");
            self.questStats[self.quest] = true;
            self.quest = false;
            self.questInfo = {};
            for(var i in self.questDependent){
                self.questDependent[i].toRemove = true;
            }
            self.endDialogue();
            self.endQuestObjective();
        }

        if(self.questInfo.questStage === 1 && self.questInfo.petUpgrade === true){
            self.questInfo.questStage = 2;
            var message = 'Your current pet is a ' + self.petType + '. Please choose a pet to change it into.';
            var response1 = undefined;
            var response2 = undefined;
            var response3 = undefined;
            var response4 = 'Keep my ' + self.petType + '.';
            if(self.petType !== 'Kiol'){
                if(response1 === undefined){
                    response1 = 'Change it into a Kiol for free.';
                }
                else if(response2 === undefined){
                    response2 = 'Change it into a Kiol for free.';
                }
                else if(response3 === undefined){
                    response3 = 'Change it into a Kiol for free.';
                }
            }
            if(self.petType !== 'Cherrier'){
                if(self.questStats['Cherrier']){
                    if(response1 === undefined){
                        response1 = 'Change it into a Cherrier for free.';
                    }
                    else if(response2 === undefined){
                        response2 = 'Change it into a Cherrier for free.';
                    }
                    else if(response3 === undefined){
                        response3 = 'Change it into a Cherrier for free.';
                    }
                }
                else{
                    if(response1 === undefined){
                        response1 = 'Change it into a Cherrier for 25 rubies.';
                    }
                    else if(response2 === undefined){
                        response2 = 'Change it into a Cherrier for 25 rubies.';
                    }
                    else if(response3 === undefined){
                        response3 = 'Change it into a Cherrier for 25 rubies.';
                    }
                }
            }
            if(self.petType !== 'Sphere'){
                if(self.questStats['Sphere']){
                    if(response1 === undefined){
                        response1 = 'Change it into a Sphere for free.';
                    }
                    else if(response2 === undefined){
                        response2 = 'Change it into a Sphere for free.';
                    }
                    else if(response3 === undefined){
                        response3 = 'Change it into a Sphere for free.';
                    }
                }
                else{
                    if(response1 === undefined){
                        response1 = 'Change it into a Sphere for 200 rubies.';
                    }
                    else if(response2 === undefined){
                        response2 = 'Change it into a Sphere for 200 rubies.';
                    }
                    else if(response3 === undefined){
                        response3 = 'Change it into a Sphere for 200 rubies.';
                    }
                }
            }
            if(self.petType !== 'Thunderbird'){
                if(self.questStats['Thunderbird']){
                    if(response1 === undefined){
                        response1 = 'Change it into a Thunderbird for free.';
                    }
                    else if(response2 === undefined){
                        response2 = 'Change it into a Thunderbird for free.';
                    }
                    else if(response3 === undefined){
                        response3 = 'Change it into a Thunderbird for free.';
                    }
                }
                else{
                    if(response1 === undefined){
                        response1 = 'Change it into a Thunderbird for 500 rubies.';
                    }
                    else if(response2 === undefined){
                        response2 = 'Change it into a Thunderbird for 500 rubies.';
                    }
                    else if(response3 === undefined){
                        response3 = 'Change it into a Thunderbird for 500 rubies.';
                    }
                }
            }
            self.startDialogue(message,response1,response2,response3,response4);
        }
        if(self.currentResponse === 1 && self.questInfo.questStage === 2 && self.questInfo.petUpgrade === true){
            self.endDialogue();
            self.endQuest();
            if(self.petType === 'Kiol'){
                if(self.questStats['Cherrier']){
                    self.petType = 'Cherrier';
                    self.spawnPet();
                    self.sendNotification('You changed your pet into a Cherrier.');
                }
                else if(self.inventory.hasItem('ruby',25)){
                    self.inventory.removeItem('ruby',25);
                    self.petType = 'Cherrier';
                    self.spawnPet();
                    self.sendNotification('You used 25 rubies to change your pet into a Cherrier.');
                    self.questStats['Cherrier'] = true;
                }
                else{
                    self.sendNotification('[!] You do not have enough rubies to change your pet into a Cherrier.');
                }
            }
            else if(self.petType === 'Cherrier'){
                self.petType = 'Kiol';
                self.spawnPet();
            }
            else if(self.petType === 'Sphere'){
                self.petType = 'Kiol';
                self.spawnPet();
            }
            else if(self.petType === 'Thunderbird'){
                self.petType = 'Kiol';
                self.spawnPet();
            }
            else{
                self.petType = 'Kiol';
                self.spawnPet();
            }
        }
        if(self.currentResponse === 2 && self.questInfo.questStage === 2 && self.questInfo.petUpgrade === true){
            self.questInfo = {};
            self.endDialogue();
            if(self.petType === 'Kiol'){
                if(self.questStats['Sphere']){
                    self.petType = 'Sphere';
                    self.spawnPet();
                    self.sendNotification('You changed your pet into a Sphere.');
                }
                else if(self.inventory.hasItem('ruby',200)){
                    self.inventory.removeItem('ruby',200);
                    self.petType = 'Sphere';
                    self.spawnPet();
                    self.sendNotification('You used 200 rubies to change your pet into a Sphere.');
                    self.questStats['Sphere'] = true;
                }
                else{
                    self.sendNotification('[!] You do not have enough rubies to change your pet into a Sphere.');
                }
            }
            else if(self.petType === 'Cherrier'){
                if(self.questStats['Sphere']){
                    self.petType = 'Sphere';
                    self.spawnPet();
                    self.sendNotification('You changed your pet into a Sphere.');
                }
                else if(self.inventory.hasItem('ruby',200)){
                    self.inventory.removeItem('ruby',200);
                    self.petType = 'Sphere';
                    self.spawnPet();
                    self.sendNotification('You used 200 rubies to change your pet into a Sphere.');
                    self.questStats['Sphere'] = true;
                }
                else{
                    self.sendNotification('[!] You do not have enough rubies to change your pet into a Sphere.');
                }
            }
            else if(self.petType === 'Sphere'){
                if(self.questStats['Cherrier']){
                    self.petType = 'Cherrier';
                    self.spawnPet();
                    self.sendNotification('You changed your pet into a Cherrier.');
                }
                else if(self.inventory.hasItem('ruby',25)){
                    self.inventory.removeItem('ruby',25);
                    self.petType = 'Cherrier';
                    self.spawnPet();
                    self.sendNotification('You used 25 rubies to change your pet into a Cherrier.');
                    self.questStats['Cherrier'] = true;
                }
                else{
                    self.sendNotification('[!] You do not have enough rubies to change your pet into a Cherrier.');
                }
            }
            else if(self.petType === 'Thunderbird'){
                if(self.questStats['Cherrier']){
                    self.petType = 'Cherrier';
                    self.spawnPet();
                    self.sendNotification('You changed your pet into a Cherrier.');
                }
                else if(self.inventory.hasItem('ruby',25)){
                    self.inventory.removeItem('ruby',25);
                    self.petType = 'Cherrier';
                    self.spawnPet();
                    self.sendNotification('You used 25 rubies to change your pet into a Cherrier.');
                    self.questStats['Cherrier'] = true;
                }
                else{
                    self.sendNotification('[!] You do not have enough rubies to change your pet into a Cherrier.');
                }
            }
            else{
                self.petType = 'Kiol';
                self.spawnPet();
            }
        }
        if(self.currentResponse === 3 && self.questInfo.questStage === 2 && self.questInfo.petUpgrade === true){
            self.questInfo = {};
            self.endDialogue();
            if(self.petType === 'Kiol'){
                if(self.questStats['Thunderbird']){
                    self.petType = 'Thunderbird';
                    self.spawnPet();
                    self.sendNotification('You changed your pet into a Thunderbird.');
                }
                else if(self.inventory.hasItem('ruby',500)){
                    self.inventory.removeItem('ruby',500);
                    self.petType = 'Thunderbird';
                    self.spawnPet();
                    self.sendNotification('You used 500 rubies to change your pet into a Thunderbird.');
                    self.questStats['Thunderbird'] = true;
                }
                else{
                    self.sendNotification('[!] You do not have enough rubies to change your pet into a Thunderbird.');
                }
            }
            else if(self.petType === 'Cherrier'){
                if(self.questStats['Thunderbird']){
                    self.petType = 'Thunderbird';
                    self.spawnPet();
                    self.sendNotification('You changed your pet into a Thunderbird.');
                }
                else if(self.inventory.hasItem('ruby',500)){
                    self.inventory.removeItem('ruby',500);
                    self.petType = 'Thunderbird';
                    self.spawnPet();
                    self.sendNotification('You used 500 rubies to change your pet into a Thunderbird.');
                    self.questStats['Thunderbird'] = true;
                }
                else{
                    self.sendNotification('[!] You do not have enough rubies to change your pet into a Thunderbird.');
                }
            }
            else if(self.petType === 'Sphere'){
                if(self.questStats['Thunderbird']){
                    self.petType = 'Thunderbird';
                    self.spawnPet();
                    self.sendNotification('You changed your pet into a Thunderbird.');
                }
                else if(self.inventory.hasItem('ruby',500)){
                    self.inventory.removeItem('ruby',500);
                    self.petType = 'Thunderbird';
                    self.spawnPet();
                    self.sendNotification('You used 500 rubies to change your pet into a Thunderbird.');
                    self.questStats['Thunderbird'] = true;
                }
                else{
                    self.sendNotification('[!] You do not have enough rubies to change your pet into a Thunderbird.');
                }
            }
            else if(self.petType === 'Thunderbird'){
                if(self.questStats['Sphere']){
                    self.petType = 'Sphere';
                    self.spawnPet();
                    self.sendNotification('You changed your pet into a Sphere.');
                }
                else if(self.inventory.hasItem('ruby',200)){
                    self.inventory.removeItem('ruby',200);
                    self.petType = 'Sphere';
                    self.spawnPet();
                    self.sendNotification('You used 200 rubies to change your pet into a Sphere.');
                    self.questStats['Sphere'] = true;
                }
                else{
                    self.sendNotification('[!] You do not have enough rubies to change your pet into a Sphere.');
                }
            }
            else{
                self.petType = 'Kiol';
                self.spawnPet();
            }
        }
        if(self.currentResponse === 4 && self.questInfo.questStage === 2 && self.questInfo.petUpgrade === true){
            self.questInfo = {};
            self.endDialogue();
        }
    }
    self.updateStats = function(){
        if(self.inventory.refresh){
            self.inventory.refresh = false;
            self.stats = {
                attack:0,
                defense:0,
                heal:1,
                xp:1,
                luck:1,
                range:1,
                speed:1,
                critChance:0,
                damageType:'',
                damageReduction:0,
                knockback:0.3,
                debuffs:[],
                aggro:1,
            }
            var maxSlots = self.inventory.maxSlots;
            self.inventory.maxSlots = 30;
            self.passive = '';
            self.offhandPassive = '';
            self.textColor = '#ffff00';
            self.hpMax = hpLevels[self.level];
            self.attackCost = 10;
            self.secondCost = 40;
            self.healCost = 50;
            self.manaRegen = 1;
            self.manaMax = 200;
            self.displayName = self.username;
            self.ability = {
                ability:'base',
                attackPattern:[0],
                secondPattern:[0],
                healPattern:[0,20,40,60],
            }
            self.maxSpeed = 20 + Math.floor(self.level / 10);
            self.pushPower = 3;
            self.pushResist = 0;
            self.immuneDebuffs = [];
            damageIncrease = 1;
            self.useTime = 0;
            self.passiveUsetime = 10;
            self.offhandPassiveUsetime = 10;
            for(var i in self.inventory.equips){
                if(self.inventory.equips[i].id !== undefined){
                    if(i !== 'weapon2'){
                        var item = Item.list[self.inventory.equips[i].id];
                        if(item.damageType){
                            self.stats.damageType = item.damageType;
                            self.ability.ability = self.inventory.equips[i].id;
                        }
                        if(item.manaCost){
                            self.attackCost = item.manaCost;
                        }
                    }
                }
            }
            for(var i in self.inventory.equips){
                if(self.inventory.equips[i].id !== undefined){
                    if(i !== 'weapon2'){
                        var item = Item.list[self.inventory.equips[i].id];
                        if(item.damage){
                            self.stats.attack += item.damage;
                        }
                        if(item.critChance !== undefined){
                            self.stats.critChance += item.critChance;
                        }
                        if(item.defense !== undefined){
                            self.stats.defense += item.defense;
                        }
                        if(item.damageReduction){
                            self.stats.damageReduction += item.damageReduction;
                        }
                        if(item.knockback !== undefined){
                            self.stats.knockback = item.knockback;
                        }
                        if(item.useTime){
                            self.useTime += item.useTime;
                        }
                        try{
                            eval(item.event);
                            for(var j in self.inventory.equips[i].enchantments){
                                var enchantment = Enchantment.list[self.inventory.equips[i].enchantments[j].id];
                                var value = self.inventory.equips[i].enchantments[j].level;
                                eval(enchantment.event);
                            }
                        }
                        catch(err){
                            console.log(err);
                        }
                    }
                }
            }
            if(self.inventory.equips['weapon'].id){
                self.currentItem = self.inventory.equips['weapon'].id;
            }
            else{
                self.currentItem = '';
            }
            self.stats.attack = Math.round(self.stats.attack * damageIncrease);
            self.stats.heal *= Math.sqrt(Math.sqrt(self.hpMax));
            self.hpMax = Math.round(self.hpMax);
            if(self.inventory.spawn === true){
                self.inventory.spawn = false;
                self.hp = self.hpMax;
            }
            if(self.username === 'Unknown'){
                self.textColor = '#000000';
            }
            self.oldStats = JSON.parse(JSON.stringify(self.stats));
            self.oldMaxSpeed = self.maxSpeed;
            self.oldHpMax = self.hpMax;
            self.oldManaRegen = self.manaRegen;
            self.oldManaMax = self.manaMax;
            if(maxSlots !== self.inventory.maxSlots){
                self.inventory.refreshMenu();
                for(var i = 0;i < self.inventory.items.length;i++){
                    if(self.inventory.items[i] === null){
                        self.inventory.items[i] = {};
                    }
                    if(i >= self.inventory.maxSlots){
                        if(self.inventory.items[i].id){
                            new DroppedItem({
                                id:self.id,
                                item:self.inventory.items[i],
                                amount:self.inventory.items[i].stack,
                                x:self.x,
                                y:self.y,
                                map:self.map,
                                leftPlayer:false,
                                allPlayers:false,
                            });
                        }
                        self.inventory.items.splice(i,1);
                        i -= 1;
                    }
                }
            }
        }
    }
    self.updateMap = function(){
        if(self.mapChange === 0){
            self.canMove = false;
            socket.emit('changeMap',self.transporter);
            for(var i = 0;i < 25;i++){
                var particle = new Particle({
                    x:self.x + Math.random() * self.width - self.width / 2,
                    y:self.y + Math.random() * self.height - self.height / 2,
                    map:self.map,
                    particleType:'teleport',
                });
            }
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
            if(Pet.list[self.pet]){
                Pet.list[self.pet].mapWidth = self.transporter.mapx;
                Pet.list[self.pet].mapHeight = self.transporter.mapy;
            }
            playerMap[self.map] += 1;
            if(map !== self.map){
                for(var i in Spawner.list){
                    if(Spawner.list[i].map === self.map && Spawner.list[i].spawned === false){
                        spawnMonster(Spawner.list[i],i);
                    }
                }
                if(ENV.DisplayMapChanges){
                    addToChat('style="color: ' + self.textColor + '">',self.displayName + " went to map " + self.map + ".");
                }
                socket.emit('closeShop');
                socket.emit('closeCraft');
            }
            Player.getAllInitPack(socket);
            for(var i in Player.list){
                if(Player.list[i]){
                    SOCKET_LIST[i].emit('initEntity',self.getInitPack());
                }
            }
            for(var i = 0;i < 25;i++){
                var particle = new Particle({
                    x:self.x + Math.random() * self.width - self.width / 2,
                    y:self.y + Math.random() * self.height - self.height / 2,
                    map:self.map,
                    particleType:'teleport',
                });
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
            self.hpMax = hpLevels[self.level];
            self.oldHpMax = hpLevels[self.level];
            addToChat('style="color: #00ff00">',self.displayName + ' is now level ' + self.level + '.');
            self.spawnPet();
            self.inventory.refresh = true;
        }
    }
    self.doPassive = function(){
        if(self.passiveCooldown <= 0){
            self.passiveCooldown = self.passiveUsetime;
            if(self.passive === 'homingFire'){
                self.shootProjectile(self.id,'Player',self.direction,self.direction,'fireBullet',0,function(t){return 25},0,self.stats,'monsterHoming');
            }
            if(self.passive === 'lightningShards'){
                var closestMonster = undefined;
                for(var i in Monster.list){
                    if(closestMonster === undefined){
                        closestMonster = Monster.list[i];
                    }
                    else if(self.getDistance(Monster.list[i]) < self.getDistance(closestMonster)){
                        closestMonster = Monster.list[i];
                    }
                }
                if(closestMonster){
                    for(var i = 0;i < 4;i++){
                        var projectileWidth = 0;
                        var projectileHeight = 0;
                        var projectileStats = {};
                        for(var j in projectileData){
                            if(j === 'lightningSpit'){
                                projectileWidth = projectileData[j].width;
                                projectileHeight = projectileData[j].height;
                                projectileStats = Object.create(projectileData[j].stats);
                            }
                        }
                        for(var j in projectileStats){
                            projectileStats[j] *= self.stats[j];
                        }
                        projectileStats.damageReduction = 0;
                        projectileStats.debuffs = self.stats.debuffs;
                        var projectile = Projectile({
                            id:self.id,
                            projectileType:'lightningSpit',
                            angle:i * 90,
                            direction:i * 90,
                            x:closestMonster.x - Math.cos(i / 2 * Math.PI) * 256,
                            y:closestMonster.y - Math.sin(i / 2 * Math.PI) * 256,
                            map:self.map,
                            parentType:'Player',
                            mapWidth:self.mapWidth,
                            mapHeight:self.mapHeight,
                            width:projectileWidth,
                            height:projectileHeight,
                            spin:function(t){return 0},
                            pierce:0,
                            stats:projectileStats,
                            projectilePattern:'lightningStrike',
                            onCollision:function(self,pt){
                                if(self.pierce === 0){
                                    self.toRemove = true;
                                }
                                else{
                                    self.pierce -= 1;
                                }
                            }
                        });
                    }
                }
            }
            if(self.passive === 'emeraldite'){
                self.shootProjectile(self.id,'Player',self.direction,self.direction,'seed',32,function(t){return 0},0,self.stats,'playerSeed');
                self.shootProjectile(self.id,'Player',self.direction + 120,self.direction + 120,'seed',32,function(t){return 0},0,self.stats,'playerSeed');
                self.shootProjectile(self.id,'Player',self.direction + 240,self.direction + 240,'seed',32,function(t){return 0},0,self.stats,'playerSeed');
            }
            if(self.passive === 'whirlwind'){
                self.shootProjectile(self.id,'Player',self.direction + 180,self.direction + 180,'waterBullet',32,function(t){return 25},0,self.stats,'playerSeed');
            }
            if(self.passive === 'firespirit'){
                self.shootProjectile(self.id,'Player',self.direction,self.direction,'fireBullet',32,function(t){return 25},0,self.stats,'playerSoul');
                self.shootProjectile(self.id,'Player',self.direction + 120,self.direction + 120,'fireBullet',32,function(t){return 25},0,self.stats,'playerSoul');
                self.shootProjectile(self.id,'Player',self.direction + 240,self.direction + 240,'fireBullet',32,function(t){return 25},0,self.stats,'playerSoul');
            }
            if(self.passive === 'crab'){
                var range = self.stats.range;
                var speed = self.stats.speed;
                self.stats.range = 10;
                self.stats.speed = 2;
                self.shootProjectile(self.id,'Player',self.direction,self.direction,'crabBullet',16,function(t){return 25},0,self.stats,'spinAroundPoint');
                self.shootProjectile(self.id,'Player',self.direction + 180,self.direction + 180,'crabBullet',16,function(t){return 25},0,self.stats,'spinAroundPoint');
                self.stats.range = range;
                self.stats.speed = speed;
            }
        }
        if(self.offhandPassive === 'spirit'){
            self.shootProjectile(self.id,'Player',self.direction,self.direction,'soul',32,function(t){return 25},0,self.stats,'playerSoul');
            self.shootProjectile(self.id,'Player',self.direction + 120,self.direction + 120,'soul',32,function(t){return 25},0,self.stats,'playerSoul');
            self.shootProjectile(self.id,'Player',self.direction + 240,self.direction + 240,'soul',32,function(t){return 25},0,self.stats,'playerSoul');
        }
        if(self.offhandPassive === 'lightning'){
            for(var i = 0;i < 15;i++){
                self.shootProjectile(self.id,'Player',self.direction,self.direction,'lightningSpit',32 + 32 * i,function(t){return 0},30,self.stats,'playerSplaser');
            }
        }
        if(self.offhandPassive === 'explode'){
            var speed = self.stats.speed;
            self.stats.speed = 0;
            var projectileWidth = 0;
            var projectileHeight = 0;
            for(var i in projectileData){
                if(i === 'fireBullet'){
                    projectileWidth = projectileData[i].width;
                    projectileHeight = projectileData[i].height;
                    projectileStats = Object.create(projectileData[i].stats);
                }
            }
            for(var i in projectileStats){
                projectileStats[i] *= self.stats[i];
            }
            projectileStats.damageReduction = 0;
            projectileStats.debuffs = self.stats.debuffs;
            var projectile = Projectile({
                id:self.id,
                projectileType:'fireBullet',
                angle:0,
                direction:0,
                x:self.mouseX,
                y:self.mouseY,
                map:self.map,
                parentType:self.type,
                mapWidth:self.mapWidth,
                mapHeight:self.mapHeight,
                width:projectileWidth,
                height:projectileHeight,
                spin:function(t){return 25},
                pierce:0,
                projectilePattern:'stationary',
                stats:projectileStats,
                onCollision:function(self,pt){
                    for(var i = 0;i < 15;i++){
                        var stats = projectileStats;
                        stats.attack *= 0.3;
                        var projectile = Projectile({
                            id:self.parent,
                            projectileType:'fireBullet',
                            angle:i * 24,
                            direction:i * 24,
                            x:self.x,
                            y:self.y,
                            map:self.map,
                            parentType:self.parentType,
                            mapWidth:self.mapWidth,
                            mapHeight:self.mapHeight,
                            width:projectileWidth,
                            height:projectileHeight,
                            spin:function(t){return 25},
                            pierce:1000,
                            projectilePattern:'accellerateNoCollision',
                            stats:stats,
                            onCollision:function(self,pt){
                                if(self.pierce === 0){
                                    self.toRemove = true;
                                }
                                else{
                                    self.pierce -= 1;
                                }
                            }
                        });
                    }
                }
            });
            self.stats.speed = speed;
        }
        if(self.offhandPassive === 'firering'){
            var speed = self.stats.speed;
            self.stats.speed = 0.2;
            for(var i = 0;i < 15;i++){
                self.shootProjectile(self.id,'Player',i * 24,i * 24,'fireBullet',128,function(t){return 0},1000,self.stats,'spinAroundPlayer');
            }
            self.stats.speed = speed;
        }
    }
    self.updateAttack = function(){
        var isFireMap = firableMap(self.map);
        for(var i = 0;i < self.eventQ.length;i++){
            if(self.eventQ[i] !== undefined){
                if(self.eventQ[i].time === 0){
                    switch(self.eventQ[i].event){
                        case "heal":
                            var heal = Math.round(150 * self.stats.heal);
                            heal = Math.min(self.hpMax - self.hp,heal);
                            self.hp += heal;
                            if(heal){
                                var particle = new Particle({
                                    x:self.x + Math.random() * 64 - 32,
                                    y:self.y + Math.random() * 64 - 32,
                                    map:self.map,
                                    particleType:'greenDamage',
                                    value:'+' + Math.round(heal),
                                });
                                for(var i = 0;i < 25;i++){
                                    var particle = new Particle({
                                        x:self.x + Math.random() * self.width - self.width / 2,
                                        y:self.y + Math.random() * self.height - self.height / 2,
                                        map:self.map,
                                        particleType:'heal',
                                    });
                                }
                            }
                            break;
                        case "simplewoodenbowAttack":
                            if(isFireMap){
                                self.shootProjectile(self.id,'Player',self.direction,self.direction,'stoneArrow',70,function(t){return 0},0,self.stats);
                            }
                            break;
                        case "simplesteelbowAttack":
                            if(isFireMap){
                                self.shootProjectile(self.id,'Player',self.direction,self.direction,'stoneArrow',70,function(t){return 0},0,self.stats);
                            }
                            break;
                        case "simpledarksteelbowAttack":
                            if(isFireMap){
                                self.shootProjectile(self.id,'Player',self.direction,self.direction,'stoneArrow',70,function(t){return 0},0,self.stats);
                            }
                            break;
                        case "simplegoldenbowAttack":
                            if(isFireMap){
                                self.shootProjectile(self.id,'Player',self.direction - 6,self.direction - 6,'stoneArrow',70,function(t){return 0},0,self.stats);
                                self.shootProjectile(self.id,'Player',self.direction + 6,self.direction + 6,'stoneArrow',70,function(t){return 0},0,self.stats);
                            }
                            break;
                        case "simplerubybowAttack":
                            if(isFireMap){
                                self.shootProjectile(self.id,'Player',self.direction - 6,self.direction - 6,'stoneArrow',70,function(t){return 0},0,self.stats);
                                self.shootProjectile(self.id,'Player',self.direction + 6,self.direction + 6,'stoneArrow',70,function(t){return 0},0,self.stats);
                            }
                            break;
                        case "advancedwoodenbowAttack":
                            if(isFireMap){
                                self.shootProjectile(self.id,'Player',self.direction,self.direction,'stoneArrow',70,function(t){return 0},0,self.stats);
                            }
                            break;
                        case "advancedsteelbowAttack":
                            if(isFireMap){
                                self.shootProjectile(self.id,'Player',self.direction - 6,self.direction - 6,'stoneArrow',70,function(t){return 0},0,self.stats);
                                self.shootProjectile(self.id,'Player',self.direction + 6,self.direction + 6,'stoneArrow',70,function(t){return 0},0,self.stats);
                            }
                            break;
                        case "advanceddarksteelbowAttack":
                            if(isFireMap){
                                self.shootProjectile(self.id,'Player',self.direction - 6,self.direction - 6,'stoneArrow',70,function(t){return 0},0,self.stats);
                                self.shootProjectile(self.id,'Player',self.direction + 6,self.direction + 6,'stoneArrow',70,function(t){return 0},0,self.stats);
                            }
                            break;
                        case "advancedgoldenbowAttack":
                            if(isFireMap){
                                self.shootProjectile(self.id,'Player',self.direction - 10,self.direction - 10,'stoneArrow',70,function(t){return 0},0,self.stats);
                                self.shootProjectile(self.id,'Player',self.direction,self.direction,'stoneArrow',70,function(t){return 0},0,self.stats);
                                self.shootProjectile(self.id,'Player',self.direction + 10,self.direction + 10,'stoneArrow',70,function(t){return 0},0,self.stats);
                            }
                            break;
                        case "advancedrubybowAttack":
                            if(isFireMap){
                                self.shootProjectile(self.id,'Player',self.direction - 10,self.direction - 10,'stoneArrow',70,function(t){return 0},0,self.stats);
                                self.shootProjectile(self.id,'Player',self.direction,self.direction,'stoneArrow',70,function(t){return 0},0,self.stats);
                                self.shootProjectile(self.id,'Player',self.direction + 10,self.direction + 10,'stoneArrow',70,function(t){return 0},0,self.stats);
                            }
                            break;
                        case "simplewoodenswordAttack":
                            if(isFireMap){
                                self.shootProjectile(self.id,'Player',self.direction + 270,self.direction + 270,'simplewoodensword',54,function(t){return 0},0,self.stats,'spinAroundPlayer');
                            }
                            break;
                        case "simplesteelswordAttack":
                            if(isFireMap){
                                self.shootProjectile(self.id,'Player',self.direction + 270,self.direction + 270,'simplesteelsword',54,function(t){return 0},0,self.stats,'spinAroundPlayer');
                            }
                            break;
                        case "simpledarksteelswordAttack":
                            if(isFireMap){
                                self.shootProjectile(self.id,'Player',self.direction + 270,self.direction + 270,'simpledarksteelsword',54,function(t){return 0},0,self.stats,'spinAroundPlayer');
                            }
                            break;
                        case "simplegoldenswordAttack":
                            if(isFireMap){
                                self.shootProjectile(self.id,'Player',self.direction + 270,self.direction + 270,'simplegoldensword',54,function(t){return 0},0,self.stats,'spinAroundPlayer');
                                self.shootProjectile(self.id,'Player',self.direction + 90,self.direction + 90,'simplegoldensword',54,function(t){return 0},0,self.stats,'spinAroundPlayer');
                            }
                            break;
                        case "simplerubyswordAttack":
                            if(isFireMap){
                                self.shootProjectile(self.id,'Player',self.direction + 270,self.direction + 270,'simplerubysword',54,function(t){return 0},0,self.stats,'spinAroundPlayer');
                                self.shootProjectile(self.id,'Player',self.direction + 90,self.direction + 90,'simplerubysword',54,function(t){return 0},0,self.stats,'spinAroundPlayer');
                            }
                            break;
                        case "advancedwoodenswordAttack":
                            if(isFireMap){
                                self.shootProjectile(self.id,'Player',self.direction + 270,self.direction + 270,'advancedwoodensword',54,function(t){return 0},0,self.stats,'spinAroundPlayer');
                            }
                            break;
                        case "advancedsteelswordAttack":
                            if(isFireMap){
                                self.shootProjectile(self.id,'Player',self.direction + 270,self.direction + 270,'advancedsteelsword',54,function(t){return 0},0,self.stats,'spinAroundPlayer');
                                self.shootProjectile(self.id,'Player',self.direction + 90,self.direction + 90,'advancedsteelsword',54,function(t){return 0},0,self.stats,'spinAroundPlayer');
                            }
                            break;
                        case "advanceddarksteelswordAttack":
                            if(isFireMap){
                                self.shootProjectile(self.id,'Player',self.direction + 270,self.direction + 270,'advanceddarksteelsword',54,function(t){return 0},0,self.stats,'spinAroundPlayer');
                                self.shootProjectile(self.id,'Player',self.direction + 90,self.direction + 90,'advanceddarksteelsword',54,function(t){return 0},0,self.stats,'spinAroundPlayer');
                            }
                            break;
                        case "advancedgoldenswordAttack":
                            if(isFireMap){
                                self.shootProjectile(self.id,'Player',self.direction + 270,self.direction + 270,'advancedgoldensword',54,function(t){return 0},0,self.stats,'spinAroundPlayer');
                                self.shootProjectile(self.id,'Player',self.direction + 30,self.direction + 30,'advancedgoldensword',54,function(t){return 0},0,self.stats,'spinAroundPlayer');
                                self.shootProjectile(self.id,'Player',self.direction + 150,self.direction + 150,'advancedgoldensword',54,function(t){return 0},0,self.stats,'spinAroundPlayer');
                            }
                            break;
                        case "advancedrubyswordAttack":
                            if(isFireMap){
                                self.shootProjectile(self.id,'Player',self.direction + 270,self.direction + 270,'advancedrubysword',54,function(t){return 0},0,self.stats,'spinAroundPlayer');
                                self.shootProjectile(self.id,'Player',self.direction + 30,self.direction + 30,'advancedrubysword',54,function(t){return 0},0,self.stats,'spinAroundPlayer');
                                self.shootProjectile(self.id,'Player',self.direction + 150,self.direction + 150,'advancedrubysword',54,function(t){return 0},0,self.stats,'spinAroundPlayer');
                            }
                            break;
                        case "simplewoodenstaffAttack":
                            if(isFireMap){
                                self.shootProjectile(self.id,'Player',self.direction,self.direction,'earthBullet',70,function(t){return 0},0,self.stats,'monsterHoming');
                            }
                            break;
                        case "simplesteelstaffAttack":
                            if(isFireMap){
                                self.shootProjectile(self.id,'Player',self.direction,self.direction,'earthBullet',70,function(t){return 0},0,self.stats,'monsterHoming');
                            }
                            break;
                        case "simpledarksteelstaffAttack":
                            if(isFireMap){
                                self.shootProjectile(self.id,'Player',self.direction,self.direction,'earthBullet',70,function(t){return 0},0,self.stats,'monsterHoming');
                            }
                            break;
                        case "simplegoldenstaffAttack":
                            if(isFireMap){
                                self.shootProjectile(self.id,'Player',self.direction,self.direction,'earthBullet',70,function(t){return 0},0,self.stats,'monsterHoming');
                                self.shootProjectile(self.id,'Player',self.direction + 180,self.direction + 180,'earthBullet',70,function(t){return 0},0,self.stats,'monsterHoming');
                            }
                            break;
                        case "simplerubystaffAttack":
                            if(isFireMap){
                                self.shootProjectile(self.id,'Player',self.direction,self.direction,'earthBullet',70,function(t){return 0},0,self.stats,'monsterHoming');
                                self.shootProjectile(self.id,'Player',self.direction + 180,self.direction + 180,'earthBullet',70,function(t){return 0},0,self.stats,'monsterHoming');
                            }
                            break;
                        case "advancedwoodenstaffAttack":
                            if(isFireMap){
                                self.shootProjectile(self.id,'Player',self.direction,self.direction,'earthBullet',70,function(t){return 0},0,self.stats,'monsterHoming');
                            }
                            break;
                        case "advancedsteelstaffAttack":
                            if(isFireMap){
                                self.shootProjectile(self.id,'Player',self.direction,self.direction,'earthBullet',70,function(t){return 0},0,self.stats,'monsterHoming');
                                self.shootProjectile(self.id,'Player',self.direction + 180,self.direction + 180,'earthBullet',70,function(t){return 0},0,self.stats,'monsterHoming');
                            }
                            break;
                        case "advanceddarksteelstaffAttack":
                            if(isFireMap){
                                self.shootProjectile(self.id,'Player',self.direction,self.direction,'earthBullet',70,function(t){return 0},0,self.stats,'monsterHoming');
                                self.shootProjectile(self.id,'Player',self.direction + 180,self.direction + 180,'earthBullet',70,function(t){return 0},0,self.stats,'monsterHoming');
                            }
                            break;
                        case "advancedgoldenstaffAttack":
                            if(isFireMap){
                                self.shootProjectile(self.id,'Player',self.direction - 120,self.direction - 120,'earthBullet',70,function(t){return 0},0,self.stats,'monsterHoming');
                                self.shootProjectile(self.id,'Player',self.direction,self.direction,'earthBullet',70,function(t){return 0},0,self.stats,'monsterHoming');
                                self.shootProjectile(self.id,'Player',self.direction + 120,self.direction + 120,'earthBullet',70,function(t){return 0},0,self.stats,'monsterHoming');
                            }
                            break;
                        case "advancedrubystaffAttack":
                            if(isFireMap){
                                self.shootProjectile(self.id,'Player',self.direction - 120,self.direction - 120,'earthBullet',70,function(t){return 0},0,self.stats,'monsterHoming');
                                self.shootProjectile(self.id,'Player',self.direction,self.direction,'earthBullet',70,function(t){return 0},0,self.stats,'monsterHoming');
                                self.shootProjectile(self.id,'Player',self.direction + 120,self.direction + 120,'earthBullet',70,function(t){return 0},0,self.stats,'monsterHoming');
                            }
                            break;
                        case "lightningsaberAttack":
                            if(isFireMap){
                                self.shootProjectile(self.id,'Player',self.direction,self.direction,'lightningsaber',34,function(t){return 25},0,self.stats,'spinAroundPoint');
                                self.shootProjectile(self.id,'Player',self.direction + 90,self.direction + 90,'lightningsaber',34,function(t){return 25},0,self.stats,'spinAroundPoint');
                                self.shootProjectile(self.id,'Player',self.direction + 180,self.direction + 180,'lightningsaber',34,function(t){return 25},0,self.stats,'spinAroundPoint');
                                self.shootProjectile(self.id,'Player',self.direction + 270,self.direction + 270,'lightningsaber',34,function(t){return 25},0,self.stats,'spinAroundPoint');
                            }
                            break;
                        case "lightningwandAttack":
                            if(isFireMap){
                                self.shootProjectile(self.id,'Player',self.direction,self.direction,'lightningSpit',70,function(t){return 0},0,self.stats);
                            }
                            break;
                        case "bookoflightningAttack":
                            if(isFireMap){
                                self.shootProjectile(self.id,'Player',self.direction,self.direction,'lightningSpit',0,function(t){return 0},0,self.stats,'monsterHomingSpin');
                                self.shootProjectile(self.id,'Player',self.direction - 60,self.direction - 60,'lightningSpit',0,function(t){return 0},0,self.stats,'monsterHomingSpin');
                                self.shootProjectile(self.id,'Player',self.direction + 60,self.direction + 60,'lightningSpit',0,function(t){return 0},0,self.stats,'monsterHomingSpin');
                            }
                            break;
                        case "bookofspiritsAttack":
                            if(isFireMap){
                                if(self.weaponState === 7){
                                    self.weaponState = 0;
                                }
                                self.shootProjectile(self.id,'Player',self.direction + self.weaponState * 60,self.direction + self.weaponState * 60,'soul',64,function(t){return 30},0,self.stats,'playerSoulWait');
                            }
                            break;
                        case "ectocannonAttack":
                            if(isFireMap){
                                for(var j = 0;j < 10;j++){
                                    self.shootProjectile(self.id,'Player',self.direction - 10 + Math.random() * 20,self.direction - 10 + Math.random() * 20,'soul',12 + 24 * Math.random(),function(t){return 0},0,self.stats,'playerSoulLaunch');
                                }
                            }
                            break;
                        case "halibutcannonAttack":
                            if(isFireMap){
                                for(var j = 0;j < 10;j++){
                                    self.shootProjectile(self.id,'Player',self.direction - 10 + Math.random() * 20,self.direction - 10 + Math.random() * 20,'bullet',54 + 24 * Math.random(),function(t){return 0},30,self.stats);
                                }
                            }
                            break;
                        case "bowofembersAttack":
                            if(isFireMap){
                                for(var j = 0;j < 10;j++){
                                    self.shootProjectile(self.id,'Player',self.direction - 10 + Math.random() * 20,self.direction - 10 + Math.random() * 20,'flame',54 + 24 * Math.random(),function(t){return 0},30,self.stats);
                                }
                                for(var j = 0;j < 10;j++){
                                    if(Math.random() < 0.1){
                                        var attack = self.stats.attack;
                                        self.stats.attack *= 10;
                                        self.shootProjectile(self.id,'Player',self.direction - 10 + Math.random() * 20,self.direction - 10 + Math.random() * 20,'fireBullet',54 + 24 * Math.random(),function(t){return 0},30,self.stats,'monsterHoming');
                                        self.stats.attack = attack;
                                    }
                                }
                            }
                            break;
                        case "burntbookofashesAttack":
                            if(isFireMap){
                                for(var j = 0;j < 10;j++){
                                    self.shootProjectile(self.id,'Player',self.direction - 10 + Math.random() * 20,self.direction - 10 + Math.random() * 20,'fireBullet',54 + 24 * Math.random(),function(t){return 0},30,self.stats);
                                }
                                for(var j = 0;j < 100;j++){
                                    if(Math.random() < 0.01){
                                        var attack = self.stats.attack;
                                        self.stats.attack *= 10;
                                        self.shootProjectile(self.id,'Player',self.direction - 10 + Math.random() * 20,self.direction - 10 + Math.random() * 20,'fireBullet',54 + 24 * Math.random(),function(t){return 0},30,self.stats,'monsterHoming');
                                        self.stats.attack = attack;
                                    }
                                }
                            }
                            break;
                        case "bowofrockAttack":
                            if(isFireMap){
                                self.shootProjectile(self.id,'Player',self.direction - 10 + Math.random() * 20,self.direction - 10 + Math.random() * 20,'rock',54 + 24 * Math.random(),function(t){return 0},0,self.stats);
                                self.shootProjectile(self.id,'Player',self.direction - 10 + Math.random() * 20,self.direction - 10 + Math.random() * 20,'rock',54 + 24 * Math.random(),function(t){return 0},0,self.stats);
                            }
                            break;
                        case "leafblowerAttack":
                            if(isFireMap){
                                self.shootProjectile(self.id,'Player',self.direction - 10 + Math.random() * 20,self.direction - 10 + Math.random() * 20,'seed',54 + 24 * Math.random(),function(t){return 0},0,self.stats);
                            }
                            break;
                        case "bookofnatureAttack":
                            if(isFireMap){
                                for(var j = 0;j < 8;j++){
                                    self.shootProjectile(self.id,'Player',j * 45,j * 45,'seed',32,function(t){return 0},3,self.stats,'playerSeed');
                                }
                            }
                            break;
                        case "voidbookAttack":
                            if(isFireMap){
                                self.shootProjectile(self.id,'Player',0,0,'void',0,function(t){return 25},1000,self.stats,'followPlayerStationaryNoCollision');
                                for(var j = 0;j < 8;j++){
                                    self.shootProjectile(self.id,'Player',self.direction + j * 45,self.direction + j * 45,'unholySoul',192,function(t){return 25},0,self.stats,'monsterHoming');
                                }
                            }
                            break;
                        case "basichealingscepterAttack":
                            if(isFireMap){
                                var x = self.x;
                                var y = self.y;
                                self.x = self.mouseX;
                                self.y = self.mouseY;
                                self.stats.attack *= -1;
                                var critChance = self.stats.critChance;
                                self.stats.critChance = 0;
                                self.shootProjectile(1,'Monster',0,0,'healingring',0,function(t){return 25},1000,self.stats,'stationary');
                                self.stats.attack *= -1;
                                self.stats.critChance = critChance;
                                self.x = x;
                                self.y = y;
                            }
                            break;
                        case "healingscepterAttack":
                            if(isFireMap){
                                var x = self.x;
                                var y = self.y;
                                self.x = self.mouseX;
                                self.y = self.mouseY;
                                self.stats.attack *= -1;
                                var critChance = self.stats.critChance;
                                self.stats.critChance = 0;
                                self.shootProjectile(1,'Monster',0,0,'healingring',0,function(t){return 25},1000,self.stats,'stationary');
                                self.stats.attack *= -1;
                                self.stats.critChance = critChance;
                                self.x = x;
                                self.y = y;
                            }
                            break;
                        case "advancedhealingscepterAttack":
                            if(isFireMap){
                                var x = self.x;
                                var y = self.y;
                                self.x = self.mouseX;
                                self.y = self.mouseY;
                                self.stats.attack *= -1;
                                var critChance = self.stats.critChance;
                                self.stats.critChance = 0;
                                self.shootProjectile(1,'Monster',0,0,'healingring',0,function(t){return 25},1000,self.stats,'stationary');
                                self.stats.attack *= -1;
                                self.stats.critChance = critChance;
                                self.x = x;
                                self.y = y;
                            }
                            break;
                        case "scepterofregrowthAttack":
                            if(isFireMap){
                                var x = self.x;
                                var y = self.y;
                                self.x = self.mouseX;
                                self.y = self.mouseY;
                                self.stats.attack *= -1;
                                var critChance = self.stats.critChance;
                                self.stats.critChance = 0;
                                self.shootProjectile(1,'Monster',0,0,'healingring',0,function(t){return 25},1000,self.stats,'stationary');
                                self.stats.attack *= -1;
                                self.stats.critChance = critChance;
                                self.x = x;
                                self.y = y;
                            }
                            break;
                        case "goldenscepterAttack":
                            if(isFireMap){
                                var x = self.x;
                                var y = self.y;
                                self.x = self.mouseX;
                                self.y = self.mouseY;
                                self.stats.attack *= -1;
                                var critChance = self.stats.critChance;
                                self.stats.critChance = 0;
                                self.shootProjectile(1,'Monster',0,0,'healingring',0,function(t){return 25},1000,self.stats,'stationary');
                                self.stats.attack *= -1;
                                self.stats.critChance = critChance;
                                self.x = x;
                                self.y = y;
                            }
                            break;
                        case "tsunamiAttack":
                            if(isFireMap){
                                for(var j = -2;j < 3;j++){
                                    self.shootProjectile(self.id,'Player',self.direction + j * 15,self.direction + j * 15,'waterBullet',70,function(t){return 25},0,self.stats,'bounceOffCollisions');
                                }
                            }
                            break;
                        case "waterslasherAttack":
                            if(isFireMap){
                                self.shootProjectile(self.id,'Player',self.direction + 270,self.direction + 270,'waterslasher',54,function(t){return 0},0,self.stats,'spinAroundPlayer');
                                self.shootProjectile(self.id,'Player',self.direction,self.direction,'waterBullet',64,function(t){return 25},0,self.stats,'bounceOffCollisions');
                                self.shootProjectile(self.id,'Player',self.direction,self.direction,'waterBullet',84,function(t){return 25},0,self.stats,'bounceOffCollisions');
                                self.shootProjectile(self.id,'Player',self.direction + 90,self.direction + 90,'waterslasher',54,function(t){return 0},0,self.stats,'spinAroundPlayer');
                                self.shootProjectile(self.id,'Player',self.direction,self.direction,'waterBullet',64,function(t){return 25},0,self.stats,'bounceOffCollisions');
                                self.shootProjectile(self.id,'Player',self.direction,self.direction,'waterBullet',84,function(t){return 25},0,self.stats,'bounceOffCollisions');
                            }
                            break;
                        case "flamethrowerAttack":
                            if(isFireMap){
                                for(var j = 0;j < 32;j++){
                                    self.shootProjectile(self.id,'Player',self.direction - 5 + Math.random() * 10,self.direction - 5 + Math.random() * 10,'flame',48 + 8 * j,function(t){return 25},0,self.stats,'followPlayerStationary');
                                    self.shootProjectile(self.id,'Player',self.direction - 5 + Math.random() * 10,self.direction - 5 + Math.random() * 10,'flame',48 + 8 * j,function(t){return 25},0,self.stats,'followPlayerStationary');
                                }
                            }
                            break;
                        case "bookofdeathAttack":
                            if(isFireMap){
                                for(var j = 0;j < 3;j++){
                                    self.shootProjectile(self.id,'Player',self.direction + 60 - j * 60 + Math.random() * 15,self.direction + 60 - j * 60 + Math.random() * 15,'skull',32 + 12 * Math.random(),function(t){return 0},10,self.stats,'skull');
                                }
                            }
                            break;
                        case "staffofthewhirlwindAttack":
                            if(isFireMap){
                                var speed = self.stats.speed;
                                self.stats.speed = 0;
                                var projectileWidth = 0;
                                var projectileHeight = 0;
                                for(var i in projectileData){
                                    if(i === 'waterTower'){
                                        projectileWidth = projectileData[i].width;
                                        projectileHeight = projectileData[i].height;
                                        projectileStats = Object.create(projectileData[i].stats);
                                    }
                                }
                                for(var i in projectileStats){
                                    projectileStats[i] *= self.stats[i];
                                }
                                projectileStats.damageReduction = 0;
                                projectileStats.debuffs = stats.debuffs;
                                var projectile = Projectile({
                                    id:self.id,
                                    projectileType:'waterTower',
                                    angle:0,
                                    direction:0,
                                    x:self.mouseX,
                                    y:self.mouseY - 32,
                                    map:self.map,
                                    parentType:self.type,
                                    mapWidth:self.mapWidth,
                                    mapHeight:self.mapHeight,
                                    width:projectileWidth,
                                    height:projectileHeight,
                                    spin:function(t){return 0},
                                    pierce:0,
                                    projectilePattern:'stationary',
                                    stats:projectileStats,
                                    onCollision:function(self,pt){
                                        
                                    }
                                });
                                self.stats.speed = speed;
                                var x = self.x;
                                var y = self.y;
                                self.x = self.mouseX;
                                self.y = self.mouseY;
                                var mouseX = self.mouseX;
                                var mouseY = self.mouseY;
                                var turnAmount = 0;
                                for(var j = 0;j < 2;j++){
                                    self.shootProjectile(self.id,'Player',turnAmount + j * 180,turnAmount + j * 180,'waterBullet',50,function(t){return 0},0,self.stats,'noCollision');
                                }
                                for(var k = 0;k < 12;k++){
                                    setTimeout(function(){
                                        turnAmount += 32;
                                        var x = self.x;
                                        var y = self.y;
                                        self.x = mouseX;
                                        self.y = mouseY;
                                        for(var j = 0;j < 2;j++){
                                            self.shootProjectile(self.id,'Player',turnAmount + j * 180,turnAmount + j * 180,'waterBullet',50,function(t){return 0},0,self.stats,'noCollision');
                                        }
                                        self.x = x;
                                        self.y = y;
                                    },250 * k);
                                }
                                self.x = x;
                                self.y = y;
                            }
                            break;
                        case "bookofrockAttack":
                            if(isFireMap){
                                var speed = self.stats.speed;
                                self.stats.speed = 0;
                                var projectileWidth = 0;
                                var projectileHeight = 0;
                                for(var i in projectileData){
                                    if(i === 'rockTower'){
                                        projectileWidth = projectileData[i].width;
                                        projectileHeight = projectileData[i].height;
                                        projectileStats = Object.create(projectileData[i].stats);
                                    }
                                }
                                for(var i in projectileStats){
                                    projectileStats[i] *= self.stats[i];
                                }
                                projectileStats.damageReduction = 0;
                                projectileStats.debuffs = stats.debuffs;
                                var projectile = Projectile({
                                    id:self.id,
                                    projectileType:'rockTower',
                                    angle:0,
                                    direction:0,
                                    x:self.mouseX,
                                    y:self.mouseY - 32,
                                    map:self.map,
                                    parentType:self.type,
                                    mapWidth:self.mapWidth,
                                    mapHeight:self.mapHeight,
                                    width:projectileWidth,
                                    height:projectileHeight,
                                    spin:function(t){return 0},
                                    pierce:0,
                                    projectilePattern:'stationary',
                                    stats:projectileStats,
                                    onCollision:function(self,pt){
                                        
                                    }
                                });
                                self.stats.speed = speed;
                                var x = self.x;
                                var y = self.y;
                                self.x = self.mouseX;
                                self.y = self.mouseY;
                                var mouseX = self.mouseX;
                                var mouseY = self.mouseY;
                                var closestMonster = undefined;
                                for(var i in Monster.list){
                                    if(closestMonster === undefined && Monster.list[i].map === self.map && Monster.list[i].invincible === false){
                                        closestMonster = Monster.list[i];
                                    }
                                    else if(closestMonster !== undefined){
                                        if(self.getDistance(Monster.list[i]) < self.getDistance(closestMonster) && Monster.list[i].map === self.map){
                                            closestMonster = Monster.list[i];
                                        }
                                    }
                                }
                                if(closestMonster){
                                    self.shootProjectile(self.id,'Player',Math.atan2(closestMonster.y - self.y,closestMonster.x - self.x) / Math.PI * 180 + Math.random() * 20 - 10,Math.atan2(closestMonster.y - self.y,closestMonster.x - self.x) / Math.PI * 180 + Math.random() * 20 - 10,'rock',50,function(t){return 0},0,self.stats);
                                }
                                for(var k = 0;k < 12;k++){
                                    setTimeout(function(){
                                        var x = self.x;
                                        var y = self.y;
                                        self.x = mouseX;
                                        self.y = mouseY;
                                        var closestMonster = undefined;
                                        for(var i in Monster.list){
                                            if(closestMonster === undefined && Monster.list[i].map === self.map && Monster.list[i].invincible === false){
                                                closestMonster = Monster.list[i];
                                            }
                                            else if(closestMonster !== undefined){
                                                if(self.getDistance(Monster.list[i]) < self.getDistance(closestMonster) && Monster.list[i].map === self.map){
                                                    closestMonster = Monster.list[i];
                                                }
                                            }
                                        }
                                        if(closestMonster){
                                            self.shootProjectile(self.id,'Player',Math.atan2(closestMonster.y - self.y,closestMonster.x - self.x) / Math.PI * 180 + Math.random() * 20 - 10,Math.atan2(closestMonster.y - self.y,closestMonster.x - self.x) / Math.PI * 180 + Math.random() * 20 - 10,'rock',50,function(t){return 0},0,self.stats);
                                        }
                                        self.x = x;
                                        self.y = y;
                                    },250 * k);
                                }
                                self.x = x;
                                self.y = y;
                            }
                            break;
                        case "emeralditestaffAttack":
                            if(isFireMap){
                                var projectileWidth = 0;
                                var projectileHeight = 0;
                                for(var i in projectileData){
                                    if(i === 'seed'){
                                        projectileWidth = projectileData[i].width;
                                        projectileHeight = projectileData[i].height;
                                        projectileStats = Object.create(projectileData[i].stats);
                                    }
                                }
                                for(var i in projectileStats){
                                    projectileStats[i] *= self.stats[i];
                                }
                                projectileStats.damageReduction = 0;
                                projectileStats.debuffs = stats.debuffs;
                                var projectile = Projectile({
                                    id:self.id,
                                    projectileType:'seed',
                                    angle:self.direction + Math.random() * 30 - 15,
                                    direction:self.direction + Math.random() * 30 - 15,
                                    x:self.x + Math.cos(self.direction / 180 * Math.PI) * 70,
                                    y:self.y + Math.sin(self.direction / 180 * Math.PI) * 70,
                                    map:self.map,
                                    parentType:self.type,
                                    mapWidth:self.mapWidth,
                                    mapHeight:self.mapHeight,
                                    width:projectileWidth,
                                    height:projectileHeight,
                                    spin:function(t){return 0},
                                    pierce:0,
                                    projectilePattern:'monsterHomingSpin',
                                    stats:projectileStats,
                                    onCollision:function(self,pt){
                                        if(self.pierce === 0){
                                            self.toRemove = true;
                                            for(var i = 0;i < 3 + Math.round(3 * Math.random());i++){
                                                if(Player.list[self.parent]){
                                                    var x = Player.list[self.parent].x
                                                    var y = Player.list[self.parent].y;
                                                    Player.list[self.parent].x = self.x;
                                                    Player.list[self.parent].y = self.y;
                                                    Player.list[self.parent].shootProjectile(self.parent,'Player',360 * Math.random(),360 * Math.random(),'seed',24,function(t){return 0},0,self.stats,'playerSeed');
                                                    Player.list[self.parent].x = x;
                                                    Player.list[self.parent].y = y;
                                                }
                                            }
                                        }
                                        else{
                                            self.pierce -= 1;
                                        }
                                    }
                                });
                            }
                            break;
                        case "whirlwindcannonAttack":
                            if(isFireMap){
                                var projectileWidth = 0;
                                var projectileHeight = 0;
                                for(var i in projectileData){
                                    if(i === 'waterBullet'){
                                        projectileWidth = projectileData[i].width;
                                        projectileHeight = projectileData[i].height;
                                        projectileStats = Object.create(projectileData[i].stats);
                                    }
                                }
                                for(var i in projectileStats){
                                    projectileStats[i] *= self.stats[i];
                                }
                                projectileStats.damageReduction = 0;
                                projectileStats.debuffs = stats.debuffs;
                                var projectile = Projectile({
                                    id:self.id,
                                    projectileType:'waterBullet',
                                    angle:self.direction + Math.random() * 30 - 15,
                                    direction:self.direction + Math.random() * 30 - 15,
                                    x:self.x + Math.cos(self.direction / 180 * Math.PI) * 70,
                                    y:self.y + Math.sin(self.direction / 180 * Math.PI) * 70,
                                    map:self.map,
                                    parentType:self.type,
                                    mapWidth:self.mapWidth,
                                    mapHeight:self.mapHeight,
                                    width:projectileWidth,
                                    height:projectileHeight,
                                    spin:function(t){return 25},
                                    pierce:0,
                                    projectilePattern:'bounceOffCollisions',
                                    stats:projectileStats,
                                    onCollision:function(self,pt){
                                        if(self.pierce === 0){
                                            self.toRemove = true;
                                            for(var i = 0;i < 3 + Math.round(3 * Math.random());i++){
                                                if(Player.list[self.parent]){
                                                    var x = Player.list[self.parent].x
                                                    var y = Player.list[self.parent].y;
                                                    Player.list[self.parent].x = self.x;
                                                    Player.list[self.parent].y = self.y;
                                                    Player.list[self.parent].shootProjectile(self.parent,'Player',360 * Math.random(),360 * Math.random(),'waterBullet',24,function(t){return 25},0,self.stats,'playerSeed');
                                                    Player.list[self.parent].x = x;
                                                    Player.list[self.parent].y = y;
                                                }
                                            }
                                        }
                                        else{
                                            self.pierce -= 1;
                                        }
                                    }
                                });
                            }
                            break;
                        case "typhoonstormAttack":
                            if(isFireMap){
                                self.shootProjectile(self.id,'Player',self.direction,self.direction,'typhoon',32,function(t){return 25},1000,self.stats,'monsterHoming');
                            }
                            break;
                        case "thedeathrayspiralAttack":
                            if(isFireMap){
                                var projectileWidth = 0;
                                var projectileHeight = 0;
                                for(var i in projectileData){
                                    if(i === 'thedeathrayspiral'){
                                        projectileWidth = projectileData[i].width;
                                        projectileHeight = projectileData[i].height;
                                        projectileStats = Object.create(projectileData[i].stats);
                                    }
                                }
                                for(var i in projectileStats){
                                    projectileStats[i] *= self.stats[i];
                                }
                                projectileStats.damageReduction = 0;
                                projectileStats.debuffs = stats.debuffs;
                                var projectile = Projectile({
                                    id:self.id,
                                    projectileType:'thedeathrayspiral',
                                    angle:self.direction,
                                    direction:self.direction,
                                    x:self.x,
                                    y:self.y,
                                    map:self.map,
                                    parentType:self.type,
                                    mapWidth:self.mapWidth,
                                    mapHeight:self.mapHeight,
                                    width:projectileWidth,
                                    height:projectileHeight,
                                    spin:function(t){return 25},
                                    pierce:1000,
                                    projectilePattern:'boomerang',
                                    stats:projectileStats,
                                    onCollision:function(self,pt){
                                        if(Player.list[self.parent]){
                                            var x = Player.list[self.parent].x
                                            var y = Player.list[self.parent].y;
                                            Player.list[self.parent].x = self.x;
                                            Player.list[self.parent].y = self.y;
                                            Player.list[self.parent].shootProjectile(self.parent,'Player',Math.atan2(self.spdY,self.spdX) / Math.PI * 180 + 20,Math.atan2(self.spdY,self.spdX) / Math.PI * 180 + 20,'thedeathrayspiral',24,function(t){return 25},1000,self.stats,'boomerang');
                                            Player.list[self.parent].shootProjectile(self.parent,'Player',Math.atan2(self.spdY,self.spdX) / Math.PI * 180 + 10,Math.atan2(self.spdY,self.spdX) / Math.PI * 180 + 10,'thedeathrayspiral',24,function(t){return 25},1000,self.stats,'boomerang');
                                            Player.list[self.parent].shootProjectile(self.parent,'Player',Math.atan2(self.spdY,self.spdX) / Math.PI * 180 - 10,Math.atan2(self.spdY,self.spdX) / Math.PI * 180 - 10,'thedeathrayspiral',24,function(t){return 25},1000,self.stats,'boomerang');
                                            Player.list[self.parent].shootProjectile(self.parent,'Player',Math.atan2(self.spdY,self.spdX) / Math.PI * 180 - 20,Math.atan2(self.spdY,self.spdX) / Math.PI * 180 - 20,'thedeathrayspiral',24,function(t){return 25},1000,self.stats,'boomerang');
                                            Player.list[self.parent].x = x;
                                            Player.list[self.parent].y = y;
                                        }
                                    }
                                });
                            }
                            break;
                        case "bookofflamesAttack":
                            if(isFireMap){
                                for(var j = 0;j < 20;j++){
                                    self.shootProjectile(self.id,'Player',self.direction + j * 18,self.direction + j * 18,'fireBullet',32,function(t){return 25},1000,self.stats,'accellerateNoCollision');
                                }
                            }
                            break;
                        case "thegemofspAttack":
                            if(isFireMap){
                                for(var j = 0;j < 8;j++){
                                    self.shootProjectile(self.id,'Player',self.direction + j * 45,self.direction + j * 45,'thegemofsp',64,function(t){return 0},1000,self.stats,'thegemofsp');
                                }
                            }
                            break;
                        case "bookoflasersAttack":
                            if(isFireMap){
                                for(var j = 0;j < 20;j++){
                                    self.shootProjectile(self.id,'Player',self.direction,self.direction,'giantsplaser',64 + 64 * j,function(t){return 0},1000,self.stats,'playerSplaser');
                                }
                            }
                            break;
                        case "iceboomerangAttack":
                            if(isFireMap){
                                self.shootProjectile(self.id,'Player',self.direction,self.direction,'iceboomerang',0,function(t){return 25},1000,self.stats,'boomerang');
                            }
                            break;
                        case "rockboomerangAttack":
                            if(isFireMap){
                                self.shootProjectile(self.id,'Player',self.direction,self.direction,'rockboomerang',0,function(t){return 25},1000,self.stats,'boomerang');
                            }
                            break;
                        case "fireboomerangAttack":
                            if(isFireMap){
                                var projectileWidth = 0;
                                var projectileHeight = 0;
                                for(var i in projectileData){
                                    if(i === 'fireboomerang'){
                                        projectileWidth = projectileData[i].width;
                                        projectileHeight = projectileData[i].height;
                                        projectileStats = Object.create(projectileData[i].stats);
                                    }
                                }
                                for(var i in projectileStats){
                                    projectileStats[i] *= self.stats[i];
                                }
                                projectileStats.damageReduction = 0;
                                projectileStats.debuffs = stats.debuffs;
                                var projectile = Projectile({
                                    id:self.id,
                                    projectileType:'fireboomerang',
                                    angle:self.direction,
                                    direction:self.direction,
                                    x:self.x,
                                    y:self.y,
                                    map:self.map,
                                    parentType:self.type,
                                    mapWidth:self.mapWidth,
                                    mapHeight:self.mapHeight,
                                    width:projectileWidth,
                                    height:projectileHeight,
                                    spin:function(t){return 25},
                                    pierce:1000,
                                    projectilePattern:'boomerang',
                                    stats:projectileStats,
                                    onCollision:function(self,pt){
                                        if(Player.list[self.parent]){
                                            var x = Player.list[self.parent].x
                                            var y = Player.list[self.parent].y;
                                            Player.list[self.parent].x = self.x;
                                            Player.list[self.parent].y = self.y;
                                            Player.list[self.parent].shootProjectile(self.parent,'Player',Math.atan2(self.spdY,self.spdX) / Math.PI * 180 + 10,Math.atan2(self.spdY,self.spdX) / Math.PI * 180 + 10,'fireboomerang',24,function(t){return 25},1000,self.stats,'boomerang');
                                            Player.list[self.parent].shootProjectile(self.parent,'Player',Math.atan2(self.spdY,self.spdX) / Math.PI * 180 - 10,Math.atan2(self.spdY,self.spdX) / Math.PI * 180 - 10,'fireboomerang',24,function(t){return 25},1000,self.stats,'boomerang');
                                            Player.list[self.parent].x = x;
                                            Player.list[self.parent].y = y;
                                        }
                                    }
                                });
                            }
                            break;
                        case "unholytridentAttack":
                            if(isFireMap){
                                self.shootProjectile(self.id,'Player',self.direction,self.direction,'unholytrident',32,function(t){return 0},3,self.stats,'unholyTrident');
                            }
                            break;
                        case "holytridentAttack":
                            if(isFireMap){
                                self.shootProjectile(self.id,'Player',self.direction,self.direction,'holytrident',32,function(t){return 0},3,self.stats,'holyTrident');
                            }
                            break;
                        case "bookoffrostAttack":
                            if(isFireMap){
                                self.shootProjectile(self.id,'Player',self.direction,self.direction,'frostBullet',0,function(t){return 10},30,self.stats,'bounceOffCollisions');
                            }
                            break;
                        case "goldensaberAttack":
                            if(isFireMap){
                                self.shootProjectile(self.id,'Player',self.direction + 60,self.direction + 60,'goldensaber',54,function(t){return 0},0,self.stats,'goldensaber');
                                self.shootProjectile(self.id,'Player',self.direction + 180,self.direction + 180,'goldensaber',54,function(t){return 0},0,self.stats,'goldensaber');
                                self.shootProjectile(self.id,'Player',self.direction + 300,self.direction + 300,'goldensaber',54,function(t){return 0},0,self.stats,'goldensaber');
                            }
                            break;
                        case "goldenbowAttack":
                            if(isFireMap){
                                self.shootProjectile(self.id,'Player',self.direction,self.direction,'goldArrow',70,function(t){return 0},0,self.stats);
                            }
                            break;
                        case "bookofgoldAttack":
                            self.coins += 10000;
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
        if(self.keyPress.heal === true && self.mana >= self.healCost && self.manaRefresh <= 0 && self.hp < self.hpMax){
            self.mana -= self.healCost;
            self.manaRefresh = self.useTime;
            for(var i in self.ability.healPattern){
                self.addToEventQ('heal',self.ability.healPattern[i]);
            }
        }
        if(self.keyPress.switch === true){
            if(self.inventory.equips.weapon.id && self.inventory.equips.weapon2.id){
                var weapon = JSON.parse(JSON.stringify(self.inventory.equips.weapon));
                var weapon2 = JSON.parse(JSON.stringify(self.inventory.equips.weapon2));
                self.inventory.equips.weapon = weapon2;
                self.inventory.equips.weapon2 = weapon;
                self.inventory.refreshItem('weapon');
                self.inventory.refreshItem('weapon2');
                self.inventory.refresh = true;
            }
            else{
                self.sendNotification('[!] Have both a weapon and a secondary weapon equipped to swap weapons.');
            }
            self.keyPress.switch = false;
        }
        if(isFireMap === false){
            return;
        }
        if(self.keyPress.attack === true){
            self.doPassive();
            if(self.stats.damageType === 'magic' && self.mana >= self.attackCost && self.manaRefresh <= 0){
                for(var i in self.ability.attackPattern){
                    self.addToEventQ(self.ability.ability + 'Attack',self.ability.attackPattern[i]);
                }
                self.mana -= self.attackCost;
                self.manaRefresh = self.useTime;
                self.weaponState += 1;
            }
            else if(self.stats.damageType === 'healing' && self.mana >= self.attackCost && self.manaRefresh <= 0){
                for(var i in self.ability.attackPattern){
                    self.addToEventQ(self.ability.ability + 'Attack',self.ability.attackPattern[i]);
                }
                self.mana -= self.attackCost;
                self.manaRefresh = self.useTime;
                self.weaponState += 1;
            }
            else if(self.stats.damageType !== 'magic' && self.cooldown <= 0){
                for(var i in self.ability.attackPattern){
                    self.addToEventQ(self.ability.ability + 'Attack',self.ability.attackPattern[i]);
                }
                self.cooldown = self.useTime;
                self.weaponState += 1;
            }
        }
        else{
            self.weaponState = 0;
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
        if(lastSelf.mana !== self.mana){
            pack.mana = self.mana;
            lastSelf.mana = self.mana;
        }
        if(lastSelf.manaMax !== self.manaMax){
            pack.manaMax = self.manaMax;
            lastSelf.manaMax = self.manaMax;
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
        if(lastSelf.attackCost !== self.attackCost){
            pack.attackCost = self.attackCost;
            lastSelf.attackCost = self.attackCost;
        }
        if(lastSelf.secondCost !== self.secondCost){
            pack.secondCost = self.secondCost;
            lastSelf.secondCost = self.secondCost;
        }
        if(lastSelf.healCost !== self.healCost){
            pack.healCost = self.healCost;
            lastSelf.healCost = self.healCost;
        }
        if(lastSelf.useTime !== self.useTime){
            pack.useTime = self.useTime;
            lastSelf.useTime = self.useTime;
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
        if(lastSelf.currentItem !== self.currentItem){
            pack.currentItem = self.currentItem;
            lastSelf.currentItem = self.currentItem;
        }
        if(lastSelf.direction !== self.direction){
            pack.direction = self.direction;
            lastSelf.direction = self.direction;
        }
        if(lastSelf.coins !== self.coins){
            pack.coins = self.coins;
            lastSelf.coins = self.coins;
        }
        if(lastSelf.devCoins !== self.devCoins){
            pack.devCoins = self.devCoins;
            lastSelf.devCoins = self.devCoins;
        }
        if(lastSelf.damageDone !== self.damageDone){
            pack.damageDone = self.damageDone;
            lastSelf.damageDone = self.damageDone;
        }
        for(var i in self.stats){
            if(lastSelf.stats !== undefined){
                if(lastSelf.stats[i] !== undefined){
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
        for(var i in self.debuffs){
            if(lastSelf.debuffs !== undefined){
                if(lastSelf.debuffs[i] !== undefined){
                    if(self.debuffs[i].id !== lastSelf.debuffs[i].id){
                        pack.debuffs = self.debuffs;
                        lastSelf.debuffs = JSON.parse(JSON.stringify(self.debuffs));
                    }
                    else if(self.debuffs[i].time !== lastSelf.debuffs[i].time){
                        pack.debuffs = self.debuffs;
                        lastSelf.debuffs = JSON.parse(JSON.stringify(self.debuffs));
                    }
                }
                else{
                    pack.debuffs = self.debuffs;
                    lastSelf.debuffs = JSON.parse(JSON.stringify(self.debuffs));
                }
            }
            else{
                pack.debuffs = self.debuffs;
                lastSelf.debuffs = JSON.parse(JSON.stringify(self.debuffs));
            }
        }
        for(var i in lastSelf.debuffs){
            if(self.debuffs[i] !== undefined){

            }
            else{
                pack.debuffs = self.debuffs;
                lastSelf.debuffs = JSON.parse(JSON.stringify(self.debuffs));
            }
        }
        for(var i in self.questStats){
            if(lastSelf.questStats !== undefined){
                if(lastSelf.questStats[i] !== undefined){
                    if(self.questStats[i] !== lastSelf.questStats[i]){
                        pack.questStats = self.questStats;
                        lastSelf.questStats = Object.create(self.questStats);
                    }
                }
                else{
                    pack.questStats = self.questStats;
                    lastSelf.questStats = Object.create(self.questStats);
                }
            }
            else{
                pack.questStats = self.questStats;
                lastSelf.questStats = Object.create(self.questStats);
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
        pack.mana = self.mana;
        pack.manaMax = self.manaMax;
        pack.level = self.level;
        pack.map = self.map;
        pack.username = self.username;
        pack.displayName = self.displayName;
        pack.img = self.img;
        pack.direction = self.direction;
        pack.animationDirection = self.animationDirection;
        pack.animation = self.animation;
        pack.attackCost = self.attackCost;
        pack.secondCost = self.secondCost;
        pack.healCost = self.healCost;
        pack.useTime = self.useTime;
        pack.mapWidth = self.mapWidth;
        pack.mapHeight = self.mapHeight;
        pack.moveSpeed = self.moveSpeed;
        pack.currentItem = self.currentItem;
        pack.coins = self.coins;
        pack.devCoins = self.devCoins;
        pack.damageDone = self.damageDone;
        pack.stats = self.stats;
        pack.debuffs = self.debuffs;
        pack.questStats = self.questStats;
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
        if(param.petType){
            player.petType = param.petType;
        }
        else{
            player.petType = 'Kiol';
        }
        if(!ENV.Peaceful){
            player.spawnPet();
        }
        for(var i in SOCKET_LIST){
            SOCKET_LIST[i].emit('initEntity',player.getInitPack());
        }
        socket.emit('selfId',{id:socket.id});

        socket.on('keyPress',function(data){
            if(data.inputId === player.keyMap.left || data.inputId === player.secondKeyMap.left || data.inputId === player.thirdKeyMap.left){
                player.keyPress.left = data.state;
            }
            if(data.inputId === player.keyMap.right || data.inputId === player.secondKeyMap.right || data.inputId === player.thirdKeyMap.right){
                player.keyPress.right = data.state;
            }
            if(data.inputId === player.keyMap.up || data.inputId === player.secondKeyMap.up || data.inputId === player.thirdKeyMap.up){
                player.keyPress.up = data.state;
            }
            if(data.inputId === player.keyMap.down || data.inputId === player.secondKeyMap.down || data.inputId === player.thirdKeyMap.down){
                player.keyPress.down = data.state;
            }
            if(data.inputId === player.keyMap.attack || data.inputId === player.secondKeyMap.attack || data.inputId === player.thirdKeyMap.attack){
                player.keyPress.attack = data.state;
            }
            if(data.inputId === player.keyMap.second || data.inputId === player.secondKeyMap.second || data.inputId === player.thirdKeyMap.second){
                player.keyPress.second = data.state;
            }
            if(data.inputId === player.keyMap.switch || data.inputId === player.secondKeyMap.switch || data.inputId === player.thirdKeyMap.switch){
                player.keyPress.switch = data.state;
            }
            if(data.inputId === player.keyMap.heal || data.inputId === player.secondKeyMap.heal || data.inputId === player.thirdKeyMap.heal){
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
            player.debuffs = [];
            if(player.map === 'Lilypad Temple Room 1'){
                player.teleport(1376,1632,'Lilypad Pathway Part 1');
            }
            else if(player.map === 'Town Cave'){
                player.teleport(2144,2144,'Deserted Town');
            }
            else if(player.map === 'The Pet Arena'){
                player.teleport(288,608,'The Guarded Citadel');
            }
            else if(player.map === 'Mysterious Room'){
                player.teleport(608,2848,'Deserted Town');
            }
            else if(player.map === 'The Battlefield'){
                player.teleport(2592,736,'The Village');
            }
            //player.teleport(ENV.Spawnpoint.x,ENV.Spawnpoint.y,ENV.Spawnpoint.map);
            addToChat('style="color: #00ff00">',player.displayName + ' respawned.');
        });

        socket.on('startQuest',function(data){
            if(player.quest === false){
                for(var i in Player.list){
                    if(Player.list[i].quest === data){
                        if(questData[data].multiplePlayers === false){
                            self.sendNotification('[!] A player is already doing the quest ' + data + '.');
                            return;
                        }
                    }
                }
                if(player.checkQuestRequirements(data) === true){
                    player.startQuest(data);
                }
                else{
                    player.sendNotification('[!] You do not meet the requirements to do this quest.');
                }
            }
            else{
                player.sendNotification('[!] Finish the quest ' + player.quest + ' before starting a new quest.');
            }
        });
        socket.on('waypoint',function(data){
            if(player.quest === 'Lightning Lizard Boss' || player.quest === 'Monster Raid' || player.quest === 'Clear Tower' || player.quest === 'Wood Delivery' || player.quest === 'Lost Rubies'){
                player.sendNotification('[!] Waypoints have been disabled in this quest.');
            }
            else if(player.map === 'The Pet Arena' || player.map === 'Mysterious Room' || player.map === 'The Tutorial' || player.map === 'The Battlefield' || player.map === 'Secret Tunnel Part 1'){
                player.sendNotification('[!] Waypoints have been disabled in this map.');
            }
            else if(data === 'The Village'){
                player.teleport(2080,1760,data);
            }
            else if(data === 'Lilypad Pathway Part 1'){
                if(player.questStats['Lightning Lizard Boss']){
                    player.teleport(1376,1632,data);
                }
                else{
                    player.sendNotification('[!] Complete the Lightning Lizard Boss quest to gain access to this waypoint.');
                }
            }
            else if(data === 'The Graveyard'){
                if(player.questStats['Possessed Spirit']){
                    player.teleport(2048,1376,data);
                }
                else{
                    player.sendNotification('[!] Defeat Possessed Spirit to gain access to this waypoint.');
                }
            }
            else if(data === 'The Arena'){
                player.teleport(1600,1600,data);
            }
            else if(data === 'Lilypad Temple Room 1'){
                if(player.questStats['Lightning Lizard Boss']){
                    player.teleport(256,3168,data);
                }
                else{
                    player.sendNotification('[!] Complete the Lightning Lizard Boss quest to gain access to this waypoint.');
                }
            }
            else if(data === 'Lilypad Temple Room 2'){
                if(player.questStats['Plantera']){
                    player.teleport(96,3104,data);
                }
                else{
                    player.sendNotification('[!] Defeat Plantera to gain access to this waypoint.');
                }
            }
            else if(data === 'Deserted Town'){
                if(player.questStats['Plantera']){
                    player.teleport(2144,2144,data);
                }
                else{
                    player.sendNotification('[!] Defeat Plantera to gain access to this waypoint.');
                }
            }
            else if(data === 'Lilypad Kingdom'){
                if(player.questStats['Plantera']){
                    player.teleport(1600,2144,data);
                }
                else{
                    player.sendNotification('[!] Defeat Plantera to gain access to this waypoint.');
                }
            }
            else{
                player.sendNotification('Stop hacking.');
            }
        });
        socket.on('changeDifficulty',function(data){
            if(data === 'Classic'){
                ENV.MonsterStrength = 1;
                ENV.Difficulty = data;
            }
            else if(data === 'Expert'){
                ENV.MonsterStrength = 2;
                ENV.Difficulty = data;
            }
            for(var i in Player.list){
                SOCKET_LIST[i].emit('changeDifficulty',data);
            }
        });
        socket.on('init',function(data){
            Player.getAllInitPack(socket);
        });
        socket.emit('changeDifficulty',ENV.Difficulty);
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
            //delete Projectile.list[i];
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
        Player.list[socket.id].endQuest();
        addToChat('style="color: #ff0000">',Player.list[socket.id].displayName + " logged off.");
        playerMap[Player.list[socket.id].map] -= 1;
        delete Player.list[socket.id];
    }
}
Player.getAllInitPack = function(socket){
    try{
        var player = Player.list[socket.id];
        var pack = {player:[],projectile:[],monster:[],npc:[],pet:[],particle:[],droppedItem:[]};
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
        for(var i in DroppedItem.list){
            if(DroppedItem.list[i].map === player.map){
                pack.droppedItem.push(DroppedItem.list[i].getInitPack());
            }
        }
        socket.emit('update',pack);
    }
    catch(err){
        console.error(err);
    }
}


Npc = function(param){
	var self = Actor(param);
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
    self.id = param.entityId;
    self.entityId = param.entityId;
    self.animationDirection = 4;
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
    for(var i = 0;i < 25;i++){
        var particle = new Particle({
            x:self.x + Math.random() * self.width - self.width / 2,
            y:self.y + Math.random() * self.height - self.height / 2,
            map:self.map,
            particleType:'teleport',
        });
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
            if(self.x < self.width / 2){
                self.x = self.width / 2;
                self.justCollided = true;
            }
            if(self.x > self.mapWidth - self.width / 2){
                self.x = self.mapWidth - self.width / 2;
                self.justCollided = true;
            }
            if(self.y < self.height / 2){
                self.y = self.height / 2;
                self.justCollided = true;
            }
            if(self.y > self.mapHeight - self.height / 2){
                self.y = self.mapHeight - self.height / 2;
                self.justCollided = true;
            }
            self.updateCollisions();
        }
        if(self.mapChange === 0){
            for(var i = 0;i < 25;i++){
                var particle = new Particle({
                    x:self.x + Math.random() * self.width - self.width / 2,
                    y:self.y + Math.random() * self.height - self.height / 2,
                    map:self.map,
                    particleType:'teleport',
                });
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
                if(Player.list[i].map === self.map){
                    SOCKET_LIST[i].emit('initEntity',self.getInitPack());
                }
            }
            for(var i = 0;i < 25;i++){
                var particle = new Particle({
                    x:self.x + Math.random() * self.width - self.width / 2,
                    y:self.y + Math.random() * self.height - self.height / 2,
                    map:self.map,
                    particleType:'teleport',
                });
            }
        }
        if(self.mapChange === 10){
            self.canMove = true;
            self.invincible = false;
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

StaticNpc = function(param){
    var self = Actor(param);
    self.map = param.map;
    self.id = param.entityId;
    self.entityId = param.entityId;
    self.name = param.name;
    self.type = 'StaticNpc';
    self.info = param.info;
    self.update = function(){

    }
	self.getUpdatePack = function(){
        return {};
	}
	self.getInitPack = function(){
        return {};
	}
	Npc.list[self.id] = self;
	return self;
}



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
    if(param.stats){
        for(var i in param.stats){
            self.stats[i] = param.stats[i];
        }
    }
    self.oldStats = JSON.parse(JSON.stringify(self.stats));
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
    self.attackPhase = 'passive';
    if(param.attackState){
        self.attackState = param.attackState;
    }
    if(param.aggro){
        self.aggro = param.aggro;
    }
    self.animation = 0;
    self.animate = false;
    self.pushResist = param.pushResist;
    self.itemDrops = param.itemDrops;
    self.healReload = 0;
    self.canChangeMap = false;
    self.damaged = false;
    self.damagedEntity = false;
    self.onHit = function(pt){
        if(pt.parent){
            self.target = Player.list[pt.parent];
            self.damagedEntity = pt;
            self.damaged = true;
            self.debuffInflicted = pt.parent;
        }
        else if(pt.type === 'Player'){
            self.target = pt;
            self.damagedEntity = pt;
            self.damaged = true;
            self.debuffInflicted = pt.id;
        }
    }
    self.debuffInflicted = false;
    self.immuneDebuffs = param.immuneDebuffs;
    self.randomWalk(true,false,self.x,self.y);
    self.boss = param.boss;
    self.stopAttackOnKill = true;
    if(self.monsterType === 'redCherryBomb'){
        self.stopAttackOnKill = false;
    }
    if(self.monsterType === 'blueCherryBomb'){
        self.stopAttackOnKill = false;
    }
    if(self.monsterType === 'deathBomb'){
        self.stopAttackOnKill = false;
    }
    if(self.monsterType === 'redBird'){
        addToChat('style="color: #ff00ff">','Red Bird has awoken!');
    }
    if(self.monsterType === 'lightningLizard'){
        addToChat('style="color: #ff00ff">','Lightning Lizard has awoken!');
    }
    if(self.monsterType === 'ghost'){
        self.canCollide = false;
    }
    if(self.monsterType === 'lostSpirit'){
        self.canCollide = false;
    }
    if(self.monsterType === 'possessedSpirit'){
        self.canCollide = false;
        addToChat('style="color: #ff00ff">','Possessed Spirit has awoken!');
        self.stage2 = false;
        self.stage3 = false;
    }
    if(self.monsterType === 'plantera'){
        self.canCollide = false;
        addToChat('style="color: #ff00ff">','Plantera has awoken!');
        self.stage2 = false;
        self.thorns = 0;
        self.randomWalk(false,false,self.x,self.y);
    }
    if(self.monsterType === 'thorn'){
        self.canCollide = false;
    }
    if(self.monsterType === 'whirlwind'){
        self.canCollide = false;
        addToChat('style="color: #ff00ff">','Whirlwind has awoken!');
        self.stage2 = false;
        self.randomWalk(false,false,self.x,self.y);
    }
    if(self.monsterType === 'sp'){
        self.canCollide = false;
        addToChat('style="color: #ff00ff">','sp has awoken!');
        self.dashSpdX = 0;
        self.dashSpdY = 0;
        self.stage2 = false;
        self.stage3 = false;
        self.stage4 = false;
        self.stage5 = false;
        self.firstDirection = 0;
        self.img = {
            body:[-1,-1,-1,0],
            shirt:[0,30,220,0.7],
            pants:[0,135,115,0.8],
            hair:[0,250,0,0.5],
            hairType:'shortHair',
        }
        self.animate = true;
        self.animation = 0;
        self.animationDirection = 'down';
        self.randomWalk(false,false,self.x,self.y);
    }
    if(self.monsterType === 'tianmuGuarder'){
        self.canCollide = false;
        addToChat('style="color: #ff00ff">','TianmuGuarder has awoken!');
        self.dashSpdX = 0;
        self.dashSpdY = 0;
        self.stage2 = false;
        self.stage3 = false;
        self.img = {
            body:[35,0,215,0],
            shirt:[245,5,0,0.5],
            pants:[0,230,20,0.6],
            hair:[5,0,245,0.4],
            hairType:'vikingHat',
        }
        self.animate = true;
        self.animation = 0;
        self.animationDirection = 'down';
    }
    if(self.monsterType === 'sampleprovidersp'){
        self.canCollide = false;
        addToChat('style="color: #ff00ff">','Sampleprovider(sp) has awoken!');
        self.dashSpdX = 0;
        self.dashSpdY = 0;
        self.stage2 = false;
        self.stage3 = false;
        self.img = {
            body:[250,0,0,1],
            shirt:[250,0,0,1],
            pants:[250,0,0,1],
            hair:[250,0,0,1],
            hairType:'longHat',
        }
        self.animate = true;
        self.animation = 0;
        self.animationDirection = 'down';
    }
    if(self.monsterType === 'suvanth'){
        self.canCollide = false;
        addToChat('style="color: #ff00ff">','Suvanth has awoken!');
        self.dashSpdX = 0;
        self.dashSpdY = 0;
        self.stage2 = false;
        self.stage3 = false;
        self.img = {
            body:[141,196,53,1],
            shirt:[141,196,53,1],
            pants:[141,196,53,1],
            hair:[141,196,53,1],
            hairType:'bald',
        }
        self.animate = true;
        self.animation = 0;
        self.animationDirection = 'down';
    }
    if(self.monsterType === 'spgem'){
        self.canCollide = false;
        self.dashSpdX = 0;
        self.dashSpdY = 0;
        self.stage2 = false;
    }
    if(self.monsterType === 'fireSpirit'){
        addToChat('style="color: #ff00ff">','Fire Spirit has awoken!');
        self.canCollide = false;
        self.stage2 = false;
    }
    if(self.monsterType === 'rocopter'){
        self.canCollide = false;
    }
    self.oldMaxSpeed = self.maxSpeed;
    self.oldHpMax = self.hpMax;
    var lastSelf = {};
    var super_update = self.update;
    self.update = function(){
        self.lastX = self.x;
        self.lastY = self.y;
        super_update();
        self.updateAnimation();
        if(self.animate){
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
        self.updateAttack();
        if(self.hp < 1){
            if(self.monsterType === 'redBird'){
                addToChat('style="color: #ff00ff">','Red Bird has been defeated!');
            }
            if(self.monsterType === 'lightningLizard'){
                addToChat('style="color: #ff00ff">','Lightning Lizard has been defeated!');
            }
            if(self.monsterType === 'possessedSpirit'){
                addToChat('style="color: #ff00ff">','Possessed Spirit has been defeated!');
                for(var i in Player.list){
                    if(Player.list[i].map === self.map){
                        Player.list[i].questStats["Possessed Spirit"] = true;
                    }
                }
            }
            if(self.monsterType === 'plantera'){
                addToChat('style="color: #ff00ff">','Plantera has been defeated!');
                for(var i in Player.list){
                    if(Player.list[i].map === self.map){
                        Player.list[i].questStats["Plantera"] = true;
                    }
                }
            }
            if(self.monsterType === 'whirlwind'){
                addToChat('style="color: #ff00ff">','Whirlwind has been defeated!');
                for(var i in Player.list){
                    if(Player.list[i].map === self.map){
                        Player.list[i].questStats["Whirlwind"] = true;
                    }
                }
            }
            if(self.monsterType === 'fireSpirit'){
                addToChat('style="color: #ff00ff">','Fire Spirit has been defeated!');
                for(var i in Player.list){
                    if(Player.list[i].map === self.map){
                        Player.list[i].questStats["Fire Spirit"] = true;
                    }
                }
            }
            if(self.monsterType === 'sp'){
                addToChat('style="color: #ff00ff">','sp has been defeated!');
                for(var i in Player.list){
                    if(Player.list[i].map === self.map){
                        Player.list[i].questStats["sp"] = true;
                    }
                }
            }
            if(self.monsterType === 'tianmuGuarder'){
                addToChat('style="color: #ff00ff">','TianmuGuarder has been defeated!');
            }
            if(self.monsterType === 'sampleprovidersp'){
                addToChat('style="color: #ff00ff">','Sampleprovider(sp) has been defeated!');
            }
            if(self.monsterType === 'suvanth'){
                addToChat('style="color: #ff00ff">','Suvanth has been defeated!');
            }
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
                        value:'+' + Math.round(heal),
                    });
                }
            }
        }
        self.healReload += 1;
        if(self.hp > self.hpMax){
            self.hp = self.hpMax;
        }
    }
    self.doMonsterAnimation = function(){
        switch(self.attackState){
            case "attackBird":
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
                if(self.animation === -1){
                    self.animation = 0;
                }
                else{
                    self.animation += 0.8;
                    if(self.animation > 5){
                        self.animation = 0;
                    }
                }
                break;
            case "attackCherryBomb":
                if(self.animation < 2){
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
                self.animation += 0.3;
                break;
            case "attackRedBird":
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
            case "attackLizard":
                if(self.spdX > 0){
                    if(self.animation !== -1){
                        self.animation += 0.2;
                    }
                    else{
                        self.animation = 0;
                    }
                    if(self.animation >= 2){
                        self.animation = 0;
                    }
                }
                else{
                    if(self.animation !== -1){
                        self.animation += 0.2;
                    }
                    else{
                        self.animation = 2;
                    }
                    if(self.animation >= 4){
                        self.animation = 2;
                    }
                }
                break;
            case "retreatLizard":
                if(self.spdX > 0){
                    if(self.animation >= 2){
                        self.animation = 0;
                    }
                    else if(self.animation !== -1){
                        self.animation += 0.2;
                    }
                    else{
                        self.animation = 0;
                    }
                }
                else{
                    if(self.animation >= 4){
                        self.animation = 2;
                    }
                    else if(self.animation !== -1){
                        self.animation += 0.2;
                    }
                    else{
                        self.animation = 2;
                    }
                }
                break;
            case "attackLightningLizard":
                if(self.spdX > 0){
                    if(self.animation !== -1){
                        self.animation += 0.2;
                    }
                    else{
                        self.animation = 0;
                    }
                    if(self.animation >= 2){
                        self.animation = 0;
                    }
                }
                else{
                    if(self.animation !== -1){
                        self.animation += 0.2;
                    }
                    else{
                        self.animation = 2;
                    }
                    if(self.animation >= 4){
                        self.animation = 2;
                    }
                }
                break;
            case "enragedLightningLizard":
                if(self.spdX > 0){
                    if(self.animation >= 2){
                        self.animation = 0;
                    }
                    else{
                        self.animation += 0.2;
                    }
                }
                else{
                    if(self.animation >= 4){
                        self.animation = 2;
                    }
                    else{
                        self.animation += 0.2;
                    }
                }
                break;
            case "attackGhost":
                if(self.animation === 1){
                    self.animation = 0;
                }
                else{
                    self.animation += 1;
                }
                break;
            case "attackLostSpirit":
                if(self.animation === 1){
                    self.animation = 0;
                }
                else{
                    self.animation += 1;
                }
                break;
            case "attackPhase1PossessedSpirit":
                if(self.animation === 1){
                    self.animation = 0;
                }
                else{
                    self.animation += 1;
                }
                break;
            case "phase2TransitionPossessedSpirit":
                if(self.animation === 1){
                    self.animation = 0;
                }
                else{
                    self.animation += 1;
                }
                break;
            case "attackPhase2PossessedSpirit":
                if(self.animation === 1){
                    self.animation = 0;
                }
                else{
                    self.animation += 1;
                }
                break;
            case "attackPhase3PossessedSpirit":
                if(self.animation === 1){
                    self.animation = 0;
                }
                else{
                    self.animation += 1;
                }
                break;
            case "attackPhase1Plantera":
                self.animation = 0;
                break;
            case "phase2TransitionPlantera":
                self.animation = 1;
                break;
            case "attackPhase2Plantera":
                self.animation = 1;
                break;
            case "attackThorn":
                if(self.animation === -1){
                    self.animation = 0;
                }
                else{
                    self.animation += 0.5;
                    if(self.animation > 36){
                        self.animation = 0;
                    }
                }
                break;
            case "attackLightningTurret":
                self.animation += 0.5;
                if(self.animation >= 4){
                    self.animation = 0;
                }
                break;
            case "attackLightningRammer":
                if(self.animation === -1){
                    self.animation = 0;
                }
                else{
                    self.animation += 0.5;
                    if(self.animation > 36){
                        self.animation = 0;
                    }
                }
                break;
            case "attackDeathBomb":
                if(self.animation < 2){
                    if(self.animation === 0){
                        self.animation = 1;
                    }
                    else if(self.animation === 1){
                        self.animation = 0;
                    }
                }
                break;
            case "explodeDeathBomb":
                if(self.animation === 0){
                    self.animation = 1;
                }
                self.animation += 0.3;
                break;
            case "attackPhase1Whirlwind":
                self.animation += 25;
                break;
            case "attackPhase2Whirlwind":
                self.animation += 50;
                break;
            case "attackCharredBird":
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
            case "attackPhase1FireSpirit":
                self.animation += 0.5;
                if(self.animation >= 4){
                    self.animation = 0;
                }
                break;
            case "attackPhase2FireSpirit":
                self.animation += 0.5;
                if(self.animation >= 4){
                    self.animation = 0;
                }
                break;
            case "attackRocopter":
                self.animation += 1;
                if(self.animation >= 4){
                    self.animation = 0;
                }
                break;
            case "attackCrab":
                self.animation += 1;
                if(self.animation >= 4){
                    self.animation = 0;
                }
                break;
            case "attackCyanBeetle":
                if(self.spdX < 0){
                    if(self.animation !== -1){
                        self.animation += 0.2;
                    }
                    else{
                        self.animation = 0;
                    }
                    if(self.animation >= 2){
                        self.animation = 0;
                    }
                }
                else{
                    if(self.animation !== -1){
                        self.animation += 0.2;
                    }
                    else{
                        self.animation = 2;
                    }
                    if(self.animation >= 4){
                        self.animation = 2;
                    }
                }
                break;
        }
    }
    self.updateAttack = function(){
        if(self.attackPhase === 'passive'){
            var attackState = self.attackState;
            self.attackState = 'attack' + param.attackState;
            self.doMonsterAnimation();
            self.attackState = attackState;
            var maxAggro = -10;
            for(var i in Player.list){
                if(Player.list[i].map === self.map && self.getSquareDistance(Player.list[i]) < 64 * self.aggro * Player.list[i].stats.aggro && Player.list[i].isDead === false && Player.list[i].invincible === false && Player.list[i].mapChange > 10 && Player.list[i].stats.aggro > maxAggro){
                    self.attackState = 'attack' + param.attackState;
                    self.attackPhase = 'attack';
                    self.target = Player.list[i];
                    maxAggro = Player.list[i].stats.aggro;
                    if(self.canCollide){
                        if(param.trackDistance === 'random'){
                            self.trackEntity(self.target,128 + 64 * Math.random());
                        }
                        else{
                            self.trackEntity(self.target,0);
                        }
                    }
                    else{
                        self.followEntity(self.target);
                    }
                    self.reload = 0;
                    self.animation = 0;
                }
            }
            if(self.damaged){
                self.attackState = 'attack' + param.attackState;
                self.attackPhase = 'attack';
                if(self.canCollide){
                    if(param.trackDistance === 'random'){
                        self.trackEntity(self.target,128 + 64 * Math.random());
                    }
                    else{
                        self.trackEntity(self.target,0);
                    }
                }
                else{
                    self.followEntity(self.target);
                }
                self.reload = 0;
                self.animation = 0;
            }
        }
        if(self.attackPhase === 'attack'){
            self.doMonsterAnimation();
            if(self.target){
                self.direction = Math.atan2(self.target.y - self.y,self.target.x - self.x) / Math.PI * 180;
            }
            var allPlayersDead = true;
            for(var i in Player.list){
                if(Player.list[i].hp > 0 && Player.list[i].map === self.map){
                    allPlayersDead = false;
                }
            }
            if(allPlayersDead && self.boss){
                self.toRemove = true;
            }
            if(!self.target){
                self.target = undefined;
                var maxAggro = -10;
                for(var i in Player.list){
                    if(Player.list[i].map === self.map && self.getSquareDistance(Player.list[i]) < 64 * self.aggro * Player.list[i].stats.aggro && Player.list[i].isDead === false && Player.list[i].invincible === false && Player.list[i].mapChange > 10 && Player.list[i].stats.aggro > maxAggro){
                        self.target = Player.list[i];
                        maxAggro = Player.list[i].stats.aggro;
                        if(self.canCollide){
                            if(param.trackDistance === 'random'){
                                self.trackEntity(self.target,128 + 64 * Math.random());
                            }
                            else{
                                self.trackEntity(self.target,0);
                            }
                        }
                        else{
                            self.followEntity(self.target);
                        }
                    }
                }
                if(self.target === undefined){
                    self.attackState = param.attackState;
                    self.attackPhase = 'passive';
                    self.damagedEntity = false;
                    self.damaged = false;
                    self.followingEntity = undefined;
                    self.trackingEntity = undefined;
                }
                return;
            }
            if(self.target.isDead && self.stopAttackOnKill){
                self.target = undefined;
                var maxAggro = -10;
                for(var i in Player.list){
                    if(Player.list[i].map === self.map && self.getSquareDistance(Player.list[i]) < 64 * self.aggro * Player.list[i].stats.aggro && Player.list[i].isDead === false && Player.list[i].invincible === false && Player.list[i].mapChange > 10 && Player.list[i].stats.aggro > maxAggro){
                        self.target = Player.list[i];
                        maxAggro = Player.list[i].stats.aggro;
                        if(self.canCollide){
                            if(param.trackDistance === 'random'){
                                self.trackEntity(self.target,128 + 64 * Math.random());
                            }
                            else{
                                self.trackEntity(self.target,0);
                            }
                        }
                        else{
                            self.followEntity(self.target);
                        }
                    }
                }
                if(self.target === undefined){
                    self.attackState = param.attackState;
                    self.attackPhase = 'passive';
                    self.damagedEntity = false;
                    self.damaged = false;
                    self.followingEntity = undefined;
                    self.trackingEntity = undefined;
                }
                return;
            }
            if(self.target.toRemove && self.stopAttackOnKill){
                self.target = undefined;
                var maxAggro = -10;
                for(var i in Player.list){
                    if(Player.list[i].map === self.map && self.getSquareDistance(Player.list[i]) < 64 * self.aggro * Player.list[i].stats.aggro && Player.list[i].isDead === false && Player.list[i].invincible === false && Player.list[i].mapChange > 10 && Player.list[i].stats.aggro > maxAggro){
                        self.target = Player.list[i];
                        maxAggro = Player.list[i].stats.aggro;
                        if(self.canCollide){
                            if(param.trackDistance === 'random'){
                                self.trackEntity(self.target,128 + 64 * Math.random());
                            }
                            else{
                                self.trackEntity(self.target,0);
                            }
                        }
                        else{
                            self.followEntity(self.target);
                        }
                    }
                }
                if(self.target === undefined){
                    self.attackState = param.attackState;
                    self.attackPhase = 'passive';
                    self.damagedEntity = false;
                    self.damaged = false;
                    self.followingEntity = undefined;
                    self.trackingEntity = undefined;
                }
                return;
            }
            if(self.getSquareDistance(self.target) > self.target.stats.aggro * self.aggro * 64 * 2 && self.boss === false && self.attackState.includes('explode') === false){
                self.target = undefined;
                var maxAggro = -10;
                for(var i in Player.list){
                    if(Player.list[i].map === self.map && self.getSquareDistance(Player.list[i]) < 64 * self.aggro * Player.list[i].stats.aggro && Player.list[i].isDead === false && Player.list[i].invincible === false && Player.list[i].mapChange > 10 && Player.list[i].stats.aggro > maxAggro){
                        self.target = Player.list[i];
                        maxAggro = Player.list[i].stats.aggro;
                        if(self.canCollide){
                            if(param.trackDistance === 'random'){
                                self.trackEntity(self.target,128 + 64 * Math.random());
                            }
                            else{
                                self.trackEntity(self.target,0);
                            }
                        }
                        else{
                            self.followEntity(self.target);
                        }
                    }
                }
                if(self.target === undefined){
                    self.attackState = param.attackState;
                    self.attackPhase = 'passive';
                    self.damagedEntity = false;
                    self.damaged = false;
                    self.followingEntity = undefined;
                    self.trackingEntity = undefined;
                }
                return;
            }
            switch(self.attackState){
                case "attackBird":
                    if(self.reload % 20 === 0 && self.reload > 10 && self.target.invincible === false){
                        self.shootProjectile(self.id,'Monster',self.direction,self.direction,'ninjaStar',0,function(t){return 25},0,self.stats);
                    }
                    if(self.reload % 100 < 5 && self.reload > 10 && self.target.invincible === false){
                        self.shootProjectile(self.id,'Monster',self.direction,self.direction,'ninjaStar',0,function(t){return 25},0,self.stats);
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
                            self.trackEntity(bestSpawner,128);
                        }
                    }
                    if(self.hp > 0.8 * self.hpMax){
                        self.attackState = 'Bird';
                        self.attackPhase = 'passive';
                        self.maxSpeed = param.moveSpeed;
                        self.target = undefined;
                        self.trackingEntity = undefined;
                        self.followingEntity = undefined;
                    }
                    break;
                case "attackBall":
                    if(self.reload % 60 < 16 && self.reload > 49 && self.target.invincible === false){
                        if(ENV.Difficulty === 'Expert'){
                            self.maxSpeed = self.oldMaxSpeed * 5;
                        }
                        self.animation += 0.5;
                        if(self.animation >= 8){
                            self.animation = 0;
                        }
                        for(var i = 0;i < 4;i++){
                            self.shootProjectile(self.id,'Monster',self.animation * 45 + i * 90,self.animation * 45 + i * 90,'ballBullet',-20,function(t){return 25},0,self.stats);
                        }
                    }
                    else{
                        self.maxSpeed = self.oldMaxSpeed;
                    }
                    self.reload += 1;
                    break;
                case "attackCherryBomb":
                    self.reload += 1;
                    if(self.getSquareDistance(self.target) < 64){
                        if(self.target.mapChange !== undefined){
                            if(self.target.mapChange > 10){
                                self.stats.defense += 2000000;
                                self.stats.attack += 2000000;
                                self.oldStats.defense += 2000000;
                                self.oldStats.attack += 2000000;
                                self.attackState = 'explodeCherryBomb';
                                self.target = undefined;
                                self.trackingEntity = undefined;
                                self.randomWalk(false,false,self.x,self.y);
                                self.spdX = 0;
                                self.spdY = 0;
                            }
                        }
                        else{
                            self.stats.defense += 2000000;
                            self.stats.attack += 2000000;
                            self.oldStats.defense += 2000000;
                            self.oldStats.attack += 2000000;
                            self.attackState = 'explodeCherryBomb';
                            self.target = undefined;
                            self.trackingEntity = undefined;
                            self.randomWalk(false,false,self.x,self.y);
                            self.spdX = 0;
                            self.spdY = 0;
                        }
                        break;
                    }
                    if(self.damaged && self.damagedEntity.type === 'Player'){
                        self.stats.defense += 2000000;
                        self.stats.attack += 2000000;
                        self.oldStats.defense += 2000000;
                        self.oldStats.attack += 2000000;
                        self.attackState = 'explodeCherryBomb';
                        self.target = undefined;
                        self.trackingEntity = undefined;
                        self.randomWalk(false,false,self.x,self.y);
                        self.spdX = 0;
                        self.spdY = 0;
                    }
                    break;
                case "explodeCherryBomb":
                    self.trackingEntity = undefined;
                    if(self.animation > 4){
                        self.width = 18 * 8;
                        self.height = 18 * 8;
                        self.pushPower = 30;
                    }
                    if(self.animation > 4.5){
                        param.onDeath(self);
                    }
                    self.spdX = 0;
                    self.spdY = 0;
                    self.x = self.lastX;
                    self.y = self.lastY;
                    break;
                case "attackRedBird":
                    if(self.reload % 20 === 0 && self.reload > 10 && self.target.invincible === false){
                        self.shootProjectile(self.id,'Monster',self.direction - 5,self.direction - 5,'fireBullet',0,function(t){return 0},0,self.stats);
                        self.shootProjectile(self.id,'Monster',self.direction + 5,self.direction + 5,'fireBullet',0,function(t){return 0},0,self.stats);
                    }
                    if(self.reload % 100 < 5 && self.reload > 10 && self.target.invincible === false){
                        self.shootProjectile(self.id,'Monster',self.direction - 60,self.direction - 60,'fireBullet',32,function(t){return 25},0,self.stats,'playerHoming');
                        self.shootProjectile(self.id,'Monster',self.direction,self.direction,'fireBullet',32,function(t){return 25},0,self.stats,'playerHoming');
                        self.shootProjectile(self.id,'Monster',self.direction + 60,self.direction + 60,'fireBullet',32,function(t){return 25},0,self.stats,'playerHoming');
                    }
                    if(self.reload % 150 < 5 && self.reload > 10 && self.target.invincible === false){
                        for(var i = 0;i < 6;i++){
                            self.shootProjectile(self.id,'Monster',self.direction + i * 60,self.direction + i * 60,'fireBullet',32,function(t){return 25},0,self.stats,'playerHoming');
                        }
                    }
                    self.reload += 1;
                    break;
                case "attackLizard":
                    if(self.reload % 10 === 0 && self.reload > 10 && self.target.invincible === false && ENV.Difficulty !== 'Expert'){
                        self.shootProjectile(self.id,'Monster',self.direction,self.direction,'lizardSpit',0,function(t){return 0},0,self.stats);
                    }
                    if(self.reload % 10 === 0 && self.reload > 10 && self.target.invincible === false && ENV.Difficulty === 'Expert'){
                        self.shootProjectile(self.id,'Monster',self.direction,self.direction,'lizardSpit',0,function(t){return 0},0,self.stats,'playerHoming');
                    }
                    self.reload += 1;
                    if(self.hp < 0.3 * self.hpMax && ENV.Difficulty !== 'Expert'){
                        if(Spawner.list[self.spawnId]){
                            self.attackState = 'retreatLizard';
                            self.maxSpeed *= 1.5;
                            self.damaged = false;
                        }
                        break;
                    }
                    break;
                case "retreatLizard":
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
                            self.trackEntity(bestSpawner,128);
                        }
                    }
                    if(self.hp > 0.8 * self.hpMax){
                        self.attackState = 'Lizard';
                        self.attackPhase = 'passive';
                        self.maxSpeed = param.moveSpeed;
                        self.target = undefined;
                        self.trackingEntity = undefined;
                        self.followingEntity = undefined;
                    }
                    break;
                case "attackLightningLizard":
                    self.trackEntity(self.target,0);
                    if(self.reload % 10 === 0 && self.reload > 10 && self.target.invincible === false && ENV.Difficulty !== 'Expert'){
                        self.shootProjectile(self.id,'Monster',self.direction,self.direction,'lightningSpit',0,function(t){return 0},0,self.stats);
                    }
                    if(self.reload % 10 === 0 && self.reload > 10 && self.target.invincible === false && ENV.Difficulty === 'Expert'){
                        self.shootProjectile(self.id,'Monster',self.direction,self.direction,'lightningSpit',0,function(t){return 0},0,self.stats,'playerHoming');
                    }
                    if((self.reload % 50) % 5 === 0 && self.reload % 100 < 20 && self.reload > 50 && self.target.invincible === false){
                        for(var i = 0;i < 4;i++){
                            var projectileWidth = 0;
                            var projectileHeight = 0;
                            var projectileStats = {};
                            for(var j in projectileData){
                                if(j === 'lightningSpit'){
                                    projectileWidth = projectileData[j].width;
                                    projectileHeight = projectileData[j].height;
                                    projectileStats = Object.create(projectileData[j].stats);
                                }
                            }
                            for(var j in projectileStats){
                                projectileStats[j] *= self.stats[j];
                            }
                            projectileStats.damageReduction = 0;
                            projectileStats.debuffs = self.stats.debuffs;
                            var projectile = Projectile({
                                id:self.id,
                                projectileType:'lightningSpit',
                                angle:i * 90,
                                direction:i * 90,
                                x:self.target.x - Math.cos(i / 2 * Math.PI) * 256,
                                y:self.target.y - Math.sin(i / 2 * Math.PI) * 256,
                                map:self.map,
                                parentType:'Monster',
                                mapWidth:self.mapWidth,
                                mapHeight:self.mapHeight,
                                width:projectileWidth,
                                height:projectileHeight,
                                spin:function(t){return 0},
                                pierce:0,
                                stats:projectileStats,
                                projectilePattern:'lightningStrike',
                                onCollision:function(self,pt){
                                    if(self.pierce === 0){
                                        self.toRemove = true;
                                    }
                                    else{
                                        self.pierce -= 1;
                                    }
                                }
                            });
                        }
                    }
                    self.reload += 1;
                    if(self.map === 'The Forest'){
                        self.attackState = 'enragedLightningLizard';
                        addToChat('style="color: #ff00ff">','Lightning Lizard has enraged.');
                        self.itemDrops = {
                            "lightningsaber":0.25,
                            "lightningwand":0.25,
                            "bookoflightning":0.25,
                            "shieldoflightning":0.25,
                            "thetoothoflightning":0.01,
                        };
                    }
                    break;
                case "enragedLightningLizard":
                    self.trackEntity(self.target,0);
                    if(self.reload % 10 === 0 && self.reload > 10 && self.target.invincible === false && ENV.Difficulty !== 'Expert'){
                        self.shootProjectile(self.id,'Monster',self.direction,self.direction,'lightningSpit',0,function(t){return 0},0,self.stats);
                    }
                    if(self.reload % 10 === 0 && self.reload > 10 && self.target.invincible === false && ENV.Difficulty === 'Expert'){
                        self.shootProjectile(self.id,'Monster',self.direction,self.direction,'lightningSpit',0,function(t){return 0},0,self.stats,'playerHoming');
                    }
                    if(self.reload % 3 === 0 && self.reload > 50 && self.target.invincible === false && ENV.Difficulty !== 'Expert'){
                        for(var i = 0;i < 4;i++){
                            var projectileWidth = 0;
                            var projectileHeight = 0;
                            var projectileStats = {};
                            for(var j in projectileData){
                                if(j === 'lightningSpit'){
                                    projectileWidth = projectileData[j].width;
                                    projectileHeight = projectileData[j].height;
                                    projectileStats = Object.create(projectileData[j].stats);
                                }
                            }
                            for(var j in projectileStats){
                                projectileStats[j] *= self.stats[j];
                            }
                            projectileStats.damageReduction = 0;
                            projectileStats.debuffs = self.stats.debuffs;
                            var projectile = Projectile({
                                id:self.id,
                                projectileType:'lightningSpit',
                                angle:i * 90,
                                direction:i * 90,
                                x:self.target.x - Math.cos(i / 2 * Math.PI) * 256,
                                y:self.target.y - Math.sin(i / 2 * Math.PI) * 256,
                                map:self.map,
                                parentType:'Monster',
                                mapWidth:self.mapWidth,
                                mapHeight:self.mapHeight,
                                width:projectileWidth,
                                height:projectileHeight,
                                spin:function(t){return 0},
                                pierce:0,
                                stats:projectileStats,
                                projectilePattern:'lightningStrike',
                                onCollision:function(self,pt){
                                    if(self.pierce === 0){
                                        self.toRemove = true;
                                    }
                                    else{
                                        self.pierce -= 1;
                                    }
                                }
                            });
                        }
                    }
                    if(self.reload % 3 === 0 && self.target.invincible === false && ENV.Difficulty === 'Expert'){
                        for(var i = 0;i < 4;i++){
                            var projectileWidth = 0;
                            var projectileHeight = 0;
                            var projectileStats = {};
                            for(var j in projectileData){
                                if(j === 'lightningSpit'){
                                    projectileWidth = projectileData[j].width;
                                    projectileHeight = projectileData[j].height;
                                    projectileStats = Object.create(projectileData[j].stats);
                                }
                            }
                            for(var j in projectileStats){
                                projectileStats[j] *= self.stats[j];
                            }
                            projectileStats.damageReduction = 0;
                            projectileStats.debuffs = self.stats.debuffs;
                            var projectile = Projectile({
                                id:self.id,
                                projectileType:'lightningSpit',
                                angle:i * 90,
                                direction:i * 90,
                                x:self.target.x - Math.cos(i / 2 * Math.PI) * 256,
                                y:self.target.y - Math.sin(i / 2 * Math.PI) * 256,
                                map:self.map,
                                parentType:'Monster',
                                mapWidth:self.mapWidth,
                                mapHeight:self.mapHeight,
                                width:projectileWidth,
                                height:projectileHeight,
                                spin:function(t){return 0},
                                pierce:0,
                                stats:projectileStats,
                                projectilePattern:'lightningStrike',
                                onCollision:function(self,pt){
                                    if(self.pierce === 0){
                                        self.toRemove = true;
                                    }
                                    else{
                                        self.pierce -= 1;
                                    }
                                }
                            });
                        }
                    }
                    self.reload += 1;
                    break;
                case "attackGhost":
                    self.reload += 1;
                    break;
                case "attackLostSpirit":
                    if(self.reload % 20 === 0 && self.reload > 20 && self.target.invincible === false){
                        self.shootProjectile(self.id,'Monster',self.direction,self.direction,'soul',0,function(t){return 0},0,self.stats,'playerHoming');
                    }
                    self.reload += 1;
                    break;
                case "attackPhase1PossessedSpirit":
                    if(self.reload % 50 < 8 && self.reload > 50 && self.target.invincible === false){
                        self.shootProjectile(self.id,'Monster',10 * (self.reload % 50),10 * (self.reload % 50),'possessedSoul',128,function(t){return 50},0,self.stats,'noCollision');
                        self.shootProjectile(self.id,'Monster',10 * (self.reload % 50) + 90,10 * (self.reload % 50) + 90,'possessedSoul',128,function(t){return 50},0,self.stats,'noCollision');
                        self.shootProjectile(self.id,'Monster',10 * (self.reload % 50) + 180,10 * (self.reload % 50) + 180,'possessedSoul',128,function(t){return 50},0,self.stats,'noCollision');
                        self.shootProjectile(self.id,'Monster',10 * (self.reload % 50) + 270,10 * (self.reload % 50) + 270,'possessedSoul',128,function(t){return 50},0,self.stats,'noCollision');
                        self.shootProjectile(self.id,'Monster',10 * (self.reload % 50) + 10,10 * (self.reload % 50) + 10,'possessedSoul',128,function(t){return 50},0,self.stats,'noCollision');
                        self.shootProjectile(self.id,'Monster',10 * (self.reload % 50) + 100,10 * (self.reload % 50) + 100,'possessedSoul',128,function(t){return 50},0,self.stats,'noCollision');
                        self.shootProjectile(self.id,'Monster',10 * (self.reload % 50) + 190,10 * (self.reload % 50) + 190,'possessedSoul',128,function(t){return 50},0,self.stats,'noCollision');
                        self.shootProjectile(self.id,'Monster',10 * (self.reload % 50) + 280,10 * (self.reload % 50) + 280,'possessedSoul',128,function(t){return 50},0,self.stats,'noCollision');
                    }
                    if(self.hp < self.hpMax / 2){
                        if(self.stage2){
                            self.attackState = 'attackPhase2PossessedSpirit';
                        }
                        else{
                            self.attackState = 'phase2TransitionPossessedSpirit';
                        }
                    }
                    self.reload += 1;
                    break;
                case "phase2TransitionPossessedSpirit":
                    self.stage2 = true;
                    for(var i = 0;i < 30;i++){
                        self.shootProjectile(self.id,'Monster',i * 12,i * 12,'possessedSoul',128,function(t){return 50},0,self.stats,'noCollision');
                    }
                    for(var i = 0;i < 8;i++){
                        var monster = s.createMonster('lostSpirit',{
                            x:self.x + Math.cos(i * Math.PI / 4) * 256,
                            y:self.y + Math.sin(i * Math.PI / 4) * 256,
                            map:self.map,
                        });
                        monster.stats.hp *= 2;
                    }
                    self.maxSpeed = self.oldMaxSpeed * 3;
                    self.stats.attack = self.oldStats.attack * 1.5;
                    self.attackState = 'attackPhase2PossessedSpirit';
                    break;
                case "attackPhase2PossessedSpirit":
                    if(self.reload % 30 < 8 && self.reload > 30 && self.target.invincible === false){
                        self.shootProjectile(self.id,'Monster',10 * (self.reload % 30),10 * (self.reload % 30),'possessedSoul',128,function(t){return 50},0,self.stats,'noCollision');
                        self.shootProjectile(self.id,'Monster',10 * (self.reload % 30) + 90,10 * (self.reload % 30) + 90,'possessedSoul',128,function(t){return 50},0,self.stats,'noCollision');
                        self.shootProjectile(self.id,'Monster',10 * (self.reload % 30) + 180,10 * (self.reload % 30) + 180,'possessedSoul',128,function(t){return 50},0,self.stats,'noCollision');
                        self.shootProjectile(self.id,'Monster',10 * (self.reload % 30) + 270,10 * (self.reload % 30) + 270,'possessedSoul',128,function(t){return 50},0,self.stats,'noCollision');
                        self.shootProjectile(self.id,'Monster',10 * (self.reload % 30) + 10,10 * (self.reload % 30) + 10,'possessedSoul',128,function(t){return 50},0,self.stats,'noCollision');
                        self.shootProjectile(self.id,'Monster',10 * (self.reload % 30) + 100,10 * (self.reload % 30) + 100,'possessedSoul',128,function(t){return 50},0,self.stats,'noCollision');
                        self.shootProjectile(self.id,'Monster',10 * (self.reload % 30) + 190,10 * (self.reload % 30) + 190,'possessedSoul',128,function(t){return 50},0,self.stats,'noCollision');
                        self.shootProjectile(self.id,'Monster',10 * (self.reload % 30) + 280,10 * (self.reload % 30) + 280,'possessedSoul',128,function(t){return 50},0,self.stats,'noCollision');
                    }
                    if(self.reload % 5 === 0 && self.reload > 30 && self.target.invincible === false){
                        self.shootProjectile(self.id,'Monster',self.direction,self.direction,'possessedSoul',0,function(t){return 50},0,self.stats,'playerHoming');
                    }
                    if(self.hp < self.hpMax / 6 && ENV.Difficulty === 'Expert'){
                        if(self.stage3){
                            self.attackState = 'attackPhase2PossessedSpirit';
                        }
                        else{
                            self.attackState = 'attackPhase3PossessedSpirit';
                            for(var i = 0;i < 16;i++){
                                var monster = s.createMonster('lostSpirit',{
                                    x:self.x + Math.cos(i * Math.PI / 8) * 256,
                                    y:self.y + Math.sin(i * Math.PI / 8) * 256,
                                    map:self.map,
                                });
                                monster.stats.hp *= 3;
                            }
                            self.stage3 = true;
                            self.stats.attack = self.oldStats.attack * 1.8;
                        }
                    }
                    self.reload += 1;
                    break;
                case "attackPhase3PossessedSpirit":
                    if(self.reload % 3 === 0 && self.target.invincible === false){
                        self.shootProjectile(self.id,'Monster',10 * (self.reload % 30),10 * (self.reload % 30),'possessedSoul',128,function(t){return 50},0,self.stats,'noCollision');
                        self.shootProjectile(self.id,'Monster',10 * (self.reload % 30) + 90,10 * (self.reload % 30) + 90,'possessedSoul',128,function(t){return 50},0,self.stats,'noCollision');
                        self.shootProjectile(self.id,'Monster',10 * (self.reload % 30) + 180,10 * (self.reload % 30) + 180,'possessedSoul',128,function(t){return 50},0,self.stats,'noCollision');
                        self.shootProjectile(self.id,'Monster',10 * (self.reload % 30) + 270,10 * (self.reload % 30) + 270,'possessedSoul',128,function(t){return 50},0,self.stats,'noCollision');
                        self.shootProjectile(self.id,'Monster',10 * (self.reload % 30) + 10,10 * (self.reload % 30) + 10,'possessedSoul',128,function(t){return 50},0,self.stats,'noCollision');
                        self.shootProjectile(self.id,'Monster',10 * (self.reload % 30) + 100,10 * (self.reload % 30) + 100,'possessedSoul',128,function(t){return 50},0,self.stats,'noCollision');
                        self.shootProjectile(self.id,'Monster',10 * (self.reload % 30) + 190,10 * (self.reload % 30) + 190,'possessedSoul',128,function(t){return 50},0,self.stats,'noCollision');
                        self.shootProjectile(self.id,'Monster',10 * (self.reload % 30) + 280,10 * (self.reload % 30) + 280,'possessedSoul',128,function(t){return 50},0,self.stats,'noCollision');
                    }
                    self.reload += 1;
                    break;
                case "attackPhase1Plantera":
                    self.direction = 0;
                    self.spdX = 0;
                    self.spdY = 0;
                    self.followingEntity = undefined;
                    self.trackingEntity = undefined;
                    if(self.stage2){
                        self.attackState = 'attackPhase2Plantera';
                        self.followEntity(self.target);
                    }
                    if(self.hp < self.hpMax / 2){
                        if(self.stage2){
                            self.attackState = 'attackPhase2Plantera';
                            self.followEntity(self.target);
                        }
                        else{
                            self.attackState = 'phase2TransitionPlantera';
                        }
                    }
                    self.reload += 1;
                    break;
                case "phase2TransitionPlantera":
                    self.stage2 = true;
                    for(var i = 0;i < 30;i++){
                        self.shootProjectile(self.id,'Monster',self.direction + i * 12,self.direction + i * 12,'seed',0,function(t){return 0},0,self.stats,'noCollision');
                    }
                    for(var i = 0;i < 16;i++){
                        var monster = s.createMonster('thorn',{
                            x:self.x + Math.cos(i * Math.PI / 8) * 256,
                            y:self.y + Math.sin(i * Math.PI / 8) * 256,
                            map:self.map,
                        });
                        monster.parent = self.id;
                        monster.onDeath = function(pt){
                            pt.toRemove = true;
                            for(var i in Projectile.list){
                                if(Projectile.list[i].parent === pt.id){
                                    Projectile.list[i].toRemove = true;
                                }
                            }
                            if(Monster.list[pt.parent]){
                                Monster.list[pt.parent].thorns -= 1;
                            }
                        };
                        self.thorns += 1;
                    }
                    self.oldHpMax *= 50;
                    self.hpMax *= 50;
                    self.hp *= 50;
                    self.stats.damageReduction = 0.5;
                    self.oldStats.damageReduction = 0.5;
                    self.maxSpeed = self.oldMaxSpeed * 3;
                    self.followEntity(self.target);
                    self.reload = 0;
                    self.attackState = 'attackPhase2Plantera';
                    break;
                case "attackPhase2Plantera":
                    if(self.reload % 30 === 0 && self.reload > 20 && self.target.invincible === false && self.thorns === 0){
                        for(var i = 0;i < 16;i++){
                            var monster = s.createMonster('thorn',{
                                x:self.x + Math.cos(i * Math.PI / 8) * 256,
                                y:self.y + Math.sin(i * Math.PI / 8) * 256,
                                map:self.map,
                            });
                            monster.parent = self.id;
                            monster.onDeath = function(pt){
                                pt.toRemove = true;
                                for(var i in Projectile.list){
                                    if(Projectile.list[i].parent === pt.id){
                                        Projectile.list[i].toRemove = true;
                                    }
                                }
                                if(Monster.list[pt.parent]){
                                    Monster.list[pt.parent].thorns -= 1;
                                }
                            };
                            self.thorns += 1;
                        }
                    }
                    if(self.reload % 5 === 0 && self.reload > 20 && self.target.invincible === false){
                        self.shootProjectile(self.id,'Monster',self.direction,self.direction,'seed',0,function(t){return 0},0,self.stats,'seed');
                    }
                    if(self.reload % 50 === 0 && self.reload > 20 && self.target.invincible === false){
                        for(var i = 0;i < 30;i++){
                            self.shootProjectile(self.id,'Monster',self.direction + i * 12,self.direction + i * 12,'seed',0,function(t){return 0},0,self.stats,'noCollision');
                        }
                    }
                    self.reload += 1;
                    //self.direction = Math.atan2(self.spdY,self.spdX) / Math.PI * 180;
                    break;
                case "attackThorn":
                    self.reload += 1;
                    if(self.getSquareDistance(self.target) < 64 && ENV.Difficulty === 'Expert'){
                        if(self.target.mapChange !== undefined){
                            if(self.target.mapChange > 10){
                                self.stats.defense += 2000000;
                                self.stats.attack += 2000000;
                                self.oldStats.defense += 2000000;
                                self.oldStats.attack += 2000000;
                                self.attackState = 'explodeDeathBomb';
                                self.monsterType = 'deathBomb';
                                self.target = undefined;
                                self.trackingEntity = undefined;
                                self.randomWalk(false,false,self.x,self.y);
                                self.spdX = 0;
                                self.spdY = 0;
                            }
                        }
                        else{
                            self.stats.defense += 2000000;
                            self.stats.attack += 2000000;
                            self.attackState = 'explodeDeathBomb';
                        }
                        break;
                    }
                    break;
                case "attackLightningTurret":
                    if(self.reload % 10 === 0 && self.reload > 5 && self.target.invincible === false){
                        self.shootProjectile(self.id,'Monster',self.direction,self.direction,'lightningSpit',0,function(t){return 0},0,self.stats);
                    }
                    self.reload += 1;
                    break;
                case "attackLightningRammer":
                    if(self.reload % 40 < 10 && self.target.invincible === false && ENV.Difficulty === 'Expert'){
                        self.stats.defense += 50;
                        self.maxSpeed = self.oldMaxSpeed + 50;
                    }
                    else if(ENV.Difficulty === 'Expert'){
                        self.stats.defense = self.oldStats.defense;
                        self.maxSpeed = self.oldMaxSpeed;
                    }
                    self.reload += 1;
                    break;
                case "attackDeathBomb":
                    self.trackEntity(self.target,0);
                    self.reload += 1;
                    if(self.reload % 20 === 0 && self.reload > 20 && self.target.invincible === false && self.hp < self.hpMax / 2){
                        for(var i = 0;i < 8;i++){
                            self.shootProjectile(self.id,'Monster',i * 45,i * 45,'unholySoul',45,function(t){return 0},0,self.stats,'seed');
                        }
                    }
                    if(self.getSquareDistance(self.target) < 64){
                        if(self.target.mapChange !== undefined){
                            if(self.target.mapChange > 10){
                                self.stats.defense += 2000000;
                                self.stats.attack += 2000000;
                                self.oldStats.defense += 2000000;
                                self.oldStats.attack += 2000000;
                                self.attackState = 'explodeDeathBomb';
                                self.target = undefined;
                                self.trackingEntity = undefined;
                                self.randomWalk(false,false,self.x,self.y);
                                self.spdX = 0;
                                self.spdY = 0;
                            }
                        }
                        else{
                            self.stats.defense += 2000000;
                            self.stats.attack += 2000000;
                            self.oldStats.defense += 2000000;
                            self.oldStats.attack += 2000000;
                            self.attackState = 'explodeDeathBomb';
                            self.target = undefined;
                            self.trackingEntity = undefined;
                            self.randomWalk(false,false,self.x,self.y);
                            self.spdX = 0;
                            self.spdY = 0;
                        }
                        break;
                    }
                    if(self.damaged && self.damagedEntity.type === 'Player'){
                        self.stats.defense += 2000000;
                        self.stats.attack += 2000000;
                        self.oldStats.defense += 2000000;
                        self.oldStats.attack += 2000000;
                        self.attackState = 'explodeDeathBomb';
                        self.target = undefined;
                        self.trackingEntity = undefined;
                        self.randomWalk(false,false,self.x,self.y);
                        self.spdX = 0;
                        self.spdY = 0;
                    }
                    break;
                case "explodeDeathBomb":
                    self.trackingEntity = undefined;
                    if(self.animation > 4){
                        self.width = 18 * 8;
                        self.height = 18 * 8;
                        self.pushPower = 30;
                    }
                    if(self.animation > 5){
                        param.onDeath(self);
                        for(var i = 0;i < 8;i++){
                            self.shootProjectile(self.id,'Monster',i * 45,i * 45,'unholySoul',45,function(t){return 0},0,self.stats);
                        }
                    }
                    self.spdX = 0;
                    self.spdY = 0;
                    self.x = self.lastX;
                    self.y = self.lastY;
                    break;
                case "attackPhase1Whirlwind":
                    if(self.reload % 10 === 0 && self.reload > 10 && self.target.invincible === false && ENV.Difficulty !== 'Expert'){
                        self.shootProjectile(self.id,'Monster',self.direction,self.direction,'waterBullet',0,function(t){return 25},0,self.stats);
                    }
                    if(self.reload % 10 === 0 && self.reload > 10 && self.target.invincible === false && ENV.Difficulty === 'Expert'){
                        self.shootProjectile(self.id,'Monster',self.direction,self.direction,'waterBullet',0,function(t){return 25},0,self.stats,'noCollision');
                    }
                    if((self.reload % 50) % 5 === 0 && self.reload % 100 < 20 && self.reload > 50 && self.target.invincible === false){
                        for(var i = 0;i < 18;i++){
                            var projectileWidth = 0;
                            var projectileHeight = 0;
                            var projectileStats = {};
                            for(var j in projectileData){
                                if(j === 'waterBullet'){
                                    projectileWidth = projectileData[j].width;
                                    projectileHeight = projectileData[j].height;
                                    projectileStats = Object.create(projectileData[j].stats);
                                }
                            }
                            for(var j in projectileStats){
                                projectileStats[j] *= self.stats[j];
                            }
                            projectileStats.damageReduction = 0;
                            projectileStats.debuffs = self.stats.debuffs;
                            projectileStats.speed *= 0.1;
                            projectileStats.speed *= 2;
                            var projectile = Projectile({
                                id:self.id,
                                projectileType:'waterBullet',
                                angle:i * 20 + 180,
                                direction:i * 20,
                                x:self.target.x - Math.cos(i / 10 * Math.PI) * 128,
                                y:self.target.y - Math.sin(i / 10 * Math.PI) * 128,
                                map:self.map,
                                parentType:'Monster',
                                mapWidth:self.mapWidth,
                                mapHeight:self.mapHeight,
                                width:projectileWidth,
                                height:projectileHeight,
                                spin:function(t){return 25},
                                pierce:0,
                                stats:projectileStats,
                                projectilePattern:'accellerateNoCollision',
                                onCollision:function(self,pt){
                                    if(self.pierce === 0){
                                        self.toRemove = true;
                                    }
                                    else{
                                        self.pierce -= 1;
                                    }
                                }
                            });
                        }
                        self.maxSpeed *= 3;
                    }
                    if(self.reload % 100 > 80){
                        self.animation += 50;
                    }
                    self.reload += 1;
                    if(self.hp < self.hpMax / 2){
                        self.attackState = 'attackPhase2Whirlwind';
                        for(var i = 0;i < 18;i++){
                            var projectileWidth = 0;
                            var projectileHeight = 0;
                            var projectileStats = {};
                            for(var j in projectileData){
                                if(j === 'waterBullet'){
                                    projectileWidth = projectileData[j].width;
                                    projectileHeight = projectileData[j].height;
                                    projectileStats = Object.create(projectileData[j].stats);
                                }
                            }
                            for(var j in projectileStats){
                                projectileStats[j] *= self.stats[j];
                            }
                            projectileStats.damageReduction = 0;
                            projectileStats.debuffs = self.stats.debuffs;
                            projectileStats.speed *= 0.1;
                            projectileStats.speed *= 2;
                            var projectile = Projectile({
                                id:self.id,
                                projectileType:'waterBullet',
                                angle:i * 20 + 180,
                                direction:i * 20,
                                x:self.target.x - Math.cos(i / 10 * Math.PI) * 128,
                                y:self.target.y - Math.sin(i / 10 * Math.PI) * 128,
                                map:self.map,
                                parentType:'Monster',
                                mapWidth:self.mapWidth,
                                mapHeight:self.mapHeight,
                                width:projectileWidth,
                                height:projectileHeight,
                                spin:function(t){return 25},
                                pierce:0,
                                stats:projectileStats,
                                projectilePattern:'accellerateNoCollision',
                                onCollision:function(self,pt){
                                    if(self.pierce === 0){
                                        self.toRemove = true;
                                    }
                                    else{
                                        self.pierce -= 1;
                                    }
                                }
                            });
                        }
                    }
                    break;
                case "attackPhase2Whirlwind":
                    if(self.reload % 10 === 0 && self.reload > 10 && self.target.invincible === false && ENV.Difficulty !== 'Expert'){
                        for(var i = 0;i < 8;i++){
                            self.shootProjectile(self.id,'Monster',self.direction + i * 45,self.direction + i * 45,'waterBullet',0,function(t){return 25},0,self.stats);
                        }
                    }
                    if(self.reload % 10 === 0 && self.reload > 10 && self.target.invincible === false && ENV.Difficulty === 'Expert'){
                        for(var i = 0;i < 8;i++){
                            self.shootProjectile(self.id,'Monster',self.direction + i * 45,self.direction + i * 45,'waterBullet',0,function(t){return 25},0,self.stats,'noCollision');
                        }
                    }
                    if((self.reload % 50) % 5 === 0 && self.reload % 70 < 20 && self.reload > 50 && self.target.invincible === false){
                        for(var i = 0;i < 18;i++){
                            var projectileWidth = 0;
                            var projectileHeight = 0;
                            var projectileStats = {};
                            for(var j in projectileData){
                                if(j === 'waterBullet'){
                                    projectileWidth = projectileData[j].width;
                                    projectileHeight = projectileData[j].height;
                                    projectileStats = Object.create(projectileData[j].stats);
                                }
                            }
                            for(var j in projectileStats){
                                projectileStats[j] *= self.stats[j];
                            }
                            projectileStats.damageReduction = 0;
                            projectileStats.debuffs = self.stats.debuffs;
                            projectileStats.speed *= 0.1;
                            projectileStats.speed *= 2;
                            var projectile = Projectile({
                                id:self.id,
                                projectileType:'waterBullet',
                                angle:i * 20 + 180,
                                direction:i * 20,
                                x:self.target.x - Math.cos(i / 10 * Math.PI) * 128,
                                y:self.target.y - Math.sin(i / 10 * Math.PI) * 128,
                                map:self.map,
                                parentType:'Monster',
                                mapWidth:self.mapWidth,
                                mapHeight:self.mapHeight,
                                width:projectileWidth,
                                height:projectileHeight,
                                spin:function(t){return 25},
                                pierce:0,
                                stats:projectileStats,
                                projectilePattern:'accellerateNoCollision',
                                onCollision:function(self,pt){
                                    if(self.pierce === 0){
                                        self.toRemove = true;
                                    }
                                    else{
                                        self.pierce -= 1;
                                    }
                                }
                            });
                        }
                        self.maxSpeed *= 5;
                    }
                    if(self.reload % 70 > 30){
                        self.animation += 50;
                    }
                    self.reload += 1;
                    break;
                case "attackPhase1Sp":
                    if(self.reload % 200 === 0 && self.target.invincible === false){
                        for(var i = 0;i < 8;i++){
                            self.shootProjectile(self.id,'Monster',i * 45,i * 45,'spgem',64,function(t){return 0},1000,self.stats,'spinAroundMonster');
                        }
                    }
                    if(self.reload % 200 > 50 && self.reload % 200 < 70 && self.target.invincible === false){
                        for(var i = 0;i < 8;i++){
                            self.shootProjectile(self.id,'Monster',self.reload * 2 + i * 45,self.reload * 2 + i * 45,'splaser',64,function(t){return 0},1000,self.stats,'noCollision');
                        }
                    }
                    if(self.reload % 200 === 100 && self.target.invincible === false){
                        self.dashSpdX = (self.target.x - self.x) / 10;
                        self.dashSpdY = (self.target.y - self.y) / 10;
                    }
                    if(self.reload % 200 > 100 && self.reload % 200 < 120 && self.target.invincible === false){
                        self.x += self.dashSpdX;
                        self.y += self.dashSpdY;
                    }
                    if(self.reload % 200 === 120 && self.target.invincible === false){
                        self.dashSpdX = (self.target.x - self.x) / 10;
                        self.dashSpdY = (self.target.y - self.y) / 10;
                    }
                    if(self.reload % 200 > 120 && self.reload % 200 < 140 && self.target.invincible === false){
                        self.x += self.dashSpdX;
                        self.y += self.dashSpdY;
                    }
                    if(self.reload % 200 === 140 && self.target.invincible === false){
                        self.dashSpdX = (self.target.x - self.x) / 10;
                        self.dashSpdY = (self.target.y - self.y) / 10;
                    }
                    if(self.reload % 200 > 140 && self.reload % 200 < 160 && self.target.invincible === false){
                        self.x += self.dashSpdX;
                        self.y += self.dashSpdY;
                    }
                    if(self.reload % 200 === 160 && self.target.invincible === false){
                        self.dashSpdX = (self.target.x - self.x) / 10;
                        self.dashSpdY = (self.target.y - self.y) / 10;
                    }
                    if(self.reload % 200 > 160 && self.reload % 200 < 180 && self.target.invincible === false){
                        self.x += self.dashSpdX;
                        self.y += self.dashSpdY;
                    }
                    if(self.reload % 200 === 180 && self.target.invincible === false){
                        self.dashSpdX = (self.target.x - self.x) / 10;
                        self.dashSpdY = (self.target.y - self.y) / 10;
                    }
                    if(self.reload % 200 > 180 && self.target.invincible === false){
                        self.x += self.dashSpdX;
                        self.y += self.dashSpdY;
                    }
                    self.reload += 1;
                    if(self.hp < self.hpMax / 2 || self.stage2){
                        self.attackState = 'attackPhase2Sp';
                        self.stage2 = true;
                    }
                    break;
                case "attackPhase2Sp":
                    if(self.reload % 200 === 0 && self.target.invincible === false){
                        for(var i = 0;i < 8;i++){
                            self.shootProjectile(self.id,'Monster',i * 45,i * 45,'spgem',64,function(t){return 0},1000,self.stats,'spinAroundMonster');
                        }
                    }
                    if(self.reload % 200 > 30 && self.reload % 200 < 70 && self.target.invincible === false){
                        for(var i = 0;i < 8;i++){
                            self.shootProjectile(self.id,'Monster',self.reload * 2 + i * 45,self.reload * 2 + i * 45,'splaser',64,function(t){return 0},1000,self.stats,'noCollision');
                        }
                    }
                    if(self.reload % 200 === 100 && self.target.invincible === false){
                        self.dashSpdX = (self.target.x - self.x) / 5;
                        self.dashSpdY = (self.target.y - self.y) / 5;
                        for(var i = 0;i < 8;i++){
                            self.shootProjectile(self.id,'Monster',self.reload * 2 + i * 45,self.reload * 2 + i * 45,'splaser',64,function(t){return 0},1000,self.stats,'seed');
                        }
                    }
                    if(self.reload % 200 > 100 && self.reload % 200 < 110 && self.target.invincible === false){
                        self.x += self.dashSpdX;
                        self.y += self.dashSpdY;
                    }
                    if(self.reload % 200 === 110 && self.target.invincible === false){
                        self.dashSpdX = (self.target.x - self.x) / 5;
                        self.dashSpdY = (self.target.y - self.y) / 5;
                        for(var i = 0;i < 8;i++){
                            self.shootProjectile(self.id,'Monster',self.reload * 2 + i * 45,self.reload * 2 + i * 45,'splaser',64,function(t){return 0},1000,self.stats,'seed');
                        }
                    }
                    if(self.reload % 200 > 110 && self.reload % 200 < 120 && self.target.invincible === false){
                        self.x += self.dashSpdX;
                        self.y += self.dashSpdY;
                    }
                    if(self.reload % 200 === 120 && self.target.invincible === false){
                        self.dashSpdX = (self.target.x - self.x) / 5;
                        self.dashSpdY = (self.target.y - self.y) / 5;
                        for(var i = 0;i < 8;i++){
                            self.shootProjectile(self.id,'Monster',self.reload * 2 + i * 45,self.reload * 2 + i * 45,'splaser',64,function(t){return 0},1000,self.stats,'seed');
                        }
                    }
                    if(self.reload % 200 > 120 && self.reload % 200 < 130 && self.target.invincible === false){
                        self.x += self.dashSpdX;
                        self.y += self.dashSpdY;
                    }
                    if(self.reload % 200 === 130 && self.target.invincible === false){
                        self.dashSpdX = (self.target.x - self.x) / 5;
                        self.dashSpdY = (self.target.y - self.y) / 5;
                        for(var i = 0;i < 8;i++){
                            self.shootProjectile(self.id,'Monster',self.reload * 2 + i * 45,self.reload * 2 + i * 45,'splaser',64,function(t){return 0},1000,self.stats,'seed');
                        }
                    }
                    if(self.reload % 200 > 130 && self.reload % 200 < 140 && self.target.invincible === false){
                        self.x += self.dashSpdX;
                        self.y += self.dashSpdY;
                    }
                    if(self.reload % 200 === 140 && self.target.invincible === false){
                        self.dashSpdX = (self.target.x - self.x) / 5;
                        self.dashSpdY = (self.target.y - self.y) / 5;
                        for(var i = 0;i < 8;i++){
                            self.shootProjectile(self.id,'Monster',self.reload * 2 + i * 45,self.reload * 2 + i * 45,'splaser',64,function(t){return 0},1000,self.stats,'seed');
                        }
                    }
                    if(self.reload % 200 > 140 && self.reload % 200 < 150 && self.target.invincible === false){
                        self.x += self.dashSpdX;
                        self.y += self.dashSpdY;
                    }
                    if(self.reload % 200 === 150 && self.target.invincible === false){
                        self.dashSpdX = (self.target.x - self.x) / 5;
                        self.dashSpdY = (self.target.y - self.y) / 5;
                        for(var i = 0;i < 8;i++){
                            self.shootProjectile(self.id,'Monster',self.reload * 2 + i * 45,self.reload * 2 + i * 45,'splaser',64,function(t){return 0},1000,self.stats,'seed');
                        }
                    }
                    if(self.reload % 200 > 150 && self.reload % 200 < 160 && self.target.invincible === false){
                        self.x += self.dashSpdX;
                        self.y += self.dashSpdY;
                    }
                    if(self.reload % 200 === 160 && self.target.invincible === false){
                        self.dashSpdX = (self.target.x - self.x) / 5;
                        self.dashSpdY = (self.target.y - self.y) / 5;
                        for(var i = 0;i < 8;i++){
                            self.shootProjectile(self.id,'Monster',self.reload * 2 + i * 45,self.reload * 2 + i * 45,'splaser',64,function(t){return 0},1000,self.stats,'seed');
                        }
                    }
                    if(self.reload % 200 > 160 && self.reload % 200 < 170 && self.target.invincible === false){
                        self.x += self.dashSpdX;
                        self.y += self.dashSpdY;
                    }
                    if(self.reload % 200 === 170 && self.target.invincible === false){
                        self.dashSpdX = (self.target.x - self.x) / 5;
                        self.dashSpdY = (self.target.y - self.y) / 5;
                        for(var i = 0;i < 8;i++){
                            self.shootProjectile(self.id,'Monster',self.reload * 2 + i * 45,self.reload * 2 + i * 45,'splaser',64,function(t){return 0},1000,self.stats,'seed');
                        }
                    }
                    if(self.reload % 200 > 170 && self.reload % 200 < 180 && self.target.invincible === false){
                        self.x += self.dashSpdX;
                        self.y += self.dashSpdY;
                    }
                    if(self.reload % 200 === 180 && self.target.invincible === false){
                        self.dashSpdX = (self.target.x - self.x) / 5;
                        self.dashSpdY = (self.target.y - self.y) / 5;
                        for(var i = 0;i < 8;i++){
                            self.shootProjectile(self.id,'Monster',self.reload * 2 + i * 45,self.reload * 2 + i * 45,'splaser',64,function(t){return 0},1000,self.stats,'seed');
                        }
                    }
                    if(self.reload % 200 > 180 && self.reload % 200 < 190 && self.target.invincible === false){
                        self.x += self.dashSpdX;
                        self.y += self.dashSpdY;
                    }
                    if(self.reload % 200 === 190 && self.target.invincible === false){
                        self.dashSpdX = (self.target.x - self.x) / 5;
                        self.dashSpdY = (self.target.y - self.y) / 5;
                        for(var i = 0;i < 8;i++){
                            self.shootProjectile(self.id,'Monster',self.reload * 2 + i * 45,self.reload * 2 + i * 45,'splaser',64,function(t){return 0},1000,self.stats,'seed');
                        }
                    }
                    if(self.reload % 200 > 190 && self.reload % 200 < 200 && self.target.invincible === false){
                        self.x += self.dashSpdX;
                        self.y += self.dashSpdY;
                    }
                    self.reload += 1;
                    if(self.hp < self.hpMax / 6 || self.stage3){
                        self.attackState = 'attackPhase3Sp';
                        self.stage3 = true;
                        self.hp = self.hpMax;
                        s.createMonster('tianmuGuarder',{x:self.x + 256,y:self.y,map:self.map});
                        s.createMonster('sampleprovidersp',{x:self.x - 256,y:self.y,map:self.map});
                        s.createMonster('suvanth',{x:self.x,y:self.y - 256,map:self.map});
                    }
                    break;
                case "attackPhase3Sp":
                    if(self.reload % 200 === 0 && self.target.invincible === false){
                        for(var i = 0;i < 8;i++){
                            self.shootProjectile(self.id,'Monster',i * 45,i * 45,'spgem',64,function(t){return 0},1000,self.stats,'spinAroundMonster');
                        }
                    }
                    if(self.reload % 200 === 30 && self.target.invincible === false){
                        self.stats.speed = 0.2;
                        self.stats.attack = 1000;
                        for(var i = 0;i < 20;i++){
                            self.shootProjectile(self.id,'Monster',self.reload,self.reload,'giantsplaser',64 + 64 * i,function(t){return 0},1000,self.stats,'splaser');
                        }
                        self.stats.speed = 1;
                    }
                    if(self.reload % 200 === 100 && self.target.invincible === false){
                        self.dashSpdX = (self.target.x - self.x) / 5;
                        self.dashSpdY = (self.target.y - self.y) / 5;
                        for(var i = 0;i < 8;i++){
                            self.shootProjectile(self.id,'Monster',self.reload * 2 + i * 45,self.reload * 2 + i * 45,'splaser',64,function(t){return 0},1000,self.stats,'seed');
                        }
                    }
                    if(self.reload % 200 > 100 && self.reload % 200 < 110 && self.target.invincible === false){
                        self.x += self.dashSpdX;
                        self.y += self.dashSpdY;
                    }
                    if(self.reload % 200 === 110 && self.target.invincible === false){
                        self.dashSpdX = (self.target.x - self.x) / 5;
                        self.dashSpdY = (self.target.y - self.y) / 5;
                        for(var i = 0;i < 8;i++){
                            self.shootProjectile(self.id,'Monster',self.reload * 2 + i * 45,self.reload * 2 + i * 45,'splaser',64,function(t){return 0},1000,self.stats,'seed');
                        }
                    }
                    if(self.reload % 200 > 110 && self.reload % 200 < 120 && self.target.invincible === false){
                        self.x += self.dashSpdX;
                        self.y += self.dashSpdY;
                    }
                    if(self.reload % 200 === 120 && self.target.invincible === false){
                        self.dashSpdX = (self.target.x - self.x) / 5;
                        self.dashSpdY = (self.target.y - self.y) / 5;
                        for(var i = 0;i < 8;i++){
                            self.shootProjectile(self.id,'Monster',self.reload * 2 + i * 45,self.reload * 2 + i * 45,'splaser',64,function(t){return 0},1000,self.stats,'seed');
                        }
                    }
                    if(self.reload % 200 > 120 && self.reload % 200 < 130 && self.target.invincible === false){
                        self.x += self.dashSpdX;
                        self.y += self.dashSpdY;
                    }
                    if(self.reload % 200 === 130 && self.target.invincible === false){
                        self.dashSpdX = (self.target.x - self.x) / 5;
                        self.dashSpdY = (self.target.y - self.y) / 5;
                        for(var i = 0;i < 8;i++){
                            self.shootProjectile(self.id,'Monster',self.reload * 2 + i * 45,self.reload * 2 + i * 45,'splaser',64,function(t){return 0},1000,self.stats,'seed');
                        }
                    }
                    if(self.reload % 200 > 130 && self.reload % 200 < 140 && self.target.invincible === false){
                        self.x += self.dashSpdX;
                        self.y += self.dashSpdY;
                    }
                    if(self.reload % 200 === 140 && self.target.invincible === false){
                        self.dashSpdX = (self.target.x - self.x) / 5;
                        self.dashSpdY = (self.target.y - self.y) / 5;
                        for(var i = 0;i < 8;i++){
                            self.shootProjectile(self.id,'Monster',self.reload * 2 + i * 45,self.reload * 2 + i * 45,'splaser',64,function(t){return 0},1000,self.stats,'seed');
                        }
                    }
                    if(self.reload % 200 > 140 && self.reload % 200 < 150 && self.target.invincible === false){
                        self.x += self.dashSpdX;
                        self.y += self.dashSpdY;
                    }
                    if(self.reload % 200 === 150 && self.target.invincible === false){
                        self.dashSpdX = (self.target.x - self.x) / 5;
                        self.dashSpdY = (self.target.y - self.y) / 5;
                        for(var i = 0;i < 8;i++){
                            self.shootProjectile(self.id,'Monster',self.reload * 2 + i * 45,self.reload * 2 + i * 45,'splaser',64,function(t){return 0},1000,self.stats,'seed');
                        }
                    }
                    if(self.reload % 200 > 150 && self.reload % 200 < 160 && self.target.invincible === false){
                        self.x += self.dashSpdX;
                        self.y += self.dashSpdY;
                    }
                    if(self.reload % 200 === 160 && self.target.invincible === false){
                        self.dashSpdX = (self.target.x - self.x) / 5;
                        self.dashSpdY = (self.target.y - self.y) / 5;
                        for(var i = 0;i < 8;i++){
                            self.shootProjectile(self.id,'Monster',self.reload * 2 + i * 45,self.reload * 2 + i * 45,'splaser',64,function(t){return 0},1000,self.stats,'seed');
                        }
                    }
                    if(self.reload % 200 > 160 && self.reload % 200 < 170 && self.target.invincible === false){
                        self.x += self.dashSpdX;
                        self.y += self.dashSpdY;
                    }
                    if(self.reload % 200 === 170 && self.target.invincible === false){
                        self.dashSpdX = (self.target.x - self.x) / 5;
                        self.dashSpdY = (self.target.y - self.y) / 5;
                        for(var i = 0;i < 8;i++){
                            self.shootProjectile(self.id,'Monster',self.reload * 2 + i * 45,self.reload * 2 + i * 45,'splaser',64,function(t){return 0},1000,self.stats,'seed');
                        }
                    }
                    if(self.reload % 200 > 170 && self.reload % 200 < 180 && self.target.invincible === false){
                        self.x += self.dashSpdX;
                        self.y += self.dashSpdY;
                    }
                    if(self.reload % 200 === 180 && self.target.invincible === false){
                        self.dashSpdX = (self.target.x - self.x) / 5;
                        self.dashSpdY = (self.target.y - self.y) / 5;
                        for(var i = 0;i < 8;i++){
                            self.shootProjectile(self.id,'Monster',self.reload * 2 + i * 45,self.reload * 2 + i * 45,'splaser',64,function(t){return 0},1000,self.stats,'seed');
                        }
                    }
                    if(self.reload % 200 > 180 && self.reload % 200 < 190 && self.target.invincible === false){
                        self.x += self.dashSpdX;
                        self.y += self.dashSpdY;
                    }
                    if(self.reload % 200 === 190 && self.target.invincible === false){
                        self.dashSpdX = (self.target.x - self.x) / 5;
                        self.dashSpdY = (self.target.y - self.y) / 5;
                        for(var i = 0;i < 8;i++){
                            self.shootProjectile(self.id,'Monster',self.reload * 2 + i * 45,self.reload * 2 + i * 45,'splaser',64,function(t){return 0},1000,self.stats,'seed');
                        }
                    }
                    if(self.reload % 200 > 190 && self.reload % 200 < 200 && self.target.invincible === false){
                        self.x += self.dashSpdX;
                        self.y += self.dashSpdY;
                    }
                    self.reload += 1;
                    if(self.hp < 1000000){
                        self.attackState = 'attackPhase4Sp';
                        self.stage4 = true;
                        self.hp = 1000000;
                        self.reload = 0;
                        self.invincible = true;
                        addToChat('style="color: #00aadd">','The fight isn\'t over yet...');
                    }
                    break;
                case "attackPhase4Sp":
                    self.spdX = 0;
                    self.spdY = 0;
                    self.x = 1600;
                    self.y = 1600;
                    self.followingEntity = undefined;
                    self.invincible = true;
                    if(self.reload >= 1200){
                        self.attackState = 'attackPhase5Sp';
                    }
                    if(self.reload > 100 && self.reload % 60 === 0 && self.target.invincible === false){
                        self.stats.attack = 0;
                        self.stats.speed = 0.2;
                        self.stats.range = 3;
                        var direction = 360 * Math.random();
                        self.shootProjectile(self.id,'Monster',direction - 10,direction - 10,'splaser',32,function(t){return 0},1000,self.stats,'noCollision');
                        self.shootProjectile(self.id,'Monster',direction + 10,direction + 10,'splaser',32,function(t){return 0},1000,self.stats,'noCollision');
                        self.firstDirection = direction;
                    }
                    if(self.reload > 100 && self.reload % 60 === 40 && self.target.invincible === false){
                        self.stats.attack = 500;
                        self.stats.speed = 1.3;
                        for(var i = 0;i < 67;i++){
                            self.shootProjectile(self.id,'Monster',self.firstDirection - 15 - 5 * i,self.firstDirection - 15 - 5 * i,'giantsplaser',64,function(t){return 0},1000,self.stats,'noCollision');
                        }
                    }
                    self.reload += 1;
                    break;
                case "attackPhase5Sp":
                    self.invincible = false;
                    if(self.hp > 1000000){
                        self.hp = 1000000;
                    }
                    break;
                case "attackPhase1TianmuGuarder":
                    if(self.reload % 200 === 0 && self.target.invincible === false){
                        for(var i = 0;i < 8;i++){
                            self.shootProjectile(self.id,'Monster',i * 45,i * 45,'spgem',64,function(t){return 0},1000,self.stats,'spinAroundMonster');
                        }
                    }
                    if(self.reload % 200 < 50 && self.target.invincible === false){
                        for(var i = 0;i < 10;i++){
                            self.shootProjectile(self.id,'Monster',self.direction - 15 - 10 + Math.random() * 20,self.direction - 15 - 10 + Math.random() * 20,'bullet',54 + 24 * Math.random(),function(t){return 0},30,self.stats);
                        }
                        for(var i = 0;i < 10;i++){
                            self.shootProjectile(self.id,'Monster',self.direction + 15 - 10 + Math.random() * 20,self.direction + 15 - 10 + Math.random() * 20,'bullet',54 + 24 * Math.random(),function(t){return 0},30,self.stats);
                        }
                    }
                    if(self.reload % 200 > 100 && self.reload % 200 < 150 && self.target.invincible === false){
                        for(var i = 0;i < 10;i++){
                            self.shootProjectile(self.id,'Monster',self.direction - 15 - 10 + Math.random() * 20,self.direction - 15 - 10 + Math.random() * 20,'bullet',54 + 24 * Math.random(),function(t){return 0},30,self.stats);
                        }
                        for(var i = 0;i < 10;i++){
                            self.shootProjectile(self.id,'Monster',self.direction + 15 - 10 + Math.random() * 20,self.direction + 15 - 10 + Math.random() * 20,'bullet',54 + 24 * Math.random(),function(t){return 0},30,self.stats);
                        }
                    }
                    self.reload += 1;
                    if(self.hp < self.hpMax / 2 || self.stage2){
                        self.attackState = 'attackPhase2TianmuGuarder';
                        self.stage2 = true;
                    }
                    break;
                case "attackPhase2TianmuGuarder":
                    if(self.reload % 200 === 0 && self.target.invincible === false){
                        for(var i = 0;i < 8;i++){
                            self.shootProjectile(self.id,'Monster',i * 45,i * 45,'spgem',64,function(t){return 0},1000,self.stats,'spinAroundMonster');
                        }
                    }
                    if(self.reload % 200 < 70 && self.target.invincible === false){
                        for(var i = 0;i < 10;i++){
                            self.shootProjectile(self.id,'Monster',self.direction - 15 - 10 + Math.random() * 20,self.direction - 15 - 10 + Math.random() * 20,'bullet',54 + 24 * Math.random(),function(t){return 0},30,self.stats);
                        }
                        for(var i = 0;i < 10;i++){
                            self.shootProjectile(self.id,'Monster',self.direction + 15 - 10 + Math.random() * 20,self.direction + 15 - 10 + Math.random() * 20,'bullet',54 + 24 * Math.random(),function(t){return 0},30,self.stats);
                        }
                    }
                    if(self.reload % 200 > 100 && self.reload % 200 < 170 && self.target.invincible === false){
                        for(var i = 0;i < 10;i++){
                            self.shootProjectile(self.id,'Monster',self.direction - 15 - 10 + Math.random() * 20,self.direction - 15 - 10 + Math.random() * 20,'bullet',54 + 24 * Math.random(),function(t){return 0},30,self.stats);
                        }
                        for(var i = 0;i < 10;i++){
                            self.shootProjectile(self.id,'Monster',self.direction + 15 - 10 + Math.random() * 20,self.direction + 15 - 10 + Math.random() * 20,'bullet',54 + 24 * Math.random(),function(t){return 0},30,self.stats);
                        }
                    }
                    if(self.hp < self.hpMax / 6 || self.stage3){
                        self.attackState = 'attackPhase3TianmuGuarder';
                        self.stage3 = true;
                    }
                    self.reload += 1;
                    break;
                case "attackPhase3TianmuGuarder":
                    if(self.reload % 200 === 0 && self.target.invincible === false){
                        for(var i = 0;i < 8;i++){
                            self.shootProjectile(self.id,'Monster',i * 45,i * 45,'spgem',64,function(t){return 0},1000,self.stats,'spinAroundMonster');
                        }
                    }
                    if(self.target.invincible === false){
                        for(var i = 0;i < 10;i++){
                            self.shootProjectile(self.id,'Monster',self.direction - 15 - 10 + Math.random() * 20,self.direction - 15 - 10 + Math.random() * 20,'bullet',54 + 24 * Math.random(),function(t){return 0},30,self.stats);
                        }
                        for(var i = 0;i < 10;i++){
                            self.shootProjectile(self.id,'Monster',self.direction + 15 - 10 + Math.random() * 20,self.direction + 15 - 10 + Math.random() * 20,'bullet',54 + 24 * Math.random(),function(t){return 0},30,self.stats);
                        }
                    }
                    self.reload += 1;
                    break;
                case "attackPhase1Sampleprovidersp":
                    if(self.reload % 200 === 0 && self.target.invincible === false){
                        for(var i = 0;i < 8;i++){
                            self.shootProjectile(self.id,'Monster',i * 45,i * 45,'spgem',64,function(t){return 0},1000,self.stats,'spinAroundMonster');
                        }
                    }
                    if(self.reload % 200 < 30 && self.reload % 10 === 0 && self.target.invincible === false){
                        for(var j = 0;j < 3;j++){
                            self.shootProjectile(self.id,'Monster',self.direction + 60 - j * 60 + Math.random() * 15,self.direction + 60 - j * 60 + Math.random() * 15,'skull',32 + 12 * Math.random(),function(t){return 0},10,self.stats,'monsterSkull');
                        }
                    }
                    if(self.reload % 200 > 100 && self.reload % 200 < 130 && self.reload % 10 === 0 && self.target.invincible === false){
                        for(var j = 0;j < 3;j++){
                            self.shootProjectile(self.id,'Monster',self.direction + 60 - j * 60 + Math.random() * 15,self.direction + 60 - j * 60 + Math.random() * 15,'skull',32 + 12 * Math.random(),function(t){return 0},10,self.stats,'monsterSkull');
                        }
                    }
                    self.reload += 1;
                    if(self.hp < self.hpMax / 2 || self.stage2){
                        self.attackState = 'attackPhase2Sampleprovidersp';
                        self.stage2 = true;
                    }
                    break;
                case "attackPhase2Sampleprovidersp":
                    if(self.reload % 200 === 0 && self.target.invincible === false){
                        for(var i = 0;i < 8;i++){
                            self.shootProjectile(self.id,'Monster',i * 45,i * 45,'spgem',64,function(t){return 0},1000,self.stats,'spinAroundMonster');
                        }
                    }
                    if(self.reload % 200 < 50 && self.reload % 10 === 0 && self.target.invincible === false){
                        for(var j = 0;j < 3;j++){
                            self.shootProjectile(self.id,'Monster',self.direction + 60 - j * 60 + Math.random() * 15,self.direction + 60 - j * 60 + Math.random() * 15,'skull',32 + 12 * Math.random(),function(t){return 0},10,self.stats,'monsterSkull');
                        }
                    }
                    if(self.reload % 200 > 100 && self.reload % 200 < 150 && self.reload % 10 === 0 && self.target.invincible === false){
                        for(var j = 0;j < 3;j++){
                            self.shootProjectile(self.id,'Monster',self.direction + 60 - j * 60 + Math.random() * 15,self.direction + 60 - j * 60 + Math.random() * 15,'skull',32 + 12 * Math.random(),function(t){return 0},10,self.stats,'monsterSkull');
                        }
                    }
                    if(self.hp < self.hpMax / 6 || self.stage3){
                        self.attackState = 'attackPhase3Sampleprovidersp';
                        self.stage3 = true;
                    }
                    self.reload += 1;
                    break;
                case "attackPhase3Sampleprovidersp":
                    if(self.reload % 200 === 0 && self.target.invincible === false){
                        for(var i = 0;i < 8;i++){
                            self.shootProjectile(self.id,'Monster',i * 45,i * 45,'spgem',64,function(t){return 0},1000,self.stats,'spinAroundMonster');
                        }
                    }
                    if(self.reload % 200 < 70 && self.reload % 5 === 0 && self.target.invincible === false){
                        for(var j = 0;j < 3;j++){
                            self.shootProjectile(self.id,'Monster',self.direction + 60 - j * 60 + Math.random() * 15,self.direction + 60 - j * 60 + Math.random() * 15,'skull',32 + 12 * Math.random(),function(t){return 0},10,self.stats,'monsterSkull');
                        }
                    }
                    if(self.reload % 200 > 100 && self.reload % 200 < 170 && self.reload % 5 === 0 && self.target.invincible === false){
                        for(var j = 0;j < 3;j++){
                            self.shootProjectile(self.id,'Monster',self.direction + 60 - j * 60 + Math.random() * 15,self.direction + 60 - j * 60 + Math.random() * 15,'skull',32 + 12 * Math.random(),function(t){return 0},10,self.stats,'monsterSkull');
                        }
                    }
                    self.reload += 1;
                    break;
                case "attackPhase1Suvanth":
                    if(self.reload % 200 === 0 && self.target.invincible === false){
                        for(var i = 0;i < 8;i++){
                            self.shootProjectile(self.id,'Monster',i * 45,i * 45,'spgem',64,function(t){return 0},1000,self.stats,'spinAroundMonster');
                        }
                    }
                    if(self.reload % 200 > 30 && self.reload % 10 === 0 && self.target.invincible === false){
                        self.shootProjectile(self.id,'Monster',self.direction,self.direction,'holytrident',32,function(t){return 0},3,self.stats,'monsterHolyTrident');
                    }
                    self.reload += 1;
                    if(self.hp < self.hpMax / 2 || self.stage2){
                        self.attackState = 'attackPhase2Suvanth';
                        self.stage2 = true;
                    }
                    break;
                case "attackPhase2Suvanth":
                    if(self.reload % 200 === 0 && self.target.invincible === false){
                        for(var i = 0;i < 8;i++){
                            self.shootProjectile(self.id,'Monster',i * 45,i * 45,'spgem',64,function(t){return 0},1000,self.stats,'spinAroundMonster');
                        }
                    }
                    if(self.reload % 200 > 30 && self.reload % 7 === 0 && self.target.invincible === false){
                        self.shootProjectile(self.id,'Monster',self.direction,self.direction,'holytrident',32,function(t){return 0},3,self.stats,'monsterHolyTrident');
                    }
                    if(self.hp < self.hpMax / 6 || self.stage3){
                        self.attackState = 'attackPhase3Suvanth';
                        self.stage3 = true;
                    }
                    self.reload += 1;
                    break;
                case "attackPhase3Suvanth":
                    if(self.reload % 200 === 0 && self.target.invincible === false){
                        for(var i = 0;i < 8;i++){
                            self.shootProjectile(self.id,'Monster',i * 45,i * 45,'spgem',64,function(t){return 0},1000,self.stats,'spinAroundMonster');
                        }
                    }
                    if(self.reload % 200 > 30 && self.reload % 5 === 0 && self.target.invincible === false){
                        self.shootProjectile(self.id,'Monster',self.direction,self.direction,'holytrident',32,function(t){return 0},3,self.stats,'monsterHolyTrident');
                    }
                    self.reload += 1;
                    break;
                case "attackSpgem":
                    if(self.reload % 200 === 0 && self.target.invincible === false){
                        for(var i = 0;i < 8;i++){
                            self.shootProjectile(self.id,'Monster',i * 45,i * 45,'spgem',64,function(t){return 0},1000,self.stats,'spinAroundMonster');
                        }
                    }
                    if(self.reload % 200 > 50 && self.reload % 200 < 70 && self.target.invincible === false){
                        self.shootProjectile(self.id,'Monster',self.direction,self.direction,'splaser',64,function(t){return 0},1000,self.stats,'noCollision');
                    }
                    if(self.reload % 200 > 100 && self.reload % 200 < 120 && self.target.invincible === false){
                        self.shootProjectile(self.id,'Monster',self.direction,self.direction,'splaser',64,function(t){return 0},1000,self.stats,'noCollision');
                    }
                    if(self.reload % 200 > 150 && self.reload % 200 < 170 && self.target.invincible === false){
                        self.shootProjectile(self.id,'Monster',self.direction,self.direction,'splaser',64,function(t){return 0},1000,self.stats,'noCollision');
                    }
                    self.reload += 1;
                    break;
                case "attackCharredBird":
                    if(self.reload % 40 === 0 && self.target.invincible === false){
                        self.shootProjectile(self.id,'Monster',self.direction - 60,self.direction - 60,'fireBullet',32,function(t){return 25},0,self.stats,'playerHoming');
                        self.shootProjectile(self.id,'Monster',self.direction,self.direction,'fireBullet',32,function(t){return 25},0,self.stats,'playerHoming');
                        self.shootProjectile(self.id,'Monster',self.direction + 60,self.direction + 60,'fireBullet',32,function(t){return 25},0,self.stats,'playerHoming');
                    }
                    self.reload += 1;
                    break;
                case "attackPhase1FireSpirit":
                    if(self.reload % 100 === 0 && self.target.invincible === false){
                        for(var i = 0;i < 18;i++){
                            var projectileWidth = 0;
                            var projectileHeight = 0;
                            var projectileStats = {};
                            for(var j in projectileData){
                                if(j === 'fireBullet'){
                                    projectileWidth = projectileData[j].width;
                                    projectileHeight = projectileData[j].height;
                                    projectileStats = Object.create(projectileData[j].stats);
                                }
                            }
                            for(var j in projectileStats){
                                projectileStats[j] *= self.stats[j];
                            }
                            projectileStats.damageReduction = 0;
                            projectileStats.debuffs = self.stats.debuffs;
                            projectileStats.speed *= 0.2;
                            projectileStats.range *= 5;
                            var projectile = Projectile({
                                id:self.id,
                                projectileType:'fireBullet',
                                angle:i * 20 + 180,
                                direction:i * 20,
                                x:self.target.x - Math.cos(i / 10 * Math.PI) * 128,
                                y:self.target.y - Math.sin(i / 10 * Math.PI) * 128,
                                map:self.map,
                                parentType:'Monster',
                                mapWidth:self.mapWidth,
                                mapHeight:self.mapHeight,
                                width:projectileWidth,
                                height:projectileHeight,
                                spin:function(t){return 25},
                                pierce:1000,
                                stats:projectileStats,
                                projectilePattern:'accellerateNoCollision',
                                onCollision:function(self,pt){
                                    if(self.pierce === 0){
                                        self.toRemove = true;
                                    }
                                    else{
                                        self.pierce -= 1;
                                    }
                                }
                            });
                        }
                        self.shootProjectile(self.id,'Monster',self.direction - 60,self.direction - 60,'fireBullet',32,function(t){return 25},0,self.stats,'playerHoming');
                        self.shootProjectile(self.id,'Monster',self.direction,self.direction,'fireBullet',32,function(t){return 25},0,self.stats,'playerHoming');
                        self.shootProjectile(self.id,'Monster',self.direction + 60,self.direction + 60,'fireBullet',32,function(t){return 25},0,self.stats,'playerHoming');
                    }
                    if(self.reload % 100 <= 40 && self.reload % 5 === 0 && self.target.invincible === false){
                        self.shootProjectile(self.id,'Monster',self.direction,self.direction,'fireBullet',32,function(t){return 25},0,self.stats,'accellerateNoCollision');
                    }
                    if(self.reload % 100 >= 50 && self.reload % 100 <= 55 && self.target.invincible === false){
                        for(var i = 0;i < 20;i++){
                            self.shootProjectile(self.id,'Monster',self.direction + i * 18,self.direction + i * 18,'fireBullet',32,function(t){return 25},0,self.stats,'accellerateNoCollision');
                        }
                    }
                    if(self.reload % 100 >= 60 && self.reload % 5 === 0 && self.target.invincible === false){
                        self.shootProjectile(self.id,'Monster',self.direction,self.direction,'fireBullet',32,function(t){return 25},0,self.stats,'accellerateNoCollision');
                    }
                    self.reload += 1;
                    if(self.hp < self.hpMax / 2 || self.stage2){
                        self.attackState = 'attackPhase2FireSpirit';
                        self.stage2 = true;
                    }
                    break;
                case "attackPhase2FireSpirit":
                    if(self.reload % 100 === 0 && self.target.invincible === false){
                        for(var i = 0;i < 18;i++){
                            var projectileWidth = 0;
                            var projectileHeight = 0;
                            var projectileStats = {};
                            for(var j in projectileData){
                                if(j === 'fireBullet'){
                                    projectileWidth = projectileData[j].width;
                                    projectileHeight = projectileData[j].height;
                                    projectileStats = Object.create(projectileData[j].stats);
                                }
                            }
                            for(var j in projectileStats){
                                projectileStats[j] *= self.stats[j];
                            }
                            projectileStats.damageReduction = 0;
                            projectileStats.debuffs = self.stats.debuffs;
                            projectileStats.speed *= 0.2;
                            projectileStats.range *= 5;
                            var projectile = Projectile({
                                id:self.id,
                                projectileType:'fireBullet',
                                angle:i * 20 + 180,
                                direction:i * 20,
                                x:self.target.x - Math.cos(i / 10 * Math.PI) * 128,
                                y:self.target.y - Math.sin(i / 10 * Math.PI) * 128,
                                map:self.map,
                                parentType:'Monster',
                                mapWidth:self.mapWidth,
                                mapHeight:self.mapHeight,
                                width:projectileWidth,
                                height:projectileHeight,
                                spin:function(t){return 25},
                                pierce:1000,
                                stats:projectileStats,
                                projectilePattern:'accellerateNoCollision',
                                onCollision:function(self,pt){
                                    if(self.pierce === 0){
                                        self.toRemove = true;
                                    }
                                    else{
                                        self.pierce -= 1;
                                    }
                                }
                            });
                        }
                        self.shootProjectile(self.id,'Monster',self.direction - 60,self.direction - 60,'fireBullet',32,function(t){return 25},0,self.stats,'playerHoming');
                        self.shootProjectile(self.id,'Monster',self.direction,self.direction,'fireBullet',32,function(t){return 25},0,self.stats,'playerHoming');
                        self.shootProjectile(self.id,'Monster',self.direction + 60,self.direction + 60,'fireBullet',32,function(t){return 25},0,self.stats,'playerHoming');
                    }
                    if(self.reload % 100 <= 55 && self.reload % 2 === 0 && self.target.invincible === false){
                        self.shootProjectile(self.id,'Monster',self.direction,self.direction,'fireBullet',32,function(t){return 25},0,self.stats,'accellerateNoCollision');
                    }
                    if(self.reload % 100 >= 50 && self.reload % 100 <= 65 && self.target.invincible === false){
                        for(var i = 0;i < 20;i++){
                            self.shootProjectile(self.id,'Monster',self.direction + i * 18,self.direction + i * 18,'fireBullet',32,function(t){return 25},0,self.stats,'accellerateNoCollision');
                        }
                    }
                    if(self.reload % 100 === 50 && self.target.invincible === false){
                        for(var i = 0;i < 18;i++){
                            var projectileWidth = 0;
                            var projectileHeight = 0;
                            var projectileStats = {};
                            for(var j in projectileData){
                                if(j === 'fireBullet'){
                                    projectileWidth = projectileData[j].width;
                                    projectileHeight = projectileData[j].height;
                                    projectileStats = Object.create(projectileData[j].stats);
                                }
                            }
                            for(var j in projectileStats){
                                projectileStats[j] *= self.stats[j];
                            }
                            projectileStats.damageReduction = 0;
                            projectileStats.debuffs = self.stats.debuffs;
                            projectileStats.speed *= 0.2;
                            projectileStats.range *= 5;
                            var projectile = Projectile({
                                id:self.id,
                                projectileType:'fireBullet',
                                angle:i * 20 + 180,
                                direction:i * 20,
                                x:self.target.x - Math.cos(i / 10 * Math.PI) * 128,
                                y:self.target.y - Math.sin(i / 10 * Math.PI) * 128,
                                map:self.map,
                                parentType:'Monster',
                                mapWidth:self.mapWidth,
                                mapHeight:self.mapHeight,
                                width:projectileWidth,
                                height:projectileHeight,
                                spin:function(t){return 25},
                                pierce:1000,
                                stats:projectileStats,
                                projectilePattern:'accellerateNoCollision',
                                onCollision:function(self,pt){
                                    if(self.pierce === 0){
                                        self.toRemove = true;
                                    }
                                    else{
                                        self.pierce -= 1;
                                    }
                                }
                            });
                        }
                        self.shootProjectile(self.id,'Monster',self.direction - 60,self.direction - 60,'fireBullet',32,function(t){return 25},0,self.stats,'playerHoming');
                        self.shootProjectile(self.id,'Monster',self.direction,self.direction,'fireBullet',32,function(t){return 25},0,self.stats,'playerHoming');
                        self.shootProjectile(self.id,'Monster',self.direction + 60,self.direction + 60,'fireBullet',32,function(t){return 25},0,self.stats,'playerHoming');
                    }
                    if(self.reload % 100 >= 60 && self.reload % 2 === 0 && self.target.invincible === false){
                        self.shootProjectile(self.id,'Monster',self.direction,self.direction,'fireBullet',32,function(t){return 25},0,self.stats,'accellerateNoCollision');
                    }
                    self.reload += 1;
                    break;
                case "attackRocopter":
                    if(self.reload % 40 < 15 && self.target.invincible === false && self.reload > 20){
                        self.shootProjectile(self.id,'Monster',self.direction + Math.random() * 20 - 10,self.direction + Math.random() * 20 - 10,'rock',Math.random() * 20 + 10,function(t){return 25},0,self.stats);
                    }
                    self.reload += 1;
                    break;
                case "attackCrab":
                    if(self.reload % 5 === 0 && self.target.invincible === false && self.reload > 10){
                        self.shootProjectile(self.id,'Monster',self.direction,self.direction,'crabBullet',16,function(t){return 25},0,self.stats,'spinAroundPoint');
                        self.shootProjectile(self.id,'Monster',self.direction + 180,self.direction + 180,'crabBullet',16,function(t){return 25},0,self.stats,'spinAroundPoint');
                    }
                    self.reload += 1;
                    break;
                case "attackCyanBeetle":
                    if(self.reload % 5 === 0 && self.target.invincible === false && self.reload > 10){
                        self.shootProjectile(self.id,'Monster',self.direction,self.direction,'waterBullet',16,function(t){return 25},0,self.stats,'bounceOffCollisions');
                    }
                    if(self.reload % 20 === 0 && self.target.invincible === false && self.hp < self.hpMax / 2){
                        var attack = self.stats.attack;
                        self.stats.attack *= 5;
                        var speed = self.stats.speed;
                        self.stats.speed *= 0.2;
                        self.shootProjectile(self.id,'Monster',self.direction,self.direction,'typhoon',16,function(t){return 25},0,self.stats,'playerHoming');
                        self.stats.attack = attack;
                        self.stats.speed = speed;
                    }
                    self.reload += 1;
                    break;
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
        if(lastSelf.animationDirection !== self.animationDirection){
            pack.animationDirection = self.animationDirection;
            lastSelf.animationDirection = self.animationDirection;
        }
        if(lastSelf.direction !== self.direction){
            pack.direction = self.direction;
            lastSelf.direction = self.direction;
        }
        if(lastSelf.canCollide !== self.canCollide){
            pack.canCollide = self.canCollide;
            lastSelf.canCollide = self.canCollide;
        }
        if(lastSelf.width !== self.width){
            pack.width = self.width;
            lastSelf.width = self.width;
        }
        if(lastSelf.height !== self.height){
            pack.height = self.height;
            lastSelf.height = self.height;
        }
        if(lastSelf.img !== self.img){
            pack.img = self.img;
            lastSelf.img = self.img;
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
        pack.animationDirection = self.animationDirection;
        pack.direction = self.direction;
        pack.canCollide = self.canCollide;
        pack.width = self.width;
        pack.height = self.height;
        pack.img = self.img;
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
    self.mana = 0;
    self.manaMax = 200;
    self.hp = 1000;
    self.hpMax = 1000;
    self.petType = param.petType;
    self.direction = 0;
    self.stats = {
        attack:Math.ceil(Player.list[self.parent].level / 10) * 10,
        defense:0,
        heal:1,
        range:1,
        speed:1,
        damageReduction:0,
        debuffs:[],
    }
    self.animate = false;
    if(self.petType === 'Cherrier'){
        self.width = 36;
        self.height = 32;
        self.stats = {
            attack:Math.ceil(Player.list[self.parent].level / 10) * 15,
            defense:0,
            heal:1,
            range:1,
            speed:1,
            damageReduction:0,
            debuffs:[],
        }
    }
    if(self.petType === 'Sphere'){
        self.width = 44;
        self.height = 44;
        self.stats = {
            attack:Math.ceil(Player.list[self.parent].level / 10) * 35,
            defense:0,
            heal:1,
            range:1,
            speed:1,
            damageReduction:0,
            debuffs:[],
        }
    }
    if(self.petType === 'Thunderbird'){
        self.maxSpeed *= 1.5;
        self.width = 64;
        self.height = 60;
        self.stats = {
            attack:0,
            defense:0,
            heal:1,
            range:10,
            speed:5,
            damageReduction:0,
            debuffs:[
                {id:'frozen',time:200},
                {id:'frostbite',time:200},
                {id:'frostburn',time:200},
                {id:'burning',time:200},
                {id:'electrified',time:200},
                {id:'death',time:200},
                {id:'shocked',time:200},
                {id:'thundered',time:200},
                {id:'incinerating',time:200},
            ],
        }
        self.shootSpeed = 1;
        if(Player.list[self.parent].questStats["Pet Training"] === true){
            self.shootSpeed *= 2;
        }
    }
    if(Player.list[self.parent].questStats["Pet Training"] === true){
        self.stats.attack *= 3;
    }
    self.canChangeMap = false;
    self.trackEntity(Player.list[self.parent],128);
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
        if(self.hp <= 0){
            self.toRemove = true;
            addToChat('style="color:#ff0000">',self.name + ' was slain...');
            if(Player.list[self.parent].level !== 0){
                setTimeout(function(){
                    addToChat('style="color:#00aadd">','A GOD DOES NOT FEAR DEATH!');
                },100000);
                setTimeout(function(){
                    addToChat('style="color:#00aadd">','A fatal mistake!');
                },102000);
                setTimeout(function(){
                    addToChat('style="color:#00aadd">','Of all my segments to get hit by...');
                },104000);
                setTimeout(function(){
                    addToChat('style="color:#00aadd">','You hit my tail?');
                },105000);
                setTimeout(function(){
                    addToChat('style="color:#ff00aa">','It\'s not over yet, kid!');
                },110000);
                setTimeout(function(){
                    if(Player.list[self.parent]){
                        addToChat('style="color:#ff0000">',Player.list[self.parent].displayName + ' let their arms get torn off by The Devourer of Gods.');
                    }
                },113000);
                setTimeout(function(){
                    addToChat('style="color:#ff00ff">','Echdeath has enraged.');
                    if(Player.list[self.parent]){
                        for(var i = 0;i < 25;i++){
                            s.smite(Player.list[self.parent].username);
                        }
                    }
                },115000);
                setTimeout(function(){
                    if(Player.list[self.parent]){
                        addToChat('style="color:#ff0000">',Player.list[self.parent].displayName + ' was removed from Meadow Guarder by Echdeath.');
                        addToChat('style="color:#ff0000">',':echdeath');
                    }
                },116000);
            }
            else{
                setTimeout(function(){
                    addToChat('style="color:#00aadd">','Go to hell.');
                },5000);
                setTimeout(function(){
                    if(Player.list[self.parent]){
                        for(var i = 0;i < 25;i++){
                            s.smite(Player.list[self.parent].username);
                        }
                    }
                    s.testDPS();
                },7000);
            }
        }
        self.updateAttack();
    }
    self.updateAttack = function(){
        self.mana = Math.min(self.mana + 1,self.manaMax);
        if(self.petType === 'Kiol'){
            if(self.mana >= 100 && Player.list[self.parent].isDead === false){
                if(Player.list[self.parent].hp < Player.list[self.parent].hpMax / 3){
                    var heal = 200 * Player.list[self.parent].stats.heal;
                    heal = Math.min(Player.list[self.parent].hpMax - Player.list[self.parent].hp,heal);
                    Player.list[self.parent].hp += heal;
                    if(heal){
                        var particle = new Particle({
                            x:Player.list[self.parent].x + Math.random() * 64 - 32,
                            y:Player.list[self.parent].y + Math.random() * 64 - 32,
                            map:Player.list[self.parent].map,
                            particleType:'greenDamage',
                            value:'+' + Math.round(heal),
                        });
                    }
                    self.mana -= 100;
                }
            }
            if(self.reload >= 10 && Player.list[self.parent].isDead === false){
                var closestMonster = undefined;
                for(var i in Monster.list){
                    if(closestMonster === undefined && Monster.list[i].map === self.map && Monster.list[i].invincible === false){
                        closestMonster = Monster.list[i];
                    }
                    else if(closestMonster !== undefined){
                        if(self.getDistance(Monster.list[i]) < self.getDistance(closestMonster) && Monster.list[i].map === self.map){
                            closestMonster = Monster.list[i];
                        }
                    }
                }
                if(closestMonster){
                    self.direction = Math.atan2(closestMonster.y - self.y,closestMonster.x - self.x) / Math.PI * 180;
                    self.shootProjectile(self.parent,'Player',self.direction,self.direction,'earthBullet',0,function(t){return 25;},0,self.stats);
                    self.reload = 0;
                }
            }
        }
        else if(self.petType === 'Cherrier'){
            self.animation += 0.5;
            if(self.animation >= 2){
                self.animation = 0;
            }
            if(self.mana >= 100 && Player.list[self.parent].isDead === false){
                if(Player.list[self.parent].hp < Player.list[self.parent].hpMax / 3){
                    for(var i = 0;i < 8;i++){
                        self.shootProjectile(self.parent,'Player',i * 45,i * 45,'fireBullet',0,function(t){return 25;},2,self.stats,'playerSeed');
                        self.shootProjectile(self.parent,'Player',i * 45,i * 45,'fireBullet',32,function(t){return 25;},2,self.stats,'playerSeed');
                        self.shootProjectile(self.parent,'Player',i * 45,i * 45,'fireBullet',64,function(t){return 25;},2,self.stats,'playerSeed');
                    }
                    self.mana -= 100;
                }
            }
            if(self.reload >= 7 && Player.list[self.parent].isDead === false){
                var closestMonster = undefined;
                for(var i in Monster.list){
                    if(closestMonster === undefined && Monster.list[i].map === self.map && Monster.list[i].invincible === false){
                        closestMonster = Monster.list[i];
                    }
                    else if(closestMonster !== undefined){
                        if(self.getDistance(Monster.list[i]) < self.getDistance(closestMonster) && Monster.list[i].map === self.map){
                            closestMonster = Monster.list[i];
                        }
                    }
                }
                if(closestMonster){
                    self.direction = Math.atan2(closestMonster.y - self.y,closestMonster.x - self.x) / Math.PI * 180;
                    self.shootProjectile(self.parent,'Player',self.direction,self.direction,'fireBullet',0,function(t){return 25;},0,self.stats);
                    self.reload = 0;
                }
            }
        }
        else if(self.petType === 'Sphere'){
            self.animation += 25;
            if(self.animation >= 360){
                self.animation = 0;
            }
            if(self.reload >= 1 && Player.list[self.parent].isDead === false){
                var closestMonster = undefined;
                for(var i in Monster.list){
                    if(closestMonster === undefined && Monster.list[i].map === self.map && Monster.list[i].invincible === false){
                        closestMonster = Monster.list[i];
                    }
                    else if(closestMonster !== undefined){
                        if(self.getDistance(Monster.list[i]) < self.getDistance(closestMonster) && Monster.list[i].map === self.map){
                            closestMonster = Monster.list[i];
                        }
                    }
                }
                if(closestMonster){
                    //self.direction = Math.atan2(closestMonster.y - self.y,closestMonster.x - self.x) / Math.PI * 180;
                    self.direction += 5;
                    for(var i = 0;i < 12;i++){
                        self.shootProjectile(self.parent,'Player',self.direction + i * 30,self.direction + i * 30,'bullet',30,function(t){return 0;},0,self.stats);
                    }
                    self.reload = 0;
                }
            }
        }
        else if(self.petType === 'Thunderbird'){
            if(self.spdX < 0){
                if(self.animation !== -1){
                    self.animation += 0.5;
                }
                else{
                    self.animation = 0;
                }
                if(self.animation >= 4){
                    self.animation = 0;
                }
            }
            else{
                if(self.animation !== -1){
                    self.animation += 0.5;
                }
                else{
                    self.animation = 4;
                }
                if(self.animation >= 8){
                    self.animation = 4;
                }
            }
            if(self.reload >= 8 / self.shootSpeed && Player.list[self.parent].isDead === false){
                var closestMonster = undefined;
                for(var i in Monster.list){
                    if(closestMonster === undefined && Monster.list[i].map === self.map && Monster.list[i].invincible === false){
                        closestMonster = Monster.list[i];
                    }
                    else if(closestMonster !== undefined){
                        if(self.getDistance(Monster.list[i]) < self.getDistance(closestMonster) && Monster.list[i].map === self.map){
                            closestMonster = Monster.list[i];
                        }
                    }
                }
                if(closestMonster){
                    self.direction = Math.atan2(closestMonster.y - self.y,closestMonster.x - self.x) / Math.PI * 180;
                    self.shootProjectile(self.parent,'Player',self.direction,self.direction,'frostBullet',0,function(t){return 25;},3,self.stats,'monsterHoming');
                    self.reload = 0;
                }
            }
        }
        self.reload += 1;
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
        if(lastSelf.mana !== self.mana){
            pack.mana = self.mana;
            lastSelf.mana = self.mana;
        }
        if(lastSelf.manaMax !== self.manaMax){
            pack.manaMax = self.manaMax;
            lastSelf.manaMax = self.manaMax;
        }
        if(lastSelf.petType !== self.petType){
            pack.petType = self.petType;
            lastSelf.petType = self.petType;
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
        pack.map = self.map;
        pack.name = self.name;
        pack.mana = self.mana;
        pack.manaMax = self.manaMax;
        pack.petType = self.petType;
        pack.animation = self.animation;
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
    self.lastX = self.x;
    self.lastY = self.y;
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
    self.canCollide = true;
    self.outOfBounds = false;
    self.pierce = 0;
    if(param.pierce){
        self.pierce = param.pierce;
    }
    self.relativeToPlayer = false;
    if(param.projectilePattern === 'followPlayerStationary'){
        self.distanceFromParentX = Player.list[self.parent].x - self.x;
        self.distanceFromParentY = Player.list[self.parent].y - self.y;
        self.spdX = 0;
        self.spdY = 0;
        self.relativeToPlayer = self.parent;
    }
    if(param.projectilePattern === 'followPlayerStationaryNoCollision'){
        self.distanceFromParentX = Player.list[self.parent].x - self.x;
        self.distanceFromParentY = Player.list[self.parent].y - self.y;
        self.spdX = 0;
        self.spdY = 0;
        self.relativeToPlayer = self.parent;
        self.canCollide = false;
        self.outOfBounds = true;
    }
    if(param.projectilePattern === 'spinAroundPlayer'){
        self.angle = param.angle / 180 * Math.PI;
        self.canCollide = false;
        self.spdX = 0;
        self.spdY = 0;
        self.relativeToPlayer = self.parent;
        self.outOfBounds = true;
    }
    if(param.projectilePattern === 'spinAroundMonster'){
        self.angle = param.angle / 180 * Math.PI;
        self.canCollide = false;
        self.spdX = 0;
        self.spdY = 0;
        self.outOfBounds = true;
    }
    if(param.projectilePattern === 'splaser'){
        self.angle = param.angle / 180 * Math.PI;
        self.canCollide = false;
        self.spdX = 0;
        self.spdY = 0;
        self.outOfBounds = true;
    }
    if(param.projectilePattern === 'playerSplaser'){
        self.angle = param.angle / 180 * Math.PI;
        self.canCollide = false;
        self.spdX = 0;
        self.spdY = 0;
        self.relativeToPlayer = self.parent;
        self.outOfBounds = true;
    }
    if(param.projectilePattern === 'auraPlayer'){
        self.angle = param.angle;
        self.canCollide = false;
        self.spdX = 0;
        self.spdY = 0;
        self.relativeToPlayer = self.parent;
    }
    if(param.projectilePattern === 'spinAroundPoint'){
        self.canCollide = false;
        self.spdX = 0;
        self.spdY = 0;
        self.parentStartX = self.x;
        self.parentStartY = self.y;
        if(Player.list[self.parent]){
            //self.parentStartX = Player.list[self.parent].x;
            //self.parentStartY = Player.list[self.parent].y;
        }
    }
    if(param.projectilePattern === 'stationary'){
        self.canCollide = false;
        self.spdX = 0;
        self.spdY = 0;
    }
    if(param.projectilePattern === 'playerHoming'){
        self.canCollide = false;
    }
    if(param.projectilePattern === 'monsterHoming'){
        self.canCollide = false;
    }
    if(param.projectilePattern === 'skull'){
        self.canCollide = false;
    }
    if(param.projectilePattern === 'monsterSkull'){
        self.canCollide = false;
    }
    if(param.projectilePattern === 'unholyTrident'){
        self.canCollide = false;
    }
    if(param.projectilePattern === 'holyTrident'){
        self.canCollide = false;
    }
    if(param.projectilePattern === 'monsterHolyTrident'){
        self.canCollide = false;
    }
    if(param.projectilePattern === 'playerSoul'){
        self.canCollide = false;
    }
    if(param.projectilePattern === 'playerSoulLaunch'){
        self.canCollide = false;
    }
    if(param.projectilePattern === 'goldensaber'){
        self.canCollide = false;
    }
    if(param.projectilePattern === 'playerSoulWait'){
        self.canCollide = false;
        self.state = 0;
    }
    if(param.projectilePattern === 'noCollision'){
        self.canCollide = false;
    }
    if(param.projectilePattern === 'accellerateNoCollision'){
        self.canCollide = false;
    }
    if(param.projectilePattern === 'lightningStrike'){
        self.canCollide = false;
    }
    if(param.projectilePattern === 'seed'){
        self.canCollide = false;
    }
    if(param.projectilePattern === 'playerSeed'){
        self.canCollide = false;
    }
    if(param.projectilePattern === 'boomerang'){
        self.canCollide = false;
    }
    if(param.projectilePattern === 'thegemofsp'){
        self.angle = param.angle / 180 * Math.PI;
        self.canCollide = false;
        self.spdX = 0;
        self.spdY = 0;
        self.relativeToPlayer = self.parent;
    }
    self.pushPower = self.stats.knockback;
    self.doUpdate = true;
    var lastSelf = {};
	var super_update = self.update;
	self.update = function(){
        self.timer += 1;
        if(param.stats.range !== undefined){
            if(self.timer > 40 * param.stats.range){
                self.toRemove = true;
            }
        }
        else{
            if(self.timer > 40){
                self.toRemove = true;
            }
        }
        if(!self.doUpdate){
            return;
        }
        self.lastX = self.x;
        self.lastY = self.y;
        if(self.timer !== 1){
            if(self.doCollision){
                var largestSpeedRatio = 1;
                if(largestSpeedRatio < Math.abs(self.spdX) / self.width){
                    largestSpeedRatio = Math.ceil(Math.abs(self.spdX) / self.width);
                }
                if(largestSpeedRatio < Math.abs(self.spdY) / self.height){
                    largestSpeedRatio = Math.ceil(Math.abs(self.spdY) / self.height);
                }
                self.spdX = self.spdX / largestSpeedRatio;
                self.spdY = self.spdY / largestSpeedRatio;
                for(var i = 0;i < largestSpeedRatio;i++){
                    self.lastX = self.x;
                    self.lastY = self.y;
                    super_update();
                    self.updateCollisions();
                }
                self.spdX = self.spdX * largestSpeedRatio;
                self.spdY = self.spdY * largestSpeedRatio;
            }
            else{
                self.lastX = self.x;
                self.lastY = self.y;
                super_update();
            }
        }
        if(self.x < self.width / 2 && self.outOfBounds === false){
            self.x = self.width / 2;
            if(param.projectilePattern === 'bounceOffCollisions'){
                self.spdX = -self.spdX;
            }
            else{
                self.toRemove = true;
            }
        }
        if(self.x > self.mapWidth - self.width / 2 && self.outOfBounds === false){
            self.x = self.mapWidth - self.width / 2;
            if(param.projectilePattern === 'bounceOffCollisions'){
                self.spdX = -self.spdX;
            }
            else{
                self.toRemove = true;
            }
        }
        if(self.y < self.height / 2 && self.outOfBounds === false){
            self.y = self.height / 2;
            if(param.projectilePattern === 'bounceOffCollisions'){
                self.spdY = -self.spdY;
            }
            else{
                self.toRemove = true;
            }
        }
        if(self.y > self.mapHeight - self.height / 2 && self.outOfBounds === false){
            self.y = self.mapHeight - self.height / 2;
            if(param.projectilePattern === 'bounceOffCollisions'){
                self.spdY = -self.spdY;
            }
            else{
                self.toRemove = true;
            }
        }
        if(param.projectilePattern === 'followPlayerStationary'){
            self.x = Player.list[self.parent].x - self.distanceFromParentX;
            self.y = Player.list[self.parent].y - self.distanceFromParentY;
            if(param.spin !== undefined){
                self.direction += param.spin(self.timer);
            }
        }
        else if(param.projectilePattern === 'followPlayerStationaryNoCollision'){
            self.x = Player.list[self.parent].x - self.distanceFromParentX;
            self.y = Player.list[self.parent].y - self.distanceFromParentY;
            if(param.spin !== undefined){
                self.direction += param.spin(self.timer);
            }
        }
        else if(param.projectilePattern === 'spinAroundPlayer'){
            if(Player.list[self.parent]){
                self.x = Player.list[self.parent].x;
                self.y = Player.list[self.parent].y;
                self.x += -Math.sin(self.angle) * param.distance;
                self.y += Math.cos(self.angle) * param.distance;
                self.angle += param.stats.speed / 2;
                self.direction = self.angle * 180 / Math.PI + 180;
            }
            else{
                self.toRemove = true;
            }
        }
        else if(param.projectilePattern === 'thegemofsp'){
            if(Player.list[self.parent]){
                self.x = Player.list[self.parent].x;
                self.y = Player.list[self.parent].y;
                self.x += -Math.sin(self.angle) * param.distance;
                self.y += Math.cos(self.angle) * param.distance;
                self.angle += param.stats.speed / 2;
                self.direction = self.angle * 180 / Math.PI + 135;
                var closestMonster = undefined;
                for(var i in Monster.list){
                    if(closestMonster === undefined && Monster.list[i].map === self.map && Monster.list[i].invincible === false){
                        closestMonster = Monster.list[i];
                    }
                    else if(closestMonster !== undefined){
                        if(self.getDistance(Monster.list[i]) < self.getDistance(closestMonster) && Monster.list[i].map === self.map){
                            closestMonster = Monster.list[i];
                        }
                    }
                }
                if(self.timer % 3 === 0 && closestMonster){
                    var projectileWidth = 0;
                    var projectileHeight = 0;
                    var projectileStats = {};
                    for(var i in projectileData){
                        if(i === 'bullet'){
                            projectileWidth = projectileData[i].width;
                            projectileHeight = projectileData[i].height;
                            projectileStats = Object.create(projectileData[i].stats);
                        }
                    }
                    for(var i in projectileStats){
                        projectileStats[i] *= self.stats[i];
                    }
                    projectileStats.attack = Math.round(projectileStats.attack * 0.7);
                    projectileStats.range *= 10;
                    projectileStats.speed *= 0.3;
                    projectileStats.damageReduction = 0;
                    projectileStats.debuffs = self.stats.debuffs;
                    var projectile = Projectile({
                        id:self.parent,
                        projectileType:'bullet',
                        angle:Math.atan2(closestMonster.y - self.y,closestMonster.x - self.x) / Math.PI * 180,
                        direction:Math.atan2(closestMonster.y - self.y,closestMonster.x - self.x) / Math.PI * 180,
                        x:self.x + Math.cos(Math.atan2(closestMonster.y - self.y,closestMonster.x - self.x) / 180 * Math.PI) * 32,
                        y:self.y + Math.sin(Math.atan2(closestMonster.y - self.y,closestMonster.x - self.x) / 180 * Math.PI) * 32,
                        distance:32,
                        map:self.map,
                        parentType:'Player',
                        mapWidth:Player.list[self.parent].mapWidth,
                        mapHeight:Player.list[self.parent].mapHeight,
                        width:projectileWidth,
                        height:projectileHeight,
                        spin:function(t){return 0},
                        pierce:0,
                        projectilePattern:'accellerateNoCollision',
                        stats:projectileStats,
                        onCollision:function(self,pt){
                            if(self.pierce === 0){
                                self.toRemove = true;
                            }
                            else{
                                self.pierce -= 1;
                            }
                        }
                    });
                }
            }
            else{
                self.toRemove = true;
            }
        }
        else if(param.projectilePattern === 'spinAroundMonster'){
            if(Monster.list[self.parent]){
                self.x = Monster.list[self.parent].x;
                self.y = Monster.list[self.parent].y;
                self.x += -Math.sin(self.angle) * param.distance;
                self.y += Math.cos(self.angle) * param.distance;
                self.angle += param.stats.speed / 2;
                self.direction = self.angle * 180 / Math.PI + 180;
            }
            else{
                self.toRemove = true;
            }
        }
        else if(param.projectilePattern === 'splaser'){
            if(Monster.list[self.parent]){
                self.x = Monster.list[self.parent].x;
                self.y = Monster.list[self.parent].y;
                self.x += -Math.sin(self.angle) * param.distance;
                self.y += Math.cos(self.angle) * param.distance;
                self.angle += param.stats.speed / 2;
                self.direction = self.angle * 180 / Math.PI + 75;
            }
            else{
                self.toRemove = true;
            }
        }
        else if(param.projectilePattern === 'playerSplaser'){
            if(Player.list[self.parent]){
                self.x = Player.list[self.parent].x;
                self.y = Player.list[self.parent].y;
                self.x += -Math.sin((Player.list[self.parent].direction - 90) / 180 * Math.PI) * param.distance;
                self.y += Math.cos((Player.list[self.parent].direction - 90) / 180 * Math.PI) * param.distance;
                self.direction = Player.list[self.parent].direction;
            }
            else{
                self.toRemove = true;
            }
        }
        else if(param.projectilePattern === 'auraPlayer'){
            self.x = Player.list[self.parent].x;
            self.y = Player.list[self.parent].y;
            self.spdX = -Math.sin(self.angle) * param.distance;
            self.spdY = Math.cos(self.angle) * param.distance;
            self.x += self.spdX;
            self.y += self.spdY;
            self.angle += param.stats.speed / 2;
            self.direction = self.angle * 180 / Math.PI + 180;
            if(param.spin(self.timer) !== 0){
                self.direction += param.spin(self.timer);
            }
            else{
                self.direction = Math.atan2(self.spdY,self.spdX) / Math.PI * 180 + 90;
            }
        }
        else if(param.projectilePattern === 'spinAroundPoint'){
            var angle = Math.atan2(self.y - self.parentStartY,self.x - self.parentStartX);
            self.spdX = -Math.sin(angle) * param.stats.speed * 25;
            self.spdY = Math.cos(angle) * param.stats.speed * 25;
            if(param.spin(self.timer) !== 0){
                self.direction += param.spin(self.timer);
            }
            else{
                self.direction = Math.atan2(self.spdY,self.spdX) / Math.PI * 180;
            }
            self.direction = angle * 180 / Math.PI + 180;
        }
        else if(param.projectilePattern === 'playerHoming'){
            if(Monster.list[self.parent] === undefined){
                self.toRemove = true;
            }
            else if(Monster.list[self.parent].target !== undefined){
                self.spdX = Math.cos(Math.atan2(Monster.list[self.parent].target.y - self.y,Monster.list[self.parent].target.x - self.x)) * 25 * self.stats.speed;
                self.spdY = Math.sin(Math.atan2(Monster.list[self.parent].target.y - self.y,Monster.list[self.parent].target.x - self.x)) * 25 * self.stats.speed;
            }
            self.timer -= 0.5;
            if(param.spin(self.timer) !== 0){
                self.direction += param.spin(self.timer);
            }
            else{
                self.direction = Math.atan2(self.spdY,self.spdX) / Math.PI * 180;
            }
        }
        else if(param.projectilePattern === 'monsterHoming'){
            var closestMonster = undefined;
            for(var i in Monster.list){
                if(closestMonster === undefined && Monster.list[i].map === self.map && Monster.list[i].invincible === false){
                    closestMonster = Monster.list[i];
                }
                else if(closestMonster !== undefined){
                    if(self.getDistance(Monster.list[i]) < self.getDistance(closestMonster) && Monster.list[i].map === self.map){
                        closestMonster = Monster.list[i];
                    }
                }
            }
            if(closestMonster){
                self.spdX = Math.cos(Math.atan2(closestMonster.y - self.y,closestMonster.x - self.x)) * 25 * self.stats.speed;
                self.spdY = Math.sin(Math.atan2(closestMonster.y - self.y,closestMonster.x - self.x)) * 25 * self.stats.speed;
            }
            self.timer -= 0.5;
            if(param.spin(self.timer) !== 0){
                self.direction += param.spin(self.timer);
            }
            else{
                self.direction = Math.atan2(self.spdY,self.spdX) / Math.PI * 180;
            }
        }
        else if(param.projectilePattern === 'monsterHomingSpin'){
            var closestMonster = undefined;
            for(var i in Monster.list){
                if(closestMonster === undefined && Monster.list[i].map === self.map && Monster.list[i].invincible === false){
                    closestMonster = Monster.list[i];
                }
                else if(closestMonster !== undefined){
                    if(self.getDistance(Monster.list[i]) < self.getDistance(closestMonster) && Monster.list[i].map === self.map){
                        closestMonster = Monster.list[i];
                    }
                }
            }
            if(closestMonster){
                if(Math.atan2(closestMonster.y - self.y,closestMonster.x - self.x) / Math.PI * 180 - self.direction > 0){
                    self.direction += Math.min(2,Math.atan2(closestMonster.y - self.y,closestMonster.x - self.x) / Math.PI * 180 - self.direction);
                }
                else{
                    self.direction -= Math.min(2,self.direction - Math.atan2(closestMonster.y - self.y,closestMonster.x - self.x) / Math.PI * 180);
                }
                self.spdX = Math.cos(self.direction / 180 * Math.PI) * 25 * self.stats.speed;
                self.spdY = Math.sin(self.direction / 180 * Math.PI) * 25 * self.stats.speed;
            }
            self.timer -= 0.5;
            if(param.spin(self.timer) !== 0){
                self.direction += param.spin(self.timer);
            }
        }
        else if(param.projectilePattern === 'skull'){
            var closestMonster = undefined;
            for(var i in Monster.list){
                if(closestMonster === undefined && Monster.list[i].map === self.map && Monster.list[i].invincible === false){
                    closestMonster = Monster.list[i];
                }
                else if(closestMonster !== undefined){
                    if(self.getDistance(Monster.list[i]) < self.getDistance(closestMonster) && Monster.list[i].map === self.map){
                        closestMonster = Monster.list[i];
                    }
                }
            }
            if(closestMonster){
                //self.spdX = Math.cos(Math.atan2(closestMonster.y - self.y,closestMonster.x - self.x)) * 25 * self.stats.speed;
                //self.spdY = Math.sin(Math.atan2(closestMonster.y - self.y,closestMonster.x - self.x)) * 25 * self.stats.speed;
                self.spdX += Math.cos(Math.atan2(closestMonster.y - self.y,closestMonster.x - self.x)) * 5;
                self.spdY += Math.sin(Math.atan2(closestMonster.y - self.y,closestMonster.x - self.x)) * 5;
                self.spdX *= 0.95;
                self.spdY *= 0.95;
            }
            self.timer -= 0.5;
            if(self.timer % 2 === 0 && closestMonster){
                var projectileWidth = 0;
                var projectileHeight = 0;
                var projectileStats = {};
                for(var i in projectileData){
                    if(i === 'bullet'){
                        projectileWidth = projectileData[i].width;
                        projectileHeight = projectileData[i].height;
                        projectileStats = Object.create(projectileData[i].stats);
                    }
                }
                for(var i in projectileStats){
                    projectileStats[i] *= self.stats[i];
                }
                projectileStats.attack = Math.round(projectileStats.attack / 3);
                projectileStats.speed = 2;
                projectileStats.damageReduction = 0;
                projectileStats.debuffs = self.stats.debuffs;
                var projectile = Projectile({
                    id:self.parent,
                    projectileType:'bullet',
                    angle:Math.atan2(closestMonster.y - self.y,closestMonster.x - self.x) / Math.PI * 180,
                    direction:Math.atan2(closestMonster.y - self.y,closestMonster.x - self.x) / Math.PI * 180,
                    x:self.x + Math.cos(Math.atan2(closestMonster.y - self.y,closestMonster.x - self.x) / 180 * Math.PI) * 32,
                    y:self.y + Math.sin(Math.atan2(closestMonster.y - self.y,closestMonster.x - self.x) / 180 * Math.PI) * 32,
                    distance:32,
                    map:self.map,
                    parentType:'Player',
                    mapWidth:Player.list[self.parent].mapWidth,
                    mapHeight:Player.list[self.parent].mapHeight,
                    width:projectileWidth,
                    height:projectileHeight,
                    spin:function(t){return 0},
                    pierce:0,
                    projectilePattern:undefined,
                    stats:projectileStats,
                    onCollision:function(self,pt){
                        if(self.pierce === 0){
                            self.toRemove = true;
                        }
                        else{
                            self.pierce -= 1;
                        }
                    }
                });
            }
            if(param.spin(self.timer) !== 0){
                self.direction += param.spin(self.timer);
            }
            else{
                self.direction = Math.atan2(self.spdY,self.spdX) / Math.PI * 180;
            }
        }
        else if(param.projectilePattern === 'monsterSkull'){
            if(Monster.list[self.parent]){
                if(Monster.list[self.parent].target !== undefined){
                    self.spdX += Math.cos(Math.atan2(Monster.list[self.parent].target.y - self.y,Monster.list[self.parent].target.x - self.x)) * 5;
                    self.spdY += Math.sin(Math.atan2(Monster.list[self.parent].target.y - self.y,Monster.list[self.parent].target.x - self.x)) * 5;
                    self.spdX *= 0.95;
                    self.spdY *= 0.95;
                }
                self.timer -= 0.5;
                if(self.timer % 2 === 0 && Monster.list[self.parent].target){
                    var projectileWidth = 0;
                    var projectileHeight = 0;
                    var projectileStats = {};
                    for(var i in projectileData){
                        if(i === 'bullet'){
                            projectileWidth = projectileData[i].width;
                            projectileHeight = projectileData[i].height;
                            projectileStats = Object.create(projectileData[i].stats);
                        }
                    }
                    for(var i in projectileStats){
                        projectileStats[i] *= self.stats[i];
                    }
                    projectileStats.attack = Math.round(projectileStats.attack / 3);
                    projectileStats.speed = 2;
                    projectileStats.damageReduction = 0;
                    projectileStats.debuffs = self.stats.debuffs;
                    var projectile = Projectile({
                        id:self.parent,
                        projectileType:'bullet',
                        angle:Math.atan2(Monster.list[self.parent].target.y - self.y,Monster.list[self.parent].target.x - self.x) / Math.PI * 180,
                        direction:Math.atan2(Monster.list[self.parent].target.y - self.y,Monster.list[self.parent].target.x - self.x) / Math.PI * 180,
                        x:self.x + Math.cos(Math.atan2(Monster.list[self.parent].target.y - self.y,Monster.list[self.parent].target.x - self.x) / 180 * Math.PI) * 32,
                        y:self.y + Math.sin(Math.atan2(Monster.list[self.parent].target.y - self.y,Monster.list[self.parent].target.x - self.x) / 180 * Math.PI) * 32,
                        distance:32,
                        map:self.map,
                        parentType:'Monster',
                        mapWidth:Monster.list[self.parent].mapWidth,
                        mapHeight:Monster.list[self.parent].mapHeight,
                        width:projectileWidth,
                        height:projectileHeight,
                        spin:function(t){return 0},
                        pierce:0,
                        projectilePattern:undefined,
                        stats:projectileStats,
                        onCollision:function(self,pt){
                            if(self.pierce === 0){
                                self.toRemove = true;
                            }
                            else{
                                self.pierce -= 1;
                            }
                        }
                    });
                }
            }
            if(param.spin(self.timer) !== 0){
                self.direction += param.spin(self.timer);
            }
            else{
                self.direction = Math.atan2(self.spdY,self.spdX) / Math.PI * 180;
            }
        }
        else if(param.projectilePattern === 'seed'){
            if(Monster.list[self.parent] === undefined){
                self.toRemove = true;
            }
            else if(Monster.list[self.parent].target !== undefined){
                self.spdX += Math.cos(Math.atan2(Monster.list[self.parent].target.y - self.y,Monster.list[self.parent].target.x - self.x)) * 5;
                self.spdY += Math.sin(Math.atan2(Monster.list[self.parent].target.y - self.y,Monster.list[self.parent].target.x - self.x)) * 5;
                self.spdX *= 0.95;
                self.spdY *= 0.95;
            }
            else{
                self.toRemove = true;
            }
            if(param.spin(self.timer) !== 0){
                self.direction += param.spin(self.timer);
            }
            else{
                self.direction = Math.atan2(self.spdY,self.spdX) / Math.PI * 180;
            }
        }
        else if(param.projectilePattern === 'playerSeed'){
            var closestMonster = undefined;
            for(var i in Monster.list){
                if(closestMonster === undefined && Monster.list[i].map === self.map && Monster.list[i].invincible === false){
                    closestMonster = Monster.list[i];
                }
                else if(closestMonster !== undefined){
                    if(self.getDistance(Monster.list[i]) < self.getDistance(closestMonster) && Monster.list[i].map === self.map){
                        closestMonster = Monster.list[i];
                    }
                }
            }
            if(closestMonster){
                //self.spdX = Math.cos(Math.atan2(closestMonster.y - self.y,closestMonster.x - self.x)) * 25 * self.stats.speed;
                //self.spdY = Math.sin(Math.atan2(closestMonster.y - self.y,closestMonster.x - self.x)) * 25 * self.stats.speed;
                self.spdX += Math.cos(Math.atan2(closestMonster.y - self.y,closestMonster.x - self.x)) * 5;
                self.spdY += Math.sin(Math.atan2(closestMonster.y - self.y,closestMonster.x - self.x)) * 5;
                self.spdX *= 0.95;
                self.spdY *= 0.95;
            }
            if(param.spin(self.timer) !== 0){
                self.direction += param.spin(self.timer);
            }
            else{
                self.direction = Math.atan2(self.spdY,self.spdX) / Math.PI * 180;
            }
        }
        else if(param.projectilePattern === 'unholyTrident'){
            if(self.timer % 6 === 0 && self.timer < 20){
                var projectileWidth = 0;
                var projectileHeight = 0;
                var projectileStats = {};
                for(var i in projectileData){
                    if(i === 'unholySoul'){
                        projectileWidth = projectileData[i].width;
                        projectileHeight = projectileData[i].height;
                        projectileStats = Object.create(projectileData[i].stats);
                    }
                }
                for(var i in projectileStats){
                    projectileStats[i] *= self.stats[i];
                }
                projectileStats.attack = Math.round(projectileStats.attack / 3);
                projectileStats.damageReduction = 0;
                projectileStats.debuffs = self.stats.debuffs;
                var projectile = Projectile({
                    id:self.parent,
                    projectileType:'unholySoul',
                    angle:self.direction + 90,
                    direction:self.direction + 90,
                    x:self.x,
                    y:self.y,
                    distance:32,
                    map:self.map,
                    parentType:'Player',
                    mapWidth:Player.list[self.parent].mapWidth,
                    mapHeight:Player.list[self.parent].mapHeight,
                    width:projectileWidth,
                    height:projectileHeight,
                    spin:function(t){return 50},
                    pierce:1,
                    projectilePattern:'playerSoulLaunch',
                    stats:projectileStats,
                    onCollision:function(self,pt){
                        if(self.pierce === 0){
                            self.toRemove = true;
                        }
                        else{
                            self.pierce -= 1;
                        }
                    }
                });
                var projectile = Projectile({
                    id:self.parent,
                    projectileType:'unholySoul',
                    angle:self.direction + 270,
                    direction:self.direction + 270,
                    x:self.x,
                    y:self.y,
                    distance:32,
                    map:self.map,
                    parentType:'Player',
                    mapWidth:Player.list[self.parent].mapWidth,
                    mapHeight:Player.list[self.parent].mapHeight,
                    width:projectileWidth,
                    height:projectileHeight,
                    spin:function(t){return 50},
                    pierce:1,
                    projectilePattern:'playerSoulLaunch',
                    stats:projectileStats,
                    onCollision:function(self,pt){
                        if(self.pierce === 0){
                            self.toRemove = true;
                        }
                        else{
                            self.pierce -= 1;
                        }
                    }
                });
            }
        }
        else if(param.projectilePattern === 'holyTrident'){
            if(self.timer % 6 === 0 && self.timer < 20){
                var projectileWidth = 0;
                var projectileHeight = 0;
                var projectileStats = {};
                for(var i in projectileData){
                    if(i === 'holySoul'){
                        projectileWidth = projectileData[i].width;
                        projectileHeight = projectileData[i].height;
                        projectileStats = Object.create(projectileData[i].stats);
                    }
                }
                for(var i in projectileStats){
                    projectileStats[i] *= self.stats[i];
                }
                projectileStats.attack = Math.round(projectileStats.attack / 3);
                projectileStats.damageReduction = 0;
                projectileStats.debuffs = self.stats.debuffs;
                var projectile = Projectile({
                    id:self.parent,
                    projectileType:'holySoul',
                    angle:self.direction + 90,
                    direction:self.direction + 90,
                    x:self.x,
                    y:self.y,
                    distance:32,
                    map:self.map,
                    parentType:'Player',
                    mapWidth:Player.list[self.parent].mapWidth,
                    mapHeight:Player.list[self.parent].mapHeight,
                    width:projectileWidth,
                    height:projectileHeight,
                    spin:function(t){return 50},
                    pierce:1,
                    projectilePattern:'playerSoulLaunch',
                    stats:projectileStats,
                    onCollision:function(self,pt){
                        if(self.pierce === 0){
                            self.toRemove = true;
                        }
                        else{
                            self.pierce -= 1;
                        }
                    }
                });
                var projectile = Projectile({
                    id:self.parent,
                    projectileType:'holySoul',
                    angle:self.direction + 270,
                    direction:self.direction + 270,
                    x:self.x,
                    y:self.y,
                    distance:32,
                    map:self.map,
                    parentType:'Player',
                    mapWidth:Player.list[self.parent].mapWidth,
                    mapHeight:Player.list[self.parent].mapHeight,
                    width:projectileWidth,
                    height:projectileHeight,
                    spin:function(t){return 50},
                    pierce:1,
                    projectilePattern:'playerSoulLaunch',
                    stats:projectileStats,
                    onCollision:function(self,pt){
                        if(self.pierce === 0){
                            self.toRemove = true;
                        }
                        else{
                            self.pierce -= 1;
                        }
                    }
                });
            }
        }
        else if(param.projectilePattern === 'monsterHolyTrident'){
            if(self.timer % 6 === 0 && self.timer < 20 && Monster.list[self.parent]){
                var projectileWidth = 0;
                var projectileHeight = 0;
                var projectileStats = {};
                for(var i in projectileData){
                    if(i === 'holySoul'){
                        projectileWidth = projectileData[i].width;
                        projectileHeight = projectileData[i].height;
                        projectileStats = Object.create(projectileData[i].stats);
                    }
                }
                for(var i in projectileStats){
                    projectileStats[i] *= self.stats[i];
                }
                projectileStats.attack = Math.round(projectileStats.attack / 3);
                projectileStats.damageReduction = 0;
                projectileStats.debuffs = self.stats.debuffs;
                var projectile = Projectile({
                    id:self.parent,
                    projectileType:'holySoul',
                    angle:self.direction + 90,
                    direction:self.direction + 90,
                    x:self.x,
                    y:self.y,
                    distance:32,
                    map:self.map,
                    parentType:'Monster',
                    mapWidth:Monster.list[self.parent].mapWidth,
                    mapHeight:Monster.list[self.parent].mapHeight,
                    width:projectileWidth,
                    height:projectileHeight,
                    spin:function(t){return 50},
                    pierce:1,
                    projectilePattern:'monsterSoulLaunch',
                    stats:projectileStats,
                    onCollision:function(self,pt){
                        if(self.pierce === 0){
                            self.toRemove = true;
                        }
                        else{
                            self.pierce -= 1;
                        }
                    }
                });
                var projectile = Projectile({
                    id:self.parent,
                    projectileType:'holySoul',
                    angle:self.direction + 270,
                    direction:self.direction + 270,
                    x:self.x,
                    y:self.y,
                    distance:32,
                    map:self.map,
                    parentType:'Monster',
                    mapWidth:Monster.list[self.parent].mapWidth,
                    mapHeight:Monster.list[self.parent].mapHeight,
                    width:projectileWidth,
                    height:projectileHeight,
                    spin:function(t){return 50},
                    pierce:1,
                    projectilePattern:'monsterSoulLaunch',
                    stats:projectileStats,
                    onCollision:function(self,pt){
                        if(self.pierce === 0){
                            self.toRemove = true;
                        }
                        else{
                            self.pierce -= 1;
                        }
                    }
                });
            }
        }
        else if(param.projectilePattern === 'playerSoul' && self.timer < 10){
            var closestMonster = undefined;
            for(var i in Monster.list){
                if(closestMonster === undefined && Monster.list[i].map === self.map && Monster.list[i].invincible === false){
                    closestMonster = Monster.list[i];
                }
                else if(closestMonster !== undefined){
                    if(self.getDistance(Monster.list[i]) < self.getDistance(closestMonster) && Monster.list[i].map === self.map){
                        closestMonster = Monster.list[i];
                    }
                }
            }
            if(closestMonster){
                self.spdX = Math.cos(Math.atan2(closestMonster.y - self.y,closestMonster.x - self.x)) * 5 * self.stats.speed;
                self.spdY = Math.sin(Math.atan2(closestMonster.y - self.y,closestMonster.x - self.x)) * 5 * self.stats.speed;
            }
            self.timer -= 0.5;
            if(param.spin(self.timer) !== 0){
                self.direction += param.spin(self.timer);
            }
            else{
                self.direction = Math.atan2(self.spdY,self.spdX) / Math.PI * 180;
            }
        }
        else if(param.projectilePattern === 'playerSoul'){
            var closestMonster = undefined;
            for(var i in Monster.list){
                if(closestMonster === undefined && Monster.list[i].map === self.map && Monster.list[i].invincible === false){
                    closestMonster = Monster.list[i];
                }
                else if(closestMonster !== undefined){
                    if(self.getDistance(Monster.list[i]) < self.getDistance(closestMonster) && Monster.list[i].map === self.map){
                        closestMonster = Monster.list[i];
                    }
                }
            }
            if(closestMonster){
                self.spdX = Math.cos(Math.atan2(closestMonster.y - self.y,closestMonster.x - self.x)) * 75 * self.stats.speed;
                self.spdY = Math.sin(Math.atan2(closestMonster.y - self.y,closestMonster.x - self.x)) * 75 * self.stats.speed;
            }
            self.timer -= 0.5;
            if(param.spin(self.timer) !== 0){
                self.direction += param.spin(self.timer);
            }
            else{
                self.direction = Math.atan2(self.spdY,self.spdX) / Math.PI * 180;
            }
        }
        else if(param.projectilePattern === 'playerSoulLaunch' && self.timer < 10){
            self.spdX *= 0.9;
            self.spdY *= 0.9;
            self.timer -= 0.5;
            if(param.spin(self.timer) !== 0){
                self.direction += param.spin(self.timer);
            }
            else{
                self.direction = Math.atan2(self.spdY,self.spdX) / Math.PI * 180;
            }
        }
        else if(param.projectilePattern === 'playerSoulLaunch'){
            var closestMonster = undefined;
            for(var i in Monster.list){
                if(closestMonster === undefined && Monster.list[i].map === self.map && Monster.list[i].invincible === false){
                    closestMonster = Monster.list[i];
                }
                else if(closestMonster !== undefined){
                    if(self.getDistance(Monster.list[i]) < self.getDistance(closestMonster) && Monster.list[i].map === self.map){
                        closestMonster = Monster.list[i];
                    }
                }
            }
            if(closestMonster){
                self.spdX = Math.cos(Math.atan2(closestMonster.y - self.y,closestMonster.x - self.x)) * 75 * self.stats.speed;
                self.spdY = Math.sin(Math.atan2(closestMonster.y - self.y,closestMonster.x - self.x)) * 75 * self.stats.speed;
            }
            self.timer -= 0.5;
            if(param.spin(self.timer) !== 0){
                self.direction += param.spin(self.timer);
            }
            else{
                self.direction = Math.atan2(self.spdY,self.spdX) / Math.PI * 180;
            }
        }
        else if(param.projectilePattern === 'goldensaber' && self.timer < 10){
            self.spdX *= 0.9;
            self.spdY *= 0.9;
            self.timer -= 0.5;
            self.direction = Math.atan2(self.spdY,self.spdX) / Math.PI * 180 + 135;
        }
        else if(param.projectilePattern === 'goldensaber'){
            var closestMonster = undefined;
            for(var i in Monster.list){
                if(closestMonster === undefined && Monster.list[i].map === self.map && Monster.list[i].invincible === false){
                    closestMonster = Monster.list[i];
                }
                else if(closestMonster !== undefined){
                    if(self.getDistance(Monster.list[i]) < self.getDistance(closestMonster) && Monster.list[i].map === self.map){
                        closestMonster = Monster.list[i];
                    }
                }
            }
            if(closestMonster){
                self.spdX = Math.cos(Math.atan2(closestMonster.y - self.y,closestMonster.x - self.x)) * 75 * self.stats.speed;
                self.spdY = Math.sin(Math.atan2(closestMonster.y - self.y,closestMonster.x - self.x)) * 75 * self.stats.speed;
            }
            self.timer -= 0.5;
            self.direction = Math.atan2(self.spdY,self.spdX) / Math.PI * 180 + 135;
        }
        else if(param.projectilePattern === 'monsterSoulLaunch' && self.timer < 10){
            self.spdX *= 0.9;
            self.spdY *= 0.9;
            self.timer -= 0.5;
            if(param.spin(self.timer) !== 0){
                self.direction += param.spin(self.timer);
            }
            else{
                self.direction = Math.atan2(self.spdY,self.spdX) / Math.PI * 180;
            }
        }
        else if(param.projectilePattern === 'monsterSoulLaunch'){
            if(Monster.list[self.parent]){
                if(Monster.list[self.parent].target){
                    self.spdX = Math.cos(Math.atan2(Monster.list[self.parent].target.y - self.y,Monster.list[self.parent].target.x - self.x)) * 75 * self.stats.speed;
                    self.spdY = Math.sin(Math.atan2(Monster.list[self.parent].target.y - self.y,Monster.list[self.parent].target.x - self.x)) * 75 * self.stats.speed;
                }
            }
            self.timer -= 0.5;
            if(param.spin(self.timer) !== 0){
                self.direction += param.spin(self.timer);
            }
            else{
                self.direction = Math.atan2(self.spdY,self.spdX) / Math.PI * 180;
            }
        }
        else if(param.projectilePattern === 'playerSoulWait'){
            var closestMonster = undefined;
            for(var i in Monster.list){
                if(closestMonster === undefined && Monster.list[i].map === self.map && Monster.list[i].invincible === false){
                    closestMonster = Monster.list[i];
                }
                else if(closestMonster !== undefined){
                    if(self.getDistance(Monster.list[i]) < self.getDistance(closestMonster) && Monster.list[i].map === self.map){
                        closestMonster = Monster.list[i];
                    }
                }
            }
            if(self.state === 0){
                self.spdX = 0;
                self.spdY = 0;
            }
            if(Player.list[self.parent].weaponState === 0){
                self.state = 1;
            }
            if(closestMonster && self.state === 1){
                self.spdX = Math.cos(Math.atan2(closestMonster.y - self.y,closestMonster.x - self.x)) * 75 * self.stats.speed;
                self.spdY = Math.sin(Math.atan2(closestMonster.y - self.y,closestMonster.x - self.x)) * 75 * self.stats.speed;
            }
            self.timer -= 0.5;
            if(param.spin(self.timer) !== 0){
                self.direction += param.spin(self.timer);
            }
            else{
                self.direction = Math.atan2(self.spdY,self.spdX) / Math.PI * 180;
            }
        }
        else if(param.projectilePattern === 'lightningStrike' && self.timer < 5){
            self.x -= self.spdX;
            self.y -= self.spdY;
        }
        else if(param.projectilePattern === 'accellerateNoCollision'){
            self.spdX = Math.min(self.spdX * 1.1,128);
            self.spdY = Math.min(self.spdY * 1.1,128);
        }
        else if(param.projectilePattern === 'boomerang'){
            if(Player.list[self.parent] === undefined){
                self.toRemove = true;
            }
            else if(Math.abs(Player.list[self.parent].x - self.x) < 32 && Math.abs(Player.list[self.parent].y - self.y) < 32 && self.timer > 10){
                self.toRemove = true;
            }
            else{
                self.spdX += Math.cos(Math.atan2(Player.list[self.parent].y - self.y,Player.list[self.parent].x - self.x)) * 5 * self.stats.speed;
                self.spdY += Math.sin(Math.atan2(Player.list[self.parent].y - self.y,Player.list[self.parent].x - self.x)) * 5 * self.stats.speed;
                self.spdX *= 0.98;
                self.spdY *= 0.98;
            }
            if(param.spin(self.timer) !== 0){
                self.direction += param.spin(self.timer);
            }
            else{
                self.direction = Math.atan2(self.spdY,self.spdX) / Math.PI * 180;
            }
        }
        else{
            if(param.spin !== undefined){
                self.direction += param.spin(self.timer);
            }
        }
        self.updateCollisions();
    }
    self.updateCollisions = function(){
        if(self.canCollide === false){
            return;
        }
        if(Collision.list[self.map][Math.round((self.x - 64) / 64)]){
            if(Collision.list[self.map][Math.round((self.x - 64) / 64)][Math.round((self.y - 64) / 64)]){
                self.doProjectileCollision(self.map,Math.round((self.x - 64) / 64),Math.round((self.y - 64) / 64));
            }
        }
        if(Collision.list[self.map][Math.round((self.x - 64) / 64)]){
            if(Collision.list[self.map][Math.round((self.x - 64) / 64)][Math.round((self.y) / 64)]){
                self.doProjectileCollision(self.map,Math.round((self.x - 64) / 64),Math.round((self.y) / 64));
            }
        }
        if(Collision.list[self.map][Math.round((self.x) / 64)]){
            if(Collision.list[self.map][Math.round((self.x) / 64)][Math.round((self.y - 64) / 64)]){
                self.doProjectileCollision(self.map,Math.round((self.x) / 64),Math.round((self.y - 64) / 64));
            }
        }
        if(Collision.list[self.map][Math.round((self.x) / 64)]){
            if(Collision.list[self.map][Math.round((self.x) / 64)][Math.round((self.y) / 64)]){
                self.doProjectileCollision(self.map,Math.round((self.x) / 64),Math.round((self.y) / 64));
            }
        }
    }
    self.doProjectileCollisionOld = function(map,x,y){
        var projectileCollision = {
            map:map,
            x:x,
            y:y,
        };
        if(ProjectileCollision.list[map][x][y] === 1){
            projectileCollision.width = 64;
            projectileCollision.height = 64;
            projectileCollision.x += 32;
            projectileCollision.y += 32;
        }
        if(ProjectileCollision.list[map][x][y] === 2){
            projectileCollision.width = 64;
            projectileCollision.height = 32;
            projectileCollision.x += 32;
            projectileCollision.y += 48;
        }
        if(ProjectileCollision.list[map][x][y] === 3){
            projectileCollision.width = 64;
            projectileCollision.height = 32;
            projectileCollision.x += 32;
            projectileCollision.y += 16;
        }
        if(ProjectileCollision.list[map][x][y] === 4){
            projectileCollision.width = 32;
            projectileCollision.height = 64;
            projectileCollision.x += 16;
            projectileCollision.y += 32;
        }
        if(ProjectileCollision.list[map][x][y] === 5){
            projectileCollision.width = 32;
            projectileCollision.height = 64;
            projectileCollision.x += 48;
            projectileCollision.y += 32;
        }
        if(ProjectileCollision.list[map][x][y] === 6){
            projectileCollision.width = 32;
            projectileCollision.height = 32;
            projectileCollision.x += 32;
            projectileCollision.y += 32;
        }
        if(ProjectileCollision.list[map][x][y] === 7){
            projectileCollision.width = 32;
            projectileCollision.height = 32;
            projectileCollision.x += 16;
            projectileCollision.y += 48;
        }
        if(ProjectileCollision.list[map][x][y] === 8){
            projectileCollision.width = 32;
            projectileCollision.height = 32;
            projectileCollision.x += 48;
            projectileCollision.y += 48;
        }
        if(ProjectileCollision.list[map][x][y] === 9){
            projectileCollision.width = 32;
            projectileCollision.height = 32;
            projectileCollision.x += 48;
            projectileCollision.y += 16;
        }
        if(ProjectileCollision.list[map][x][y] === 10){
            projectileCollision.width = 32;
            projectileCollision.height = 32;
            projectileCollision.x += 16;
            projectileCollision.y += 16;
        }
        if(self.isColliding(projectileCollision)){
            if(param.projectilePattern === 'bounceOffCollisions'){
                var x = self.x;
                self.x = self.lastX;
                if(self.isColliding(projectileCollision)){
                    self.x = x;
                    self.y = self.lastY;
                    if(self.isColliding(projectileCollision)){
                        self.x = self.lastX;
                        self.y = self.lastY;
                        self.spdX = -self.spdX;
                        self.x += self.spdX;
                        self.spdY = -self.spdY;
                        self.y += self.spdY;
                    }
                    else{
                        self.spdY = -self.spdY;
                        self.y += self.spdY;
                    }
                }
                else{
                    self.spdX = -self.spdX;
                    self.x += self.spdX;
                }
            }
            else{
                self.toRemove = true;
                self.updateNextFrame = false;
            }
        }
    }
    self.doProjectileCollision = function(map,x,y){
        var collision = {
            map:map,
            x:x * 64,
            y:y * 64,
        };
        if(Collision.list[map][x][y] === 1){
            collision.width = 64;
            collision.height = 64;
            collision.x += 32;
            collision.y += 32;
        }
        if(Collision.list[map][x][y] === 2){
            collision.width = 64;
            collision.height = 32;
            collision.x += 32;
            collision.y += 48;
        }
        if(Collision.list[map][x][y] === 3){
            collision.width = 64;
            collision.height = 32;
            collision.x += 32;
            collision.y += 16;
        }
        if(Collision.list[map][x][y] === 4){
            collision.width = 32;
            collision.height = 64;
            collision.x += 16;
            collision.y += 32;
        }
        if(Collision.list[map][x][y] === 5){
            collision.width = 32;
            collision.height = 64;
            collision.x += 48;
            collision.y += 32;
        }
        if(Collision.list[map][x][y] === 6){
            collision.width = 32;
            collision.height = 32;
            collision.x += 32;
            collision.y += 32;
        }
        if(Collision.list[map][x][y] === 7){
            collision.width = 32;
            collision.height = 32;
            collision.x += 16;
            collision.y += 48;
        }
        if(Collision.list[map][x][y] === 8){
            collision.width = 32;
            collision.height = 32;
            collision.x += 48;
            collision.y += 48;
        }
        if(Collision.list[map][x][y] === 9){
            collision.width = 32;
            collision.height = 32;
            collision.x += 48;
            collision.y += 16;
        }
        if(Collision.list[map][x][y] === 10){
            collision.width = 32;
            collision.height = 32;
            collision.x += 16;
            collision.y += 16;
        }
        if(Collision.list[map][x][y] === 11){
            var collision2 = {
                map:map,
                x:x * 64 + 48,
                y:y * 64 + 32,
                width:32,
                height:64,
            };
            collision.width = 64;
            collision.height = 32;
            collision.x += 32;
            collision.y += 48;
        }
        if(Collision.list[map][x][y] === 12){
            var collision2 = {
                map:map,
                x:x * 64 + 16,
                y:y * 64 + 32,
                width:32,
                height:64,
            };
            collision.width = 64;
            collision.height = 32;
            collision.x += 32;
            collision.y += 16;
        }
        if(Collision.list[map][x][y] === 13){
            var collision2 = {
                map:map,
                x:x * 64 + 48,
                y:y * 64 + 32,
                width:32,
                height:64,
            };
            collision.width = 64;
            collision.height = 32;
            collision.x += 32;
            collision.y += 16;
        }
        if(Collision.list[map][x][y] === 14){
            var collision2 = {
                map:map,
                x:x * 64 + 16,
                y:y * 64 + 32,
                width:32,
                height:64,
            };
            collision.width = 64;
            collision.height = 32;
            collision.x += 32;
            collision.y += 48;
        }
        if(self.isColliding(collision)){
            if(param.projectilePattern === 'bounceOffCollisions'){
                var x1 = self.x;
                self.x = self.lastX;
                if(self.isColliding(collision)){
                    self.x = x1;
                    self.y = self.lastY;
                    if(self.isColliding(collision)){
                        self.x = self.lastX;
                        self.y = self.lastY;
                        self.spdX = -self.spdX;
                        self.x += self.spdX;
                        self.spdY = -self.spdY;
                        self.y += self.spdY;
                    }
                    else{
                        self.spdY = -self.spdY;
                        self.y += self.spdY;
                    }
                }
                else{
                    self.spdX = -self.spdX;
                    self.x += self.spdX;
                }
            }
            else if(self.projectileType === 'bullet'){
                self.toRemove = true;
            }
            else{
                self.x = self.lastX;
                self.y = self.lastY;
                self.spdX = 0;
                self.spdY = 0;
                self.doUpdate = false;
            }
        }
        if(Collision.list[map][x]){
            if(Collision.list[map][x][y] > 10){
                if(self.isColliding(collision2)){
                    if(param.projectilePattern === 'bounceOffCollisions'){
                        var x1 = self.x;
                        self.x = self.lastX;
                        if(self.isColliding(collision2)){
                            self.x = x1;
                            self.y = self.lastY;
                            if(self.isColliding(collision2)){
                                self.x = self.lastX;
                                self.y = self.lastY;
                                self.spdX = -self.spdX;
                                self.x += self.spdX;
                                self.spdY = -self.spdY;
                                self.y += self.spdY;
                            }
                            else{
                                self.spdY = -self.spdY;
                                self.y += self.spdY;
                            }
                        }
                        else{
                            self.spdX = -self.spdX;
                            self.x += self.spdX;
                        }
                    }
                    else if(self.projectileType === 'bullet'){
                        self.toRemove = true;
                    }
                    else{
                        self.x = self.lastX;
                        self.y = self.lastY;
                        self.spdX = 0;
                        self.spdY = 0;
                        self.doUpdate = false;
                    }
                }
            }
        }
    }
	self.getUpdatePack = function(){
        var pack = {};
        pack.id = self.id;
        if(self.relativeToPlayer !== false && Player.list[self.parent]){
            if(lastSelf.x !== self.x - Player.list[self.parent].x){
                pack.x = self.x - Player.list[self.parent].x;
                lastSelf.x = self.x - Player.list[self.parent].x;
            }
            if(lastSelf.y !== self.y - Player.list[self.parent].y){
                pack.y = self.y - Player.list[self.parent].y;
                lastSelf.y = self.y - Player.list[self.parent].y;
            }
        }
        else{
            if(lastSelf.x !== self.x){
                pack.x = self.x;
                lastSelf.x = self.x;
            }
            if(lastSelf.y !== self.y){
                pack.y = self.y;
                lastSelf.y = self.y;
            }
        }
        if(lastSelf.spdX !== self.spdX){
            pack.spdX = self.spdX;
            lastSelf.spdX = self.spdX;
        }
        if(lastSelf.spdY !== self.spdY){
            pack.spdY = self.spdY;
            lastSelf.spdY = self.spdY;
        }
        if(lastSelf.width !== self.width){
            pack.width = self.width;
            lastSelf.width = self.width;
        }
        if(lastSelf.height !== self.height){
            pack.height = self.height;
            lastSelf.height = self.height;
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
        if(lastSelf.canCollide !== self.canCollide){
            pack.canCollide = self.canCollide;
            lastSelf.canCollide = self.canCollide;
        }
        if(lastSelf.relativeToPlayer !== self.relativeToPlayer){
            pack.relativeToPlayer = self.relativeToPlayer;
            lastSelf.relativeToPlayer = self.relativeToPlayer;
        }
        return pack;
	}
    self.getInitPack = function(){
        var pack = {};
        pack.id = self.id;
        if(self.relativeToPlayer !== false && Player.list[self.parent]){
            pack.x = self.x - Player.list[self.parent].x;
            pack.y = self.y - Player.list[self.parent].y;
        }
        else{
            pack.x = self.x;
            pack.y = self.y;
        }
        pack.spdX = self.spdX;
        pack.spdY = self.spdY;
        pack.width = self.width;
        pack.height = self.height;
        pack.map = self.map;
        pack.type = self.type;
        pack.projectileType = self.projectileType;
        pack.canCollide = self.canCollide;
        pack.relativeToPlayer = self.relativeToPlayer;
        pack.direction = self.direction;
        return pack;
    }
	Projectile.list[self.id] = self;
	return self;
}
Projectile.list = {};

DroppedItem = function(param){
	var self = Entity(param);
	self.id = Math.random();
    self.parent = param.id;
    self.width = 64;
    self.height = 64;
    if(param.item.id.includes('trident') === true){
        self.width = 84;
        self.height = 84;
    }
    self.x += 128 * Math.random() - 64;
    self.y += 128 * Math.random() - 64;
    self.spdX = Math.random() * 20 - 10;
    self.spdY = Math.random() * 20 - 10;
    self.leftPlayer = param.leftPlayer;
    self.allPlayers = param.allPlayers;
    self.timer = 300000;
    self.mapWidth = Maps[self.map].width;
    self.mapHeight = Maps[self.map].height;
    self.direction = 0;
    self.item = param.item;
    self.amount = param.amount;
    self.toRemove = false;
    self.type = 'DroppedItem';
    var lastSelf = {};
	var super_update = self.update;
	self.update = function(){
        super_update();
        self.timer -= 1;
        if(self.timer <= 0){
            self.toRemove = true;
        }
        self.spdX *= 0.9;
        self.spdY *= 0.9;
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
        self.direction += 16;
        if(Player.list[self.parent]){
            if(Player.list[self.parent].map === self.map){
                if(self.getDistance(Player.list[self.parent]) < 192 && self.leftPlayer === true){
                    self.spdX += Math.cos(Math.atan2(Player.list[self.parent].y - self.y,Player.list[self.parent].x - self.x)) * 4;
                    self.spdY += Math.sin(Math.atan2(Player.list[self.parent].y - self.y,Player.list[self.parent].x - self.x)) * 4;
                }
            }
            if(self.getDistance(Player.list[self.parent]) > 192){
                self.leftPlayer = true;
            }
        }
        else{
            self.toRemove = true;
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
        if(lastSelf.item === undefined){
            pack.item = self.item;
            lastSelf.item = self.item;
        }
        if(lastSelf.direction !== self.direction){
            pack.direction = self.direction;
            lastSelf.direction = self.direction;
        }
        if(lastSelf.parent !== self.parent){
            pack.parent = self.parent;
            lastSelf.parent = self.parent;
        }
        if(lastSelf.allPlayers !== self.allPlayers){
            pack.allPlayers = self.allPlayers;
            lastSelf.allPlayers = self.allPlayers;
        }
        if(lastSelf.type !== self.type){
            pack.type = self.type;
            lastSelf.type = self.type;
        }
        return pack;
	}
    self.getInitPack = function(){
        var pack = {};
        pack.id = self.id;
        pack.x = self.x;
        pack.y = self.y;
        pack.map = self.map;
        pack.item = self.item;
        pack.parent = self.parent;
        pack.direction = self.direction;
        pack.allPlayers = self.allPlayers;
        pack.type = self.type;
        return pack;
    }
	DroppedItem.list[self.id] = self;
	return self;
}
DroppedItem.list = {};

var renderLayer = function(layer,data,loadedMap){
    playerMap[loadedMap] = 0;
    var size = data.tilewidth;
    size = 64;
    Maps[loadedMap] = {width:layer.width * size,height:layer.height * size};
    if(layer.type !== "tilelayer" || layer.visible === true){
        return;
    }
    for(var i = 0;i < layer.data.length;i++){
        var tile_idx = layer.data[i];
        if(tile_idx){
            var x = (i % layer.width) * size;
            var y = ~~(i / layer.width) * size;
            var map = loadedMap;
            tile = data.tilesets[0];
            tile_idx -= 1;
            if(Collision.list[loadedMap]){
                if(Collision.list[loadedMap][x / size]){
                    if(Collision.list[loadedMap][x / size][y / size] === undefined){
                        Collision.list[loadedMap][x / size][y / size] = 0;
                    }
                }
                else{
                    Collision.list[loadedMap][x / size] = [];
                    Collision.list[loadedMap][x / size][y / size] = 0;
                }
            }
            else{
                Collision.list[loadedMap] = [];
                Collision.list[loadedMap][x / size] = [];
                Collision.list[loadedMap][x / size][y / size] = 0;
            }
            if(SlowDown.list[loadedMap]){
                if(SlowDown.list[loadedMap][x / size]){
                    if(SlowDown.list[loadedMap][x / size][y / size] === undefined){
                        SlowDown.list[loadedMap][x / size][y / size] = 0;
                    }
                }
                else{
                    SlowDown.list[loadedMap][x / size] = [];
                    SlowDown.list[loadedMap][x / size][y / size] = 0;
                }
            }
            else{
                SlowDown.list[loadedMap] = [];
                SlowDown.list[loadedMap][x / size] = [];
                SlowDown.list[loadedMap][x / size][y / size] = 0;
            }
            if(ProjectileCollision.list[loadedMap]){
                if(ProjectileCollision.list[loadedMap][x / size]){
                    if(ProjectileCollision.list[loadedMap][x / size][y / size] === undefined){
                        ProjectileCollision.list[loadedMap][x / size][y / size] = 0;
                    }
                }
                else{
                    ProjectileCollision.list[loadedMap][x / size] = [];
                    ProjectileCollision.list[loadedMap][x / size][y / size] = 0;
                }
            }
            else{
                ProjectileCollision.list[loadedMap] = [];
                ProjectileCollision.list[loadedMap][x / size] = [];
                ProjectileCollision.list[loadedMap][x / size][y / size] = 0;
            }
            if(tile_idx === 2121){
                var collision = new Collision({
                    x:x,
                    y:y,
                    map:map,
                    type:1,
                });
            }
            if(tile_idx === 2122){
                var collision = new Collision({
                    x:x,
                    y:y,
                    map:map,
                    type:2,
                });
            }
            if(tile_idx === 2123){
                var collision = new Collision({
                    x:x,
                    y:y,
                    map:map,
                    type:3,
                });
            }
            if(tile_idx === 2124){
                var collision = new Collision({
                    x:x,
                    y:y,
                    map:map,
                    type:4,
                });
            }
            if(tile_idx === 2125){
                var collision = new Collision({
                    x:x,
                    y:y,
                    map:map,
                    type:5,
                });
            }
            if(tile_idx === 2126){
                var collision = new Collision({
                    x:x,
                    y:y,
                    map:map,
                    type:11,
                });
            }
            if(tile_idx === 2127){
                var collision = new Collision({
                    x:x,
                    y:y,
                    map:map,
                    type:12,
                });
            }
            if(tile_idx === 2128){
                var collision = new Collision({
                    x:x,
                    y:y,
                    map:map,
                    type:13,
                });
            }
            if(tile_idx === 2129){
                var collision = new Collision({
                    x:x,
                    y:y,
                    map:map,
                    type:14,
                });
            }
            if(tile_idx === 2207){
                var collision = new Collision({
                    x:x,
                    y:y,
                    map:map,
                    type:6,
                });
            }
            if(tile_idx === 2208){
                var collision = new Collision({
                    x:x,
                    y:y,
                    map:map,
                    type:7,
                });
            }
            if(tile_idx === 2209){
                var collision = new Collision({
                    x:x,
                    y:y,
                    map:map,
                    type:8,
                });
            }
            if(tile_idx === 2210){
                var collision = new Collision({
                    x:x,
                    y:y,
                    map:map,
                    type:9,
                });
            }
            if(tile_idx === 2211){
                var collision = new Collision({
                    x:x,
                    y:y,
                    map:map,
                    type:10,
                });
            }
            if(tile_idx === 2293){
                var projectileCollision = new ProjectileCollision({
                    x:x,
                    y:y,
                    map:map,
                    type:1,
                });
            }
            if(tile_idx === 1949){
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
                            name = layer.name.substr(idj + 1,layer.name.length - idj - 2);
                        }
                    }
                }
                if(type === 'Npc'){
                    var info = npcData[id];
                    var npc = new Npc({
                        x:x + size / 2,
                        y:y + size / 2,
                        name:name,
                        entityId:id,
                        map:map,
                        moveSpeed:5,
                        info:info,
                    });
                    if(npcData[id]){
                        if(npcData[id].shop !== false){
                            npc.shop = npcData[id].shop;
                        }
                        if(npcData[id].shopPrices !== false){
                            npc.shopPrices = npcData[id].shopPrices;
                        }
                        if(npcData[id].mainItem !== false){
                            npc.mainItem = npcData[id].mainItem;
                        }
                        if(npcData[id].dialogues !== false){
                            npc.dialogues = npcData[id].dialogues;
                        }
                        if(npcData[id].quote !== false){
                            npc.quote = npcData[id].quote;
                        }
                    }
                }
                if(type === 'StaticNpc'){
                    var info = npcData[id];
                    var npc = new StaticNpc({
                        x:x + size / 2,
                        y:y + size / 2,
                        name:name,
                        entityId:id,
                        map:map,
                        moveSpeed:0,
                        info:info,
                    });
                    if(npcData[id]){
                        if(npcData[id].shop !== false){
                            npc.shop = npcData[id].shop;
                        }
                        if(npcData[id].crafts !== false){
                            npc.crafts = npcData[id].crafts;
                        }
                        if(npcData[id].mainCraft !== false){
                            npc.mainCraft = npcData[id].mainCraft;
                        }
                        if(npcData[id].quote !== false){
                            npc.quote = npcData[id].quote;
                        }
                    }
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
                    x:x,
                    y:y,
                    map:map,
                    type:1,
                });
            }
            if(tile_idx === 1864){
                var slowDown = new SlowDown({
                    x:x,
                    y:y,
                    map:map,
                    type:2,
                });
            }
            if(tile_idx === 1865){
                var slowDown = new SlowDown({
                    x:x,
                    y:y,
                    map:map,
                    type:3,
                });
            }
            if(tile_idx === 1866){
                var slowDown = new SlowDown({
                    x:x,
                    y:y,
                    map:map,
                    type:4,
                });
            }
            if(tile_idx === 1867){
                var slowDown = new SlowDown({
                    x:x,
                    y:y,
                    map:map,
                    type:5,
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
        renderLayers(require("./client/maps/" + name + ".json"),name);
    }
    else{
        renderLayers(require("/app/client/maps/" + name + ".json"),name);
    }
}
load("Town Hall");
load("Fishing Hut");
load("House");
load("Tiny House");
load("Tiny House Upstairs");
load("Lilypad Temple Room 0");
load("Lilypad Temple Room 1");
load("Lilypad Temple Room 2");
load("Lilypad Castle");
load("Lilypad Castle Basement");
load("Lilypad Castle Upstairs");
load("The Arena");
load("The Guarded Citadel");
load("Town Cave");
load("The Pet Arena");
load("Mysterious Room");
load("The Tutorial");
load("The Battlefield");
load("Garage");
load("Secret Tunnel Part 1");
load("The Hideout");
load("The Dripping Caverns");
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
                if(Projectile.list[j].doUpdate){
                    if(Projectile.list[j].map === Player.list[i].map){
                        if(Player.list[i].isDead === false){
                            if(Math.abs(Player.list[i].x - Projectile.list[j].x) < Projectile.list[j].width * 2){
                                if(Math.abs(Player.list[i].y - Projectile.list[j].y) < Projectile.list[j].height * 2){
                                    if(Player.list[i].isColliding(Projectile.list[j]) && "" + Projectile.list[j].parent !== i){
                                        if(ENV.PVP){
                                            Player.list[i].onPush(Projectile.list[j],1);
                                            Projectile.list[j].onCollision(Projectile.list[j],Player.list[i]);
                                        }
                                        else if(Projectile.list[j].parentType !== 'Player'){
                                            Player.list[i].onPush(Projectile.list[j],1);
                                            Projectile.list[j].onCollision(Projectile.list[j],Player.list[i]);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        for(var j in Player.list){
            if(Player.list[i] && Player.list[j]){
                if(Player.list[i].isColliding(Player.list[j]) && Player.list[j].invincible === false && Player.list[i].invincible === false && i !== j){
                    if(ENV.PVP){
                        Player.list[j].onPush(Player.list[i],0.05);
                        Player.list[i].onPush(Player.list[j],0.05);
                    }
                }
            }
        }
    }
    for(var i in Pet.list){
        for(var j in Player.list){
            if(Pet.list[i] && Player.list[j]){
                if(Pet.list[i].isColliding(Player.list[j]) && "" + Player.list[j].parent !== i && Pet.list[i].isDead === false && Player.list[j].map === Pet.list[i].map){
                    Pet.list[i].onPush(Player.list[j],0);
                    //Player.list[j].onPush(Pet.list[i],0);
                }
            }
        }
    }
    for(var i in Monster.list){
        for(var j in Projectile.list){
            if(Monster.list[i] && Projectile.list[j]){
                if(Projectile.list[j].parentType !== 'Monster'){
                    if(Projectile.list[j].doUpdate){
                        if(Projectile.list[j].map === Monster.list[i].map){
                            if(Math.abs(Monster.list[i].x - Projectile.list[j].x) < Projectile.list[j].width * 2){
                                if(Math.abs(Monster.list[i].y - Projectile.list[j].y) < Projectile.list[j].height * 2){
                                    if(Monster.list[i].isColliding(Projectile.list[j]) && "" + Projectile.list[j].parent !== i){
                                        Monster.list[i].onPush(Projectile.list[j],1);
                                        Projectile.list[j].onCollision(Projectile.list[j],Monster.list[i]);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        for(var j in Player.list){
            if(Monster.list[i] && Player.list[j]){
                if(Monster.list[i].isColliding(Player.list[j]) && Player.list[j].invincible === false && Monster.list[i].invincible === false){
                    Player.list[j].onPush(Monster.list[i],1);
                    Monster.list[i].onPush(Player.list[j],1);
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
    for(var i in DroppedItem.list){
        if(DroppedItem.list[i].allPlayers === false){
            if(Player.list[DroppedItem.list[i].parent]){
                if(DroppedItem.list[i].leftPlayer === true && Player.list[DroppedItem.list[i].parent].isColliding(DroppedItem.list[i])){
                    Player.list[DroppedItem.list[i].parent].inventory.addItem(DroppedItem.list[i].item.id,DroppedItem.list[i].amount,DroppedItem.list[i].item.enchantments);
                    DroppedItem.list[i].toRemove = true;
                    for(var j = 0;j < 25;j++){
                        var particle = new Particle({
                            x:DroppedItem.list[i].x + Math.random() * DroppedItem.list[i].width - DroppedItem.list[i].width / 2,
                            y:DroppedItem.list[i].y + Math.random() * DroppedItem.list[i].height - DroppedItem.list[i].height / 2,
                            map:DroppedItem.list[i].map,
                            particleType:'kill',
                        });
                    }
                }
            }
        }
        else{
            for(var j in Player.list){
                if(j === '' + DroppedItem.list[i].parent && DroppedItem.list[i].leftPlayer === true && Player.list[j].isColliding(DroppedItem.list[i])){
                    Player.list[j].inventory.addItem(DroppedItem.list[i].item.id,DroppedItem.list[i].amount,DroppedItem.list[i].item.enchantments);
                    DroppedItem.list[i].toRemove = true;
                    for(var k = 0;k < 25;k++){
                        var particle = new Particle({
                            x:DroppedItem.list[i].x + Math.random() * DroppedItem.list[i].width - DroppedItem.list[i].width / 2,
                            y:DroppedItem.list[i].y + Math.random() * DroppedItem.list[i].height - DroppedItem.list[i].height / 2,
                            map:DroppedItem.list[i].map,
                            particleType:'kill',
                        });
                    }
                }
                else if(j !== '' + DroppedItem.list[i].parent && Player.list[j].isColliding(DroppedItem.list[i])){
                    Player.list[j].inventory.addItem(DroppedItem.list[i].item.id,DroppedItem.list[i].amount,DroppedItem.list[i].item.enchantments);
                    DroppedItem.list[i].toRemove = true;
                    for(var k = 0;k < 25;k++){
                        var particle = new Particle({
                            x:DroppedItem.list[i].x + Math.random() * DroppedItem.list[i].width - DroppedItem.list[i].width / 2,
                            y:DroppedItem.list[i].y + Math.random() * DroppedItem.list[i].height - DroppedItem.list[i].height / 2,
                            map:DroppedItem.list[i].map,
                            particleType:'kill',
                        });
                    }
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


getRandomNpcItem = function(){
	var items = 0;
	for(var i in Item.list){
		if(Item.list[i].rarity > 2){
			items += (10 - Item.list[i].rarity);
		}
	}
	var currentItem = Math.floor(items * Math.random());
	items = 0;
	var item = undefined;
	for(var i in Item.list){
		if(Item.list[i].rarity > 1){
			items += (10 - Item.list[i].rarity);
		}
		if(currentItem <= items && item === undefined && Item.list[i].rarity > 2){
			var item = Item.list[i].id;
		}
	}
	var enchantments = [];
	for(var i in Item.list[item].enchantments){
		for(var j in Enchantment.list){
			if(j === Item.list[item].enchantments[i]){
				var enchantment = Enchantment.list[j];
				if(Math.random() < enchantment.dropChance * 5){
					enchantments.push({id:j,level:Math.min(Math.max(0.001,Math.round(enchantment.averageLevel * 10000 + (Math.random() * 2 - 1) * enchantment.deviation * 10000) / 1000),enchantment.maxLevel)});
				}
			}
		}
	}
	return {
		id:item,
		enchantments:enchantments,
        stack:1,
	};
}

setInterval(function(){
    var npc = Npc.list['wanderingtrader'];
    npc.shop = [
        {
            id:'lesserrandomboostpotion',
            enchantments:[],
            stack:1
        },
        {
            id:'skullofdeath',
            enchantments:[],
            stack:1
        }
    ];
    npc.shop[2] = getRandomNpcItem();
    npc.shop[3] = getRandomNpcItem();
    npc.shop[4] = getRandomNpcItem();
    npc.shop[5] = getRandomNpcItem();
    npc.shop[6] = getRandomNpcItem();
    npc.shopPrices[2] = Math.pow(Item.list[npc.shop[2].id].rarity,2) * 50000;
    npc.shopPrices[3] = Math.pow(Item.list[npc.shop[3].id].rarity,2) * 50000;
    npc.shopPrices[4] = Math.pow(Item.list[npc.shop[4].id].rarity,2) * 50000;
    npc.shopPrices[5] = Math.pow(Item.list[npc.shop[5].id].rarity,2) * 50000;
    npc.shopPrices[6] = Math.pow(Item.list[npc.shop[6].id].rarity,2) * 50000;
},300000);

setTimeout(function(){
    var npc = Npc.list['wanderingtrader'];
    npc.shop = [
        {
            id:'lesserrandomboostpotion',
            enchantments:[],
            stack:1
        },
        {
            id:'skullofdeath',
            enchantments:[],
            stack:1
        }
    ];
    npc.shop[2] = getRandomNpcItem();
    npc.shop[3] = getRandomNpcItem();
    npc.shop[4] = getRandomNpcItem();
    npc.shop[5] = getRandomNpcItem();
    npc.shop[6] = getRandomNpcItem();
    npc.shopPrices[2] = Math.pow(Item.list[npc.shop[2].id].rarity,2) * 50000;
    npc.shopPrices[3] = Math.pow(Item.list[npc.shop[3].id].rarity,2) * 50000;
    npc.shopPrices[4] = Math.pow(Item.list[npc.shop[4].id].rarity,2) * 50000;
    npc.shopPrices[5] = Math.pow(Item.list[npc.shop[5].id].rarity,2) * 50000;
    npc.shopPrices[6] = Math.pow(Item.list[npc.shop[6].id].rarity,2) * 50000;
},2000);