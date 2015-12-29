var mongoose = require('mongoose');
var request = require('request');
var cheerio = require('cheerio');
var http = require('http');
var https = require('https');
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

var recursiveOLDHTTPRequest = function( cachedURL ) {

	var path2 = 'https://www.solarmovie.ph/tv/' + cachedURL;

	var options = {
		host: 'http://proxy-us.hide.me/go.php?u=https%3A%2F%2F',
		port: 8080,
		path: path2,
		method: 'GET',
		headers: {
			Host: path2
		}
	};

	console.log("recursively trying from old HTTP request");

	var req = https.request( options , function( res ) {

	});

	req.setTimeout( 50000 );

	req.on( 'socket' , function( socket ) {
		socket.setTimeout( 50000 );
		socket.on( 'timeout' , function() {
			req.abort();
			recursiveOLDHTTPRequest( cachedURL );
		});
	});

	req.on( 'data' , function( chunk ){
		parseBody( res , chunk );
	});

	req.on( "error" , function(e) {
		recursiveOLDHTTPRequest( cachedURL );
	});

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
	var formattedURL = "https://www.solarmovie.ph/tv/" + unFormattedURL;
	// formattedURL = url.parse( formattedURL );
	var tmpBody;

	var proxy = "http://205.177.86.114:81";
	var proxy2 = "https://proxy-us.hide.me/go.php?u=https%3A%2F%2F";

	request( formattedURL , function( error , response , body ) {

		if ( !error && response.statusCode === 200 ) {
			if (body) {
				parseBody( res , body);
			}
		}
		else if ( error.code === 'ETIMEDOUT' ) {

			// try non request module version
			var path2 = '/tv/' + unFormattedURL + ".html";

			var options = {
				host: 'solarmovie.ph',
				port: 80,
				path: path2 
			};

			console.log("trying non-moduler http.get method");
			http.get( options , function( resp ) {
				resp.on( 'data' , function( chunk ){
					parseBody( res , chunk );
				});
			}).on( "error" , function(e) {

				cachedURL = formattedURL;
				recursiveOLDHTTPRequest( cachedURL );
			});

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

	fs.writeFile( "specificTVLink.txt" , body , function( error ) {
		if ( error ) { console.log( error ); }
	});

	var links = [];


	var $ = cheerio.load(body);
	var $linkSearch = $(".dataTable a");
	$linkSearch.add($linkSearch.find('*'));
	$linkSearch.each( function( i , e ) {
		// console.log( $(e).attr("href") );


		var hostName = $(e).html().trim();
		//hostName = hostName.toString();
		//hostName.replace( /\hostName+/g , ' ' );
		console.log(hostName);

		if ( hostName === "vodlocker.com" || hostName === "allmyvideos.net" ) {
			var tmp = $(e).attr("href");
			tmp = tmp.toString();
			links.push( tmp );
		}


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

		
		//console.log("iframe link => " + iFrameLink);
		//console.log("===============================================");
		//console.log("===============================================");
	}


	sendJSONResponse( res , 200 , iFrameLink );


};		


module.exports.getMP4URL = function( req , res ) {

	// console.log("made it to getMP4URL()");
	var embededURL = req.body.url;

	var xTemp = embededURL.split("//");
	xTemp = xTemp[1];
	xTemp = xTemp.split("/");
	var host = xTemp[0];
	// console.log( "Source Provider =================> " + host );

	// check blacklist
	if ( host === "vodlocker.com" || host === "allmyvideos.net" ) {

		request( embededURL , function( error , response , body ) {
			if ( !error && response.statusCode == 200 ) {
				var urlString = getActualMP4URL( body , host );
				sendJSONResponse( res , 200 , urlString );
			}
			else {
				console.log("error");
				sendJSONResponse( res , 400 , null );
			}
		});	

	}
	else {
		console.log("skipping unknown host : " + host );
		sendJSONResponse( res , 400 , null );
	}
		
};

var goFishingForMP4URL = function( longString ) {




};

var getActualMP4URL = function( body , host ) {


	if ( host === "vodlocker.com" ) {
		var url = parseVodlocker( body );
		return url;
	}
	else if ( host === "allmyvideos.net" ) {
		var url = parseAllMyVideos( body );
		return url;
	}
	else {
		// console.log("host =>>>>>>>>>>>>>>>> " + host);
		return "error : unAccepted host";
	}


};


var parseAllMyVideos = function( body ) {
	
	var mp4URLS = [];

	var sourceStart = body.search(/sources/i);
	var startFirstLink = body.indexOf( "http" , sourceStart );
	var endFirstLink = body.indexOf( ".mp4" , sourceStart);
	endFirstLink = endFirstLink + 4;
	var lowResLink = body.substring( startFirstLink , endFirstLink );
	

	var searchMedRes = body.indexOf( ".mp4" , endFirstLink + 1 );

	if ( searchMedRes === -1 ) {
		console.log("no higher res found");
		return lowResLink;
	}
	else {

		var startMedRes = body.indexOf( "http" , endFirstLink + 1 );
		var endMedRes = body.indexOf( ".mp4" , startMedRes );
		endMedRes = endMedRes + 4;
		var medResLink = body.substring( startMedRes , endMedRes );
		
		var searchHighRes = body.indexOf( ".mp4" ,  endMedRes + 1 );
		if ( searchHighRes === -1 ) {

			console.log("no higher res found");
			return medResLink;	
		}
		else {

			var startHighRes = body.indexOf( "http" , endMedRes + 1 );
			var endHighRes = searchHighRes + 4;
			var highResLink = body.substring( startHighRes , endHighRes );
			console.log("720p video found!!")
			return highResLink;

		}

		
	}


	
};


var parseVodlocker = function( body ) {

	var mp4Link = [];

	var $ = cheerio.load(body);
	$linkSearch = $('script');

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
			
			// allmyvideos method
			// video.mp4

			// vodlocker method
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
					console.log(finalURL);
					return finalURL;

				//}

			}
			

		}
	}

};




