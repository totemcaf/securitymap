'use strict';

angular.module('secMapApp.report', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
		$routeProvider.when('/report', {
			templateUrl: 'report/report.html',
			controller: 'Report2Ctrl'
		});
}])

.controller('Report2Ctrl', ['$scope', function($scope) {
	var geocoder = new google.maps.Geocoder();

	var laLucilaDowntown = new google.maps.LatLng(-36.661505, -56.683145);
	var northEast = new google.maps.LatLng(-36.32950909247665, -56.639671325683594);
	var southWest = new google.maps.LatLng(-36.86698689106876, -56.791419982910156);

	var bounds = new google.maps.LatLngBounds(southWest, northEast);

	var mapOptions = {
		center: laLucilaDowntown,
		zoom: 14+3,
		mapTypeId: google.maps.MapTypeId.ROADMAP
	};

	$scope.map = new google.maps.Map(document.getElementById("complaint_map_canvas"), mapOptions);

	$scope.complaint = {locality: 'La Lucila del Mar', state: 'Buenos Aires', country: 'Argentina'
		, location: {}, complainant: {}};

	function addressFound(result) {
		if (!bounds.contains(result.geometry.location))
			return false;

		var components = result.address_components;

		// results[0].partial_match)
		// https://developers.google.com/maps/documentation/javascript/reference#GeocoderLocationType

		for (var lc = components.length, i = 0; i < lc; i++) {
			var types = components[i].types;

			for (var lt = types.length, j = 0; j < lt; j++) {
				if (types[j] == 'route')
					return true;
			}
		}
	}

	function extractLocality(result, defaultLocality) {
		var components = result.address_components;

		// results[0].partial_match)

		for (var lc = components.length, i = 0; i < lc; i++) {
			var types = components[i].types;

			for (var lt = types.length, j = 0; j < lt; j++) {
				if (types[j] == 'locality')
					return components[i].long_name;
			}
		}

		return defaultLocality;
	}

	function addressChanged() {
		var complaint = $scope.complaint;
		if (complaint.address !== $scope.old_address || complaint.locality !== $scope.old_locality) {
			$scope.old_address = complaint.address;
			$scope.old_locality = complaint.locality;

			return true;
		}
		return false;
	}


	$scope.addressChange = function() {
		if (!addressChanged())
			return;

		var complaint = $scope.complaint;
		var request = {
			address: complaint.address,
			bounds: bounds,
			componentRestrictions: {
				// locality: complaint.locality,
				administrativeArea: complaint.state,
				country: complaint.country
			}
		};

		geocoder.geocode(request, function(results, status) {
			$scope.$apply(function(scope) {
				if (scope.marker)
					scope.marker.setMap(null);
				if (status == google.maps.GeocoderStatus.ZERO_RESULTS) {
					scope.error = 'No encuentro la dirección ' + complaint.address + ' en ' + complaint.locality
					+ '. Por favor revisa si es correcta.';
				} else if (status == google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
					scope.error = 'Se han realizado demasiados pedidos hoy. Por favor reintento dentro de un rato.';
				} else if (status != google.maps.GeocoderStatus.OK) {
					scope.error = 'Hubo un problema al buscar la dirección ' + status;
				} else if (!addressFound(results[0])) {
					scope.error = 'No encuentro la dirección ' + complaint.address + ' en ' + complaint.locality
					+ '. Por favor revisa si es correcta.';
					} else {
						var location = results[0].geometry.location;
						var map = $scope.map;
						map.setCenter(location);

						scope.marker = new google.maps.Marker({
							map: map,
							position: location
						});
						scope.complaint.locality = extractLocality(results[0], scope.complaint.locality);
						scope.complaint.location.latitude = location.lat();
						scope.complaint.location.longitude = location.lng();
						delete scope.error;
					}
			});
		});
	}
}]);