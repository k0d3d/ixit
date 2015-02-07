angular.module("flow.provider",[]).provider("flowFactory",function(){"use strict";this.defaults={},this.factory=function(options){return new Flow(options)},this.events=[],this.on=function(event,callback){this.events.push([event,callback])},this.$get=function(){var fn=this.factory,defaults=this.defaults,events=this.events;return{create:function(opts){var flow=fn(angular.extend({},defaults,opts));return angular.forEach(events,function(event){flow.on(event[0],event[1])}),flow}}}}),angular.module("flow.init",["flow.provider"]).controller("flowCtrl",["$scope","$attrs","$parse","flowFactory","$rootScope","$cookies",function($scope,$attrs,$parse,flowFactory,$rootScope,$cookies){function __initFlowOptions(){var flow=$scope.$eval($attrs.flowObject)||flowFactory.create(options);flow.on("catchAll",function(eventName){var args=Array.prototype.slice.call(arguments);args.shift();var event=$scope.$broadcast.apply($scope,["flow::"+eventName,flow].concat(args));return{progress:1,filesSubmitted:1,fileSuccess:1,fileError:1,complete:1}[eventName]&&$scope.$apply(),event.defaultPrevented?!1:void 0}),$scope.$flow=flow,$attrs.hasOwnProperty("flowName")&&($parse($attrs.flowName).assign($scope,flow),$scope.$on("$destroy",function(){$parse($attrs.flowName).assign($scope)}))}var options=angular.extend({generateUniqueIdentifier:function(file){return $cookies["ixid-anon-session"]+"_"+file.name+"_"+file.size+"_"+file.type}},$scope.$eval($attrs.flowInit));$scope.$watch("currentFolder",function(n){n&&($scope.$flow.opts.query={folder:$scope.currentFolder,"x-Authr":$scope.cuser})}),$scope.$watch("$flow.files.length",function(n){n&&($scope.$flow.opts.headers={"dkeep-agent-id-token":$rootScope.dkeepToken})}),__initFlowOptions(options)}]).directive("flowInit",[function(){return{scope:!0,controller:"flowCtrl"}}]),angular.module("flow.btn",["flow.init"]).directive("flowBtn",[function(){return{restrict:"EA",scope:!1,require:"^flowInit",link:function(scope,element,attrs){var isDirectory=attrs.hasOwnProperty("flowDirectory"),isSingleFile=attrs.hasOwnProperty("flowSingleFile"),inputAttrs=attrs.hasOwnProperty("flowAttrs")&&scope.$eval(attrs.flowAttrs);scope.$flow.assignBrowse(element,isDirectory,isSingleFile,inputAttrs)}}}]),angular.module("flow.dragEvents",["flow.init"]).directive("flowPreventDrop",function(){return{scope:!1,link:function(scope,element){element.bind("drop dragover",function(event){event.preventDefault()})}}}).directive("flowDragEnter",["$timeout",function($timeout){return{scope:!1,link:function(scope,element,attrs){function isFileDrag(dragEvent){var fileDrag=!1,dataTransfer=dragEvent.dataTransfer||dragEvent.originalEvent.dataTransfer;return angular.forEach(dataTransfer&&dataTransfer.types,function(val){"Files"===val&&(fileDrag=!0)}),fileDrag}var promise,enter=!1;element.bind("dragover",function(event){isFileDrag(event)&&(enter||(scope.$apply(attrs.flowDragEnter),enter=!0),$timeout.cancel(promise),event.preventDefault())}),element.bind("dragleave drop",function(){promise=$timeout(function(){scope.$eval(attrs.flowDragLeave),promise=null,enter=!1},100)})}}}]),angular.module("flow.drop",["flow.init"]).directive("flowDrop",function(){return{scope:!1,require:"^flowInit",link:function(scope,element,attrs){function assignDrop(){scope.$flow.assignDrop(element)}function unAssignDrop(){scope.$flow.unAssignDrop(element)}attrs.flowDropEnabled?scope.$watch(attrs.flowDropEnabled,function(value){value?assignDrop():unAssignDrop()}):assignDrop()}}}),!function(angular){"use strict";function capitaliseFirstLetter(string){return string.charAt(0).toUpperCase()+string.slice(1)}var module=angular.module("flow.events",["flow.init"]),events={fileSuccess:["$file","$message"],fileProgress:["$file"],fileAdded:["$file","$event"],filesAdded:["$files","$event"],filesSubmitted:["$files","$event"],fileRetry:["$file"],fileError:["$file","$message"],uploadStart:[],complete:[],progress:[],error:["$message","$file"]};angular.forEach(events,function(eventArgs,eventName){var name="flow"+capitaliseFirstLetter(eventName);"flowUploadStart"==name&&(name="flowUploadStarted"),module.directive(name,[function(){return{require:"^flowInit",controller:["$scope","$attrs",function($scope,$attrs){$scope.$on("flow::"+eventName,function(){var funcArgs=Array.prototype.slice.call(arguments),event=funcArgs.shift();if($scope.$flow===funcArgs.shift()){var args={};angular.forEach(eventArgs,function(value,key){args[value]=funcArgs[key]}),$scope.$eval($attrs[name],args)===!1&&event.preventDefault()}})}]}}])})}(angular),angular.module("flow.img",["flow.init"]).directive("flowImg",[function(){return{scope:!1,require:"^flowInit",link:function(scope,element,attrs){var file=attrs.flowImg;scope.$watch(file,function(file){if(file){var fileReader=new FileReader;fileReader.readAsDataURL(file.file),fileReader.onload=function(event){scope.$apply(function(){attrs.$set("src",event.target.result)})}}})}}}]),angular.module("flow.transfers",["flow.init"]).directive("flowTransfers",[function(){return{scope:!0,require:"^flowInit",link:function(scope){scope.transfers=scope.$flow.files}}}]),angular.module("flow",["flow.provider","flow.init","flow.events","flow.btn","flow.drop","flow.transfers","flow.img","flow.dragEvents"]);var app=angular.module("ixitApp",["ui.router","flow","language","home","user","services","ngSanitize","ngCookies","Orbicular"]);app.config(function($stateProvider,$urlRouterProvider,flowFactoryProvider,$httpProvider){flowFactoryProvider.defaults={target:"http://127.0.0.1:3001/upload",simultaneousUploads:1,permanentErrors:[500,501],chunkRetryInterval:2e3},flowFactoryProvider.on("fileSuccess",function(file,message){if(message.indexOf("ixid")<0)return file.error=!0,!1;var o=JSON.parse(message);file.ixid=o.ixid}),flowFactoryProvider.on("fileError",function(file){file.status="Retry now"}),flowFactoryProvider.on("fileRetry",function(file){file.status="retrying..."}),$urlRouterProvider.otherwise("/home"),$httpProvider.interceptors.push("httpInterceptor")}),app.controller("MainController",["$scope","$http","$location","$rootScope","$cookies","$timeout","$interval",function($scope,$http,$location,$rootScope,$cookies,$timeout,$interval){$scope.cuser=$cookies.throne,$scope.clickBrowse=function(){$(".browsefiles").click()},$scope.$on("$destroy",function(){$(window).off("resize.bnViewport")}),$scope.$on("flow::fileError",function(event,flow,file){file.retryInterval=5;var retryInterval=$interval(function(){--file.retryInterval},1e3),retryUpload=$timeout(function(){file.retry(),$interval.cancel(retryInterval)},5e3);$scope.$on("$destroy",function(){console.log("timeout cleaned"),$timeout.cancel(retryUpload)})}),$scope.$on("flow::fileRetry",function(){})}]),app.factory("httpInterceptor",["$rootScope",function($rootScope){return{response:function(response){return $rootScope.dkeepToken=response.headers()["dkeep-agent-id-token"],response}}}]),app.directive("dndevts",["$document",function($document){return{compile:function(element){$($document).on("dragover dragenter",element,function(e){e.preventDefault(),$(".drag-notice-element").addClass("drag-hover")}),$($document).on("dragleave",element,function(e){e.preventDefault(),$(".drag-notice-element").removeClass("drag-hover")}),$($document).on("drop",element,function(e){e.preventDefault(),$(".drag-notice-element").removeClass("drag-hover")})}}}]),app.directive("uploadListItem",[function(){return{link:function(){},templateUrl:"templates/li_upload_item",controller:function($scope){$scope.pauseOrResume=function(file){return file.isUploading()?file.pause():file.isComplete()?!1:file.resume()},$scope._formatFileSize=function(bytes){return"number"!=typeof bytes?"":bytes>=1e9?(bytes/1e9).toFixed(2)+" GB":bytes>=1e6?(bytes/1e6).toFixed(2)+" MB":(bytes/1e3).toFixed(2)+" KB"},$scope._formatBitrate=function(bits){return"number"!=typeof bits?"":bits>=1e9?(bits/1e9).toFixed(2)+" Gbit/s":bits>=1e6?(bits/1e6).toFixed(2)+" Mbit/s":bits>=1e3?(bits/1e3).toFixed(2)+" kbit/s":bits.toFixed(2)+" bit/s"}}}}]),angular.module("home",[]).config(["$stateProvider",function($stateProvider){$stateProvider.state("home",{url:"/home",templateUrl:"/home/index",controller:"homeIndexController"})}]).controller("homeIndexController",function(){}),angular.module("user",[]).config(["$stateProvider",function($stateProvider){$stateProvider.state("login",{url:"/login",templateUrl:"/home/login",controller:"loginController"}).state("recover",{url:"/recover",templateUrl:"/home/recover",controller:"loginController"}).state("register",{url:"/register",templateUrl:"/home/register",controller:"registerController"})}]).controller("loginController",function($scope,$sanitize,$location,Authenticate,$timeout,$window){$scope.form={},$scope.flash="",$scope.login=function(){$scope.isLoading=!0,Authenticate.postParam({email:$sanitize($scope.form.email),password:$sanitize($scope.form.password)}).then(function(r){401===r.status||400===r.status?($scope.isLoading=!1,$scope.flash="Wrong username / password",$timeout(function(){$scope.flash=""},7e3)):200===r.status?$window.location=r.data.returnTo:($scope.isLoading=!1,$scope.flash="An Error Occured with the Authentication Request",$timeout(function(){$scope.flash=""},7e3))})}}).controller("registerController",function($scope,$sanitize,$location,$http,$timeout){$scope.form={},$scope.flash="",$scope.isRegistered=!1,$scope.signup=function(){$scope.isLoading=!0;var regData={username:$sanitize($scope.form.username),email:$sanitize($scope.form.email),password:$sanitize($scope.form.password)};$http.post("/api/internal/users",regData).success(function(){$scope.isRegistered=!0}).error(function(c){$scope.isLoading=!0,$scope.flash=c.errors.message,angular.forEach(c.errors.errors,function(value,key){$scope.registration_form[key].$error.taken=!0,$scope.registration_form[key].$invalid=!0}),$timeout(function(){$scope.flash=""},7e3)})}}).factory("accountServices",["$http","Notification","Language",function(http){var as={};return as.getUser=function(cb){http.get("/users/me").success(function(d){cb(d)}).error(function(){})},as.update=function(d){http.put("/users/me/",d).success(function(){}).error(function(){})},as}]).directive("validPasswordC",[function(){return{require:"ngModel",link:function(scope,elem,attrs,ctrl){var firstPassword="#"+attrs.validPasswordC;elem.add(firstPassword).on("keyup",function(){scope.$apply(function(){var v=elem.val()===$(firstPassword).val();ctrl.$setValidity("pwmatch",v)})})}}}]),angular.module("services",[]).factory("Authenticate",function($http){var a={};return a.postParam=function(loginParams){return $http.post("/api/internal/users/session",loginParams).then(function(d){return d},function(e){return e})},a.logout=function(){},a.getApiKey=function(cb){$http.get("/users/developer/apikey").success(function(data){cb(data)}).error(function(){})},a}).factory("Keeper",["$http","Alert","$rootScope","$cookies",function($http,Alert,$rootScope,$cookies){var a={};return a.currentFolder="",a.currentUser=$cookies.throne,a.dkeepToken="",a.path=[],a.addToCrumb=function(ob){a.path.push(ob),$rootScope.$broadcast("refresh_breadcrumb")},a.openFolder=function(folderParam){return $http.get("/api/internal/users/folder?"+$.param(folderParam)).then(function(list){return"home"!==folderParam.fid?a.addToCrumb({id:list.data.props.fid,name:list.data.props.name}):$rootScope.$broadcast("refresh_breadcrumb"),a.currentFolder=list.data.props.fid,$rootScope.$broadcast("folder_change"),list.data})},a.createSubFolder=function(name,parentId,cb){$http.post("/api/internal/users/folder",{name:name,parentId:parentId,type:"sub"}).success(function(r){cb(r)}).error(function(err){Alert.set_notice({message:err,type:"danger"})})},a.thisUserFiles=function(param,callback){$http.get("/api/internal/users/files",param).success(function(data){callback(data)}).error(function(data){console.log(data),callback(!1)})},a.thisUserQueue=function(param,callback){$http.get("/api/internal/users/queue",param).success(function(data){callback(data)}).error(function(data){console.log(data),callback(!1)})},a.deleteThisFile=function(ixid,callback){$http.delete("/api/internal/users/files/"+ixid).success(function(data){callback(data)}).error(function(){})},a.deleteThisFolder=function(folderId,callback){$http.delete("/api/internal/users/folder/"+folderId).success(function(data){callback(data)}).error(function(){})},a.removeFromQueue=function(mid,callback){$http.delete("/api/internal/users/queue/"+mid).success(function(){callback()}).error(function(){})},a.updateTags=function(tags,file_id){$http.put("/api/internal/users/files/"+file_id+"/tags",{tags:tags}).success(function(){}).error(function(){})},a.search=function(query,cb){$http.get("/api/search/"+query).success(function(d){cb(d)}).error(function(){})},a.makeFolder=function(){},a}]).factory("Sharer",function($rootScope){function isExistingFile(q,file){return q.identifier===file.uniqueIdentifier?!0:!1}var s={};return s.filequeue=[],s.warning=0,s.queue=function(r){this.filequeue.push(r),this.filequeue=_.flatten(this.filequeue),this.broadcastItem()},s.addToQueue=function(file){var self=this,notfound=!0,l=this.filequeue.length;l>0?(_.some(this.filequeue,function(v,i){return isExistingFile(v,file)?(notfound=!1,self.filequeue[i].isQueued="true",!0):void 0}),notfound===!0&&self.queue({filename:file.fileName,size:file.size,identifier:file.uniqueIdentifier})):this.queue({filename:file.fileName,size:file.size,identifier:file.uniqueIdentifier})},s.removeFromQueue=function(fileIdentifier){var position;_.some(this.filequeue,function(v,i){return v.identifier===fileIdentifier?(position=i,!0):void 0}),"number"==typeof position&&(this.filequeue.splice(position,1),this.broadcastItem())},s.cancel=function(){this.filequeue.length=0,this.broadcastItem()},s.broadcastItem=function(){$rootScope.$broadcast("onQueue")},s}).factory("Alert",["$rootScope","Language",function($rootScope,L){var s={},__state={success:{"class":"x-alert-success"},info:{"class":"x-alert-info"},danger:{"class":"x-alert-danger",heading:L.eng.error,icon:"fa-warning"}};return s.prompts=null,s.notes=null,s.set_prompt=function(n){this.prompts=n,this.prompts.heading=n.heading||"Are you sure",this.prompts.class=__state[n.type].class,this.prompts.icon=n.icon||__state[n.type].icon,this.broadcastPrompt()},s.set_notice=function(n){this.notes=n,this.notes.class=__state[n.type].class,this.notes.heading=__state[n.type].heading,this.notes.icon=__state[n.type].icon,this.broadcastNotice()},s.broadcastPrompt=function(){$rootScope.$broadcast("newPrompt")},s.broadcastNotice=function(){$rootScope.$broadcast("newNotice")},s}]).factory("Tabs",["$rootScope",function($rootScope){var s={};return s.tabs=[],s.tab=null,s.createTab=function(n){this.tab=n,this.reTab()},s.reloadTab=function(content){this.tab=content,this._reloadTab()},s._reloadTab=function(){$rootScope.$broadcast("reloadTab")},s.reTab=function(){$rootScope.$broadcast("newTab")},s.closeTab=function(){},s}]),angular.module("directives",[]);var appDirective=angular.module("directives");appDirective.directive("dragover",function(){return{link:function(scope,element,attrs){element.on("dragover dragenter",function(){$(attrs.dragover).show()}),element.on("dragleave",function(){$(attrs.dragover).hide()})}}}),appDirective.directive("dndevts",["$document",function($document){return{compile:function(element){console.log(element),$($document).on("dragenter dragover",element,function(){console.log("dragover and enter"),$("#dropbox .accodion-pane").removeClass("empty").addClass("hover-box")}),$($document).on("dragleave",element,function(){console.log("dragleave"),$("#dropbox .accodion-pane").removeClass("hover-box").addClass("empty")}),$($document).on("drop",element,function(){$("#dropbox .accodion-pane").removeClass("hover-box").addClass("empty")})}}}]),appDirective.directive("scrollBar",function(){return{link:function(scope,element){scope.$watch(function(){var elTop=$(element).offset().top,wrapHeight=$("#wrap").height();wrapHeight>wrapHeight-elTop&&$(element).slimScroll({height:wrapHeight-elTop+"px"})})}}}),appDirective.directive("queueTip",function(){return{link:function(scope,element){element.tooltip({title:"This upload will be resumed"})}}}),appDirective.directive("loading",function(){return{link:link}}),appDirective.directive("profilephoto",function(){function link(scope,element){element.on("click",function(e){e.preventDefault(),$(".p-ph-h-i").click();var r=new Resumable({target:"/user/account/photo",chunkSize:1048576,simultaneousUploads:1,testChunks:!1,maxFiles:1,fileParameterName:"pp"});r.assignBrowse($(".p-ph-h-i")[0]),r.on("fileAdded",function(){r.upload()})}),element.on("mouseover",function(){$(this).after('<span class="label label-default animated fadeInUp">Click to change</span>')}),element.on("mouseout mouseleave",function(){element.next("span.label").remove()})}return{restrict:"EA",link:link}}),appDirective.directive("tagsInput",["Keeper",function(K){function link(scope,element,attrs){$(element).tagsInput(),scope.$watch(attrs.ngModel,function(n){return _.isUndefined(n)?!1:void $(element).importTags(n)});var id=$(element).attr("id");$("#"+id+"_tag").on("focusout",function(){var tgs=$(element).val();if(0===tgs.length)return!1;var file_id=attrs.ixid;K.updateTags(tgs,file_id,function(){})})}return{link:link}}]),appDirective.directive("dropdownHover",function(){function link(scope,element){$(element).dropdownHover()}return{link:link}}),appDirective.directive("activateTab",function($timeout){function link(scope){scope.$last===!0&&$timeout(function(){var lnt=scope.cabinetTabs.length-1,lastTab=scope.cabinetTabs[lnt].id;$('a.title[data-target="#'+lastTab+'"]').tab("show")})}return{link:link}}),appDirective.directive("folderTabs",function(){function link(){}return{link:link,templateUrl:"/templates/cabinet-tabs-tpl.jade"}}),appDirective.directive("notification",["$timeout",function($timeout){function link(scope){function _queueNote(n){scope.notes.push(n),$timeout(function(){scope.close_note(0)},1e4)}scope.notes=[],scope.$watch("notices",function(n){_.isEmpty(n)||_queueNote(n)})}function NoticeCtrl($scope){$scope.close_note=function(index){$scope.notes.splice(index,1)}}return{link:link,templateUrl:"/templates/notice-alert-tpl",scope:{notices:"=notification"},controller:NoticeCtrl}}]),appDirective.directive("prompt",[function(){function _close(index,arr){arr.splice(index,1)}function link(scope){function _queueAlert(n){scope.a_p.push(n)}scope.a_p=[],scope.$watch("prompts",function(n){_.isEmpty(n)||_queueAlert(n)})}function AlertCtrl($scope){$scope.close_an=function(index){_close(index,$scope.a_p)},$scope.exec_yes=function(index){$scope.a_p[index].exec(),_close(index,$scope.a_p)}}return{link:link,templateUrl:"/templates/prompt-alert-tpl",scope:{prompts:"=prompt"},controller:AlertCtrl}}]),angular.module("filters",[]),angular.module("language",[]).constant("Language",{eng:{error:"Yikes",success:"Yippie",info:"Hmmn"}});