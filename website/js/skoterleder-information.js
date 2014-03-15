$(document).ready(function() {
	$(".alertOk").click(function() {
		$('#alert').hide(100);
	});

	$(".infoBack").click(function() {
		parent.history.back();
		return false;
	});

	$("#grayout").click(function() {
		parent.history.back();
        return false;
	});	

	$('.collapsible').click(function() {
		$("."+$(this).attr("collaps")).toggle();
	});	
});

function showInfo() {
	ga('send', 'pageview');
	
	moveInfo();
	$('#grayout').show(10);
	$('.info').slideDown(10);
	$("#grayout").attr("close","info");
}

function loadDisqus(identifier, title) {
	title = "Skoterleder.org - " + title;
	url = serverUrl + "#!marker/" + identifier + "/";
	
	if (window.DISQUS) {

		//if Disqus exists, call it's reset method with new parameters
		DISQUS.reset({
			reload: true,
			config: function () {
				this.page.identifier = identifier;
				this.page.url = url;
				this.page.title = title;

			}
		});

	} else {

		disqus_identifier = identifier; 	//set the identifier argument
		disqus_url = url; 					//set the permalink argument
		disqus_title = title;	   

		//append the Disqus embed script to HTML
		var dsq = document.createElement('script'); dsq.type = 'text/javascript'; dsq.async = true;
		dsq.src = 'http://' + disqus_shortname + '.disqus.com/embed.js';
		jQuery('head').append(dsq);

	}
};

function disqus_config() {
	this.callbacks.onNewComment = [function(comment) {
		console.log(comment);
		updateCommentsCount(comment.text.replace(/\n/g,"<br>") );
	}];
}

function hideInfo() {
	$('.info').slideUp(400);
	$('#grayout').hide(10);
	updateMapHash();
}
function moveInfo() {
	var maxWidth = 570;
	var screenWidth = $(window).width();
	var divheight = $(window).height()-40;
	var top = ($(window).height() - $('.info').outerHeight()) /2;
	var left = 0;
	var top = 0;
	
	if (screenWidth < 600 ){
		divWidth = screenWidth-20;
		divheight = $(window).height()-20;
	} else {
		divheight = $(window).height()-40;
		divWidth = maxWidth;
		left = (screenWidth - (divWidth+20)) /2 ;
		top = 15;
	}
		
	$('.info').css({
		position:'absolute',
		top: top,
		left: left,
		width: divWidth,
		height: divheight,
	});
}

function showAlert(text) {
	$(".alertText").html(text);
	moveAlertbox();
	$('#alert').show(1);
}
function moveAlertbox () {
	$('#alert').css({
		position:'absolute',
		left: (($(window).width() - $('#alert').outerWidth()) /2 )
	});
}
