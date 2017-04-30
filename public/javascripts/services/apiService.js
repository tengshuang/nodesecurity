'user strict'

app.service('apiService', function(httpService,globalUrl) {

    this.logIn = function(username,password){
      var data = {
        "username": username,
        "password": md5(password)
      };
      return httpService.post(globalUrl.LoginAccess,data);
    };

    this.logOut = function(token){
      var data = {
        "token":token
      };
      return httpService.post(globalUrl.LogOutAccess,data);
    };

    this.createNewUser = function(username,password){
      var data = {
        "username": username,
        "password": md5(password),
        "photo": md5(username)
      };
      return httpService.post(globalUrl.CreateNewUser,data);
    };

    this.postMessage = function(token,dirId,message){
      var data = {
        token: token,
        dirId: dirId,
        message: message
      };
      return httpService.post(globalUrl.postMessageAccess,data);
    };

    this.getHistoryMessage = function(token,dirId){
      var str = globalUrl.getMessageAccess+"?token="+token+"&dirId=" + dirId;
      return httpService.get(str);
    };
    
    this.getUserList = function(token,dirId){
      var str = globalUrl.CreateNewUser+"?token="+token+"&dirId=" + dirId;
      return httpService.get(str);
    };


    this.getDirectoryList = function(token){
        var str = globalUrl.getDiretoryList+"?token="+token;
        return httpService.get(str);
    };


    this.postUserProfile = function(token,status,location){
        var data = {
            token: token,
            location: location,
            status: status
        };
        return httpService.post(globalUrl.postUserProfileAccess,data);
    };

    this.postDirectoryStatus = function(token,dirId){
        var data = {
            token: token,
            dirId: dirId
        };
        return httpService.post(globalUrl.postDirectoryStatusAccess,data);
    };
    
    this.postPrivateDirectory = function(token,dirName,userList){
        var data = {
            token: token,
            directoryname: dirName,
            userList: userList
        };
        return httpService.post(globalUrl.postPrivateDirectory,data);
    };

    this.getSearchMessage = function(searchType, fromIndex, toIndex, content, token){
        var str = globalUrl.getSearchMessages+"?"+"type="+searchType+"&fromIndex="+fromIndex+"&toIndex="+toIndex+"&content="+content+"&token="+token;
        if(searchType <= 1)
          str = globalUrl.getSearchMessages+"?"+"type="+searchType+"&content="+content+"&token="+token;
        return httpService.get(str);
    };

    this.searchMPCase = function (token,searchContent) {
        var str = globalUrl.searchMPCase+"?token="+token+"&content=" + searchContent;
    	return httpService.get(str);
    };
    
    this.seeAllMP = function (token) {
        var str = globalUrl.seeAllMP+"?token="+token;
        return httpService.get(str);
        
    };
        
    this.createPerson = function(token, photo, person) {
      var fd = new FormData();
      fd.append('token', token);
      fd.append('photo', photo);
      fd.append('person', JSON.stringify(person));
      return httpService.multipartPost(globalUrl.createPerson, fd);
    };

    this.closeCase = function(token, caseId) {
      var data = {
          token: token,
          personId: caseId
      };
      return httpService.post(globalUrl.closeCase, data);
    };
    
    this.reportFound = function(token, caseId) {
        var data = {
            token: token,
            personId: caseId
        };
        return httpService.post(globalUrl.reportFound, data);
    };

    this.postIncident = function(token, type, location, severity, number){
        var data = {
            token: token,
            type: type,
            location: location,
            severity: severity,
            number: number
        };
        return httpService.post(globalUrl.postIncidentAccess, data);
    };

    this.getIncident = function(token){
        var str = globalUrl.postIncidentAccess+"?token=" + token;
        return httpService.get(str);
    };

    this.postIncidentStatus = function(token,incidentId){
        var data = {
            token: token,
            incidentId: incidentId
        };
        return httpService.post(globalUrl.postIncidentStatusAccess,data);
    };

});