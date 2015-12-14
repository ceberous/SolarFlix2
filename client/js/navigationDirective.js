(function () {

	function navigationGeneric () {
		return {
			restrict: 'EA',
			templateUrl: '/views/navigationDirective.html'
		};
	}

	angular
		.module('solarFlixApp')
		.directive('navigationGeneric' , navigationGeneric)
	;


})();