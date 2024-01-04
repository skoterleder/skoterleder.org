var disqus_identifier;
var disqus_url;
var disqus_title;
var disqus_type;


function loadDisqus(identifier, title, type) {
	title = "Skoterleder.org - " + title;
	if (type === "marker") url = serverUrl + "#!marker/" + identifier + "/";
	if (type === "info") url = serverUrl + "#!info/" + identifier;

	if (type === "gpxinfo") url = serverUrl + "gpx/#!info/" + identifier;
	if (type === "track") {
		url = serverUrl + "gpx/#!track/" + identifier;
		identifier = identifier + "-track";
	}

	disqus_identifier = identifier; 	//set the identifier argument
	disqus_url = url; 					//set the permalink argument
	disqus_title = title;   
	disqus_type = type;

	loadComments();
}


function loadComments(){
	$.getJSON('/inc/comments.php?identifier='+disqus_identifier, function(comments) {
		showCommets(comments);
	})
	.error(function(jqXHR, textStatus, errorThrown){ /* assign handler */
			alert(jqXHR.responseText);
			alert(textStatus,title,url);
	});
}


function showCommets(comments) {

		$("#disqus_thread").empty();
		commentsCount = comments.comment.length + 1;
		var div = $("<div>").addClass("").appendTo("#disqus_thread");
		if ( comments.comment.length == 1 ) {
			$(div).append("<h3>" +comments.comment.length+" Kommentar</h3>");
		} else {
			$(div).append("<h3>" +comments.comment.length+" Kommentarer</h3>");
		}
		tabel = "";
		
		lastSort = 0;
		
		for(var i=0;i<comments.comment.length;i++){
			indent = 4;
			sort = comments.comment[i].sort;
			flag = comments.comment[i].flag;
			comment = zParse.BBCodeToHtml(comments.comment[i].comment.replace(/\r?\n/g, '<br>')); 

			var created = jQuery.timeago(comments.comment[i].createtime);	
			if ( lastSort == sort ) indent = 35;
			
			if ( lastSort != sort && i !=0 && userEmail ) {
				tabel += "<p class='floatRight'><a href='#' class='ansverCommentLink textlink' data-id='"+(i-1)+"' data-sort='"+lastSort+"'>Kommentera</a></p>";
			}

			tabel += "<div style='padding-left:"+indent+"px; clear: both;'><h4 style='margin-top: 2px'>Av " + comments.comment[i].name + "</h4><p class='textlink'>"+	created+"</p>";
			tabel += "<p class='commettxt'>"+comment+"</p>";
			tabel += "<span class='ansverComment-"+i+"'></span>";
			tabel += "<div class='underComment underCommentId"+comments.comment[i].id+"' style='display: none;'></div>";
			tabel += "<p class='floatRight'><a href='#' class='adminFlag textlink floatRight' data-id='"+comments.comment[i].id+"' data-hash='"+comments.comment[i].hash+"'>";
			tabel += "<img src='images/icons/flag.png' title='Flagga som olämplit' class='iconImg' width='10' height='12'>"
			// tabel += "Anmäl";
			if ( flag ) tabel += " *";
			tabel += "</a></p>";
			
			if ( i == comments.comment.length-1 && userEmail ) tabel += "<p class='floatRight'><a href='#' class='ansverCommentLink textlink' data-id='"+(i)+"' data-sort='"+(sort)+"'>Kommentera</a></p>";

			tabel += "</div>";
			lastSort = sort;
		}

		sort = lastSort + 1;
		$(div).append(tabel);

		if (userEmail) {
			commentForm(div,sort,"last",commentsCount);
			$(div).append("\
				<p class='narrow'>Du kommer få mail när någon annan också kommentera.</p>\
			");
		} else {
			$(div).append("\
				<div style='clear: both; padding-top:20px;' > \
				<p>För att kunna kommentera behöver du vara inloggad på sidan.\
				 <a href='#' class='loginLink  floatRight'>Logga in</a></p>\
				</div> \
			");
		}

		div.on('click','.loginLink', function(e){
			if (typeof gpxPage !== 'undefined' ) {
				window.location.href = "/#!login";
				return;
			}

			showUserPage();
		});

		div.on('click','.ansverCommentLink', function(e){
			
			id = $(this).data('id')
			sort = $(this).data('sort')
			var div2 = $("<div>").addClass("").appendTo(".ansverComment-"+id);
			$(".childComment").empty();
			commentForm(div2,sort,"child",comments.comment.length);
		});





		div.on('click', '.adminFlag', function() {
			
			id = $(this).data('id');
			hash = $(this).data('hash');
			
			$(".underComment").empty();
			$(".underCommentId"+id).append(" \
			<h3>Flagga denna kommentar som olämplig</h3> \
			<p>Använd denna funktion bara när inehållet är kränkande eller på annat sätt olämpligt.</p> \
			<form action='#' id='flagComment'> \
			<p><textarea id='flagDesc' name='description' rows='5'>Kort motivering</textarea></p> \
			<p><input type='submit' value='Skicka' class='inputbutton'> \
			<input type='button' value='Avbryt' class='closeaAminFlag inputbutton'></p> \
			<input type='hidden' name='hash' value='" + hash + "'> \
			<input type='hidden' name='id' value='" + id + "'></form> \
			");
			
			if (readCookie("email")) $("#nemail").val(readCookie("email"));
			$(".underCommentId"+id).slideDown();

			$("#flagComment").submit(function(form) {
				$(".underCommentId"+id).append("<h4>Skickar...</h4>");

				$.ajax({
					type: "GET",
					url: "inc/flagcomment.php",
					data: $("#flagComment").serialize(), // serializes the form's elements.
					success: function(data)
					{
						$(".underCommentId"+id).append("<p><br><b>Skaparen av kommentaren och administratör meddelad.</b></p>");
						setTimeout(function() {	
							$(".underCommentId"+id).slideUp( "slow", function() {
								$(".underCommentId"+id).empty();
							});
						}, 5000);
						return false;
					},
					error: function(data){
						$(".underCommentId"+id).append("<b>Kopplingsfel eller liknande, försök igen senare!</b>");
						return false;
					}
				});
				return false;
			});
			return false;
		});

		div.on('click', '.closeaAminFlag', function() {
				$(".underCommentId"+id).slideUp( "slow", function() {
					$(".underComment").empty();
				});
		});
		div.on('click', '#flagDesc', function() {
			if ($("#flagDesc").val() === "Kort motivering") $("#flagDesc").val("");
		});

		
}

function commentForm(div,sort,child,commentsCount) {
	
	paddingtop = 20;
	marginleft = 5;
	var hash = $( "#showMarkerBox" ).data( "hash");
	
	if ( !child ) child ="";
	
	if ( child == "child" ) {
		paddingtop = 1;
		marginleft = 20;
		childComment = "class='childComment'";
	} else {
		childComment = "";
	}

	$(div).append("\
	<div "+childComment+" style='clear: both; padding-top:"+paddingtop+"px; padding-left:"+marginleft+"px '><form action='#' id ='submitcomment'> \
	<label for='comment' style='margin-top:"+paddingtop+"px'>" + userName + ", lämna en ny kommentar nu:</label> \
	<textarea name='comment' id='comment' rows='6' style='width:95%'></textarea> \
	<input type='hidden' name='identifier' value='"+disqus_identifier+"'>\
	<input type='hidden' name='url' value='"+disqus_url+"'>\
	<input type='hidden' name='title' value='"+disqus_title+"'>\
	<input type='hidden' name='sort' value='"+sort+"'>\
	<input type='hidden' name='hash' value='"+hash+"'>\
	<input type='hidden' name='type' value='"+disqus_type+"'>\
	<input type='hidden' name='commentsCount' value='"+commentsCount+"'>\
	<input type='submit' value='Spara' class='inputbutton'> \
	<input type='button' value='Stäng' class='closeComment inputbutton'> \
	</form><p class='error'></p></div> \
	");

	div.on('click','.closeComment', function(e){
		$('.childComment').empty();
	});	

	$("#submitcomment").submit(function(form) {
		$(".error").css('color', '');
		$(".error").html("Sparar... <img src='/images/ajax-loader.gif' width='16' height='16'>");
		
		$.ajax({
			type: "GET",
			url: "/inc/postcomment.php",
			data: $("#submitcomment").serialize(), // serializes the form's elements.
			success: function(data)
			{
				message = $("#comment").val();

				if (data.substr(0,5) === "error") {
					$(".error").html(data);
					$(".error").css('color', 'red');
					console.log("Save Error");
					console.log(data);
					
				} else {
					$(".error").html("Sparat!");
					// if ( disqus_type == "marker" ) updateCommentsCount(commentsCount, message);
					setTimeout(loadComments, 3000);
				}
			},
			error: function(data){
				$(".error").html("Kopplingsfel eller liknande, försök igen senare!");
			}
		});
		return false; // avoid to execute the actual submit of the form.
	});


	if ( child == "last" )$(".closeComment:last").remove();
	
	
}

// ANvänds ej:::
function updateCommentsCount(commentsCount,text) {
	var id = $( "#showMarkerBox" ).data( "markerid");
	var hash = $( "#showMarkerBox" ).data( "hash");
	text = text.replace(/\n/g,"<br>")

	$.ajax({
		url: "inc/addcomment.php?id=" + id + "&hash=" + hash + "&commentsCount=" + commentsCount + "&text=" + text,
		cache: false
	});
}
