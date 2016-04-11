(function() {


	// linkFilter.$inject = ['$scope' , '$sce'];

	function linkFilter() {

		return function( urls ) {
			var filtered = [];

			angular.forEach( urls , function(url) {
				filtered.push( url.substring( 8 , url.length )  );
			});

			return filtered;

		}

	}


	angular
		.module('solarFlixApp')
		.filter('linkFilter' , linkFilter)
	;

})();