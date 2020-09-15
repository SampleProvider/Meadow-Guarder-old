
var readline = require('readline');

var consoleName = 'Console sp'

var rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

var cmdError = function(err,res){
    switch(err){
        case 'playerFound':
            console.error('No player with username \'' + res + '\'');
            break;
        case 'param':
            console.error('Invalid Parameters');
            break;
        case 'command':
            console.error('Invalid Command');
            break;
    }
}

var cmdDone = function(err,res){
    switch(err){
        case 'commandDone':
            console.error('Command Successful!');
            break;
    }
}

var doCmd = function(text){
    if(text[0] === '/'){
        var commandIndex = 0;
        var index = 0;
        var param = [];
        for(var i in text){
            if(text[i] === ' '){
                commandIndex = parseInt(i,10);
                break;
            }
        }
        var command = text.substring(1,commandIndex);
        index = commandIndex + 1;
        for(var i = commandIndex + 1;i < text.length;i++){
            if(text[i] === ' '){
                param.push(text.substring(index,i));
                index = parseInt(i) + 1;
            }
        }
        param.push(text.substring(index));
        switch(command){
            case 'kill':
                if(param.length !== 1){
                    cmdError('param',0);
                    break;
                }
                var killed = false;
                for(var i in Player.list){
                    if(Player.list[i].username === param[0]){
                        Player.list[i].hp = 0;
                        killed = true;
                    }
                }
                if(!killed){
                    cmdError('playerFound',param[0]);
                }
                cmdDone('commandDone',0);
                break;
            case 'broadcast':
                if(param.length < 2){
                    cmdError('param',0);
                    break;
                }
                var message = '';
                for(var i = 1;i < param.length;i++){
                    message += param[i];
                    if(i !== param.length - 1){
                        username += ' ';
                    }
                }
                for(var i in SOCKET_LIST){
                    SOCKET_LIST[i].emit('addToChat',param[0] + ': ' + message);
                }
                cmdDone('commandDone',0);
                break;
            case 'disconnect':
                if(param.length !== 1){
                    cmdError('param',0);
                    break;
                }
                var playerFound = false;
                for(var i in Player.list){
                    if(Player.list[i].username === param[0]){
                        var socket = SOCKET_LIST[i];
                        playerFound = true;
                    }
                }
                if(!playerFound){
                    cmdError('playerFound',param[0]);
                    return;
                }
                socket.emit('disconnected');
                Player.onDisconnect(socket);
                delete SOCKET_LIST[socket.id];
                cmdDone('commandDone',0);
                break;
            case 'timeout':
                if(param.length !== 1){
                    cmdError('param',0);
                    break;
                }
                setTimeout(function(){
                    questionCmd();
                },parseInt(param[0],10));
                return;
            case 'console':
                if(param.length === 0){
                    cmdError('param',0);
                    break;
                }
                if(param[0] === 'username'){
                    var username = '';
                    for(var i = 1;i < param.length;i++){
                        username += param[i];
                        if(i !== param.length - 1){
                            username += ' ';
                        }
                    }
                    consoleName = username;
                    cmdDone('commandDone',0);
                }
                else{
                    cmdError('param',0);
                }
                break;
            default:
                cmdError('command',0);
                break;
        }
    }
	else{
		for(var i in SOCKET_LIST){
			SOCKET_LIST[i].emit('addToChat',consoleName + ': ' + text);
		}
    }
    questionCmd();
}
var questionCmd = function(){
    rl.question('Type your command:\n',function(answer){
        doCmd(answer);
    });
}

questionCmd();