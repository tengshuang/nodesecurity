
var app = angular.module('MyApp', ['ngMaterial','ui.router','ngMdIcons','ngCookies']);

app.config(function($mdThemingProvider,$stateProvider,$urlRouterProvider) {
    $mdThemingProvider.theme('default')
    //.primaryPalette('blue')
        .accentPalette('orange');

    $urlRouterProvider.when("", "/signIn");
    $urlRouterProvider.when("/", "/signIn");
    $urlRouterProvider.otherwise("/");


    $stateProvider
        .state('signIn', {
            url: '/signIn',
            templateUrl: '/app/SignIn',
            controller: 'signInCtrl',
            onEnter:function(){
                console.log('enter signIn!');
            }
        })
        .state('community', {
            url: '/community',
            templateUrl: '/app/community',
            controller: 'communityCtrl',
            onEnter:function(){
                console.log('enter community!');
            }
        })
        .state('test', {
            url: '/test',
            templateUrl: '/app/test',
            controller: 'testCtrl'
        })
        .state('createPerson', {
            url: '/createPerson',
            templateUrl: '/app/createPerson',
            controller: 'createPersonCtrl'
        })
        .state('incident', {
            url: '/incident',
            templateUrl: '/app/incident',
            controller:'incidentCtrl',
            onEnter:function(){
                console.log('enter incident');
            }
        });
});