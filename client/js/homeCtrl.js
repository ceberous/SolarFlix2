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


		vm.config = {
			preload: "none",
			sources: [
				{src: $sce.trustAsResourceUrl(""), type: "video/mp4"},
			],
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
      			url: "/css/videogular.css"
			}
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
			// links === array of /tv/the-office-2005/season-9/episode-?? strings

			links = removeDuplicates(links);
			vm.returnedTVLinks = links;
		};

		vm.goToTVEpisodeLink = function( link ) {
			link = link.split('/');
			var show = link[2];
			var season = link[3];
			var episode = link[4];
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

				// convert to HTTPS	
				var output = firstTry.substr(0, 4) + "s" + firstTry.substr(4 , firstTry.length);
				console.log(output);

				vm.config.sources = [ {src: $sce.trustAsResourceUrl(output), type: "video/mp4"} ];

				vm.showVideo = true;

				vm.showAUTOMATICLINKS = true;
				vm.AUTOMATICGRABEDLINKS = mp4URLS;
			}

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