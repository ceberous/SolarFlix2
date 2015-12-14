var mongoose = require('mongoose');


var categoryScema = new mongoose.Schema({

	name: {type: String , required: true}

});



mongoose.model('Category' , categoryScema);