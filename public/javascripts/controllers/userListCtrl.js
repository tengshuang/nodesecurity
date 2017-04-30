'user strict';

app.controller('userListCtrl', function ($scope,$interval, $timeout, $mdSidenav, $log,httpService, dialogService,apiService,$state,$cookies,$mdDialog) {
  $scope.obj.showUserList = buildToggler('right');

  if($cookies.get('user') == null)
    $state.go("signIn");
  $scope.isOpenRight = function(){
    return $mdSidenav('right').isOpen();
  };

  $scope.$on('newUserStatus', function(user){
    $scope.showUsers();
  });


  $scope.$on('logIn', function(user){

    $scope.showUsers();
  });

  $scope.$on('logOut',function(user){

    $scope.showUsers();

  });


  $scope.$on('changeUserList',function(event, dirId){

    $scope.currentDirId = dirId;
    $scope.showUsers();
  });

  function buildToggler(navID) {
    return function() {
        // Component lookup should always be available since we are not using `ng-if`
      $log.debug("123");
        $mdSidenav(navID)
          .toggle()
          .then(function () {
            $log.debug("toggle " + navID + " is done");
          });
      };
  }



  $scope.refresh = function(length, photo){
    var CanvasId = "#CanvasRight_" + length;
    jdenticon.update(CanvasId, photo);
  }

  $scope.todos = [];

  $scope.showUsers = function() {
    apiService.getUserList($scope.currentUser['token'],$scope.currentDirId).then(function successCallback(response){

      if(response.data['Error'] != null){
        if(response.data['Error']['code'] == "401"){
          //dialogService.alert("Information","Your are not valid a user.","OK");
          $state.go("signIn");
          return;
        }
      } else if (response.data['Users'] != null) {
        var userList = response.data['Users'];
        var tmpArr = [];
        for(var i = 0; i < userList.length; i++) {
          tmpArr.push({
            photo: userList[i].photo,
            what: userList[i].name,
            who: userList[i].login,
            status: userList[i].status,
              id: userList[i].id
          });
        }
        $scope.todos = tmpArr;
      }
      $interval(function() {
        for(var i = 0; i < $scope.todos.length; i++){
          $scope.refresh(i, $scope.todos[i].photo);
        }

      }, 10, 1);
    },function errorCallback(response){
      dialogService.alert("Information","The server has no response!","OK");
    });
  }


  $scope.showUsers();



  $scope.createGroup = function(){

    $mdDialog.show({
        //----inherit the parent scope, for using and updating currentUser
        scope:$scope,
        preserveScope: true,
        //----inherit the parent scope, for using and updating currentUser

        controller: 'createNewGroupCtrl',
        templateUrl: "/app/createNewGroup",
        parent: angular.element(document.body),
        clickOutsideToClose:true,
        escapeToClose: true
    });
  }


  $scope.createPrivate = function(name, id){
    $scope.nameTarget = name;
    $scope.idTarget= id;
    if($scope.idTarget != $scope.currentUser.id){
      $mdDialog.show({
          //----inherit the parent scope, for using and updating currentUser
          scope:$scope,
          preserveScope: true,
          //----inherit the parent scope, for using and updating currentUser

          controller: 'createPrivateChatCtrl',
          templateUrl: "/app/createPrivateChat",
          parent: angular.element(document.body),
          clickOutsideToClose:true,
          escapeToClose: true
      });
    }

  }

  $scope.showConfirm = function(ev,name,id) {
      $scope.nameTarget = name;
      $scope.idTarget= id;
      if($scope.idTarget != $scope.currentUser.id) {
        var confirm = $mdDialog.confirm()
              .title('Would you chat privately with ' + $scope.nameTarget +'?')
              .textContent('')
              .ariaLabel('Lucky day')
              .targetEvent(ev)
              .ok('Yes')
              .cancel('Cancel');

        $mdDialog.show(confirm).then(function() {
          $scope.idPri =[];
          $scope.idPri.push($scope.currentUser.id);
          $scope.idPri.push($scope.idTarget);
          var groupname = $scope.nameTarget + " and " + $scope.currentUser.name;
          apiService.postPrivateDirectory($scope.currentUser['token'],groupname,$scope.idPri).then(function successCallback(response){

                  $scope.$emit("toNewGroup");

                  $mdDialog.hide();
                }),function errorCallback(response){
                  dialogService.alert("Information","The server has no response!","OK");
                }
        }, function() {
          $mdDialog.hide();
        });
      }

    };





  $scope.close = function () {
    // Component lookup should always be available since we are not using `ng-if`
    $mdSidenav('right').close()
      .then(function () {
        $log.debug("close RIGHT is done");
      });
    };
  });
