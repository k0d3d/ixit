    /**
     * Home Module
     */
    angular.module('home',[
        'ngResource',
        'ngSanitize',
        ])

    .config(['$routeProvider', function ($routeProvider){
        $routeProvider.when('/', {templateUrl: '/home/index', controller: 'itemIndexController'});
    }])
    .controller('initController', function($scope){

    })
    .controller('itemIndexController', function($scope){
        function init(){
            ich.grabTemplates();
        }
        init();
    });
    
