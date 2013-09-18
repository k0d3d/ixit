<!DOCTYPE html>
<html>
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0"> 
	<title>I-X.it :: </title>
	<meta name="description" content="This is your file cabinet. All the links to your public and private files are kept here. You can add new files and links, view other downloads and even queue uploads. Share files to anyone from your cabinet. Audio, Photos and Office Documents supported with Unlimited Storage.">
	<link href='http://fonts.googleapis.com/css?family=Economica' rel='stylesheet' type='text/css'>
	@section('headtags')
	<?php echo HTML::style('/css/bootstrap.min.css'); ?>
	<?php echo HTML::style('css/styles.css'); ?>
	<?php echo HTML::style('css/overrides.css'); ?>
	<?php echo HTML::style('css/animate.min.css'); ?>
	<?php echo HTML::script('js/jquery-1.10.2.min.js'); ?>
	@show
	@section('ga')
	<script type="text/javascript">
	var _gaq = _gaq || [];
	_gaq.push(['_setAccount', 'UA-4614510-20']);
	_gaq.push(['_trackPageview']);

	(function() {
		var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
		ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
		var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
	})();

	</script>
	@show

</head>

<body>
	@yield('modal')
	@yield('content')
	<div id="tmp">
	</div>
@section('foottags')
	<?php echo HTML::script('js/bootstrap.min.js'); ?>
	<?php echo HTML::script('js/angular.min.js'); ?>
    <?php echo HTML::script('js/jquery.fileupload.js'); ?>
    <?php echo HTML::script('js/cors/jquery.postmessage-transport.js'); ?>
    <?php echo HTML::script('js/cors/jquery.xdr-transport.js'); ?>
    <?php echo HTML::script('js/vendor/jquery.ui.widget.js'); ?>	
	<?php echo HTML::script('js/moment.min.js'); ?>
	<?php echo HTML::script('js/app.js'); ?>
	<?php echo HTML::script('js/dashboard.js'); ?>
@show
</body>
</html>