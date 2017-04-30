'user strict';

app.controller('communityCtrl', function($scope, $interval,$http, $cookies,dialogService,$mdDialog,$state,apiService,ruleService,status_global_constant) {
    if($cookies.get('user') == null)
        $state.go("signIn");
    $scope.currentUser = JSON.parse($cookies.get('user'));
    $scope.currentDirId = $scope.currentUser['directories'][0];
    $scope.announcementId = $scope.currentUser['directories'][0];
    $scope.incidentId = $scope.currentUser['directories'][2];


    $scope.openMenu = false;

    $scope.searchOn = false;

    $scope.bulletinOn = false;

    $scope.incidentOn = false;

    $scope.changeMenuStatus = function () {
        $scope.openMenu = !$scope.openMenu;
    };

    $scope.openBulletin = function () {
        $scope.bulletinOn = true;
    };
    $scope.currentUser.currentStatusColor = status_global_constant[$scope.currentUser.status]['color'];

    $scope.obj = {};

    var socket = io();

    //communityCtrl io
    $scope.$on('changeDirectory',function(event, dirId){

        $scope.$broadcast('changeUserList',dirId);
        $scope.$broadcast('changeChatWall',dirId);
        $scope.currentDirId = dirId;
        $scope.incidentOn = false;
    });

    $scope.$on('changeIncidentState', function(event, state){
        console.log("/////");
        $scope.incidentOn = state;

    });


    $scope.$on('toNewGroup',function(event){
        $scope.$broadcast('newGroup');
    });



    //socket io



    socket.emit('logInB', $scope.currentUser['name']);

    socket.on('message', function(msg){


        // to chatWallCrtl
        $scope.$broadcast('receive new chat message',msg['Messages']);
        // to groupListCrtl
        $scope.$broadcast('changeDirectoryStatus',msg['Messages']['dirId']);
    });

    socket.on('incident', function (incident) {
        $scope.$broadcast('receive new incident',incident['Incident']);
    });

    socket.on('newIncidentState',function () {
        $scope.$broadcast('newIncidentState');
    });


    socket.on('logInF', function(user){
        //do the logIn thing
        $scope.$broadcast('logIn',user);
    });

    socket.on('newUserStatus', function(){
        //do the logIn thing
        $scope.$broadcast('newUserStatus');
    });

    socket.on('logOutF',function(user){
        //do the logOut thing
        $scope.$broadcast('logOut',user);
    });


    if($cookies.get('newUser') != null){

        $mdDialog.show({
            templateUrl: "/app/welcome",
            parent: angular.element(document.body),
            clickOutsideToClose:true,
        });
        $cookies.remove('newUser');
    }

    $scope.viewType = function () {
        if($scope.incidentOn){
            return 3;
        }
        if($scope.currentDirId == $scope.announcementId){
            return 0;
        }
        if($scope.currentDirId == $scope.incidentId){
            return 1;
        }
        return 2;

    }
    $scope.searchSwitch = function(){
        $scope.searchOn = ! $scope.searchOn;
    }

    $scope.addIncident = function () {
        $scope.incidentOn = true;
        //$state.go("incident");
    };

    $scope.showStatus = function(){
        $mdDialog.show({
            //----inherit the parent scope, for using and updating currentUser
            scope:$scope,
            preserveScope: true,
            //----inherit the parent scope, for using and updating currentUser

            controller: 'userProfileCtrl',
            templateUrl: "/app/status",
            parent: angular.element(document.body),
            clickOutsideToClose:true,
        });
    }




    $scope.logOut = function(){

        apiService.logOut($scope.currentUser['token']).then(function successCallback(response){
            if(response.data['Error'] != null){
                if(response.data['Error']['code'] == "401"){
                    $state.go("signIn");
                }
            }
            else if(response.data['Result'] != null){
                $cookies.remove('user');
                socket.emit('logOutB', $scope.currentUser['name']);
                $state.go('signIn');
            }
        },function errorCallback(response){
            dialogService.alert("Information","The server has no response!","OK");
        });
    };

});
