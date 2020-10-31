

const { Client } = require('pg');

var connectionString;
if(SERVER === 'localhost'){
	connectionString = 'postgres://osonqhwewiurod:d63dd1bbb1d7d873e072deb5428138534c07cc2dd86e6925a9c2d159c2c91d0a@ec2-52-207-124-89.compute-1.amazonaws.com:5432/deptf3pe77lr9f';
}
else{
	connectionString = process.env.DATABASE_URL;
}
const client = new Client({
	connectionString:connectionString,
	ssl:{
		rejectUnauthorized: false
	}
});

client.connect();

storeDatabase = function(players){
	var data = {};
	for(var i in players){
		data[players[i].username] = {inventory:players[i].inventory.items};
	}
	client.query('DELETE FROM progress WHERE id=1;', (err, res) => {
		if(err){
			throw err;
		}
		client.query('INSERT INTO progress(id, qprogress) VALUES (1, \'' + JSON.stringify(data) + '\');', (err, res) => {
			if(err){
				throw err;
			}
			//client.end();
		});
	});
}
getDatabase = function(username,cb){
	
	client.query('SELECT * FROM progress WHERE id=1;', (err, res) => {
		var row = JSON.parse(JSON.stringify(res.rows[0]));
		if(JSON.parse(row.qprogress)[username]){
			return cb(JSON.parse(row.qprogress)[username]);
		}
		else{
			return cb({});
		}
	});
}

var USE_DB = true;

Database = {};

Database.isValidPassword = function(data,cb){
    if(!USE_DB)
		return cb(3);
	client.query('SELECT * FROM account WHERE qusername=\'' + data.username + '\';', (err, res) => {
		if(err){
			throw err;
		}
		if(res.rows[0]){
			var row = JSON.parse(JSON.stringify(res.rows[0]));
			if(row.qpassword === data.password){
				for(var i in Player.list){
					if(Player.list[i].username === data.username){
						return cb(2);
					}
				}
				return cb(3);
			}
			else{
				return cb(1);
			}
		}
		else{
			return cb(0);
		}
	});
}
Database.isUsernameTaken = function(data,cb){
    if(!USE_DB)
	    return cb(1);
	client.query('SELECT * FROM account WHERE qusername=\'' + data.username + '\';', (err, res) => {
		if(err){
			throw err;
		}
		if(res.rows[0]){
			return cb(0);
		}
		else{
			return cb(1);
		}
	});
}
Database.addUser = function(data,cb){
    if(!USE_DB)
	    return cb();
	client.query('INSERT INTO account(qusername, qpassword) VALUES (\'' + data.username + '\', \'' + data.password + '\');', (err, res) => {
		if(err){
			throw err;
		}
		return cb();
	});
}
Database.removeUser = function(data,cb){
    if(!USE_DB)
		return cb();
	if(data === 'sp'){
		return cb();
	}
	client.query('DELETE FROM account WHERE qusername=\'' + data.username + '\';', (err, res) => {
		if(err){
			throw err;
		}
		return cb();
	});
}