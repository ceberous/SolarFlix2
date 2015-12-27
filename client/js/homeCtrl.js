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

		vm.tvURL;
		vm.displayVideo = false;
		vm.showAUTOMATICLINKS = false;


		var hostBlackList = ['ishared' , 'nosvideo' , 'grifthost' , 'vid.ag'];

		vm.currentVideo = 0;
		vm.API = null;
		vm.state = null;

		vm.onPlayerReady = function(API) {
			vm.API = API;
		};

		vm.onCompleteVideo = function() {

			vm.isCompleted = true;
			vm.currentVideo += 1;

			if ( vm.currentVideo >= vm.videos.length ) {
				vm.currentVideo = 0;
			}

			vm.changeCurrentVideoSource( vm.currentVideo );

		};


		vm.config = {
			preload: "none",
			tracks: [
				{
					src: "pale-blue-dot.vtt",
					kind: "subtitles",
					srclang: "en",
					label: "English",
					default: ""
				}
			],
			theme: {
      			url: "./css/videogular.css"
			}
		};

		vm.setShow = function() {
			vm.tvURL = "the-office-2005";
		};


		var removeDuplicates = function( array ) {

			return array.filter( function( item , pos , ary ) {
				return !pos || item != ary[ pos - 1 ];
			});

		};


		vm.searchTV = function() {
			console.log("made it to vm.searchTV()");
			$http.put('/api/grabPage/' + vm.tvURL )
				.success(function(data) {
					displayLinks(data);
				})
			;
		};

		var displayLinks = function( links ) {
			// links === array of 
				// [0] tv
				// [1] the-office-2005
				// [2] season-9
				// [3] episode-?? 

			links = removeDuplicates(links);
			vm.returnedTVLinks = links;

			var newShow = {}; 
			var x = links[0].split("/");
			newShow.showName = x[2];
			x = x[3];
			x = x.split("-");
			x = parseInt( x[1] );
			newShow.totalSeasons = x;
			console.log("Total Seasons for " + newShow.showName + " = " + newShow.totalSeasons );

			newShow.seasons = [newShow.totalSeasons];

			// fill out array
			for ( var i = 0; i < newShow.seasons.length; ++i ) {
				newShow.seasons[i] = {season: i};
			}
			
			for ( var i = 0; i < links.length; ++i ) {

				var y = links[i].split("/");
				var x = y;
				x = x[3];
				x = x.split("-");
				x = parseInt( x[1] ); // season integer

				//console.log(x);
				newShow.seasons[x-1].season[x-1].push( { episode: y[4] , link: links[i] } )
				
		


			}


		};

		vm.goToTVEpisodeLink = function( link ) {

			link = link.split('/');
			var show = link[2];
			var season = link[3];
			var episode = link[4];

			vm.currentEpisode = episode;
			vm.currentSeason = season;

			var previousEpisode = episode.split("-");
			var pE = parseInt( previousEpisode[1] ) - 1;
			vm.previousEpisode = previousEpisode[0] + "-" + pE.toString();
			console.log("Previous Episode = " + vm.previousEpisode);

			var nE = parseInt( previousEpisode[1] ) + 1;
			vm.nextEpisode = previousEpisode[0] + "-" + nE.toString();
			console.log("Next Episode = " + vm.nextEpisode);

			$http.put('/api/specificTVLink/' + show + '/' + season + '/' + episode )
				.success(function(data){
					displayHostProviders( data );
				})
			;

		};


		vm.goToHostProvider = function( link ) {
			$http.put('/api/hostProvider/' + link )
				.success(function(data) {
					getMP4URL(data);
				})
			;
		};

		var automaticHostProviders = function() {

			pHostLength = vm.hostProviders.length;

			if ( pHostLength > 0 ) {
				
				var temp = vm.hostProviders.pop();
				$http.put('/api/hostProvider/' + temp )
					.success( function(data) {
						automaticGetMP4URL( data );
					})
					.error( function(errr) {
						automaticHostProviders();
					})
				;

			} 
			else {

				var firstTry = mp4URLS[0];
				vm.activeMovieURLS = mp4URLS;

				vm.videos = [

					{
						sources: [
							{src: $sce.trustAsResourceUrl(firstTry), type: "video/mp4"}
						]

					}

				];

				// start to grab next video in series
				// ************************************************
				// ************************************************

				/*
				// convert to HTTPS	
				var output = firstTry.substr(0, 4) + "s" + firstTry.substr(4 , firstTry.length);
				console.log(output);
				*/

				vm.config.sources = vm.videos[0].sources;

				vm.showVideo = true;

				vm.showAUTOMATICLINKS = true;
				vm.AUTOMATICGRABEDLINKS = mp4URLS;

			}

		};

		vm.setVideoURL = function( link ) {

			// cache playlist
			// ************************************************
			// ************************************************

			vm.showVideo = false;
			setTimeout( function() { 

				// re-Add playlist

				vm.config.sources = [ {src: $sce.trustAsResourceUrl(link), type: "video/mp4"} ];

			} , 1400 );
			
			vm.showVideo = true;

		};

		vm.changeCurrentVideoSource = function( link ) {
			vm.API.stop();
			vm.videos[0].sources = [ {src: $sce.trustAsResourceUrl(link), type: "video/mp4"} ]
			setTimeout( function() {
				vm.API.play.bind( vm.API );
			} , 100 );
		};


		var recursivelyFetchMP4URLS = function() {

			if ( vm.hostProviders != null ) {

				automaticHostProviders();

			}

		};

		var displayHostProviders = function( links ) {

			var showIDS = [];

			for ( var i = 0; i < links.length; ++i ) {
				var temp = links[i].split('/');
				if ( temp[2] === "show" ) {
					showIDS.push(temp[3]);
				}
			}

			vm.hostProviders = showIDS;

			recursivelyFetchMP4URLS();

		};

		var automaticGetMP4URL = function( link ) {

			var param = {
				url: link
			};

			$http( {
				url: '/api/getMP4URL/',
				method: 'PUT',
				data: {url: link}
			})
				.success(function(data) {
					console.log(".mp4 url from -->" + link);
					console.log(data);

					if (data != " " ) {

						// grab host domain name
						var domainName = link.split("/");
						domainName = domainName[1];
						console.log(domainName);

						// remove links on blacklist
						var blackListed = false;
						for ( var i = 0; i < hostBlackList; ++i ) {
							if ( hostBlackList[i] === domainName ) {
								balckListed = true;
							}
						}
						if (!blackListed) { mp4URLS.push(data); }
						
					}
					
					automaticHostProviders();
				})
				.error(function(error) {
					automaticHostProviders();
				})

			;
			
		};

		var getMP4URL = function( link ) {

			var param = {
				url: link
			};

			$http( {
				url: '/api/getMP4URL/',
				method: 'PUT',
				data: {url: link}
			})
				.success(function(data) {
					console.log( ".mp4 url from -->" + link);
					console.log(data);
					// displayVideo(data);
					mp4URLS.push(data);
				})

			;

		};

		var displayVideo = function(link) {
			vm.displayVideo = true;
			vm.MP4LINK = link;
		};

	}


	angular
		.module('solarFlixApp')
		.controller('homeCtrl' , homeCtrl)
	;

})();