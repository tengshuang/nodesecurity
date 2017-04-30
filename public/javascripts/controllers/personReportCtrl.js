
app.controller('personReportCtrl', function($scope,$interval,httpService, dialogService,apiService,$mdDialog) {

  $scope.closeCreate = function() {
    $mdDialog.hide();
  };

  $scope.closeCase = function() {
    apiService
    .closeCase($scope.currentUser['token'], $scope.mpInfo._id)
    .then(function successCallback(response) {
      if (response.data['Error'] != null) {
          if (response.data['Error']['code'] == "401") {
              $state.go("signIn");
          }
          if (response.data['Error']['code'] == "500") {
              $state.go("signIn");
          }
      } else {
        $scope.mpInfo.status = 1;
        //dialogService.alert("Information", "Case closed!", "OK");
      }
    });
  };

  $scope.reportFound = function() {
    apiService
    .reportFound($scope.currentUser['token'], $scope.mpInfo._id)
    .then(function successCallback(response) {
      if (response.data['Error'] != null) {
          if (response.data['Error']['code'] == "401") {
              $state.go("signIn");
          }
          if (response.data['Error']['code'] == "500") {
              $state.go("signIn");
          }
      } else {
        $scope.mpInfo.find = 1;
        //dialogService.alert("Information", "Reported!", "OK");
      }
    });
  };

});
