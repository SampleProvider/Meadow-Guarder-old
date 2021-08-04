
Inventory = function(socket,server){
    var self = {
        socket:socket,
        server:server,
        items:[],
        draggingItem:-1,
        draggingX:-1,
        draggingY:-1,
        equips:{weapon:{},weapon2:{},helmet:{},armor:{},boots:{},offhand:{},scroll:{},key:{},crystal:{}},
        dismantle:'Common Items',
        shopItems:{items:[],prices:[]},
        craftItems:{items:[],materials:[]},
        refresh:true,
        spawn:true,
        maxSlots:30,
    };
    self.getRarityColor = function(rarity){
        if(rarity === 0){
            return '#ffffff';
        }
        if(rarity === 1){
            return '#5555ff';
        }
        if(rarity === 2){
            return '#ff9900';
        }
        if(rarity === 3){
            return '#ffff00';
        }
        if(rarity === 4){
            return '#ff00ff';
        }
        if(rarity === 5){
            return '#ff0000';
        }
        if(rarity === 6){
            return '#0000aa';
        }
        if(rarity === 7){
            return '#00ff00';
        }
        if(rarity === 8){
            return '#ff0090';
        }
        if(rarity === 9){
            return '#00ff90';
        }
    }
    self.getKnockback = function(knockback){
        if(knockback === 0){
            return 'No knockback.';
        }
        if(knockback <= 0.1){
            return 'Low knockback.';
        }
        if(knockback <= 0.3){
            return 'Medium knockback.';
        }
        if(knockback <= 0.5){
            return 'High knockback.';
        }
        if(knockback <= 1){
            return 'Crazy knockback.';
        }
        if(knockback <= 5){
            return 'Insane knockback.';
        }
        return 'SP knockback.';
    }
    self.getSlotId = function(index){
        if(self.items[index]){
            return index;
        }
        else if(index === -1){
            return 'crystal';
        }
        else if(index === -2){
            return 'key';
        }
        else if(index === -3){
            return 'scroll';
        }
        else if(index === -4){
            return 'offhand';
        }
        else if(index === -5){
            return 'boots';
        }
        else if(index === -6){
            return 'armor';
        }
        else if(index === -7){
            return 'helmet';
        }
        else if(index === -8){
            return 'weapon2';
        }
        else if(index === -9){
            return 'weapon';
        }
    }
    self.addItem = function(id,amount,enchantments){
        if(!Item.list[id]){
            return false;
        }
        var hasSpace = 0;
        var index = -1;
        for(var i in self.items){
            if(self.items[i] === null || self.items[i] === undefined){
                self.items[i] = {};
            }
            if(hasSpace < 1 && self.items[i].id === undefined){
                hasSpace = 1;
                index = i;
            }
            if(hasSpace < 2 && self.items[i].id === id && Item.list[id].maxStack > self.items[i].stack && amount !== undefined){
                hasSpace = 2;
                index = i;
            }
        }
        if(hasSpace === 0){
            var noSpace = function(){
                if(Player.list[socket.id]){
                    Player.list[socket.id].sendNotification('[!] You don\'t have space for that item.');
                    new DroppedItem({
                        id:socket.id,
                        item:{id:id,enchantments:enchantments},
                        amount:amount,
                        x:Player.list[socket.id].x,
                        y:Player.list[socket.id].y,
                        map:Player.list[socket.id].map,
                        leftPlayer:false,
                        allPlayers:false,
                    });
                }
                else{
                    setTimeout(noSpace,1000);
                }
            }
            noSpace();
        }
        else if(hasSpace === 1){
            var newEnchantments = [];
            for(var i in enchantments){
                if(enchantments[i].level > 1){
                    newEnchantments.push({id:enchantments[i].id,level:enchantments[i].level / 100});
                }
                else{
                    newEnchantments.push(enchantments[i]);
                }
            }
            if(amount > Item.list[id].maxStack){
                self.items[index] = {id:id,enchantments:newEnchantments || [],stack:Item.list[id].maxStack || 1};
                self.addItem(id,amount - Item.list[id].maxStack,enchantments);
            }
            else{
                self.items[index] = {id:id,enchantments:newEnchantments || [],stack:amount || 1};
            }
            self.refreshItem(index);
            return index;
        }
        else if(hasSpace === 2){
            var newEnchantments = [];
            for(var i in enchantments){
                if(enchantments[i].level > 1){
                    newEnchantments.push({id:enchantments[i].id,level:enchantments[i].level / 100});
                }
                else{
                    newEnchantments.push(enchantments[i]);
                }
            }
            if(amount + self.items[index].stack > Item.list[id].maxStack){
                self.items[index] = {id:id,enchantments:newEnchantments || [],stack:Item.list[id].maxStack};
                self.addItem(id,amount + self.items[index].stack - Item.list[id].maxStack,newEnchantments);
            }
            else{
                self.items[index] = {id:id,enchantments:newEnchantments || [],stack:amount + self.items[index].stack};
            }
            self.refreshItem(index);
            return index;
        }
    }
    self.removeItem = function(item,amount){
        var amountFound = 0;
        for(var i in self.items){
            if(self.items[i].id === item){
                if(amountFound + self.items[i].stack >= amount){
                    self.items[i].stack = self.items[i].stack - (amount - amountFound);
                    if(self.items[i].stack === 0){
                        self.items[i] = {};
                    }
                    self.refreshItem(i);
                    return true;
                }
                amountFound += self.items[i].stack;
                self.items[i] = {};
                self.refreshItem(i);
            }
        }
        return false;
    }
    self.hasItem = function(item,amount){
        var amountFound = 0;
        for(var i in self.items){
            if(self.items[i].id === item){
                amountFound += self.items[i].stack;
                if(amountFound >= amount){
                    return true;
                }
            }
        }
        return false;
    }
    self.enchantItem = function(index,enchantment,level){
        if(self.items[index]){
            var item = self.items[index];
            for(var i in Item.list[item.id].enchantments){
                if(Item.list[item.id].enchantments[i] === enchantment){
                    for(var j in item.enchantments){
                        if(item.enchantments[j].id === enchantment){
                            item.enchantments[j].level = Math.min(Math.round(item.enchantments[j].level * 1000 + (1.01 - item.enchantments[j].level) * level * 1000) / 1000,1);
                            return true;
                        }
                    }
                    item.enchantments.push({id:enchantment,level:level});
                    //self.refreshItem(index);
                    return true;
                }
            }
        }
        else if(self.equips[index].id){
            var item = self.equips[index];
            for(var i in Item.list[item.id].enchantments){
                if(Item.list[item.id].enchantments[i] === enchantment){
                    for(var j in item.enchantments){
                        if(item.enchantments[j].id === enchantment){
                            item.enchantments[j].level = Math.min(Math.round(item.enchantments[j].level * 1000 + (1.01 - item.enchantments[j].level) * level * 1000) / 1000,1);
                            return true;
                        }
                    }
                    item.enchantments.push({id:enchantment,level:level});
                    //self.refreshItem(index);
                    return true;
                }
            }
        }
    }
    self.addItemClient = function(index){
        var slot = document.getElementById("inventorySlot" + index);
        if(slot){
            slot.innerHTML = "";
            slot.style.border = "1px solid #000000";
            slot.onmousedown = function(){};
            slot.className += ' inventoryMenuSlot';
            if(self.items[index]){
                if(self.items[index].id){
                    var item = Item.list[self.items[index].id];
                    var div = document.createElement('div');
                    slot.innerHTML = "<image id='itemImage" + index + "' class='itemImage' src='/client/img/" + self.items[index].id + ".png'></image>";
                    var enchantDisplayName = '';
                    for(var i in self.items[index].enchantments){
                        if(enchantDisplayName === ''){
                            enchantDisplayName = 'Enchantments:<br>';
                        }
                        enchantDisplayName += '+';
                        enchantDisplayName += (Math.round(self.items[index].enchantments[i].level * 1000) / 10) + '% ' + Enchantment.list[self.items[index].enchantments[i].id].name + '<br>';
                    }
                    var description = '';
                    if(item.damage || item.defense){
                        description += 'When Equipped:<br>';
                    }
                    if(item.damage){
                        if(item.damageType){
                            description += '<span style="color: #33ee33">+' + item.damage + ' ' + item.damageType + ' damage.</span><br>';
                        }
                        if(item.critChance){
                            description += '<span style="color: #33ee33">+' + item.critChance * 100 + '% critical strike chance.</span><br>';
                        }
                    }
                    if(item.defense){
                        description += '<span style="color: #33ee33">+' + item.defense + ' defense.</span><br>';
                    }
                    if(item.damageReduction){
                        description += '<span style="color: #33ee33">+' + item.damageReduction * 100 + '% damage reduction.</span><br>';
                    }
                    if(item.manaCost){
                        description += 'Uses ' + item.manaCost + ' mana.<br>';
                    }
                    if(item.knockback !== undefined){
                        description += self.getKnockback(item.knockback) + '<br>';
                    }
                    var image = document.getElementById('itemImage' + index);
                    if(item.equip === 'consume'){
                        description += 'Right click to use.<br>';
                    }
                    var itemName = item.name;
                    if(self.items[index].stack !== 1){
                        itemName += ' (' + self.items[index].stack + ')';
                    }
                    if(item.description){
                        div.innerHTML = '<span style="color: ' + self.getRarityColor(item.rarity) + '">' + itemName + '</span><br><div style="font-size: 11px">' + description + item.description + '<br>' + enchantDisplayName + '</div>';
                    }
                    else{
                        div.innerHTML = '<span style="color: ' + self.getRarityColor(item.rarity) + '">' + itemName + '</span><br><div style="font-size: 11px">' + description + enchantDisplayName + '</div>';
                    }
                    div.className = 'itemMenu UI-display-light inventoryMenu';
                    div.style.left = (mouseX + WIDTH / 2 + 3) + 'px';
                    div.style.top = (mouseY + HEIGHT / 2 + 3) + 'px';
                    gameDiv.appendChild(div);
                    image.onmouseover = function(){
                        if(self.draggingItem === -1){
                            var itemMenu = document.getElementsByClassName('itemMenu');
                            for(var i = 0;i < itemMenu.length;i++){
                                itemMenu[i].style.display = 'none';
                            }
                            div.style.display = 'inline-block';
                            div.style.left = (mouseX + WIDTH / 2 + 3) + 'px';
                            div.style.top = (mouseY + HEIGHT / 2 + 3) + 'px';
                        }
                    }
                    image.onmouseout = function(){
                        div.style.display = 'none';
                    }
                    div.onmouseover = function(){
                        if(self.draggingItem === -1){
                            var itemMenu = document.getElementsByClassName('itemMenu');
                            for(var i = 0;i < itemMenu.length;i++){
                                itemMenu[i].style.display = 'none';
                            }
                            div.style.display = 'inline-block';
                            div.style.left = (mouseX + WIDTH / 2 + 3) + 'px';
                            div.style.top = (mouseY + HEIGHT / 2 + 3) + 'px';
                        }
                    }
                    div.onmouseout = function(){
                        div.style.display = 'none';
                    }
                    image.draggable = false;
                    slot.onmousedown = function(e){
                        if(e.button === 0){
                            self.draggingItem = index;
                            var rect = image.getBoundingClientRect();
                            self.draggingX = mouseX + WIDTH / 2 - rect.left + 3;
                            self.draggingY = mouseY + HEIGHT / 2 - rect.top + 3;
                            var itemMenu = document.getElementsByClassName('itemMenu');
                            for(var i = 0;i < itemMenu.length;i++){
                                itemMenu[i].style.display = 'none';
                            }
                            slot.innerHTML = "";
                            document.getElementById('draggingItem').innerHTML = "<image class='itemImage' draggable=false src='/client/img/" + self.items[index].id + ".png'></image>";
                            document.getElementById('draggingItem').style.left = (rect.left - 3) + 'px';
                            document.getElementById('draggingItem').style.top = (rect.top - 3) + 'px';
                        }
                        else if(e.button === 2){
                            if(item.equip === 'consume'){
                                socket.emit('useItem',index);
                            }
                            else{
                                socket.emit('dragItem',{
                                    index1:index,
                                    index2:item.equip,
                                });
                            }
                        }
                    }
                }
            }
            else if(self.equips[index]){
                if(self.equips[index].id){
                    var item = Item.list[self.equips[index].id];
                    var div = document.createElement('div');
                    slot.innerHTML = "<image id='itemImage" + index + "' class='itemImage' src='/client/img/" + self.equips[index].id + ".png'></image>";
                    var enchantDisplayName = '';
                    for(var i in self.equips[index].enchantments){
                        if(enchantDisplayName === ''){
                            enchantDisplayName = 'Enchantments:<br>';
                        }
                        enchantDisplayName += '+';
                        enchantDisplayName += (Math.round(self.equips[index].enchantments[i].level * 1000) / 10) + '% ' + Enchantment.list[self.equips[index].enchantments[i].id].name + '<br>';
                    }
                    var description = '';
                    if(item.damage || item.defense){
                        description += 'When Equipped:<br>';
                    }
                    if(item.damage){
                        if(item.damageType){
                            description += '<span style="color: #33ee33">+' + item.damage + ' ' + item.damageType + ' damage.</span><br>';
                        }
                        if(item.critChance){
                            description += '<span style="color: #33ee33">+' + item.critChance * 100 + '% critical strike chance.</span><br>';
                        }
                    }
                    if(item.defense){
                        description += '<span style="color: #33ee33">+' + item.defense + ' defense.</span><br>';
                    }
                    if(item.damageReduction){
                        description += '<span style="color: #33ee33">+' + item.damageReduction * 100 + '% damage reduction.</span><br>';
                    }
                    if(item.manaCost){
                        description += 'Uses ' + item.manaCost + ' mana.<br>';
                    }
                    if(item.knockback !== undefined){
                        description += self.getKnockback(item.knockback) + '<br>';
                    }
                    var itemName = item.name;
                    if(self.equips[index].stack !== 1){
                        itemName += ' (' + self.equips[index].stack + ')';
                    }
                    if(item.description){
                        div.innerHTML = '<span style="color: ' + self.getRarityColor(item.rarity) + '">' + itemName + '</span><br><div style="font-size: 11px">' + description + item.description + '<br>' + enchantDisplayName + '</div>';
                    }
                    else{
                        div.innerHTML = '<span style="color: ' + self.getRarityColor(item.rarity) + '">' + itemName + '</span><br><div style="font-size: 11px">' + description + enchantDisplayName + '</div>';
                    }
                    div.className = 'itemMenu UI-display-light inventoryMenu';
                    div.style.left = (mouseX + WIDTH / 2 + 3) + 'px';
                    div.style.top = (mouseY + HEIGHT / 2 + 3) + 'px';
                    gameDiv.appendChild(div);
                    var image = document.getElementById('itemImage' + index);
                    image.onmouseover = function(){
                        if(self.draggingItem === -1){
                            var itemMenu = document.getElementsByClassName('itemMenu');
                            for(var i = 0;i < itemMenu.length;i++){
                                itemMenu[i].style.display = 'none';
                            }
                            div.style.display = 'inline-block';
                            div.style.left = (mouseX + WIDTH / 2 + 3) + 'px';
                            div.style.top = (mouseY + HEIGHT / 2 + 3) + 'px';
                        }
                    }
                    image.onmouseout = function(){
                        div.style.display = 'none';
                    }
                    div.onmouseover = function(){
                        if(self.draggingItem === -1){
                            var itemMenu = document.getElementsByClassName('itemMenu');
                            for(var i = 0;i < itemMenu.length;i++){
                                itemMenu[i].style.display = 'none';
                            }
                            div.style.display = 'inline-block';
                            div.style.left = (mouseX + WIDTH / 2 + 3) + 'px';
                            div.style.top = (mouseY + HEIGHT / 2 + 3) + 'px';
                        }
                    }
                    div.onmouseout = function(){
                        div.style.display = 'none';
                    }
                    image.draggable = false;
                    slot.onmousedown = function(){
                        self.draggingItem = index;
                        var rect = image.getBoundingClientRect();
                        self.draggingX = mouseX + WIDTH / 2 - rect.left + 3;
                        self.draggingY = mouseY + HEIGHT / 2 - rect.top + 3;
                        var itemMenu = document.getElementsByClassName('itemMenu');
                        for(var i = 0;i < itemMenu.length;i++){
                            itemMenu[i].style.display = 'none';
                        }
                        slot.innerHTML = "<image class='outlineImage' src='/client/img/outline" + index + ".png'></image>";
                        document.getElementById('draggingItem').innerHTML = "<image class='itemImage' draggable=false src='/client/img/" + self.equips[index].id + ".png'></image>";
                        document.getElementById('draggingItem').style.left = (rect.left - 3) + 'px';
                        document.getElementById('draggingItem').style.top = (rect.top - 3) + 'px';
                    }
                }
                else{
                    slot.innerHTML = "<image class='outlineImage' src='/client/img/outline" + index + ".png'></image>";
                }
            }
        }
    }
    self.addShopClient = function(index){
        var slot = document.getElementById("shopSlot" + index);
        if(slot){
            slot.innerHTML = "";
            slot.style.border = "1px solid #000000";
            slot.onmousedown = function(){};
            slot.className += ' shopMenuSlot';
            if(self.shopItems.items[index]){
                if(self.shopItems.items[index].id){
                    var item = Item.list[self.shopItems.items[index].id];
                    var div = document.createElement('div');
                    slot.innerHTML = "<image id='shopImage" + index + "' class='itemImage' src='/client/img/" + self.shopItems.items[index].id + ".png'></image>";
                    var enchantDisplayName = '';
                    for(var i in self.shopItems.items[index].enchantments){
                        if(enchantDisplayName === ''){
                            enchantDisplayName = 'Enchantments:<br>';
                        }
                        enchantDisplayName += '+';
                        enchantDisplayName += (Math.round(self.shopItems.items[index].enchantments[i].level * 1000) / 10) + '% ' + Enchantment.list[self.shopItems.items[index].enchantments[i].id].name + '<br>';
                    }
                    var description = '';
                    if(item.damage || item.defense){
                        description += 'When Equipped:<br>';
                    }
                    if(item.damage){
                        if(item.damageType){
                            description += '<span style="color: #33ee33">+' + item.damage + ' ' + item.damageType + ' damage.</span><br>';
                        }
                        if(item.critChance){
                            description += '<span style="color: #33ee33">+' + item.critChance * 100 + '% critical strike chance.</span><br>';
                        }
                    }
                    if(item.defense){
                        description += '<span style="color: #33ee33">+' + item.defense + ' defense.</span><br>';
                    }
                    if(item.damageReduction){
                        description += '<span style="color: #33ee33">+' + item.damageReduction * 100 + '% damage reduction.</span><br>';
                    }
                    if(item.manaCost){
                        description += 'Uses ' + item.manaCost + ' mana.<br>';
                    }
                    if(item.knockback !== undefined){
                        description += self.getKnockback(item.knockback) + '<br>';
                    }
                    var image = document.getElementById('shopImage' + index);
                    var itemName = item.name;
                    if(self.shopItems.items[index].stack !== 1){
                        itemName += ' (' + self.shopItems.items[index].stack + ')';
                    }
                    if(item.description){
                        div.innerHTML = '<span style="color: ' + self.getRarityColor(item.rarity) + '">' + itemName + '</span><br><div style="font-size: 11px">' + description + item.description + '<br>' + enchantDisplayName + '</div><br>Buy for ' + Math.floor(self.shopItems.prices[index] / 10000) + '<image class="coinShopImage" src="/client/img/goldcoin.png"></image>' + Math.floor(self.shopItems.prices[index] / 100) % 100 + '<image class="coinShopImage" src="/client/img/silvercoin.png"></image>' + self.shopItems.prices[index] % 100 + '<image class="coinShopImage" src="/client/img/bronzecoin.png"></image>.';
                    }
                    else{
                        div.innerHTML = '<span style="color: ' + self.getRarityColor(item.rarity) + '">' + itemName + '</span><br><div style="font-size: 11px">' + description + enchantDisplayName + '</div><br>Buy for ' + Math.floor(self.shopItems.prices[index] / 10000) + '<image class="coinShopImage" src="/client/img/goldcoin.png"></image>' + Math.floor(self.shopItems.prices[index] / 100) % 100 + '<image class="coinShopImage" src="/client/img/silvercoin.png"></image>' + self.shopItems.prices[index] % 100 + '<image class="coinShopImage" src="/client/img/bronzecoin.png"></image>.';
                    }
                    div.className = 'itemMenu UI-display-light shopMenu';
                    div.style.left = (mouseX + WIDTH / 2 + 3) + 'px';
                    div.style.top = (mouseY + HEIGHT / 2 + 3) + 'px';
                    gameDiv.appendChild(div);
                    image.onmouseover = function(){
                        if(self.draggingItem === -1){
                            div.style.display = 'inline-block';
                            div.style.left = (mouseX + WIDTH / 2 + 3) + 'px';
                            div.style.top = (mouseY + HEIGHT / 2 + 3) + 'px';
                        }
                    }
                    image.onmouseout = function(){
                        div.style.display = 'none';
                    }
                    div.onmouseover = function(){
                        if(self.draggingItem === -1){
                            div.style.display = 'inline-block';
                            div.style.left = (mouseX + WIDTH / 2 + 3) + 'px';
                            div.style.top = (mouseY + HEIGHT / 2 + 3) + 'px';
                        }
                    }
                    div.onmouseout = function(){
                        div.style.display = 'none';
                    }
                    image.draggable = false;
                    image.onmousedown = function(e){
                        if(e.button === 0){
                            socket.emit('buyItem',index);
                        }
                    }
                }
            }
        }
    }
    self.addCraftClient = function(index){
        var slot = document.getElementById("craftSlot" + index);
        if(slot){
            slot.innerHTML = "";
            slot.style.border = "1px solid #000000";
            slot.onmousedown = function(){};
            slot.className += ' craftMenuSlot';
            if(self.craftItems.items[index]){
                if(self.craftItems.items[index].id){
                    var item = Item.list[self.craftItems.items[index].id];
                    var div = document.createElement('div');
                    slot.innerHTML = "<image id='craftImage" + index + "' class='itemImage' src='/client/img/" + self.craftItems.items[index].id + ".png'></image>";
                    var enchantDisplayName = '';
                    for(var i in self.craftItems.items[index].enchantments){
                        if(enchantDisplayName === ''){
                            enchantDisplayName = 'Enchantments:<br>';
                        }
                        enchantDisplayName += '+';
                        enchantDisplayName += (Math.round(self.craftItems.items[index].enchantments[i].level * 1000) / 10) + '% ' + Enchantment.list[self.craftItems.items[index].enchantments[i].id].name + '<br>';
                    }
                    var description = '';
                    if(item.damage || item.defense){
                        description += 'When Equipped:<br>';
                    }
                    if(item.damage){
                        if(item.damageType){
                            description += '<span style="color: #33ee33">+' + item.damage + ' ' + item.damageType + ' damage.</span><br>';
                        }
                        if(item.critChance){
                            description += '<span style="color: #33ee33">+' + item.critChance * 100 + '% critical strike chance.</span><br>';
                        }
                    }
                    if(item.defense){
                        description += '<span style="color: #33ee33">+' + item.defense + ' defense.</span><br>';
                    }
                    if(item.damageReduction){
                        description += '<span style="color: #33ee33">+' + item.damageReduction * 100 + '% damage reduction.</span><br>';
                    }
                    if(item.manaCost){
                        description += 'Uses ' + item.manaCost + ' mana.<br>';
                    }
                    if(item.knockback !== undefined){
                        description += self.getKnockback(item.knockback) + '<br>';
                    }
                    var image = document.getElementById('craftImage' + index);
                    var itemName = item.name;
                    if(self.craftItems.items[index].stack !== 1){
                        itemName += ' (' + self.craftItems.items[index].stack + ')';
                    }
                    var craftMaterials = '';
                    for(var i in self.craftItems.materials[index]){
                        craftMaterials += " " + self.craftItems.materials[index][i].amount + '<image class="coinShopImage" src="/client/img/' + self.craftItems.materials[index][i].id + '.png"></image>';
                    }
                    if(item.description){
                        div.innerHTML = '<span style="color: ' + self.getRarityColor(item.rarity) + '">' + itemName + '</span><br><div style="font-size: 11px">' + description + item.description + '<br>' + enchantDisplayName + '</div><br>Craft for ' + craftMaterials + '.';
                    }
                    else{
                        div.innerHTML = '<span style="color: ' + self.getRarityColor(item.rarity) + '">' + itemName + '</span><br><div style="font-size: 11px">' + description + enchantDisplayName + '</div><br>Craft for ' + craftMaterials + '.';
                    }
                    div.className = 'itemMenu UI-display-light craftMenu';
                    div.style.left = (mouseX + WIDTH / 2 + 3) + 'px';
                    div.style.top = (mouseY + HEIGHT / 2 + 3) + 'px';
                    gameDiv.appendChild(div);
                    image.onmouseover = function(){
                        if(self.draggingItem === -1){
                            div.style.display = 'inline-block';
                            div.style.left = (mouseX + WIDTH / 2 + 3) + 'px';
                            div.style.top = (mouseY + HEIGHT / 2 + 3) + 'px';
                        }
                    }
                    image.onmouseout = function(){
                        div.style.display = 'none';
                    }
                    div.onmouseover = function(){
                        if(self.draggingItem === -1){
                            div.style.display = 'inline-block';
                            div.style.left = (mouseX + WIDTH / 2 + 3) + 'px';
                            div.style.top = (mouseY + HEIGHT / 2 + 3) + 'px';
                        }
                    }
                    div.onmouseout = function(){
                        div.style.display = 'none';
                    }
                    image.draggable = false;
                    image.onmousedown = function(e){
                        if(e.button === 0){
                            socket.emit('craftItem',index);
                        }
                    }
                }
            }
        }
    }
    self.refreshItem = function(index){
        if(self.server){
            if(self.socket !== undefined){
                if(self.items[index]){
                    self.socket.emit('updateItem',{items:self.items,index:index});
                }
                else{
                    self.socket.emit('updateEquip',{equips:self.equips,index:index});
                }
            }
            return;
        }
        self.addItemClient(index);
    }
    self.refreshShop = function(){
        if(self.server){
            if(self.socket !== undefined){
                self.socket.emit('updateShop',{shopItems:self.shopItems});
            }
            return;
        }
        var shop = document.getElementById("shopItem");
        shop.innerHTML = "";
        var row = document.createElement('div');
        for(var i = 0;i < self.shopItems.items.length;i++){
            if(i % 4 === 0){
                var row = document.createElement('div');
                row.className = 'inventoryRow';
                shop.appendChild(row);
            }
            var div = document.createElement('div');
            div.id = 'shopSlot' + i;
            div.className = 'inventorySlot';
            row.appendChild(div);
        }
        for(var i in self.shopItems.items){
            self.addShopClient(i);
        }
    }
    self.refreshCraft = function(){
        if(self.server){
            if(self.socket !== undefined){
                self.socket.emit('updateCraft',{craftItems:self.craftItems});
            }
            return;
        }
        var craft = document.getElementById("craftItem");
        craft.innerHTML = "";
        var row = document.createElement('div');
        for(var i = 0;i < self.craftItems.items.length;i++){
            if(i % 4 === 0){
                var row = document.createElement('div');
                row.className = 'inventoryRow';
                craft.appendChild(row);
            }
            var div = document.createElement('div');
            div.id = 'craftSlot' + i;
            div.className = 'inventorySlot';
            row.appendChild(div);
        }
        for(var i in self.craftItems.items){
            self.addCraftClient(i);
        }
    }
    self.refreshMenu = function(){
        if(server === false){
            var inventory = document.getElementById("inventoryItem");
            inventory.innerHTML = "";
            var row = document.createElement('div');
            for(var i = 0;i < self.maxSlots;i++){
                if(i % 4 === 0){
                    var row = document.createElement('div');
                    row.className = 'inventoryRow';
                    inventory.appendChild(row);
                }
                var div = document.createElement('div');
                div.id = 'inventorySlot' + i;
                div.className = 'inventorySlot';
                row.appendChild(div);
            }
            var div = document.createElement('div');
            div.id = 'draggingItem';
            div.draggable = false;
            gameDiv.appendChild(div);
            var inventoryEquip = document.getElementById("inventoryEquip");
            inventoryEquip.innerHTML = "";
            var addSlot = function(i){
                var div = document.createElement('div');
                div.id = 'inventorySlot' + i;
                div.className = 'inventorySlot';
                inventoryEquip.appendChild(div);
            }
            addSlot('weapon');
            addSlot('weapon2');
            addSlot('helmet');
            addSlot('armor');
            addSlot('boots');
            addSlot('offhand');
            addSlot('scroll');
            addSlot('key');
            addSlot('crystal');
        }
        else{
            socket.emit('refreshMenu',self.maxSlots);
        }
        while(self.items.length < self.maxSlots){
            self.items.push({});
        }
        for(var i = 0;i < self.maxSlots;i++){
            self.refreshItem(i);
        }
        for(var i in self.equips){
            self.refreshItem(i);
        }
    }
    self.refreshMenu();
    if(self.server && self.socket){
        self.socket.on("dragItem",function(data){
            try{
                if(data.index2 === 'drop'){
                    var index1 = data.index1;
                    if(self.items[index1]){
                        var item1 = self.items[index1];
                        new DroppedItem({
                            id:socket.id,
                            item:item1,
                            amount:item1.stack,
                            x:Player.list[socket.id].x,
                            y:Player.list[socket.id].y,
                            map:Player.list[socket.id].map,
                            leftPlayer:false,
                            allPlayers:true,
                        });
                        self.items[index1] = {};
                    }
                    else{
                        var item1 = self.equips[index1];
                        new DroppedItem({
                            id:socket.id,
                            item:item1,
                            amount:item1.stack,
                            x:Player.list[socket.id].x,
                            y:Player.list[socket.id].y,
                            map:Player.list[socket.id].map,
                            leftPlayer:false,
                            allPlayers:true,
                        });
                        self.equips[index1] = {};
                    }
                    self.refreshItem(index1);
                }
                else{
                    var index1 = data.index1;
                    var index2 = data.index2;
                    if(self.items[index1]){
                        if(self.items[index1].id === 'enchantmentbook' && index1 !== index2){
                            if(self.items[index2].id){
                                for(var i in self.items[index1].enchantments){
                                    self.enchantItem(index2,self.items[index1].enchantments[i].id,self.items[index1].enchantments[i].level);
                                }
                                self.items[index1] = {};
                                self.refreshItem(index1);
                                self.refreshItem(index2);
                                return;
                            }
                            else if(self.equips[index2]){
                                if(self.equips[index2].id){
                                    for(var i in self.items[index1].enchantments){
                                        self.enchantItem(index2,self.items[index1].enchantments[i].id,self.items[index1].enchantments[i].level);
                                    }
                                    self.items[index1] = {};
                                    self.refreshItem(index1);
                                    self.refreshItem(index2);
                                    return;
                                }
                            }
                        }
                    }
                    if(self.items[index1] && self.items[index2]){
                        var item1 = self.items[index1];
                        var item2 = self.items[index2];
                        self.items[index1] = item2;
                        self.items[index2] = item1;
                        self.refreshItem(index1);
                        self.refreshItem(index2);
                    }
                    else if(self.items[index1]){
                        var item1 = self.items[index1];
                        var item2 = self.equips[index2];
                        if(item1.id){
                            if(Item.list[item1.id].equip === index2 || Item.list[item1.id].equip + '2' === index2){
                                self.items[index1] = item2;
                                self.equips[index2] = item1;
                                self.refreshItem(index2);
                                self.refresh = true;
                            }
                        }
                        else{
                            self.items[index1] = item2;
                            self.equips[index2] = item1;
                            self.refreshItem(index2);
                            self.refresh = true;
                        }
                        self.refreshItem(index1);
                    }
                    else if(self.items[index2]){
                        var item1 = self.equips[index1];
                        var item2 = self.items[index2];
                        if(item2.id){
                            if(Item.list[item2.id].equip === index1 || Item.list[item2.id].equip + '2' === index1){
                                self.equips[index1] = item2;
                                self.items[index2] = item1;
                                self.refreshItem(index2);
                                self.refresh = true;
                            }
                        }
                        else{
                            self.equips[index1] = item2;
                            self.items[index2] = item1;
                            self.refreshItem(index2);
                            self.refresh = true;
                        }
                        self.refreshItem(index1);
                    }
                    else{
                        var item1 = self.equips[index1];
                        var item2 = self.equips[index2];
                        if(Item.list[item2.id].equip === index1 || Item.list[item2.id].equip + '2' === index1){
                            if(Item.list[item1.id].equip === index2 || Item.list[item1.id].equip + '2' === index2){
                                self.equips[index1] = item2;
                                self.equips[index2] = item1;
                                self.refreshItem(index2);
                                self.refresh = true;
                            }
                        }
                        self.refreshItem(index1);
                    }
                }
            }
            catch(err){
                console.error(err);
            }
        });
        self.socket.on("useItem",function(data){
            try{
                Player.list[socket.id].useItem(Item.list[self.items[data].id].event,data);
            }
            catch(err){
                console.error(err);
            }
        });
        self.socket.on("buyItem",function(data){
            try{
                if(self.shopItems.prices[data] > Player.list[socket.id].coins){
                    Player.list[socket.id].sendNotification('[!] You do not have enough money to buy ' + Item.list[self.shopItems.items[data].id].name + ' x' + self.shopItems.items[data].stack + '.');
                    return;
                }
                self.addItem(self.shopItems.items[data].id,self.shopItems.items[data].stack,self.shopItems.items[data].enchantments);
                Player.list[socket.id].coins -= self.shopItems.prices[data];
                Player.list[socket.id].sendNotification('You successfully bought ' + Item.list[self.shopItems.items[data].id].name + ' x' + self.shopItems.items[data].stack + '.');
            }
            catch(err){
                console.error(err);
            }
        });
        self.socket.on("craftItem",function(data){
            try{
                for(var i in self.craftItems.materials[data]){
                    if(!self.hasItem(self.craftItems.materials[data][i].id,self.craftItems.materials[data][i].amount)){
                        Player.list[socket.id].sendNotification('[!] You do not have the required materials to craft ' + Item.list[self.craftItems.items[data].id].name + ' x' + self.craftItems.items[data].stack + '.');
                        return;
                    }
                }
                self.addItem(self.craftItems.items[data].id,self.craftItems.items[data].stack,self.craftItems.items[data].enchantments);
                for(var i in self.craftItems.materials[data]){
                    self.removeItem(self.craftItems.materials[data][i].id,self.craftItems.materials[data][i].amount);
                }
                Player.list[socket.id].sendNotification('You successfully crafted ' + Item.list[self.craftItems.items[data].id].name + ' x' + self.craftItems.items[data].stack + '.');
            }
            catch(err){
                console.error(err);
            }
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

Item = function(id,name,equip,event,enchantments,description,damage,damageType,critChance,useTime,defense,damageReduction,manaCost,knockback,rarity,maxStack){
	var self = {
		id:id,
        name:name,
        equip:equip,
        event:event,
        enchantments:enchantments,
        description:description,
        damage:damage,
        damageType:damageType,
        critChance:critChance,
        useTime:useTime,
        defense:defense,
        damageReduction,damageReduction,
        manaCost,manaCost,
        knockback,knockback,
        rarity:rarity,
        maxStack:maxStack,
    }
	Item.list[self.id] = self;
	return self;
}
Item.list = {};

try{
    var items = require('./item.json');
    for(var i in items){
        Item(i,items[i].name,items[i].equip,items[i].event,items[i].enchantments,items[i].description,items[i].damage,items[i].damageType,items[i].critChance,items[i].useTime,items[i].defense,items[i].damageReduction,items[i].manaCost,items[i].knockback,items[i].rarity,items[i].maxStack);
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
                Item(i,items[i].name,items[i].equip,items[i].event,items[i].enchantments,items[i].description,items[i].damage,items[i].damageType,items[i].critChance,items[i].useTime,items[i].defense,items[i].damageReduction,items[i].manaCost,items[i].knockback,items[i].rarity,items[i].maxStack);
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