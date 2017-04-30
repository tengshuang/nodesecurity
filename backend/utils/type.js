/**
 * Created by tsh on 28/03/2017.
 */

var typeList = ['0','1','2','3','4'];

var isValid = function (type,content,callback) {
    callback(parseInt(type,10) === 0 || typeList.indexOf(content) >= 0);
};

exports.isValid = isValid;