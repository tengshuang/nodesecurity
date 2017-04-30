/**
 * Created by wdy on 03/03/2017.
 */
'user strict';

app.controller('userProfileCtrl', function($scope, $interval, $log, dialogService, $cookies, apiService, $state, $mdDialog, status_global_constant, $rootScope) {



  $scope.currentStatus = $scope.currentUser['status'];
  $scope.currentLocation = $scope.currentUser['location'];
  $scope.statusData = status_global_constant;
  $scope.selectedLoc = {
    "name": "N.A.",
    "lat": 200,
    "lon": 200
  };




  $scope.getLocation = function() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(position) {
        console.log("123");
        lat = position.coords.latitude;
        lon = position.coords.longitude;
        $scope.selectedLoc = {
          "name": "Default",
          "lat": lat,
          "lon": lon
        };
        $rootScope.$broadcast('setCity', $scope.selectedLoc);
        console.dir($scope.selectedLoc);
      });
    }
  };
  $scope.setUserProfile = function(currentLocation) {
    apiService.postUserProfile($scope.currentUser['token'], $scope.currentStatus, currentLocation).then(function successCallback(response) {
      if (response.data['Error'] != null) {
        if (response.data['Error']['code'] == "401") {
          $state.go("signIn");
        }
      } else if (response.data != null) {
        $scope.currentUser['status'] = $scope.currentStatus;
        $scope.currentUser['location'] = $scope.currentLocation;
        $scope.currentUser.currentStatusColor = status_global_constant[$scope.currentUser.status]['color'];

        $mdDialog.hide();
      }
    }, function errorCallback(response) {
      dialogService.alert("Information", "The server has no response!", "OK");
    });
  }




  $scope.postRescue = function() {

    if ($scope.selectedLoc.lon === 200) {
      dialogService.alert("Information", "Please locate yourself first", "OK");
      return;
    }

    apiService.postRescue($scope.currentUser['token'], $scope.selectedLoc.lon, $scope.selectedLoc.lat).then(function successCallback(response) {
      if (response.data['Error'] != null) {
        dialogService.alert("Information", "Error Please try again", "OK");
      } else if (response.data != null) {
        dialogService.alert("Information", "You have beed added to Rescue Team", "OK");
      }

    }, function errorCallback(response) {
      dialogService.alert("Information", "The server has no response!", "OK");
    });
  };



});
