'use strict';

angular.module('secMapApp.contact', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/contact', {
    templateUrl: 'contact/contact.html',
    controller: 'Contact2Ctrl'
  });
}])

.controller('Contact2Ctrl', [function() {

}]);