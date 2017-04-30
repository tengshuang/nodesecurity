/**
 * Created by wdy on 26/02/2017.
 */
'user strict';

app.controller('groupListCtrl', function($scope,$interval,$mdSidenav,$log,dialogService,$cookies,apiService,$state,$cookies) {

    $scope.GroupList = [];

    // initial setting for focus on announcement when an user logins
    $scope.focusIndex = 0;

    $scope.tempGroupList = []

    $scope.obj.showGroupList = buildToggler('groupList');



    $scope.close = function () {
        // Component lookup should always be available since we are not using `ng-if`
        $mdSidenav('groupList').close()
            .then(function () {
                $log.debug("close GroupList is done");
            });
    };



    $scope.currentUser = JSON.parse($cookies.get('user'));


    $scope.getGroupList = function () {
        apiService.getDirectoryList($scope.currentUser['token']).then(function successCallback(response){
            if(response.data['Error'] != null){
                if(response.data['Error']['code'] == "401"){
                    dialogService.alert("Information","Your are not valid a user.","OK");
                    return;
                }
            }
            else if(response.data['Directory'] != null){



                if ($scope.GroupList.length != 0)
                {
                    var onceFocusDirId = $scope.GroupList[$scope.focusIndex].id;
                    $scope.tempGroupList = response.data['Directory'];
                }
                else
                {
                    $scope.tempGroupList = response.data['Directory'];
                    var onceFocusDirId = $scope.tempGroupList[$scope.focusIndex].id;
                }





                $scope.focusIndex = getFocusDirFromNewList(onceFocusDirId,$scope.tempGroupList);


                apiService.postDirectoryStatus($scope.currentUser['token'],onceFocusDirId).then(function successCallback(response){
                    if(response.data['Error'] != null){
                        if(response.data['Error']['code'] == "401"){
                            $state.go("signIn");
                        }
                    }
                    else if(response.data['Directory'] != null){


                        $scope.tempGroupList[$scope.focusIndex].hasBeenRead = true;
                        $scope.GroupList = $scope.tempGroupList;

                        $interval(function() {
                            for (var i = 0 ; i < $scope.GroupList.length; i++)
                            {
                                $scope.refresh(i,md5($scope.GroupList[i].name));
                            }

                        }, 10, 1);
                    }
                },function errorCallback(response){
                    dialogService.alert("Information","The server has no response!","OK");
                });

            }

        },function errorCallback(response){
            dialogService.alert("Information","The server has no response!","OK");
        });
    }

    $scope.getGroupList();

    $scope.refresh = function(length, photo){
        var CanvasId = "#GroupCanvas_" + length;
        jdenticon.update(CanvasId, photo);
    };




    function buildToggler(navID) {
        return function () {
            // Component lookup should always be available since we are not using `ng-if`
            $mdSidenav(navID)
                .open()
                .then(function () {
                    $log.debug("toggle " + navID + " is done");
                });
        };
    };





    $scope.focus_click = function (i) {
        if($scope.focusIndex != i)
        {
            $scope.focusIndex = i;
            $scope.$emit('changeDirectory',$scope.GroupList[i].id);

            // TODO: post the directory has been read
            apiService.postDirectoryStatus($scope.currentUser['token'],$scope.GroupList[i].id).then(function successCallback(response){
                if(response.data['Error'] != null){
                    if(response.data['Error']['code'] == "401"){
                        $state.go("signIn");
                    }
                }
                else if(response.data['Directory'] != null){
                    $scope.GroupList[i].hasBeenRead = true;
                }
            },function errorCallback(response){
                dialogService.alert("Information","The server has no response!","OK");
            });

        }



    };

    //  TODO : update the read status of the directory on new coming message
    $scope.$on('changeDirectoryStatus',function(event, dirId){

        $scope.getGroupList();

    });


    $scope.$on('newGroup',function(event){

        $scope.getGroupList();

    });

    function getFocusDirFromNewList(onceId,newList) {
        for (var i =0 ; i < newList.length; i++)
        {
            if (newList[i].id == onceId){
                return i;
            }
        }
    }

});