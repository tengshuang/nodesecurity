'user strict'

app.service('httpService', function($http) {
    this.post = function (Url,data) {
        return $http({
            method: 'POST',
            url: Url,
            headers: {'Content-Type': 'application/json'},
            data:JSON.stringify(data)
        });
    }

    this.get = function(Url){
    	return $http({
            method: 'GET',
            url: Url
        });
    }

    this.multipartPost = function(url, fd) {
        return $http.post(url, fd, {
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        });
    }
});