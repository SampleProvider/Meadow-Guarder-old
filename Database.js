var USE_DB = true;

var fs = require('fs');
var mongojs = USE_DB ? require("mongojs") : null;
var db = USE_DB ? mongojs('localhost:27017/game',['account','progress']) : null;

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
/*
Database = {};

Database.isValidPassword = function(data,cb){
    if(!USE_DB)
	    return cb(2);
	db.account.find({username:data.username,password:data.password},function(err,res){
		if(res.length > 0){
			var x = 2;
			for(var i in Player.list){
				if(Player.list[i].username === data.username){
					x = 1;
				}
			}
			cb(x);
		}
		else{
			cb(0);
		}
	});
}
Database.isUsernameTaken = function(data,cb){
    if(!USE_DB)
	    return cb(true);
	db.account.find({username:data.username},function(err,res){
		if(res.length > 0){
			cb(true);
		}
		else{
			cb(false);
		}
	});
}
Database.addUser = function(data,cb){
    if(!USE_DB)
	    return cb();
	db.account.insert({username:data.username,password:data.password},function(err){
		cb();
	});
}
Database.removeUser = function(data,cb){
    if(!USE_DB)
	    return cb();
	db.account.remove({username:data.username},function(err){
		cb();
	});
}*/