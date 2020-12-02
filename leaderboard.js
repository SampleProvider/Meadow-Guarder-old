
const { Client } = require('pg');

var connectionString = 'postgres://gncoefpoytmecg:931c0ad1934b70f5228e7ddfba4b5f6da7898c812186eb1a5538ee08bf7295ca@ec2-34-231-56-78.compute-1.amazonaws.com:5432/dfo5un9rh1egi9';
const client = new Client({
	connectionString:connectionString,
	ssl:{
		rejectUnauthorized: false
	}
});

client.connect();

var CLEAN = false;

var leaderboardXP = [];

var compareXP = function(currentRow){
    if(currentRow.xp === undefined){
        leaderboardXP.splice(i,0,currentRow);
        return;
    }
    for(var i in leaderboardXP){
        if(leaderboardXP[i].level > currentRow.level){
            leaderboardXP.splice(i,0,currentRow);
            return;
        }
        else if(leaderboardXP[i].level === currentRow.level){
            if(leaderboardXP[i].xp > currentRow.xp){
                leaderboardXP.splice(i,0,currentRow);
                return;
            }
            else if(leaderboardXP[i].xp < currentRow.xp){
                
            }
            else if(leaderboardXP[i].xp === currentRow.xp){
                leaderboardXP.splice(i,0,currentRow);
                return;
            }
        }
    }
    leaderboardXP.push(currentRow);
}

updateLeaderboard = function(){
    leaderboardXP = [];
    client.query('SELECT * FROM progress;', (err, res) => {
        for(var i in res.rows){
            var currentRow = {
                xp:JSON.parse(res.rows[i].qprogress).xp,
                level:JSON.parse(res.rows[i].qprogress).level,
                inventory:JSON.parse(res.rows[i].qprogress).inventory,
                username:res.rows[i].qusername,
            }
            if(leaderboardXP.length === 0){
                leaderboardXP.push(currentRow);
            }
            else{
                compareXP(currentRow);
            }
        }
        leaderboardXP = leaderboardXP.reverse();
        for(var i in SOCKET_LIST){
            SOCKET_LIST[i].emit('updateLeaderboard',leaderboardXP);
        }
    });
}