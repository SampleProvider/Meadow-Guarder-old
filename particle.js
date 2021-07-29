Particle = function(param){
    var self = Entity(param);
    self.value = param.value;
    self.particleType = param.particleType;
    self.type = "Particle";
    self.map = param.map;
    self.timer = 10;
    self.direction = Math.random() * 2 - 1;
    if(self.particleType === 'teleport'){
        self.direction = 360 * Math.random();
    }
    if(self.particleType === 'kill'){
        self.direction = 360 * Math.random();
    }
    self.getInitPack = function(){
        var pack = {};
        pack.id = self.id;
        pack.x = self.x;
        pack.y = self.y;
        pack.map = self.map;
        pack.value = self.value;
        pack.timer = self.timer;
        pack.particleType = self.particleType;
        pack.direction = self.direction;
        pack.type = self.type;
        return pack;
    }
    Particle.list[self.id] = self;
    return self;
}

Particle.list = [];