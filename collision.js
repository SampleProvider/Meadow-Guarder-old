

Collision = function(param){
    var self = Entity(param);
    self.id = "" + self.map + ":" + (~~(self.x / 64) * 64) + ":" + (~~(self.y / 64) * 64) + ":";
    self.toRemove = false;
    self.type = 'Collision';
    var super_update = self.update;
    self.update = function(){
        super_update();
    }
    Collision.list[self.id] = self;
    return self;
}

Collision.list = {};
Collision2 = function(param){
    var self = Entity(param);
    self.id = "" + self.map + ":" + (~~(self.x / 64) * 64) + ":" + (~~(self.y / 64) * 64) + ":";
    self.toRemove = false;
    self.type = 'Collision2';
    var super_update = self.update;
    self.update = function(){
        super_update();
    }
    Collision2.list[self.id] = self;
    return self;
}

Collision2.list = {};
Collision3 = function(param){
    var self = Entity(param);
    self.id = "" + self.map + ":" + (~~(self.x / 64) * 64) + ":" + (~~(self.y / 64) * 64) + ":";
    self.toRemove = false;
    self.type = 'Collision3';
    var super_update = self.update;
    self.update = function(){
        super_update();
    }
    Collision3.list[self.id] = self;
    return self;
}

Collision3.list = {};


ProjectileCollision = function(param){
    var self = Entity(param);
    self.id = "" + self.map + ":" + self.x + ":" + self.y + ":";
    self.x = self.x + 32;
    self.y = self.y + 32;
    self.width = param.size;
    self.height = param.size;
    self.toRemove = false;
    self.type = 'ProjectileCollision';
    var super_update = self.update;
    self.update = function(){
        super_update();
        self.updateCollision();
    }
    self.updateCollision = function(){
        for(var i in Projectile.list){
            var projectile = Projectile.list[i];
            if(self.isColliding(projectile)){
                projectile.toRemove = true;
            }
        }
    }
    ProjectileCollision.list[self.id] = self;
    return self;
}

ProjectileCollision.list = {};

SlowDown = function(param){
    var self = Entity(param);
    self.id = "" + self.map + ":" + (~~(self.x / 64) * 64) + ":" + (~~(self.y / 64) * 64) + ":";
    self.toRemove = false;
    self.type = 'SlowDown';
    var super_update = self.update;
    self.update = function(){
        super_update();
    }
    SlowDown.list[self.id] = self;
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