'use strict';

angular.module('secMapApp.map', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/map', {
    templateUrl: 'map/map.html',
    controller: 'MapCtrl'
  });
}])

.controller('MapCtrl', ['$scope', '$http', function($scope, $http) {
		var image = new google.maps.MarkerImage('images/thieft2.png',
			// This marker is 20 pixels wide by 32 pixels tall.
			new google.maps.Size(48, 48),
			// The origin for this image is 0,0.
			new google.maps.Point(0,0),
			// The anchor for this image is the base of the flagpole at 20,47.
			new google.maps.Point(20, 47));

		var infoWindow = new google.maps.InfoWindow({
			maxWidth: 300
		});

		// Convierte los datos de un evento delictivo en un marcador de mapa
		function makeMarker(event, map) {
			map = map || $scope.map;
			var marker = new google.maps.Marker({
				position:  new google.maps.LatLng(event.latitude, event.longitude),
				animation: google.maps.Animation.DROP,
				title: event.date,
				map: map,
				icon: image,
				originalEvent: event
			});

			google.maps.event.addListener(marker, 'mouseover', function() {
				infoWindow.setContent('<div>Robo<br/>el ' + event.date + '<br/>' + event.address + '</div>');
				infoWindow.open(map, marker);
			});

			google.maps.event.addListener(marker, 'mouseout', function() {
				infoWindow.close();
			});

			return marker;
		}

		function makeDateFilters(events) {
			var years = {};
			for (var i in events) {
				var event = events[i];
				years[event.date.substring(0, 4)] = true;
			}

			var filters = [];

			for (var year in years) {
				filters.push({name: year, enabled: false});
			}

			return filters;
		}

		function requestAll() {
			$http.get('api/events.json').
				success(function (data, status, headers, config) {
					// Remove old markers
					var markers = $scope.markers;
					for (var i in markers)
						markers[i].setMap(null);

					$scope.markers = markers = [];

					// Add new markers
					for (var i in data)
						markers.push(makeMarker(data[i], $scope.map));

					if (!$scope.filters)
						$scope.filters = makeDateFilters(data);     // Update existent, if not, new values are not added
				}).
				error(function (data, status, headers, config) {
					// called asynchronously if an error occurs
					// or server returns response with an error status.
					$scope.error = status;
				});
		}

		var laLucilaCentro = new google.maps.LatLng(-36.661505, -56.683145);
		var laLucilaOnGoogle = new google.maps.LatLng(-36.6571402, -56.6928702);
		var mapOptions = {
			center: laLucilaCentro,
			zoom: 14+3,
			mapTypeId: google.maps.MapTypeId.ROADMAP
		};

		$scope.map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
		$scope.markers = [];
		$scope.filterChange = function() {
			requestAll();
		};

		// https://developers.google.com/maps/documentation/javascript/overlays
		// 'https://pbs.twimg.com/profile_images/521914532021559296/mkb7GxyW_normal.png',  //


		requestAll();

		google.maps.event.addListener($scope.map, 'click', function(event) {
			$scope.$apply(function(scope) {
				scope.position = event.latLng;
			});
		});
}]);