'use strict';

angular.module('secMapApp.list', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/list', {
    templateUrl: 'list/list.html',
    controller: 'ListCtrl'
  });
}])

.controller('ListCtrl', ['$scope', 'Complaints', function($scope, Complaints) {
		$scope.complaints = Complaints.findAll();
}]);