var mongoose = require('mongoose');

var playersSchema = new mongoose.Schema({
	player: String
});

var teamSchema = new mongoose.Schema({

	teamNumber: {type: Number , required: true},
	players: [playersSchema],

});



mongoose.model('Team' , teamSchema);