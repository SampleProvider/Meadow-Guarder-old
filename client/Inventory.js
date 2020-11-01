
QuestInventory = function(socket,server){
    var self = {
        socket:socket,
        server:server,
        items:[], //{id:"itemId",amount:1}
        materials:[],
    };
    self.addQuestItem = function(id,amount){
		for(var i = 0;i < self.items.length;i++){
			if(self.items[i].id === id){
				self.items[i].amount += amount;
				self.refreshRender();
				return;
			}
		}
		self.items.push({id:id,amount:amount});
		self.refreshRender();
    }
    self.removeQuestItem = function(id,amount){
		for(var i = 0;i < self.items.length;i++){
			if(self.items[i].id === id){
				self.items[i].amount -= amount;
				if(self.items[i].amount <= 0){
                    self.items.splice(i,1);
                }
				self.refreshRender();
				return;
			}
		}    
    }
    self.hasQuestItem = function(id,amount){
		for(var i = 0 ; i < self.items.length; i++){
			if(self.items[i].id === id){
				return self.items[i].amount >= amount;
			}
		}  
		return false;
    }
	self.refreshRender = function(){
        if(self.server){
            for(var i = 0;i < self.items.length;i++){
                self.items[i].index = i;
            }
            self.socket.emit('updateQuestInventory',self.items);
            return;
        }
        var questInventory = document.getElementById("questInventoryDiv");
        questInventory.innerHTML = "";
        var addButton = function(data,index){
            let questItem = QuestItem.list[data.id]
            let button = document.createElement('button');
            let image = document.createElement('img');
            image.src = "/client/img/" + data.id + ".png";
            button.className = "UI-button-light";
            image.className = "item";
            button.onclick = function(){
                self.socket.emit("useQuestItem",questItem.id);
            }
            button.innerHTML = questItem.name + " x" + data.amount + " ";
            button.style.top = index * 30 + 5;
            button.style.textAlign = "center";
            questInventory.appendChild(button);
            button.appendChild(image);
        }
		for(var i = 0;i < self.items.length;i++){
			addButton(self.items[i],i);
		}
    }
    if(self.server && self.socket){
        self.socket.on("useQuestItem",function(itemId){
            if(!self.hasQuestItem(itemId,1)){
                console.log('cheater');
                return;
            }

            let questItem = QuestItem.list[itemId];
            questItem.event(Player.list[self.socket.id]);
        });
    }


	return self;
}


QuestItem = function(id,name,event){
	var self = {
		id:id,
		name:name,
        event:event,
	}
	QuestItem.list[self.id] = self;
	return self;
}
QuestItem.list = {};

QuestItem("potion","Potion",function(player){
	player.hp += 500;
	player.questInventory.removeQuestItem("potion",1);
});

Inventory = function(socket,server){
    var self = {
        socket:socket,
        server:server,
        items:[], //{id:"itemId",amount:1}
        materials:[],
        refresh:true,
        spawn:true,
    };
    self.addItem = function(id,amount){
		for(var i = 0;i < self.items.length;i++){
			if(self.items[i].id === id){
				self.items[i].amount += amount;
				self.refreshRender();
				return;
			}
		}
        self.items.push({id:id,amount:amount});
		self.refreshRender();
    }
    self.removeItem = function(id,amount){
		for(var i = 0;i < self.items.length;i++){
			if(self.items[i].id === id){
				self.items[i].amount -= amount;
				if(self.items[i].amount <= 0){
                    self.items.splice(i,1);
                }
				self.refreshRender();
				return;
			}
		}    
    }
    self.hasItem = function(id,amount){
		for(var i = 0 ; i < self.items.length; i++){
			if(self.items[i].id === id){
				return self.items[i].amount >= amount;
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
            self.socket.emit('updateInventory',self.items);
            return;
        }
        var inventory = document.getElementById("inventoryItem");
        inventory.innerHTML = "";
        var addButton = function(data,index){
            let item = Item.list[data.id];
            let button = document.createElement('button');
            let image = document.createElement('img');
            image.src = "/client/img/" + data.id + ".png";
            button.className = "UI-button-light";
            image.className = "item";
            button.onclick = function(){
                self.socket.emit("useItem",item.id);
            }
            button.innerHTML = item.name + " x" + data.amount + " ";
            button.style.top = index * 30 + 5;
            button.style.textAlign = "center";
            inventory.appendChild(button);
            button.appendChild(image);
        }
		for(var i = 0;i < self.items.length;i++){
			addButton(self.items[i],i);
		}
    }
    if(self.server && self.socket){
        self.socket.on("useItem",function(itemId){
            if(!self.hasItem(itemId,1)){
                console.log('cheater');
                return;
            }

            let item = Item.list[itemId];
            item.eventClick(Player.list[self.socket.id]);
        });
    }


	return self;
}


Item = function(id,name,event,eventClick){
	var self = {
		id:id,
		name:name,
        event:event,
        eventClick:eventClick,
	}
	Item.list[self.id] = self;
	return self;
}
Item.list = {};

Item("sword","Sword",function(player){
    player.stats.attack = player.stats.attack * 1.1;
},function(player){
    player.questInventory.addQuestItem("potion",1);
    player.inventory.removeItem("sword",1);
});
Item("helmet","Helmet",function(player){
    player.stats.defense = player.stats.defense * 1.1;
},function(player){

});
Item("bow","Bow",function(player){
    player.stats.attack = player.stats.attack * 1.5;
},function(player){

});
Item("fish","Red Fish",function(player){
    player.hpMax = player.hpMax * 1.5;
},function(player){

});
Item("orangefish","Orange Fish",function(player){
    player.textColor = "ff9000";
},function(player){

});
Item("shield","Shield",function(player){
    player.stats.defense = player.stats.defense * 2;
},function(player){

});
Item("amulet","Amulet",function(player){
    player.stats.heal = player.stats.heal * 2;
},function(player){

});