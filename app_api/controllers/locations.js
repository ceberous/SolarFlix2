var request = require('request');
var apiOptions = {
	server: "http://localhost:3000"
};
if (process.env.NODE_ENV === 'production') {
	// apiOptions.server = "https:/getting-mean-loc8r.herokuapp.com";
}

var requestOptions = {
	url: 'http://yourapi.com/api/path',
	method: "GET",
	json: {},
	qs: {
		offset: 20
	}
};

request( requestOptions , function( err , response , body ) {

	if (err) {console.log(err);}
	else if (response.statusCode === 200) {console.log(body);}
	else {console.log(response.statusCode);}

});

var mongoose = require('mongoose');
var Loc = mongoose.model('Location');

var theEarth = (function() {

	var earthRadius = 6371; // km , miles is 3959

	var getDistanceFromRads = function(rads) {
		return parseFloat( rads * earthRadius );
	};

	var getRadsFromDistance = function(distance) {
		return parseFloat( distance / earthRadius );
	};

	return {
		getDistanceFromRads : getDistanceFromRads,
		getRadsFromDistance : getRadsFromDistance
	};

})();

var sendJSONResponse = function( res , status , content ) {
    res.status(status);
    res.json(content);
};


// SHOW ALL BY DISTANCE
module.exports.locationsListByDistance = function(req, res) {

	var lng = parseFloat(req.query.lng);
	var lat = parseFloat(req.query.lat);

	var point = {
	type: "Point",
	coordinates: [lng, lat]
	};

	var geoOptions = {
	spherical: true,
	maxDistance: theEarth.getRadsFromDistance(20),
	num: 10
	};

	// Error Checking
	if (!lng || !lat) {                                           
	sendJsonResponse(res, 404, {                                
	  "message": "lng and lat query parameters are required"    
	});                                                         
	return;                                                     
	}
                                                               
	Loc.geoNear(point, geoOptions , function(err, results, stats) {

		var locations = [];
		if (err) {                                                 
			sendJsonResponse(res, 404, err);                         
		} else {
			results.forEach(function(doc) {
		        locations.push({
		          distance: theEarth.getDistanceFromRads(doc.dis),
		          name: doc.obj.name,
		          address: doc.obj.address,
		          rating: doc.obj.rating,
		          facilities: doc.obj.facilities,
		          _id: doc.obj._id
		        });
			});
		    sendJsonResponse(res, 200, locations);
		}
	}); 

};

// CREATE
module.exports.locationsCreate = function(req , res) {
    
	Loc.create({

		name: req.body.name,
		address: req.body.address,
		facilities: req.body.facilities.split(","),
		coords: [parseFloat(req.body.lng) , parseFloat(req.body.lat)],
		openingTimes: [
			{
				days: req.body.days1,
				opening: req.body.opening1,
				closing: req.body.opening1,
				closed: req.body.closed1,
			},
			{
				days: req.body.days2,
				opening: req.body.opening2,
				closing: req.body.opening2,
				closed: req.body.closed2,				
			}
		]

		},

		function(err , location ) {
			if (err) {
				sendJSONResponse( res , 400 , err );
			}
			else {
				sendJSONResponse( res , 201 , location );
			}
		}

	);

};  

// READ
module.exports.locationsReadOne = function( req , res ) {

	// existance
	if (req.params && req.params.locationid) {

		Loc.findById(req.params.locationid)
			// Read ONE location
			.exec(function( err , location ) {
				if (!err) {
					sendJSONResponse( res , 200 , location );
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

// UPDATE
module.exports.locationsUpdateOne = function(req , res) {

	if (!req.params.locationid) {
		sendJSONResponse(res , 404 , {
			"message": "Not found, locationid is required"
		});
		return;
	}

	Loc.findById(req.params.locationid)
		.select('-reviews -rating') // Retrieve everything EXCEPT reviews and ratings
		.exec(function(err , location) {

			if (!location) {
				sendJSONResponse(res , 404 , {
					"message": "locationid not found"
				});
				return;
			}
			else if (err) {
				sendJSONResponse(res , 404 , err);
				return;
			}

			location.name = req.body.name;
			location.address = req.body.address;
			location.facilities = req.body.facilities.split(',');
			location.coords = [parseFloat(req.body.lng) , parseFloat(req.body.lat)];

			location.openingTimes = [
				{
					days: req.body.days1,
					opening: req.body.opening1,
					closing: req.body.opening1,
					closed: req.body.closed1,
				},
				{
					days: req.body.days2,
					opening: req.body.opening2,
					closing: req.body.opening2,
					closed: req.body.closed2,				
				}
			];

			location.save(function(err , location) {
				if (err) {sendJSONResponse(res , 404 , err);}
				else {
					sendJSONResponse( res , 200 , location);
				}
			});

		})

	;

};

// DELETE (instant)
module.exports.locationsDeleteOne = function(req , res) {

	var locationid = req.params.locationid;

	if (locationid) {

		Loc.findByIdAndRemove(locationid)
			.exec(function(err , location) {

				if (err) {sendJSONResponse(res , 404 , err); return;}

				sendJSONResponse( res , 204 , null);

			})
		;

	}
	else {
		sendJSONResponse(res , 404 , {
			"message": "No locationid provided"
		});
	}

};

// DELETE (with final preperations)
module.exports.locationsDeleteOneWithPrep = function(req , res) {

	var locationid = req.params.locationid;

	if (locationid) {

		Loc.findById(locationid)
			.exec(function(err , location) {

				if (err) {sendJSONResponse(res , 404 , err); return;}

				// Perform Final Preperations Here
					// 1.)
					// 2.)
					// 3.)

				// After Steps are completed , finally delete it
				Loc.remove(function(err , location) {
					if (err) {sendJSONResponse(res , 404 , err); return;}
					sendJSONResponse( res , 204 , null);
				});	

			})
		;

	}
	else {
		sendJSONResponse(res , 404 , {
			"message": "No locationid provided"
		});
	}

};




















