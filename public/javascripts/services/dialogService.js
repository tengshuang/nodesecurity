'user strict'

app.service('dialogService', function($mdDialog) {

    this.alert= function(title,message,okMessage){
        $mdDialog.show(
            $mdDialog.alert()
                .clickOutsideToClose(true)
                .title(title)
                .textContent(message)
                .ok(okMessage)
        );
    }

    this.confirm = function(ev,title,textContent,okMessage,cancelMessage){
    	var confirm = $mdDialog.confirm()
          .title(title)
          .textContent(textContent)
          .targetEvent(ev)
          .clickOutsideToClose(true)
          .ok(okMessage)
          .cancel(cancelMessage);
        return $mdDialog.show(confirm)
    }

});