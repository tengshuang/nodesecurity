/**
 * Created by wdy on 27/03/2017.
 */

app.controller('searchCtrl', function($scope,$interval,$mdSidenav,$log,dialogService,$cookies,apiService,$state,$cookies,status_global_constant,globalUrl) {

    $scope.criteria = ['Username', 'Status', 'Announcement', 'Public messages', 'Private messages'];
    $scope.keyWords ='';
    $scope.searchCriteria = $scope.criteria[0];
    $scope.MessageList = [];

    $scope.chooseUser=true;
    $scope.initFromIndex = 0;
    $scope.initToIndex = 9;
    $scope.numOfItemsPerPage = 10;
    $scope.currentFromIndex = $scope.initFromIndex;
    $scope.currentToIndex = $scope.initToIndex;



    $scope.showMore = false;

    $scope.search = function (searchCriterion, keyWords) {
        $scope.MessageList = [];
        $scope.userSearch = [];
        $scope.currentFromIndex = $scope.initFromIndex;
        $scope.currentToIndex = $scope.initToIndex;

        switch (searchCriterion){

            case 'Username' :
                $scope.getSearchMessage(0, undefined, undefined, keyWords);
                break;

            case 'Status' :
                $scope.getSearchMessage(1, undefined, undefined, keyWords);

                break;

            case 'Announcement' :
                $scope.getSearchMessage(2,$scope.currentFromIndex, $scope.currentToIndex, keyWords);
                break;

            case 'Public messages' :
                $scope.getSearchMessage(3,$scope.currentFromIndex, $scope.currentToIndex, keyWords);
                break;

            case 'Private messages' :
                $scope.getSearchMessage(4,$scope.currentFromIndex, $scope.currentToIndex, keyWords);
                break;

            default:
                break;
        };

    }

    $scope.getSearchMessage = function(searchType, fromIndex, toIndex, keyWords){

        if(searchType === 1) {
          keyWords = keyWords.toLowerCase();
          if(keyWords==status_global_constant[0].title.toLowerCase()) {
            keyWords=0;
          } else if(keyWords==status_global_constant[1].title.toLowerCase()){
            keyWords=1;
          } else if (keyWords==status_global_constant[2].title.toLowerCase()) {
            keyWords=2;
          } else if(keyWords==status_global_constant[3].title.toLowerCase()) {
            keyWords=3;
          }
        }

        if(searchType === 1 || searchType === 0) {
          fromIndex = undefined;
          toIndex = undefined;
        }

        apiService.getSearchMessage(searchType,fromIndex,toIndex,keyWords,$scope.currentUser['token']).then(function successCallback(response){
            if(response.data['Error'] != null){
                if(response.data['Error']['code'] == "401"){
                    $state.go('signIn');
                    return;
                }
                if(response.data['Error']['code'] == "403"){

                    dialogService.alert("Attention","Your key words contain forbidden words","OK");

                    return;
                }
            }
            else if(response.data['Messages'] != null){
                $scope.chooseUser=false;
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

                // it is tricky to set these sentences after assign value to messageList. Because the Button is designed to refresh after messageList shows
                if (msgs.length < 10) {
                    $scope.showMore = false;
                }else
                {
                    $scope.showMore = true;
                }

                var length = $scope.MessageList.length;
                $interval(function() {
                    for (var i = 0; i < length; ++i){
                        $scope.refresh(i,$scope.MessageList[i].photo);
                    };
                }, 10, 1);
            } else if(response.data['Users'] != null){

              $scope.userSearch= response.data['Users'];



              $interval(function() {
                  for (var i = 0; i < $scope.userSearch.length; ++i){
                      $scope.refresh(i,$scope.userSearch[i].photo);
                  };
              }, 10, 1);
            }



        },function errorCallback(response){
            dialogService.alert("Information","The server has no response!","OK");
        });

    }


    $scope.searchMore =function (searchCriterion, keyWords) {
        $scope.currentFromIndex +=  $scope.numOfItemsPerPage;
        $scope.currentToIndex += $scope.numOfItemsPerPage;

        switch (searchCriterion){

            case 'Announcement' :
                $scope.getSearchMessage(2,$scope.currentFromIndex, $scope.currentToIndex, keyWords);
                break;

            case 'Public messages' :
                $scope.getSearchMessage(3,$scope.currentFromIndex, $scope.currentToIndex, keyWords);
                break;

            case 'Private messages' :
                $scope.getSearchMessage(4,$scope.currentFromIndex, $scope.currentToIndex, keyWords);
                break;

            default:
                break;
        };
    }

    $scope.refresh = function(length, photo){
        var CanvasId = "#Canvas_" + length;
        jdenticon.update(CanvasId, photo);
    }


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

});
