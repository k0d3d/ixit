    angular.module('user',[
        'ngResource',
        'ngSanitize'])
    
    .config(['$routeProvider', function ($routeProvider){
        $routeProvider.when('/login', {templateUrl: '/home/login', controller: 'loginController'})
        .when('/recover', {templateUrl: '/home/recover', controller: 'loginController'})
        .when('/register', {templateUrl: '/home/register', controller: 'registerController'});
    }])

    .controller('loginController', function($scope, $sanitize, $location, Authenticate, $timeout){
        $scope.form = {};
        $scope.flash = '';
        $scope.login = function(){
            $scope.isLoading = true;
            Authenticate.postParam({
                email: $sanitize($scope.form.email),
                password:$sanitize($scope.form.password)
            }, function(c){
                $scope.isLoading = false;
                $scope.flash = c.mssg;
                $timeout(function(){
                    $scope.flash = '';
                }, 7000);
            });
        };
    })
    .controller('registerController', function($scope, $sanitize, $location, $http, $timeout){
        $scope.form = {};
        $scope.flash = '';
        $scope.signup = function(){
            $scope.isLoading = true;
            var regData = {
                email: $sanitize($scope.form.email),
                password: $sanitize($scope.form.password)
            };
            $http.post('/api/users', {param : $scope.form}).
            success(function(c){
            }).
            error(function(c) {
                $scope.isLoading = false;
                $scope.flash = c.errors.message;
                angular.forEach(c.errors.errors, function(value, key){
                    $scope.registration_form[key].$error.taken = true;
                    $scope.registration_form[key].$invalid = true;
                });
                $timeout(function(){
                    $scope.flash = '';
                }, 7000);
            });
        };
    }).directive('validPasswordC', function () {
        return {
            require: 'ngModel',
            link: function (scope, elm, attrs, ctrl) {
                ctrl.$parsers.unshift(function (viewValue, $scope) {
                    var noMatch = viewValue != scope.registration_form.password.$viewValue;
                    ctrl.$setValidity('noMatch', !noMatch);
                });
            }
        };
    });