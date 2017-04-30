'user strict';

app.controller('signInCtrl', function($scope,dialogService,logInService,apiService,$cookies,$state){

  $scope.title = "clara teng";

  $scope.logIn = function(ev){

  	if(!logInService.nullIdentify($scope.username)){
  		dialogService.alert("Information","Username should not be empty.","OK")
  		return;
  	}
  	if(!logInService.UsernameMinimumQuality($scope.username)){
  		dialogService.alert("Information","Username should contain at least 3 characters.","OK")
  		return;
  	}
  	if(!logInService.reserveName($scope.username)){
  		dialogService.alert("Information","Username Forbidden.","OK")
  		return;
  	}
  	if(!logInService.nullIdentify($scope.password)){
  		dialogService.alert("Information","Password should not be empty.","OK")
  		return;
  	}
  	if(!logInService.passwordMinimumQuality($scope.password)){
  		dialogService.alert("Information","Password should contain at least 4 charactors.","OK")
  		return;
  	}


    apiService.logIn($scope.username,$scope.password).then(function successCallback(response){
      if(response.data['Error'] != null){
        if(response.data['Error']['code'] == "404"){
            dialogService.confirm(ev,"Information","Would you like to sign in as a new user ?","Confirm","Cancel")
            .then(function() {
              apiService.createNewUser($scope.username,$scope.password).then(function successCallback(response){
                if(response.data['Users']!= null){
                  //create new user
                  $cookies.put('newUser',true);
                  $cookies.put('user',JSON.stringify(response.data['Users']));
                  $state.go('community');
                }

              }),function errorCallback(response){
                dialogService.alert("Information","The server has no response!","OK");
              }
            }, function() {
          });
        }
        else if(response.data['Error']['code'] == "401"){
         dialogService.alert("Information","Password wrong, Please try again.","OK")
        }
      }
      else if(response.data['Users'] != null){
        //login Successful
          $cookies.put('user',JSON.stringify(response.data['Users']));
          $state.go('community');
        }
    },function errorCallback(response){
      dialogService.alert("Information","The server has no response!","OK");
    });

  }


});
