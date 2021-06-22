

const { Client } = require('pg');

var connectionString;
if(SERVER === 'localhost'){
	connectionString = 'postgres://gncoefpoytmecg:931c0ad1934b70f5228e7ddfba4b5f6da7898c812186eb1a5538ee08bf7295ca@ec2-34-231-56-78.compute-1.amazonaws.com:5432/dfo5un9rh1egi9';
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
	for(var i in players){
		client.query('UPDATE progress SET qusername=\'' + players[i].username + '\', qprogress=\'' + JSON.stringify({inventory:players[i].inventory.items,currentEquip:players[i].inventory.currentEquip,xp:players[i].xp,level:players[i].level,questStats:players[i].questStats,img:players[i].img,coins:players[i].coins,devCoins:players[i].devCoins,materials:players[i].inventory.materials,petType:players[i].petType}) + '\' WHERE qusername=\'' + players[i].username + '\';', (err, res) => {
			if(err){
				throw err;
			}
		});
	}
}
getDatabase = function(username,cb){
	client.query('SELECT * FROM progress WHERE qusername=\'' + username + '\';', (err, res) => {
		if(res.rows[0]){
			return cb(JSON.parse(res.rows[0].qprogress));
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
	client.query('INSERT INTO progress(qusername, qprogress) VALUES (\'' + data.username + '\', \'{}\');', (err, res) => {
		if(err){
			throw err;
		}
	});
}
Database.removeUser = function(data,cb){
    if(!USE_DB)
		return cb();
	client.query('DELETE FROM account WHERE qusername=\'' + data.username + '\';', (err, res) => {
		if(err){
			throw err;
		}
		client.query('DELETE FROM progress WHERE qusername=\'' + data.username + '\';', (err, res) => {
			if(err){
				throw err;
			}
			return cb();
		});
	});
}
Database.changePassword = function(data,cb){
    if(!USE_DB)
		return cb();
	client.query('UPDATE account SET qpassword=\'' + data.newPassword + '\'WHERE qusername=\'' + data.username + '\';', (err, res) => {
		if(err){
			throw err;
		}
		return cb();
	});
}