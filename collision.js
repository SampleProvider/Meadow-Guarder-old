

Collision = function(param){
    var self = Entity(param);
    self.id = "" + self.map + ":" + (~~(self.x / 64) * 64) + ":" + (~~(self.y / 64) * 64) + ":";
    var super_update = self.update;
    self.update = function(){
        super_update();
    }
    Collision.list[self.id] = self;
}

Collision.list = {};

ProjectileCollision = function(param){
    var self = Entity(param);
    self.id = "" + self.map + ":" + self.x + ":" + self.y + ":";
    self.x = self.x + 32;
    self.y = self.y + 32;
    self.width = param.size;
    self.height = param.size;
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
}

ProjectileCollision.list = {};

SlowDown = function(param){
    var self = Entity(param);
    self.id = "" + self.map + ":" + (~~(self.x / 64) * 64) + ":" + (~~(self.y / 64) * 64) + ":";
    var super_update = self.update;
    self.update = function(){
        super_update();
    }
    SlowDown.list[self.id] = self;
}

SlowDown.list = {};

Spawner = function(param){
    var self = Entity(param);
    self.id = "" + self.map + ":" + (~~(self.x / 64) * 64) + ":" + (~~(self.y / 64) * 64) + ":";
    self.spawned = false;
    var super_update = self.update;
    self.update = function(){
        super_update();
    }
    Spawner.list[self.id] = self;
}

Spawner.list = {};

Transporter = function(param){
    var self = Entity(param);
    self.id = "" + self.map + ":" + self.x + ":" + self.y + ":";
    self.x = self.x + 32;
    self.y = self.y + 32;
    self.teleport = param.teleport;
    self.teleportx = parseInt(param.teleportx,10);
    self.teleporty = parseInt(param.teleporty,10);
    self.teleportdirection = param.direction;
    self.requirements = param.requirements;
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
    self.width = param.size;
    self.height = param.size;
    var super_update = self.update;
    self.update = function(){
        super_update();
    }
    Transporter.list[self.id] = self;
}

Transporter.list = {};