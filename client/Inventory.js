
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
            button.onmouseover = function(event){
                mouseUp(event);
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
		for(var i = 0;i < self.items.length;i++){
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
            let equip = document.createElement('button');
            let dismantle = document.createElement('button');
            let div = document.createElement('div');
            let image = document.createElement('img');
            image.src = "/client/img/" + data.id + ".png";
            button.className = "UI-button-light";
            div.className = "UI-display-light";
            equip.className = "itemEquip";
            dismantle.className = "itemDismantle";
            image.className = "item";
            equip.innerHTML = "Equip";
            dismantle.innerHTML = "Dismantle";
            button.onclick = function(){
                if(equip.style.display === 'none'){
                    equip.style.display = 'inline-block';
                    dismantle.style.display = 'inline-block';
                }
                else{
                    equip.style.display = 'none';
                    dismantle.style.display = 'none';
                }
                //self.socket.emit("useItem",item.id);
            }
            dismantle.onclick = function(){
                self.socket.emit("dismantleItem",item.id);
                dismantle.style.display = 'inline-block';
            }
            button.innerHTML = item.name + " x" + data.amount + " ";
            button.style.display = 'inline-block';
            button.style.position = 'relative';
            div.style.display = 'inline-block';
            div.style.position = 'relative';
            div.style.margin = '0px';
            button.style.textAlign = "center";
            inventory.appendChild(div);
            div.appendChild(button);
            div.appendChild(equip);
            div.appendChild(dismantle);
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
        self.socket.on("dismantleItem",function(itemId){
            if(!self.hasItem(itemId,1)){
                console.log('cheater');
                return;
            }

            self.removeItem(itemId,1);
            Player.list[self.socket.id].xp += Math.round(Player.list[self.socket.id].stats.xp * 2000);
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
    player.stats.attack = player.stats.attack * 1.1;
},function(player){

});
Item("fish","Red Fish",function(player){
    player.hpMax = player.hpMax * 1.1;
},function(player){

});
Item("orangefish","Orange Fish",function(player){
    player.textColor = "ff9000";
},function(player){

});
Item("shield","Shield",function(player){
    player.stats.defense = player.stats.defense * 1.5;
},function(player){

});
Item("amulet","Amulet",function(player){
    player.stats.heal = player.stats.heal * 1.1;
},function(player){

});
Item("bluecandy","Blue Candy",function(player){
    player.textColor = "0090ff";
    for(var i in player.inventory.items){
        if(player.inventory.items[i].id !== 'bluecandyc'){
            player.inventory.removeItem(player.inventory.items[i].id,player.inventory.items[i].amount);
        }
    }
    player.inventory.addItem("bluecandyc",1);
    player.inventory.removeItem("bluecandy",1);
},function(player){

});
Item("bluecandyc","Blue Candy",function(player){
    player.textColor = "0090ff";
    player.inventory.removeItem("bluecandyc",1);
},function(player){

});
Item("xpgem","XP Gem",function(player){
    player.stats.xp = player.stats.xp * 1.1;
},function(player){

});