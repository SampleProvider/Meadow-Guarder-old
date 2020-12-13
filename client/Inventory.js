
var enchantName = {
    1:'I',
    2:'II',
    3:'III',
    4:'IV',
    5:'V',
    6:'VI',
    7:'VII',
    8:'VIII',
    9:'IX',
    10:'X',
    11:'XI',
    12:'XII',
    13:'XIII',
    14:'XIV',
    15:'XV',
    16:'XVI',
    17:'XVII',
    18:'XVIII',
    19:'IXX',
    20:'XX',
};

Inventory = function(socket,server){
    var self = {
        socket:socket,
        server:server,
        items:[], //{id:"itemId",amount:1}
        currentEquip:{weapon:{},helmet:{},armor:{},key:{},book:{},special:{}},
        materials:[],
        refresh:true,
        spawn:true,
    };
    self.addItem = function(id,enchantments){
        self.items.push({id:id,enchantments:enchantments || []});
		self.refreshRender();
    }
    self.removeItem = function(index){
        self.items.splice(index,1);
        self.refreshRender();
    }
    self.enchantItem = function(index,enchantment,level){
        var item = self.items[index];
        for(var i in Item.list[item.id].enchantments){
            if(Item.list[item.id].enchantments[i] === enchantment){
                for(var j in item.enchantments){
                    if(item.enchantments[j].id === enchantment){
                        if(level <= Enchantment.list[enchantment].maxLevel){
                            item.enchantments[j].level = level;
                            self.refreshRender();
                            return true;
                        }
                        return false;
                    }
                }
                if(level <= Enchantment.list[enchantment].maxLevel){
                    item.enchantments.push({id:enchantment,level:level});
                    self.refreshRender();
                    return true;
                }
                return false;
            }
        }
    }
    self.removeEnchant = function(index,enchantment){
        var item = self.items[index];
        for(var i in item.enchantments){
            if(item.enchantments[i].id === enchantment){
                item.enchantments.splice(i,1);
                self.refreshRender();
                return true;
            }
        }
        return false;
    }
    self.addRandomizedItem = function(luck){
        var obtainedItems = [];
        for(var i in Item.list){
            if(Math.random() < Item.list[i].dropChance * luck){
                self.addItem(i,[]);
                obtainedItems.push(Item.list[i]);
            }
        }
        return obtainedItems;
    }
    self.addRandomizedEnchantments = function(luck){
        var obtainedItems = [];
        for(var i in Item.list){
            if(Math.random() < Item.list[i].dropChance * luck){
                var enchantments = [];
                for(var j in Item.list[i].enchantments){
                    for(var k in Enchantment.list){
                        if(k === Item.list[i].enchantments[j]){
                            var enchantment = Enchantment.list[k];
                            if(Math.random() < enchantment.dropChance * luck){
                                enchantments.push({id:k,level:Math.min(Math.max(1,Math.round(enchantment.averageLevel + (Math.random() * 2 - 1) * enchantment.deviation)),enchantment.maxLevel)});
                            }
                        }
                    }
                }
                self.addItem(i,enchantments);
                obtainedItems.push(Item.list[i]);
            }
        }
        return obtainedItems;
    }
    self.hasItem = function(index){
        if(self.items[index] !== undefined){
            return true;
        }
        return false;
    }
    self.equippedItem = function(id){
        for(var i in self.currentEquip){
            if(self.currentEquip[i].id === id){
                return true;
            }
        }
        return false;
    }
	self.refreshRender = function(){
        if(self.server){
            self.refresh = true;
            for(var i = 0;i < self.items.length;i++){
                self.items[i].index = i;
            }
            if(self.socket !== undefined){
                self.socket.emit('updateInventory',{items:self.items,currentEquip:self.currentEquip});
            }
            return;
        }
        var inventory = document.getElementById("inventoryItem");
        inventory.innerHTML = "";
        var currentEquip = document.getElementById("currentEquip");
        currentEquip.innerHTML = "";
        var addButton = function(data,index){
            let item = Item.list[data.id];
            let button = document.createElement('button');
            let equip = document.createElement('button');
            let dismantle = document.createElement('button');
            let div = document.createElement('div');
            let image = document.createElement('img');
            let enchantments = document.createElement('div');
            image.src = "/client/img/" + data.id + ".png";
            button.className = "UI-button-light";
            div.className = "UI-display-light";
            equip.className = "itemEquip";
            dismantle.className = "itemDismantle";
            image.className = "item";
            equip.innerHTML = "Equip";
            dismantle.innerHTML = "Dismantle";
            enchantments.className = "UI-text-light";
            var enchantDisplayName = '';
            for(var i in self.items[index].enchantments){
                if(enchantDisplayName === ''){
                    enchantDisplayName = 'Enchantments:<br>';
                }
                enchantDisplayName += '' + Enchantment.list[self.items[index].enchantments[i].id].name + ' ' + enchantName[self.items[index].enchantments[i].level] + '<br>';
            }
            enchantments.innerHTML = enchantDisplayName;
            enchantments.style.padding = '0px';
            dismantle.onclick = function(){
                self.socket.emit("dismantleItem",index);
                dismantle.style.display = 'inline-block';
            }
            equip.onclick = function(){
                self.socket.emit("equipItem",index);
                equip.style.display = 'inline-block';
            }
            button.innerHTML = item.name + " ";
            button.style.display = 'inline-block';
            button.style.position = 'relative';
            enchantments.style.position = 'relative';
            enchantments.style.color = '#ffffff';
            div.style.display = 'inline-block';
            div.style.position = 'relative';
            div.style.margin = '0px';
            button.style.textAlign = "center";
            inventory.appendChild(div);
            div.appendChild(button);
            div.appendChild(equip);
            div.appendChild(dismantle);
            div.appendChild(enchantments);
            button.appendChild(image);
        }
        var addEquip = function(data,index){
            if(data.id === undefined){
                return;
            }
            let item = Item.list[data.id];
            let button = document.createElement('button');
            let unequip = document.createElement('button');
            let div = document.createElement('div');
            let image = document.createElement('img');
            let enchantments = document.createElement('div');
            image.src = "/client/img/" + data.id + ".png";
            button.className = "UI-button-light";
            div.className = "UI-display-light";
            unequip.className = "itemUnequip";
            image.className = "item";
            unequip.innerHTML = "Unequip";
            enchantments.className = "UI-text-light";
            var enchantDisplayName = '';
            for(var i in self.currentEquip[index].enchantments){
                if(enchantDisplayName === ''){
                    enchantDisplayName = 'Enchantments:<br>';
                }
                enchantDisplayName += '' + Enchantment.list[self.currentEquip[index].enchantments[i].id].name + ' ' + enchantName[self.currentEquip[index].enchantments[i].level] + '<br>';
            }
            enchantments.innerHTML = enchantDisplayName;
            enchantments.style.padding = '0px';
            unequip.onclick = function(){
                self.socket.emit("unequipItem",index);
                unequip.style.display = 'inline-block';
            }
            button.innerHTML = item.name + " ";
            button.style.display = 'inline-block';
            button.style.position = 'relative';
            enchantments.style.position = 'relative';
            enchantments.style.color = '#ffffff';
            div.style.display = 'inline-block';
            div.style.position = 'relative';
            div.style.margin = '0px';
            button.style.textAlign = "center";
            currentEquip.appendChild(div);
            div.appendChild(button);
            div.appendChild(unequip);
            div.appendChild(enchantments);
            button.appendChild(image);
        }
		for(var i = 0;i < self.items.length;i++){
			addButton(self.items[i],i);
		}
		for(var i in self.currentEquip){
			addEquip(self.currentEquip[i],i);
		}
    }
    if(self.server && self.socket){
        self.socket.on("dismantleItem",function(index){
            if(!self.hasItem(index)){
                addToChat('style="color: #ff0000">',Player.list[self.socket.id].displayName + ' cheated using item dismantle.');
                return;
            }
            self.removeItem(index);
            Player.list[self.socket.id].xp += Math.round(Player.list[self.socket.id].stats.xp * 200);
        });
        self.socket.on("equipItem",function(index){
            if(!self.hasItem(index)){
                addToChat('style="color: #ff0000">',Player.list[self.socket.id].displayName + ' cheated using item equip.');
                return;
            }
            var item = self.items[index];
            if(self.currentEquip[Item.list[item.id].equip].id !== undefined){
                self.addItem(self.currentEquip[Item.list[item.id].equip].id,self.currentEquip[Item.list[item.id].equip].enchantments);
            }
            self.currentEquip[Item.list[item.id].equip] = self.items[index];
            self.removeItem(index);
            self.refreshRender();
        });
        self.socket.on("unequipItem",function(index){
            var item = self.currentEquip[index];
            if(self.currentEquip[Item.list[item.id].equip].id !== item.id){
                addToChat('style="color: #ff0000">',Player.list[self.socket.id].displayName + ' cheated using item unequip.');
                return;
            }
            self.addItem(self.currentEquip[Item.list[item.id].equip].id,self.currentEquip[Item.list[item.id].equip].enchantments);
            self.currentEquip[Item.list[item.id].equip] = {};
            self.refreshRender();
        });
    }
	return self;
}

Enchantment = function(id,name,maxLevel,averageLevel,deviation,dropChance,event){
	var self = {
		id:id,
        name:name,
        maxLevel:maxLevel,
        averageLevel:averageLevel,
        deviation:deviation,
        dropChance:dropChance,
        event:event,
    }
	Enchantment.list[self.id] = self;
	return self;
}

Enchantment.list = {};

Item = function(id,name,equip,event,dropChance,enchantments){
	var self = {
		id:id,
        name:name,
        equip:equip,
        event:event,
        dropChance:dropChance,
        enchantments:enchantments,
    }
	Item.list[self.id] = self;
	return self;
}
Item.list = {};

try{
    var items = require('./item.json');
    for(var i in items){
        Item(i,items[i].name,items[i].equip,items[i].event,items[i].dropChance,items[i].enchantments);
    }
}
catch(err){
    var request = new XMLHttpRequest();
    request.open('GET',"/client/item.json",true);

    request.onload = function(){
        if(this.status >= 200 && this.status < 400){
            // Success!
            var items = JSON.parse(this.response);
            for(var i in items){
                Item(i,items[i].name,items[i].equip,items[i].event,items[i].dropChance,items[i].enchantments);
            }
        }
        else{
            // We reached our target server, but it returned an error
        }
    };

    request.onerror = function(){
        // There was a connection error of some sort
    };

    request.send();
}
try{
    var enchantments = require('./enchantment.json');
    for(var i in enchantments){
        Enchantment(i,enchantments[i].name,enchantments[i].maxLevel,enchantments[i].averageLevel,enchantments[i].deviation,enchantments[i].dropChance,enchantments[i].event);
    }
}
catch(err){
    var request = new XMLHttpRequest();
    request.open('GET',"/client/enchantment.json",true);

    request.onload = function(){
        if(this.status >= 200 && this.status < 400){
            // Success!
            var enchantments = JSON.parse(this.response);
            for(var i in enchantments){
                Enchantment(i,enchantments[i].name,enchantments[i].maxLevel,enchantments[i].averageLevel,enchantments[i].deviation,enchantments[i].dropChance,enchantments[i].event);
            }
        }
        else{
            // We reached our target server, but it returned an error
        }
    };

    request.onerror = function(){
        // There was a connection error of some sort
    };

    request.send();
}