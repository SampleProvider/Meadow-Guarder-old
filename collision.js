

Collision = function(param){
    var self = Entity(param);
    self.id = "" + self.map + ":" + self.x + ":" + self.y + ":";
    self.x = self.x + 32;
    self.y = self.y + 32;
    self.width = param.size;
    self.height = param.size;
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

Transporter = function(param){
    var self = Entity(param);
    self.id = "" + self.map + ":" + self.x + ":" + self.y + ":";
    self.x = self.x + 32;
    self.y = self.y + 32;
    self.teleport = param.teleport;
    self.teleportx = param.teleportx;
    self.teleporty = param.teleporty;
    self.width = param.size;
    self.height = param.size;
    var super_update = self.update;
    self.update = function(){
        super_update();
    }
    Transporter.list[self.id] = self;
}

Transporter.list = {};