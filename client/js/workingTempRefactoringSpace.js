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

					// push into current / next / previous
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

		links = [];

		if ( fillSwitch === 1 ) { // if We Just Recieved the INITIAL / "clicked-on" episode link set

			vm.showRetryProvider = true;
			console.log("Current Episode");
			for ( var i = 0; i < foundMP4URLS.length; ++i ) {
				console.log(foundMP4URLS[i]);
			}						

			fillSwitch = 2;

			if ( cachedCurrentEpisode + 1 < maxEpisodeForSeasons[cachedCurrentSeason - 1] ) {
				// console.log("Next Episode = " + (vm.currentEpisode + 1) )
				// /tv/the-office-2005/season-1/episode-1/
				var builtURL = "/tv/" + vm.CURRENT_SHOW.link + "/season-" + cachedCurrentSeason +"/episode-" + ( cachedCurrentEpisode + 1 )  + "/";
				console.log("Next UP = " + builtURL);
				vm.goToTVEpisodeLink(builtURL);
			}
			else {
				var builtURL = "/tv/" + vm.CURRENT_SHOW.link + "/season-" + ( cachedCurrentSeason + 1 ) +"/episode-1/";
				console.log("Next UP = " + builtURL);
				vm.goToTVEpisodeLink(builtURL);
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

				var builtURL = "/tv/" + vm.CURRENT_SHOW.link + "/season-" + totalSeasons +"/episode-" + ( maxEpisodeForSeasons[totalSeasons -1] )  + "/";
				console.log("Next UP = " + builtURL);
				vm.goToTVEpisodeLink(builtURL);

			}
			else {
				var builtURL = "/tv/" + vm.CURRENT_SHOW.link + "/season-" + cachedCurrentSeason +"/episode-" + ( cachedCurrentEpisode - 1 )  + "/";
				console.log("Next UP = " + builtURL);
				vm.goToTVEpisodeLink(builtURL);
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

vm.clickOnTVLink = function( link ) {

	if ( vm.alreadyActivated === true ) {

		capcity = 0;
		vm.displayVideo = false;
		vm.NOW_PLAYING = " ";

		foundMP4URLS = [];
		nextEpisodeLinks = [];
		previousEpisodeLinks = [];

		vm.alreadyActivated = false;
		gI = 0;
		setTimeout(function(){
			vm.goToTVEpisodeLink( link );
		} , 1000 );

	}

	else {
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

	console.log("		--> /api/specificEpisodeLink/" + vm.CURRENT_SHOW.link + "/" + season + "/" + episode);
	$http.put('/api/specificEpisodeLink/' + vm.CURRENT_SHOW.link + "/" + season + "/" + episode )
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