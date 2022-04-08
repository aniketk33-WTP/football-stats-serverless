'use strict';

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

const getTeams = async (event, context, callback) => {
  var resultPromise = new Promise((resolve, reject) => {
    connection.query('select * from team_table;', (error, results) => {
      if (error) {
        console.log('query error')
        console.log(error)
        reject(error)
      }
      console.log(results)
      resolve(results)
    })
  });

  try {
    var resultData = await resultPromise
    return {
      statusCode: 200,
      body: JSON.stringify(resultData)
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Try again later',
        error
      })
    }
  }
}


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
      }}
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

module.exports = {
  getTeams, addPlayerToTransferTable
}
// Use this code if you don't use the http event with the LAMBDA-PROXY integration
// return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
