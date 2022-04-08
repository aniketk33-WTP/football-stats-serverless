const { connection } = require('../Utilities/utilityFunction');

connection.connect((err, result) => {
    if (err) {
        console.log('Connection error', err)
        return {
            statusCode: 500,
            body: JSON.stringify(err)
        }
    }
    console.log('connection was successful')
})


const addPlayerToTransferTable = async (event) => {

    try {
        if (!event.body) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'Player and Current team ID is required'
                })
            }
        }
        var parsedBody = JSON.parse(event.body)
        if (!parsedBody.playerId) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'Player ID is required'
                })
            }
        }
        else if (!parsedBody.newTeamId) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'New team ID is required'
                })
            }
        }
        else if (!parsedBody.price) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'Price is required'
                })
            }
        }
        var playerId = Number(parsedBody.playerId)
        var newTeamId = Number(parsedBody.newTeamId)
        var price = Number(parsedBody.price)
        if (!playerId) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'Player ID should be an integer'
                })
            }
        }
        else if (!newTeamId) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'Current team ID should be an integer'
                })
            }
        }
        else if (!price) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'Price should be a number'
                })
            }
        }
        var existsQueryPromise = new Promise((resolve, reject) => {
            var existsQuery = `SELECT * FROM player_table AS player WHERE id = '${playerId}' AND team_id = '${newTeamId}'`
            connection.query(existsQuery, (error, results) => {
                if (error) {
                    reject(error)
                }
                resolve({
                    status: true,
                    data: results
                })
            })
        });
        var existsQueryRes = await existsQueryPromise
        if (existsQueryRes.status && existsQueryRes.data.length > 0) {
            return {
                statusCode: 200,
                body: JSON.stringify({
                    message: 'Player already playing in the new team.'
                })
            }
        }
        var addPlayerToTransferTablePromise = new Promise((resolve, reject) => {
            var query = `INSERT INTO transfer_table(player_id,prev_team_id,new_team_id,price) VALUES ('${playerId}',(SELECT team_id FROM player_table WHERE id = '${playerId}'), '${newTeamId}', '${price}')`
            connection.query(query, (error, results) => {
                if (error) {
                    reject(false)
                }
                resolve(true)
            })
        });
        var addPlayerToTransferTableResult = await addPlayerToTransferTablePromise
        if (addPlayerToTransferTableResult) {
            var updateNewTeamIdPromise = new Promise((resolve, reject) => {
                var updateNewTeamIdQuery = `UPDATE player_table SET team_id = '${newTeamId}' WHERE id = '${playerId}'`
                connection.query(updateNewTeamIdQuery, (error, results) => {
                    if (error) {
                        reject(error)
                    }
                    resolve(true)
                })
            });
            var updateRes = await updateNewTeamIdPromise
            if (updateRes) {
                return {
                    statusCode: 200,
                    body: JSON.stringify({
                        message: 'Player sold'
                    })
                }
            }
        }

    } catch (error) {
        console.log(error)
    }

}

const getTransferList = async(event)=>{

    try {
        var transferQuery = `SELECT (SELECT fullname FROM player_table WHERE id = transfer.player_id) as pname,(SELECT tname FROM team_table WHERE id = transfer.prev_team_id) as old_club,(SELECT tname FROM team_table WHERE id = transfer.new_team_id) as new_club, price FROM transfer_table AS transfer;`
        
        var transferPromise = new Promise((resolve, reject) => {
            connection.query(transferQuery,(err,results)=>{
                if(err){
                    reject(err)
                }
                resolve(results)
            })
        });

        var result = await transferPromise;
        if(result.length > 0){
            var response = []
            console.log(result)
            for (let index = 0; index < result.length; index++) {
                const playerDetails = result[index];
                response.push({
                    "Player Name: ":playerDetails.pname,
                    "Old club": playerDetails.old_club,
                    "Transfer":`Sold to ${playerDetails.new_club} for ${playerDetails.price} million dollars`
                })                
            }
            return{
                statusCode: 200,
                body: JSON.stringify(response)
            }
        }
        return{
            statusCode: 200, 
            body: JSON.stringify({
                message:"No players were purchased or transfered in this window."
            })
        }
        
    } catch (error) {
        console.log(error)
    }
}

module.exports = {
    addPlayerToTransferTable, getTransferList
}