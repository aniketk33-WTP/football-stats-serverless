const { connection: dbConnection, connection } = require('./utilityFunction')
const { default: fetch } = require('node-fetch');

const teamsUrl = 'https://raw.githubusercontent.com/openfootball/football.json/master/2018-19/en.1.clubs.json'
const playersUrl = 'https://raw.githubusercontent.com/bakayks/PremierLeague.json/master/data.json'
const fixturesUrl = 'https://raw.githubusercontent.com/openfootball/football.json/master/2018-19/en.1.json'

const AddTeamsToDB = async () => {
    try {
        var responseString = await fetch(teamsUrl)
        var teamsJson = await responseString.json()
        const teamsList = teamsJson.clubs.sort((x, y) => {
            let a = x.name.toUpperCase(),
                b = y.name.toUpperCase();
            return a == b ? 0 : a > b ? 1 : -1;
        })
        //create the insert statement query        
        var valueStr = ''
        var addTeamQuery = 'INSERT INTO team_table(tname,tcode) VALUES '
        for (let index = 0; index < teamsList.length; index++) {
            const teamDetails = teamsList[index];
            if (teamsList.indexOf(teamDetails) == teamsList.length - 1) {
                valueStr += `('${teamDetails.name}','${teamDetails.code}');`
            }
            else {
                valueStr += `('${teamDetails.name}','${teamDetails.code}'), `
            }
        }
        addTeamQuery += valueStr
        console.log(addTeamQuery)

        const addDataPromise = new Promise((resolve, reject) => {
            dbConnection.query(addTeamQuery, (err) => {
                if (err) {
                    reject(err)
                }
                resolve('Successfully added to DB')
            })
        });
        var addDataToDB = await addDataPromise
        console.log(addDataToDB)

    } catch (error) {
        console.log(error)
    }
    finally{
        dbConnection.end()
    }

}

const AddPlayersToDB = async () => {
    try {

        var responseString = await fetch(playersUrl)
        var playersRes = await responseString.json()
        var playersList = playersRes.players

        //create insert query
        var addPlayersQuery = `INSERT INTO player_table(fullname,team_id) VALUES `
        var valueStr = ''
        for (let index = 0; index < playersList.length; index++) {
            const playerDetails = playersList[index];
            if (playersList.indexOf(playerDetails) == playersList.length - 1) {
                valueStr += `("${playerDetails.jersey_name}", (SELECT id FROM team_table WHERE tcode = '${playerDetails.club_code}'));`
            }
            else {
                valueStr += `("${playerDetails.jersey_name}", (SELECT id FROM team_table WHERE tcode = '${playerDetails.club_code}')), `
            }
        }
        addPlayersQuery += valueStr

        var addPlayerPromise = new Promise((resolve, reject) => {
            dbConnection.query(addPlayersQuery, (err) => {
                if (err) {
                    reject(err)
                }
                resolve('Successfully added players to DB')
            })
        });

        var result = await addPlayerPromise
        console.log(result)
    } catch (error) {
        console.log(error)
    }
    finally{
        connection.end()        
    }
}

const AddFixturesToDB = async () => {

    try {
        var responseString = await fetch(fixturesUrl)
        var matchdaysJson = await responseString.json()
        const matchDayList = matchdaysJson.matches

        let addFixtureQuery = `INSERT INTO fixture_table(home_team_id,away_team_id,fixture_date,winner_id) VALUES `
        var valuesQuery = ''
        for (let index = 0; index < matchDayList.length; index++) {
            const matchDetails = matchDayList[index];
            var fixture_date = matchDetails.date
            var team1 = matchDetails.team1
            var team2 = matchDetails.team2
            var teamA_score = matchDetails.score.ft[0]
            var teamB_score = matchDetails.score.ft[1]
            var winner = -1
            if (teamA_score > teamB_score) {
                winner = matchDetails.team1
            }
            else if (teamA_score < teamB_score) {
                winner = matchDetails.team2
            }
            if (matchDayList.indexOf(matchDetails) == matchDayList.length - 1) {
                valuesQuery += `((SELECT id FROM team_table WHERE tname = '${team1}'), (SELECT id FROM team_table WHERE tname = '${team2}'), '${fixture_date}',(SELECT id FROM team_table WHERE tname = '${winner}'));`
            } else {
                valuesQuery += `((SELECT id FROM team_table WHERE tname = '${team1}'), (SELECT id FROM team_table WHERE tname = '${team2}'), '${fixture_date}',(SELECT id FROM team_table WHERE tname = '${winner}')), `
            }
        }

        addFixtureQuery += valuesQuery
        var addDataPromise = new Promise((resolve, reject) => {
            dbConnection.query(addFixtureQuery, (err) => {
                if (err) {
                    reject(err)
                }
                resolve('Successfully added fixtures to DB')
            })
        });

        var result = await addDataPromise
        console.log(result)

    } catch (error) {
        console.log(error)
    }
    finally {
        dbConnection.end()
    }
}

// const test = new Promise((resolve, reject) => {
//     reject('hey')
// });
// const testUnc = async()=>{
//     var r = await test
//     console.log(r)

// }
// testUnc()
// AddTeamsToDB()
// AddPlayersToDB()
// AddFixturesToDB()