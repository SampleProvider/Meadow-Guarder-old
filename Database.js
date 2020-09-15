var USE_DB = true;

var fs = require('fs');
if(SERVER === 'localhost'){
	var database = require("C:/Users/gu/Documents/game/Database.json");
}
else{
	var database = require("/app/Database.json");
}
Database = {};

Database.isValidPassword = function(data,cb){
    if(!USE_DB)
	    return cb(2);
	if(database.account[data.username]){
		if(database.account[data.username] === data.password){
			var x = 2;
			for(var i in Player.list){
				if(Player.list[i].username === data.username){
					x = 1;
				}
			}
			return cb(x);
		}
	}
	return cb(0);
}
Database.isUsernameTaken = function(data,cb){
    if(!USE_DB)
	    return cb(1);
	if(database.account[data.username]){
		return cb(0);
	}
	return cb(1);
}
Database.addUser = function(data,cb){
    if(!USE_DB)
	    return cb();
	database.account[data.username] = data.password;
	Database.update();
	return cb();
}
Database.removeUser = function(data,cb){
    if(!USE_DB)
		return cb();
	if(database.account[data.username]){
		database.account[data.username] = undefined;
		return cb(0);
	}
}

Database.update = function(){
	var data = JSON.stringify(database, null, 2);
	fs.writeFile('Database.json', data, (err) => {
		if (err) throw err;
		console.log('Data written to file');
	});
}