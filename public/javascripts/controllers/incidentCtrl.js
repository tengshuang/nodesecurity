/**
 * Created by wang on 2017/4/9.
 */
app.controller('incidentCtrl', function($scope,$interval,  $cookies,$rootScope,httpService, dialogService,apiService,ruleService,$mdDialog,$state,severityType,incidentType) {
    $scope.currentUser = JSON.parse($cookies.get('user'));
    $scope.severityType=severityType;
    $scope.incidentType=incidentType;

    $scope.cancel = function(){
        $rootScope.$broadcast('changeIncidentState',false);
    };

    $scope.createIncident = function(ev){
        if(!ruleService.nullIdentify($scope.currentType)){
            dialogService.alert("Information","Type of incident should not be empty","OK");
            return;
        }
        if(!ruleService.nullIdentify($scope.location)){
            dialogService.alert("Information","Location should not be empty.","OK");
            return;
        }
        if(!ruleService.nullIdentify($scope.currentSType)){
            dialogService.alert("Information","Type of severity should not be empty","OK");
            return;
        }
        if(!ruleService.nullIdentify($scope.number)){
            dialogService.alert("Information","Number of people injured should not be empty.","OK")
            return;
        }
        if(!ruleService.numberIdentify($scope.number)){
            dialogService.alert("Information","Number of people injured should be a number.","OK")
            return;
        }
        dialogService.confirm(ev,"Information","Would you like to create a new Incident?","Confirm","Cancel")
            .then(function() {
                apiService.postIncident($scope.currentUser['token'],$scope.currentType, $scope.location, $scope.currentSType, $scope.number).then(function successCallback(response){
                    if(response.data['Error'] != null){
                        if(response.data['Error']['code'] == "401"){
                            dialogService.alert("Information","Your are not valid a user.","OK");
                            return;
                        }
                    }
                    $rootScope.$broadcast('changeIncidentState',false);
                })
            });
    };
});