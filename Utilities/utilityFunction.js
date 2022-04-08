const mysql = require('mysql');
const dbConfig = require('./dbconfig.json')

const connection = mysql.createConnection({
  host: dbConfig.host,
  user: dbConfig.user,
  password: dbConfig.password,
  database: dbConfig.database
})

module.exports = { connection }