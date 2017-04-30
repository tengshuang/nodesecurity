/**
 * Created by tsh on 14/04/2017.
 */

app.controller('bulletinCtrl', function($scope,$cookies,apiService,dialogService,$mdDialog) {
    if($cookies.get('user') == null)
        $state.go("signIn");

    $scope.currentUser = JSON.parse($cookies.get('user'));

    $scope.caseList = [];
    $scope.caseMap = {};

    $scope.search = function (searchContent) {
        $scope.caseList = [];
        $scope.caseMap = {};
        apiService.searchMPCase($scope.currentUser['token'],searchContent).then(function successCallback(response) {
            if (response.data['Error'] != null) {
                if (response.data['Error']['code'] == "401") {
                    $state.go("signIn");
                }
                if (response.data['Error']['code'] == "500") {
                    $state.go("signIn");
                }
            }
            else if (response.data['Cases'] != null) {
                $scope.caseList = response.data['Cases'];
                for(var i = 0; i < $scope.caseList.length; ++i) {
                    $scope.caseMap[$scope.caseList[i]._id] = $scope.caseList[i];
                }
                $scope.searchMPContent = "";
            }
        }, function errorCallback(response) {
            dialogService.alert("Information", "The server has no response!", "OK");
        });

    };

    $scope.viewDetail = function (mpCase) {
        $scope.mpInfo = mpCase;
        $mdDialog.show({
            scope:$scope,
            preserveScope: true,
            controller: 'personReportCtrl',
            templateUrl: "/app/personReport",
            parent: angular.element(document.body),
            clickOutsideToClose:true,
            escapeToClose: true
        });
    };

    $scope.createMP = function () { 
        $scope.mpInfo = {};
        $mdDialog.show({
            scope:$scope,
            preserveScope: true,
            controller: 'createPersonCtrl',
            templateUrl: "/app/createPerson",
            parent: angular.element(document.body),
            clickOutsideToClose:true,
            escapeToClose: true
        });
    };
    
    $scope.seeAllMP = function () {
        $scope.caseList = [];
        $scope.caseMap = {};
        apiService.seeAllMP($scope.currentUser['token']).then(function successCallback(response) {
            if (response.data['Error'] != null) {
                if (response.data['Error']['code'] == "401") {
                    $state.go("signIn");
                }
                if (response.data['Error']['code'] == "500") {
                    $state.go("signIn");
                }
            }
            else if (response.data['Cases'] != null) {
                $scope.caseList = response.data['Cases'];
                for(var i = 0; i < $scope.caseList.length; ++i) {
                    $scope.caseMap[$scope.caseList[i]._id] = $scope.caseList[i];
                }
                $scope.searchMPContent = "";
            }
        }, function errorCallback(response) {
            dialogService.alert("Information", "The server has no response!", "OK");
        });
    };
    
    $scope.closeBulletin = function () {
        $scope.$parent.bulletinOn = false;
    }



});
