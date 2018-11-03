function closeContenBox() {
	$('.content-box').hide();
	$('#grayout').hide();
	$('.dynamic-text').hide();
	document.title = "Skoterleder.org - Snöskoterkarta!"
	location.replace("#"); 
}

function showUserPage() {
	if (userEmail) {
		//User is signed in 
		var hash = "#!mypage";
		var title = "Skoterleder.org - Min sida"
		width = 900;
		loadMyPage();
	} else {
		// User is NOT signed in
		var hash = "#!login";
		var title = "Skoterleder.org - Login"
		width = 500;
		if ( loadLoginPage() ) loadMyPage();
	}
	
	newHash(hash);
	document.title = title
	moveInfo(width);

	$('.content-box').css('height', '');
	$('#grayout').show();
	$('.dynamic-text').show();
	$('.content-box').slideDown(500);
	$("#grayout").attr("close","content-box");
}

function loadMyPage(){
	$(".dynamic-text").empty();
	$(".dynamic-text").append(" \
	<div class='header'> \
		<h1>Skoterleder.org</h1> \
	</div> \
	<h2 class='collapsible'>Dina markörer</h2>\
	<div class='collapsdata'>\
		<p class='markerList'></p>\
		<p class='result'></p> \
	</div>\
	<h2 class='collapsible administration'>Ditt konto</h2>\
	<div class='collapsdata hidden administrationForm'>\
		<p class=''><a href='#' class='logoutLink linkButtonMid'>Logga ut</a></p>\
		<p class='result'></p> \
	</div>\
	<p class='return-login linkButtonLong'><a href='#' class='closeMarkerBox'>Åter till kartan</a></p>\
	");

	$(".return-login").click( function() {
		closeContenBox();
	});

	$(".administration").click( function() {
		$(".result").empty();
		$('.administrationForm').show(600);
	});

	$(".logoutLink").click( function() {
		$(".result").empty();
		$.getJSON('inc/logout.php', function(data) {
			if ( data.result === "ok" ) {
				$(".result").empty();
				getUser();
				closeContenBox();
				return false;
			}
		})
		.error(function(jqXHR, textStatus, errorThrown){ /* assign handler */
				alert(jqXHR.responseText);
				alert(textStatus);
				$(".result").append( "<h4>Fel!</h4>");
		});	
	});
	
	listMarkerssss();
}

	function listMarkerssss (){
		var windowWidth = $(window).width()
		if (windowWidth < 600) {
			$("#listBox").width( windowWidth )
		}
	
		$.getJSON('inc/listmymarkers.php', function(data) {
		
			document.title = "Skoterleder.org - Mina markörer";
			var div = $("<div>").addClass(""); // .appendTo("#listBox");
			
			
			div.on('click', '.editClick', function() {
				changeMarker($(this).data('id'),$(this).data('hash'));
				return false;
			});
			div.on('click', '.showClick', function() {
				loadMarkerPanel($(this).data('id'));
				return false;
			});

			div.on('click', '.markerListItem', function() {
				expandMarkerListItem(data,$(this).data('i'),this);
				return false;
			});
			for(var i=0;i<data.marker.length;i++){
				var point = data.marker[i];
			
				var dim="";
				if (point.properties.status != "1") dim=" dim ";
				
				
				$(div).append(" \
					<p class='markerListItem' data-i='" + i + "' >\
						#" + point.properties.id + "\
						<img src='" + icon[point.icon] + "' class='iconImg" + dim + "'> " + point.properties.title + " \
					</p>\
					");
				
				$("<div>").addClass("clearboth line").appendTo(div);
			}			
	
			$(div).appendTo(".markerList");
			
		})
		.error(function(jqXHR, textStatus, errorThrown){ /* assign handler */
				alert(jqXHR.responseText);
				alert(textStatus);
		});		
		
	}

function expandMarkerListItem(data,pointer,div){
	// mapMini
	console.log(data,pointer,div);
	
	$("#mapMini").remove();
	$(div).after("<div id='mapMini'><div>");
	
	$("#mapMini").height( Math.floor( $(window).height()*0.5) );
	
	var mapMini = L.map('mapMini', {center: new L.LatLng(64, 16), zoom: 6});

	new L.tileLayer('https://tiles.skoterleder.org/tiles/{z}/{x}/{y}.png', {
		maxZoom: 16,
		maxNativeZoom: 14,
		attribution: '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> bidragsgivare, Imagery &copy; <a href="http://skoterleder.org">Skoterleder.org</a>, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
	}).addTo(mapMini);

	var point = data.marker[pointer];
	
	var opacity = 1;
	if ( point.properties.status < 1 ) opacity = 0.3;
	var size = 100;
	var x=32, y=37;
	var z = size / 100;
	iconType[point.icon].options.iconSize = [x * z, y * z]; // size of the icon
	iconType[point.icon].options.iconAnchor = [x*z/2, y * z];
	
	var tmpMarker = L.marker(point.coordinates,{opacity: opacity}).setIcon(iconType[point.icon]).addTo(mapMini);
	mapMini.setView(point.coordinates, 12);
	
}

function loadLoginPage() {
	$(".dynamic-text").empty();
	$(".dynamic-text").append(" \
	<div class='header'> \
		<h1>Skoterleder.org</h1> \
		<p>Kartan för skoteråkare, av skoteråkare!</p> \
	</div> \
	<h2 class='collapsible do-login'>Logga in</h2>\
	<div class='collapsdata login-form'>\
		<h3>Om du har ett konto kan du logga in här:</h3>\
		<div style='display: grid;'>\
		<form action='#' id='loginForm'>\
		<p><label for='loginEmail'>Din e-post adress</label> \
		<input id='loginEmail' type='text' name='email' class='inputText'></p>\
		<p><label for='password'>Lösenord:</label>\
		<input id='password' type='password' name='password' class='inputText'></p>\
		<p>Kom ihåg mig: <input type='checkbox' name='remember' value='1'>\
		<!-- <img src='images/icons/checkmark.png' width='22px' class='iconImg'>-->\
		<input type='submit' value='Logga in' class='floatRight inputSubmit'>\
		</p>\
		</form>\
		<p class='result'></p> \
		</div>\
	</div>\
	<h2 class='collapsible create-login'>Skapa konto</h2>\
	<div class='collapsdata hidden create-form'>\
		<h3>Om du inte har ett konto kan du skapa ett här:</h3>\
		<div style='display: grid;'>\
		<form action='#' id='signupForm'>\
		<p><label for='dispalyname'>Ditt namn</label> \
		<input id='dispalyname' type='text' name='name' class='inputText'></p>\
		<p><label for='newEmail'>Din e-post adress</label> \
		<input id='newEmail' type='text' name='email' class='inputText'></p>\
		<!-- <p><label for='newEmailVer'>Verifiera din e-post adress</label> \
		<input id='newEmailVer' type='text' name='emailver' class='inputText'></p> -->\
		<p><label for='newPassword'>Ange ett nytt lösenord: (Min 8 tecken)</label>\
		<input id='newPassword' type='password' name='password' class='inputText'>\
		<input type='submit' value='Skapa konto' class='floatRight inputSubmit'></p>\
		</form>\
		<p class='result'></p> \
		</div>\
	</div>\
	<p class='return-login biglink'>Åter till kartan</p>\
	");
	
	if (touchDev) {
		$('.inputText').css('padding','10px');
	}

	$(".return-login").click( function() {
		closeContenBox();
	});
	$(".create-login").click( function() {
		$(".result").empty();
		$('.create-form').show(600);
		$('.login-form').hide(200);
	});
	$(".do-login").click( function() {
		$(".result").empty();
		$('.create-form').hide(600);
		$('.login-form').show(200);
	});
	
	$("#loginForm").submit(function(form) {
		$(".result").empty();
		$.ajax({
			dataType: "json",
			url: "inc/login.php",
			data: $("#loginForm").serialize(), // serializes the form's elements.
			success: function(data)
			{
				if ( data.result === "ok" ) {
					getUser();
					closeContenBox();
					setTimeout(function() {	
						showUserPage();
					}, 500);
					return true;
				}
				if ( data.result === "-1" ) {
					$(".result").append( "<h3>Fel lösenord eller e-postadress</h3>");
					return false;
				}
				if ( data.result === "-2" ) {
					$(".result").append( "<h3>E-postadressen är ej verifierad, kolla din e-post</h3>");
					$(".result").append( "<p><a href='#' class='resend'>Skicka verifierings e-post igen.</a></p>");
					$('.resend').css('color','gray');
					$(".resend").click( function() {
						var email = $("#loginEmail").val();
						console.log(email);
						$.ajax({
							dataType: "json", url: "inc/resendconfirmation.php?email="+email,
							success: function(data)
							{
								if ( data.result === "ok" ) {
									showAlert("Kontrollera din e-post för att verifiera din inloggning");
									return true;
								}
								$(".result").empty();
								$(".result").append( "<h3>Fel: " + data.result + "</h3>");
								return false;
							},
							error: function(data){
								$(".result").append( "<h3>Kan ej ansluta till databasen/server...</h3>");
								return false;
							}
						});						return false;
					});
					return false;
				}				
				// $(".result").append( "<h3>" + data.result + "</h3>");

				return false;
			},
			error: function(data){
				$(".result").append( "<h3>Kan ej ansluta till databasen/server...</h3>");
				console.log("ej inloggad:".data);
				return false;
			}
		});
		return false; 
	});

	
	
	
	$("#signupForm").submit(function(form) {
		$(".result").empty();
		$(".result").append("<h4>Skickar...</h4>");

		$.ajax({
			dataType: "json",
			url: "inc/createlogin.php",
			data: $("#signupForm").serialize(), // serializes the form's elements.
			success: function(data)
			{
				if ( data.result === "ok" ) {
					showAlert("Kontrollera din e-post för att verifiera din inloggning");
					closeContenBox();
					return true;
				}
				$(".result").empty();
				$(".result").append( "<h3>Fel: " + data.result + "</h3>");
				return false;
			},
			error: function(data){
				$(".result").append( "<h3>Kan ej ansluta till databasen/server...</h3>");
				console.log("ej inloggad:".data);
				return false;
			}
		});
		return false; 
	});
	return false;
}

function getUser() {
	$.ajax({
		dataType: "json",
		url: "inc/getuser.php",
		success: function(data)
		{
			userEmail = data.userEmail;
			userName  = data.userName;
			console.log("userEmail:" + userEmail + " userName:" + userName);
			
			if (userEmail) {
				$(".openUserPage").text("Min sida."); // Change the button "Login" to "Min sida"
			}
			return;
		},
		error: function(data){
			console.log("GetUser error:" + data);
			return false;
		}
	});
}