var mongoose = require('mongoose');


var dateIdeaSchema = new mongoose.Schema({

	month: {type: String , required: true},
	day: {type: String , required: true},
	year: {type: String , required: true},
	hour: {type: String , required: true},
	minutes: {type: String , required: true},
	timezone: {type: String , required: true},
	score: {type: Number}

});



mongoose.model('DateIdea' , dateIdeaSchema);