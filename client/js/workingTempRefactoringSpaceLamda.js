var gI = 0;
var capcity = 0;
var cieling = 2;
var recievedValidMP4URLS = [];
var loadBackgroundNextVideo = function() {

	console.log(" --> .... getSecondLayer()");

	if ( ( gI <= workingEpisodeGrabBag.length - 1 ) && ( capcity < cieling ) ) {
		console.log(links[gI]);

		$http.put("/api/parseProvider/" + workingEpisodeGrabBag[gI])
			.success(function(data) {
				
				gI += 1;

				if ( data.substring( data.length - 5 , data.length ) === "v.mp4" ) {

					capcity += 1;

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


	}


};


var workingEpisodeGrabBag = [];
var goToTVEpisodeLinkBACKGROUND = function( link ) {

	// link should appear as : /tv/the-durrells-2016/season-1/episode-2/

	capcity = 0;
	gI = 0;

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
			workingEpisodeGrabBag = data;
			loadBackgroundNextVideo();
		})
		.error(function(e){
			console.log(e);
		})
	;

};