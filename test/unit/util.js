/**
 * Created by wang on 2017/4/2.
 */
var utils = require('../../backend/utils');

var assert = require('assert');
describe('chat privatesly', function() {

    it('should test isValid and return right value', function (done) {
        utils.stopwordService.isValid('a',function(ret){
            assert.equal(ret, false);
            done();
        });
    });


    it('should test isValid and return right value', function (done) {
        utils.stopwordService.isValid('abc',function(ret){
            assert.equal(ret, true);
            done();
        });
    });

    it('should test token service and return right value', function (done) {
        ret = utils.tokenService.createToken('abc');
        assert.notEqual(ret, null);
        done();
    });

    it('should test isValid and return right value', function (done) {
        utils.typeService.isValid('0', '1', function(ret){
            assert.equal(ret, true);
            done();
        });
    });

    it('should test isValid and return right value', function (done) {
        utils.typeService.isValid('1','1', function(ret){
            assert.equal(ret, true);
            done();
        });
    });

    it('should test isValid and return right value', function (done) {
        utils.typeService.isValid('1','8', function(ret){
            assert.equal(ret, false);
            done();
        });
    });


});