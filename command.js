
var readline = require('readline');
var colors = require('colors');

colors.setTheme({
    info: 'white',
    help: 'cyan',
    warn: 'yellow',
    success: 'magenta',
    error: 'red'
});


var consoleName = 'Console sp'

var rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

var cmdError = function(err,res){
    switch(err){
        case 'playerFound':
            console.error('No player with username \''.error + res.error + '\''.error);
            break;
        case 'param':
            console.error('Invalid Parameters'.error);
            break;
        case 'command':
            console.error('Invalid Command'.error);
            break;
    }
}

var cmdDone = function(err,res){
    switch(err){
        case 'commandDone':
            console.error('Command Successful!'.success);
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
        if(commandIndex === 0){
            var command = text.substring(1);
            command = command.toLowerCase();
        }
        else{
            var command = text.substring(1,commandIndex);
            command = command.toLowerCase();
            index = commandIndex + 1;
            for(var i = commandIndex + 1;i < text.length;i++){
                if(text[i] === ' '){
                    param.push(text.substring(index,i));
                    index = parseInt(i,10) + 1;
                }
            }
            param.push(text.substring(index));
        }
        switch(command){
            case 'broadcast':
                if(param.length < 2){
                    cmdError('param',0);
                    break;
                }
                var message = '';
                for(var i = 1;i < param.length;i++){
                    message += param[i];
                    if(i !== param.length - 1){
                        message += ' ';
                    }
                }
                for(var i in SOCKET_LIST){
                    SOCKET_LIST[i].emit('addToChat',param[0] + ': ' + message);
                }
                cmdDone('commandDone',0);
                break;
            case 'console':
                if(param.length === 0){
                    cmdError('param',0);
                    break;
                }
                if(param[0] === 'username'){
                    if(param.length === 1){
                        console.error('Current ConsoleName: '.info + consoleName.help);
                    }
                    else{
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
                }
                else if(param[0] === 'help'){
                    if(param.length === 1){
                        console.error('COMMAND LIST'.help);
                        console.error('Use / to start a command'.help);
                        console.error('BROADCAST-----------(param) BROADCAST-NAME MESSAGE'.help);
                        console.error('CONSOLE-------------(param) TYPE PARAM'.help);
                        console.error('DISCONNECT----------(param) PLAYER-NAME'.help);
                        console.error('EXIT----------------(param (none)'.help);
                        console.error('\nFor more help on a certain command, try /console help command'.info);
                    }
                    else if(param.length === 2){
                        switch(param[1]){
                            case 'broadcast':
                                console.error('Broadcasts a global message into the chat'.help);
                                console.error('\nParameters:'.help);
                                console.error('BROADCAST-NAME------Display name in the chat'.help);
                                console.error('MESSAGE-------------Message to display in the chat'.help);
                                break;
                            case 'console':
                                console.error('Special console commands'.help);
                                console.error('\nParameters:'.help);
                                console.error('TYPE----------------Type of command to do'.help);
                                console.error('\nTYPE = username-------Change the display username of non-command chats'.help);
                                console.error('TYPE = username-------Parameters:'.help);
                                console.error('TYPE = username-------(none)--------------Read currect username'.help);
                                console.error('TYPE = username-------USERNAME------------Username to set to'.help);
                                console.error('\nTYPE = help-----------Help on commands'.help);
                                console.error('TYPE = help-----------Parameters:'.help);
                                console.error('TYPE = help-----------(none)--------------Briefview of all commands'.help);
                                console.error('TYPE = help-----------COMMAND-------------Extra help on a certain command'.help);
                                console.error('\nTYPE = clear----------Clears the console'.help);
                                console.error('TYPE = clear----------Parameters:'.help);
                                console.error('TYPE = clear----------(none)--------------Clear console'.help);
                                console.error('\nTYPE = timeout--------Timeouts the console'.help);
                                console.error('TYPE = timeout--------Parameters:'.help);
                                console.error('TYPE = timeout--------TIME----------------Time, in ms, of how long you want to wait'.help);
                                break;
                            default:
                                cmdError('param');
                                break;
                        }
                    }
                    else{
                        cmdError('param',0);
                        break;
                    }
                }
                else if(param[0] === 'clear'){
                    if(param.length !== 1){
                        cmdError('param',0);
                        break;
                    }
                    console.clear();
                    console.log('For help on commands, try /console help'.info);
                }
                else if(param[0] === 'timeout'){
                    if(param.length !== 2){
                        cmdError('param',0);
                        break;
                    }
                    setTimeout(function(){
                        questionCmd();
                    },parseInt(param[1],10));
                    return;
                }
                else{
                    cmdError('param',0);
                }
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
                    break;
                }
                socket.emit('disconnected');
                Player.onDisconnect(socket);
                delete SOCKET_LIST[socket.id];
                cmdDone('commandDone',0);
                break;
            case 'exit':
                if(param.length !== 0){
                    cmdError('param',0);
                    break;
                }
                process.exit(0);
            case 'player':
                if(param.length < 2){
                    cmdError('param',0);
                    break;
                }
                if(param[0] === 'kill'){
                    var killed = false;
                    for(var i in Player.list){
                        if(Player.list[i].username === param[1]){
                            Player.list[i].hp = 0;
                            killed = true;
                        }
                    }
                    if(!killed){
                        cmdError('playerFound',param[1]);
                        break;
                    }
                }
                else if(param[0] === 'move'){
                    if(param.length !== 4){
                        cmdError('param',0);
                    }
                    var moved = false;
                    for(var i in Player.list){
                        if(Player.list[i].username === param[1]){
                            Player.list[i].move(parseInt(param[2],10),parseInt(param[3],10));
                            moved = true;
                        }
                    }
                    if(!moved){
                        cmdError('playerFound',param[1]);
                        break;
                    }
                }
                else{
                    cmdError('param',0);
                }
                cmdDone('commandDone',0);
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
    rl.question('$:',function(answer){
        doCmd(answer);
    });
}

console.log('For help on commands, try /console help'.info);
questionCmd();
