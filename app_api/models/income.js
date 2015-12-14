var mongoose = require('mongoose');


var incomeSchema = new mongoose.Schema({

	name: {type: String , required: true},
	amount: {type: Number , required: true},
	reoccuring: {type: Boolean},
	dueDay: {type: Number},

});



mongoose.model('Income' , incomeSchema);