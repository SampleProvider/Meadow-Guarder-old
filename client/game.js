/*if(navigator.userAgent.search(/gecko/i) > 0){
    alert("The game only supports firefox if OffscreenCanvas is enabled in settings. To learn more, go to: https://developer.mozilla.org/en-US/docs/Web/API/OffscreenCanvas/OffscreenCanvas");
}*/
var isFirefox = typeof InstallTrigger !== 'undefined';
if(isFirefox === true) {
    alert('This game uses OffscreenCanvas, which is not supported in Firefox.');
}


var WIDTH = window.innerWidth;
var HEIGHT = window.innerHeight;

var cameraX = 0;
var cameraY = 0;

var audioTense = document.getElementById('audioTense');
var audioCalm = document.getElementById('audioCalm');

var VERSION = '0.2.0';

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
var pageDiv = document.getElementById('pageDiv');
var mainAttackDiv = document.getElementById('mainAttack');
var secondaryAttackDiv = document.getElementById('secondaryAttack');
var healDiv = document.getElementById('heal');
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


gameDiv.style.display = 'none';
disconnectedDiv.style.display = 'none';
spectatorDiv.style.display = 'none';
pageDiv.style.display = 'inline-block';
pageDiv.style.width = window.innerWidth + 'px';
pageDiv.style.height = window.innerHeight + 'px';

var respawnTimer = 0;

var canSignIn = true;
var changePasswordState = 0;
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
    socket.emit('deleteAccount',{username:signDivUsername.value,password:signDivPassword.value});
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
        audioTense.play();
        audioTense.loop = true;
        worldMap.save();
        worldMap.fillStyle = '#000000';
        worldMap.fillRect(0,0,1510,1130);
        worldMap.translate(Math.round(mapX - 1510 * (mapDragX - mapMouseX) / 600),Math.round(mapY - 1510 * (mapDragY - mapMouseY) / 600));
        for(var i in world){
            worldMap.drawImage(loadedMap[world[i].fileName.slice(0,-4)].lower,mapRatio / 1510 * world[i].x * 4,mapRatio / 1510 * world[i].y * 4,mapRatio / 1510 * 3200,mapRatio / 1510 * 3200);
            worldMap.drawImage(loadedMap[world[i].fileName.slice(0,-4)].upper,mapRatio / 1510 * world[i].x * 4,mapRatio / 1510 * world[i].y * 4,mapRatio / 1510 * 3200,mapRatio / 1510 * 3200);
        }
        worldMap.restore();
        gameDiv.style.display = 'inline-block';
        disconnectedDiv.style.display = 'none';
        spectatorDiv.style.display = 'none';
        pageDiv.style.display = 'none';
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
    if(data.success === 1){
        alert("Account created with username \'" + signDivUsername.value + "\' and password \'" + signDivPassword.value + "\'.");
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
        alert("The account with username \'" + signDivUsername.value + "\' and password \'" + signDivPassword.value + "\' is already used. Disconnect this account to change the password.");
    }
    else if(data.success === 1){
        alert("Incorrect Password.");
    }
    else{
        alert("No account found with username \'" + signDivUsername.value + "\' and password \'" + signDivPassword.value + "\'.");
    }
});
socket.on('changePasswordResponse',function(data){
    if(data.success === 3){
        alert("Changed password to \'" + document.getElementById('newPassword').value + "\'.");
    }
    else if(data.success === 2){
        alert("The account with username \'" + signDivUsername.value + "\' and password \'" + signDivPassword.value + "\' is already used. Disconnect this account to change the password.");
    }
    else if(data.success === 1){
        alert("Incorrect Password.");
    }
    else if(data.success === 4){
        alert("Invalid characters.");
    }
    else{
        alert("No account found with username \'" + signDivUsername.value + "\' and password \'" + signDivPassword.value + "\'.");
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

var maps = {};

var tileset = new Image();
tileset.src = '/client/maps/roguelikeSheet.png';
var tilesetLoaded = false;
tileset.onload = function(){
    tilesetLoaded = true;
};
var loadedMap = {};
var renderLayers = function(json,name){
    if(isFirefox){
        var tempLower = document.createElement('canvas');
        var tempUpper = document.createElement('canvas');
        tempLower.canvas.width = json.layers[0].width * 64;
        tempLower.canvas.heiht = json.layers[0].height * 64;
        tempUpper.canvas.width = json.layers[0].width * 64;
        tempUpper.canvas.heiht = json.layers[0].height * 64;
        console.log('Firefox!!!')
    }
    else{
        var tempLower = new OffscreenCanvas(json.layers[0].width * 64,json.layers[0].height * 64);
        var tempUpper = new OffscreenCanvas(json.layers[0].width * 64,json.layers[0].height * 64);
    }
    var glLower = tempLower.getContext('2d');
    var glUpper = tempUpper.getContext('2d');
    resetCanvas(glLower);
    resetCanvas(glUpper);
    var tile = json.tilesets[0];
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
var world;
socket.on('loadMap',function(data){
    world = data;
    for(var i in world){
        loadMap(world[i].fileName.slice(0,-4));
    }
});
const times = [];
let fps;

loadMap('Town Hall');
loadMap('Fishing Hut');
loadMap('Tiny House');
loadMap('House');

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
Img.kiol = new Image();
Img.kiol.src = '/client/img/kiol.png';
Img.healthBar = new Image();
Img.healthBar.src = '/client/img/healthBar.png';
Img.healthBarEnemy = new Image();
Img.healthBarEnemy.src = '/client/img/healthBarEnemy.png';
Img.manaBar = new Image();
Img.manaBar.src = '/client/img/manaBar.png';

var request = new XMLHttpRequest();
request.open('GET',"/client/projectiles.json",true);

request.onload = function(){
    if(this.status >= 200 && this.status < 400){
        // Success!
        var json = JSON.parse(this.response);
        for(var i in json){
            Img[i] = new Image();
            Img[i].src = '/client/img/' + i + '.png';
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
var mapLocations = [
    ['The River','The Village'],
    ['','The Docks'],
];
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
var audio = 'tense';
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

var currentMap = '';
var tempMap = {};

var talking = false;
var selfId = null;

var state = {
    isDragging:false,
    isHidden:true,
    xDiff:0,
    yDiff:0,
    x:50,
    y:50,
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
}
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
    self.attackTick = initPack.attackTick;
    self.secondTick = initPack.secondTick;
    self.healTick = initPack.healTick;
    self.attackCost = initPack.attackCost;
    self.secondCost = initPack.secondCost;
    self.healCost = initPack.healCost;
    self.attackCooldown = initPack.attackCooldown;
    self.secondCooldown = initPack.secondCooldown;
    self.healCooldown = initPack.healCooldown;
    self.mapHeight = initPack.mapWidth;
    self.mapWidth = initPack.mapHeight;
    self.updated = true;
    self.animation = initPack.animation;
    self.animationDirection = initPack.animationDirection;
    self.stats = initPack.stats;
    self.type = initPack.type;
    self.update = function(){
        if(talking && self.id === selfId){
            socket.emit('keyPress',{inputId:'releaseAll'});
        }
        if(Math.abs(self.x - self.nextX) > 4){
            self.x += self.moveX;
        }
        if(Math.abs(self.y - self.nextY) > 4){
            self.y += self.moveY;
        }
    }
    self.draw = function(){
        self.animation = Math.round(self.animation);
        drawPlayer(self.render,ctx0,self.animationDirection,self.animation,self.x,self.y,4);
        
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
        healthBarText.innerHTML = self.hp + " / " + self.hpMax;
        healthBarValue.style.width = "" + 150 * self.hp / self.hpMax + "px";
        manaBarText.innerHTML = self.mana + " / " + self.manaMax;
        manaBarValue.style.width = "" + 150 * self.mana / self.manaMax + "px";
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
            xpText = Math.round(self.xp / 100) / 10 + "K ";
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
            xpMaxText = "/ " + Math.round(self.xpMax / 100) / 10 + "K";
        }
        xpBarText.innerHTML = xpText + xpMaxText;
        xpBarValue.style.width = "" + 150 * self.xp / self.xpMax + "px";
        document.getElementById('stat-text').innerHTML = 'You will deal a miminum of ' + Math.round(50 * self.stats.attack) + ' damage and a maximum of ' + Math.round(100 * self.stats.attack) + ' damage.<br>Out of 100 damage, you will receive ' + Math.round(100 / self.stats.defense) + ' damage.<br>You are level ' + self.level + '.<br>You will get ' + Math.round(self.stats.xp * 10) + ' xp per monster killed.<br>Your attack spends ' + Math.round(self.attackCost) + ' mana and has a cooldown of ' + self.attackCooldown + '  ticks. Your secondary attack spends ' + Math.round(self.secondCost) + ' mana and has a cooldown of ' + self.secondCooldown + ' ticks. Your heal spends ' + Math.round(self.healCost) + ' mana and has a cooldown of ' + self.healCooldown + ' ticks.';
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
    self.width = initPack.width;
    self.height = initPack.height;
    self.direction = initPack.direction;
    self.projectileType = initPack.projectileType;
    self.canCollide = initPack.canCollide;
    self.type = initPack.type;
    self.hp = initPack.hp;
    self.hpMax = initPack.hpMax;
    self.map = initPack.map;
    self.updated = true;
    self.update = function(){
        self.x += self.moveX;
        self.y += self.moveY;
    }
    self.draw = function(){
        ctx0.translate(self.x,self.y);
        ctx0.rotate(self.direction * Math.PI / 180);
        ctx0.drawImage(Img[self.projectileType],-self.width / 2,-self.height / 2);
        ctx0.rotate(-self.direction * Math.PI / 180);
        ctx0.translate(-self.x,-self.y);
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
    self.monsterType = initPack.monsterType;
    self.type = initPack.type;
    self.animation = initPack.animation;
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
        if(self.monsterType === 'blueBird'){
            self.animation = Math.round(self.animation);
            ctx0.drawImage(Img.bird,self.animation % 2 * 12,14 * 0,11,13,self.x - 22,self.y - 32,44,52);
        }
        if(self.monsterType === 'greenBird'){
            self.animation = Math.round(self.animation);
            ctx0.drawImage(Img.bird,self.animation % 2 * 12,14 * 1,11,13,self.x - 22,self.y - 32,44,52);
        }
        if(self.monsterType === 'redBird'){
            self.animation = Math.round(self.animation);
            ctx0.drawImage(Img.bird,self.animation % 2 * 12,14 * 2,11,13,self.x - 44,self.y - 52,88,104);
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
    }
    self.drawHp = function(){
        if(self.monsterType === 'redBird'){
            ctx1.drawImage(Img.healthBarEnemy,0,0,42,5,self.x - 63,self.y - 75,126,15);
            ctx1.drawImage(Img.healthBarEnemy,0,6,Math.round(42 * self.hp / self.hpMax),5,self.x - 63,self.y - 75,Math.round(126 * self.hp / self.hpMax),15);
        }
        else{
            ctx1.drawImage(Img.healthBarEnemy,0,0,42,5,self.x - 63,self.y - 50,126,15);
            ctx1.drawImage(Img.healthBarEnemy,0,6,Math.round(42 * self.hp / self.hpMax),5,self.x - 63,self.y - 50,Math.round(126 * self.hp / self.hpMax),15);
        }
        if(DEBUG){
            ctx1.strokeStyle = '#ff0000';
            ctx1.lineWidth = 4;
            ctx1.strokeRect(Math.floor(self.x / 64) * 64 - 16 * 64,Math.floor(self.y / 64) * 64 - 16 * 64,33 * 64,33 * 64)
            ctx1.strokeRect(Math.floor(self.x / 64) * 64,Math.floor(self.y / 64) * 64,1 * 64,1 * 64)
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
        ctx0.drawImage(Img.kiol,self.x - 20,self.y - 14,40,28);
    }
    self.drawName = function(){
        ctx1.font = "15px pixel";
        ctx1.fillStyle = '#ff7700';
        ctx1.textAlign = "center";
        ctx1.fillText(self.name,self.x,self.y - 52);
        ctx1.drawImage(Img.manaBar,0,0,42,5,self.x - 63,self.y - 36,126,15);
        ctx1.drawImage(Img.manaBar,0,6,Math.round(42 * self.mana / self.manaMax),5,self.x - 63,self.y - 36,Math.round(126 * self.mana / self.manaMax),15);
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
        }
        self.timer -= 1 / 4;
        if(self.timer < 0){
            self.toRemove = true;
        }
    }
    self.draw = function(){
        if(self.particleType === 'redDamage'){
            ctx1.font = "30px pixel";
            ctx1.fillStyle = 'rgba(255,0,0,' + (self.timer / 5) + ')';
            ctx1.textAlign = "center";
            ctx1.fillText(self.value,self.x,self.y);
        }
        else if(self.particleType === 'greenDamage'){
            ctx1.font = "30px pixel";
            ctx1.fillStyle = 'rgba(0,255,0,' + (self.timer / 5) + ')';
            ctx1.textAlign = "center";
            ctx1.fillText(self.value,self.x,self.y);
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
                        if(!arrayIsEqual(data.player[i].img.hair,Player.list[data.player[i].id].img.hair)){
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
                    }
                    if(data.player[i].hpMax !== undefined){
                        Player.list[data.player[i].id].hpMax = data.player[i].hpMax;
                    }
                    if(data.player[i].xp !== undefined){
                        Player.list[data.player[i].id].xp = data.player[i].xp;
                    }
                    if(data.player[i].xpMax !== undefined){
                        Player.list[data.player[i].id].xpMax = data.player[i].xpMax;
                    }
                    if(data.player[i].mana !== undefined){
                        Player.list[data.player[i].id].mana = Math.round(data.player[i].mana);
                    }
                    if(data.player[i].manaMax !== undefined){
                        Player.list[data.player[i].id].manaMax = data.player[i].manaMax;
                    }
                    if(data.player[i].level !== undefined){
                        Player.list[data.player[i].id].level = data.player[i].level;
                    }
                    if(data.player[i].map !== undefined){
                        Player.list[data.player[i].id].map = data.player[i].map;
                    }
                    if(data.player[i].attackTick !== undefined){
                        Player.list[data.player[i].id].attackTick = data.player[i].attackTick;
                    }
                    if(data.player[i].secondTick !== undefined){
                        Player.list[data.player[i].id].secondTick = data.player[i].secondTick;
                    }
                    if(data.player[i].healTick !== undefined){
                        Player.list[data.player[i].id].healTick = data.player[i].healTick;
                    }
                    if(data.player[i].attackCost !== undefined){
                        Player.list[data.player[i].id].attackCost = data.player[i].attackCost;
                    }
                    if(data.player[i].secondCost !== undefined){
                        Player.list[data.player[i].id].secondCost = data.player[i].secondCost;
                    }
                    if(data.player[i].healCost !== undefined){
                        Player.list[data.player[i].id].healCost = data.player[i].healCost;
                    }
                    if(data.player[i].attackCooldown !== undefined){
                        Player.list[data.player[i].id].attackCooldown = data.player[i].attackCooldown;
                    }
                    if(data.player[i].secondCooldown !== undefined){
                        Player.list[data.player[i].id].secondCooldown = data.player[i].secondCooldown;
                    }
                    if(data.player[i].healCooldown !== undefined){
                        Player.list[data.player[i].id].healCooldown = data.player[i].healCooldown;
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
                    if(data.player[i].animation !== undefined){
                        Player.list[data.player[i].id].animation = data.player[i].animation;
                    }
                    if(data.player[i].username !== undefined){
                        Player.list[data.player[i].id].username = data.player[i].username;
                    }
                    if(data.player[i].displayName !== undefined){
                        Player.list[data.player[i].id].displayName = data.player[i].displayName;
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
                    if(data.monster[i].hp !== undefined){
                        Monster.list[data.monster[i].id].hp = data.monster[i].hp;
                    }
                    if(data.monster[i].hpMax !== undefined){
                        Monster.list[data.monster[i].id].hpMax = data.monster[i].hpMax;
                    }
                    if(data.monster[i].animation !== undefined){
                        Monster.list[data.monster[i].id].animation = data.monster[i].animation;
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
                    if(data.pet[i].animation !== undefined){
                        Pet.list[data.pet[i].id].animation = data.pet[i].animation;
                    }
                    if(data.pet[i].name !== undefined){
                        Pet.list[data.pet[i].id].name = data.pet[i].name;
                    }
                    Pet.list[data.pet[i].id].updated = true;
                }
                else{
                    new Pet(data.pet[i]);
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
});
socket.on('spectator',function(data){
    gameDiv.style.display = 'inline-block';
    disconnectedDiv.style.display = 'none';
    spectatorDiv.style.display = 'inline-block';
    pageDiv.style.display = 'none';
    respawnTimer = 15;
    document.getElementById('respawnTimer').innerHTML = respawnTimer;
    document.getElementById('respawn').style.display = 'none';
    setTimeout(updateRespawn,1500);
});
socket.on('changeMap',function(data){
    if(shadeAmount < 0){
        shadeAmount = 0;
    }
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
socket.on('toggleSelect',function(data){
    inventory.select = !inventory.select;
    inventory.refreshRender();
});
socket.on('updateLeaderboard',function(data){
    document.getElementById('leaderboardScreen').innerHTML = '<div style="font-size:18px;">Leaderboards update every five minutes.</div><br>';
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

startQuest = function(){
    socket.emit('startQuest');
    document.getElementById('window').style.display = 'none';
    state.isHidden = true;
    disableAllMenu();
    document.getElementById('inventoryScreen').style.display = 'inline-block';
};

var response = function(data){
    socket.emit('diolougeResponse',data);
}
var MGHC = function(){};
var MGHC1 = function(){};
setInterval(function(){
    if(!selfId){
        return;
    }
    if(!Player.list[selfId]){
        return;
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
    }
    WIDTH = window.innerWidth;
    HEIGHT = window.innerHeight;
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
    MGHC1();

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
        entities.push(Projectile.list[i]);
    }
    for(var i in Monster.list){
        entities.push(Monster.list[i]);
    }
    for(var i in Npc.list){
        entities.push(Npc.list[i]);
    }
    for(var i in Pet.list){
        entities.push(Pet.list[i]);
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
    for(var i in Projectile.list){
        Projectile.list[i].drawHp();
        Projectile.list[i].update();
    }
    for(var i in Monster.list){
        Monster.list[i].drawHp();
        Monster.list[i].update();
    }
    for(var i in Npc.list){
        Npc.list[i].drawName();
    }
    for(var i in Pet.list){
        Pet.list[i].drawName();
    }
    for(var i in Npc.list){
        Npc.list[i].update();
    }
    for(var i in Pet.list){
        Pet.list[i].update();
    }
    for(var i in Particle.list){
        Particle.list[i].draw();
    }
    for(var i in Particle.list){
        if(Particle.list[i].toRemove){
            delete Particle.list[i];
        }
        else{
            Particle.list[i].update();
        }
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
    
    ctx1.restore();
    if(mapShadeAmount >= 2){
        mapShadeSpeed = -0.12;
    }
    if(Player.list[selfId].map === currentMap && shadeAmount > 1.5){
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
var updateRespawn = function(){
    if(spectatorDiv.style.display === 'none'){
        return;
    }
    respawnTimer = Math.max(respawnTimer - 1,0);
    document.getElementById('respawnTimer').innerHTML = respawnTimer;
    setTimeout(updateRespawn,1000);
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
        if(!talking){
            socket.emit('keyPress',{inputId:key,state:true});
        }
        if(key === 'i' && event.ctrlKey){
            disableAllMenu();
            document.getElementById('debugScreen').style.display = 'inline-block';
            document.getElementById('window').style.display = 'inline-block';
            state.isHidden = false;
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
window.onresize = function(){
    document.getElementById('pageDiv').style.backgroundSize = window.innerWidth + 'px,' + window.innerHeight + 'px';
    document.getElementById('pageDiv').style.width = window.innerWidth + 'px';
    document.getElementById('pageDiv').style.height = window.innerHeight + 'px';
}
document.oncontextmenu = function(event){
    event.preventDefault();
}
