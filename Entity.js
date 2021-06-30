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
    50000,
    100000,
    150000,
    200000,
    250000,
    300000,
    350000,
    400000,
    450000,
    500000,
    550000,
    600000,
    650000,
    700000,
    750000,
    800000,
    850000,
    900000,
    950000,
    1000000,
    1100000,
    1200000,
    1300000,
    1400000,
    1500000,
    1600000,
    1700000,
    1800000,
    1900000,
    2000000,
    2200000,
    2400000,
    2600000,
    2800000,
    3000000,
    4000000,
    5500000,
    7000000,
    10000000,
    14000000,
    20000000,
    27500000,
    40000000,
    72500000,
    100000000,
    150000000,
    250000000,
    400000000,
    700000000,
    1000000000,
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
    if(map === 'The Pet Arena'){
        isFireMap = false;
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
var npcData = require('./npc.json');

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
    /*
    for(var i in Sound.list){
        if(!pack[Sound.list[i].map]){
            pack[Sound.list[i].map] = {player:[],projectile:[],monster:[],npc:[],pet:[],particle:[],sound:[]};
        }
        var updatePack = Sound.list[i].getUpdatePack();
        pack[Sound.list[i].map].sound.push(updatePack);
        delete Sound.list[i];
    }*/
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
                addToChat('style="color: #00aadd">','I\'m not done yet!');
                for(var i in monsterData){
                    if(i === 'whirlwind'){
                        var monsterHp = monsterData[i].hp;
                        var monsterStats = Object.create(monsterData[i].stats);
                        monsterHp *= ENV.MonsterStrength;
                        monsterStats.attack *= ENV.MonsterStrength;
                        monsterHp *= 5;
                        monsterStats.attack *= 1.5;
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
            else if(ENV.BossRushStage === 7){
                addToChat('style="color: #00aadd">','You expected a reward beyond this mere leaf? Patience, the true reward will come apparent in time...');
                ENV.BossRushStage = 0;
                ENV.BossRush = false;
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
                    addToChat('style="color: #ff0000">','Impending Developer Approaching..');
                },60000);
                setTimeout(function(){
                    s.testDPS();
                },70000);
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
    self.stats = {
        attack:1,
        defense:1,
        heal:1,
        range:1,
        speed:1,
        damageReduction:0,
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
                                if(Collision.list[self.map][x / 64]){
                                    if(Collision.list[self.map][x / 64][y / 64]){
                                        grid.setWalkableAt(i,j,false);
                                    }
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
            self.spdX = Math.cos(Math.atan2(self.followingEntity.y - self.y,self.followingEntity.x - self.x));
            self.spdY = Math.sin(Math.atan2(self.followingEntity.y - self.y,self.followingEntity.x - self.x));
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
    self.doDebuffs = function(){
        var hp = self.hp;
        if(self.invincible || self.type === 'Pet'){
            return;
        }
        self.debuffTimer += 1;
        //self.oldStats = JSON.parse(JSON.stringify(self.stats));
        var stats = JSON.parse(JSON.stringify(self.oldStats));
        var debuffRemoveList = [];
        for(var i = self.debuffs.length - 1;i >= 0;i--){
            var debuffImmune = true;
            for(var j in self.immuneDebuffs){
                if(self.immuneDebuffs[j] === self.debuffs[i].id){
                    debuffRemoveList.push(i);
                    debuffImmune = false;
                }
            }
            if(debuffImmune === true){
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
                            value:'-' + damage,
                        });
                        var particle = new Particle({
                            x:self.x + Math.random() * self.width - self.width / 2,
                            y:self.y + Math.random() * self.height - self.height / 2,
                            map:self.map,
                            particleType:'fire',
                            value:'-' + damage,
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
                            value:'-' + damage,
                        });
                        var particle = new Particle({
                            x:self.x + Math.random() * self.width - self.width / 2,
                            y:self.y + Math.random() * self.height - self.height / 2,
                            map:self.map,
                            particleType:'electricity',
                            value:'-' + damage,
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
                            value:'-' + damage,
                        });
                        var particle = new Particle({
                            x:self.x + Math.random() * self.width - self.width / 2,
                            y:self.y + Math.random() * self.height - self.height / 2,
                            map:self.map,
                            particleType:'death',
                            value:'-' + damage,
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
                            value:'-' + damage,
                        });
                        var particle = new Particle({
                            x:self.x + Math.random() * self.width - self.width / 2,
                            y:self.y + Math.random() * self.height - self.height / 2,
                            map:self.map,
                            particleType:'frost',
                            value:'-' + damage,
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
                            value:'-' + damage,
                        });
                        var particle = new Particle({
                            x:self.x + Math.random() * self.width - self.width / 2,
                            y:self.y + Math.random() * self.height - self.height / 2,
                            map:self.map,
                            particleType:'frost',
                            value:'-' + damage,
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
                            value:'-' + damage,
                        });
                        var particle = new Particle({
                            x:self.x + Math.random() * self.width - self.width / 2,
                            y:self.y + Math.random() * self.height - self.height / 2,
                            map:self.map,
                            particleType:'frost',
                            value:'-' + damage,
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
                            value:'-' + damage,
                        });
                        var particle = new Particle({
                            x:self.x + Math.random() * self.width - self.width / 2,
                            y:self.y + Math.random() * self.height - self.height / 2,
                            map:self.map,
                            particleType:'electricity',
                            value:'-' + damage,
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
                            value:'-' + damage,
                        });
                        var particle = new Particle({
                            x:self.x + Math.random() * self.width - self.width / 2,
                            y:self.y + Math.random() * self.height - self.height / 2,
                            map:self.map,
                            particleType:'electricity',
                            value:'-' + damage,
                        });
                    }
                    stats.defense -= 1500;
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
                                    if(i === 'enchantmentbook' && Player.list[pt.parent].stats.luck > 0){
                                        var itemIndex = Player.list[pt.parent].inventory.addItem(i,[]);
                                        Player.list[pt.parent].inventory.addRandomizedEnchantments(itemIndex,10);
                                        for(var j = 0;j < self.itemDrops[i] - 1;j++){
                                            var itemIndex2 = Player.list[pt.parent].inventory.addItem(i,[]);
                                            Player.list[pt.parent].inventory.addRandomizedEnchantments(itemIndex2,10);
                                        }
                                        var item = Player.list[pt.parent].inventory.items[itemIndex];
                                        addToChat('style="color: ' + Player.list[pt.parent].textColor + '">',Player.list[pt.parent].displayName + " got a " + Item.list[item.id].name + " x" + Math.round(self.itemDrops[i]) + ".");
                                    }
                                    else if(self.itemDrops[i] * Player.list[pt.parent].stats.luck > Math.random()){
                                        var itemIndex = Player.list[pt.parent].inventory.addItem(i,[]);
                                        Player.list[pt.parent].inventory.addRandomizedEnchantments(itemIndex,Player.list[pt.parent].stats.luck);
                                        var item = Player.list[pt.parent].inventory.items[itemIndex];
                                        addToChat('style="color: ' + Player.list[pt.parent].textColor + '">',Player.list[pt.parent].displayName + " got a " + Item.list[item.id].name + ".");
                                    }
                                }
                            }
                            Player.list[pt.parent].xp += self.xpGain * Math.round((10 + Math.random() * 10) * Player.list[pt.parent].stats.xp);
                            Player.list[pt.parent].coins += self.xpGain * Math.round((50 + Math.random() * 25) * Player.list[pt.parent].stats.xp);
                        }
                    }
                    if(pt.type === 'Player' && self.type === 'Monster'){
                        if(self.itemDrops === {}){
                                
                        }
                        else{
                            for(var i in self.itemDrops){
                                if(i === 'enchantmentbook' && pt.stats.luck > 0){
                                    var itemIndex = pt.inventory.addItem(i,[]);
                                    pt.inventory.addRandomizedEnchantments(itemIndex,10);
                                    for(var j = 0;j < self.itemDrops[i] - 1;j++){
                                        var itemIndex2 = pt.inventory.addItem(i,[]);
                                        pt.inventory.addRandomizedEnchantments(itemIndex2,10);
                                    }
                                    var item = pt.inventory.items[itemIndex];
                                    addToChat('style="color: ' + pt.textColor + '">',pt.displayName + " got a " + Item.list[item.id].name + " x" + Math.round(self.itemDrops[i]) + ".");
                                }
                                else if(self.itemDrops[i] * pt.stats.luck > Math.random()){
                                    var itemIndex = pt.inventory.addItem(i,[]);
                                    pt.inventory.addRandomizedEnchantments(itemIndex,pt.stats.luck);
                                    var item = pt.inventory.items[itemIndex];
                                    addToChat('style="color: ' + pt.textColor + '">',pt.displayName + " got a " + Item.list[item.id].name + ".");
                                }
                            }
                        }
                        pt.xp += Math.round(self.xpGain * (10 + Math.random() * 10) * pt.stats.xp);
                        pt.coins += Math.round(self.xpGain * (50 + Math.random() * 25) * pt.stats.xp);
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
            for(var i in pt.stats.debuffs){
                var debuffAdded = false;
                for(var j in self.debuffs){
                    if(pt.stats.debuffs[i].id === self.debuffs[j].id && !debuffAdded){
                        self.debuffs[j].time = pt.stats.debuffs[i].time;
                        debuffAdded = true;
                    }
                }
                if(!debuffAdded){
                    self.debuffs.push(Object.create(pt.stats.debuffs[i]));
                }
            }
            if(pt.projectileType){
                if(pt.projectileType === 'fireBullet'){
                    var debuffAdded = false;
                    for(var j in self.debuffs){
                        if(self.debuffs[j].id === 'burning' && !debuffAdded){
                            self.debuffs[j].time = 30;
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
                                var itemIndex = Player.list[pt.parent].inventory.addItem(i,[]);
                                Player.list[pt.parent].inventory.addRandomizedEnchantments(itemIndex,10);
                                for(var j = 0;j < self.itemDrops[i] - 1;j++){
                                    var itemIndex2 = Player.list[pt.parent].inventory.addItem(i,[]);
                                    Player.list[pt.parent].inventory.addRandomizedEnchantments(itemIndex2,10);
                                }
                                var item = Player.list[pt.parent].inventory.items[itemIndex];
                                addToChat('style="color: ' + Player.list[pt.parent].textColor + '">',Player.list[pt.parent].displayName + " got a " + Item.list[item.id].name + " x" + Math.round(self.itemDrops[i]) + ".");
                            }
                            else if(self.itemDrops[i] * Player.list[pt.parent].stats.luck > Math.random()){
                                var itemIndex = Player.list[pt.parent].inventory.addItem(i,[]);
                                Player.list[pt.parent].inventory.addRandomizedEnchantments(itemIndex,Player.list[pt.parent].stats.luck);
                                var item = Player.list[pt.parent].inventory.items[itemIndex];
                                addToChat('style="color: ' + Player.list[pt.parent].textColor + '">',Player.list[pt.parent].displayName + " got a " + Item.list[item.id].name + ".");
                            }
                        }
                    }
                    Player.list[pt.parent].xp += self.xpGain * Math.round((10 + Math.random() * 10) * Player.list[pt.parent].stats.xp);
                    Player.list[pt.parent].coins += self.xpGain * Math.round((50 + Math.random() * 25) * Player.list[pt.parent].stats.xp);
                }
            }
            if(pt.type === 'Player' && self.type === 'Monster'){
                if(self.itemDrops === {}){
                        
                }
                else{
                    for(var i in self.itemDrops){
                        if(i === 'enchantmentbook' && pt.stats.luck > 0){
                            var itemIndex = pt.inventory.addItem(i,[]);
                            pt.inventory.addRandomizedEnchantments(itemIndex,10);
                            for(var j = 0;j < self.itemDrops[i] - 1;j++){
                                var itemIndex2 = pt.inventory.addItem(i,[]);
                                pt.inventory.addRandomizedEnchantments(itemIndex2,10);
                            }
                            var item = pt.inventory.items[itemIndex];
                            addToChat('style="color: ' + pt.textColor + '">',pt.displayName + " got a " + Item.list[item.id].name + " x" + Math.round(self.itemDrops[i]) + ".");
                        }
                        else if(self.itemDrops[i] * pt.stats.luck > Math.random()){
                            var itemIndex = pt.inventory.addItem(i,[]);
                            pt.inventory.addRandomizedEnchantments(itemIndex,pt.stats.luck);
                            var item = pt.inventory.items[itemIndex];
                            addToChat('style="color: ' + pt.textColor + '">',pt.displayName + " got a " + Item.list[item.id].name + ".");
                        }
                    }
                }
                pt.xp += Math.round(self.xpGain * (10 + Math.random() * 10) * pt.stats.xp);
                pt.coins += Math.round(self.xpGain * (50 + Math.random() * 25) * pt.stats.xp);
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
        if(self.canCollide === false){
            return;
        }
        var firstTile = "" + self.map + ":" + Math.round((self.x - 64) / 64) * 64 + ":" + Math.round((self.y - 64) / 64) * 64 + ":";
        var secondTile = "" + self.map + ":" + Math.round((self.x - 64) / 64) * 64 + ":" + Math.round(self.y / 64) * 64 + ":";
        var thirdTile = "" + self.map + ":" + Math.round(self.x / 64) * 64 + ":" + Math.round((self.y - 64) / 64) * 64 + ":";
        var fourthTile = "" + self.map + ":" + Math.round(self.x / 64) * 64 + ":" + Math.round(self.y / 64) * 64 + ":";
        
        if(self.spdX <= 0){
            if(self.spdY <= 0){
                if(Collision.list[self.map][Math.round((self.x) / 64)]){
                    if(Collision.list[self.map][Math.round((self.x) / 64)][Math.round((self.y) / 64)]){
                        self.doNormalCollision(self.map,Math.round((self.x) / 64),Math.round((self.y) / 64));
                    }
                }
                if(Collision.list[self.map][Math.round((self.x) / 64)]){
                    if(Collision.list[self.map][Math.round((self.x) / 64)][Math.round((self.y - 64) / 64)]){
                        self.doNormalCollision(self.map,Math.round((self.x) / 64),Math.round((self.y - 64) / 64));
                    }
                }
                if(Collision.list[self.map][Math.round((self.x - 64) / 64)]){
                    if(Collision.list[self.map][Math.round((self.x - 64) / 64)][Math.round((self.y) / 64)]){
                        self.doNormalCollision(self.map,Math.round((self.x - 64) / 64),Math.round((self.y) / 64));
                    }
                }
                if(Collision.list[self.map][Math.round((self.x - 64) / 64)]){
                    if(Collision.list[self.map][Math.round((self.x - 64) / 64)][Math.round((self.y - 64) / 64)]){
                        self.doNormalCollision(self.map,Math.round((self.x - 64) / 64),Math.round((self.y - 64) / 64));
                    }
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
                if(Collision.list[self.map][Math.round((self.x) / 64)]){
                    if(Collision.list[self.map][Math.round((self.x) / 64)][Math.round((self.y - 64) / 64)]){
                        self.doNormalCollision(self.map,Math.round((self.x) / 64),Math.round((self.y - 64) / 64));
                    }
                }
                if(Collision.list[self.map][Math.round((self.x) / 64)]){
                    if(Collision.list[self.map][Math.round((self.x) / 64)][Math.round((self.y) / 64)]){
                        self.doNormalCollision(self.map,Math.round((self.x) / 64),Math.round((self.y) / 64));
                    }
                }
                if(Collision.list[self.map][Math.round((self.x - 64) / 64)]){
                    if(Collision.list[self.map][Math.round((self.x - 64) / 64)][Math.round((self.y - 64) / 64)]){
                        self.doNormalCollision(self.map,Math.round((self.x - 64) / 64),Math.round((self.y - 64) / 64));
                    }
                }
                if(Collision.list[self.map][Math.round((self.x - 64) / 64)]){
                    if(Collision.list[self.map][Math.round((self.x - 64) / 64)][Math.round((self.y) / 64)]){
                        self.doNormalCollision(self.map,Math.round((self.x - 64) / 64),Math.round((self.y) / 64));
                    }
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
        }
        else if(self.spdX > 0){
            if(self.spdY <= 0){
                if(Collision.list[self.map][Math.round((self.x - 64) / 64)]){
                    if(Collision.list[self.map][Math.round((self.x - 64) / 64)][Math.round((self.y) / 64)]){
                        self.doNormalCollision(self.map,Math.round((self.x - 64) / 64),Math.round((self.y) / 64));
                    }
                }
                if(Collision.list[self.map][Math.round((self.x - 64) / 64)]){
                    if(Collision.list[self.map][Math.round((self.x - 64) / 64)][Math.round((self.y - 64) / 64)]){
                        self.doNormalCollision(self.map,Math.round((self.x - 64) / 64),Math.round((self.y - 64) / 64));
                    }
                }
                if(Collision.list[self.map][Math.round((self.x) / 64)]){
                    if(Collision.list[self.map][Math.round((self.x) / 64)][Math.round((self.y) / 64)]){
                        self.doNormalCollision(self.map,Math.round((self.x) / 64),Math.round((self.y) / 64));
                    }
                }
                if(Collision.list[self.map][Math.round((self.x) / 64)]){
                    if(Collision.list[self.map][Math.round((self.x) / 64)][Math.round((self.y - 64) / 64)]){
                        self.doNormalCollision(self.map,Math.round((self.x) / 64),Math.round((self.y - 64) / 64));
                    }
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
                if(Collision.list[self.map][Math.round((self.x - 64) / 64)]){
                    if(Collision.list[self.map][Math.round((self.x - 64) / 64)][Math.round((self.y - 64) / 64)]){
                        self.doNormalCollision(self.map,Math.round((self.x - 64) / 64),Math.round((self.y - 64) / 64));
                    }
                }
                if(Collision.list[self.map][Math.round((self.x - 64) / 64)]){
                    if(Collision.list[self.map][Math.round((self.x - 64) / 64)][Math.round((self.y) / 64)]){
                        self.doNormalCollision(self.map,Math.round((self.x - 64) / 64),Math.round((self.y) / 64));
                    }
                }
                if(Collision.list[self.map][Math.round((self.x) / 64)]){
                    if(Collision.list[self.map][Math.round((self.x) / 64)][Math.round((self.y - 64) / 64)]){
                        self.doNormalCollision(self.map,Math.round((self.x) / 64),Math.round((self.y - 64) / 64));
                    }
                }
                if(Collision.list[self.map][Math.round((self.x) / 64)]){
                    if(Collision.list[self.map][Math.round((self.x) / 64)][Math.round((self.y) / 64)]){
                        self.doNormalCollision(self.map,Math.round((self.x) / 64),Math.round((self.y) / 64));
                    }
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
    self.doNormalCollision = function(map,x,y){
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
        "Possessed Spirit":false,
        "Plantera":false,
        "Whirlwind":false,
        "sp":false,
        "Lost Rubies":false,
        "Broken Piano":false,
        "Pet Training":false,
        "Monster Search":false,
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
    if(self.inventory.items.length === 0){
        self.inventory.addItem('simplewoodenbow',[]);
        self.inventory.addItem('simplewoodensword',[]);
        self.inventory.addItem('simplewoodenstaff',[]);
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
    self.hpMax = 100 + self.level * 20;
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
        debuffs:[],
        aggro:0,
    }
    self.oldStats = JSON.parse(JSON.stringify(self.stats));
    self.coins = 0;
    self.devCoins = 0;
    if(param.param.coins !== undefined){
        self.coins = param.param.coins;
    }
    if(param.param.devCoins !== undefined){
        self.devCoins = param.param.devCoins;
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
                    self.questDependent[i].toRemove = true;
                }
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
                            value:'+' + heal,
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
        self.updateStats();
        self.updateXp();
        if(self.hp > self.hpMax){
            self.hp = self.hpMax;
        }
        if(self.pushPt){
            self.dazed = self.maxSpeed * 2;
        }
        self.pushPt = undefined;
        self.damageArray.splice(0,1);
        self.damageArray.push(0);
    }
    self.updateQuest = function(){
        for(var i in Npc.list){
            if(Npc.list[i].map === self.map && Npc.list[i].entityId === 'bob' && self.mapChange > 20 && Npc.list[i].x - 32 < self.mouseX && Npc.list[i].x + 32 > self.mouseX && Npc.list[i].y - 32 < self.mouseY && Npc.list[i].y + 32 > self.mouseY && self.keyPress.second === true){
                if(self.quest === false && self.questInfo.quest === false && self.questStats["Missing Person"] === false){
                    self.questStage = 1;
                    self.invincible = true;
                    self.questInfo.quest = 'Missing Person';
                    socket.emit('dialogueLine',{
                        state:'ask',
                        message:'Hey, my friend Mark went to map The River to collect some wood. He hasn\'t come back in two hours! Can you rescue Mark for me?',
                        response1:'Sure, I can rescue Mark.',
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
                        message:'Thanks. The map The River is to the west of The Village, which is where you are now.',
                        response1:'*End conversation*',
                    });
                    self.currentResponse = 0;
                }
                else if(self.questStage === 11){
                    self.questStage += 1;
                    self.invincible = true;
                    socket.emit('dialogueLine',{
                        state:'ask',
                        message:'Oh, Mark is fine? That\'s great!',
                        response1:'*End conversation*',
                    });
                    self.currentResponse = 0;
                }
                else{
                    socket.emit('notification','[!] This NPC doesn\'t want to talk to you right now.');
                }
                self.keyPress.second = false;
            }
            if(Npc.list[i].map === self.map && Npc.list[i].entityId === 'john' && self.mapChange > 20 && Npc.list[i].x - 32 < self.mouseX && Npc.list[i].x + 32 > self.mouseX && Npc.list[i].y - 32 < self.mouseY && Npc.list[i].y + 32 > self.mouseY && self.keyPress.second === true){
                if(self.quest === false && self.questInfo.quest === false && self.questStats["Missing Person"] === false){
                    self.questStage = 1;
                    self.invincible = true;
                    self.questInfo.quest = 'Weird Tower';
                    socket.emit('dialogueLine',{
                        state:'ask',
                        message:'What do you want?',
                        response1:'Do you have a quest for me?',
                        response2:'Nothing.',
                    });
                    self.currentResponse = 0;
                }
                else if(self.quest === false && self.questInfo.quest === false && self.questStats["Missing Person"] === true){
                    self.questStage = 3;
                    self.invincible = true;
                    self.questInfo.quest = 'Weird Tower';
                    socket.emit('dialogueLine',{
                        state:'ask',
                        message:'Can you go on a quest for me?',
                        response1:'Sure!',
                        response2:'No.',
                    });
                    self.currentResponse = 0;
                }
                else if(self.questStage === 7 && self.quest === 'Weird Tower'){
                    self.questStage += 1;
                    self.invincible = true;
                    socket.emit('dialogueLine',{
                        state:'ask',
                        message:'Thanks. Go investigate that weird tower.',
                        response1:'*End conversation*',
                    });
                    self.currentResponse = 0;
                }
                else if(self.questStage === 13){
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
                else{
                    socket.emit('notification','[!] This NPC doesn\'t want to talk to you right now.');
                }
                self.keyPress.second = false;
            }
            if(Npc.list[i].map === self.map && Npc.list[i].entityId === 'fisherman' && self.mapChange > 20 && Npc.list[i].x - 32 < self.mouseX && Npc.list[i].x + 32 > self.mouseX && Npc.list[i].y - 32 < self.mouseY && Npc.list[i].y + 32 > self.mouseY && self.keyPress.second === true){
                if(self.quest === false && self.questInfo.quest === false && self.questStats["Weird Tower"] === false){
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
                else if(self.quest === false && self.questInfo.quest === false && self.questStats["Weird Tower"] === true){
                    self.questStage = 2;
                    self.invincible = true;
                    self.questInfo.quest = 'Clear River';
                    socket.emit('dialogueLine',{
                        state:'ask',
                        message:'You talked to John and defeated the monsters in that weird tower right?',
                        response1:'Yeah!',
                        response2:'No.',
                        response3:'Can I buy some fish?',
                    });
                    self.currentResponse = 0;
                }
                else if(self.questStage === 6 && self.quest === 'Clear River'){
                    self.questStage += 1;
                    self.invincible = true;
                    socket.emit('dialogueLine',{
                        state:'ask',
                        message:'Ok, go kill those Monsters!',
                        response1:'*End conversation*',
                    });
                    self.currentResponse = 0;
                }
                else if(self.questStage === 11 && self.quest === 'Clear River'){
                    self.questStage += 1;
                    self.invincible = true;
                    socket.emit('dialogueLine',{
                        state:'ask',
                        message:'You did it? Thanks! Here is a reward.',
                        response1:'*End conversation*',
                    });
                    self.currentResponse = 0;
                }
                else{
                    socket.emit('notification','[!] This NPC doesn\'t want to talk to you right now.');
                }
                self.keyPress.second = false;
            }
            if(Npc.list[i].map === self.map && Npc.list[i].entityId === 'wizard' && self.mapChange > 20 && Npc.list[i].x - 32 < self.mouseX && Npc.list[i].x + 32 > self.mouseX && Npc.list[i].y - 32 < self.mouseY && Npc.list[i].y + 32 > self.mouseY && self.keyPress.second === true){
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
            if(Npc.list[i].map === self.map && Npc.list[i].entityId === 'joe' && self.mapChange > 20 && Npc.list[i].x - 32 < self.mouseX && Npc.list[i].x + 32 > self.mouseX && Npc.list[i].y - 32 < self.mouseY && Npc.list[i].y + 32 > self.mouseY && self.keyPress.second === true){
                if(self.quest === false && self.questInfo.quest === false && self.questStats["Clear River"] === true){
                    self.questStage = 2;
                    self.invincible = true;
                    self.questInfo.quest = 'Clear Tower';
                    socket.emit('dialogueLine',{
                        state:'ask',
                        message:'Rumor is that the last player who helped Fisherman saw a red monster infused with evil in the weird tower. I really don\'t want evil red monsters roaming in the forest, so could you please kill it?',
                        response1:'Sure! I can help you!',
                        response2:'No, I\'m good.',
                    });
                    self.currentResponse = 0;
                }
                else if(self.quest === false && self.questInfo.quest === false && self.questStats["Clear River"] === false){
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
                else if(self.questStage === 5 && self.quest === 'Clear Tower'){
                    self.questStage += 1;
                    self.invincible = true;
                    socket.emit('dialogueLine',{
                        state:'ask',
                        message:'Thanks for helping me confirm this rumor.',
                        response1:'*End conversation*',
                    });
                    self.currentResponse = 0;
                }
                else if(self.questStage === 11 && self.quest === 'Clear Tower'){
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
            if(Npc.list[i].map === self.map && Npc.list[i].entityId === 'hunter' && self.mapChange > 20 && Npc.list[i].x - 32 < self.mouseX && Npc.list[i].x + 32 > self.mouseX && Npc.list[i].y - 32 < self.mouseY && Npc.list[i].y + 32 > self.mouseY && self.keyPress.second === true){
                if(self.quest === false && self.questInfo.quest === false && self.questStats["Clear Tower"] === true){
                    self.questStage = 2;
                    self.invincible = true;
                    self.questInfo.quest = 'Lightning Lizard Boss';
                    socket.emit('dialogueLine',{
                        state:'ask',
                        message:'I came to Lilypad Pathway Part 1 because some guy called Joe said there were strong monsters here for me to fight. I saw this old temple and decided to go in, and there was this huge lizard. You seem strong enough to kill it. Could you kill this lizard?',
                        response1:'Sure! I will kill this lizard.',
                        response2:'Nah, sounds too scary.',
                    });
                    self.currentResponse = 0;
                }
                else if(self.quest === false && self.questInfo.quest === false && self.questStats["Clear Tower"] === false){
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
                        message:'Thanks for killing this giant Lizard.',
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
            if(Npc.list[i].map === self.map && Npc.list[i].entityId === 'anvil' && self.mapChange > 20 && Npc.list[i].x - 32 < self.mouseX && Npc.list[i].x + 32 > self.mouseX && Npc.list[i].y - 32 < self.mouseY && Npc.list[i].y + 32 > self.mouseY && self.keyPress.second === true){
                if(self.questStats["Lightning Lizard Boss"] === true){
                    self.inventory.craftItems = Npc.list[i].crafts;
                    socket.emit('openCraft',{name:Npc.list[i].name,quote:Npc.list[i].quote,crafts:Npc.list[i].crafts});
                }
                else{
                    socket.emit('notification','[!] Complete the Lightnign Lizard Boss Quest before using the Anvil.');
                }
                self.keyPress.second = false;
            }
            if(Npc.list[i].map === self.map && Npc.list[i].entityId === 'rubyforge' && self.mapChange > 20 && Npc.list[i].x - 32 < self.mouseX && Npc.list[i].x + 32 > self.mouseX && Npc.list[i].y - 32 < self.mouseY && Npc.list[i].y + 32 > self.mouseY && self.keyPress.second === true){
                if(self.questStats["Lost Rubies"] === true){
                    self.inventory.craftItems = Npc.list[i].crafts;
                    socket.emit('openCraft',{name:Npc.list[i].name,quote:Npc.list[i].quote,crafts:Npc.list[i].crafts});
                }
                else{
                    socket.emit('notification','[!] Complete the quest Lost Rubies to gain access to the Ruby Forge.');
                }
                self.keyPress.second = false;
            }
            if(Npc.list[i].map === self.map && Npc.list[i].entityId === 'wally' && self.mapChange > 20 && Npc.list[i].x - 32 < self.mouseX && Npc.list[i].x + 32 > self.mouseX && Npc.list[i].y - 32 < self.mouseY && Npc.list[i].y + 32 > self.mouseY && self.keyPress.second === true){
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
                else if(self.questStage === 7 && self.quest === 'Broken Piano'){
                    self.questStage += 1;
                    self.invincible = true;
                    socket.emit('dialogueLine',{
                        state:'ask',
                        message:'You need Piano Parts? I think I can make one for you.',
                        response1:'*End conversation*',
                    });
                    self.currentResponse = 0;
                }
                else{
                    socket.emit('notification','[!] This NPC doesn\'t want to talk to you right now.');
                }
                self.keyPress.second = false;
            }
            if(Npc.list[i].map === self.map && Npc.list[i].entityId === 'sally' && self.mapChange > 20 && Npc.list[i].x - 32 < self.mouseX && Npc.list[i].x + 32 > self.mouseX && Npc.list[i].y - 32 < self.mouseY && Npc.list[i].y + 32 > self.mouseY && self.keyPress.second === true){
                if(self.quest === false && self.questInfo.quest === false && self.questStats["Plantera"] === true){
                    self.questStage = 2;
                    self.invincible = true;
                    self.questInfo.quest = 'Lost Rubies';
                    socket.emit('dialogueLine',{
                        state:'ask',
                        message:'Hey, my friend Wally lost some rubies in the Town Cave the other day. Could you please find them and return it to me?',
                        response1:'Sure! I can help you!',
                        response2:'Nah, not today.',
                    });
                    self.currentResponse = 0;
                }
                else if(self.quest === false && self.questInfo.quest === false && self.questStats["Plantera"] === false){
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
                else if(self.questStage === 5 && self.quest === 'Lost Rubies'){
                    self.questStage += 1;
                    self.invincible = true;
                    socket.emit('dialogueLine',{
                        state:'ask',
                        message:'If you don\'t know, the Town Cave is northwest of The Guarded Citadel.',
                        response1:'*End conversation*',
                    });
                    self.currentResponse = 0;
                }
                else if(self.questStage === 10 && self.quest === 'Lost Rubies'){
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
            if(Npc.list[i].map === self.map && Npc.list[i].entityId === 'mia' && self.mapChange > 20 && Npc.list[i].x - 32 < self.mouseX && Npc.list[i].x + 32 > self.mouseX && Npc.list[i].y - 32 < self.mouseY && Npc.list[i].y + 32 > self.mouseY && self.keyPress.second === true){
                if(self.quest === false && self.questInfo.quest === false && self.questStats["Lost Rubies"] === true){
                    self.questStage = 2;
                    self.invincible = true;
                    self.questInfo.quest = 'Broken Piano';
                    socket.emit('dialogueLine',{
                        state:'ask',
                        message:'Hey, my piano broke, can you help me fix it? You will need Piano Parts.',
                        response1:'I would love to!',
                        response2:'Not really...',
                    });
                    self.currentResponse = 0;
                }
                else if(self.quest === false && self.questInfo.quest === false && self.questStats["Lost Rubies"] === false){
                    self.questStage = 1;
                    self.invincible = true;
                    self.questInfo.quest = 'Broken Piano';
                    socket.emit('dialogueLine',{
                        state:'ask',
                        message:'My piano\'s broken... I need some rubies to fix it.',
                        response1:'*End conversation*',
                    });
                    self.currentResponse = 0;
                }
                else if(self.questStage === 5 && self.quest === 'Broken Piano'){
                    self.questStage += 1;
                    self.invincible = true;
                    socket.emit('dialogueLine',{
                        state:'ask',
                        message:'I think Wally might be able to make some Piano Parts.',
                        response1:'*End conversation*',
                    });
                    self.currentResponse = 0;
                }
                else if(self.questStage === 14 && self.quest === 'Broken Piano'){
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
            if(Npc.list[i].map === self.map && Npc.list[i].entityId === 'petmaster' && self.mapChange > 20 && Npc.list[i].x - 32 < self.mouseX && Npc.list[i].x + 32 > self.mouseX && Npc.list[i].y - 32 < self.mouseY && Npc.list[i].y + 32 > self.mouseY && self.keyPress.second === true){
                if(self.quest === false && self.questInfo.quest === false && self.questStats["Lost Rubies"] === true){
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
                else if(self.quest === false && self.questInfo.quest === false && self.questStats["Lost Rubies"] === false){
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
            if(Npc.list[i].map === self.map && Npc.list[i].entityId === 'andrew' && self.mapChange > 20 && Npc.list[i].x - 32 < self.mouseX && Npc.list[i].x + 32 > self.mouseX && Npc.list[i].y - 32 < self.mouseY && Npc.list[i].y + 32 > self.mouseY && self.keyPress.second === true){
                if(self.quest === false && self.questInfo.quest === false && self.questStats["Lost Rubies"] === true){
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
                else if(self.quest === false && self.questInfo.quest === false && self.questStats["Lost Rubies"] === false){
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
            if(Npc.list[i].map === self.map && Npc.list[i].entityId === 'monsterking' && self.mapChange > 20 && Npc.list[i].x - 32 < self.mouseX && Npc.list[i].x + 32 > self.mouseX && Npc.list[i].y - 32 < self.mouseY && Npc.list[i].y + 32 > self.mouseY && self.keyPress.second === true){
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
        }
        if(self.currentResponse === 1 && self.questStage === 1 && self.questInfo.quest === 'Missing Person'){
            self.questInfo.started = false;
            self.questStage += 1;
            self.invincible = false;
            socket.emit('dialogueLine',{
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
                message:'I should talk with Bob.',
                response1:'...',
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
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 12 && self.quest === 'Missing Person'){
            socket.emit('notification','You completed the quest ' + self.quest + '.');
            var woodObtained = Math.round(15 + Math.random() * 10);
            socket.emit('notification','You obtained ' + woodObtained + ' wood.');
            self.inventory.materials.wood += woodObtained;
            self.inventory.refreshRender();
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
            self.xp += Math.round(5000 * self.stats.xp);
            self.coins += Math.round(5000 * self.stats.xp);
        }

        if(self.currentResponse === 1 && self.questStage === 1 && self.questInfo.quest === 'Weird Tower'){
            self.questStage += 1;
            socket.emit('dialogueLine',{
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
            socket.emit('dialogueLine',{
                state:'remove',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 2 && self.questInfo.quest === 'Weird Tower'){
            self.invincible = false;
            self.questInfo = {
                quest:false,
            };
            socket.emit('dialogueLine',{
                state:'remove',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 3 && self.questInfo.quest === 'Weird Tower'){
            self.questStage += 1;
            socket.emit('dialogueLine',{
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
            socket.emit('dialogueLine',{
                state:'remove',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 4 && self.questInfo.quest === 'Weird Tower'){
            self.questInfo.started = false;
            self.questStage += 1;
            self.invincible = false;
            socket.emit('dialogueLine',{
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
            socket.emit('dialogueLine',{
                state:'ask',
                message:'I should talk with John.',
                response1:'...',
            });
            socket.emit('notification','You started the quest ' + self.questInfo.quest + '.');
        }
        if(self.currentResponse === 1 && self.questStage === 6 && self.quest === 'Weird Tower'){
            self.questStage += 1;
            socket.emit('dialogueLine',{
                state:'remove',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 8 && self.quest === 'Weird Tower'){
            self.questStage += 1;
            socket.emit('dialogueLine',{
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
            socket.emit('dialogueLine',{
                state:'ask',
                message:'I killed the monsters, now I should talk back to John.',
                response1:'...',
            });
        }
        if(self.currentResponse === 1 && self.questStage === 12 && self.quest === 'Weird Tower'){
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
                if(self.questDependent[i].type === 'Collision2'){
                    self.questDependent[i].toRemove = true;
                }
            }
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 14 && self.quest === 'Weird Tower'){
            self.questStage += 1;
            socket.emit('dialogueLine',{
                state:'ask',
                message:'You found diamonds! I guess that is your reward for finishing this quest.',
                response1:'What! That isn\'t fair!',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 2 && self.questStage === 14 && self.quest === 'Weird Tower'){
            self.questStage += 2;
            socket.emit('dialogueLine',{
                state:'ask',
                message:'Monsters? Did you kill them?',
                response1:'Yes.',
                response2:'No.',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 3 && self.questStage === 14 && self.quest === 'Weird Tower'){
            self.questStage += 3;
            socket.emit('dialogueLine',{
                state:'ask',
                message:'What! I know there is something in the tower! Go back and try again!',
                response1:'*End conversation*',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 15 && self.quest === 'Weird Tower'){
            socket.emit('notification','You failed the quest ' + self.quest + '.');
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
        if(self.currentResponse === 1 && self.questStage === 16 && self.quest === 'Weird Tower'){
            self.questStage += 2;
            socket.emit('dialogueLine',{
                state:'ask',
                message:'Woo! Now I can go collect wood with Mark without worring about that tower.',
                response1:'*End conversation*',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 2 && self.questStage === 16 && self.quest === 'Weird Tower'){
            self.questStage += 1;
            socket.emit('dialogueLine',{
                state:'ask',
                message:'You found the Monsters but you didn\'t kill them? Go back and kill them!',
                response1:'*End conversation*',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 17 && self.quest === 'Weird Tower'){
            self.questStage = 9;
            self.invincible = false;
            socket.emit('dialogueLine',{
                state:'remove',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 18 && self.quest === 'Weird Tower'){
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
            self.xp += Math.round(10000 * self.stats.xp);
            self.coins += Math.round(10000 * self.stats.xp);
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
            self.questStage += 1;
            socket.emit('dialogueLine',{
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
            socket.emit('dialogueLine',{
                state:'remove',
            });
            self.currentResponse = 0;
            for(var i in Npc.list){
                if(Npc.list[i].entityId === 'fisherman'){
                    self.inventory.shopItems = {items:Npc.list[i].shop,prices:Npc.list[i].shopPrices};
                    socket.emit('openShop',{name:Npc.list[i].name,quote:Npc.list[i].quote,inventory:{items:Npc.list[i].shop,prices:Npc.list[i].shopPrices}});
                }
            }
        }
        if(self.currentResponse === 1 && self.questStage === 3 && self.questInfo.quest === 'Clear River'){
            self.questInfo.started = false;
            self.questStage += 1;
            self.invincible = false;
            socket.emit('dialogueLine',{
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
            socket.emit('dialogueLine',{
                state:'ask',
                message:'I should talk with Fisherman.',
                response1:'...',
            });
            socket.emit('notification','You started the quest ' + self.questInfo.quest + '.');
        }
        if(self.currentResponse === 1 && self.questStage === 5 && self.quest === 'Clear River'){
            self.questStage += 1;
            self.invincible = false;
            socket.emit('dialogueLine',{
                state:'remove',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 7 && self.quest === 'Clear River'){
            self.questStage += 1;
            self.invincible = false;
            socket.emit('dialogueLine',{
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
            socket.emit('dialogueLine',{
                state:'ask',
                message:'I did it! I defeated all the Monsters in the map The River! Let me go tell Fisherman.',
                response1:'...',
            });
        }
        if(self.currentResponse === 1 && self.questStage === 10 && self.quest === 'Clear River'){
            self.questStage += 1;
            self.invincible = false;
            socket.emit('dialogueLine',{
                state:'remove',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 12 && self.quest === 'Clear River'){
            socket.emit('notification','You completed the quest ' + self.quest + '.');
            var woodObtained = Math.round(10 + Math.random() * 15);
            socket.emit('notification','You obtained ' + woodObtained + ' wood.');
            self.inventory.materials.wood += woodObtained;
            self.inventory.refreshRender();
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
            self.xp += Math.round(15000 * self.stats.xp);
            self.coins += Math.round(15000 * self.stats.xp);
        }
        
        if(self.currentResponse === 1 && self.questStage === 1 && self.quest === 'Enchanter'){
            self.questStage += 1;
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
                self.questInfo.enchant1 = item.enchantments[Math.floor(Math.random() * item.enchantments.length)];
                self.questInfo.enchant2 = item.enchantments[Math.floor(Math.random() * item.enchantments.length)];
                self.questInfo.enchant3 = item.enchantments[Math.floor(Math.random() * item.enchantments.length)];
                self.questInfo.enchant4 = item.enchantments[Math.floor(Math.random() * item.enchantments.length)];
                socket.emit('dialogueLine',{
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
            socket.emit('dialogueLine',{
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
            socket.emit('dialogueLine',{
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
            socket.emit('dialogueLine',{
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
            socket.emit('dialogueLine',{
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
        if(self.currentResponse === 1 && self.questStage === 2 && self.questInfo.quest === 'Clear Tower'){
            self.questInfo.started = false;
            self.questStage += 1;
            self.invincible = false;
            socket.emit('dialogueLine',{
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
            socket.emit('dialogueLine',{
                state:'remove',
            });
            self.currentResponse = 0;
        }
        if(self.questInfo.started === true && self.questStage === 3 && self.questInfo.quest === 'Clear Tower'){
            self.quest = 'Clear Tower';
            self.questStage += 1;
            self.invincible = true;
            socket.emit('dialogueLine',{
                state:'ask',
                message:'I should talk with Joe.',
                response1:'...',
            });
            socket.emit('notification','You started the quest ' + self.questInfo.quest + '.');
        }
        if(self.currentResponse === 1 && self.questStage === 4 && self.quest === 'Clear Tower'){
            self.questStage += 1;
            self.invincible = false;
            socket.emit('dialogueLine',{
                state:'remove',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 6 && self.quest === 'Clear Tower'){
            self.questStage += 1;
            self.invincible = false;
            socket.emit('dialogueLine',{
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
            socket.emit('dialogueLine',{
                state:'ask',
                message:'I killed the monsters, now I should talk back to Joe.',
                response1:'...',
            });
        }
        if(self.currentResponse === 1 && self.questStage === 10 && self.quest === 'Clear Tower'){
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
                if(self.questDependent[i].type === 'Collision2'){
                    self.questDependent[i].toRemove = true;
                }
            }
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 12 && self.quest === 'Clear Tower'){
            self.questStage += 1;
            self.invincible = true;
            socket.emit('dialogueLine',{
                state:'ask',
                message:'The rumors were true? Here, have a reward!',
                response1:'*End conversation*',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 2 && self.questStage === 12 && self.quest === 'Clear Tower'){
            self.questStage += 2;
            self.invincible = true;
            socket.emit('dialogueLine',{
                state:'ask',
                message:'The rumors weren\'t true? I was gonna give you a reward if they were true.',
                response1:'*End conversation*',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 13 && self.quest === 'Clear Tower'){
            socket.emit('notification','You completed the quest ' + self.quest + '.');
            var steelObtained = Math.round(15 + Math.random() * 10);
            socket.emit('notification','You obtained ' + steelObtained + ' steel.');
            self.inventory.materials.steel += steelObtained;
            self.inventory.refreshRender();
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
            self.xp += Math.round(25000 * self.stats.xp);
            self.coins += Math.round(25000 * self.stats.xp);
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
                message:'I should talk with Hunter.',
                response1:'...',
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
            socket.emit('dialogueLine',{
                state:'ask',
                message:'Woo! Lightning Lizard is dead! Let me go tell Hunter!',
                response1:'...',
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
                if(self.questDependent[i].type === 'Collision2'){
                    self.questDependent[i].toRemove = true;
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
            self.xp += Math.round(75000 * self.stats.xp);
            self.coins += Math.round(75000 * self.stats.xp);
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
        if(self.currentResponse === 1 && self.questStage === 2 && self.questInfo.quest === 'Lost Rubies'){
            self.questInfo.started = false;
            self.questStage += 1;
            self.invincible = false;
            socket.emit('dialogueLine',{
                state:'remove',
            });
            socket.emit('questInfo',{
                questName:'Lost Rubies',
                questDescription:'Find some lost rubies in the Town Cave.',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 2 && self.questStage === 2 && self.questInfo.quest === 'Lost Rubies'){
            self.invincible = false;
            self.questInfo = {
                quest:false,
            };
            socket.emit('dialogueLine',{
                state:'remove',
            });
            self.currentResponse = 0;
        }
        if(self.questInfo.started === true && self.questStage === 3 && self.questInfo.quest === 'Lost Rubies'){
            self.quest = 'Lost Rubies';
            self.questStage += 1;
            self.invincible = true;
            socket.emit('dialogueLine',{
                state:'ask',
                message:'I should talk with Sally.',
                response1:'...',
            });
            socket.emit('notification','You started the quest ' + self.questInfo.quest + '.');
        }
        if(self.currentResponse === 1 && self.questStage === 4 && self.quest === 'Lost Rubies'){
            self.questStage += 1;
            self.invincible = false;
            socket.emit('dialogueLine',{
                state:'remove',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 6 && self.quest === 'Lost Rubies'){
            self.questStage += 1;
            self.invincible = false;
            socket.emit('dialogueLine',{
                state:'remove',
            });
            self.currentResponse = 0;
        }
        if(self.questStage === 7 && self.quest === 'Lost Rubies' && self.mapChange > 10){
            for(var i in QuestInfo.list){
                if(QuestInfo.list[i].quest === 'Lost Rubies' && QuestInfo.list[i].info === 'activator' && self.isColliding(QuestInfo.list[i])){
                    self.questStage = 8;
                }
            }
        }
        if(self.questStage === 8 && self.quest === 'Lost Rubies'){
            self.questStage += 1;
            self.invincible = true;
            socket.emit('dialogueLine',{
                state:'ask',
                message:'I found the rubies, I should return them to Sally.',
                response1:'...',
            });
        }
        if(self.currentResponse === 1 && self.questStage === 9 && self.quest === 'Lost Rubies'){
            self.questStage += 1;
            self.invincible = false;
            socket.emit('dialogueLine',{
                state:'remove',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 11 && self.quest === 'Lost Rubies'){
            self.questStage += 1;
            self.invincible = true;
            socket.emit('dialogueLine',{
                state:'ask',
                message:'You got the rubies? Here, let me give you a reward.',
                response1:'*End conversation*',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 12 && self.quest === 'Lost Rubies'){
            socket.emit('notification','You completed the quest ' + self.quest + '.');
            var rubiesObtained = Math.round(5 + Math.random() * 10);
            socket.emit('notification','You obtained ' + rubiesObtained + ' rubies.');
            self.inventory.materials.ruby += rubiesObtained;
            self.inventory.refreshRender();
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
            self.xp += Math.round(125000 * self.stats.xp);
            self.coins += Math.round(125000 * self.stats.xp);
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
            self.questInfo.started = false;
            self.questStage += 1;
            self.invincible = false;
            socket.emit('dialogueLine',{
                state:'remove',
            });
            socket.emit('questInfo',{
                questName:'Broken Piano',
                questDescription:'Find Piano Parts to fix Mia\'s piano.',
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
        if(self.questInfo.started === true && self.questStage === 3 && self.questInfo.quest === 'Broken Piano'){
            self.quest = 'Broken Piano';
            self.questStage += 1;
            self.invincible = true;
            socket.emit('dialogueLine',{
                state:'ask',
                message:'I should talk with Mia.',
                response1:'...',
            });
            socket.emit('notification','You started the quest ' + self.questInfo.quest + '.');
        }
        if(self.currentResponse === 1 && self.questStage === 4 && self.quest === 'Broken Piano'){
            self.questStage += 1;
            self.invincible = false;
            socket.emit('dialogueLine',{
                state:'remove',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 6 && self.quest === 'Broken Piano'){
            self.questStage += 1;
            self.invincible = false;
            socket.emit('dialogueLine',{
                state:'remove',
            });
            self.currentResponse = 0;
        }
        if(self.questStage === 7 && self.quest === 'Broken Piano' && self.mapChange > 10){
            for(var i in QuestInfo.list){
                if(QuestInfo.list[i].quest === 'Broken Piano' && QuestInfo.list[i].info === 'activator' && self.isColliding(QuestInfo.list[i])){
                    self.questStage = 8;
                }
            }
        }
        if(self.currentResponse === 1 && self.questStage === 8 && self.quest === 'Broken Piano'){
            setTimeout(function(){
                self.questStage += 1;
            },1000);
            self.invincible = false;
            socket.emit('dialogueLine',{
                state:'remove',
            });
            self.currentResponse = 0;
        }
        if(self.questStage === 9 && self.quest === 'Broken Piano'){
            self.questStage += 1;
            self.invincible = true;
            socket.emit('dialogueLine',{
                state:'ask',
                message:'Nice! I got one Piano Part!',
                response1:'...',
            });
            socket.emit('notification','1 / 5 Piano Parts');
        }
        if(self.currentResponse === 1 && self.questStage === 10 && self.quest === 'Broken Piano'){
            self.questStage += 1;
            self.invincible = false;
            socket.emit('dialogueLine',{
                state:'remove',
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
        if(self.questStage === 11 && self.quest === 'Broken Piano' && self.mapChange > 10){
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
                if(self.questInfo.pianoParts === 5){
                    self.questStage = 12;
                }
            }
        }
        if(self.questStage === 12 && self.quest === 'Broken Piano'){
            self.questStage += 1;
            self.invincible = true;
            socket.emit('dialogueLine',{
                state:'ask',
                message:'I got all the Piano Parts. Time to return them to Mia.',
                response1:'*End conversation*',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 13 && self.quest === 'Broken Piano'){
            self.questStage += 1;
            self.invincible = false;
            socket.emit('dialogueLine',{
                state:'remove',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 15 && self.quest === 'Broken Piano'){
            socket.emit('notification','You completed the quest ' + self.quest + '.');
            var goldObtained = Math.round(15 + Math.random() * 10);
            socket.emit('notification','You obtained ' + goldObtained + ' gold.');
            self.inventory.materials.gold += goldObtained;
            self.inventory.refreshRender();
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
            self.xp += Math.round(1250000 * self.stats.xp);
            self.coins += Math.round(1250000 * self.stats.xp);
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
                    self.inventory.refreshRender();
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
                    self.inventory.refreshRender();
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
                    self.inventory.refreshRender();
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
                    self.inventory.refreshRender();
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
                    self.inventory.refreshRender();
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
                    self.inventory.refreshRender();
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
                    self.inventory.refreshRender();
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
                    self.inventory.refreshRender();
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
                    self.inventory.refreshRender();
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
                questName:'Pet Training',
                questDescription:'Train your pet to become stronger.',
            });
            self.currentResponse = 0;
        }
        if(self.questInfo.started === true && self.questStage === 7 && self.questInfo.quest === 'Pet Training'){
            self.quest = 'Pet Training';
            self.questStage += 1;
            self.invincible = true;
            socket.emit('dialogueLine',{
                state:'ask',
                message:'I should talk with the Pet Master.',
                response1:'...',
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
                    self.questDependent[i] = new Monster({
                        x:QuestInfo.list[i].x,
                        y:QuestInfo.list[i].y,
                        map:QuestInfo.list[i].map,
                        moveSpeed:monsterData['greenLizard'].moveSpeed,
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
                    self.questDependent[i] = new Monster({
                        x:QuestInfo.list[i].x,
                        y:QuestInfo.list[i].y,
                        map:QuestInfo.list[i].map,
                        moveSpeed:monsterData['greenLizard'].moveSpeed,
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
                    self.questDependent[i] = new Monster({
                        x:QuestInfo.list[i].x,
                        y:QuestInfo.list[i].y,
                        map:QuestInfo.list[i].map,
                        moveSpeed:monsterData['lostSpirit'].moveSpeed,
                        hp:monsterData['lostSpirit'].hp * ENV.MonsterStrength,
                        monsterType:'lostSpirit',
                        attackState:'passiveLostSpirit',
                        width:monsterData['lostSpirit'].width,
                        height:monsterData['lostSpirit'].height,
                        xpGain:monsterData['lostSpirit'].xpGain,
                        stats:{
                            attack:monsterData['lostSpirit'].stats.attack * ENV.MonsterStrength,
                            defense:monsterData['lostSpirit'].stats.defense,
                            heal:monsterData['lostSpirit'].stats.heal,
                            damageReduction:monsterData['lostSpirit'].stats.damageReduction,
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
                    self.questDependent[i] = new Monster({
                        x:QuestInfo.list[i].x,
                        y:QuestInfo.list[i].y,
                        map:QuestInfo.list[i].map,
                        moveSpeed:monsterData['redCherryBomb'].moveSpeed,
                        hp:monsterData['redCherryBomb'].hp * ENV.MonsterStrength,
                        monsterType:'redCherryBomb',
                        attackState:'passiveCherryBomb',
                        width:monsterData['redCherryBomb'].width,
                        height:monsterData['redCherryBomb'].height,
                        xpGain:monsterData['redCherryBomb'].xpGain,
                        stats:{
                            attack:monsterData['redCherryBomb'].stats.attack * ENV.MonsterStrength,
                            defense:monsterData['redCherryBomb'].stats.defense,
                            heal:monsterData['redCherryBomb'].stats.heal,
                            damageReduction:monsterData['redCherryBomb'].stats.damageReduction,
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
                    self.questDependent[i] = new Monster({
                        x:QuestInfo.list[i].x,
                        y:QuestInfo.list[i].y,
                        map:QuestInfo.list[i].map,
                        moveSpeed:monsterData['lightningLizard'].moveSpeed,
                        hp:monsterData['lightningLizard'].hp * ENV.MonsterStrength,
                        monsterType:'lightningLizard',
                        attackState:'passiveLightningLizard',
                        width:monsterData['lightningLizard'].width,
                        height:monsterData['lightningLizard'].height,
                        xpGain:monsterData['lightningLizard'].xpGain,
                        stats:{
                            attack:monsterData['lightningLizard'].stats.attack * ENV.MonsterStrength,
                            defense:monsterData['lightningLizard'].stats.defense,
                            heal:monsterData['lightningLizard'].stats.heal,
                            damageReduction:monsterData['lightningLizard'].stats.damageReduction,
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
            self.teleport(288,544,"The Guarded Citadel");
            if(self.questStats["Pet Training"] === false){
                socket.emit('notification','Your pets are now 3 times stronger.');
            }
        }
        if(self.currentResponse === 1 && self.questStage === 29 && self.quest === 'Pet Training'){
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
            self.xp += Math.round(250000 * self.stats.xp);
            self.coins += Math.round(250000 * self.stats.xp);
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
                questName:'Monster Search',
                questDescription:'Search for a way to kill all the monsters.',
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
                message:'I should talk with Andrew.',
                response1:'...',
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
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 9 && self.quest === 'Monster Search'){
            self.questStage += 1;
            self.invincible = false;
            socket.emit('dialogueLine',{
                state:'remove',
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
            self.invincible = true;
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
            socket.emit('dialogueLine',{
                state:'ask',
                message:'Ahhh! What\'s happening to me?',
                response1:'...',
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
            setTimeout(function(){
                self.questStage += 1
            },2000);
            self.invincible = false;
            socket.emit('dialogueLine',{
                state:'remove',
            });
            socket.emit('notification','Survive the 5 waves of monsters.');
            self.currentResponse = 0;
        }
        if(self.questStage === 17 && self.quest === 'Monster Search'){
            self.questStage += 1;
            socket.emit('notification',"Wave 1: Lightning Rammer x4");
            self.questInfo.maxMonsters = 0;
            self.questInfo.monstersKilled = 0;
            for(var i in QuestInfo.list){
                if(QuestInfo.list[i].quest === 'Monster Search' && QuestInfo.list[i].info === 'spawner1'){
                    var monsterStats = Object.create(monsterData['lightningRammer'].stats);
                    monsterStats.attack *= 3;
                    self.questDependent[i] = new Monster({
                        x:QuestInfo.list[i].x,
                        y:QuestInfo.list[i].y,
                        map:QuestInfo.list[i].map,
                        moveSpeed:monsterData['lightningRammer'].moveSpeed,
                        hp:monsterData['lightningRammer'].hp * ENV.MonsterStrength * 2,
                        monsterType:'lightningRammer',
                        attackState:'passiveLightningRammer',
                        width:monsterData['lightningRammer'].width,
                        height:monsterData['lightningRammer'].height,
                        xpGain:monsterData['lightningRammer'].xpGain,
                        stats:monsterStats,
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
        if(self.questStage === 18 && self.quest === 'Monster Search' && self.questInfo.monstersKilled === self.questInfo.maxMonsters && self.questInfo.monstersKilled){
            socket.emit('notification',"Wave Complete!");
            self.questStage += 1;
            setTimeout(function(){
                self.questStage += 1;
            },2000);
        }
        if(self.questStage === 20 && self.quest === 'Monster Search'){
            self.questStage += 1;
            socket.emit('notification',"Wave 2: Lightning Lizard x4");
            self.questInfo.maxMonsters = 0;
            self.questInfo.monstersKilled = 0;
            for(var i in QuestInfo.list){
                if(QuestInfo.list[i].quest === 'Monster Search' && QuestInfo.list[i].info === 'spawner2'){
                    var monsterStats = Object.create(monsterData['lightningLizard'].stats);
                    monsterStats.attack *= 2;
                    self.questDependent[i] = new Monster({
                        x:QuestInfo.list[i].x,
                        y:QuestInfo.list[i].y,
                        map:QuestInfo.list[i].map,
                        moveSpeed:monsterData['lightningLizard'].moveSpeed,
                        hp:monsterData['lightningLizard'].hp * ENV.MonsterStrength * 4,
                        monsterType:'lightningLizard',
                        attackState:'passiveLightningLizard',
                        width:monsterData['lightningLizard'].width,
                        height:monsterData['lightningLizard'].height,
                        xpGain:monsterData['lightningLizard'].xpGain,
                        stats:monsterStats,
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
        if(self.questStage === 21 && self.quest === 'Monster Search' && self.questInfo.monstersKilled === self.questInfo.maxMonsters && self.questInfo.monstersKilled){
            socket.emit('notification',"Wave Complete!");
            self.questStage += 1;
            setTimeout(function(){
                self.questStage += 1;
            },2000);
        }
        if(self.questStage === 23 && self.quest === 'Monster Search'){
            self.questStage += 1;
            socket.emit('notification',"Wave 3: Possessed Spirit");
            self.questInfo.maxMonsters = 0;
            self.questInfo.monstersKilled = 0;
            for(var i in QuestInfo.list){
                if(QuestInfo.list[i].quest === 'Monster Search' && QuestInfo.list[i].info === 'spawner3'){
                    var monsterStats = Object.create(monsterData['possessedSpirit'].stats);
                    monsterStats.attack *= 2;
                    self.questDependent[i] = new Monster({
                        x:QuestInfo.list[i].x,
                        y:QuestInfo.list[i].y,
                        map:QuestInfo.list[i].map,
                        moveSpeed:monsterData['possessedSpirit'].moveSpeed,
                        hp:monsterData['possessedSpirit'].hp * ENV.MonsterStrength * 5,
                        monsterType:'possessedSpirit',
                        attackState:'passivePossessedSpirit',
                        width:monsterData['possessedSpirit'].width,
                        height:monsterData['possessedSpirit'].height,
                        xpGain:monsterData['possessedSpirit'].xpGain,
                        stats:monsterStats,
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
        if(self.questStage === 24 && self.quest === 'Monster Search' && self.questInfo.monstersKilled === self.questInfo.maxMonsters && self.questInfo.monstersKilled){
            socket.emit('notification',"Wave Complete!");
            self.questStage += 1;
            setTimeout(function(){
                self.questStage += 1;
            },2000);
        }
        if(self.questStage === 26 && self.quest === 'Monster Search'){
            self.questStage += 1;
            socket.emit('notification',"Wave 4: Water Rammer x4");
            self.questInfo.maxMonsters = 0;
            self.questInfo.monstersKilled = 0;
            for(var i in QuestInfo.list){
                if(QuestInfo.list[i].quest === 'Monster Search' && QuestInfo.list[i].info === 'spawner4'){
                    var monsterStats = Object.create(monsterData['waterRammer'].stats);
                    self.questDependent[i] = new Monster({
                        x:QuestInfo.list[i].x,
                        y:QuestInfo.list[i].y,
                        map:QuestInfo.list[i].map,
                        moveSpeed:monsterData['waterRammer'].moveSpeed,
                        hp:monsterData['waterRammer'].hp * ENV.MonsterStrength * 2,
                        monsterType:'waterRammer',
                        attackState:'passiveWaterRammer',
                        width:monsterData['waterRammer'].width,
                        height:monsterData['waterRammer'].height,
                        xpGain:monsterData['waterRammer'].xpGain,
                        stats:monsterStats,
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
        if(self.questStage === 27 && self.quest === 'Monster Search' && self.questInfo.monstersKilled === self.questInfo.maxMonsters && self.questInfo.monstersKilled){
            socket.emit('notification',"Wave Complete!");
            self.questStage += 1;
            setTimeout(function(){
                self.questStage += 1;
            },2000);
        }
        if(self.questStage === 29 && self.quest === 'Monster Search'){
            self.questStage += 1;
            socket.emit('notification',"Wave 5: Plantera");
            self.questInfo.maxMonsters = 0;
            self.questInfo.monstersKilled = 0;
            for(var i in QuestInfo.list){
                if(QuestInfo.list[i].quest === 'Monster Search' && QuestInfo.list[i].info === 'spawner5'){
                    var monsterStats = Object.create(monsterData['plantera'].stats);
                    self.questDependent[i] = new Monster({
                        x:QuestInfo.list[i].x,
                        y:QuestInfo.list[i].y,
                        map:QuestInfo.list[i].map,
                        moveSpeed:monsterData['plantera'].moveSpeed,
                        hp:monsterData['plantera'].hp * ENV.MonsterStrength * 4,
                        monsterType:'plantera',
                        attackState:'passivePlantera',
                        width:monsterData['plantera'].width,
                        height:monsterData['plantera'].height,
                        xpGain:monsterData['plantera'].xpGain,
                        stats:monsterStats,
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
        if(self.questStage === 30 && self.quest === 'Monster Search' && self.questInfo.monstersKilled === self.questInfo.maxMonsters && self.questInfo.monstersKilled){
            socket.emit('notification',"Wave Complete!");
            self.questStage += 1;
            setTimeout(function(){
                self.questStage += 1;
            },2000);
        }
        if(self.questStage === 32 && self.quest === 'Monster Search'){
            self.questStage += 1;
            self.invincible = true;
            socket.emit('dialogueLine',{
                state:'ask',
                message:'HOW ARE YOU NOT DEAD!',
                response1:'*End conversation*',
            });
            self.currentResponse = 0;
        }
        if(self.currentResponse === 1 && self.questStage === 33 && self.quest === 'Monster Search'){
            self.questStage += 1;
            self.invincible = false;
            socket.emit('dialogueLine',{
                state:'remove',
            });
            self.currentResponse = 0;
        }
        if(self.questStage === 34 && self.quest === 'Monster Search'){
            self.questStage += 1;
            socket.emit('notification',"Wave ???: Whirlwind");
            self.questInfo.maxMonsters = 0;
            self.questInfo.monstersKilled = 0;
            for(var i in QuestInfo.list){
                if(QuestInfo.list[i].quest === 'Monster Search' && QuestInfo.list[i].info === 'spawner6'){
                    var monsterStats = Object.create(monsterData['whirlwind'].stats);
                    self.questDependent[i] = new Monster({
                        x:QuestInfo.list[i].x,
                        y:QuestInfo.list[i].y,
                        map:QuestInfo.list[i].map,
                        moveSpeed:monsterData['whirlwind'].moveSpeed,
                        hp:monsterData['whirlwind'].hp * ENV.MonsterStrength / 3,
                        monsterType:'whirlwind',
                        attackState:'passiveWhirlwind',
                        width:monsterData['whirlwind'].width,
                        height:monsterData['whirlwind'].height,
                        xpGain:monsterData['whirlwind'].xpGain,
                        stats:monsterStats,
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
        if(self.questStage === 35 && self.quest === 'Monster Search' && self.questInfo.monstersKilled === self.questInfo.maxMonsters && self.questInfo.monstersKilled){
            socket.emit('notification',"Wave Complete!");
            self.questStage += 1;
            setTimeout(function(){
                self.questStage += 1;
            },2000);
        }
        if(self.questStage === 37 && self.quest === 'Monster Search'){
            self.questStage += 1;
            self.invincible = true;
            socket.emit('dialogueLine',{
                state:'ask',
                message:'Argh! I\'m dying!',
                response1:'...',
            });
            self.currentResponse = 0;
        }
        if(self.questStage === 38 && self.quest === 'Monster Search'){
            var particle = new Particle({
                x:self.questDependent.monsterking.x + Math.random() * self.questDependent.monsterking.width - self.questDependent.monsterking.width / 2,
                y:self.questDependent.monsterking.y + Math.random() * self.questDependent.monsterking.height - self.questDependent.monsterking.height / 2,
                map:self.questDependent.monsterking.map,
                particleType:'fire',
            });
        }
        if(self.currentResponse === 1 && self.questStage === 38 && self.quest === 'Monster Search'){
            self.questStage += 1;
            self.invincible = true;
            self.questDependent.monsterking.toRemove = true;
            socket.emit('notification',"Monster King was slain...");
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
        if(self.currentResponse === 1 && self.questStage === 39 && self.quest === 'Monster Search'){
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
            self.xp += Math.round(500000 * self.stats.xp);
            self.coins += Math.round(500000 * self.stats.xp);
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
                debuffs:[],
                aggro:0,
            }
            self.passive = '';
            self.offhandPassive = '';
            self.textColor = '#ffff00';
            self.hpMax = 100 + self.level * 20;
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
            self.oldStats = JSON.parse(JSON.stringify(self.stats));
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
                //self.inventory.refreshRender();
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
            self.hpMax = 100 + self.level * 20;
            self.maxSpeed = 20 + Math.floor(self.level / 10);
            self.xp = self.xp - self.xpMax;
            self.level += 1;
            self.xpMax = xpLevels[self.level];
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
        if(self.offhandPassive === 'spirit'){
            self.shootProjectile(self.id,'Player',self.direction,self.direction,'soul',32,function(t){return 25},0,self.stats,'playerSoul');
            self.shootProjectile(self.id,'Player',self.direction + 120,self.direction + 120,'soul',32,function(t){return 25},0,self.stats,'playerSoul');
            self.shootProjectile(self.id,'Player',self.direction + 240,self.direction + 240,'soul',32,function(t){return 25},0,self.stats,'playerSoul');
        }
        if(self.offhandPassive === 'lightning'){
            self.shootProjectile(self.id,'Player',0 * Math.PI / 180,0 * Math.PI / 180,'lightningSpit',128,function(t){return 0},30,self.stats,'spinAroundPlayer');
            self.shootProjectile(self.id,'Player',90 * Math.PI / 180,90 * Math.PI / 180,'lightningSpit',128,function(t){return 0},30,self.stats,'spinAroundPlayer');
            self.shootProjectile(self.id,'Player',180 * Math.PI / 180,180 * Math.PI / 180,'lightningSpit',128,function(t){return 0},30,self.stats,'spinAroundPlayer');
            self.shootProjectile(self.id,'Player',270 * Math.PI / 180,270 * Math.PI / 180,'lightningSpit',128,function(t){return 0},30,self.stats,'spinAroundPlayer');
        }
        if(self.offhandPassive === 'spiritProtect'){
            self.shootProjectile(self.id,'Player',0 * Math.PI / 180,0 * Math.PI / 180,'holySoul',128,function(t){return 25},30,self.stats,'spinAroundPlayer');
            self.shootProjectile(self.id,'Player',45 * Math.PI / 180,45 * Math.PI / 180,'holySoul',128,function(t){return 25},30,self.stats,'spinAroundPlayer');
            self.shootProjectile(self.id,'Player',90 * Math.PI / 180,90 * Math.PI / 180,'holySoul',128,function(t){return 25},30,self.stats,'spinAroundPlayer');
            self.shootProjectile(self.id,'Player',135 * Math.PI / 180,135 * Math.PI / 180,'holySoul',128,function(t){return 25},30,self.stats,'spinAroundPlayer');
            self.shootProjectile(self.id,'Player',180 * Math.PI / 180,180 * Math.PI / 180,'holySoul',128,function(t){return 25},30,self.stats,'spinAroundPlayer');
            self.shootProjectile(self.id,'Player',225 * Math.PI / 180,225 * Math.PI / 180,'holySoul',128,function(t){return 25},30,self.stats,'spinAroundPlayer');
            self.shootProjectile(self.id,'Player',270 * Math.PI / 180,270 * Math.PI / 180,'holySoul',128,function(t){return 25},30,self.stats,'spinAroundPlayer');
            self.shootProjectile(self.id,'Player',315 * Math.PI / 180,315 * Math.PI / 180,'holySoul',128,function(t){return 25},30,self.stats,'spinAroundPlayer');
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
                                self.shootProjectile(self.id,'Player',self.direction + 270,self.direction + 270,'simplewoodensword',54,function(t){return 0},0,self.stats,'spinAroundPlayer');
                                Sound({
                                    type:'ninjaStar',
                                    map:self.map,
                                });
                            }
                            break;
                        case "simplesteelswordAttack":
                            if(isFireMap){
                                self.shootProjectile(self.id,'Player',self.direction + 270,self.direction + 270,'simplesteelsword',54,function(t){return 0},0,self.stats,'spinAroundPlayer');
                                Sound({
                                    type:'ninjaStar',
                                    map:self.map,
                                });
                            }
                            break;
                        case "simpledarksteelswordAttack":
                            if(isFireMap){
                                self.shootProjectile(self.id,'Player',self.direction + 270,self.direction + 270,'simpledarksteelsword',54,function(t){return 0},0,self.stats,'spinAroundPlayer');
                                Sound({
                                    type:'ninjaStar',
                                    map:self.map,
                                });
                            }
                            break;
                        case "simplegoldenswordAttack":
                            if(isFireMap){
                                self.shootProjectile(self.id,'Player',self.direction + 270,self.direction + 270,'simplegoldensword',54,function(t){return 0},0,self.stats,'spinAroundPlayer');
                                self.shootProjectile(self.id,'Player',self.direction + 90,self.direction + 90,'simplegoldensword',54,function(t){return 0},0,self.stats,'spinAroundPlayer');
                                Sound({
                                    type:'ninjaStar',
                                    map:self.map,
                                });
                            }
                            break;
                        case "simplerubyswordAttack":
                            if(isFireMap){
                                self.shootProjectile(self.id,'Player',self.direction + 270,self.direction + 270,'simplerubysword',54,function(t){return 0},0,self.stats,'spinAroundPlayer');
                                self.shootProjectile(self.id,'Player',self.direction + 90,self.direction + 90,'simplerubysword',54,function(t){return 0},0,self.stats,'spinAroundPlayer');
                                Sound({
                                    type:'ninjaStar',
                                    map:self.map,
                                });
                            }
                            break;
                        case "advancedwoodenswordAttack":
                            if(isFireMap){
                                self.shootProjectile(self.id,'Player',self.direction + 270,self.direction + 270,'advancedwoodensword',54,function(t){return 0},0,self.stats,'spinAroundPlayer');
                                Sound({
                                    type:'ninjaStar',
                                    map:self.map,
                                });
                            }
                            break;
                        case "advancedsteelswordAttack":
                            if(isFireMap){
                                self.shootProjectile(self.id,'Player',self.direction + 270,self.direction + 270,'advancedsteelsword',54,function(t){return 0},0,self.stats,'spinAroundPlayer');
                                self.shootProjectile(self.id,'Player',self.direction + 90,self.direction + 90,'advancedsteelsword',54,function(t){return 0},0,self.stats,'spinAroundPlayer');
                                Sound({
                                    type:'ninjaStar',
                                    map:self.map,
                                });
                            }
                            break;
                        case "advanceddarksteelswordAttack":
                            if(isFireMap){
                                self.shootProjectile(self.id,'Player',self.direction + 270,self.direction + 270,'advanceddarksteelsword',54,function(t){return 0},0,self.stats,'spinAroundPlayer');
                                self.shootProjectile(self.id,'Player',self.direction + 90,self.direction + 90,'advanceddarksteelsword',54,function(t){return 0},0,self.stats,'spinAroundPlayer');
                                Sound({
                                    type:'ninjaStar',
                                    map:self.map,
                                });
                            }
                            break;
                        case "advancedgoldenswordAttack":
                            if(isFireMap){
                                self.shootProjectile(self.id,'Player',self.direction + 270,self.direction + 270,'advancedgoldensword',54,function(t){return 0},0,self.stats,'spinAroundPlayer');
                                self.shootProjectile(self.id,'Player',self.direction + 30,self.direction + 30,'advancedgoldensword',54,function(t){return 0},0,self.stats,'spinAroundPlayer');
                                self.shootProjectile(self.id,'Player',self.direction + 150,self.direction + 150,'advancedgoldensword',54,function(t){return 0},0,self.stats,'spinAroundPlayer');
                                Sound({
                                    type:'ninjaStar',
                                    map:self.map,
                                });
                            }
                            break;
                        case "advancedrubyswordAttack":
                            if(isFireMap){
                                self.shootProjectile(self.id,'Player',self.direction + 270,self.direction + 270,'advancedrubysword',54,function(t){return 0},0,self.stats,'spinAroundPlayer');
                                self.shootProjectile(self.id,'Player',self.direction + 30,self.direction + 30,'advancedrubysword',54,function(t){return 0},0,self.stats,'spinAroundPlayer');
                                self.shootProjectile(self.id,'Player',self.direction + 150,self.direction + 150,'advancedrubysword',54,function(t){return 0},0,self.stats,'spinAroundPlayer');
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
                        case "typhoonstormAttack":
                            if(isFireMap){
                                self.shootProjectile(self.id,'Player',self.direction,self.direction,'typhoon',32,function(t){return 25},1000,self.stats,'monsterHoming');
                            }
                            break;
                        case "iceboomerangAttack":
                            if(isFireMap){
                                self.shootProjectile(self.id,'Player',self.direction,self.direction,'iceboomerang',0,function(t){return 25},1000,self.stats,'boomerang');
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
                        case "bookoffrostAttack":
                            if(isFireMap){
                                self.shootProjectile(self.id,'Player',self.direction,self.direction,'frostBullet',0,function(t){return 10},30,self.stats,'bounceOffCollisions');
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
                //self.doPassive();
                self.mana -= self.secondCost;
                self.manaRefresh = self.useTime;
            }
            else if(self.stats.damageType !== 'magic' && self.cooldown <= 0){
                for(var i in self.ability.secondPattern){
                    self.addToEventQ(self.ability.ability + 'Second',self.ability.secondPattern[i]);
                }
                //self.doPassive();
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
        pack.moveSpeed = self.moveSpeed;
        pack.currentItem = self.currentItem;
        pack.coins = self.coins;
        pack.devCoins = self.devCoins;
        pack.damageDone = self.damageDone;
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
        socket.on('waypoint',function(data){
            if(player.quest === 'Lightning Lizard Boss' || player.quest === 'Weird Tower' || player.quest === 'Clear Tower'){
                socket.emit('notification','[!] Waypoints have been disabled in this quest.');
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
        self.img = {
            body:[-1,-1,-1,0],
            shirt:[0,30,220,0.7],
            pants:[0,135,115,0.8],
            hair:[0,250,0,0.5],
            hairType:'shortHair',
        }
        self.animation = 0;
        self.animationDirection = 'down';
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
        self.animation = 0;
        self.animationDirection = 'down';
    }
    if(self.monsterType === 'spgem'){
        self.canCollide = false;
        self.dashSpdX = 0;
        self.dashSpdY = 0;
        self.stage2 = false;
    }
    self.oldMoveSpeed = self.maxSpeed;
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
                self.animation += 0.5;
                if(self.animation > 5){
                    self.animation = 0;
                }
            }
        }
        self.updateAttack();
        self.updateAnimation();
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
                var maxAggro = -10;
                for(var i in Player.list){
                    if(Player.list[i].map === self.map && self.getSquareDistance(Player.list[i]) < 512 && Player.list[i].isDead === false && Player.list[i].invincible === false && Player.list[i].mapChange > 10 && Player.list[i].stats.aggro > maxAggro){
                        self.attackState = "moveBird";
                        self.target = Player.list[i];
                        maxAggro = Player.list[i].stats.aggro;
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
                self.animate = false;
                var maxAggro = -10;
                for(var i in Player.list){
                    if(Player.list[i].map === self.map && self.getSquareDistance(Player.list[i]) < 512 && Player.list[i].isDead === false && Player.list[i].invincible === false && Player.list[i].mapChange > 10 && Player.list[i].stats.aggro > maxAggro){
                        self.attackState = "moveBall";
                        self.target = Player.list[i];
                        maxAggro = Player.list[i].stats.aggro;
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
                var maxAggro = -10;
                for(var i in Player.list){
                    if(Player.list[i].map === self.map && self.getSquareDistance(Player.list[i]) < 512 && Player.list[i].isDead === false && Player.list[i].invincible === false && Player.list[i].mapChange > 10 && Player.list[i].stats.aggro > maxAggro){
                        self.attackState = "moveCherryBomb";
                        self.target = Player.list[i];
                        maxAggro = Player.list[i].stats.aggro;
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
                            self.oldStats.defense += 2000000;
                            self.oldStats.attack += 2000000;
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
                var maxAggro = -10;
                for(var i in Player.list){
                    if(Player.list[i].map === self.map && self.getSquareDistance(Player.list[i]) < 512 && Player.list[i].isDead === false && Player.list[i].invincible === false && Player.list[i].mapChange > 10 && Player.list[i].stats.aggro > maxAggro){
                        self.attackState = "moveRedBird";
                        self.target = Player.list[i];
                        maxAggro = Player.list[i].stats.aggro;
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
                var maxAggro = -10;
                for(var i in Player.list){
                    if(Player.list[i].map === self.map && self.getSquareDistance(Player.list[i]) < 512 && Player.list[i].isDead === false && Player.list[i].invincible === false && Player.list[i].mapChange > 10 && Player.list[i].stats.aggro > maxAggro){
                        self.attackState = "moveLizard";
                        self.target = Player.list[i];
                        maxAggro = Player.list[i].stats.aggro;
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
                var maxAggro = -10;
                for(var i in Player.list){
                    if(Player.list[i].map === self.map && self.getSquareDistance(Player.list[i]) < 512 && Player.list[i].isDead === false && Player.list[i].invincible === false && Player.list[i].mapChange > 10 && Player.list[i].stats.aggro > maxAggro){
                        self.attackState = "moveLightningLizard";
                        self.target = Player.list[i];
                        maxAggro = Player.list[i].stats.aggro;
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
                var maxAggro = -10;
                for(var i in Player.list){
                    if(Player.list[i].map === self.map && self.getSquareDistance(Player.list[i]) < 512 && Player.list[i].isDead === false && Player.list[i].invincible === false && Player.list[i].mapChange > 10 && Player.list[i].stats.aggro > maxAggro){
                        self.attackState = "moveGhost";
                        self.target = Player.list[i];
                        maxAggro = Player.list[i].stats.aggro;
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
                var maxAggro = -10;
                for(var i in Player.list){
                    if(Player.list[i].map === self.map && self.getSquareDistance(Player.list[i]) < 512 && Player.list[i].isDead === false && Player.list[i].invincible === false && Player.list[i].mapChange > 10 && Player.list[i].stats.aggro > maxAggro){
                        self.attackState = "moveLostSpirit";
                        self.target = Player.list[i];
                        maxAggro = Player.list[i].stats.aggro;
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
                var maxAggro = -10;
                for(var i in Player.list){
                    if(Player.list[i].map === self.map && self.getSquareDistance(Player.list[i]) < 512 && Player.list[i].isDead === false && Player.list[i].invincible === false && Player.list[i].mapChange > 10 && Player.list[i].stats.aggro > maxAggro){
                        self.attackState = "movePossessedSpirit";
                        self.target = Player.list[i];
                        maxAggro = Player.list[i].stats.aggro;
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
                        self.attackState = 'phase2TransitionPossessedSpirit';
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
            case "phase2TransitionPossessedSpirit":
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
            case "passivePlantera":
                //self.animate = true;
                var maxAggro = -10;
                for(var i in Player.list){
                    if(Player.list[i].map === self.map && self.getSquareDistance(Player.list[i]) < 512 && Player.list[i].isDead === false && Player.list[i].invincible === false && Player.list[i].mapChange > 10 && Player.list[i].stats.aggro > maxAggro){
                        self.attackState = "attackPhase1Plantera";
                        self.target = Player.list[i];
                        maxAggro = Player.list[i].stats.aggro;
                    }
                }
                if(self.damaged){
                    self.attackState = "attackPhase1Plantera";
                }
                break;
            case "attackPhase1Plantera":
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
                    self.attackState = 'passivePlantera';
                    self.damagedEntity = false;
                    self.damaged = false;
                    break;
                }
                if(self.target.isDead){
                    self.target = undefined;
                    self.attackState = 'passivePlantera';
                    self.damagedEntity = false;
                    self.damaged = false;
                    self.randomWalk(true,false,self.x,self.y);
                    break;
                }
                if(self.target.toRemove){
                    self.target = undefined;
                    self.attackState = 'passivePlantera';
                    self.damagedEntity = false;
                    self.damaged = false;
                    break;
                }
                self.animation = 0;
                self.direction = 0;
                self.spdX = 0;
                self.spdY = 0;
                //self.stats.damageReduction = 1;
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
                    self.attackState = 'passivePlantera';
                    self.damagedEntity = false;
                    self.damaged = false;
                    break;
                }
                if(self.target.isDead){
                    self.target = undefined;
                    self.attackState = 'passivePlantera';
                    self.damagedEntity = false;
                    self.damaged = false;
                    self.randomWalk(true,false,self.x,self.y);
                    break;
                }
                if(self.target.toRemove){
                    self.target = undefined;
                    self.attackState = 'passivePlantera';
                    self.damagedEntity = false;
                    self.damaged = false;
                    break;
                }
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
                self.hpMax *= 50;
                self.hp *= 50;
                self.stats.damageReduction = 0.5;
                self.oldStats.damageReduction = 0.5;
                self.maxSpeed = self.oldMoveSpeed * 3;
                self.followEntity(self.target);
                self.reload = 0;
                self.animation = 1;
                self.attackState = 'attackPhase2Plantera';
                break;
            case "attackPhase2Plantera":
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
                    self.attackState = 'passivePlantera';
                    self.damagedEntity = false;
                    self.damaged = false;
                    break;
                }
                if(self.target.isDead){
                    self.target = undefined;
                    self.attackState = 'passivePlantera';
                    self.damagedEntity = false;
                    self.damaged = false;
                    self.randomWalk(true,false,self.x,self.y);
                    break;
                }
                if(self.target.toRemove){
                    self.target = undefined;
                    self.attackState = 'passivePlantera';
                    self.damagedEntity = false;
                    self.damaged = false;
                    break;
                }
                self.animation = 1;
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
                self.reload += 1;
                //self.direction = Math.atan2(self.spdY,self.spdX) / Math.PI * 180;
                break;
            case "passiveThorn":
                self.animate = true;
                var maxAggro = -10;
                for(var i in Player.list){
                    if(Player.list[i].map === self.map && self.getSquareDistance(Player.list[i]) < 512 && Player.list[i].isDead === false && Player.list[i].invincible === false && Player.list[i].mapChange > 10 && Player.list[i].stats.aggro > maxAggro){
                        self.attackState = "moveThorn";
                        self.target = Player.list[i];
                        maxAggro = Player.list[i].stats.aggro;
                    }
                }
                if(self.damaged){
                    self.attackState = "moveThorn";
                }
                break;
            case "moveThorn":
                self.followEntity(self.target,0);
                self.reload = 0;
                self.animation = 0;
                self.attackState = "attackThorn";
                break;
            case "attackThorn":
                if(!self.target){
                    self.target = undefined;
                    self.attackState = 'passiveThorn';
                    self.damagedEntity = false;
                    self.damaged = false;
                    break;
                }
                if(self.target.isDead){
                    self.target = undefined;
                    self.attackState = 'passiveThorn';
                    self.damagedEntity = false;
                    self.damaged = false;
                    self.randomWalk(true,false,self.x,self.y);
                    break;
                }
                if(self.target.toRemove){
                    self.target = undefined;
                    self.attackState = 'passiveThorn';
                    self.damagedEntity = false;
                    self.damaged = false;
                    break;
                }
                self.reload += 1;
                if(self.getSquareDistance(self.target) < 64 && ENV.Difficulty === 'Expert'){
                    if(self.target.mapChange !== undefined){
                        if(self.target.mapChange > 10){
                            self.stats.defense += 2000000;
                            self.stats.attack += 2000000;
                            self.oldStats.defense += 2000000;
                            self.oldStats.attack += 2000000;
                            self.attackState = 'explodeDeathBomb';
                            self.monsterType = 'deathBomb'
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
                        self.attackState = 'explodeDeathBomb';
                    }
                    break;
                }
                if(self.getSquareDistance(self.target) > 512 || self.target.isDead){
                    if(!self.damaged){
                        self.target = undefined;
                        self.trackingEntity = undefined;
                        self.attackState = 'passiveThorn';
                    }
                }
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
            case "passiveLightningTurret":
                self.animate = false;
                var maxAggro = -10;
                for(var i in Player.list){
                    if(Player.list[i].map === self.map && self.getSquareDistance(Player.list[i]) < 512 && Player.list[i].isDead === false && Player.list[i].invincible === false && Player.list[i].mapChange > 10 && Player.list[i].stats.aggro > maxAggro){
                        self.attackState = "moveLightningTurret";
                        self.target = Player.list[i];
                        maxAggro = Player.list[i].stats.aggro;
                    }
                }
                if(self.damaged){
                    self.attackState = "moveLightningTurret";
                }
                self.animation = 0;
                break;
            case "moveLightningTurret":
                self.reload = 0;
                self.animation = 0;
                self.attackState = "attackLightningTurret";
                break;
            case "attackLightningTurret":
                if(!self.target){
                    self.target = undefined;
                    self.attackState = 'passiveLightningTurret';
                    self.damagedEntity = false;
                    self.damaged = false;
                    break;
                }
                if(self.target.isDead){
                    self.target = undefined;
                    self.attackState = 'passiveLightningTurret';
                    self.damagedEntity = false;
                    self.damaged = false;
                    break;
                }
                if(self.target.toRemove){
                    self.target = undefined;
                    self.attackState = 'passiveLightningTurret';
                    self.damagedEntity = false;
                    self.damaged = false;
                    break;
                }
                if(self.reload % 10 === 0 && self.reload > 5 && self.target.invincible === false){
                    self.shootProjectile(self.id,'Monster',self.direction,self.direction,'lightningSpit',0,function(t){return 0},0,self.stats);
                }
                self.reload += 1;
                if(self.getSquareDistance(self.target) > 512 || self.target.isDead){
                    if(!self.damaged){
                        self.target = undefined;
                        self.trackingEntity = undefined;
                        self.attackState = 'passiveLightningTurret';
                    }
                }
                self.animation += 0.5;
                if(self.animation >= 4){
                    self.animation = 0;
                }
                break;
            case "passiveLightningRammer":
                self.animate = true;
                var maxAggro = -10;
                for(var i in Player.list){
                    if(Player.list[i].map === self.map && self.getSquareDistance(Player.list[i]) < 512 && Player.list[i].isDead === false && Player.list[i].invincible === false && Player.list[i].mapChange > 10 && Player.list[i].stats.aggro > maxAggro){
                        self.attackState = "moveLightningRammer";
                        self.target = Player.list[i];
                        maxAggro = Player.list[i].stats.aggro;
                    }
                }
                if(self.damaged){
                    self.attackState = "moveLightningRammer";
                }
                break;
            case "moveLightningRammer":
                self.trackEntity(self.target,0);
                self.reload = 0;
                self.animation = 0;
                self.attackState = "attackLightningRammer";
                break;
            case "attackLightningRammer":
                if(!self.target){
                    self.target = undefined;
                    self.attackState = 'passiveLightningRammer';
                    self.damagedEntity = false;
                    self.damaged = false;
                    break;
                }
                if(self.target.isDead){
                    self.target = undefined;
                    self.attackState = 'passiveLightningRammer';
                    self.damagedEntity = false;
                    self.damaged = false;
                    self.randomWalk(true,false,self.x,self.y);
                    break;
                }
                if(self.target.toRemove){
                    self.target = undefined;
                    self.attackState = 'passiveLightningRammer';
                    self.damagedEntity = false;
                    self.damaged = false;
                    break;
                }
                if(self.reload % 40 < 10 && self.target.invincible === false && ENV.Difficulty === 'Expert'){
                    self.stats.defense += 50;
                    self.maxSpeed = self.oldMoveSpeed + 50;
                }
                else if(ENV.Difficulty === 'Expert'){
                    self.stats.defense = self.oldStats.defense;
                    self.maxSpeed = self.oldMoveSpeed;
                }
                self.reload += 1;
                if(self.getSquareDistance(self.target) > 512 || self.target.isDead){
                    if(!self.damaged){
                        self.target = undefined;
                        self.trackingEntity = undefined;
                        self.attackState = 'passiveLightningRammer';
                    }
                }
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
            case "passiveDeathBomb":
                var maxAggro = -10;
                for(var i in Player.list){
                    if(Player.list[i].map === self.map && self.getSquareDistance(Player.list[i]) < 512 && Player.list[i].isDead === false && Player.list[i].invincible === false && Player.list[i].mapChange > 10 && Player.list[i].stats.aggro > maxAggro){
                        self.attackState = "moveDeathBomb";
                        self.target = Player.list[i];
                        maxAggro = Player.list[i].stats.aggro;
                    }
                }
                if(self.damaged){
                    self.attackState = "moveDeathBomb";
                }
                break;
            case "moveDeathBomb":
                self.trackEntity(self.target,0);
                self.reload = 0;
                self.animation = 0;
                self.attackState = "attackDeathBomb";
                break;
            case "attackDeathBomb":
                if(!self.target){
                    self.target = undefined;
                    self.attackState = 'passiveDeathBomb';
                    self.damagedEntity = false;
                    self.damaged = false;
                    break;
                }
                if(self.target.isDead){
                    self.target = undefined;
                    self.attackState = 'passiveDeathBomb';
                    self.damagedEntity = false;
                    self.damaged = false;
                    self.randomWalk(true,false,self.x,self.y);
                    break;
                }
                if(self.target.toRemove){
                    self.target = undefined;
                    self.attackState = 'passiveDeathBomb';
                    self.damagedEntity = false;
                    self.damaged = false;
                    break;
                }
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
                        self.attackState = 'explodeDeathBomb';
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
                    self.attackState = 'explodeDeathBomb';
                }
                break;
            case "explodeDeathBomb":
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
                    for(var i = 0;i < 8;i++){
                        self.shootProjectile(self.id,'Monster',i * 45,i * 45,'unholySoul',45,function(t){return 0},0,self.stats);
                    }
                }
                self.spdX = 0;
                self.spdY = 0;
                self.x = self.lastX;
                self.y = self.lastY;
                break;
            case "passiveWhirlwind":
                self.animate = true;
                var maxAggro = -10;
                for(var i in Player.list){
                    if(Player.list[i].map === self.map && self.getSquareDistance(Player.list[i]) < 512 && Player.list[i].isDead === false && Player.list[i].invincible === false && Player.list[i].mapChange > 10 && Player.list[i].stats.aggro > maxAggro){
                        self.attackState = "moveWhirlwind";
                        self.target = Player.list[i];
                        maxAggro = Player.list[i].stats.aggro;
                    }
                }
                if(self.damaged){
                    self.attackState = "moveWhirlwind";
                }
                break;
            case "moveWhirlwind":
                self.followEntity(self.target,0);
                self.reload = 0;
                self.animation = 0;
                self.attackState = "attackPhase1Whirlwind";
                break;
            case "attackPhase1Whirlwind":
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
                    self.attackState = 'passiveWhirlwind';
                    self.damagedEntity = false;
                    self.damaged = false;
                    break;
                }
                if(self.target.isDead){
                    self.target = undefined;
                    self.attackState = 'passiveWhirlwind';
                    self.damagedEntity = false;
                    self.damaged = false;
                    break;
                }
                if(self.target.toRemove){
                    self.target = undefined;
                    self.attackState = 'passiveWhirlwind';
                    self.damagedEntity = false;
                    self.damaged = false;
                    break;
                }
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
                self.animation += 25;
                break;
            case "attackPhase2Whirlwind":
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
                    self.attackState = 'passiveWhirlwind';
                    self.damagedEntity = false;
                    self.damaged = false;
                    break;
                }
                if(self.target.isDead){
                    self.target = undefined;
                    self.attackState = 'passiveWhirlwind';
                    self.damagedEntity = false;
                    self.damaged = false;
                    break;
                }
                if(self.target.toRemove){
                    self.target = undefined;
                    self.attackState = 'passiveWhirlwind';
                    self.damagedEntity = false;
                    self.damaged = false;
                    break;
                }
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
                }
                if(self.reload % 70 > 30){
                    self.animation += 50;
                }
                self.reload += 1;
                self.animation += 50;
                break;
            case "passiveSp":
                self.animate = true;
                var maxAggro = -10;
                for(var i in Player.list){
                    if(Player.list[i].map === self.map && Player.list[i].isDead === false && Player.list[i].invincible === false && Player.list[i].mapChange > 10 && Player.list[i].stats.aggro > maxAggro){
                        self.attackState = "moveSp";
                        self.target = Player.list[i];
                        maxAggro = Player.list[i].stats.aggro;
                    }
                }
                if(self.damaged){
                    self.attackState = "moveSp";
                }
                break;
            case "moveSp":
                self.followEntity(self.target,0);
                self.reload = 0;
                self.animation = 0;
                self.attackState = "attackPhase1Sp";
                break;
            case "attackPhase1Sp":
                var allPlayersDead = true;
                for(var i in Player.list){
                    if(Player.list[i].hp > 1 && Player.list[i].map === self.map){
                        allPlayersDead = false;
                    }
                }
                if(allPlayersDead){
                    self.toRemove = true;
                }
                if(!self.target){
                    self.target = undefined;
                    self.attackState = 'passiveSp';
                    self.damagedEntity = false;
                    self.damaged = false;
                    break;
                }
                if(self.target.isDead){
                    self.target = undefined;
                    self.attackState = 'passiveSp';
                    self.damagedEntity = false;
                    self.damaged = false;
                    break;
                }
                if(self.target.toRemove){
                    self.target = undefined;
                    self.attackState = 'passiveSp';
                    self.damagedEntity = false;
                    self.damaged = false;
                    break;
                }
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
                var allPlayersDead = true;
                for(var i in Player.list){
                    if(Player.list[i].hp > 1 && Player.list[i].map === self.map){
                        allPlayersDead = false;
                    }
                }
                if(allPlayersDead){
                    self.toRemove = true;
                }
                if(!self.target){
                    self.target = undefined;
                    self.attackState = 'passiveSp';
                    self.damagedEntity = false;
                    self.damaged = false;
                    break;
                }
                if(self.target.isDead){
                    self.target = undefined;
                    self.attackState = 'passiveSp';
                    self.damagedEntity = false;
                    self.damaged = false;
                    break;
                }
                if(self.target.toRemove){
                    self.target = undefined;
                    self.attackState = 'passiveSp';
                    self.damagedEntity = false;
                    self.damaged = false;
                    break;
                }
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
                var allPlayersDead = true;
                for(var i in Player.list){
                    if(Player.list[i].hp > 1 && Player.list[i].map === self.map){
                        allPlayersDead = false;
                    }
                }
                if(allPlayersDead){
                    self.toRemove = true;
                }
                if(!self.target){
                    self.target = undefined;
                    self.attackState = 'passiveSp';
                    self.damagedEntity = false;
                    self.damaged = false;
                    break;
                }
                if(self.target.isDead){
                    self.target = undefined;
                    self.attackState = 'passiveSp';
                    self.damagedEntity = false;
                    self.damaged = false;
                    break;
                }
                if(self.target.toRemove){
                    self.target = undefined;
                    self.attackState = 'passiveSp';
                    self.damagedEntity = false;
                    self.damaged = false;
                    break;
                }
                if(self.reload % 200 === 0 && self.target.invincible === false){
                    for(var i = 0;i < 8;i++){
                        self.shootProjectile(self.id,'Monster',i * 45,i * 45,'spgem',64,function(t){return 0},1000,self.stats,'spinAroundMonster');
                    }
                }
                if(self.reload % 200 === 30 && self.target.invincible === false){
                    self.stats.speed = 0.2;
                    self.stats.attack = 1000;
                    for(var i = 0;i < 40;i++){
                        self.shootProjectile(self.id,'Monster',self.reload,self.reload,'splaser',36 * i,function(t){return 0},1000,self.stats,'splaser');
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
                var allPlayersDead = true;
                for(var i in Player.list){
                    if(Player.list[i].hp > 1 && Player.list[i].map === self.map){
                        allPlayersDead = false;
                    }
                }
                if(allPlayersDead){
                    self.toRemove = true;
                }
                if(!self.target){
                    self.target = undefined;
                    self.attackState = 'passiveSp';
                    self.damagedEntity = false;
                    self.damaged = false;
                    break;
                }
                if(self.target.isDead){
                    self.target = undefined;
                    self.attackState = 'passiveSp';
                    self.damagedEntity = false;
                    self.damaged = false;
                    break;
                }
                if(self.target.toRemove){
                    self.target = undefined;
                    self.attackState = 'passiveSp';
                    self.damagedEntity = false;
                    self.damaged = false;
                    break;
                }
                self.invincible = true;
                if(self.reload >= 1200){
                    self.attackState = 'attackPhase5Sp';
                }
                if(self.reload === 100){
                    s.createMonster('spgem',{x:self.x + 128,y:self.y,map:self.map});
                    s.createMonster('spgem',{x:self.x + 90,y:self.y + 90,map:self.map});
                    s.createMonster('spgem',{x:self.x,y:self.y + 128,map:self.map});
                    s.createMonster('spgem',{x:self.x - 90,y:self.y + 90,map:self.map});
                    s.createMonster('spgem',{x:self.x - 128,y:self.y,map:self.map});
                    s.createMonster('spgem',{x:self.x - 90,y:self.y - 90,map:self.map});
                    s.createMonster('spgem',{x:self.x,y:self.y - 128,map:self.map});
                    s.createMonster('spgem',{x:self.x + 90,y:self.y - 90,map:self.map});
                }
                self.reload += 1;
                break;
            case "attackPhase5Sp":
                self.invincible = false;
                if(self.hp > 1000000){
                    self.hp = 1000000;
                }
                break;
            case "passiveTianmuGuarder":
                self.animate = true;
                var maxAggro = -10;
                for(var i in Player.list){
                    if(Player.list[i].map === self.map && Player.list[i].isDead === false && Player.list[i].invincible === false && Player.list[i].mapChange > 10 && Player.list[i].stats.aggro > maxAggro){
                        self.attackState = "moveTianmuGuarder";
                        self.target = Player.list[i];
                        maxAggro = Player.list[i].stats.aggro;
                    }
                }
                if(self.damaged){
                    self.attackState = "moveTianmuGuarder";
                }
                break;
            case "moveTianmuGuarder":
                self.followEntity(self.target,0);
                self.reload = 0;
                self.animation = 0;
                self.attackState = "attackPhase1TianmuGuarder";
                break;
            case "attackPhase1TianmuGuarder":
                var allPlayersDead = true;
                for(var i in Player.list){
                    if(Player.list[i].hp > 1 && Player.list[i].map === self.map){
                        allPlayersDead = false;
                    }
                }
                if(allPlayersDead){
                    self.toRemove = true;
                }
                if(!self.target){
                    self.target = undefined;
                    self.attackState = 'passiveTianmuGuarder';
                    self.damagedEntity = false;
                    self.damaged = false;
                    break;
                }
                if(self.target.isDead){
                    self.target = undefined;
                    self.attackState = 'passiveTianmuGuarder';
                    self.damagedEntity = false;
                    self.damaged = false;
                    break;
                }
                if(self.target.toRemove){
                    self.target = undefined;
                    self.attackState = 'passiveTianmuGuarder';
                    self.damagedEntity = false;
                    self.damaged = false;
                    break;
                }
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
                var allPlayersDead = true;
                for(var i in Player.list){
                    if(Player.list[i].hp > 1 && Player.list[i].map === self.map){
                        allPlayersDead = false;
                    }
                }
                if(allPlayersDead){
                    self.toRemove = true;
                }
                if(!self.target){
                    self.target = undefined;
                    self.attackState = 'passiveTianmuGuarder';
                    self.damagedEntity = false;
                    self.damaged = false;
                    break;
                }
                if(self.target.isDead){
                    self.target = undefined;
                    self.attackState = 'passiveTianmuGuarder';
                    self.damagedEntity = false;
                    self.damaged = false;
                    break;
                }
                if(self.target.toRemove){
                    self.target = undefined;
                    self.attackState = 'passiveTianmuGuarder';
                    self.damagedEntity = false;
                    self.damaged = false;
                    break;
                }
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
                var allPlayersDead = true;
                for(var i in Player.list){
                    if(Player.list[i].hp > 1 && Player.list[i].map === self.map){
                        allPlayersDead = false;
                    }
                }
                if(allPlayersDead){
                    self.toRemove = true;
                }
                if(!self.target){
                    self.target = undefined;
                    self.attackState = 'passiveTianmuGuarder';
                    self.damagedEntity = false;
                    self.damaged = false;
                    break;
                }
                if(self.target.isDead){
                    self.target = undefined;
                    self.attackState = 'passiveTianmuGuarder';
                    self.damagedEntity = false;
                    self.damaged = false;
                    break;
                }
                if(self.target.toRemove){
                    self.target = undefined;
                    self.attackState = 'passiveTianmuGuarder';
                    self.damagedEntity = false;
                    self.damaged = false;
                    break;
                }
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
            case "passiveSampleprovidersp":
                self.animate = true;
                var maxAggro = -10;
                for(var i in Player.list){
                    if(Player.list[i].map === self.map && Player.list[i].isDead === false && Player.list[i].invincible === false && Player.list[i].mapChange > 10 && Player.list[i].stats.aggro > maxAggro){
                        self.attackState = "moveSampleprovidersp";
                        self.target = Player.list[i];
                        maxAggro = Player.list[i].stats.aggro;
                    }
                }
                if(self.damaged){
                    self.attackState = "moveSampleprovidersp";
                }
                break;
            case "moveSampleprovidersp":
                self.followEntity(self.target,0);
                self.reload = 0;
                self.animation = 0;
                self.attackState = "attackPhase1Sampleprovidersp";
                break;
            case "attackPhase1Sampleprovidersp":
                var allPlayersDead = true;
                for(var i in Player.list){
                    if(Player.list[i].hp > 1 && Player.list[i].map === self.map){
                        allPlayersDead = false;
                    }
                }
                if(allPlayersDead){
                    self.toRemove = true;
                }
                if(!self.target){
                    self.target = undefined;
                    self.attackState = 'passiveSampleprovidersp';
                    self.damagedEntity = false;
                    self.damaged = false;
                    break;
                }
                if(self.target.isDead){
                    self.target = undefined;
                    self.attackState = 'passiveSampleprovidersp';
                    self.damagedEntity = false;
                    self.damaged = false;
                    break;
                }
                if(self.target.toRemove){
                    self.target = undefined;
                    self.attackState = 'passiveSampleprovidersp';
                    self.damagedEntity = false;
                    self.damaged = false;
                    break;
                }
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
                var allPlayersDead = true;
                for(var i in Player.list){
                    if(Player.list[i].hp > 1 && Player.list[i].map === self.map){
                        allPlayersDead = false;
                    }
                }
                if(allPlayersDead){
                    self.toRemove = true;
                }
                if(!self.target){
                    self.target = undefined;
                    self.attackState = 'passiveSampleprovidersp';
                    self.damagedEntity = false;
                    self.damaged = false;
                    break;
                }
                if(self.target.isDead){
                    self.target = undefined;
                    self.attackState = 'passiveSampleprovidersp';
                    self.damagedEntity = false;
                    self.damaged = false;
                    break;
                }
                if(self.target.toRemove){
                    self.target = undefined;
                    self.attackState = 'passiveSampleprovidersp';
                    self.damagedEntity = false;
                    self.damaged = false;
                    break;
                }
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
                var allPlayersDead = true;
                for(var i in Player.list){
                    if(Player.list[i].hp > 1 && Player.list[i].map === self.map){
                        allPlayersDead = false;
                    }
                }
                if(allPlayersDead){
                    self.toRemove = true;
                }
                if(!self.target){
                    self.target = undefined;
                    self.attackState = 'passiveSampleprovidersp';
                    self.damagedEntity = false;
                    self.damaged = false;
                    break;
                }
                if(self.target.isDead){
                    self.target = undefined;
                    self.attackState = 'passiveSampleprovidersp';
                    self.damagedEntity = false;
                    self.damaged = false;
                    break;
                }
                if(self.target.toRemove){
                    self.target = undefined;
                    self.attackState = 'passiveSampleprovidersp';
                    self.damagedEntity = false;
                    self.damaged = false;
                    break;
                }
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
            case "passiveSuvanth":
                self.animate = true;
                var maxAggro = -10;
                for(var i in Player.list){
                    if(Player.list[i].map === self.map && Player.list[i].isDead === false && Player.list[i].invincible === false && Player.list[i].mapChange > 10 && Player.list[i].stats.aggro > maxAggro){
                        self.attackState = "moveSuvanth";
                        self.target = Player.list[i];
                        maxAggro = Player.list[i].stats.aggro;
                    }
                }
                if(self.damaged){
                    self.attackState = "moveSuvanth";
                }
                break;
            case "moveSuvanth":
                self.followEntity(self.target,0);
                self.reload = 0;
                self.animation = 0;
                self.attackState = "attackPhase1Suvanth";
                break;
            case "attackPhase1Suvanth":
                var allPlayersDead = true;
                for(var i in Player.list){
                    if(Player.list[i].hp > 1 && Player.list[i].map === self.map){
                        allPlayersDead = false;
                    }
                }
                if(allPlayersDead){
                    self.toRemove = true;
                }
                if(!self.target){
                    self.target = undefined;
                    self.attackState = 'passiveSuvanth';
                    self.damagedEntity = false;
                    self.damaged = false;
                    break;
                }
                if(self.target.isDead){
                    self.target = undefined;
                    self.attackState = 'passiveSuvanth';
                    self.damagedEntity = false;
                    self.damaged = false;
                    break;
                }
                if(self.target.toRemove){
                    self.target = undefined;
                    self.attackState = 'passiveSuvanth';
                    self.damagedEntity = false;
                    self.damaged = false;
                    break;
                }
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
                var allPlayersDead = true;
                for(var i in Player.list){
                    if(Player.list[i].hp > 1 && Player.list[i].map === self.map){
                        allPlayersDead = false;
                    }
                }
                if(allPlayersDead){
                    self.toRemove = true;
                }
                if(!self.target){
                    self.target = undefined;
                    self.attackState = 'passiveSuvanth';
                    self.damagedEntity = false;
                    self.damaged = false;
                    break;
                }
                if(self.target.isDead){
                    self.target = undefined;
                    self.attackState = 'passiveSuvanth';
                    self.damagedEntity = false;
                    self.damaged = false;
                    break;
                }
                if(self.target.toRemove){
                    self.target = undefined;
                    self.attackState = 'passiveSuvanth';
                    self.damagedEntity = false;
                    self.damaged = false;
                    break;
                }
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
                var allPlayersDead = true;
                for(var i in Player.list){
                    if(Player.list[i].hp > 1 && Player.list[i].map === self.map){
                        allPlayersDead = false;
                    }
                }
                if(allPlayersDead){
                    self.toRemove = true;
                }
                if(!self.target){
                    self.target = undefined;
                    self.attackState = 'passiveSuvanth';
                    self.damagedEntity = false;
                    self.damaged = false;
                    break;
                }
                if(self.target.isDead){
                    self.target = undefined;
                    self.attackState = 'passiveSuvanth';
                    self.damagedEntity = false;
                    self.damaged = false;
                    break;
                }
                if(self.target.toRemove){
                    self.target = undefined;
                    self.attackState = 'passiveSuvanth';
                    self.damagedEntity = false;
                    self.damaged = false;
                    break;
                }
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
            case "passiveSpgem":
                self.animate = false;
                var maxAggro = -10;
                for(var i in Player.list){
                    if(Player.list[i].map === self.map && Player.list[i].isDead === false && Player.list[i].invincible === false && Player.list[i].mapChange > 10 && Player.list[i].stats.aggro > maxAggro){
                        self.attackState = "moveSpgem";
                        self.target = Player.list[i];
                        maxAggro = Player.list[i].stats.aggro;
                    }
                }
                if(self.damaged){
                    self.attackState = "moveSpgem";
                }
                break;
            case "moveSpgem":
                self.followEntity(self.target,0);
                self.reload = 0;
                self.animation = 0;
                self.attackState = "attackPhase1Spgem";
                break;
            case "attackPhase1Spgem":
                if(!self.target){
                    self.target = undefined;
                    self.attackState = 'passiveSpgem';
                    self.damagedEntity = false;
                    self.damaged = false;
                    break;
                }
                if(self.target.isDead){
                    self.target = undefined;
                    self.attackState = 'passiveSpgem';
                    self.damagedEntity = false;
                    self.damaged = false;
                    break;
                }
                if(self.target.toRemove){
                    self.target = undefined;
                    self.attackState = 'passiveSpgem';
                    self.damagedEntity = false;
                    self.damaged = false;
                    break;
                }
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
                    self.attackState = 'attackPhase2Spgem';
                    self.stage2 = true;
                }
                break;
            case "attackPhase2Spgem":
                var allPlayersDead = true;
                for(var i in Player.list){
                    if(Player.list[i].hp > 1 && Player.list[i].map === self.map){
                        allPlayersDead = false;
                    }
                }
                if(allPlayersDead){
                    self.toRemove = true;
                }
                if(!self.target){
                    self.target = undefined;
                    self.attackState = 'passiveSpgem';
                    self.damagedEntity = false;
                    self.damaged = false;
                    break;
                }
                if(self.target.isDead){
                    self.target = undefined;
                    self.attackState = 'passiveSpgem';
                    self.damagedEntity = false;
                    self.damaged = false;
                    break;
                }
                if(self.target.toRemove){
                    self.target = undefined;
                    self.attackState = 'passiveSpgem';
                    self.damagedEntity = false;
                    self.damaged = false;
                    break;
                }
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
                            value:'+' + heal,
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
            if(self.timer > 40 * param.stats.range){
                self.toRemove = true;
            }
        }
        else{
            if(self.timer > 40){
                self.toRemove = true;
            }
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
                self.direction = self.angle * 180 / Math.PI + 90;
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
        else if(param.projectileType === 'accellerateNoCollision'){
            self.spdX *= 1.5;
            self.spdY *= 1.5;
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
        var firstTile = "" + self.map + ":" + Math.round((self.x - 64) / 64) * 64 + ":" + Math.round((self.y - 64) / 64) * 64 + ":";
        var secondTile = "" + self.map + ":" + Math.round((self.x - 64) / 64) * 64 + ":" + Math.round(self.y / 64) * 64 + ":";
        var thirdTile = "" + self.map + ":" + Math.round(self.x / 64) * 64 + ":" + Math.round((self.y - 64) / 64) * 64 + ":";
        var fourthTile = "" + self.map + ":" + Math.round(self.x / 64) * 64 + ":" + Math.round(self.y / 64) * 64 + ":";
        if(Collision.list[self.map][Math.round((self.x - 64) / 64)]){
            if(Collision.list[self.map][Math.round((self.x - 64) / 64)][Math.round((self.y - 64) / 64)]){
                var collision = {
                    map:self.map,
                    x:Math.round((self.x - 64) / 64) * 64,
                    y:Math.round((self.y - 64) / 64) * 64,
                };
                if(Collision.list[self.map][Math.round((self.x - 64) / 64)][Math.round((self.y - 64) / 64)] === 1){
                    collision.width = 64;
                    collision.height = 64;
                    collision.x += 32;
                    collision.y += 32;
                }
                if(Collision.list[self.map][Math.round((self.x - 64) / 64)][Math.round((self.y - 64) / 64)] === 2){
                    collision.width = 64;
                    collision.height = 32;
                    collision.x += 32;
                    collision.y += 48;
                }
                if(Collision.list[self.map][Math.round((self.x - 64) / 64)][Math.round((self.y - 64) / 64)] === 3){
                    collision.width = 64;
                    collision.height = 32;
                    collision.x += 32;
                    collision.y += 16;
                }
                if(Collision.list[self.map][Math.round((self.x - 64) / 64)][Math.round((self.y - 64) / 64)] === 4){
                    collision.width = 32;
                    collision.height = 64;
                    collision.x += 16;
                    collision.y += 32;
                }
                if(Collision.list[self.map][Math.round((self.x - 64) / 64)][Math.round((self.y - 64) / 64)] === 5){
                    collision.width = 32;
                    collision.height = 64;
                    collision.x += 48;
                    collision.y += 32;
                }
                if(Collision.list[self.map][Math.round((self.x - 64) / 64)][Math.round((self.y - 64) / 64)] === 6){
                    collision.width = 32;
                    collision.height = 32;
                    collision.x += 32;
                    collision.y += 32;
                }
                if(Collision.list[self.map][Math.round((self.x - 64) / 64)][Math.round((self.y - 64) / 64)] === 7){
                    collision.width = 32;
                    collision.height = 32;
                    collision.x += 16;
                    collision.y += 48;
                }
                if(Collision.list[self.map][Math.round((self.x - 64) / 64)][Math.round((self.y - 64) / 64)] === 8){
                    collision.width = 32;
                    collision.height = 32;
                    collision.x += 48;
                    collision.y += 48;
                }
                if(Collision.list[self.map][Math.round((self.x - 64) / 64)][Math.round((self.y - 64) / 64)] === 9){
                    collision.width = 32;
                    collision.height = 32;
                    collision.x += 48;
                    collision.y += 16;
                }
                if(Collision.list[self.map][Math.round((self.x - 64) / 64)][Math.round((self.y - 64) / 64)] === 10){
                    collision.width = 32;
                    collision.height = 32;
                    collision.x += 16;
                    collision.y += 16;
                }
                if(self.isColliding(collision)){
                    if(param.projectilePattern === 'bounceOffCollisions'){
                        var x = self.x;
                        self.x = self.lastX;
                        if(self.isColliding(collision)){
                            self.x = x;
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
                    else{
                        self.toRemove = true;
                        self.updateNextFrame = false;
                    }
                }
            }
        }
        if(Collision.list[self.map][Math.round((self.x - 64) / 64)]){
            if(Collision.list[self.map][Math.round((self.x - 64) / 64)][Math.round((self.y) / 64)]){
                var collision = {
                    map:self.map,
                    x:Math.round((self.x - 64) / 64) * 64,
                    y:Math.round((self.y) / 64) * 64,
                };
                if(Collision.list[self.map][Math.round((self.x - 64) / 64)][Math.round((self.y) / 64)] === 1){
                    collision.width = 64;
                    collision.height = 64;
                    collision.x += 32;
                    collision.y += 32;
                }
                if(Collision.list[self.map][Math.round((self.x - 64) / 64)][Math.round((self.y) / 64)] === 2){
                    collision.width = 64;
                    collision.height = 32;
                    collision.x += 32;
                    collision.y += 48;
                }
                if(Collision.list[self.map][Math.round((self.x - 64) / 64)][Math.round((self.y) / 64)] === 3){
                    collision.width = 64;
                    collision.height = 32;
                    collision.x += 32;
                    collision.y += 16;
                }
                if(Collision.list[self.map][Math.round((self.x - 64) / 64)][Math.round((self.y) / 64)] === 4){
                    collision.width = 32;
                    collision.height = 64;
                    collision.x += 16;
                    collision.y += 32;
                }
                if(Collision.list[self.map][Math.round((self.x - 64) / 64)][Math.round((self.y) / 64)] === 5){
                    collision.width = 32;
                    collision.height = 64;
                    collision.x += 48;
                    collision.y += 32;
                }
                if(Collision.list[self.map][Math.round((self.x - 64) / 64)][Math.round((self.y) / 64)] === 6){
                    collision.width = 32;
                    collision.height = 32;
                    collision.x += 32;
                    collision.y += 32;
                }
                if(Collision.list[self.map][Math.round((self.x - 64) / 64)][Math.round((self.y) / 64)] === 7){
                    collision.width = 32;
                    collision.height = 32;
                    collision.x += 16;
                    collision.y += 48;
                }
                if(Collision.list[self.map][Math.round((self.x - 64) / 64)][Math.round((self.y) / 64)] === 8){
                    collision.width = 32;
                    collision.height = 32;
                    collision.x += 48;
                    collision.y += 48;
                }
                if(Collision.list[self.map][Math.round((self.x - 64) / 64)][Math.round((self.y) / 64)] === 9){
                    collision.width = 32;
                    collision.height = 32;
                    collision.x += 48;
                    collision.y += 16;
                }
                if(Collision.list[self.map][Math.round((self.x - 64) / 64)][Math.round((self.y) / 64)] === 10){
                    collision.width = 32;
                    collision.height = 32;
                    collision.x += 16;
                    collision.y += 16;
                }
                if(self.isColliding(collision)){
                    if(param.projectilePattern === 'bounceOffCollisions'){
                        var x = self.x;
                        self.x = self.lastX;
                        if(self.isColliding(collision)){
                            self.x = x;
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
                    else{
                        self.toRemove = true;
                        self.updateNextFrame = false;
                    }
                }
            }
        }
        if(Collision.list[self.map][Math.round((self.x) / 64)]){
            if(Collision.list[self.map][Math.round((self.x) / 64)][Math.round((self.y - 64) / 64)]){
                var collision = {
                    map:self.map,
                    x:Math.round((self.x) / 64) * 64,
                    y:Math.round((self.y - 64) / 64) * 64,
                };
                if(Collision.list[self.map][Math.round((self.x) / 64)][Math.round((self.y - 64) / 64)] === 1){
                    collision.width = 64;
                    collision.height = 64;
                    collision.x += 32;
                    collision.y += 32;
                }
                if(Collision.list[self.map][Math.round((self.x) / 64)][Math.round((self.y - 64) / 64)] === 2){
                    collision.width = 64;
                    collision.height = 32;
                    collision.x += 32;
                    collision.y += 48;
                }
                if(Collision.list[self.map][Math.round((self.x) / 64)][Math.round((self.y - 64) / 64)] === 3){
                    collision.width = 64;
                    collision.height = 32;
                    collision.x += 32;
                    collision.y += 16;
                }
                if(Collision.list[self.map][Math.round((self.x) / 64)][Math.round((self.y - 64) / 64)] === 4){
                    collision.width = 32;
                    collision.height = 64;
                    collision.x += 16;
                    collision.y += 32;
                }
                if(Collision.list[self.map][Math.round((self.x) / 64)][Math.round((self.y - 64) / 64)] === 5){
                    collision.width = 32;
                    collision.height = 64;
                    collision.x += 48;
                    collision.y += 32;
                }
                if(Collision.list[self.map][Math.round((self.x) / 64)][Math.round((self.y - 64) / 64)] === 6){
                    collision.width = 32;
                    collision.height = 32;
                    collision.x += 32;
                    collision.y += 32;
                }
                if(Collision.list[self.map][Math.round((self.x) / 64)][Math.round((self.y - 64) / 64)] === 7){
                    collision.width = 32;
                    collision.height = 32;
                    collision.x += 16;
                    collision.y += 48;
                }
                if(Collision.list[self.map][Math.round((self.x) / 64)][Math.round((self.y - 64) / 64)] === 8){
                    collision.width = 32;
                    collision.height = 32;
                    collision.x += 48;
                    collision.y += 48;
                }
                if(Collision.list[self.map][Math.round((self.x) / 64)][Math.round((self.y - 64) / 64)] === 9){
                    collision.width = 32;
                    collision.height = 32;
                    collision.x += 48;
                    collision.y += 16;
                }
                if(Collision.list[self.map][Math.round((self.x) / 64)][Math.round((self.y - 64) / 64)] === 10){
                    collision.width = 32;
                    collision.height = 32;
                    collision.x += 16;
                    collision.y += 16;
                }
                if(self.isColliding(collision)){
                    if(param.projectilePattern === 'bounceOffCollisions'){
                        var x = self.x;
                        self.x = self.lastX;
                        if(self.isColliding(collision)){
                            self.x = x;
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
                    else{
                        self.toRemove = true;
                        self.updateNextFrame = false;
                    }
                }
            }
        }
        if(Collision.list[self.map][Math.round((self.x) / 64)]){
            if(Collision.list[self.map][Math.round((self.x) / 64)][Math.round((self.y) / 64)]){
                var collision = {
                    map:self.map,
                    x:Math.round((self.x) / 64) * 64,
                    y:Math.round((self.y) / 64) * 64,
                };
                if(Collision.list[self.map][Math.round((self.x) / 64)][Math.round((self.y) / 64)] === 1){
                    collision.width = 64;
                    collision.height = 64;
                    collision.x += 32;
                    collision.y += 32;
                }
                if(Collision.list[self.map][Math.round((self.x) / 64)][Math.round((self.y) / 64)] === 2){
                    collision.width = 64;
                    collision.height = 32;
                    collision.x += 32;
                    collision.y += 48;
                }
                if(Collision.list[self.map][Math.round((self.x) / 64)][Math.round((self.y) / 64)] === 3){
                    collision.width = 64;
                    collision.height = 32;
                    collision.x += 32;
                    collision.y += 16;
                }
                if(Collision.list[self.map][Math.round((self.x) / 64)][Math.round((self.y) / 64)] === 4){
                    collision.width = 32;
                    collision.height = 64;
                    collision.x += 16;
                    collision.y += 32;
                }
                if(Collision.list[self.map][Math.round((self.x) / 64)][Math.round((self.y) / 64)] === 5){
                    collision.width = 32;
                    collision.height = 64;
                    collision.x += 48;
                    collision.y += 32;
                }
                if(Collision.list[self.map][Math.round((self.x) / 64)][Math.round((self.y) / 64)] === 6){
                    collision.width = 32;
                    collision.height = 32;
                    collision.x += 32;
                    collision.y += 32;
                }
                if(Collision.list[self.map][Math.round((self.x) / 64)][Math.round((self.y) / 64)] === 7){
                    collision.width = 32;
                    collision.height = 32;
                    collision.x += 16;
                    collision.y += 48;
                }
                if(Collision.list[self.map][Math.round((self.x) / 64)][Math.round((self.y) / 64)] === 8){
                    collision.width = 32;
                    collision.height = 32;
                    collision.x += 48;
                    collision.y += 48;
                }
                if(Collision.list[self.map][Math.round((self.x) / 64)][Math.round((self.y) / 64)] === 9){
                    collision.width = 32;
                    collision.height = 32;
                    collision.x += 48;
                    collision.y += 16;
                }
                if(Collision.list[self.map][Math.round((self.x) / 64)][Math.round((self.y) / 64)] === 10){
                    collision.width = 32;
                    collision.height = 32;
                    collision.x += 16;
                    collision.y += 16;
                }
                if(self.isColliding(collision)){
                    if(param.projectilePattern === 'bounceOffCollisions'){
                        var x = self.x;
                        self.x = self.lastX;
                        if(self.isColliding(collision)){
                            self.x = x;
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
                    else{
                        self.toRemove = true;
                        self.updateNextFrame = false;
                    }
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
                var collision2 = new Collision2({
                    x:x + size / 2,
                    y:y + size / 2,
                    width:size,
                    height:size,
                    map:map,
                });
            }
            if(tile_idx === 2127){
                var collision2 = new Collision2({
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
load("Lilypad Temple Room 1");
load("Lilypad Temple Room 2");
load("The Arena");
load("The Guarded Citadel");
load("Town Cave");
load("The Pet Arena");
load("Mysterious Room");
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

