

Collision = function(param){
    var self = Entity(param);
    self.id = Math.random();
    self.width = param.size;
    self.height = param.size;
    var super_update = self.update;
    self.update = function(){
        super_update();
        for(var i in Player.list){
            var player = Player.list[i];
            if(self.map === player.map && self.isColliding(player) && player.img === 'player'){
                if(player.spdX !== 0 && player.spdY !== 0){
                    var x = player.x;
                    player.x = player.lastX;
                    if(self.isColliding(player)){
                        player.x = x;
                        player.y = player.lastY;
                        if(self.isColliding(player)){
                            player.x = player.lastX;
                            player.y = player.lastY;
                        }
                        else{

                        }
                    }
                    else{

                    }
                }
                else if(player.spdX === 0 && player.spdY === 0){

                }
                else{
                    player.x = player.lastX;
                    player.y = player.lastY;
                }
            }
        }
        for(var i in Projectile.list){
            var projectile = Projectile.list[i];
            if(self.isColliding(projectile)){
                projectile.toRemove = true;
            }
        }
    }
    Collision.list[self.id] = self;
}

Collision.list = {};

Transporter = function(param){
    var self = Entity(param);
    self.id = Math.random();
    self.teleport = param.teleport;
    self.teleportx = param.teleportx;
    self.teleporty = param.teleporty;
    self.width = param.size;
    self.height = param.size;
    var super_update = self.update;
    self.update = function(){
        super_update();
        for(var i in Player.list){
            var player = Player.list[i];
            if(self.map === player.map && self.isColliding(player)){
                player.map = self.teleport;
                player.x = self.teleportx;
                player.y = self.teleporty;
            }
        }
    }
    Transporter.list[self.id] = self;
}

Transporter.list = {};