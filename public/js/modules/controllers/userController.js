    angular.module('user',[
        'ngResource',
        'ngSanitize'])
    
    .config(['$routeProvider', function ($routeProvider){
        $routeProvider.when('/login', {templateUrl: '/home/login', controller: 'loginController'})
        .when('/recover', {templateUrl: '/home/recover', controller: 'loginController'})
        .when('/register', {templateUrl: '/home/register', controller: 'registerController'});
    }])

    .controller('loginController', function($scope, $sanitize, $location, Authenticate, $timeout, $window){
        $scope.form = {};
        $scope.flash = '';
        $scope.login = function(){
            $scope.isLoading = true;
            Authenticate.postParam({
                email: $sanitize($scope.form.email),
                password:$sanitize($scope.form.password)
            }, function(c, r){
                if(r == 401){
                    $location.path('/login');
                    $scope.isLoading = false;
                    $scope.flash = 'Wrong username / password';
                    $timeout(function(){
                        $scope.flash = '';
                    }, 7000);
                }else{
                    $window.location = '/dashboard';
                }
            });
        };
    })
    .controller('registerController', function($scope, $sanitize, $location, $http, $timeout){
        $scope.form = {};
        $scope.flash = '';
        $scope.isRegistered = false;
        $scope.signup = function(){
            $scope.isLoading = true;
            var regData = {
                email: $sanitize($scope.form.email),
                password: $sanitize($scope.form.password)
            };
            $http.post('/api/users', {param : $scope.form}).
            success(function(c){
                $scope.isRegistered = true;
            }).
            error(function(c) {
                $scope.isLoading = true;
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
    }).directive('validPasswordC',[function () {
    return {
        require: 'ngModel',
        link: function (scope, elem, attrs, ctrl) {
            var firstPassword = '#' + attrs.validPasswordC;
            elem.add(firstPassword).on('keyup', function () {
                scope.$apply(function () {
                    var v = elem.val()===$(firstPassword).val();
                    ctrl.$setValidity('pwmatch', v);
                });
            });
        }
    };
}]);