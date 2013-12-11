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
    /**
     * [thisUserFiles request for files belonging to this user]
     * @param  {[type]}   param
     * @param  {Function} callback
     * @return {[type]}
     */
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

    /**
     * [thisUserQueue request for this users uncompleted queue]
     * @param  {[type]}   param
     * @param  {Function} callback
     * @return {[type]}
     */
    a.thisUserQueue = function(param, callback){
      $http.get('/api/user/queue', param)
      .success(function(data, status){
          callback(data);
        })
      .error(function(data, status){
          console.log(data);
          callback(false);
        });
    };

    /**
     * [deleteThisFile deletes a file belonging to the user]
     * @param  {[type]}   ixid
     * @param  {Function} callback
     * @return {[type]}
     */
    a.deleteThisFile = function(ixid, callback){
      $http.delete('/api/user/files/'+ixid)
      .success(function(data, status){
        callback(data);
      })
      .error(function(data, status){

      });
    };

    /**
     * [removeFromQueue removes an upload from the queue]
     * @param  {[type]}   mid
     * @param  {Function} callback
     * @return {[type]}
     */
    a.removeFromQueue = function(mid, callback){
      $http.delete('/api/user/queue/'+mid)
      .success(function(data, success){
        callback();
      })
      .error(function(data, success) {
          /* Act on the event */
      });
    };

    /**
     * [updateTags updates tags belonging ]
     * @param  {[type]}   tags
     * @param  {Function} cb
     * @return {[type]}
     */
    a.updateTags = function(tags, file_id, cb){
      $http.put('/api/user/files/'+file_id+'/tags', {tags: tags})
      .success(function(d){

      })
      .error(function(d){

      });
    };

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
                  }else{
                      notfound = false;
                      self.filequeue[i].isQueued = 'true';
                      return true;
                  }
              });
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

      s.removeFromQueue = function(fileIdentifier){
          var position;
          _.some(this.filequeue, function(v ,i){
              //File is not on queue..
              if(v.identifier === fileIdentifier){
                  position = i;
                  return true;
              }
          });
          if(typeof(position) == 'number'){
              this.filequeue.splice(position, 1);
              this.broadcastItem();
          }
      };

      s.cancel = function(){
          this.filequeue.length = 0;
          this.broadcastItem();
      };

      s.broadcastItem = function() {
          $rootScope.$broadcast('onQueue');
      };

      return s;
  })
  .factory('Notification', function($rootScope, $timeout){
      var s = {};

      s.message = {
          heading: '',
          body: '',
          type: '',
          state:{},
          close: function(){
              this.state.overlay = '';
              this.state.dialog = '';
          }
      };

      s.notice = {
          message: '',
          icon: '',
          type: ''
      };

      s.resetNotification = function(){
          this.notice.message = '';
          this.notice.type = '';
          this.notice.icon ='';
          this.broadcastNotification();
      };
      
      //Opens a modal box
      s.notifier = function(m){
          var self =this;
          var icon = {
              'error' : 'fa-exclamation-triangle', 
              'success': 'fa-check',
              'info':'fa-info'
          }
          this.notice.message = m.message;
          this.notice.type = m.type;
          this.notice.icon = icon[m.type];
          this.broadcastNotification();

          $.smallBox({
              content: m.message,
              color: "#1ba1e2",
              icon: icon[m.type],
              timeout: 4000
          });             
      };

      //Subtle notifications esp when connections
      //to server fail
      s.modal = function(n){
          var state = {
              "success": {
                  "state": 'md-show',
                  "class": 'md-success',
                  "overlay": 'success-overlay'
              },
              "error":{
                  "state": 'md-show',
                  "class":'md-error',
                  "overlay": 'error-overlay'
              }
          }
          this.message.heading = n.heading;
          this.message.body = n.body;
          this.message.state.overlay = state[n.type].overlay;
          this.message.class= state[n.type].class;
          this.message.state.dialog= state[n.type].state;
          this.broadcastEvent();
      };

      s.broadcastNotification = function() {
          $rootScope.$broadcast('newNotification');
      };

      s.broadcastEvent = function(){
          $rootScope.$broadcast('newEvent');
      };
      return s;
  });