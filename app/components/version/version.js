'use strict';

angular.module('secMapApp.version', [
  'secMapApp.version.interpolate-filter',
  'secMapApp.version.version-directive'
])

.value('version', '0.1');
