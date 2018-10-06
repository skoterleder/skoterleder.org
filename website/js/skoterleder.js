var version;
var newVersion;
var newVersionFlag;
var reloadFlag;
var lastActiveTime;
var lastVersionCheckTime;
var expires;
var markers;
var poiIcons;
var poiIconsLoaded = false;
var dataCache = [];
var icon = [];
var iconType = [];
var marker = [];
var iconSize;
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
var link_marker;
var lastHash;
var olat;
var olng;

// Unique user id, only used for statistics
var uid = 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, function(c) {
    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
});
	
$(document).ready(function() {
	
	$.ajaxSetup({ cache: false });
	swedishTimeago();
	checkForUppdates();
	var map = new L.Map('map', {center: new L.LatLng(64, 16), zoom: 6});
	
	// Leaflet Measure plugin from https://github.com/p-j/leaflet.measure
	map.addControl(new L.Control.Measure({
		unitConverter: function(val) {
			if (val > 50000) {
				return {
					unit: 'km',
					value: Math.round(val / 1000) // Returns 72 km
				};
			} else if (val > 1000) {
				return {
					unit: 'km',
					value: Math.round(val / 100) / 10 // Returns 25.2 km
				};
			} else {
				return {
					unit: 'm',
					value: Math.round(val) // Returns 9852 m
				};
			}
		}
	}));
	
	var touchDev = false;
	if( /Android|webOS|iPhone|iPad|iPod|BlackBerry/i.test(navigator.userAgent) ) {
		var touchDev = true;
	}

	moveAlertbox();
	
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
				container.innerHTML += '<a href="#" class="text-bar-links queryLink">Urval</a> \
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
					</div> \
				';
				
				return container;
		}
	});
	var addShareButton = L.Control.extend({
		options: {
				position: 'bottomright'
		},
		onAdd: function (map) {
			var container = L.DomUtil.create('div', 
				'leaflet-control-share leaflet-bar leaflet-control shareMap');
				
			container.innerHTML += '<a href="#" class="leaflet-bar-part leaflet-bar-part-single" title="Dela/Spara kartbild"></a>';
			return container;
		}
	});
	var addPrintButton = L.Control.extend({
		options: {
				position: 'bottomright'
		},
		onAdd: function (map) {
			var container = L.DomUtil.create('div', 
				'leaflet-control-print leaflet-bar leaflet-control printMap');
				
			container.innerHTML += '<a href="#" class="leaflet-bar-part leaflet-bar-part-single" title="Skruv ut kartan"></a>';
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
	var addGooglePlayButton = L.Control.extend({
		options: {
				position: 'bottomright'
		},
		onAdd: function (map) {
			var container = L.DomUtil.create('div', 'googlePlayBtn');
				
			container.innerHTML += '<img alt="Android app on Google Play" src="https://developer.android.com/images/brand/en_app_rgb_wo_45.png" />';
			return container;
		}
	});
	
	var skoterleder = new L.tileLayer('https://tiles.skoterleder.org/tiles/{z}/{x}/{y}.png', {
		maxZoom: 16,
		maxNativeZoom: 14,
		attribution: '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> bidragsgivare, Imagery &copy; <a href="http://skoterleder.org">Skoterleder.org</a>, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
	});
	var topografisk = new L.tileLayer('https://api.lantmateriet.se/open/topowebb-ccby/v1/wmts/token/382a0381-7b89-352b-9e8c-26964c1cdf8e/?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=topowebb&STYLE=default&TILEMATRIXSET=3857&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&FORMAT=image/png', {
		maxZoom: 16,
		maxNativeZoom: 15,
		attribution: 'Karta från Lantmäteriet '
	});	
    var bingLayer = new L.tileLayer.bing({
		bingMapsKey:"Ahv_frErjDVU-aphfIzfHIZI2AVteKBJ_w_z20cABFjxkqOpdGusSpCCwTrFRn-Q",
		maxZoom: 18
	});
	var osm = new L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		maxZoom: 16,
		attribution: '© <a href="http://openstreetmap.org">OpenStreetMap</a> bidragsgivare, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
	});
	var overl = new L.tileLayer('https://overl.skoterleder.org/tiles/{z}/{x}/{y}.png', {
		maxZoom: 16,
		maxNativeZoom: 16,
		attribution: '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> bidragsgivare, Imagery &copy; <a href="http://skoterleder.org">Skoterleder.org</a>, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
	});
	var info = new L.tileLayer('https://overl.skoterleder.org/info/{z}/{x}/{y}.png', {
		maxZoom: 16,
		maxNativeZoom: 16,
		attribution: '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> bidragsgivare, Imagery &copy; <a href="http://skoterleder.org">Skoterleder.org</a>, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
	});

	var ggl = new L.gridLayer.googleMutant({type:'roadmap'});
	var ggh = new L.gridLayer.googleMutant({type:'hybrid'});
	var ggt = new L.gridLayer.googleMutant({type:'terrain'});

	map.addLayer(skoterleder);
	var layersControl = new L.Control.Layers( {
				'Skoterleder.org':skoterleder, 
				'Topografisk':topografisk, 
				'Bing Maps':bingLayer,
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
	if (!touchDev) map.addControl(new addGooglePlayButton());
	map.addControl(new addPrintButton());
	map.addControl(new addShareButton());
	
	// L.Control.Measure().addTo(map);
	// https://github.com/IL2HorusTeam/leaflet.measure

	// Icons from http://mapicons.nicolasmollet.com/
	icon[1] = 'images/icons/snowmobile-green.png';
	icon[2] = 'images/icons/information.png';
	icon[3] = 'images/icons/treedown.png';
	icon[4] = 'images/icons/caution.png';
	icon[5] = 'images/icons/fixmap.png';
	icon[6] = 'images/icons/parking.png';
	icon[7] = 'images/icons/coffee.png';
	icon[500] = 'images/icons/fuel.png';
	icon[501] = 'images/icons/shelter.png';
	icon[502] = 'images/icons/wildernesshut.png';
	
	iconType[0] = L.icon({
		iconUrl: 'images/icons/question.png',
		iconSize:	 [32, 37], // size of the icon
		iconAnchor:   [16, 37], // point of the icon which will correspond to marker's location
		popupAnchor:  [0, -33] // point from which the popup should open relative to the iconAnchor
	});
	iconType[1] = L.icon({
		iconUrl: 'images/icons/snowmobile-green.png',
		popupAnchor:  [0, -33] // point from which the popup should open relative to the iconAnchor
	});
	iconType[2] = L.icon({
		iconUrl: 'images/icons/information.png',
		popupAnchor:  [0, -33] // point from which the popup should open relative to the iconAnchor
	});
	iconType[3] = L.icon({
		iconUrl: 'images/icons/treedown.png',
		popupAnchor:  [0, -33] // point from which the popup should open relative to the iconAnchor
	});
	iconType[4] = L.icon({
		iconUrl: 'images/icons/caution.png',
		popupAnchor:  [0, -33] // point from which the popup should open relative to the iconAnchor
	});
	iconType[5] = L.icon({
		iconUrl: 'images/icons/fixmap.png',
		popupAnchor:  [0, -33] // point from which the popup should open relative to the iconAnchor
	});
	iconType[6] = L.icon({
		iconUrl: 'images/icons/parking.png',
		popupAnchor:  [0, -33] // point from which the popup should open relative to the iconAnchor
	});
	iconType[7] = L.icon({
		iconUrl: 'images/icons/coffee.png',
		popupAnchor:  [0, -33] // point from which the popup should open relative to the iconAnchor
	});

	iconType[500] = L.icon({
		iconUrl: 'images/icons/fuel.png',
		iconSize:	 [20, 20], // size of the icon
		iconAnchor:   [10, 10], // point of the icon which will correspond to marker's location
	});
	iconType[501] = L.icon({
		iconUrl: 'images/icons/shelter.png',
		iconSize:	 [20, 20], // size of the icon
		iconAnchor:   [10, 10], // point of the icon which will correspond to marker's location
	});
	iconType[502] = L.icon({
		iconUrl: 'images/icons/wildernesshut.png',
		iconSize:	 [20, 20], // size of the icon
		iconAnchor:   [10, 10], // point of the icon which will correspond to marker's location
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
	iconType['l'] = L.icon({
		iconUrl: 'images/icons/map22-1.png',
		iconSize:	 [22, 33], // size of the icon
		iconAnchor:   [11, 33], // point of the icon which will correspond to marker's location
		popupAnchor:  [11, -33] // point from which the popup should open relative to the iconAnchor
	});

	// Laddar alla markörer med lite fördröjning.
	setTimeout(function() {	
		loadmarkers();
	}, 1000);
	
	if (window.location.hash) {
		hashControll();
	}
	
	// Fix map size after return to map page
	$( document ).delegate("#mapPage", "pageshow", function() {
		map.invalidateSize(false);
	});
	
	// add location control to global name space for testing only
	// on a production site, omit the "lc = "!
	lc = L.control.locate({
		follow: true,
		onLocationError: function(err) {showAlert("Kunde inte hitta din position<br><p class='textlinkmini'>"+err.message+"</p>");console.log(err);},
		strings: {
			title: "Visa var jag är",  // title of the locate control
			popup: "Du är inom ca {distance} {unit} från denna punkt.",  // text to appear if user clicks on circle
		},
		locateOptions: {
			maxZoom: 14,
			enableHighAccuracy: true,
			watch:true,
		},
		// range circle
		circleStyle: {
			color: '#F9B8D2',
			fillColor: '#F9B8D2',
			fillOpacity: 0.40,
			opacity: 0.7
        },
		// inner marker
		markerStyle: {
			color: '#CC0000',
			fillColor: '#CC0000',
		},
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
		dispalyMarkers();
	});
	map.on('popupclose', function(e) {
		updateMapHash(); 
	});

	map.on('baselayerchange', function(e) {
		baseLayer = "";
		if (e.name === "Topografisk" ) baseLayer = "lt";
		if (e.name === "Bing Maps" ) baseLayer = "bs";
		if (e.name === "Open Street Map" ) baseLayer = "o";
		if (e.name === "Google Road" ) baseLayer = "gr";
		if (e.name === "Google Satelit" ) baseLayer = "gs";
		if (e.name === "Google Terräng" ) baseLayer = "gt";
		
		setTimeout(function() {	
			if (e.name === "Skoterleder.org" ) {
				map.removeLayer(overl);
			} else {
				map.addLayer(overl);
			}
			layersControl._update();
		}, 200);

		updateMapHash();
		gatrack('send', 'pageview','baselayerchange/'+baseLayer);
	});

	function updateMapHash(){
		var zoom = map.getZoom();
		var latlng = map.getCenter();
		var lat = latlng.lat.toFixed(4);
		var lng = latlng.lng.toFixed(4);
		var layer = "";
		if (baseLayer) var layer = "/" + baseLayer
		
		newHash("#!map/" + zoom + "/" + lat + "/" + lng + layer)

		if(new Date().getTime() > timeout) {
			timeout = new Date().getTime() + 1*60*1000; //add 15 minutes;
			// console.log("New time");
			gatrack('send', 'pageview',window.location.hash);
		}
		if (zoom > 7) savelocation(latlng);
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

		newHash("#!marker/"+id); 

		var loadtime = 0;
		if (typeof dataCache[id] != 'undefined') loadtime = dataCache[id].loadtime;
		
		if (loadtime > (new Date().getTime() - 60*1000)) {
			// Using cached data for 1 minute.
			dispalyMarker(id,dataCache[id],linkin,show);
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
		gatrack('send', 'pageview',window.location.hash);
		
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
			newHash("#!marker/"+id); 
			return false;
		});		
		container.on('click', '.linkZoom', function() {
			map.setView(latlng,11)
			newHash("#!marker/"+id); 
			return false;
		});	

		if (!linkin) map.removeLayer(popup); 	// Removing "laddar" popup

		var inactivText =""
		if (data.status != "1") inactivText ="<p class='alerttext'>Denna markör är inte aktiv och syns inte på kartan</p>";
		
		description = zParse.BBCodeToHtml(description);
		
		container.html( inactivText + " \
			<h2>"+title+"</h2><p>"+description.replace(/\r?\n/g, '<br>')+"</p> \
			<div class='pupupdivider'></div> \
			<p class='textlink created'>" + hedline + " av: "+ name + " </p>\
			<p class='textlink'>" + created + "&nbsp;&nbsp; <img src='images/icons/comment.png' \
			 title='Kommentarer' class='iconImg' width='14' height='12'> " + comments + " \
			 &nbsp;&nbsp; \
			 <img src='images/icons/open.png' title='Visad " + data.count + " ggr' \
			 width='16' height='12' class='iconImg'> \
			" + data.count + " \
			</p> \
			<a href='#!marker/"+id+"' class='linkThis textlink floatRight'>Länk hit</a> \
			<a href='#!marker/"+id+"' class='linkZoom textlink floatRight'>Zoom</a> \
			</p> \
			<div class=''> \
			<p id='popupLinks' class='floatRight'><a href='#' class='okLink linkButton'> \
			Mer information</a> <a href='#' class='cancelLink linkButton'>Stäng</a></p> \
			</div><div class='clearboth'></div> \
			");
		
		var y=-27;
		if (data.type > 499 ) y=0;
		
		popup = L.popup( {offset: new L.Point(0, y),maxWidth: maxPopupWidth,})
		.setLatLng(latlng)
		.setContent(container[0])
		.openOn(map);		

		if ( data.name == "Import" ) {
			$(".created").html("Importerad från OSM");
			if ( updatetime ) $(".created").append(", ändrad");
		}

		

		if (linkin) map.setView(latlng,11);

		if (show === "show") {
			loadMarkerPanel(id);
		} else {
			newHash("#!marker/"+id); 
		}
		

	}

	function loadMarkerPanel(id){
		$("#showMarkerBox").empty();
		
		$("<p>").text("Laddar...").appendTo("#showMarkerBox");
		
		var loadtime = 0;
		if (typeof dataCache[id] != 'undefined') loadtime = dataCache[id].loadtime;
		
		if (loadtime > (new Date().getTime() - 60*1000)) {
			// Using cached data for 1 minute.
			dispalyMarkerPanel(id,dataCache[id]);
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
		var avatarlink  = "<img src='https://www.gravatar.com/avatar/" + data.md5 + "?d=retro&s=50.jpg' class='floatLeft'>";
		var changeHTMLtext = "";
		var commentsHTMLtext = "";
		var shareUrl = serverUrl + "marker/?id=" + id;
		if (data.updatetime) changeHTMLtext = "<p class='narrow'>Ändrad: " + data.updatetime + "</p>";
		if (data.commenttime) commentsHTMLtext = "<p class='narrow'>Senaste kommentar: " + data.commenttime + "</p>";  // Not in use!
		
		newHash("#!marker/"+ id + "/show","new");
		document.title = "Skoterleder.org - " + data.title;
		gatrack('send', 'pageview',window.location.hash);

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
			newHash("#!marker/"+ id + "/show");
			return false;
		});		
		
		data.description = zParse.BBCodeToHtml(data.description); 

		if (data.status != "1") {
			$("<p>").addClass("alerttext").html("Denna markör är inte aktiv och syns inte på kartan").appendTo(div);
		}
		$("<h3>").html(data.title).appendTo(div);
		$("<p>").html(data.description.replace(/\r?\n/g, '<br>')).appendTo(div);

		$(div).append(" \
		<table><tr><td>\
		<div class='submitterAvatar'>" + avatarlink + " </div> \
		</td><td class='textlink'>\
		<p class='narrow created'>Skapad av: " + data.name + " </p> \
		<p class='narrow'>Skapad: " + data.createtime + " </p> " + changeHTMLtext + " \
		</td></tr></table> \
		<p class='narrow'><a href='#' class='adminMail textlink'>Ändra denna markör</a> \
		<a href='#' class='adminFlag textlink'>Flagga som olämpligt</a></p> \
		<p class='nodinfo narrow'></p> \
		<div id='displayInfo'></div> \
		<div id='fbshare'> \
		<div class='fb-like' data-href='" + shareUrl + "' \
		data-width='280' data-layout='standard' data-action='like' \
		data-show-faces='true' data-share='true'></div></div> \
		<p class='narrow'><a href='#!marker/"+id+"/show' class='textlink showShareLink'>Visa dela-länk</a></p> \
		"
		); 
		if ( data.name == "Import" ) $(".created").html("Importerad från OSM");
		if ( data.description == "" && data.type > 499 ) {
			$(".markerContent h3").after("<p class='textlink'>Denna markör är importerad från OSM, komplettera gärna med mer information. Alla kan ändra denna markör/text.</p>");
		}
		if ( data.changeable ) {
			$(".adminMail").addClass("changeLink").removeClass("adminMail");
		}
		
		if ( data.node ) {
			$(".nodinfo").append("<a class='textlink' href='http://www.openstreetmap.org/node/"+data.node+"' target='_blank'>Visa nod "+data.node+" på OSM</a>");			
			$(".nodinfo").css('padding-top',7);
		}
		
		div.on('click', '.changeLink', function() {
			changeMarker(id);
			return false;
		});
		
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
		if (!hash) hash = "";
		saveButtonText = "Spara";
		var message = "";
		
		$("#showMarkerBox").empty();
		$("<p>").text("Laddar...").appendTo("#showMarkerBox");
		
		gatrack('send', 'pageview','#changeMarker/'+id);
		
		$.getJSON('inc/getmarker.php?id='+id, function(data) { 

			$("#showMarkerBox").empty();
		
			// console.log(data);
			map.setView(data.latlng,11);
			// data.description = data.description.replace(/<br ?\/?>/g, "");
			var avatarlink  = "<img src='https://www.gravatar.com/avatar/" + data.md5 + "?d=retro&s=50.jpg' class='floatLeft'>";
			
			document.title = "Skoterleder.org - Ändra - " + data.title;
			newHash("#!marker/"+ id + "/change/" + hash,"new"); 
			
			var div = $("<div>").addClass("markerContent").appendTo("#showMarkerBox");

			$("<h3>").html("Ändring av markör").appendTo(div);
			
			if (data.status === "0") {
				saveButtonText = "Spara och aktivera";
				$("<p>").addClass("alerttext").html("Markör inte aktiverad").appendTo(div);
			}
			if (data.status === "-1") {
				saveButtonText = "Spara och återaktivera";
				message = "<p>OBS! Överväg att skapa ny \
								markör i stället för att återaktivera en gamla om \
								ämnet inte är den samma. </p>"
				$("<p>").addClass("alerttext").html("Markören är inte aktiv").appendTo(div);
			}
			
			var form = " \
			<form action='#' id ='changeMarkerForm'> \
			<label for='ctitle'>Rubrik</label> \
			<input type='text' name='title' id='ctitle' value='"+decodeEntities(data.title) + "' \
			<label for='cdescription'>Beskrivning</label> \
			<textarea name='description' id='cdescription' rows='6'></textarea> \
			<input type='hidden' name='id' id='cid' value='" + id + "'> \
			<input type='hidden' name='hash' id:'chash' value='" + hash + "'> \
			<input type='hidden' name='action' value='change' >\
			<input id='ctype' type='hidden' name='type' value='"+data.type+"'> \
			" + message +"\
			<input type='submit' value='" + saveButtonText + "' class='inputbutton floatRight'> \
			";
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
			
			if (data.status === "1" && !data.changeable) $("<p>").addClass("linkButtonLong removeMarkerButton").text("Inaktivera markör").appendTo(div);
			
			$("<p>").addClass("linkButtonLong showCommentsButton").text("Visa kommentarer").appendTo(div);
			
			$('<div>', {id: 'disqus_thread'}).appendTo(div);
			
			if ( data.type < 499 ) {
				$('#cdescription').after(" \
				<img src='images/icons/snowmobile-green.png' class='selectIconType icon-1' type='1' title='Information om skoterled'> \
				<img src='images/icons/information.png' class='selectIconType icon-2' type='2' title='Allmän information'> \
				<img src='images/icons/treedown.png' class='selectIconType icon-3' type='3' title='Blockerad skoterled'> \
				<img src='images/icons/caution.png' class='selectIconType icon-4' type='4' title='Varning, fara!'> \
				<img src='images/icons/fixmap.png' class='selectIconType icon-5' type='5' title='Rapportera kartfel'> \
				<img src='images/icons/parking.png' class='selectIconType icon-6' type='6' title='Skoterparkering'> \
				<img src='images/icons/coffee.png' class='selectIconType icon-7' type='7' title='Servering för skoteråkare'> \
				<img src='images/icons/shelter.png' class='selectIconType poiIcons  icon-501' type='501' title='Vindskydd eller liknande'> \
				<img src='images/icons/fuel.png' class='selectIconType poiIcons  icon-500' type='500' title='Bensinstation tillgänglig med skoter'> \
				");
				$('.icon-'+data.type).addClass("iconSelected");
			}
			
			div.on('click', '.selectIconType', function() {
				$('.selectIconType').removeClass( "iconSelected" )
				$(this).addClass( "iconSelected" );
				
				// $(".iconText").html($(this).attr("title"));
				$("#ctype").val($(this).attr("type"));
			});
			
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
							loadmarkers();
							dataCache[id] = 'undefined';
							gatrack('send', 'pageview','#marker/'+id+'/saved'); //#changeMarker/17
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
					if (action === "uptodate") {
						openMarkerPopup(id);
						showAlert("Markören bekräftad");
						hidebox('#showMarkerBox');
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
			gatrack('send', 'pageview','#newmarker');
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
		
			var avatarlink  = "<img src='https://www.gravatar.com/avatar/" + data.md5 + "?d=retro&s=50.jpg' class='floatLeft'>";
			
			document.title = "Skoterleder.org - Mina markörer";
			
			$("#listBox").empty();
			$('#listBox').css('overflow','auto');

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
		
		$.getJSON('inc/data.php?q='+q, function(points) {
			marker.length = 0
			for(var i=0;i<points.marker.length;i++){
				marker[i] = points.marker[i];
			}
			iconSize = "";
			dispalyMarkers();
		})
		.error(function(jqXHR, textStatus, errorThrown){ /* assign handler */
				showAlert("Error loading marker");
				console.log(jqXHR.responseText);
				console.log(textStatus);
		});
	}
	
	function dispalyMarkers() {
		if ( marker.length === 0 ) return;  // Markers not loaded
		var zoom = map.getZoom();
		var size = 0;
		if ( zoom > 9 && iconSize != "large" ) { size = 100; iconSize = "large"; }
		if ( zoom === 9 && iconSize != "medium" ) { size = 80; iconSize = "medium"; }
		if ( zoom < 9 && iconSize != "smal" ) { size = 70; iconSize = "smal"; }
		if ( size === 0 ) return;
		
		if ( markers ) map.removeLayer(markers);
		markers = new L.MarkerClusterGroup({ maxClusterRadius: 70 });
		
		if ( !poiIconsLoaded ) poiIcons = new L.MarkerClusterGroup({ maxClusterRadius: 20 });
		
		var x=32, y=37;
		var z = size / 100;
		for (var i=1; i < 8; i++) {
			iconType[i].options.iconSize = [x * z, y * z]; // size of the icon
			iconType[i].options.iconAnchor = [x*z/2, y * z]; // point of the icon which will correspond to marker's location
		}
		
		for (var i=0; i < marker.length; i++) {
			var point = marker[i];
			if ( point.icon < 499 ) {
				markers.addLayer(new L.marker(point.coordinates, point.properties).setIcon(iconType[point.icon]));
			} else if ( !poiIconsLoaded ) { // Only runs first time
				poiIcons.addLayer(new L.marker(point.coordinates, point.properties).setIcon(iconType[point.icon]));
			}
		}

		map.addLayer(markers);
		markers.on('click', function (a) { openMarkerPopup(a); });	

		if ( !poiIconsLoaded ) {
			poiIcons.on('click', function (a) {  
				openMarkerPopup(a);
			});
			poiIconsLoaded = true;
		}
		
		if ( zoom <= 9 && map.hasLayer(poiIcons) ) map.removeLayer(poiIcons);
		if ( zoom > 9 && !map.hasLayer(poiIcons) ) map.addLayer(poiIcons);
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

	function initSelectBox(type){
		// console.log($("#shareBox").has( "div" ).length);
		if ($("#shareBox").has( "div" ).length) return // menu already there.
		
		var div = $("<div>").addClass("").appendTo("#shareBox");
		
		if (type === "print") {
			$(div).append(" \
			<h2>Utskrift</h2> \
			<p>Välja format:</p> \
			<label> \
				<input type='radio' name='ratio' class='changeRatio' value='landscape' checked> Liggande \
			</label> \
			<label> \
				<input type='radio' name='ratio' class='changeRatio' value='portrait'> Stående \
			</label> \
			<label> \
				<input type='radio' name='ratio' value='free'> Fritt \
			</label> \
			<p class='linkButtonLong preview' data-action ='print'> \
				<a href='#' class='preview closeMarkerBox' data-action ='print'>Förhandsgranska</a> \
			</p> \
			<p class='linkButtonLong abort'><a href='#' class='abort closeMarkerBox'>Avbryt</a></p> \
			"
			); 
			
			createSelectArea();
		}
		if (type === "share") {
			var shareUrl = shareMapUrl();
			var screenSize = map.getSize();
			
			$(div).append(" \
			<h2>Dela:</h2> \
			<p>Länk:</p> \
			<p><label for='link_marker'><input id='link_marker' type='checkbox'>Lägg till markör</label></p> \
			<p><input type='text' value='" + shareUrl +"' class='shareLinkText'></p> \
			<div id='fbMapShare'> \
				<div class='fb-share-button' data-href='" + shareUrl + "' \
				data-type='button'></div> \
			</div> \
			<div class='divider-share'></div> \
			<h2>Bild:</h2> \
			<p><label for='image_filter'><input id='image_filter' type='checkbox'> \
			Ange anpassade dimensioner</label></p> \
			<p>Storlek på bild: \
				<i class='imgWidth'>" + screenSize.x + "</i> x \
				<i class='imgHight'>" + screenSize.y + "</i> pix\
			</p> \
			<p class='linkButtonLong preview' data-action='share'> \
				<a href='#' class='preview closeMarkerBox' data-action='share'>Förhandsgranska bild</a> \
			</p> \
			<p class='linkButtonLong abort'><a href='#' class='abort closeMarkerBox'>Avbryt</a></p> \
			"
			);
			
			FB.XFBML.parse(document.getElementById('fbMapShare'));

			div.on('click','#image_filter', function(e){
				createSelectArea();

				if (!$("#image_filter").is(":checked")) {
					var screenSize = map.getSize();
					$(".imgWidth").text(screenSize.x);
					$(".imgHight").text(screenSize.y);
				}
			});

			div.on('click','#link_marker', function() {
				if ($('#link_marker').is(':checked')) {
					var center = map.getCenter();
					link_marker = L.marker(center,{draggable:true,opacity: 1}).setIcon(iconType['l']).addTo(map);

					link_marker.on('dragend', function(e){
						var center = link_marker.getLatLng();
						map.panTo(center);
						updateShareLinks();
					});
				} else {
					map.removeLayer(link_marker);
				}
				updateShareLinks();
				
			});
			map.on('drag', function(e){
				moveLinkMarker();
			});
			map.on('zoomend', function(e){
				moveLinkMarker();
				updateShareLinks();
			});
			map.on('dragend', function(e){
				updateShareLinks();
			});
			$(".shareLinkText").click(function () {
			   $(this).select();
			});
		}
		
		$("#shareBox").slideDown();
		
		div.on('click', '.preview', function() {
			var zoom = map.getZoom();
			if (typeof rectangle != 'undefined') {
				bounds = rectangle.getBounds();
			} else {
				bounds = map.getBounds();
			}
			var center = L.latLngBounds(bounds).getCenter();  // toFixed(4)
			var lat = center.lat.toFixed(3);
			var lng = center.lng.toFixed(3);
			swPix = map.latLngToLayerPoint(L.latLngBounds(bounds).getSouthWest());
			nePix = map.latLngToLayerPoint(L.latLngBounds(bounds).getNorthEast());	
			width = nePix.x - swPix.x;
			height = swPix.y - nePix.y;

			if ($(".preview").data("action") === "print") {
				w=window.open(serverUrl + 'print/?zoom='+zoom+'&lat='+lat+'&lng='+lng+'&width='+width+'&height='+height);
			}			
			if ($(".preview").data("action") === "share") {
				w=window.open(serverUrl + 'preview-image/?zoom='+zoom+'&lat='+lat+'&lng='+lng+'&width='+width+'&height='+height);
			}
			return false;
		});
		div.on('click', '.abort', function() {
			$("#shareBox").empty();
			$("#shareBox").hide();

			removeSelectArea();
			if (typeof link_marker != 'undefined') map.removeLayer(link_marker);
			return false;
		});	
		div.on('click', '.changeRatio', function() {
			c = map.latLngToLayerPoint( centerHandel.getLatLng());
			bounds = rectangle.getBounds();
			ne = map.latLngToLayerPoint(L.latLngBounds(bounds).getNorthEast());
			sw = map.latLngToLayerPoint(L.latLngBounds(bounds).getSouthWest());
			x = ne.x - sw.x;
			y = sw.y - ne.y;
			
			// console.log("cpx:"+c.x+":"+c.y); 
			var selectedFormat = $("input[type='radio'][name='ratio']:checked").val();
			if (selectedFormat === "portrait") x = y / paperRatio;
			if (selectedFormat === "landscape") x = y / (1/paperRatio);
			// console.log(selectedFormat);
			
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
	}
	function printRatio(x,y) {
		var selectedFormat = $("input[type='radio'][name='ratio']:checked").val();
		if (selectedFormat === "landscape") y = x / paperRatio;
		if (selectedFormat === "portrait") y = x / (1/paperRatio);
		return y;
	}	

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
		
		updateDisplayDimension();
	}
	
	function updateDisplayDimension() {
		if ($("#image_filter").prop( "checked", true ) && typeof rectangle != 'undefined' ) {
			var bounds = rectangle.getBounds();
			var ne = map.latLngToLayerPoint(L.latLngBounds(bounds).getNorthEast());
			var sw = map.latLngToLayerPoint(L.latLngBounds(bounds).getSouthWest());
			var x = ne.x - sw.x;
			var y = sw.y - ne.y;
			
			$(".imgWidth").text(x);
			$(".imgHight").text(y);
		}
	}

	function moveLinkMarker() {
		if ($('#link_marker').is(':checked')) {
			var center = map.getCenter();
			link_marker.setLatLng(center);
		}
	}

	function updateShareLinks() {
		var shareUrl = shareMapUrl();
		$('.shareLinkText').val(shareUrl);

		$('#fbMapShare').after("<div id='fbshareTmp' class='hidden'></div>");
		$('#fbshareTmp').append("<div class='fb-share-button' data-href='" + shareUrl + "' \
			data-type='button'></div> \
			");
		
		FB.XFBML.parse(document.getElementById('fbshareTmp'),function(){
			$('#fbMapShare').remove();
			$('#fbshareTmp').attr('id','fbMapShare');
			$('#fbMapShare').show();
		});
	}

	function shareMapUrl(){
		var zoom = map.getZoom();
		var center = map.getCenter();
		var icon = "";
		if ($('#link_marker').is(':checked')) {
			icon = "&icon=l";
		}
		return serverUrl + 'map/?zoom='+zoom+'&lat='+center.lat.toFixed(4)+'&lng='+center.lng.toFixed(4)+icon;
	}

	function removeSelectArea() {
		if (typeof rectangle != 'undefined') {
			map.removeLayer(rectangle);
			map.removeLayer(swHandel);
			map.removeLayer(neHandel);
			map.removeLayer(seHandel);
			map.removeLayer(nwHandel);
			map.removeLayer(centerHandel);
			
			rectangle = undefined;
		}	
	}

	function createSelectArea(){
		if (typeof rectangle != 'undefined') {
			removeSelectArea();
			return;
		}
		
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
	}

	function hashControll(){
		if (window.location.hash.substr(0,5) == "#zoom") convertOldHash();

		var hash = window.location.hash.substring(1); //Puts hash in variable, and removes the # character
		var hashValues = hash.split('/');
		
		if (typeof hashValues[2] === 'undefined') hashValues[2] = "";
		
		// console.log(hashValues);
		//  #marker/75/activate/8b625551a7fccbac44eb1991ac3ddae0
		
		if (hashValues[0] === "mymarkers") {   // Opens from from Disqus
			myMarkers(hashValues[1]);
		}
		
		if (hashValues[0] === "marker" || hashValues[0] === "!marker") {
			if (hashValues[2] === "show" || hashValues[2].indexOf('comment') > 0 ){
				openMarkerPopup(hashValues[1],"show");
			
			}else if (hashValues[2] === "change" || hashValues[2] === "remove") {
				changeMarker(hashValues[1],hashValues[3]);
			
			} else if (hashValues[2] === "activate")  {
				ajaxUpdateMarker(hashValues[1],hashValues[3],hashValues[2]);

			} else if (hashValues[2] === "uptodate")  {
				ajaxUpdateMarker(hashValues[1],hashValues[3],hashValues[2]);

			} else {
				openMarkerPopup(hashValues[1]);
			}
		}
		if (hashValues[0] === "map" || hashValues[0] === "!map") {
			// #map/9/63.4530/17.3172/o
			//	0	1 2		  3		  4
			map.setView([hashValues[2],hashValues[3]],hashValues[1]);
			
			if (hashValues[4] === "l") {
				var center = map.getCenter();
				x = L.marker(center).setIcon(iconType['l']).addTo(map);
			}
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
		$('#alert').hide(1);
		if (reloadFlag) window.location.reload();
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
			newHash("#!info/" + div);
			document.title = "Skoterleder.org - " + title;
			gatrack('send', 'pageview', '#info/' + div);
		} else {
			$("." + div).slideUp(200);
			newHash("#!info");
		}
	});	

	$('.showComments').click(function() {
		var id = $(this).data( "id");
		var title = $(this).data( "title");
		if ($('#disqus_thread').length) $('#disqus_thread').remove();  // Remove old div

		$('.showComments').show();
		$(this).hide();
		
		$("<div id='disqus_thread'>").insertAfter(this);
		loadDisqus(id,title,'info');
		return false;
	});	
	
	$('#showNewMarkes').click(function() {
		loadmarkers("new");
		gatrack('send', 'pageview','#New-markers');
	});
	$('#removeAllMarkers').click(function() {
		map.removeLayer(markers);
		gatrack('send', 'pageview','#Remove-markers');
	});
	$('#showAllMarkers').click(function() {
		loadmarkers();
		gatrack('send', 'pageview','#All-markers');
	});
	 
	$(".queryLink").click( function() {
		$(".queryList").toggle(100);
		return false;
	});
	
	$(".markerQuery").mouseleave( function() {
		$(".queryList").slideUp(100);
	});

	$(".printMap").click( function() {
		initSelectBox("print");
		return false;
	});
	$(".shareMap").click( function() {
		initSelectBox("share");
		return false;
	});
	
	$(".googlePlayBtn").click( function() {
		showInfo("improve");
	});

    $(window).focus(function() {
		if ((lastVersionCheckTime + 30*60*1000) < new Date().getTime()) {
			// Limit version check to 30 minut
			getVersion();
		}
		checkForReload();
    });
});

function newHash(hash){
	lastHash = hash;
	lastActiveTime = new Date().getTime();
	location.replace(lastHash); 
}

function checkForUppdates(){
	getVersion();

	setTimeout(function() {	
		checkForUppdates();
	}, 1*60*60*1000);  //1 hour
}

function getVersion(){
	if (!newVersionFlag) {
		$.getJSON('js/version.json', function(json) {
			var oldVersion = version;
			version = json.version;	
			expires = json.expires;
			if (!version) version = newVersion;
			if (version > oldVersion) newVersionFlag = true;
			lastVersionCheckTime = new Date().getTime();
			checkForReload();
		});
	}
}
function checkForReload(){
	if (newVersionFlag) {
		if ((lastActiveTime + 10*60*1000) < new Date().getTime()) {
			// If user inactive for the last 10 min, reload page
			gatrack('send', 'pageview',"auto-reload/"+window.location.hash);
			setTimeout(function() {	
				window.location.reload();
			}, 500);  //0.5 sec delay to make time for analytics
			return;
		}
		if (new Date(expires) < new Date().getTime()) {
			// When expire time passed, displays message: 
			showAlert("Sidan uppdaterad, vänligen ladda om sidan.");
			reloadFlag = true;
			gatrack('send', 'pageview',"reload/"+window.location.hash);
			return;
		}
	}
}

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
	// console.log("id: "+identifier+" title: "+title+" url"+url);
	
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
		dsq.src = 'https://' + disqus_shortname + '.disqus.com/embed.js';
		jQuery('head').append(dsq);

	}
};

function disqus_config() {
	this.callbacks.onNewComment = [function(comment) {
		// console.log(comment);
		updateCommentsCount(comment.text.replace(/\n/g,"<br>") );
	}];
}

function updateCommentsCount(text) {
	var id = $( "#showMarkerBox" ).data( "markerid");
	var hash = $( "#showMarkerBox" ).data( "hash");
	
	// console.log("Send id: " + id + " hash: "+ hash );
	
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
	var hash = "#!info";
	var title = "Skoterleder.org - Mer Information"
	var extrahash = "";
	if (typeof div === 'undefined') {
		newHash(hash);
	} else {
		$("." + div).slideDown();
		if (typeof extra != 'undefined') extrahash = '/' + extra;
		newHash("#!info/" + div + extrahash);
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

	if ($('#disqus_thread').length) $('#disqus_thread').remove();  // Remove old div
	$("<div id='disqus_thread'>").appendTo('#main-info');
	loadDisqus('info','Information','info');
	$('.infoComments').hide();

	if ($('.version').length) $('.version').remove();
	var reloadPage = ""
	if (typeof newVersionFlag != 'undefined') reloadPage = " Reloadpage"
	var showVersion = "<p class='version gray'>Version: "+version+reloadPage+"</p>";
	$(showVersion).appendTo('#main-info');

	gatrack('send', 'pageview', window.location.hash);
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
	
	newHash("#!map/"+zoom+"/"+lat+"/"+lng+baseLayer);
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

function savelocation(latlng){
	// Rounds to .5 for lat and no decimals for lng position. Used for statistics of visiters.
    var lat = Math.round(latlng.lat*2)/2;
	var lng = Math.round(latlng.lng);

	if (olat != lat || olng != lng) {
		$.ajax({url: "inc/savelocation.php?uid="+uid+"&lat="+lat+"&lng="+lng});
		olat = lat;
		olng = lng;
	}
}
function gatrack(a,b,c) {
	try { 
		ga(a, b, c);
	}
	catch (e) {
		console.log("Track error");
	}
}