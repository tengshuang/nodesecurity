
app.controller('createNewGroupCtrl', function($scope,$interval,httpService, dialogService,apiService,$mdDialog) {
    $scope.me = $scope.currentUser.name;
    $scope.items = [];
  //console.log($scope.todos.length);
    for(var i = 0; i < $scope.todos.length; i++) {
        if(($scope.todos[i].what === $scope.me) === false) $scope.items.push($scope.todos[i]);
        //console.log("iterate array")

        //console.log();
    }
  
    
  $scope.selected = [];
  $scope.toggle = function (item, list) {
      //console.log($scope.me);
      //console.log($scope.items);
    var idx = list.indexOf(item);
    if (idx > -1) {
      list.splice(idx, 1);
    }
    else {
      list.push(item);
    }
  };
    $scope.id =[];
    $scope.closeCreate = function() {
        $mdDialog.hide();
    };
    $scope.postPrivateDir = function(){

        //console.log($scope.currentUser);
        //console.log($scope.currentUser.id);
        $scope.id.push($scope.currentUser.id);

        for(var i = 0; i < $scope.selected.length; i++) {
            //console.log("test case2:");
            //console.log($scope.selected[i].id);
            $scope.id.push($scope.selected[i].id);
        }
        
        for(var i = 0; i < $scope.id.length; i++) {
            console.log("test case3:");
            console.log($scope.id[i]);
        }
        apiService.postPrivateDirectory($scope.currentUser['token'],$scope.groupname,$scope.id).then(function successCallback(response){

                $scope.$emit("toNewGroup");

                $mdDialog.hide();
              }),function errorCallback(response){
                dialogService.alert("Information","The server has no response!","OK");
              }
    };
    //$scope.refresh();
    $interval(function() {
        for(var i = 0; i < $scope.todos.length; i++){
          $scope.refresh(i, $scope.todos[i].photo);
        }

      }, 10, 1);
  $scope.exists = function (item, list) {
    return list.indexOf(item) > -1;
  };

  $scope.isIndeterminate = function() {
    return ($scope.selected.length !== 0 &&
        $scope.selected.length !== $scope.items.length);
  };

  $scope.isChecked = function() {
    return $scope.selected.length === $scope.items.length;
  };

  $scope.toggleAll = function() {
    if ($scope.selected.length === $scope.items.length) {
      $scope.selected = [];
    } else if ($scope.selected.length === 0 || $scope.selected.length > 0) {
      $scope.selected = $scope.items.slice(0);
    }
  };
});
