'use strict';

// Declare app level module which depends on views, and components
angular.module('secMapApp', [
  'ngRoute',
  'ngResource',
  'secMapApp.home',
  'secMapApp.map',
  'secMapApp.list',
  'secMapApp.report',
  'secMapApp.contact',
  'secMapApp.version',
  'vcRecaptcha'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.otherwise({redirectTo: '/home'});
}])

.factory('Complaints', ['$resource',
	function($resource) {
		return $resource('api/complaints.php?id=:id&filters=:filters&bounds=:bounds',
			{id: '@id'},
			{
				findAll: {method:'GET', params:{}, isArray:true},
				find: {method:'GET', params:{}, isArray:true}
			}
		);
	}
])

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
)
;

