
const { Client } = require('pg');

require('./DATABASE_URL.js')

const client = new Client({
	connectionString:connectionString,
	ssl:{
		rejectUnauthorized: false
	}
});

client.connect();

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