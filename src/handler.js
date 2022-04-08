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

module.exports = {
  getTeams
}
// Use this code if you don't use the http event with the LAMBDA-PROXY integration
// return { message: 'Go Serverless v1.0! Your function executed successfully!', event };
