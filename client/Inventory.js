
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
            if(self.socket !== undefined){
                self.socket.emit('updateQuestInventory',self.items);
            }
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
        currentEquip:{helmet:'',boost:'',weapon:'',key:'',book:'',special:''},
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
    self.addRandomizedItem = function(luck){
        var obtainedItems = [];
        for(var i in Item.list){
            if(Math.random() < Item.list[i].dropChance * luck){
                self.addItem(i,1);
                obtainedItems.push(Item.list[i]);
            }
        }
        return obtainedItems;
    }
    self.hasItem = function(id,amount){
		for(var i = 0;i < self.items.length;i++){
			if(self.items[i].id === id){
				return self.items[i].amount >= amount;
			}
		}  
		return false;
    }
    self.equippedItem = function(id){
        for(var i in self.currentEquip){
            if(self.currentEquip[i] === id){
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
            equip.onclick = function(){
                if(item.id !== 'xpgem'){
                    self.socket.emit("equipItem",item.id);
                    equip.style.display = 'inline-block';
                }
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
        var addEquip = function(data,index){
            if(data === ''){
                return;
            }
            let item = Item.list[data];
            let button = document.createElement('button');
            let unequip = document.createElement('button');
            let div = document.createElement('div');
            let image = document.createElement('img');
            image.src = "/client/img/" + data + ".png";
            button.className = "UI-button-light";
            div.className = "UI-display-light";
            unequip.className = "itemUnequip";
            image.className = "item";
            unequip.innerHTML = "Unequip";
            unequip.onclick = function(){
                self.socket.emit("unequipItem",item.id);
                unequip.style.display = 'inline-block';
            }
            button.innerHTML = item.name + " ";
            button.style.display = 'inline-block';
            button.style.position = 'relative';
            div.style.display = 'inline-block';
            div.style.position = 'relative';
            div.style.margin = '0px';
            button.style.textAlign = "center";
            currentEquip.appendChild(div);
            div.appendChild(button);
            div.appendChild(unequip);
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
        self.socket.on("useItem",function(itemId){
            if(!self.hasItem(itemId,1)){
                addToChat('style="color: #ff0000">',Player.list[self.socket.id].displayName + ' cheated using item use.');
                return;
            }

            let item = Item.list[itemId];
            item.eventClick(Player.list[self.socket.id]);
        });
        self.socket.on("dismantleItem",function(itemId){
            if(!self.hasItem(itemId,1)){
                addToChat('style="color: #ff0000">',Player.list[self.socket.id].displayName + ' cheated using item dismantle.');
                return;
            }

            self.removeItem(itemId,1);
            Player.list[self.socket.id].xp += Math.round(Player.list[self.socket.id].stats.xp * 200);
        });
        self.socket.on("equipItem",function(itemId){
            if(!self.hasItem(itemId,1)){
                addToChat('style="color: #ff0000">',Player.list[self.socket.id].displayName + ' cheated using item equip.');
                return;
            }

            self.removeItem(itemId,1);
            if(self.currentEquip[Item.list[itemId].equip] !== ''){
                self.addItem(self.currentEquip[Item.list[itemId].equip],1);
            }
            self.currentEquip[Item.list[itemId].equip] = itemId;
            self.refreshRender();
        });
        self.socket.on("unequipItem",function(itemId){
            if(self.currentEquip[Item.list[itemId].equip] !== itemId){
                addToChat('style="color: #ff0000">',Player.list[self.socket.id].displayName + ' cheated using item unequip.');
                return;
            }
            self.addItem(self.currentEquip[Item.list[itemId].equip],1);
            self.currentEquip[Item.list[itemId].equip] = '';
            self.refreshRender();
        });
    }


	return self;
}


Item = function(id,name,equip,event,dropChance){
	var self = {
		id:id,
        name:name,
        equip:equip,
        event:event,
        dropChance:dropChance,
    }
	Item.list[self.id] = self;
	return self;
}
Item.list = {};

try{
    var items = require('./item.json');
    for(var i in items){
        Item(i,items[i].name,items[i].equip,items[i].event,parseFloat(items[i].dropChance,10));
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
                Item(i,items[i].name,items[i].equip,items[i].event,parseFloat(items[i].dropChance,10));
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