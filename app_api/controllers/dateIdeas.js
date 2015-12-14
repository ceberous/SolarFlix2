var mongoose = require('mongoose');
var request = require('request');
var cheerio = require('cheerio');
var fs = require('fs');

// var DateIdea = mongoose.model('DateIdea');



// HELPER FUNCTIONS 
// ======================================
	var sendJSONResponse = function( res , status , content ) {
	    if (status) {res.status(status);}
	    res.json(content);
	};
// ========== END HELPER ==================





var parseBody = function( res , body ) {
	// console.log(body);

	var links = [];

	var $ = cheerio.load(body);
	var $linkSearch = $("div.js-episode a");
	$linkSearch.add($linkSearch.find('*'));
	$linkSearch.each( function( i , e ) {
		// console.log( $(e).attr("href") );
		var tmp = $(e).attr("href");
		tmp = tmp.toString();
		links.push( tmp );
	});


	sendJSONResponse( res , 200 , links );
};


var recursiveCallGrabPage = function( cachedURL ) {

	console.log("Requesting : \n");
	console.log(cachedURL + "\n");

	request( cachedURL , function( error , response , body ) {
		if ( !error && response.statusCode === 200 ) {
			if (body) {
				parseBody( res , body);
			}
		}
		else {
			if ( error  ) { console.log( error ); }
			recursiveCallGrabPage( cachedURL );
		}
	});	

};

var cachedURL;
module.exports.grabPage = function( req , res ) {

	var unFormattedURL = req.params.urlString;
	var formattedURL = "http://www.solarmovie.ph/tv/" + unFormattedURL;
	var tmpBody;

	request( formattedURL , function( error , response , body ) {
		if ( !error && response.statusCode === 200 ) {
			if (body) {
				parseBody( res , body);
			}
		}
		else {

			if ( error ) { console.log( error ); }
			
			cachedURL = formattedURL;
			recursiveCallGrabPage( cachedURL );
		}
	});


};


module.exports.specificTVLink = function( req , res ) {

	var baseURL = "http://www.solarmovie.ph/tv/";
	var show = req.params.show;
	var season = req.params.season;
	var episode = req.params.episode;
	var finalURL = baseURL + show + '/' + season + '/' + episode;

	request( finalURL , function( error , response , body ) {
		if ( !error && response.statusCode == 200 ) {
			parseforHostProviders( res , body );
		}
		else {
			console.log("error");
		}
	});

};

var parseforHostProviders = function( res , body ) {

	var links = [];

	var $ = cheerio.load(body);
	var $linkSearch = $(".dataTable a");
	$linkSearch.add($linkSearch.find('*'));
	$linkSearch.each( function( i , e ) {
		// console.log( $(e).attr("href") );
		var tmp = $(e).attr("href");
		tmp = tmp.toString();
		links.push( tmp );
	});


	sendJSONResponse( res , 200 , links );

};

module.exports.hostProvider = function( req , res ) {

	var playURL = "http://cinema.solarmovie.ph/link/play/" + req.params.showID;
	console.log( "now searching : " + playURL );

	request( playURL , function( error , response , body ) {
		if ( !error && response.statusCode == 200 ) {
			grabIFRAME( res , body );
		}
		else {
			console.log("error");
		}
	});


};

var localCount = 1;

var grabIFRAME = function( res , body ) {


	var iFrameLink;

	var $ = cheerio.load(body);
	
	var $linkSearch = $("iframe[src*='http://']");

	// look through Iframe's for known provider links
	for ( var i = 0; i < $linkSearch.length; i++ ) {
		
	
		// console.log($linkSearch[i].attribs["src"]);
		
		iFrameLink = $linkSearch[i].attribs["src"];

		/*
		if ( $linkSearch[i].children[1].children[0] ) {
			iFrameLink = $linkSearch[i].children[1].children[0].attribs["src"];
		}
		else {
			console.log(body);
		}
		*/

		
		//console.log(iFrameLink);
		//console.log("===============================================");
		//console.log("===============================================");
	}

	sendJSONResponse( res , 200 , iFrameLink );

};		


module.exports.getMP4URL = function( req , res ) {

	console.log("made it to getMP4URL()");
	var embededURL = req.body.url;

	request( embededURL , function( error , response , body ) {
		if ( !error && response.statusCode == 200 ) {
			var urlString = getActualMP4URL( body );
			sendJSONResponse( res , 200 , urlString );
		}
		else {
			console.log("error");
			sendJSONResponse( res , 400 , null );
		}
	});	
	
};

var goFishingForMP4URL = function( longString ) {




};

var getActualMP4URL = function( body ) {


	var mp4Link = [];

	var $ = cheerio.load(body);
	$linkSearch = $('script');
	//console.log($linkSearch);

	for ( i = 0; i < $linkSearch.length; ++i ) {

		if ($linkSearch[i].children[0] != null && $linkSearch[i].children[0] != undefined ) {
			//console.log($linkSearch[i].children[0]);
			mp4Link.push($linkSearch[i].children[0]);
		}
	}

	for (var i = 0; i < mp4Link.length; ++i){

		var temp = mp4Link[i].data.toString()
		temp = temp.split("\n");

		for (var j = 0; j < temp.length; ++j) {

			var jTemp = temp[j].toString();
			jTemp.split(' ').join('');
			jTemp.replace(/^\s+|\s+$/g,'');

			// Go Fishing for MP4 URL
			// var finalURL = goFishingForMP4URL( jTemp );
			
			
			var mp4 = jTemp.search(/v.mp4/i);
			if (mp4 != -1) {

				// if ( jTemp[ mp4 - 1 ] === "." && jTemp[ mp4 - 2 ] === "v" ) {

					//console.log( jTemp[mp4 - 1] );
					//console.log( jTemp[mp4 - 2] );

					mp4 += 5;
					var start = jTemp.search(/file/i);
					start += 7;
					var finalURL = jTemp.substring(start , mp4);
					// console.log(finalURL);
					finalURL = finalURL.toString();
					return finalURL;

				//}

			}
			

		}
	}

	return " ";
	
};





