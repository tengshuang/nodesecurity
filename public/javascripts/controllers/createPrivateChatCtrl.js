app.controller('createPrivateChatCtrl', function($scope,$interval,httpService, dialogService,apiService,$mdDialog) {
    $scope.me = $scope.currentUser.name;
    $scope.id =[];

    $scope.closeCreate = function() {
        $mdDialog.hide();
    };


    $scope.postPrivateDir = function(){

        $scope.id.push($scope.currentUser.id);
        $scope.id.push($scope.idTarget);

        apiService.postPrivateDirectory($scope.currentUser['token'],$scope.nameTarget,$scope.id).then(function successCallback(response){

                $scope.$emit("toNewGroup");

                $mdDialog.hide();
              }),function errorCallback(response){
                dialogService.alert("Information","The server has no response!","OK");
              }
    };



});
