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
    5000,
    10000,
    15000,
    20000,
    25000,
    30000,
    35000,
    40000,
    45000,
    50000,
    55000,
    60000,
    65000,
    70000,
    75000,
    80000,
    85000,
    90000,
    95000,
    100000,
    110000,
    120000,
    130000,
    140000,
    150000,
    160000,
    170000,
    180000,
    190000,
    200000,
    220000,
    240000,
    260000,
    280000,
    300000,
    400000,
    550000,
    700000,
    1000000,
    1400000,
    2000000,
    2750000,
    4000000,
    7250000,
    10000000,
    15000000,
    25000000,
    40000000,
    70000000,
    100000000,
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
    if(map.includes('Lilypad')){
        isFireMap = true;
    }
    if(map.includes('Arena')){
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
};

var monsterData = require('./monsters.json');
var worldData = require('./world.json');
var projectileData = require('./client/projectiles.json');

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
            if(spawner.map === 'The Arena'){
                monsterHp *= 10;
                monsterStats.attack *= 10;
                xpGain *= 10;
            }
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
        if(playerMap[Npc.list[i].map] > 0){
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
    for(var i in Sound.list){
        if(!pack[Sound.list[i].map]){
            pack[Sound.list[i].map] = {player:[],projectile:[],monster:[],npc:[],pet:[],particle:[],sound:[]};
        }
        var updatePack = Sound.list[i].getUpdatePack();
        pack[Sound.list[i].map].sound.push(updatePack);
        delete Sound.list[i];
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
    for(var i in Collision2.list){
        if(Collision2.list[i].toRemove){
            delete Collision2.list[i];
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
                        monsterHp *= 25;
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
                        monsterHp *= 100;
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
                        monsterHp *= 30;
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
                        monsterHp *= 10;
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
                        monsterHp *= 5;
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
                addToChat('style="color: #00aadd">','You expected a reward beyond this mere leaf? Patience, the true reward will come apparent in time...');
                ENV.BossRushStage = 0;
                ENV.BossRush = false;
                for(var i in Player.list){
                    if(Player.list[i].map === 'The Arena'){
                        Player.list[i].xp += 500000 * Player.list[i].stats.xp;
                        Player.list[i].inventory.addItem('leaf',[]);
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
            if(self.followingEntity.x - self.x > 0){
                self.spdX = 1;
            }
            else if(self.followingEntity.x - self.x < 0){
                self.spdX = -1;
            }
            else{
                self.spdX = 0;
            }
            if(self.followingEntity.y - self.y > 0){
                self.spdY = 1;
            }
            else if(self.followingEntity.y - self.y < 0){
                self.spdY = -1;
            }
            else{
                self.spdY = 0;
            }
        }
        if(self.randomPos.walking){
            if(self.randomPos.waypoint){
                if(self.randomPos.currentWaypoint){
                    if(self.trackingEntityReached){
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
                    self.trackEntity(self.randomPos.currentWaypoint,1);
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
        self.justCollided = false;
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
    self.onHit = function(pt){
    }
    self.onCollision = function(pt,strength){
        if(!self.invincible && pt.toRemove === false && self.isDead === false){
            var damage = Math.max(Math.round((pt.stats.attack - self.stats.defense) * strength * (1 + Math.random() / 5) * (1 - self.stats.damageReduction)),1);
            //damage = Math.min(self.hp,damage);
            var particleType = 'redDamage';
            if(Math.random() < pt.stats.critChance){
                damage *= 2;
                particleType = 'bigOrangeDamage';
            }
            self.hp -= damage;
            self.onHit(pt);
            if(damage){
                var particle = new Particle({
                    x:self.x + Math.random() * 64 - 32,
                    y:self.y + Math.random() * 64 - 32,
                    map:self.map,
                    particleType:particleType,
                    value:'-' + damage,
                });
            }
            if(pt.projectileType){
                /*
                if(pt.projectileType === 'stoneArrow'){
                    Sound({
                        type:'arrowHit',
                        map:self.map,
                    });
                }
                if(pt.projectileType === 'waterBullet'){
                    Sound({
                        type:'waterHit',
                        map:self.map,
                    });
                }
                if(pt.projectileType === 'fireBullet'){
                    Sound({
                        type:'fireHit',
                        map:self.map,
                    });
                }
                if(pt.projectileType === 'earthBullet'){
                    Sound({
                        type:'earthHit',
                        map:self.map,
                    });
                }
                if(pt.projectilePattern === 'playerHoming' && pt.projectileType === 'fireBullet'){
                    Sound({
                        type:'fireHomingHit',
                        map:self.map,
                    });
                }
                if(pt.projectilePattern === 'monsterHoming'){
                    Sound({
                        type:'fireHomingHit',
                        map:self.map,
                    });
                }
                if(pt.projectileType === 'playerHit'){
                    Sound({
                        type:'playerHit',
                        map:self.map,
                    });
                }
                if(pt.projectileType === 'lizardSpit'){
                    Sound({
                        type:'lizardHit',
                        map:self.map,
                    });
                }*/
            }
        }
        if(self.hp < 1 && self.willBeDead === false && self.isDead === false && self.toRemove === false && pt.toRemove === false && pt.isDead === false){
            if(pt.parentType === 'Player' && self.type === 'Monster'){
                if(Player.list[pt.parent].isDead === false){
                    if(self.itemDrops === {}){
                        
                    }
                    else{
                        for(var i in self.itemDrops){
                            if(self.itemDrops[i] * Player.list[pt.parent].stats.luck > Math.random()){
                                var itemIndex = Player.list[pt.parent].inventory.addItem(i,[]);
                                Player.list[pt.parent].inventory.addRandomizedEnchantments(itemIndex,Player.list[pt.parent].stats.luck);
                                var item = Player.list[pt.parent].inventory.items[itemIndex];
                                addToChat('style="color: ' + Player.list[pt.parent].textColor + '">',Player.list[pt.parent].displayName + " got a " + Item.list[item.id].name + ".");
                            }
                        }
                    }
                    Player.list[pt.parent].xp += self.xpGain * Math.round((10 + Math.random() * 10) * Player.list[pt.parent].stats.xp);
                }
            }
            if(pt.type === 'Player' && self.type === 'Monster'){
                if(self.itemDrops === {}){
                        
                }
                else{
                    for(var i in self.itemDrops){
                        if(self.itemDrops[i] * pt.stats.luck > Math.random()){
                            var itemIndex = pt.inventory.addItem(i,[]);
                            pt.inventory.addRandomizedEnchantments(itemIndex,pt.stats.luck);
                            var item = pt.inventory.items[itemIndex];
                            addToChat('style="color: ' + pt.textColor + '">',pt.displayName + " got a " + Item.list[item.id].name + ".");
                        }
                    }
                }
                pt.xp += Math.round(self.xpGain * (10 + Math.random() * 10) * pt.stats.xp);
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
        if(self.canCollide === false){
            return;
        }
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
                    self.doCollision(Collision2.list[firstTile]);
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

        if(Collision.list[firstTile]){
            self.justCollided = true;
        }
        if(Collision.list[secondTile]){
            self.justCollided = true;
        }
        if(Collision.list[thirdTile]){
            self.justCollided = true;
        }
        if(Collision.list[fourthTile]){
            self.justCollided = true;
        }
        if(Collision2.list[firstTile]){
            self.justCollided = true;
        }
        if(Collision2.list[secondTile]){
            self.justCollided = true;
        }
        if(Collision2.list[thirdTile]){
            self.justCollided = true;
        }
        if(Collision2.list[fourthTile]){
            self.justCollided = true;
        }
        if(Collision3.list[firstTile]){
            self.justCollided = true;
        }
        if(Collision3.list[secondTile]){
            self.justCollided = true;
        }
        if(Collision3.list[thirdTile]){
            self.justCollided = true;
        }
        if(Collision3.list[fourthTile]){
            self.justCollided = true;
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
    self.xpMax = 100;
    self.level = 0;
    self.levelMax = 100;
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
        "Missing Person":false,
        "Weird Tower":false,
        "Clear River":false,
        "Clear Tower":false,
        "Lightning Lizard Boss":false,
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
    self.passive = '';
    self.weaponPassive = '';
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
    if(self.inventory.items.length === 0){
        self.inventory.addItem('simplewoodenbow',[])
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
    self.hpMax = 100 + self.level * 10;
    self.maxSpeed = 20 + Math.floor(self.level / 10);
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
    }
    self.currentItem = '';
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
        if(!self.invincible && self.isDead === false){
            if(self.manaRefresh <= -10){
                self.mana += 5 * self.manaRegen;
            }
            self.mana += 0.1 * self.manaRegen;
        }
        if(Math.round(self.mana) >= self.manaMax){
            self.mana = self.manaMax;
        }
        if(self.hp < 1){
            self.hp = 0;
            if(self.willBeDead){
                Player.spectate(socket);
                addToChat('style="color: #ff0000">',self.displayName + ' died.');
                self.quest = false;
                self.questInfo = {
                    quest:false,
                };
                for(var i in self.questDependent){
                    self.questDependent[i].toRemove = true;
                }
                socket.emit('dialougeLine',{
                    state:'remove',
                });
            }
        }
        else{
            if(self.hp > self.hpMax){
                self.hp = self.hpMax;
            }
            else{
                if(self.regenTick % 10 === 0){
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
        self.updateQuest();
        if(!self.invincible && self.isDead === false){
            self.updateAttack();
        }
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
            if(Npc.list[i].map === self.map && Npc.list[i].entityId === 'bob' && self.mapChange > 20 && Npc.list[i].x - 32 < self.mouseX && Npc.list[i].x + 32 > self.mouseX && Npc.list[i].y - 32 < self.mouseY && Npc.list[i].y + 32 > self.mouseY && self.keyPress.second === true){
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
                else if(self.questStage === 4 && self.quest === 'Missing Person'){
                    self.questStage += 1;
                    self.invincible = true;
                    socket.emit('dialougeLine',{
                        state:'ask',
                        message:'Thanks. The map The River is to the west of The Village, which is where you are now.',
                        response1:'*End conversation*',
                    });
                }
                else if(self.questStage === 11){
                    self.questStage += 1;
                    self.invincible = true;
                    socket.emit('dialougeLine',{
                        state:'ask',
                        message:'Oh, Mark is fine? That\'s great!',
                        response1:'*End conversation*',
                    });
                }
                else{
                    socket.emit('addToChat',{
                        style:'style="color: #ff0000">',
                        message:'[!] This NPC doesn\'t want to talk to you right now.',
                        debug:false,
                    });
                }
                self.keyPress.second = false;
            }
            if(Npc.list[i].map === self.map && Npc.list[i].entityId === 'john' && self.mapChange > 20 && Npc.list[i].x - 32 < self.mouseX && Npc.list[i].x + 32 > self.mouseX && Npc.list[i].y - 32 < self.mouseY && Npc.list[i].y + 32 > self.mouseY && self.keyPress.second === true){
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
                else if(self.quest === false && self.questInfo.quest === false && self.questStats["Missing Person"] === true){
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
                else if(self.questStage === 7 && self.quest === 'Weird Tower'){
                    self.questStage += 1;
                    self.invincible = true;
                    socket.emit('dialougeLine',{
                        state:'ask',
                        message:'Thanks. Go investigate that weird tower.',
                        response1:'*End conversation*',
                    });
                }
                else if(self.questStage === 13){
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
                else{
                    socket.emit('addToChat',{
                        style:'style="color: #ff0000">',
                        message:'[!] This NPC doesn\'t want to talk to you right now.',
                        debug:false,
                    });
                }
                self.keyPress.second = false;
            }
            if(Npc.list[i].map === self.map && Npc.list[i].entityId === 'fisherman' && self.mapChange > 20 && Npc.list[i].x - 32 < self.mouseX && Npc.list[i].x + 32 > self.mouseX && Npc.list[i].y - 32 < self.mouseY && Npc.list[i].y + 32 > self.mouseY && self.keyPress.second === true){
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
                else if(self.quest === false && self.questInfo.quest === false && self.questStats["Weird Tower"] === true){
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
                else if(self.questStage === 6 && self.quest === 'Clear River'){
                    self.questStage += 1;
                    self.invincible = true;
                    socket.emit('dialougeLine',{
                        state:'ask',
                        message:'Ok, go kill those Monsters!',
                        response1:'*End conversation*',
                    });
                }
                else if(self.questStage === 11 && self.quest === 'Clear River'){
                    self.questStage += 1;
                    self.invincible = true;
                    socket.emit('dialougeLine',{
                        state:'ask',
                        message:'You did it? Thanks! Here is a reward.',
                        response1:'*End conversation*',
                    });
                }
                else{
                    socket.emit('addToChat',{
                        style:'style="color: #ff0000">',
                        message:'[!] This NPC doesn\'t want to talk to you right now.',
                        debug:false,
                    });
                }
                self.keyPress.second = false;
            }
            if(Npc.list[i].map === self.map && Npc.list[i].entityId === 'wizard' && self.mapChange > 20 && Npc.list[i].x - 32 < self.mouseX && Npc.list[i].x + 32 > self.mouseX && Npc.list[i].y - 32 < self.mouseY && Npc.list[i].y + 32 > self.mouseY && self.keyPress.second === true){
                if(self.quest === false && self.questInfo.quest === false && self.questStats["Clear River"] === true){
                    self.questStage = 1;
                    self.invincible = true;
                    self.quest = 'Enchanter';
                    socket.emit('dialougeLine',{
                        state:'ask',
                        message:'You seem worthy enough to enchant an item. Do you want me to help you enchant an item?',
                        response1:'Yes, please.',
                        response2:'No, I\'m good.',
                    });
                }
                else{
                    socket.emit('addToChat',{
                        style:'style="color: #ff0000">',
                        message:'[!] This NPC doesn\'t want to talk to you right now.',
                        debug:false,
                    });
                }
                self.keyPress.second = false;
            }
            if(Npc.list[i].map === self.map && Npc.list[i].entityId === 'joe' && self.mapChange > 20 && Npc.list[i].x - 32 < self.mouseX && Npc.list[i].x + 32 > self.mouseX && Npc.list[i].y - 32 < self.mouseY && Npc.list[i].y + 32 > self.mouseY && self.keyPress.second === true){
                if(self.quest === false && self.questInfo.quest === false && self.questStats["Clear River"] === true){
                    self.questStage = 2;
                    self.invincible = true;
                    self.questInfo.quest = 'Clear Tower';
                    socket.emit('dialougeLine',{
                        state:'ask',
                        message:'Rumor is that the last player who helped Fisherman saw a red monster infused with evil in the weird tower. I really don\'t want evil red monsters roaming in the forest, so could you please kill it?',
                        response1:'Sure! I can help you!',
                        response2:'No, I\'m good.',
                    });
                }
                else if(self.quest === false && self.questInfo.quest === false && self.questStats["Clear River"] === false){
                    self.questStage = 1;
                    self.invincible = true;
                    self.questInfo.quest = 'Clear Tower';
                    socket.emit('dialougeLine',{
                        state:'ask',
                        message:'Leave. I\'m already stranded on this island.',
                        response1:'Fine.',
                    });
                }
                else if(self.questStage === 5 && self.quest === 'Clear Tower'){
                    self.questStage += 1;
                    self.invincible = true;
                    socket.emit('dialougeLine',{
                        state:'ask',
                        message:'Thanks for helping me confirm this rumor.',
                        response1:'*End conversation*',
                    });
                }
                else if(self.questStage === 11 && self.quest === 'Clear Tower'){
                    self.questStage += 1;
                    self.invincible = true;
                    socket.emit('dialougeLine',{
                        state:'ask',
                        message:'You found the tower? Were the rumors true?',
                        response1:'Yes.',
                        response2:'No.',
                    });
                }
                else{
                    socket.emit('addToChat',{
                        style:'style="color: #ff0000">',
                        message:'[!] This NPC doesn\'t want to talk to you right now.',
                        debug:false,
                    });
                }
                self.keyPress.second = false;
            }
            if(Npc.list[i].map === self.map && Npc.list[i].entityId === 'hunter' && self.mapChange > 20 && Npc.list[i].x - 32 < self.mouseX && Npc.list[i].x + 32 > self.mouseX && Npc.list[i].y - 32 < self.mouseY && Npc.list[i].y + 32 > self.mouseY && self.keyPress.second === true){
                if(self.quest === false && self.questInfo.quest === false && self.questStats["Clear Tower"] === true){
                    self.questStage = 2;
                    self.invincible = true;
                    self.questInfo.quest = 'Lightning Lizard Boss';
                    socket.emit('dialougeLine',{
                        state:'ask',
                        message:'I came to Lilypad Pathway Part 1 because some guy called Joe said there were strong monsters here for me to fight. I saw this old temple and decided to go in, and there was this huge lizard. You seem strong enough to kill it. Could you kill this lizard?',
                        response1:'Sure! I will kill this lizard.',
                        response2:'Nah, sounds too scary.',
                    });
                }
                else if(self.quest === false && self.questInfo.quest === false && self.questStats["Clear Tower"] === false){
                    self.questStage = 1;
                    self.invincible = true;
                    self.questInfo.quest = 'Lightning Lizard Boss';
                    socket.emit('dialougeLine',{
                        state:'ask',
                        message:'I don\'t need help from a weakling like you. Go talk to Joe in The Docks and defeat the red monster first.',
                        response1:'Ok.',
                    });
                }
                else if(self.questStage === 5 && self.quest === 'Lightning Lizard Boss'){
                    self.questStage += 1;
                    self.invincible = true;
                    socket.emit('dialougeLine',{
                        state:'ask',
                        message:'Thanks for killing this giant Lizard.',
                        response1:'*End conversation*',
                    });
                }
                else if(self.questStage === 13 && self.quest === 'Lightning Lizard Boss'){
                    self.questStage += 1;
                    self.invincible = true;
                    socket.emit('dialougeLine',{
                        state:'ask',
                        message:'Did you kill the Lightning Lizard?',
                        response1:'Yes I did!',
                    });
                }
                else{
                    socket.emit('addToChat',{
                        style:'style="color: #ff0000">',
                        message:'[!] This NPC doesn\'t want to talk to you right now.',
                        debug:false,
                    });
                }
                self.keyPress.second = false;
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
                        hp:250 * ENV.MonsterStrength,
                        monsterType:'blueBall',
                        attackState:'passiveBall',
                        width:monsterData['blueBall'].width,
                        height:monsterData['blueBall'].height,
                        xpGain:monsterData['blueBall'].xpGain * 10,
                        stats:{
                            attack:15 * ENV.MonsterStrength,
                            defense:3,
                            heal:0 * ENV.MonsterStrength,
                            damageReduction:0,
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
                        hp:10 * ENV.MonsterStrength,
                        monsterType:'blueCherryBomb',
                        attackState:'passiveCherryBomb',
                        width:monsterData['blueCherryBomb'].width,
                        height:monsterData['blueCherryBomb'].height,
                        xpGain:monsterData['blueCherryBomb'].xpGain * 10,
                        stats:{
                            attack:5000 * ENV.MonsterStrength,
                            defense:0,
                            heal:0,
                            damageReduction:0,
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
                    for(var j in Player.list){
                        if(Player.list[j].map === self.map && Player.list[j].isColliding(self.questDependent[i])){
                            Player.list[j].teleport(ENV.Spawnpoint.x,ENV.Spawnpoint.y,ENV.Spawnpoint.map);
                        }
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
        
        if(self.currentResponse === 1 && self.questStage === 1 && self.quest === 'Enchanter'){
            self.questStage += 1;
            socket.emit('dialougeLine',{
                state:'ask',
                message:'Okay, now select an item you want to enchant.',
                response1:'...',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 2 && self.questStage === 1 && self.quest === 'Enchanter'){
            self.quest = false;
            self.invincible = false;
            socket.emit('dialougeLine',{
                state:'remove',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 2 && self.quest === 'Enchanter'){
            self.questStage += 1;
            self.invincible = false;
            socket.emit('dialougeLine',{
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
                socket.emit('dialougeLine',{
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
                self.questInfo.enchant1 = item.enchantments[Math.floor(Math.random() * item.enchantments.length)];
                self.questInfo.enchant2 = item.enchantments[Math.floor(Math.random() * item.enchantments.length)];
                self.questInfo.enchant3 = item.enchantments[Math.floor(Math.random() * item.enchantments.length)];
                self.questInfo.enchant4 = item.enchantments[Math.floor(Math.random() * item.enchantments.length)];
                socket.emit('dialougeLine',{
                    state:'ask',
                    message:'Good, now choose an enchantment.',
                    response1:Enchantment.list[self.questInfo.enchant1].name + ' I',
                    response2:Enchantment.list[self.questInfo.enchant2].name + ' I',
                    response3:Enchantment.list[self.questInfo.enchant3].name + ' I',
                    response4:Enchantment.list[self.questInfo.enchant4].name + ' II',
                });
                socket.emit('toggleSelect');
                self.currentResponse = 0;
            }
        }
        if(self.currentResponse === 1 && self.questStage === 4 && self.quest === 'Enchanter'){
            self.questStage += 1;
            socket.emit('dialougeLine',{
                state:'ask',
                message:'And there you go! Your item now has the ' + Enchantment.list[self.questInfo.enchant1].name + ' I enchantment!',
                response1:'Thank you.',
            });
            self.inventory.enchantItem(self.selectedItem,self.questInfo.enchant1,1);
            self.selectedItem = false;
            self.currentResponse = 0;
        }
        if(self.currentResponse === 2 && self.questStage === 4 && self.quest === 'Enchanter'){
            self.questStage += 1;
            socket.emit('dialougeLine',{
                state:'ask',
                message:'And there you go! Your item now has the ' + Enchantment.list[self.questInfo.enchant2].name + ' I enchantment!',
                response1:'Thank you.',
            });
            self.inventory.enchantItem(self.selectedItem,self.questInfo.enchant2,1);
            self.selectedItem = false;
            self.currentResponse = 0;
        }
        if(self.currentResponse === 3 && self.questStage === 4 && self.quest === 'Enchanter'){
            self.questStage += 1;
            socket.emit('dialougeLine',{
                state:'ask',
                message:'And there you go! Your item now has the ' + Enchantment.list[self.questInfo.enchant3].name + ' I enchantment!',
                response1:'Thank you.',
            });
            self.inventory.enchantItem(self.selectedItem,self.questInfo.enchant3,1);
            self.selectedItem = false;
            self.currentResponse = 0;
        }
        if(self.currentResponse === 4 && self.questStage === 4 && self.quest === 'Enchanter'){
            self.questStage += 1;
            socket.emit('dialougeLine',{
                state:'ask',
                message:'And there you go! Your item now has the ' + Enchantment.list[self.questInfo.enchant4].name + ' II enchantment!',
                response1:'Thank you.',
            });
            self.inventory.enchantItem(self.selectedItem,self.questInfo.enchant4,2);
            self.selectedItem = false;
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 5 && self.quest === 'Enchanter'){
            self.quest = false;
            self.invincible = false;
            socket.emit('dialougeLine',{
                state:'remove',
            });
            self.currentResponse = 0;
        }

        if(self.currentResponse === 1 && self.questStage === 1 && self.questInfo.quest === 'Clear Tower'){
            self.invincible = false;
            self.questInfo = {
                quest:false,
            };
            socket.emit('dialougeLine',{
                state:'remove',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 2 && self.questInfo.quest === 'Clear Tower'){
            self.questInfo.started = false;
            self.questStage += 1;
            self.invincible = false;
            socket.emit('dialougeLine',{
                state:'remove',
            });
            socket.emit('questInfo',{
                questName:'Clear Tower',
                questDescription:'Defeat all the monsters in the weird tower in the map The River.',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 2 && self.questStage === 2 && self.questInfo.quest === 'Clear Tower'){
            self.invincible = false;
            self.questInfo = {
                quest:false,
            };
            socket.emit('dialougeLine',{
                state:'remove',
            });
            self.currentResponse = 0;
        }
        if(self.questInfo.started === true && self.questStage === 3 && self.questInfo.quest === 'Clear Tower'){
            self.quest = 'Clear Tower';
            self.questStage += 1;
            self.invincible = true;
            socket.emit('dialougeLine',{
                state:'ask',
                message:'I should talk with Joe.',
                response1:'...',
            });
        }
        if(self.currentResponse === 1 && self.questStage === 4 && self.quest === 'Clear Tower'){
            self.questStage += 1;
            self.invincible = false;
            socket.emit('dialougeLine',{
                state:'remove',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 6 && self.quest === 'Clear Tower'){
            self.questStage += 1;
            self.invincible = false;
            socket.emit('dialougeLine',{
                state:'remove',
            });
            self.currentResponse = 0;
        }
        if(self.questStage === 7 && self.quest === 'Clear Tower' && self.mapChange > 10){
            for(var i in QuestInfo.list){
                if(QuestInfo.list[i].quest === 'Clear Tower' && QuestInfo.list[i].info === 'activator' && self.isColliding(QuestInfo.list[i])){
                    self.questStage = 8;
                    self.questInfo.monstersKilled = 0;
                    self.questInfo.maxMonsters = 0;
                }
            }
        }
        if(self.questStage === 8 && self.quest === 'Clear Tower' && self.mapChange > 10){
            for(var i in QuestInfo.list){
                if(QuestInfo.list[i].quest === 'Clear Tower' && QuestInfo.list[i].info === 'spawner'){
                    self.questDependent[i] = new Monster({
                        x:QuestInfo.list[i].x,
                        y:QuestInfo.list[i].y,
                        map:QuestInfo.list[i].map,
                        moveSpeed:2,
                        hp:250 * ENV.MonsterStrength,
                        monsterType:'snowBall',
                        attackState:'passiveBall',
                        width:monsterData['snowBall'].width,
                        height:monsterData['snowBall'].height,
                        xpGain:monsterData['snowBall'].xpGain * 10,
                        stats:{
                            attack:25 * ENV.MonsterStrength,
                            defense:0,
                            heal:0,
                            damageReduction:0,
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
                if(QuestInfo.list[i].quest === 'Clear Tower' && QuestInfo.list[i].info === 'spawner2'){
                    self.questDependent[i] = new Monster({
                        x:QuestInfo.list[i].x,
                        y:QuestInfo.list[i].y,
                        map:QuestInfo.list[i].map,
                        moveSpeed:2,
                        hp:monsterData['redBird'].hp * ENV.MonsterStrength,
                        monsterType:'redBird',
                        attackState:'passiveRedBird',
                        width:monsterData['redBird'].width,
                        height:monsterData['redBird'].height,
                        xpGain:monsterData['redBird'].xpGain * 10,
                        stats:{
                            attack:monsterData['redBird'].stats.attack * ENV.MonsterStrength,
                            defense:monsterData['redBird'].stats.defense,
                            heal:monsterData['redBird'].stats.heal,
                            damageReduction:monsterData['redBird'].stats.damageReduction,
                        },
                        itemDrops:monsterData['redBird'].itemDrops,
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
                    Sound({
                        type:'homingFireBullet',
                        map:self.map,
                    });
                }
            }
            for(var i in QuestInfo.list){
                if(QuestInfo.list[i].quest === 'Clear Tower' && QuestInfo.list[i].info === 'collision'){
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
                    for(var j in Player.list){
                        if(Player.list[j].map === self.map && Player.list[j].isColliding(self.questDependent[i])){
                            Player.list[j].teleport(ENV.Spawnpoint.x,ENV.Spawnpoint.y,ENV.Spawnpoint.map);
                        }
                    }
                }
            }
            self.questStage += 1;
        }
        if(self.questStage === 9 && self.quest === 'Clear Tower' && self.questInfo.monstersKilled === self.questInfo.maxMonsters){
            self.questStage += 1;
            self.invincible = true;
            socket.emit('dialougeLine',{
                state:'ask',
                message:'I killed the monsters, now I should talk back to Joe.',
                response1:'...',
            });
        }
        if(self.currentResponse === 1 && self.questStage === 10 && self.quest === 'Clear Tower'){
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
        if(self.currentResponse === 1 && self.questStage === 12 && self.quest === 'Clear Tower'){
            self.questStage += 1;
            self.invincible = true;
            socket.emit('dialougeLine',{
                state:'ask',
                message:'The rumors were true? Here, have a reward!',
                response1:'*End conversation*',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 2 && self.questStage === 12 && self.quest === 'Clear Tower'){
            self.questStage += 2;
            self.invincible = true;
            socket.emit('dialougeLine',{
                state:'ask',
                message:'The rumors weren\'t true? I was gonna give you a reward if they were true.',
                response1:'*End conversation*',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 13 && self.quest === 'Clear Tower'){
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
            self.xp += Math.round(25000 * self.stats.xp);
        }
        if(self.currentResponse === 1 && self.questStage === 14 && self.quest === 'Clear Tower'){
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


        if(self.currentResponse === 1 && self.questStage === 1 && self.questInfo.quest === 'Lightning Lizard Boss'){
            self.invincible = false;
            self.questInfo = {
                quest:false,
            };
            socket.emit('dialougeLine',{
                state:'remove',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 2 && self.questInfo.quest === 'Lightning Lizard Boss'){
            self.questInfo.started = false;
            self.questStage += 1;
            self.invincible = false;
            socket.emit('dialougeLine',{
                state:'remove',
            });
            socket.emit('questInfo',{
                questName:'Lightning Lizard Boss',
                questDescription:'Defeat the Lightning Lizard.',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 2 && self.questStage === 2 && self.questInfo.quest === 'Lightning Lizard Boss'){
            self.invincible = false;
            self.questInfo = {
                quest:false,
            };
            socket.emit('dialougeLine',{
                state:'remove',
            });
            self.currentResponse = 0;
        }
        if(self.questInfo.started === true && self.questStage === 3 && self.questInfo.quest === 'Lightning Lizard Boss'){
            self.quest = 'Lightning Lizard Boss';
            self.questStage += 1;
            self.invincible = true;
            socket.emit('dialougeLine',{
                state:'ask',
                message:'I should talk with Hunter.',
                response1:'...',
            });
        }
        if(self.currentResponse === 1 && self.questStage === 4 && self.quest === 'Lightning Lizard Boss'){
            self.questStage += 1;
            self.invincible = false;
            socket.emit('dialougeLine',{
                state:'remove',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 6 && self.quest === 'Lightning Lizard Boss'){
            self.questStage += 1;
            self.invincible = false;
            socket.emit('dialougeLine',{
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
                    self.questDependent[i] = new Monster({
                        x:QuestInfo.list[i].x,
                        y:QuestInfo.list[i].y,
                        map:QuestInfo.list[i].map,
                        moveSpeed:20,
                        hp:monsterData['lightningLizard'].hp * ENV.MonsterStrength,
                        monsterType:'lightningLizard',
                        attackState:'passiveLightningLizard',
                        width:monsterData['lightningLizard'].width,
                        height:monsterData['lightningLizard'].height,
                        xpGain:monsterData['lightningLizard'].xpGain * 10,
                        stats:{
                            attack:monsterData['lightningLizard'].stats.attack * ENV.MonsterStrength,
                            defense:monsterData['lightningLizard'].stats.defense,
                            heal:monsterData['lightningLizard'].stats.heal,
                            damageReduction:monsterData['lightningLizard'].stats.damageReduction,
                        },
                        itemDrops:monsterData['lightningLizard'].itemDrops,
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
                if(QuestInfo.list[i].quest === 'Lightning Lizard Boss' && QuestInfo.list[i].info === 'collision'){
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
            self.questStage += 1;
        }
        if(self.questStage === 9 && self.quest === 'Lightning Lizard Boss'){
            self.questStage += 1;
            self.invincible = true;
            socket.emit('dialougeLine',{
                state:'ask',
                message:'Who dares come in here? I will kill you!',
                response1:'*End conversation*',
            });
        }
        if(self.questStage === 10 && self.quest === 'Lightning Lizard Boss' && self.currentResponse === 1){
            self.questStage += 1;
            self.invincible = false;
            socket.emit('dialougeLine',{
                state:'remove',
            });
            self.currentResponse = 0;
            for(var i in QuestInfo.list){
                if(QuestInfo.list[i].quest === 'Lightning Lizard Boss' && QuestInfo.list[i].info === 'spawner2'){
                    self.questDependent[i] = new Monster({
                        x:QuestInfo.list[i].x,
                        y:QuestInfo.list[i].y,
                        map:QuestInfo.list[i].map,
                        moveSpeed:2,
                        hp:monsterData['greenLizard'].hp * ENV.MonsterStrength,
                        monsterType:'greenLizard',
                        attackState:'passiveLizard',
                        width:monsterData['greenLizard'].width,
                        height:monsterData['greenLizard'].height,
                        xpGain:monsterData['greenLizard'].xpGain,
                        stats:{
                            attack:monsterData['greenLizard'].stats.attack * ENV.MonsterStrength,
                            defense:monsterData['greenLizard'].stats.defense,
                            heal:monsterData['greenLizard'].stats.heal,
                            damageReduction:monsterData['greenLizard'].stats.damageReduction,
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
        }
        if(self.questStage === 11 && self.quest === 'Lightning Lizard Boss' && self.questInfo.monstersKilled === self.questInfo.maxMonsters){
            self.questStage += 1;
            self.invincible = true;
            socket.emit('dialougeLine',{
                state:'ask',
                message:'Woo! Lightning Lizard is dead! Let me go tell Hunter!',
                response1:'...',
            });
        }
        if(self.currentResponse === 1 && self.questStage === 12 && self.quest === 'Lightning Lizard Boss'){
            self.questStage += 1;
            self.invincible = false;
            socket.emit('dialougeLine',{
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
                if(self.questDependent[i].type === 'Collision2'){
                    self.questDependent[i].toRemove = true;
                }
            }
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 14 && self.quest === 'Lightning Lizard Boss'){
            self.questStage += 1;
            self.invincible = true;
            socket.emit('dialougeLine',{
                state:'ask',
                message:'Here is your reward!',
                response1:'*End conversation*',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 15 && self.quest === 'Lightning Lizard Boss'){
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
            self.xp += Math.round(250000 * self.stats.xp);
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
            }
            self.passive = '';
            self.weaponPassive = '';
            self.textColor = '#ffff00';
            self.hpMax = 100 + self.level * 10;
            self.attackCost = 10;
            self.secondCost = 40;
            self.healCost = 50;
            self.manaRegen = 1;
            self.maxMana = 200;
            self.ability = {
                ability:'base',
                attackPattern:[0],
                secondPattern:[0],
                healPattern:[0,20,40,60],
            }
            self.maxSpeed = 20 + Math.floor(self.level / 10);
            self.pushPower = 3;
            damageIncrease = 1;
            self.useTime = 0;
            for(var i in self.inventory.currentEquip){
                if(self.inventory.currentEquip[i].id !== undefined){
                    var item = Item.list[self.inventory.currentEquip[i].id];
                    if(item.damage){
                        self.stats.attack += item.damage;
                    }
                    if(item.critChance){
                        self.stats.critChance += item.critChance;
                    }
                    if(item.defense){
                        self.stats.defense += item.defense;
                    }
                    if(item.damageReduction){
                        self.stats.damageReduction += item.damageReduction;
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
                addToChat('style="color: ' + self.textColor + '">',self.displayName + " went to map " + self.map + ".");
                self.inventory.refreshRender();
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
            self.inventory.refresh = true;
        }
    }
    self.doPassive = function(){
        if(self.passive === 'homingFire'){
            self.shootProjectile(self.id,'Player',self.direction,self.direction,'fireBullet',0,function(t){return 25},0,self.stats,'monsterHoming');
            Sound({
                type:'fireBullet',
                map:self.map,
            });
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
        if(self.weaponPassive === 'spirit'){
            self.shootProjectile(self.id,'Player',self.direction,self.direction,'soul',32,function(t){return 25},0,self.stats,'playerSoul');
            self.shootProjectile(self.id,'Player',self.direction + 120,self.direction + 120,'soul',32,function(t){return 25},0,self.stats,'playerSoul');
            self.shootProjectile(self.id,'Player',self.direction + 240,self.direction + 240,'soul',32,function(t){return 25},0,self.stats,'playerSoul');
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
                                    value:'+' + heal,
                                });
                            }
                            break;
                        case "baseAttack":
                            if(isFireMap){
                                self.shootProjectile(self.id,'Player',self.direction,self.direction,'stoneArrow',30,function(t){return 0},0,self.stats);
                                Sound({
                                    type:'stoneArrow',
                                    map:self.map,
                                });
                            }
                            break;
                        case "simplewoodenbowAttack":
                            if(isFireMap){
                                self.shootProjectile(self.id,'Player',self.direction,self.direction,'stoneArrow',70,function(t){return 0},0,self.stats);
                                Sound({
                                    type:'stoneArrow',
                                    map:self.map,
                                });
                            }
                            break;
                        case "simplesteelbowAttack":
                            if(isFireMap){
                                self.shootProjectile(self.id,'Player',self.direction,self.direction,'stoneArrow',70,function(t){return 0},0,self.stats);
                                Sound({
                                    type:'stoneArrow',
                                    map:self.map,
                                });
                            }
                            break;
                        case "simpledarksteelbowAttack":
                            if(isFireMap){
                                self.shootProjectile(self.id,'Player',self.direction,self.direction,'stoneArrow',70,function(t){return 0},0,self.stats);
                                Sound({
                                    type:'stoneArrow',
                                    map:self.map,
                                });
                            }
                            break;
                        case "simplegoldenbowAttack":
                            if(isFireMap){
                                self.shootProjectile(self.id,'Player',self.direction - 6,self.direction - 6,'stoneArrow',70,function(t){return 0},0,self.stats);
                                self.shootProjectile(self.id,'Player',self.direction + 6,self.direction + 6,'stoneArrow',70,function(t){return 0},0,self.stats);
                                Sound({
                                    type:'stoneArrow',
                                    map:self.map,
                                });
                            }
                            break;
                        case "simplerubybowAttack":
                            if(isFireMap){
                                self.shootProjectile(self.id,'Player',self.direction - 6,self.direction - 6,'stoneArrow',70,function(t){return 0},0,self.stats);
                                self.shootProjectile(self.id,'Player',self.direction + 6,self.direction + 6,'stoneArrow',70,function(t){return 0},0,self.stats);
                                Sound({
                                    type:'stoneArrow',
                                    map:self.map,
                                });
                            }
                            break;
                        case "advancedwoodenbowAttack":
                            if(isFireMap){
                                self.shootProjectile(self.id,'Player',self.direction,self.direction,'stoneArrow',70,function(t){return 0},0,self.stats);
                                Sound({
                                    type:'stoneArrow',
                                    map:self.map,
                                });
                            }
                            break;
                        case "advancedsteelbowAttack":
                            if(isFireMap){
                                self.shootProjectile(self.id,'Player',self.direction - 6,self.direction - 6,'stoneArrow',70,function(t){return 0},0,self.stats);
                                self.shootProjectile(self.id,'Player',self.direction + 6,self.direction + 6,'stoneArrow',70,function(t){return 0},0,self.stats);
                                Sound({
                                    type:'stoneArrow',
                                    map:self.map,
                                });
                            }
                            break;
                        case "advanceddarksteelbowAttack":
                            if(isFireMap){
                                self.shootProjectile(self.id,'Player',self.direction - 6,self.direction - 6,'stoneArrow',70,function(t){return 0},0,self.stats);
                                self.shootProjectile(self.id,'Player',self.direction + 6,self.direction + 6,'stoneArrow',70,function(t){return 0},0,self.stats);
                                Sound({
                                    type:'stoneArrow',
                                    map:self.map,
                                });
                            }
                            break;
                        case "advancedgoldenbowAttack":
                            if(isFireMap){
                                self.shootProjectile(self.id,'Player',self.direction - 10,self.direction - 10,'stoneArrow',70,function(t){return 0},0,self.stats);
                                self.shootProjectile(self.id,'Player',self.direction,self.direction,'stoneArrow',70,function(t){return 0},0,self.stats);
                                self.shootProjectile(self.id,'Player',self.direction + 10,self.direction + 10,'stoneArrow',70,function(t){return 0},0,self.stats);
                                Sound({
                                    type:'stoneArrow',
                                    map:self.map,
                                });
                            }
                            break;
                        case "advancedrubybowAttack":
                            if(isFireMap){
                                self.shootProjectile(self.id,'Player',self.direction - 10,self.direction - 10,'stoneArrow',70,function(t){return 0},0,self.stats);
                                self.shootProjectile(self.id,'Player',self.direction,self.direction,'stoneArrow',70,function(t){return 0},0,self.stats);
                                self.shootProjectile(self.id,'Player',self.direction + 10,self.direction + 10,'stoneArrow',70,function(t){return 0},0,self.stats);
                                Sound({
                                    type:'stoneArrow',
                                    map:self.map,
                                });
                            }
                            break;
                        case "simplewoodenswordAttack":
                            if(isFireMap){
                                self.shootProjectile(self.id,'Player',(self.direction + 270) / 180 * Math.PI,(self.direction + 270) / 180 * Math.PI,'simplewoodensword',54,function(t){return 0},0,self.stats,'spinAroundPlayer');
                                Sound({
                                    type:'ninjaStar',
                                    map:self.map,
                                });
                            }
                            break;
                        case "simplesteelswordAttack":
                            if(isFireMap){
                                self.shootProjectile(self.id,'Player',(self.direction + 270) / 180 * Math.PI,(self.direction + 270) / 180 * Math.PI,'simplesteelsword',54,function(t){return 0},0,self.stats,'spinAroundPlayer');
                                Sound({
                                    type:'ninjaStar',
                                    map:self.map,
                                });
                            }
                            break;
                        case "simpledarksteelswordAttack":
                            if(isFireMap){
                                self.shootProjectile(self.id,'Player',(self.direction + 270) / 180 * Math.PI,(self.direction + 270) / 180 * Math.PI,'simpledarksteelsword',54,function(t){return 0},0,self.stats,'spinAroundPlayer');
                                Sound({
                                    type:'ninjaStar',
                                    map:self.map,
                                });
                            }
                            break;
                        case "simplegoldenswordAttack":
                            if(isFireMap){
                                self.shootProjectile(self.id,'Player',(self.direction + 270) / 180 * Math.PI,(self.direction + 270) / 180 * Math.PI,'simplegoldensword',54,function(t){return 0},0,self.stats,'spinAroundPlayer');
                                self.shootProjectile(self.id,'Player',(self.direction + 90) / 180 * Math.PI,(self.direction + 90) / 180 * Math.PI,'simplegoldensword',54,function(t){return 0},0,self.stats,'spinAroundPlayer');
                                Sound({
                                    type:'ninjaStar',
                                    map:self.map,
                                });
                            }
                            break;
                        case "simplerubyswordAttack":
                            if(isFireMap){
                                self.shootProjectile(self.id,'Player',(self.direction + 270) / 180 * Math.PI,(self.direction + 270) / 180 * Math.PI,'simplerubysword',54,function(t){return 0},0,self.stats,'spinAroundPlayer');
                                self.shootProjectile(self.id,'Player',(self.direction + 90) / 180 * Math.PI,(self.direction + 90) / 180 * Math.PI,'simplerubysword',54,function(t){return 0},0,self.stats,'spinAroundPlayer');
                                Sound({
                                    type:'ninjaStar',
                                    map:self.map,
                                });
                            }
                            break;
                        case "advancedwoodenswordAttack":
                            if(isFireMap){
                                self.shootProjectile(self.id,'Player',(self.direction + 270) / 180 * Math.PI,(self.direction + 270) / 180 * Math.PI,'advancedwoodensword',54,function(t){return 0},0,self.stats,'spinAroundPlayer');
                                Sound({
                                    type:'ninjaStar',
                                    map:self.map,
                                });
                            }
                            break;
                        case "advancedsteelswordAttack":
                            if(isFireMap){
                                self.shootProjectile(self.id,'Player',(self.direction + 270) / 180 * Math.PI,(self.direction + 270) / 180 * Math.PI,'advancedsteelsword',54,function(t){return 0},0,self.stats,'spinAroundPlayer');
                                self.shootProjectile(self.id,'Player',(self.direction + 90) / 180 * Math.PI,(self.direction + 90) / 180 * Math.PI,'advancedsteelsword',54,function(t){return 0},0,self.stats,'spinAroundPlayer');
                                Sound({
                                    type:'ninjaStar',
                                    map:self.map,
                                });
                            }
                            break;
                        case "advanceddarksteelswordAttack":
                            if(isFireMap){
                                self.shootProjectile(self.id,'Player',(self.direction + 270) / 180 * Math.PI,(self.direction + 270) / 180 * Math.PI,'advanceddarksteelsword',54,function(t){return 0},0,self.stats,'spinAroundPlayer');
                                self.shootProjectile(self.id,'Player',(self.direction + 90) / 180 * Math.PI,(self.direction + 90) / 180 * Math.PI,'advanceddarksteelsword',54,function(t){return 0},0,self.stats,'spinAroundPlayer');
                                Sound({
                                    type:'ninjaStar',
                                    map:self.map,
                                });
                            }
                            break;
                        case "advancedgoldenswordAttack":
                            if(isFireMap){
                                self.shootProjectile(self.id,'Player',(self.direction + 270) / 180 * Math.PI,(self.direction + 270) / 180 * Math.PI,'advancedgoldensword',54,function(t){return 0},0,self.stats,'spinAroundPlayer');
                                self.shootProjectile(self.id,'Player',(self.direction + 30) / 180 * Math.PI,(self.direction + 30) / 180 * Math.PI,'advancedgoldensword',54,function(t){return 0},0,self.stats,'spinAroundPlayer');
                                self.shootProjectile(self.id,'Player',(self.direction + 150) / 180 * Math.PI,(self.direction + 150) / 180 * Math.PI,'advancedgoldensword',54,function(t){return 0},0,self.stats,'spinAroundPlayer');
                                Sound({
                                    type:'ninjaStar',
                                    map:self.map,
                                });
                            }
                            break;
                        case "advancedrubyswordAttack":
                            if(isFireMap){
                                self.shootProjectile(self.id,'Player',(self.direction + 270) / 180 * Math.PI,(self.direction + 270) / 180 * Math.PI,'advancedrubysword',54,function(t){return 0},0,self.stats,'spinAroundPlayer');
                                self.shootProjectile(self.id,'Player',(self.direction + 30) / 180 * Math.PI,(self.direction + 30) / 180 * Math.PI,'advancedrubysword',54,function(t){return 0},0,self.stats,'spinAroundPlayer');
                                self.shootProjectile(self.id,'Player',(self.direction + 150) / 180 * Math.PI,(self.direction + 150) / 180 * Math.PI,'advancedrubysword',54,function(t){return 0},0,self.stats,'spinAroundPlayer');
                                Sound({
                                    type:'ninjaStar',
                                    map:self.map,
                                });
                            }
                            break;
                        case "simplewoodenstaffAttack":
                            if(isFireMap){
                                self.shootProjectile(self.id,'Player',self.direction,self.direction,'earthBullet',70,function(t){return 0},0,self.stats,'monsterHoming');
                                Sound({
                                    type:'earthBullet',
                                    map:self.map,
                                });
                            }
                            break;
                        case "simplesteelstaffAttack":
                            if(isFireMap){
                                self.shootProjectile(self.id,'Player',self.direction,self.direction,'earthBullet',70,function(t){return 0},0,self.stats,'monsterHoming');
                                Sound({
                                    type:'earthBullet',
                                    map:self.map,
                                });
                            }
                            break;
                        case "simpledarksteelstaffAttack":
                            if(isFireMap){
                                self.shootProjectile(self.id,'Player',self.direction,self.direction,'earthBullet',70,function(t){return 0},0,self.stats,'monsterHoming');
                                Sound({
                                    type:'earthBullet',
                                    map:self.map,
                                });
                            }
                            break;
                        case "simplegoldenstaffAttack":
                            if(isFireMap){
                                self.shootProjectile(self.id,'Player',self.direction,self.direction,'earthBullet',70,function(t){return 0},0,self.stats,'monsterHoming');
                                self.shootProjectile(self.id,'Player',self.direction + 180,self.direction + 180,'earthBullet',70,function(t){return 0},0,self.stats,'monsterHoming');
                                Sound({
                                    type:'earthBullet',
                                    map:self.map,
                                });
                            }
                            break;
                        case "simplerubystaffAttack":
                            if(isFireMap){
                                self.shootProjectile(self.id,'Player',self.direction,self.direction,'earthBullet',70,function(t){return 0},0,self.stats,'monsterHoming');
                                self.shootProjectile(self.id,'Player',self.direction + 180,self.direction + 180,'earthBullet',70,function(t){return 0},0,self.stats,'monsterHoming');
                                Sound({
                                    type:'earthBullet',
                                    map:self.map,
                                });
                            }
                            break;
                        case "advancedwoodenstaffAttack":
                            if(isFireMap){
                                self.shootProjectile(self.id,'Player',self.direction,self.direction,'earthBullet',70,function(t){return 0},0,self.stats,'monsterHoming');
                                Sound({
                                    type:'earthBullet',
                                    map:self.map,
                                });
                            }
                            break;
                        case "advancedsteelstaffAttack":
                            if(isFireMap){
                                self.shootProjectile(self.id,'Player',self.direction,self.direction,'earthBullet',70,function(t){return 0},0,self.stats,'monsterHoming');
                                self.shootProjectile(self.id,'Player',self.direction + 180,self.direction + 180,'earthBullet',70,function(t){return 0},0,self.stats,'monsterHoming');
                                Sound({
                                    type:'earthBullet',
                                    map:self.map,
                                });
                            }
                            break;
                        case "advanceddarksteelstaffAttack":
                            if(isFireMap){
                                self.shootProjectile(self.id,'Player',self.direction,self.direction,'earthBullet',70,function(t){return 0},0,self.stats,'monsterHoming');
                                self.shootProjectile(self.id,'Player',self.direction + 180,self.direction + 180,'earthBullet',70,function(t){return 0},0,self.stats,'monsterHoming');
                                Sound({
                                    type:'earthBullet',
                                    map:self.map,
                                });
                            }
                            break;
                        case "advancedgoldenstaffAttack":
                            if(isFireMap){
                                self.shootProjectile(self.id,'Player',self.direction - 120,self.direction - 120,'earthBullet',70,function(t){return 0},0,self.stats,'monsterHoming');
                                self.shootProjectile(self.id,'Player',self.direction,self.direction,'earthBullet',70,function(t){return 0},0,self.stats,'monsterHoming');
                                self.shootProjectile(self.id,'Player',self.direction + 120,self.direction + 120,'earthBullet',70,function(t){return 0},0,self.stats,'monsterHoming');
                                Sound({
                                    type:'earthBullet',
                                    map:self.map,
                                });
                            }
                            break;
                        case "advancedrubystaffAttack":
                            if(isFireMap){
                                self.shootProjectile(self.id,'Player',self.direction - 120,self.direction - 120,'earthBullet',70,function(t){return 0},0,self.stats,'monsterHoming');
                                self.shootProjectile(self.id,'Player',self.direction,self.direction,'earthBullet',70,function(t){return 0},0,self.stats,'monsterHoming');
                                self.shootProjectile(self.id,'Player',self.direction + 120,self.direction + 120,'earthBullet',70,function(t){return 0},0,self.stats,'monsterHoming');
                                Sound({
                                    type:'earthBullet',
                                    map:self.map,
                                });
                            }
                            break;
                        case "lightningsaberAttack":
                            if(isFireMap){
                                self.shootProjectile(self.id,'Player',self.direction,self.direction,'lightningsaber',34,function(t){return 25},0,self.stats,'spinAroundPoint');
                                self.shootProjectile(self.id,'Player',self.direction + 90,self.direction + 90,'lightningsaber',34,function(t){return 25},0,self.stats,'spinAroundPoint');
                                self.shootProjectile(self.id,'Player',self.direction + 180,self.direction + 180,'lightningsaber',34,function(t){return 25},0,self.stats,'spinAroundPoint');
                                self.shootProjectile(self.id,'Player',self.direction + 270,self.direction + 270,'lightningsaber',34,function(t){return 25},0,self.stats,'spinAroundPoint');
                                Sound({
                                    type:'ninjaStar',
                                    map:self.map,
                                });
                            }
                            break;
                        case "lightningwandAttack":
                            if(isFireMap){
                                self.shootProjectile(self.id,'Player',self.direction,self.direction,'lightningSpit',70,function(t){return 0},0,self.stats);
                                Sound({
                                    type:'earthBullet',
                                    map:self.map,
                                });
                            }
                            break;
                        case "bookoflightningAttack":
                            if(isFireMap){
                                self.shootProjectile(self.id,'Player',self.direction,self.direction,'lightningSpit',0,function(t){return 0},0,self.stats,'monsterHoming');
                                self.shootProjectile(self.id,'Player',self.direction + 90,self.direction + 90,'lightningSpit',0,function(t){return 0},0,self.stats,'monsterHoming');
                                self.shootProjectile(self.id,'Player',self.direction + 180,self.direction + 180,'lightningSpit',0,function(t){return 0},0,self.stats,'monsterHoming');
                                self.shootProjectile(self.id,'Player',self.direction + 270,self.direction + 270,'lightningSpit',0,function(t){return 0},0,self.stats,'monsterHoming');
                                Sound({
                                    type:'lightningSpit',
                                    map:self.map,
                                });
                            }
                            break;
                        case "bookofspiritsAttack":
                            if(isFireMap){
                                if(self.weaponState === 7){
                                    self.weaponState = 0;
                                }
                                self.shootProjectile(self.id,'Player',self.direction + self.weaponState * 60,self.direction + self.weaponState * 60,'soul',64,function(t){return 30},0,self.stats,'playerSoulWait');
                                Sound({
                                    type:'lightningSpit',
                                    map:self.map,
                                });
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
                        case "bookofdeathAttack":
                            if(isFireMap){
                                for(var j = 0;j < 3;j++){
                                    self.shootProjectile(self.id,'Player',self.direction + 60 - j * 60 + Math.random() * 15,self.direction + 60 - j * 60 + Math.random() * 15,'skull',32 + 12 * Math.random(),function(t){return 0},0,self.stats,'skull');
                                }
                            }
                            break;
                        case "unholytridentAttack":
                            if(isFireMap){
                                for(var j = 0;j < 10;j++){
                                    self.shootProjectile(self.id,'Player',self.direction,self.direction,'unholytrident',32,function(t){return 0},3,self.stats,'unholyTrident');
                                }
                            }
                            break;
                        case "holytridentAttack":
                            if(isFireMap){
                                for(var j = 0;j < 10;j++){
                                    self.shootProjectile(self.id,'Player',self.direction,self.direction,'holytrident',32,function(t){return 0},3,self.stats,'holyTrident');
                                }
                            }
                            break;
                        case "earthbook1Attack":
                            if(isFireMap){
                                self.shootProjectile(self.id,'Player',self.direction,self.direction,'earthBullet',50,function(t){return 0},0,self.stats,'spinAroundPoint');
                                Sound({
                                    type:'earthBullet',
                                    map:self.map,
                                });
                            }
                            break;
                        case "earthbook2Attack":
                            if(isFireMap){
                                for(var j = 0;j < 2;j++){
                                    self.shootProjectile(self.id,'Player',self.direction + j * 180,self.direction + j * 180,'earthBullet',50,function(t){return 0},0,self.stats,'spinAroundPoint');
                                }
                                    Sound({
                                        type:'earthBullet',
                                        map:self.map,
                                    });
                                }
                            break;
                        case "earthbook3Attack":
                            if(isFireMap){
                                for(var j = 0;j < 3;j++){
                                    self.shootProjectile(self.id,'Player',self.direction + j * 120,self.direction + j * 120,'earthBullet',50,function(t){return 0},0,self.stats,'spinAroundPoint');
                                }
                                Sound({
                                    type:'earthBullet',
                                    map:self.map,
                                });
                            }
                            break;
                        case "earthbook4Attack":
                            if(isFireMap){
                                for(var j = 0;j < 5;j++){
                                    self.shootProjectile(self.id,'Player',self.direction + j * 72,self.direction + j * 72,'earthBullet',50,function(t){return 0},0,self.stats,'spinAroundPoint');
                                }
                                Sound({
                                    type:'earthBullet',
                                    map:self.map,
                                });
                            }
                            break;
                        case "earthbook5Attack":
                            if(isFireMap){
                                for(var j = 0;j < 3;j++){
                                    self.shootProjectile(self.id,'Player',self.direction + j * 120,self.direction + j * 120,'earthBullet',50,function(t){return 0},0,self.stats,'spinAroundPoint');
                                }
                                for(var j = 0;j < 6;j++){
                                    self.shootProjectile(self.id,'Player',self.direction + j * 60,self.direction + j * 60,'earthBullet',100,function(t){return 0},0,self.stats,'spinAroundPoint');
                                }
                                Sound({
                                    type:'earthBullet',
                                    map:self.map,
                                });
                            }
                            break;
                        case "earthbook6Attack":
                            if(isFireMap){
                                for(var j = 0;j < 5;j++){
                                    self.shootProjectile(self.id,'Player',self.direction + j * 72,self.direction + j * 72,'earthBullet',50,function(t){return 0},0,self.stats,'spinAroundPoint');
                                }
                                for(var j = 0;j < 10;j++){
                                    self.shootProjectile(self.id,'Player',self.direction + j * 36,self.direction + j * 36,'earthBullet',100,function(t){return 0},0,self.stats,'spinAroundPoint');
                                }
                                Sound({
                                    type:'earthBullet',
                                    map:self.map,
                                });
                            }
                            break;
                        case "firebook1Attack":
                            if(isFireMap){
                                for(var j = -1;j < 2;j++){
                                    self.shootProjectile(self.id,'Player',self.direction + j * 5,self.direction + j * 5,'fireBullet',-20,function(t){return 0},0,self.stats);
                                }
                                Sound({
                                    type:'fireBullet',
                                    map:self.map,
                                });
                            }
                            break;
                        case "firebook2Attack":
                            if(isFireMap){
                                for(var j = -1;j < 2;j++){
                                    self.shootProjectile(self.id,'Player',self.direction + j * 10,self.direction + j * 10,'fireBullet',-20,function(t){return 0},0,self.stats);
                                }
                                for(var j = -1;j < 2;j++){
                                    self.shootProjectile(self.id,'Player',self.direction + j * 10 + 180,self.direction + j * 10 + 180,'fireBullet',-20,function(t){return 0},0,self.stats);
                                }
                                Sound({
                                    type:'fireBullet',
                                    map:self.map,
                                });
                            }
                            break;
                        case "firebook3Attack":
                            if(isFireMap){
                                for(var j = -2;j < 3;j++){
                                    self.shootProjectile(self.id,'Player',self.direction + j * 10,self.direction + j * 10,'fireBullet',-20,function(t){return 0},0,self.stats);
                                }
                                for(var j = -2;j < 3;j++){
                                    self.shootProjectile(self.id,'Player',self.direction + j * 10 + 180,self.direction + j * 10 + 180,'fireBullet',-20,function(t){return 0},0,self.stats);
                                }
                                Sound({
                                    type:'fireBullet',
                                    map:self.map,
                                });
                            }
                            break;
                        case "firebook4Attack":
                            if(isFireMap){
                                for(var j = -2;j < 3;j++){
                                    self.shootProjectile(self.id,'Player',self.direction + j * 10,self.direction + j * 10,'fireBullet',-20,function(t){return 0},0,self.stats);
                                }
                                for(var j = -1;j < 2;j++){
                                    self.shootProjectile(self.id,'Player',self.direction + j * 10 + 120,self.direction + j * 10 + 120,'fireBullet',-20,function(t){return 0},0,self.stats);
                                }
                                for(var j = -1;j < 2;j++){
                                    self.shootProjectile(self.id,'Player',self.direction + j * 10 + 240,self.direction + j * 10 + 240,'fireBullet',-20,function(t){return 0},0,self.stats);
                                }
                                Sound({
                                    type:'fireBullet',
                                    map:self.map,
                                });
                            }
                            break;
                        case "firebook5Attack":
                            if(isFireMap){
                                for(var j = -2;j < 3;j++){
                                    self.shootProjectile(self.id,'Player',self.direction + j * 10,self.direction + j * 10,'fireBullet',-20,function(t){return 0},0,self.stats);
                                }
                                for(var j = -2;j < 3;j++){
                                    self.shootProjectile(self.id,'Player',self.direction + j * 10 + 120,self.direction + j * 10 + 120,'fireBullet',-20,function(t){return 0},0,self.stats);
                                }
                                for(var j = -2;j < 3;j++){
                                    self.shootProjectile(self.id,'Player',self.direction + j * 10 + 240,self.direction + j * 10 + 240,'fireBullet',-20,function(t){return 0},0,self.stats);
                                }
                                Sound({
                                    type:'fireBullet',
                                    map:self.map,
                                });
                            }
                            break;
                        case "firebook6Attack":
                            if(isFireMap){
                                for(var j = -2;j < 3;j++){
                                    self.shootProjectile(self.id,'Player',self.direction + j * 10,self.direction + j * 10,'fireBullet',-20,function(t){return 0},0,self.stats);
                                }
                                for(var j = -2;j < 3;j++){
                                    self.shootProjectile(self.id,'Player',self.direction + j * 10 + 90,self.direction + j * 10 + 90,'fireBullet',-20,function(t){return 0},0,self.stats);
                                }
                                for(var j = -2;j < 3;j++){
                                    self.shootProjectile(self.id,'Player',self.direction + j * 10 + 180,self.direction + j * 10 + 180,'fireBullet',-20,function(t){return 0},0,self.stats);
                                }
                                for(var j = -2;j < 3;j++){
                                    self.shootProjectile(self.id,'Player',self.direction + j * 10 + 270,self.direction + j * 10 + 270,'fireBullet',-20,function(t){return 0},0,self.stats);
                                }
                                Sound({
                                    type:'fireBullet',
                                    map:self.map,
                                });
                            }
                            break;
                        case "waterbook1Attack":
                            if(isFireMap){
                                self.shootProjectile(self.id,'Player',self.direction,self.direction,'waterBullet',-10,function(t){return 10},0,self.stats,'bounceOffCollisions');
                                Sound({
                                    type:'waterBullet',
                                    map:self.map,
                                });
                            }
                            break;
                        case "waterbook2Attack":
                            if(isFireMap){
                                self.shootProjectile(self.id,'Player',self.direction,self.direction,'waterBullet',-10,function(t){return 10},0,self.stats,'bounceOffCollisions');
                                Sound({
                                    type:'waterBullet',
                                    map:self.map,
                                });
                            }
                            break;
                        case "waterbook3Attack":
                            if(isFireMap){
                                for(var j = 0;j < 2;j++){
                                    self.shootProjectile(self.id,'Player',self.direction + j * 180,self.direction + j * 180,'waterBullet',-10,function(t){return 10},0,self.stats,'bounceOffCollisions');
                                }
                                Sound({
                                    type:'waterBullet',
                                    map:self.map,
                                });
                            }
                            break;
                        case "waterbook4Attack":
                            if(isFireMap){
                                for(var j = 0;j < 3;j++){
                                    self.shootProjectile(self.id,'Player',self.direction + j * 120,self.direction + j * 120,'waterBullet',-10,function(t){return 10},0,self.stats,'bounceOffCollisions');
                                }
                                Sound({
                                    type:'waterBullet',
                                    map:self.map,
                                });
                            }
                            break;
                        case "waterbook5Attack":
                            if(isFireMap){
                                for(var j = 0;j < 3;j++){
                                    self.shootProjectile(self.id,'Player',self.direction + j * 120,self.direction + j * 120,'waterBullet',-20,function(t){return 10},0,self.stats,'bounceOffCollisions');
                                }
                                Sound({
                                    type:'waterBullet',
                                    map:self.map,
                                });
                            }
                            break;
                        case "waterbook6Attack":
                            if(isFireMap){
                                for(var j = 0;j < 4;j++){
                                    self.shootProjectile(self.id,'Player',self.direction + j * 90,self.direction + j * 90,'waterBullet',-20,function(t){return 10},0,self.stats,'bounceOffCollisions');
                                }
                                Sound({
                                    type:'waterBullet',
                                    map:self.map,
                                });
                            }
                            break;
                        case "baseSecond":
                            if(isFireMap){
                                for(var j = 0;j < 5;j++){
                                    self.shootProjectile(self.id,'Player',j * 72,j * 72,'stoneArrow',30,function(t){return 0},0,self.stats);
                                }
                                Sound({
                                    type:'stoneArrow',
                                    map:self.map,
                                });
                            }
                            break;
                        case "bowSecond1":
                            if(isFireMap){
                                for(var j = 0;j < 10;j++){
                                    self.shootProjectile(self.id,'Player',j * 36,j * 36,'stoneArrow',30,function(t){return 0},0,self.stats);
                                }
                                Sound({
                                    type:'stoneArrow',
                                    map:self.map,
                                });
                            }
                            break;
                        case "earthbook1Second":
                            if(isFireMap){
                                var speed = self.stats.speed;
                                self.stats.speed = 0;
                                var projectileWidth = 0;
                                var projectileHeight = 0;
                                for(var i in projectileData){
                                    if(i === 'earthTower'){
                                        projectileWidth = projectileData[i].width;
                                        projectileHeight = projectileData[i].height;
                                    }
                                }
                                var projectile = Projectile({
                                    id:self.id,
                                    projectileType:'earthTower',
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
                                for(var j = 0;j < 2;j++){
                                    self.shootProjectile(self.id,'Player',self.direction + j * 180,self.direction + j * 180,'earthBullet',50,function(t){return 0},self.stats,'spinAroundPoint');
                                }
                                Sound({
                                    type:'earthBullet',
                                    map:self.map,
                                });
                                setTimeout(function(){
                                    var x = self.x;
                                    var y = self.y;
                                    self.x = mouseX;
                                    self.y = mouseY;
                                    for(var j = 0;j < 2;j++){
                                        self.shootProjectile(self.id,'Player',self.direction + j * 180,self.direction + j * 180,'earthBullet',50,function(t){return 0},self.stats,'spinAroundPoint');
                                    }
                                    self.x = x;
                                    self.y = y;
                                    Sound({
                                        type:'earthBullet',
                                        map:self.map,
                                    });
                                },250);
                                self.x = x;
                                self.y = y;
                            }
                            break;
                        case "earthbook2Second":
                            if(isFireMap){
                                var speed = self.stats.speed;
                                self.stats.speed = 0;
                                var projectileWidth = 0;
                                var projectileHeight = 0;
                                for(var i in projectileData){
                                    if(i === 'earthTower'){
                                        projectileWidth = projectileData[i].width;
                                        projectileHeight = projectileData[i].height;
                                    }
                                }
                                var projectile = Projectile({
                                    id:self.id,
                                    projectileType:'earthTower',
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
                                for(var j = 0;j < 2;j++){
                                    self.shootProjectile(self.id,'Player',self.direction + j * 180,self.direction + j * 180,'earthBullet',50,function(t){return 0},self.stats,'spinAroundPoint');
                                }
                                Sound({
                                    type:'earthBullet',
                                    map:self.map,
                                });
                                setTimeout(function(){
                                    var x = self.x;
                                    var y = self.y;
                                    self.x = mouseX;
                                    self.y = mouseY;
                                    for(var j = 0;j < 2;j++){
                                        self.shootProjectile(self.id,'Player',self.direction + j * 180,self.direction + j * 180,'earthBullet',50,function(t){return 0},self.stats,'spinAroundPoint');
                                    }
                                    self.x = x;
                                    self.y = y;
                                    Sound({
                                        type:'earthBullet',
                                        map:self.map,
                                    });
                                },250);
                                setTimeout(function(){
                                    var x = self.x;
                                    var y = self.y;
                                    self.x = mouseX;
                                    self.y = mouseY;
                                    for(var j = 0;j < 2;j++){
                                        self.shootProjectile(self.id,'Player',self.direction + j * 180,self.direction + j * 180,'earthBullet',50,function(t){return 0},self.stats,'spinAroundPoint');
                                    }
                                    self.x = x;
                                    self.y = y;
                                    Sound({
                                        type:'earthBullet',
                                        map:self.map,
                                    });
                                },500);
                                self.x = x;
                                self.y = y;
                            }
                            break;
                        case "earthbook3Second":
                            if(isFireMap){
                                var speed = self.stats.speed;
                                self.stats.speed = 0;
                                var projectileWidth = 0;
                                var projectileHeight = 0;
                                for(var i in projectileData){
                                    if(i === 'earthTower'){
                                        projectileWidth = projectileData[i].width;
                                        projectileHeight = projectileData[i].height;
                                    }
                                }
                                var projectile = Projectile({
                                    id:self.id,
                                    projectileType:'earthTower',
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
                                for(var j = 0;j < 10;j++){
                                    self.shootProjectile(self.id,'Player',self.direction + j * 36,self.direction + j * 36,'earthBullet',50,function(t){return 0},0,self.stats,'spinAroundPoint');
                                }
                                Sound({
                                    type:'earthBullet',
                                    map:self.map,
                                });
                                setTimeout(function(){
                                    var x = self.x;
                                    var y = self.y;
                                    self.x = mouseX;
                                    self.y = mouseY;
                                    for(var j = 0;j < 10;j++){
                                        self.shootProjectile(self.id,'Player',self.direction + j * 36,self.direction + j * 36,'earthBullet',50,function(t){return 0},0,self.stats,'spinAroundPoint');
                                    }
                                    Sound({
                                        type:'earthBullet',
                                        map:self.map,
                                    });
                                    self.x = x;
                                    self.y = y;
                                },250);
                                setTimeout(function(){
                                    var x = self.x;
                                    var y = self.y;
                                    self.x = mouseX;
                                    self.y = mouseY;
                                    for(var j = 0;j < 10;j++){
                                        self.shootProjectile(self.id,'Player',self.direction + j * 36,self.direction + j * 36,'earthBullet',50,function(t){return 0},0,self.stats,'spinAroundPoint');
                                    }
                                    Sound({
                                        type:'earthBullet',
                                        map:self.map,
                                    });
                                    self.x = x;
                                    self.y = y;
                                },500);
                                self.x = x;
                                self.y = y;
                            }
                            break;
                        case "earthbook4Second":
                            if(isFireMap){
                                var speed = self.stats.speed;
                                self.stats.speed = 0;
                                var range = self.stats.range;
                                self.stats.range = 1.5;
                                var projectileWidth = 0;
                                var projectileHeight = 0;
                                for(var i in projectileData){
                                    if(i === 'earthTower'){
                                        projectileWidth = projectileData[i].width;
                                        projectileHeight = projectileData[i].height;
                                    }
                                }
                                var projectile = Projectile({
                                    id:self.id,
                                    projectileType:'earthTower',
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
                                for(var j = 0;j < 10;j++){
                                    self.shootProjectile(self.id,'Player',self.direction + j * 36,self.direction + j * 36,'earthBullet',50,function(t){return 0},0,self.stats,'spinAroundPoint');
                                }
                                Sound({
                                    type:'earthBullet',
                                    map:self.map,
                                });
                                setTimeout(function(){
                                    var x = self.x;
                                    var y = self.y;
                                    self.x = mouseX;
                                    self.y = mouseY;
                                    for(var j = 0;j < 10;j++){
                                        self.shootProjectile(self.id,'Player',self.direction + j * 36,self.direction + j * 36,'earthBullet',50,function(t){return 0},0,self.stats,'spinAroundPoint');
                                    }
                                    Sound({
                                        type:'earthBullet',
                                        map:self.map,
                                    });
                                    self.x = x;
                                    self.y = y;
                                },250);
                                setTimeout(function(){
                                    var x = self.x;
                                    var y = self.y;
                                    self.x = mouseX;
                                    self.y = mouseY;
                                    for(var j = 0;j < 10;j++){
                                        self.shootProjectile(self.id,'Player',self.direction + j * 36,self.direction + j * 36,'earthBullet',50,function(t){return 0},0,self.stats,'spinAroundPoint');
                                    }
                                    Sound({
                                        type:'earthBullet',
                                        map:self.map,
                                    });
                                    self.x = x;
                                    self.y = y;
                                },500);
                                setTimeout(function(){
                                    var x = self.x;
                                    var y = self.y;
                                    self.x = mouseX;
                                    self.y = mouseY;
                                    for(var j = 0;j < 10;j++){
                                        self.shootProjectile(self.id,'Player',self.direction + j * 36,self.direction + j * 36,'earthBullet',50,function(t){return 0},0,self.stats,'spinAroundPoint');
                                    }
                                    Sound({
                                        type:'earthBullet',
                                        map:self.map,
                                    });
                                    self.x = x;
                                    self.y = y;
                                },750);
                                self.x = x;
                                self.y = y;
                            }
                            break;
                        case "earthbook5Second":
                            if(isFireMap){
                                var speed = self.stats.speed;
                                self.stats.speed = 0;
                                var range = self.stats.range;
                                self.stats.range = 2;
                                var projectileWidth = 0;
                                var projectileHeight = 0;
                                for(var i in projectileData){
                                    if(i === 'earthTower'){
                                        projectileWidth = projectileData[i].width;
                                        projectileHeight = projectileData[i].height;
                                    }
                                }
                                var projectile = Projectile({
                                    id:self.id,
                                    projectileType:'earthTower',
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
                                for(var j = 0;j < 10;j++){
                                    self.shootProjectile(self.id,'Player',self.direction + j * 36,self.direction + j * 36,'earthBullet',50,function(t){return 0},0,self.stats,'spinAroundPoint');
                                }
                                Sound({
                                    type:'earthBullet',
                                    map:self.map,
                                });
                                setTimeout(function(){
                                    var x = self.x;
                                    var y = self.y;
                                    self.x = mouseX;
                                    self.y = mouseY;
                                    for(var j = 0;j < 10;j++){
                                        self.shootProjectile(self.id,'Player',self.direction + j * 36,self.direction + j * 36,'earthBullet',50,function(t){return 0},0,self.stats,'spinAroundPoint');
                                    }
                                    Sound({
                                        type:'earthBullet',
                                        map:self.map,
                                    });
                                    self.x = x;
                                    self.y = y;
                                },250);
                                setTimeout(function(){
                                    var x = self.x;
                                    var y = self.y;
                                    self.x = mouseX;
                                    self.y = mouseY;
                                    for(var j = 0;j < 10;j++){
                                        self.shootProjectile(self.id,'Player',self.direction + j * 36,self.direction + j * 36,'earthBullet',50,function(t){return 0},0,self.stats,'spinAroundPoint');
                                    }
                                    Sound({
                                        type:'earthBullet',
                                        map:self.map,
                                    });
                                    self.x = x;
                                    self.y = y;
                                },500);
                                setTimeout(function(){
                                    var x = self.x;
                                    var y = self.y;
                                    self.x = mouseX;
                                    self.y = mouseY;
                                    for(var j = 0;j < 10;j++){
                                        self.shootProjectile(self.id,'Player',self.direction + j * 36,self.direction + j * 36,'earthBullet',50,function(t){return 0},0,self.stats,'spinAroundPoint');
                                    }
                                    Sound({
                                        type:'earthBullet',
                                        map:self.map,
                                    });
                                    self.x = x;
                                    self.y = y;
                                },750);
                                setTimeout(function(){
                                    var x = self.x;
                                    var y = self.y;
                                    self.x = mouseX;
                                    self.y = mouseY;
                                    for(var j = 0;j < 10;j++){
                                        self.shootProjectile(self.id,'Player',self.direction + j * 36,self.direction + j * 36,'earthBullet',50,function(t){return 0},0,self.stats,'spinAroundPoint');
                                    }
                                    Sound({
                                        type:'earthBullet',
                                        map:self.map,
                                    });
                                    self.x = x;
                                    self.y = y;
                                },1000);
                                setTimeout(function(){
                                    var x = self.x;
                                    var y = self.y;
                                    self.x = mouseX;
                                    self.y = mouseY;
                                    for(var j = 0;j < 10;j++){
                                        self.shootProjectile(self.id,'Player',self.direction + j * 36,self.direction + j * 36,'earthBullet',50,function(t){return 0},0,self.stats,'spinAroundPoint');
                                    }
                                    Sound({
                                        type:'earthBullet',
                                        map:self.map,
                                    });
                                    self.x = x;
                                    self.y = y;
                                },1250);
                                self.x = x;
                                self.y = y;
                            }
                            break;
                        case "earthbook6Second":
                            if(isFireMap){
                                var speed = self.stats.speed;
                                self.stats.speed = 0;
                                var range = self.stats.range;
                                self.stats.range = 2.5;
                                var projectileWidth = 0;
                                var projectileHeight = 0;
                                for(var i in projectileData){
                                    if(i === 'earthTower'){
                                        projectileWidth = projectileData[i].width;
                                        projectileHeight = projectileData[i].height;
                                    }
                                }
                                var projectile = Projectile({
                                    id:self.id,
                                    projectileType:'earthTower',
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
                                self.stats.range = range;
                                var x = self.x;
                                var y = self.y;
                                self.x = self.mouseX;
                                self.y = self.mouseY;
                                var mouseX = self.mouseX;
                                var mouseY = self.mouseY;
                                for(var j = 0;j < 10;j++){
                                    self.shootProjectile(self.id,'Player',self.direction + j * 36,self.direction + j * 36,'earthBullet',50,function(t){return 0},0,self.stats,'spinAroundPoint');
                                }
                                Sound({
                                    type:'earthBullet',
                                    map:self.map,
                                });
                                setTimeout(function(){
                                    var x = self.x;
                                    var y = self.y;
                                    self.x = mouseX;
                                    self.y = mouseY;
                                    for(var j = 0;j < 10;j++){
                                        self.shootProjectile(self.id,'Player',self.direction + j * 36,self.direction + j * 36,'earthBullet',50,function(t){return 0},0,self.stats,'spinAroundPoint');
                                    }
                                    Sound({
                                        type:'earthBullet',
                                        map:self.map,
                                    });
                                    self.x = x;
                                    self.y = y;
                                },250);
                                setTimeout(function(){
                                    var x = self.x;
                                    var y = self.y;
                                    self.x = mouseX;
                                    self.y = mouseY;
                                    for(var j = 0;j < 10;j++){
                                        self.shootProjectile(self.id,'Player',self.direction + j * 36,self.direction + j * 36,'earthBullet',50,function(t){return 0},0,self.stats,'spinAroundPoint');
                                    }
                                    Sound({
                                        type:'earthBullet',
                                        map:self.map,
                                    });
                                    self.x = x;
                                    self.y = y;
                                },500);
                                setTimeout(function(){
                                    var x = self.x;
                                    var y = self.y;
                                    self.x = mouseX;
                                    self.y = mouseY;
                                    for(var j = 0;j < 10;j++){
                                        self.shootProjectile(self.id,'Player',self.direction + j * 36,self.direction + j * 36,'earthBullet',50,function(t){return 0},0,self.stats,'spinAroundPoint');
                                    }
                                    Sound({
                                        type:'earthBullet',
                                        map:self.map,
                                    });
                                    self.x = x;
                                    self.y = y;
                                },750);
                                setTimeout(function(){
                                    var x = self.x;
                                    var y = self.y;
                                    self.x = mouseX;
                                    self.y = mouseY;
                                    for(var j = 0;j < 10;j++){
                                        self.shootProjectile(self.id,'Player',self.direction + j * 36,self.direction + j * 36,'earthBullet',50,function(t){return 0},0,self.stats,'spinAroundPoint');
                                    }
                                    Sound({
                                        type:'earthBullet',
                                        map:self.map,
                                    });
                                    self.x = x;
                                    self.y = y;
                                },1000);
                                setTimeout(function(){
                                    var x = self.x;
                                    var y = self.y;
                                    self.x = mouseX;
                                    self.y = mouseY;
                                    for(var j = 0;j < 10;j++){
                                        self.shootProjectile(self.id,'Player',self.direction + j * 36,self.direction + j * 36,'earthBullet',50,function(t){return 0},0,self.stats,'spinAroundPoint');
                                    }
                                    Sound({
                                        type:'earthBullet',
                                        map:self.map,
                                    });
                                    self.x = x;
                                    self.y = y;
                                },1250);
                                setTimeout(function(){
                                    var x = self.x;
                                    var y = self.y;
                                    self.x = mouseX;
                                    self.y = mouseY;
                                    for(var j = 0;j < 10;j++){
                                        self.shootProjectile(self.id,'Player',self.direction + j * 36,self.direction + j * 36,'earthBullet',50,function(t){return 0},0,self.stats,'spinAroundPoint');
                                    }
                                    Sound({
                                        type:'earthBullet',
                                        map:self.map,
                                    });
                                    self.x = x;
                                    self.y = y;
                                },1500);
                                self.x = x;
                                self.y = y;
                            }
                            break;
                        case "firebook1Second":
                            if(isFireMap){
                                var speed = self.stats.speed;
                                self.stats.speed = 0;
                                for(var j = 0;j < 10;j++){
                                    self.shootProjectile(self.id,'Player',j * 36,j * 36,'fireBullet',128,function(t){return 25},0,self.stats,'stationary');
                                }
                                self.stats.speed = speed;
                                Sound({
                                    type:'fireBullet',
                                    map:self.map,
                                });
                            }
                            break;
                        case "firebook2Second":
                            if(isFireMap){
                                var speed = self.stats.speed;
                                self.stats.speed = 0;
                                for(var j = 0;j < 20;j++){
                                    self.shootProjectile(self.id,'Player',j * 18,j * 18,'fireBullet',128,function(t){return 25},0,self.stats,'stationary');
                                }
                                self.stats.speed = speed;
                                Sound({
                                    type:'fireBullet',
                                    map:self.map,
                                });
                            }
                            break;
                        case "firebook3Second":
                            if(isFireMap){
                                var speed = self.stats.speed;
                                self.stats.speed = 0;
                                for(var j = 0;j < 10;j++){
                                    self.shootProjectile(self.id,'Player',j * 36,j * 36,'fireBullet',128,function(t){return 25},0,self.stats,'stationary');
                                }
                                for(var j = 0;j < 5;j++){
                                    self.shootProjectile(self.id,'Player',j * 72 + 36,j * 72 + 36,'fireBullet',64,function(t){return 25},0,self.stats,'stationary');
                                }
                                self.stats.speed = speed;
                                Sound({
                                    type:'fireBullet',
                                    map:self.map,
                                });
                            }
                            break;
                        case "firebook4Second":
                            if(isFireMap){
                                var speed = self.stats.speed;
                                self.stats.speed = 0;
                                for(var j = 0;j < 20;j++){
                                    self.shootProjectile(self.id,'Player',j * 18,j * 18,'fireBullet',128,function(t){return 25},0,self.stats,'stationary');
                                }
                                for(var j = 0;j < 10;j++){
                                    self.shootProjectile(self.id,'Player',j * 36,j * 36,'fireBullet',64,function(t){return 25},0,self.stats,'stationary');
                                }
                                self.stats.speed = speed;
                                Sound({
                                    type:'fireBullet',
                                    map:self.map,
                                });
                            }
                            break;
                        case "firebook5Second":
                            if(isFireMap){
                                var speed = self.stats.speed;
                                self.stats.speed = 0;
                                for(var j = 0;j < 20;j++){
                                    self.shootProjectile(self.id,'Player',j * 18,j * 18,'fireBullet',128,function(t){return 25},0,self.stats);
                                }
                                for(var j = 0;j < 10;j++){
                                    self.shootProjectile(self.id,'Player',j * 36,j * 36,'fireBullet',64,function(t){return 25},0,self.stats);
                                }
                                self.stats.speed = speed;
                                for(var j = 0;j < 10;j++){
                                    self.shootProjectile(self.id,'Player',j * 36,j * 36,'fireBullet',-20,function(t){return 0},0,self.stats);
                                }
                                Sound({
                                    type:'fireBullet',
                                    map:self.map,
                                });
                            }
                            break;
                        case "firebook6Second":
                            if(isFireMap){
                                var speed = self.stats.speed;
                                self.stats.speed = 0;
                                for(var j = 0;j < 20;j++){
                                    self.shootProjectile(self.id,'Player',j * 18,j * 18,'fireBullet',128,function(t){return 25},0,self.stats);
                                }
                                for(var j = 0;j < 10;j++){
                                    self.shootProjectile(self.id,'Player',j * 36,j * 36,'fireBullet',64,function(t){return 25},0,self.stats);
                                }
                                self.stats.speed = speed;
                                for(var j = 0;j < 20;j++){
                                    self.shootProjectile(self.id,'Player',j * 18,j * 18,'fireBullet',-20,function(t){return 0},0,self.stats);
                                }
                                Sound({
                                    type:'fireBullet',
                                    map:self.map,
                                });
                            }
                            break;
                        case "waterbook1Second":
                            if(isFireMap){
                                for(var j = -2;j < 3;j++){
                                    self.shootProjectile(self.id,'Player',self.direction + j * 72,self.direction + j * 72,'waterBullet',-10,function(t){return 10},0,self.stats,'bounceOffCollisions');
                                }
                                Sound({
                                    type:'waterBullet',
                                    map:self.map,
                                });
                            }
                            break;
                        case "waterbook2Second":
                            if(isFireMap){
                                for(var j = -2;j < 3;j++){
                                    self.shootProjectile(self.id,'Player',self.direction + j * 72,self.direction + j * 72,'waterBullet',-10,function(t){return 10},0,self.stats,'bounceOffCollisions');
                                }
                                Sound({
                                    type:'waterBullet',
                                    map:self.map,
                                });
                            }
                            break;
                        case "waterbook3Second":
                            if(isFireMap){
                                for(var j = -3;j < 3;j++){
                                    self.shootProjectile(self.id,'Player',self.direction + j * 60,self.direction + j * 60,'waterBullet',-10,function(t){return 10},0,self.stats,'bounceOffCollisions');
                                }
                                Sound({
                                    type:'waterBullet',
                                    map:self.map,
                                });
                            }
                            break;
                        case "waterbook4Second":
                            if(isFireMap){
                                for(var j = -4;j < 5;j++){
                                    self.shootProjectile(self.id,'Player',self.direction + j * 40,self.direction + j * 40,'waterBullet',-10,function(t){return 10},0,self.stats,'bounceOffCollisions');
                                }
                                Sound({
                                    type:'waterBullet',
                                    map:self.map,
                                });
                            }
                            break;
                        case "waterbook5Second":
                            if(isFireMap){
                                for(var j = -4;j < 5;j++){
                                    self.shootProjectile(self.id,'Player',self.direction + j * 40,self.direction + j * 40,'waterBullet',-20,function(t){return 10},0,self.stats,'bounceOffCollisions');
                                }
                                Sound({
                                    type:'waterBullet',
                                    map:self.map,
                                });
                            }
                            break;
                        case "waterbook6Second":
                            if(isFireMap){
                                for(var j = -5;j < 5;j++){
                                    self.shootProjectile(self.id,'Player',self.direction + j * 36,self.direction + j * 36,'waterBullet',-20,function(t){return 10},0,self.stats,'bounceOffCollisions');
                                }
                                Sound({
                                    type:'waterBullet',
                                    map:self.map,
                                });
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
        if(self.keyPress.second === true){
            if(self.stats.damageType === 'magic' && self.mana >= self.secondCost && self.manaRefresh <= 0){
                for(var i in self.ability.secondPattern){
                    self.addToEventQ(self.ability.ability + 'Second',self.ability.secondPattern[i]);
                }
                self.doPassive();
                self.mana -= self.secondCost;
                self.manaRefresh = self.useTime;
            }
            else if(self.stats.damageType !== 'magic' && self.cooldown <= 0){
                for(var i in self.ability.secondPattern){
                    self.addToEventQ(self.ability.ability + 'Second',self.ability.secondPattern[i]);
                }
                self.doPassive();
                self.cooldown = self.useTime;
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
        pack.currentItem = self.currentItem;
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
        if(!ENV.Peaceful){
            var pet = Pet({
                parent:player.id,
                x:player.x + 128 * (Math.random() - 0.5),
                y:player.y + 128 * (Math.random() - 0.5),
                name:'Kiol Lvl.' + player.level,
                moveSpeed:5 + player.level / 5,
            });
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
            //player.teleport(ENV.Spawnpoint.x,ENV.Spawnpoint.y,ENV.Spawnpoint.map);
            var newTiles = [];
            for(var i in tiles){
                if(tiles[i].parent !== player.id){
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
    self.stats = {
        attack:1,
        defense:1,
        heal:1,
        range:1,
        speed:1,
        damageReduction:0,
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
        }
        else if(pt.type === 'Player'){
            self.target = pt;
            self.damagedEntity = pt;
            self.damaged = true;
        }
    }
    self.randomWalk(true,false,self.x,self.y);
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
    self.oldMoveSpeed = self.maxSpeed;
    self.oldStats = Object.create(self.stats);
    var lastSelf = {};
    var super_update = self.update;
    self.update = function(){
        self.lastX = self.x;
        self.lastY = self.y;
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
            if(self.monsterType === 'redBird'){
                addToChat('style="color: #ff00ff">','Red Bird has been defeated!');
            }
            if(self.monsterType === 'lightningLizard'){
                addToChat('style="color: #ff00ff">','Lightning Lizard has been defeated!');
            }
            if(self.monsterType === 'possessedSpirit'){
                addToChat('style="color: #ff00ff">','Possessed Spirit has been defeated!');
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
                self.trackEntity(self.target,128 + 64 * Math.random());
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
                    self.randomWalk(true,false,self.x,self.y);
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
                    self.shootProjectile(self.id,'Monster',self.direction,self.direction,'ninjaStar',0,function(t){return 25},0,self.stats);
                    Sound({
                        type:'ninjaStar',
                        map:self.map,
                    });
                }
                if(self.reload % 100 < 5 && self.reload > 10 && self.target.invincible === false){
                    self.shootProjectile(self.id,'Monster',self.direction,self.direction,'ninjaStar',0,function(t){return 25},0,self.stats);
                    Sound({
                        type:'ninjaStar',
                        map:self.map,
                    });
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
                        self.trackEntity(bestSpawner,128);
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
                self.trackEntity(self.target,128 + 64 * Math.random());
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
                    self.randomWalk(true,false,self.x,self.y);
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
                    if(ENV.Difficulty === 'Expert'){
                        self.maxSpeed = self.oldMoveSpeed * 5;
                    }
                    self.animation += 0.5;
                    if(self.animation >= 8){
                        self.animation = 0;
                    }
                    for(var i = 0;i < 4;i++){
                        self.shootProjectile(self.id,'Monster',self.animation * 45 + i * 90,self.animation * 45 + i * 90,'ballBullet',-20,function(t){return 25},0,self.stats);
                    }
                    if(self.reload % 60 === 0 && self.reload > 49 && self.target.invincible === false){
                        Sound({
                            type:'ballBullet',
                            map:self.map,
                        });
                    }
                }
                else{
                    self.maxSpeed = self.oldMoveSpeed;
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
                self.trackEntity(self.target,0);
                self.reload = 0;
                self.animation = 0;
                self.attackState = "attackCherryBomb";
                if(ENV.Difficulty === 'Expert'){
                    self.maxSpeed = self.oldMoveSpeed * 2;
                }
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
                    self.randomWalk(true,false,self.x,self.y);
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
                            self.stats.defense += 2000000;
                            self.stats.attack += 2000000;
                            self.attackState = 'explodeCherryBomb';
                            Sound({
                                type:'cherryBomb',
                                map:self.map,
                            });
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
                self.target = undefined;
                self.trackingEntity = undefined;
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
                self.spdX = 0;
                self.spdY = 0;
                self.x = self.lastX;
                self.y = self.lastY;
                break;
            case "passiveRedBird":
                self.animate = true;
                for(var i in Player.list){
                    if(Player.list[i].map === self.map && self.getSquareDistance(Player.list[i]) < 512 && Player.list[i].isDead === false && Player.list[i].invincible === false && Player.list[i].mapChange > 10){
                        self.attackState = "moveRedBird";
                        self.target = Player.list[i];
                    }
                }
                if(self.damaged){
                    self.attackState = "moveRedBird";
                }
                break;
            case "moveRedBird":
                self.trackEntity(self.target,128 + 64 * Math.random());
                self.reload = 0;
                self.animation = 0;
                self.attackState = "attackRedBird";
                break;
            case "attackRedBird":
                if(!self.target){
                    self.target = undefined;
                    self.attackState = 'passiveRedBird';
                    self.damagedEntity = false;
                    self.damaged = false;
                    break;
                }
                if(self.target.isDead){
                    self.target = undefined;
                    self.attackState = 'passiveRedBird';
                    self.damagedEntity = false;
                    self.damaged = false;
                    self.randomWalk(true,false,self.x,self.y);
                    break;
                }
                if(self.target.toRemove){
                    self.target = undefined;
                    self.attackState = 'passiveRedBird';
                    self.damagedEntity = false;
                    self.damaged = false;
                    break;
                }
                if(self.reload % 20 === 0 && self.reload > 10 && self.target.invincible === false){
                    self.shootProjectile(self.id,'Monster',self.direction - 5,self.direction - 5,'fireBullet',0,function(t){return 0},0,self.stats);
                    self.shootProjectile(self.id,'Monster',self.direction + 5,self.direction + 5,'fireBullet',0,function(t){return 0},0,self.stats);
                    Sound({
                        type:'fireBullet',
                        map:self.map,
                    });
                }
                if(self.reload % 100 < 5 && self.reload > 10 && self.target.invincible === false){
                    self.shootProjectile(self.id,'Monster',self.direction - 60,self.direction - 60,'fireBullet',32,function(t){return 25},0,self.stats,'playerHoming');
                    self.shootProjectile(self.id,'Monster',self.direction,self.direction,'fireBullet',32,function(t){return 25},0,self.stats,'playerHoming');
                    self.shootProjectile(self.id,'Monster',self.direction + 60,self.direction + 60,'fireBullet',32,function(t){return 25},0,self.stats,'playerHoming');
                    Sound({
                        type:'homingFireBullet',
                        map:self.map,
                    });
                }
                if(self.reload % 150 < 5 && self.reload > 10 && self.target.invincible === false){
                    for(var i = 0;i < 6;i++){
                        self.shootProjectile(self.id,'Monster',self.direction + i * 60,self.direction + i * 60,'fireBullet',32,function(t){return 25},0,self.stats,'playerHoming');
                    }
                    Sound({
                        type:'homingFireBullet',
                        map:self.map,
                    });
                }
                self.reload += 1;
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
            case "passiveLizard":
                self.animate = true;
                for(var i in Player.list){
                    if(Player.list[i].map === self.map && self.getSquareDistance(Player.list[i]) < 512 && Player.list[i].isDead === false && Player.list[i].invincible === false && Player.list[i].mapChange > 10){
                        self.attackState = "moveLizard";
                        self.target = Player.list[i];
                    }
                }
                if(self.damaged){
                    self.attackState = "moveLizard";
                }
                break;
            case "moveLizard":
                self.trackEntity(self.target,0);
                self.reload = 0;
                self.animation = 0;
                self.attackState = "attackLizard";
                break;
            case "attackLizard":
                if(!self.target){
                    self.target = undefined;
                    self.attackState = 'passiveLizard';
                    self.damagedEntity = false;
                    self.damaged = false;
                    break;
                }
                if(self.target.isDead){
                    self.target = undefined;
                    self.attackState = 'passiveLizard';
                    self.damagedEntity = false;
                    self.damaged = false;
                    self.randomWalk(true,false,self.x,self.y);
                    break;
                }
                if(self.target.toRemove){
                    self.target = undefined;
                    self.attackState = 'passiveLizard';
                    self.damagedEntity = false;
                    self.damaged = false;
                    break;
                }
                if(self.reload % 10 === 0 && self.reload > 10 && self.target.invincible === false && ENV.Difficulty !== 'Expert'){
                    self.shootProjectile(self.id,'Monster',self.direction,self.direction,'lizardSpit',0,function(t){return 0},0,self.stats);
                    Sound({
                        type:'lizardSpit',
                        map:self.map,
                    });
                }
                if(self.reload % 10 === 0 && self.reload > 10 && self.target.invincible === false && ENV.Difficulty === 'Expert'){
                    self.shootProjectile(self.id,'Monster',self.direction,self.direction,'lizardSpit',0,function(t){return 0},0,self.stats,'playerHoming');
                    Sound({
                        type:'lizardSpit',
                        map:self.map,
                    });
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
                if(self.getSquareDistance(self.target) > 512 || self.target.isDead){
                    if(!self.damaged){
                        self.target = undefined;
                        self.trackingEntity = undefined;
                        self.attackState = 'passiveLizard';
                    }
                }
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
                    self.attackState = 'passiveLizard';
                    self.maxSpeed = param.moveSpeed;
                    self.target = undefined;
                    self.trackingEntity = undefined;
                }
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
            case "passiveLightningLizard":
                self.animate = true;
                for(var i in Player.list){
                    if(Player.list[i].map === self.map && self.getSquareDistance(Player.list[i]) < 512 && Player.list[i].isDead === false && Player.list[i].invincible === false && Player.list[i].mapChange > 10){
                        self.attackState = "moveLightningLizard";
                        self.target = Player.list[i];
                    }
                }
                if(self.damaged){
                    self.attackState = "moveLightningLizard";
                }
                break;
            case "moveLightningLizard":
                self.trackEntity(self.target,0);
                self.reload = 0;
                self.animation = 0;
                self.attackState = "attackLightningLizard";
                break;
            case "attackLightningLizard":
                if(!self.target){
                    self.target = undefined;
                    self.attackState = 'passiveLightningLizard';
                    self.damagedEntity = false;
                    self.damaged = false;
                    break;
                }
                if(self.target.isDead){
                    self.target = undefined;
                    self.attackState = 'passiveLightningLizard';
                    self.damagedEntity = false;
                    self.damaged = false;
                    self.randomWalk(true,false,self.x,self.y);
                    break;
                }
                if(self.target.toRemove){
                    self.target = undefined;
                    self.attackState = 'passiveLightningLizard';
                    self.damagedEntity = false;
                    self.damaged = false;
                    break;
                }
                if(self.reload % 10 === 0 && self.reload > 10 && self.target.invincible === false && ENV.Difficulty !== 'Expert'){
                    self.shootProjectile(self.id,'Monster',self.direction,self.direction,'lightningSpit',0,function(t){return 0},0,self.stats);
                    Sound({
                        type:'lizardSpit',
                        map:self.map,
                    });
                }
                if(self.reload % 10 === 0 && self.reload > 10 && self.target.invincible === false && ENV.Difficulty === 'Expert'){
                    self.shootProjectile(self.id,'Monster',self.direction,self.direction,'lightningSpit',0,function(t){return 0},0,self.stats,'playerHoming');
                    Sound({
                        type:'lizardSpit',
                        map:self.map,
                    });
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
                    Sound({
                        type:'lizardSpit',
                        map:self.map,
                    });
                }
                self.reload += 1;
                if(self.getSquareDistance(self.target) > 512 || self.target.isDead){
                    if(!self.damaged){
                        self.target = undefined;
                        self.trackingEntity = undefined;
                        self.attackState = 'passiveLightningLizard';
                    }
                }
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
                if(self.map === 'The Forest'){
                    self.attackState = 'enragedLightningLizard';
                    addToChat('style="color: #ff00ff">','Lightning Lizard has enraged.');
                    self.itemDrops = {
                        "lightningsaber":0.25,
                        "lightningwand":0.25,
                        "bookoflightning":0.25,
                        "shieldoflightning":0.25,
                    };
                }
                break;
            case "enragedLightningLizard":
                if(!self.target){
                    self.target = undefined;
                    self.attackState = 'passiveLightningLizard';
                    self.damagedEntity = false;
                    self.damaged = false;
                    break;
                }
                if(self.target.isDead){
                    self.toRemove = true;
                    break;
                }
                if(self.target.toRemove){
                    self.toRemove = true;
                    break;
                }
                if(self.reload % 10 === 0 && self.reload > 10 && self.target.invincible === false && ENV.Difficulty !== 'Expert'){
                    self.shootProjectile(self.id,'Monster',self.direction,self.direction,'lightningSpit',0,function(t){return 0},0,self.stats);
                    Sound({
                        type:'lizardSpit',
                        map:self.map,
                    });
                }
                if(self.reload % 10 === 0 && self.reload > 10 && self.target.invincible === false && ENV.Difficulty === 'Expert'){
                    self.shootProjectile(self.id,'Monster',self.direction,self.direction,'lightningSpit',0,function(t){return 0},0,self.stats,'playerHoming');
                    Sound({
                        type:'lizardSpit',
                        map:self.map,
                    });
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
                    Sound({
                        type:'lizardSpit',
                        map:self.map,
                    });
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
                    Sound({
                        type:'lizardSpit',
                        map:self.map,
                    });
                }
                self.reload += 1;
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
            case "passiveGhost":
                //self.animate = true;
                for(var i in Player.list){
                    if(Player.list[i].map === self.map && Player.list[i].isDead === false && Player.list[i].invincible === false && Player.list[i].mapChange > 10){
                        self.attackState = "moveGhost";
                        self.target = Player.list[i];
                    }
                }
                if(self.damaged){
                    self.attackState = "moveGhost";
                }
                break;
            case "moveGhost":
                self.followEntity(self.target);
                self.reload = 0;
                self.animation = 0;
                self.attackState = "attackGhost";
                break;
            case "attackGhost":
                //self.animate = true;
                if(!self.target){
                    self.target = undefined;
                    self.attackState = 'passiveGhost';
                    self.damagedEntity = false;
                    self.damaged = false;
                    break;
                }
                if(self.target.isDead){
                    self.target = undefined;
                    self.attackState = 'passiveGhost';
                    self.damagedEntity = false;
                    self.damaged = false;
                    self.randomWalk(true,false,self.x,self.y);
                    break;
                }
                if(self.target.toRemove){
                    self.target = undefined;
                    self.attackState = 'passiveGhost';
                    self.damagedEntity = false;
                    self.damaged = false;
                    break;
                }
                self.reload += 1;
                if(self.animation === 1){
                    self.animation = 0;
                }
                else{
                    self.animation += 1;
                }
                break;
            case "passiveLostSpirit":
                //self.animate = true;
                for(var i in Player.list){
                    if(Player.list[i].map === self.map && Player.list[i].isDead === false && Player.list[i].invincible === false && Player.list[i].mapChange > 10){
                        self.attackState = "moveLostSpirit";
                        self.target = Player.list[i];
                    }
                }
                if(self.damaged){
                    self.attackState = "moveLostSpirit";
                }
                break;
            case "moveLostSpirit":
                self.followEntity(self.target);
                self.reload = 0;
                self.animation = 0;
                self.attackState = "attackLostSpirit";
                break;
            case "attackLostSpirit":
                //self.animate = true;
                if(!self.target){
                    self.target = undefined;
                    self.attackState = 'passiveLostSpirit';
                    self.damagedEntity = false;
                    self.damaged = false;
                    break;
                }
                if(self.target.isDead){
                    self.target = undefined;
                    self.attackState = 'passiveLostSpirit';
                    self.damagedEntity = false;
                    self.damaged = false;
                    self.randomWalk(true,false,self.x,self.y);
                    break;
                }
                if(self.target.toRemove){
                    self.target = undefined;
                    self.attackState = 'passiveLostSpirit';
                    self.damagedEntity = false;
                    self.damaged = false;
                    break;
                }
                if(self.reload % 20 === 0 && self.reload > 20 && self.target.invincible === false){
                    self.shootProjectile(self.id,'Monster',self.direction,self.direction,'soul',0,function(t){return 0},0,self.stats,'playerHoming');
                }
                self.reload += 1;
                if(self.animation === 1){
                    self.animation = 0;
                }
                else{
                    self.animation += 1;
                }
                break;
            case "passivePossessedSpirit":
                //self.animate = true;
                for(var i in Player.list){
                    if(Player.list[i].map === self.map && Player.list[i].isDead === false && Player.list[i].invincible === false && Player.list[i].mapChange > 10){
                        self.attackState = "movePossessedSpirit";
                        self.target = Player.list[i];
                    }
                }
                if(self.damaged){
                    self.attackState = "movePossessedSpirit";
                }
                break;
            case "movePossessedSpirit":
                self.followEntity(self.target);
                self.reload = 0;
                self.animation = 0;
                self.attackState = "attackPhase1PossessedSpirit";
                break;
            case "attackPhase1PossessedSpirit":
                //self.animate = true;
                var allPlayersDead = true;
                for(var i in Player.list){
                    if(Player.list[i].hp > 1 && Player.list[i].map === self.map){
                        allPlayersDead = false;
                    }
                }
                if(self.map === 'The Arena'){
                    allPlayersDead = false;
                }
                if(allPlayersDead){
                    self.toRemove = true;
                }
                if(!self.target){
                    self.target = undefined;
                    self.attackState = 'passivePossessedSpirit';
                    self.damagedEntity = false;
                    self.damaged = false;
                    break;
                }
                if(self.target.isDead){
                    self.target = undefined;
                    self.attackState = 'passivePossessedSpirit';
                    self.damagedEntity = false;
                    self.damaged = false;
                    self.randomWalk(true,false,self.x,self.y);
                    break;
                }
                if(self.target.toRemove){
                    self.target = undefined;
                    self.attackState = 'passivePossessedSpirit';
                    self.damagedEntity = false;
                    self.damaged = false;
                    break;
                }
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
                        self.attackState = 'phase2Transition';
                    }
                }
                self.reload += 1;
                if(self.animation === 1){
                    self.animation = 0;
                }
                else{
                    self.animation += 1;
                }
                break;
            case "phase2Transition":
                self.stage2 = true;
                var allPlayersDead = true;
                for(var i in Player.list){
                    if(Player.list[i].hp > 1 && Player.list[i].map === self.map){
                        allPlayersDead = false;
                    }
                }
                if(self.map === 'The Arena'){
                    allPlayersDead = false;
                }
                if(allPlayersDead){
                    self.toRemove = true;
                }
                if(!self.target){
                    self.target = undefined;
                    self.attackState = 'passivePossessedSpirit';
                    self.damagedEntity = false;
                    self.damaged = false;
                    break;
                }
                if(self.target.isDead){
                    self.target = undefined;
                    self.attackState = 'passivePossessedSpirit';
                    self.damagedEntity = false;
                    self.damaged = false;
                    self.randomWalk(true,false,self.x,self.y);
                    break;
                }
                if(self.target.toRemove){
                    self.target = undefined;
                    self.attackState = 'passivePossessedSpirit';
                    self.damagedEntity = false;
                    self.damaged = false;
                    break;
                }
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
                self.maxSpeed = self.oldMoveSpeed * 3;
                self.stats.attack = self.oldStats.attack * 1.5;
                self.attackState = 'attackPhase2PossessedSpirit';
                if(self.animation === 1){
                    self.animation = 0;
                }
                else{
                    self.animation += 1;
                }
                break;
            case "attackPhase2PossessedSpirit":
                //self.animate = true;
                var allPlayersDead = true;
                for(var i in Player.list){
                    if(Player.list[i].hp > 1 && Player.list[i].map === self.map){
                        allPlayersDead = false;
                    }
                }
                if(self.map === 'The Arena'){
                    allPlayersDead = false;
                }
                if(allPlayersDead){
                    self.toRemove = true;
                }
                if(!self.target){
                    self.target = undefined;
                    self.attackState = 'passivePossessedSpirit';
                    self.damagedEntity = false;
                    self.damaged = false;
                    break;
                }
                if(self.target.isDead){
                    self.target = undefined;
                    self.attackState = 'passivePossessedSpirit';
                    self.damagedEntity = false;
                    self.damaged = false;
                    self.randomWalk(true,false,self.x,self.y);
                    break;
                }
                if(self.target.toRemove){
                    self.target = undefined;
                    self.attackState = 'passivePossessedSpirit';
                    self.damagedEntity = false;
                    self.damaged = false;
                    break;
                }
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
                if(self.animation === 1){
                    self.animation = 0;
                }
                else{
                    self.animation += 1;
                }
                break;
            case "attackPhase3PossessedSpirit":
                //self.animate = true;
                var allPlayersDead = true;
                for(var i in Player.list){
                    if(Player.list[i].hp > 1 && Player.list[i].map === self.map){
                        allPlayersDead = false;
                    }
                }
                if(self.map === 'The Arena'){
                    allPlayersDead = false;
                }
                if(allPlayersDead){
                    self.toRemove = true;
                }
                if(!self.target){
                    self.target = undefined;
                    self.attackState = 'passivePossessedSpirit';
                    self.damagedEntity = false;
                    self.damaged = false;
                    break;
                }
                if(self.target.isDead){
                    self.target = undefined;
                    self.attackState = 'passivePossessedSpirit';
                    self.damagedEntity = false;
                    self.damaged = false;
                    self.randomWalk(true,false,self.x,self.y);
                    break;
                }
                if(self.target.toRemove){
                    self.target = undefined;
                    self.attackState = 'passivePossessedSpirit';
                    self.damagedEntity = false;
                    self.damaged = false;
                    break;
                }
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
                if(self.animation === 1){
                    self.animation = 0;
                }
                else{
                    self.animation += 1;
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
        if(lastSelf.canCollide !== self.canCollide){
            pack.canCollide = self.canCollide;
            lastSelf.canCollide = self.canCollide;
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
        pack.canCollide = self.canCollide;
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
    self.stats = {
        attack:0,
        defense:0,
        heal:1,
        damageReduction:0.999
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
                },7000);
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
        self.mana = Math.min(self.mana + 1,self.manaMax);
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
                        value:'+' + heal,
                    });
                }
                self.mana -= 100;
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
        if(lastSelf.mana !== self.mana){
            pack.mana = self.mana;
            lastSelf.mana = self.mana;
        }
        if(lastSelf.manaMax !== self.manaMax){
            pack.manaMax = self.manaMax;
            lastSelf.manaMax = self.manaMax;
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
    if(param.projectilePattern === 'followPlayerStationary'){
        self.distanceFromParentX = Player.list[self.parent].x - self.x;
        self.distanceFromParentY = Player.list[self.parent].y - self.y;
        self.spdX = 0;
        self.spdY = 0;
    }
    if(param.projectilePattern === 'spinAroundPlayer'){
        self.angle = param.angle;
        self.canCollide = false;
        self.spdX = 0;
        self.spdY = 0;
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
        self.pierce = 2;
    }
    if(param.projectilePattern === 'unholyTrident'){
        self.canCollide = false;
    }
    if(param.projectilePattern === 'holyTrident'){
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
    if(param.projectilePattern === 'lightningStrike'){
        self.canCollide = false;
    }
    var lastSelf = {};
	var super_update = self.update;
	self.update = function(){
        self.lastX = self.x;
        self.lastY = self.y;
        if(self.timer !== 0){
            self.spdX = self.spdX / 2;
            self.spdY = self.spdY / 2;
            for(var i = 0;i < 2;i++){
                super_update();
                self.updateCollisions();
            }
            self.spdX = self.spdX * 2;
            self.spdY = self.spdY * 2;
        }
        self.timer += 1;
        if(param.stats.range !== undefined){
            if(self.timer > 35 * param.stats.range){
                self.toRemove = true;
            }
        }
        else{
            if(self.timer > 35){
                self.toRemove = true;
            }
        }
        if(self.x < self.width / 2){
            self.x = self.width / 2;
            if(param.projectilePattern === 'bounceOffCollisions'){
                self.spdX = -self.spdX;
            }
            else{
                self.toRemove = true;
            }
        }
        if(self.x > self.mapWidth - self.width / 2){
            self.x = self.mapWidth - self.width / 2;
            if(param.projectilePattern === 'bounceOffCollisions'){
                self.spdX = -self.spdX;
            }
            else{
                self.toRemove = true;
            }
        }
        if(self.y < self.height / 2){
            self.y = self.height / 2;
            if(param.projectilePattern === 'bounceOffCollisions'){
                self.spdY = -self.spdY;
            }
            else{
                self.toRemove = true;
            }
        }
        if(self.y > self.mapHeight - self.height / 2){
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
        }
        else if(param.projectilePattern === 'spinAroundPlayer'){
            self.x = Player.list[self.parent].x;
            self.y = Player.list[self.parent].y;
            self.x += -Math.sin(self.angle) * param.distance;
            self.y += Math.cos(self.angle) * param.distance;
            self.angle += param.stats.speed / 2;
            self.direction = self.angle * 180 / Math.PI + 180;
        }
        else if(param.projectilePattern === 'spinAroundPoint'){
            var angle = Math.atan2(self.y - self.parentStartY,self.x - self.parentStartX);
            self.spdX = -Math.sin(angle) * param.stats.speed * 25;
            self.spdY = Math.cos(angle) * param.stats.speed * 25;
            self.timer -= 0.5;
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
                self.timer = 0;
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
                if(closestMonster === undefined && Monster.list[i].map === self.map){
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
        else if(param.projectilePattern === 'skull'){
            var closestMonster = undefined;
            for(var i in Monster.list){
                if(closestMonster === undefined && Monster.list[i].map === self.map){
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
        else if(param.projectilePattern === 'playerSoul' && self.timer < 10){
            var closestMonster = undefined;
            for(var i in Monster.list){
                if(closestMonster === undefined && Monster.list[i].map === self.map){
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
                if(closestMonster === undefined && Monster.list[i].map === self.map){
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
                if(closestMonster === undefined && Monster.list[i].map === self.map){
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
        else if(param.projectilePattern === 'playerSoulWait'){
            var closestMonster = undefined;
            for(var i in Monster.list){
                if(closestMonster === undefined && Monster.list[i].map === self.map){
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
        var firstTile = "" + self.map + ":" + Math.round((self.x - 64) / 64) * 64 + ":" + Math.round((self.y - 64) / 64) * 64 + ":";
        var secondTile = "" + self.map + ":" + Math.round((self.x - 64) / 64) * 64 + ":" + Math.round(self.y / 64) * 64 + ":";
        var thirdTile = "" + self.map + ":" + Math.round(self.x / 64) * 64 + ":" + Math.round((self.y - 64) / 64) * 64 + ":";
        var fourthTile = "" + self.map + ":" + Math.round(self.x / 64) * 64 + ":" + Math.round(self.y / 64) * 64 + ":";
        if(Collision.list[firstTile]){
            if(self.isColliding(Collision.list[firstTile])){
                if(param.projectilePattern === 'bounceOffCollisions'){
                    var x = self.x;
                    self.x = self.lastX;
                    if(self.isColliding(Collision.list[firstTile])){
                        self.x = x;
                        self.y = self.lastY;
                        if(self.isColliding(Collision.list[firstTile])){
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
        if(Collision.list[secondTile]){
            if(self.isColliding(Collision.list[secondTile])){
                if(param.projectilePattern === 'bounceOffCollisions'){
                    var x = self.x;
                    self.x = self.lastX;
                    if(self.isColliding(Collision.list[secondTile])){
                        self.x = x;
                        self.y = self.lastY;
                        if(self.isColliding(Collision.list[secondTile])){
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
        if(Collision.list[thirdTile]){
            if(self.isColliding(Collision.list[thirdTile])){
                if(param.projectilePattern === 'bounceOffCollisions'){
                    var x = self.x;
                    self.x = self.lastX;
                    if(self.isColliding(Collision.list[thirdTile])){
                        self.x = x;
                        self.y = self.lastY;
                        if(self.isColliding(Collision.list[thirdTile])){
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
        if(Collision.list[fourthTile]){
            if(self.isColliding(Collision.list[fourthTile])){
                if(param.projectilePattern === 'bounceOffCollisions'){
                    var x = self.x;
                    self.x = self.lastX;
                    if(self.isColliding(Collision.list[fourthTile])){
                        self.x = x;
                        self.y = self.lastY;
                        if(self.isColliding(Collision.list[fourthTile])){
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
        if(Collision2.list[firstTile]){
            if(self.isColliding(Collision2.list[firstTile])){
                if(param.projectilePattern === 'bounceOffCollisions'){
                    var x = self.x;
                    self.x = self.lastX;
                    if(self.isColliding(Collision2.list[firstTile])){
                        self.x = x;
                        self.y = self.lastY;
                        if(self.isColliding(Collision2.list[firstTile])){
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
        if(Collision2.list[secondTile]){
            if(self.isColliding(Collision2.list[secondTile])){
                if(param.projectilePattern === 'bounceOffCollisions'){
                    var x = self.x;
                    self.x = self.lastX;
                    if(self.isColliding(Collision2.list[secondTile])){
                        self.x = x;
                        self.y = self.lastY;
                        if(self.isColliding(Collision2.list[secondTile])){
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
        if(Collision2.list[thirdTile]){
            if(self.isColliding(Collision2.list[thirdTile])){
                if(param.projectilePattern === 'bounceOffCollisions'){
                    var x = self.x;
                    self.x = self.lastX;
                    if(self.isColliding(Collision2.list[thirdTile])){
                        self.x = x;
                        self.y = self.lastY;
                        if(self.isColliding(Collision2.list[thirdTile])){
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
        if(Collision2.list[fourthTile]){
            if(self.isColliding(Collision2.list[fourthTile])){
                if(param.projectilePattern === 'bounceOffCollisions'){
                    var x = self.x;
                    self.x = self.lastX;
                    if(self.isColliding(Collision2.list[fourthTile])){
                        self.x = x;
                        self.y = self.lastY;
                        if(self.isColliding(Collision2.list[fourthTile])){
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
        if(Collision3.list[firstTile]){
            if(self.isColliding(Collision3.list[firstTile])){
                if(param.projectilePattern === 'bounceOffCollisions'){
                    var x = self.x;
                    self.x = self.lastX;
                    if(self.isColliding(Collision3.list[firstTile])){
                        self.x = x;
                        self.y = self.lastY;
                        if(self.isColliding(Collision3.list[firstTile])){
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
        if(Collision3.list[secondTile]){
            if(self.isColliding(Collision3.list[secondTile])){
                if(param.projectilePattern === 'bounceOffCollisions'){
                    var x = self.x;
                    self.x = self.lastX;
                    if(self.isColliding(Collision3.list[secondTile])){
                        self.x = x;
                        self.y = self.lastY;
                        if(self.isColliding(Collision3.list[secondTile])){
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
        if(Collision3.list[thirdTile]){
            if(self.isColliding(Collision3.list[thirdTile])){
                if(param.projectilePattern === 'bounceOffCollisions'){
                    var x = self.x;
                    self.x = self.lastX;
                    if(self.isColliding(Collision3.list[thirdTile])){
                        self.x = x;
                        self.y = self.lastY;
                        if(self.isColliding(Collision3.list[thirdTile])){
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
        if(Collision3.list[fourthTile]){
            if(self.isColliding(Collision3.list[fourthTile])){
                if(param.projectilePattern === 'bounceOffCollisions'){
                    var x = self.x;
                    self.x = self.lastX;
                    if(self.isColliding(Collision3.list[fourthTile])){
                        self.x = x;
                        self.y = self.lastY;
                        if(self.isColliding(Collision3.list[fourthTile])){
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
        return pack;
	}
    self.getInitPack = function(){
        var pack = {};
        pack.id = self.id;
        pack.x = self.x;
        pack.y = self.y;
        pack.spdX = self.spdX;
        pack.spdY = self.spdY;
        pack.width = self.width;
        pack.height = self.height;
        pack.map = self.map;
        pack.type = self.type;
        pack.projectileType = self.projectileType;
        pack.canCollide = pack.canCollide;
        pack.direction = self.direction;
        return pack;
    }
	Projectile.list[self.id] = self;
	return self;
}
Projectile.list = {};

Sound = function(param){
    var self = {};
    self.id = Math.random();
    self.map = param.map;
    self.type = param.type;
    self.getUpdatePack = function(){
        return {
            type:param.type,
        }
    }
    Sound.list[self.id] = self;
}
Sound.list = {};

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
load("Lilypad Temple Room 0");
load("The Arena");
var compareMaps = function(a,b){
    if(a.y === b.y){
        return a.x - b.x;
    }
    return a.y - b.y;
}
fs.readFile("./client/maps/World.world","utf8",function(err,data){
    worldMap = JSON.parse(data).maps;
    worldMap["Lilypad Temple Room 0"]
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
                        Player.list[i].onCollision(Projectile.list[j],1);
                        Projectile.list[j].onCollision(Projectile.list[j],Player.list[i]);
                    }
                    else if(Projectile.list[j].parentType !== 'Player'){
                        Player.list[i].onCollision(Projectile.list[j],1);
                        Projectile.list[j].onCollision(Projectile.list[j],Player.list[i]);
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
                if(Monster.list[i].isColliding(Projectile.list[j]) && "" + Projectile.list[j].parent !== i && Projectile.list[j].parentType !== 'Monster' && Projectile.list[j].map === Monster.list[i].map && Monster.list[i].invincible === false){
                    Monster.list[i].onCollision(Projectile.list[j],1);
                    Projectile.list[j].onCollision(Projectile.list[j],Monster.list[i]);
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

