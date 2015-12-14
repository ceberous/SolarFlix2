var mongoose = require('mongoose');

var Team = mongoose.model('Team');
var Stats = mongoose.model('Stats');

// API CONIFG
// ===================================
	// var request = require('request');
	var apiOptions = {
		server: "http://localhost:3000"
	};
	if (process.env.NODE_ENV === 'production') {
		// apiOptions.server = "https:/getting-mean-loc8r.herokuapp.com";
	}



// ======== END API ==================


// HELPER FUNCTIONS 
// ======================================
	var sendJSONResponse = function( res , status , content ) {
	    res.status(status);
	    res.json(content);
	};

	var doAddPlayer = function( req , res , team ) {

		if (!team) {sendJSONResponse(res , 404 , {"message": "team not found"});}
		else {

			team.players.push({
				player: req.params.newPlayer
			});

			team.save(function( err , team ) {
				// var thisTeam;
				if (err) {sendJSONResponse( res , 404 , err );}
				/*
				else {
					// thisTeam = team.players[team.players.length - 1];
					// sendJSONResponse( res , 201 , team );
				}
				*/

				Team.find({} , function( err , teams ){
					sendJSONResponse( res , 200 , teams);
				});

			});

			

		}

	};
// ========== END HELPER ==================





module.exports.getAllTeams = function(req, res) {

	console.log(req.params.teamNumber);

	Team.find({} , function( err , teams ){
		sendJSONResponse( res , 200 , teams);
	});

};

module.exports.teamCreate = function( req , res ) {

	Team.create(
		{
			teamNumber: req.params.teamNumber,
		},
		function( err , team ) {
			if (err) {
				sendJSONResponse( res , 400 , err );
			}
			else {
				sendJSONResponse( res , 201 , team );
			}		

		}

	);

	console.log("Should of Created a team with the number : " + req.params.teamNumber);

};

module.exports.editTeam = function( req , res ) {

	var teamNumber = req.params.teamNumber;
	var newTeamNumber = req.params.newTeamNumber;

	Team.findOne({})
		.select({teamNumber: teamNumber})
		.exec(function ( err , team ){
			if (err) {sendJSONResponse( res , 400 , err );}
			else {
				if (team) {

					team.teamNumber = newTeamNumber;

					team.save(function( err , team ) {
						// var thisTeam;
						if (err) {sendJSONResponse( res , 404 , err );}
						/*
						else {
							// thisTeam = team.players[team.players.length - 1];
							// sendJSONResponse( res , 201 , team );
						}
						*/

						Team.find({} , function( err , teams ){
							sendJSONResponse( res , 200 , teams);
						});

					});

				}
				else {
					sendJSONResponse( res , 200 , {'message': 'could not find team: ' + teamNumber });
				}
			}
		})	
	;

};

module.exports.deleteTeam = function( req , res ) {

	var teamNumber = req.params.teamNumberID;

	if (teamNumber) {

		// HOLY GRAIL OF MONGOOSE FINDING .findOne({})
		Team.findOne({_id: teamNumber})
			.exec(function( err , team ) {
				if (err) {sendJSONResponse(res , 400 , err);}
				else {
					if (team) {
						console.log('About To Delete Team = ');
						console.log(team);
						var teamNum = team.teamNumber;
						team.remove(function (err) {
							if (err) {console.log(err);}
							else {
								var str = 'removed team #: ' + teamNum;
								console.log(str);
								sendJSONResponse( res , 200 , {'message' : str} );
							}
						});
					} else {
						sendJSONResponse( res , 200 , {'message' : 'nuttin'} );
					}
				}

			})
		;

	}
	else {
		sendJSONResponse( res , 404 , {
			"message": "Not Found, teamname required"
		});
	}

};


module.exports.playerCreate = function( req , res ) {

	console.log("\n(Should Be Adding) { ");	
	var newPlayer = req.params.newPlayer;
	console.log('\tNew Player : ' + newPlayer);
	var teamNumber = req.params.teamNumber;
	console.log('\tTo Team Number #: ' + teamNumber);
	console.log('}\n');

	var foundTeam;

	if (teamNumber) {

		Team.findOne({teamNumber: teamNumber})
			.exec(function( err , team ) {
				if (err) {sendJSONResponse(res , 400 , err);}
				else {
					console.log('Found Team = ');
					console.log(team);
					doAddPlayer( req , res , team );
				}

			})
		;

	}
	else {
		sendJSONResponse( res , 404 , {
			"message": "Not Found, teamname required"
		});
	}

};

module.exports.editPlayer = function( req , res ) {

	var teamNumber = req.params.teamNumber;
	var playerID = req.params.playerID;
	var newName = req.params.newName;

	Team.findOne({teamNumber: teamNumber})
		.exec(function(err , team) {
			console.log('Found Team : ');
			console.log(team);
			
			var player = team.players.id(playerID);
			console.log('editing playerID: ' + playerID);
			console.log('with name: ' + player.player );
			player.player = newName;
			
			team.save(function( err ) {
				if (err) {sendJSONResponse(res , 404 , err);}
				else {
					
					Team.find({} , function( err , teams ){
						sendJSONResponse( res , 200 , teams);
					});
					
				}
			});
	
		})
	;

};	

module.exports.playerDelete = function( req , res ) {

	var teamNumber = req.params.teamNumber;
	var playerID = req.params.playerID;

	Team.findOne({teamNumber: teamNumber})
		.exec(function(err , team) {
			console.log('Found Team : ');
			console.log(team);
			team.players.id(playerID).remove();
			team.save(function( err ) {
				if (err) {sendJSONResponse(res , 404 , err);}
				else {
					sendJSONResponse( res , 204 , null);
				}
			});
		})
	;

};





// MISC / HOPEFULLY DEGRADED FUNCTIONS
// ===================================
	module.exports.getTeamNumber = function( req , res ) {

		// existance
		if (req.params && req.params.teamNumber) {

			Team.find({"teamNumber": req.params.teamNumber})
				// Read ONE location
				.exec(function( err , team ) {
					if (!err) {
						sendJSONResponse( res , 200 , team );
					} else {
						sendJSONResponse( res , 404 , {
							"message": "locationid not found in database"
						});
					}
				})

			;

		} 
		else {
			sendJSONResponse( res , 404 , {
				"message" : "No Locationid in request"
			});
		}


	};	

	module.exports.makeCurrentTeam = function( req , res ) {
		Stats.create(
			{
				currentTeam: 1,
			},
			function( err , obj ) {
				if (err) {
					sendJSONResponse( res , 400 , err );
				}
				else {
					sendJSONResponse( res , 201 , obj );
				}			
			}
		);
	};	


	module.exports.getCurrentTeamTrial = function( req , res ) {
		Team.count({} , function( err , count ) {
			sendJSONResponse( res , 200 , count );
		});
	};


	module.exports.getCurrentTeam = function( req , res ) {
		Stats.findOne().select('currentTeam')
			.exec(function( err , object ) {
				console.log('Logging getCurrentTeam() { ' + '\n\t' + object+ '\n}');
				sendJSONResponse( res , 200 , object );
			})
		;
	};

	module.exports.updateCurrentTeam = function( req , res ) {
		Stats.findOne( {} , function( err , object ) {
			object.currentTeam = req.params.number;
			object.save();
			console.log('Logging from updateCurrentTeam() { ' + '\n\t' + object + '\n}');
			sendJSONResponse( res , 200 , object );
		});
	};

// ============END MISC===============

















