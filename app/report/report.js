/**
 * http://sixrevisions.com/javascript/changes-in-angularjs-1-3/
 */
'use strict';

angular.module('secMapApp.report', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
		$routeProvider.when('/report', {
			templateUrl: 'report/report.html',
			controller: 'Report2Ctrl'
		});
}])

.directive('focusOn', function() {
	return {
		restrict: 'A',
		scope: {
			focusValue: "=focusOn"
		},
		link: function($scope, $element, attrs) {
			$scope.$watch("focusValue", function(currentValue, previousValue) {
				if (currentValue === true && !previousValue) {
					$element[0].focus();

					$scope.focusValue = false;
				}
			})
		}
	}
})

.controller('Report2Ctrl', ['$scope', 'Complaints', 'vcRecaptchaService', function($scope, Complaints, vcRecaptchaService) {
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


	$scope.$watchGroup(['complaint.address', 'complaint.locality'], function(newValues, oldValues, scope) {
		function addressChanged(complaint) {
			if (complaint.address.toLowerCase() != scope.old_address || complaint.locality.toLowerCase() != scope.old_locality) {
				scope.old_address = complaint.address.toLowerCase();
				scope.old_locality = complaint.locality.toLowerCase();

				return true;
			}
			return false;
		}

		var complaint = $scope.complaint;

		if (newValues === oldValues || !addressChanged(complaint))
			return;

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
					scope.error = 'No encuentro la dirección ' + request.address + ' en ' + complaint.locality
					+ '. Por favor revisa si es correcta.';
				} else if (status == google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
					scope.error = 'Se han realizado demasiados pedidos hoy. Por favor reintento dentro de un rato.';
				} else if (status != google.maps.GeocoderStatus.OK) {
					scope.error = 'Hubo un problema al buscar la dirección ' + status;
				} else if (!addressFound(results[0])) {
					scope.error = 'No encuentro la dirección ' + request.address + ' en ' + complaint.locality
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
						scope.old_locality = scope.complaint.locality;
						scope.complaint.location.latitude = location.lat();
						scope.complaint.location.longitude = location.lng();
						delete scope.error;
					}
			});
		});

	});

	$scope.submitting = false;
	$scope.submitted = false;
	$scope.submit = function() {

		var complaint = $scope.complaint;

		$scope.submitting = true;
		delete $scope.errorPost;

		var c = new Complaints(complaint);
		c.$save(
			function() {
				$scope.submitting = false;
				$scope.submitted = true;
				$scope.success = true;
			},
			function(data, status) {
				$scope.submitting = false;
				$scope.errorPost = status;
				vcRecaptchaService.reload($scope.widgetId);
			});
	};

	$scope.resetForAnother = function() {
		var complaint = $scope.complaint;

		$scope.submitted = false;
		complaint.address = "";
		delete $scope.success;
		delete complaint.date;
		delete complaint.time;
		delete complaint.type;
		delete complaint.details;

		$scope.addressFocused = true;   // TODO change this with a message
	};

	// Captcha staff
	$scope.captchaKey = '6LdUNOYSAAAAANdmj5Ze1eHfzeKHGHcEncmhbLS8';
	$scope.complaint.response = null;
	$scope.widgetId = null;

	$scope.setResponse = function (response) {
		console.info('Response available ' + response);
		$scope.complaint.response = response;
	};

	$scope.setWidgetId = function (widgetId) {
		console.info('Created widget ID: %s', widgetId);
		$scope.widgetId = widgetId;
	};
/*
	$scope.captcha = grecaptcha.render('g-recaptcha', {
		'sitekey' : '6LdUNOYSAAAAANdmj5Ze1eHfzeKHGHcEncmhbLS8'
	});
*/

		// $('#main-nav-top').outerHeight(true) +
		// $('#report-instructions').outerHeight(true)
	$('#report-form-control').affix({
		offset: {
			top: 275,
			xbottom: function() {
				return (this.bottom = $('.footer').outerHeight(true))
			}
		}
	})
}]);