
/**
 * Home Module
 */
angular.module('directives',[]);

var appDirective =  angular.module('directives');

appDirective.directive('dragover', function dragover(){
  return {
    link: function(scope, element, attrs){
      element.on('dragover dragenter', function(){
        $(attrs.dragover).show();
      });
      element.on('dragleave', function(){
        $(attrs.dragover).hide();
      });
    }
  };
});

appDirective.directive('dndevts', ['$document', function($document) {
    return {
      compile: function(element, attrs) {
        console.log(element);
        $($document).on('dragenter dragover', element, function () {
          console.log('dragover and enter');
          $('#dropbox .accodion-pane').removeClass('empty').addClass('hover-box');
        });

        $($document).on('dragleave', element, function () {
          console.log('dragleave');
          $('#dropbox .accodion-pane').removeClass('hover-box').addClass('empty');
        });

        $($document).on('drop', element, function (event) {
          $('#dropbox .accodion-pane').removeClass('hover-box').addClass('empty');
        });
      }
    };
  }]);

appDirective.directive('scrollBar', function scrollBar (){
  return {
    link: function(scope, element, attrs){
      scope.$watch(function () {
        var elTop = $(element).offset().top, wrapHeight = $('#wrap').height();
        if ((wrapHeight - elTop) < wrapHeight) {
          $(element).slimScroll({
            height: wrapHeight - elTop + 'px'
          });
        }

      });
    }
  };
});

appDirective.directive('queueTip', function queueTip (){
  return {
    link: function(scope, element, attrs){
      element.tooltip({
        title: 'This upload will be resumed'
      });
    }
  }
});

appDirective.directive('loading', function loading (){
  return {
    link: link,

  }
});

appDirective.directive('profilephoto', function profilephoto (){
  function link(scope, element, attrs){
    element.on('click', function(e){
      e.preventDefault();
      $('.p-ph-h-i').click();
      var r = new Resumable({
        target:'/user/account/photo',
        chunkSize:1*1024*1024,
        simultaneousUploads:1,
        testChunks:false,
        maxFiles: 1,
        fileParameterName : 'pp'
      });
          // Show a place for dropping/selecting files
          r.assignBrowse($('.p-ph-h-i')[0]);
          // Handle file add event
          r.on('fileAdded', function(file){
            r.upload();
          });
        });
    element.on('mouseover', function(e){
      $(this).after('<span class="label label-default animated fadeInUp">Click to change</span>');
    });
    element.on('mouseout mouseleave', function(e){
      element.next('span.label').remove();
    })
  }
  return {
    restrict: 'EA',
    link: link,
  }
});
appDirective.directive('tagsInput', ['Keeper', function tagsInput (K){
  function link (scope, element, attrs){

    $(element).tagsInput();
    scope.$watch(attrs.ngModel, function(n, o){
      if(_.isUndefined(n)) return false;
      $(element).importTags(n);
    });
    var id = $(element).attr('id');
    $('#'+id+'_tag').on('focusout', function(e){
      var tgs = $(element).val();
      if(tgs.length === 0) return false;
      var file_id = attrs.ixid;
      K.updateTags(tgs, file_id, function(){

      });
    });
  }
  return {
    link:link
  }
}]);
appDirective.directive('dropdownHover', function dropdownHover (){
  function link (scope, element, attrs){
    $(element).dropdownHover();
  }
  return {
    link:link
  }
});
appDirective.directive('activateTab', function activateTab ($timeout){
  function link(scope, element, attrs){
    if(scope.$last === true){
      $timeout(function(){
        //using the length so we can activate the last tab
        var lnt = scope.cabinetTabs.length - 1;
        var lastTab = scope.cabinetTabs[lnt].id;
        $('a.title[data-target="#'+lastTab+'"]').tab('show');
      });
    }
  }
  return {
    link: link
  }
})
appDirective.directive('folderTabs', function folderTabs (){
  function link(scope, element, attrs){

    // scope.$watch('cabinetTabs', function(n){
    //   console.log(n);
    //   if(_.isEmpty(n)) return false;
    //   // //using the length so we can activate the last tab
    //   // var lnt = scope.cabinetTabs.length - 1;
    //   // var lastTab = scope.cabinetTabs[lnt].id;
    //   // console.log(lastTab);
    //   // $('a.title[data-target="#'+lastTab+'"]').tab('show');
    // });
}
return {
  link: link,
  templateUrl: '/templates/cabinet-tabs-tpl.jade'
}
});
appDirective.directive('notification', ['$timeout', function notification ($timeout){
  function link(scope, element, attrs){
    scope.notes = []
    scope.$watch('notices', function(n){
      if(!_.isEmpty(n)) _queueNote(n);
    });
    function _queueNote(n){
      scope.notes.push(n);
      //Close the notification after 3 secs
      $timeout(function(){
        scope.close_note(0);
      }, 10000);
    };
  }
  function NoticeCtrl ($scope){
    //Close an alert
    $scope.close_note = function(index){
      $scope.notes.splice(index, 1);
    };
    // //Execute the acceptance function
    // $scope.exec_yes = function(index){
    //   scope.notes[index].exec();
    // };
  }
  return {
    link: link,
    templateUrl: '/templates/notice-alert-tpl',
    scope:{
      notices: '=notification'
    },
    controller: NoticeCtrl
  }
}]);

/**
 * show the prompt dialog for user feed back.
 * For instance, if a user clicks the delete folder button,
 * the controller, initiates the prompt service by calling
 * e.g. AlertService.set_prompt(n), where n is an object with
 * type, heading, mesage and exec properties.
 * @return {[type]} [description]
 */
appDirective.directive('prompt', [function prompt(){

  function _close (index, arr) {

    arr.splice(index, 1);
  }

  function link(scope, element, attrs){
    scope.a_p = [];
    // scope.$watch watches the prompts scope
    // for any change in and
    scope.$watch('prompts', function(n){

      if(!_.isEmpty(n)){
        _queueAlert(n);
      }
    });
    function _queueAlert(n){
      scope.a_p.push(n);
    }
  }

  function AlertCtrl ($scope){
    //Close an alert
    $scope.close_an = function(index){
      _close(index, $scope.a_p);
    };
    //Execute the acceptance function
    $scope.exec_yes = function(index){
      $scope.a_p[index].exec();
      _close(index, $scope.a_p);
      // $scope.a_p.splice(index, 1);
    };
  }
  return {
    link: link,
    templateUrl: '/templates/prompt-alert-tpl',
    scope:{
      prompts: '=prompt'
    },
    controller: AlertCtrl
  }
}]);