
var readline = require('readline');

var rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout
});

var doCmd = function(command){
    if(command[0] === '/'){

	}
	else{
		for(var i in SOCKET_LIST){
			SOCKET_LIST[i].emit('addToChat','Console sp: ' + command);
		}
    }
    questionCmd();
}
var questionCmd = function(){
    rl.question('Command Prompt\n',function(answer){
        doCmd(answer);
        //rl.close();
    });
}

questionCmd();