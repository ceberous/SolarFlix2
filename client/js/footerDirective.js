(function () {

	function footerGeneric () {
		return {
			restrict: 'EA',
			templateUrl: '/views/footerGeneric.html'
		};
	}

	angular
		.module('solarFlixApp')
		.directive('footerGeneric' , footerGeneric)
	;


})();

