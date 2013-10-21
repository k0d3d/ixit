//services.js
angular.module('ixitApp')
    .factory('Authenticate', function($http){
        var a = {};

        a.postParam = function(loginParams, callback){
            $http.post('/api/users/session', loginParams)
            .success(callback)
            .error(callback);
        };

        return a;
    })
    .factory('Keeper', function($http){
        var a = {};

        a.thisUserFiles = function(param, callback){
            $http.get('/api/user/files', param)
            .success(function(data, status){
                callback(data);
            })
            .error(function(data, status){
                console.log(data);
                callback(false);
            });
        };

        a.thisUserQueue = function(param, callback){
            $http.get('/api/user/queue', param)
            .success(function(data, status){
                callback(data);
            })
            .error(function(data, status){
                console.log(data);
                callback(false);
            });
        }
        return a;
    })
    .factory('Sharer', function($rootScope){
        var s = {};

        s.filequeue = [];

        s.warning = 0;

        s.queue = function(r){
            this.filequeue.push(r);
            this.filequeue = _.flatten(this.filequeue);
            this.broadcastItem();
        };

        function isExistingFile(q, file){
            if(q.identifier === file.uniqueIdentifier){
                //Return False so file isnt added to queue
                return true;
            }else{
                return false;
            }
        }

        s.addToQueue = function(file){
            var add;
            var self = this;
            var notfound = true;
            var l = this.filequeue.length;
            if( l > 0){
                this.filequeue
                _.some(this.filequeue, function(v, i){
                    //File is not on queue..
                    if(!isExistingFile(v, file)){
                        console.log('not');
                    }else{
                        console.log('does');
                        notfound = false;
                        self.filequeue[i].isQueued = 'true';
                        return true;
                    }
                });
                console.log('Darnn');
                if(notfound === true){
                    self.queue({
                        filename: file.fileName,
                        size: file.size,
                        identifier: file.uniqueIdentifier
                    });
                }
            }else{
                this.queue({
                    filename: file.fileName,
                    size: file.size,
                    identifier: file.uniqueIdentifier
                });
            }
        };

        s.broadcastItem = function() {
            $rootScope.$broadcast('onQueue');
        };

        return s;
    });