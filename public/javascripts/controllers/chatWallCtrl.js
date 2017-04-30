/**
 * Created by wdy on 02/03/2017.
 */
'user strict';

app.controller('chatWallCtrl', function($scope, $interval,$http, $cookies,dialogService,$mdDialog,$state,apiService,status_global_constant, incidentType, severityType) {


    $scope.currentUser = JSON.parse($cookies.get('user'));
    $scope.incidentId = $scope.currentUser['directories'][2];

    $scope.inputMsg = '';

    $scope.MessageList = [];

    $scope.IncidentList = [];

    //communityCtrl io
    $scope.$on('changeChatWall',function(event, dirId){
        $scope.currentDirId = dirId;
        $scope.MessageList = [];
        if(dirId != $scope.incidentId){
            $scope.getHistoryMessage();
        }
        else{
            $scope.IncidentList = [];
            $scope.getIncident();
        }
    });

    $scope.$on('receive new incident', function(event, incident){
        if($scope.currentDirId == $scope.incidentId){
            appendIncident(incident);
        }
    })

    $scope.$on('receive new chat message',function (event,msg) {

        msg.left = true;
        if(msg['dirId'] == $scope.currentDirId)
        {
            if(msg['creator']['name'] != $scope.currentUser['name'])
            {
                msg.left = true;
                appendMessage(msg);
            }

        }
        $scope.inputMsg = '';
    });



    if($cookies.get('newUser') != null){

        $mdDialog.show({
            templateUrl: "/app/welcome",
            parent: angular.element(document.body),
            clickOutsideToClose:true,
        });
        $cookies.remove('newUser');
    }

    $scope.getHistoryMessage = function(){

        apiService.getHistoryMessage($scope.currentUser['token'],$scope.currentDirId).then(function successCallback(response){
            if(response.data['Error'] != null){
                if(response.data['Error']['code'] == "401"){
                    $state.go('signIn');
                    return;
                }
            }
            else if(response.data['Messages'] != null){
                var msgs = response.data['Messages'];
                for(var i = 0; i < msgs.length; ++i) {
                    var item = {
                        left: true,
                        txt: msgs[i].content,
                        name: msgs[i]['creator']['name'],
                        date: msgs[i].time,
                        location: msgs[i].location,
                        status: msgs[i].status,
                        statusColor: status_global_constant[msgs[i].status]['color'],
                        photo: msgs[i]['creator']['photo'],
                        dirId: msgs[i]['dirId']
                    }
                    if(msgs[i]['creator']['name'] == $scope.currentUser['name'])
                        item.left = false;
                    $scope.MessageList.push(item);
                }
                var length = $scope.MessageList.length;
                $interval(function() {
                    for (var i = 0; i < length; ++i){
                        $scope.refresh(i,$scope.MessageList[i].photo);
                    };
                }, 10, 1);
                toBot();
            }
        },function errorCallback(response){
            dialogService.alert("Information","The server has no response!","OK");
        });

    }

    $scope.getHistoryMessage();


    $scope.getIncident = function(){
        apiService.getIncident($scope.currentUser['token']).then(function successCallback(response){
            if(response.data['Error'] != null){
                if(response.data['Error']['code'] == "401"){
                    $state.go('signIn');
                    return;
                }
            }
            else if(response.data['Incident'] != null){
                var msgs = response.data['Incident'];
                for(var i = 0; i < msgs.length; ++i) {
                    var status = "unresolved"
                    if(msgs[i].status == 1){
                        status = "resolved";
                    }
                    var item = {
                        left: true,
                        type: incidentType[msgs[i].type].title,
                        location: msgs[i].location,
                        severity: severityType[msgs[i].severity].title,
                        number: msgs[i].number,
                        status: status,
                        date: msgs[i].time,
                        id: msgs[i]._id
                    };
                    $scope.IncidentList.push(item);
                }
                toBot();
            }
        },function errorCallback(response){
            dialogService.alert("Information","The server has no response!","OK");
        });

    };


    $scope.$on('newIncidentState', function(){
        if($scope.currentDirId == $scope.incidentId){
            $scope.IncidentList = [];
            $scope.getIncident();
        }
    })

    $scope.changeIncidentStatus = function(ev, i){
        if($scope.IncidentList[i].status != "resolved"){
            dialogService.confirm(ev,"Information","Would you like to change an incident status to resolved?","Confirm","Cancel")
                .then(function() {
                    apiService.postIncidentStatus($scope.currentUser['token'], $scope.IncidentList[i].id).then(function successCallback(response) {
                        if (response.data['Error'] != null) {
                            if (response.data['Error']['code'] == "401") {
                                $state.go("signIn");
                            }
                        }
                        else if (response.data['Incident'] != null) {
                            $scope.IncidentList[i].status = "resolved";
                        }
                    }, function errorCallback(response) {
                        dialogService.alert("Information", "The server has no response!", "OK");
                    });
                });
        }
    };

    function toBot() {
        $interval(function() {
            var element = document.getElementById("mdContent");
            element.scrollTop = element.scrollHeight - element.clientHeight;
        }, 10, 10);
    };

    $scope.refresh = function(length, photo){
        var CanvasId = "#Canvas_" + length;
        jdenticon.update(CanvasId, photo);
    }


    function appendIncident(msg) {
        var status = "unresolved"
        if(msg.status == 1){
            status = "resolved";
        }
        var item = {
            type: incidentType[msg.type].title,
            location: msg.location,
            severity: severityType[msg.severity].title,
            number: msg.number,
            status: status,
            date: msg.time,
            id: msg._id
        };
        $scope.IncidentList.push(item);
        toBot();

    }
    function appendMessage(msg) {

        var tempMsg = {
            left: msg['left'],
            name: msg['creator']['name'],
            txt: msg['content'],
            date: msg['time'],
            status: msg['status'],
            statusColor: status_global_constant[msg['status']]['color'],
            location: msg['location'],
            photo: msg['creator']['photo'],
            // TODO : add directory which the massage belongs
            dirId: msg['dirId'],
        }

        var length = $scope.MessageList.length;
        $scope.MessageList.push(tempMsg);
        toBot();

        $interval(function() {
            $scope.refresh(length,msg.photo);
        }, 10, 1);
    };

    $scope.locationExist = function(location){
        if(location == null) return false;
        if(location.length == 0) return false;
        return true;
    }

    $scope.showLocation = function(location){
        if($scope.locationExist(location)){
            dialogService.alert("Location",location,"OK")
        }

    }

    $scope.sendMessage = function(msg){
        if(msg == '') return;

        apiService.postMessage($scope.currentUser['token'],$scope.currentDirId,msg).then(function successCallback(response){
            if(response.data['Error'] != null){
                if(response.data['Error']['code'] == "401"){
                    $state.go("signIn");
                }
            }
            else if(response.data['Messages'] != null){

                appendMessage(response.data['Messages']);
                toBot();
            }
        },function errorCallback(response){
            dialogService.alert("Information","The server has no response!","OK");
        });

    }

});
