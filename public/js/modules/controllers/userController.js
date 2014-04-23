angular.module('user',[])

.config(['$stateProvider', function ($stateProvider){
    $stateProvider
    .state('login', {
        url: '/login',
        templateUrl: '/home/login', 
        controller: 'loginController'
    })
    .state('recover', {
        url: '/recover',
        templateUrl: '/home/recover', 
        controller: 'loginController'
    })
    .state('register', {
        url: '/register',
        templateUrl: '/home/register', 
        controller: 'registerController'
    });
}])
.controller('loginController', function($scope, $sanitize, $location, Authenticate, $timeout, $window){
    $scope.form = {};
    $scope.flash = '';
    $scope.login = function(){
        //return false;
        $scope.isLoading = true;
        Authenticate.postParam({
            email: $sanitize($scope.form.email),
            password:$sanitize($scope.form.password)
        })
        .then(function(r){
            if (r.status === 401 || r.status === 400){
                //$location.path('/login');
                $scope.isLoading = false;
                $scope.flash = 'Wrong username / password';
                $timeout(function(){
                    $scope.flash = '';
                }, 7000);
            } else if (r.status === 200) {
                $window.location = '/dashboard/#/dashboard';
            } else {
                $scope.isLoading = false;
                $scope.flash = 'Error Occured wit Authentication Request';
                $timeout(function(){
                    $scope.flash = '';
                }, 7000);
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
            username: $sanitize($scope.form.username),
            email: $sanitize($scope.form.email),
            password: $sanitize($scope.form.password)
        };
        $http.post('/api/internal/users', regData).
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
})
.factory('accountServices', ['$http', 'Notification', 'Language', function(http){
    var as = {};

    as.getUser = function(cb){
        http.get('/users/me')
        .success(function(d){
            cb(d);
        })
        .error(function(d){

        });
    }

    as.update = function(d, cb){
        http.put('/users/me/', d)
        .success(function(d){

        })
        .error(function(d){

        });
    };

    return as;
}])
.directive('validPasswordC',[function () {
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