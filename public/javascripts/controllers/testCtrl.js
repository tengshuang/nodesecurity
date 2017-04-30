
app.controller('testCtrl', function($scope, apiService) {
	$scope.angularLoaded = angular.version.full;
	$scope.onSubmit = function() {
		apiService.createPerson(
			"", 
			$scope.photo, 
			{  	gender: $scope.gender, 
				age: $scope.age});
	}
});
