
const { Client } = require('pg');

var connectionString = 'postgres://osonqhwewiurod:d63dd1bbb1d7d873e072deb5428138534c07cc2dd86e6925a9c2d159c2c91d0a@ec2-52-207-124-89.compute-1.amazonaws.com:5432/deptf3pe77lr9f';
const client = new Client({
	connectionString:connectionString,
	ssl:{
		rejectUnauthorized: false
	}
});

client.connect();

var leaderboardXP = [];
var compare = function(currentRow){
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
        var j = parseInt(i,10) + 1;
        console.log(j + '. ' + leaderboardXP[i].username + '\nLevel ' + leaderboardXP[i].level + ' ' + leaderboardXP[i].xp + ' XP');
    }
});