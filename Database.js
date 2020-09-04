var USE_DB = true;

//var mongojs = USE_DB ? require("mongojs") : null;
//var db = USE_DB ? mongojs('localhost:27017/game',['account','progress']) : null;
//var db = USE_DB ? mongojs('mongodb://gameMaitian:27017',['account','progress']) : null;
require('dotenv').config()
var mongojs = require('mongojs');
mongojs.connect(process.env.MONGODB_URI || 'mongodb://localhost/27017');

db.on('error', function (err) {
    console.log('Database error', err)
})

db.on('connect', function () {
    console.log('Database connected')
})

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
}
