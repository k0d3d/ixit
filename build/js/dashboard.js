	function attachmode(node,attachby,data){
		switch(attachby){
			case 'next':
				$(data).insertAfter(node+' tr:last-child');
				break;
			case 'previous':
				$(data).insertBefore(node+' tr:first-child');
				break;
			default:
				$(node).append(data);
			break;
		}		
	}
	function getStats(){
		$.ajax({
			type:'GET',
			url: '/dashboard/getStats',
			data: 'which=all',
			success: function(jno){
				//jno = $.parseJSON(jsn);
				$('.stats').each(function(index){
					var id = $(this).attr('id');
					$('#'+id).text(jno[id]);
				})
			}
		});
	}
	function callNotice(msg,nClass,type){
		$('#noticebar').html("<div class='nNote'></div>");
		g = {
				"credUpdate":"Your account has been updated.",
				"displayname" : "Your display name has been changed."

				}
		lang = g[type];
		var msgHtml = '<p>'+lang+'</p>';		
		$('.nNote').addClass(nClass).html(msgHtml);
		
	}
	function getLinks(lsdate,fstdate,attachby){
		$.ajax({
			type:'GET',
			url: '/dashboard/pc_user_links',
		    data: 'l='+lsdate+'&f='+fstdate,			
			success: function(j){
				if(j.task == 'noLinks'){
					Messenger().post({
					  message: 'We found no new links.',
					  type: 'info',
					  showCloseButton: true
					});	
					return false;				
				}
				var i = -1;
				var l = '#mylinks';
				$(l+' ul.pager .previous').data('firstdate',j.payload[0]['created']);				
				$.each(j.payload,function(index,value){
					i++;
					$(l+' ul.pager .next').data('lastdate',j.payload[index]['created']);														
					var da = moment(value.created,"YYYY-MM-DD HH:mm:ss");
		    		value['date'] =	 da.calendar();
		    		var k = moment(value.created,"YYYY-MM-DD HH:mm:ss");					
		    		value.created = k.fromNow();
		    		var htmlData = ich.pcUserLinks(value,true);
		    		attachmode(l+' tbody',attachby,htmlData);
					$('.tipS').tooltip();
				});
				//$('#mylinks').dataTable();
			}
		});
	}
	function getShares(lsdate,fstdate,attachby){
		$.ajax({	
		    url: "/dashboard/pc_get_downloads",	
		    type: "GET",
		    data: 'l='+lsdate+'&f='+fstdate,			
		    success: function (j){ 
				if(j.task == 'noLinks'){
					Messenger().post({
					  message: 'We found no new links.',
					  type: 'info',
					  showCloseButton: true
					});	
					return false;				
				}		    	
		    	var i = -1;
		    	var l = '#sharedlinks';
				$(l+' ul.pager .previous').data('firstdate',j.payload[0]['created']);		    	
		    	$.each(j.payload,function(index,value){
					i++;
					$(l+' ul.pager .next').data('lastdate',j.payload[index]['created']);		    			    						
					var da = moment(value.created,"YYYY-MM-DD HH:mm:ss");
		    		value['date'] =	 da.calendar();		    		
		    		var k = moment(value.created,"YYYY-MM-DD HH:mm:ss");					
		    		value.created = k.fromNow();
		    		var htmlData = ich.pcDownloads(value,true);
		    		attachmode(l+' tbody',attachby,htmlData);
		    		$('.tipS').tooltip();
		    	});
		    	//$('#sharedlinks').dataTable();
		    }
		})		
	}
	function refresh(lasttime){

	}

function getDomain(url) {
    return url.match(/:\/\/(www\.)?(.[^/:]+)/)[2];
} 

	$(document).ready(function(){
		getStats();
		getLinks();
		getShares();
	    $('.emailBtn').on('click',function(){
	        var to = $('input#emailInput').val();
	    	var mssg = $('#textarea').text();
	    	var subject = $('#message_subject').val();
	    	$.ajax({
	    		url: "/home/mailOut",
	    		type: "POST",
	    		data: "to="+to+"&mssg="+mssg+"&subject="+subject,
	    		success: function (stmsg){
	    			if(stmsg.task == 'mailsent'){
		    			Messenger().post({
						  message: 'You file has been emailed',
						  type: 'success',
						  showCloseButton: true
						});
						$('#sharesDialog').modal('toggle');
	    			}
	    		} 
	    	});
	    });		
		$(document).on('click','.sharebtn',function(e){
			var t = $(this).parents('tr');
			$('#message_subject').val(t.find('.content-name').text());
			var ixid = t.data('ixid');
			$('#ixInput').val(ixid);
			$('#textarea').text('Hello, this is the download link for the file. http://i-x.me/'+ixid);
			e.preventDefault();
		});
		$('#sayBrowse').click(function(e){
			$('#browsefield').click();
			e.preventDefault();	
		});
		$('#ppBtn').click(function(e){
			$('.user img').removeClass('animated flipInY');				
			$('#ppinput').click();
			e.preventDefault();	
		});	
		$('#sayPaste').click(function(e){
			$('#urlInputDialog').modal("toggle");
			e.preventDefault();
		});
		$('.btn-close').click(function(e){
			$(this).parents('.modal').modal('hide');
		});
        $('#credSubmit').bind('click',function(){
            var rFn = $('input#displaynametext').val();
            if($('input#passwordtext').val() !== ""){
            	var rPw = hex_sha512($('input#passwordtext').val());            	
            }else{
            	var rPw = "";
            }

			Messenger().run({
				successMessage: 'Yippie, account changes saved.',
				errorMessage: 'We could not update your account, please try again.',
				progressMessage: 'Sending account update request.'
			}, {
                url: "/gateman/updateAccount",
                type: "POST",
                data: "displayname="+rFn+"&greenleaves="+rPw,
                success: function (stmsg){
                }
			});            
            return false;
        }); 
        $('.btn-save-link').bind('click',function(e){
			//URL Shrinker
			var us = $('#urlShrinker').val();		
			Messenger().run({
				successMessage: 'Your link has been saved',
				errorMessage: 'Sorry, We couldnt save your link, please try again.',
				progressMessage: 'Saving your link'
			}, {
	    		url: "/home/insertData",
	    		type: "POST",
	    		data: "content="+us,
	    		success: function (stmsg){
	   				$('#urlInputDialog').modal('hide');
	   				getStats();
	    		}
			});	    								    		    							
        });
        $('ul.pager li').bind('click',function(e){
        	var table = $(this).parents('.tab-pane');
        	var lsdate = $(this).data('lastdate')|| '';
        	var fstdate = $(this).data('firstdate') || '';
        	switch(table.attr('id')){
        		case 'mylinks':
        			getLinks(lsdate,fstdate,$(this).attr('class'));
        			break;
        		case 'sharedlinks':
        			getShares(lsdate,fstdate,$(this).attr('class'));
        			break;
        		default:
        		break;
        	}
        	e.preventDefault();
        	return false;
        });
        $(document).on('click','a.clip-btn',function(e){
        	var clip = new ZeroClipboard( $("a.clip-btn"),{moviePath:'/public/ZeroClipboard.swf'} );
        	e.preventDefault();
        });
        $(document).on('click','.delOpt',function(){
        	var x = $(this).parents('tr').data('ixid');
        	var t = '#listItem'+x;
			Messenger().run({
			  errorMessage: 'Error with your file removal request. Please try again',
			  progressMessage: 'Sending request'
			}, {
			  	url: '/dashboard/delData',
			  	type: "POST",
			  	data: "ixid="+x,
        		success: function (s){
        			if(s.status == 1){
						$('tr'+t).fadeTo(200, 0.00, function(){ //fade
							$('tr'+t).slideUp(200, function() { //slide up
								$('tr'+t).remove(); //then remove from the DOM
								Messenger().post({
								  message: 'File removed successfully.',
								  type: 'success',
								  showCloseButton: true
								});	
								getStats();
							});
						});
        			}else{
						Messenger().post({
						  message: 'Unable to remove file',
						  type: 'error',
						  showCloseButton: true
						});	
						return false;        				
        			}
        			
        		}			  
			}); 
		return false;
        }); 
	})
