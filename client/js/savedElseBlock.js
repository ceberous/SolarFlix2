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
