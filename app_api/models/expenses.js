var mongoose = require('mongoose');


var expenseSchema = new mongoose.Schema({

	name: {type: String , required: true},
	amount: {type: Number , required: true},
	reoccuring: {type: Boolean},
	dueDay: {type: Number},
	category: {type: String}

});



mongoose.model('Expense' , expenseSchema);