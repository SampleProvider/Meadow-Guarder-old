var USE_DB = true;


/*var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/game', {useNewUrlParser: true});
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
    console.log("Database connected");
});*/
var mongoose = require("mongoose");
var MONGODB_URI = "mongodb://heroku_qlp3lzc4:summer1803@ds035358.mlab.com:35358/heroku_qlp3lzc4";
var options = {
  useNewUrlParser:true,
  useCreateIndex:true,
  useFindAndModify:false,
  family:4,
};
mongoose.connect(MONGODB_URI,options);
var account = new mongoose.Schema({
	username: String,
	password: String,
});

var Account = mongoose.model("Account", account);


Database = {};

Database.isValidPassword = function(data,cb){
	console.log(1);
    if(!USE_DB)
	    return cb(2);
	Account.findOne({
		username: data.username,
		password: data.password,
	}).exec(function(err,res){
		console.log(1);
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
	Account.findOne({
		username: data.username,
	}).exec(function(err,res){
		console.log(res);
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
	var basic = new Account({
		username: data.username,
		password: data.password,
	});
	basic.save(function (err) {
		if (err) return handleError(err);
		cb();
	});
}
Database.removeUser = function(data,cb){
    if(!USE_DB)
		return cb();
	Account.deleteMany({
		username: data.username,
	}).exec(function (err) {
		if (err) return handleError(err);
		cb();
	});
}