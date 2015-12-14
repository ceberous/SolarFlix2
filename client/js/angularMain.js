(function () {
	
	angular.module('solarFlixApp' , [ 
		'ui.router',
		'ngSanitize',
		'com.2fdevs.videogular',
		'com.2fdevs.videogular.plugins.controls',
		'com.2fdevs.videogular.plugins.buffering',
	]);

	function config ( $stateProvider , $urlRouterProvider , $locationProvider ) {

		$locationProvider.html5Mode({
			enabled: true,
			requireBase: false
		});

		$urlRouterProvider.otherwise('/');

		$stateProvider

			.state('home' , {
				url: '/',
				templateUrl: 'views/home.html',
				controller: 'homeCtrl',
				controllerAs: 'vm'
			})

		;

	}

	angular
		.module('solarFlixApp')
		.config(['$stateProvider', '$urlRouterProvider' , '$locationProvider' , config])
	;

})();