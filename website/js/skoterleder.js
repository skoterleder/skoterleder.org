var markers;
var dataCache = [];
var icon = [];
var iconType = [];
var baseLayer;
var popup;
var timeout = new Date().getTime() + 1*60*1000; //add 1 minutes;
var paperRatio = 1.45;
var rectangle;
var swHandel;
var neHandel;
var seHandel;
var nwHandel;
var centerHandel;
var printIcon;
var noIcon;
		
$(document).ready(function() {
	
	$.ajaxSetup({ cache: false });
	swedishTimeago();
	var map = new L.Map('map', {center: new L.LatLng(64, 16), zoom: 6});
	
	var touchDev = false;
	if( /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent) ) {
		var touchDev = true;
	}

	moveAlertbox();
	
	if (window.location.hash) {
		hashControll();
	}
	
	var moreInfoButton = L.Control.extend({
		options: {
				position: 'topright'
		},
		onAdd: function (map) {
				// create the control container with a particular class name
				var container = L.DomUtil.create('div', 'leaflet-bar' );
				container.innerHTML += '<a href="#" class="showInfo text-bar-links">Mer Information</a>';
				
				return container;
		}
	});

	var addMarkerControllButton = L.Control.extend({
		options: {
				position: 'topright'
		},
		onAdd: function (map) {
				// create the control container with a particular class name
				var container = L.DomUtil.create('div', 'leaflet-bar');
				container.innerHTML += '<a href="#" class="addMarker text-bar-links">Ny Markör</a>';
				
				return container;
		}
	});
	var addQueryButton = L.Control.extend({
		options: {
				position: 'topright'
		},
		onAdd: function (map) {
				// create the control container with a particular class name
				var container = L.DomUtil.create('div', 'leaflet-bar leaflet-control-layers markerQuery');
				container.innerHTML += '<a href="#" class="text-bar-links queryLink">Mer!</a> \
					<div class="queryList"> \
					<h2>Visa:</h2> \
					<form class=""> \
					<div class="leaflet-control-layers-base"> \
					<label> \
						<input type="radio" id="removeAllMarkers" class="querySelector" name="querySelector"> \
						<span> Inga markörer</span> \
					</label> \
					<label> \
						<input type="radio" id="showAllMarkers" class="querySelector" name="querySelector" checked="checked"> \
						<span> Alla markörer</span> \
					</label> \
					<label> \
						<input type="radio" id="showNewMarkes" class="querySelector" name="querySelector" \
						<span> Nya/Ändrade markörer</span> \
					</label> \
					</div> \
					</form> \
					<p><a href="#" class="printMap text-bar-links">Skriv ut kartan</a><p> \
					</div> \
				';
				
				return container;
		}
	});

	var openOsmLink = L.Control.extend({
		options: {
				position: 'bottomleft'
		},
		onAdd: function (map) {
				// create the control container with a particular class name
				var touch = "";
				if (touchDev) var touch = "leaflet-touch ";

				var container = L.DomUtil.create('a', touch +
					'leaflet-control-attribution leaflet-control-links');
				container.href ='#';
				container.innerHTML ='Öppna i OSM';
				container.title = 'Öppna kartan i OpenStreetMap';

				container.onclick = function() {
					latlong = map.getCenter();
					zoom = map.getZoom();
					lat = latlong.lat;
					lng = latlong.lng;
					openLink = "http://www.openstreetmap.org/?lat=" 
						+ lat+"&lon="+lng+"&zoom="+zoom;
					window.open(openLink,'_blank');
				}
				
				return container;
		}
	});
	var openOsmEditLink = L.Control.extend({
		options: {
				position: 'bottomleft'
		},
		onAdd: function (map) {
				// create the control container with a particular class name
				var touch = "";
				if (touchDev) var touch = "leaflet-touch ";
				
				var container = L.DomUtil.create('a', touch +
					'leaflet-control-attribution leaflet-control-links');
				container.href ='#';
				container.innerHTML ='Editera i OSM';
				container.title = 'Öppna kartan i OpenStreetMap Editor';

				container.onclick = function() {
					latlong = map.getCenter();
					zoom = map.getZoom();
					if (zoom < 13) zoom=13; 
					lat = latlong.lat;
					lng = latlong.lng;
					openLink = "http://www.openstreetmap.org/edit?lat=" 
						+ lat+"&lon="+lng+"&zoom="+zoom;
					window.open(openLink,'_blank');
				}
				
				return container;
		}
	});

	var skoterleder = new L.tileLayer('http://tiles.skoterleder.org/tiles/{z}/{x}/{y}.png', {
		maxZoom: 14,
		attribution: '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> bidragsgivare, Imagery &copy; <a href="http://skoterleder.org">Skoterleder.org</a>, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
	});
	var osm = new L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		maxZoom: 18,
		attribution: '© <a href="http://openstreetmap.org">OpenStreetMap</a> bidragsgivare, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
	});
	var overl = new L.tileLayer('http://overl.skoterleder.org/tiles/{z}/{x}/{y}.png', {
		maxZoom: 16,
		attribution: '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> bidragsgivare, Imagery &copy; <a href="http://skoterleder.org">Skoterleder.org</a>, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
	});
	var info = new L.tileLayer('http://overl.skoterleder.org/info/{z}/{x}/{y}.png', {
		maxZoom: 16,
		attribution: '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> bidragsgivare, Imagery &copy; <a href="http://skoterleder.org">Skoterleder.org</a>, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
	});

	var ggl = new L.Google("ROADMAP");
	var ggh = new L.Google("HYBRID");
	var ggt = new L.Google("TERRAIN");

	map.addLayer(skoterleder);
	var layersControl = new L.Control.Layers( {
				'Skoterleder.org':skoterleder, 
				'Open Street Map':osm, 
				'Google Road':ggl, 'Google Satelit':ggh, 'Google Terräng':ggt},
				{'Visa skoterleder':overl, 'Visa information':info }
			);

	map.addControl(new moreInfoButton()); 
	map.addControl(new addMarkerControllButton()); 
	map.addControl(new addQueryButton());
	map.addControl(layersControl);
	map.addControl(new openOsmLink()); 
	map.addControl(new openOsmEditLink());


	// Icons from http://mapicons.nicolasmollet.com/
	icon[1] = 'images/icons/snowmobile-green.png';
	icon[2] = 'images/icons/information.png';
	icon[3] = 'images/icons/treedown.png';
	icon[4] = 'images/icons/caution.png';
	icon[5] = 'images/icons/fixmap.png';
	
	
	iconType[0] = L.icon({
		iconUrl: 'images/icons/question.png',
		iconSize:	 [32, 37], // size of the icon
		iconAnchor:   [16, 37], // point of the icon which will correspond to marker's location
		popupAnchor:  [0, -33] // point from which the popup should open relative to the iconAnchor
	});
	iconType[1] = L.icon({
		iconUrl: 'images/icons/snowmobile-green.png',
		iconSize:	 [32, 37], // size of the icon
		iconAnchor:   [16, 37], // point of the icon which will correspond to marker's location
		popupAnchor:  [0, -33] // point from which the popup should open relative to the iconAnchor
	});
	iconType[2] = L.icon({
		iconUrl: 'images/icons/information.png',
		iconSize:	 [32, 37], // size of the icon
		iconAnchor:   [16, 37], // point of the icon which will correspond to marker's location
		popupAnchor:  [0, -33] // point from which the popup should open relative to the iconAnchor
	});
	iconType[3] = L.icon({
		iconUrl: 'images/icons/treedown.png',
		iconSize:	 [32, 37], // size of the icon
		iconAnchor:   [16, 37], // point of the icon which will correspond to marker's location
		popupAnchor:  [0, -33] // point from which the popup should open relative to the iconAnchor
	});
	iconType[4] = L.icon({
		iconUrl: 'images/icons/caution.png',
		iconSize:	 [32, 37], // size of the icon
		iconAnchor:   [16, 37], // point of the icon which will correspond to marker's location
		popupAnchor:  [0, -33] // point from which the popup should open relative to the iconAnchor
	});
	iconType[5] = L.icon({
		iconUrl: 'images/icons/fixmap.png',
		iconSize:	 [32, 37], // size of the icon
		iconAnchor:   [16, 37], // point of the icon which will correspond to marker's location
		popupAnchor:  [0, -33] // point from which the popup should open relative to the iconAnchor
	});
	iconType['move'] = L.icon({
		iconUrl: 'images/icons/move.png',
		iconSize:	 [35, 35], // size of the icon
		iconAnchor:   [17, 17], // point of the icon which will correspond to marker's location
		popupAnchor:  [17, 0] // point from which the popup should open relative to the iconAnchor
	});
	iconType['corner'] = L.icon({
		iconUrl: 'images/icons/corner.png',
		iconSize:	 [14, 14], // size of the icon
		iconAnchor:   [7, 7], // point of the icon which will correspond to marker's location
		popupAnchor:  [7, 0] // point from which the popup should open relative to the iconAnchor
	});	

	// Laddar alla markörer med lite fördröjning.
	setTimeout(function() {	
		loadmarkers();
	}, 1000);

	// Fix map size after return to map page
	$( document ).delegate("#mapPage", "pageshow", function() {
		map.invalidateSize(false);
	});
	
	// add location control to global name space for testing only
	// on a production site, omit the "lc = "!
	lc = L.control.locate({
		follow: true,
		onLocationError: function(err) {showAlert("Kunde inte hitta din position")},
		strings: {
			title: "Visa var jag är",  // title of the locate control
			popup: "Du är inom ca {distance} {unit} från denna punkt.",  // text to appear if user clicks on circle
		},
		locateOptions: {
			maxZoom: 14,
			enableHighAccuracy: true,
		}
	}).addTo(map);

	map.on('startfollowing', function() {
		map.on('dragstart', lc.stopFollowing);
	}).on('stopfollowing', function() {
		map.off('dragstart', lc.stopFollowing);
	});

	map.on('dragend', function(e) {
		updateMapHash(); 
	});
	map.on('zoomend', function(e) {
		updateMapHash(); 
	});
	map.on('popupclose', function(e) {
		updateMapHash(); 
	});

	map.on('baselayerchange', function(e) {
		baseLayer = "";
		if (e.name === "Open Street Map" ) baseLayer = "o";
		if (e.name === "Google Road" ) baseLayer = "g";
		if (e.name === "Google Satelit" ) baseLayer = "s";
		if (e.name === "Google Terräng" ) baseLayer = "t";
		
		setTimeout(function() {	
			console.log(e);
			if (e.name === "Skoterleder.org" ) {
				map.removeLayer(overl);
			} else {
				map.addLayer(overl);
			}
			layersControl._update();

		}, 200);
		
		updateMapHash();
	});

	function updateMapHash(){
		var zoom = map.getZoom();
		var latlng = map.getCenter();
		var lat = latlng.lat.toFixed(4);
		var lng = latlng.lng.toFixed(4);
		var layer = "";
		if (baseLayer) var layer = "/" + baseLayer
		
		location.replace("#map/" + zoom + "/" + lat + "/" + lng + layer); 

		if(new Date().getTime() > timeout) {
			timeout = new Date().getTime() + 1*60*1000; //add 15 minutes;
			console.log("New time");
			ga('send', 'pageview',window.location.hash);
		}
	}

	function openMarkerPopup(a,show) {
		var title;
		var description;

		if (a > 0) {  // a kan vara både ett id eller ett objekt ifrån en markör. 
			var id=a;
			var linkin = true;
		} else {
			var id = a.layer.options.id;
			popup = L.popup( {offset: new L.Point(0, -27)})
				.setLatLng(a.latlng)
				.setContent("Laddar &nbsp;&nbsp;<img src='images/ajax-loader.gif'  width='16' height='16'>")
				.openOn(map);	
		}

		location.replace("#marker/"+id); 

		var loadtime = 0;
		if (typeof dataCache[id] != 'undefined') loadtime = dataCache[id].loadtime;
		
		if (loadtime > (new Date().getTime() - 60*1000)) {
			// Using cached data for 1 minute.
			dispalyMarker(id,dataCache[id],linkin,show);
			console.log("Used cached data");
		} else {
			$.getJSON('inc/getmarker.php?id='+id, function(data) {
				data.loadtime = new Date().getTime(); 
				dataCache[id] = data;

				dispalyMarker(id,data,linkin,show);
			})
			.error(function(jqXHR, textStatus, errorThrown){ /* assign handler */
					alert(jqXHR.responseText);
					alert(textStatus);
			});	
		}
	}

	function dispalyMarker(id,data,linkin,show) {
		if (data.title === "error") {
			return false
		}

		var title = data.title;
		var description = data.description;
		var name = data.name;
		var showtime = data.createtime;
		var updatetime = data.updatetime;
		var latlng = data.latlng;
		var comments = data.comments;
		var maxPopupWidth = 280;
		if ($(window).width() < 480) maxPopupWidth = 200;
		var hedline = "Skapad"
		if (updatetime) {	// if marker is change
			hedline = "Ändrad"
			showtime = updatetime;
		}
		var created = jQuery.timeago(showtime);			
		
		document.title = "Skoterleder.org - " + title;
		ga('send', 'pageview',window.location.hash);
		
		var container = $('<div />');
		
		container.on('click', '.okLink', function() {
			loadMarkerPanel(id);
			return false;
			});
		container.on('click', '.cancelLink', function() {
			map.removeLayer(popup);
			document.title = "Skoterleder.org - Snöskoterkarta!"
			updateMapHash();
			return false;
		});
		container.on('click', '.linkThis', function() {
			location.replace("#marker/"+id); 
			return false;
		});		
		container.on('click', '.linkZoom', function() {
			map.setView(latlng,11)
			location.replace("#marker/"+id); 
			return false;
		});	

		if (!linkin) map.removeLayer(popup); 	// Removing "laddar" popup

		var inactivText =""
		if (data.status != "1") inactivText ="<p class='alerttext'>Denna markör är inte aktiv och syns inte på kartan</p>";
		
		container.html( inactivText + " \
			<h2>"+title+"</h2><p>"+description.replace(/\r?\n/g, '<br>')+"</p> \
			<div class='pupupdivider'></div> \
			<p class='textlink'>" + hedline + " av: "+ name + " <br>\
			" + created + "&nbsp;&nbsp; <img src='images/icons/comment.png' \
			 title='Kommentarer' class='iconImg' width='14' height='12'> " + comments + " \
			 &nbsp;&nbsp; \
			 <img src='images/icons/open.png' title='Visad " + data.count + " ggr' \
			 width='16' height='12' class='iconImg'> \
			" + data.count + " \
			</p> \
			<a href='#marker/"+id+"' class='linkThis textlink floatRight'>Länk hit</a> \
			<a href='#marker/"+id+"' class='linkZoom textlink floatRight'>Zoom</a> \
			</p> \
			<div class=''> \
			<p id='popupLinks' class='floatRight'><a href='#' class='okLink linkButton'> \
			Mer information</a> <a href='#' class='cancelLink linkButton'>Stäng</a></p> \
			</div><div class='clearboth'></div> \
			");

				//	<a href='#marker/"+id+"/change' rel='external'>Radera/Ändra</a>	</p>\

		popup = L.popup( {offset: new L.Point(0, -27),maxWidth: maxPopupWidth,})
		.setLatLng(latlng)
		.setContent(container[0])
		.openOn(map);		

		if (linkin) map.setView(latlng,11);
		
		location.replace("#marker/"+id); 
		
		if (show === "show") loadMarkerPanel(id);

	}

	function loadMarkerPanel(id){
		$("#showMarkerBox").empty();
		
		$("<p>").text("Laddar...").appendTo("#showMarkerBox");
		
		var loadtime = 0;
		if (typeof dataCache[id] != 'undefined') loadtime = dataCache[id].loadtime;
		
		if (loadtime > (new Date().getTime() - 60*1000)) {
			// Using cached data for 1 minute.
			dispalyMarkerPanel(id,dataCache[id]);
			console.log("Used cached data");
		} else {
			$.getJSON('inc/getmarker.php?id='+id, function(data) {
				data.loadtime = new Date().getTime();
				dataCache[id] = data;
				dispalyMarkerPanel(id,data);
			})
			.error(function(jqXHR, textStatus, errorThrown){ /* assign handler */
					alert(jqXHR.responseText);
					alert(textStatus);
			});		
		}
		
		showbox('#showMarkerBox');
		
	}

	function dispalyMarkerPanel(id,data) {
		var avatarlink  = "<img src='http://www.gravatar.com/avatar/" + data.md5 + "?d=retro&s=50.jpg' class='floatLeft'>";
		var changeHTMLtext = "";
		var commentsHTMLtext = "";
		var shareUrl = serverUrl + "marker/?id=" + id;
		if (data.updatetime) changeHTMLtext = "<p class='narrow'>Ändrad: " + data.updatetime + "</p>";
		if (data.commenttime) commentsHTMLtext = "<p class='narrow'>Senaste kommentar: " + data.commenttime + "</p>";  // Not in use!
		
		location.replace("#marker/"+ id + "/show");
		document.title = "Skoterleder.org - " + data.title;
		ga('send', 'pageview',window.location.hash);

		$("#showMarkerBox").empty();
		$('#showMarkerBox').css('overflow','auto');

		var div = $("<div>").addClass("markerContent").appendTo("#showMarkerBox");
		
		div.on('click', '.closeMarkerBox', function() {
			hidebox('#showMarkerBox');
			document.title = "Skoterleder.org - Snöskoterkarta!"
			updateMapHash();
			setTimeout(function(){$("#showMarkerBox").empty()}, 700);
			return false;
		});

		div.on('click', '.adminMail', function() {
			$("#displayInfo").empty();
			$("#displayInfo").append(" \
			<p>För att ändra denna markör krävs en ändra länk.</p> \
			<p>Länken skickas bara till skaparen av markören, fylli din mailadress nedan.</p> \
			<form action='#' id='adminMail'><input id='nemail' type='text' name='email' value='Din e-post adress'>\
			<p><input type='submit' value='Skicka' class='inputbutton'> \
			<input type='button' value='Avbryt' class='close inputbutton'></p>\
			<input type='hidden' name='id' value='" + id + "'></form> \
			<p>Som icke skapare av markören kan du föreslå ändringar via kommentars fältet.</p> \
			");

			if (readCookie("email")) $("#nemail").val(readCookie("email"));
			$("#displayInfo").slideDown();

			$("#adminMail").submit(function(form) {
				$("#displayInfo").append("<h4>Skickar...</h4>");

				$.ajax({
					type: "GET",
					url: "inc/markermail.php",
					data: $("#adminMail").serialize(), // serializes the form's elements.
					success: function(data)
					{
						$("#displayInfo").append("<h3>E-post skickat till dig</h3>");
						
						setTimeout(function() {	
							$("#displayInfo").slideUp( "slow", function() {
								$("#displayInfo").empty();
							});
						}, 1500);
						return false;
					},
					error: function(data){
						$("#displayInfo").append("<b>Kopplingsfel eller liknande, försök igen senare!</b>");
						// $(".error").html("Kopplingsfel eller liknande, försök igen senare!");
						return false;
					}
				});
				return false; 
			});
			return false;
		});
		div.on('click', '.adminFlag', function() {
			$("#displayInfo").empty();
			$("#displayInfo").append(" \
			<h3>Flagga denna markör som olämplig</h3> \
			<p>Använd denna funktion bara när inehållet är kränkande eller på annat sätt olämpligt.</p> \
			<form action='#' id='flagMarker'> \
			<p><textarea id='flagDesc' name='description' rows='5'>Kort motivering</textarea></p> \
			<p><input type='submit' value='Skicka' class='inputbutton'> \
			<input type='button' value='Avbryt' class='close inputbutton'></p> \
			<input type='hidden' name='hash' value='" + data.hash + "'> \
			<input type='hidden' name='id' value='" + id + "'></form> \
			");
			
			if (readCookie("email")) $("#nemail").val(readCookie("email"));
			$("#displayInfo").slideDown();

			$("#flagMarker").submit(function(form) {
				$("#displayInfo").append("<h4>Skickar...</h4>");

				$.ajax({
					type: "GET",
					url: "inc/flag.php",
					data: $("#flagMarker").serialize(), // serializes the form's elements.
					success: function(data)
					{
						$("#displayInfo").append("<h3>Skaparen av markören och administratör meddelad</h3>");
						setTimeout(function() {	
							$("#displayInfo").slideUp( "slow", function() {
								$("#displayInfo").empty();
							});
						}, 2500);
						return false;
					},
					error: function(data){
						$("#displayInfo").append("<b>Kopplingsfel eller liknande, försök igen senare!</b>");
						// $(".error").html("Kopplingsfel eller liknande, försök igen senare!");
						return false;
					}
				});
				return false;
			});
			return false;
		});

		div.on('click', '.close', function() {
			$("#displayInfo").slideUp( "slow", function() {
				$("#displayInfo").empty();
			});
			return false;
		});
		div.on('click', '#nemail', function() {
			if ($("#nemail").val() === "Din e-post adress") $("#nemail").val("");
		});
		div.on('click', '#flagDesc', function() {
			if ($("#flagDesc").val() === "Kort motivering") $("#flagDesc").val("");
		});
		div.on('click', '.showShareLink', function() {
			if (!$('.shareLinkText').length ) {
				$( ".showShareLink" ).after( "<p><input type='text' value='" + shareUrl +
					"' class='shareLinkText'></p>" );
			}
			location.replace("#marker/"+ id + "/show");
			return false;
		});		

		if (data.status != "1") {
			$("<p>").addClass("alerttext").html("Denna markör är inte aktiv och syns inte på kartan").appendTo(div);
		}
		$("<h3>").html(data.title).appendTo(div);
		$("<p>").html(data.description.replace(/\r?\n/g, '<br>')).appendTo(div);

		$(div).append(" \
		<table><tr><td>\
		<div class='submitterAvatar'>" + avatarlink + " </div> \
		</td><td class='textlink'>\
		<p class='narrow'>Skapad av: " + data.name + " </p> \
		<p class='narrow'>Skapad: " + data.createtime + " </p> " + changeHTMLtext + " \
		</td></tr></table> \
		<p class='narrow'><a href='#' class='adminMail textlink'>Ändra denna markör</a> \
		<a href='#' class='adminFlag textlink'>Flagga som olämpligt</a></p> \
		<div id='displayInfo'></div> \
		<div id='fbshare'> \
		<div class='fb-like' data-href='" + shareUrl + "' \
		data-width='280' data-layout='standard' data-action='like' \
		data-show-faces='true' data-share='true'></div></div> \
		<p class='narrow'><a href='#marker/"+id+"/show' class='textlink showShareLink'>Visa dela-länk</a></p> \
		"
		); 

		$("<p>").addClass("linkButtonLong closeMarkerBox").html("<a href='#' class='closeMarkerBox'>Stäng</a>").appendTo(div);
		$("<div>").attr("id","disqus_thread").appendTo(div);
		$("<p>").addClass("linkButtonLong closeMarkerBox").html("<a href='#' class='closeMarkerBox'>Stäng</a>").appendTo(div);
		
		$( "#showMarkerBox" ).data( "markerid", id);
		$( "#showMarkerBox" ).data( "hash", data.hash);
	
		if(typeof FB == 'object') {  // Fix problem then lading marker page direct
			FB.XFBML.parse(document.getElementById('fbshare'));
		}
		loadDisqus(id,data.title,'marker');
		setTimeout(check_showMarkerBox_Width, 3000);
	}

	function check_showMarkerBox_Width() { // Then using facebook the overflow must be visible
		var divWidth = $('#showMarkerBox')[0].scrollWidth;

		if (divWidth > 400) {
			$('#showMarkerBox').css('overflow','visible');
		}

		if ($('#showMarkerBox').css('margin-left') === '0px' ) setTimeout(check_showMarkerBox_Width, 1000);
	}	
	
	function changeMarker(id, hash) { 
	
		saveButtonText = "Spara";
		
		$("#showMarkerBox").empty();
		$("<p>").text("Laddar...").appendTo("#showMarkerBox");
		
		ga('send', 'pageview','#changeMarker/'+id);
		
		$.getJSON('inc/getmarker.php?id='+id, function(data) { 

			$("#showMarkerBox").empty();
		
			// console.log(data);
			map.setView(data.latlng,11);
			// data.description = data.description.replace(/<br ?\/?>/g, "");
			var avatarlink  = "<img src='http://www.gravatar.com/avatar/" + data.md5 + "?d=retro&s=50.jpg' class='floatLeft'>";
			
			document.title = "Skoterleder.org - Ändra - " + data.title;
			location.replace("#marker/"+ id + "/change/" + hash); 
			
			var div = $("<div>").addClass("markerContent").appendTo("#showMarkerBox");

			$("<h3>").html("Ändring av markör").appendTo(div);
			
			if (data.status === "0") {
				saveButtonText = "Spara och aktivera";
				$("<p>").addClass("alerttext").html("Markör inte aktiverad").appendTo(div);
			}
			if (data.status === "-1") {
				saveButtonText = "Spara och återaktivera";
				$("<p>").addClass("alerttext").html("Markören är inte aktiv").appendTo(div);
			}
			
			var form = $("<form>", 
						{ action:'#', id: "changeMarkerForm" }
					);
			form.append( $("<label>", {for:'ctitle'}).text("Rubrik"));
			form.append( $("<input>", 
						{ 
							type:'text', 
							name:'title', 
							id:'ctitle' ,
							value: decodeEntities(data.title)
						}
					));

			form.append( $("<label>", {for:'cdescription'}).text("Beskrivning"));
			form.append( $("<textarea>", 
						{ 
							name:'description', 
							id:'cdescription',
							rows:6,
						}
					)); // cdescription .text(decodeEntities(data.description).replace(/(\r\n|\r|\n)/g, '\r\n')));

			form.append( $("<input>", 
						{ 
							type:'hidden', 
							name:'id', 
							id:'cid',
							value: id
						}
					));
			form.append( $("<input>", 
						{ 
							type:'hidden', 
							name:'hash', 
							id:'chash',
							value: hash
						}
					));
			form.append( $("<input>", 
						{ 
							type:'hidden', 
							name:'action', 
							value:'change'
						}
					));
			if (data.status === "-1") form.append( $("<p>").html("OBS! Överväg att skapa ny\
										markör i stället för att återaktivera en gamla om \
										ämnet inte är den samma."));
			
			form.append( $("<input>", 
						{ 
							type:'submit',
							value:saveButtonText,
							class:'inputbutton floatRight'
						}
					));

			$(form).appendTo(div);
			
			$("#cdescription").val(decodeEntities(data.description).replace(/(\r\n|\r|\n)/g, '\r\n'));
			
			$("<div>").addClass("clearboth").appendTo(div);
			$("<p>").addClass("error").appendTo(div);
			$("<h4>").html("Skapad av:").appendTo(div);
			$("<div>").addClass("submitterAvatar").html(avatarlink).appendTo(div);
			
			$("<p>").addClass("narrow").html("Skapad av: " + data.name).appendTo(div);
			$("<p>").addClass("narrow").html("Skapad den: " + data.createtime).appendTo(div);
			
			if (data.updatetime) $("<p>").addClass("narrow").html("Senast ändrad: " + data.updatetime).appendTo(div);
			if (data.commenttime) $("<p>").addClass("narrow").html("Senaste kommentar: " + data.commenttime).appendTo(div);
		

			$("<p>").addClass("linkButtonLong closeMarkerBox").html("<a href='#' class='closeMarkerBox'>Stäng</a>").appendTo(div);
			
			if (data.status === "1") $("<p>").addClass("linkButtonLong removeMarkerButton").text("Inaktivera markör").appendTo(div);
			
			$("<p>").addClass("linkButtonLong showCommentsButton").text("Visa kommentarer").appendTo(div);
			
			$('<div>', {id: 'disqus_thread'}).appendTo(div);
			
			div.on('click', '.closeMarkerBox', function() {
				hidebox('#showMarkerBox');
				updateMapHash();
				return false;
				});
			div.on('click', '.removeMarkerButton', function() {
					if (confirm('Inaktivera markören?')) {
						ajaxUpdateMarker(id,hash,"remove");
					} else {
						return false;
					}
				
				});				
			div.on('click', '.showCommentsButton', function() {
				loadDisqus(id,data.title,'marker');
				$('.showCommentsButton').hide();
				$("<p>").addClass("linkButtonLong closeMarkerBox").html("<a href='#' class='closeMarkerBox'>Stäng</a>").appendTo(div);
				});	

			if (data.status != "1") {				//Show marker for none active markers
				tmpMarker = L.marker(data.latlng, {
						opacity: 0.3,
						}).addTo(map).bindPopup("Markörens placering").setIcon(iconType[data.type]);
			}

			
			$("#changeMarkerForm").submit(function(form) {
				$(".error").css('color', '');
				$(".error").html("Sparar... <img src='images/ajax-loader.gif' width='16' height='16'>");
				
				$.ajax({
					type: "GET",
					url: "inc/updatemarker.php",
					data: $("#changeMarkerForm").serialize(), // serializes the form's elements.
					success: function(data)
					{
						// console.log(data);
						if (data.substr(0,5) === "error") {
							$(".error").html(data);
							$(".error").css('color', 'red');
							console.log("Save Error");
							console.log("data");
							
						} else {
							$(".error").html("Sparat!");
							showAlert("Markör Sparad!");
							hidebox('#showMarkerBox'); // or hashControll();
							console.log("Sparat ok!");
							loadmarkers();
							ga('send', 'pageview','#marker/'+id+'/saved'); //#changeMarker/17
						}
					},
					error: function(data){
						$(".error").html("Kopplingsfel eller liknande, försök igen senare!");
					}
				});

				return false; // avoid to execute the actual submit of the form.
			});
				
			
			
			
			
			

		})
		.error(function(jqXHR, textStatus, errorThrown){ /* assign handler */
				alert(jqXHR.responseText);
				alert(textStatus);
		});		
		
		showbox('#showMarkerBox');
	}

	function ajaxUpdateMarker(id, hash,action) {

		$.ajax({
			type: "GET",
			url: "inc/updatemarker.php?id="+id+"&hash="+hash+"&action="+action ,
			success: function(data)
			{
				// console.log(data);
				if (data === "Ok:1") {
					if (action === "activate") {
						openMarkerPopup(id);					
						showAlert("Markör aktiverad");
					}
					if (action === "remove") {
						showAlert("Markör inaktiverad");
						// hashControll();
						hidebox('#showMarkerBox');
						loadmarkers();
					}
				} else if(data === "Ok:0") {  // Markören är troligen redan aktiverad.
					if (action === "activate") openMarkerPopup(id); 
				} else {
					//$(".error").html(data);
					showAlert("Error " + data);					
				} 
			},
			error: function(data){
				showAlert("Kopplingsfel eller liknande, försök igen senare!"); 
			}
		});
	}
	
	function addNewMarker() {
		if (typeof addMarker != 'undefined') {
			if (addMarker._icon) { // There is already a icon on screen, move it to new center of map
				addMarker.setLatLng(map.getCenter());
				
				coordinate = addMarker.getLatLng();
				$("#lat").val(coordinate.lat);
				$("#lng").val(coordinate.lng);
				
				return false;
			}
		}
			
		if (readCookie("name")  && !$("#name").val())  $("#name").val(readCookie("name"));
		if (readCookie("email") && !$("#email").val()) $("#email").val(readCookie("email"));
		
		var container = $('<div />');

		container.on('click', '.okLink', function() {
			showbox('#newMarkerBox');
			ga('send', 'pageview','#newmarker');
		});
		container.on('click', '.cancelLink', function() {
			map.removeLayer(addMarker)
			hidebox('#newMarkerBox');
		});

		container.html("<p>Flytta markören till rätt plats och klicka sedan på ok för att fylla på med mera information.</p><p><a href='#' class='okLink inputbutton'>OK</a> <a href='#' class='cancelLink inputbutton'>Avbryt</a></p>");

		addMarker = L.marker(map.getCenter(), {
			draggable:true,
			opacity: 0.8,
			}).addTo(map).bindPopup(container[0],{maxWidth:200,}).setIcon(iconType[0]);
			
		coordinate = addMarker.getLatLng();
		$("#lat").val(coordinate.lat);
		$("#lng").val(coordinate.lng);
		
		setTimeout( function()  {	// Delay the pop up to make it work...
				addMarker.openPopup();
			}, 100);
			
		addMarker.on('dragend', function(e){
			coordinate = addMarker.getLatLng();
			$("#lat").val(coordinate.lat);
			$("#lng").val(coordinate.lng);
		});
	}

	function myMarkers(ehash) {
		var windowWidth = $(window).width()
		if (windowWidth < 600) {
			$("#listBox").width( windowWidth )
		}
		
		$("#listBox").empty();
		$("#listBox").show();
		
		$("<p>").text("Laddar...").appendTo("#listBox");
		
		$.getJSON('inc/data.php?ehash='+ehash, function(data) {
		
			var avatarlink  = "<img src='http://www.gravatar.com/avatar/" + data.md5 + "?d=retro&s=50.jpg' class='floatLeft'>";
			
			document.title = "Skoterleder.org - Mina markörer";
			
			$("#listBox").empty();

			var div = $("<div>").addClass("markerContent").appendTo("#listBox");
			
			div.on('click', '.closeMarkerBox', function() {
				$("#listBox").empty();
				$("#listBox").hide();
				return false;
			});
				
			div.on('click', '.zoomToClick', function() {
				var latlng = [];
				latlng[0] = $(this).data('lat');
				latlng[1] = $(this).data('lng');
				map.setView(latlng,11);
				return false;
			});
			div.on('click', '.editClick', function() {
				changeMarker($(this).data('id'),$(this).data('hash'));
				return false;
			});
			div.on('click', '.showClick', function() {
				loadMarkerPanel($(this).data('id'));
				return false;
			});
			

			$("<h2>").html("Mina markörer:").appendTo(div);
			
			for(var i=0;i<data.marker.length;i++){
				var point = data.marker[i];
			
				var dim="";
				if (point.properties.status != "1") dim=" dim ";
				$("<p>").html("<img src='" + icon[point.icon] + "' class='floatLeft " + dim + "'>"+point.properties.title).appendTo(div);
				$("<p>").addClass("narrow").html("<img src='images/icons/comment.png' title='Kommentarer' class='iconImg'> "
					+point.properties.comments + 
					" <a href='#' class='zoomToClick textlink' title='Zooma in kartan där markören är'" +
					" data-lat='" + point.coordinates[0] + "' " + 
					" data-lng='" + point.coordinates[1] + "' " +
					">Zoom</a>" +
					" <a href='#' class='editClick textlink' title='Ändra på markören' " +
					" data-id='" + point.properties.id + "' " + 
					" data-hash='" + point.properties.hash + "' " + 
					">Ändra</a>" +
					" <a href='#' class='showClick textlink' title='Visa markören' " +
					" data-id='" + point.properties.id + "' " + 
					">Mer information</a>" 


					).appendTo(div);
				$("<div>").addClass("clearboth line").appendTo(div);
			}			
			
			
			
			$("<p>").addClass("narrow").html("<a href='#mymarkers/" + ehash + "'>Länk</a> till denna lista. " + 
			"OBS var rädd om länken eftersom dom som har den kan ändra på alla dina markörer!").appendTo(div);
	
			$("<p>").addClass("linkButtonLong closeMarkerBox").html("<a href='#' class='closeMarkerBox'>Stäng</a>").appendTo(div);
			

			
		})
		.error(function(jqXHR, textStatus, errorThrown){ /* assign handler */
				alert(jqXHR.responseText);
				alert(textStatus);
		});		
		
		
		// showbox('#showMarkerBox');
		
	}
	
	function loadmarkers(q) {
		if (!q) q = "";
		
		if (markers) {
			map.removeLayer(markers);
			markers = new L.MarkerClusterGroup();
			
			if (popup) map.removeLayer(popup);
		} else {
			markers = new L.MarkerClusterGroup();
		}
		
		$.getJSON('inc/data.php?q='+q, function(points) {
			for(var i=0;i<points.marker.length;i++){
				var point = points.marker[i];
				markers.addLayer(new L.marker(point.coordinates, point.properties).setIcon(iconType[point.icon]));
			}
		})
		.error(function(jqXHR, textStatus, errorThrown){ /* assign handler */
				showAlert("Error loading marker");
				console.log(jqXHR.responseText);
				console.log(textStatus);
		});

		map.addLayer(markers);

		markers.on('click', function (a) {  
			openMarkerPopup(a);
		});			

		}

	$("#addMarkerForm").submit(function(form) {

		var name = $("#name").val();
		var email = $("#email").val();
		createCookie("name",name,30);
		createCookie("email",email,30);
		
		$(".error").css('color', 'green');
		$(".error").css('color', '');
		$(".error").html("Sparar... <img src='images/ajax-loader.gif' width='16' height='16'>");
		
		$.ajax({
			type: "GET",
			url: "inc/savemarker.php",
			data: $("#addMarkerForm").serialize(), // serializes the form's elements.
			success: function(data)
			{
				console.log(data);
				if (data.substr(0,5) === "error") {
					$(".error").html(data);
					$(".error").css('color', 'red');
					console.log("Save Error");
					
				} else {
					
					$(".error").html(""); 		// Clears all field after success save.
					$("#title").val("");
					$("#description").val("");
					hidebox('#newMarkerBox');

					var latlng = [$("#lat").val(),$("#lng").val()];
					var icon = $("#type").val();
					
					tmpMarker = L.marker(latlng, {
						opacity: 0.3,
						}).addTo(map).bindPopup("Kontrollera din mail för att<br>aktivera din nya markör!").setIcon(iconType[icon]);
						
					setTimeout(  // Öppnar upp poppupen med lite fördröjning för att få det att funka bra!
						function() 
						{	
							tmpMarker.openPopup();
							map.removeLayer(addMarker);
						}, 300);
				}
			},
			error: function(data){
				$(".error").html("Kopplingsfel eller liknande, försök igen senare!");
			}
		});

		return false;
	});

	function initprint(){
		var div = $("<div>").addClass("").appendTo("#shareBox");
		$(div).append(" \
			<h2>Välja format:</h2> \
			<label><input type='radio' name='ratio' class='changeRatio' value='landscape' checked> Liggande </label> \
			<label><input type='radio' name='ratio' class='changeRatio' value='portrait'> Stående </label> \
			<label><input type='radio' name='ratio' value='free'> Fritt </label> \
			<p class='linkButtonLong preview'><a href='#' class='preview closeMarkerBox'>Förhandsgranska</a></p> \
			<p class='linkButtonLong abort'><a href='#' class='abort closeMarkerBox'>Avbryt</a></p> \
			"
		); 
		$("#shareBox").slideDown();
		
		div.on('click', '.preview', function() {
			zoom = map.getZoom();
			bounds = rectangle.getBounds()
			center = L.latLngBounds(bounds).getCenter();
			swPix = map.latLngToLayerPoint(L.latLngBounds(bounds).getSouthWest());
			nePix = map.latLngToLayerPoint(L.latLngBounds(bounds).getNorthEast());	
			width = nePix.x - swPix.x;
			height = swPix.y - nePix.y;
			
			w=window.open(serverUrl + 'print/?zoom='+zoom+'&lat='+center.lat+'&lng='+center.lng+'&width='+width+'&height='+height);
			return false;
		});	
		div.on('click', '.abort', function() {
			$("#shareBox").empty();
			$("#shareBox").hide();
			map.removeLayer(rectangle);
			map.removeLayer(swHandel);
			map.removeLayer(neHandel);
			map.removeLayer(seHandel);
			map.removeLayer(nwHandel);
			map.removeLayer(centerHandel);
			return false;
		});	
		div.on('click', '.changeRatio', function() {
			c = map.latLngToLayerPoint( centerHandel.getLatLng());
			bounds = rectangle.getBounds();
			ne = map.latLngToLayerPoint(L.latLngBounds(bounds).getNorthEast());
			sw = map.latLngToLayerPoint(L.latLngBounds(bounds).getSouthWest());
			x = ne.x - sw.x;
			y = sw.y - ne.y;
			
			console.log("cpx:"+c.x+":"+c.y); 
			var selectedFormat = $("input[type='radio'][name='ratio']:checked").val();
			if (selectedFormat === "portrait") x = y / paperRatio;
			if (selectedFormat === "landscape") x = y / (1/paperRatio);
			console.log(selectedFormat);
			
			if (x/y > paperRatio) {
				//y = screenSize.y -120;
				//x = y * paperRatio;
			} else {
				//x = screenSize.x -150;
			//	y = x / paperRatio;
			}
			newSw = map.layerPointToLatLng([c.x-(x/2) , c.y+(y/2)]);
			newNe = map.layerPointToLatLng([c.x+(x/2) , c.y-(y/2)]);
		
			rectangle.setBounds([newSw,newNe]);
			moveHandels();
		});
		
		screenSize = map.getSize();
		center = map.getCenter();

		if (screenSize.x / screenSize.y > paperRatio) {
			y = screenSize.y -120;
			x = y * paperRatio;
		} else {
			x = screenSize.x -150;
			y = x / paperRatio;
		}
		c = map.latLngToLayerPoint( center );
		sw = map.layerPointToLatLng([c.x-(x/2) , c.y+(y/2)]);
		ne = map.layerPointToLatLng([c.x+(x/2) , c.y-(y/2)]);
	
		rectangle = L.rectangle([sw,ne], {color: "#444444", weight: 3, fill:true, fillColor:"#D2D6C6",fillOpacity:0.4}).addTo(map);

		swHandel = L.marker(center, 
			{draggable:true,opacity: 1}).setIcon(iconType['corner']).addTo(map);
		neHandel = L.marker(center, 
			{draggable:true,opacity: 1}).setIcon(iconType['corner']).addTo(map);
		seHandel = L.marker(center, 
			{draggable:true,opacity: 1}).setIcon(iconType['corner']).addTo(map);
		nwHandel = L.marker(center, 
			{draggable:true,opacity: 1}).setIcon(iconType['corner']).addTo(map);
			
		centerHandel = L.marker(center, 
			{draggable:true,opacity: 0.6,title: "Dra för att flytta området",}).setIcon(iconType['move']).addTo(map);

		moveHandels();
		
		centerHandel.on('drag', function(e){
			latlng = centerHandel.getLatLng();
			bounds = rectangle.getBounds();
			center = L.latLngBounds(bounds).getCenter();
			
			sw = L.latLngBounds(bounds).getSouthWest();
			ne = L.latLngBounds(bounds).getNorthEast();		
			
			var newSw = {};
			newSw.lat = sw.lat + latlng.lat - center.lat;
			newSw.lng = sw.lng + latlng.lng - center.lng;

			var newNe = {};
			newNe.lat = ne.lat + latlng.lat - center.lat;
			newNe.lng = ne.lng + latlng.lng - center.lng;
			
			rectangle.setBounds([newSw,newNe]);
			moveHandels();
		});

		swHandel.on('drag', function(e){
			latlng = swHandel.getLatLng();
			bounds = rectangle.getBounds();
			ne = L.latLngBounds(bounds).getNorthEast();
		
			swPix = map.latLngToLayerPoint(latlng);
			nePix = map.latLngToLayerPoint(ne);
		
			xPix = nePix.x - swPix.x;
			yPix = swPix.y - nePix.y;
			yPix = printRatio(xPix,yPix);

			newSw = map.layerPointToLatLng([swPix.x , nePix.y + yPix]);
			ne = map.layerPointToLatLng(nePix);
		
			rectangle.setBounds([newSw,ne]);
			moveHandels();
		});
		seHandel.on('drag', function(e){
			latlng = seHandel.getLatLng();
			bounds = rectangle.getBounds();
			nw = L.latLngBounds(bounds).getNorthWest();
		
			sePix = map.latLngToLayerPoint(latlng);
			nwPix = map.latLngToLayerPoint(nw);
		
			xPix = sePix.x - nwPix.x;
			yPix = sePix.y - nwPix.y;
			yPix = printRatio(xPix,yPix);

			newSe = map.layerPointToLatLng([sePix.x , nwPix.y + yPix]);
			ne = map.layerPointToLatLng(nwPix);
		
			rectangle.setBounds([newSe,ne]);
			moveHandels();
		});
		nwHandel.on('drag', function(e){
			latlng = nwHandel.getLatLng();
			bounds = rectangle.getBounds();
			se = L.latLngBounds(bounds).getSouthEast();
		
			nwPix = map.latLngToLayerPoint(latlng);
			sePix = map.latLngToLayerPoint(se);
		
			xPix = sePix.x - nwPix.x;
			yPix = sePix.y - nwPix.y;
			yPix = printRatio(xPix,yPix);

			newNw = map.layerPointToLatLng([nwPix.x , sePix.y - yPix]);
			se = map.layerPointToLatLng(sePix);
		
			rectangle.setBounds([newNw,se]);
			moveHandels();
		});
		neHandel.on('drag', function(e){
			latlng = neHandel.getLatLng();
			bounds = rectangle.getBounds();
			sw = L.latLngBounds(bounds).getSouthWest();
		
			nePix = map.latLngToLayerPoint(latlng);
			swPix = map.latLngToLayerPoint(sw);
		
			xPix = nePix.x - swPix.x;
			yPix = swPix.y - nePix.y;
			yPix = printRatio(xPix,yPix);

			newNe = map.layerPointToLatLng([nePix.x , swPix.y - yPix]);
			sw = map.layerPointToLatLng(swPix);
		
			rectangle.setBounds([sw,newNe]);
			moveHandels();
		});
		
		function moveHandels() {
			bounds = rectangle.getBounds();
			sw = L.latLngBounds(bounds).getSouthWest();
			ne = L.latLngBounds(bounds).getNorthEast();
			se = L.latLngBounds(bounds).getSouthEast();
			nw = L.latLngBounds(bounds).getNorthWest();
			
			centerHandel.setLatLng(bounds.getCenter());
			swHandel.setLatLng(sw);
			neHandel.setLatLng(ne);
			seHandel.setLatLng(se);
			nwHandel.setLatLng(nw);
		}

		function printRatio(x,y) {
			var selectedFormat = $("input[type='radio'][name='ratio']:checked").val();
			if (selectedFormat === "landscape") y = x / paperRatio;
			if (selectedFormat === "portrait") y = x / (1/paperRatio);
			return y;
		}	
	}

	function hashControll(){
		if (window.location.hash.substr(0,5) == "#zoom") convertOldHash();

		var hash = window.location.hash.substring(1); //Puts hash in variable, and removes the # character
		var hashValues = hash.split('/');
		
		// console.log(hashValues);
		//  #marker/75/activate/8b625551a7fccbac44eb1991ac3ddae0
		
		if (hashValues[0] === "!marker") {   // Opens from from Disqus
			openMarkerPopup(hashValues[1],"show");
		}
		
		if (hashValues[0] === "mymarkers") {   // Opens from from Disqus
			myMarkers(hashValues[1]);
		}
		
		if (hashValues[0] === "marker") {
			if (hashValues[2] === "show"){
				openMarkerPopup(hashValues[1],"show");
			
			}else if (hashValues[2] === "change" || hashValues[2] === "remove") {
				changeMarker(hashValues[1],hashValues[3]);
			
			} else if (hashValues[2] === "activate")  {
				ajaxUpdateMarker(hashValues[1],hashValues[3],hashValues[2]);
			
			} else {
				openMarkerPopup(hashValues[1]);
			}
		}
		if (hashValues[0] === "map") {
			// #map/9/63.4530/17.3172/o
			//	0	1 2		  3		  4
			map.setView([hashValues[2],hashValues[3]],hashValues[1]); 
		}
		if (hashValues[0] === "info" || hashValues[0] === "!info") {
			showInfo(hashValues[1],hashValues[2]);
		}
	}

	function hideInfo() {
		$('.info').slideUp(400);
		$('#grayout').hide(10);
		document.title = "Skoterleder.org - Snöskoterkarta!"
		updateMapHash();
		if ($('#disqus_thread').length) $('#disqus_thread').remove();
	}
	
	$(window).resize(function(){
		moveInfo();
		moveAlertbox();
	});


	$('.selectIconType').click(function() {
		$('.selectIconType').removeClass( "iconSelected" )
		$(this).addClass( "iconSelected" );
		
		$(".iconText").html($(this).attr("title"));
		$("#type").val($(this).attr("type"));
	});

	$('.addMarker').click(function(){
		addNewMarker();
	});

	$('.close').click(function() {
		hidebox('#newMarkerBox');
		document.title = "Skoterleder.org - Snöskoterkarta!"
		updateMapHash();
	});	

	$(".alertOk").click(function() {
		$('#alert').hide(100);
	});

	$(".showInfo").click(function() {
		showInfo();
		return false;
	});	

	$("#grayout").click(function() {
		var toclose = $("#grayout").attr("close");
		$('.'+toclose).hide();
		$('#grayout').hide();
		document.title = "Skoterleder.org - Snöskoterkarta!"
		updateMapHash();
		if ($('#disqus_thread').length) $('#disqus_thread').remove();
	});	

	$(".infoClose").click(function() {
		hideInfo();
	});	

	$('.collapsible').click(function() {
		var div = $(this).data("collaps");
		var title = $(this).text();
		
		if ($("." + div).css("display") === "none") {
			$(".hidden").slideUp(200);
			$("." + div).slideDown();
			location.replace("#info/" + div);
			document.title = "Skoterleder.org - " + title;
			ga('send', 'pageview', '#info/' + div);
		} else {
			$("." + div).slideUp(200);
			location.replace("#info");
		}
	});	

	$('.showComments').click(function() {
		var id = $(this).data( "id");
		var title = $(this).data( "title");
		if ($('#disqus_thread').length) $('#disqus_thread').remove();  // Remove old div
		
		$("<div id='disqus_thread'>").insertAfter(this);
		loadDisqus(id,title,'info');
		return false;
	});	
	
	$('#showNewMarkes').click(function() {
		loadmarkers("new");
		ga('send', 'pageview','#New-markers');
	});
	$('#removeAllMarkers').click(function() {
		map.removeLayer(markers);
		ga('send', 'pageview','#Remove-markers');
	});
	$('#showAllMarkers').click(function() {
		loadmarkers();
		ga('send', 'pageview','#All-markers');
	});
	 
	$(".queryLink").click( function() {
		$(".queryList").toggle(100);
		return false;
	});
	
	$(".markerQuery").mouseleave( function() {
		$(".queryList").slideUp(100);
	});

	$(".printMap").click( function() {
		initprint();
		return;
	});
});


function showbox(div) {

	if (div === "#newMarkerBox")  hidebox("#showMarkerBox");
	if (div === "#showMarkerBox") hidebox("#newMarkerBox");
	
	var windowWidth = $(window).width()
	if (windowWidth < 600) {
			$( div ).width( windowWidth )
	}
	
	var width = $(div).outerWidth();
	
	if ($(div).css( "marginLeft" ) != "0px") {
		
		$(div).animate({
			marginLeft: 0}, 500 );
	
		$(".leaflet-control-zoom").animate({ 
			marginLeft: "+=" + width + "px"}, 500 );	
	}
}
function hidebox(div) {
	var width = $(div).outerWidth();
	
	if ($(div).css( "marginLeft" ) === "0px") {
		$(".leaflet-control-zoom").animate({ 
			marginLeft: "-=" + width + "px",
			}, 500 );
		$(div).animate({
			marginLeft: "-=" + width + "px",
			}, 500 );
	}
}

function loadDisqus(identifier, title, type) {
	title = "Skoterleder.org - " + title;
	if (type === "marker") url = serverUrl + "#!marker/" + identifier + "/";
	if (type === "info") url = serverUrl + "#!info/" + identifier;
	console.log("id: "+identifier+" title: "+title+" url"+url);
	
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

function updateCommentsCount(text) {
	var id = $( "#showMarkerBox" ).data( "markerid");
	var hash = $( "#showMarkerBox" ).data( "hash");
	
	console.log("Send id: " + id + " hash: "+ hash );
	
	$.ajax({
		url: "inc/addcomment.php?id=" + id + "&hash=" + hash + "&text=" + text,
		cache: false
	});
}

function showAlert(text) {
	$(".alertText").html(text);
	moveAlertbox();
	$('#alert').show(1);
}

function showInfo(div,extra) {
	var hash = "#info";
	var title = "Skoterleder.org - Mer Information"
	var extrahash = "";
	if (typeof div === 'undefined') {
		location.replace(hash);
	} else {
		$("." + div).slideDown();
		if (typeof extra != 'undefined') extrahash = '/' + extra;
		location.replace("#info/" + div + extrahash);
		// To do, update title!
	}

	document.title = title

	moveInfo();
	$('#grayout').show(10);
	$('.info').slideDown(500);
	$("#grayout").attr("close","info");

	// Load all images
	$('.replaceImage').each(function () {
		$(this).attr('src',$(this).data('load'));
	});

	ga('send', 'pageview', window.location.hash);
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

function moveAlertbox () {
	$('#alert').css({
		position:'absolute',
		left: (($(window).width() - $('#alert').outerWidth()) /2 )
	});
}

function convertOldHash(){
	// #zoom=6&lat=60.91&lon=18.8&layer=Skoterleder.org  //Fix old permalinks 
	var hash = window.location.hash.substring(1);
	var urldata_arr = hash.split('&');
	for (var i in urldata_arr) {
		var name_value = urldata_arr[i].split('=');
		if (name_value[0] === "zoom") var zoom = name_value[1];
		if (name_value[0] === "lat") var lat = name_value[1];
		if (name_value[0] === "lon") var lng = name_value[1];
		if (name_value[0] === "layer") var layer = name_value[1];
	}
	var baseLayer = "";
	if (layer === "Open Street Map" ) baseLayer = "/o";
	if (layer === "Google Road" ) baseLayer = "/g";
	if (layer === "Google Satelit" ) baseLayer = "/s";
	if (layer === "Google Terräng" ) baseLayer = "/t";
	
	newHash = "#map/"+zoom+"/"+lat+"/"+lng+baseLayer;
	location.replace(newHash); 
}

function decodeEntities(input) {
  var y = document.createElement('textarea');
  y.innerHTML = input;
  return y.value;
}

function swedishTimeago() {
	jQuery.timeago.settings.strings = {
	  prefixAgo: "för",
	  prefixFromNow: "om",
	  suffixAgo: "sedan",
	  suffixFromNow: "",
	  seconds: "mindre än en minut",
	  minute: "ungefär en minut",
	  minutes: "%d minuter",
	  hour: "ungefär en timme",
	  hours: "ungefär %d timmar",
	  day: "en dag",
	  days: "%d dagar",
	  month: "ungefär en månad",
	  months: "%d månader",
	  year: "ungefär ett år",
	  years: "%d år"
	};
}

// from http://stackoverflow.com/a/1460174/1974332
function createCookie(name, value, days) {
	var expires;
	if (days) {
		var date = new Date();
		date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
		expires = "; expires=" + date.toGMTString();
	} else {
		expires = "";
	}
	document.cookie = escape(name) + "=" + escape(value) + expires + "; path=/";
}
function readCookie(name) {
	var nameEQ = escape(name) + "=";
	var ca = document.cookie.split(';');
	for (var i = 0; i < ca.length; i++) {
		var c = ca[i];
		while (c.charAt(0) === ' ') c = c.substring(1, c.length);
		if (c.indexOf(nameEQ) === 0) return unescape(c.substring(nameEQ.length, c.length));
	}
	return null;
}
function eraseCookie(name) {
	createCookie(name, "", -1);
}

(function(d, s, id) {
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) return;
  js = d.createElement(s); js.id = id;
  js.src = "//connect.facebook.net/sv_SE/all.js#xfbml=1&appId="+facebook_appId;
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));
