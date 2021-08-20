/*if(navigator.userAgent.search(/gecko/i) > 0){
    alert("The game only supports firefox if OffscreenCanvas is enabled in settings. To learn more, go to: https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas/OffscreenCanvas");
}*/
var isFirefox = typeof InstallTrigger !== 'undefined';
if(isFirefox === true) {
    alert('This game uses OffscreenCanvas, which is not supported in Firefox.');
}

window.onerror = function(error){
    //window.location.reload();
    var scroll = false;
    if(chatText.scrollTop + chatText.clientHeight >= chatText.scrollHeight - 5){
        scroll = true;
    }
    var d = new Date();
    var m = '' + d.getMinutes();
    if(m.length === 1){
        m = '' + 0 + m;
    }
    if(m === '0'){
        m = '00';
    }
    chat += '<div class="text" style="color: #ff0000">[' + d.getHours() + ":" + m + "] An error occurred. <br>STOP CODE: " + error + '</div>';
    chatText.innerHTML = chat;
    if(scroll){
        chatText.scrollTop = chatText.scrollHeight;
    }
}

var WIDTH = window.innerWidth;
var HEIGHT = window.innerHeight;

var cameraX = 0;
var cameraY = 0;

var audioTense = document.getElementById('audioTense');
var audioCalm = document.getElementById('audioCalm');

var VERSION = '031f2a';

var DEBUG = false;

var socket = io({
    reconnection:false,
});
socket.on('connect_error',function(){
    setTimeout(function(){
        socket.connect();
    },1000);
});
socket.on('disconnect',function(){
    setTimeout(function(){
        socket.connect();
    },1000);
});

var gameDiv = document.getElementById('gameDiv');
var loadingDiv = document.getElementById('loadingDiv');
var pageDiv = document.getElementById('pageDiv');
var disconnectedDiv = document.getElementById('disconnected');
var spectatorDiv = document.getElementById('spectator');
var ctx0Raw = document.getElementById('ctx0');
var ctx1Raw = document.getElementById('ctx1');
var map0Raw = document.getElementById('map0');
var map1Raw = document.getElementById('map1');
var worldMapButton = document.getElementById('worldMapButton');
var blackShade = document.getElementById('blackShade');
var healthBarText = document.getElementById('healthBarText');
var healthBarValue = document.getElementById('healthBarValue');
var xpBarText = document.getElementById('xpBarText');
var xpBarValue = document.getElementById('xpBarValue');
var manaBarText = document.getElementById('manaBarText');
var manaBarValue = document.getElementById('manaBarValue');
var interactMenu = document.getElementById('interactMenu');
var signDivUsername = document.getElementById('username');
var signDivPassword = document.getElementById('password');
var signDivSignIn = document.getElementById('signIn');
var signDivCreateAccount = document.getElementById('createAccount');
var signDivDeleteAccount = document.getElementById('deleteAccount');
var signDivChangePassword = document.getElementById('changePassword');

var commandList = [];
var commandIndex = 0;

gameDiv.style.display = 'none';
disconnectedDiv.style.display = 'none';
spectatorDiv.style.display = 'none';
pageDiv.style.display = 'inline-block';
pageDiv.style.width = window.innerWidth + 'px';
pageDiv.style.height = window.innerHeight + 'px';

var respawnTimer = 0;

var loading = false;
var loadingProgress = 0;
var loadingProgressDisplay = 0;

var canSignIn = true;
var changePasswordState = 0;
var deletePasswordState = 0;
var loadedMap = {};
var waypoints = [];
var maps = {};
var world;
var tileset = new Image();
tileset.src = '/client/maps/roguelikeSheet.png';
var tilesetLoaded = false;
tileset.onload = function(){
    tilesetLoaded = true;
    loadingProgress += 1;
};

var lightList = [];
var entityLightList = {};
var projectileData = {};
var questData = {};
var renderLayers = function(json,name){
    if(isFirefox){
        var tempLower = document.createElement('canvas');
        var tempUpper = document.createElement('canvas');
        var tempHighest = document.createElement('canvas');
        tempLower.canvas.width = json.layers[0].width * 64;
        tempLower.canvas.height = json.layers[0].height * 64;
        tempUpper.canvas.width = json.layers[0].width * 64;
        tempUpper.canvas.height = json.layers[0].height * 64;
        tempHighest.canvas.width = json.layers[0].width * 64;
        tempHighest.canvas.height = json.layers[0].height * 64;
    }
    else{
        var tempLower = new OffscreenCanvas(json.layers[0].width * 64,json.layers[0].height * 64);
        var tempUpper = new OffscreenCanvas(json.layers[0].width * 64,json.layers[0].height * 64);
        var tempHighest = new OffscreenCanvas(json.layers[0].width * 64,json.layers[0].height * 64);
    }
    var glLower = tempLower.getContext('2d');
    var glUpper = tempUpper.getContext('2d');
    var glHighest = tempHighest.getContext('2d');
    resetCanvas(glLower);
    resetCanvas(glUpper);
    resetCanvas(glHighest);
    var tile = {
        "columns":86,
        "firstgid":1,
        "image":"roguelikeSheet.png",
        "imageheight":1138,
        "imagewidth":1461,
        "margin":0,
        "name":"roguelikeSheet",
        "spacing":1,
    };
    mapTiles[name] = {
        tile:tile,
        width:json.layers[0].width,
    };
    for(var i = 0;i < json.layers.length;i++){
        if(json.layers[i].type === "tilelayer" && json.layers[i].visible){
            var size = json.tilewidth;
            for(var j = 0;j < json.layers[i].data.length;j++){
                tile_idx = json.layers[i].data[j];
                if(tile_idx !== 0){
                    var img_x, img_y, s_x, s_y;
                    tile_idx -= 1;
                    img_x = (tile_idx % ((tile.imagewidth + tile.spacing) / (size + tile.spacing))) * (size + tile.spacing);
                    img_y = ~~(tile_idx / ((tile.imagewidth + tile.spacing) / (size + tile.spacing))) * (size + tile.spacing);
                    s_x = (j % json.layers[i].width) * size;
                    s_y = ~~(j / json.layers[i].width) * size;
                    if(json.layers[i].offsetx){
                        s_x += json.layers[i].offsetx;
                    }
                    if(json.layers[i].offsety){
                        s_y += json.layers[i].offsety;
                    }
                    if(json.layers[i].name === 'Above0' || json.layers[i].name === 'Above1' || json.layers[i].name === 'Above2'){
                        glUpper.drawImage(tileset,Math.round(img_x),Math.round(img_y),size,size,Math.round(s_x * 4),Math.round(s_y * 4),64,64);
                    }
                    else if(json.layers[i].name === 'Highest1' || json.layers[i].name === 'Highest2'){
                        glHighest.drawImage(tileset,Math.round(img_x),Math.round(img_y),size,size,Math.round(s_x * 4),Math.round(s_y * 4),64,64);
                    }
                    else{
                        glLower.drawImage(tileset,Math.round(img_x),Math.round(img_y),size,size,Math.round(s_x * 4),Math.round(s_y * 4),64,64);
                    }
                }
            }
        }
        else if(json.layers[i].type === "tilelayer" && json.layers[i].name.includes('Npc')){
            var size = json.tilewidth;
            for(var j = 0;j < json.layers[i].data.length;j++){
                tile_idx = json.layers[i].data[j];
                if(tile_idx !== 0){
                    if(tile_idx === 1950){
                        var type = "";
                        var typej = 0;
                        var id = "";
                        var idj = 0;
                        var npcName = "";
                        for(var k = 0;k < json.layers[i].name.length;k++){
                            if(json.layers[i].name[k] === ':'){
                                if(type === ""){
                                    type = json.layers[i].name.substr(0,k);
                                    typej = k;
                                }
                                else if(id === ""){
                                    id = json.layers[i].name.substr(typej + 1,k - typej - 1);
                                    idj = k;
                                }
                                else if(npcName === ""){
                                    npcName = json.layers[i].name.substr(idj + 1,json.layers[i].name.length - idj - 2);
                                }
                            }
                        }
                        s_x = (j % json.layers[i].width) * size;
                        s_y = ~~(j / json.layers[i].width) * size;
                        waypoints.push({
                            id:'quest',
                            x:Math.round(s_x * 4),
                            y:Math.round(s_y * 4),
                            map:name,
                            info:npcName,
                        });
                    }
                    loadingProgress += 1;
                }
            }
        }
        else if(json.layers[i].type === "tilelayer" && json.layers[i].name.includes('NpcMarker')){
            var size = json.tilewidth;
            for(var j = 0;j < json.layers[i].data.length;j++){
                tile_idx = json.layers[i].data[j];
                if(tile_idx !== 0){
                    if(tile_idx === 1950){
                        var type = "";
                        var typej = 0;
                        var id = "";
                        var idj = 0;
                        var npcName = "";
                        for(var k = 0;k < json.layers[i].name.length;k++){
                            if(json.layers[i].name[k] === ':'){
                                if(type === ""){
                                    type = json.layers[i].name.substr(0,k);
                                    typej = k;
                                }
                                else if(id === ""){
                                    id = json.layers[i].name.substr(typej + 1,k - typej - 1);
                                    idj = k;
                                }
                                else if(npcName === ""){
                                    npcName = json.layers[i].name.substr(idj + 1,json.layers[i].name.length - idj - 2);
                                }
                            }
                        }
                        s_x = (j % json.layers[i].width) * size;
                        s_y = ~~(j / json.layers[i].width) * size;
                        waypoints.push({
                            id:'quest',
                            x:Math.round(s_x * 4),
                            y:Math.round(s_y * 4),
                            map:name,
                            info:npcName,
                        });
                    }
                    loadingProgress += 1;
                }
            }
        }
        else if(json.layers[i].type === "tilelayer" && json.layers[i].name.includes('LightMarker')){
            var size = json.tilewidth;
            for(var j = 0;j < json.layers[i].data.length;j++){
                tile_idx = json.layers[i].data[j];
                if(tile_idx !== 0){
                    if(tile_idx === 2648){
                        var type = "";
                        var typej = 0;
                        var r = "";
                        var rj = 0;
                        var g = "";
                        var gj = 0;
                        var b = "";
                        var bj = 0;
                        var a = "";
                        var aj = 0;
                        var radius = "";
                        for(var k = 0;k < json.layers[i].name.length;k++){
                            if(json.layers[i].name[k] === ':'){
                                if(type === ""){
                                    type = json.layers[i].name.substr(0,k);
                                    typej = k;
                                }
                                else if(r === ""){
                                    r = json.layers[i].name.substr(typej + 1,k - typej - 1);
                                    rj = k;
                                }
                                else if(g === ""){
                                    g = json.layers[i].name.substr(rj + 1,k - rj - 1);
                                    gj = k;
                                }
                                else if(b === ""){
                                    b = json.layers[i].name.substr(gj + 1,k - gj - 1);
                                    bj = k;
                                }
                                else if(a === ""){
                                    a = json.layers[i].name.substr(bj + 1,k - bj - 1);
                                    aj = k;
                                }
                                else if(radius === ""){
                                    radius = json.layers[i].name.substr(aj + 1,json.layers[i].name.length - aj - 2);
                                }
                            }
                        }
                        s_x = (j % json.layers[i].width) * size;
                        s_y = ~~(j / json.layers[i].width) * size;
                        lightList.push({
                            x:Math.round(s_x * 4),
                            y:Math.round(s_y * 4),
                            map:name,
                            r:r,
                            g:g,
                            b:b,
                            a:a,
                            radius:parseInt(radius),
                        });
                    }
                    loadingProgress += 1;
                }
            }
        }
        loadingProgress += 1;
    }
    loadedMap[name] = {
        lower:tempLower,
        upper:tempUpper,
        highest:tempHighest,
    }
    loadingProgress += 1;
}
var loadTileset = function(json,name){
    if(tilesetLoaded){
        renderLayers(json,name);
    }
    else{
        setTimeout(function(){
            loadTileset(json,name);
        },10);
    }
}
var loadMap = function(name){
    var request = new XMLHttpRequest();
    request.open('GET',"/client/maps/" + name + ".json",true);
    request.onload = function(){
        if(this.status >= 200 && this.status < 400){
            // Success!
            var json = JSON.parse(this.response);
            maps[name] = json.backgroundcolor;
            tempMap[name] = [];
            loadTileset(json,name);
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
socket.on('loadMap',function(data){
    world = data;
    loadingProgress += 1;
});

var request = new XMLHttpRequest();
request.open('GET',"/client/quest.json",true);
request.onload = function(){
    if(this.status >= 200 && this.status < 400){
        var json = JSON.parse(this.response);
        questData = json;
        loadingProgress += 1;
    }
    else{

    }
};
request.onerror = function(){

};
request.send();

var username = '';
var password = '';
var signingIn = false;

signDivSignIn.onclick = function(){
    if(canSignIn){
        username = signDivUsername.value;
        password = signDivPassword.value;
        signingIn = true;
        canSignIn = false;
        setTimeout(() => {
            canSignIn = true;
        },2000);
        loadingDiv.style.display = 'inline-block';
        loading = true;
        loadingProgress = 0;
        loadingProgressDisplay = 0;
        document.getElementById('loadingBar').innerHTML = loadingProgressDisplay + ' / 814';
        document.getElementById('loadingProgress').style.width = loadingProgressDisplay / 814 * 100 + '%';
        disconnectedDiv.style.display = 'none';
        spectatorDiv.style.display = 'none';
        pageDiv.style.display = 'none';
        for(var i in world){
            loadMap(world[i].fileName.slice(0,-4));
        }
        loadMap('Town Hall');
        loadMap('Fishing Hut');
        loadMap('Tiny House');
        loadMap('Tiny House Upstairs');
        loadMap('House');
        loadMap('Town Cave');
        loadMap('The Arena');
        loadMap('The Guarded Citadel');
        loadMap('The Pet Arena');
        loadMap("Lilypad Temple Room 0");
        loadMap("Lilypad Temple Room 1");
        loadMap("Lilypad Temple Room 2");
        loadMap("Lilypad Castle");
        loadMap("Lilypad Castle Basement");
        loadMap("Lilypad Castle Upstairs");
        loadMap("Mysterious Room");
        loadMap("The Tutorial");
        loadMap("The Battlefield");
        loadMap("Garage");
        loadMap("Secret Tunnel Part 1");
        loadMap("Secret Tunnel Part 2");
        loadMap("The Hideout");
        loadMap("The Dripping Caverns");
        loadMap("Forest Dungeon Room 1");
        loadMap("Riverside Dungeon Room 1");
        
        var request = new XMLHttpRequest();
        request.open('GET',"/client/projectiles.json",true);
        request.onload = function(){
            if(this.status >= 200 && this.status < 400){
                // Success!
                var json = JSON.parse(this.response);
                for(var i in json){
                    Img[i] = new Image();
                    Img[i].src = '/client/img/' + i + '.png';
                    loadingProgress += 1;
                }
                projectileData = json;
            }
            else{
                // We reached our target server, but it returned an error
            }
        };
        request.onerror = function(){
            // There was a connection error of some sort
        };
        request.send();

        var request2 = new XMLHttpRequest();
        request2.open('GET',"/client/item.json",true);
        request2.onload = function(){
            if(this.status >= 200 && this.status < 400){
                // Success!
                var json = JSON.parse(this.response);
                for(var i in json){
                    Img[i] = new Image();
                    Img[i].src = '/client/img/' + i + '.png';
                    loadingProgress += 1;
                }
            }
            else{
                // We reached our target server, but it returned an error
            }
        };
        request2.onerror = function(){
            // There was a connection error of some sort
        };
        request2.send();
    }
}
signDivCreateAccount.onclick = function(){
    socket.emit('createAccount',{username:signDivUsername.value,password:signDivPassword.value});
}
signDivDeleteAccount.onclick = function(){
    if(deletePasswordState === 0){
        signDivDeleteAccount.innerHTML = 'Are you sure?';
        deletePasswordState = 1;
    }
    else{
        signDivDeleteAccount.innerHTML = 'Delete Account';
        socket.emit('deleteAccount',{username:signDivUsername.value,password:signDivPassword.value});
        deletePasswordState = 0;
    }
}
signDivChangePassword.onclick = function(){
    if(changePasswordState === 0){
        changePasswordState += 1;
        document.getElementById('newPassword-label').style.display = 'inline-block';
        document.getElementById('newPassword').style.display = 'inline-block';
    }
    else if(changePasswordState === 1){
        changePasswordState = 0;
        socket.emit('changePassword',{username:signDivUsername.value,password:signDivPassword.value,newPassword:document.getElementById('newPassword').value});
        document.getElementById('newPassword-label').style.display = 'none';
        document.getElementById('newPassword').style.display = 'none';
    }
}
socket.on('signInResponse',function(data){
    if(data.success === 3){
        document.getElementById('settingsPlayerName').innerHTML = data.username;
        //gameDiv.style.display = 'inline-block';
        //loadingDiv.style.display = 'none';
        disconnectedDiv.style.display = 'none';
        spectatorDiv.style.display = 'none';
        pageDiv.style.display = 'none';
    }
    else if(data.success === 2){
        alert("The account with username \'" + signDivUsername.value + "\' is already currently in game. The other account will be disconnected shortly. Please try to sign again.");
        pageDiv.style.display = 'inline-block';
        loadingDiv.style.display = 'none';
        disconnectedDiv.style.display = 'none';
        spectatorDiv.style.display = 'none';
        gameDiv.style.display = 'none';
        loading = false;
    }
    else if(data.success === 1){
        alert("Incorrect Password.");
        pageDiv.style.display = 'inline-block';
        loadingDiv.style.display = 'none';
        disconnectedDiv.style.display = 'none';
        spectatorDiv.style.display = 'none';
        gameDiv.style.display = 'none';
        loading = false;
    }
    else{
        alert("No account found with username \'" + signDivUsername.value + "\'.");
        pageDiv.style.display = 'inline-block';
        loadingDiv.style.display = 'none';
        loading = false;
        disconnectedDiv.style.display = 'none';
        spectatorDiv.style.display = 'none';
        gameDiv.style.display = 'none';
    }
});
socket.on('createAccountResponse',function(data){
    if(data.success === 1){
        alert("Account created with username \'" + signDivUsername.value + "\'.");
    }
    else if(data.success === 0){
        alert("Sorry, there is already an account with username \'" + signDivUsername.value + "\'.");
    }
    else if(data.success === 2){
        alert("Please use a username with 3+ characters.");
    }
    else if(data.success === 3){
        alert("Invalid characters.");
    }
    else if(data.success === 4){
        alert("Please use a shorter username / password.");
    }
});
socket.on('deleteAccountResponse',function(data){
    if(data.success === 3){
        alert("Deleted account created with username \'" + signDivUsername.value + "\'.");
    }
    else if(data.success === 2){
        alert("The account with username \'" + signDivUsername.value + "\' is currently in game. Disconnect this account to delete the account.");
    }
    else if(data.success === 1){
        alert("Incorrect Password.");
    }
    else{
        alert("No account found with username \'" + signDivUsername.value + "\'.");
    }
});
socket.on('changePasswordResponse',function(data){
    if(data.success === 3){
        alert("Changed password to \'" + document.getElementById('newPassword').value + "\'.");
    }
    else if(data.success === 2){
        alert("The account with username \'" + signDivUsername.value + "\' is currently in game. Disconnect this account to change the password.");
    }
    else if(data.success === 1){
        alert("Incorrect Password.");
    }
    else if(data.success === 4){
        alert("Invalid characters.");
    }
    else{
        alert("No account found with username \'" + signDivUsername.value + "\'.");
    }
    document.getElementById('newPassword').value = '';
});

var chatText = document.getElementById('chat-text');
var chatInput = document.getElementById('chat-input');
var chatForm = document.getElementById('chat-form');
var debugText = document.getElementById('debug-text');
var debugInput = document.getElementById('debug-input');
var debugForm = document.getElementById('debug-form');
var chat = '<div>Welcome to Meadow Guarders Open ' + VERSION + '!</div>';
var debug = '<div>Debug info will show up here.</div>'
chatText.innerHTML = '<div>Welcome to Meadow Guarders Open ' + VERSION + '!</div>';
var chatPress = false;
var inChat = false;

socket.on('addToChat',function(data){
    if(data.debug && !showDebugCommands){
        return;
    }
    var scroll = false;
    if(chatText.scrollTop + chatText.clientHeight >= chatText.scrollHeight - 5){
        scroll = true;
    }
    var d = new Date();
    var m = '' + d.getMinutes();
    if(m.length === 1){
        m = '' + 0 + m;
    }
    if(m === '0'){
        m = '00';
    }
    var message = data.message.replace(/</gi,'&lt;');
    message = message.replace(/>/gi,'&gt;');
    chat += '<div class="text"' + data.style + "[" + d.getHours() + ":" + m + "] " + message + '</div>';
    chatText.innerHTML = chat;
    if(scroll){
        chatText.scrollTop = chatText.scrollHeight;
    }
});
chatForm.onsubmit = function(e){
    e.preventDefault();
    socket.emit('sendMsgToServer',chatInput.value);
    chatInput.value = '';
}
socket.on('addToDebug',function(data){
    var scroll = false;
    if(debugText.scrollTop + debugText.clientHeight >= debugText.scrollHeight - 5){
        scroll = true;
    }
    debug += '<div class="text"' + data + '</div>';
    debugText.innerHTML = debug + '<br>';
    if(scroll){
        debugText.scrollTop = debugText.scrollHeight;
    }
});
debugForm.onsubmit = function(e){
    e.preventDefault();
    socket.emit('sendDebugToServer',debugInput.value);
    if(debugInput.value !== ''){
        commandList.push(debugInput.value);
        commandIndex = commandList.length - 1;
    }
    debugInput.value = '';
}
chatInput.onkeydown = function(e){
    chatPress = true;
}
chatInput.onmousedown = function(e){
    inChat = true;
    socket.emit('releaseAll');
}
debugInput.onkeydown = function(e){
    chatPress = true;
}
debugInput.onmousedown = function(e){
    inChat = true;
}


var disconnect = function(){
    socket.emit("timeout");
}
var ctx0 = document.getElementById("ctx0").getContext("2d");
var ctx1 = document.getElementById("ctx1").getContext("2d");
var map0 = document.getElementById("map0").getContext("2d");
var map1 = document.getElementById("map1").getContext("2d");
var settingsPlayerDisplay = document.getElementById("settingsPlayerDisplay").getContext("2d");
var worldMap = document.getElementById("worldMapCanvas").getContext("2d");
ctx0.canvas.width = window.innerWidth;
ctx0.canvas.height = window.innerHeight;
ctx1.canvas.width = window.innerWidth;
ctx1.canvas.height = window.innerHeight;
map0.canvas.width = window.innerWidth;
map0.canvas.height = window.innerHeight;
map1.canvas.width = window.innerWidth;
map1.canvas.height = window.innerHeight;
worldMap.canvas.width = 1510;
worldMap.canvas.height = 1130;
settingsPlayerDisplay.canvas.width = 10;
settingsPlayerDisplay.canvas.height = 17;
var resetCanvas = function(ctx){
    ctx.webkitImageSmoothingEnabled = false;
    ctx.filter = 'url(#remove-alpha)';
    ctx.imageSmoothingEnabled = false;
}
resetCanvas(ctx0);
resetCanvas(ctx1);
resetCanvas(map0);
resetCanvas(map1);
resetCanvas(worldMap);
resetCanvas(settingsPlayerDisplay);

var renderPlayer = function(img,shadeValues){
    if(isFirefox){
        var temp = document.createElement('canvas');
        temp.canvas.width = 72;
        temp.canvas.heiht = 152;
    }
    else{
        var temp = new OffscreenCanvas(72,152);
    }
    var gl = temp.getContext('2d');
    resetCanvas(gl);
    gl.drawImage(img,0,0);
    var imageData = gl.getImageData(0,0,72,152);
    var rgba = imageData.data;
    for(var i = 0;i < rgba.length;i += 4){
        if(rgba[i] === 0 && rgba[i + 1] === 0 && rgba[i + 2] === 0){
            //rgba[i + 3] = 0;
        }
        else{
            if(shadeValues[0] !== -1){
                rgba[i] = rgba[i] + (shadeValues[0] - rgba[i]) * shadeValues[3];
            }
            if(shadeValues[1] !== -1){
                rgba[i + 1] = rgba[i + 1] + (shadeValues[1] - rgba[i + 1]) * shadeValues[3];
            }
            if(shadeValues[2] !== -1){
                rgba[i + 2] = rgba[i + 2] + (shadeValues[2] - rgba[i + 2]) * shadeValues[3];
            }
        }
    }
    gl.clearRect(0,0,72,152);
    gl.putImageData(imageData,0,0);
    if(isFirefox){
        var finalTemp = document.createElement('canvas');
        finalTemp.canvas.width = 72 * 4;
        finalTemp.canvas.height = 152 * 4;
    }
    else{
        var finalTemp = new OffscreenCanvas(72 * 4,152 * 4);
    }
    var finalGl = finalTemp.getContext('2d');
    resetCanvas(finalGl);
    finalGl.drawImage(temp,0,0,72 * 4,152 * 4);
    return finalTemp;
}
document.getElementById('bossbar').style.display = 'none';

const times = [];
let fps;

var documentHidden = false;

function refreshLoop(){
    window.requestAnimationFrame(() => {
        const now = performance.now();
        while(times.length > 0 && times[0] <= now - 1000){
            times.shift();
        }
        times.push(now);
        fps = times.length;
        document.getElementById('fps').innerHTML = "FPS: " + fps;
        refreshLoop();
    });
}

refreshLoop();

var shadeSpeed = -0.01;
var shadeAmount = 1;
var mapShadeSpeed = 0;
var mapShadeAmount = 0;
var Img = {};
Img.playerBody = new Image();
Img.playerBody.src = '/client/img/Player Map Body.png';
Img.playerShirt = new Image();
Img.playerShirt.src = '/client/img/Player Map Shirt.png';
Img.playerPants = new Image();
Img.playerPants.src = '/client/img/Player Map Pants.png';
Img.playerHair = {};
Img.playerHair.shortHair = new Image();
Img.playerHair.shortHair.src = '/client/img/Player Map Hair Short.png';
Img.playerHair.longHair = new Image();
Img.playerHair.longHair.src = '/client/img/Player Map Hair Long.png';
Img.playerHair.bald = new Image();
Img.playerHair.bald.src = '/client/img/Player Map Bald.png';
Img.playerHair.mohawkHair = new Image();
Img.playerHair.mohawkHair.src = '/client/img/Player Map Hair Mohawk.png';
Img.playerHair.shortHat = new Image();
Img.playerHair.shortHat.src = '/client/img/Player Map Hat Short.png';
Img.playerHair.longHat = new Image();
Img.playerHair.longHat.src = '/client/img/Player Map Hat Long.png';
Img.playerHair.vikingHat = new Image();
Img.playerHair.vikingHat.src = '/client/img/Player Map Hat Viking.png';
Img.bird = new Image();
Img.bird.src = '/client/img/bird.png';
Img.ball = new Image();
Img.ball.src = '/client/img/ball.png';
Img.cherryBomb = new Image();
Img.cherryBomb.src = '/client/img/cherryBomb.png';
Img.lizard = new Image();
Img.lizard.src = '/client/img/lizard.png';
Img.ghost = new Image();
Img.ghost.src = '/client/img/ghost.png';
Img.plantera = new Image();
Img.plantera.src = '/client/img/plantera.png';
Img.thorn = new Image();
Img.thorn.src = '/client/img/thorn.png';
Img.lightningTurret = new Image();
Img.lightningTurret.src = '/client/img/lightningTurret.png';
Img.lightningRammer = new Image();
Img.lightningRammer.src = '/client/img/lightningRammer.png';
Img.waterRammer = new Image();
Img.waterRammer.src = '/client/img/waterRammer.png';
Img.whirlwind = new Image();
Img.whirlwind.src = '/client/img/whirlwind.png';
Img.fireSpirit = new Image();
Img.fireSpirit.src = '/client/img/fireSpirit.png';
Img.rocopter = new Image();
Img.rocopter.src = '/client/img/rocopter.png';
Img.crab = new Image();
Img.crab.src = '/client/img/crab.png';
Img.beetle = new Image();
Img.beetle.src = '/client/img/beetle.png';
Img.kiol = new Image();
Img.kiol.src = '/client/img/kiol.png';
Img.cherrier = new Image();
Img.cherrier.src = '/client/img/cherrier.png';
Img.sphere = new Image();
Img.sphere.src = '/client/img/sphere.png';
Img.thunderbird = new Image();
Img.thunderbird.src = '/client/img/thunderbird.png';
Img.healthBar = new Image();
Img.healthBar.src = '/client/img/healthBar.png';
Img.healthBarEnemy = new Image();
Img.healthBarEnemy.src = '/client/img/healthBarEnemy.png';
Img.manaBar = new Image();
Img.manaBar.src = '/client/img/manaBar.png';
Img.quest = new Image();
Img.quest.src = '/client/img/quest.png';
var mouseX = 0;
var mouseY = 0;
var mapMouseX = mouseX + WIDTH / 2;
var mapMouseY = mouseY + HEIGHT / 2;
var mapDragX = mouseX + WIDTH / 2;
var mapDragY = mouseY + HEIGHT / 2;
var mapMouseOver = false;
var mapX = -640;
var mapY = -640;
var mapDrag = true;
var mapRatio = 1000;
var mapTiles = {}
var mapCropX = 3200;
var mapCropY = 0;

document.getElementById('bodySlider').oninput = function(){
    socket.emit('keyPress',{inputId:'imgBody',state:this.value});
}
document.getElementById('bodyOpacity').oninput = function(){
    socket.emit('keyPress',{inputId:'imgBodyOpacity',state:this.value});
}
document.getElementById('shirtSlider').oninput = function(){
    socket.emit('keyPress',{inputId:'imgShirt',state:this.value});
}
document.getElementById('shirtOpacity').oninput = function(){
    socket.emit('keyPress',{inputId:'imgShirtOpacity',state:this.value});
}
document.getElementById('pantsSlider').oninput = function(){
    socket.emit('keyPress',{inputId:'imgPants',state:this.value});
}
document.getElementById('pantsOpacity').oninput = function(){
    socket.emit('keyPress',{inputId:'imgPantsOpacity',state:this.value});
}
document.getElementById('hairSlider').oninput = function(){
    socket.emit('keyPress',{inputId:'imgHair',state:this.value});
}
document.getElementById('hairOpacity').oninput = function(){
    socket.emit('keyPress',{inputId:'imgHairOpacity',state:this.value});
}
document.getElementById('hairTypeSlider').oninput = function(){
    socket.emit('keyPress',{inputId:'imgHairType',state:this.value});
}
var audio = 'none';
document.getElementById('audioSwitch').onclick = function(){
    if(audio === 'tense'){
        audioTense.pause();
        audioCalm.loop = true;
        audioCalm.currentTime = 0;
        audioCalm.play();
        document.getElementById('audioSwitch').innerHTML = 'Change music. Current music is calm.';
        audio = 'calm';
    }
    else if(audio === 'calm'){
        audioCalm.pause();
        document.getElementById('audioSwitch').innerHTML = 'Change music. Current music is none.';
        audio = 'none';
    }
    else{
        audioTense.loop = true;
        audioTense.currentTime = 0;
        audioTense.play();
        document.getElementById('audioSwitch').innerHTML = 'Change music. Current music is tense.';
        audio = 'tense';
    }
}
var chatBackground = 'none';
document.getElementById('chatBackground').onclick = function(){
    if(chatBackground === 'none'){
        document.getElementById('chat-text').style.backgroundColor = '#362a1e';
        document.getElementById('chat-text').style.border = '1px solid #000000';
        document.getElementById('chatBackground').innerHTML = 'Remove the background on the chat.';
        chatBackground = 'brown';
    }
    else{
        document.getElementById('chat-text').style.backgroundColor = 'transparent';
        document.getElementById('chat-text').style.border = '0px solid #000000';
        document.getElementById('chatBackground').innerHTML = 'Add a background to the chat.';
        chatBackground = 'none';
    }
}
var showDebugCommands = false;
document.getElementById('showDebugCommands').onclick = function(){
    if(!showDebugCommands){
        document.getElementById('showDebugCommands').innerHTML = 'Hide Debug Commands';
        showDebugCommands = !showDebugCommands;
    }
    else{
        document.getElementById('showDebugCommands').innerHTML = 'Show Debug Commands.';
        showDebugCommands = !showDebugCommands;
    }
}
document.getElementById('fullscreen').onclick = function(){
    if(document.documentElement.requestFullscreen){
        document.documentElement.requestFullscreen();
    }
    else if(document.documentElement.mozRequestFullScreen){ /* Firefox */
        document.documentElement.mozRequestFullScreen();
    }
    else if(document.documentElement.webkitRequestFullscreen){ /* Chrome, Safari & Opera */
        document.documentElement.webkitRequestFullscreen();
    }
    else if(document.documentElement.msRequestFullscreen){ /* IE/Edge */
        document.documentElement.msRequestFullscreen();
    }
}
var showParticles = true;
document.getElementById('particles').onclick = function(){
    if(showParticles){
        document.getElementById('particles').innerHTML = 'Particles: Off';
        showParticles = false;
    }
    else{
        document.getElementById('particles').innerHTML = 'Particles: On';
        showParticles = true;
    }
}
var difficulty = 'Classic';
document.getElementById('difficulty').onclick = function(){
    if(difficulty === 'Classic'){
        document.getElementById('difficulty').innerHTML = 'Difficulty: Expert';
        socket.emit('changeDifficulty','Expert');
        difficulty = 'Expert';
    }
    else{
        document.getElementById('difficulty').innerHTML = 'Difficulty: Classic';
        socket.emit('changeDifficulty','Classic');
        difficulty = 'Classic';
    }
}


var currentMap = '';
var tempMap = {};

var talking = false;
var selfId = null;

var state = {
    isDragging:false,
    isHidden:true,
    xDiff:0,
    yDiff:0,
    x:0,
    y:0,
};

// hehe: http://youmightnotneedjquery.com/
function ready(fn){
    if(document.attachEvent ? document.readyState === "complete" : document.readyState !== "loading"){
        fn();
    }
    else{
        document.addEventListener('DOMContentLoaded', fn);
    }
}
function renderWindow(w,myState){
    if(state.isHidden){
        w.style.display = 'none';
    }
    else{
        w.style.display = '';
    }

    w.style.transform = 'translate(' + myState.x + 'px, ' + myState.y + 'px)';
}
function clampX(n){
    return Math.min(Math.max(n,0),window.innerWidth - 900);
}
function clampY(n){
    return Math.min(Math.max(n,-14),window.innerHeight - 46);
}
function onMouseMove(e){
    if(state.isDragging){
        state.x = clampX(e.pageX - state.xDiff);
        state.y = clampY(e.pageY - state.yDiff);
    }

    // Update window position
    var w = document.getElementById('window');
    renderWindow(w,state);
}
function onMouseDown(e){
    state.isDragging = true;
    state.xDiff = e.pageX - state.x;
    state.yDiff = e.pageY - state.y;
}
function onMouseUp(){
    state.isDragging = false;
}
function closeWindow(){
    state.isHidden = true;

    var w = document.getElementById('window');
    renderWindow(w,state);
}

ready(function(){
var w = document.getElementById('window');
    renderWindow(w,state);

    var windowBar = document.querySelectorAll('.window-bar');
    windowBar[0].addEventListener('mousedown',onMouseDown);
    document.addEventListener('mousemove',onMouseMove);
    document.addEventListener('mouseup',onMouseUp);

    var closeButton = document.querySelectorAll('.window-close');
    closeButton[0].addEventListener('click',closeWindow);

    var toggleButton = document.getElementById('windowtoggle');
    toggleButton.addEventListener('click',function() {
        state.isHidden = !state.isHidden;
        renderWindow(w,state);
    });
});

var respawn = function(){
    socket.emit('respawn');
    gameDiv.style.display = 'inline-block';
    disconnectedDiv.style.display = 'none';
    spectatorDiv.style.display = 'none';
    pageDiv.style.display = 'none';
    setTimeout(function(){
        gameDiv.style.display = 'inline-block';
        disconnectedDiv.style.display = 'none';
        spectatorDiv.style.display = 'none';
        pageDiv.style.display = 'none';
    },50);
    document.getElementById('debuffs').innerHTML = '';
}
var inventory = new Inventory(socket,false);
socket.on('updateInventory',function(pack){
    inventory.items = pack.items;
    inventory.currentEquip = pack.currentEquip;
    inventory.materials = pack.materials;
    inventory.refreshRender();
});
socket.on('updateItem',function(pack){
    inventory.items = pack.items;
    inventory.refreshItem(pack.index);
});
socket.on('updateEquip',function(pack){
    inventory.equips = pack.equips;
    inventory.refreshItem(pack.index);
});
socket.on('updateShop',function(pack){
    inventory.shopItems = pack.shopItems;
    inventory.refreshShop();
});
socket.on('updateCraft',function(pack){
    inventory.craftItems = pack.craftItems;
    inventory.refreshCraft();
});
socket.on('refreshMenu',function(pack){
    inventory.maxSlots = pack;
    inventory.refreshMenu();
});

var disableAllMenu = function(){
    var menuDisplays = document.getElementsByClassName('menuDisplay');
    for(var i = 0;i < menuDisplays.length;i++){
        menuDisplays[i].style.display = 'none';
    }
}

document.getElementById('inventoryButton').onclick = function(){
    disableAllMenu();
    document.getElementById('inventoryScreen').style.display = 'inline-block';
}
document.getElementById('statButton').onclick = function(){
    disableAllMenu();
    document.getElementById('statScreen').style.display = 'inline-block';
}
document.getElementById('worldMapButton').onclick = function(){
    disableAllMenu();
    document.getElementById('worldMap').style.display = 'inline-block';
}
document.getElementById('settingsButton').onclick = function(){
    disableAllMenu();
    document.getElementById('settingsScreen').style.display = 'inline-block';
}
document.getElementById('leaderboardButton').onclick = function(){
    disableAllMenu();
    document.getElementById('leaderboardScreen').style.display = 'inline-block';
}
document.getElementById('waypointButton').onclick = function(){
    disableAllMenu();
    document.getElementById('waypointScreen').style.display = 'inline-block';
}
document.getElementById('questButton').onclick = function(){
    disableAllMenu();
    document.getElementById('questScreen').style.display = 'inline-block';
}

var questChange = function(event){
    var dropdown = document.getElementById('questDropdown');
    try{
        document.getElementById('questName').innerHTML = dropdown.options[dropdown.selectedIndex].text;
        document.getElementById('questDescription').innerHTML = questData[dropdown.options[dropdown.selectedIndex].text].description
        document.getElementById('questXp').innerHTML = 'This quest gives ' + questData[dropdown.options[dropdown.selectedIndex].text].xp + ' XP.';
    }
    catch(err){
        console.log(err);
        document.getElementById('questName').innerHTML = 'No quest selected';
        document.getElementById('questDescription').innerHTML = '';
        document.getElementById('questXp').innerHTML = '';
    }
}

document.getElementById('villageWaypoint').onclick = function(){
    socket.emit('waypoint','The Village');
}
document.getElementById('lilypad1Waypoint').onclick = function(){
    socket.emit('waypoint','Lilypad Pathway Part 1');
}
document.getElementById('graveyardWaypoint').onclick = function(){
    socket.emit('waypoint','The Graveyard');
}
document.getElementById('arenaWaypoint').onclick = function(){
    socket.emit('waypoint','The Arena');
}
document.getElementById('lilypad2Waypoint').onclick = function(){
    socket.emit('waypoint','Lilypad Temple Room 1');
}
document.getElementById('desertedTownWaypoint').onclick = function(){
    socket.emit('waypoint','Deserted Town');
}
document.getElementById('lilypad3Waypoint').onclick = function(){
    socket.emit('waypoint','Lilypad Temple Room 2');
}
document.getElementById('lilypad4Waypoint').onclick = function(){
    socket.emit('waypoint','Lilypad Kingdom');
}

var drawPlayer = function(img,canvas,animationDirection,animation,x,y,size){
    var animationValue = 0;
    switch(animationDirection){
        case "down":
            animationValue = 0;
            break;
        case "rightdown":
            animationValue = 1;
            break;
        case "right":
            animationValue = 2;
            break;
        case "rightup":
            animationValue = 3;
            break;
        case "up":
            animationValue = 4;
            break;
        case "leftup":
            animationValue = 5;
            break;
        case "left":
            animationValue = 6;
            break;
        case "leftdown":
            animationValue = 7;
            break;
    }
    canvas.drawImage(img,4 * 12 * animation,4 * 19 * animationValue,4 * 12,4 * 19,x - size * 6,y - size * 15,size * 12,size * 19);
    return canvas;
}

var arrayIsEqual = function(arr1,arr2){
	if(arr1.length !== arr2.length){
        return false;
    }
	for(var i = 0;i < arr1.length;i++){
		if(arr1[i] !== arr2[i]){
            return false;
        }
	}
	return true;
};

getDistance = function(x1,y1,x2,y2){
    return Math.sqrt(Math.pow(x1 - x2,2) + Math.pow(y1 - y2,2))
}

var Player = function(initPack){
    var self = {};
    self.id = initPack.id;
    self.username = initPack.username;
    self.displayName = initPack.displayName;
    self.x = initPack.x;
    self.y = initPack.y;
    self.moveX = 0;
    self.moveY = 0;
    self.nextX = initPack.x;
    self.nextY = initPack.y;
    self.spdX = initPack.spdX;
    self.spdY = initPack.spdY;
    self.zindex = initPack.zindex;
    self.img = initPack.img;
    if(self.img.body[2] === 0){
        document.getElementById('bodySlider').value = Math.round(self.img.body[1] / 250 * 50);
    }
    else if(self.img.body[0] === 0){
        document.getElementById('bodySlider').value = Math.round(self.img.body[2] / 250 * 50 + 50);
    }
    else if(self.img.body[1] === 0){
        document.getElementById('bodySlider').value = Math.round(self.img.body[0] / 250 * 50 + 100);
    }
    if(self.img.shirt[2] === 0){
        document.getElementById('shirtSlider').value = Math.round(self.img.shirt[1] / 250 * 50);
    }
    else if(self.img.shirt[0] === 0){
        document.getElementById('shirtSlider').value = Math.round(self.img.shirt[2] / 250 * 50 + 50);
    }
    else if(self.img.shirt[1] === 0){
        document.getElementById('shirtSlider').value = Math.round(self.img.shirt[0] / 250 * 50 + 100);
    }
    if(self.img.pants[2] === 0){
        document.getElementById('pantsSlider').value = Math.round(self.img.pants[1] / 250 * 50);
    }
    else if(self.img.pants[0] === 0){
        document.getElementById('pantsSlider').value = Math.round(self.img.pants[2] / 250 * 50 + 50);
    }
    else if(self.img.pants[1] === 0){
        document.getElementById('pantsSlider').value = Math.round(self.img.pants[0] / 250 * 50 + 100);
    }
    if(self.img.hair[2] === 0){
        document.getElementById('hairSlider').value = Math.round(self.img.hair[1] / 250 * 50);
    }
    else if(self.img.hair[0] === 0){
        document.getElementById('hairSlider').value = Math.round(self.img.hair[2] / 250 * 50 + 50);
    }
    else if(self.img.hair[1] === 0){
        document.getElementById('hairSlider').value = Math.round(self.img.hair[0] / 250 * 50 + 100);
    }
    switch(self.img.hairType){
        case "shortHair":
            document.getElementById('hairTypeSlider').value = 1;
            break;
        case "longHair":
            document.getElementById('hairTypeSlider').value = 2;
            break;
        case "shortHat":
            document.getElementById('hairTypeSlider').value = 3;
            break;
        case "longHat":
            document.getElementById('hairTypeSlider').value = 4;
            break;
        case "vikingHat":
            document.getElementById('hairTypeSlider').value = 5;
            break;
        case "mohawkHair":
            document.getElementById('hairTypeSlider').value = 6;
            break;
    }
    document.getElementById('bodyOpacity').value = Math.round(self.img.body[3] * 10);
    document.getElementById('shirtOpacity').value = Math.round(self.img.shirt[3] * 10);
    document.getElementById('pantsOpacity').value = Math.round(self.img.pants[3] * 10);
    document.getElementById('hairOpacity').value = Math.round(self.img.hair[3] * 10);
    self.renderedImg = {
        body:renderPlayer(Img.playerBody,self.img.body),
        shirt:renderPlayer(Img.playerShirt,self.img.shirt),
        pants:renderPlayer(Img.playerPants,self.img.pants),
        hair:renderPlayer(Img.playerHair[self.img.hairType],self.img.hair),
    }
    self.render = document.createElement('canvas');
    var ctx = self.render.getContext('2d');
    ctx.canvas.width = 72 * 4;
    ctx.canvas.height = 152 * 4;
    ctx.drawImage(self.renderedImg.body,0,0);
    ctx.drawImage(self.renderedImg.shirt,0,0);
    ctx.drawImage(self.renderedImg.pants,0,0);
    ctx.drawImage(self.renderedImg.hair,0,0);
    self.direction = initPack.direction;
    self.hp = initPack.hp;
    self.hpMax = initPack.hpMax;
    self.xp = initPack.xp;
    self.xpMax = initPack.xpMax;
    self.mana = Math.round(initPack.mana);
    self.manaMax = initPack.manaMax;
    self.stats = initPack.stats;
    self.level = initPack.level;
    self.map = initPack.map;
    self.attackCost = initPack.attackCost;
    self.healCost = initPack.healCost;
    self.useTime = initPack.useTime;
    self.mapHeight = initPack.mapHeight;
    self.mapWidth = initPack.mapWidth;
    self.updated = true;
    self.animation = initPack.animation;
    self.animationDirection = initPack.animationDirection;
    self.currentItem = initPack.currentItem;
    self.coins = initPack.coins;
    self.devCoins = initPack.devCoins;
    self.damageDone = initPack.damageDone;
    self.maxDamageDone = initPack.damageDone;
    self.stats = initPack.stats;
    self.debuffs = initPack.debuffs;
    self.questStats = initPack.questStats;
    if(self.id === selfId){
        document.getElementById('questDropdown').innerHTML = '';
        for(var i in questData){
            var requirementsMet = true;
            for(var j in questData[i].requirements){
                if(self.questStats[questData[i].requirements[j]] === false){
                    requirementsMet = false;
                }
                else if(questData[i].requirements[j].slice(0,4) === 'Lvl '){
                    if(parseInt(questData[i].requirements[j].slice(4,questData[i].requirements[j].length),10) > self.level){
                        requirementsMet = false;
                    }
                }
            }
            if(requirementsMet){
                document.getElementById('questDropdown').innerHTML += '<option>' + i + '</option>';
            }
        }
        questChange();
    }
    self.type = initPack.type;
    self.moveNumber = 4;
    self.update = function(){
        if(talking && self.id === selfId){
            socket.emit('keyPress',{inputId:'releaseAll'});
        }
        if(self.moveNumber > 0){
            self.x += self.moveX;
            self.y += self.moveY;
        }
        self.moveNumber -= 1;
    }
    self.draw = function(){
        if(self.zindex === 1){
            return;
        }
        if(Img[self.currentItem]){
            ctx0.translate(self.x,self.y);
            var turnAmount = 135;
            var drawX = -70;
            var drawY = -70;
            if(self.currentItem.includes('bow')){
                turnAmount = 225;
                var drawX = -49;
                var drawY = -15;
                ctx0.rotate((self.direction + turnAmount) * Math.PI / 180);
                ctx0.drawImage(Img[self.currentItem],drawX,drawY,64,64);
                ctx0.rotate((-self.direction - turnAmount) * Math.PI / 180);
            }
            else if(self.currentItem.includes('cannon')){
                turnAmount = 225;
                var drawX = -49;
                var drawY = -15;
                ctx0.rotate((self.direction + turnAmount) * Math.PI / 180);
                ctx0.drawImage(Img[self.currentItem],drawX,drawY,64,64);
                ctx0.rotate((-self.direction - turnAmount) * Math.PI / 180);
            }
            else if(self.currentItem === 'tsunami'){
                turnAmount = 225;
                var drawX = -49;
                var drawY = -15;
                ctx0.rotate((self.direction + turnAmount) * Math.PI / 180);
                ctx0.drawImage(Img[self.currentItem],drawX,drawY,64,64);
                ctx0.rotate((-self.direction - turnAmount) * Math.PI / 180);
            }
            else if(self.currentItem.includes('book')){
                turnAmount = 90;
                var drawX = -35;
                var drawY = -79;
                ctx0.rotate((self.direction + turnAmount) * Math.PI / 180);
                ctx0.drawImage(Img[self.currentItem],drawX,drawY,64,64);
                ctx0.rotate((-self.direction - turnAmount) * Math.PI / 180);
            }
            else if(self.currentItem === 'thegemofsp'){
                turnAmount = 90;
                var drawX = -35;
                var drawY = -79;
                ctx0.rotate((self.direction + turnAmount) * Math.PI / 180);
                ctx0.drawImage(Img[self.currentItem],drawX,drawY,64,64);
                ctx0.rotate((-self.direction - turnAmount) * Math.PI / 180);
            }
            else if(self.currentItem === 'typhoonstorm'){
                turnAmount = 270;
                var drawX = -35;
                var drawY = 15;
                ctx0.rotate((self.direction + turnAmount) * Math.PI / 180);
                ctx0.drawImage(Img[self.currentItem],drawX,drawY,64,64);
                ctx0.rotate((-self.direction - turnAmount) * Math.PI / 180);
            }
            else if(self.currentItem.includes('trident')){
                turnAmount = 45;
                var drawX = 5;
                var drawY = -89;
                ctx0.rotate((self.direction + turnAmount) * Math.PI / 180);
                ctx0.drawImage(Img[self.currentItem],drawX,drawY,84,84);
                ctx0.rotate((-self.direction - turnAmount) * Math.PI / 180);
            }
            else if(self.currentItem === 'leafblower'){
                turnAmount = 0;
                var drawX = -8;
                var drawY = -32;
                ctx0.rotate((self.direction + turnAmount) * Math.PI / 180);
                ctx0.drawImage(Img[self.currentItem],drawX,drawY,64,64);
                ctx0.rotate((-self.direction - turnAmount) * Math.PI / 180);
            }
            else if(self.currentItem === 'flamethrower'){
                turnAmount = 0;
                var drawX = -8;
                var drawY = -32;
                ctx0.rotate((self.direction + turnAmount) * Math.PI / 180);
                ctx0.drawImage(Img[self.currentItem],drawX,drawY,64,64);
                ctx0.rotate((-self.direction - turnAmount) * Math.PI / 180);
            }
            else{
                ctx0.rotate((self.direction + turnAmount) * Math.PI / 180);
                ctx0.drawImage(Img[self.currentItem],drawX,drawY,64,64);
                ctx0.rotate((-self.direction - turnAmount) * Math.PI / 180);
            }
            ctx0.translate(-self.x,-self.y);
        }
        self.animation = Math.round(self.animation);
        drawPlayer(self.render,ctx0,self.animationDirection,self.animation,self.x,self.y,4);
        if(self.id === selfId){
            settingsPlayerDisplay.clearRect(0,0,10,17);
            drawPlayer(self.render,settingsPlayerDisplay,self.animationDirection,self.animation,5,15,1);
        }
    }
    self.drawCtx1 = function(){
        if(self.zindex === 0){
            return;
        }
        if(Img[self.currentItem]){
            ctx1.translate(self.x,self.y);
            var turnAmount = 135;
            var drawX = -70;
            var drawY = -70;
            if(self.currentItem.includes('bow')){
                turnAmount = 225;
                var drawX = -49;
                var drawY = -15;
                ctx1.rotate((self.direction + turnAmount) * Math.PI / 180);
                ctx1.drawImage(Img[self.currentItem],drawX,drawY,64,64);
                ctx1.rotate((-self.direction - turnAmount) * Math.PI / 180);
            }
            else if(self.currentItem.includes('cannon')){
                turnAmount = 225;
                var drawX = -49;
                var drawY = -15;
                ctx1.rotate((self.direction + turnAmount) * Math.PI / 180);
                ctx1.drawImage(Img[self.currentItem],drawX,drawY,64,64);
                ctx1.rotate((-self.direction - turnAmount) * Math.PI / 180);
            }
            else if(self.currentItem === 'tsunami'){
                turnAmount = 225;
                var drawX = -49;
                var drawY = -15;
                ctx1.rotate((self.direction + turnAmount) * Math.PI / 180);
                ctx1.drawImage(Img[self.currentItem],drawX,drawY,64,64);
                ctx1.rotate((-self.direction - turnAmount) * Math.PI / 180);
            }
            else if(self.currentItem.includes('book')){
                turnAmount = 90;
                var drawX = -35;
                var drawY = -79;
                ctx1.rotate((self.direction + turnAmount) * Math.PI / 180);
                ctx1.drawImage(Img[self.currentItem],drawX,drawY,64,64);
                ctx1.rotate((-self.direction - turnAmount) * Math.PI / 180);
            }
            else if(self.currentItem === 'thegemofsp'){
                turnAmount = 90;
                var drawX = -35;
                var drawY = -79;
                ctx1.rotate((self.direction + turnAmount) * Math.PI / 180);
                ctx1.drawImage(Img[self.currentItem],drawX,drawY,64,64);
                ctx1.rotate((-self.direction - turnAmount) * Math.PI / 180);
            }
            else if(self.currentItem === 'typhoonstorm'){
                turnAmount = 270;
                var drawX = -35;
                var drawY = 15;
                ctx1.rotate((self.direction + turnAmount) * Math.PI / 180);
                ctx1.drawImage(Img[self.currentItem],drawX,drawY,64,64);
                ctx1.rotate((-self.direction - turnAmount) * Math.PI / 180);
            }
            else if(self.currentItem.includes('trident')){
                turnAmount = 45;
                var drawX = 5;
                var drawY = -89;
                ctx1.rotate((self.direction + turnAmount) * Math.PI / 180);
                ctx1.drawImage(Img[self.currentItem],drawX,drawY,84,84);
                ctx1.rotate((-self.direction - turnAmount) * Math.PI / 180);
            }
            else if(self.currentItem === 'leafblower'){
                turnAmount = 0;
                var drawX = -8;
                var drawY = -32;
                ctx1.rotate((self.direction + turnAmount) * Math.PI / 180);
                ctx1.drawImage(Img[self.currentItem],drawX,drawY,64,64);
                ctx1.rotate((-self.direction - turnAmount) * Math.PI / 180);
            }
            else if(self.currentItem === 'flamethrower'){
                turnAmount = 0;
                var drawX = -8;
                var drawY = -32;
                ctx1.rotate((self.direction + turnAmount) * Math.PI / 180);
                ctx1.drawImage(Img[self.currentItem],drawX,drawY,64,64);
                ctx1.rotate((-self.direction - turnAmount) * Math.PI / 180);
            }
            else{
                ctx1.rotate((self.direction + turnAmount) * Math.PI / 180);
                ctx1.drawImage(Img[self.currentItem],drawX,drawY,64,64);
                ctx1.rotate((-self.direction - turnAmount) * Math.PI / 180);
            }
            ctx1.translate(-self.x,-self.y);
        }
        self.animation = Math.round(self.animation);
        drawPlayer(self.render,ctx1,self.animationDirection,self.animation,self.x,self.y,4);
        if(self.id === selfId){
            settingsPlayerDisplay.clearRect(0,0,10,17);
            drawPlayer(self.render,settingsPlayerDisplay,self.animationDirection,self.animation,5,15,1);
        }
    }
    self.drawName = function(){
        ctx1.font = "15px pixel";
        ctx1.fillStyle = '#ff7700';
        ctx1.textAlign = "center";
        ctx1.fillText(self.displayName,self.x,self.y - 92);
        if(DEBUG){
            ctx1.strokeStyle = '#ff0000';
            ctx1.lineWidth = 4;
            ctx1.strokeRect(Math.floor(self.x / 64) * 64,Math.floor(self.y / 64) * 64,1 * 64,1 * 64)
        }
        ctx1.drawImage(Img.healthBar,0,0,42,5,self.x - 63,self.y - 75,126,15);
        ctx1.drawImage(Img.healthBar,0,6,Math.round(42 * self.hp / self.hpMax),5,self.x - 63,self.y - 75,Math.round(126 * self.hp / self.hpMax),15);
        if(self.id !== selfId){
            return;
        }
        document.getElementById('stat-text').innerHTML = 'You will deal ' + self.stats.attack + ' damage. You have a ' + Math.round(self.stats.critChance * 100) + '% chance to deal a critical hit.<br>You have ' + self.stats.defense + ' defense.<br>You have ' + Math.round(self.stats.damageReduction * 100) + '% damage reduction.<br>You are level ' + self.level + '.<br>You have an xp modifier of ' + self.stats.xp + '.<br>Your attack spends ' + Math.round(self.attackCost) + ' mana. Your heal spends ' + Math.round(self.healCost) + ' mana. You have a cooldown of ' + self.useTime + ' ticks.';
    }
    self.drawLight = function(){
        if(self.id !== selfId){
            return;
        }
        if(showParticles){
            for(var i in lightList){
                if(self.map === lightList[i].map){
                    var grd = ctx1.createRadialGradient(lightList[i].x,lightList[i].y,50,lightList[i].x,lightList[i].y,lightList[i].radius);
                    grd.addColorStop(0,"rgba(" + lightList[i].r + "," + lightList[i].g + "," + lightList[i].b + "," + lightList[i].a + ")");
                    grd.addColorStop(1,"rgba(" + lightList[i].r + "," + lightList[i].g + "," + lightList[i].b + ",0)");
                    ctx1.fillStyle = grd;
                    ctx1.fillRect(lightList[i].x - WIDTH,lightList[i].y - HEIGHT,WIDTH * 2,HEIGHT * 2);
                }
            }
            for(var i in entityLightList){
                if(self.map === entityLightList[i].map){
                    var grd = ctx1.createRadialGradient(entityLightList[i].x,entityLightList[i].y,30,entityLightList[i].x,entityLightList[i].y,entityLightList[i].radius);
                    grd.addColorStop(0,"rgba(" + entityLightList[i].r + "," + entityLightList[i].g + "," + entityLightList[i].b + "," + entityLightList[i].a + ")");
                    grd.addColorStop(1,"rgba(" + entityLightList[i].r + "," + entityLightList[i].g + "," + entityLightList[i].b + ",0)");
                    ctx1.fillStyle = grd;
                    ctx1.fillRect(entityLightList[i].x - WIDTH,entityLightList[i].y - HEIGHT,WIDTH * 2,HEIGHT * 2);
                }
            }
        }
        if(self.map !== "Lilypad Temple Room 1" && self.map !== "Town Cave" && self.map !== "Secret Tunnel Part 1" && self.map !== "Secret Tunnel Part 2" && self.map !== "The Dripping Caverns"){
            return;
        }
        var grd = ctx1.createRadialGradient(self.x,self.y,50,self.x,self.y,500);
        grd.addColorStop(0,"rgba(0,0,0,0)");
        grd.addColorStop(1,"rgba(0,0,0,1)");
        ctx1.fillStyle = grd;
        ctx1.fillRect(self.x - WIDTH,self.y - HEIGHT,WIDTH * 2,HEIGHT * 2);
    }
    Player.list[self.id] = self;
    return self;
}
Player.list = {};
var Projectile = function(initPack){
    var self = {};
    self.id = initPack.id;
    self.x = initPack.x;
    self.y = initPack.y;
    self.nextX = initPack.x;
    self.nextY = initPack.y;
    self.moveX = 0;
    self.moveY = 0;
    self.spdX = initPack.spdX;
    self.spdY = initPack.spdY;
    self.width = initPack.width;
    self.height = initPack.height;
    self.direction = initPack.direction;
    self.projectileType = initPack.projectileType;
    self.relativeToPlayer = initPack.relativeToPlayer;
    self.type = initPack.type;
    self.moveNumber = 4;
    self.hp = initPack.hp;
    self.hpMax = initPack.hpMax;
    self.map = initPack.map;
    self.zindex = initPack.zindex;
    self.updated = true;
    self.update = function(){
        if(self.moveNumber > 0){
            self.x += self.moveX;
            self.y += self.moveY;
        }
        self.moveNumber -= 1;
    }
    self.draw = function(){
        var x = self.x;
        var y = self.y;
        if(self.relativeToPlayer && Player.list[self.relativeToPlayer]){
            x += Player.list[self.relativeToPlayer].x;
            y += Player.list[self.relativeToPlayer].y;
        }
        if(projectileData[self.projectileType] && showParticles){
            if(projectileData[self.projectileType].light.a === 0){

            }
            else{
                var light = Object.create(projectileData[self.projectileType].light);
                for(var i in Projectile.list){
                    var pX = Projectile.list[i].x;
                    var pY = Projectile.list[i].y;
                    if(Projectile.list[i].relativeToPlayer && Player.list[Projectile.list[i].relativeToPlayer]){
                        pX += Player.list[Projectile.list[i].relativeToPlayer].x;
                        pY += Player.list[Projectile.list[i].relativeToPlayer].y;
                    }
                    if(getDistance(x,y,pX,pY) < light.radius && i !== self.id){
                        light.r += (255 - light.r) / 15;
                        light.g += (255 - light.g) / 15;
                        light.b += (255 - light.b) / 15;
                        light.a *= 0.95;
                        light.radius *= 0.98;
                    }
                }
                entityLightList[self.id] = {
                    x:Math.round(x),
                    y:Math.round(y),
                    map:self.map,
                    r:Math.min(light.r,255),
                    g:Math.min(light.g,255),
                    b:Math.min(light.b,255),
                    a:Math.max(light.a,0.05),
                    radius:Math.max(light.radius,40),
                }
            }
        }
        if(self.relativeToPlayer && Player.list[self.relativeToPlayer]){
            ctx0.translate(self.x + Player.list[self.relativeToPlayer].x,self.y + Player.list[self.relativeToPlayer].y);
        }
        else{
            ctx0.translate(self.x,self.y);
        }
        ctx0.rotate(self.direction * Math.PI / 180);
        if(projectileData[self.projectileType]){
            if(self.projectileType === 'stoneArrow'){
                ctx0.drawImage(Img[self.projectileType],-49,-self.height / 4);
            }
            else if(self.projectileType === 'goldArrow'){
                ctx0.drawImage(Img[self.projectileType],-49,-self.height / 4);
            }
            else if(self.projectileType === 'unholytrident'){
                ctx0.rotate(45 * Math.PI / 180);
                ctx0.drawImage(Img[self.projectileType],-self.width / 2,-self.height / 2,projectileData[self.projectileType].width,projectileData[self.projectileType].height);
                ctx0.rotate(-45 * Math.PI / 180);
            }
            else if(self.projectileType === 'holytrident'){
                ctx0.rotate(45 * Math.PI / 180);
                ctx0.drawImage(Img[self.projectileType],-self.width / 2,-self.height / 2,projectileData[self.projectileType].width,projectileData[self.projectileType].height);
                ctx0.rotate(-45 * Math.PI / 180);
            }
            else if(self.projectileType === 'flame'){
                ctx0.drawImage(Img[self.projectileType],-self.width / 2 + 6 - Math.random() * 12,-self.height / 2 + 6 - Math.random() * 12,projectileData[self.projectileType].width,projectileData[self.projectileType].height);
            }
            else{
                ctx0.drawImage(Img[self.projectileType],-self.width / 2,-self.height / 2,projectileData[self.projectileType].width,projectileData[self.projectileType].height);
            }
        }
        ctx0.rotate(-self.direction * Math.PI / 180);
        if(self.relativeToPlayer && Player.list[self.relativeToPlayer]){
            ctx0.translate(-self.x - Player.list[self.relativeToPlayer].x,-self.y - Player.list[self.relativeToPlayer].y);
        }
        else{
            ctx0.translate(-self.x,-self.y);
        }
    }
    self.drawCtx1 = function(){
        if(self.relativeToPlayer && Player.list[self.relativeToPlayer]){
            ctx1.translate(self.x + Player.list[self.relativeToPlayer].x,self.y + Player.list[self.relativeToPlayer].y);
        }
        else{
            ctx1.translate(self.x,self.y);
        }
        ctx1.rotate(self.direction * Math.PI / 180);
        if(projectileData[self.projectileType]){
            if(self.projectileType === 'stoneArrow'){
                ctx1.drawImage(Img[self.projectileType],-49,-self.height / 4);
            }
            else if(self.projectileType === 'goldArrow'){
                ctx1.drawImage(Img[self.projectileType],-49,-self.height / 4);
            }
            else if(self.projectileType === 'unholytrident'){
                ctx1.rotate(45 * Math.PI / 180);
                ctx1.drawImage(Img[self.projectileType],-self.width / 2,-self.height / 2,projectileData[self.projectileType].width,projectileData[self.projectileType].height);
                ctx1.rotate(-45 * Math.PI / 180);
            }
            else if(self.projectileType === 'holytrident'){
                ctx1.rotate(45 * Math.PI / 180);
                ctx1.drawImage(Img[self.projectileType],-self.width / 2,-self.height / 2,projectileData[self.projectileType].width,projectileData[self.projectileType].height);
                ctx1.rotate(-45 * Math.PI / 180);
            }
            else if(self.projectileType === 'flame'){
                ctx1.drawImage(Img[self.projectileType],-self.width / 2 + 6 - Math.random() * 12,-self.height / 2 + 6 - Math.random() * 12,projectileData[self.projectileType].width,projectileData[self.projectileType].height);
            }
            else{
                ctx1.drawImage(Img[self.projectileType],-self.width / 2,-self.height / 2,projectileData[self.projectileType].width,projectileData[self.projectileType].height);
            }
        }
        ctx1.rotate(-self.direction * Math.PI / 180);
        if(self.relativeToPlayer && Player.list[self.relativeToPlayer]){
            ctx1.translate(-self.x - Player.list[self.relativeToPlayer].x,-self.y - Player.list[self.relativeToPlayer].y);
        }
        else{
            ctx1.translate(-self.x,-self.y);
        }
    }
    self.drawHp = function(){
        if(DEBUG){
            ctx1.strokeStyle = '#ff0000';
            ctx1.lineWidth = 4;
            ctx1.strokeRect(Math.floor(self.x / 64) * 64,Math.floor(self.y / 64) * 64,1 * 64,1 * 64)
        }
    }
    Projectile.list[self.id] = self;
    return self;
}
Projectile.list = {};
var Monster = function(initPack){
    var self = {};
    self.id = initPack.id;
    self.x = initPack.x;
    self.y = initPack.y;
    self.nextX = initPack.x;
    self.nextY = initPack.y;
    self.moveX = 0;
    self.moveY = 0;
    self.hp = initPack.hp;
    self.hpMax = initPack.hpMax;
    self.map = initPack.map;
    self.canCollide = initPack.canCollide;
    self.monsterType = initPack.monsterType;
    self.type = initPack.type;
    self.animation = initPack.animation;
    self.animationDirection = initPack.animationDirection;
    self.direction = initPack.direction;
    self.width = initPack.width;
    self.height = initPack.height;
    self.zindex = initPack.zindex;
    self.moveNumber = 4;
    self.updated = true;
    if(self.monsterType === 'lightningLizard'){
        document.getElementById('bossHealth').style.width = window.innerWidth / 2 * self.hp / self.hpMax + 'px';
        document.getElementById('bossbar').innerHTML = 'Lightning Lizard ' + self.hp + '/' + self.hpMax;
    }
    if(self.monsterType === 'redBird'){
        document.getElementById('bossHealth').style.width = window.innerWidth / 2 * self.hp / self.hpMax + 'px';
        document.getElementById('bossbar').innerHTML = 'Red Bird ' + self.hp + '/' + self.hpMax;
    }
    if(self.monsterType === 'possessedSpirit'){
        document.getElementById('bossHealth').style.width = window.innerWidth / 2 * self.hp / self.hpMax + 'px';
        document.getElementById('bossbar').innerHTML = 'Possessed Spirit ' + self.hp + '/' + self.hpMax;
    }
    if(self.monsterType === 'plantera'){
        document.getElementById('bossHealth').style.width = window.innerWidth / 2 * self.hp / self.hpMax + 'px';
        document.getElementById('bossbar').innerHTML = 'Plantera ' + self.hp + '/' + self.hpMax;
    }
    if(self.monsterType === 'whirlwind'){
        document.getElementById('bossHealth').style.width = window.innerWidth / 2 * self.hp / self.hpMax + 'px';
        document.getElementById('bossbar').innerHTML = 'Whirlwind ' + self.hp + '/' + self.hpMax;
    }
    if(self.monsterType === 'fireSpirit'){
        document.getElementById('bossHealth').style.width = window.innerWidth / 2 * self.hp / self.hpMax + 'px';
        document.getElementById('bossbar').innerHTML = 'Fire Spirit ' + self.hp + '/' + self.hpMax;
    }
    if(self.monsterType === 'sp'){
        document.getElementById('bossHealth').style.width = window.innerWidth / 2 * self.hp / self.hpMax + 'px';
        document.getElementById('bossbar').innerHTML = 'sp' + self.hp + '/' + self.hpMax;
        self.renderedImg = {
            body:renderPlayer(Img.playerBody,initPack.img.body),
            shirt:renderPlayer(Img.playerShirt,initPack.img.shirt),
            pants:renderPlayer(Img.playerPants,initPack.img.pants),
            hair:renderPlayer(Img.playerHair[initPack.img.hairType],initPack.img.hair),
        }
        self.render = document.createElement('canvas');
        var ctx = self.render.getContext('2d');
        ctx.canvas.width = 72 * 4;
        ctx.canvas.height = 152 * 4;
        ctx.drawImage(self.renderedImg.body,0,0);
        ctx.drawImage(self.renderedImg.shirt,0,0);
        ctx.drawImage(self.renderedImg.pants,0,0);
        ctx.drawImage(self.renderedImg.hair,0,0);
    }
    if(self.monsterType === 'tianmuGuarder'){
        self.renderedImg = {
            body:renderPlayer(Img.playerBody,initPack.img.body),
            shirt:renderPlayer(Img.playerShirt,initPack.img.shirt),
            pants:renderPlayer(Img.playerPants,initPack.img.pants),
            hair:renderPlayer(Img.playerHair[initPack.img.hairType],initPack.img.hair),
        }
        self.render = document.createElement('canvas');
        var ctx = self.render.getContext('2d');
        ctx.canvas.width = 72 * 4;
        ctx.canvas.height = 152 * 4;
        ctx.drawImage(self.renderedImg.body,0,0);
        ctx.drawImage(self.renderedImg.shirt,0,0);
        ctx.drawImage(self.renderedImg.pants,0,0);
        ctx.drawImage(self.renderedImg.hair,0,0);
    }
    if(self.monsterType === 'sampleprovidersp'){
        self.renderedImg = {
            body:renderPlayer(Img.playerBody,initPack.img.body),
            shirt:renderPlayer(Img.playerShirt,initPack.img.shirt),
            pants:renderPlayer(Img.playerPants,initPack.img.pants),
            hair:renderPlayer(Img.playerHair[initPack.img.hairType],initPack.img.hair),
        }
        self.render = document.createElement('canvas');
        var ctx = self.render.getContext('2d');
        ctx.canvas.width = 72 * 4;
        ctx.canvas.height = 152 * 4;
        ctx.drawImage(self.renderedImg.body,0,0);
        ctx.drawImage(self.renderedImg.shirt,0,0);
        ctx.drawImage(self.renderedImg.pants,0,0);
        ctx.drawImage(self.renderedImg.hair,0,0);
    }
    if(self.monsterType === 'suvanth'){
        self.renderedImg = {
            body:renderPlayer(Img.playerBody,initPack.img.body),
            shirt:renderPlayer(Img.playerShirt,initPack.img.shirt),
            pants:renderPlayer(Img.playerPants,initPack.img.pants),
            hair:renderPlayer(Img.playerHair[initPack.img.hairType],initPack.img.hair),
        }
        self.render = document.createElement('canvas');
        var ctx = self.render.getContext('2d');
        ctx.canvas.width = 72 * 4;
        ctx.canvas.height = 152 * 4;
        ctx.drawImage(self.renderedImg.body,0,0);
        ctx.drawImage(self.renderedImg.shirt,0,0);
        ctx.drawImage(self.renderedImg.pants,0,0);
        ctx.drawImage(self.renderedImg.hair,0,0);
    }
    self.update = function(){
        if(self.moveNumber > 0){
            self.x += self.moveX;
            self.y += self.moveY;
        }
        self.moveNumber -= 1;
    }
    self.draw = function(){
        if(self.monsterType === 'blueBird'){
            self.animation = Math.round(self.animation);
            ctx0.drawImage(Img.bird,self.animation % 2 * 12,14 * 0,11,13,self.x - 22,self.y - 26,44,52);
        }
        if(self.monsterType === 'greenBird'){
            self.animation = Math.round(self.animation);
            ctx0.drawImage(Img.bird,self.animation % 2 * 12,14 * 1,11,13,self.x - 22,self.y - 26,44,52);
        }
        if(self.monsterType === 'redBird'){
            self.animation = Math.round(self.animation);
            ctx0.drawImage(Img.bird,self.animation % 2 * 12,14 * 2,11,13,self.x - 44,self.y - 52,88,104);
        }
        if(self.monsterType === 'sandBird'){
            self.animation = Math.round(self.animation);
            ctx0.drawImage(Img.bird,self.animation % 2 * 12,14 * 3,11,13,self.x - 22,self.y - 32,44,52);
        }
        if(self.monsterType === 'charredBird'){
            self.animation = Math.round(self.animation);
            ctx0.drawImage(Img.bird,self.animation % 2 * 12,14 * 4,11,13,self.x - 22,self.y - 32,44,52);
        }
        if(self.monsterType === 'forestBird'){
            self.animation = Math.round(self.animation);
            ctx0.drawImage(Img.bird,self.animation % 2 * 12,14 * 5,11,13,self.x - 22,self.y - 32,44,52);
        }
        if(self.monsterType === 'blueBall'){
            ctx0.translate(self.x,self.y);
            ctx0.rotate(self.animation * 45 * Math.PI / 180);
            ctx0.drawImage(Img.ball,0,0,11,11,-22,-22,44,44);
            ctx0.rotate(-self.animation * 45 * Math.PI / 180);
            ctx0.translate(-self.x,-self.y);
        }
        if(self.monsterType === 'snowBall'){
            ctx0.translate(self.x,self.y);
            ctx0.rotate(self.animation * 45 * Math.PI / 180);
            ctx0.drawImage(Img.ball,0,12,11,11,-22,-22,44,44);
            ctx0.rotate(-self.animation * 45 * Math.PI / 180);
            ctx0.translate(-self.x,-self.y);
        }
        if(self.monsterType === 'redCherryBomb'){
            if(self.animation === 0){
                ctx0.drawImage(Img.cherryBomb,self.animation * 13,11 * 0,12,10,self.x - 24,self.y - 20,48,40);
            }
            else if(self.animation === 1){
                ctx0.drawImage(Img.cherryBomb,self.animation * 13,11 * 0,12,10,self.x - 24,self.y - 20,48,40);
            }
            else{
                ctx0.drawImage(Img.cherryBomb,Math.floor(self.animation) * 19 + 26,18 * 0,18,18,self.x - 72,self.y - 72,72 * 2,72 * 2);
            }
        }
        if(self.monsterType === 'blueCherryBomb'){
            if(self.animation === 0){
                ctx0.drawImage(Img.cherryBomb,self.animation * 13,11 * 1,12,10,self.x - 24,self.y - 20,48,40);
            }
            else if(self.animation === 1){
                ctx0.drawImage(Img.cherryBomb,self.animation * 13,11 * 1,12,10,self.x - 24,self.y - 20,48,40);
            }
            else{
                ctx0.drawImage(Img.cherryBomb,Math.floor(self.animation) * 19 + 26,18 * 0,18,18,self.x - 72,self.y - 72,72 * 2,72 * 2);
            }
        }
        if(self.monsterType === 'deathBomb'){
            if(self.animation === 0){
                ctx0.drawImage(Img.cherryBomb,self.animation * 13,11 * 2,12,10,self.x - 24,self.y - 20,48,40);
            }
            else if(self.animation === 1){
                ctx0.drawImage(Img.cherryBomb,self.animation * 13,11 * 2,12,10,self.x - 24,self.y - 20,48,40);
            }
            else{
                ctx0.drawImage(Img.cherryBomb,Math.floor(self.animation) * 19 + 26,18 * 0,18,18,self.x - 72,self.y - 72,72 * 2,72 * 2);
            }
        }
        if(self.monsterType === 'greenLizard'){
            if(self.animation < 2){
                ctx0.drawImage(Img.lizard,Math.floor(self.animation) * 13,9 * 0,12,8,self.x - 24,self.y - 16,48,32);
            }
            else{
                ctx0.drawImage(Img.lizard,Math.floor(self.animation) * 13 - 26,9 * 1,12,8,self.x - 24,self.y - 16,48,32);
            }
        }
        if(self.monsterType === 'waterLizard'){
            if(self.animation < 2){
                ctx0.drawImage(Img.lizard,Math.floor(self.animation) * 13,9 * 4,12,8,self.x - 24,self.y - 16,48,32);
            }
            else{
                ctx0.drawImage(Img.lizard,Math.floor(self.animation) * 13 - 26,9 * 5,12,8,self.x - 24,self.y - 16,48,32);
            }
        }
        if(self.monsterType === 'lightningLizard'){
            if(self.animation < 2){
                ctx0.drawImage(Img.lizard,Math.floor(self.animation) * 13,9 * 2,12,8,self.x - 48,self.y - 32,96,64);
            }
            else{
                ctx0.drawImage(Img.lizard,Math.floor(self.animation) * 13 - 26,9 * 3,12,8,self.x - 48,self.y - 32,96,64);
            }
        }
        if(self.monsterType === 'ghost'){
            ctx0.drawImage(Img.ghost,Math.floor(self.animation) * 11,22 * 0,10,21,self.x - 20,self.y - 42,40,84);
        }
        if(self.monsterType === 'lostSpirit'){
            ctx0.drawImage(Img.ghost,Math.floor(self.animation) * 11,22 * 1,10,21,self.x - 20,self.y - 42,40,84);
        }
        if(self.monsterType === 'possessedSpirit'){
            ctx0.drawImage(Img.ghost,Math.floor(self.animation) * 11,22 * 2,10,21,self.x - 40,self.y - 84,80,168);
        }
        if(self.monsterType === 'plantera'){
            ctx0.translate(self.x,self.y);
            ctx0.rotate(self.direction * Math.PI / 180);
            ctx0.drawImage(Img.plantera,0,self.animation * 14,13,13,-52,-52,104,104);
            ctx0.rotate(-self.direction * Math.PI / 180);
            ctx0.translate(-self.x,-self.y);
        }
        if(self.monsterType === 'thorn'){
            ctx0.translate(self.x,self.y);
            ctx0.rotate(self.animation * 45 * Math.PI / 180);
            ctx0.drawImage(Img.thorn,0,0,11,11,-22,-22,44,44);
            ctx0.rotate(-self.animation * 45 * Math.PI / 180);
            ctx0.translate(-self.x,-self.y);
        }
        if(self.monsterType === 'lightningTurret'){
            ctx0.drawImage(Img.lightningTurret,Math.floor(self.animation) * 10,14 * 0,9,13,self.x - 18,self.y - 26,36,52);
        }
        if(self.monsterType === 'lightningRammer'){
            ctx0.translate(self.x,self.y);
            ctx0.rotate(self.animation * 45 * Math.PI / 180);
            ctx0.drawImage(Img.lightningRammer,0,0,9,9,-18,-18,36,36);
            ctx0.rotate(-self.animation * 45 * Math.PI / 180);
            ctx0.translate(-self.x,-self.y);
        }
        if(self.monsterType === 'waterRammer'){
            ctx0.translate(self.x,self.y);
            ctx0.rotate(self.animation * 45 * Math.PI / 180);
            ctx0.drawImage(Img.waterRammer,0,0,9,9,-18,-18,36,36);
            ctx0.rotate(-self.animation * 45 * Math.PI / 180);
            ctx0.translate(-self.x,-self.y);
        }
        if(self.monsterType === 'whirlwind'){
            ctx0.translate(self.x,self.y);
            ctx0.rotate(self.animation * Math.PI / 180);
            ctx0.drawImage(Img.whirlwind,-46,-46,92,92);
            ctx0.rotate(-self.animation * Math.PI / 180);
            ctx0.translate(-self.x,-self.y);
        }
        if(self.monsterType === 'sp'){
            self.animation = Math.round(self.animation);
            drawPlayer(self.render,ctx0,self.animationDirection,self.animation,self.x,self.y + 18,4);
        }
        if(self.monsterType === 'tianmuGuarder'){
            ctx0.translate(self.x,self.y);
            ctx0.rotate((self.direction + 225) * Math.PI / 180);
            ctx0.drawImage(Img['halibutcannon'],-49,-15,64,64);
            ctx0.rotate((-self.direction - 225) * Math.PI / 180);
            ctx0.translate(-self.x,-self.y);
            self.animation = Math.round(self.animation);
            drawPlayer(self.render,ctx0,self.animationDirection,self.animation,self.x,self.y + 18,4);
        }
        if(self.monsterType === 'sampleprovidersp'){
            ctx0.translate(self.x,self.y);
            ctx0.rotate((self.direction + 270) * Math.PI / 180);
            ctx0.drawImage(Img['bookofdeath'],-35,15,64,64);
            ctx0.rotate((-self.direction - 270) * Math.PI / 180);
            ctx0.translate(-self.x,-self.y);
            self.animation = Math.round(self.animation);
            drawPlayer(self.render,ctx0,self.animationDirection,self.animation,self.x,self.y + 18,4);
        }
        if(self.monsterType === 'suvanth'){
            ctx0.translate(self.x,self.y);
            ctx0.rotate((self.direction + 45) * Math.PI / 180);
            ctx0.drawImage(Img['holytrident'],5,-89,84,84);
            ctx0.rotate((-self.direction - 45) * Math.PI / 180);
            ctx0.translate(-self.x,-self.y);
            self.animation = Math.round(self.animation);
            drawPlayer(self.render,ctx0,self.animationDirection,self.animation,self.x,self.y + 18,4);
        }
        if(self.monsterType === 'spgem'){
            ctx0.drawImage(Img.spgem,self.x - 27,self.y - 24,54,48);
        }
        if(self.monsterType === 'fireSpirit'){
            self.animation = Math.round(self.animation);
            ctx0.drawImage(Img.fireSpirit,self.animation % 2 * 13,14 * 0,12,13,self.x - 48,self.y - 52,96,104);
        }
        if(self.monsterType === 'rocopter'){
            self.animation = Math.round(self.animation);
            ctx0.drawImage(Img.rocopter,self.animation * 10,8 * 0,9,7,self.x - 36,self.y - 28,72,56);
        }
        if(self.monsterType === 'crab'){
            self.animation = Math.round(self.animation);
            ctx0.drawImage(Img.crab,self.animation * 14,9 * 0,13,8,self.x - 26,self.y - 16,52,32);
        }
        if(self.monsterType === 'cyanBeetle'){
            ctx0.drawImage(Img.beetle,Math.floor(self.animation) * 15,11 * 0,14,10,self.x - 28,self.y - 20,56,40);
        }
    }
    self.drawCtx1 = function(){
        if(self.monsterType === 'ghost'){
            ctx1.drawImage(Img.ghost,Math.floor(self.animation) * 11,22 * 0,10,21,self.x - 20,self.y - 42,40,84);
        }
        if(self.monsterType === 'lostSpirit'){
            ctx1.drawImage(Img.ghost,Math.floor(self.animation) * 11,22 * 1,10,21,self.x - 20,self.y - 42,40,84);
        }
        if(self.monsterType === 'possessedSpirit'){
            ctx1.drawImage(Img.ghost,Math.floor(self.animation) * 11,22 * 2,10,21,self.x - 40,self.y - 84,80,168);
        }
        if(self.monsterType === 'plantera'){
            ctx1.translate(self.x,self.y);
            ctx1.rotate(self.direction * Math.PI / 180);
            ctx1.drawImage(Img.plantera,0,self.animation * 14,13,13,-52,-52,104,104);
            ctx1.rotate(-self.direction * Math.PI / 180);
            ctx1.translate(-self.x,-self.y);
        }
        if(self.monsterType === 'thorn'){
            ctx1.translate(self.x,self.y);
            ctx1.rotate(self.animation * 10 * Math.PI / 180);
            ctx1.drawImage(Img.thorn,0,0,11,11,-22,-22,44,44);
            ctx1.rotate(-self.animation * 10 * Math.PI / 180);
            ctx1.translate(-self.x,-self.y);
        }
        if(self.monsterType === 'whirlwind'){
            ctx1.translate(self.x,self.y);
            ctx1.rotate(self.animation * Math.PI / 180);
            ctx1.drawImage(Img.whirlwind,-46,-46,92,92);
            ctx1.rotate(-self.animation * Math.PI / 180);
            ctx1.translate(-self.x,-self.y);
        }
        if(self.monsterType === 'sp'){
            self.animation = Math.round(self.animation);
            drawPlayer(self.render,ctx1,self.animationDirection,self.animation,self.x,self.y + 18,4);
        }
        if(self.monsterType === 'tianmuGuarder'){
            ctx1.translate(self.x,self.y);
            ctx1.rotate((self.direction + 225) * Math.PI / 180);
            ctx1.drawImage(Img['halibutcannon'],-49,-15,64,64);
            ctx1.rotate((-self.direction - 225) * Math.PI / 180);
            ctx1.translate(-self.x,-self.y);
            self.animation = Math.round(self.animation);
            drawPlayer(self.render,ctx1,self.animationDirection,self.animation,self.x,self.y + 18,4);
        }
        if(self.monsterType === 'sampleprovidersp'){
            ctx1.translate(self.x,self.y);
            ctx1.rotate((self.direction + 270) * Math.PI / 180);
            ctx1.drawImage(Img['bookofdeath'],-35,15,64,64);
            ctx1.rotate((-self.direction - 270) * Math.PI / 180);
            ctx1.translate(-self.x,-self.y);
            self.animation = Math.round(self.animation);
            drawPlayer(self.render,ctx1,self.animationDirection,self.animation,self.x,self.y + 18,4);
        }
        if(self.monsterType === 'suvanth'){
            ctx1.translate(self.x,self.y);
            ctx1.rotate((self.direction + 45) * Math.PI / 180);
            ctx1.drawImage(Img['holytrident'],5,-89,84,84);
            ctx1.rotate((-self.direction - 45) * Math.PI / 180);
            ctx1.translate(-self.x,-self.y);
            self.animation = Math.round(self.animation);
            drawPlayer(self.render,ctx1,self.animationDirection,self.animation,self.x,self.y + 18,4);
        }
        if(self.monsterType === 'spgem'){
            ctx1.drawImage(Img.spgem,self.x - 27,self.y - 24,54,48);
        }
        if(self.monsterType === 'rocopter'){
            self.animation = Math.round(self.animation);
            ctx1.drawImage(Img.rocopter,self.animation * 10,8 * 0,9,7,self.x - 36,self.y - 28,72,56);
        }
    }
    self.drawHp = function(){
        ctx1.drawImage(Img.healthBarEnemy,0,0,42,5,self.x - 63,self.y - self.height / 2 - 24,126,15);
        ctx1.drawImage(Img.healthBarEnemy,0,6,Math.round(42 * self.hp / self.hpMax),5,self.x - 63,self.y - self.height / 2 - 24,Math.round(126 * self.hp / self.hpMax),15);
        if(DEBUG){
            ctx1.strokeStyle = '#ff0000';
            ctx1.lineWidth = 4;
            ctx1.strokeRect(Math.floor(self.x / 64) * 64 - 16 * 64,Math.floor(self.y / 64) * 64 - 16 * 64,33 * 64,33 * 64);
            ctx1.strokeRect(Math.floor(self.x / 64) * 64,Math.floor(self.y / 64) * 64,1 * 64,1 * 64);
            ctx1.strokeRect(self.x,self.y,4,4);
        }
    }
    Monster.list[self.id] = self;
    return self;
}
Monster.list = {};
var Npc = function(initPack){
    if(initPack.type === 'StaticNpc' || initPack.type === undefined){
        return;
    }
    var self = {};
    self.id = initPack.id;
    self.x = initPack.x;
    self.y = initPack.y;
    self.nextX = initPack.x;
    self.nextY = initPack.y;
    self.moveX = 0;
    self.moveY = 0;
    self.img = initPack.img;
    self.renderedImg = {
        body:renderPlayer(Img.playerBody,self.img.body),
        shirt:renderPlayer(Img.playerShirt,self.img.shirt),
        pants:renderPlayer(Img.playerPants,self.img.pants),
        hair:renderPlayer(Img.playerHair[self.img.hairType],self.img.hair),
    }
    self.render = document.createElement('canvas');
    var ctx = self.render.getContext('2d');
    ctx.canvas.width = 72 * 4;
    ctx.canvas.height = 152 * 4;
    ctx.drawImage(self.renderedImg.body,0,0);
    ctx.drawImage(self.renderedImg.shirt,0,0);
    ctx.drawImage(self.renderedImg.pants,0,0);
    ctx.drawImage(self.renderedImg.hair,0,0);
    self.hp = initPack.hp;
    self.animation = initPack.animation;
    self.animationDirection = initPack.animationDirection;
    self.hpMax = initPack.hpMax;
    self.map = initPack.map;
    self.name = initPack.name;
    self.zindex = initPack.zindex;
    self.type = initPack.type;
    self.updated = true;
    self.update = function(){
        if(Math.abs(self.x - self.nextX) > 4){
            self.x += self.moveX;
        }
        if(Math.abs(self.y - self.nextY) > 4){
            self.y += self.moveY;
        }
    }
    self.draw = function(){
        if(self.map !== Player.list[selfId].map){
            return;
        }
        self.animation = Math.round(self.animation);
        drawPlayer(self.render,ctx0,self.animationDirection,self.animation,self.x,self.y,4);
    }
    self.drawName = function(){
        ctx1.font = "15px pixel";
        ctx1.fillStyle = '#ff7700';
        ctx1.textAlign = "center";
        ctx1.fillText(self.name,self.x,self.y - 62);
        if(DEBUG){
            ctx1.strokeStyle = '#ff0000';
            ctx1.lineWidth = 4;
            ctx1.strokeRect(Math.floor(self.x / 64) * 64,Math.floor(self.y / 64) * 64,1 * 64,1 * 64)
        }
    }
    Npc.list[self.id] = self;
    return self;
}
Npc.list = {};
var Pet = function(initPack){
    var self = {};
    self.id = initPack.id;
    self.x = initPack.x;
    self.y = initPack.y;
    self.nextX = initPack.x;
    self.nextY = initPack.y;
    self.moveX = 0;
    self.moveY = 0;
    self.map = initPack.map;
    self.name = initPack.name;
    self.mana = initPack.mana;
    self.manaMax = initPack.manaMax;
    self.petType = initPack.petType;
    self.animation = initPack.animation;
    self.zindex = initPack.zindex;
    self.type = initPack.type;
    self.updated = true;
    self.update = function(){
        if(Math.abs(self.x - self.nextX) > 4){
            self.x += self.moveX;
        }
        if(Math.abs(self.y - self.nextY) > 4){
            self.y += self.moveY;
        }
    }
    self.draw = function(){
        if(self.petType === 'Kiol'){
            ctx0.drawImage(Img.kiol,self.x - 20,self.y - 14,40,28);
        }
        if(self.petType === 'Cherrier'){
            ctx0.drawImage(Img.cherrier,Math.floor(self.animation) * 10,0,9,8,self.x - 18,self.y - 16,36,32);
        }
        if(self.petType === 'Sphere'){
            ctx0.translate(self.x,self.y);
            ctx0.rotate(self.animation * Math.PI / 180);
            ctx0.drawImage(Img.sphere,-22,-22,44,44);
            ctx0.rotate(-self.animation * Math.PI / 180);
            ctx0.translate(-self.x,-self.y);
        }
        if(self.petType === 'Thunderbird'){
            ctx0.drawImage(Img.thunderbird,Math.floor(self.animation) % 4 * 17,Math.floor(self.animation / 4) * 16,16,15,self.x - 32,self.y - 30,64,60);
        }
    }
    self.drawName = function(){
        ctx1.font = "15px pixel";
        ctx1.fillStyle = '#ff7700';
        ctx1.textAlign = "center";
        if(self.petType === 'sphere'){
            ctx1.fillText(self.name,self.x,self.y - 68);
            ctx1.drawImage(Img.manaBar,0,0,42,5,self.x - 63,self.y - 48,126,15);
            ctx1.drawImage(Img.manaBar,0,6,Math.round(42 * self.mana / self.manaMax),5,self.x - 63,self.y - 48,Math.round(126 * self.mana / self.manaMax),15);
        }
        else if(self.petType === 'thunderbird'){
            ctx1.fillText(self.name,self.x,self.y - 78);
            ctx1.drawImage(Img.manaBar,0,0,42,5,self.x - 63,self.y - 58,126,15);
            ctx1.drawImage(Img.manaBar,0,6,Math.round(42 * self.mana / self.manaMax),5,self.x - 63,self.y - 58,Math.round(126 * self.mana / self.manaMax),15);
        }
        else{
            ctx1.fillText(self.name,self.x,self.y - 52);
            ctx1.drawImage(Img.manaBar,0,0,42,5,self.x - 63,self.y - 36,126,15);
            ctx1.drawImage(Img.manaBar,0,6,Math.round(42 * self.mana / self.manaMax),5,self.x - 63,self.y - 36,Math.round(126 * self.mana / self.manaMax),15);
        }
        if(DEBUG){
            ctx1.strokeStyle = '#ff0000';
            ctx1.lineWidth = 4;
            ctx1.strokeRect(Math.floor(self.x / 64) * 64,Math.floor(self.y / 64) * 64,1 * 64,1 * 64);
        }
    }
    Pet.list[self.id] = self;
    return self;
}
Pet.list = {};
var DroppedItem = function(initPack){
    var self = {};
    self.id = initPack.id;
    self.x = initPack.x;
    self.y = initPack.y;
    self.nextX = initPack.x;
    self.nextY = initPack.y;
    self.moveX = 0;
    self.moveY = 0;
    self.map = initPack.map;
    self.item = initPack.item;
    self.allPlayers = initPack.allPlayers;
    self.parent = initPack.parent;
    self.type = initPack.type;
    self.direction = 0;
    self.updated = true;
    self.update = function(){
        if(Math.abs(self.x - self.nextX) > 4){
            self.x += self.moveX;
        }
        if(Math.abs(self.y - self.nextY) > 4){
            self.y += self.moveY;
        }
    }
    self.draw = function(){
        if(self.parent !== selfId && !self.allPlayers){
            return;
        }
        ctx0.translate(self.x,self.y);
        if(self.item.id.includes('trident')){
            ctx0.scale(Math.cos(self.direction / 180 * Math.PI), 1);
            ctx0.drawImage(Img[self.item.id],-42,-42,84,84);
            ctx0.scale(1 / Math.cos(self.direction / 180 * Math.PI), 1);
        }
        else{
            ctx0.scale(Math.cos(self.direction / 180 * Math.PI), 1);
            ctx0.drawImage(Img[self.item.id],-32,-32,64,64);
            ctx0.scale(1 / Math.cos(self.direction / 180 * Math.PI), 1);
        }
        ctx0.translate(-self.x,-self.y);
    }
    DroppedItem.list[self.id] = self;
    return self;
}
DroppedItem.list = {};
var Particle = function(initPack){
    var self = {};
    self.id = initPack.id;
    self.x = initPack.x;
    self.y = initPack.y;
    self.map = initPack.map;
    self.value = initPack.value;
    self.particleType = initPack.particleType;
    self.timer = initPack.timer;
    self.direction = initPack.direction;
    self.type = initPack.type;
    self.toRemove = false;
    self.update = function(){
        if(self.particleType === 'redDamage' || self.particleType === 'greenDamage'){
            self.x += 5 * self.direction / 4;
            self.y += -self.timer / 2 + 10 / 4;
            self.timer -= 1 / 4;
        }
        else if(self.particleType === 'bigOrangeDamage'){
            self.x += 6 * self.direction / 4;
            self.y += -self.timer / 2 + 10 / 4;
            self.timer -= 1 / 5;
        }
        else if(self.particleType === 'teleport'){
            self.x += Math.cos(self.direction / 180 * Math.PI);
            self.y += Math.sin(self.direction / 180 * Math.PI);
            self.timer -= 1 / 15;
        }
        else if(self.particleType === 'kill'){
            self.x += Math.cos(self.direction / 180 * Math.PI);
            self.y += Math.sin(self.direction / 180 * Math.PI);
            self.timer -= 1 / 5;
        }
        else if(self.particleType === 'heal'){
            self.x += Math.cos(self.direction / 180 * Math.PI);
            self.y += Math.sin(self.direction / 180 * Math.PI);
            self.timer -= 1 / 10;
        }
        else{
            self.timer -= 1 / 2;
        }
        if(self.timer < 0){
            self.toRemove = true;
        }
    }
    self.draw = function(){
        if(!showParticles){
            return;
        }
        if(self.particleType === 'redDamage'){
            ctx1.font = "30px pixel";
            ctx1.fillStyle = 'rgba(255,75,0,' + (self.timer / 5) + ')';
            ctx1.textAlign = "center";
            ctx1.fillText(self.value,self.x,self.y);
        }
        else if(self.particleType === 'greenDamage'){
            ctx1.font = "30px pixel";
            ctx1.fillStyle = 'rgba(0,255,0,' + (self.timer / 5) + ')';
            ctx1.textAlign = "center";
            ctx1.fillText(self.value,self.x,self.y);
        }
        else if(self.particleType === 'bigOrangeDamage'){
            ctx1.font = "40px pixel";
            ctx1.fillStyle = 'rgba(255,0,0,' + (self.timer / 5) + ')';
            ctx1.textAlign = "center";
            ctx1.fillText(self.value,self.x,self.y);
        }
        else if(self.particleType === 'fire'){
            var a = (self.timer / 5);
            ctx1.fillStyle = "rgba(255,75,0," + (a / 3 + 2 * a / 3 * Math.random()) + ")";
            ctx1.fillRect(self.x - 4,self.y - 4,4,4);
            ctx1.fillStyle = "rgba(255,75,0," + (a / 3 + 2 * a / 3 * Math.random()) + ")";
            ctx1.fillRect(self.x - 4,self.y,4,4);
            ctx1.fillStyle = "rgba(255,75,0," + (a / 3 + 2 * a / 3 * Math.random()) + ")";
            ctx1.fillRect(self.x,self.y - 4,4,4);
            ctx1.fillStyle = "rgba(255,75,0," + (a / 3 + 2 * a / 3 * Math.random()) + ")";
            ctx1.fillRect(self.x,self.y,4,4);
        }
        else if(self.particleType === 'electricity'){
            var a = (self.timer / 5);
            ctx1.fillStyle = "rgba(255,255,0," + (a / 3 + 2 * a / 3 * Math.random()) + ")";
            ctx1.fillRect(self.x - 4,self.y - 4,4,4);
            ctx1.fillStyle = "rgba(255,255,0," + (a / 3 + 2 * a / 3 * Math.random()) + ")";
            ctx1.fillRect(self.x - 4,self.y,4,4);
            ctx1.fillStyle = "rgba(255,255,0," + (a / 3 + 2 * a / 3 * Math.random()) + ")";
            ctx1.fillRect(self.x,self.y - 4,4,4);
            ctx1.fillStyle = "rgba(255,255,0," + (a / 3 + 2 * a / 3 * Math.random()) + ")";
            ctx1.fillRect(self.x,self.y,4,4);
        }
        else if(self.particleType === 'death'){
            var a = (self.timer / 5);
            ctx1.fillStyle = "rgba(0,0,0," + (a / 3 + 2 * a / 3 * Math.random()) + ")";
            ctx1.fillRect(self.x - 4,self.y - 4,4,4);
            ctx1.fillStyle = "rgba(0,0,0," + (a / 3 + 2 * a / 3 * Math.random()) + ")";
            ctx1.fillRect(self.x - 4,self.y,4,4);
            ctx1.fillStyle = "rgba(0,0,0," + (a / 3 + 2 * a / 3 * Math.random()) + ")";
            ctx1.fillRect(self.x,self.y - 4,4,4);
            ctx1.fillStyle = "rgba(0,0,0," + (a / 3 + 2 * a / 3 * Math.random()) + ")";
            ctx1.fillRect(self.x,self.y,4,4);
        }
        else if(self.particleType === 'frost'){
            var a = (self.timer / 5);
            ctx1.fillStyle = "rgba(0,255,255," + (a / 3 + 2 * a / 3 * Math.random()) + ")";
            ctx1.fillRect(self.x - 4,self.y - 4,4,4);
            ctx1.fillStyle = "rgba(0,255,255," + (a / 3 + 2 * a / 3 * Math.random()) + ")";
            ctx1.fillRect(self.x - 4,self.y,4,4);
            ctx1.fillStyle = "rgba(0,255,255," + (a / 3 + 2 * a / 3 * Math.random()) + ")";
            ctx1.fillRect(self.x,self.y - 4,4,4);
            ctx1.fillStyle = "rgba(0,255,255," + (a / 3 + 2 * a / 3 * Math.random()) + ")";
            ctx1.fillRect(self.x,self.y,4,4);
        }
        else if(self.particleType === 'water'){
            var a = (self.timer / 5);
            ctx1.fillStyle = "rgba(0,0,255," + (a / 3 + 2 * a / 3 * Math.random()) + ")";
            ctx1.fillRect(self.x - 4,self.y - 4,4,4);
            ctx1.fillStyle = "rgba(0,0,255," + (a / 3 + 2 * a / 3 * Math.random()) + ")";
            ctx1.fillRect(self.x - 4,self.y,4,4);
            ctx1.fillStyle = "rgba(0,0,255," + (a / 3 + 2 * a / 3 * Math.random()) + ")";
            ctx1.fillRect(self.x,self.y - 4,4,4);
            ctx1.fillStyle = "rgba(0,0,255," + (a / 3 + 2 * a / 3 * Math.random()) + ")";
            ctx1.fillRect(self.x,self.y,4,4);
        }
        else if(self.particleType === 'teleport'){
            ctx1.fillStyle = "rgba(125,0,255," + (self.timer / 15) + ")";
            ctx1.fillRect(self.x - 4,self.y - 4,8,8);
        }
        else if(self.particleType === 'kill'){
            ctx1.fillStyle = "rgba(255,125,0," + (self.timer / 15) + ")";
            ctx1.fillRect(self.x - 4,self.y - 4,8,8);
        }
        else if(self.particleType === 'heal'){
            ctx1.fillStyle = "rgba(0,255,0," + (self.timer / 15) + ")";
            ctx1.fillRect(self.x - 4,self.y - 4,8,8);
        }
    }
    Particle.list[self.id] = self;
    return self;
}
Particle.list = {};
window.onoffline = function(event){
    socket.emit('timeout');
};

socket.on('selfId',function(data){
    selfId = data.id;
    chat = '<div>Welcome to Meadow Guarders Open ' + VERSION + '!</div>';
    chatText.innerHTML = '<div>Welcome to Meadow Guarders Open ' + VERSION + '!</div>';
    gameDiv.style.display = 'inline-block';
});
socket.on('update',function(data){
    for(var i in Player.list){
        Player.list[i].updated = false;
    }
    for(var i in Projectile.list){
        Projectile.list[i].updated = false;
    }
    for(var i in Monster.list){
        Monster.list[i].updated = false;
    }
    for(var i in Npc.list){
        Npc.list[i].updated = false;
    }
    for(var i in Pet.list){
        Pet.list[i].updated = false;
    }
    for(var i in DroppedItem.list){
        DroppedItem.list[i].updated = false;
    }
    if(data){
        if(data.player.length > 0){
            for(var i = 0;i < data.player.length;i++){
                if(Player.list[data.player[i].id]){
                    if(data.player[i].x !== undefined){
                        Player.list[data.player[i].id].nextX = data.player[i].x;
                    }
                    Player.list[data.player[i].id].moveX = (Player.list[data.player[i].id].nextX - Player.list[data.player[i].id].x) / 4;
                    if(data.player[i].y !== undefined){
                        Player.list[data.player[i].id].nextY = data.player[i].y;
                    }
                    Player.list[data.player[i].id].moveY = (Player.list[data.player[i].id].nextY - Player.list[data.player[i].id].y) / 4;
                    Player.list[data.player[i].id].moveNumber = 4;
                    if(data.player[i].spdX !== undefined){
                        Player.list[data.player[i].id].spdX = data.player[i].spdX;
                    }
                    if(data.player[i].spdY !== undefined){
                        Player.list[data.player[i].id].spdY = data.player[i].spdY;
                    }
                    if(data.player[i].img !== undefined){
                        if(!arrayIsEqual(data.player[i].img.body,Player.list[data.player[i].id].img.body)){
                            Player.list[data.player[i].id].renderedImg.body = renderPlayer(Img.playerBody,data.player[i].img.body);
                        }
                        if(!arrayIsEqual(data.player[i].img.shirt,Player.list[data.player[i].id].img.shirt)){
                            Player.list[data.player[i].id].renderedImg.shirt = renderPlayer(Img.playerShirt,data.player[i].img.shirt);
                        }
                        if(!arrayIsEqual(data.player[i].img.pants,Player.list[data.player[i].id].img.pants)){
                            Player.list[data.player[i].id].renderedImg.pants = renderPlayer(Img.playerPants,data.player[i].img.pants);
                        }
                        if(data.player[i].img.hair !== Player.list[data.player[i].id].img.hair){
                            Player.list[data.player[i].id].renderedImg.hair = renderPlayer(Img.playerHair[data.player[i].img.hairType],data.player[i].img.hair);
                        }
                        if(!arrayIsEqual(data.player[i].img.hairType,Player.list[data.player[i].id].img.hairType)){
                            Player.list[data.player[i].id].renderedImg.hair = renderPlayer(Img.playerHair[data.player[i].img.hairType],data.player[i].img.hair);
                        }
                        var ctx = Player.list[data.player[i].id].render.getContext('2d');
                        ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);
                        ctx.drawImage(Player.list[data.player[i].id].renderedImg.body,0,0);
                        ctx.drawImage(Player.list[data.player[i].id].renderedImg.shirt,0,0);
                        ctx.drawImage(Player.list[data.player[i].id].renderedImg.pants,0,0);
                        ctx.drawImage(Player.list[data.player[i].id].renderedImg.hair,0,0);
                    }
                    if(data.player[i].animationDirection !== undefined){
                        Player.list[data.player[i].id].animationDirection = data.player[i].animationDirection;
                    }
                    if(data.player[i].direction !== undefined){
                        Player.list[data.player[i].id].direction = data.player[i].direction;
                    }
                    if(data.player[i].hp !== undefined){
                        Player.list[data.player[i].id].hp = data.player[i].hp;
                        if(data.player[i].id === selfId){
                            healthBarText.innerHTML = Player.list[data.player[i].id].hp + " / " + Player.list[data.player[i].id].hpMax;
                            healthBarValue.style.width = "" + 150 * Player.list[data.player[i].id].hp / Player.list[data.player[i].id].hpMax + "px";
                        }
                    }
                    if(data.player[i].hpMax !== undefined){
                        Player.list[data.player[i].id].hpMax = data.player[i].hpMax;
                        if(data.player[i].id === selfId){
                            healthBarText.innerHTML = Player.list[data.player[i].id].hp + " / " + Player.list[data.player[i].id].hpMax;
                            healthBarValue.style.width = "" + 150 * Player.list[data.player[i].id].hp / Player.list[data.player[i].id].hpMax + "px";
                        }
                    }
                    if(data.player[i].xp !== undefined){
                        Player.list[data.player[i].id].xp = data.player[i].xp;
                        if(data.player[i].id === selfId){
                            var xpText = Player.list[data.player[i].id].xp + " ";
                            var xpMaxText = "/ " + Player.list[data.player[i].id].xpMax;
                            if(Player.list[data.player[i].id].xp > 999999999999999){
                                xpText = Math.round(Player.list[data.player[i].id].xp / 100000000000000) / 10 + "Q ";
                            }
                            else if(Player.list[data.player[i].id].xp > 999999999999){
                                xpText = Math.round(Player.list[data.player[i].id].xp / 100000000000) / 10 + "T ";
                            }
                            else if(Player.list[data.player[i].id].xp > 999999999){
                                xpText = Math.round(Player.list[data.player[i].id].xp / 100000000) / 10 + "B ";
                            }
                            else if(Player.list[data.player[i].id].xp > 999999){
                                xpText = Math.round(Player.list[data.player[i].id].xp / 100000) / 10 + "M ";
                            }
                            else if(Player.list[data.player[i].id].xp > 9999){
                                xpText = Math.round(Player.list[data.player[i].id].xp / 100) / 10 + "K ";
                            }
                            if(Player.list[data.player[i].id].xpMax > 999999999999999){
                                xpMaxText = "/ " + Math.round(Player.list[data.player[i].id].xpMax / 100000000000000) / 10 + "Q";
                            }
                            else if(Player.list[data.player[i].id].xpMax > 999999999999){
                                xpMaxText = "/ " + Math.round(Player.list[data.player[i].id].xpMax / 100000000000) / 10 + "T";
                            }
                            else if(Player.list[data.player[i].id].xpMax > 999999999){
                                xpMaxText = "/ " + Math.round(Player.list[data.player[i].id].xpMax / 100000000) / 10 + "B";
                            }
                            else if(Player.list[data.player[i].id].xpMax > 999999){
                                xpMaxText = "/ " + Math.round(Player.list[data.player[i].id].xpMax / 100000) / 10 + "M";
                            }
                            else if(Player.list[data.player[i].id].xpMax > 9999){
                                xpMaxText = "/ " + Math.round(Player.list[data.player[i].id].xpMax / 100) / 10 + "K";
                            }
                            xpBarText.innerHTML = xpText + xpMaxText;
                            xpBarValue.style.width = "" + 150 * Player.list[data.player[i].id].xp / Player.list[data.player[i].id].xpMax + "px";
                        }
                    }
                    if(data.player[i].xpMax !== undefined){
                        Player.list[data.player[i].id].xpMax = data.player[i].xpMax;
                        if(data.player[i].id === selfId){
                            var xpText = Player.list[data.player[i].id].xp + " ";
                            var xpMaxText = "/ " + Player.list[data.player[i].id].xpMax;
                            if(Player.list[data.player[i].id].xp > 999999999999999){
                                xpText = Math.round(Player.list[data.player[i].id].xp / 100000000000000) / 10 + "Q ";
                            }
                            else if(Player.list[data.player[i].id].xp > 999999999999){
                                xpText = Math.round(Player.list[data.player[i].id].xp / 100000000000) / 10 + "T ";
                            }
                            else if(Player.list[data.player[i].id].xp > 999999999){
                                xpText = Math.round(Player.list[data.player[i].id].xp / 100000000) / 10 + "B ";
                            }
                            else if(Player.list[data.player[i].id].xp > 999999){
                                xpText = Math.round(Player.list[data.player[i].id].xp / 100000) / 10 + "M ";
                            }
                            else if(Player.list[data.player[i].id].xp > 9999){
                                xpText = Math.round(Player.list[data.player[i].id].xp / 100) / 10 + "K ";
                            }
                            if(Player.list[data.player[i].id].xpMax > 999999999999999){
                                xpMaxText = "/ " + Math.round(Player.list[data.player[i].id].xpMax / 100000000000000) / 10 + "Q";
                            }
                            else if(Player.list[data.player[i].id].xpMax > 999999999999){
                                xpMaxText = "/ " + Math.round(Player.list[data.player[i].id].xpMax / 100000000000) / 10 + "T";
                            }
                            else if(Player.list[data.player[i].id].xpMax > 999999999){
                                xpMaxText = "/ " + Math.round(Player.list[data.player[i].id].xpMax / 100000000) / 10 + "B";
                            }
                            else if(Player.list[data.player[i].id].xpMax > 999999){
                                xpMaxText = "/ " + Math.round(Player.list[data.player[i].id].xpMax / 100000) / 10 + "M";
                            }
                            else if(Player.list[data.player[i].id].xpMax > 9999){
                                xpMaxText = "/ " + Math.round(Player.list[data.player[i].id].xpMax / 100) / 10 + "K";
                            }
                            xpBarText.innerHTML = xpText + xpMaxText;
                            xpBarValue.style.width = "" + 150 * Player.list[data.player[i].id].xp / Player.list[data.player[i].id].xpMax + "px";
                        }
                    }
                    if(data.player[i].mana !== undefined){
                        Player.list[data.player[i].id].mana = Math.round(data.player[i].mana);
                        if(data.player[i].id === selfId){
                            manaBarText.innerHTML = Player.list[data.player[i].id].mana + " / " + Player.list[data.player[i].id].manaMax;
                            manaBarValue.style.width = "" + 150 * Player.list[data.player[i].id].mana / Player.list[data.player[i].id].manaMax + "px";
                        }
                    }
                    if(data.player[i].manaMax !== undefined){
                        Player.list[data.player[i].id].manaMax = data.player[i].manaMax;
                        if(data.player[i].id === selfId){
                            manaBarText.innerHTML = Player.list[data.player[i].id].mana + " / " + Player.list[data.player[i].id].manaMax;
                            manaBarValue.style.width = "" + 150 * Player.list[data.player[i].id].mana / Player.list[data.player[i].id].manaMax + "px";
                        }
                    }
                    if(data.player[i].level !== undefined){
                        Player.list[data.player[i].id].level = data.player[i].level;
                    }
                    if(data.player[i].map !== undefined){
                        Player.list[data.player[i].id].map = data.player[i].map;
                    }
                    if(data.player[i].attackCost !== undefined){
                        Player.list[data.player[i].id].attackCost = data.player[i].attackCost;
                    }
                    if(data.player[i].healCost !== undefined){
                        Player.list[data.player[i].id].healCost = data.player[i].healCost;
                    }
                    if(data.player[i].useTime !== undefined){
                        Player.list[data.player[i].id].useTime = data.player[i].useTime;
                    }
                    if(data.player[i].mapWidth !== undefined){
                        Player.list[data.player[i].id].mapWidth = data.player[i].mapWidth;
                    }
                    if(data.player[i].mapHeight !== undefined){
                        Player.list[data.player[i].id].mapHeight = data.player[i].mapHeight;
                    }
                    if(data.player[i].stats !== undefined){
                        Player.list[data.player[i].id].stats = data.player[i].stats;
                    }
                    if(data.player[i].debuffs !== undefined){
                        Player.list[data.player[i].id].debuffs = data.player[i].debuffs;
                        if(data.player[i].id === selfId){
                            document.getElementById('debuffs').innerHTML = '';
                            if(Player.list[data.player[i].id].hp > 0){
                                for(var j in Player.list[data.player[i].id].debuffs){
                                    var time = Math.ceil(Player.list[data.player[i].id].debuffs[j].time / 20);
                                    if(time < 60){
                                        time += 'sec';
                                    }
                                    else{
                                        time = Math.ceil(time / 60) + 'min';
                                    }
                                    document.getElementById('debuffs').innerHTML += '<div class="debuff UI-display-light" style="opacity:' + Player.list[data.player[i].id].debuffs[j].time / 20 + '"><image src="./client/icon/debuffs/' + Player.list[data.player[i].id].debuffs[j].id + '.png"><br><div style="padding-top: -3px;padding-right: 0px;padding-bottom: 2px;padding-left: 2px;">' + time + '</div>';
                                }
                            }
                        }
                    }
                    if(data.player[i].questStats !== undefined){
                        Player.list[data.player[i].id].questStats = data.player[i].questStats;
                        if(data.player[i].id === selfId){
                            document.getElementById('questDropdown').innerHTML = '';
                            for(var j in questData){
                                var requirementsMet = true;
                                for(var k in questData[j].requirements){
                                    if(data.player[i].questStats[questData[j].requirements[k]] === false){
                                        requirementsMet = false;
                                    }
                                    else if(questData[j].requirements[k].slice(0,4) === 'Lvl '){
                                        if(parseInt(questData[j].requirements[k].slice(4,questData[j].requirements[k].length),10) > Player.list[data.player[i].id].level){
                                            requirementsMet = false;
                                        }
                                    }
                                }
                                if(requirementsMet){
                                    document.getElementById('questDropdown').innerHTML += '<option>' + j + '</option>';
                                }
                            }
                            questChange();
                        }
                    }
                    if(data.player[i].animation !== undefined){
                        Player.list[data.player[i].id].animation = data.player[i].animation;
                    }
                    if(data.player[i].username !== undefined){
                        Player.list[data.player[i].id].username = data.player[i].username;
                    }
                    if(data.player[i].displayName !== undefined){
                        Player.list[data.player[i].id].displayName = data.player[i].displayName;
                    }
                    if(data.player[i].currentItem !== undefined){
                        Player.list[data.player[i].id].currentItem = data.player[i].currentItem;
                    }
                    if(data.player[i].coins !== undefined){
                        Player.list[data.player[i].id].coins = data.player[i].coins;
                        if(data.player[i].id === selfId){
                            document.getElementById('goldcoinDiv').innerHTML = Math.floor(Player.list[data.player[i].id].coins / 10000);
                            document.getElementById('silvercoinDiv').innerHTML = Math.floor(Player.list[data.player[i].id].coins / 100) % 100;
                            document.getElementById('bronzecoinDiv').innerHTML = Player.list[data.player[i].id].coins % 100;
                        }
                    }
                    if(data.player[i].devCoins !== undefined){
                        Player.list[data.player[i].id].devCoins = data.player[i].devCoins;
                        if(data.player[i].id === selfId){
                            document.getElementById('devcoinDiv').innerHTML = Player.list[data.player[i].id].devCoins;
                        }
                    }
                    if(data.player[i].damageDone !== undefined){
                        Player.list[data.player[i].id].damageDone = data.player[i].damageDone;
                        if(data.player[i].id === selfId){
                            document.getElementById('dps').innerHTML = Player.list[data.player[i].id].damageDone + ' DPS';
                            if(Player.list[data.player[i].id].damageDone > Player.list[data.player[i].id].maxDamageDone){
                                Player.list[data.player[i].id].maxDamageDone = Player.list[data.player[i].id].damageDone;
                                document.getElementById('maxdps').innerHTML = Player.list[data.player[i].id].maxDamageDone + ' Max DPS';
                            }
                        }
                    }
                    if(data.player[i].zindex !== undefined){
                        Player.list[data.player[i].id].zindex = data.player[i].zindex;
                    }
                    Player.list[data.player[i].id].updated = true;
                }
                else{
                    new Player(data.player[i]);
                }
            }
        }
        if(data.projectile.length > 0){
            for(var i = 0;i < data.projectile.length;i++){
                if(Projectile.list[data.projectile[i].id]){
                    Projectile.list[data.projectile[i].id].moveX = 0;
                    Projectile.list[data.projectile[i].id].moveY = 0;
                    if(data.projectile[i].x !== undefined){
                        Projectile.list[data.projectile[i].id].nextX = data.projectile[i].x;
                    }
                    Projectile.list[data.projectile[i].id].moveX = (Projectile.list[data.projectile[i].id].nextX - Projectile.list[data.projectile[i].id].x) / 4;
                    if(data.projectile[i].y !== undefined){
                        Projectile.list[data.projectile[i].id].nextY = data.projectile[i].y;
                    }
                    Projectile.list[data.projectile[i].id].moveY = (Projectile.list[data.projectile[i].id].nextY - Projectile.list[data.projectile[i].id].y) / 4;
                    Projectile.list[data.projectile[i].id].moveNumber = 4;
                    if(data.projectile[i].map !== undefined){
                        Projectile.list[data.projectile[i].id].map = data.projectile[i].map;
                    }
                    if(data.projectile[i].width !== undefined){
                        Projectile.list[data.projectile[i].id].width = data.projectile[i].width;
                    }
                    if(data.projectile[i].height !== undefined){
                        Projectile.list[data.projectile[i].id].height = data.projectile[i].height;
                    }
                    if(data.projectile[i].projectileType !== undefined){
                        Projectile.list[data.projectile[i].id].projectileType = data.projectile[i].projectileType;
                    }
                    if(data.projectile[i].direction !== undefined){
                        Projectile.list[data.projectile[i].id].direction = data.projectile[i].direction;
                    }
                    if(data.projectile[i].zindex !== undefined){
                        Projectile.list[data.projectile[i].id].zindex = data.projectile[i].zindex;
                    }
                    Projectile.list[data.projectile[i].id].updated = true;
                }
                else{
                    new Projectile(data.projectile[i]);
                }
            }
        }
        if(data.monster.length > 0){
            for(var i = 0;i < data.monster.length;i++){
                if(Monster.list[data.monster[i].id]){
                    Monster.list[data.monster[i].id].moveX = 0;
                    Monster.list[data.monster[i].id].moveY = 0;
                    if(data.monster[i].x !== undefined){
                        Monster.list[data.monster[i].id].nextX = data.monster[i].x;
                    }
                    Monster.list[data.monster[i].id].moveX = (Monster.list[data.monster[i].id].nextX - Monster.list[data.monster[i].id].x) / 4;
                    if(data.monster[i].y !== undefined){
                        Monster.list[data.monster[i].id].nextY = data.monster[i].y;
                    }
                    Monster.list[data.monster[i].id].moveY = (Monster.list[data.monster[i].id].nextY - Monster.list[data.monster[i].id].y) / 4;
                    Monster.list[data.monster[i].id].moveNumber = 4;
                    if(data.monster[i].hp !== undefined){
                        Monster.list[data.monster[i].id].hp = Math.max(data.monster[i].hp,0);
                        if(Monster.list[data.monster[i].id].monsterType === 'lightningLizard'){
                            document.getElementById('bossHealth').style.width = window.innerWidth / 2 * Monster.list[data.monster[i].id].hp / Monster.list[data.monster[i].id].hpMax + 'px';
                            document.getElementById('bossbar').innerHTML = 'Lightning Lizard ' + Monster.list[data.monster[i].id].hp + '/' + Monster.list[data.monster[i].id].hpMax;
                        }
                        if(Monster.list[data.monster[i].id].monsterType === 'redBird'){
                            document.getElementById('bossHealth').style.width = window.innerWidth / 2 * Monster.list[data.monster[i].id].hp / Monster.list[data.monster[i].id].hpMax + 'px';
                            document.getElementById('bossbar').innerHTML = 'Red Bird ' + Monster.list[data.monster[i].id].hp + '/' + Monster.list[data.monster[i].id].hpMax;
                        }
                        if(Monster.list[data.monster[i].id].monsterType === 'possessedSpirit'){
                            document.getElementById('bossHealth').style.width = window.innerWidth / 2 * Monster.list[data.monster[i].id].hp / Monster.list[data.monster[i].id].hpMax + 'px';
                            document.getElementById('bossbar').innerHTML = 'Possessed Spirit ' + Monster.list[data.monster[i].id].hp + '/' + Monster.list[data.monster[i].id].hpMax;
                        }
                        if(Monster.list[data.monster[i].id].monsterType === 'plantera'){
                            document.getElementById('bossHealth').style.width = window.innerWidth / 2 * Monster.list[data.monster[i].id].hp / Monster.list[data.monster[i].id].hpMax + 'px';
                            document.getElementById('bossbar').innerHTML = 'Plantera ' + Monster.list[data.monster[i].id].hp + '/' + Monster.list[data.monster[i].id].hpMax;
                        }
                        if(Monster.list[data.monster[i].id].monsterType === 'whirlwind'){
                            document.getElementById('bossHealth').style.width = window.innerWidth / 2 * Monster.list[data.monster[i].id].hp / Monster.list[data.monster[i].id].hpMax + 'px';
                            document.getElementById('bossbar').innerHTML = 'Whirlwind ' + Monster.list[data.monster[i].id].hp + '/' + Monster.list[data.monster[i].id].hpMax;
                        }
                        if(Monster.list[data.monster[i].id].monsterType === 'fireSpirit'){
                            document.getElementById('bossHealth').style.width = window.innerWidth / 2 * Monster.list[data.monster[i].id].hp / Monster.list[data.monster[i].id].hpMax + 'px';
                            document.getElementById('bossbar').innerHTML = 'Fire Spirit ' + Monster.list[data.monster[i].id].hp + '/' + Monster.list[data.monster[i].id].hpMax;
                        }
                        if(Monster.list[data.monster[i].id].monsterType === 'sp'){
                            document.getElementById('bossHealth').style.width = window.innerWidth / 2 * Monster.list[data.monster[i].id].hp / Monster.list[data.monster[i].id].hpMax + 'px';
                            document.getElementById('bossbar').innerHTML = 'sp ' + Monster.list[data.monster[i].id].hp + '/' + Monster.list[data.monster[i].id].hpMax;
                        }
                    }
                    if(data.monster[i].hpMax !== undefined){
                        Monster.list[data.monster[i].id].hpMax = data.monster[i].hpMax;
                    }
                    if(data.monster[i].animation !== undefined){
                        Monster.list[data.monster[i].id].animation = data.monster[i].animation;
                    }
                    if(data.monster[i].animationDirection !== undefined){
                        Monster.list[data.monster[i].id].animationDirection = data.monster[i].animationDirection;
                    }
                    if(data.monster[i].direction !== undefined){
                        Monster.list[data.monster[i].id].direction = data.monster[i].direction;
                    }
                    if(data.monster[i].zindex !== undefined){
                        Monster.list[data.monster[i].id].zindex = data.monster[i].zindex;
                    }
                    if(data.monster[i].width !== undefined){
                        Monster.list[data.monster[i].id].width = data.monster[i].width;
                    }
                    if(data.monster[i].height !== undefined){
                        Monster.list[data.monster[i].id].height = data.monster[i].height;
                    }
                    Monster.list[data.monster[i].id].updated = true;
                }
                else{
                    var monster = new Monster(data.monster[i]);
                    if(monster.monsterType === 'lightningLizard'){
                        document.getElementById('bossHealth').style.width = window.innerWidth / 2 * monster.hp / monster.hpMax + 'px';
                        document.getElementById('bossbar').innerHTML = 'Lightning Lizard ' + monster.hp + '/' + monster.hpMax;
                    }
                    if(monster.monsterType === 'redBird'){
                        document.getElementById('bossHealth').style.width = window.innerWidth / 2 * monster.hp / monster.hpMax + 'px';
                        document.getElementById('bossbar').innerHTML = 'Red Bird ' + monster.hp + '/' + monster.hpMax;
                    }
                    if(monster.monsterType === 'possessedSpirit'){
                        document.getElementById('bossHealth').style.width = window.innerWidth / 2 * monster.hp / monster.hpMax + 'px';
                        document.getElementById('bossbar').innerHTML = 'Possessed Spirit ' + monster.hp + '/' + monster.hpMax;
                    }
                    if(monster.monsterType === 'plantera'){
                        document.getElementById('bossHealth').style.width = window.innerWidth / 2 * monster.hp / monster.hpMax + 'px';
                        document.getElementById('bossbar').innerHTML = 'Plantera ' + monster.hp + '/' + monster.hpMax;
                    }
                    if(monster.monsterType === 'whirlwind'){
                        document.getElementById('bossHealth').style.width = window.innerWidth / 2 * monster.hp / monster.hpMax + 'px';
                        document.getElementById('bossbar').innerHTML = 'Whirlwind ' + monster.hp + '/' + monster.hpMax;
                    }
                    if(monster.monsterType === 'fireSpirit'){
                        document.getElementById('bossHealth').style.width = window.innerWidth / 2 * monster.hp / monster.hpMax + 'px';
                        document.getElementById('bossbar').innerHTML = 'Fire Spirit ' + monster.hp + '/' + monster.hpMax;
                    }
                    if(monster.monsterType === 'sp'){
                        document.getElementById('bossHealth').style.width = window.innerWidth / 2 * monster.hp / monster.hpMax + 'px';
                        document.getElementById('bossbar').innerHTML = 'sp ' + monster.hp + '/' + monster.hpMax;
                    }
                }
            }
        }
        if(data.npc.length > 0){
            for(var i = 0;i < data.npc.length;i++){
                if(Npc.list[data.npc[i].id]){
                    if(data.npc[i].x !== undefined){
                        Npc.list[data.npc[i].id].nextX = data.npc[i].x;
                    }
                    Npc.list[data.npc[i].id].moveX = (Npc.list[data.npc[i].id].nextX - Npc.list[data.npc[i].id].x) / 4;
                    if(data.npc[i].y !== undefined){
                        Npc.list[data.npc[i].id].nextY = data.npc[i].y;
                    }
                    Npc.list[data.npc[i].id].moveY = (Npc.list[data.npc[i].id].nextY - Npc.list[data.npc[i].id].y) / 4;
                    if(data.npc[i].animationDirection !== undefined){
                        Npc.list[data.npc[i].id].animationDirection = data.npc[i].animationDirection;
                    }
                    if(data.npc[i].hp !== undefined){
                        Npc.list[data.npc[i].id].hp = data.npc[i].hp;
                    }
                    if(data.npc[i].hpMax !== undefined){
                        Npc.list[data.npc[i].id].hpMax = data.npc[i].hpMax;
                    }
                    if(data.npc[i].animation !== undefined){
                        Npc.list[data.npc[i].id].animation = data.npc[i].animation;
                    }
                    if(data.npc[i].zindex !== undefined){
                        Npc.list[data.npc[i].id].zindex = data.npc[i].zindex;
                    }
                    Npc.list[data.npc[i].id].updated = true;
                }
                else{
                    new Npc(data.npc[i]);
                }
            }
        }
        if(data.pet.length > 0){
            for(var i = 0;i < data.pet.length;i++){
                if(Pet.list[data.pet[i].id]){
                    if(data.pet[i].x !== undefined){
                        Pet.list[data.pet[i].id].nextX = data.pet[i].x;
                    }
                    Pet.list[data.pet[i].id].moveX = (Pet.list[data.pet[i].id].nextX - Pet.list[data.pet[i].id].x) / 4;
                    if(data.pet[i].y !== undefined){
                        Pet.list[data.pet[i].id].nextY = data.pet[i].y;
                    }
                    Pet.list[data.pet[i].id].moveY = (Pet.list[data.pet[i].id].nextY - Pet.list[data.pet[i].id].y) / 4;
                    if(data.pet[i].animationDirection !== undefined){
                        Pet.list[data.pet[i].id].animationDirection = data.pet[i].animationDirection;
                    }
                    if(data.pet[i].mana !== undefined){
                        Pet.list[data.pet[i].id].mana = data.pet[i].mana;
                    }
                    if(data.pet[i].manaMax !== undefined){
                        Pet.list[data.pet[i].id].manaMax = data.pet[i].manaMax;
                    }
                    if(data.pet[i].petType !== undefined){
                        Pet.list[data.pet[i].id].petType = data.pet[i].petType;
                    }
                    if(data.pet[i].animation !== undefined){
                        Pet.list[data.pet[i].id].animation = data.pet[i].animation;
                    }
                    if(data.pet[i].name !== undefined){
                        Pet.list[data.pet[i].id].name = data.pet[i].name;
                    }
                    if(data.pet[i].zindex !== undefined){
                        Pet.list[data.pet[i].id].zindex = data.pet[i].zindex;
                    }
                    Pet.list[data.pet[i].id].updated = true;
                }
                else{
                    new Pet(data.pet[i]);
                }
            }
        }
        if(data.droppedItem.length > 0){
            for(var i = 0;i < data.droppedItem.length;i++){
                if(DroppedItem.list[data.droppedItem[i].id]){
                    if(data.droppedItem[i].x !== undefined){
                        DroppedItem.list[data.droppedItem[i].id].nextX = data.droppedItem[i].x;
                    }
                    DroppedItem.list[data.droppedItem[i].id].moveX = (DroppedItem.list[data.droppedItem[i].id].nextX - DroppedItem.list[data.droppedItem[i].id].x) / 4;
                    if(data.droppedItem[i].y !== undefined){
                        DroppedItem.list[data.droppedItem[i].id].nextY = data.droppedItem[i].y;
                    }
                    DroppedItem.list[data.droppedItem[i].id].moveY = (DroppedItem.list[data.droppedItem[i].id].nextY - DroppedItem.list[data.droppedItem[i].id].y) / 4;
                    if(data.droppedItem[i].direction !== undefined){
                        DroppedItem.list[data.droppedItem[i].id].direction = data.droppedItem[i].direction;
                    }
                    DroppedItem.list[data.droppedItem[i].id].updated = true;
                }
                else{
                    new DroppedItem(data.droppedItem[i]);
                }
            }
        }
        if(data.particle.length > 0){
            for(var i = 0;i < data.particle.length;i++){
                new Particle(data.particle[i]);
            }
        }
    }
    for(var i in Player.list){
        if(Player.list[i].updated === false){
            delete Player.list[i];
        }
    }
    for(var i in Projectile.list){
        if(Projectile.list[i].updated === false){
            delete Projectile.list[i];
        }
    }
    for(var i in Monster.list){
        if(Monster.list[i].updated === false){
            if(Monster.list[i].monsterType === 'lightningLizard'){
                document.getElementById('bossHealth').style.display = 'none';
                document.getElementById('bossbar').style.display = 'none';
            }
            if(Monster.list[i].monsterType === 'redBird'){
                document.getElementById('bossHealth').style.display = 'none';
                document.getElementById('bossbar').style.display = 'none';
            }
            if(Monster.list[i].monsterType === 'possessedSpirit'){
                document.getElementById('bossHealth').style.display = 'none';
                document.getElementById('bossbar').style.display = 'none';
            }
            if(Monster.list[i].monsterType === 'plantera'){
                document.getElementById('bossHealth').style.display = 'none';
                document.getElementById('bossbar').style.display = 'none';
            }
            if(Monster.list[i].monsterType === 'whirlwind'){
                document.getElementById('bossHealth').style.display = 'none';
                document.getElementById('bossbar').style.display = 'none';
            }
            if(Monster.list[i].monsterType === 'fireSpirit'){
                document.getElementById('bossHealth').style.display = 'none';
                document.getElementById('bossbar').style.display = 'none';
            }
            if(Monster.list[i].monsterType === 'sp'){
                document.getElementById('bossHealth').style.display = 'none';
                document.getElementById('bossbar').style.display = 'none';
            }
            delete Monster.list[i];
        }
    }
    for(var i in Npc.list){
        if(Npc.list[i].updated === false){
            delete Npc.list[i];
        }
    }
    for(var i in Pet.list){
        if(Pet.list[i].updated === false){
            delete Pet.list[i];
        }
    }
    for(var i in DroppedItem.list){
        if(DroppedItem.list[i].updated === false){
            delete DroppedItem.list[i];
        }
    }
});
socket.on('initEntity',function(data){
    if(data.type === "Player"){
        new Player(data);
    }
    if(data.type === "Projectile"){
        new Projectile(data);
    }
    if(data.type === "Monster"){
        new Monster(data);
    }
    if(data.type === "Npc"){
        new Npc(data);
    }
    if(data.type === "Pet"){
        new Pet(data);
    }
    if(data.type === "Particle"){
        new Particle(data);
    }
});
socket.on('disconnected',function(data){
    gameDiv.style.display = 'inline-block';
    disconnectedDiv.style.display = 'inline-block';
    spectatorDiv.style.display = 'none';
    pageDiv.style.display = 'none';
    Player.list[selfId].moveX = 0;
    Player.list[selfId].moveY = 0;
    setTimeout(function(){
        location.reload();
    },5000);
    document.getElementById('window').style.display = 'none';
    state.isHidden = true;
    socket.emit('disconnect');
    selfId = null;
});
socket.on('spectator',function(data){
    gameDiv.style.display = 'inline-block';
    disconnectedDiv.style.display = 'none';
    spectatorDiv.style.display = 'inline-block';
    pageDiv.style.display = 'none';
    respawnTimer = 5;
    document.getElementById('respawnTimer').innerHTML = respawnTimer;
    document.getElementById('respawn').style.display = 'none';
    setTimeout(updateRespawn,1500);
    document.getElementById('debuffs').innerHTML = '';
    Player.list[selfId].debuffs = [];
});
socket.on('changeMap',function(data){
    if(shadeAmount < 0){
        shadeAmount = 0;
    }
    currentMap = data.teleport;
    shadeSpeed = 3 / 40;
});
socket.on('dialogueLine',function(data){
    if(data.state === 'remove'){
        interactMenu.style.display = 'none';
        talking = false;
    }
    else{
        Player.list[selfId].moveX = 0;
        Player.list[selfId].moveY = 0;
        document.getElementById('interactMenuText').innerHTML = data.message;
        if(data.response1){
            document.getElementById('interactMenuButton1').innerHTML = data.response1;
            document.getElementById('interactMenuButton1').style.display = 'inline-block';
        }
        else{
            document.getElementById('interactMenuButton1').style.display = 'none';
        }
        if(data.response2){
            document.getElementById('interactMenuButton2').innerHTML = data.response2;
            document.getElementById('interactMenuButton2').style.display = 'inline-block';
        }
        else{
            document.getElementById('interactMenuButton2').style.display = 'none';
        }
        if(data.response3){
            document.getElementById('interactMenuButton3').innerHTML = data.response3;
            document.getElementById('interactMenuButton3').style.display = 'inline-block';
        }
        else{
            document.getElementById('interactMenuButton3').style.display = 'none';
        }
        if(data.response4){
            document.getElementById('interactMenuButton4').innerHTML = data.response4;
            document.getElementById('interactMenuButton4').style.display = 'inline-block';
        }
        else{
            document.getElementById('interactMenuButton4').style.display = 'none';
        }
        interactMenu.style.display = 'inline-block';
        talking = true;
    }
});
socket.on('questInfo',function(data){
    var dropdown = document.getElementById('questDropdown');
    //dropdown.options[dropdown.selectedIndex].text = data.questName;
    dropdown.selectedIndex = 0;
    while(dropdown.options[dropdown.selectedIndex].text !== data.questName){
        dropdown.selectedIndex += 1;
    }
    document.getElementById('questName').innerHTML = data.questName;
    document.getElementById('questDescription').innerHTML = questData[data.questName].description;
    document.getElementById('questXp').innerHTML = 'This quest gives ' + questData[data.questName].xp + ' XP.';
    disableAllMenu();
    document.getElementById('questScreen').style.display = 'inline-block';
    document.getElementById('window').style.display = 'inline-block';
    state.isHidden = false;
});
socket.on('hideInventory',function(data){
    disableAllMenu();
    document.getElementById('inventoryScreen').style.display = 'inline-block';
    document.getElementById('window').style.display = 'none';
    state.isHidden = true;
});
socket.on('showInventory',function(data){
    disableAllMenu();
    document.getElementById('inventoryScreen').style.display = 'inline-block';
    document.getElementById('window').style.display = 'inline-block';
    state.isHidden = false;
});
socket.on('updateLeaderboard',function(data){
    document.getElementById('leaderboardScreen').innerHTML = '<div style="font-size:18px;">Leaderboards: </div><br><div style="font-size:15px;">Leaderboards update every five minutes.</div><br>';
    var j = 1;
    for(var i in data){
        if(data[i].level === 0){

        }
        else if(data[i].xp === 0){
            
        }
        else if(data[i].xp === undefined){

        }
        else{
            document.getElementById('leaderboardScreen').innerHTML += '<div style="font-size: 13px;">' + j + ': ' + data[i].username + '<br>Level ' + data[i].level + ' ' + data[i].xp + ' XP</div>';
            j += 1;
        }
    }
});
socket.on('drawTile',function(data){
    tempMap[data.map].push(data);
});
socket.on('removeTile',function(data){
    for(var i in tempMap[data.map]){
        if(tempMap[data.map][i].x === data.x && tempMap[data.map][i].y === data.y && tempMap[data.map][i].canvas === data.canvas && tempMap[data.map][i].tile_idx === data.tile_idx){
            tempMap[data.map].splice(i,1);
        }
    }
});
socket.on('removeAllTiles',function(data){
    tempMap[data.map] = [];
});
socket.on('removeSameTiles',function(data){
    var newMap = [];
    for(var i in tempMap[data.map]){
        if(tempMap[data.map][i].tile_idx !== data.tile_idx){
            newMap.push(tempMap[data.map][i]);
        }
    }
    tempMap[data.map] = Object.create(newMap);
});
socket.on('openShop',function(data){
    disableAllMenu();
    document.getElementById('shopScreen').style.display = 'inline-block';
    document.getElementById('window').style.display = 'inline-block';
    document.getElementById('shopHeader').innerHTML = data.name + '\'s shop<div id="shopDescription" class="UI-display-light"></div>';
    document.getElementById('shopDescription').innerHTML = '"' + data.quote + '"';
    state.isHidden = false;
    inventory.shopItems = data.inventory;
    inventory.refreshShop();
});
socket.on('closeShop',function(data){
    if(document.getElementById('shopScreen').style.display === 'inline-block'){
        disableAllMenu();
        document.getElementById('inventoryScreen').style.display = 'inline-block';
    }
});
socket.on('openCraft',function(data){
    disableAllMenu();
    document.getElementById('craftScreen').style.display = 'inline-block';
    document.getElementById('window').style.display = 'inline-block';
    document.getElementById('craftHeader').innerHTML = data.name + '<div id="craftDescription" class="UI-display-light"></div>';
    document.getElementById('craftDescription').innerHTML = '"' + data.quote + '"';
    state.isHidden = false;
    inventory.craftItems = data.crafts;
    inventory.refreshCraft();
});
socket.on('closeCraft',function(data){
    if(document.getElementById('craftScreen').style.display === 'inline-block'){
        disableAllMenu();
        document.getElementById('inventoryScreen').style.display = 'inline-block';
    }
});
socket.on('notification',function(data){
    document.getElementById('notifications').innerHTML += '<div class="notification UI-display-light" style="opacity:5" onmouseover="mouseUp(event)">' + data + '</div>';
    var notifications = document.getElementsByClassName('notification');
    for(var i = 0;i < notifications.length;i++){
        if(notifications[i].offsetTop + notifications[i].offsetHeight > window.innerHeight - 16){
            notifications[0].remove();
            i -= 1;
        }
    }
});
socket.on('changeDifficulty',function(data){
    document.getElementById('difficulty').innerHTML = 'Difficulty: ' + data;
    difficulty = data;
});
socket.on('questObjective',function(data){
    document.getElementById('questObjectiveName').innerHTML = data.questName;
    document.getElementById('questObjective').innerHTML = data.questObjective;
});

startQuest = function(){
    var dropdown = document.getElementById('questDropdown');
    if(dropdown.options[dropdown.selectedIndex]){
        socket.emit('startQuest',dropdown.options[dropdown.selectedIndex].text);
        document.getElementById('window').style.display = 'none';
        state.isHidden = true;
        disableAllMenu();
        document.getElementById('inventoryScreen').style.display = 'inline-block';
    }
};

var response = function(data){
    socket.emit('diolougeResponse',data);
}
var MGHC = function(){};
var MGHC1 = function(){};
setInterval(function(){
    if(loading){
        if(loadingProgress > loadingProgressDisplay){
            loadingProgressDisplay += Math.ceil(Math.min(Math.min((loadingProgress - loadingProgressDisplay) / 4,10 + 10 * Math.random()),loadingProgressDisplay / 5 + 1));
            document.getElementById('loadingBar').innerHTML = loadingProgressDisplay + ' / 814';
            document.getElementById('loadingProgress').style.width = loadingProgressDisplay / 814 * 100 + '%';
        }
        if(loadingProgressDisplay >= 814){
            if(loading){
                loading = false;
                setTimeout(function(){
                    if(signingIn){
                        socket.emit('signIn',{username:username,password:password});
                        signingIn = false;
                    }
                    worldMap.save();
                    worldMap.fillStyle = '#000000';
                    worldMap.fillRect(0,0,1510,1130);
                    worldMap.translate(Math.round(mapX - 1510 * (mapDragX - mapMouseX) / 600),Math.round(mapY - 1510 * (mapDragY - mapMouseY) / 600));
                    for(var i in world){
                        worldMap.drawImage(loadedMap[world[i].fileName.slice(0,-4)].lower,mapRatio / 1510 * world[i].x * 4,mapRatio / 1510 * world[i].y * 4,mapRatio / 1510 * 3200,mapRatio / 1510 * 3200);
                        worldMap.drawImage(loadedMap[world[i].fileName.slice(0,-4)].upper,mapRatio / 1510 * world[i].x * 4,mapRatio / 1510 * world[i].y * 4,mapRatio / 1510 * 3200,mapRatio / 1510 * 3200);
                        for(var j in waypoints){
                            if(waypoints[j].map === world[i].fileName.slice(0,-4)){
                                worldMap.drawImage(Img[waypoints[j].id],mapRatio / 1510 * (waypoints[j].x + world[i].x * 4 - 32),mapRatio / 1510 * (waypoints[j].y + world[i].y * 4 - 96),mapRatio / 1510 * 128,mapRatio / 1510 * 128);
                                worldMap.font = "" + Math.round(mapRatio / 30) + "px pixel";
                                worldMap.fillStyle = '#ff7700';
                                worldMap.textAlign = "center";
                                worldMap.fillText(waypoints[j].info,mapRatio / 1510 * (waypoints[j].x + world[i].x * 4 + 32),mapRatio / 1510 * (waypoints[j].y + world[i].y * 4 + 80));
                            }
                        }
                    }
                    worldMap.restore();
                    setTimeout(function(){
                        loadingDiv.style.display = 'none';
                    },1000);
                },1000);
            }
        }
    }

    if(!selfId || loading){
        return;
    }
    if(!Player.list[selfId]){
        return;
    }


    for(var i in Player.list){
        Player.list[i].update();
    }
    for(var i in Monster.list){
        Monster.list[i].update();
    }
    for(var i in Projectile.list){
        Projectile.list[i].update();
    }
    for(var i in Npc.list){
        Npc.list[i].update();
    }
    for(var i in Particle.list){
        if(Particle.list[i].toRemove){
            delete Particle.list[i];
        }
        else{
            Particle.list[i].update();
        }
    }
    for(var i in Pet.list){
        Pet.list[i].update();
    }
    if(WIDTH !== window.innerWidth || HEIGHT !== window.innerHeight){
        ctx0Raw.style.width = window.innerWidth;
        ctx0Raw.style.height = window.innerHeight;
        ctx1Raw.style.width = window.innerWidth;
        ctx1Raw.style.height = window.innerHeight;
        map0Raw.style.width = window.innerWidth;
        map0Raw.style.height = window.innerHeight;
        map1Raw.style.width = window.innerWidth;
        map1Raw.style.height = window.innerHeight;

        ctx0.canvas.width = window.innerWidth;
        ctx0.canvas.height = window.innerHeight;
        resetCanvas(ctx0);
        ctx1.canvas.width = window.innerWidth;
        ctx1.canvas.height = window.innerHeight;
        resetCanvas(ctx1);
        map0.canvas.width = window.innerWidth;
        map0.canvas.height = window.innerHeight;
        resetCanvas(map0);
        map1.canvas.width = window.innerWidth;
        map1.canvas.height = window.innerHeight;
        resetCanvas(map1);
        
        state.x = clampX(0);
        state.y = clampY(0);
    }
    WIDTH = window.innerWidth;
    HEIGHT = window.innerHeight;
    map0.clearRect(0,0,WIDTH,HEIGHT);
    ctx0.clearRect(0,0,WIDTH,HEIGHT);
    ctx1.clearRect(0,0,WIDTH,HEIGHT);
    map1.clearRect(0,0,WIDTH,HEIGHT);
    cameraX = WIDTH / 2 - Player.list[selfId].x;
    cameraY = HEIGHT / 2 - Player.list[selfId].y;
    var mouseCameraX = mouseX / 8;
    var mouseCameraY = mouseY / 8;
    if(mouseCameraX > 128){
        mouseCameraX = 128;
    }
    if(mouseCameraX < -128){
        mouseCameraX = -128;
    }
    if(mouseCameraY > 128){
        mouseCameraY = 128;
    }
    if(mouseCameraY < -128){
        mouseCameraY = -128;
    }
    cameraX -= mouseCameraX;
    cameraY -= mouseCameraY;
    if(Player.list[selfId].mapWidth > window.innerWidth){
        if(cameraX > 0){
            cameraX = 0;
        }
        if(cameraX < WIDTH - Player.list[selfId].mapWidth){
            cameraX = WIDTH - Player.list[selfId].mapWidth;
        }
    }
    if(Player.list[selfId].mapHeight > window.innerHeight){
        if(cameraY > 0){
            cameraY = 0;
        }
        if(cameraY < HEIGHT - Player.list[selfId].mapHeight){
            cameraY = HEIGHT - Player.list[selfId].mapHeight;
        }
    }
    MGHC1();
    entityLightList = {};

    map0.save();
    map0.translate(Math.round(cameraX),Math.round(cameraY));

    if(loadedMap[Player.list[selfId].map]){
        map0.drawImage(loadedMap[Player.list[selfId].map].lower,0,0);
    }
    else{
        loadMap(Player.list[selfId].map);
    }
    for(var i in tempMap[Player.list[selfId].map]){
        if(tempMap[Player.list[selfId].map][i].canvas === 'lower'){
            var tile = mapTiles[tempMap[Player.list[selfId].map][i].map].tile;
            var size = 16;
            var img_x, img_y, s_x, s_y;
            img_x = (tempMap[Player.list[selfId].map][i].tile_idx % ((tile.imagewidth + tile.spacing) / (size + tile.spacing))) * (size + tile.spacing);
            img_y = ~~(tempMap[Player.list[selfId].map][i].tile_idx / ((tile.imagewidth + tile.spacing) / (size + tile.spacing))) * (size + tile.spacing);
            s_x = tempMap[Player.list[selfId].map][i].x;
            s_y = tempMap[Player.list[selfId].map][i].y;
            map0.drawImage(tileset,Math.round(img_x),Math.round(img_y),size,size,s_x,s_y,64,64);
        }
    }

    map0.restore();
    ctx0.save();
    ctx0.translate(cameraX,cameraY);
    var entities = [];
    for(var i in Player.list){
        entities.push(Player.list[i]);
    }
    for(var i in Projectile.list){
        if(Projectile.list[i].relativeToPlayer){
            if(Player.list[Projectile.list[i].relativeToPlayer]){
                if(Projectile.list[i].x + Player.list[Projectile.list[i].relativeToPlayer].x + Projectile.list[i].width / 2 + cameraX > 0){
                    if(Projectile.list[i].x + Player.list[Projectile.list[i].relativeToPlayer].x - Projectile.list[i].width / 2 + cameraX < window.innerWidth){
                        if(Projectile.list[i].y + Player.list[Projectile.list[i].relativeToPlayer].y + Projectile.list[i].height / 2 + cameraY > 0){
                            if(Projectile.list[i].y + Player.list[Projectile.list[i].relativeToPlayer].y - Projectile.list[i].height / 2 + cameraY < window.innerHeight){
                                entities.push(Projectile.list[i]);
                            }
                        }
                    }
                }
            }
        }
        else{
            if(Projectile.list[i].x + Projectile.list[i].width / 2 + cameraX > 0){
                if(Projectile.list[i].x - Projectile.list[i].width / 2 + cameraX < window.innerWidth){
                    if(Projectile.list[i].y + Projectile.list[i].height / 2 + cameraY > 0){
                        if(Projectile.list[i].y - Projectile.list[i].height / 2 + cameraY < window.innerHeight){
                            entities.push(Projectile.list[i]);
                        }
                    }
                }
            }
        }
    }
    for(var i in Monster.list){
        if(Monster.list[i].x + Monster.list[i].width / 2 + cameraX > 0 && Monster.list[i].x - Monster.list[i].width / 2 + cameraX < window.innerWidth && Monster.list[i].y + Monster.list[i].height / 2 + cameraY > 0 && Monster.list[i].y - Monster.list[i].height / 2 + cameraY < window.innerHeight){
            entities.push(Monster.list[i]);
        }
    }
    for(var i in Npc.list){
        entities.push(Npc.list[i]);
    }
    for(var i in Pet.list){
        entities.push(Pet.list[i]);
    }
    for(var i in DroppedItem.list){
        entities.push(DroppedItem.list[i]);
    }
    function compare(a,b){
        var ay = a.y;
        var by = b.y;
        if(a.type === 'Player' || a.type === 'Npc'){
            ay -= 8;
        }
        if(b.type === 'Player' || b.type === 'Npc'){
            by -= 8;
        }
        if(ay < by){
            return -1;
        }
        if(ay > by){
            return 1;
        }
        return 0;
    }
    entities.sort(compare);
    for(var i = 0;i < entities.length;i++){
        entities[i].draw();
    }

    ctx0.restore();
    map1.save();
    map1.translate(Math.round(cameraX),Math.round(cameraY));
    
    if(loadedMap[Player.list[selfId].map]){
        map1.drawImage(loadedMap[Player.list[selfId].map].upper,0,0);
    }
    else{
        loadMap(Player.list[selfId].map);
    }
    for(var i in tempMap[Player.list[selfId].map]){
        if(tempMap[Player.list[selfId].map][i].canvas === 'upper'){
            var tile = mapTiles[tempMap[Player.list[selfId].map][i].map].tile;
            var size = 16;
            var img_x, img_y, s_x, s_y;
            img_x = (tempMap[Player.list[selfId].map][i].tile_idx % ((tile.imagewidth + tile.spacing) / (size + tile.spacing))) * (size + tile.spacing);
            img_y = ~~(tempMap[Player.list[selfId].map][i].tile_idx / ((tile.imagewidth + tile.spacing) / (size + tile.spacing))) * (size + tile.spacing);
            s_x = tempMap[Player.list[selfId].map][i].x;
            s_y = tempMap[Player.list[selfId].map][i].y;
            map1.drawImage(tileset,Math.round(img_x),Math.round(img_y),size,size,s_x,s_y,64,64);
        }
    }
    
    map1.restore();
    ctx1.save();
    ctx1.translate(cameraX,cameraY);
    for(var i in Monster.list){
        if(Monster.list[i].zindex > 0){
            Monster.list[i].drawCtx1();
        }
    }
    for(var i in Player.list){
        if(Player.list[i].zindex > 0){
            Player.list[i].drawCtx1();
        }
    }
    if(loadedMap[Player.list[selfId].map]){
        ctx1.drawImage(loadedMap[Player.list[selfId].map].highest,0,0);
    }
    else{
        loadMap(Player.list[selfId].map);
    }
    for(var i in Projectile.list){
        if(Projectile.list[i].zindex === 1){
            Projectile.list[i].drawCtx1();
        }
    }
    for(var i in Projectile.list){
        Projectile.list[i].drawHp();
    }
    var bossAlive = false;
    for(var i in Monster.list){
        if(Monster.list[i].monsterType === 'lightningLizard'){
            bossAlive = true;
        }
        if(Monster.list[i].monsterType === 'redBird'){
            bossAlive = true;
        }
        if(Monster.list[i].monsterType === 'possessedSpirit'){
            bossAlive = true;
        }
        if(Monster.list[i].monsterType === 'plantera'){
            bossAlive = true;
        }
        if(Monster.list[i].monsterType === 'whirlwind'){
            bossAlive = true;
        }
        if(Monster.list[i].monsterType === 'fireSpirit'){
            bossAlive = true;
        }
        if(Monster.list[i].monsterType === 'sp'){
            bossAlive = true;
        }
    }
    if(bossAlive && (document.getElementById('bossbar').style.display === 'none' || document.getElementById('bossbar').style.display === '')){
        document.getElementById('bossHealth').style.display = 'inline-block';
        document.getElementById('bossbar').style.display = 'inline-block';
        for(var i in Monster.list){
            if(Monster.list[i].monsterType === 'lightningLizard'){
                document.getElementById('bossHealth').style.width = window.innerWidth / 2 * Monster.list[i].hp / Monster.list[i].hpMax + 'px';
                document.getElementById('bossbar').innerHTML = 'Lightning Lizard ' + Monster.list[i].hp + '/' + Monster.list[i].hpMax;
            }
            if(Monster.list[i].monsterType === 'redBird'){
                document.getElementById('bossHealth').style.width = window.innerWidth / 2 * Monster.list[i].hp / Monster.list[i].hpMax + 'px';
                document.getElementById('bossbar').innerHTML = 'Red Bird ' + Monster.list[i].hp + '/' + Monster.list[i].hpMax;
            }
            if(Monster.list[i].monsterType === 'possessedSpirit'){
                document.getElementById('bossHealth').style.width = window.innerWidth / 2 * Monster.list[i].hp / Monster.list[i].hpMax + 'px';
                document.getElementById('bossbar').innerHTML = 'Possessed Spirit ' + Monster.list[i].hp + '/' + Monster.list[i].hpMax;
            }
            if(Monster.list[i].monsterType === 'plantera'){
                document.getElementById('bossHealth').style.width = window.innerWidth / 2 * Monster.list[i].hp / Monster.list[i].hpMax + 'px';
                document.getElementById('bossbar').innerHTML = 'Plantera ' + Monster.list[i].hp + '/' + Monster.list[i].hpMax;
            }
            if(Monster.list[i].monsterType === 'whirlwind'){
                document.getElementById('bossHealth').style.width = window.innerWidth / 2 * Monster.list[i].hp / Monster.list[i].hpMax + 'px';
                document.getElementById('bossbar').innerHTML = 'Whirlwind ' + Monster.list[i].hp + '/' + Monster.list[i].hpMax;
            }
            if(Monster.list[i].monsterType === 'fireSpirit'){
                document.getElementById('bossHealth').style.width = window.innerWidth / 2 * Monster.list[i].hp / Monster.list[i].hpMax + 'px';
                document.getElementById('bossbar').innerHTML = 'Fire Spirit ' + Monster.list[i].hp + '/' + Monster.list[i].hpMax;
            }
            if(Monster.list[i].monsterType === 'sp'){
                document.getElementById('bossHealth').style.width = window.innerWidth / 2 * Monster.list[i].hp / Monster.list[i].hpMax + 'px';
                document.getElementById('bossbar').innerHTML = 'sp ' + Monster.list[i].hp + '/' + Monster.list[i].hpMax;
            }
        }
    }
    for(var i in Monster.list){
        Monster.list[i].drawHp();
    }
    for(var i in Npc.list){
        Npc.list[i].drawName();
    }
    for(var i in Pet.list){
        Pet.list[i].drawName();
    }
    for(var i in DroppedItem.list){
        DroppedItem.list[i].update();
    }
    for(var i in Particle.list){
        Particle.list[i].draw();
    }
    
    for(var i in Player.list){
        Player.list[i].drawName();
    }
    for(var i in Player.list){
        Player.list[i].drawLight();
    }

    ctx1.fillStyle = '#000000';
    ctx1.fillRect(-WIDTH,-HEIGHT,Player.list[selfId].mapWidth + WIDTH * 2,HEIGHT);
    ctx1.fillRect(-WIDTH,0,WIDTH,Player.list[selfId].mapHeight + HEIGHT);
    ctx1.fillRect(0,Player.list[selfId].mapHeight,Player.list[selfId].mapWidth + WIDTH,HEIGHT);
    ctx1.fillRect(Player.list[selfId].mapWidth,0,WIDTH,Player.list[selfId].mapHeight + HEIGHT);
    
    ctx1.restore();
    if(mapShadeAmount >= 3.5){
        mapShadeSpeed = -0.12;
    }
    if(Player.list[selfId].map === currentMap && shadeAmount > 1.5){
        for(var i in Particle.list){
            if(Particle.list[i].map !== Player.list[selfId].map){
                Particle.list[i].toRemove = true;
            }
        }
        shadeSpeed = -3 / 40;
        map0.fillStyle = maps[Player.list[selfId].map];
    }
    if(shadeAmount < 0.25 && document.getElementById('mapName').innerHTML !== Player.list[selfId].map){
        document.getElementById('mapName').innerHTML = Player.list[selfId].map;
        mapShadeAmount = 0;
        mapShadeSpeed = 0.08;
    }
    shadeAmount += shadeSpeed;
    mapShadeAmount += mapShadeSpeed;
    if(shadeAmount >= -1){
        blackShade.style.opacity = shadeAmount;
    }
    if(mapShadeAmount >= -1){
        document.getElementById('mapName').style.opacity = mapShadeAmount;
    }

    worldMap.save();
    if(mapDrag){
        worldMap.fillStyle = '#000000';
        worldMap.fillRect(0,0,1510,1130);
        worldMap.translate(Math.round(mapX - 1510 * (mapDragX - mapMouseX) / 600),Math.round(mapY - 1510 * (mapDragY - mapMouseY) / 600));
        for(var i in world){
            worldMap.drawImage(loadedMap[world[i].fileName.slice(0,-4)].lower,mapRatio / 1510 * world[i].x * 4,mapRatio / 1510 * world[i].y * 4,mapRatio / 1510 * 3200,mapRatio / 1510 * 3200);
            worldMap.drawImage(loadedMap[world[i].fileName.slice(0,-4)].upper,mapRatio / 1510 * world[i].x * 4,mapRatio / 1510 * world[i].y * 4,mapRatio / 1510 * 3200,mapRatio / 1510 * 3200);
            for(var j in waypoints){
                if(waypoints[j].map === world[i].fileName.slice(0,-4)){
                    worldMap.drawImage(Img[waypoints[j].id],mapRatio / 1510 * (waypoints[j].x + world[i].x * 4 - 32),mapRatio / 1510 * (waypoints[j].y + world[i].y * 4 - 96),mapRatio / 1510 * 128,mapRatio / 1510 * 128);
                    worldMap.font = "" + Math.round(mapRatio / 30) + "px pixel";
                    worldMap.fillStyle = '#ff7700';
                    worldMap.textAlign = "center";
                    worldMap.fillText(waypoints[j].info,mapRatio / 1510 * (waypoints[j].x + world[i].x * 4 + 32),mapRatio / 1510 * (waypoints[j].y + world[i].y * 4 + 80));
                }
            }
        }
    }
    worldMap.restore();
    if(respawnTimer === 0){
        document.getElementById('respawn').style.display = 'inline-block';
    }
    else{
        document.getElementById('respawn').style.display = 'none';
    }
    MGHC();
},1000/80);
setInterval(function(){
    var notifications = document.getElementsByClassName('notification');
    for(var i = 0;i < notifications.length;i++){
        if(notifications[i].offsetTop + notifications[i].offsetHeight > window.innerHeight - 16){
            notifications[0].remove();
            i -= 1;
        }
        else{
            notifications[i].style.opacity -= 0.05;
            if(notifications[i].style.opacity <= 0){
                notifications[i].remove();
            }
        }
    }
},100);
var updateRespawn = function(){
    if(spectatorDiv.style.display === 'none'){
        return;
    }
    respawnTimer = Math.max(respawnTimer - 1,0);
    document.getElementById('respawnTimer').innerHTML = respawnTimer;
    setTimeout(updateRespawn,1000);
}

var releaseAll = function(){
    socket.emit('keyPress',{inputId:'releaseAll'});
}

function useMenuDropdown(){
    var dropdowns = document.getElementsByClassName("UI-dropdown-light");
    for(var i = 0;i < dropdowns.length;i++){
        var openDropdown = dropdowns[i];
        openDropdown.classList.toggle('dropdownShow');
    }
}
window.onclick = function(event){
    if(!event.target.matches('#menuDropdown')){
        var dropdowns = document.getElementsByClassName("UI-dropdown-light");
        for(var i = 0;i < dropdowns.length;i++){
            var openDropdown = dropdowns[i];
            if(openDropdown.classList.contains('dropdownShow')){
                openDropdown.classList.remove('dropdownShow');
            }
        }
    }
    if(!event.target.matches('#chat-input')){
        if(inChat){
            inChat = false;
        }
    }
}
var keys = {};
document.onkeydown = function(event){
    if(event.key === 'ArrowUp' && selfId){
        if(commandList.length > 0 && commandIndex > -1){
            document.getElementById('debug-input').value = commandList[commandIndex];
            commandIndex -= 1;
        }
    }
    else if(event.key === 'ArrowDown' && selfId){
        if(commandList.length > 0 && commandIndex < commandList.length - 1){
            commandIndex += 1;
            document.getElementById('debug-input').value = commandList[commandIndex];
        }
        else{
            commandIndex = commandList.length - 1;
            document.getElementById('debug-input').value = '';
        }
    }
    if(chatPress){
        
    }
    else{
        if(!event.isTrusted){
            socket.emit('timeout');
        }
        var key = event.key || event.keyCode;
        if(key === 'Meta' || key === 'Alt' || key === 'Control'){
            socket.emit('keyPress',{inputId:'releaseAll'});
        }
        if(key === 'b' && selfId){
            DEBUG = !DEBUG;
        }
        if(!talking && loading === false){
            socket.emit('keyPress',{inputId:key,state:true});
        }
        if(selfId){
            if(key === 'i' && event.ctrlKey){
                disableAllMenu();
                document.getElementById('debugScreen').style.display = 'inline-block';
                document.getElementById('window').style.display = 'inline-block';
                state.isHidden = false;
            }
            else if(key === 'i'){
                disableAllMenu();
                document.getElementById('inventoryScreen').style.display = 'inline-block';
                document.getElementById('window').style.display = 'inline-block';
                state.isHidden = false;
            }
            else if(key === 'm'){
                disableAllMenu();
                document.getElementById('worldMap').style.display = 'inline-block';
                document.getElementById('window').style.display = 'inline-block';
                state.isHidden = false;
            }
            else if(key === 'q'){
                disableAllMenu();
                document.getElementById('questScreen').style.display = 'inline-block';
                document.getElementById('window').style.display = 'inline-block';
                state.isHidden = false;
            }
            else if(key === 'r' && !event.ctrlKey){
                disableAllMenu();
                document.getElementById('waypointScreen').style.display = 'inline-block';
                document.getElementById('window').style.display = 'inline-block';
                state.isHidden = false;
            }
        }
    }
    keys[key] = true;
}
document.onkeyup = function(event){
    chatPress = false;
    var key = event.key || event.keyCode;
    if(!talking){
        socket.emit('keyPress',{inputId:key,state:false});
    }
    keys[key] = false;
}
mouseDown = function(event){
    if(inChat){
        return;
    }
    if(!event.isTrusted){
        socket.emit('timeout');
    }
    if(event.button === 0){
        socket.emit('keyPress',{inputId:'attack',state:true});
    }
    if(event.button === 2){
        socket.emit('keyPress',{inputId:'second',state:true});
    }
}
mouseUp = function(event){
    if(event.button === 0){
        socket.emit('keyPress',{inputId:'attack',state:false});
    }
    if(event.button === 2){
        socket.emit('keyPress',{inputId:'second',state:false});
    }
}
dropItem = function(){
    if(inventory.draggingItem !== -1){
        socket.emit('dragItem',{
            index1:inventory.draggingItem,
            index2:'drop',
        });
        inventory.draggingItem = -1;
    }
}
mapMouseDown = function(event){
    mapDragX = mapMouseX;
    mapDragY = mapMouseY;
    mapDrag = true;
}
onMapMouseOver = function(event){
    mapMouseOver = event;
}
document.addEventListener("visibilitychange",function(){
    var hidden = document.hidden;
    if(documentHidden === true && hidden === false){
        socket.emit('init');
    }
    if(hidden === true){
        socket.emit('keyPress',{inputId:"releaseAll",state:true});
    }
    documentHidden = document.hidden;
});
document.onmouseup = function(event){
    if(mapDrag){
        mapDrag = false;
        mapX = mapX - 1510 * (mapDragX - mapMouseX) / 600;
        mapY = mapY - 1510 * (mapDragY - mapMouseY) / 600;
    }
    if(inventory.draggingItem !== -1){
        var itemMenu = document.getElementsByClassName('itemMenu');
        for(var i = 0;i < itemMenu.length;i++){
            itemMenu[i].style.display = 'none';
        }
        if(mouseX + WIDTH / 2 < state.x || mouseX + WIDTH / 2 > state.x + 902 || mouseY + HEIGHT / 2 < state.y || mouseY + HEIGHT / 2 > state.y + 602){
            dropItem();
        }
        else{
            var draggedItem = false;
            var inventorySlots = document.getElementsByClassName('inventorySlot');
            for(var i = 0;i < inventorySlots.length;i++){
                var rect = inventorySlots[i].getBoundingClientRect();
                if(mouseX + WIDTH / 2 > rect.left && mouseX + WIDTH / 2 < rect.left + 72 && mouseY + HEIGHT / 2 > rect.top && mouseY + HEIGHT / 2 < rect.top + 72){
                    socket.emit('dragItem',{
                        index1:inventory.draggingItem,
                        index2:inventory.getSlotId(i - 9),
                    });
                    inventory.draggingItem = -1;
                    draggedItem = true;
                }
            }
            if(draggedItem === false){
                inventory.refreshItem(inventory.draggingItem);
                inventory.draggingItem = -1;
            }
        }
    }
}
window.addEventListener('wheel',function(event){
    if(!mapMouseOver){
        return;
    }
    if(event.deltaY < 0 && mapRatio < 20000){
        mapRatio *= 1.1;
        mapX -= mapMouseX * 2;
        mapY -= mapMouseY * 2;
        mapX *= 1.1;
        mapY *= 1.1;
        mapX += mapMouseX * 2;
        mapY += mapMouseY * 2;
    }
    else if(event.deltaY > 0){
        mapRatio /= 1.1;
        mapX -= mapMouseX * 2;
        mapY -= mapMouseY * 2;
        mapX /= 1.1;
        mapY /= 1.1;
        mapX += mapMouseX * 2;
        mapY += mapMouseY * 2;
    }
    worldMap.save();
    worldMap.fillStyle = '#000000';
    worldMap.fillRect(0,0,1510,1130);
    worldMap.translate(Math.round(mapX),Math.round(mapY));
    for(var i in world){
        worldMap.drawImage(loadedMap[world[i].fileName.slice(0,-4)].lower,mapRatio / 1510 * world[i].x * 4,mapRatio / 1510 * world[i].y * 4,mapRatio / 1510 * 3200,mapRatio / 1510 * 3200);
        worldMap.drawImage(loadedMap[world[i].fileName.slice(0,-4)].upper,mapRatio / 1510 * world[i].x * 4,mapRatio / 1510 * world[i].y * 4,mapRatio / 1510 * 3200,mapRatio / 1510 * 3200);
        for(var j in waypoints){
            if(waypoints[j].map === world[i].fileName.slice(0,-4)){
                worldMap.drawImage(Img[waypoints[j].id],mapRatio / 1510 * (waypoints[j].x + world[i].x * 4 - 32),mapRatio / 1510 * (waypoints[j].y + world[i].y * 4 - 96),mapRatio / 1510 * 128,mapRatio / 1510 * 128);
                worldMap.font = "" + Math.round(mapRatio / 30) + "px pixel";
                worldMap.fillStyle = '#ff7700';
                worldMap.textAlign = "center";
                worldMap.fillText(waypoints[j].info,mapRatio / 1510 * (waypoints[j].x + world[i].x * 4 + 32),mapRatio / 1510 * (waypoints[j].y + world[i].y * 4 + 80));
            }
        }
    }
    worldMap.restore();
});
document.getElementById('worldMapCanvas').onmousemove = function clickEvent(e){
    var rect = e.target.getBoundingClientRect();
    mapMouseX = e.clientX - rect.left;
    mapMouseY = e.clientY - rect.top;
}
document.onmousemove = function(event){
    if(Player.list[selfId]){
        var x = -1 * cameraX - Player.list[selfId].x + event.clientX;
        var y = -1 * cameraY - Player.list[selfId].y + event.clientY;
        if(event.clientY < 0){
            socket.emit('keyPress',{inputId:'releaseAll'});
        }
        if(event.clientY > window.innerHeight){
            socket.emit('keyPress',{inputId:'releaseAll'});
        }
        if(event.clientX < 0){
            socket.emit('keyPress',{inputId:'releaseAll'});
        }
        if(event.clientX > window.innerWidth){
            socket.emit('keyPress',{inputId:'releaseAll'});
        }
        mouseX = event.clientX - WIDTH / 2;
        mouseY = event.clientY - HEIGHT / 2;
        if(!talking){
            socket.emit('keyPress',{inputId:'direction',state:{x:x,y:y}});
        }
        var inSlot = false;
        var inventorySlots = document.getElementsByClassName('inventorySlot');
        for(var i = 0;i < inventorySlots.length;i++){
            if(inventorySlots[i].className.includes('inventoryMenuSlot') && document.getElementById('inventoryScreen').style.display === 'inline-block'){
                var rect = inventorySlots[i].getBoundingClientRect();
                if(mouseX + WIDTH / 2 > rect.left){
                    if(mouseX + WIDTH / 2 < rect.left + 72){
                        if(mouseY + HEIGHT / 2 > rect.top){
                            if(mouseY + HEIGHT / 2 < rect.top + 72){
                                inSlot = true;
                            }
                        }
                    }
                }
            }
            if(inventorySlots[i].className.includes('shopMenuSlot') && document.getElementById('shopScreen').style.display === 'inline-block'){
                var rect = inventorySlots[i].getBoundingClientRect();
                if(mouseX + WIDTH / 2 > rect.left){
                    if(mouseX + WIDTH / 2 < rect.left + 72){
                        if(mouseY + HEIGHT / 2 > rect.top){
                            if(mouseY + HEIGHT / 2 < rect.top + 72){
                                inSlot = true;
                            }
                        }
                    }
                }
            }
            if(inventorySlots[i].className.includes('craftMenuSlot') && document.getElementById('craftScreen').style.display === 'inline-block'){
                var rect = inventorySlots[i].getBoundingClientRect();
                if(mouseX + WIDTH / 2 > rect.left){
                    if(mouseX + WIDTH / 2 < rect.left + 72){
                        if(mouseY + HEIGHT / 2 > rect.top){
                            if(mouseY + HEIGHT / 2 < rect.top + 72){
                                inSlot = true;
                            }
                        }
                    }
                }
            }
        }
        var itemMenu = document.getElementsByClassName('itemMenu');
        if(inSlot === false){
            for(var i = 0;i < itemMenu.length;i++){
                if(itemMenu[i].style.display === 'inline-block'){
                    itemMenu[i].style.display = 'none';
                }
            }
        }
        else{
            for(var i = 0;i < itemMenu.length;i++){
                if(itemMenu[i].style.display === 'inline-block'){
                    itemMenu[i].style.left = (event.clientX + 3) + 'px';
                    itemMenu[i].style.top = (event.clientY + 3) + 'px';
                }
            }
        }
        if(inventory.draggingItem !== -1){
            document.getElementById('draggingItem').style.left = (event.clientX - inventory.draggingX) + 'px';
            document.getElementById('draggingItem').style.top = (event.clientY - inventory.draggingY) + 'px';
        }
        else{
            document.getElementById('draggingItem').style.left = '-100px';
            document.getElementById('draggingItem').style.top = '-100px';
        }
    }
}
document.querySelectorAll("button").forEach(function(item){
    item.addEventListener('focus',function(){
        this.blur();
    });
});
window.onresize = function(){
    document.getElementById('pageDiv').style.backgroundSize = window.innerWidth + 'px,' + window.innerHeight + 'px';
    document.getElementById('pageDiv').style.width = window.innerWidth + 'px';
    document.getElementById('pageDiv').style.height = window.innerHeight + 'px';
}
document.oncontextmenu = function(event){
    event.preventDefault();
}
