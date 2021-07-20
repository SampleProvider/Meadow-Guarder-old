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
                if(Monster.list[i].monsterType === 'lightningLizard'){
                    if(!pack[Monster.list[i].map]){
                        pack[Monster.list[i].map] = {player:[],projectile:[],monster:[],npc:[],pet:[],particle:[],sound:[]};
                    }
                    var updatePack = Monster.list[i].getUpdatePack();
                    pack[Monster.list[i].map].monster.push(updatePack);
                }
                delete Monster.list[i];
            }
            else{
                if(!pack[Monster.list[i].map]){
                    pack[Monster.list[i].map] = {player:[],projectile:[],monster:[],npc:[],pet:[],particle:[],sound:[]};
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
                pack[Player.list[i].map] = {player:[],projectile:[],monster:[],npc:[],pet:[],particle:[],sound:[]};
            }
            var updatePack = Player.list[i].getUpdatePack();
            pack[Player.list[i].map].player.push(updatePack);
        }
    }
    for(var i in Projectile.list){
        Projectile.list[i].update();
    }
    for(var i in Npc.list){
        if(playerMap[Npc.list[i].map] > 0 && Npc.list[i].type !== 'StaticNpc'){
            Npc.list[i].update();
            if(playerMap[Npc.list[i].map] > 0){
                if(!pack[Npc.list[i].map]){
                    pack[Npc.list[i].map] = {player:[],projectile:[],monster:[],npc:[],pet:[],particle:[],sound:[]};
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
                    pack[Particle.list[i].map] = {player:[],projectile:[],monster:[],npc:[],pet:[],particle:[],sound:[]};
                }
                var updatePack = Particle.list[i].getInitPack();
                pack[Particle.list[i].map].particle.push(updatePack);
                delete Particle.list[i];
            }
        }
    }
    for(var i in Pet.list){
        Pet.list[i].update();
        if(!pack[Pet.list[i].map]){
            pack[Pet.list[i].map] = {player:[],projectile:[],monster:[],npc:[],pet:[],particle:[],sound:[]};
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
            pack[Projectile.list[i].map] = {player:[],projectile:[],monster:[],npc:[],pet:[],particle:[],sound:[]};
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
                            Player.list[i].xp += 500000 * Player.list[i].stats.xp;
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
                            Player.list[i].xp += 500000 * Player.list[i].stats.xp;
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
    self.entityId = undefined;
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
                self.dazed = self.maxSpeed;
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
                            if(WayPoint.list[i].info.id === self.entityId && WayPoint.list[i].map === self.map && WayPoint.list[i].x > self.x - 14 * 64 && WayPoint.list[i].x < self.x + 14 * 64 && WayPoint.list[i].y > self.y - 14 * 64 && WayPoint.list[i].y < self.y + 14 * 64){
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
                self.moveSpeed = pushPower * 5 * self.pushResist;
                self.spdX = self.pushPt.spdX / 4;
                self.spdY = self.pushPt.spdY / 4;
                if(self.x > self.pushPt.x){
                    self.spdX += 1;
                }
                else if(self.x < self.pushPt.x){
                    self.spdX += -1;
                }
                else{
                    self.spdX += 0;
                }
                if(self.y > self.pushPt.y){
                    self.spdY += 1;
                }
                else if(self.y < self.pushPt.y){
                    self.spdY += -1;
                }
                else{
                    self.spdY += 0;
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
        if(self.dazed < 1){
            self.pushPt = pt;
            self.onCollision(pt,pushPower);
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
                if(self.debuffs[i].id === 'thundered'){
                    var damage = 250;
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
        if(self.hp < 1){
            self.willBeDead = true;
            self.toRemove = true;
        }
        if(self.hp < 1 && self.debuffInflicted){
            if(Player.list[self.debuffInflicted]){
                var pt = Player.list[self.debuffInflicted];
            }
            else if(Projectile.list[self.debuffInflicted]){
                var pt = Projectile.list[self.debuffInflicted];
            }
            if(pt){
                if(self.willBeDead === false && self.isDead === false && self.toRemove === false && pt.toRemove === false && pt.isDead === false){
                    if(pt.parentType === 'Player' && self.type === 'Monster'){
                        if(Player.list[pt.parent].isDead === false){
                            if(self.itemDrops === {}){
                                
                            }
                            else{
                                for(var i in self.itemDrops){
                                    if(i === 'enchantmentbook' && pt.stats.luck > 0){
                                        for(var j = 0;j < self.itemDrops[i];j++){
                                            pt.inventory.addRandomItemAndRandomizedEnchantments(i,3);
                                        }
                                        addToChat('style="color: ' + pt.textColor + '">',pt.displayName + " got a Enchantment Book x" + Math.round(self.itemDrops[i]) + ".");
                                    }
                                    else{
                                        var materialAdded = false;
                                        for(var j in pt.inventory.materials){
                                            if(i === j){
                                                materialAdded = true;
                                                var materialAmount = Math.round(self.itemDrops[i] * (Math.random() + 0.5))
                                                pt.inventory.materials[i] += materialAmount;
                                                pt.inventory.refreshMaterial();
                                                addToChat('style="color: ' + pt.textColor + '">',pt.displayName + " got a " + pt.inventory.getMaterialName(i) + " x" + materialAmount + ".");
                                            }
                                        }
                                        if(materialAdded === false){
                                            if(self.itemDrops[i] * pt.stats.luck > Math.random()){
                                                var itemIndex = pt.inventory.addRandomItemAndRandomizedEnchantments(i,pt.stats.luck);
                                                var item = pt.inventory.items[itemIndex];
                                                addToChat('style="color: ' + pt.textColor + '">',pt.displayName + " got a " + Item.list[item.id].name + ".");
                                            }
                                        }
                                    }
                                }
                            }
                            Player.list[pt.parent].xp += self.xpGain * Math.round((5 + Math.random() * 2) * Player.list[pt.parent].stats.xp);
                            Player.list[pt.parent].coins += self.xpGain * Math.round((300 + Math.random() * 150) * Player.list[pt.parent].stats.xp);
                        }
                    }
                    if(pt.type === 'Player' && self.type === 'Monster'){
                        if(self.itemDrops === {}){
                                
                        }
                        else{
                            for(var i in self.itemDrops){
                                if(i === 'enchantmentbook' && pt.stats.luck > 0){
                                    for(var j = 0;j < self.itemDrops[i];j++){
                                        pt.inventory.addRandomItemAndRandomizedEnchantments(i,3);
                                    }
                                    addToChat('style="color: ' + pt.textColor + '">',pt.displayName + " got a Enchantment Book x" + Math.round(self.itemDrops[i]) + ".");
                                }
                                else{
                                    var materialAdded = false;
                                    for(var j in pt.inventory.materials){
                                        if(i === j){
                                            materialAdded = true;
                                            var materialAmount = Math.round(self.itemDrops[i] * (Math.random() + 0.5))
                                            pt.inventory.materials[i] += materialAmount;
                                            pt.inventory.refreshMaterial();
                                            addToChat('style="color: ' + pt.textColor + '">',pt.displayName + " got a " + pt.inventory.getMaterialName(i) + " x" + materialAmount + ".");
                                        }
                                    }
                                    if(materialAdded === false){
                                        if(self.itemDrops[i] * pt.stats.luck > Math.random()){
                                            var itemIndex = pt.inventory.addRandomItemAndRandomizedEnchantments(i,pt.stats.luck);
                                            var item = pt.inventory.items[itemIndex];
                                            addToChat('style="color: ' + pt.textColor + '">',pt.displayName + " got a " + Item.list[item.id].name + ".");
                                        }
                                    }
                                }
                            }
                        }
                        pt.xp += Math.round(self.xpGain * (5 + Math.random() * 2) * pt.stats.xp);
                        pt.coins += Math.round(self.xpGain * (300 + Math.random() * 150) * pt.stats.xp);
                    }
                }
            }
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
            //damage = Math.min(self.hp,damage);
            self.hp -= damage;
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
        if(self.hp < 1 && self.willBeDead === false && self.isDead === false && self.toRemove === false && pt.toRemove === false && pt.isDead === false){
            if(pt.parentType === 'Player' && self.type === 'Monster'){
                if(Player.list[pt.parent].isDead === false){
                    if(self.itemDrops === {}){
                        
                    }
                    else{
                        for(var i in self.itemDrops){
                            if(i === 'enchantmentbook' && Player.list[pt.parent].stats.luck > 0){
                                for(var j = 0;j < self.itemDrops[i];j++){
                                    Player.list[pt.parent].inventory.addRandomItemAndRandomizedEnchantments(i,3);
                                }
                                addToChat('style="color: ' + Player.list[pt.parent].textColor + '">',Player.list[pt.parent].displayName + " got a Enchantment Book x" + Math.round(self.itemDrops[i]) + ".");
                            }
                            else{
                                var materialAdded = false;
                                for(var j in Player.list[pt.parent].inventory.materials){
                                    if(i === j){
                                        materialAdded = true;
                                        var materialAmount = Math.round(self.itemDrops[i] * (Math.random() + 0.5))
                                        Player.list[pt.parent].inventory.materials[i] += materialAmount;
                                        Player.list[pt.parent].inventory.refreshMaterial();
                                        addToChat('style="color: ' + Player.list[pt.parent].textColor + '">',Player.list[pt.parent].displayName + " got a " + Player.list[pt.parent].inventory.getMaterialName(i) + " x" + materialAmount + ".");
                                    }
                                }
                                if(materialAdded === false){
                                    if(self.itemDrops[i] * Player.list[pt.parent].stats.luck > Math.random()){
                                        var itemIndex = Player.list[pt.parent].inventory.addRandomItemAndRandomizedEnchantments(i,Player.list[pt.parent].stats.luck);
                                        var item = Player.list[pt.parent].inventory.items[itemIndex];
                                        addToChat('style="color: ' + Player.list[pt.parent].textColor + '">',Player.list[pt.parent].displayName + " got a " + Item.list[item.id].name + ".");
                                    }
                                }
                            }
                        }
                    }
                    Player.list[pt.parent].xp += self.xpGain * Math.round((5 + Math.random() * 2) * Player.list[pt.parent].stats.xp);
                    Player.list[pt.parent].coins += self.xpGain * Math.round((300 + Math.random() * 150) * Player.list[pt.parent].stats.xp);
                }
            }
            if(pt.type === 'Player' && self.type === 'Monster'){
                if(self.itemDrops === {}){
                        
                }
                else{
                    for(var i in self.itemDrops){
                        if(i === 'enchantmentbook' && pt.stats.luck > 0){
                            for(var j = 0;j < self.itemDrops[i];j++){
                                pt.inventory.addRandomItemAndRandomizedEnchantments(i,3);
                            }
                            addToChat('style="color: ' + pt.textColor + '">',pt.displayName + " got a Enchantment Book x" + Math.round(self.itemDrops[i]) + ".");
                        }
                        else{
                            var materialAdded = false;
                            for(var j in pt.inventory.materials){
                                if(i === j){
                                    materialAdded = true;
                                    var materialAmount = Math.round(self.itemDrops[i] * (Math.random() + 0.5))
                                    pt.inventory.materials[i] += materialAmount;
                                    pt.inventory.refreshMaterial();
                                    addToChat('style="color: ' + pt.textColor + '">',pt.displayName + " got a " + pt.inventory.getMaterialName(i) + " x" + materialAmount + ".");
                                }
                            }
                            if(materialAdded === false){
                                if(self.itemDrops[i] * pt.stats.luck > Math.random()){
                                    var itemIndex = pt.inventory.addRandomItemAndRandomizedEnchantments(i,pt.stats.luck);
                                    var item = pt.inventory.items[itemIndex];
                                    addToChat('style="color: ' + pt.textColor + '">',pt.displayName + " got a " + Item.list[item.id].name + ".");
                                }
                            }
                        }
                    }
                }
                pt.xp += Math.round(self.xpGain * (5 + Math.random() * 2) * pt.stats.xp);
                pt.coins += Math.round(self.xpGain * (300 + Math.random() * 150) * pt.stats.xp);
            }
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
    self.questInfo = {
        quest:false,
    };
    self.questDependent = {};
    self.questStats = {
        "Tutorial":false,
        "Missing Person":false,
        "Monster Raid":false,
        "Secret Tunnels":false,
        "Clear River":false,
        "Clear Tower":false,
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
    self.thirdKeyMap = {
        up:'W',
        down:'S',
        left:'A',
        right:'D',
        attack:'attack',
        second:'second',
        heal:' ',
    };
    self.attackCost = 10;
    self.secondCost = 40;
    self.healCost = 100;
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
        secondPattern:[0],
        healPattern:[0,20,40,60],
    }
    self.currentResponse = 0;
    self.inventory = new Inventory(socket,true);
    self.selectedItem = false;
    if(param.param.inventory !== undefined){
        for(var i in param.param.inventory){
            self.inventory.addItem(param.param.inventory[i].id,param.param.inventory[i].enchantments);
        }
    }
    if(param.param.currentEquip !== undefined){
        for(var i in param.param.currentEquip){
            if(self.inventory.currentEquip[i] === undefined){
                self.inventory.addItem(param.param.currentEquip[i].id,param.param.currentEquip[i].enchantments);
            }
            else if(Item.list[param.param.currentEquip[i].id]){
                self.inventory.currentEquip[i] = param.param.currentEquip[i];
            }
        }
    }
    if(param.param.materials !== undefined){
        for(var i in param.param.materials){
            if(self.inventory.materials[i] === undefined){
                
            }
            else{
                self.inventory.materials[i] = param.param.materials[i];
            }
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
        self.teleport(352,1600,'The Tutorial');
    }
    self.hpMax = hpLevels[self.level];
    self.oldHpMax = self.hpMax;
    self.maxSpeed = 25;
    self.oldMaxSpeed = self.maxSpeed;
    self.oldManaRegen = self.manaRegen;
    self.oldManaMax = self.manaMax;
    self.inventory.refreshRender();
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
    self.currentItem = '';
    self.damageDone = 0;
    self.damageArray = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,];
    var lastSelf = {};
    self.update = function(){
        self.tick += 1;
        self.startX = self.x;
        self.startY = self.y;
        self.mapChange += 1;
        self.moveSpeed = self.maxSpeed;
        for(var i = 0;i < self.moveSpeed;i++){
            self.updateSpd();
            self.updateMove();
            //if(self.canMove && self.dazed < 1){
                self.updatePosition();
            //}
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
                    socket.emit('notification','You failed the quest ' + self.quest + '.');
                }
                self.quest = false;
                self.questInfo = {
                    quest:false,
                };
                for(var i in self.questDependent){
                    if(self.questDependent[i].type === 'Collision'){
                        self.questDependent[i].toRemove = true;
                        Collision.list[self.questDependent[i].map][Math.round(self.questDependent[i].x / 64)][Math.round(self.questDependent[i].y / 64)] = 0;
                    }
                }
                for(var i in self.questDependent){
                    self.questDependent[i].toRemove = true;
                }
                var newTiles = [];
                for(var i in tiles){
                    if(tiles[i].parent !== self.id){
                        newTiles.push(tiles[i]);
                    }
                    else{
                        for(var j in SOCKET_LIST){
                            SOCKET_LIST[j].emit('removeTile',{
                                x:tiles[i].x,
                                y:tiles[i].y,
                                map:tiles[i].map,
                                tile_idx:tiles[i].tile_idx,
                                canvas:tiles[i].canvas,
                            });
                        }
                    }
                }
                tiles = newTiles;
                socket.emit('dialogueLine',{
                    state:'remove',
                });
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
    self.checkQuestRequirements = function(quest){
        for(var i in questData){
            if(i === quest){
                for(var j in questData[i].requirements){
                    if(self.questStats[questData[i].requirements[j]] === false){
                        return false;
                    }
                }
            }
        }
        return true;
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
    self.updateQuest = function(){
        for(var i in Npc.list){
            if(Npc.list[i].map === self.map && Npc.list[i].entityId === 'bob' && self.mapChange > 20 && Npc.list[i].x - 32 < self.mouseX && Npc.list[i].x + 32 > self.mouseX && Npc.list[i].y - 64 < self.mouseY && Npc.list[i].y + 32 > self.mouseY && self.keyPress.second === true){
                if(self.quest === false && self.questInfo.quest === false && self.checkQuestRequirements("Wood Delivery") === true){
                    self.questStage = 1;
                    self.invincible = true;
                    self.questInfo.quest = 'Wood Delivery';
                    socket.emit('dialogueLine',{
                        state:'ask',
                        message:'I have another quest for you.',
                        response1:'What is this quest?',
                        response2:'I don\'t have time right now.',
                        response3:'Do you have any wood on sale right now?',
                    });
                    self.currentResponse = 0;
                }
                else if(self.quest === false && self.questInfo.quest === false && self.questStats["Missing Person"] === false){
                    self.questStage = 1;
                    self.invincible = true;
                    self.questInfo.quest = 'Missing Person';
                    socket.emit('dialogueLine',{
                        state:'ask',
                        message:'Can you help we with something?',
                        response1:'Sure!',
                        response2:'No way. That isn\'t my problem.',
                    });
                    self.currentResponse = 0;
                }
                else if(self.quest === false && self.questInfo.quest === false && self.questStats["Missing Person"] === true){
                    self.questStage = 1;
                    self.invincible = true;
                    self.questInfo.quest = 'Missing Person';
                    socket.emit('dialogueLine',{
                        state:'ask',
                        message:'Hey, my friend Mark went to map The River to collect some wood. He hasn\'t come back in two hours! Can you rescue Mark for me?',
                        response1:'Sure, I can rescue Mark.',
                        response2:'No way. That isn\'t my problem.',
                        response3:'I\'ve done this before, can I buy some wood?',
                    });
                    self.currentResponse = 0;
                }
                else if(self.questStage === 4 && self.quest === 'Missing Person'){
                    self.questStage += 1;
                    self.invincible = true;
                    socket.emit('dialogueLine',{
                        state:'ask',
                        message:'The map The River is to the west of The Village, which is where you are now.',
                        response1:'*End conversation*',
                    });
                    self.currentResponse = 0;
                }
                else if(self.questStage === 4 && self.quest === 'Wood Delivery'){
                    self.questStage += 1;
                    self.invincible = true;
                    socket.emit('dialogueLine',{
                        state:'ask',
                        message:'Can you deliver some wood to Wally in Deserted Town? To get to Deserted Town just keep heading west. You should find Wally in his forge.',
                        response1:'*End conversation*',
                    });
                    self.currentResponse = 0;
                }
                else if(self.questStage === 11 && self.quest === 'Missing Person'){
                    self.questStage += 1;
                    self.invincible = true;
                    socket.emit('dialogueLine',{
                        state:'ask',
                        message:'Oh, Mark is fine? That\'s great!',
                        response1:'*End conversation*',
                    });
                    self.currentResponse = 0;
                }
                else if(self.questStage === 8 && self.quest === 'Wood Delivery'){
                    self.questStage += 1;
                    self.invincible = true;
                    socket.emit('dialogueLine',{
                        state:'ask',
                        message:'Wally said thanks? Well that\'s nice!',
                        response1:'*End conversation*',
                    });
                    self.currentResponse = 0;
                }
                else{
                    socket.emit('notification','[!] This NPC doesn\'t want to talk to you right now.');
                }
                self.keyPress.second = false;
            }
            if(Npc.list[i].map === self.map && Npc.list[i].entityId === 'john' && self.mapChange > 20 && Npc.list[i].x - 32 < self.mouseX && Npc.list[i].x + 32 > self.mouseX && Npc.list[i].y - 64 < self.mouseY && Npc.list[i].y + 32 > self.mouseY && self.keyPress.second === true){
                if(self.quest === false && self.questInfo.quest === false && self.checkQuestRequirements("Monster Raid") === false){
                    self.questStage = 1;
                    self.invincible = true;
                    self.questInfo.quest = 'Monster Raid';
                    socket.emit('dialogueLine',{
                        state:'ask',
                        message:'I have a very important task for you. Will you do this task?',
                        response1:'Sure!',
                        response2:'No.',
                    });
                    self.currentResponse = 0;
                }
                else if(self.quest === false && self.questInfo.quest === false && self.checkQuestRequirements("Monster Raid") === true){
                    self.questStage = 1;
                    self.invincible = true;
                    self.questInfo.quest = 'Monster Raid';
                    socket.emit('dialogueLine',{
                        state:'ask',
                        message:'I have a very important task for you. Will you do this task?',
                        response1:'Sure!',
                        response2:'No.',
                    });
                    self.currentResponse = 0;
                }
                else if(self.questStage === 4 && self.quest === 'Monster Raid'){
                    self.questStage += 1;
                    self.invincible = true;
                    socket.emit('dialogueLine',{
                        state:'ask',
                        message:'Monsters have been raiding The Village for days, and our defenses are crumbling fast. Kill these monsters before they get out of control.',
                        response1:'*End conversation*',
                    });
                    self.currentResponse = 0;
                }
                else if(self.questStage === 13 && self.quest === 'Monster Raid'){
                    self.questStage += 1;
                    self.invincible = true;
                    socket.emit('dialogueLine',{
                        state:'ask',
                        message:'What did you find?',
                        response1:'I found diamonds!',
                        response2:'There were Monsters protecting the tower.',
                        response3:'Nothing.',
                    });
                    self.currentResponse = 0;
                }
                else if(self.questStage === 9 && self.quest === 'Secret Tunnels'){
                    self.questStage += 1;
                    self.invincible = true;
                    socket.emit('dialogueLine',{
                        state:'ask',
                        message:'Yeah, the tunnels are somewhere in my garage. The last time I went to my garage it was filled with Monsters.',
                        response1:'*End conversation*',
                    });
                    self.currentResponse = 0;
                }
                else{
                    socket.emit('notification','[!] This NPC doesn\'t want to talk to you right now.');
                }
                self.keyPress.second = false;
            }
            if(Npc.list[i].map === self.map && Npc.list[i].entityId === 'fisherman' && self.mapChange > 20 && Npc.list[i].x - 32 < self.mouseX && Npc.list[i].x + 32 > self.mouseX && Npc.list[i].y - 64 < self.mouseY && Npc.list[i].y + 32 > self.mouseY && self.keyPress.second === true){
                if(self.quest === false && self.questInfo.quest === false && self.checkQuestRequirements("Clear River") === false){
                    self.questStage = 1;
                    self.invincible = true;
                    self.questInfo.quest = 'Clear River';
                    socket.emit('dialogueLine',{
                        state:'ask',
                        message:'Go away. I\'m fishing.',
                        response1:'*End conversation*',
                    });
                    self.currentResponse = 0;
                }
                else if(self.quest === false && self.questInfo.quest === false && self.checkQuestRequirements("Clear River") === true){
                    self.questStage = 2;
                    self.invincible = true;
                    self.questInfo.quest = 'Clear River';
                    socket.emit('dialogueLine',{
                        state:'ask',
                        message:'Can you help me with a Monster problem?',
                        response1:'Sure.',
                        response2:'No.',
                        response3:'Can I buy some fish?',
                    });
                    self.currentResponse = 0;
                }
                else if(self.questStage === 5 && self.quest === 'Clear River'){
                    self.questStage += 1;
                    self.invincible = true;
                    socket.emit('dialogueLine',{
                        state:'ask',
                        message:'Monsters keep attacking Mark when he collects wood in The River. He keeps complaining about this to me, saying I can kill them, but I don\'t even have a weapon! Can you kill all the Monsters in The River for me?',
                        response1:'Ok!',
                    });
                    self.currentResponse = 0;
                }
                else if(self.questStage === 10 && self.quest === 'Clear River'){
                    self.questStage += 1;
                    self.invincible = true;
                    socket.emit('dialogueLine',{
                        state:'ask',
                        message:'You did it? Thanks! Here is a reward.',
                        response1:'*End conversation*',
                    });
                    self.currentResponse = 0;
                }
                else if(self.questStage === 7 && self.quest === 'Secret Tunnels'){
                    self.questStage += 1;
                    self.invincible = true;
                    socket.emit('dialogueLine',{
                        state:'ask',
                        message:'You are asking about secret tunnels? I know they are somewhere near John\'s house. Maybe John knows something about them.',
                        response1:'*End conversation*',
                    });
                    self.currentResponse = 0;
                }
                else{
                    socket.emit('notification','[!] This NPC doesn\'t want to talk to you right now.');
                }
                self.keyPress.second = false;
            }
            if(Npc.list[i].map === self.map && Npc.list[i].entityId === 'wizard' && self.mapChange > 20 && Npc.list[i].x - 32 < self.mouseX && Npc.list[i].x + 32 > self.mouseX && Npc.list[i].y - 64 < self.mouseY && Npc.list[i].y + 32 > self.mouseY && self.keyPress.second === true){
                if(self.quest === false && self.questInfo.quest === false && self.questStats["Clear River"] === true){
                    self.questStage = 1;
                    self.invincible = true;
                    self.quest = 'Enchanter';
                    socket.emit('dialogueLine',{
                        state:'ask',
                        message:'You seem worthy enough to enchant an item. Do you want me to help you enchant an item?',
                        response1:'Yes, please.',
                        response2:'No, I\'m good.',
                    });
                    self.currentResponse = 0;
                }
                else{
                    socket.emit('notification','[!] This NPC doesn\'t want to talk to you right now.');
                }
                self.keyPress.second = false;
            }
            if(Npc.list[i].map === self.map && Npc.list[i].entityId === 'joe' && self.mapChange > 20 && Npc.list[i].x - 32 < self.mouseX && Npc.list[i].x + 32 > self.mouseX && Npc.list[i].y - 64 < self.mouseY && Npc.list[i].y + 32 > self.mouseY && self.keyPress.second === true){
                if(self.quest === false && self.questInfo.quest === false && self.checkQuestRequirements("Clear Tower") === true){
                    self.questStage = 2;
                    self.questInfo.quest = 'Clear Tower';
                    socket.emit('questInfo',{
                        questName:self.questInfo.quest,
                    });
                    self.currentResponse = 0;
                }
                else if(self.quest === false && self.questInfo.quest === false && self.checkQuestRequirements("Clear Tower") === false){
                    self.questStage = 1;
                    self.invincible = true;
                    self.questInfo.quest = 'Clear Tower';
                    socket.emit('dialogueLine',{
                        state:'ask',
                        message:'Leave. I\'m already stranded on this island.',
                        response1:'Fine.',
                    });
                    self.currentResponse = 0;
                }
                else if(self.questStage === 4 && self.quest === 'Clear Tower'){
                    self.questStage += 1;
                    self.invincible = true;
                    socket.emit('dialogueLine',{
                        state:'ask',
                        message:'Rumor has it that Mark saw a giant Red Bird while collecting wood in The River. Mark said that it was standing on top of a tower or something. Kill this Red Bird to help all the villagers.',
                        response1:'Okay!',
                    });
                    self.currentResponse = 0;
                }
                else if(self.questStage === 10 && self.quest === 'Clear Tower'){
                    self.questStage += 1;
                    self.invincible = true;
                    socket.emit('dialogueLine',{
                        state:'ask',
                        message:'You found the tower? Were the rumors true?',
                        response1:'Yes.',
                        response2:'No.',
                    });
                    self.currentResponse = 0;
                }
                else{
                    socket.emit('notification','[!] This NPC doesn\'t want to talk to you right now.');
                }
                self.keyPress.second = false;
            }
            if(Npc.list[i].map === self.map && Npc.list[i].entityId === 'hunter' && self.mapChange > 20 && Npc.list[i].x - 32 < self.mouseX && Npc.list[i].x + 32 > self.mouseX && Npc.list[i].y - 64 < self.mouseY && Npc.list[i].y + 32 > self.mouseY && self.keyPress.second === true){
                if(self.quest === false && self.questInfo.quest === false && self.checkQuestRequirements("Lightning Lizard Boss") === true){
                    self.questStage = 2;
                    self.invincible = true;
                    self.questInfo.quest = 'Lightning Lizard Boss';
                    socket.emit('dialogueLine',{
                        state:'ask',
                        message:'I need you to explore this temple.',
                        response1:'Why?',
                        response2:'Nah, sounds too scary.',
                    });
                    self.currentResponse = 0;
                }
                else if(self.quest === false && self.questInfo.quest === false && self.checkQuestRequirements("Lightning Lizard Boss") === false){
                    self.questStage = 1;
                    self.invincible = true;
                    self.questInfo.quest = 'Lightning Lizard Boss';
                    socket.emit('dialogueLine',{
                        state:'ask',
                        message:'I don\'t need help from a weakling like you. Go talk to Joe in The Docks and defeat the red monster first.',
                        response1:'Ok.',
                    });
                    self.currentResponse = 0;
                }
                else if(self.questStage === 5 && self.quest === 'Lightning Lizard Boss'){
                    self.questStage += 1;
                    self.invincible = true;
                    socket.emit('dialogueLine',{
                        state:'ask',
                        message:'I came to Lilypad Pathway Part 1 because some guy called Joe said there were strong monsters here for me to fight. I saw this old temple and decided to go in, and there was this huge lizard. You seem strong enough to kill it. Could you kill this lizard?',
                        response1:'*End conversation*',
                    });
                    self.currentResponse = 0;
                }
                else if(self.questStage === 13 && self.quest === 'Lightning Lizard Boss'){
                    self.questStage += 1;
                    self.invincible = true;
                    socket.emit('dialogueLine',{
                        state:'ask',
                        message:'Did you kill the Lightning Lizard?',
                        response1:'Yes I did!',
                    });
                    self.currentResponse = 0;
                }
                else{
                    socket.emit('notification','[!] This NPC doesn\'t want to talk to you right now.');
                }
                self.keyPress.second = false;
            }
            if(Npc.list[i].map === self.map && Npc.list[i].entityId === 'woodenforge' && self.mapChange > 20 && Npc.list[i].x - 32 < self.mouseX && Npc.list[i].x + 32 > self.mouseX && Npc.list[i].y - 64 < self.mouseY && Npc.list[i].y + 32 > self.mouseY && self.keyPress.second === true){
                self.inventory.craftItems = Npc.list[i].crafts;
                socket.emit('openCraft',{name:Npc.list[i].name,quote:Npc.list[i].quote,crafts:Npc.list[i].crafts});
                self.keyPress.second = false;
            }
            if(Npc.list[i].map === self.map && Npc.list[i].entityId === 'anvil' && self.mapChange > 20 && Npc.list[i].x - 32 < self.mouseX && Npc.list[i].x + 32 > self.mouseX && Npc.list[i].y - 64 < self.mouseY && Npc.list[i].y + 32 > self.mouseY && self.keyPress.second === true){
                if(self.questStats["Lightning Lizard Boss"] === true){
                    self.inventory.craftItems = Npc.list[i].crafts;
                    socket.emit('openCraft',{name:Npc.list[i].name,quote:Npc.list[i].quote,crafts:Npc.list[i].crafts});
                }
                else{
                    socket.emit('notification','[!] Complete the Lightning Lizard Boss Quest before using the Anvil.');
                }
                self.keyPress.second = false;
            }
            if(Npc.list[i].map === self.map && Npc.list[i].entityId === 'rubyforge' && self.mapChange > 20 && Npc.list[i].x - 32 < self.mouseX && Npc.list[i].x + 32 > self.mouseX && Npc.list[i].y - 64 < self.mouseY && Npc.list[i].y + 32 > self.mouseY && self.keyPress.second === true){
                if(self.questStats["Lost Rubies"] === true){
                    self.inventory.craftItems = Npc.list[i].crafts;
                    socket.emit('openCraft',{name:Npc.list[i].name,quote:Npc.list[i].quote,crafts:Npc.list[i].crafts});
                }
                else{
                    socket.emit('notification','[!] Complete the quest Lost Rubies to gain access to the Ruby Forge.');
                }
                self.keyPress.second = false;
            }
            if(Npc.list[i].map === self.map && Npc.list[i].entityId === 'natureblessing' && self.mapChange > 20 && Npc.list[i].x - 32 < self.mouseX && Npc.list[i].x + 32 > self.mouseX && Npc.list[i].y - 64 < self.mouseY && Npc.list[i].y + 32 > self.mouseY && self.keyPress.second === true){
                if(self.questStats["Plantera"] === true){
                    self.inventory.craftItems = Npc.list[i].crafts;
                    socket.emit('openCraft',{name:Npc.list[i].name,quote:Npc.list[i].quote,crafts:Npc.list[i].crafts});
                }
                else{
                    socket.emit('notification','[!] Defeat Plantera to gain access to Nature\'s Blessing.');
                }
                self.keyPress.second = false;
            }
            if(Npc.list[i].map === self.map && Npc.list[i].entityId === 'fibb' && self.mapChange > 20 && Npc.list[i].x - 32 < self.mouseX && Npc.list[i].x + 32 > self.mouseX && Npc.list[i].y - 64 < self.mouseY && Npc.list[i].y + 32 > self.mouseY && self.keyPress.second === true){
                self.inventory.shopItems = {items:Npc.list[i].shop,prices:Npc.list[i].shopPrices};
                socket.emit('openShop',{name:Npc.list[i].name,quote:Npc.list[i].quote,inventory:{items:Npc.list[i].shop,prices:Npc.list[i].shopPrices}});
                self.keyPress.second = false;
            }
            if(Npc.list[i].map === self.map && Npc.list[i].entityId === 'brian' && self.mapChange > 20 && Npc.list[i].x - 32 < self.mouseX && Npc.list[i].x + 32 > self.mouseX && Npc.list[i].y - 64 < self.mouseY && Npc.list[i].y + 32 > self.mouseY && self.keyPress.second === true){
                self.inventory.shopItems = {items:Npc.list[i].shop,prices:Npc.list[i].shopPrices};
                socket.emit('openShop',{name:Npc.list[i].name,quote:Npc.list[i].quote,inventory:{items:Npc.list[i].shop,prices:Npc.list[i].shopPrices}});
                self.keyPress.second = false;
            }
            if(Npc.list[i].map === self.map && Npc.list[i].entityId === 'wanderingtrader' && self.mapChange > 20 && Npc.list[i].x - 32 < self.mouseX && Npc.list[i].x + 32 > self.mouseX && Npc.list[i].y - 64 < self.mouseY && Npc.list[i].y + 32 > self.mouseY && self.keyPress.second === true){
                self.inventory.shopItems = {items:Npc.list[i].shop,prices:Npc.list[i].shopPrices};
                socket.emit('openShop',{name:Npc.list[i].name,quote:Npc.list[i].quote,inventory:{items:Npc.list[i].shop,prices:Npc.list[i].shopPrices}});
                self.keyPress.second = false;
            }
            if(Npc.list[i].map === self.map && Npc.list[i].entityId === 'wally' && self.mapChange > 20 && Npc.list[i].x - 32 < self.mouseX && Npc.list[i].x + 32 > self.mouseX && Npc.list[i].y - 64 < self.mouseY && Npc.list[i].y + 32 > self.mouseY && self.keyPress.second === true){
                if(self.quest === false && self.questInfo.quest === false && self.questStats["Lightning Lizard Boss"] === true){
                    self.questStage = 2;
                    self.invincible = true;
                    self.questInfo.quest = 'Blacksmith';
                    socket.emit('dialogueLine',{
                        state:'ask',
                        message:'You seem strong enough to hold the skill of using an anvil. Do you want to buy some metals?',
                        response1:'Sure! I would love to buy some metals!',
                        response2:'No, thank you.',
                    });
                    self.currentResponse = 0;
                }
                else if(self.quest === false && self.questInfo.quest === false && self.questStats["Lightning Lizard Boss"] === false){
                    self.questStage = 1;
                    self.invincible = true;
                    self.questInfo.quest = 'Blacksmith';
                    socket.emit('dialogueLine',{
                        state:'ask',
                        message:'You are not strong enough to hold the skill of using an anvil. ',
                        response1:'Ok.',
                    });
                    self.currentResponse = 0;
                }
                else if(self.questStage === 10 && self.quest === 'Broken Piano'){
                    self.questStage += 1;
                    self.invincible = true;
                    socket.emit('dialogueLine',{
                        state:'ask',
                        message:'You need Piano Parts? I think I can make one for you.',
                        response1:'*End conversation*',
                    });
                    self.currentResponse = 0;
                }
                else if(self.questStage === 6 && self.quest === 'Wood Delivery'){
                    self.questStage += 1;
                    self.invincible = true;
                    socket.emit('dialogueLine',{
                        state:'ask',
                        message:'My wood delivery is here? Go tell Bob thank you.',
                        response1:'*End conversation*',
                    });
                    self.currentResponse = 0;
                }
                else{
                    socket.emit('notification','[!] This NPC doesn\'t want to talk to you right now.');
                }
                self.keyPress.second = false;
            }
            if(Npc.list[i].map === self.map && Npc.list[i].entityId === 'sally' && self.mapChange > 20 && Npc.list[i].x - 32 < self.mouseX && Npc.list[i].x + 32 > self.mouseX && Npc.list[i].y - 64 < self.mouseY && Npc.list[i].y + 32 > self.mouseY && self.keyPress.second === true){
                if(self.quest === false && self.questInfo.quest === false && self.checkQuestRequirements("Lost Rubies") === true){
                    self.questStage = 2;
                    self.questInfo.quest = 'Lost Rubies';
                    socket.emit('questInfo',{
                        questName:self.questInfo.quest,
                    });
                    self.currentResponse = 0;
                }
                else if(self.quest === false && self.questInfo.quest === false && self.checkQuestRequirements("Lost Rubies") === false){
                    self.questStage = 1;
                    self.invincible = true;
                    self.questInfo.quest = 'Lost Rubies';
                    socket.emit('dialogueLine',{
                        state:'ask',
                        message:'My friend Wally lost some rubies in the Town Cave. I don\'t think you are strong enough to find them. Defeat a giant beast in the Forest to be worthy enough.',
                        response1:'Ok.',
                    });
                    self.currentResponse = 0;
                }
                else if(self.questStage === 4 && self.quest === 'Lost Rubies'){
                    self.questStage += 1;
                    self.invincible = true;
                    socket.emit('dialogueLine',{
                        state:'ask',
                        message:'My friend Wally lost some rubies in the Town Cave the other day. Could you please find them and return it to me? If you don\'t know, the Town Cave is northwest of The Guarded Citadel.',
                        response1:'*End conversation*',
                    });
                    self.currentResponse = 0;
                }
                else if(self.questStage === 9 && self.quest === 'Lost Rubies'){
                    self.questStage += 1;
                    self.invincible = true;
                    socket.emit('dialogueLine',{
                        state:'ask',
                        message:'Did you get Wally\'s rubies?',
                        response1:'Yes I did!',
                    });
                    self.currentResponse = 0;
                }
                else{
                    socket.emit('notification','[!] This NPC doesn\'t want to talk to you right now.');
                }
                self.keyPress.second = false;
            }
            if(Npc.list[i].map === self.map && Npc.list[i].entityId === 'mia' && self.mapChange > 20 && Npc.list[i].x - 32 < self.mouseX && Npc.list[i].x + 32 > self.mouseX && Npc.list[i].y - 64 < self.mouseY && Npc.list[i].y + 32 > self.mouseY && self.keyPress.second === true){
                if(self.quest === false && self.questInfo.quest === false && self.checkQuestRequirements("Broken Piano") === true){
                    self.questStage = 2;
                    self.invincible = true;
                    self.questInfo.quest = 'Broken Piano';
                    socket.emit('dialogueLine',{
                        state:'ask',
                        message:'Do you want to listen to me playing the piano?',
                        response1:'I would love to!',
                        response2:'Not really...',
                    });
                    self.currentResponse = 0;
                }
                else if(self.quest === false && self.questInfo.quest === false && self.checkQuestRequirements("Broken Piano") === false){
                    self.questStage = 1;
                    self.invincible = true;
                    self.questInfo.quest = 'Broken Piano';
                    socket.emit('dialogueLine',{
                        state:'ask',
                        message:'I\'m practicing the piano. Can you please leave?',
                        response1:'*End conversation*',
                    });
                    self.currentResponse = 0;
                }
                else if(self.questStage === 8 && self.quest === 'Broken Piano'){
                    self.questStage += 1;
                    self.invincible = true;
                    socket.emit('dialogueLine',{
                        state:'ask',
                        message:'I need Piano Parts to fix my piano. I think Wally might be able to make some Piano Parts. You can also try searching in different maps.',
                        response1:'*End conversation*',
                    });
                    self.currentResponse = 0;
                }
                else if(self.questStage === 17 && self.quest === 'Broken Piano'){
                    self.questStage += 1;
                    self.invincible = true;
                    socket.emit('dialogueLine',{
                        state:'ask',
                        message:'Do you have the Piano Parts?',
                        response1:'Yeah, I have them.',
                    });
                    self.currentResponse = 0;
                }
                else{
                    socket.emit('notification','[!] This NPC doesn\'t want to talk to you right now.');
                }
                self.keyPress.second = false;
            }
            if(Npc.list[i].map === self.map && Npc.list[i].entityId === 'petmaster' && self.mapChange > 20 && Npc.list[i].x - 32 < self.mouseX && Npc.list[i].x + 32 > self.mouseX && Npc.list[i].y - 64 < self.mouseY && Npc.list[i].y + 32 > self.mouseY && self.keyPress.second === true){
                if(self.quest === false && self.questInfo.quest === false && self.checkQuestRequirements("Pet Training") === true){
                    self.questStage = 2;
                    self.invincible = true;
                    self.questInfo.quest = 'Pet Training';
                    socket.emit('dialogueLine',{
                        state:'ask',
                        message:'Do you like pets?',
                        response1:'Yes.',
                        response2:'No.',
                    });
                    self.currentResponse = 0;
                }
                else if(self.quest === false && self.questInfo.quest === false && self.checkQuestRequirements("Pet Training") === false){
                    self.questStage = 1;
                    self.invincible = true;
                    self.questInfo.quest = 'Pet Training';
                    socket.emit('dialogueLine',{
                        state:'ask',
                        message:'You need rubies to upgrade your pet.',
                        response1:'*End conversation*',
                    });
                    self.currentResponse = 0;
                }
                else if(self.questStage === 9 && self.quest === 'Pet Training'){
                    self.questStage += 1;
                    self.invincible = true;
                    socket.emit('dialogueLine',{
                        state:'ask',
                        message:'I will teleport you to the training arena.',
                        response1:'*End conversation*',
                    });
                    self.currentResponse = 0;
                }
                else if(self.questStage === 8 && self.quest === 'Monster Search'){
                    self.questStage += 1;
                    self.invincible = true;
                    socket.emit('dialogueLine',{
                        state:'ask',
                        message:'Yeah, I know some things about monster spawns. When I was setting up The Pet Arena, I had to mark monster spawning locations, and wire them up. Maybe you could find a way to disable the wiring? I got my wire from a house in The Forest.',
                        response1:'*End conversation*',
                    });
                    self.currentResponse = 0;
                }
                else{
                    socket.emit('notification','[!] This NPC doesn\'t want to talk to you right now.');
                }
                self.keyPress.second = false;
            }
            if(Npc.list[i].map === self.map && Npc.list[i].entityId === 'andrew' && self.mapChange > 20 && Npc.list[i].x - 32 < self.mouseX && Npc.list[i].x + 32 > self.mouseX && Npc.list[i].y - 64 < self.mouseY && Npc.list[i].y + 32 > self.mouseY && self.keyPress.second === true){
                if(self.quest === false && self.questInfo.quest === false && self.checkQuestRequirements("Monster Search") === true){
                    self.questStage = 2;
                    self.invincible = true;
                    self.questInfo.quest = 'Monster Search';
                    socket.emit('dialogueLine',{
                        state:'ask',
                        message:'Have you seen those weird yellow Sand Birds in the Town Cave? They are so annoying, right?',
                        response1:'Yeah, they are so powerful!',
                        response2:'What Sand Birds?',
                    });
                    self.currentResponse = 0;
                }
                else if(self.quest === false && self.questInfo.quest === false && self.checkQuestRequirements("Monster Search") === false){
                    self.questStage = 1;
                    self.invincible = true;
                    self.questInfo.quest = 'Monster Search';
                    socket.emit('dialogueLine',{
                        state:'ask',
                        message:'I saw some rubies in the Town Cave. I think I remember someone losing their rubies...',
                        response1:'*End conversation*',
                    });
                    self.currentResponse = 0;
                }
                else if(self.questStage === 6 && self.quest === 'Monster Search'){
                    self.questStage += 1;
                    self.invincible = true;
                    socket.emit('dialogueLine',{
                        state:'ask',
                        message:'I think the Pet Master knows something about monster spawns.',
                        response1:'*End conversation*',
                    });
                    self.currentResponse = 0;
                }
                else{
                    socket.emit('notification','[!] This NPC doesn\'t want to talk to you right now.');
                }
                self.keyPress.second = false;
            }
            if(Npc.list[i].map === self.map && Npc.list[i].entityId === 'monsterking' && self.mapChange > 20 && Npc.list[i].x - 32 < self.mouseX && Npc.list[i].x + 32 > self.mouseX && Npc.list[i].y - 64 < self.mouseY && Npc.list[i].y + 32 > self.mouseY && self.keyPress.second === true){
                if(self.questStage === 14 && self.quest === 'Monster Search'){
                    self.questStage += 1;
                    self.invincible = true;
                    socket.emit('dialogueLine',{
                        state:'ask',
                        message:'Who are you?',
                        response1:'I have to kill you!',
                    });
                    self.currentResponse = 0;
                }
                else{
                    socket.emit('notification','[!] This NPC doesn\'t want to talk to you right now.');
                }
                self.keyPress.second = false;
            }
            if(Npc.list[i].map === self.map && Npc.list[i].entityId === 'riley' && self.mapChange > 20 && Npc.list[i].x - 32 < self.mouseX && Npc.list[i].x + 32 > self.mouseX && Npc.list[i].y - 64 < self.mouseY && Npc.list[i].y + 32 > self.mouseY && self.keyPress.second === true){
                if(self.quest === false && self.questInfo.quest === false && self.checkQuestRequirements("Missing Candies") === true){
                    self.questStage = 1;
                    self.invincible = true;
                    self.questInfo.quest = 'Missing Candies';
                    socket.emit('dialogueLine',{
                        state:'ask',
                        message:'I lost my candies! Can you find them for me?',
                        response1:'Sure, if I get a reward.',
                        response2:'No, I am busy right now.',
                    });
                    self.currentResponse = 0;
                }
                else if(self.quest === false && self.questInfo.quest === false && self.checkQuestRequirements("Missing Candies") === false){
                    self.questStage = 1;
                    self.invincible = true;
                    self.questInfo.quest = 'Missing Candies';
                    socket.emit('dialogueLine',{
                        state:'ask',
                        message:'I lost my candies! Can you find them for me?',
                        response1:'Sure, if I get a reward.',
                        response2:'No, I am busy right now.',
                    });
                    self.currentResponse = 0;
                }
                else if(self.questStage === 4 && self.quest === 'Missing Candies'){
                    self.questStage += 1;
                    self.invincible = true;
                    socket.emit('dialogueLine',{
                        state:'ask',
                        message:'I really want my candies back.',
                        response1:'*End conversation*',
                    });
                    self.currentResponse = 0;
                }
                else if(self.questStage === 9 && self.quest === 'Missing Candies'){
                    self.questStage += 1;
                    self.invincible = true;
                    socket.emit('dialogueLine',{
                        state:'ask',
                        message:'Yay! You found my candies!',
                        response1:'*End conversation*',
                    });
                    self.currentResponse = 0;
                }
                else{
                    socket.emit('notification','[!] This NPC doesn\'t want to talk to you right now.');
                }
                self.keyPress.second = false;
            }
            if(Npc.list[i].map === self.map && Npc.list[i].entityId === 'billy' && self.mapChange > 20 && Npc.list[i].x - 32 < self.mouseX && Npc.list[i].x + 32 > self.mouseX && Npc.list[i].y - 64 < self.mouseY && Npc.list[i].y + 32 > self.mouseY && self.keyPress.second === true){
                if(self.quest === false && self.questInfo.quest === false && self.checkQuestRequirements("Broken Sword") === true){
                    self.questStage = 2;
                    self.invincible = true;
                    self.questInfo.quest = 'Broken Sword';
                    socket.emit('dialogueLine',{
                        state:'ask',
                        message:'Hey, I heard there was a broken sword hidden somewhere in this map. I wasn\'t able to find it, can you help me?',
                        response1:'Why do you want this broken sword?',
                        response2:'I won\'t help you.',
                    });
                    self.currentResponse = 0;
                }
                else if(self.quest === false && self.questInfo.quest === false && self.checkQuestRequirements("Broken Sword") === false){
                    self.questStage = 1;
                    self.invincible = true;
                    self.questInfo.quest = 'Broken Sword';
                    socket.emit('dialogueLine',{
                        state:'ask',
                        message:'I heard there is secret treasure...',
                        response1:'That\'s vague,',
                    });
                    self.currentResponse = 0;
                }
                else if(self.questStage === 7 && self.quest === 'Broken Sword'){
                    self.questStage += 1;
                    self.invincible = true;
                    socket.emit('dialogueLine',{
                        state:'ask',
                        message:'You can have a reward if you give me this sword.',
                        response1:'*End conversation*',
                    });
                    self.currentResponse = 0;
                }
                else if(self.questStage === 12 && self.quest === 'Broken Sword'){
                    self.questStage += 1;
                    self.invincible = true;
                    socket.emit('dialogueLine',{
                        state:'ask',
                        message:'Thanks for finding this broken sword!',
                        response1:'*End conversation*',
                    });
                    self.currentResponse = 0;
                }
                else{
                    socket.emit('notification','[!] This NPC doesn\'t want to talk to you right now.');
                }
                self.keyPress.second = false;
            }
            if(Npc.list[i].map === self.map && Npc.list[i].entityId === 'cyber' && self.mapChange > 20 && Npc.list[i].x - 32 < self.mouseX && Npc.list[i].x + 32 > self.mouseX && Npc.list[i].y - 64 < self.mouseY && Npc.list[i].y + 32 > self.mouseY && self.keyPress.second === true){
                if(self.quest === false && self.questInfo.quest === false && self.checkQuestRequirements("Secret Tunnels") === true){
                    self.questStage = 2;
                    self.invincible = true;
                    self.questInfo.quest = 'Secret Tunnels';
                    socket.emit('questInfo',{
                        questName:self.questInfo.quest,
                    });
                    self.currentResponse = 0;
                }
                else if(self.quest === false && self.questInfo.quest === false && self.checkQuestRequirements("Secret Tunnels") === false){
                    self.questStage = 1;
                    self.invincible = true;
                    self.questInfo.quest = 'Secret Tunnels';
                    socket.emit('dialogueLine',{
                        state:'ask',
                        message:'The Village is under attack! Go talk to John to see how you can help.',
                        response1:'Okay!',
                    });
                    self.currentResponse = 0;
                }
                else if(self.questStage === 4 && self.quest === 'Secret Tunnels'){
                    self.questStage += 1;
                    self.invincible = true;
                    socket.emit('dialogueLine',{
                        state:'ask',
                        message:'I heard there were secret tunnels build underground in case of a evacuation due to Monsters. However, someone was dumb enough to forget where the tunnels were installed! I need your help to find the tunnels.',
                        response1:'Sure, I will help you.',
                    });
                    self.currentResponse = 0;
                }
                else{
                    socket.emit('notification','[!] This NPC doesn\'t want to talk to you right now.');
                }
                self.keyPress.second = false;
            }
            if(Npc.list[i].map === self.map && Npc.list[i].entityId === 'tutorialguard' && self.mapChange > 20 && Npc.list[i].x - 32 < self.mouseX && Npc.list[i].x + 32 > self.mouseX && Npc.list[i].y - 64 < self.mouseY && Npc.list[i].y + 32 > self.mouseY && self.keyPress.second === true){
                if(self.questStage === 7 && self.quest === 'Tutorial'){
                    self.questStage += 1;
                    self.invincible = true;
                    socket.emit('dialogueLine',{
                        state:'ask',
                        message:'You came just in time! The Village is getting invaded by Monsters! Use Left Click to attack and kill these Monsters!',
                        response1:'*End conversation*',
                    });
                    self.currentResponse = 0;
                }
                else{
                    socket.emit('notification','[!] This NPC doesn\'t want to talk to you right now.');
                }
                self.keyPress.second = false;
            }
        }
        if(self.questStage === 1 && self.quest === 'Tutorial'){
            self.questStage += 1;
            self.invincible = true;
            socket.emit('dialogueLine',{
                state:'ask',
                message:'Use WASD or Arrow keys to move. Press [I] to open your inventory and equip a weapon.',
                response1:'...',
            });
            socket.emit('questObjective',{
                questName:self.quest,
                questObjective:'Equip a weapon from your inventory.',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 2 && self.quest === 'Tutorial'){
            self.invincible = false;
            self.questStage += 1;
            socket.emit('dialogueLine',{
                state:'remove',
            });
            self.currentResponse = 0;
        }
        if(self.questStage === 3 && self.quest === 'Tutorial' && self.inventory.currentEquip.weapon.id !== undefined){
            self.questStage += 1;
            socket.emit('questObjective',{
                questName:self.quest,
                questObjective:'Walk towards the guard.',
            });
        }
        if(self.questStage === 3 && self.quest === 'Tutorial' && self.mapChange > 10){
            for(var i in QuestInfo.list){
                if(QuestInfo.list[i].quest === 'Tutorial' && QuestInfo.list[i].info === 'activator1' && self.isColliding(QuestInfo.list[i])){
                    self.questStage = 10;
                }
            }
        }
        if(self.questStage === 4 && self.quest === 'Tutorial' && self.mapChange > 10){
            for(var i in QuestInfo.list){
                if(QuestInfo.list[i].quest === 'Tutorial' && QuestInfo.list[i].info === 'activator1' && self.isColliding(QuestInfo.list[i])){
                    self.questStage = 5;
                }
            }
        }
        if(self.questStage === 5 && self.quest === 'Tutorial'){
            self.questStage += 1;
            self.invincible = true;
            socket.emit('dialogueLine',{
                state:'ask',
                message:'Right Click to talk to the guard.',
                response1:'...',
            });
            socket.emit('questObjective',{
                questName:self.quest,
                questObjective:'Talk to the guard.',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 6 && self.quest === 'Tutorial'){
            self.invincible = false;
            self.questStage += 1;
            socket.emit('dialogueLine',{
                state:'remove',
            });
            self.currentResponse = 0;
        }
        if(self.questStage === 10 && self.quest === 'Tutorial'){
            self.questStage = 2;
            self.move(864,1600);
            self.invincible = true;
            socket.emit('dialogueLine',{
                state:'ask',
                message:'Make sure you have a weapon equipped. You can open your inventory by pressing [I].',
                response1:'...',
            });
            self.currentResponse = 0;
        }
        if(self.questStage === 7 && self.quest === 'Tutorial'){
            for(var i in QuestInfo.list){
                if(QuestInfo.list[i].quest === 'Tutorial' && QuestInfo.list[i].info === 'collision' && self.isColliding(QuestInfo.list[i])){
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
            self.invincible = false;
            setTimeout(function(){
                self.questStage += 1;
            },500);
            socket.emit('dialogueLine',{
                state:'remove',
            });
            self.currentResponse = 0;
        }
        if(self.questStage === 9 && self.quest === 'Tutorial'){
            self.questStage += 2;
            self.invincible = true;
            socket.emit('dialogueLine',{
                state:'ask',
                message:'The Monsters are here! Quick, kill them!',
                response1:'*End conversation*',
            });
            socket.emit('questObjective',{
                questName:self.quest,
                questObjective:'Kill the Birds.',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 11 && self.quest === 'Tutorial' && self.mapChange > 10){
            self.invincible = false;
            self.questStage += 1;
            socket.emit('dialogueLine',{
                state:'remove',
            });
            self.questInfo.monstersKilled = 0;
            self.questInfo.maxMonsters = 0;
            for(var i in QuestInfo.list){
                if(QuestInfo.list[i].quest === 'Tutorial' && QuestInfo.list[i].info === 'spawner'){
                    self.spawnQuestMonster(i,QuestInfo.list[i].x,QuestInfo.list[i].y,QuestInfo.list[i].map,'greenBird');
                }
                if(QuestInfo.list[i].quest === 'Tutorial' && QuestInfo.list[i].info === 'spawner2'){
                    self.spawnQuestMonster(i,QuestInfo.list[i].x,QuestInfo.list[i].y,QuestInfo.list[i].map,'blueBird');
                }
            }
            self.currentResponse = 0;
        }
        if(self.questStage === 12 && self.quest === 'Tutorial' && self.mapChange > 10){
            for(var i in QuestInfo.list){
                if(QuestInfo.list[i].quest === 'Tutorial' && QuestInfo.list[i].info === 'activator2' && self.isColliding(QuestInfo.list[i])){
                    for(var i in QuestInfo.list){
                        if(QuestInfo.list[i].quest === 'Tutorial' && QuestInfo.list[i].info === 'collision'){
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
            self.questStage += 1;
            self.invincible = true;
            socket.emit('dialogueLine',{
                state:'ask',
                message:'Good Job! Now walk into the blue transporter to head to The Village! Once you are there, you will be able to interact with other players to save The Village!',
                response1:'Thanks!',
            });
            socket.emit('questObjective',{
                questName:self.quest,
                questObjective:'Walk to the blue transporter.',
            });
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
            self.invincible = false;
            self.questStage += 1;
            socket.emit('dialogueLine',{
                state:'remove',
            });
            self.currentResponse = 0;
        }
        if(self.questStage === 15 && self.quest === 'Tutorial' && self.map === 'The Village'){
            self.xp += Math.round(500 * self.stats.xp);
            socket.emit('notification','You completed the quest ' + self.quest + '.');
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
            socket.emit('dialogueLine',{
                state:'remove',
            });
            socket.emit('questObjective',{
                questName:'',
                questObjective:'',
            });
            self.currentResponse = 0;
        }

        if(self.currentResponse === 1 && self.questStage === 1 && self.questInfo.quest === 'Missing Person'){
            self.questInfo.started = false;
            self.questStage += 1;
            self.invincible = false;
            socket.emit('dialogueLine',{
                state:'remove',
            });
            socket.emit('questInfo',{
                questName:self.questInfo.quest,
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
            socket.emit('dialogueLine',{
                state:'remove',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 3 && self.questStage === 1 && self.questInfo.quest === 'Missing Person'){
            self.invincible = false;
            self.questInfo = {
                quest:false,
            };
            for(var i in self.questDependent){
                self.questDependent[i].toRemove = true;
            }
            socket.emit('dialogueLine',{
                state:'remove',
            });
            for(var i in Npc.list){
                if(Npc.list[i].entityId === 'bob'){
                    self.inventory.shopItems = {items:Npc.list[i].shop,prices:Npc.list[i].shopPrices};
                    socket.emit('openShop',{name:Npc.list[i].name,quote:Npc.list[i].quote,inventory:{items:Npc.list[i].shop,prices:Npc.list[i].shopPrices}});
                }
            }
            self.currentResponse = 0;
        }
        if(self.questInfo.started === true && self.questStage === 2 && self.questInfo.quest === 'Missing Person'){
            self.quest = 'Missing Person'
            self.questStage += 1;
            self.invincible = true;
            socket.emit('dialogueLine',{
                state:'ask',
                message:'I should talk to Bob.',
                response1:'...',
            });
            socket.emit('questObjective',{
                questName:self.quest,
                questObjective:'Talk to Bob.',
            });
            socket.emit('notification','You started the quest ' + self.questInfo.quest + '.');
        }
        if(self.currentResponse === 1 && self.questStage === 3 && self.quest === 'Missing Person'){
            self.questStage += 1;
            self.invincible = false;
            socket.emit('dialogueLine',{
                state:'remove',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 5 && self.quest === 'Missing Person'){
            self.questStage += 1;
            self.invincible = false;
            socket.emit('dialogueLine',{
                state:'remove',
            });
            socket.emit('questObjective',{
                questName:self.quest,
                questObjective:'Find Mark in The River.',
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
                            shop:false,
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
            socket.emit('dialogueLine',{
                state:'ask',
                message:'Oh! Hey, who are you?',
                response1:'Um, your friend Bob sent me to rescue you.',
            });
        }
        if(self.currentResponse === 1 && self.questStage === 9 && self.quest === 'Missing Person'){
            self.questStage += 1;
            self.invincible = true;
            socket.emit('dialogueLine',{
                state:'ask',
                message:'Oh, because I was gone for a long time? I\'m completely fine! Just collecting wood. Go tell Bob.',
                response1:'Ok, I can tell Bob you are fine.',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 10 && self.quest === 'Missing Person'){
            self.questStage += 1;
            self.invincible = false;
            socket.emit('dialogueLine',{
                state:'remove',
            });
            socket.emit('questObjective',{
                questName:self.quest,
                questObjective:'Return to Bob.',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 12 && self.quest === 'Missing Person'){
            if(self.questStats[self.quest]){
                self.xp += Math.round(questData[self.quest].xp * self.stats.xp / 10 * (Math.random() + 0.5));
                self.coins += Math.round(questData[self.quest].xp * self.stats.xp * (Math.random() + 0.5));
            }
            else{
                self.xp += Math.round(questData[self.quest].xp * self.stats.xp * (Math.random() + 0.5));
                self.coins += Math.round(questData[self.quest].xp * self.stats.xp * (Math.random() + 0.5));
            }
            socket.emit('notification','You completed the quest ' + self.quest + '.');
            addToChat('style="color: ' + self.textColor + '">',self.displayName + " completed the quest " + self.quest + ".");
            var woodObtained = Math.round(15 + Math.random() * 10);
            socket.emit('notification','You obtained ' + woodObtained + ' wood.');
            self.inventory.materials.wood += woodObtained;
            self.inventory.refreshMaterial();
            self.questStats[self.quest] = true;
            self.quest = false;
            self.questInfo = {
                quest:false,
            };
            for(var i in self.questDependent){
                self.questDependent[i].toRemove = true;
            }
            self.invincible = false;
            socket.emit('dialogueLine',{
                state:'remove',
            });
            socket.emit('questObjective',{
                questName:'',
                questObjective:'',
            });
            self.currentResponse = 0;
        }

        if(self.currentResponse === 1 && self.questStage === 1 && self.questInfo.quest === 'Monster Raid'){
            self.questInfo.started = false;
            self.questStage += 1;
            self.invincible = false;
            socket.emit('dialogueLine',{
                state:'remove',
            });
            socket.emit('questInfo',{
                questName:self.questInfo.quest,
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 2 && self.questStage === 1 && self.questInfo.quest === 'Monster Raid'){
            self.invincible = false;
            self.questInfo = {
                quest:false,
            };
            socket.emit('dialogueLine',{
                state:'remove',
            });
            self.currentResponse = 0;
        }
        if(self.questInfo.started === true && self.questStage === 2 && self.questInfo.quest === 'Monster Raid'){
            self.quest = 'Monster Raid';
            self.questStage += 1;
            self.invincible = true;
            socket.emit('dialogueLine',{
                state:'ask',
                message:'I should talk to John.',
                response1:'...',
            });
            socket.emit('questObjective',{
                questName:self.quest,
                questObjective:'Talk to John.',
            });
            socket.emit('notification','You started the quest ' + self.questInfo.quest + '.');
        }
        if(self.currentResponse === 1 && self.questStage === 3 && self.quest === 'Monster Raid'){
            self.questStage += 1;
            socket.emit('dialogueLine',{
                state:'remove',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 5 && self.quest === 'Monster Raid'){
            self.questStage += 1;
            socket.emit('dialogueLine',{
                state:'remove',
            });
            socket.emit('questObjective',{
                questName:self.quest,
                questObjective:'Kill the Monsters!',
            });
            self.teleport(992,864,'The Battlefield');
            self.currentResponse = 0;
        }
        if(self.questStage === 6 && self.quest === 'Monster Raid' && self.mapChange > 10){
            socket.emit('notification',"Wave 1: Blue Bird x2");
            self.questInfo.monstersKilled = 0;
            self.questInfo.maxMonsters = 0;
            for(var i in QuestInfo.list){
                if(QuestInfo.list[i].quest === 'Monster Raid' && QuestInfo.list[i].info === 'spawner1'){
                    self.spawnQuestMonster(i,QuestInfo.list[i].x,QuestInfo.list[i].y,QuestInfo.list[i].map,'blueBird');
                }
                if(QuestInfo.list[i].quest === 'Monster Raid' && QuestInfo.list[i].info === 'spawner3'){
                    self.spawnQuestMonster(i,QuestInfo.list[i].x,QuestInfo.list[i].y,QuestInfo.list[i].map,'blueBird');
                }
            }
            self.questStage += 1;
        }
        if(self.questStage === 7 && self.quest === 'Monster Raid' && self.questInfo.monstersKilled === self.questInfo.maxMonsters){
            socket.emit('notification',"Wave Complete!");
            self.questStage += 1;
            setTimeout(function(){
                self.questStage += 1;
            },2000);
        }
        if(self.questStage === 9 && self.quest === 'Monster Raid' && self.mapChange > 10){
            socket.emit('notification',"Wave 2: Blue Bird x2 + Green Bird");
            self.questInfo.monstersKilled = 0;
            self.questInfo.maxMonsters = 0;
            for(var i in QuestInfo.list){
                if(QuestInfo.list[i].quest === 'Monster Raid' && QuestInfo.list[i].info === 'spawner1'){
                    self.spawnQuestMonster(i,QuestInfo.list[i].x,QuestInfo.list[i].y,QuestInfo.list[i].map,'blueBird');
                }
                if(QuestInfo.list[i].quest === 'Monster Raid' && QuestInfo.list[i].info === 'spawner2'){
                    self.spawnQuestMonster(i,QuestInfo.list[i].x,QuestInfo.list[i].y,QuestInfo.list[i].map,'blueBird');
                }
                if(QuestInfo.list[i].quest === 'Monster Raid' && QuestInfo.list[i].info === 'spawner3'){
                    self.spawnQuestMonster(i,QuestInfo.list[i].x,QuestInfo.list[i].y,QuestInfo.list[i].map,'greenBird');
                }
            }
            self.questStage += 1;
        }
        if(self.questStage === 10 && self.quest === 'Monster Raid' && self.questInfo.monstersKilled === self.questInfo.maxMonsters){
            socket.emit('notification',"Wave Complete!");
            self.questStage += 1;
            setTimeout(function(){
                self.questStage += 1;
            },2000);
        }
        if(self.questStage === 12 && self.quest === 'Monster Raid' && self.mapChange > 10){
            socket.emit('notification',"Wave 3: Blue Bird x3 + Green Bird");
            self.questInfo.monstersKilled = 0;
            self.questInfo.maxMonsters = 0;
            for(var i in QuestInfo.list){
                if(QuestInfo.list[i].quest === 'Monster Raid' && QuestInfo.list[i].info === 'spawner1'){
                    self.spawnQuestMonster(i,QuestInfo.list[i].x,QuestInfo.list[i].y,QuestInfo.list[i].map,'greenBird');
                }
                if(QuestInfo.list[i].quest === 'Monster Raid' && QuestInfo.list[i].info === 'spawner2'){
                    self.spawnQuestMonster(i,QuestInfo.list[i].x,QuestInfo.list[i].y,QuestInfo.list[i].map,'blueBird');
                }
                if(QuestInfo.list[i].quest === 'Monster Raid' && QuestInfo.list[i].info === 'spawner3'){
                    self.spawnQuestMonster(i,QuestInfo.list[i].x,QuestInfo.list[i].y,QuestInfo.list[i].map,'blueBird');
                }
                if(QuestInfo.list[i].quest === 'Monster Raid' && QuestInfo.list[i].info === 'spawner5'){
                    self.spawnQuestMonster(i,QuestInfo.list[i].x,QuestInfo.list[i].y,QuestInfo.list[i].map,'blueBird');
                }
            }
            self.questStage += 1;
        }
        if(self.questStage === 13 && self.quest === 'Monster Raid' && self.questInfo.monstersKilled === self.questInfo.maxMonsters){
            socket.emit('notification',"Wave Complete!");
            self.questStage += 1;
            setTimeout(function(){
                self.questStage += 1;
            },2000);
        }
        if(self.questStage === 15 && self.quest === 'Monster Raid' && self.mapChange > 10){
            socket.emit('notification',"Wave 4: Blue Bird x3 + Green Bird x2");
            self.questInfo.monstersKilled = 0;
            self.questInfo.maxMonsters = 0;
            for(var i in QuestInfo.list){
                if(QuestInfo.list[i].quest === 'Monster Raid' && QuestInfo.list[i].info === 'spawner1'){
                    self.spawnQuestMonster(i,QuestInfo.list[i].x,QuestInfo.list[i].y,QuestInfo.list[i].map,'blueBird');
                }
                if(QuestInfo.list[i].quest === 'Monster Raid' && QuestInfo.list[i].info === 'spawner2'){
                    self.spawnQuestMonster(i,QuestInfo.list[i].x,QuestInfo.list[i].y,QuestInfo.list[i].map,'greenBird');
                }
                if(QuestInfo.list[i].quest === 'Monster Raid' && QuestInfo.list[i].info === 'spawner3'){
                    self.spawnQuestMonster(i,QuestInfo.list[i].x,QuestInfo.list[i].y,QuestInfo.list[i].map,'blueBird');
                }
                if(QuestInfo.list[i].quest === 'Monster Raid' && QuestInfo.list[i].info === 'spawner5'){
                    self.spawnQuestMonster(i,QuestInfo.list[i].x,QuestInfo.list[i].y,QuestInfo.list[i].map,'greenBird');
                }
                if(QuestInfo.list[i].quest === 'Monster Raid' && QuestInfo.list[i].info === 'spawner6'){
                    self.spawnQuestMonster(i,QuestInfo.list[i].x,QuestInfo.list[i].y,QuestInfo.list[i].map,'blueBird');
                }
            }
            self.questStage += 1;
        }
        if(self.questStage === 16 && self.quest === 'Monster Raid' && self.questInfo.monstersKilled === self.questInfo.maxMonsters){
            socket.emit('notification',"Wave Complete!");
            self.questStage += 1;
            setTimeout(function(){
                self.questStage += 1;
            },2000);
        }
        if(self.questStage === 18 && self.quest === 'Monster Raid' && self.mapChange > 10){
            socket.emit('notification',"Wave 5: Blue Bird x4 + Green Bird x2 + Ball Monster");
            self.questInfo.monstersKilled = 0;
            self.questInfo.maxMonsters = 0;
            for(var i in QuestInfo.list){
                if(QuestInfo.list[i].quest === 'Monster Raid' && QuestInfo.list[i].info === 'spawner1'){
                    self.spawnQuestMonster(i,QuestInfo.list[i].x,QuestInfo.list[i].y,QuestInfo.list[i].map,'blueBird');
                }
                if(QuestInfo.list[i].quest === 'Monster Raid' && QuestInfo.list[i].info === 'spawner2'){
                    self.spawnQuestMonster(i,QuestInfo.list[i].x,QuestInfo.list[i].y,QuestInfo.list[i].map,'greenBird');
                }
                if(QuestInfo.list[i].quest === 'Monster Raid' && QuestInfo.list[i].info === 'spawner3'){
                    self.spawnQuestMonster(i,QuestInfo.list[i].x,QuestInfo.list[i].y,QuestInfo.list[i].map,'blueBird');
                }
                if(QuestInfo.list[i].quest === 'Monster Raid' && QuestInfo.list[i].info === 'spawner4'){
                    self.spawnQuestMonster(i,QuestInfo.list[i].x,QuestInfo.list[i].y,QuestInfo.list[i].map,'blueBird');
                }
                if(QuestInfo.list[i].quest === 'Monster Raid' && QuestInfo.list[i].info === 'spawner5'){
                    self.spawnQuestMonster(i,QuestInfo.list[i].x,QuestInfo.list[i].y,QuestInfo.list[i].map,'greenBird');
                }
                if(QuestInfo.list[i].quest === 'Monster Raid' && QuestInfo.list[i].info === 'spawner6'){
                    self.spawnQuestMonster(i,QuestInfo.list[i].x,QuestInfo.list[i].y,QuestInfo.list[i].map,'blueBird');
                }
                if(QuestInfo.list[i].quest === 'Monster Raid' && QuestInfo.list[i].info === 'spawner7'){
                    self.spawnQuestMonster(i,QuestInfo.list[i].x,QuestInfo.list[i].y,QuestInfo.list[i].map,'blueBall');
                }
            }
            self.questStage += 1;
        }
        if(self.questStage === 19 && self.quest === 'Monster Raid' && self.questInfo.monstersKilled === self.questInfo.maxMonsters){
            socket.emit('notification',"Wave Complete!");
            self.questStage += 1;
            setTimeout(function(){
                self.questStage += 1;
            },2000);
        }
        if(self.questStage === 21 && self.quest === 'Monster Raid'){
            self.questStage += 1;
            self.teleport(2592,736,'The Village');
            self.invincible = true;
            socket.emit('dialogueLine',{
                state:'ask',
                message:'You saved The Village! Here, have a reward.',
                response1:'Thanks.',
            });
            socket.emit('questObjective',{
                questName:self.quest,
                questObjective:'No quest objective.',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 22 && self.quest === 'Monster Raid'){
            self.questStage += 1;
            self.invincible = true;
            socket.emit('dialogueLine',{
                state:'ask',
                message:'If you are looking for something to do, try talking to other NPCs! There are many NPCs in The Village!',
                response1:'*End conversation*',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 23 && self.quest === 'Monster Raid'){
            if(self.questStats[self.quest]){
                self.xp += Math.round(questData[self.quest].xp * self.stats.xp / 10 * (Math.random() + 0.5));
                self.coins += Math.round(questData[self.quest].xp * self.stats.xp * (Math.random() + 0.5));
            }
            else{
                self.xp += Math.round(questData[self.quest].xp * self.stats.xp * (Math.random() + 0.5));
                self.coins += Math.round(questData[self.quest].xp * self.stats.xp * (Math.random() + 0.5));
            }
            socket.emit('notification','You completed the quest ' + self.quest + '.');
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
            socket.emit('dialogueLine',{
                state:'remove',
            });
            socket.emit('questObjective',{
                questName:'',
                questObjective:'',
            });
            self.currentResponse = 0;
        }
        
        if(self.currentResponse === 1 && self.questStage === 1 && self.questInfo.quest === 'Clear River'){
            self.invincible = false;
            self.questInfo = {
                quest:false,
            };
            socket.emit('dialogueLine',{
                state:'remove',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 2 && self.questInfo.quest === 'Clear River'){
            self.questInfo.started = false;
            self.questStage += 1;
            self.invincible = false;
            socket.emit('dialogueLine',{
                state:'remove',
            });
            socket.emit('questInfo',{
                questName:self.questInfo.quest,
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 2 && self.questStage === 2 && self.questInfo.quest === 'Clear River'){
            self.invincible = false;
            self.questInfo = {
                quest:false,
            };
            socket.emit('dialogueLine',{
                state:'remove',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 3 && self.questStage === 2 && self.questInfo.quest === 'Clear River'){
            self.invincible = false;
            self.questInfo = {
                quest:false,
            };
            for(var i in self.questDependent){
                self.questDependent[i].toRemove = true;
            }
            socket.emit('dialogueLine',{
                state:'remove',
            });
            for(var i in Npc.list){
                if(Npc.list[i].entityId === 'fisherman'){
                    self.inventory.shopItems = {items:Npc.list[i].shop,prices:Npc.list[i].shopPrices};
                    socket.emit('openShop',{name:Npc.list[i].name,quote:Npc.list[i].quote,inventory:{items:Npc.list[i].shop,prices:Npc.list[i].shopPrices}});
                }
            }
            self.currentResponse = 0;
        }
        if(self.questInfo.started === true && self.questStage === 3 && self.questInfo.quest === 'Clear River'){
            self.quest = 'Clear River';
            self.questStage += 1;
            self.invincible = true;
            socket.emit('dialogueLine',{
                state:'ask',
                message:'I should talk to Fisherman.',
                response1:'...',
            });
            socket.emit('questObjective',{
                questName:self.quest,
                questObjective:'Talk to Fisherman.',
            });
            socket.emit('notification','You started the quest ' + self.questInfo.quest + '.');
        }
        if(self.currentResponse === 1 && self.questStage === 4 && self.quest === 'Clear River'){
            self.questStage += 1;
            socket.emit('dialogueLine',{
                state:'remove',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 6 && self.quest === 'Clear River'){
            self.questStage += 1;
            socket.emit('dialogueLine',{
                state:'remove',
            });
            socket.emit('questObjective',{
                questName:self.quest,
                questObjective:'Kill all of the Monsters in The River.',
            });
            self.currentResponse = 0;
        }
        if(self.questStage === 7 && self.quest === 'Clear River' && self.map === 'The River' && self.mapChange > 10){
            var allMonstersDefeated = true;
            for(var i in Monster.list){
                if(Monster.list[i].map === 'The River'){
                    allMonstersDefeated = false;
                }
            }
            if(allMonstersDefeated){
                self.questStage += 1;
            }
        }
        if(self.questStage === 8 && self.quest === 'Clear River'){
            self.questStage += 1;
            self.invincible = true;
            socket.emit('dialogueLine',{
                state:'ask',
                message:'I cleared all the Monsters in the map The River! Let me go tell Fisherman.',
                response1:'...',
            });
            socket.emit('questObjective',{
                questName:self.quest,
                questObjective:'Return to Fisherman.',
            });
        }
        if(self.currentResponse === 1 && self.questStage === 9 && self.quest === 'Clear River'){
            self.questStage += 1;
            socket.emit('dialogueLine',{
                state:'remove',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 11 && self.quest === 'Clear River'){
            if(self.questStats[self.quest]){
                self.xp += Math.round(questData[self.quest].xp * self.stats.xp / 10 * (Math.random() + 0.5));
                self.coins += Math.round(questData[self.quest].xp * self.stats.xp * (Math.random() + 0.5));
            }
            else{
                self.xp += Math.round(questData[self.quest].xp * self.stats.xp * (Math.random() + 0.5));
                self.coins += Math.round(questData[self.quest].xp * self.stats.xp * (Math.random() + 0.5));
            }
            socket.emit('notification','You completed the quest ' + self.quest + '.');
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
            socket.emit('dialogueLine',{
                state:'remove',
            });
            self.currentResponse = 0;
        }
        
        if(self.currentResponse === 1 && self.questStage === 1 && self.quest === 'Enchanter'){
            self.questStage += 1;
            self.invincible = true;
            socket.emit('dialogueLine',{
                state:'ask',
                message:'Okay, now select an item you want to enchant.',
                response1:'...',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 2 && self.questStage === 1 && self.quest === 'Enchanter'){
            self.quest = false;
            self.invincible = false;
            socket.emit('dialogueLine',{
                state:'remove',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 2 && self.quest === 'Enchanter'){
            self.questStage += 1;
            self.invincible = false;
            socket.emit('dialogueLine',{
                state:'remove',
            });
            socket.emit('showInventory');
            socket.emit('toggleSelect');
            self.currentResponse = 0;
        }
        if(self.selectedItem !== false && self.questStage === 3 && self.quest === 'Enchanter' && self.map === 'Town Hall'){
            self.questStage += 1;
            self.invincible = true;
            var item = Item.list[self.inventory.items[self.selectedItem].id];
            if(item.enchantments.length === 0){
                socket.emit('dialogueLine',{
                    state:'ask',
                    message:'This item has no possible enchants. Choose another item.',
                    response1:'...',
                });
                socket.emit('toggleSelect');
                self.selectedItem = false;
                self.questStage = 2;
                self.currentResponse = 0;
            }
            else{
                self.questInfo.enchant1 = {};
                self.questInfo.enchant2 = {};
                self.questInfo.enchant3 = {};
                self.questInfo.enchant4 = {};
                self.questInfo.enchant1.id = item.enchantments[Math.floor(Math.random() * item.enchantments.length)];
                self.questInfo.enchant2.id = item.enchantments[Math.floor(Math.random() * item.enchantments.length)];
                self.questInfo.enchant3.id = item.enchantments[Math.floor(Math.random() * item.enchantments.length)];
                self.questInfo.enchant4.id = item.enchantments[Math.floor(Math.random() * item.enchantments.length)];
                self.questInfo.enchant1.level = Math.min(Math.max(0.001,Math.round(Enchantment.list[self.questInfo.enchant1.id].averageLevel + (Math.random() * 2 - 1) * Enchantment.list[self.questInfo.enchant1.id].deviation * 1000) / 1000),Enchantment.list[self.questInfo.enchant1.id].maxLevel);
                self.questInfo.enchant2.level = Math.min(Math.max(0.001,Math.round(Enchantment.list[self.questInfo.enchant2.id].averageLevel + (Math.random() * 2 - 1) * Enchantment.list[self.questInfo.enchant2.id].deviation * 1000) / 1000),Enchantment.list[self.questInfo.enchant2.id].maxLevel);
                self.questInfo.enchant3.level = Math.min(Math.max(0.001,Math.round(Enchantment.list[self.questInfo.enchant3.id].averageLevel + (Math.random() * 2 - 1) * Enchantment.list[self.questInfo.enchant3.id].deviation * 1000) / 1000),Enchantment.list[self.questInfo.enchant3.id].maxLevel);
                self.questInfo.enchant4.level = Math.min(Math.max(0.001,Math.round(Enchantment.list[self.questInfo.enchant4.id].averageLevel + (Math.random() * 2 - 1) * Enchantment.list[self.questInfo.enchant4.id].deviation * 1000) / 1000),Enchantment.list[self.questInfo.enchant4.id].maxLevel);
                socket.emit('dialogueLine',{
                    state:'ask',
                    message:'Good, now choose an enchantment.',
                    response1:'+' + (Math.round(self.questInfo.enchant1.level * 1000) / 10) + '% ' + Enchantment.list[self.questInfo.enchant1.id].name,
                    response2:'+' + (Math.round(self.questInfo.enchant2.level * 1000) / 10) + '% ' + Enchantment.list[self.questInfo.enchant2.id].name,
                    response3:'+' + (Math.round(self.questInfo.enchant3.level * 1000) / 10) + '% ' + Enchantment.list[self.questInfo.enchant3.id].name,
                    response4:'+' + (Math.round(self.questInfo.enchant4.level * 1000) / 10) + '% ' + Enchantment.list[self.questInfo.enchant4.id].name,
                });
                socket.emit('toggleSelect');
                self.currentResponse = 0;
            }
        }
        if(self.currentResponse === 1 && self.questStage === 4 && self.quest === 'Enchanter'){
            self.questStage += 1;
            self.invincible = true;
            socket.emit('dialogueLine',{
                state:'ask',
                message:'And there you go! Your item now has +' + (Math.round(self.questInfo.enchant1.level * 1000) / 10) + '% ' + Enchantment.list[self.questInfo.enchant1.id].name + ' !',
                response1:'Thank you.',
            });
            self.inventory.enchantItem(self.selectedItem,self.questInfo.enchant1.id,self.questInfo.enchant1.level);
            self.inventory.refreshAllItems();
            self.selectedItem = false;
            self.currentResponse = 0;
        }
        if(self.currentResponse === 2 && self.questStage === 4 && self.quest === 'Enchanter'){
            self.questStage += 1;
            self.invincible = true;
            socket.emit('dialogueLine',{
                state:'ask',
                message:'And there you go! Your item now has +' + (Math.round(self.questInfo.enchant2.level * 1000) / 10) + '% ' + Enchantment.list[self.questInfo.enchant2.id].name + ' !',
                response1:'Thank you.',
            });
            self.inventory.enchantItem(self.selectedItem,self.questInfo.enchant2.id,self.questInfo.enchant2.level);
            self.inventory.refreshAllItems();
            self.selectedItem = false;
            self.currentResponse = 0;
        }
        if(self.currentResponse === 3 && self.questStage === 4 && self.quest === 'Enchanter'){
            self.questStage += 1;
            self.invincible = true;
            socket.emit('dialogueLine',{
                state:'ask',
                message:'And there you go! Your item now has +' + (Math.round(self.questInfo.enchant3.level * 1000) / 10) + '% ' + Enchantment.list[self.questInfo.enchant3.id].name + ' !',
                response1:'Thank you.',
            });
            self.inventory.enchantItem(self.selectedItem,self.questInfo.enchant3.id,self.questInfo.enchant3.level);
            self.inventory.refreshAllItems();
            self.selectedItem = false;
            self.currentResponse = 0;
        }
        if(self.currentResponse === 4 && self.questStage === 4 && self.quest === 'Enchanter'){
            self.questStage += 1;
            self.invincible = true;
            socket.emit('dialogueLine',{
                state:'ask',
                message:'And there you go! Your item now has +' + (Math.round(self.questInfo.enchant4.level * 1000) / 10) + '% ' + Enchantment.list[self.questInfo.enchant4.id].name + ' !',
                response1:'Thank you.',
            });
            self.inventory.enchantItem(self.selectedItem,self.questInfo.enchant4.id,self.questInfo.enchant4.level);
            self.inventory.refreshAllItems();
            self.selectedItem = false;
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 5 && self.quest === 'Enchanter'){
            self.quest = false;
            self.invincible = false;
            socket.emit('dialogueLine',{
                state:'remove',
            });
            self.currentResponse = 0;
        }

        if(self.selectedItem !== false && self.questStage === 1 && self.quest === 'Enchant'){
            self.questStage += 1;
            var item = Item.list[self.inventory.items[self.selectedItem].id];
            var book = self.questInfo.item;
            var canEnchant = false;
            for(var i in book.enchantments){
                for(var j in item.enchantments){
                    if(book.enchantments[i].id === item.enchantments[j]){
                        canEnchant = true;
                    }
                }
            }
            if(item.enchantments.length === 0 || canEnchant === false){
                self.invincible = true;
                socket.emit('dialogueLine',{
                    state:'ask',
                    message:'I can\'t enchant this item...',
                    response1:'...',
                });
                self.selectedItem = false;
                self.questStage = 2;
                self.currentResponse = 0;
            }
            else{
                for(var i in book.enchantments){
                    for(var j in item.enchantments){
                        if(book.enchantments[i].id === item.enchantments[j]){
                            self.inventory.enchantItem(self.selectedItem,book.enchantments[i].id,book.enchantments[i].level);
                        }
                    }
                }
                self.inventory.refreshAllItems();
                socket.emit('toggleSelect');
                socket.emit('showInventory');
                self.quest = false;
                socket.emit('dialogueLine',{
                    state:'remove',
                });
                self.selectedItem = false;
                self.currentResponse = 0;
            }
        }
        if(self.currentResponse === 1 && self.questStage === 2 && self.quest === 'Enchant'){
            self.questStage = 1;
            self.invincible = false;
            socket.emit('dialogueLine',{
                state:'remove',
            });
            socket.emit('showInventory');
            self.currentResponse = 0;
        }

        if(self.currentResponse === 1 && self.questStage === 1 && self.questInfo.quest === 'Clear Tower'){
            self.invincible = false;
            self.questInfo = {
                quest:false,
            };
            socket.emit('dialogueLine',{
                state:'remove',
            });
            self.currentResponse = 0;
        }
        if(self.questInfo.started === true && self.questStage === 2 && self.questInfo.quest === 'Clear Tower'){
            self.quest = 'Clear Tower';
            self.questStage += 1;
            self.invincible = true;
            socket.emit('dialogueLine',{
                state:'ask',
                message:'I should talk to Joe.',
                response1:'...',
            });
            socket.emit('questObjective',{
                questName:self.quest,
                questObjective:'Talk to Joe.',
            });
            socket.emit('notification','You started the quest ' + self.questInfo.quest + '.');
        }
        if(self.currentResponse === 1 && self.questStage === 3 && self.quest === 'Clear Tower'){
            self.questStage += 1;
            self.invincible = false;
            socket.emit('dialogueLine',{
                state:'remove',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 5 && self.quest === 'Clear Tower'){
            self.questStage += 1;
            self.invincible = false;
            socket.emit('dialogueLine',{
                state:'remove',
            });
            socket.emit('questObjective',{
                questName:self.quest,
                questObjective:'Find the Weird Tower.',
            });
            self.currentResponse = 0;
        }
        if(self.questStage === 6 && self.quest === 'Clear Tower' && self.mapChange > 10){
            for(var i in QuestInfo.list){
                if(QuestInfo.list[i].quest === 'Clear Tower' && QuestInfo.list[i].info === 'activator' && self.isColliding(QuestInfo.list[i])){
                    self.questStage = 7;
                    self.questInfo.monstersKilled = 0;
                    self.questInfo.maxMonsters = 0;
                }
            }
        }
        if(self.questStage === 7 && self.quest === 'Clear Tower' && self.mapChange > 10){
            for(var i in QuestInfo.list){
                if(QuestInfo.list[i].quest === 'Clear Tower' && QuestInfo.list[i].info === 'spawner'){
                    self.spawnQuestMonster(i,QuestInfo.list[i].x,QuestInfo.list[i].y,QuestInfo.list[i].map,'snowBall');
                }
                if(QuestInfo.list[i].quest === 'Clear Tower' && QuestInfo.list[i].info === 'spawner2'){
                    self.spawnQuestMonster(i,QuestInfo.list[i].x,QuestInfo.list[i].y,QuestInfo.list[i].map,'redBird');
                }
            }
            for(var i in QuestInfo.list){
                if(QuestInfo.list[i].quest === 'Clear Tower' && QuestInfo.list[i].info === 'collision'){
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
                    for(var j in Player.list){
                        if(Player.list[j].map === self.map && Player.list[j].isColliding(self.questDependent[i])){
                            Player.list[j].teleport(ENV.Spawnpoint.x,ENV.Spawnpoint.y,ENV.Spawnpoint.map);
                        }
                    }
                }
            }
            socket.emit('questObjective',{
                questName:self.quest,
                questObjective:'Kill the Monsters!',
            });
            self.questStage += 1;
        }
        if(self.questStage === 8 && self.quest === 'Clear Tower' && self.questInfo.monstersKilled === self.questInfo.maxMonsters){
            self.questStage += 1;
            self.invincible = true;
            socket.emit('dialogueLine',{
                state:'ask',
                message:'I killed the monsters, now I should talk back to Joe.',
                response1:'...',
            });
            socket.emit('questObjective',{
                questName:self.quest,
                questObjective:'Return to Joe.',
            });
        }
        if(self.currentResponse === 1 && self.questStage === 9 && self.quest === 'Clear Tower'){
            self.questStage += 1;
            self.invincible = false;
            socket.emit('dialogueLine',{
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
                if(self.questDependent[i].type === 'Collision'){
                    self.questDependent[i].toRemove = true;
                    Collision.list[self.questDependent[i].map][Math.round(self.questDependent[i].x / 64)][Math.round(self.questDependent[i].y / 64)] = 0;
                }
            }
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 11 && self.quest === 'Clear Tower'){
            self.questStage += 1;
            self.invincible = true;
            socket.emit('dialogueLine',{
                state:'ask',
                message:'The rumors were true? Here, have a reward!',
                response1:'*End conversation*',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 2 && self.questStage === 11 && self.quest === 'Clear Tower'){
            self.questStage += 2;
            self.invincible = true;
            socket.emit('dialogueLine',{
                state:'ask',
                message:'The rumors weren\'t true? I was going to give you a reward if they were true.',
                response1:'*End conversation*',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 12 && self.quest === 'Clear Tower'){
            if(self.questStats[self.quest]){
                self.xp += Math.round(questData[self.quest].xp * self.stats.xp / 10 * (Math.random() + 0.5));
                self.coins += Math.round(questData[self.quest].xp * self.stats.xp * (Math.random() + 0.5));
            }
            else{
                self.xp += Math.round(questData[self.quest].xp * self.stats.xp * (Math.random() + 0.5));
                self.coins += Math.round(questData[self.quest].xp * self.stats.xp * (Math.random() + 0.5));
            }
            socket.emit('notification','You completed the quest ' + self.quest + '.');
            var steelObtained = Math.round(15 + Math.random() * 10);
            socket.emit('notification','You obtained ' + steelObtained + ' steel.');
            self.inventory.materials.steel += steelObtained;
            self.inventory.refreshMaterial();
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
            socket.emit('dialogueLine',{
                state:'remove',
            });
            socket.emit('questObjective',{
                questName:'',
                questObjective:'',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 13 && self.quest === 'Clear Tower'){
            self.quest = false;
            self.questInfo = {
                quest:false,
            };
            for(var i in self.questDependent){
                self.questDependent[i].toRemove = true;
            }
            self.invincible = false;
            socket.emit('dialogueLine',{
                state:'remove',
            });
            self.currentResponse = 0;
        }


        if(self.currentResponse === 1 && self.questStage === 1 && self.questInfo.quest === 'Lightning Lizard Boss'){
            self.invincible = false;
            self.questInfo = {
                quest:false,
            };
            socket.emit('dialogueLine',{
                state:'remove',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 2 && self.questInfo.quest === 'Lightning Lizard Boss'){
            self.questInfo.started = false;
            self.questStage += 1;
            self.invincible = false;
            socket.emit('dialogueLine',{
                state:'remove',
            });
            socket.emit('questInfo',{
                questName:self.questInfo.quest,
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 2 && self.questStage === 2 && self.questInfo.quest === 'Lightning Lizard Boss'){
            self.invincible = false;
            self.questInfo = {
                quest:false,
            };
            socket.emit('dialogueLine',{
                state:'remove',
            });
            self.currentResponse = 0;
        }
        if(self.questInfo.started === true && self.questStage === 3 && self.questInfo.quest === 'Lightning Lizard Boss'){
            self.quest = 'Lightning Lizard Boss';
            self.questStage += 1;
            self.invincible = true;
            socket.emit('dialogueLine',{
                state:'ask',
                message:'I should talk to Hunter.',
                response1:'...',
            });
            socket.emit('questObjective',{
                questName:self.quest,
                questObjective:'Talk to Hunter.',
            });
            socket.emit('notification','You started the quest ' + self.questInfo.quest + '.');
        }
        if(self.currentResponse === 1 && self.questStage === 4 && self.quest === 'Lightning Lizard Boss'){
            self.questStage += 1;
            self.invincible = false;
            socket.emit('dialogueLine',{
                state:'remove',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 6 && self.quest === 'Lightning Lizard Boss'){
            self.questStage += 1;
            self.invincible = false;
            socket.emit('dialogueLine',{
                state:'remove',
            });
            self.currentResponse = 0;
        }
        if(self.questStage === 7 && self.quest === 'Lightning Lizard Boss' && self.mapChange > 10){
            for(var i in QuestInfo.list){
                if(QuestInfo.list[i].quest === 'Lightning Lizard Boss' && QuestInfo.list[i].info === 'activator' && self.isColliding(QuestInfo.list[i])){
                    self.questStage = 8;
                    self.questInfo.monstersKilled = 0;
                    self.questInfo.maxMonsters = 0;
                }
            }
        }
        if(self.questStage === 8 && self.quest === 'Lightning Lizard Boss' && self.mapChange > 10){
            for(var i in QuestInfo.list){
                if(QuestInfo.list[i].quest === 'Lightning Lizard Boss' && QuestInfo.list[i].info === 'spawner'){
                    self.spawnQuestMonster(i,QuestInfo.list[i].x,QuestInfo.list[i].y,QuestInfo.list[i].map,'lightningLizard');
                }
            }
            for(var i in QuestInfo.list){
                if(QuestInfo.list[i].quest === 'Lightning Lizard Boss' && QuestInfo.list[i].info === 'collision'){
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
                            Player.list[j].teleport(ENV.Spawnpoint.x,ENV.Spawnpoint.y,ENV.Spawnpoint.map);
                        }
                    }
                }
            }
            socket.emit('questObjective',{
                questName:self.quest,
                questObjective:'Kill the Lightning Lizard.',
            });
            self.questStage += 1;
        }
        if(self.questStage === 9 && self.quest === 'Lightning Lizard Boss'){
            self.questStage += 1;
            self.invincible = true;
            socket.emit('dialogueLine',{
                state:'ask',
                message:'Who dares come in here? I will kill you!',
                response1:'*End conversation*',
            });
        }
        if(self.questStage === 10 && self.quest === 'Lightning Lizard Boss' && self.currentResponse === 1){
            self.questStage += 1;
            self.invincible = false;
            socket.emit('dialogueLine',{
                state:'remove',
            });
            self.currentResponse = 0;
            for(var i in QuestInfo.list){
                if(QuestInfo.list[i].quest === 'Lightning Lizard Boss' && QuestInfo.list[i].info === 'spawner2'){
                    self.spawnQuestMonster(i,QuestInfo.list[i].x,QuestInfo.list[i].y,QuestInfo.list[i].map,'greenLizard');
                }
            }
        }
        if(self.questStage === 11 && self.quest === 'Lightning Lizard Boss' && self.questInfo.monstersKilled === self.questInfo.maxMonsters){
            self.questStage += 1;
            self.invincible = true;
            socket.emit('dialogueLine',{
                state:'ask',
                message:'Woo! Lightning Lizard is dead! Let me go tell Hunter!',
                response1:'...',
            });
            socket.emit('questObjective',{
                questName:self.quest,
                questObjective:'Return to Hunter.',
            });
        }
        if(self.currentResponse === 1 && self.questStage === 12 && self.quest === 'Lightning Lizard Boss'){
            self.questStage += 1;
            self.invincible = false;
            socket.emit('dialogueLine',{
                state:'remove',
            });
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
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 14 && self.quest === 'Lightning Lizard Boss'){
            self.questStage += 1;
            self.invincible = true;
            socket.emit('dialogueLine',{
                state:'ask',
                message:'Here is your reward!',
                response1:'*End conversation*',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 15 && self.quest === 'Lightning Lizard Boss'){
            if(self.questStats[self.quest]){
                self.xp += Math.round(questData[self.quest].xp * self.stats.xp / 10 * (Math.random() + 0.5));
                self.coins += Math.round(questData[self.quest].xp * self.stats.xp * (Math.random() + 0.5));
            }
            else{
                self.xp += Math.round(questData[self.quest].xp * self.stats.xp * (Math.random() + 0.5));
                self.coins += Math.round(questData[self.quest].xp * self.stats.xp * (Math.random() + 0.5));
            }
            socket.emit('notification','You completed the quest ' + self.quest + '.');
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
            socket.emit('dialogueLine',{
                state:'remove',
            });
            socket.emit('questObjective',{
                questName:'',
                questObjective:'',
            });
            self.currentResponse = 0;
        }

        if(self.currentResponse === 1 && self.questStage === 1 && self.questInfo.quest === 'Wood Delivery'){
            self.questInfo.started = false;
            self.questStage += 1;
            self.invincible = false;
            socket.emit('dialogueLine',{
                state:'remove',
            });
            socket.emit('questInfo',{
                questName:self.questInfo.quest,
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 2 && self.questStage === 1 && self.questInfo.quest === 'Wood Delivery'){
            self.invincible = false;
            self.questInfo = {
                quest:false,
            };
            for(var i in self.questDependent){
                self.questDependent[i].toRemove = true;
            }
            socket.emit('dialogueLine',{
                state:'remove',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 3 && self.questStage === 1 && self.questInfo.quest === 'Wood Delivery'){
            self.invincible = false;
            self.questInfo = {
                quest:false,
            };
            for(var i in self.questDependent){
                self.questDependent[i].toRemove = true;
            }
            socket.emit('dialogueLine',{
                state:'remove',
            });
            for(var i in Npc.list){
                if(Npc.list[i].entityId === 'bob'){
                    self.inventory.shopItems = {items:Npc.list[i].shop,prices:Npc.list[i].shopPrices};
                    socket.emit('openShop',{name:Npc.list[i].name,quote:Npc.list[i].quote,inventory:{items:Npc.list[i].shop,prices:Npc.list[i].shopPrices}});
                }
            }
            self.currentResponse = 0;
        }
        if(self.questInfo.started === true && self.questStage === 2 && self.questInfo.quest === 'Wood Delivery'){
            self.quest = 'Wood Delivery'
            self.questStage += 1;
            self.invincible = true;
            socket.emit('dialogueLine',{
                state:'ask',
                message:'I should talk to Bob.',
                response1:'...',
            });
            socket.emit('questObjective',{
                questName:self.quest,
                questObjective:'Talk to Bob.',
            });
            socket.emit('notification','You started the quest ' + self.questInfo.quest + '.');
        }
        if(self.currentResponse === 1 && self.questStage === 3 && self.quest === 'Wood Delivery'){
            self.questStage += 1;
            self.invincible = false;
            socket.emit('dialogueLine',{
                state:'remove',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 5 && self.quest === 'Wood Delivery'){
            self.questStage += 1;
            self.invincible = false;
            socket.emit('dialogueLine',{
                state:'remove',
            });
            socket.emit('questObjective',{
                questName:self.quest,
                questObjective:'Deliver the wood to Wally.',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 7 && self.quest === 'Wood Delivery'){
            self.questStage += 1;
            self.invincible = false;
            socket.emit('dialogueLine',{
                state:'remove',
            });
            socket.emit('questObjective',{
                questName:self.quest,
                questObjective:'Return to Bob.',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 9 && self.quest === 'Wood Delivery'){
            if(self.questStats[self.quest]){
                self.xp += Math.round(questData[self.quest].xp * self.stats.xp / 10 * (Math.random() + 0.5));
                self.coins += Math.round(questData[self.quest].xp * self.stats.xp * (Math.random() + 0.5));
            }
            else{
                self.xp += Math.round(questData[self.quest].xp * self.stats.xp * (Math.random() + 0.5));
                self.coins += Math.round(questData[self.quest].xp * self.stats.xp * (Math.random() + 0.5));
            }
            socket.emit('notification','You completed the quest ' + self.quest + '.');
            addToChat('style="color: ' + self.textColor + '">',self.displayName + " completed the quest " + self.quest + ".");
            var woodObtained = Math.round(35 + Math.random() * 10);
            socket.emit('notification','You obtained ' + woodObtained + ' wood.');
            self.inventory.materials.wood += woodObtained;
            self.inventory.refreshMaterial();
            self.questStats[self.quest] = true;
            self.quest = false;
            self.questInfo = {
                quest:false,
            };
            for(var i in self.questDependent){
                self.questDependent[i].toRemove = true;
            }
            self.invincible = false;
            socket.emit('dialogueLine',{
                state:'remove',
            });
            socket.emit('questObjective',{
                questName:'',
                questObjective:'',
            });
            self.currentResponse = 0;
        }

        if(self.currentResponse === 1 && self.questStage === 1 && self.questInfo.quest === 'Blacksmith'){
            self.invincible = false;
            self.questInfo = {
                quest:false,
            };
            socket.emit('dialogueLine',{
                state:'remove',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 2 && self.questInfo.quest === 'Blacksmith'){
            self.invincible = false;
            self.questInfo = {
                quest:false,
            };
            socket.emit('dialogueLine',{
                state:'remove',
            });
            self.currentResponse = 0;
            for(var i in Npc.list){
                if(Npc.list[i].entityId === 'wally'){
                    self.inventory.shopItems = {items:Npc.list[i].shop,prices:Npc.list[i].shopPrices};
                    socket.emit('openShop',{name:Npc.list[i].name,quote:Npc.list[i].quote,inventory:{items:Npc.list[i].shop,prices:Npc.list[i].shopPrices}});
                }
            }
        }
        if(self.currentResponse === 2 && self.questStage === 2 && self.questInfo.quest === 'Blacksmith'){
            self.invincible = false;
            self.questInfo = {
                quest:false,
            };
            socket.emit('dialogueLine',{
                state:'remove',
            });
            self.currentResponse = 0;
        }

        if(self.currentResponse === 1 && self.questStage === 1 && self.questInfo.quest === 'Lost Rubies'){
            self.invincible = false;
            self.questInfo = {
                quest:false,
            };
            socket.emit('dialogueLine',{
                state:'remove',
            });
            self.currentResponse = 0;
        }
        if(self.questInfo.started === true && self.questStage === 2 && self.questInfo.quest === 'Lost Rubies'){
            self.quest = 'Lost Rubies';
            self.questStage += 1;
            self.invincible = true;
            socket.emit('dialogueLine',{
                state:'ask',
                message:'I should talk to Sally.',
                response1:'...',
            });
            socket.emit('questObjective',{
                questName:self.quest,
                questObjective:'Talk to Sally.',
            });
            socket.emit('notification','You started the quest ' + self.questInfo.quest + '.');
        }
        if(self.currentResponse === 1 && self.questStage === 3 && self.quest === 'Lost Rubies'){
            self.questStage += 1;
            self.invincible = false;
            socket.emit('dialogueLine',{
                state:'remove',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 5 && self.quest === 'Lost Rubies'){
            self.questStage += 1;
            self.invincible = false;
            socket.emit('dialogueLine',{
                state:'remove',
            });
            socket.emit('questObjective',{
                questName:self.quest,
                questObjective:'Find Sally\'s rubies.',
            });
            self.currentResponse = 0;
        }
        if(self.questStage === 6 && self.quest === 'Lost Rubies' && self.mapChange > 10){
            for(var i in QuestInfo.list){
                if(QuestInfo.list[i].quest === 'Lost Rubies' && QuestInfo.list[i].info === 'activator' && self.isColliding(QuestInfo.list[i])){
                    self.questStage = 7;
                }
            }
        }
        if(self.questStage === 7 && self.quest === 'Lost Rubies'){
            self.questStage += 1;
            self.invincible = true;
            socket.emit('dialogueLine',{
                state:'ask',
                message:'I found the rubies, I should return them to Sally.',
                response1:'...',
            });
        }
        if(self.currentResponse === 1 && self.questStage === 8 && self.quest === 'Lost Rubies'){
            self.questStage += 1;
            self.invincible = false;
            socket.emit('dialogueLine',{
                state:'remove',
            });
            socket.emit('questObjective',{
                questName:self.quest,
                questObjective:'Return to Sally.',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 10 && self.quest === 'Lost Rubies'){
            self.questStage += 1;
            self.invincible = true;
            socket.emit('dialogueLine',{
                state:'ask',
                message:'You got the rubies? Here, let me give you a reward.',
                response1:'*End conversation*',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 11 && self.quest === 'Lost Rubies'){
            if(self.questStats[self.quest]){
                self.xp += Math.round(questData[self.quest].xp * self.stats.xp / 10 * (Math.random() + 0.5));
                self.coins += Math.round(questData[self.quest].xp * self.stats.xp * (Math.random() + 0.5));
            }
            else{
                self.xp += Math.round(questData[self.quest].xp * self.stats.xp * (Math.random() + 0.5));
                self.coins += Math.round(questData[self.quest].xp * self.stats.xp * (Math.random() + 0.5));
            }
            socket.emit('notification','You completed the quest ' + self.quest + '.');
            addToChat('style="color: ' + self.textColor + '">',self.displayName + " completed the quest " + self.quest + ".");
            var rubiesObtained = Math.round(10 + Math.random() * 10);
            socket.emit('notification','You obtained ' + rubiesObtained + ' rubies.');
            self.inventory.materials.ruby += rubiesObtained;
            self.inventory.refreshMaterial();
            self.questStats[self.quest] = true;
            self.quest = false;
            self.questInfo = {
                quest:false,
            };
            for(var i in self.questDependent){
                self.questDependent[i].toRemove = true;
            }
            self.invincible = false;
            socket.emit('dialogueLine',{
                state:'remove',
            });
            socket.emit('questObjective',{
                questName:'',
                questObjective:'',
            });
            self.currentResponse = 0;
        }
        
        if(self.currentResponse === 1 && self.questStage === 1 && self.questInfo.quest === 'Broken Piano'){
            self.invincible = false;
            self.questInfo = {
                quest:false,
            };
            socket.emit('dialogueLine',{
                state:'remove',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 2 && self.questInfo.quest === 'Broken Piano'){
            self.questStage += 1;
            self.invincible = true;
            socket.emit('dialogueLine',{
                state:'ask',
                message:'*Insert TianmuGuarder piano playing noises*',
                response1:'Umm.. That sounds kind of bad.',
                response2:'That sounds great!',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 2 && self.questStage === 2 && self.questInfo.quest === 'Broken Piano'){
            self.invincible = false;
            self.questInfo = {
                quest:false,
            };
            socket.emit('dialogueLine',{
                state:'remove',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 3 && self.questInfo.quest === 'Broken Piano'){
            self.questStage += 2;
            self.invincible = true;
            socket.emit('dialogueLine',{
                state:'ask',
                message:'Yeah, because my piano broke.',
                response1:'I can help you fix your piano.',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 2 && self.questStage === 3 && self.questInfo.quest === 'Broken Piano'){
            self.questStage += 1;
            self.invincible = true;
            socket.emit('dialogueLine',{
                state:'ask',
                message:'Thank you for that compliment!',
                response1:'*End conversation*',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 4 && self.questInfo.quest === 'Broken Piano'){
            self.invincible = false;
            self.questInfo = {
                quest:false,
            };
            socket.emit('dialogueLine',{
                state:'remove',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 5 && self.questInfo.quest === 'Broken Piano'){
            self.questInfo.started = false;
            self.questStage += 1;
            self.invincible = false;
            socket.emit('dialogueLine',{
                state:'remove',
            });
            socket.emit('questInfo',{
                questName:self.questInfo.quest,
            });
            self.currentResponse = 0;
        }
        if(self.questInfo.started === true && self.questStage === 6 && self.questInfo.quest === 'Broken Piano'){
            self.quest = 'Broken Piano';
            self.questStage += 1;
            self.invincible = true;
            socket.emit('dialogueLine',{
                state:'ask',
                message:'I should talk to Mia.',
                response1:'...',
            });
            socket.emit('questObjective',{
                questName:self.quest,
                questObjective:'Talk to Mia.',
            });
            socket.emit('notification','You started the quest ' + self.questInfo.quest + '.');
        }
        if(self.currentResponse === 1 && self.questStage === 7 && self.quest === 'Broken Piano'){
            self.questStage += 1;
            self.invincible = false;
            socket.emit('dialogueLine',{
                state:'remove',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 9 && self.quest === 'Broken Piano'){
            self.questStage += 1;
            self.invincible = false;
            socket.emit('dialogueLine',{
                state:'remove',
            });
            socket.emit('questObjective',{
                questName:self.quest,
                questObjective:'Talk to Wally to get Piano Parts.',
            });
            self.currentResponse = 0;
        }
        if(self.questStage === 10 && self.quest === 'Broken Piano' && self.mapChange > 10){
            for(var i in QuestInfo.list){
                if(QuestInfo.list[i].quest === 'Broken Piano' && QuestInfo.list[i].info === 'activator' && self.isColliding(QuestInfo.list[i])){
                    self.questStage = 11;
                }
            }
        }
        if(self.currentResponse === 1 && self.questStage === 11 && self.quest === 'Broken Piano'){
            setTimeout(function(){
                self.questStage += 1;
            },1000);
            self.invincible = false;
            socket.emit('dialogueLine',{
                state:'remove',
            });
            self.currentResponse = 0;
        }
        if(self.questStage === 12 && self.quest === 'Broken Piano'){
            self.questStage += 1;
            self.invincible = true;
            socket.emit('dialogueLine',{
                state:'ask',
                message:'Nice! I got one Piano Part!',
                response1:'...',
            });
            socket.emit('notification','1 / 5 Piano Parts');
        }
        if(self.currentResponse === 1 && self.questStage === 13 && self.quest === 'Broken Piano'){
            self.questStage += 1;
            self.invincible = false;
            socket.emit('dialogueLine',{
                state:'remove',
            });
            socket.emit('questObjective',{
                questName:self.quest,
                questObjective:'Find the other 4 Piano Parts.',
            });
            self.currentResponse = 0;
            self.questInfo.pianoParts = 1;
            self.questInfo.activators = {
                'activator1':false,
                'activator2':false,
                'activator3':false,
                'activator4':false,
            }
        }
        if(self.questStage === 14 && self.quest === 'Broken Piano' && self.mapChange > 10){
            var pianoPartGained = false;
            for(var i in QuestInfo.list){
                if(QuestInfo.list[i].quest === 'Broken Piano' && self.isColliding(QuestInfo.list[i])){
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
                socket.emit('notification','' + self.questInfo.pianoParts + ' / 5 Piano Parts');
                socket.emit('questObjective',{
                    questName:self.quest,
                    questObjective:'Find the other ' + (5 - self.questInfo.pianoParts) + ' Piano Parts.',
                });
                if(self.questInfo.pianoParts === 4){
                    socket.emit('questObjective',{
                        questName:self.quest,
                        questObjective:'Find the last Piano Part.',
                    });
                }
                if(self.questInfo.pianoParts === 5){
                    self.questStage = 15;
                }
            }
        }
        if(self.questStage === 15 && self.quest === 'Broken Piano'){
            self.questStage += 1;
            self.invincible = true;
            socket.emit('dialogueLine',{
                state:'ask',
                message:'I got all the Piano Parts. Time to return them to Mia.',
                response1:'*End conversation*',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 16 && self.quest === 'Broken Piano'){
            self.questStage += 1;
            self.invincible = false;
            socket.emit('dialogueLine',{
                state:'remove',
            });
            socket.emit('questObjective',{
                questName:self.quest,
                questObjective:'Return to Mia.',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 18 && self.quest === 'Broken Piano'){
            if(self.questStats[self.quest]){
                self.xp += Math.round(questData[self.quest].xp * self.stats.xp / 10 * (Math.random() + 0.5));
                self.coins += Math.round(questData[self.quest].xp * self.stats.xp * (Math.random() + 0.5));
            }
            else{
                self.xp += Math.round(questData[self.quest].xp * self.stats.xp * (Math.random() + 0.5));
                self.coins += Math.round(questData[self.quest].xp * self.stats.xp * (Math.random() + 0.5));
            }
            socket.emit('notification','You completed the quest ' + self.quest + '.');
            addToChat('style="color: ' + self.textColor + '">',self.displayName + " completed the quest " + self.quest + ".");
            var goldObtained = Math.round(15 + Math.random() * 10);
            socket.emit('notification','You obtained ' + goldObtained + ' gold.');
            self.inventory.materials.gold += goldObtained;
            self.inventory.refreshMaterial();
            self.questStats[self.quest] = true;
            self.quest = false;
            self.questInfo = {
                quest:false,
            };
            for(var i in self.questDependent){
                self.questDependent[i].toRemove = true;
            }
            self.invincible = false;
            socket.emit('dialogueLine',{
                state:'remove',
            });
            socket.emit('questObjective',{
                questName:'',
                questObjective:'',
            });
            self.currentResponse = 0;
        }

        if(self.currentResponse === 1 && self.questStage === 1 && self.questInfo.quest === 'Pet Training'){
            self.invincible = false;
            self.questInfo = {
                quest:false,
            };
            socket.emit('dialogueLine',{
                state:'remove',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 2 && self.questInfo.quest === 'Pet Training'){
            self.questStage += 2;
            self.invincible = true;
            socket.emit('dialogueLine',{
                state:'ask',
                message:'Do you want to change your pet?',
                response1:'What can I change my pet into?',
                response2:'No.',
                response3:'No, can I train my pet instead?',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 2 && self.questStage === 2 && self.questInfo.quest === 'Pet Training'){
            self.questStage += 1;
            self.invincible = true;
            socket.emit('dialogueLine',{
                state:'ask',
                message:'You don\'t like pets?',
                response1:'*End conversation*',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 3 && self.questInfo.quest === 'Pet Training'){
            self.invincible = false;
            self.questInfo = {
                quest:false,
            };
            socket.emit('dialogueLine',{
                state:'remove',
            });
            self.currentResponse = 0;
            s.smite(self.username);
        }
        if(self.currentResponse === 1 && self.questStage === 4 && self.questInfo.quest === 'Pet Training'){
            self.questStage += 1;
            self.invincible = true;
            if(self.petType === 'kiol' && self.questStats['Cherrier'] === false && self.questStats['Sphere'] === false && self.questStats['Thunderbird'] === false){
                socket.emit('dialogueLine',{
                    state:'ask',
                    message:'Your current pet is a Kiol. Please choose a pet to change it into.',
                    response1:'Change it into a Cherrier for 25 Rubies.',
                    response2:'Change it into a Sphere for 200 Rubies.',
                    response3:'Change it into a Thunderbird for 500 Rubies.',
                    response4:'Keep my Kiol.',
                });
            }
            else if(self.petType === 'kiol' && self.questStats['Cherrier'] === true && self.questStats['Sphere'] === false && self.questStats['Thunderbird'] === false){
                socket.emit('dialogueLine',{
                    state:'ask',
                    message:'Your current pet is a Kiol. Please choose a pet to change it into.',
                    response1:'Change it into a Cherrier for free.',
                    response2:'Change it into a Sphere for 200 Rubies.',
                    response3:'Change it into a Thunderbird for 500 Rubies.',
                    response4:'Keep my Kiol.',
                });
            }
            else if(self.petType === 'kiol' && self.questStats['Cherrier'] === true && self.questStats['Sphere'] === true && self.questStats['Thunderbird'] === false){
                socket.emit('dialogueLine',{
                    state:'ask',
                    message:'Your current pet is a Kiol. Please choose a pet to change it into.',
                    response1:'Change it into a Cherrier for free.',
                    response2:'Change it into a Sphere for free.',
                    response3:'Change it into a Thunderbird for 500 Rubies.',
                    response4:'Keep my Kiol.',
                });
            }
            else if(self.petType === 'kiol' && self.questStats['Cherrier'] === true && self.questStats['Sphere'] === true && self.questStats['Thunderbird'] === true){
                socket.emit('dialogueLine',{
                    state:'ask',
                    message:'Your current pet is a Kiol. Please choose a pet to change it into.',
                    response1:'Change it into a Cherrier for free.',
                    response2:'Change it into a Sphere for free.',
                    response3:'Change it into a Thunderbird for free.',
                    response4:'Keep my Kiol.',
                });
            }
            else if(self.petType === 'kiol' && self.questStats['Cherrier'] === false && self.questStats['Sphere'] === true && self.questStats['Thunderbird'] === false){
                socket.emit('dialogueLine',{
                    state:'ask',
                    message:'Your current pet is a Kiol. Please choose a pet to change it into.',
                    response1:'Change it into a Cherrier for 25 Rubies.',
                    response2:'Change it into a Sphere for free.',
                    response3:'Change it into a Thunderbird for 500 Rubies.',
                    response4:'Keep my Kiol.',
                });
            }
            else if(self.petType === 'kiol' && self.questStats['Cherrier'] === false && self.questStats['Sphere'] === true && self.questStats['Thunderbird'] === true){
                socket.emit('dialogueLine',{
                    state:'ask',
                    message:'Your current pet is a Kiol. Please choose a pet to change it into.',
                    response1:'Change it into a Cherrier for 25 Rubies.',
                    response2:'Change it into a Sphere for free.',
                    response3:'Change it into a Thunderbird for free.',
                    response4:'Keep my Kiol.',
                });
            }
            else if(self.petType === 'kiol' && self.questStats['Cherrier'] === true && self.questStats['Sphere'] === false && self.questStats['Thunderbird'] === true){
                socket.emit('dialogueLine',{
                    state:'ask',
                    message:'Your current pet is a Kiol. Please choose a pet to change it into.',
                    response1:'Change it into a Cherrier for free.',
                    response2:'Change it into a Sphere for 200 Rubies.',
                    response3:'Change it into a Thunderbird for free.',
                    response4:'Keep my Kiol.',
                });
            }
            else if(self.petType === 'kiol' && self.questStats['Cherrier'] === false && self.questStats['Sphere'] === false && self.questStats['Thunderbird'] === true){
                socket.emit('dialogueLine',{
                    state:'ask',
                    message:'Your current pet is a Kiol. Please choose a pet to change it into.',
                    response1:'Change it into a Cherrier for 25 Rubies.',
                    response2:'Change it into a Sphere for 200 Rubies.',
                    response3:'Change it into a Thunderbird for free.',
                    response4:'Keep my Kiol.',
                });
            }
            else if(self.petType === 'cherrier' && self.questStats['Sphere'] === false && self.questStats['Thunderbird'] === false){
                socket.emit('dialogueLine',{
                    state:'ask',
                    message:'Your current pet is a Cherrier. Please choose a pet to change it into.',
                    response1:'Change it into a Kiol for free.',
                    response2:'Change it into a Sphere for 200 Rubies.',
                    response3:'Change it into a Thunderbird for 500 Rubies.',
                    response4:'Keep my Cherrier.',
                });
            }
            else if(self.petType === 'cherrier' && self.questStats['Sphere'] === true && self.questStats['Thunderbird'] === false){
                socket.emit('dialogueLine',{
                    state:'ask',
                    message:'Your current pet is a Cherrier. Please choose a pet to change it into.',
                    response1:'Change it into a Kiol for free.',
                    response2:'Change it into a Sphere for free.',
                    response3:'Change it into a Thunderbird for 500 Rubies.',
                    response4:'Keep my Cherrier.',
                });
            }
            else if(self.petType === 'cherrier' && self.questStats['Sphere'] === true && self.questStats['Thunderbird'] === true){
                socket.emit('dialogueLine',{
                    state:'ask',
                    message:'Your current pet is a Cherrier. Please choose a pet to change it into.',
                    response1:'Change it into a Kiol for free.',
                    response2:'Change it into a Sphere for free.',
                    response3:'Change it into a Thunderbird for free.',
                    response4:'Keep my Cherrier.',
                });
            }
            else if(self.petType === 'cherrier' && self.questStats['Sphere'] === false && self.questStats['Thunderbird'] === true){
                socket.emit('dialogueLine',{
                    state:'ask',
                    message:'Your current pet is a Cherrier. Please choose a pet to change it into.',
                    response1:'Change it into a Kiol for free.',
                    response2:'Change it into a Sphere for 200 Rubies.',
                    response3:'Change it into a Thunderbird for free.',
                    response4:'Keep my Cherrier.',
                });
            }
            else if(self.petType === 'sphere' && self.questStats['Cherrier'] === false && self.questStats['Thunderbird'] === false){
                socket.emit('dialogueLine',{
                    state:'ask',
                    message:'Your current pet is a Sphere. Please choose a pet to change it into.',
                    response1:'Change it into a Kiol for free.',
                    response2:'Change it into a Cherrier for 25 Rubies.',
                    response3:'Change it into a Thunderbird for 500 Rubies.',
                    response4:'Keep my Sphere.',
                });
            }
            else if(self.petType === 'sphere' && self.questStats['Cherrier'] === true && self.questStats['Thunderbird'] === false){
                socket.emit('dialogueLine',{
                    state:'ask',
                    message:'Your current pet is a Sphere. Please choose a pet to change it into.',
                    response1:'Change it into a Kiol for free.',
                    response2:'Change it into a Cherrier for free.',
                    response3:'Change it into a Thunderbird for 500 Rubies.',
                    response4:'Keep my Sphere.',
                });
            }
            else if(self.petType === 'sphere' && self.questStats['Cherrier'] === true && self.questStats['Thunderbird'] === true){
                socket.emit('dialogueLine',{
                    state:'ask',
                    message:'Your current pet is a Sphere. Please choose a pet to change it into.',
                    response1:'Change it into a Kiol for free.',
                    response2:'Change it into a Cherrier for free.',
                    response3:'Change it into a Thunderbird for free.',
                    response4:'Keep my Sphere.',
                });
            }
            else if(self.petType === 'sphere' && self.questStats['Cherrier'] === false && self.questStats['Thunderbird'] === true){
                socket.emit('dialogueLine',{
                    state:'ask',
                    message:'Your current pet is a Sphere. Please choose a pet to change it into.',
                    response1:'Change it into a Kiol for free.',
                    response2:'Change it into a Cherrier for 25 Rubies.',
                    response3:'Change it into a Thunderbird for free.',
                    response4:'Keep my Sphere.',
                });
            }
            else if(self.petType === 'thunderbird' && self.questStats['Cherrier'] === false && self.questStats['Sphere'] === false){
                socket.emit('dialogueLine',{
                    state:'ask',
                    message:'Your current pet is a Thunderbird. Please choose a pet to change it into.',
                    response1:'Change it into a Kiol for free.',
                    response2:'Change it into a Cherrier for 25 Rubies.',
                    response3:'Change it into a Sphere for 200 Rubies.',
                    response4:'Keep my Thunderbird.',
                });
            }
            else if(self.petType === 'thunderbird' && self.questStats['Cherrier'] === true && self.questStats['Sphere'] === false){
                socket.emit('dialogueLine',{
                    state:'ask',
                    message:'Your current pet is a Thunderbird. Please choose a pet to change it into.',
                    response1:'Change it into a Kiol for free.',
                    response2:'Change it into a Cherrier for free.',
                    response3:'Change it into a Sphere for 200 Rubies.',
                    response4:'Keep my Thunderbird.',
                });
            }
            else if(self.petType === 'thunderbird' && self.questStats['Cherrier'] === true && self.questStats['Sphere'] === true){
                socket.emit('dialogueLine',{
                    state:'ask',
                    message:'Your current pet is a Thunderbird. Please choose a pet to change it into.',
                    response1:'Change it into a Kiol for free.',
                    response2:'Change it into a Cherrier for free.',
                    response3:'Change it into a Sphere for free.',
                    response4:'Keep my Thunderbird.',
                });
            }
            else if(self.petType === 'thunderbird' && self.questStats['Cherrier'] === false && self.questStats['Sphere'] === true){
                socket.emit('dialogueLine',{
                    state:'ask',
                    message:'Your current pet is a Thunderbird. Please choose a pet to change it into.',
                    response1:'Change it into a Kiol for free.',
                    response2:'Change it into a Cherrier for 25 Rubies.',
                    response3:'Change it into a Sphere for free.',
                    response4:'Keep my Thunderbird.',
                });
            }
            self.currentResponse = 0;
        }
        if(self.currentResponse === 2 && self.questStage === 4 && self.questInfo.quest === 'Pet Training'){
            self.invincible = false;
            self.questInfo = {
                quest:false,
            };
            socket.emit('dialogueLine',{
                state:'remove',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 3 && self.questStage === 4 && self.questInfo.quest === 'Pet Training'){
            self.questStage += 2;
            self.invincible = true;
            socket.emit('dialogueLine',{
                state:'ask',
                message:'Sure!',
                response1:'*End conversation*',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 5 && self.questInfo.quest === 'Pet Training'){
            self.invincible = false;
            self.questInfo = {
                quest:false,
            };
            socket.emit('dialogueLine',{
                state:'remove',
            });
            if(self.petType === 'kiol'){
                if(self.questStats['Cherrier']){
                    for(var i in Pet.list){
                        if(Pet.list[i].parent === self.id){
                            Pet.list[i].toRemove = true;
                        }
                    }
                    self.petType = 'cherrier';
                    var pet = Pet({
                        parent:self.id,
                        x:self.x + 128 * (Math.random() - 0.5),
                        y:self.y + 128 * (Math.random() - 0.5),
                        petType:'cherrier',
                        name:'Cherrier Lvl.' + self.level,
                        moveSpeed:5 + self.level / 5,
                    });
                    self.pet = pet.id;
                    for(var i in SOCKET_LIST){
                        SOCKET_LIST[i].emit('initEntity',pet.getInitPack());
                    }
                    socket.emit('notification','You changed your pet into a Cherrier.');
                }
                else if(self.inventory.materials.ruby >= 25){
                    self.inventory.materials.ruby -= 25;
                    self.inventory.refreshMaterial();
                    for(var i in Pet.list){
                        if(Pet.list[i].parent === self.id){
                            Pet.list[i].toRemove = true;
                        }
                    }
                    self.petType = 'cherrier';
                    var pet = Pet({
                        parent:self.id,
                        x:self.x + 128 * (Math.random() - 0.5),
                        y:self.y + 128 * (Math.random() - 0.5),
                        petType:'cherrier',
                        name:'Cherrier Lvl.' + self.level,
                        moveSpeed:5 + self.level / 5,
                    });
                    self.pet = pet.id;
                    for(var i in SOCKET_LIST){
                        SOCKET_LIST[i].emit('initEntity',pet.getInitPack());
                    }
                    socket.emit('notification','You used 25 rubies to change your pet into a Cherrier.');
                    self.questStats['Cherrier'] = true;
                }
                else{
                    socket.emit('notification','[!] You do not have enough rubies to change your pet into a Cherrier.');
                }
            }
            else if(self.petType === 'cherrier'){
                for(var i in Pet.list){
                    if(Pet.list[i].parent === self.id){
                        Pet.list[i].toRemove = true;
                    }
                }
                self.petType = 'kiol';
                var pet = Pet({
                    parent:self.id,
                    x:self.x + 128 * (Math.random() - 0.5),
                    y:self.y + 128 * (Math.random() - 0.5),
                    petType:'kiol',
                    name:'Kiol Lvl.' + self.level,
                    moveSpeed:5 + self.level / 5,
                });
                self.pet = pet.id;
                for(var i in SOCKET_LIST){
                    SOCKET_LIST[i].emit('initEntity',pet.getInitPack());
                }
            }
            else if(self.petType === 'sphere'){
                for(var i in Pet.list){
                    if(Pet.list[i].parent === self.id){
                        Pet.list[i].toRemove = true;
                    }
                }
                self.petType = 'kiol';
                var pet = Pet({
                    parent:self.id,
                    x:self.x + 128 * (Math.random() - 0.5),
                    y:self.y + 128 * (Math.random() - 0.5),
                    petType:'kiol',
                    name:'Kiol Lvl.' + self.level,
                    moveSpeed:5 + self.level / 5,
                });
                self.pet = pet.id;
                for(var i in SOCKET_LIST){
                    SOCKET_LIST[i].emit('initEntity',pet.getInitPack());
                }
            }
            else if(self.petType === 'thunderbird'){
                for(var i in Pet.list){
                    if(Pet.list[i].parent === self.id){
                        Pet.list[i].toRemove = true;
                    }
                }
                self.petType = 'kiol';
                var pet = Pet({
                    parent:self.id,
                    x:self.x + 128 * (Math.random() - 0.5),
                    y:self.y + 128 * (Math.random() - 0.5),
                    petType:'kiol',
                    name:'Kiol Lvl.' + self.level,
                    moveSpeed:5 + self.level / 5,
                });
                self.pet = pet.id;
                for(var i in SOCKET_LIST){
                    SOCKET_LIST[i].emit('initEntity',pet.getInitPack());
                }
            }
            self.currentResponse = 0;
        }
        if(self.currentResponse === 2 && self.questStage === 5 && self.questInfo.quest === 'Pet Training'){
            self.invincible = false;
            self.questInfo = {
                quest:false,
            };
            socket.emit('dialogueLine',{
                state:'remove',
            });
            for(var i in Pet.list){
                if(Pet.list[i].parent === self.id){
                    Pet.list[i].toRemove = true;
                }
            }
            if(self.petType === 'kiol'){
                if(self.questStats['Sphere']){
                    for(var i in Pet.list){
                        if(Pet.list[i].parent === self.id){
                            Pet.list[i].toRemove = true;
                        }
                    }
                    self.petType = 'sphere';
                    var pet = Pet({
                        parent:self.id,
                        x:self.x + 128 * (Math.random() - 0.5),
                        y:self.y + 128 * (Math.random() - 0.5),
                        petType:'sphere',
                        name:'Sphere Lvl.' + self.level,
                        moveSpeed:5 + self.level / 5,
                    });
                    self.pet = pet.id;
                    for(var i in SOCKET_LIST){
                        SOCKET_LIST[i].emit('initEntity',pet.getInitPack());
                    }
                    socket.emit('notification','You changed your pet into a Sphere.');
                }
                else if(self.inventory.materials.ruby >= 200){
                    self.inventory.materials.ruby -= 200;
                    self.inventory.refreshMaterial();
                    for(var i in Pet.list){
                        if(Pet.list[i].parent === self.id){
                            Pet.list[i].toRemove = true;
                        }
                    }
                    self.petType = 'sphere';
                    var pet = Pet({
                        parent:self.id,
                        x:self.x + 128 * (Math.random() - 0.5),
                        y:self.y + 128 * (Math.random() - 0.5),
                        petType:'sphere',
                        name:'Sphere Lvl.' + self.level,
                        moveSpeed:5 + self.level / 5,
                    });
                    self.pet = pet.id;
                    for(var i in SOCKET_LIST){
                        SOCKET_LIST[i].emit('initEntity',pet.getInitPack());
                    }
                    socket.emit('notification','You used 200 rubies to change your pet into a Sphere.');
                    self.questStats['Sphere'] = true;
                }
                else{
                    socket.emit('notification','[!] You do not have enough rubies to change your pet into a Sphere.');
                }
            }
            else if(self.petType === 'cherrier'){
                if(self.questStats['Sphere']){
                    for(var i in Pet.list){
                        if(Pet.list[i].parent === self.id){
                            Pet.list[i].toRemove = true;
                        }
                    }
                    self.petType = 'sphere';
                    var pet = Pet({
                        parent:self.id,
                        x:self.x + 128 * (Math.random() - 0.5),
                        y:self.y + 128 * (Math.random() - 0.5),
                        petType:'sphere',
                        name:'Sphere Lvl.' + self.level,
                        moveSpeed:5 + self.level / 5,
                    });
                    self.pet = pet.id;
                    for(var i in SOCKET_LIST){
                        SOCKET_LIST[i].emit('initEntity',pet.getInitPack());
                    }
                    socket.emit('notification','You changed your pet into a Sphere.');
                }
                else if(self.inventory.materials.ruby >= 200){
                    self.inventory.materials.ruby -= 200;
                    self.inventory.refreshMaterial();
                    for(var i in Pet.list){
                        if(Pet.list[i].parent === self.id){
                            Pet.list[i].toRemove = true;
                        }
                    }
                    self.petType = 'sphere';
                    var pet = Pet({
                        parent:self.id,
                        x:self.x + 128 * (Math.random() - 0.5),
                        y:self.y + 128 * (Math.random() - 0.5),
                        petType:'sphere',
                        name:'Sphere Lvl.' + self.level,
                        moveSpeed:5 + self.level / 5,
                    });
                    self.pet = pet.id;
                    for(var i in SOCKET_LIST){
                        SOCKET_LIST[i].emit('initEntity',pet.getInitPack());
                    }
                    socket.emit('notification','You used 200 rubies to change your pet into a Sphere.');
                    self.questStats['Sphere'] = true;
                }
                else{
                    socket.emit('notification','[!] You do not have enough rubies to change your pet into a Sphere.');
                }
            }
            else if(self.petType === 'sphere'){
                if(self.questStats['Cherrier']){
                    for(var i in Pet.list){
                        if(Pet.list[i].parent === self.id){
                            Pet.list[i].toRemove = true;
                        }
                    }
                    self.petType = 'cherrier';
                    var pet = Pet({
                        parent:self.id,
                        x:self.x + 128 * (Math.random() - 0.5),
                        y:self.y + 128 * (Math.random() - 0.5),
                        petType:'cherrier',
                        name:'Cherrier Lvl.' + self.level,
                        moveSpeed:5 + self.level / 5,
                    });
                    self.pet = pet.id;
                    for(var i in SOCKET_LIST){
                        SOCKET_LIST[i].emit('initEntity',pet.getInitPack());
                    }
                    socket.emit('notification','You changed your pet into a Cherrier.');
                }
                else if(self.inventory.materials.ruby >= 25){
                    self.inventory.materials.ruby -= 25;
                    self.inventory.refreshMaterial();
                    for(var i in Pet.list){
                        if(Pet.list[i].parent === self.id){
                            Pet.list[i].toRemove = true;
                        }
                    }
                    self.petType = 'cherrier';
                    var pet = Pet({
                        parent:self.id,
                        x:self.x + 128 * (Math.random() - 0.5),
                        y:self.y + 128 * (Math.random() - 0.5),
                        petType:'cherrier',
                        name:'Cherrier Lvl.' + self.level,
                        moveSpeed:5 + self.level / 5,
                    });
                    self.pet = pet.id;
                    for(var i in SOCKET_LIST){
                        SOCKET_LIST[i].emit('initEntity',pet.getInitPack());
                    }
                    socket.emit('notification','You used 25 rubies to change your pet into a Cherrier.');
                    self.questStats['Cherrier'] = true;
                }
                else{
                    socket.emit('notification','[!] You do not have enough rubies to change your pet into a Cherrier.');
                }
            }
            else if(self.petType === 'thunderbird'){
                if(self.questStats['Cherrier']){
                    for(var i in Pet.list){
                        if(Pet.list[i].parent === self.id){
                            Pet.list[i].toRemove = true;
                        }
                    }
                    self.petType = 'cherrier';
                    var pet = Pet({
                        parent:self.id,
                        x:self.x + 128 * (Math.random() - 0.5),
                        y:self.y + 128 * (Math.random() - 0.5),
                        petType:'cherrier',
                        name:'Cherrier Lvl.' + self.level,
                        moveSpeed:5 + self.level / 5,
                    });
                    self.pet = pet.id;
                    for(var i in SOCKET_LIST){
                        SOCKET_LIST[i].emit('initEntity',pet.getInitPack());
                    }
                    socket.emit('notification','You changed your pet into a Cherrier.');
                }
                else if(self.inventory.materials.ruby >= 25){
                    self.inventory.materials.ruby -= 25;
                    self.inventory.refreshMaterial();
                    for(var i in Pet.list){
                        if(Pet.list[i].parent === self.id){
                            Pet.list[i].toRemove = true;
                        }
                    }
                    self.petType = 'cherrier';
                    var pet = Pet({
                        parent:self.id,
                        x:self.x + 128 * (Math.random() - 0.5),
                        y:self.y + 128 * (Math.random() - 0.5),
                        petType:'cherrier',
                        name:'Cherrier Lvl.' + self.level,
                        moveSpeed:5 + self.level / 5,
                    });
                    self.pet = pet.id;
                    for(var i in SOCKET_LIST){
                        SOCKET_LIST[i].emit('initEntity',pet.getInitPack());
                    }
                    socket.emit('notification','You used 25 rubies to change your pet into a Cherrier.');
                    self.questStats['Cherrier'] = true;
                }
                else{
                    socket.emit('notification','[!] You do not have enough rubies to change your pet into a Cherrier.');
                }
            }
            self.currentResponse = 0;
        }
        if(self.currentResponse === 3 && self.questStage === 5 && self.questInfo.quest === 'Pet Training'){
            self.invincible = false;
            self.questInfo = {
                quest:false,
            };
            socket.emit('dialogueLine',{
                state:'remove',
            });
            if(self.petType === 'kiol'){
                if(self.questStats['Thunderbird']){
                    for(var i in Pet.list){
                        if(Pet.list[i].parent === self.id){
                            Pet.list[i].toRemove = true;
                        }
                    }
                    self.petType = 'thunderbird';
                    var pet = Pet({
                        parent:self.id,
                        x:self.x + 128 * (Math.random() - 0.5),
                        y:self.y + 128 * (Math.random() - 0.5),
                        petType:'thunderbird',
                        name:'Thunderbird Lvl.' + self.level,
                        moveSpeed:5 + self.level / 5,
                    });
                    self.pet = pet.id;
                    for(var i in SOCKET_LIST){
                        SOCKET_LIST[i].emit('initEntity',pet.getInitPack());
                    }
                    socket.emit('notification','You changed your pet into a Thunderbird.');
                }
                else if(self.inventory.materials.ruby >= 500){
                    self.inventory.materials.ruby -= 500;
                    self.inventory.refreshMaterial();
                    for(var i in Pet.list){
                        if(Pet.list[i].parent === self.id){
                            Pet.list[i].toRemove = true;
                        }
                    }
                    self.petType = 'thunderbird';
                    var pet = Pet({
                        parent:self.id,
                        x:self.x + 128 * (Math.random() - 0.5),
                        y:self.y + 128 * (Math.random() - 0.5),
                        petType:'thunderbird',
                        name:'Thunderbird Lvl.' + self.level,
                        moveSpeed:5 + self.level / 5,
                    });
                    self.pet = pet.id;
                    for(var i in SOCKET_LIST){
                        SOCKET_LIST[i].emit('initEntity',pet.getInitPack());
                    }
                    socket.emit('notification','You used 500 rubies to change your pet into a Thunderbird.');
                    self.questStats['Thunderbird'] = true;
                }
                else{
                    socket.emit('notification','[!] You do not have enough rubies to change your pet into a Thunderbird.');
                }
            }
            else if(self.petType === 'cherrier'){
                if(self.questStats['Thunderbird']){
                    for(var i in Pet.list){
                        if(Pet.list[i].parent === self.id){
                            Pet.list[i].toRemove = true;
                        }
                    }
                    self.petType = 'thunderbird';
                    var pet = Pet({
                        parent:self.id,
                        x:self.x + 128 * (Math.random() - 0.5),
                        y:self.y + 128 * (Math.random() - 0.5),
                        petType:'thunderbird',
                        name:'Thunderbird Lvl.' + self.level,
                        moveSpeed:5 + self.level / 5,
                    });
                    self.pet = pet.id;
                    for(var i in SOCKET_LIST){
                        SOCKET_LIST[i].emit('initEntity',pet.getInitPack());
                    }
                    socket.emit('notification','You changed your pet into a Thunderbird.');
                }
                else if(self.inventory.materials.ruby >= 500){
                    self.inventory.materials.ruby -= 500;
                    self.inventory.refreshMaterial();
                    for(var i in Pet.list){
                        if(Pet.list[i].parent === self.id){
                            Pet.list[i].toRemove = true;
                        }
                    }
                    self.petType = 'thunderbird';
                    var pet = Pet({
                        parent:self.id,
                        x:self.x + 128 * (Math.random() - 0.5),
                        y:self.y + 128 * (Math.random() - 0.5),
                        petType:'thunderbird',
                        name:'Thunderbird Lvl.' + self.level,
                        moveSpeed:5 + self.level / 5,
                    });
                    self.pet = pet.id;
                    for(var i in SOCKET_LIST){
                        SOCKET_LIST[i].emit('initEntity',pet.getInitPack());
                    }
                    socket.emit('notification','You used 500 rubies to change your pet into a Thunderbird.');
                    self.questStats['Thunderbird'] = true;
                }
                else{
                    socket.emit('notification','[!] You do not have enough rubies to change your pet into a Thunderbird.');
                }
            }
            else if(self.petType === 'sphere'){
                if(self.questStats['Thunderbird']){
                    for(var i in Pet.list){
                        if(Pet.list[i].parent === self.id){
                            Pet.list[i].toRemove = true;
                        }
                    }
                    self.petType = 'thunderbird';
                    var pet = Pet({
                        parent:self.id,
                        x:self.x + 128 * (Math.random() - 0.5),
                        y:self.y + 128 * (Math.random() - 0.5),
                        petType:'thunderbird',
                        name:'Thunderbird Lvl.' + self.level,
                        moveSpeed:5 + self.level / 5,
                    });
                    self.pet = pet.id;
                    for(var i in SOCKET_LIST){
                        SOCKET_LIST[i].emit('initEntity',pet.getInitPack());
                    }
                    socket.emit('notification','You changed your pet into a Thunderbird.');
                }
                else if(self.inventory.materials.ruby >= 500){
                    self.inventory.materials.ruby -= 500;
                    self.inventory.refreshMaterial();
                    for(var i in Pet.list){
                        if(Pet.list[i].parent === self.id){
                            Pet.list[i].toRemove = true;
                        }
                    }
                    self.petType = 'thunderbird';
                    var pet = Pet({
                        parent:self.id,
                        x:self.x + 128 * (Math.random() - 0.5),
                        y:self.y + 128 * (Math.random() - 0.5),
                        petType:'thunderbird',
                        name:'Thunderbird Lvl.' + self.level,
                        moveSpeed:5 + self.level / 5,
                    });
                    self.pet = pet.id;
                    for(var i in SOCKET_LIST){
                        SOCKET_LIST[i].emit('initEntity',pet.getInitPack());
                    }
                    socket.emit('notification','You used 500 rubies to change your pet into a Thunderbird.');
                    self.questStats['Thunderbird'] = true;
                }
                else{
                    socket.emit('notification','[!] You do not have enough rubies to change your pet into a Thunderbird.');
                }
            }
            else if(self.petType === 'thunderbird'){
                if(self.questStats['Sphere']){
                    for(var i in Pet.list){
                        if(Pet.list[i].parent === self.id){
                            Pet.list[i].toRemove = true;
                        }
                    }
                    self.petType = 'sphere';
                    var pet = Pet({
                        parent:self.id,
                        x:self.x + 128 * (Math.random() - 0.5),
                        y:self.y + 128 * (Math.random() - 0.5),
                        petType:'sphere',
                        name:'Sphere Lvl.' + self.level,
                        moveSpeed:5 + self.level / 5,
                    });
                    self.pet = pet.id;
                    for(var i in SOCKET_LIST){
                        SOCKET_LIST[i].emit('initEntity',pet.getInitPack());
                    }
                    socket.emit('notification','You changed your pet into a Sphere.');
                }
                else if(self.inventory.materials.ruby >= 200){
                    self.inventory.materials.ruby -= 200;
                    self.inventory.refreshMaterial();
                    for(var i in Pet.list){
                        if(Pet.list[i].parent === self.id){
                            Pet.list[i].toRemove = true;
                        }
                    }
                    self.petType = 'sphere';
                    var pet = Pet({
                        parent:self.id,
                        x:self.x + 128 * (Math.random() - 0.5),
                        y:self.y + 128 * (Math.random() - 0.5),
                        petType:'sphere',
                        name:'Sphere Lvl.' + self.level,
                        moveSpeed:5 + self.level / 5,
                    });
                    self.pet = pet.id;
                    for(var i in SOCKET_LIST){
                        SOCKET_LIST[i].emit('initEntity',pet.getInitPack());
                    }
                    socket.emit('notification','You used 200 rubies to change your pet into a Sphere.');
                    self.questStats['Sphere'] = true;
                }
                else{
                    socket.emit('notification','[!] You do not have enough rubies to change your pet into a Sphere.');
                }
            }
            self.currentResponse = 0;
        }
        if(self.currentResponse === 4 && self.questStage === 5 && self.questInfo.quest === 'Pet Training'){
            self.invincible = false;
            self.questInfo = {
                quest:false,
            };
            socket.emit('dialogueLine',{
                state:'remove',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 6 && self.questInfo.quest === 'Pet Training'){
            self.questInfo.started = false;
            self.questStage += 1;
            self.invincible = false;
            socket.emit('dialogueLine',{
                state:'remove',
            });
            socket.emit('questInfo',{
                questName:self.questInfo.quest,
            });
            self.currentResponse = 0;
        }
        if(self.questInfo.started === true && self.questStage === 7 && self.questInfo.quest === 'Pet Training'){
            self.quest = 'Pet Training';
            self.questStage += 1;
            self.invincible = true;
            socket.emit('dialogueLine',{
                state:'ask',
                message:'I should talk to the Pet Master.',
                response1:'...',
            });
            socket.emit('questObjective',{
                questName:self.quest,
                questObjective:'Talk to the Pet Master.',
            });
            socket.emit('notification','You started the quest ' + self.questInfo.quest + '.');
        }
        if(self.currentResponse === 1 && self.questStage === 8 && self.quest === 'Pet Training'){
            self.questStage += 1;
            self.invincible = false;
            socket.emit('dialogueLine',{
                state:'remove',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 10 && self.quest === 'Pet Training'){
            self.questStage += 1;
            self.invincible = false;
            socket.emit('dialogueLine',{
                state:'remove',
            });
            socket.emit('questObjective',{
                questName:self.quest,
                questObjective:'Kill the 5 waves of Monsters!',
            });
            self.currentResponse = 0;
            self.teleport(640,1056,'The Pet Arena');
        }
        if(self.questStage === 11 && self.quest === 'Pet Training' && self.mapChange > 10){
            self.questStage += 1;
            self.invincible = true;
            socket.emit('dialogueLine',{
                state:'ask',
                message:'You can\'t fight, but your pet can! Make your pet kill all 5 waves of monsters!',
                response1:'*End conversation*',
            });
        }
        if(self.currentResponse === 1 && self.questStage === 12 && self.quest === 'Pet Training'){
            self.questStage += 1;
            self.invincible = false;
            socket.emit('dialogueLine',{
                state:'remove',
            });
            self.currentResponse = 0;
        }
        if(self.questStage === 13 && self.quest === 'Pet Training'){
            self.questStage += 1;
            socket.emit('notification',"Wave 1: Green Lizard x4");
            self.questInfo.maxMonsters = 0;
            self.questInfo.monstersKilled = 0;
            for(var i in QuestInfo.list){
                if(QuestInfo.list[i].quest === 'Pet Training' && QuestInfo.list[i].info === 'spawner'){
                    self.spawnQuestMonster(i,QuestInfo.list[i].x,QuestInfo.list[i].y,QuestInfo.list[i].map,'greenLizard');
                }
            }
        }
        if(self.questStage === 14 && self.quest === 'Pet Training' && self.questInfo.monstersKilled === self.questInfo.maxMonsters && self.questInfo.monstersKilled){
            socket.emit('notification',"Wave Complete!");
            self.questStage += 1;
            setTimeout(function(){
                self.questStage += 1;
            },2000);
        }
        if(self.questStage === 16 && self.quest === 'Pet Training'){
            self.questStage += 1;
            socket.emit('notification',"Wave 2: Green Lizard x6");
            self.questInfo.maxMonsters = 0;
            self.questInfo.monstersKilled = 0;
            for(var i in QuestInfo.list){
                if(QuestInfo.list[i].quest === 'Pet Training' && QuestInfo.list[i].info === 'spawner2'){
                    self.spawnQuestMonster(i,QuestInfo.list[i].x,QuestInfo.list[i].y,QuestInfo.list[i].map,'greenLizard');
                }
            }
        }
        if(self.questStage === 17 && self.quest === 'Pet Training' && self.questInfo.monstersKilled === self.questInfo.maxMonsters && self.questInfo.monstersKilled){
            socket.emit('notification',"Wave Complete!");
            self.questStage += 1;
            setTimeout(function(){
                self.questStage += 1;
            },2000);
        }
        if(self.questStage === 19 && self.quest === 'Pet Training'){
            self.questStage += 1;
            socket.emit('notification',"Wave 3: Lost Spirit x6");
            self.questInfo.maxMonsters = 0;
            self.questInfo.monstersKilled = 0;
            for(var i in QuestInfo.list){
                if(QuestInfo.list[i].quest === 'Pet Training' && QuestInfo.list[i].info === 'spawner3'){
                    self.spawnQuestMonster(i,QuestInfo.list[i].x,QuestInfo.list[i].y,QuestInfo.list[i].map,'lostSpirit');
                }
            }
        }
        if(self.questStage === 20 && self.quest === 'Pet Training' && self.questInfo.monstersKilled === self.questInfo.maxMonsters && self.questInfo.monstersKilled){
            socket.emit('notification',"Wave Complete!");
            self.questStage += 1;
            setTimeout(function(){
                self.questStage += 1;
            },2000);
        }
        if(self.questStage === 22 && self.quest === 'Pet Training'){
            self.questStage += 1;
            socket.emit('notification',"Wave 4: Cherry Bomb x12");
            self.questInfo.maxMonsters = 0;
            self.questInfo.monstersKilled = 0;
            for(var i in QuestInfo.list){
                if(QuestInfo.list[i].quest === 'Pet Training' && QuestInfo.list[i].info === 'spawner4'){
                    self.spawnQuestMonster(i,QuestInfo.list[i].x,QuestInfo.list[i].y,QuestInfo.list[i].map,'cherryBomb');
                }
            }
        }
        if(self.questStage === 23 && self.quest === 'Pet Training' && self.questInfo.monstersKilled === self.questInfo.maxMonsters && self.questInfo.monstersKilled){
            socket.emit('notification',"Wave Complete!");
            self.questStage += 1;
            setTimeout(function(){
                self.questStage += 1;
            },2000);
        }
        if(self.questStage === 25 && self.quest === 'Pet Training'){
            self.questStage += 1;
            socket.emit('notification',"Wave 5: Lightning Lizard");
            self.questInfo.maxMonsters = 0;
            self.questInfo.monstersKilled = 0;
            for(var i in QuestInfo.list){
                if(QuestInfo.list[i].quest === 'Pet Training' && QuestInfo.list[i].info === 'spawner5'){
                    self.spawnQuestMonster(i,QuestInfo.list[i].x,QuestInfo.list[i].y,QuestInfo.list[i].map,'lightningLizard');
                }
            }
        }
        if(self.questStage === 26 && self.quest === 'Pet Training' && self.questInfo.monstersKilled === self.questInfo.maxMonsters && self.questInfo.monstersKilled){
            socket.emit('notification',"Wave Complete!");
            self.questStage += 1;
            setTimeout(function(){
                self.questStage += 1;
            },2000);
        }
        if(self.questStage === 28 && self.quest === 'Pet Training'){
            self.questStage += 1;
            self.invincible = true;
            socket.emit('dialogueLine',{
                state:'ask',
                message:'Wow! I can\'t believe you killed all the monsters!',
                response1:'*End conversation*',
            });
            socket.emit('questObjective',{
                questName:self.quest,
                questObjective:'No quest objective.',
            });
            self.teleport(288,544,"The Guarded Citadel");
            if(self.questStats["Pet Training"] === false){
                socket.emit('notification','Your pets are now 3 times stronger.');
            }
        }
        if(self.currentResponse === 1 && self.questStage === 29 && self.quest === 'Pet Training'){
            if(self.questStats[self.quest]){
                self.xp += Math.round(questData[self.quest].xp * self.stats.xp / 10 * (Math.random() + 0.5));
                self.coins += Math.round(questData[self.quest].xp * self.stats.xp * (Math.random() + 0.5));
            }
            else{
                self.xp += Math.round(questData[self.quest].xp * self.stats.xp * (Math.random() + 0.5));
                self.coins += Math.round(questData[self.quest].xp * self.stats.xp * (Math.random() + 0.5));
            }
            socket.emit('notification','You completed the quest ' + self.quest + '.');
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
            socket.emit('dialogueLine',{
                state:'remove',
            });
            socket.emit('questObjective',{
                questName:'',
                questObjective:'',
            });
            self.currentResponse = 0;
        }

        if(self.currentResponse === 1 && self.questStage === 1 && self.questInfo.quest === 'Monster Search'){
            self.invincible = false;
            self.questInfo = {
                quest:false,
            };
            socket.emit('dialogueLine',{
                state:'remove',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 2 && self.questInfo.quest === 'Monster Search'){
            self.questStage += 1;
            self.invincible = true;
            socket.emit('dialogueLine',{
                state:'ask',
                message:'Maybe we could find a way to kill all the monsters.',
                response1:'Sure!',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 3 && self.questInfo.quest === 'Monster Search'){
            self.questInfo.started = false;
            self.questStage += 1;
            self.invincible = false;
            socket.emit('dialogueLine',{
                state:'remove',
            });
            socket.emit('questInfo',{
                questName:self.questInfo.quest,
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 2 && self.questStage === 2 && self.questInfo.quest === 'Monster Search'){
            self.invincible = false;
            self.questInfo = {
                quest:false,
            };
            socket.emit('dialogueLine',{
                state:'remove',
            });
            self.currentResponse = 0;
        }
        if(self.questInfo.started === true && self.questStage === 4 && self.questInfo.quest === 'Monster Search'){
            self.quest = 'Monster Search';
            self.questStage += 1;
            self.invincible = true;
            socket.emit('dialogueLine',{
                state:'ask',
                message:'I should talk to Andrew.',
                response1:'...',
            });
            socket.emit('questObjective',{
                questName:self.quest,
                questObjective:'Talk to Andrew.',
            });
            socket.emit('notification','You started the quest ' + self.questInfo.quest + '.');
        }
        if(self.currentResponse === 1 && self.questStage === 5 && self.quest === 'Monster Search'){
            self.questStage += 1;
            self.invincible = false;
            socket.emit('dialogueLine',{
                state:'remove',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 7 && self.quest === 'Monster Search'){
            self.questStage += 1;
            self.invincible = false;
            socket.emit('dialogueLine',{
                state:'remove',
            });
            socket.emit('questObjective',{
                questName:self.quest,
                questObjective:'Talk to the Pet Master.',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 9 && self.quest === 'Monster Search'){
            self.questStage += 1;
            self.invincible = false;
            socket.emit('dialogueLine',{
                state:'remove',
            });
            socket.emit('questObjective',{
                questName:self.quest,
                questObjective:'Find the House in The Forest.',
            });
            self.currentResponse = 0;
        }
        if(self.questStage === 10 && self.quest === 'Monster Search' && self.mapChange > 10){
            for(var i in QuestInfo.list){
                if(QuestInfo.list[i].quest === 'Monster Search' && self.isColliding(QuestInfo.list[i])){
                    self.questStage = 11;
                }
            }
        }
        if(self.questStage === 11 && self.quest === 'Monster Search'){
            self.questStage += 1;
            self.invincible = true;
            socket.emit('dialogueLine',{
                state:'ask',
                message:'I think this is the house.',
                response1:'...',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 12 && self.quest === 'Monster Search'){
            self.questStage += 1;
            for(var i in QuestInfo.list){
                if(QuestInfo.list[i].quest === 'Monster Search' && QuestInfo.list[i].info === 'npcSpawner'){
                    self.questDependent.monsterking = new Npc({
                        x:QuestInfo.list[i].x,
                        y:QuestInfo.list[i].y,
                        map:QuestInfo.list[i].map,
                        name:'Monster King',
                        entityId:'monsterking',
                        moveSpeed:5,
                        info:{
                            randomWalk:'wander',
                            canChangeMap:false,
                            shop:false,
                        },
                    });
                    for(var j in Player.list){
                        if(Player.list[j].map === self.map){
                            SOCKET_LIST[j].emit('initEntity',self.questDependent.monsterking.getInitPack());
                        }
                    }
                }
            }
            self.teleport(640,1120,'Mysterious Room');
            self.invincible = true;
            socket.emit('dialogueLine',{
                state:'ask',
                message:'Ahhh! What\'s happening to me?',
                response1:'...',
            });
            socket.emit('questObjective',{
                questName:self.quest,
                questObjective:'Talk to the Monster King.',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 13 && self.quest === 'Monster Search'){
            self.questStage += 1;
            self.invincible = false;
            socket.emit('dialogueLine',{
                state:'remove',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 15 && self.quest === 'Monster Search'){
            self.questStage += 1;
            self.invincible = true;
            socket.emit('dialogueLine',{
                state:'ask',
                message:'Monsters, protect me!',
                response1:'*End conversation*',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 16 && self.quest === 'Monster Search'){
            self.invincible = false;
            socket.emit('dialogueLine',{
                state:'remove',
            });
            socket.emit('questObjective',{
                questName:self.quest,
                questObjective:'Defeat the Monster King\'s Monsters.',
            });
            setTimeout(function(){
                self.questStage += 1
            },2000);
            self.currentResponse = 0;
        }
        if(self.questStage === 17 && self.quest === 'Monster Search'){
            self.questStage += 1;
            self.questInfo.maxMonsters = 0;
            self.questInfo.monstersKilled = 0;
            for(var i in QuestInfo.list){
                if(QuestInfo.list[i].quest === 'Monster Search' && QuestInfo.list[i].info === 'spawner1'){
                    self.spawnQuestMonster(i,QuestInfo.list[i].x,QuestInfo.list[i].y,QuestInfo.list[i].map,'waterRammer');
                }
            }
            setTimeout(function(){
                self.questStage += 1;
            },1000);
        }
        if(self.questStage === 19 && self.quest === 'Monster Search'){
            self.questStage += 1;
            self.questInfo.maxMonsters = 0;
            self.questInfo.monstersKilled = 0;
            for(var i in QuestInfo.list){
                if(QuestInfo.list[i].quest === 'Monster Search' && QuestInfo.list[i].info === 'spawner2'){
                    self.spawnQuestMonster(i,QuestInfo.list[i].x,QuestInfo.list[i].y,QuestInfo.list[i].map,'charredBird');
                }
            }
            setTimeout(function(){
                self.questStage += 1;
            },1000);
        }
        if(self.questStage === 21 && self.quest === 'Monster Search'){
            self.questStage += 1;
            self.questInfo.maxMonsters = 0;
            self.questInfo.monstersKilled = 0;
            for(var i in QuestInfo.list){
                if(QuestInfo.list[i].quest === 'Monster Search' && QuestInfo.list[i].info === 'spawner3'){
                    self.spawnQuestMonster(i,QuestInfo.list[i].x,QuestInfo.list[i].y,QuestInfo.list[i].map,'waterRammer');
                }
            }
            setTimeout(function(){
                self.questStage += 1;
            },1000);
        }
        if(self.questStage === 23 && self.quest === 'Monster Search'){
            self.questStage += 1;
            self.questInfo.maxMonsters = 0;
            self.questInfo.monstersKilled = 0;
            for(var i in QuestInfo.list){
                if(QuestInfo.list[i].quest === 'Monster Search' && QuestInfo.list[i].info === 'spawner4'){
                    self.spawnQuestMonster(i,QuestInfo.list[i].x,QuestInfo.list[i].y,QuestInfo.list[i].map,'charredBird');
                }
            }
            setTimeout(function(){
                self.questStage += 1;
            },1000);
        }
        if(self.questStage === 25 && self.quest === 'Monster Search'){
            self.questStage += 1;
            self.questInfo.maxMonsters = 0;
            self.questInfo.monstersKilled = 0;
            for(var i in QuestInfo.list){
                if(QuestInfo.list[i].quest === 'Monster Search' && QuestInfo.list[i].info === 'spawner5'){
                    self.spawnQuestMonster(i,QuestInfo.list[i].x,QuestInfo.list[i].y,QuestInfo.list[i].map,'waterRammer');
                }
            }
            setTimeout(function(){
                self.questStage += 1;
            },1000);
        }
        if(self.questStage === 27 && self.quest === 'Monster Search'){
            self.questStage += 1;
            self.questInfo.maxMonsters = 0;
            self.questInfo.monstersKilled = 0;
            for(var i in QuestInfo.list){
                if(QuestInfo.list[i].quest === 'Monster Search' && QuestInfo.list[i].info === 'spawner6'){
                    self.spawnQuestMonster(i,QuestInfo.list[i].x,QuestInfo.list[i].y,QuestInfo.list[i].map,'charredBird');
                }
            }
            setTimeout(function(){
                self.questStage += 1;
            },1000);
        }
        if(self.questStage === 29 && self.quest === 'Monster Search'){
            self.questStage += 1;
            self.questInfo.maxMonsters = 0;
            self.questInfo.monstersKilled = 0;
            for(var i in QuestInfo.list){
                if(QuestInfo.list[i].quest === 'Monster Search' && QuestInfo.list[i].info === 'spawner7'){
                    self.spawnQuestMonster(i,QuestInfo.list[i].x,QuestInfo.list[i].y,QuestInfo.list[i].map,'waterRammer');
                }
            }
            setTimeout(function(){
                self.questStage += 1;
            },1000);
        }
        if(self.questStage === 31 && self.quest === 'Monster Search'){
            self.questStage += 1;
            self.trackEntity(self.questDependent.monsterking,128);
            setTimeout(function(){
                self.questStage += 1;
            },2000);
        }
        if(self.questStage === 33 && self.quest === 'Monster Search'){
            self.trackingEntity = undefined;
            self.questStage += 1;
            self.invincible = true;
            socket.emit('dialogueLine',{
                state:'ask',
                message:'HOW ARE YOU NOT DEAD!',
                response1:'*End conversation*',
            });
            socket.emit('questObjective',{
                questName:self.quest,
                questObjective:'No quest objective.',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 34 && self.quest === 'Monster Search'){
            self.questStage += 1;
            self.invincible = false;
            socket.emit('dialogueLine',{
                state:'remove',
            });
            self.currentResponse = 0;
            setTimeout(function(){
                self.questStage += 1;
            },2000);
        }
        if(self.questStage === 35 && self.quest === 'Monster Search'){
            self.questStage += 1;
            self.invincible = true;
            socket.emit('dialogueLine',{
                state:'ask',
                message:'Argh! I\'m dying!',
                response1:'...',
            });
            self.currentResponse = 0;
        }
        if(self.questStage === 36 && self.quest === 'Monster Search'){
            var particle = new Particle({
                x:self.questDependent.monsterking.x + Math.random() * self.questDependent.monsterking.width - self.questDependent.monsterking.width / 2,
                y:self.questDependent.monsterking.y + Math.random() * self.questDependent.monsterking.height - self.questDependent.monsterking.height / 2,
                map:self.questDependent.monsterking.map,
                particleType:'fire',
            });
        }
        if(self.currentResponse === 1 && self.questStage === 36 && self.quest === 'Monster Search'){
            self.questStage += 1;
            self.questDependent.monsterking.toRemove = true;
            socket.emit('notification',"Monster King was slain...");
            self.invincible = true;
            socket.emit('dialogueLine',{
                state:'ask',
                message:'Well, I guess that will be the end of the Monster King.',
                response1:'...',
            });
            setTimeout(function(){
                self.teleport(608,2848,'Deserted Town');
            },3000);
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 37 && self.quest === 'Monster Search'){
            if(self.questStats[self.quest]){
                self.xp += Math.round(questData[self.quest].xp * self.stats.xp / 10 * (Math.random() + 0.5));
                self.coins += Math.round(questData[self.quest].xp * self.stats.xp * (Math.random() + 0.5));
            }
            else{
                self.xp += Math.round(questData[self.quest].xp * self.stats.xp * (Math.random() + 0.5));
                self.coins += Math.round(questData[self.quest].xp * self.stats.xp * (Math.random() + 0.5));
            }
            socket.emit('notification','You completed the quest ' + self.quest + '.');
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
            socket.emit('dialogueLine',{
                state:'remove',
            });
            socket.emit('questObjective',{
                questName:'',
                questObjective:'',
            });
            self.currentResponse = 0;
        }
        
        if(self.currentResponse === 1 && self.questStage === 1 && self.questInfo.quest === 'Missing Candies'){
            self.questInfo.started = false;
            self.questStage += 1;
            self.invincible = false;
            socket.emit('dialogueLine',{
                state:'remove',
            });
            socket.emit('questInfo',{
                questName:self.questInfo.quest,
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 2 && self.questStage === 1 && self.questInfo.quest === 'Missing Candies'){
            self.invincible = false;
            self.questInfo = {
                quest:false,
            };
            socket.emit('dialogueLine',{
                state:'remove',
            });
            self.currentResponse = 0;
        }
        if(self.questInfo.started === true && self.questStage === 2 && self.questInfo.quest === 'Missing Candies'){
            self.quest = 'Missing Candies';
            self.questStage += 1;
            self.invincible = true;
            socket.emit('dialogueLine',{
                state:'ask',
                message:'I should talk to Riley.',
                response1:'...',
            });
            socket.emit('questObjective',{
                questName:self.quest,
                questObjective:'Talk to Riley.',
            });
            socket.emit('notification','You started the quest ' + self.questInfo.quest + '.');
        }
        if(self.currentResponse === 1 && self.questStage === 3 && self.quest === 'Missing Candies'){
            self.questStage += 1;
            self.invincible = false;
            socket.emit('dialogueLine',{
                state:'remove',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 5 && self.quest === 'Missing Candies'){
            self.questStage += 1;
            self.invincible = false;
            socket.emit('dialogueLine',{
                state:'remove',
            });
            socket.emit('questObjective',{
                questName:self.quest,
                questObjective:'Find Riley\'s candies.',
            });
            self.currentResponse = 0;
        }
        if(self.questStage === 6 && self.quest === 'Missing Candies' && self.mapChange > 10){
            for(var i in QuestInfo.list){
                if(QuestInfo.list[i].quest === 'Missing Candies' && QuestInfo.list[i].info === 'activator' && self.isColliding(QuestInfo.list[i])){
                    self.questStage = 7;
                }
            }
        }
        if(self.questStage === 7 && self.quest === 'Missing Candies'){
            self.questStage += 1;
            self.invincible = true;
            socket.emit('dialogueLine',{
                state:'ask',
                message:'I found the candies!',
                response1:'...',
            });
            socket.emit('questObjective',{
                questName:self.quest,
                questObjective:'Return to Riley.',
            });
        }
        if(self.currentResponse === 1 && self.questStage === 8 && self.quest === 'Missing Candies'){
            self.questStage += 1;
            self.invincible = false;
            socket.emit('dialogueLine',{
                state:'remove',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 10 && self.quest === 'Missing Candies'){
            if(self.questStats[self.quest]){
                self.xp += Math.round(questData[self.quest].xp * self.stats.xp / 10 * (Math.random() + 0.5));
                self.coins += Math.round(questData[self.quest].xp * self.stats.xp * (Math.random() + 0.5));
            }
            else{
                self.xp += Math.round(questData[self.quest].xp * self.stats.xp * (Math.random() + 0.5));
                self.coins += Math.round(questData[self.quest].xp * self.stats.xp * (Math.random() + 0.5));
            }
            socket.emit('notification','You completed the quest ' + self.quest + '.');
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
            socket.emit('dialogueLine',{
                state:'remove',
            });
            socket.emit('questObjective',{
                questName:'',
                questObjective:'',
            });
            self.currentResponse = 0;
        }
        
        if(self.currentResponse === 1 && self.questStage === 1 && self.questInfo.quest === 'Broken Sword'){
            self.invincible = false;
            self.questInfo = {
                quest:false,
            };
            socket.emit('dialogueLine',{
                state:'remove',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 2 && self.questInfo.quest === 'Broken Sword'){
            self.questStage += 1;
            self.invincible = true;
            socket.emit('dialogueLine',{
                state:'ask',
                message:'Villagers normally can\'t damage monsters, but Fisherman keeps bragging about how his fishing rod can kill Birds! I want a sword too!',
                response1:'But it\'s broken...',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 2 && self.questStage === 2 && self.questInfo.quest === 'Broken Sword'){
            self.invincible = false;
            self.questInfo = {
                quest:false,
            };
            socket.emit('dialogueLine',{
                state:'remove',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 3 && self.questInfo.quest === 'Broken Sword'){
            self.questStage += 1;
            self.invincible = true;
            socket.emit('dialogueLine',{
                state:'ask',
                message:'Yeah, but I\'m sure Wally can fix it.',
                response1:'Okay, I can help you get this broken sword.',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 4 && self.questInfo.quest === 'Broken Sword'){
            self.questInfo.started = false;
            self.questStage += 1;
            self.invincible = false;
            socket.emit('dialogueLine',{
                state:'remove',
            });
            socket.emit('questInfo',{
                questName:self.questInfo.quest,
            });
            self.currentResponse = 0;
        }
        if(self.questInfo.started === true && self.questStage === 5 && self.questInfo.quest === 'Broken Sword'){
            self.quest = 'Broken Sword';
            self.questStage += 1;
            self.invincible = true;
            socket.emit('dialogueLine',{
                state:'ask',
                message:'I should talk to Billy.',
                response1:'...',
            });
            socket.emit('questObjective',{
                questName:self.quest,
                questObjective:'Talk to Billy.',
            });
            socket.emit('notification','You started the quest ' + self.questInfo.quest + '.');
        }
        if(self.currentResponse === 1 && self.questStage === 6 && self.quest === 'Broken Sword'){
            self.questStage += 1;
            self.invincible = false;
            socket.emit('dialogueLine',{
                state:'remove',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 8 && self.quest === 'Broken Sword'){
            self.questStage += 1;
            self.invincible = false;
            socket.emit('dialogueLine',{
                state:'remove',
            });
            socket.emit('questObjective',{
                questName:self.quest,
                questObjective:'Find the Broken Sword.',
            });
            self.currentResponse = 0;
        }
        if(self.questStage === 9 && self.quest === 'Broken Sword' && self.mapChange > 10){
            for(var i in QuestInfo.list){
                if(QuestInfo.list[i].quest === 'Broken Sword' && QuestInfo.list[i].info === 'activator' && self.isColliding(QuestInfo.list[i])){
                    self.questStage = 10;
                }
            }
        }
        if(self.questStage === 10 && self.quest === 'Broken Sword'){
            self.questStage += 1;
            self.invincible = true;
            socket.emit('dialogueLine',{
                state:'ask',
                message:'Let me see... An apple, a bow, a potion, some coins... Here it is! The broken sword!',
                response1:'...',
            });
            socket.emit('questObjective',{
                questName:self.quest,
                questObjective:'Return to Billy.',
            });
        }
        if(self.currentResponse === 1 && self.questStage === 11 && self.quest === 'Broken Sword'){
            self.questStage += 1;
            self.invincible = false;
            socket.emit('dialogueLine',{
                state:'remove',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 13 && self.quest === 'Broken Sword'){
            if(self.questStats[self.quest]){
                self.xp += Math.round(questData[self.quest].xp * self.stats.xp / 10 * (Math.random() + 0.5));
                self.coins += Math.round(questData[self.quest].xp * self.stats.xp * (Math.random() + 0.5));
            }
            else{
                self.xp += Math.round(questData[self.quest].xp * self.stats.xp * (Math.random() + 0.5));
                self.coins += Math.round(questData[self.quest].xp * self.stats.xp * (Math.random() + 0.5));
            }
            socket.emit('notification','You completed the quest ' + self.quest + '.');
            addToChat('style="color: ' + self.textColor + '">',self.displayName + " completed the quest " + self.quest + ".");
            var randomItem = Math.random();
            if(randomItem < 0.25){
                var itemIndex = self.inventory.addRandomItemAndRandomizedEnchantments('rockboomerang',self.stats.luck);
                var item = self.inventory.items[itemIndex];
            }
            else if(randomItem < 0.5){
                var itemIndex = self.inventory.addRandomItemAndRandomizedEnchantments('bowofrock',self.stats.luck);
                var item = self.inventory.items[itemIndex];
            }
            else if(randomItem < 0.75){
                var itemIndex = self.inventory.addRandomItemAndRandomizedEnchantments('bookofrock',self.stats.luck);
                var item = self.inventory.items[itemIndex];
            }
            else if(randomItem < 0.95){
                var itemIndex = self.inventory.addRandomItemAndRandomizedEnchantments('amuletofrock',self.stats.luck);
                var item = self.inventory.items[itemIndex];
            }
            else{
                var itemIndex = self.inventory.addRandomItemAndRandomizedEnchantments('rubypresent',self.stats.luck);
                var item = self.inventory.items[itemIndex];
            }
            socket.emit('notification','You got a ' + Item.list[item.id].name + '.');
            addToChat('style="color: ' + self.textColor + '">',self.displayName + " got a " + Item.list[item.id].name + ".");
            self.questStats[self.quest] = true;
            self.quest = false;
            self.questInfo = {
                quest:false,
            };
            for(var i in self.questDependent){
                self.questDependent[i].toRemove = true;
            }
            self.invincible = false;
            socket.emit('dialogueLine',{
                state:'remove',
            });
            socket.emit('questObjective',{
                questName:'',
                questObjective:'',
            });
            self.currentResponse = 0;
        }
        
        if(self.currentResponse === 1 && self.questStage === 1 && self.questInfo.quest === 'Secret Tunnels'){
            self.invincible = false;
            self.questInfo = {
                quest:false,
            };
            socket.emit('dialogueLine',{
                state:'remove',
            });
            self.currentResponse = 0;
        }
        if(self.questInfo.started === true && self.questStage === 2 && self.questInfo.quest === 'Secret Tunnels'){
            self.quest = 'Secret Tunnels';
            self.questStage += 1;
            self.invincible = true;
            socket.emit('dialogueLine',{
                state:'ask',
                message:'I should talk to Cyber.',
                response1:'...',
            });
            socket.emit('questObjective',{
                questName:self.quest,
                questObjective:'Talk to Cyber.',
            });
            socket.emit('notification','You started the quest ' + self.questInfo.quest + '.');
        }
        if(self.currentResponse === 1 && self.questStage === 3 && self.quest === 'Secret Tunnels'){
            self.questStage += 1;
            self.invincible = false;
            socket.emit('dialogueLine',{
                state:'remove',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 5 && self.questInfo.quest === 'Secret Tunnels'){
            self.questStage += 1;
            self.invincible = true;
            socket.emit('dialogueLine',{
                state:'ask',
                message:'I think Fisherman knows something about the secret tunnels. To find Fisherman, just keep heading south to The Docks. He should be by his house.',
                response1:'*End conversation*',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 6 && self.quest === 'Secret Tunnels'){
            self.questStage += 1;
            self.invincible = false;
            socket.emit('dialogueLine',{
                state:'remove',
            });
            socket.emit('questObjective',{
                questName:self.quest,
                questObjective:'Talk to Fisherman.',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 8 && self.quest === 'Secret Tunnels'){
            self.questStage += 1;
            self.invincible = false;
            socket.emit('dialogueLine',{
                state:'remove',
            });
            socket.emit('questObjective',{
                questName:self.quest,
                questObjective:'Talk to John.',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 10 && self.quest === 'Secret Tunnels'){
            self.questStage += 1;
            self.invincible = false;
            socket.emit('dialogueLine',{
                state:'remove',
            });
            socket.emit('questObjective',{
                questName:self.quest,
                questObjective:'Find the Secret Tunnels.',
            });
            self.currentResponse = 0;
        }
        if(self.questStage === 11 && self.quest === 'Secret Tunnels' && self.mapChange > 10 && self.map === 'Secret Tunnel Part 1'){
            self.questStage += 1;
            socket.emit('questObjective',{
                questName:self.quest,
                questObjective:'Survive and find the exit!',
            });
        }
        if(self.questStage === 12 && self.quest === 'Secret Tunnels' && self.mapChange > 10 && self.map === 'The Graveyard'){
            self.questStage = 11;
            self.teleport(5792,864,'Secret Tunnel Part 1');
            socket.emit('notification','[!] You got lost.');
        }
        if(self.questStage === 12 && self.quest === 'Secret Tunnels' && self.mapChange > 10 && self.map === 'The Forest'){
            self.questStage += 1;
            self.teleport(1248,672,'The Village');
            self.invincible = true;
            socket.emit('dialogueLine',{
                state:'ask',
                message:'You made it! Now I can know where the secret tunnels are! Here, have a reward.',
                response1:'*End conversation*',
            });
            socket.emit('questObjective',{
                questName:self.quest,
                questObjective:'No quest objective.',
            });
        }
        if(self.currentResponse === 1 && self.questStage === 13 && self.quest === 'Secret Tunnels'){
            if(self.questStats[self.quest]){
                self.xp += Math.round(questData[self.quest].xp * self.stats.xp / 10 * (Math.random() + 0.5));
                self.coins += Math.round(questData[self.quest].xp * self.stats.xp * (Math.random() + 0.5));
            }
            else{
                self.xp += Math.round(questData[self.quest].xp * self.stats.xp * (Math.random() + 0.5));
                self.coins += Math.round(questData[self.quest].xp * self.stats.xp * (Math.random() + 0.5));
                var itemIndex = self.inventory.addRandomItemAndRandomizedEnchantments('healingscepter',self.stats.luck);
                var item = self.inventory.items[itemIndex];
                socket.emit('notification','You got a ' + Item.list[item.id].name + '.');
                var itemIndex = self.inventory.addRandomItemAndRandomizedEnchantments('advancedrubysword',self.stats.luck);
                var item = self.inventory.items[itemIndex];
                socket.emit('notification','You got a ' + Item.list[item.id].name + '.');
                var itemIndex = self.inventory.addRandomItemAndRandomizedEnchantments('advancedrubybow',self.stats.luck);
                var item = self.inventory.items[itemIndex];
                socket.emit('notification','You got a ' + Item.list[item.id].name + '.');
                var itemIndex = self.inventory.addRandomItemAndRandomizedEnchantments('advancedrubystaff',self.stats.luck);
                var item = self.inventory.items[itemIndex];
                socket.emit('notification','You got a ' + Item.list[item.id].name + '.');
            }
            socket.emit('notification','You completed the quest ' + self.quest + '.');
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
            socket.emit('dialogueLine',{
                state:'remove',
            });
            socket.emit('questObjective',{
                questName:'',
                questObjective:'',
            });
            self.currentResponse = 0;
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
            self.immuneDebuffs = [];
            damageIncrease = 1;
            self.useTime = 0;
            self.passiveUsetime = 10;
            self.offhandPassiveUsetime = 10;
            for(var i in self.inventory.currentEquip){
                if(self.inventory.currentEquip[i].id !== undefined){
                    var item = Item.list[self.inventory.currentEquip[i].id];
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
                    if(item.manaCost){
                        self.attackCost = item.manaCost;
                    }
                    if(item.knockback !== undefined){
                        self.stats.knockback = item.knockback;
                    }
                    if(item.damageType){
                        self.stats.damageType += item.damageType;
                        self.ability.ability = self.inventory.currentEquip[i].id;
                    }
                    if(item.useTime){
                        self.useTime += item.useTime;
                    }
                    try{
                        eval(item.event);
                        for(var j in self.inventory.currentEquip[i].enchantments){
                            var enchantment = Enchantment.list[self.inventory.currentEquip[i].enchantments[j].id];
                            var value = self.inventory.currentEquip[i].enchantments[j].level;
                            eval(enchantment.event);
                        }
                    }
                    catch(err){
                        console.log(err);
                    }
                }
            }
            if(self.inventory.currentEquip['weapon'].id){
                self.currentItem = self.inventory.currentEquip['weapon'].id;
            }
            else{
                self.currentItem = '';
            }
            self.stats.attack = Math.round(self.stats.attack * damageIncrease);
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
                self.questInfo.quest = false;
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
            self.maxSpeed = 20 + Math.floor(self.level / 10);
            self.xp = self.xp - self.xpMax;
            self.level += 1;
            self.xpMax = xpLevels[self.level];
            self.hpMax = hpLevels[self.level];
            self.oldHpMax = hpLevels[self.level];
            addToChat('style="color: #00ff00">',self.displayName + ' is now level ' + self.level + '.');
            if(Pet.list[self.pet]){
                Pet.list[self.pet].maxSpeed = 5 + self.level / 5;
                if(Pet.list[self.pet].petType === 'kiol'){
                    Pet.list[self.pet].width = 40;
                    Pet.list[self.pet].height = 28;
                    Pet.list[self.pet].stats = {
                        attack:Math.ceil(self.level / 10) * 10,
                        defense:0,
                        heal:1,
                        range:1,
                        speed:1,
                        damageReduction:0,
                        debuffs:[],
                    }
                    Pet.list[self.pet].name = 'Kiol Lvl. ' + self.level;
                }
                if(Pet.list[self.pet].petType === 'cherrier'){
                    Pet.list[self.pet].width = 36;
                    Pet.list[self.pet].height = 32;
                    Pet.list[self.pet].stats = {
                        attack:Math.ceil(self.level / 10) * 15,
                        defense:0,
                        heal:1,
                        range:1,
                        speed:1,
                        damageReduction:0,
                        debuffs:[],
                    }
                    Pet.list[self.pet].name = 'Cherrier Lvl. ' + self.level;
                }
                if(Pet.list[self.pet].petType === 'sphere'){
                    Pet.list[self.pet].width = 44;
                    Pet.list[self.pet].height = 44;
                    Pet.list[self.pet].stats = {
                        attack:Math.ceil(self.level / 10) * 35,
                        defense:0,
                        heal:1,
                        range:1,
                        speed:1,
                        damageReduction:0,
                        debuffs:[],
                    }
                    Pet.list[self.pet].name = 'Sphere Lvl. ' + self.level;
                }
                if(Pet.list[self.pet].petType === 'thunderbird'){
                    Pet.list[self.pet].maxSpeed *= 1.5;
                    Pet.list[self.pet].width = 64;
                    Pet.list[self.pet].height = 60;
                    Pet.list[self.pet].stats = {
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
                    Pet.list[self.pet].shootSpeed = 1;
                    if(self.questStats["Pet Training"] === true){
                        Pet.list[self.pet].shootSpeed *= 2;
                    }
                    Pet.list[self.pet].name = 'Thunderbird Lvl. ' + self.level;
                }
                if(self.questStats["Pet Training"] === true){
                    Pet.list[self.pet].stats.attack *= 3;
                }
            }
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
    }
    self.updateAttack = function(){
        var isFireMap = firableMap(self.map);
        for(var i = 0;i < self.eventQ.length;i++){
            if(self.eventQ[i] !== undefined){
                if(self.eventQ[i].time === 0){
                    switch(self.eventQ[i].event){
                        case "heal":
                            var heal = 40 * self.stats.heal;
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
                            break;
                        case "baseAttack":
                            if(isFireMap){
                                self.shootProjectile(self.id,'Player',self.direction,self.direction,'stoneArrow',30,function(t){return 0},0,self.stats);
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
                                    }
                                }
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
                                    stats:self.stats,
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
                                    }
                                }
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
                                    stats:self.stats,
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
                                    }
                                }
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
                                    stats:self.stats,
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
                                    }
                                }
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
                                    stats:self.stats,
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
                        case "bookofflamesAttack":
                            if(isFireMap){
                                for(var j = 0;j < 20;j++){
                                    self.shootProjectile(self.id,'Player',self.direction + j * 18,self.direction + j * 18,'fireBullet',32,function(t){return 25},1000,self.stats,'accellerateNoCollision');
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
                                    }
                                }
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
                                    stats:self.stats,
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
                        case "baseSecond":
                            if(isFireMap){
                                for(var j = 0;j < 5;j++){
                                    self.shootProjectile(self.id,'Player',j * 72,j * 72,'stoneArrow',30,function(t){return 0},0,self.stats);
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
        if(self.keyPress.heal === true && self.mana >= self.healCost && self.manaRefresh <= 0 && self.hp < self.hpMax){
            self.mana -= self.healCost;
            self.manaRefresh = self.useTime;
            for(var i in self.ability.healPattern){
                self.addToEventQ('heal',self.ability.healPattern[i]);
            }
        }
        if(isFireMap === false){
            return;
        }
        if(self.keyPress.attack === true){
            if(self.stats.damageType === 'magic' && self.mana >= self.attackCost && self.manaRefresh <= 0){
                for(var i in self.ability.attackPattern){
                    self.addToEventQ(self.ability.ability + 'Attack',self.ability.attackPattern[i]);
                }
                self.doPassive();
                self.mana -= self.attackCost;
                self.manaRefresh = self.useTime;
                self.weaponState += 1;
            }
            else if(self.stats.damageType === 'healing' && self.mana >= self.attackCost && self.manaRefresh <= 0){
                for(var i in self.ability.attackPattern){
                    self.addToEventQ(self.ability.ability + 'Attack',self.ability.attackPattern[i]);
                }
                self.doPassive();
                self.mana -= self.attackCost;
                self.manaRefresh = self.useTime;
                self.weaponState += 1;
            }
            else if(self.stats.damageType !== 'magic' && self.cooldown <= 0){
                for(var i in self.ability.attackPattern){
                    self.addToEventQ(self.ability.ability + 'Attack',self.ability.attackPattern[i]);
                }
                self.doPassive();
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
            player.petType = 'kiol';
        }
        if(!ENV.Peaceful){
            var pet = Pet({
                parent:player.id,
                x:player.x + 128 * (Math.random() - 0.5),
                y:player.y + 128 * (Math.random() - 0.5),
                petType:param.petType || 'kiol',
                name:' Lvl.' + player.level,
                moveSpeed:5 + player.level / 5,
            });
            if(player.petType === 'kiol'){
                pet.name = 'Kiol' + pet.name;
            }
            if(player.petType === 'cherrier'){
                pet.name = 'Cherrier' + pet.name;
            }
            if(player.petType === 'sphere'){
                pet.name = 'Sphere' + pet.name;
            }
            if(player.petType === 'thunderbird'){
                pet.name = 'Thunderbird' + pet.name;
            }
            player.pet = pet.id;
            for(var i in SOCKET_LIST){
                SOCKET_LIST[i].emit('initEntity',pet.getInitPack());
            }
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
            if(player.quest === false && player.questInfo.quest === false){
                for(var i in Player.list){
                    if(Player.list[i].quest === data){
                        if(questData[data].multiplePlayers === false){
                            socket.emit('notification','[!] A player is already doing the quest ' + player.quest + '.');
                            return;
                        }
                    }
                }
                if(player.checkQuestRequirements(data) === true){
                    player.questInfo.quest = data;
                    player.questStage = questData[data].startStage;
                    player.questInfo.started = true;
                }
                else{
                    socket.emit('notification','[!] You do not meet the requirements to do this quest.');
                }
            }
            else if(player.questInfo.quest === data){
                for(var i in Player.list){
                    if(Player.list[i].quest === data){
                        if(questData[data].multiplePlayers === false){
                            socket.emit('notification','[!] A player is already doing the quest ' + player.quest + '.');
                            return;
                        }
                    }
                }
                player.questInfo.started = true;
            }
            else if(player.quest !== false){
                socket.emit('notification','[!] Finish the quest ' + player.quest + ' before starting a new quest.');
            }
            else if(player.questInfo.quest !== false && player.invincible){
                socket.emit('notification','[!] Finish the quest ' + player.questInfo.quest + ' before starting a new quest.');
            }
            else{
                for(var i in Player.list){
                    if(Player.list[i].quest === data){
                        if(questData[data].multiplePlayers === false){
                            socket.emit('notification','[!] A player is already doing the quest ' + player.quest + '.');
                            return;
                        }
                    }
                }
                if(player.checkQuestRequirements(data) === true){
                    player.questInfo.quest = data;
                    player.questStage = questData[data].startStage;
                    player.questInfo.started = true;
                }
                else{
                    socket.emit('notification','[!] You do not meet the requirements to do this quest.');
                }
            }
        });
        socket.on('waypoint',function(data){
            if(player.quest === 'Lightning Lizard Boss' || player.quest === 'Monster Raid' || player.quest === 'Clear Tower' || player.quest === 'Wood Delivery' || player.quest === 'Lost Rubies'){
                socket.emit('notification','[!] Waypoints have been disabled in this quest.');
            }
            else if(player.map === 'The Pet Arena' || player.map === 'Mysterious Room' || player.map === 'The Tutorial' || player.map === 'The Battlefield' || player.map === 'Secret Tunnel Part 1'){
                socket.emit('notification','[!] Waypoints have been disabled in this map.');
            }
            else if(data === 'The Village'){
                player.teleport(2080,1760,data);
            }
            else if(data === 'Lilypad Pathway Part 1'){
                if(player.questStats['Lightning Lizard Boss']){
                    player.teleport(1376,1632,data);
                }
                else{
                    socket.emit('notification','[!] Complete the Lightning Lizard Boss quest to gain access to this waypoint.');
                }
            }
            else if(data === 'The Graveyard'){
                if(player.questStats['Possessed Spirit']){
                    player.teleport(2048,1376,data);
                }
                else{
                    socket.emit('notification','[!] Defeat Possessed Spirit to gain access to this waypoint.');
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
                    socket.emit('notification','[!] Complete the Lightning Lizard Boss quest to gain access to this waypoint.');
                }
            }
            else if(data === 'Lilypad Temple Room 2'){
                if(player.questStats['Plantera']){
                    player.teleport(96,3104,data);
                }
                else{
                    socket.emit('notification','[!] Defeat Plantera to gain access to this waypoint.');
                }
            }
            else if(data === 'Deserted Town'){
                if(player.questStats['Plantera']){
                    player.teleport(2144,2144,data);
                }
                else{
                    socket.emit('notification','[!] Defeat Plantera to gain access to this waypoint.');
                }
            }
            else if(data === 'Lilypad Kingdom'){
                if(player.questStats['Plantera']){
                    player.teleport(1600,2144,data);
                }
                else{
                    socket.emit('notification','[!] Defeat Plantera to gain access to this waypoint.');
                }
            }
            else{
                socket.emit('notification','Stop hacking.');
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
        for(var i in Player.list[socket.id].questDependent){
            if(Player.list[socket.id].questDependent[i].type === 'Collision'){
                Player.list[socket.id].questDependent[i].toRemove = true;
                Collision.list[Player.list[socket.id].questDependent[i].map][Math.round(Player.list[socket.id].questDependent[i].x / 64)][Math.round(Player.list[socket.id].questDependent[i].y / 64)] = 0;
            }
        }
        for(var i in Player.list[socket.id].questDependent){
            Player.list[socket.id].questDependent[i].toRemove = true;
        }
        var newTiles = [];
        for(var i in tiles){
            if(tiles[i].parent !== socket.id){
                newTiles.push(tiles[i]);
            }
            else{
                for(var j in SOCKET_LIST){
                    SOCKET_LIST[j].emit('removeTile',{
                        x:tiles[i].x,
                        y:tiles[i].y,
                        map:tiles[i].map,
                        tile_idx:tiles[i].tile_idx,
                        canvas:tiles[i].canvas,
                    });
                }
            }
        }
        tiles = newTiles;
        addToChat('style="color: #ff0000">',Player.list[socket.id].displayName + " logged off.");
        playerMap[Player.list[socket.id].map] -= 1;
        delete Player.list[socket.id];
    }
}
Player.getAllInitPack = function(socket){
    try{
        var player = Player.list[socket.id];
        var pack = {player:[],projectile:[],monster:[],npc:[],pet:[],particle:[],sound:[]};
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
    catch(err){
        console.error(err);
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
	self.id = Math.random();
    self.map = param.map;
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
                if(Player.list[i].hp > 1 && Player.list[i].map === self.map){
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
            if(self.getSquareDistance(self.target) > 512 && self.boss === false){
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
                            self.attackState = 'explodeCherryBomb';
                        }
                        break;
                    }
                    if(self.damaged && self.damagedEntity.type === 'Player'){
                        self.stats.defense *= 200;
                        self.stats.attack *= 200;
                        self.attackState = 'explodeCherryBomb';
                    }
                    break;
                case "explodeCherryBomb":
                    self.trackingEntity = undefined;
                    if(self.animation > 4){
                        self.width = 18 * 8;
                        self.height = 18 * 8;
                        self.pushPower = 300;
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
                        self.shootProjectile(self.id,'Monster',self.direction + 10 * (self.reload % 50),self.direction + 10 * (self.reload % 50),'possessedSoul',128,function(t){return 50},0,self.stats,'noCollision');
                        self.shootProjectile(self.id,'Monster',self.direction + 10 * (self.reload % 50) + 90,self.direction + 10 * (self.reload % 50) + 90,'possessedSoul',128,function(t){return 50},0,self.stats,'noCollision');
                        self.shootProjectile(self.id,'Monster',self.direction + 10 * (self.reload % 50) + 180,self.direction + 10 * (self.reload % 50) + 180,'possessedSoul',128,function(t){return 50},0,self.stats,'noCollision');
                        self.shootProjectile(self.id,'Monster',self.direction + 10 * (self.reload % 50) + 270,self.direction + 10 * (self.reload % 50) + 270,'possessedSoul',128,function(t){return 50},0,self.stats,'noCollision');
                        self.shootProjectile(self.id,'Monster',self.direction + 10 * (self.reload % 50) + 10,self.direction + 10 * (self.reload % 50) + 10,'possessedSoul',128,function(t){return 50},0,self.stats,'noCollision');
                        self.shootProjectile(self.id,'Monster',self.direction + 10 * (self.reload % 50) + 100,self.direction + 10 * (self.reload % 50) + 100,'possessedSoul',128,function(t){return 50},0,self.stats,'noCollision');
                        self.shootProjectile(self.id,'Monster',self.direction + 10 * (self.reload % 50) + 190,self.direction + 10 * (self.reload % 50) + 190,'possessedSoul',128,function(t){return 50},0,self.stats,'noCollision');
                        self.shootProjectile(self.id,'Monster',self.direction + 10 * (self.reload % 50) + 280,self.direction + 10 * (self.reload % 50) + 280,'possessedSoul',128,function(t){return 50},0,self.stats,'noCollision');
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
                        self.shootProjectile(self.id,'Monster',self.direction + i * 12,self.direction + i * 12,'possessedSoul',128,function(t){return 50},0,self.stats,'noCollision');
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
                        self.shootProjectile(self.id,'Monster',self.direction + 10 * (self.reload % 30),self.direction + 10 * (self.reload % 30),'possessedSoul',128,function(t){return 50},0,self.stats,'noCollision');
                        self.shootProjectile(self.id,'Monster',self.direction + 10 * (self.reload % 30) + 90,self.direction + 10 * (self.reload % 30) + 90,'possessedSoul',128,function(t){return 50},0,self.stats,'noCollision');
                        self.shootProjectile(self.id,'Monster',self.direction + 10 * (self.reload % 30) + 180,self.direction + 10 * (self.reload % 30) + 180,'possessedSoul',128,function(t){return 50},0,self.stats,'noCollision');
                        self.shootProjectile(self.id,'Monster',self.direction + 10 * (self.reload % 30) + 270,self.direction + 10 * (self.reload % 30) + 270,'possessedSoul',128,function(t){return 50},0,self.stats,'noCollision');
                        self.shootProjectile(self.id,'Monster',self.direction + 10 * (self.reload % 30) + 10,self.direction + 10 * (self.reload % 30) + 10,'possessedSoul',128,function(t){return 50},0,self.stats,'noCollision');
                        self.shootProjectile(self.id,'Monster',self.direction + 10 * (self.reload % 30) + 100,self.direction + 10 * (self.reload % 30) + 100,'possessedSoul',128,function(t){return 50},0,self.stats,'noCollision');
                        self.shootProjectile(self.id,'Monster',self.direction + 10 * (self.reload % 30) + 190,self.direction + 10 * (self.reload % 30) + 190,'possessedSoul',128,function(t){return 50},0,self.stats,'noCollision');
                        self.shootProjectile(self.id,'Monster',self.direction + 10 * (self.reload % 30) + 280,self.direction + 10 * (self.reload % 30) + 280,'possessedSoul',128,function(t){return 50},0,self.stats,'noCollision');
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
                        self.shootProjectile(self.id,'Monster',self.direction + 10 * (self.reload % 30),self.direction + 10 * (self.reload % 30),'possessedSoul',128,function(t){return 50},0,self.stats,'noCollision');
                        self.shootProjectile(self.id,'Monster',self.direction + 10 * (self.reload % 30) + 90,self.direction + 10 * (self.reload % 30) + 90,'possessedSoul',128,function(t){return 50},0,self.stats,'noCollision');
                        self.shootProjectile(self.id,'Monster',self.direction + 10 * (self.reload % 30) + 180,self.direction + 10 * (self.reload % 30) + 180,'possessedSoul',128,function(t){return 50},0,self.stats,'noCollision');
                        self.shootProjectile(self.id,'Monster',self.direction + 10 * (self.reload % 30) + 270,self.direction + 10 * (self.reload % 30) + 270,'possessedSoul',128,function(t){return 50},0,self.stats,'noCollision');
                        self.shootProjectile(self.id,'Monster',self.direction + 10 * (self.reload % 30) + 10,self.direction + 10 * (self.reload % 30) + 10,'possessedSoul',128,function(t){return 50},0,self.stats,'noCollision');
                        self.shootProjectile(self.id,'Monster',self.direction + 10 * (self.reload % 30) + 100,self.direction + 10 * (self.reload % 30) + 100,'possessedSoul',128,function(t){return 50},0,self.stats,'noCollision');
                        self.shootProjectile(self.id,'Monster',self.direction + 10 * (self.reload % 30) + 190,self.direction + 10 * (self.reload % 30) + 190,'possessedSoul',128,function(t){return 50},0,self.stats,'noCollision');
                        self.shootProjectile(self.id,'Monster',self.direction + 10 * (self.reload % 30) + 280,self.direction + 10 * (self.reload % 30) + 280,'possessedSoul',128,function(t){return 50},0,self.stats,'noCollision');
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
                            self.attackState = 'explodeDeathBomb';
                        }
                        break;
                    }
                    if(self.damaged && self.damagedEntity.type === 'Player'){
                        self.stats.defense *= 200;
                        self.stats.attack *= 200;
                        self.attackState = 'explodeDeathBomb';
                    }
                    break;
                case "explodeDeathBomb":
                    self.trackingEntity = undefined;
                    if(self.animation > 4){
                        self.width = 18 * 8;
                        self.height = 18 * 8;
                        self.pushPower = 300;
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
                    if(self.reload % 40 < 15 && self.target.invincible === false){
                        self.shootProjectile(self.id,'Monster',self.direction + Math.random() * 20 - 10,self.direction + Math.random() * 20 - 10,'rock',Math.random() * 20 + 10,function(t){return 25},0,self.stats);
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
    if(self.petType === 'cherrier'){
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
    if(self.petType === 'sphere'){
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
    if(self.petType === 'thunderbird'){
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
        if(self.petType === 'kiol'){
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
        else if(self.petType === 'cherrier'){
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
        else if(self.petType === 'sphere'){
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
        else if(self.petType === 'thunderbird'){
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
    }
    if(param.projectilePattern === 'spinAroundPlayer'){
        self.angle = param.angle / 180 * Math.PI;
        self.canCollide = false;
        self.spdX = 0;
        self.spdY = 0;
        self.relativeToPlayer = self.parent;
    }
    if(param.projectilePattern === 'spinAroundMonster'){
        self.angle = param.angle / 180 * Math.PI;
        self.canCollide = false;
        self.spdX = 0;
        self.spdY = 0;
    }
    if(param.projectilePattern === 'splaser'){
        self.angle = param.angle / 180 * Math.PI;
        self.canCollide = false;
        self.spdX = 0;
        self.spdY = 0;
    }
    if(param.projectilePattern === 'playerSplaser'){
        self.angle = param.angle / 180 * Math.PI;
        self.canCollide = false;
        self.spdX = 0;
        self.spdY = 0;
        self.relativeToPlayer = self.parent;
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
        self.parentStartX = 0;
        self.parentStartY = 0;
        if(Player.list[self.parent]){
            self.parentStartX = Player.list[self.parent].x;
            self.parentStartY = Player.list[self.parent].y;
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
        //self.canCollide = false;
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
        if(self.x < self.width / 2 && self.canCollide){
            self.x = self.width / 2;
            if(param.projectilePattern === 'bounceOffCollisions'){
                self.spdX = -self.spdX;
            }
            else{
                self.toRemove = true;
            }
        }
        if(self.x > self.mapWidth - self.width / 2 && self.canCollide){
            self.x = self.mapWidth - self.width / 2;
            if(param.projectilePattern === 'bounceOffCollisions'){
                self.spdX = -self.spdX;
            }
            else{
                self.toRemove = true;
            }
        }
        if(self.y < self.height / 2 && self.canCollide){
            self.y = self.height / 2;
            if(param.projectilePattern === 'bounceOffCollisions'){
                self.spdY = -self.spdY;
            }
            else{
                self.toRemove = true;
            }
        }
        if(self.y > self.mapHeight - self.height / 2 && self.canCollide){
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
            self.spdX *= 1.1;
            self.spdY *= 1.1;
        }
        else if(param.projectilePattern === 'boomerang'){
            if(Player.list[self.parent] === undefined){
                self.toRemove = true;
            }
            else if(Math.abs(Player.list[self.parent].x - self.x) < 32 && Math.abs(Player.list[self.parent].y - self.y) < 32 && self.timer > 10){
                self.toRemove = true;
            }
            else{
                self.spdX += Math.cos(Math.atan2(Player.list[self.parent].y - self.y,Player.list[self.parent].x - self.x)) * 5;
                self.spdY += Math.sin(Math.atan2(Player.list[self.parent].y - self.y,Player.list[self.parent].x - self.x)) * 5;
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

var renderLayer = function(layer,data,loadedMap){
    if(layer.type !== "tilelayer" || layer.visible === true){
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
var compareMaps = function(a,b){
    if(a.y === b.y){
        return a.x - b.x;
    }
    return a.y - b.y;
}
fs.readFile("./client/maps/World.world","utf8",function(err,data){
    worldMap = JSON.parse(data).maps;
    worldMap["Lilypad Temple Room 0"];
    worldMap["Lilypad Temple Room 1"];
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
                            if(Player.list[i].isColliding(Projectile.list[j]) && "" + Projectile.list[j].parent !== i){
                                if(ENV.PVP){
                                    Player.list[i].onCollision(Projectile.list[j],1);
                                    Projectile.list[j].onCollision(Projectile.list[j],Player.list[i]);
                                    Player.list[i].onPush(Projectile.list[j],1);
                                }
                                else if(Projectile.list[j].parentType !== 'Player'){
                                    Player.list[i].onCollision(Projectile.list[j],1);
                                    Projectile.list[j].onCollision(Projectile.list[j],Player.list[i]);
                                    Player.list[i].onPush(Projectile.list[j],1);
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
                            if(Monster.list[i].isColliding(Projectile.list[j]) && "" + Projectile.list[j].parent !== i){
                                Monster.list[i].onCollision(Projectile.list[j],1);
                                Projectile.list[j].onCollision(Projectile.list[j],Monster.list[i]);
                                Monster.list[i].onPush(Projectile.list[j],1);
                            }
                        }
                    }
                }
            }
        }
        for(var j in Player.list){
            if(Monster.list[i] && Player.list[j]){
                if(Monster.list[i].isColliding(Player.list[j]) && Player.list[j].invincible === false && Monster.list[i].invincible === false){
                    Player.list[j].onPush(Monster.list[i],2);
                    Monster.list[i].onPush(Player.list[j],2);
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
		if(Item.list[i].rarity > 1){
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
		if(currentItem <= items && item === undefined && Item.list[i].rarity > 1){
			var item = Item.list[i].id;
		}
	}
	var enchantments = [];
	for(var i in Item.list[item].enchantments){
		for(var j in Enchantment.list){
			if(j === Item.list[item].enchantments[i]){
				var enchantment = Enchantment.list[j];
				if(Math.random() < enchantment.dropChance * 3){
					enchantments.push({id:j,level:Math.min(Math.max(0.001,Math.round(enchantment.averageLevel + (Math.random() * 2 - 1) * enchantment.deviation * 1000) / 1000),enchantment.maxLevel)});
				}
			}
		}
	}
	return {
		id:item,
		enchantments:enchantments,
	};
}

setInterval(function(){
    for(var i in Npc.list){
        if(Npc.list[i].entityId === 'wanderingtrader'){
            var npc = Npc.list[i];
        }
    }
	npc.shop = [
		{
			id:'lesserrandomboostpotion',
			enchantments:[]
		},
		{
			id:'skullofdeath',
			enchantments:[]
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
    for(var i in Npc.list){
        if(Npc.list[i].entityId === 'wanderingtrader'){
            var npc = Npc.list[i];
            npc.shop = [
                {
                    id:'lesserrandomboostpotion',
                    enchantments:[]
                },
                {
                    id:'skullofdeath',
                    enchantments:[]
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
        }
    }
},1000);