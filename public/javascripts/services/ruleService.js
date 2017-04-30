/**
 * Created by wang on 2017/4/13.
 */
app.service('ruleService', function() {
    this.nullIdentify = function(str){
        if(str == null) return false;
        if(str.length == 0) return false;
        return true;
    }
    this.numberIdentify = function(str){
        if(str == null) return false;
        if(!parseInt(str)) return false;
        return true;
    }
});
