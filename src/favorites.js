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


const addTeamToFavorite = async (event) => {
    try {
        if (!event.body) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'ID is required'
                })
            }
        }
        var parsedBody = JSON.parse(event.body)
        if (!parsedBody.id) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'ID is required'
                })
            }
        }
        var teamID = Number(parsedBody.id)
        if (!teamID) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: 'ID should be an integer'
                })
            }
        }
        var existsQueryPromise = new Promise((resolve, reject) => {
            var existsQuery = `SELECT team.tname from team_table as team join favorites_table as fav on team.id = '${teamID}' and fav.team_id = '${teamID}';`
            connection.query(existsQuery, (err, results) => {
                if (err) {
                    reject({
                        status: false,
                        data: err
                    })
                }
                resolve({
                    status: true,
                    data: results
                })
            })
        });

        var existingTeam = await existsQueryPromise
        if (existingTeam.status && existingTeam.data.length > 0) {
            // console.log(existingTeam.data)
            return {
                statusCode: 200,
                body: JSON.stringify({
                    message: `Team is already added to your favorites`
                })
            }
        }
        var addTeamToFavoritePromise = new Promise((resolve, reject) => {
            var addTeamToFavoriteQuery = `INSERT INTO favorites_table(team_id) VALUES('${teamID}')`
            connection.query(addTeamToFavoriteQuery, (error, results) => {
                if (error) {
                    console.log('query error')
                    console.log(error)
                    reject(false)
                }
                console.log(results)
                resolve(true)
            })
        });

        var teamAdded = await addTeamToFavoritePromise
        if (teamAdded) {
            return {
                statusCode: 201,
                body: JSON.stringify({
                    message: 'Added to your favorites list'
                })
            }
        }

    } catch (error) {
        console.log(error)
    }
}

const getFavorites = async (event) => {

    try {
        var getFavoritesPromise = new Promise((resolve, reject) => {
            var getFavoritesQuery = 'SELECT  team_id as id, (SELECT tname FROM team_table WHERE id = fav.team_id) as tname FROM favorites_table AS fav;'
            connection.query(getFavoritesQuery, (err, results) => {
                if (err) {
                    reject({
                        status: false,
                        data: err
                    })
                }
                resolve({
                    status: true,
                    data: results
                })
            })
        });

        var results = await getFavoritesPromise;
        if (results.status) {
            if (results.data.length > 0) {
                return {
                    statusCode: 200,
                    body: JSON.stringify(results.data)
                }
            }
            else {
                return {
                    statusCode: 200,
                    body: JSON.stringify({
                        message: 'No teams are added in your favorite list.'
                    })
                }
            }
        }

    } catch (error) {

    }
}

const deleteFavorite = async (event) => {
    if (!event.body) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: 'ID is required'
            })
        }
    }
    var parsedBody = JSON.parse(event.body)
    if (!parsedBody.id) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: 'ID is required'
            })
        }
    }
    var teamID = Number(parsedBody.id)
    if (!teamID) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: 'ID should be an integer'
            })
        }
    }
    var deletePromise = new Promise((resolve, reject) => {
        var deleteQuery = `DELETE FROM favorites_table WHERE team_id='${teamID}';`

        connection.query(deleteQuery, (error, results) => {
            if (error) {
                reject(error)
            }
            resolve(results)
        })
    });

    var result = await deletePromise
    if (result.affectedRows > 0) {
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: `Team was successfully removed from the list.`
            })
        }
    }
    else {
        return {
            statusCode: 200,
            body: JSON.stringify({
                message: `Team not found`
            })
        }
    }

}

module.exports = {
    addTeamToFavorite, getFavorites, deleteFavorite
}