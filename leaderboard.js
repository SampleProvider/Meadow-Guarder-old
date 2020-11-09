
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
var compare = function(currentRow){
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
client.query('SELECT * FROM progress;', (err, res) => {
    for(var i in res.rows){
        var currentRow = {
            xp:JSON.parse(res.rows[i].qprogress).xp,
            level:JSON.parse(res.rows[i].qprogress).level,
            username:res.rows[i].qusername,
        }
        if(leaderboardXP.length === 0){
            leaderboardXP.push(currentRow);
        }
        else{
            compare(currentRow);
        }
    }
    leaderboardXP = leaderboardXP.reverse();
    for(var i in leaderboardXP){
        if(leaderboardXP[i].level === 0 || leaderboardXP[i].level === undefined){
            if(leaderboardXP[i].xp === 0 || leaderboardXP[i].xp === undefined){
                if(CLEAN === true){
                    client.query('DELETE FROM progress WHERE qusername=\'' + leaderboardXP[i].username + '\';', (err, res) => {

                    });
                    client.query('DELETE FROM account WHERE qusername=\'' + leaderboardXP[i].username + '\';', (err, res) => {

                    });
                }
            }
        }
        else{
            var j = parseInt(i,10) + 1;
            var tag = '';
            if(leaderboardXP[i].username === 'Suvanth'){
                tag = ' (Exploited)'
            }
            if(leaderboardXP[i].username === 'speedrunSP'){
                tag = ' (Speed Run)'
            }
            if(leaderboardXP[i].username === 'Fast_run_1'){
                tag = ' (Speed Run)'
            }
            console.log(j + '. ' + leaderboardXP[i].username + tag + '\nLevel ' + leaderboardXP[i].level + ' ' + leaderboardXP[i].xp + ' XP');
        }
    }
});