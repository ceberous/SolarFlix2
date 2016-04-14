var mongoose = require('mongoose');
var request = require('request');
var cheerio = require('cheerio');
var http = require('http');
var https = require('https');
var fs = require('fs');

// var DateIdea = mongoose.model('DateIdea');



// 			GLOBAL HELPER FUNCTIONS 
// ======================================
	var sendJSONResponse = function( res , status , content ) {
	    if (status) {res.status(status);}
	    res.json(content);
	};

	var decode_base64 = function(s) {

	    var e = {}, i, k, v = [], r = '', w = String.fromCharCode;
	    var n = [[65, 91], [97, 123], [48, 58], [43, 44], [47, 48]];

	    for (z in n)
	    {
	        for (i = n[z][0]; i < n[z][1]; i++)
	        {
	            v.push(w(i));
	        }
	    }
	    for (i = 0; i < 64; i++)
	    {
	        e[v[i]] = i;
	    }

	    for (i = 0; i < s.length; i+=72)
	    {
	        var b = 0, c, x, l = 0, o = s.substring(i, i+72);
	        for (x = 0; x < o.length; x++)
	        {
	            c = e[o.charAt(x)];
	            b = (b << 6) + c;
	            l += 6;
	            while (l >= 8)
	            {
	                r += w((b >>> (l -= 8)) % 256);
	            }
	         }
	    }
	    return r;

	};

// ========== END GLOBAL HELPER ==================


			// grabSolarMovieTVSHOW()
// ========================1=======================================
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	// [##############Helper Functions######################]
	// [													]

		var parseBody = function( res , body ) {
		
			var $ = cheerio.load(body);

			var links = [];
			var $linkSearch = $(".seasonEpisodeListBox a");
			$linkSearch.add($linkSearch.find('*'));
			$linkSearch.each( function( i , e ) {
				var thisC = $(e);
				var tmp = thisC.attr("href");
				var linkCount = thisC.html();
				var hasEpisodeAttachment = tmp.split("/")[4];
				hasEpisodeAttachment = ( hasEpisodeAttachment === undefined ) ? 0 : hasEpisodeAttachment.toString().trim();
				hasEpisodeAttachment = ( hasEpisodeAttachment.length > 0 ) ? 1 : 0;
				//console.log(hasEpisodeAttachment);
				if ( tmp.substring(0,4) === "/tv/" && linkCount != "0 links" ) {
					if ( hasEpisodeAttachment === 1 && thisC.attr("title") != undefined ) {
						
						var obj = {
							name: thisC.attr("title"),
							link: tmp
						}

						links.push( obj );
						//console.log("adding -> " + obj.link);
					}
				}
			});

			sendJSONResponse( res , 200 , links );
		};

	// [##############Helper Functions######################]

	module.exports.grabSolarMovieTVSHOW = function( req , res ) {

		var showName = req.params.urlString;
		var searchURL = "http://solarmovie.ph/tv/" + showName;

		request( searchURL , function( error , response , body ) {

			if ( !error && response.statusCode === 200 ) {
				if (body) {
					parseBody( res , body );
				}
			}
			else {

				if ( error ) { console.log( error ); }
		
				// cachedURL = formattedURL;
				// recursiveCallGrabPage( cachedURL );
			}

		});

	};
// ========================1=======================================


			// specificEpisodeLink()

// ========================2=======================================
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	// [##############Helper Functions######################]
	// [													]

		var isOnProviderWhiteList = function(link) {

			if ( link === undefined ) {
				return false;
			}
			else if (

				link === "gorillavid" ||
				link === "vodlocker" ||
				link === "allmyvideos" ||
				link === "thevideo" 

			) {
				return true;
			}
			else {
				return false;
			}

		};

		var parseforHostProviders = function( res , body ) {

			console.log("Parsing for Provider Links");

			var links = [];
			var x,j,thisP,providerName;

			var $ = cheerio.load(body);
			var $linkSearch = $(".table-responsive a");
			$linkSearch.add($linkSearch.find('*'));
			$linkSearch.each( function( i , e ) {

				providerName = $(e).html().trim();
				providerName = providerName.split(".")[0];

				if ( providerName.length > 0 && isOnProviderWhiteList(providerName) ) {
					thisP = $(e).attr("href").split("/")[3];
					console.log(providerName + " <---> " + thisP);
					links.push( providerName + "-" + thisP );

				}

			});

			console.log("Provider Links Returned");
			sendJSONResponse( res , 200 , links );

		};

	// [##############Helper Functions######################]

	module.exports.specificEpisodeLink = function( req , res ) {

		var baseURL = "http://solarmovie.ph/tv/";
		var finalURL = baseURL + req.params.show + "/" + req.params.season + "/" + req.params.episode; 

		console.log("Grabbing Provider Links for --> " + finalURL);

		request( finalURL , function( error , response , body ) {
			if ( !error && response.statusCode == 200 ) {
				parseforHostProviders( res , body );
			}
			else {
				console.log("error");
				sendJSONResponse( res , 400 , null );
			}
		});

	};
// ========================2=======================================


			// grabGorrilaVidSecondLayer()
// ========================3=======================================
// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	// [##############Helper Functions######################]
	// [													]

		var NULL_COUNT = 0;
		var start,end,mp4URL;

		var parseVodlockerThird = function( res , body ) {
			end = body.search("v.mp4");
			start = body.indexOf( "file: \"http://" , end - 100 );
			mp4URL = body.substring( start + 7 , end + 5 );
			sendJSONResponse( res , 200 , mp4URL );
		};

		var parseVodlockerSecond = function( res , iFrameURL ) {

			console.log("Parsing Vodlocker Second Phase --> " + iFrameURL);
			request.get( iFrameURL , function( error , response , body ) {
				if ( !error && response.statusCode == 200 ) {
					//console.log(body);
					parseVodlockerThird( res ,  body )
				}
				else {
					console.log("error : " + error );
					if (NULL_COUNT < 3) {
						NULL_COUNT += 1;
						parseVodlockerSecond(res , iFrameURL);	
					}
					else {
						NULL_COUNT = 0;
						sendJSONResponse( res , 404 , null );
					}
					
				}
			});

		};

		var parseVodlocker = function( res , body ) {

			console.log("Parsing Vodlocker");

			var $ = cheerio.load(body);
			var iFrameURL;

			var $linkSearch = $(".thirdPartyEmbContainer iframe");
			$linkSearch.add($linkSearch.find('*'));
			$linkSearch.each( function( i , e ) {
				console.log( $(e).attr("src") );
				iFrameURL = $(e).attr("src");
				
			});

			// console.log(providerURL);
			parseVodlockerSecond( res , iFrameURL);
			// sendJSONResponse( res , 200 , iFrameURL );

		};

		var parseSecondLayer = function( res , providerName , body )  {
			console.log(" -> .... parseSecondLayer()");

			switch ( providerName ) {

				case "vodlocker":
					parseVodlocker(res , body);
					break;
				case "gorillavid":
					console.log("gorillavid requires future implementation");
					sendJSONResponse( res , 200 , "null" );
					break;
				case "allmyvideos":
					console.log("allmyvideos requires future implementation");
					sendJSONResponse( res , 200 , "null" );
					break;
				default:
					console.log(providerName + " requires future implementation");
					sendJSONResponse( res , 200 , "null" );

			}

		};


		var parseForProvider = function( res , link ) {

			console.log(" --> .... parseForProvider(" + link +")");

			var x = link.split("-");
			var baseURL = "http://w.solarmovie.ph/link/play/";
			var finalURL = baseURL + x[1];
			var providerName = x[0];


			console.log("Searching --> " + finalURL);
			request.get( finalURL , function( error , response , body ) {
				if ( !error && response.statusCode == 200 ) {
					//console.log(body);
					parseSecondLayer( res , providerName ,  body )
				}
				else {
					console.log("error : " + error );
					if (NULL_COUNT < 3) {
						NULL_COUNT += 1;
						parseForProvider(res , link);	
					}
					else {
						NULL_COUNT = 0;
						sendJSONResponse( res , 404 , null );
					}
					
				}
			});

		};

	// [##############Helper Functions######################]

	module.exports.parseProvider = function( req , res ) {
		parseForProvider( res ,  req.params.obJectURL );

	};
// ========================3=======================================





// POSSIBLE GARBAGE COLLECTION
// ======================================================
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


	var theWatchTVSeriesSecondLayer = function( linkArray ) {

		var mp4URLS = [];

		for ( var i = 0; i < linkArray.length; ++i ) {
			//console.log(linkArray[i]);

			//if ( i === 0 ) {
				var url = grabMP4FromProvider( linkArray[i] )
				mp4URLS.push(url);
				console.log(url);
			//}

		}

		return mp4URLS;

	};
// ======================================================
