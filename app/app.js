'use strict';

// Declare app level module which depends on views, and components
angular.module('secMapApp', [
  'ngRoute',
  'secMapApp.home',
  'secMapApp.map',
  'secMapApp.list',
  'secMapApp.report',
  'secMapApp.contact',
  'secMapApp.version'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.otherwise({redirectTo: '/home'});
}])
.controller('appController',['$scope', '$rootScope',
	function($scope, $rootScope) {
		$rootScope.$on("$locationChangeStart", function(event, next, current) {
			var items = angular.element(document.getElementById('menu-items')).children();
			items.removeClass('active');

			for (var n = items.length, i =0; i < n; i++) {
				var li = angular.element(items[i]);
				if (next.endsWith(li.find('a').attr('href')))
					li.addClass('active');
			}
		});
	}]
);

