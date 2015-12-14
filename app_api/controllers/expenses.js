var mongoose = require('mongoose');
var DateIdea = mongoose.model('DateIdea');



// HELPER FUNCTIONS 
// ======================================
	var sendJSONResponse = function( res , status , content ) {
	    if (status) {res.status(status);}
	    res.json(content);
	};
// ========== END HELPER ==================

module.exports.getAllTimes = function( req , res ) {
	DateIdea.find({})
		.exec(function(err , times) {
			if (err) {sendJSONResponse( res , 404 , err);}
			else {
				if (expenses) {
					sendJSONResponse( res , 200 , times);
				}
			}
		})
	;
};


module.exports.newExpense = function( req , res ) {

	var name = req.params.name || '' ;
	var amount = req.params.amount || 0.00 ;
	var reoccuring = req.params.reoccuring || false ;
	var dueDay = req.params.day || 1 ;
	var category = req.params.category || '';

	Expense.create(
		{
			name: name,
			amount: amount,
			reoccuring: reoccuring,
			dueDay: dueDay,
			category: category
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

module.exports.editExpenseID = function( req , res ) {

	Expense.findById(req.params.expenseID)
		.exec(function(err , expense) {
			expense.name = req.params.name;
			expense.amount = req.params.amount;
			expense.reoccuring = req.params.reoccuring;
			expense.dueDay = req.params.dueDay;
			expense.category = req.params.category;

			expense.save(function( err , expense ) {
				if (err) {sendJSONResponse( res , 404 , err );}

				sendJSONResponse( res , 200 , expense);

			});

		})
	;
};

module.exports.deleteExpenseID = function( req , res ) {
	Expense.findByIdAndRemove(req.params.id)
		.exec(function( err , expense) {
			if (err) {sendJSONResponse( res , 404 , err);}
			else {
				sendJSONResponse( res , 200 , null);
			}
		})
	;
};

module.exports.getAllExpenses = function( req , res ) {
	Expense.find({})
		.exec(function(err , expenses) {
			if (err) {sendJSONResponse( res , 404 , err);}
			else {
				if (expenses) {
					sendJSONResponse( res , 200 , expenses);
				}
			}
		})
	;
};

module.exports.newCategory = function( req , res ) {
	Category.create(
		{
			name: req.params.name
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

module.exports.getAllCategories = function ( req , res ) {
	Category.find({})
		.exec(function( err , categories ){
			if (err) {sendJSONResponse( res , 404 , err);}
			else {
				if (categories) {
					sendJSONResponse( res , 200 , categories);
				}
			}			
		})
	;
};

module.exports.editExpenseCategory = function( req , res ) {

	Category.findById(req.params.categoryID)
		.exec(function(err , category){
			if (err) {sendJSONResponse( res , 404 , err);}
			else {

				category.name = req.params.newName;

				category.save(function( err , category ) {
					if (err) {sendJSONResponse( res , 404 , err );}

					sendJSONResponse( res , 200 , category);

				});

			}
		})
	;

};
	
module.exports.deleteCategory = function( req , res ) {
	Category.findByIdAndRemove(req.params.categoryID)
		.exec(function( err , category) {
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

















