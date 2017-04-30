
app.controller('createPersonCtrl', function($scope,$interval,httpService, dialogService,apiService,$mdDialog) {

  $scope.mpInfo = {};

  $scope.onPhotoClick = function() {
    document.getElementById("filePhoto").click();
  }

  $scope.photoPreview = '/uploads/default.png';

  $scope.onPhotoSelected = function(input) {
    if (input.files && input.files[0]) {
        var reader = new FileReader();
        reader.onload = function (e) {
          $scope.photoPreview = e.target.result;
          $scope.$apply();
        };
        reader.readAsDataURL(input.files[0]);
    }
  }

  $scope.closeCreate = function() {
    $mdDialog.hide();
  }

  $scope.confirmCreate = function() {
    var info = $scope.mpInfo;
    apiService
    .createPerson(
      $scope.currentUser['token'], 
      info.photo, 
      {
        name: info.name, 
        dob: info.dob,
        gender: info.gender,
        age: info.age,
        telephone: info.telephone,
        skinColor: info.skinColor,
        eyeColor: info.eyeColor,
        hairColor: info.hairColor,
        race: info.race,
        weight: info.weight,
        height: info.height,
        clothing: info.clothing,
        address: info.address,
        association: info.association,
        contactPhone: info.contactPhone,
        contactEmail: info.contactEmail
      })
    .then(function successCallback(response){
      if (response.data['Person'] != null) {
        $mdDialog.hide();
        $scope.viewDetail(response.data.Person);
      }
    });
  }

});
