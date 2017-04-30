app.controller('rescueTeamCtrl', function($scope, $interval, httpService, dialogService, apiService, $mdDialog, $rootScope) {

  var lon = -73.93;
  var lat = 40.77;
  //$scope.distance = 5000;
  $scope.items = [];
  $scope.longitude = -73.93;
  $scope.latitude = 40.77;

  $scope.cities = [];
  $rootScope.$on('setCity', function(event, data) {
    $scope.selectedLoc = data;
  })
  var searchCities = function() {

    apiService.searchCities($scope.currentUser['token']).then(function successCallback(response) {
      if (response.data['Error'] != null) {
        dialogService.alert("Information", "The server has no data!", "OK");
      } else if (response.data != null) {
        for (var i = 0; i < response.data.Cities.length; i++) {
          var city = {
            name: response.data.Cities[i].name,
            lat: response.data.Cities[i].lat,
            lon: response.data.Cities[i].lon
          };
          $scope.cities.push(city);
        }

      }
    }, function errorCallback(response) {
      dialogService.alert("Information", "The server has no response!", "OK");
    });
  };
  searchCities();





  $scope.searchRescue = function() {
    $scope.items = [];
    if ($scope.distance <= 0) {
      dialogService.alert("Information", "Please input valid distance(km)", "OK");
    }

    if ($scope.selectedLoc.lon == 200) {
      dialogService.alert("Information", "Please choose your current city", "OK");
    }

    apiService.searchRescueTeam($scope.currentUser['token'], $scope.selectedLoc.lon, $scope.selectedLoc.lat, $scope.distance * 1000).then(function successCallback(response) {
      if (response.data['Error'] != null) {
        dialogService.alert("Information", "The server has no data!", "OK");
      } else if (response.data != null) {

        for (var i = 0; i < response.data.Rescue.length; i++) {

          var item = {
            name: response.data.Rescue[i].name,
            photo: response.data.Rescue[i].photo,
            login: response.data.Rescue[i].login,
            dis: response.data.Rescue[i].dis || 1,
            id: response.data.Rescue[i].id,
            loc: response.data.Rescue[i].location
          };
          $scope.items.push(item);
        }


        $interval(function() {
          for (var i = 0; i < $scope.items.length; i++) {
            $scope.refresh(i, $scope.items[i].photo);
          }

        }, 10, 1);

      }
    }, function errorCallback(response) {
      dialogService.alert("Information", "The server has no response!", "OK");
    });
  };


  $scope.showConfirmInfo = function(ev, name, id) {
    $scope.nameTarget = name;
    $scope.idTarget = id;
    if ($scope.idTarget != $scope.currentUser.id) {
      var confirm = $mdDialog.confirm()
        .title('Would you chat privately with ' + $scope.nameTarget + '?')
        .textContent('')
        .ariaLabel('Lucky day')
        .targetEvent(ev)
        .ok('Yes')
        .cancel('Cancel');

      $mdDialog.show(confirm).then(function() {
        $scope.idPri = [];
        $scope.idPri.push($scope.currentUser.id);
        $scope.idPri.push($scope.idTarget);
        var groupname = $scope.nameTarget + " and " + $scope.currentUser.name;
        apiService.postPrivateDirectory($scope.currentUser['token'], groupname, $scope.idPri).then(function successCallback(response) {

            $scope.$emit("toNewGroup");

            $mdDialog.hide();
          }),
          function errorCallback(response) {
            dialogService.alert("Information", "The server has no response!", "OK");
          }
      }, function() {
        $mdDialog.hide();
      });
    }

  };





  $scope.closeAll = function() {
    // Component lookup should always be available since we are not using `ng-if`
    $mdDialog.hide();
  };



  $scope.refresh = function(length, photo) {
    var CanvasId = "#CanvasR_" + length;
    jdenticon.update(CanvasId, photo);
  }


});
