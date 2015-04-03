'use strict';

// Declare app level module which depends on views, and components
angular.module('secMapApp', [
  'ngRoute',
  'secMapApp.home',
  'secMapApp.map',
  'secMapApp.list',
  'secMapApp.contact',
  'secMapApp.version'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.otherwise({redirectTo: '/home'});
}]);
