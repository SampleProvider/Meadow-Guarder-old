/*if(navigator.userAgent.search(/gecko/i) > 0){
    alert("The game only supports firefox if OffscreenCanvas is enabled in settings. To learn more, go to: https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas/OffscreenCanvas");
}*/

var WIDTH = window.innerWidth;
var HEIGHT = window.innerHeight;

var cameraX = 0;
var cameraY = 0;
var lastCameraX = 0;
var lastCameraY = 0;
var mouseCameraX = 0;
var mouseCameraY = 0;

var audioTense = document.getElementById('audioTense');
var audioCalm = document.getElementById('audioCalm');

var menu = 'none';

var RENDERDIST = 5;
var STATE = 'signIn';
var VERSION = '010f1a';

var DEBUG = 0;

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
var mainAttackDiv = document.getElementById('mainAttack');
var secondaryAttackDiv = document.getElementById('secondaryAttack');
var healDiv = document.getElementById('heal');
var disconnectedDiv = document.getElementById('disconnected');
var spectatorDiv = document.getElementById('spectator');
var adDiv = document.getElementById('ads');
var ctx0Raw = document.getElementById('ctx0');
var ctx1Raw = document.getElementById('ctx1');
var map0Raw = document.getElementById('map0');
var map1Raw = document.getElementById('map1');
var inventoryPlayerDisplayRaw = document.getElementById('inventoryPlayerDisplay');
var signDiv = document.getElementById('sign');
var worldMapButton = document.getElementById('worldMapButton');
var blackShade = document.getElementById('blackShade');
var healthBarText = document.getElementById('healthBarText');
var healthBarValue = document.getElementById('healthBarValue');
var xpBarText = document.getElementById('xpBarText');
var xpBarValue = document.getElementById('xpBarValue');
var interactMenu = document.getElementById('interactMenu');
var signDivUsername = document.getElementById('username');
var signDivPassword = document.getElementById('password');
var signDivSignIn = document.getElementById('signIn');
var signDivCreateAccount = document.getElementById('createAccount');
var signDivDeleteAccount = document.getElementById('deleteAccount');

var canSignIn = true;
signDivSignIn.onclick = function(){
    if(canSignIn){
        socket.emit('signIn',{username:signDivUsername.value,password:signDivPassword.value});
        canSignIn = false;
        setTimeout(() => {
            canSignIn = true;
        },2000);
    }
}
signDivCreateAccount.onclick = function(){
    socket.emit('createAccount',{username:signDivUsername.value,password:signDivPassword.value});
}
signDivDeleteAccount.onclick = function(){
    socket.emit('deleteAccount',{username:signDivUsername.value});
}
socket.on('signInResponse',function(data){
    if(data.success === 3){
        document.getElementById('inventoryPlayerName').innerHTML = data.username;
        document.getElementById('ctPlayerName').innerHTML = data.username;
        if(Math.random() < 0.1){
            audioCalm.play();
            audioCalm.loop = true;
        }
        else{
            audioTense.play();
            audioTense.loop = true;
        }
        STATE = 'game';
    }
    else if(data.success === 2){
        alert("The account with username \'" + signDivUsername.value + "\' and password \'" + signDivPassword.value + "\' is already used. The other account will be disconnected shortly. Please try to sign again.");
    }
    else if(data.success === 1){
        alert("Incorrect Password.");
    }
    else{
        alert("No account found with username \'" + signDivUsername.value + "\' and password \'" + signDivPassword.value + "\'.");
    }
});
socket.on('createAccountResponse',function(data){
    if(data.success == 1){
        alert("Account created with username \'" + signDivUsername.value + "\' and password \'" + signDivPassword.value + "\'.");
    }
    else if(data.success == 0){
        alert("Sorry, there is already an account with username \'" + signDivUsername.value + "\'.");
    }
    else if(data.success == 2){
        alert("Please use a username with 3+ characters.");
    }
    else if(data.success == 3){
        alert("Invalid characters.");
    }
    else if(data.success == 4){
        alert("Please use a shorter username / password.");
    }
});
socket.on('deleteAccountResponse',function(data){
    if(data.success == 1){
        alert("Deleted account created with username \'" + signDivUsername.value + "\'.");
    }
    else if(data.success == 0){
        alert("Sorry, there is no account with username \'" + signDivUsername.value + "\'.");
    }
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
    chat += '<div class="textNone"' + data.style + "[" + d.getHours() + ":" + m + "] " + data.message + '</div>';
    chatText.innerHTML = chat + '<br>';
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
    debugInput.value = '';
}
chatInput.onkeydown = function(e){
    chatPress = true;
}
chatInput.onmousedown = function(e){
    inChat = true;
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
var inventoryPlayerDisplay = document.getElementById("inventoryPlayerDisplay").getContext("2d");
var ctPlayerDisplay = document.getElementById("ctPlayerDisplay").getContext("2d");
var worldMap = document.getElementById("worldMapCanvas").getContext("2d");
var worldMapEntity = document.getElementById("worldMapEntityCanvas").getContext("2d");
ctx0.canvas.width = window.innerWidth;
ctx0.canvas.height = window.innerHeight;
ctx1.canvas.width = window.innerWidth;
ctx1.canvas.height = window.innerHeight;
map0.canvas.width = window.innerWidth;
map0.canvas.height = window.innerHeight;
map1.canvas.width = window.innerWidth;
map1.canvas.height = window.innerHeight;
worldMap.canvas.width = 910;
worldMap.canvas.height = 730;
worldMapEntity.canvas.width = 910;
worldMapEntity.canvas.height = 730;
inventoryPlayerDisplay.canvas.width = 10;
inventoryPlayerDisplay.canvas.height = 17;
ctPlayerDisplay.canvas.width = 10;
ctPlayerDisplay.canvas.height = 17;
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
resetCanvas(worldMapEntity);
resetCanvas(inventoryPlayerDisplay);
resetCanvas(ctPlayerDisplay);

var renderPlayer = function(img,shadeValues){
    var temp = new OffscreenCanvas(72,152);
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
                rgba[i] = (rgba[i] + shadeValues[0]) * shadeValues[3];
            }
            if(shadeValues[1] !== -1){
                rgba[i + 1] = (rgba[i + 1] + shadeValues[1]) * shadeValues[3];
            }
            if(shadeValues[2] !== -1){
                rgba[i + 2] = (rgba[i + 2] + shadeValues[2]) * shadeValues[3];
            }
        }
    }
    gl.clearRect(0,0,72,152);
    gl.putImageData(imageData,0,0);
    return temp;
}
var renderName = function(name,color){
    var temp = new OffscreenCanvas(30,300);
    var gl = temp.getContext('2d');
    resetCanvas(gl);
    gl.font = "15px pixel";
    gl.textAlign = "center";
    gl.fillStyle = color;
    gl.fillText(name,15,150);
    return temp;
}

var maps = {};

var tileset = new Image();
tileset.src = '/client/maps/roguelikeSheet.png';
var tilesetLoaded = false;
tileset.onload = function(){
    tilesetLoaded = true;
};
var loadedMap = {};
var renderLayers = function(json,name){
    var tempLower = new OffscreenCanvas(json.layers[0].width * 64,json.layers[0].height * 64);
    var tempUpper = new OffscreenCanvas(json.layers[0].width * 64,json.layers[0].height * 64);
    var glLower = tempLower.getContext('2d');
    var glUpper = tempUpper.getContext('2d');
    resetCanvas(glLower);
    resetCanvas(glUpper);
    for(var i = 0;i < json.layers.length;i++){
        if(json.layers[i].type === "tilelayer" && json.layers[i].visible){
            var size = json.tilewidth;
            for(var j = 0;j < json.layers[i].data.length;j++){
                tile_idx = json.layers[i].data[j];
                if(tile_idx !== 0){
                    var img_x, img_y, s_x, s_y;
                    var tile = json.tilesets[0];
                    tile_idx -= 1;
                    img_x = (tile_idx % ((tile.imagewidth + tile.spacing) / (size + tile.spacing))) * (size + tile.spacing);
                    img_y = ~~(tile_idx / ((tile.imagewidth + tile.spacing) / (size + tile.spacing))) * (size + tile.spacing);
                    s_x = (j % json.layers[i].width) * size;
                    s_y = ~~(j / json.layers[i].width) * size;
                    if(json.layers[i].name === 'Above0' || json.layers[i].name === 'Above1'){
                        glUpper.drawImage(tileset,Math.round(img_x),Math.round(img_y),size,size,Math.round(s_x * 4),Math.round(s_y * 4),64,64);
                    }
                    else{
                        glLower.drawImage(tileset,Math.round(img_x),Math.round(img_y),size,size,Math.round(s_x * 4),Math.round(s_y * 4),64,64);
                    }
                }
            }
        }
    }
    loadedMap[name] = {
        lower:tempLower,
        upper:tempUpper,
    }
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
Img.playerHair.shortHat = new Image();
Img.playerHair.shortHat.src = '/client/img/Player Map Hat Short.png';
Img.playerHair.longHat = new Image();
Img.playerHair.longHat.src = '/client/img/Player Map Hat Long.png';
Img.playerHair.vikingHat = new Image();
Img.playerHair.vikingHat.src = '/client/img/Player Map Hat Viking.png';
Img.monster = new Image();
Img.monster.src = '/client/img/Pet.png';
Img.monsterGreen = new Image();
Img.monsterGreen.src = '/client/img/Monster Green.png';
Img.monsterBlue = new Image();
Img.monsterBlue.src = '/client/img/Monster Blue.png';
Img.monsterOrange = new Image();
Img.monsterOrange.src = '/client/img/Monster Orange.png';
Img.monsterBoss = new Image();
Img.monsterBoss.src = '/client/img/Monster Boss.png';
Img.bullet = new Image();
Img.bullet.src = '/client/img/Bullet.png';
Img.healthBar = new Image();
Img.healthBar.src = '/client/img/Health0.png';
Img.healthBarEnemy = new Image();
Img.healthBarEnemy.src = '/client/img/HealthEnemy.png';
Img.playericon = new Image();
Img.playericon.src = '/client/img/playericon.png';
var mouseX = 0;
var mouseY = 0;
var mapMouseX = mouseX + WIDTH / 2;
var mapMouseY = mouseY + HEIGHT / 2;
var mapDragX = mouseX + WIDTH / 2;
var mapDragY = mouseY + HEIGHT / 2;
var mapX = -640;
var mapY = -640;
var mapDrag = true;
var mapRatio = 1000;
var mapLocations = [
    ['The River','The Village'],
    ['','The Docks'],
];
var mapCropX = 3200;
var mapCropY = 0;
loadMap('World');

document.getElementById('bodySlider').oninput = function(){
    socket.emit('keyPress',{inputId:'imgBody',state:this.value});
}
document.getElementById('shirtSlider').oninput = function(){
    socket.emit('keyPress',{inputId:'imgShirt',state:this.value});
}
document.getElementById('pantsSlider').oninput = function(){
    socket.emit('keyPress',{inputId:'imgPants',state:this.value});
}
document.getElementById('hairSlider').oninput = function(){
    socket.emit('keyPress',{inputId:'imgHair',state:this.value});
}
document.getElementById('hairTypeSlider').oninput = function(){
    socket.emit('keyPress',{inputId:'imgHairType',state:this.value});
}

var mapChange = 0;
var mapDirection = 'up';
var mapSlide = 0;
var lastMap = '';
var currentMap = '';
var drewMap = false;
var isWorldMap = true;

var talking = false;
var selfId = null;

var state = {
isDragging: false,
isHidden: true,
xDiff: 0,
yDiff: 0,
x: 50,
y: 50
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
    return Math.min(Math.max(n,0),window.innerWidth - 600);
}
function clampY(n){
    return Math.min(Math.max(n,0),window.innerHeight - 45);
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
    menu = 'none';

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
        if(menu !== 'inventory'){
            menu = 'inventory';
        }
        else{
            menu = 'none';
        }
        renderWindow(w,state);
    });
});

var respawn = function(){
    socket.emit('respawn');
    STATE = 'respawn';
    setTimeout(function(){
        STATE = 'game';
    },50);
}
var questInventory = new QuestInventory(socket,false);
socket.on('updateQuestInventory',function(items){
    questInventory.items = items;
    questInventory.refreshRender();
});
var inventory = new Inventory(socket,false);
socket.on('updateInventory',function(pack){
    inventory.items = pack.items;
    inventory.currentEquip = pack.currentEquip;
    inventory.refreshRender();
});

var disableAllMenu = function(){
    var menuDisplays = document.getElementsByClassName('menuDisplay');
    for(var i = 0;i < menuDisplays.length;i++){
        menuDisplays[i].style.display = 'none';
    }
}

document.getElementById('debugButton').onclick = function(){
    menu = 'debug';
    disableAllMenu();
    document.getElementById('debugScreen').style.display = 'inline-block';
}
document.getElementById('inventoryButton').onclick = function(){
    menu = 'inventory';
    disableAllMenu();
    document.getElementById('inventory').style.display = 'inline-block';
}
document.getElementById('statButton').onclick = function(){
    menu = 'stat';
    disableAllMenu();
    document.getElementById('statScreen').style.display = 'inline-block';
}
document.getElementById('worldMapButton').onclick = function(){
    menu = 'worldMap';
    disableAllMenu();
    document.getElementById('worldMap').style.display = 'inline-block';
}
document.getElementById('ctButton').onclick = function(){
    menu = 'ct';
    disableAllMenu();
    document.getElementById('ctScreen').style.display = 'inline-block';
}

var drawPlayer = function(img,canvas,animationDirection,animation,x,y,size){
    switch(animationDirection){
        case "down":
            canvas.drawImage(img,12 * animation,19 * 0,12,19,x - size * 6,y - size * 15,size * 12,size * 19);
            break;
        case "rightdown":
            canvas.drawImage(img,12 * animation,19 * 1,12,19,x - size * 6,y - size * 15,size * 12,size * 19);
            break;
        case "right":
            canvas.drawImage(img,12 * animation,19 * 2,12,19,x - size * 6,y - size * 15,size * 12,size * 19);
            break;
        case "rightup":
            canvas.drawImage(img,12 * animation,19 * 3,12,19,x - size * 6,y - size * 15,size * 12,size * 19);
            break;
        case "up":
            canvas.drawImage(img,12 * animation,19 * 4,12,19,x - size * 6,y - size * 15,size * 12,size * 19);
            break;
        case "leftup":
            canvas.drawImage(img,12 * animation,19 * 5,12,19,x - size * 6,y - size * 15,size * 12,size * 19);
            break;
        case "left":
            canvas.drawImage(img,12 * animation,19 * 6,12,19,x - size * 6,y - size * 15,size * 12,size * 19);
            break;
        case "leftdown":
            canvas.drawImage(img,12 * animation,19 * 7,12,19,x - size * 6,y - size * 15,size * 12,size * 19);
            break;
    }
    return canvas;
}

var Player = function(initPack){
    var self = {};
    self.id = initPack.id;
    self.username = initPack.username;
    self.x = initPack.x;
    self.y = initPack.y;
    self.moveX = 0;
    self.moveY = 0;
    self.nextX = initPack.x;
    self.nextY = initPack.y;
    self.spdX = initPack.spdX;
    self.spdY = initPack.spdY;
    self.img = initPack.img;
    self.renderedImg = {
        body:renderPlayer(Img.playerBody,self.img.body),
        shirt:renderPlayer(Img.playerShirt,self.img.shirt),
        pants:renderPlayer(Img.playerPants,self.img.pants),
        hair:renderPlayer(Img.playerHair[self.img.hairType],self.img.hair),
    }
    self.render = document.createElement('canvas');
    var ctx = self.render.getContext('2d');
    ctx.drawImage(self.renderedImg.body,0,0);
    ctx.drawImage(self.renderedImg.shirt,0,0);
    ctx.drawImage(self.renderedImg.pants,0,0);
    ctx.drawImage(self.renderedImg.hair,0,0);
    self.renderedName = renderName(self.username,'#ff7700');
    self.direction = initPack.direction;
    self.hp = initPack.hp;
    self.hpMax = initPack.hpMax;
    self.xp = initPack.xp;
    self.xpMax = initPack.xpMax;
    self.level = initPack.level;
    self.map = initPack.map;
    self.attackReload = initPack.attackReload;
    self.secondReload = initPack.secondReload;
    self.healReload = initPack.healReload;
    self.mapHeight = initPack.mapWidth;
    self.mapWidth = initPack.mapHeight;
    self.updated = true;
    self.animation = initPack.animation;
    self.animationDirection = initPack.animationDirection;
    self.stats = initPack.stats;
    self.type = initPack.type;
    self.moveSpeed = 15;
    self.update = function(){
        if(talking && self.id === selfId){
            socket.emit('keyPress',{inputId:'releaseAll'});
            return;
        }
        if(self.x !== self.nextX){
            self.x += self.moveX;
        }
        if(self.y !== self.nextY){
            self.y += self.moveY;
        }
    }
    self.draw = function(){
        self.animation = Math.round(self.animation);
        drawPlayer(self.render,ctx0,self.animationDirection,self.animation,self.x,self.y,4);
        
        if(self.id === selfId){
            inventoryPlayerDisplay.clearRect(0,0,10,17);
            drawPlayer(self.renderedImg.body,inventoryPlayerDisplay,self.animationDirection,self.animation,5,15,1);
            drawPlayer(self.renderedImg.shirt,inventoryPlayerDisplay,self.animationDirection,self.animation,5,15,1);
            drawPlayer(self.renderedImg.pants,inventoryPlayerDisplay,self.animationDirection,self.animation,5,15,1);
            drawPlayer(self.renderedImg.hair,inventoryPlayerDisplay,self.animationDirection,self.animation,5,15,1);
            ctPlayerDisplay.clearRect(0,0,10,17);
            drawPlayer(self.renderedImg.body,ctPlayerDisplay,self.animationDirection,self.animation,5,15,1);
            drawPlayer(self.renderedImg.shirt,ctPlayerDisplay,self.animationDirection,self.animation,5,15,1);
            drawPlayer(self.renderedImg.pants,ctPlayerDisplay,self.animationDirection,self.animation,5,15,1);
            drawPlayer(self.renderedImg.hair,ctPlayerDisplay,self.animationDirection,self.animation,5,15,1);
        }
    }
    self.drawName = function(){
        ctx1.font = "15px pixel";
        ctx1.fillStyle = '#ff7700';
        ctx1.textAlign = "center";
        ctx1.fillText(self.username,self.x,self.y - 92);
        ctx1.drawImage(Img.healthBar,0,0,42,5,self.x - 63,self.y - 75,126,15);
        ctx1.drawImage(Img.healthBar,0,6,Math.round(42 * self.hp / self.hpMax),5,self.x - 63,self.y - 75,Math.round(126 * self.hp / self.hpMax),15);
        if(self.id !== selfId){
            return;
        }
        if(self.attackReload > 14){
            self.attackReload = 25;
            mainAttackDiv.style.color = "#25ff25";
        }
        else{
            mainAttackDiv.style.color = "#ff2525";
        }
        if(self.secondReload > 249){
            self.secondReload = 250;
            secondaryAttackDiv.style.color = "#25ff25";
        }
        else{
            secondaryAttackDiv.style.color = "#ff2525";
        }
        if(self.healReload > 449){
            self.healReload = 500;
            healDiv.style.color = "#25ff25";
        }
        else{
            healDiv.style.color = "#ff2525";
        }
        mainAttackDiv.innerHTML = "Main Attack: " + self.attackReload / 25;
        secondaryAttackDiv.innerHTML = "Secondary Attack: " + self.secondReload / 25;
        healDiv.innerHTML = "Heal: " + self.healReload / 25;
        healthBarText.innerHTML = self.hp + " / " + self.hpMax;
        healthBarValue.style.width = "" + 150 * self.hp / self.hpMax + "px";
        var xpText = self.xp + " ";
        var xpMaxText = "/ " + self.xpMax;
        if(self.xp > 999999999999999){
            xpText = Math.round(self.xp / 100000000000000) / 10 + "Q ";
        }
        else if(self.xp > 999999999999){
            xpText = Math.round(self.xp / 100000000000) / 10 + "T ";
        }
        else if(self.xp > 999999999){
            xpText = Math.round(self.xp / 100000000) / 10 + "B ";
        }
        else if(self.xp > 999999){
            xpText = Math.round(self.xp / 100000) / 10 + "M ";
        }
        else if(self.xp > 9999){
            xpText = Math.round(self.xp / 1000) + "K ";
        }
        if(self.xpMax > 999999999999999){
            xpMaxText = "/ " + Math.round(self.xpMax / 100000000000000) / 10 + "Q";
        }
        else if(self.xpMax > 999999999999){
            xpMaxText = "/ " + Math.round(self.xpMax / 100000000000) / 10 + "T";
        }
        else if(self.xpMax > 999999999){
            xpMaxText = "/ " + Math.round(self.xpMax / 100000000) / 10 + "B";
        }
        else if(self.xpMax > 999999){
            xpMaxText = "/ " + Math.round(self.xpMax / 100000) / 10 + "M";
        }
        else if(self.xpMax > 9999){
            xpMaxText = "/ " + Math.round(self.xpMax / 1000) + "K";
        }
        xpBarText.innerHTML = xpText + xpMaxText;
        xpBarValue.style.width = "" + 150 * self.xp / self.xpMax + "px";
        document.getElementById('stat-attack').innerHTML = 'You will deal a miminum of ' + Math.round(50 * self.stats.attack) + ' damage and a maximum of ' + Math.round(100 * self.stats.attack) + ' damage.';
        document.getElementById('stat-defense').innerHTML = 'Out of 100 damage, you will receive ' + Math.round(100 / self.stats.defense) + ' damage.<br>You are level ' + self.level + '.<br>You will get ' + Math.round(self.stats.xp * 10) + ' xp per monster killed.';
    }
    self.drawLight = function(){
        if(self.id !== selfId){
            return;
        }
        if(self.map !== "Cave"){
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
    self.direction = initPack.direction;
    self.projectileType = initPack.projectileType;
    self.type = initPack.type;
    self.hp = initPack.hp;
    self.hpMax = initPack.hpMax;
    self.map = initPack.map;
    self.updated = true;
    self.update = function(){
        self.x += self.moveX;
        self.y += self.moveY;
        /*if(self.realX - self.x >= 40){
            self.x = self.realX;
        }
        else if(self.realX - self.x >= 5){
            self.x += 5;
        }
        else if(self.realX - self.x <= -40){
            self.x = self.realX;
        }
        else if(self.realX - self.x <= -5){
            self.x -= 5;
        }
        else{
            self.x = self.realX;
        }
        if(self.realY - self.y >= 40){
            self.y = self.realY;
        }
        else if(self.realY - self.y >= 5){
            self.y += 5;
        }
        else if(self.realY - self.y <= -40){
            self.y = self.realY;
        }
        else if(self.realY - self.y <= -5){
            self.y -= 5;
        }
        else{
            self.y = self.realY;
        }*/
    }
    self.draw = function(){
        ctx0.translate(self.x,self.y);
        ctx0.rotate(self.direction * Math.PI / 180);
        var i = new Image();
        i.src = '/client/img/' + self.projectileType + '.png';
        ctx0.drawImage(i,-24,-24);
        ctx0.rotate(-self.direction * Math.PI / 180);
        ctx0.translate(-self.x,-self.y);
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
    self.monsterType = initPack.monsterType;
    self.type = initPack.type;
    self.updated = true;
    self.update = function(){
        self.x += self.moveX;
        self.y += self.moveY;
    }
    self.draw = function(){
        if(self.monsterType === 'purple'){
            ctx0.drawImage(Img.monster,self.x - 12,self.y - 18);
        }
        else if(self.monsterType === 'green'){
            ctx0.drawImage(Img.monsterGreen,self.x - 12,self.y - 18);
        }
        else if(self.monsterType === 'blue'){
            ctx0.drawImage(Img.monsterBlue,self.x - 12,self.y - 18);
        }
        else if(self.monsterType === 'red'){
            ctx0.drawImage(Img.monsterBoss,self.x - 24,self.y - 36);
        }
        else if(self.monsterType === 'orange'){
            ctx0.drawImage(Img.monsterOrange,self.x - 48,self.y - 72);
        }
        else if(self.monsterType === 'white'){
            ctx0.drawImage(Img.monsterWhite,self.x - 6,self.y - 9);
        }
    }
    self.drawHp = function(){
        if(self.monsterType === 'red'){
            ctx1.drawImage(Img.healthBarEnemy,0,0,42,5,self.x - 63,self.y - 65,126,15);
            ctx1.drawImage(Img.healthBarEnemy,0,6,Math.round(42 * self.hp / self.hpMax),5,self.x - 63,self.y - 65,Math.round(126 * self.hp / self.hpMax),15);
        }
        else if(self.monsterType === 'orange'){
            ctx1.drawImage(Img.healthBarEnemy,0,0,42,5,self.x - 63,self.y - 95,126,15);
            ctx1.drawImage(Img.healthBarEnemy,0,6,Math.round(42 * self.hp / self.hpMax),5,self.x - 63,self.y - 95,Math.round(126 * self.hp / self.hpMax),15);
        }
        else{
            ctx1.drawImage(Img.healthBarEnemy,0,0,42,5,self.x - 63,self.y - 45,126,15);
            ctx1.drawImage(Img.healthBarEnemy,0,6,Math.round(42 * self.hp / self.hpMax),5,self.x - 63,self.y - 45,Math.round(126 * self.hp / self.hpMax),15);
        }
    }
    Monster.list[self.id] = self;
    return self;
}
Monster.list = {};
var Npc = function(initPack){
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
    self.renderedName = renderName(self.name,'#ff7700');
    self.type = initPack.type;
    self.updated = true;
    self.update = function(){
        if(self.x !== self.nextX){
            self.x += self.moveX;
        }
        if(self.y !== self.nextY){
            self.y += self.moveY;
        }
    }
    self.draw = function(){
        self.animation = Math.round(self.animation);
        drawPlayer(self.render,ctx0,self.animationDirection,self.animation,self.x,self.y,4);
    }
    self.drawName = function(){
        ctx1.font = "15px pixel";
        ctx1.fillStyle = '#ff7700';
        ctx1.textAlign = "center";
        ctx1.fillText(self.name,self.x,self.y - 58);
    }
    Npc.list[self.id] = self;
    return self;
}
Npc.list = {};
socket.on('selfId',function(data){
    selfId = data.id;
    '<div>Welcome to Meadow Guarders Open ' + VERSION + '!</div>';
    chatText.innerHTML = '<div>Welcome to Meadow Guarders Open ' + VERSION + '!</div>';
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
    if(data){
        if(data.player.length > 0){
            for(var i = 0;i < data.player.length;i++){
                if(Player.list[data.player[i].id]){
                    if(data.player[i].x){
                        Player.list[data.player[i].id].nextX = data.player[i].x;
                    }
                    Player.list[data.player[i].id].moveX = (Player.list[data.player[i].id].nextX - Player.list[data.player[i].id].x) / 4;
                    if(data.player[i].y){
                        Player.list[data.player[i].id].nextY = data.player[i].y;
                    }
                    Player.list[data.player[i].id].moveY = (Player.list[data.player[i].id].nextY - Player.list[data.player[i].id].y) / 4;
                    if(data.player[i].spdX){
                        Player.list[data.player[i].id].spdX = data.player[i].spdX;
                    }
                    if(data.player[i].spdY){
                        Player.list[data.player[i].id].spdY = data.player[i].spdY;
                    }
                    if(data.player[i].img){
                        if(data.player[i].img.body !== Player.list[data.player[i].id].img.body){
                            Player.list[data.player[i].id].renderedImg.body = renderPlayer(Img.playerBody,data.player[i].img.body);
                        }
                        if(data.player[i].img.shirt !== Player.list[data.player[i].id].img.shirt){
                            Player.list[data.player[i].id].renderedImg.shirt = renderPlayer(Img.playerShirt,data.player[i].img.shirt);
                        }
                        if(data.player[i].img.pants !== Player.list[data.player[i].id].img.pants){
                            Player.list[data.player[i].id].renderedImg.pants = renderPlayer(Img.playerPants,data.player[i].img.pants);
                        }
                        if(data.player[i].img.hair !== Player.list[data.player[i].id].img.hair){
                            Player.list[data.player[i].id].renderedImg.hair = renderPlayer(Img.playerHair[data.player[i].img.hairType],data.player[i].img.hair);
                        }
                        if(data.player[i].img.hairType !== Player.list[data.player[i].id].img.hairType){
                            Player.list[data.player[i].id].renderedImg.hair = renderPlayer(Img.playerHair[data.player[i].img.hairType],data.player[i].img.hair);
                        }
                        var ctx = Player.list[data.player[i].id].render.getContext('2d');
                        ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height);
                        ctx.drawImage(Player.list[data.player[i].id].renderedImg.body,0,0);
                        ctx.drawImage(Player.list[data.player[i].id].renderedImg.shirt,0,0);
                        ctx.drawImage(Player.list[data.player[i].id].renderedImg.pants,0,0);
                        ctx.drawImage(Player.list[data.player[i].id].renderedImg.hair,0,0);
                        Player.list[data.player[i].id].img = data.player[i].img;
                    }
                    if(data.player[i].animationDirection){
                        Player.list[data.player[i].id].animationDirection = data.player[i].animationDirection;
                    }
                    if(data.player[i].direction){
                        Player.list[data.player[i].id].direction = data.player[i].direction;
                    }
                    if(data.player[i].hp){
                        Player.list[data.player[i].id].hp = data.player[i].hp;
                    }
                    if(data.player[i].hpMax){
                        Player.list[data.player[i].id].hpMax = data.player[i].hpMax;
                    }
                    if(data.player[i].xp){
                        Player.list[data.player[i].id].xp = data.player[i].xp;
                    }
                    if(data.player[i].xpMax){
                        Player.list[data.player[i].id].xpMax = data.player[i].xpMax;
                    }
                    if(data.player[i].level){
                        Player.list[data.player[i].id].level = data.player[i].level;
                    }
                    if(data.player[i].map){
                        Player.list[data.player[i].id].map = data.player[i].map;
                    }
                    if(data.player[i].attackReload){
                        Player.list[data.player[i].id].attackReload = data.player[i].attackReload;
                    }
                    if(data.player[i].secondReload){
                        Player.list[data.player[i].id].secondReload = data.player[i].secondReload;
                    }
                    if(data.player[i].healReload){
                        Player.list[data.player[i].id].healReload = data.player[i].healReload;
                    }
                    if(data.player[i].mapWidth){
                        Player.list[data.player[i].id].mapWidth = data.player[i].mapWidth;
                    }
                    if(data.player[i].mapHeight){
                        Player.list[data.player[i].id].mapHeight = data.player[i].mapHeight;
                    }
                    if(data.player[i].stats){
                        Player.list[data.player[i].id].stats = data.player[i].stats;
                    }
                    if(data.player[i].animation){
                        Player.list[data.player[i].id].animation = data.player[i].animation;
                    }
                    else{
                        Player.list[data.player[i].id].animation = 0;
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
                    if(data.projectile[i].x){
                        Projectile.list[data.projectile[i].id].nextX = data.projectile[i].x;
                    }
                    Projectile.list[data.projectile[i].id].moveX = (Projectile.list[data.projectile[i].id].nextX - Projectile.list[data.projectile[i].id].x) / 4;
                    if(data.projectile[i].y){
                        Projectile.list[data.projectile[i].id].nextY = data.projectile[i].y;
                    }
                    Projectile.list[data.projectile[i].id].moveY = (Projectile.list[data.projectile[i].id].nextY - Projectile.list[data.projectile[i].id].y) / 4;
                    if(data.projectile[i].map){
                        Projectile.list[data.projectile[i].id].map = data.projectile[i].map;
                    }
                    if(data.projectile[i].projectileType){
                        Projectile.list[data.projectile[i].id].projectileType = data.projectile[i].projectileType;
                    }
                    if(data.projectile[i].direction){
                        Projectile.list[data.projectile[i].id].direction = data.projectile[i].direction;
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
                    if(data.monster[i].x){
                        Monster.list[data.monster[i].id].nextX = data.monster[i].x;
                    }
                    Monster.list[data.monster[i].id].moveX = (Monster.list[data.monster[i].id].nextX - Monster.list[data.monster[i].id].x) / 4;
                    if(data.monster[i].y){
                        Monster.list[data.monster[i].id].nextY = data.monster[i].y;
                    }
                    Monster.list[data.monster[i].id].moveY = (Monster.list[data.monster[i].id].nextY - Monster.list[data.monster[i].id].y) / 4;
                    if(data.monster[i].hp){
                        Monster.list[data.monster[i].id].hp = data.monster[i].hp;
                    }
                    if(data.monster[i].hpMax){
                        Monster.list[data.monster[i].id].hpMax = data.monster[i].hpMax;
                    }
                    Monster.list[data.monster[i].id].updated = true;
                }
                else{
                    new Monster(data.monster[i]);
                }
            }
        }
        if(data.npc.length > 0){
            for(var i = 0;i < data.npc.length;i++){
                if(Npc.list[data.npc[i].id]){
                    if(data.npc[i].x){
                        Npc.list[data.npc[i].id].nextX = data.npc[i].x;
                    }
                    Npc.list[data.npc[i].id].moveX = (Npc.list[data.npc[i].id].nextX - Npc.list[data.npc[i].id].x) / 4;
                    if(data.npc[i].y){
                        Npc.list[data.npc[i].id].nextY = data.npc[i].y;
                    }
                    Npc.list[data.npc[i].id].moveY = (Npc.list[data.npc[i].id].nextY - Npc.list[data.npc[i].id].y) / 4;
                    if(data.npc[i].animationDirection){
                        Npc.list[data.npc[i].id].animationDirection = data.npc[i].animationDirection;
                    }
                    if(data.npc[i].hp){
                        Npc.list[data.npc[i].id].hp = data.npc[i].hp;
                    }
                    if(data.npc[i].hpMax){
                        Npc.list[data.npc[i].id].hpMax = data.npc[i].hpMax;
                    }
                    if(data.npc[i].animation){
                        Npc.list[data.npc[i].id].animation = data.npc[i].animation;
                    }
                    else{
                        Npc.list[data.npc[i].id].animation = 0;
                    }
                    Npc.list[data.npc[i].id].updated = true;
                }
                else{
                    new Npc(data.npc[i]);
                }
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
            delete Monster.list[i];
        }
    }
    for(var i in Npc.list){
        if(Npc.list[i].updated === false){
            delete Npc.list[i];
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
});
socket.on('disconnected',function(data){
    STATE = 'disconnected';
    Player.list[selfId].moveX = 0;
    Player.list[selfId].moveY = 0;
    setTimeout(function(){
        location.reload();
    },5000);
});
socket.on('spectator',function(data){
    Player.list[selfId].hp = 0;
    if(STATE !== 'respawn'){
        STATE = 'spectator';
    }
    else{
        STATE = 'game';
    }
});
socket.on('changeMap',function(data){
    if(shadeAmount < 0){
        shadeAmount = 0;
    }
    lastMap = Player.list[selfId].map;
    currentMap = data.teleport;
    shadeSpeed = 3 / 40;
});
socket.on('dialougeLine',function(data){
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
    document.getElementById('questName').innerHTML = data.questName;
    document.getElementById('questDescription').innerHTML = data.questDescription;
    menu = 'quest';
    document.getElementById('inventory').style.display = 'none';
    document.getElementById('debugScreen').style.display = 'none';
    document.getElementById('statScreen').style.display = 'none';
    document.getElementById('questScreen').style.display = 'inline-block';
    document.getElementById('window').style.display = 'inline-block';
    state.isHidden = false;
});

startQuest = function(){
socket.emit('startQuest');
document.getElementById('window').style.display = 'none';
state.isHidden = true;
};

var response = function(data){
socket.emit('diolougeResponse',data);
}

setInterval(function(){
    if(STATE === 'signIn'){
        gameDiv.style.display = 'none';
        signDiv.style.display = 'inline-block';
        disconnectedDiv.style.display = 'none';
        spectatorDiv.style.display = 'none';
        adDiv.style.display = 'none';
    }
    if(STATE === 'disconnected'){
        gameDiv.style.display = 'inline-block';
        signDiv.style.display = 'none';
        disconnectedDiv.style.display = 'inline-block';
        spectatorDiv.style.display = 'none';
        adDiv.style.display = 'none';
    }
    if(STATE === 'spectator'){
        gameDiv.style.display = 'inline-block';
        signDiv.style.display = 'none';
        disconnectedDiv.style.display = 'none';
        spectatorDiv.style.display = 'inline-block';
        adDiv.style.display = 'inline-block';
        adDiv.style.display = 'none';
    }
    if(STATE === 'game'){
        gameDiv.style.display = 'inline-block';
        signDiv.style.display = 'none';
        disconnectedDiv.style.display = 'none';
        spectatorDiv.style.display = 'none';
        //adDiv.style.display = 'inline-block';
        adDiv.style.display = 'none';
    }
    if(STATE === 'respawn'){
        gameDiv.style.display = 'inline-block';
        signDiv.style.display = 'none';
        disconnectedDiv.style.display = 'none';
        spectatorDiv.style.display = 'none';
        adDiv.style.display = 'inline-block';
    }


    if(!selfId){
        return;
    }


    if(!Player.list[selfId]){
        return;
    }
    ctx0Raw.style.width = window.innerWidth;
    ctx0Raw.style.height = window.innerHeight;
    ctx1Raw.style.width = window.innerWidth;
    ctx1Raw.style.height = window.innerHeight;
    map0Raw.style.width = window.innerWidth;
    map0Raw.style.height = window.innerHeight;
    map1Raw.style.width = window.innerWidth;
    map1Raw.style.height = window.innerHeight;
    if(ctx0.canvas.width !== window.innerWidth){
        ctx0.canvas.width = window.innerWidth;
        resetCanvas(ctx0);
    }
    if(ctx0.canvas.height !== window.innerHeight){
        ctx0.canvas.height = window.innerHeight;
        resetCanvas(ctx0);
    }
    if(ctx1.canvas.width !== window.innerWidth){
        ctx1.canvas.width = window.innerWidth;
        resetCanvas(ctx1);
    }
    if(ctx1.canvas.height !== window.innerHeight){
        ctx1.canvas.height = window.innerHeight;
        resetCanvas(ctx1);
    }
    if(map0.canvas.width !== window.innerWidth){
        map0.canvas.width = window.innerWidth;
        resetCanvas(map0);
    }
    if(map0.canvas.height !== window.innerHeight){
        map0.canvas.height = window.innerHeight;
        resetCanvas(map0);
    }
    if(map1.canvas.width !== window.innerWidth){
        map1.canvas.width = window.innerWidth;
        resetCanvas(map1);
    }
    if(map1.canvas.height !== window.innerHeight){
        map1.canvas.height = window.innerHeight;
        resetCanvas(map1);
    }
    WIDTH = window.innerWidth;
    HEIGHT = window.innerHeight;
    map0.fillStyle = maps[Player.list[selfId].map];
    map0.fillRect(0,0,WIDTH,HEIGHT);
    ctx0.clearRect(0,0,WIDTH,HEIGHT);
    ctx1.clearRect(0,0,WIDTH,HEIGHT);
    map1.clearRect(0,0,WIDTH,HEIGHT);
    cameraX = WIDTH / 2 - Player.list[selfId].x;
    cameraY = HEIGHT / 2 - Player.list[selfId].y;
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


    map0.save();
    map0.translate(Math.round(cameraX),Math.round(cameraY));

    if(!isWorldMap){
        if(loadedMap[Player.list[selfId].map]){
            map0.drawImage(loadedMap[Player.list[selfId].map].lower,0,0);
        }
        else{
            loadMap(Player.list[selfId].map);
        }
    }
    else{
        if(loadedMap.World){
            map0.drawImage(loadedMap.World.lower,mapCropX,mapCropY,3200,3200,0,0,3200,3200);
        }
        else{
            loadMap("World");
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
        entities.push(Projectile.list[i]);
    }
    for(var i in Monster.list){
        entities.push(Monster.list[i]);
    }
    for(var i in Npc.list){
        entities.push(Npc.list[i]);
    }
    function compare(a,b){
        var ay = a.y;
        var by = b.y;
        if(a.type === 'Player' || a.type === 'Npc'){
            ay -= 12;
        }
        if(b.type === 'Player' || b.type === 'Npc'){
            by -= 12;
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

    ctx0.clearRect(0,-HEIGHT,WIDTH + 3200,HEIGHT);
    ctx0.clearRect(-WIDTH,-HEIGHT,WIDTH,3200 + HEIGHT);
    ctx0.clearRect(-WIDTH,3200 + HEIGHT,WIDTH + 3200,HEIGHT);
    ctx0.clearRect(3200,0,WIDTH,3200 + HEIGHT);
    ctx0.restore();
    map1.save();
    map1.translate(Math.round(cameraX),Math.round(cameraY));
    if(!isWorldMap){
        if(loadedMap[Player.list[selfId].map]){
            map1.drawImage(loadedMap[Player.list[selfId].map].upper,0,0);
        }
        else{
            loadMap(Player.list[selfId].map);
        }
    }
    else{
        if(loadedMap.World){
            map1.drawImage(loadedMap.World.upper,mapCropX,mapCropY,3200,3200,0,0,3200,3200);
        }
        else{
            loadMap("World");
        }
    }
    
    map1.restore();
    ctx1.save();
    ctx1.translate(cameraX,cameraY);
    for(var i in Projectile.list){
        Projectile.list[i].update();
    }
    for(var i in Monster.list){
        Monster.list[i].drawHp();
        Monster.list[i].update();
    }
    for(var i in Npc.list){
        Npc.list[i].update();
    }
    
    for(var i in Npc.list){
        Npc.list[i].drawName();
    }
    for(var i in Player.list){
        Player.list[i].drawName();
    }
    for(var i in Player.list){
        Player.list[i].drawLight();
    }
    for(var i in Player.list){
        Player.list[i].update();
    }
    
    ctx1.clearRect(0,-HEIGHT,WIDTH + 3200,HEIGHT);
    ctx1.clearRect(-WIDTH,-HEIGHT,WIDTH,3200 + HEIGHT);
    ctx1.clearRect(-WIDTH,3200 + HEIGHT,WIDTH + 3200,HEIGHT);
    ctx1.clearRect(3200,0,WIDTH,3200 + HEIGHT);
    ctx1.restore();
    if(mapShadeAmount >= 2){
        mapShadeSpeed = -0.12;
    }
    if(Player.list[selfId].map === currentMap && shadeAmount > 1.5){
        shadeSpeed = -3 / 40;
        isWorldMap = false;
        for(var i = 0;i < mapLocations.length;i++){
            for(var j = 0;j < mapLocations[i].length;j++){
                if(currentMap === mapLocations[i][j]){
                    mapCropX = j * 3200;
                    mapCropY = i * 3200;
                    isWorldMap = true;
                    currentMap = 'World';
                }
            }
        }
        if(!isWorldMap){
            mapCropX = 0;
            mapCropY = 0;
        }
    }
    if(shadeAmount < 0.25 && document.getElementById('mapName').innerHTML !== Player.list[selfId].map){
        document.getElementById('mapName').innerHTML = Player.list[selfId].map;
        mapShadeAmount = 0;
        mapShadeSpeed = 0.08;
    }
    shadeAmount += shadeSpeed;
    mapShadeAmount += mapShadeSpeed;
    blackShade.style.opacity = shadeAmount;
    document.getElementById('mapName').style.opacity = mapShadeAmount;

    worldMap.save();
    worldMapEntity.save();
    if(mapDrag){
        worldMap.fillStyle = '#000000';
        worldMap.fillRect(0,0,910,730);
        worldMap.translate(Math.round(mapX - 910 * (mapDragX - mapMouseX) / 600),Math.round(mapY - 910 * (mapDragY - mapMouseY) / 600));
        worldMap.drawImage(loadedMap.World.lower,0,0,mapRatio / 910 * 3200 * mapLocations[0].length,mapRatio / 910 * 3200 * mapLocations.length);
        worldMap.drawImage(loadedMap.World.upper,0,0,mapRatio / 910 * 3200 * mapLocations[0].length,mapRatio / 910 * 3200 * mapLocations.length);
    }
    if(isWorldMap){
        if(mapDrag){
            worldMapEntity.translate(Math.round(mapX - 910 * (mapDragX - mapMouseX) / 600),Math.round(mapY - 910 * (mapDragY - mapMouseY) / 600));
        }
        else{
            worldMapEntity.translate(Math.round(mapX),Math.round(mapY));
        }
        worldMapEntity.clearRect(0,0,100000,100000);
        for(var i in Player.list){
            worldMapEntity.translate((mapCropX + Player.list[i].x) * mapRatio / 910,(mapCropY + Player.list[i].y) * mapRatio / 910);
            worldMapEntity.rotate(Player.list[i].direction * Math.PI / 180);
            worldMapEntity.drawImage(Img.playericon,-56 * mapRatio / 910,-48 * mapRatio / 910,mapRatio / 10,mapRatio / 10);
            worldMapEntity.rotate(-1 * Player.list[i].direction * Math.PI / 180);
            worldMapEntity.translate(-1 * (mapCropX + Player.list[i].x) * mapRatio / 910,-1 * (mapCropY + Player.list[i].y) * mapRatio / 910);
        }
    }
    worldMap.restore();
    worldMapEntity.restore();
},1000/80);

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
document.onkeydown = function(event){
    if(chatPress){
    }
    else{
        var key = event.key || event.keyCode;
        document.getElementById("htmlDebug").innerHTML = key;
        if(key === 'Meta' || key === 'Alt' || key === 'Control'){
            socket.emit('keyPress',{inputId:'releaseAll'});
        }
        if(!talking){
            socket.emit('keyPress',{inputId:key,state:true});
        }
    }
}
document.onkeyup = function(event){
    chatPress = false;
    if(!talking){
        var key = event.key || event.keyCode;
        socket.emit('keyPress',{inputId:key,state:false});
    }
}
mouseDown = function(event){
    if(inChat){
        return;
    }
    if(event.button == 0){
        socket.emit('keyPress',{inputId:'attack',state:true});
    }
    if(event.button == 2){
        socket.emit('keyPress',{inputId:'second',state:true});
    }
}
mouseUp = function(event){
    if(event.button == 0){
        socket.emit('keyPress',{inputId:'attack',state:false});
    }
    if(event.button == 2){
        socket.emit('keyPress',{inputId:'second',state:false});
    }
}
mapMouseDown = function(event){
    mapDragX = mapMouseX;
    mapDragY = mapMouseY;
    mapDrag = true;
}
mapMouseUp = function(event){
    //mapDrag = false;
    //mapX = mapX + 2000 * (mouseX + WIDTH / 2 - mapMouseX) / 600;
    //mapY = mapY + 2000 * (mouseY + HEIGHT / 2 - mapMouseY) / 600;
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
        mapX = mapX - 910 * (mapDragX - mapMouseX) / 600;
        mapY = mapY - 910 * (mapDragY - mapMouseY) / 600;
    }
}
window.addEventListener('wheel',function(event){
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
    worldMap.fillRect(0,0,910,730);
    worldMap.translate(Math.round(mapX),Math.round(mapY));
    worldMap.drawImage(loadedMap.World.lower,0,0,mapRatio / 910 * 3200 * mapLocations[0].length,mapRatio / 910 * 3200 * mapLocations.length);
    worldMap.drawImage(loadedMap.World.upper,0,0,mapRatio / 910 * 3200 * mapLocations[0].length,mapRatio / 910 * 3200 * mapLocations.length);
    worldMap.restore();
});
document.getElementById('worldMapEntityCanvas').onmousemove = function clickEvent(e){
    var rect = e.target.getBoundingClientRect();
    mapMouseX = e.clientX - rect.left;
    mapMouseY = e.clientY - rect.top;
}
document.onmousemove = function(event){
    if(Player.list[selfId]){
        var x = -1 * cameraX - Player.list[selfId].x + event.clientX;
        var y = -1 * cameraY - Player.list[selfId].y + event.clientY;
        if(event.clientY <= 0){
            socket.emit('keyPress',{inputId:'releaseAll'});
        }
        if(event.clientY >= window.innerHeight){
            socket.emit('keyPress',{inputId:'releaseAll'});
        }
        if(event.clientX <= 0){
            socket.emit('keyPress',{inputId:'releaseAll'});
        }
        if(event.clientX >= window.innerWidth){
            socket.emit('keyPress',{inputId:'releaseAll'});
        }
        mouseX = event.clientX - WIDTH / 2;
        mouseY = event.clientY - HEIGHT / 2;
        if(!talking){
            socket.emit('keyPress',{inputId:'direction',state:{x:x,y:y}});
        }
    }
}
document.querySelectorAll("button").forEach(function(item){
    item.addEventListener('focus',function(){
        this.blur();
    });
});
document.oncontextmenu = function(event){
    event.preventDefault();
}
