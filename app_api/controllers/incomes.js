var mongoose = require('mongoose');
var Income = mongoose.model('Income');
var Category = mongoose.model('Category');


// HELPER FUNCTIONS 
// ======================================
	var sendJSONResponse = function( res , status , content ) {
	    if (status) {res.status(status);}
	    res.json(content);
	};
// ========== END HELPER ==================

	
module.exports.getAllIncomes = function( req , res ) {
	Income.find({})
		.exec(function(err , incomes) {
			if (err) {sendJSONResponse( res , 404 , err);}
			else {
				if (incomes) {
					sendJSONResponse( res , 200 , incomes);
				}
			}
		})
	;
};

module.exports.newIncome = function( req , res ) {
	Income.create(
		{
			name: req.params.name,
			amount: req.params.amount,
			reoccuring: req.params.reoccuring,
			dueDay: req.params.dueDay,
		},
		function( err , obj ) {
			if (err) {
				sendJSONResponse( res , 400 , err );
			}
			else {
				res.json(obj);
			}			
		}
	);	
};

module.exports.editIncome = function( req , res ) {
	Income.findById(req.params.incomeID)
		.exec(function(err , income) {
			income.name = req.params.name;
			income.amount = req.params.amount;
			income.reoccuring = req.params.reoccuring;
			income.dueDay = req.params.day;

			income.save(function( err , income ) {
				if (err) {sendJSONResponse( res , 404 , err );}

				sendJSONResponse( res , 200 , income);

			});

		})
	;	
};

module.exports.deleteIncome = function( req , res ) {
	Income.findByIdAndRemove(req.params.incomeID)
		.exec(function( err , income) {
			if (err) {sendJSONResponse( res , 404 , err);}
			else {
				sendJSONResponse( res , 200 , null);
			}
		})
	;	
};	

// MISC
// ===================================

// ============END MISC===============

















