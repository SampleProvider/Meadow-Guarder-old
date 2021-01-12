Particle = function(param){
    var self = Entity(param);
    self.value = param.value;
    self.particleType = param.particleType;
    self.type = "Particle";
    self.map = param.map;
    self.timer = 10;
    self.direction = Math.random() * 2 - 1;
    var lastSelf = [];
    self.update = function(){
        if(self.particleType === 'redDamage' || self.particleType === 'greenDamage'){
            self.x += 5 * self.direction;
            self.y += -self.timer * 2 + 10;
        }
        self.timer -= 1;
        if(self.timer < 0){
            self.toRemove = true;
        }
    };
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
        if(lastSelf.value !== self.value){
            pack.value = self.value;
            lastSelf.value = self.value;
        }
        if(lastSelf.particleType !== self.particleType){
            pack.particleType = self.particleType;
            lastSelf.particleType = self.particleType;
        }
        if(lastSelf.timer !== self.timer){
            pack.timer = self.timer;
            lastSelf.timer = self.timer;
        }
        return pack;
	}
    self.getInitPack = function(){
        var pack = {};
        pack.id = self.id;
        pack.x = self.x;
        pack.y = self.y;
        pack.map = self.map;
        pack.value = self.value;
        pack.particleType = self.particleType;
        pack.type = self.type;
        return pack;
    }
    Particle.list[self.id] = self;
    return self;
}

Particle.list = [];