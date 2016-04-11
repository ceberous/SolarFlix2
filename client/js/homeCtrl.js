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

		vm.currentSeason;
		vm.currentEpisode;		

		// Attempt AJAX Search on theWatchTVSeries.to
		// NEED TO MIGRATE TO SERVER-SIDE CALL
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

		// 			GLOBAL HELPER FUNCTIONS
		// ===============================================

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

		// ===============================================


						// searchTV()
		// ========================1=======================================
		// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			var displayLinks = function( links ) {

				links = removeDuplicates(links);
				
				//var seasons = [];

				totalSeasons = parseInt(links[0].split("/")[3].split("-")[1]);
				console.log("Total Seasons = " + totalSeasons);
				vm.CURRENT_SHOW = links[0].split("/")[2];
				console.log("Current Show SET--> " + vm.CURRENT_SHOW);
				console.log("First: " + links[links.length-1]);
				console.log("Last: " + links[0]);

				var sCounter = 1;
				var seasonobj = [];
				seasons.push(seasonobj);

				// sort into seasons 
				for ( var i = links.length-1; i >= 0; --i ) {
					
					var season = parseInt(links[i].split("/")[3].split("-")[1])
					//var episode = b[3].substring( 0 , b[3].length - 5 ).substring(1);
					//console.log("Season -> " + season + " | Episode -> " + episode + " " + links[i]);

					if( season === sCounter ) {
						seasons[sCounter-1].push(links[i]);
					} 
					else {
						sCounter += 1;
						var seasonobj = [];
						seasons.push(seasonobj);
						seasons[sCounter-1].push(links[i]);
					}

				}


				vm.showShowLinks = true;
				vm.returnedSeasons = seasons;

				// maxEpisodeForSeasons = [];
				for ( var i = 0; i < seasons.length; ++i ) {
					//console.log("Season - " + (i+1) + " <--> Last Episode = "  + seasons[i][ seasons[i].length - 1 ]);
					maxEpisodeForSeasons.push( seasons[i][ seasons[i].length - 1 ].split("/")[4].split("-")[1] );
				}

			};			

			vm.searchTV = function() {
				console.log("made it to vm.searchTV()");
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

			var currentEpisodeLinks = [];
			var nextEpisodeLinks = [];
			var previousEpisodeLinks = [];
			var fillSwitch = 1;
			var capcity = 0;

			var cachedCurrentSeason,cachedCurrentEpisode;

			var player;

			var launchPlayerControlAI = function() {

				vm.NOW_PLAYING = $sce.trustAsResourceUrl(foundMP4URLS[0]);
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

								switch ( fillSwitch ) {

									case 1:
										foundMP4URLS.push(data);
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

								// foundMP4URLS.push(data);

								if ( vm.displayVideo === false ) {
									launchPlayerControlAI();
								}
								else {
									if ( capcity < 4 ) {
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
				else {

					links = [];

					if ( fillSwitch === 1 ) {

						console.log("Current Episode");
						for ( var i = 0; i < foundMP4URLS.length; ++i ) {
							console.log(foundMP4URLS[i]);
						}						

						fillSwitch = 2;

						if ( cachedCurrentEpisode + 1 < maxEpisodeForSeasons[cachedCurrentSeason - 1] ) {
							// console.log("Next Episode = " + (vm.currentEpisode + 1) )
							// /tv/the-office-2005/season-1/episode-1/
							var builtURL = "/tv/" + vm.CURRENT_SHOW + "/season-" + cachedCurrentSeason +"/episode-" + ( cachedCurrentEpisode + 1 )  + "/";
							console.log("Next UP = " + builtURL);
							vm.goToTVEpisodeLink(builtURL);
						}
						else {
							var builtURL = "/tv/" + vm.CURRENT_SHOW + "/season-" + ( cachedCurrentSeason + 1 ) +"/episode-1/";
							console.log("Next UP = " + builtURL);
							vm.goToTVEpisodeLink(builtURL);
						}

					}
					else if ( fillSwitch === 2 ) {

						console.log("Next Episode");
						for ( var i = 0; i < nextEpisodeLinks.length; ++i ) {
							console.log(nextEpisodeLinks[i]);
						}						

						fillSwitch = 3;

						if ( cachedCurrentEpisode - 1 < 1 ) {

							var builtURL = "/tv/" + vm.CURRENT_SHOW + "/season-" + totalSeasons +"/episode-" + ( maxEpisodeForSeasons[totalSeasons -1] )  + "/";
							console.log("Next UP = " + builtURL);
							vm.goToTVEpisodeLink(builtURL);

						}
						else {
							var builtURL = "/tv/" + vm.CURRENT_SHOW + "/season-" + cachedCurrentSeason +"/episode-" + ( cachedCurrentEpisode - 1 )  + "/";
							console.log("Next UP = " + builtURL);
							vm.goToTVEpisodeLink(builtURL);
						}

					}
					else if ( fillSwitch === 3 ) {

						console.log("Previous Episode");
						for ( var i = 0; i < previousEpisodeLinks.length; ++i ) {
							console.log(previousEpisodeLinks[i]);
						}								

						fillSwitch = 4;

					}


				}



			};

			vm.clickOnTVLink = function( link ) {

				if ( vm.alreadyActivated === true ) {

					capcity = 0;
					vm.displayVideo = false;
					vm.NOW_PLAYING = " ";

					foundMP4URLS = [];
					nextEpisodeLinks = [];
					previousEpisodeLinks = [];

					vm.alreadyActivated = false;
					vm.goToTVEpisodeLink( link );
				}

			};

			vm.goToTVEpisodeLink = function( link ) {

				if ( vm.alreadyActivated === true ) {

					capcity = 0;
					gI = 0;
					//foundMP4URLS = []
					//nextEpisodeLinks = [];
					//previousEpisodeLinks = [];

					// vm.currentSeason = season;
					// vm.currentEpisode = episode;
					//maxEpisodeForSeasons = [];
					vm.alreadyActivated = false;
				}

				var x,season,episode;
				
				
				x = link.split("/"); 
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