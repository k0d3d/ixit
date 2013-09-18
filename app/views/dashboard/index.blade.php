@extends('layouts.dashboard')

@section('content')
    <!-- Top line begins -->
    <div id="top">
        <div class="wrapper">
            <a href="index.html" title="" class="logo"><img src="img/logoSmall.png" alt="" /></a>
            <div class="topNav">
                <a href="/dashboard/seeya" class="btn btn-warning"><i class="icon-off icon-white"></i><span> Logout</span></a></li>
            </div>
            <div class="clear"></div>
        </div>
    </div>
    <!-- Top line ends -->


    <!-- Sidebar begins -->
    <div id="sidebar">
        <div class="mainNav">

        </div>
        <!-- Secondary nav -->
        <div class="secNav">
            <div class="secWrapper">
                <div class="secTop">
                    <div class="balance">
                        <div class="balInfo"></div>
                    </div>
                    <div class="pImg">
                        <div class="user">
                            <a title="" class="leftUserDrop"><img src="/scripts/timthumb.php?src=/public/profilephotos/&w=54&h=54&a=t" alt="" /></a>
                        </div>
                    </div>
                </div>
                
                <!-- Tabs container -->
                <div id="tab-container" class="tab-container">
                    <ul class="nav nav-tabs iconsLine etabs" id="userNav">
                        <li class="active"><a href="#general" data-toggle="tab"><i class="icon-upload"></i> <span>Upload</span></a></li>
                        <li><a href="#ac-settings" data-toggle="tab"><i class="icon-wrench"></i> <span>My Account</span></a></li>
                    </ul> 
                    <div class="tab-content">
                        <div id="general" class="tab-pane active">    
                            <div class="btn-group"  style="margin: 9px auto 0px;width: 176px;display:block">
                                <a id="sayPaste" class="btn  btn-mini" title="" href="#"><i class="icon-resize-small"></i>Shrink URLs</a>
                                <a id="sayBrowse" class="btn  btn-mini" title="" href="#"><i class="icon-folder-open"></i>Browse Files</a>
                            </div>
                            <input type="file" class="browsefiles" id="browsefield" multiple />
                            <div class="divider"><span></span></div>                            
                            <!-- Sidebar file uploads widget -->
                            <div class="sideUpload">
                                <div id="dropin" class="dropFiles"></div>
                                <ul class="filesDown">
                                </ul>
                            </div>
                            
                        </div>               
                        
                        <div id="ac-settings" class="tab-pane">
                        
                            <!-- Sidebar forms -->
                            <div class="sideWidget">
                                <div class="formRow">
                                    <label>Change Display Name:</label>
                                    <input type="text" id="displaynametext" placeholder="Fullname or Nickname" />
                                </div>
                                <div class="formRow">
                                    <a class="btn btn-small" href="#" id="ppBtn">
                                        <i class=" icon-folder-open" style="border-right: 1px solid rgba(0, 0, 0, 0.32);margin-right: 6px;padding-right: 3px;"></i> 
                                         Change Profile Photo
                                    </a>
                                    <div class="changestatus"></div>
                                    <input id="ppinput" type="file" class="browsefiles" placeholder="Profile Picture" />
                                    <div class="clear"></div>
                                </div>                        
                                <div class="formRow">
                                   <label>Change Password:</label>
                                    <input type="password" id="passwordtext" placeholder="Type a new password" /> 
                                </div>
                                <div class="formRow">
                                    <button type="submit" id="credSubmit" class="btn btn-small btn-primary">Save Changes</button>
                                </div>
                            </div>
                            <div class="divider"><span></span></div>                            

                        </div>
                    </div>

                </div>            
           </div> 
           <div class="clear"></div>
       </div>
    </div>
    <!-- Sidebar ends -->
        
        
    <!-- Content begins -->
    <div id="content">
        <div class="contentTop">
            <span class="pageTitle">Your Files & Links Cabinet</span>
            <ul class="quickStats">
                <li>
                    <div class="floatR"><strong id="files" class="stats blue"></strong><span>files</span></div>
                </li>
                <li>
                    <div class="floatR"><strong id="url" class="stats blue">0</strong><span>links</span></div>
                </li>            
                <li>
                    <div class="floatR"><strong id="diskcount" class="stats blue"></strong><span>MB</span></div>
                </li>            
            </ul>        
            <div class="clear"></div>
            <div style="margin-bottom: 5px;" id="noticebar">
                <div class="nNote">
                </div>  
            </div>
            <div class="clear"></div>             
        </div>
        
        
        <!-- Main content -->
        <div class="wrapper">
            <ul class="nav nav-pills" id="linkTabs">
                <li class="active"><a href="#mylinks" data-toggle="tab">My Links</a></li>
                <li><a href="#sharedlinks" data-toggle="tab">Shared</a></li>            
            </ul>
            <div class="tab-content">
                <div id="mylinks" class="tab-pane active">
                    <table cellpadding="0" cellspacing="0" width="100%" class="table table-striped table-bordered result-table">
                        <thead>
                            <tr>
                                <td>Date</td>
                                <td>Filename</td>
                                <td>Size</td>
                                <td>Options</td>
                            </tr>
                        </thead>
                        <tbody>
                        </tbody>
                    </table>
                    <ul class="pager">
                        <li class="previous">
                            <a href="#">&larr; Newer</a>
                        </li>
                        <li class="pagination pagination-mini pagination-centered">
                            <ul>
                                <li class="disabled"><a href="#">1</a></li>
                            </ul>
                        </li>                    
                        <li class="next">
                            <a href="#">Older &rarr;</a>
                        </li>                    
                    </ul>                
                </div>
                <div id="sharedlinks" class="tab-pane">
                    <table cellpadding="0" cellspacing="0" width="100%" class="table table-striped table-bordered result-table">
                        <thead>
                            <tr>
                                <td>Date</td>
                                <td>Owner</td>
                                <td>Filename</td>
                                <td>Size</td>
                                <td>Options</td>
                            </tr>
                        </thead>
                        <tbody>
                        </tbody>
                    </table>
                    <ul class="pager">
                        <li class="previous">
                            <a href="#">&larr; Newer</a>
                        </li>
                        <li class="pagination pagination-mini pagination-centered">
                            <ul>
                                <li class="disabled"><a href="#">1</a></li>
                            </ul>
                        </li>                      
                        <li class="next">
                            <a href="#">Older &rarr;</a>
                        </li>                     
                    </ul>                
                </div>
            </div>  
            <div class="clear"></div>        
        </div>
        <!-- Main content ends -->
        
    </div>
@stop
@section('modal')
    <div class="modal hide fade" id="urlInputDialog"  tabindex="-1" role="dialog" >
        <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
            <h3>URL Shrinker</h3>
        </div>
        <div class="modal-body">    
          <p><textarea rows="8" cols="" id="urlShrinker" class="auto" placeholder="Type or Paste in your link."></textarea></p>
        </div>
        <div class="modal-footer">
            <a href="#" class="btn btn-close">Close</a>
            <a href="#" class="btn btn-primary btn-save-link">Save Link</a>
        </div>
    </div>      
    <div class="modal hide fade" id="sharesDialog"  tabindex="-1" role="dialog" >
        <div class="modal-header">
            <button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button>
            <h3>Share this link</h3>
        </div>
        <div class="modal-body">    
        <form action="">
            <span class="">
                <label>To Email</label>
                <input required type="text" id="emailInput" class="input-xlarge" placeholder="Email Address"/>
                <input required type="hidden" id="ixInput" class=""/>
            </span>
            <label>Message:</label>
            <textarea rows="8" cols="" id="textarea" class="input-xlarge" placeholder=""></textarea>
        </form>    </div>
        <div class="modal-footer">
            <a href="#" class="btn btn-close">Close</a>
            <a href="#" class="btn btn-primary emailBtn">Send Email</a>
        </div>
    </div> 
@stop
<!-- Content ends -->
