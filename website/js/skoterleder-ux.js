function closeContenBox() {
	$('.content-box').hide();
	$('#grayout').hide();
	$('.dynamic-text').hide();
	document.title = "Skoterleder.org - Snöskoterkarta!"
	location.replace("#"); 
}

function showUserPage(openMarker) {
	hidebox('#showMarkerBox');
	$('.info').hide();
	$(".dynamic-text").empty();
	$(".dynamic-text").append("<br/><br/><img src='images/ajax-loader.gif' width='16' height='16' class='center'><br/><br/>");
	moveInfo();
	
	$.ajax({
		dataType: "json",
		url: "inc/getuser.php",
		success: function(data)
		{
			$(".dynamic-text").empty();
			
			userEmail = data.userEmail;
			userName  = data.userName;
			
			if (userEmail) {
				var hash = "#!mypage";
				var title = "Skoterleder.org - Min sida"
				loadMyPage(openMarker);	
			} else {
				var hash = "#!login";
				var title = "Skoterleder.org - Login"
				//if ( loadLoginPage(openMarker) ) loadMyPage(openMarker);
				loadLoginPage(openMarker);
			}
			
			newHash(hash);
			document.title = title
			moveInfo();
		},
		error: function(data){
			console.log("GetUser error:" + data);
		}
	});

	$('.content-box').css('height', '');
	$('#grayout').show();
	$('.dynamic-text').show();
	$('.content-box').slideDown(500);
	$("#grayout").attr("close","content-box");
}

function loadMyPage(openMarker){
	
	if (openMarker == "newMarker" ) {
		closeContenBox();
		map.removeLayer(addMarker);
		addNewMarker();
		return
	}
		
	$(".dynamic-text").empty();
	$(".dynamic-text").append(" \
	<div class='header'> \
		<h1>Skoterleder.org</h1>\
	</div> \
	<h2 class='collapsible yourMarkersList open'>Dina markörer</h2>\
	<div class='collapsdata'>\
		<p class='markerList'></p>\
		<p class='result'></p> \
	</div>\
	<h2 class='collapsible administration'>Ditt konto</h2>\
	<div class='collapsdata hidden administrationForm'>\
		<h2>Välkommen " + userName + "</h2>\
		<p>Du är inloggad som <b>" + userEmail + "</b></p>\
		<p><br><br></p>\
		<p class='changePassword linkButtonMid '>Ändra lösenord</p>\
		<p class='logoutLink linkButtonLong '>Logga ut</p>\
		<p class='result'></p> \
	</div>\
	<p class='return-login biglink'><a href='#' class='closeMarkerBox'>Åter till kartan</a></p>\
	");

	$(".return-login").click( function() {
		closeContenBox();
	});

	$(".changePassword").click( function() {

		$(".changePassword").hide(500);
		
		var form = " \
				<form action='#' id ='changePasswordForm'> \
				<h3>Byte av lösnord</h3> \
				<p>Gamla lösenordet</p>\
				<input type='password' name='oldPassword'> \
				<p>Nytt lösenord</p>\
				<input type='password' name='newPassword'> \
				<p class='floatRight'> \
					<input type='button' value='Stäng' class='inputbutton closeChangePasswordForm'> \
					<input type='submit' value='Spara' class='savebutton inputbutton'> \
				</p>\
				<div class='clearboth'></div> \
				<div class='resultPassChange'></div>\
				</form> \
		";
		$(form).insertAfter(".changePassword");
	
		$("#changePasswordForm").submit(function(form) {
			$(".resultPassChange").empty();
			$(".resultPassChange").append( "<p>Sparar...</p>");
			
			$.ajax({
				dataType: "json",
				url: "inc/changepassword.php",
				method : "post",
				data: $("#changePasswordForm").serialize(),
				success: function(data)
				{
					$(".resultPassChange").empty();
					
					if ( data.result === "ok" ) {
						showAlert("Lösenord ändrat");
						setTimeout(function() {	
							closeForm();
						}, 800);
					} else {
						$(".resultPassChange").empty();
						$(".resultPassChange").append( "<h3 class='alerttext'>Fel: " + data.result + "</h3>");
					}
				},
				error: function(data){
					$(".resultPassChange").html("Kopplingsfel eller liknande, försök igen senare!");
				}
			});

			return false;
		});
		
		$(".closeChangePasswordForm").click( function() {
			closeForm();
		});
		
		function closeForm() {
			$("#changePasswordForm").hide(500, function() {
				$(".changePassword").show(500);
				$("#changePasswordForm").empty();    
			});
		}
	});

		
	$(".yourMarkersList").click( function() {
		if ( $(".yourMarkersList").hasClass("open") ) {
			$(".yourMarkersList").removeClass("open");
			$(".markerList").hide(600);
		} else {
			$('.markerList').show(600);
			$(".yourMarkersList").addClass("open");
		}
	});

	$(".administration").click( function() {
		if ( $(".administration").hasClass("open") ) {
			$(".administration").removeClass("open");
			$('.administrationForm').hide(600);
		} else {
			$(".markerList").hide(800);
			$(".yourMarkersList").removeClass("open");
			$('.administrationForm').show(600);
			$(".administration").addClass("open");
		}
	});

	$(".logoutLink").click( function() {
		$(".result").empty();
		$.getJSON('inc/logout.php', function(data) {
			if ( data.result === "ok" ) {
				$(".logoutLink").after( "<h3>Du är nu utloggad</h3>");
				getUser();
				setTimeout(function() {	closeContenBox(); }, 1500);
			}
		})
		.error(function(jqXHR, textStatus, errorThrown){ /* assign handler */
				$(".logoutLink").after( "<h4>Kan ej ansluta till databasen/server...</h4>");
		});	
	});
	
	listMarkerssss(openMarker);
}

	function listMarkerssss (openMarker){
		$(".markerList").empty();
		$(".markerList").append("Laddar... <img src='images/ajax-loader.gif' width='16' height='16'>");
		var openMarkerNumber = -1;
	
		$.getJSON('inc/listmymarkers.php?id='+openMarker, function(data) {
		
			$(".markerList").empty();
			if ( data == -1 ) {
				console.log("-1 error");
				showUserPage(openMarker);
				return false;
			}
			
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
				expandMarkerListItem(data,$(this).data('i'));
				return false;
			});
			
			var heder ="";
			for(var i=0;i<data.marker.length;i++){
				var point = data.marker[i];
			
				var dim="";
				if (point.properties.status != "1") dim=" dim ";
				
				var lastupdated = jQuery.timeago(point.properties.updatetime);	
				
				if ( point.properties.expires == 1 && heder != "expires" ) {
					heder = "expires";
					$(div).append(" \
						<div class='markerListHeder red'> \
						<h2>Markörer som behöver förnyas/bekräftas:</h2>\
						<p class='' >\
						Om du inte bekräftar följande markörer kommer de att inaktiveras den 2019-03-01 och sedan raderas efter 6 månader.\
						</p>\
						</div>\
					");					
				}
				
				if ( point.properties.expires != 1 && point.properties.status == 1 && heder != "active" ) {
					heder = "active";
					$(div).append(" \
						<div class='markerListHeder'> \
						<h2>Aktiva markörer:</h2>\
						<p class='' >\
						</p>\
						</div>\
					");					
				}
				if ( point.properties.expires != 1 && point.properties.status < 1 && heder != "inactive" ) {
					heder = "inactive";
					$(div).append(" \
						<div class='markerListHeder'> \
						<h2>Ej Aktiva</h2>\
						<p class='' >\
						Ej aktiva markörer visas inte på kartan och raderas automatiskt efter 12 månader sedan den senast ändrades.\
						</p>\
						</div>\
					");					
				}
				
				$(div).append(" \
					<p class='markerListItem item" + i + "' data-i='" + i + "' >\
						#" + point.properties.id + "\
						<img src='" + icon[point.icon] + "' class='iconImg" + dim + "'> " + point.properties.title + " \
						(Ändrad " + lastupdated + ") \
					</p>\
				");
				
				$("<div>").addClass("clearboth line").appendTo(div);
				if ( openMarker == point.properties.id ) openMarkerNumber = i;
			}
			
			if (data.marker.length == 0) {
				$(div).append(" \
					<div class=''> \
					<p class='' >\
					Du har inga markörer.\
					</p>\
					</div>\
				");		
			}
			$(div).appendTo(".markerList");
			if ( openMarkerNumber != -1  ) expandMarkerListItem(data,openMarkerNumber);

		})
		.error(function(jqXHR, textStatus, errorThrown){ /* assign handler */
			$(".markerList").append( "<h3>Kan ej ansluta till databasen/server...</h3>" );
		});		

	}

function expandMarkerListItem(data,index){

	if ( $(".item"+index).hasClass( "markerListSelected") ) {  //Close already open Marker
		$("#mapMini").remove();
		$("#markerContent").remove();
		$('.markerListItem').removeClass( "markerListSelected");
		return false;
	}
	
	$('.markerListItem').removeClass( "markerListSelected");
	$(".item" + index).addClass( "markerListSelected" );
	
	$("#mapMini").remove();
	$("#markerContent").remove();
	
	var div = $(".item"+index).after("<div id='markerContent'><div id='mapMini'></div></div>");
	
	$("#mapMini").height( Math.floor( $(window).height()*0.3) );
	var mapMini = L.map('mapMini', {center: new L.LatLng(64, 16), zoom: 6});

	new L.tileLayer('https://tiles.skoterleder.org/tiles/{z}/{x}/{y}.png', {
		maxZoom: 16,
		maxNativeZoom: 14,
		attribution: '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> bidragsgivare, Imagery &copy; <a href="http://skoterleder.org">Skoterleder.org</a>, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
	}).addTo(mapMini);

	var point = data.marker[index];
	var id = point.properties.id;
	var status = point.properties.status;
	var expires = point.properties.expires;
	var title = point.properties.title;
	var description = point.properties.description;
	var type = point.properties.type;
	var name = point.properties.name;
	
	var opacity = 1;
	if ( status < 1 ) opacity = 0.5;
	var size = 100;
	var x=32, y=37;
	var z = size / 100;
	iconType[point.icon].options.iconSize = [x * z, y * z]; // size of the icon
	iconType[point.icon].options.iconAnchor = [x*z/2, y * z];
	
	var tmpMarker = L.marker(point.coordinates,{opacity: opacity}).setIcon(iconType[point.icon]).addTo(mapMini);
	mapMini.setView(point.coordinates, 12);

	$("#markerContent").append("<h2>Ändra på markören</h2><p class='InfoText'></p>");

	var saveButtonText = "Spara";
	var message = "";

	if (status == 0) {
		saveButtonText = "Spara och aktivera";
		$("<p>").addClass("alerttext").html("Markör inte aktiverad").appendTo(".InfoText");
	}
	if (status == -1) {
		saveButtonText = "Spara och återaktivera";
		message = "<p>OBS! Överväg att skapa ny \
						markör i stället för att återaktivera en gamla om \
						ämnet inte är den samma. </p>"
		$("<p>").addClass("alerttext").html("Markören är inte aktiv").appendTo(".InfoText");
	}
	if (expires == 1) {
		saveButtonText = "Spara och bekräfta";
		$("<p>").addClass("alerttext").html("Markör måste sparas/bekräftas").appendTo(".InfoText");
	}

	var form = " \
			<form action='#' id ='changeMarkerForm'> \
			<h3>Rubrik</h3> \
			<input type='text' name='title' id='ctitle' value='" + decodeEntities(title) + "'> \
			<h3>Beskrivning</h3> \
			<textarea name='description' id='cdescription' rows='6'>" + description + "</textarea> \
			<input type='hidden' name='id' id='cid' value='" + id + "'> \
			<input type='hidden' name='action' id='actionType' value='change' >\
			<input id='ctype' type='hidden' name='type' value='"+type+"'> \
			" + message + "\
			<p class='clearboth'> \
				<img src='images/icons/snowmobile-green.png' class='selectIconType icon-1' type='1' title='Information om skoterled'> \
				<img src='images/icons/information.png' class='selectIconType icon-2' type='2' title='Allmän information'> \
				<img src='images/icons/treedown.png' class='selectIconType icon-3' type='3' title='Blockerad skoterled'> \
				<img src='images/icons/caution.png' class='selectIconType icon-4' type='4' title='Varning, fara!'> \
				<img src='images/icons/fixmap.png' class='selectIconType icon-5' type='5' title='Rapportera kartfel'> \
				<img src='images/icons/parking.png' class='selectIconType icon-6' type='6' title='Skoterparkering'> \
				<img src='images/icons/coffee.png' class='selectIconType icon-7' type='7' title='Servering för skoteråkare'> \
				<img src='images/icons/fuel.png' class='selectIconType poiIcons  icon-500' type='500' title='Bensinstation tillgänglig med skoter'> \
				<img src='images/icons/shelter.png' class='selectIconType poiIcons  icon-501' type='501' title='Vindskydd eller liknande'> \
				<img src='images/icons/wildernesshut.png' class='selectIconType poiIcons' type='502' title='Stuga tillgänglig med skoter'>\
				</p> \
			<div class='vclearboth'>Vald markör: <div class='iconText'>Information om skoterled</div></div> \
			<h3>Visas under namn</h3> \
			<input id='name' type='text' name='name' value='" + name + "'> \
			<p class='floatRight'> \
			<input type='button' value='Stäng' class='inputbutton closeExpandMarker'> \
			<input type='submit' value='" + saveButtonText + "' class='savebutton inputbutton ffloatRight'> \
			</p> \
			<div class='clearboth'></div> \
			<div class='error'></div></form> \
			<p class='linkButtonLong zoomMarkerButton'>Zooma in kartan till denna markör</p> \
			<p class='linkButtonLong removeMarkerButton'>Inaktivera markör</p> \
			<p class='linkButtonLong showCommentsButton'>Visa kommentarer</p> \
			<div id='disqus_thread'></div>\
			<p class='linkButtonLong closeMarkerBox closeExpandMarker'><a href='#' class='closeMarkerBox'>Stäng</a></p> \
	";
	$(form).appendTo("#markerContent");

	$('.icon-'+type).addClass("iconSelected");
	$(".iconText").html($('.icon-'+type).attr("title"));
	
	if ( status < 1 ) $('.removeMarkerButton').remove();
	
	$('.selectIconType').click(function() {
		$('.selectIconType').removeClass( "iconSelected" )
		$(this).addClass( "iconSelected" );
		
		$(".iconText").html($(this).attr("title"));
		$("#ctype").val($(this).attr("type"));
	});
	$(".zoomMarkerButton").click( function() {
		map.setView(point.coordinates,13);
		return false;
	});
	$(".closeExpandMarker").click( function() {
		closeExpandMarker();
		return false;
	});
	$('.showCommentsButton').click(function() {
		loadDisqus(id,data.title,'marker');
		$('.showCommentsButton').hide();
	});	
	$('.removeMarkerButton').click(function() {
		$(".error").css('color', '');
		$(".error").html("Sparar... <img src='images/ajax-loader.gif' width='16' height='16'>");
		
		$('#actionType').val('remove');
		
		updateMarker();
	});

	$("#changeMarkerForm").submit(function(form) {
		$(".error").css('color', '');
		$(".error").html("Sparar... <img src='images/ajax-loader.gif' width='16' height='16'>");
		
		updateMarker();

		return false;
	});
	
	function updateMarker(){
		$.ajax({
			url: "inc/updatemarker.php",
			method : "post",
			data: $("#changeMarkerForm").serialize(),
			success: function(data)
			{
				if (data.substr(0,5) === "error") {
					$(".error").html(data);
					$(".error").css('color', 'red');
				} else {
					$(".error").html("Markör Sparas... <img src='images/ajax-loader.gif' width='16' height='16'>");
					$(".savebutton").prop('disabled', true);
					loadmarkers();
					setTimeout(function() { closeExpandMarker(true); }, 2500);							
					
					dataCache[id] = 'undefined';
					gatrack('send', 'pageview','#marker/'+id+'/saved'); //#changeMarker/17
				}
			},
			error: function(data){
				$(".error").html("Kopplingsfel eller liknande, försök igen senare!");
			}
		});
	}

	function closeExpandMarker(reloadloadMyPage){
		$("#markerContent").slideUp( "slow", function() {
			$("#mapMini").remove();
			$("#markerContent").remove();
			$('.markerListItem').removeClass( "markerListSelected");
			if ( reloadloadMyPage ) loadMyPage();
		});
	}
}

function loadLoginPage(openMarker) {
	$(".dynamic-text").empty();
	$(".dynamic-text").append(" \
	<div class='header'> \
		<h1>Skoterleder.org</h1> \
		<p>Kartan för skoteråkare, av skoteråkare!</p> \
	</div> \
	<h2 class='collapsible do-login'>Logga in</h2>\
	<div class='collapsdata login-form'>\
		<form action='#' id='loginForm' class='loginForm'>\
		<div style='display: grid;'>\
			<p><label for='loginEmail'>Din e-postadress</label> \
			<input id='loginEmail' type='text' name='email' class='inputText'></p>\
			<p><label for='password'>Lösenord:</label>\
			<input id='open' type='hidden' name='open' value='"+openMarker+"'>\
			<input id='password' type='password' name='password' class='inputText'></p>\
			<p>Kom ihåg mig: <input type='checkbox' name='remember' value='1'></p>\
			<p><input type='submit' value='Logga in' class='floatRight inputSubmit'></p>\
			<p class='result'></p> \
			<p class='textlink forgetLink'>Glömt lösenord?</p>\
		</div>\
		</form>\
	</div>\
	<h2 class='collapsible create-login'>Skapa konto</h2>\
	<div class='collapsdata hidden create-form'>\
		<form action='#' id='signupForm'>\
		<h3>Om du inte har ett konto kan du skapa konto här:</h3>\
		<div style='display: grid;'>\
			<p><label for='newEmail'>Din e-postadress</label> \
			<input id='newEmail' type='text' name='email' class='inputText'></p>\
			<p><label for='dispalyname'>Ditt namn</label> \
			<input id='dispalyname' type='text' name='name' class='inputText'></p>\
			<p><label for='newPassword'>Ange ett nytt lösenord: (Min 8 tecken)</label>\
			<input id='newPassword' type='password' name='password' class='inputText'></p>\
			<p><input type='submit' value='Skapa konto' class='floatRight inputSubmit'></p>\
			<p class='result'></p> \
			<p></p>\
			<p>Godkänn att skoterleder kan komma att skicka nyhetsbrev till dig: <input type='checkbox' name='newsletter' value='1' checked></p>\
			<p>Efter att du registrerat dig får du ett mail med en länk där du bekärfta din e-postadress.</p>\
		</div>\
		</form>\
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
	$(".forgetLink").click( function() {
		$('.forgetLink').hide();
		$("#loginForm").replaceWith("\
		<form action='#' id='resettPassForm'>\
		<h3>Äterställ lösenord</h3>\
		<div style='display: grid;'>\
		<p><label for='loginEmail'>Din e-postadress</label> \
		<input id='loginEmail' type='text' name='email' class='inputText'></p>\
		<p><input type='submit' value='Äterställ lösenord' class='floatRight inputSubmit'>\
		<input type='hidden' name='action' value='resett'></p>\
		<p class='result'></p> \
		</div>\
		</form>\
		");

		if (touchDev) {
			$('.inputText').css('padding','10px');
		}

		$("#resettPassForm").submit(function(form) {
			
			$(".result").empty();
			$(".result").append("<h4>Skickar...</h4>");
			$.ajax({
				dataType: "json",
				url: "inc/forget.php",
				method : "post",
				data: $("#resettPassForm").serialize(),
				success: function(data)
				{
					if ( data.result === "ok" ) {
						showAlert("Kontrollera din e-post för att återställa lösenord");
						setTimeout(function() {	
							closeContenBox();
						}, 800);
					} else {
						$(".result").empty();
						$(".result").append( "<h3 class='alerttext'>Fel: " + data.result + "</h3>");
					}
				},
				error: function(data){
					console.log("GetUser error:" + data);
					return false;
				}
			});
		return false;
		});
	});
		

	
	$("#loginForm").submit(function(form) {
		$(".result").empty();
		$(".result").append("Loggar in... ");
		$.ajax({
			dataType: "json",
			url: "inc/login.php",
			method : "post",
			data: $("#loginForm").serialize(),
			success: function(data)
			{
				$(".result").empty();
				if ( data.result === "ok" ) {
					
					var open = $("#open").val();
					if ( open.substr(0,7) == "#!track" ) window.location.href = "/gpx/"+open;
					if ( open == "#!gpx/gpx" ) window.location.href = "/gpx/#!uppload";
					
					getUser();
					closeContenBox();
					setTimeout(function() { showUserPage(openMarker); }, 500);
					return;
				}
				if ( data.result === "-1" ) {
					$(".result").append( "<h3 class='alerttext'>Fel lösenord eller e-postadress</h3>");
					return;
				}
				if ( data.result === "-2" ) {
					$(".result").append( "<h3>E-postadressen är ej verifierad, kolla din e-post</h3>");
					$(".result").append( "<p><a href='#' class='resend'>Skicka verifierings e-post igen.</a></p>");
					$('.resend').css('color','gray');
					
					$(".resend").click( function() {
						var email = $("#loginEmail").val();
						$.ajax({
							dataType: "json", url: "inc/resendconfirmation.php",
							method : "post",
							data: { email: email},
							success: function(data)
							{
								if ( data.result === "ok" ) {
									showAlert("Kontrollera din e-post för att verifiera din inloggning");
									setTimeout(function() { closeContenBox(); }, 500);
									return;
								}
								$(".result").empty();
								$(".result").append( "<h3 class='alerttext'>Fel: " + data.result + "</h3>");
							},
							error: function(data){
								$(".result").append( "<h3>Kan ej ansluta till databasen/server...</h3>");
							}
						});
					});
				}				
			},
			error: function(data){
				$(".result").append( "<h3>Kan ej ansluta till databasen/server...</h3>");
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
			method : "post",
			data: $("#signupForm").serialize(),
			success: function(data)
			{
				$(".result").empty();
				if ( data.result === "ok" ) {
					showAlert("Kontrollera din e-post för att verifiera din inloggning");
					$(".result").css('color', 'red');
					setTimeout(function() { closeContenBox(); }, 500);
				}
				$(".result").append( "<h3 class='alerttext'>Fel: " + data.result + "</h3>");
			},
			error: function(data){
				$(".result").append( "<h3>Kan ej ansluta till databasen/server...</h3>" );
			}
		});
		return false; 
	});
}

function confirmemail(selector,token) {
	$(".dynamic-text").empty();
	$('#grayout').show();
	$("#grayout").attr("close","content-box");
	$('.dynamic-text').show();
	$(".dynamic-text").append("Laddar sidan...");
	moveInfo();

	$.ajax({
		dataType: "json",
		url: "inc/verifyemail.php",
		method : "post",
		data: { selector: selector, token: token},
		success: function(data)
		{
			$(".dynamic-text").empty();
			
			$(".dynamic-text").append(" \
				<div class='header'> \
					<h1>Skoterleder.org</h1> \
					<p></p> \
				</div> \
				<h2 class='collapsible do-login'>Verifiering av e-postadress.</h2>\
			");
			
			if ( data.result === "ok" ) {
				$(".dynamic-text").append(" \
					<div class='collapsdata'>\
						<p><br>\
						<h3>Din e-postadress är nu verifierad</h3>\
						<br><br>\
						Du är nu inloggad på skoterleder.org sidan med ditt konto.\
						<br>\
						</p>\
						<p class='linkButtonLong close'><a href='#' class='closeMarkerBox'>Stäng</a></p>\
					</div>\
				");
			} else {
				$(".dynamic-text").append(" \
					<div class='collapsdata'>\
						<p><br>\
						<h2>Resultat:</h2>\
						<h2 class='alerttext'>" + data.result + "</h2>\
						<br><br><br>\
						</p>\
						<p class='linkButtonLong close'><a href='#' class='closeMarkerBox'>Stäng</a></p>\
					</div>\
				");	
			}
			
			$('.content-box').slideDown(500);
			moveInfo();
			
			$(".close").click( function() {
				closeContenBox();
			});
		},
		error: function(data){
			$(".dynamic-text").append( "<h3>Kan ej ansluta till databasen/server...</h3>" );
		}
	});
}


function verifyResetPassword(selector,token) {
	$(".dynamic-text").empty();
	$('#grayout').show();
	$("#grayout").attr("close","content-box");
	$('.dynamic-text').show();
	$(".dynamic-text").append("Laddar sidan...");
	moveInfo();
	
	$.ajax({
		dataType: "json",
		url: "inc/forget.php",
		method : "post",
		data: { selector: selector, token: token, action: 'canReset'},
		success: function(data)
		{
			$(".dynamic-text").empty();
			
			$(".dynamic-text").append(" \
				<div class='header'> \
					<h1>Skoterleder.org</h1> \
					<p></p> \
				</div> \
				<h2 class='collapsible do-login'>Återställning av lösenord</h2>\
			");
			
			if ( data.result === "ok" ) {
				$(".dynamic-text").append(" \
				<div class='collapsdata'>\
					<p><br></p>\
					<h3>Ange ett nytt lösenord</h3>\
					<p>(Min 8 tecken)</p>\
					<div style='display: grid;'>\
					<form action='#' id='resetPasswordForm'>\
					<p><input type='password' name='password' class='inputText'></p>\
					<p><input type='submit' value='Spara lösenord' class='floatRight inputSubmit'</p>\
					<input type='hidden' name='selector' value='" + selector+ "'>\
					<input type='hidden' name='token' value='" + token+ "'>\
					<input type='hidden' name='action' value='resetPassword'>\
					</form>\
					<p class='result'></p> \
					</div>\
				</div>\
				");
			} else {
				var	msg = "";

				$(".dynamic-text").append(" \
				<div class='collapsdata'>\
					<p><br>\
					<h2>Resultat:</h2>\
					<h2 class='alerttext'>" + data.result + "</h2>\
					<br>\
					<br>\
					Prova med en ny återställning.\
					<br>\
					</p>\
					<p class='linkButtonLong closeMarkerBox closeExpandMarker'><a href='#' class='closeMarkerBox'>Stäng</a></p> \
				</div>\
				");	
			}
			
			$('.content-box').slideDown(500);
			moveInfo();
			
			$(".closeMarkerBox").click( function() {
				closeContenBox();
			});


			$("#resetPasswordForm").submit(function(form) {
				$(".result").empty();
				$(".result").append("<h4>Skickar...</h4>");

				$.ajax({
					dataType: "json",
					url: "inc/forget.php",
					method : "post",
					data: $("#resetPasswordForm").serialize(),
					success: function(data)
					{
						if ( data.result === "ok" ) {
							showAlert("Lösenord är ändrat");
							closeContenBox();
							return false;
						} else {
							$(".result").empty();
							$(".result").append( "<h3 class='alerttext'>Fel: " + data.result + "</h3>");
						}
					},
					error: function(data){
						$(".result").append( "<h3>Kan ej ansluta till databasen/server...</h3>");
						return false;
					}
				});
				return false; 
			});
		},
		error: function(data){
			$(".dynamic-text").append( "<h3>Kan ej ansluta till databasen/server...</h3>" );
		}
	});
}

function getUser() {
	$.ajax({
		dataType: "json",
		url: "/inc/getuser.php",
		success: function(data)
		{
			userEmail = data.userEmail;
			userName  = data.userName;
		},
		error: function(data){
			console.log("GetUser error:" + data);
		}
	});
}