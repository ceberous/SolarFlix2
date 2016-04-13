(function () {

						// PROGRAM OUTLINE //
	// =========================================================== // 

		// 1.)	<button ng-click="vm.searchTV()">
			
				// a.) calls -> $http.put('/api/grabPage/' + vm.tvURL )
				// b.) .success -> displayLinks()

		// 2.)	dislplayLinks()

		// 3.)  <a ng-click="vm.goToTVEpisodeLink(link)">{{link}}</a>

				// a.) $http.put('/api/specificTVLink/' + show + '/' + season + '/' + episode )
				// b.) .success -> displayHostProviders()

		// 4.)	displayHostProviders()

		// need to recursively call vm.goToHostProvider() with each vm.hostProviders 



		// 5.) <a ng-click="vm.goToHostProvider(link)">{{link}}</a>

				// a.) calls -> $http.put('/api/hostProvider/' + link )
						// should return a .mp4 URL
						// && push it into the "private" mp4URLS array

				// b.) .success -> displayHostProviders();
		
		// 6.) displayHostProviders()

		// 7.) when vm.showAUTOMATICLINKS = true we are in business
			// v.mp4 URL's stored in vm.AUTOMATICGRABEDLINKS
		
			// a.)	Try each URL until videoPlayBackSuccess = true

			// b.)	


		// 8.) Add getNextVideoinOrder()

		// 9.) Add getPreviousVideoinOrder()

		// 10.) Add Add Shuffle
	
	// =========================================================== //


	homeCtrl.$inject = ['$http' , '$sce'];

	function homeCtrl($http , $sce) {
	
		var vm = this;
		var pHostLength = 0;
		var mp4URLS = [];

		var totalSeasons;
		var seasons = [];
		var maxEpisodeForSeasons = [];

		vm.alreadyActivated = false;

		vm.tvURL;
		vm.displayVideo = false;
		vm.showAUTOMATICLINKS = false;
		vm.showShowLinks = false;

		vm.CURRENT_SHOW = {};

		vm.currentSeason;
		vm.currentEpisode;		
		vm.CURRENT_EPISODE;



		// Attempt AJAX Search on theWatchTVSeries.to
		// NEED TO MIGRATE TO SERVER-SIDE CALL
		/*
			
			(function(){

				var searchInput;

				$( "#searchTVSHOW" ).bind( 'input' , function(){

					searchInput = $(this).val().toString();

					if ( searchInput.length >= 3 ) {

						console.log("Searching : " + searchInput + " | " + searchInput.length );

						$http({
							url: "http://thewatchseries.to/show/search-shows-json",
							method: 'POST',
							data: { value: searchInput }

						}).success(function(result) {
							console.log(result);
						});

			    	}
			    });

			}());
		*/

		// =================GLOBAL HELPER FUNCTIONS=========================
		// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

			vm.setShow = function() {
				vm.tvURL = "the-office-2005";
			};

			var removeDuplicates = function( array ) {

				return array.filter( function( item , pos , ary ) {
					return !pos || item != ary[ pos - 1 ];
				});

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

			var decode_base64Array = function( array ) {

				console.log("Decoding Base64 Array");

				for ( var i = 0; i < array.length; ++i ) {
					array[i] = decode_base64(array[i]);
					console.log(array[i]);
				}

				return array;

			};
							// Video Controls
		// =================GLOBAL HELPER FUNCTIONS=========================
		// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~



		// ======================Video-Controls=============================
		// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

			vm.IS_SHUFFLE = false;
			vm.showRetryProvider = false;
			vm.showPreviousButton = false;
			vm.showNextButton = false;

			var swapVideoSource = function( newURL ) {

				console.log("swapping source TO --> " + newURL);
				$('#removablePlayer').remove();
				setTimeout(function(){
					$("#videoPlayer").append("<div id=\"removablePlayer\"><video id=\"my-video\" class=\"video-js\" controls preload=\"auto\" width=\"640\" height=\"264\"data-setup=\"{}\"><source src=\"" + newURL + "\"type='video/mp4'><p class=\"vjs-no-js\">To view this video please enable JavaScript, and consider upgrading to a web browser that<a href=\"http://videojs.com/html5-video-support/\" target=\"_blank\">supports HTML5 video</a></p></video></div>");
				} , 1000 );				

			};

			vm.retryProvider = function() {
				console.log("retry video with next link from same provider"); // right now , theres only 1 provider ... f' vodlocker
				var newURL = $sce.trustAsResourceUrl(workingEpisodeGrabBag[1]);
				console.log("trying --> " + newURL)
				swapVideoSource( newURL );
			};

			vm.loadPrevious = function() {
				console.log("loading previous");
			};

			vm.loadNext = function() {
				console.log("loading next");

				var nextURL = $sce.trustAsResourceUrl(nextEpisodeLinks[0]);
				swapVideoSource(nextURL);

				vm.showRetryProvider = false;
				vm.showNextButton = false;
				vm.showPreviousButton = false;

				workingCurrentEpisodeLinks = nextEpisodeLinks;
				previousEpisodeLinks = workingEpisodeGrabBag;
				workingEpisodeGrabBag = workingCurrentEpisodeLinks;

				vm.showRetryProvider = true;
				vm.showPreviousButton = true;

				/// comeback2point1 --->>>>>>>>>>> 
				// 	--->>>>>>>>> ( some future interpretation of grabbing mp4 urls for a specific link instead of tri-grouped current / future / past  )
				/// ___________________________________________________________________________

				if ( cachedCurrentEpisode + 2 < maxEpisodeForSeasons[cachedCurrentSeason - 1] ) {
					// console.log("Next Episode = " + (vm.currentEpisode + 1) )
					// /tv/the-office-2005/season-1/episode-1/
					var builtURL = "/tv/" + vm.CURRENT_SHOW + "/season-" + cachedCurrentSeason +"/episode-" + ( cachedCurrentEpisode + 2 )  + "/";
					console.log("Next UP = " + builtURL);
					console.log(seasons[vm.currentSeason - 1 ][ cachedCurrentEpisode + 1]["name"]);
					goToTVEpisodeLinkBACKGROUND( builtURL );
				}
				else {
					var builtURL = "/tv/" + vm.CURRENT_SHOW + "/season-" + ( cachedCurrentSeason + 1 ) +"/episode-1/";
					console.log("Next UP = " + builtURL);
					console.log(seasons[vm.currentSeason][0]["name"]);
					goToTVEpisodeLinkBACKGROUND(builtURL);
				}

			};

			vm.toggleShuffle = function() {
				console.log("toggling random...");
				vm.IS_SHUFFLE = !vm.IS_SHUFFLE;
				console.log("vm.IS_SHUFFLE is now: = " + vm.IS_SHUFFLE);
			};






			var gI2 = 0;
			var capcity2 = 0;
			var cieling2 = 2;
			var recievedValidMP4URLS = [];
			var loadBackgroundNextVideo = function() {

				console.log(" --> .... getSecondLayer() from loadBackgroundNextVideo()");

				if ( ( gI2 <= recievedUnextractedData.length - 1 ) && ( capcity2 < cieling2 ) ) {
					console.log("/api/parseProvider/" + recievedUnextractedData[gI2]);
					$http.put("/api/parseProvider/" + recievedUnextractedData[gI2])
						.success(function(data) {
							
							gI2 += 1;

							if ( data.substring( data.length - 5 , data.length ) === "v.mp4" ) {

								console.log("JUST RECIEVED 	--> " + data);
								capcity2 += 1;

								recievedValidMP4URLS.push(data);

								loadBackgroundNextVideo();

							} 
							else {
								loadBackgroundNextVideo();
							}

						})
						.error(function(error){
							console.log(error);
						})
					;

				} 
				else { // Finished With Episode Link Section of 

					nextEpisodeLinks = [];
					nextEpisodeLinks = recievedValidMP4URLS;
					vm.showNextButton = true;

				}


			};


			var workingEpisodeGrabBag = [];
			var recievedUnextractedData = [];
			var goToTVEpisodeLinkBACKGROUND = function( link ) {

				// link should appear as : /tv/the-durrells-2016/season-1/episode-2/

				capcity2 = 0;
				gI2 = 0;
				recievedUnextractedData = [];
				recievedValidMP4URLS = [];

				var x,season,episode;
				
				x = link.split("/"); 
				season =  x[3];
				episode = x[4];

				console.log("		--> /api/specificEpisodeLink/" + vm.CURRENT_SHOW + "/" + season + "/" + episode);
				$http.put('/api/specificEpisodeLink/' + vm.CURRENT_SHOW + "/" + season + "/" + episode )
					.success(function(data) {
						console.log("  		-->} Success");
						recievedUnextractedData = data;
						loadBackgroundNextVideo();
					})
					.error(function(e){
						console.log(e);
					})
				;

			};
		// ======================Video-Controls=============================
		// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~



		// searchTV()
		// ========================1=======================================
		// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			var displayLinks = function( links ) {

				//links = removeDuplicates(links);
				
				//var seasons = [];

				// {
					// name: ,
					// link:
				//}

				vm.CURRENT_SHOW.totalSeasons = parseInt(links[0]["link"].split("/")[3].split("-")[1]);
				console.log("Total Seasons = " + vm.CURRENT_SHOW.totalSeasons );
				console.log("Current Show SET--> " + vm.CURRENT_SHOW.name);

				console.log("First: " + links[links.length-1]["link"]);
				console.log("Last: " + links[0]["link"]);

				

				var sCounter = 1;
				var seasonobj = [];
				seasons.push(seasonobj);

				var tmpSOBJ = {
					seasonNumber: 1,
					episodes: []
				};

				vm.CURRENT_SHOW.seasons = [tmpSOBJ];
				vm.CURRENT_SHOW.seasons[0].seasonNumber = 1;

				// sort into seasons 
				for ( var i = links.length-1; i >= 0; --i ) {
					
					var seasonNumber = parseInt(links[i]["link"].split("/")[3].split("-")[1])
					//var episode = b[3].substring( 0 , b[3].length - 5 ).substring(1);
					//console.log("Season -> " + season + " | Episode -> " + episode + " " + links[i]);


					var tmpOBJ = {
						name: links[i]["name"],
						link: links[i]["link"]
					};

					// if (this) link's seasonNumber = the current fill space
					if( seasonNumber === sCounter ) {
						
						seasons[sCounter-1].push(links[i]);

						//vm.CURRENT_SHOW.seasons[ sCounter - 1 ].push(tmpOBJ);

						vm.CURRENT_SHOW.seasons[ sCounter-1 ]["episodes"].push(tmpOBJ);

					} 
					else { 
						sCounter += 1;

						seasons.push(seasonobj);
						seasons[sCounter-1].push(links[i]);


						var tmpSOBJ = {
							seasonNumber: sCounter,
							episodes: []
						};

						vm.CURRENT_SHOW.seasons.push(tmpSOBJ);

						vm.CURRENT_SHOW.seasons[ sCounter-1 ]["episodes"].push(tmpOBJ);

					}

				}



				vm.showShowLinks = true;
				vm.returnedSeasons = seasons;

				// maxEpisodeForSeasons = [];
				for ( var i = 0; i < seasons.length; ++i ) {
					//console.log("Season - " + (i+1) + " <--> Last Episode = "  + seasons[i][ seasons[i].length - 1 ]);
					maxEpisodeForSeasons.push( seasons[i][ seasons[i].length - 1 ]["link"].split("/")[4].split("-")[1] );
				}


				for ( var i = 0; i < vm.CURRENT_SHOW.seasons.length; ++i ) {

					console.log("Season - " + ( i + 1 ));

					for ( var j = 0; j < vm.CURRENT_SHOW.seasons[i]["episodes"].length; ++j ) {

						console.log( vm.CURRENT_SHOW.seasons[i]["episodes"][j]["name"] );

					}

				}


			};			

			vm.searchTV = function() {
				console.log("made it to vm.searchTV()");
				vm.CURRENT_SHOW.name = vm.tvURL;
				$http.put('/api/grabSolarMovieTVSHOW/' + vm.tvURL )
					.success(function(data) {
						displayLinks(data);
					})
				;
			};
		// ========================1=======================================


		

		// goToTVEpisodeLink()
		// ========================2=======================================
		// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			var globalProviderURLS = [];
			var gI = 0;
			var unNeededCopy = [];
			var links = [];
			var foundMP4URLS = [];

			var workingCurrentEpisodeLinks = [];
			var currentEpisodeLinks = [];
			var nextEpisodeLinks = [];
			var previousEpisodeLinks = [];
			var fillSwitch = 1;
			var capcity = 0;
			var cieling = 2;

			var cachedCurrentSeason,cachedCurrentEpisode;

			var player;

			var launchPlayerControlAI = function() {

				vm.NOW_PLAYING = $sce.trustAsResourceUrl(workingEpisodeGrabBag[0]);
				vm.displayVideo = true;

				setTimeout( function() {

					videojs("my-video").ready(function() {

				  		console.log("we think #my-video is ready");

				  		player = this;

				  		cachedCurrentSeason = vm.currentSeason; 
				  		cachedCurrentEpisode = vm.currentEpisode;

				  		player.play();

				  	});

				} , 2500 );

				// start gathering leftover links
				setTimeout( function() {
					getSecondLayer();
				} , 2500 );
					
			};


			var getSecondLayer = function() {

				console.log(" --> .... getSecondLayer()");

				if ( gI <= links.length - 1 ) {
					console.log(links[gI]);

					$http.put("/api/parseProvider/" + links[gI])
						.success(function(data) {
							
							gI += 1;

							if ( data.substring( data.length - 5 , data.length ) === "v.mp4" ) {

								capcity += 1;

								// push into current / next / previous
								switch ( fillSwitch ) {

									case 1:
										workingEpisodeGrabBag.push(data);
										break;
									case 2:
										nextEpisodeLinks.push(data);
										break;
									case 3:
										previousEpisodeLinks.push(data);
										break;
									default:
										break;

								}

								if ( vm.displayVideo === false ) {
									launchPlayerControlAI();
								}
								else {
									if ( capcity < cieling ) {
										getSecondLayer();
									}
									else {
										gI = links.length + 1;
										getSecondLayer();
									}
								}


							} 
							else {
								getSecondLayer();
							}


						})
						.error(function(error){
							console.log(error);
						})
					;

				} 
				else { // Finished With Episode Link Section of 

					// seasons[vm.currentSeason - 1][vm.currentEpisode - 1]["name"]

					links = [];

					if ( fillSwitch === 1 ) { // if We Just Recieved the INITIAL / "clicked-on" episode link set

						vm.showRetryProvider = true;
						console.log("Current Episode");
						for ( var i = 0; i < workingEpisodeGrabBag.length; ++i ) {
							console.log(workingEpisodeGrabBag[i]);
						}						

						fillSwitch = 2;

						if ( cachedCurrentEpisode + 1 < maxEpisodeForSeasons[cachedCurrentSeason - 1] ) {
							// console.log("Next Episode = " + (vm.currentEpisode + 1) )
							// /tv/the-office-2005/season-1/episode-1/
							var builtURL = "/tv/" + vm.CURRENT_SHOW + "/season-" + cachedCurrentSeason +"/episode-" + ( cachedCurrentEpisode + 1 )  + "/";
							console.log("Next UP = " + builtURL);
							vm.goToTVEpisodeLink(builtURL , seasons[vm.currentSeason - 1][vm.currentEpisode]["name"] );
						}
						else {
							var builtURL = "/tv/" + vm.CURRENT_SHOW + "/season-" + ( cachedCurrentSeason + 1 ) +"/episode-1/";
							console.log("Next UP = " + builtURL);
							vm.goToTVEpisodeLink(builtURL , seasons[vm.currentSeason][0]["name"]);
						}

					}
					else if ( fillSwitch === 2 ) { // if We Just Recieved the NEXT episode link set

						vm.showNextButton = true;

						console.log("Next Episode");
						for ( var i = 0; i < nextEpisodeLinks.length; ++i ) {
							console.log(nextEpisodeLinks[i]);
						}						

						fillSwitch = 3;

						if ( cachedCurrentEpisode - 1 < 1 ) {

							if ( cachedCurrentSeason > 1 ) {
								var builtURL = "/tv/" + vm.CURRENT_SHOW + "/season-" + totalSeasons +"/episode-" + ( maxEpisodeForSeasons[totalSeasons -1] )  + "/";
								console.log("Next UP = " + builtURL );
								vm.goToTVEpisodeLink(builtURL , seasons[vm.currentSeason - 2][vm.currentEpisode - 1]["name"] );
							}
							else {
								var builtURL = "/tv/" + vm.CURRENT_SHOW + "/season-" + totalSeasons +"/episode-" + ( maxEpisodeForSeasons[totalSeasons -1] )  + "/";
								console.log("Next UP = " + builtURL );
								vm.goToTVEpisodeLink(builtURL , seasons[seasons.length -1 ][ maxEpisodeForSeasons[ totalSeasons -1 ] - 1 ]["name"] );
							}

						}
						else {
							var builtURL = "/tv/" + vm.CURRENT_SHOW + "/season-" + cachedCurrentSeason +"/episode-" + ( cachedCurrentEpisode - 1 )  + "/";
							console.log("Next UP = " + builtURL);
							vm.goToTVEpisodeLink(builtURL , seasons[vm.currentSeason -1 ][ vm.currentEpisode - 2 ]["name"] );
						}

					}
					else if ( fillSwitch === 3 ) { // if We Just Recieved the PREVIOUS episode link set

						vm.showPreviousButton = true; 

						console.log("Previous Episode");
						for ( var i = 0; i < previousEpisodeLinks.length; ++i ) {
							console.log(previousEpisodeLinks[i]);
						}								

						fillSwitch = 4;

					}


				}



			};

			vm.clickOnTVLink = function( linkURL , linkName ) {



				if ( vm.alreadyActivated === true ) {

					capcity = 0;
					gI = 0;
					links = [];
					vm.displayVideo = false;
					vm.NOW_PLAYING = " ";
					vm.CURRENT_EPISODE = linkName;
					workingEpisodeGrabBag = [];
					nextEpisodeLinks = [];
					previousEpisodeLinks = [];

					vm.alreadyActivated = false;
					
					setTimeout(function(){
						vm.goToTVEpisodeLink( linkURL , linkName );
					} , 1000 );

				}

				else {
					vm.CURRENT_EPISODE = linkName;
					vm.goToTVEpisodeLink( linkURL , linkName );
				}

			};

			vm.goToTVEpisodeLink = function( linkURL , linkName ) {

				if ( vm.alreadyActivated === true ) {

					capcity = 0;
					gI = 0;
					links = [];
					//foundMP4URLS = []
					//nextEpisodeLinks = [];
					//previousEpisodeLinks = [];

					// vm.currentSeason = season;
					// vm.currentEpisode = episode;
					//maxEpisodeForSeasons = [];
					vm.alreadyActivated = false;
				}

				var x,season,episode;
				
				
				console.log( linkName + " | " + linkURL);
				x = linkURL.split("/"); 
				season =  x[3];
				episode = x[4];
				vm.currentSeason = parseInt(season.split("-")[1]);
				vm.currentEpisode = parseInt(episode.split("-")[1]);

				console.log("		--> /api/specificEpisodeLink/" + vm.CURRENT_SHOW + "/" + season + "/" + episode);
				$http.put('/api/specificEpisodeLink/' + vm.CURRENT_SHOW + "/" + season + "/" + episode )
					.success(function(data) {
						console.log("  		-->} Success");
						links = data;
						vm.alreadyActivated = true;
						getSecondLayer();
					})
					.error(function(e){
						console.log(e);
					})
				;

			};
		// ========================2=======================================

		
	}

	angular
		.module('solarFlixApp')
		.controller('homeCtrl' , homeCtrl)
	;

})();