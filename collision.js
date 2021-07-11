Collision = function(param){
    var self = {};
    self.map = param.map;
    self.x = param.x;
    self.y = param.y;
    self.type = 'Collision';
    if(Collision.list[self.map]){
        if(Collision.list[self.map][Math.round(self.x / 64)]){
            Collision.list[self.map][Math.round(self.x / 64)][Math.round(self.y / 64)] = param.type;
        }
    }
    return self;
}
Collision.list = {};

ProjectileCollision = function(param){
    var self = {};
    self.map = param.map;
    self.x = param.x;
    self.y = param.y;
    if(ProjectileCollision.list[self.map]){
        if(ProjectileCollision.list[self.map][Math.round(self.x / 64)]){
            ProjectileCollision.list[self.map][Math.round(self.x / 64)][Math.round(self.y / 64)] = param.type;
        }
    }
    return self;
}
ProjectileCollision.list = {};

SlowDown = function(param){
    var self = {};
    self.map = param.map;
    self.x = param.x;
    self.y = param.y;
    if(SlowDown.list[self.map]){
        if(SlowDown.list[self.map][Math.round(self.x / 64)]){
            SlowDown.list[self.map][Math.round(self.x / 64)][Math.round(self.y / 64)] = param.type;
        }
    }
    return self;
}
SlowDown.list = {};

Spawner = function(param){
    var self = Entity(param);
    self.id = "" + self.map + ":" + (~~(self.x / 64) * 64) + ":" + (~~(self.y / 64) * 64) + ":";
    self.spawned = false;
    self.toRemove = false;
    self.type = 'Spawner';
    var super_update = self.update;
    self.update = function(){
        super_update();
    }
    Spawner.list[self.id] = self;
    return self;
}
Spawner.list = {};

Transporter = function(param){
    var self = Entity(param);
    self.id = "" + self.map + ":" + Math.floor(self.x / 64) * 64 + ":" + Math.floor(self.y / 64) * 64 + ":";
    self.teleport = param.teleport;
    self.teleportx = parseInt(param.teleportx,10);
    self.teleporty = parseInt(param.teleporty,10);
    self.teleportdirection = param.direction;
    self.requirements = param.requirements;
    self.toRemove = false;
    self.type = 'Transporter';
    if(Maps[self.teleport]){
        self.mapx = Maps[self.teleport].width;
        self.mapy = Maps[self.teleport].height;
    }
    setTimeout(function(){
        if(Maps[self.teleport]){
            self.mapx = Maps[self.teleport].width;
            self.mapy = Maps[self.teleport].height;
        }
    },2000);
    self.width = param.width;
    self.height = param.height;
    var super_update = self.update;
    self.update = function(){
        super_update();
    }
    Transporter.list[self.id] = self;
    return self;
}
Transporter.list = {};

QuestInfo = function(param){
    var self = Entity(param);
    self.id = "" + self.map + ":" + Math.floor(self.x / 64) * 64 + ":" + Math.floor(self.y / 64) * 64 + ":";
    self.info = param.info;
    self.quest = param.quest;
    self.width = param.width;
    self.height = param.height;
    self.toRemove = false;
    self.type = 'QuestInfo';
    var super_update = self.update;
    self.update = function(){
        super_update();
    }
    QuestInfo.list[self.id] = self;
    return self;
}
QuestInfo.list = {};

WayPoint = function(param){
    var self = Entity(param);
    self.id = "" + self.map + ":" + Math.floor(self.x / 64) * 64 + ":" + Math.floor(self.y / 64) * 64 + ":";
    self.info = param.info;
    self.width = param.width;
    self.height = param.height;
    self.toRemove = false;
    self.type = 'WayPoint';
    var super_update = self.update;
    self.update = function(){
        super_update();
    }
    WayPoint.list[self.id] = self;
    return self;
}
WayPoint.list = {};