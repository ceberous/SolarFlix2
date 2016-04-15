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
		var isFullSweep = false;
		var isCurrent = false;
		var isNext = false;
		var isPrevious = false;
		var storeForNext = false
		var storeForPrevious = false;
		var storeForRandom = false;
		var storeForRandomFuture = false;
		var displayRandom = false;

		var grabNextAvailable = true;
		var needToDisplayWhenRandomFinishes = true;

		var gI = 0;
		var links = [];
		var capcity = 0;
		var cieling = 2;
		var providerCounter = 1;

		vm.tvURL;
		vm.displayVideo = false;
		vm.showAUTOMATICLINKS = false;
		vm.showShowLinks = false;

		vm.CURRENT_SHOW = {};
		vm.CURRENT_SHOW.currentEpisodeLinks = [];
		vm.CURRENT_SHOW.nextEpisodeLinks = [];
		vm.CURRENT_SHOW.previousEpisodeLinks = [];
		vm.CURRENT_SHOW.randomlyGrabbedLinks = [];
		var returnedBackgroundEpisodeLinks = [];
		var tempEpisodeLinks = [];


		vm.currentSeason;
		vm.currentEpisode;		
		vm.CURRENT_EPISODE_NAME;



		// =================GLOBAL HELPER FUNCTIONS=========================
		// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

			vm.setShow = function() {
				vm.reset();
				vm.searchTV();
			};

			var removeDuplicates = function( array ) {

				return array.filter( function( item , pos , ary ) {
					return !pos || item != ary[ pos - 1 ];
				});

			};

			Array.prototype.remove = function( from , to ) {

				var rest = this.splice( ( to || from ) + 1 || this.length );
				this.length = from < 0 ? this.length + from : from;
				return this.push.apply( this , rest );

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
			vm.showShuffleButton = false;

			var swapVideoSource = function( newURL ) {

				console.log("swapping source TO --> " + newURL);
				$('#removablePlayer').remove();
				setTimeout(function(){
					$("#videoPlayer").append("<div id=\"removablePlayer\"><video id=\"my-video\" class=\"video-js\" controls preload=\"auto\" width=\"640\" height=\"264\"data-setup=\"{}\"><source src=\"" + newURL + "\"type='video/mp4'><p class=\"vjs-no-js\">To view this video please enable JavaScript, and consider upgrading to a web browser that<a href=\"http://videojs.com/html5-video-support/\" target=\"_blank\">supports HTML5 video</a></p></video></div>");
				} , 1000 );				

			};

			vm.retryProvider = function() {

				if ( providerCounter <= vm.CURRENT_SHOW.currentEpisodeLinks.length ) {

					console.log("retry video with next link from same provider"); // right now , theres only 1 provider ... f' vodlocker
					var newURL = $sce.trustAsResourceUrl( vm.CURRENT_SHOW.currentEpisodeLinks[providerCounter] );
				
					providerCounter += 1;

					console.log("trying --> " + newURL)	
					swapVideoSource( newURL );
				}


			};

			vm.loadPrevious = function() {
				console.log("loading previous");

				vm.showRetryProvider = false;
				vm.showPreviousButton = false;
				vm.showNextButton = false;

				vm.CURRENT_SHOW.nextEpisodeLinks = [];
				vm.CURRENT_SHOW.nextEpisodeLinks = vm.CURRENT_SHOW.currentEpisodeLinks;
				vm.CURRENT_SHOW.currentEpisodeLinks = [];
				vm.CURRENT_SHOW.currentEpisodeLinks = vm.CURRENT_SHOW.previousEpisodeLinks;
				vm.CURRENT_SHOW.previousEpisodeLinks = [];
				retryProvider = 1;
				
				var nextURL = $sce.trustAsResourceUrl( vm.CURRENT_SHOW.currentEpisodeLinks[0]);
				swapVideoSource(nextURL);					

				vm.CURRENT_EPISODE_NAME = vm.previousEpisodeName;

				var tmpA = vm.currentEpisode;
				var tmpB = vm.currentSeason;
				vm.currentEpisode = vm.previousEpisodeNumber;
				vm.currentSeason = vm.previousEpisodeSeason;
				vm.nextEpisodeNumber = tmpA;
				vm.nextEpisodeSeason = tmpB;

				vm.showRetryProvider = true;
				vm.showNextButton = true;

				isFullSweep = false;
				storeForNext = false;
				storeForRandom = false;
				storeForPrevious = true;

				var season, episode;
				// are we at the first episode in the season?
				if ( ( vm.currentEpisode - 1 ) < 1 ) {

					// are we in the first season?
					if ( vm.currentSeason === 1 ) {
						season = vm.CURRENT_SHOW.seasons.length;
						episode = vm.CURRENT_SHOW.seasons[ season - 1 ].length; 
					}
					else {
						season = vm.currentSeason - 1;
						episode = vm.CURRENT_SHOW.seasons[ season - 1 ].length;
					}

				}
				else {
					season = vm.currentSeason;
					episode = vm.currentEpisode - 1;
				}

				vm.previousEpisodeName = vm.CURRENT_SHOW.seasons[ season - 1 ][ episode - 1 ]["name"];
				vm.previousEpisodeNumber = episode;
				vm.previousEpisodeSeason = season;

				episode = "episode-"+episode;
				season = "season-"+season;

				console.log("Next Episode Name = " + vm.previousEpisodeName);				

				console.log("Grabbing *NEW* PREVIOUS --> " + season + " | " + episode );				

				grabNextAvailable = !grabNextAvailable;
				goToTVEpisodeLink( season , episode );

			};

			var loadRandom = function() {

				if ( displayRandom ) {
					vm.CURRENT_SHOW.currentEpisodeLinks = [];
					vm.CURRENT_SHOW.currentEpisodeLinks = vm.CURRENT_SHOW.randomlyGrabbedLinks;
					vm.randomlyGrabbedLinks = [];
					var newURL = $sce.trustAsResourceUrl( vm.CURRENT_SHOW.currentEpisodeLinks[0] );
					vm.displayVideo = true;
					vm.CURRENT_EPISODE_NAME = vm.nextRandomEpisodeName;
					vm.currentEpisode = vm.nextRandomEpisodeNumber;
					vm.currentSeason = vm.nextRandomEpisodeSeason;

					displayRandom = false;
					setTimeout(function(){
						swapVideoSource( newURL );
					} , 1000);
				}

				var episode , season;
				season = Math.floor( Math.random() * ( vm.CURRENT_SHOW.seasons.length - 1 + 1 ) ) + 1;
				episode = Math.floor( Math.random() * ( vm.CURRENT_SHOW.seasons[ season - 1 ].length - 1 + 1 )  ) + 1;
			
				vm.nextRandomEpisodeName = vm.CURRENT_SHOW.seasons[ season - 1 ][ episode - 1 ]["name"];
				vm.nextRandomEpisodeNumber = episode;
				vm.nextRandomEpisodeSeason = season;

				vm.showRetryProvider = false;
				vm.showNextButton = false;
				vm.showPreviousButton = false;

				isFullSweep = false;
				storeForNext = false;
				storeForPrevious = false;
				storeForRandom = false;
				storeForRandomFuture = true;

				episode = "episode-"+episode;
				season = "season-"+season;				

				console.log("Grabbing *NEW* RANDOM-FUTURE --> " + season + " | " + episode );
				goToTVEpisodeLink( season , episode );		

			};

			vm.loadNext = function() {

				if ( vm.IS_SHUFFLE ) {
					console.log("loading a random clip");
					displayRandom = true;
					vm.CURRENT_SHOW.randomlyGrabbedLinks = []
					vm.CURRENT_SHOW.randomlyGrabbedLinks = vm.CURRENT_SHOW.randomlyGrabbedFutureLinks;
					vm.CURRENT_SHOW.randomlyGrabbedFutureLinks = [];
					loadRandom();
					return;
				}

				console.log("loading next");

				vm.showRetryProvider = false;
				vm.showNextButton = false;
				vm.showPreviousButton = false;

				vm.CURRENT_SHOW.previousEpisodeLinks = [];
				vm.CURRENT_SHOW.previousEpisodeLinks = vm.CURRENT_SHOW.currentEpisodeLinks;
				vm.CURRENT_SHOW.currentEpisodeLinks = [];
				vm.CURRENT_SHOW.currentEpisodeLinks = vm.CURRENT_SHOW.nextEpisodeLinks;
				vm.CURRENT_SHOW.nextEpisodeLinks = [];
				retryProvider = 1;

				var nextURL = $sce.trustAsResourceUrl( vm.CURRENT_SHOW.currentEpisodeLinks[0]);
				swapVideoSource(nextURL);

				vm.CURRENT_EPISODE_NAME = vm.nextEpisodeName;

				var tmpA = vm.currentEpisode;
				var tmpB = vm.currentSeason;
				vm.currentEpisode = vm.nextEpisodeNumber;
				vm.currentSeason = vm.nextEpisodeSeason;
				vm.previousEpisodeNumber = tmpA;
				vm.previousEpisodeSeason = tmpB;

				vm.showRetryProvider = true;
				vm.showPreviousButton = true;

				isFullSweep = false;
				storeForNext = true;
				storeForRandom = false;
				storeForPrevious = false;


				// get NEW next episode
				var episode , season;

				// are we the last episode in the season?
				if ( ( vm.currentEpisode + 1 ) > vm.CURRENT_SHOW.seasons[ vm.currentSeason - 1 ].length ) {

					// are we in the last season?
					if ( vm.currentSeason === vm.CURRENT_SHOW.seasons.length ) {
						episode = 1;
						season = 1;
					}
					else {
						episode = 1;
						season = vm.currentSeason + 1;
					}
					
				}
				else {

					episode = vm.currentEpisode + 1;
					season = vm.currentSeason;

				}

				vm.nextEpisodeNumber = episode;
				vm.nextEpisodeSeason = season;

				vm.nextEpisodeName = vm.CURRENT_SHOW.seasons[ season - 1 ][ episode - 1 ]["name"];
				console.log("Next Episode Name = " + vm.nextEpisodeName);

				episode = "episode-"+episode;
				season = "season-"+season;

				console.log("Grabbing *NEW* NEXT --> " + season + " | " + episode );				

				goToTVEpisodeLink( season , episode );

			};

			vm.toggleShuffle = function() {
				console.log("toggling random...");

				vm.IS_SHUFFLE = !vm.IS_SHUFFLE;

				if ( vm.IS_SHUFFLE && vm.CURRENT_SHOW.randomlyGrabbedLinks.length > 1 ) {
					displayRandom = true;
					storeForRandomFuture = true;
					loadRandom();
				}
				if ( !vm.IS_SHUFFLE ) {
					vm.reset()
				}
				
				console.log("vm.IS_SHUFFLE is now: = " + vm.IS_SHUFFLE);
			};


		// ======================Video-Controls=============================
		// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~



		// searchTV()
		// ========================1=======================================
		// ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
			var loadBackgroundRandom = function() {

				var episode , season;
				season = Math.floor( Math.random() * ( vm.CURRENT_SHOW.seasons.length - 1 + 1 ) ) + 1;
				episode = Math.floor( Math.random() * ( vm.CURRENT_SHOW.seasons[ season - 1 ].length - 1 + 1 )  ) + 1;
			

				vm.nextRandomEpisodeName = vm.CURRENT_SHOW.seasons[ season - 1 ][ episode - 1 ]["name"];
				vm.nextRandomEpisodeSeason = season;
				vm.nextRandomEpisodeNumber = episode;
				vm.nextEpisodeNumber = episode;
				vm.nextEpisodeSeason = season;

				vm.showRetryProvider = false;
				vm.showNextButton = false;
				vm.showPreviousButton = false;

				isFullSweep = false;
				storeForNext = false;
				storeForPrevious = false;
				storeForRandomFuture = false;
				storeForRandom = true;


				episode = "episode-"+episode;
				season = "season-"+season;

				console.log("Grabbing *NEW* RANDOM --> " + season + " | " + episode );				

				goToTVEpisodeLink( season , episode );		

			};		


			var displayLinks = function( links ) {

				// links = removeDuplicates(links);
				
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
				vm.CURRENT_SHOW.seasons = [];
				vm.CURRENT_SHOW.seasons.push(seasonobj);

				//console.log("Season Number = 1");

				// sort into seasons 
				for ( var i = links.length-1; i >= 0; --i ) {
					
					var seasonNumber = parseInt(links[i]["link"].split("/")[3].split("-")[1])
					

					var tmpOBJ = {
						name: links[i]["name"],
						link: links[i]["link"]
					};

					if ( seasonNumber === 0 ) {
						continue;
					}

					// if (this) link's seasonNumber = the current fill space
					if( seasonNumber === sCounter ) {
						//console.log("Adding --> " + tmpOBJ.link);
						vm.CURRENT_SHOW.seasons[ sCounter-1 ].push(tmpOBJ);

					} 
					else { 
						//console.log("Season Number = " + seasonNumber);
						//console.log("Adding --> " + tmpOBJ.link);
						var seasonobj = [];
						sCounter = sCounter + 1;

						vm.CURRENT_SHOW.seasons.push(seasonobj);
						vm.CURRENT_SHOW.seasons[ sCounter - 1 ].push(tmpOBJ);

					}

				}

				vm.showShowLinks = true;

				for ( var i = 0; i < vm.CURRENT_SHOW.seasons.length; ++i ) {

					console.log("Season - " + ( i + 1 ) + " | Max Episode = " + vm.CURRENT_SHOW.seasons[i].length );

				}

				loadBackgroundRandom();

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



			var cachedCurrentSeason,cachedCurrentEpisode;

			var player;

			var launchPlayerControlAI = function() {

				vm.NOW_PLAYING = $sce.trustAsResourceUrl( vm.CURRENT_SHOW.currentEpisodeLinks[0] );
				vm.displayVideo = true;

				setTimeout( function() {

					videojs("my-video").ready(function() {

				  		console.log("we think #my-video is ready");

				  		player = this;

				  		cachedCurrentSeason = vm.currentSeason; 
				  		cachedCurrentEpisode = vm.currentEpisode;

				  		// player.play();

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

								if ( isFullSweep ) {

									if ( isCurrent ) {
										console.log("STORING into currentEpisodeLinks[]");
										vm.CURRENT_SHOW.currentEpisodeLinks.push(data);
									}
									if ( isNext ) {
										console.log("STORING into nextEpisodeLinks[]");
										vm.CURRENT_SHOW.nextEpisodeLinks.push(data);
										console.log(vm.CURRENT_SHOW.nextEpisodeLinks[0]);
									}
									if ( isPrevious ) {
										console.log("STORING into previousEpisodeLinks[]");
										vm.CURRENT_SHOW.previousEpisodeLinks.push(data);
										console.log(vm.CURRENT_SHOW.previousEpisodeLinks[0]);
									}

								}
								else {
									console.log("STORING into genereic returnedBackgroundEpisodeLinks[]");
									returnedBackgroundEpisodeLinks.push(data);
								}

								if ( vm.displayVideo === false ) {
									// launchPlayerControlAI();
								}

									if ( capcity < cieling ) {
										getSecondLayer();
									}
									else {
										gI = links.length + 1;
										getSecondLayer();
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

					if ( isFullSweep ) {

						if ( isCurrent ) {

							launchPlayerControlAI();
							
							vm.showRetryProvider = true;

							isCurrent = false;
							isNext = true;
							var episode , season;

							// get next episode

							// are we the last episode in the season?
							if ( ( vm.currentEpisode + 1 ) > vm.CURRENT_SHOW.seasons[ vm.currentSeason - 1 ].length ) {

								// are we in the last season?
								if ( vm.currentSeason === vm.CURRENT_SHOW.seasons.length ) {
									episode = 1;
									season = 1;
								}
								else {
									episode = 1;
									season = vm.currentSeason + 1;
								}
								
							}
							else {

								episode = vm.currentEpisode + 1;
								season = vm.currentSeason;

							}

							vm.nextEpisodeName = vm.CURRENT_SHOW.seasons[ season - 1 ][ episode - 1 ]["name"];
							vm.nextEpisodeNumber = episode;
							vm.nextEpisodeSeason = season;

							episode = "episode-"+episode;
							season = "season-"+season;

							console.log("Grabbing NEXT --> " + season + " | " + episode );

							goToTVEpisodeLink( season , episode ); // get next episode
						}
						else if ( isNext ) {

							isNext = false;
							isPrevious = true;

							var episode, season;

							vm.showNextButton = true;

							// are we at the first episode in the season?
							if ( ( vm.currentEpisode - 1 ) < 1 ) {

								// are we in the first season?
								if ( vm.currentSeason === 1 ) {
									season = vm.CURRENT_SHOW.seasons.length;
									episode = vm.CURRENT_SHOW.seasons[ vm.CURRENT_SHOW.seasons.length - 1 ].length; 
								}
								else {
									season = vm.currentSeason - 1;
									episode = vm.CURRENT_SHOW.seasons[ season - 1 ].length;
								}

							}
							else {
								season = vm.currentSeason;
								episode = vm.currentEpisode - 1;
							}

							vm.previousEpisodeName = vm.CURRENT_SHOW.seasons[ season - 1 ][ episode - 1 ]["name"];
							vm.previousEpisodeNumber = episode;
							vm.previousEpisodeSeason = season;

							episode = "episode-"+episode;
							season = "season-"+season;

							console.log("Grabbing PREVIOUS --> " + season + " | " + episode );
							goToTVEpisodeLink( season , episode ); // get previous episode

						}
						else if ( isPrevious ) {
							isPrevious = false;
							isFullSweep = false;
							//getSecondLayer();

							vm.showPreviousButton = true;
							vm.showNextButton = true;

							console.log("Successful Full-Sweep");
							console.log("Current MP4 URL's");
							console.log( vm.CURRENT_SHOW.currentEpisodeLinks[0] );
							console.log( vm.CURRENT_SHOW.currentEpisodeLinks[1] );

							console.log("\nNext MP4 URL's");
							console.log( vm.CURRENT_SHOW.nextEpisodeLinks[0] );
							console.log( vm.CURRENT_SHOW.nextEpisodeLinks[1] );

							console.log("\nPrevious MP4 URL's");
							console.log( vm.CURRENT_SHOW.previousEpisodeLinks[0] );
							console.log( vm.CURRENT_SHOW.previousEpisodeLinks[1] );




						}


					}
					else if ( storeForNext ) {
						console.log("STORING into nextEpisodeLinks");
						vm.CURRENT_SHOW.nextEpisodeLinks = returnedBackgroundEpisodeLinks;
						console.log( vm.CURRENT_SHOW.nextEpisodeLinks[0] );
						returnedBackgroundEpisodeLinks = [];

						if ( !grabNextAvailable ) {
							console.log("playing nice with vodlocker.... waiting 60 seconds");
							alert("playing nice with vodlocker.... waiting 60 seconds");
							setTimeout(function() {
								grabNextAvailable = !grabNextAvailable;
								vm.showPreviousButton = true;
								vm.showNextButton = true;
							} , 60000);
						}
						else {
							grabNextAvailable = !grabNextAvailable;
							vm.showNextButton = true;
							vm.showPreviousButton = true;
						}

					}
					else if ( storeForPrevious ) {
						console.log("STORING into previousEpisodeLinks");

						vm.CURRENT_SHOW.previousEpisodeLinks = returnedBackgroundEpisodeLinks;
						returnedBackgroundEpisodeLinks = [];

						if ( !grabNextAvailable ) {
							console.log("playing nice with vodlocker.... waiting 60 seconds");
							alert("playing nice with vodlocker.... waiting 60 seconds");
							setTimeout(function() {
								grabNextAvailable = !grabNextAvailable;
								vm.showPreviousButton = true;
								vm.showNextButton = true;
							} , 60000);
						}
						else {
							grabNextAvailable = !grabNextAvailable;
							vm.showPreviousButton = true;
							vm.showNextButton = true;
						}

					}
					else  if ( storeForRandom ) {

						console.log("STORING into randomlyGrabbedLinks[]");

						vm.CURRENT_SHOW.randomlyGrabbedLinks = [];
						vm.CURRENT_SHOW.randomlyGrabbedLinks = returnedBackgroundEpisodeLinks;
						returnedBackgroundEpisodeLinks = [];

						storeForRandom = false;
						vm.showRetryProvider = true;
						vm.showShuffleButton = true;

					}
					else if ( storeForRandomFuture ) {

						console.log("STORING into randomlyGrabbedFutureLinks[]");

						vm.CURRENT_SHOW.randomlyGrabbedFutureLinks = [];
						vm.CURRENT_SHOW.randomlyGrabbedFutureLinks = returnedBackgroundEpisodeLinks;
						returnedBackgroundEpisodeLinks = [];

						vm.showRetryProvider = true;
						vm.showNextButton = true;
						storeForRandomFuture = false;	

					}


				}

			};

			vm.clickOnTVLink = function( linkURL , linkName ) {

				isFullSweep = true;
				isCurrent = true;

				var x,season,episode;

				console.log( linkName + " | " + linkURL);
				x = linkURL.split("/"); 
				season =  x[3];
				episode = x[4];
				vm.currentSeason = parseInt(season.split("-")[1]);
				vm.currentEpisode = parseInt(episode.split("-")[1]);

				if ( vm.alreadyActivated ) {

					vm.CURRENT_SHOW.currentEpisodeLinks = [];
					vm.CURRENT_SHOW.nextEpisodeLinks = [];
					vm.CURRENT_SHOW.previousEpisodeLinks = [];

					retryProvider = 1;
					capcity = 0;
					gI = 0;
					links = [];
					vm.displayVideo = false;
					vm.NOW_PLAYING = " ";
					vm.CURRENT_EPISODE_NAME = linkName;

					$('#removablePlayer').remove();
					setTimeout(function(){
						$("#videoPlayer").append("<div id=\"removablePlayer\"><video id=\"my-video\" class=\"video-js\" controls preload=\"auto\" width=\"640\" height=\"264\"data-setup=\"{}\"><source src=\"{{vm.NOW_PLAYING}}\"type='video/mp4'><p class=\"vjs-no-js\">To view this video please enable JavaScript, and consider upgrading to a web browser that<a href=\"http://videojs.com/html5-video-support/\" target=\"_blank\">supports HTML5 video</a></p></video></div>");
					} , 1000 );

						
					goToTVEpisodeLink( season , episode );	


				}

				else {
					vm.alreadyActivated = true;
					vm.CURRENT_EPISODE_NAME = linkName;
					goToTVEpisodeLink( season , episode );
				}

			};

			var goToTVEpisodeLink = function( season , episode ) {

				links = [];
				gI = 0;
				capcity = 0;
				
				console.log("		--> /api/specificEpisodeLink/" + vm.CURRENT_SHOW.name + "/" + season + "/" + episode);
				$http.put('/api/specificEpisodeLink/' + vm.CURRENT_SHOW.name + "/" + season + "/" + episode )
					.success(function(data) {
						console.log("  		-->} Success");
						links = data;
						getSecondLayer();
					})
					.error(function(e){
						console.log(e);
					})
				;

			};

			vm.reset = function() {



				storeForRandom = false;
				storeForRandomFuture = false;
				displayRandom = false;

				needToDisplayWhenRandomFinishes = true;

				vm.alreadyActivated = false;
				isFullSweep = false;
				isCurrent = false;
				isNext = false;
				isPrevious = false;
				storeForNext = false
				storeForPrevious = false;

			 	grabNextAvailable = true;

				gI = 0;
				links = [];
				capcity = 0;
				cieling = 2;
				retryProvider = 1;

				vm.tvURL;
				vm.displayVideo = false;
				vm.showAUTOMATICLINKS = false;
				vm.showShowLinks = false;

				vm.CURRENT_SHOW = {};
				vm.CURRENT_SHOW.currentEpisodeLinks = [];
				vm.CURRENT_SHOW.nextEpisodeLinks = [];
				vm.CURRENT_SHOW.previousEpisodeLinks = [];
				returnedBackgroundEpisodeLinks = [];
				tempEpisodeLinks = [];

				vm.NOW_PLAYING = " ";

				$('#removablePlayer').remove();
				setTimeout(function(){
					$("#videoPlayer").append("<div id=\"removablePlayer\"><video id=\"my-video\" class=\"video-js\" controls preload=\"auto\" width=\"640\" height=\"264\"data-setup=\"{}\"><source src=\"{{vm.NOW_PLAYING}}\"type='video/mp4'><p class=\"vjs-no-js\">To view this video please enable JavaScript, and consider upgrading to a web browser that<a href=\"http://videojs.com/html5-video-support/\" target=\"_blank\">supports HTML5 video</a></p></video></div>");
				} , 1000 );


			};
		// ========================2=======================================

		
	}

	angular
		.module('solarFlixApp')
		.controller('homeCtrl' , homeCtrl)
	;

})();