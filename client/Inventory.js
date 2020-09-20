
Inventory = function(socket,server){
    var self = {
        socket:socket,
        server:server,
        items:[], //{id:"itemId",amount:1}
        materials:[],
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
            for(var i = 0;i < self.items.length;i++){
                self.items[i].index = i;
            }
            self.socket.emit('updateInventory',self.items);
            return;
        }
        var inventory = document.getElementById("inventory");
        inventory.innerHTML = "";
        var addButton = function(data,index){
            let item = Item.list[data.id]
            let button = document.createElement('button');
            button.className = "UI-button-light";
            button.onclick = function(){
                self.socket.emit("useItem",item.id);
            }
            button.innerHTML = item.name + " x" + data.amount;
            button.style.top = index * 30;
            inventory.appendChild(button);
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
            item.event(Player.list[self.socket.id]);
        });
    }


	return self;
}


Item = function(id,name,event){
	var self = {
		id:id,
		name:name,
        event:event,
	}
	Item.list[self.id] = self;
	return self;
}
Item.list = {};

Item("potion","Potion",function(player){
	player.hp += 500;
	player.inventory.removeItem("potion",1);
	player.inventory.addItem("monsters",1);
});

Item("monsters","Click ME!!<br>NOT A SCAM",function(player){
    for(var i = 0;i < 10;i++){
        var monster = new Monster({
            spawnId:0,
            x:player.x,
            y:player.y,
            map:player.map,
            moveSpeed:100,
        });
    }
	player.inventory.removeItem("monsters",1);
});
