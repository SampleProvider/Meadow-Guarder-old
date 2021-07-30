
const { Client } = require('pg');

if(SERVER === 'localhost'){
	require("./DATABASE_URL.js");
}
else{
	connectionString = connectionString = process.env.DATABASE_URL;
}

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
var account = undefined;
client.query('SELECT * FROM account;', (err, res) => {
    account = res.rows;
    client.query('SELECT * FROM progress;', (err1, res1) => {
        for(var i in res1.rows){
            var illegalAccount = true;
            for(var j in res.rows){
                if(res1.rows[i].qusername === res.rows[j].qusername){
                    illegalAccount = false;
                }
            }
            if(illegalAccount){
                //client.query('DELETE FROM progress WHERE qusername=\'' + res1.rows[i].qusername + '\';', (err, res) => {

                //});
            }
        }
    });
});