var lastActiveTime;
var lastVersionCheckTime;
var expires;
var markers; //
var areaRect; //
var areaLocation; //
var olat;
var olng;

var icon = [];
var iconType = [];
var baseLayer;
var popup;
var timeout = new Date().getTime() + 1*60*1000; //add 1 minutes;
var lastHash = '';
var orgTitle;

// Unique user id, only used for statistics
var uid = 'xxxxxxxxxxxxxxxx'.replace(/[x]/g, function(c) {
    var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
});

$(document).ready(function() {
	
	$.ajaxSetup({ cache: false });
	swedishTimeago();
	var map = new L.Map('map', {center: new L.LatLng(64, 16), zoom: 5});
	orgTitle = document.title;
	
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
				container.innerHTML += '<a href="#" class="showInfo text-bar-links">Vad är nu detta?</a>';
				
				return container;
		}
	});
	var moreReturnButton = L.Control.extend({
		options: {
				position: 'topright'
		},
		onAdd: function (map) {
				// create the control container with a particular class name
				var container = L.DomUtil.create('div', 'leaflet-bar' );
				container.innerHTML += '<a href="#" class="returnMap text-bar-links">Åter till kartan</a>';
				
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

	var skoterleder = new L.tileLayer('https://tiles.skoterleder.org/tiles/{z}/{x}/{y}.png', {
		maxZoom: 14,
		attribution: '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> bidragsgivare, Imagery &copy; <a href="http://skoterleder.org">Skoterleder.org</a>, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>'
	});
	var osm = new L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
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

	var ggl = new L.gridLayer.googleMutant({type:'roadmap'});
	var ggh = new L.gridLayer.googleMutant({type:'hybrid'});
	var ggt = new L.gridLayer.googleMutant({type:'terrain'});

	map.addLayer(skoterleder);
	var layersControl = new L.Control.Layers( {
				'Skoterleder.org':skoterleder, 
				'Open Street Map':osm, 
				'Google Road':ggl, 'Google Satelit':ggh, 'Google Terräng':ggt},
				{'Visa skoterleder':overl, 'Visa information':info }
			);

	map.addControl(new moreInfoButton());
	map.addControl(new moreReturnButton());
	map.addControl(layersControl);
	map.addControl(new openOsmLink()); 
	map.addControl(new openOsmEditLink());
	
	
	// loadmarkers();
	
	if (window.location.hash) {
		hashControll();
	}
	
	// Fix map size after return to map page
	$( document ).delegate("#mapPage", "pageshow", function() {
		map.invalidateSize(false);
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
		
		if (zoom < 6 && areaText) {
			map.removeLayer(areaText);
		} else {
			if ( areaText ) map.addLayer(areaText);
		}
		
		newHash("#!map/" + zoom + "/" + lat + "/" + lng + layer)

		if(new Date().getTime() > timeout) {
			timeout = new Date().getTime() + 1*60*1000; //add 15 minutes;
			// console.log("New time");
			ga('send', 'pageview',window.location.hash);
		}
		
		if (zoom > 7) savelocation(latlng);
	}

	function savelocation(latlng){
		// No decimals for location is used.
		var lat = Math.round(latlng.lat*2)/2;
		var lng = Math.round(latlng.lng);

		if (olat != lat || olng != lng) {
			$.ajax({ 
				url: "inc/savelocation.php?uid="+uid+"&lat="+lat+"&lng="+lng
			});
			olat = lat;
			olng = lng;
		}
	}


	if ( $( "#main-info" ).hasClass( "showChanges" ) ) loadDates();

	function loadDates() {
		$(".leaflet-tile-pane").css("opacity",'0.6');

		$.getJSON('inc/osmdata.php', function(data) {
			
			var html = "";
			var container = $("<p>").appendTo("#infoBox");
			
			container.on('click', '.dateSelected', function() {
				loadmarkers($(this).data("date"));
				return false;
			});			
			for(var i=0;i<data.dates.length;i++){
				var lastDate = data.dates[i].date;
				html += " <a href='#' class='dateSelected' data-date='"+lastDate+"'>";
				html += lastDate + "</a> ";
			}
			
			container.html( html );
			moveSelectDateBox();
			
			loadmarkers(lastDate)
		})
		.error(function(jqXHR, textStatus, errorThrown){ /* assign handler */
				showAlert("Error loading data");
				console.log(jqXHR.responseText);
				console.log(textStatus);
		});
	}

	function loadmarkers(q) {
		if (!q) q = "";
		
		if (markers) {
			map.removeLayer(markers);
			map.removeLayer(areaRect);
			map.removeLayer(areaText);
		}
		
		markers  = new L.MarkerClusterGroup( {maxClusterRadius:12,disableClusteringAtZoom:11} ).addTo(map);
		areaRect = new L.layerGroup().addTo(map);
		areaText = new L.layerGroup().addTo(map);
		
		$.getJSON('inc/osmdata.php?d='+q, function(points) {
			for(var i=0;i<points.change.length;i++){
				var point = points.change[i];
				var content = "";
				content += "<h3>OpenStreetMap data</h3>";
				content += "<p>Ändad av <a href='http://www.openstreetmap.org/user/";
				content += point.u + "' target='_blank'>" + point.u + "</a></p><p>I ändringsset ";
				content += "<a href='http://www.openstreetmap.org/changeset/" ;
				content += point.cs + "' target='_blank'>" + point.cs + "</a></p>";
				markers.addLayer( new L.circleMarker(point.c, {color: 'red', fillColor: 'red',fillOpacity:0.3}).bindPopup(content) );
			}
			
			for(var i=0;i<points.areas.length;i++){
				var area = points.areas[i];
				var content = "<p>Changed tiles: " + area.t + "</p><p>Name: " + area.n + "</p>";
				var color = "#fa0";
				
				var fill =  (area.t / 500)+0.2;
				if (fill > 0.5) fill = 0.5;
				
				if (area.t == 0) color = "#777";
				
				areaRect.addLayer( L.rectangle(area.bb,{fillOpacity:fill, color: color, weight: 1}).bindPopup(content) );
				
				var icon = L.divIcon({className:'p', html:area.t});
				areaText.addLayer( L.marker(L.latLngBounds(area.bb).getCenter(), {icon: icon}) );
			
			}

		})
		.error(function(jqXHR, textStatus, errorThrown){ /* assign handler */
				showAlert("Error loading data");
				console.log(jqXHR.responseText);
				console.log(textStatus);
		});
		
		updateMapHash();
	}


	if ( $( "#main-info" ).hasClass( "showUser" ) ) {
		loadlocationsUpdate();
		areaText = false;
		
		$('#infoBox').css({
			position:'absolute',
			left: (($(window).width() - $('#infoBox').outerWidth()) /2 )
		});
	}

	function loadlocationsUpdate() {
		loadlocations();
		setTimeout(function() {	
			loadlocationsUpdate();
		}, 1000*10);
	}

	function loadlocations() {
		$.getJSON('inc/locationdata.php', function(points) {
		
			if (areaLocation) {
				map.removeLayer(areaLocation);
			}
			areaLocation = new L.layerGroup().addTo(map);
			
			maxValue = points.users[0].count;
			
			for(var i=0;i<points.areas.length;i++){
				var area = points.areas[i];
				var content = "<p>Area: " + area.bb + "</p>";
			
				var fill =  0.2 + area.v/maxValue/1.5;
				if ( area.a ) fill = 0.6; 
				
				areaLocation.addLayer( L.rectangle(area.bb,{clickable:false, fillOpacity:fill, color: "#"+area.c, weight: 1}).bindPopup(content) );
			}
			
			$(".usersAtive").text(points.users[0].active);
			$(".usersTotal").text(points.users[0].total);
		})
		.error(function(jqXHR, textStatus, errorThrown){ /* assign handler */
				showAlert("Error loading user activity");
				console.log(jqXHR.responseText);
				console.log(textStatus);
		});
	}

	
	function hashControll(){
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
		document.title = orgTitle;
		updateMapHash();
		if ($('#disqus_thread').length) $('#disqus_thread').remove();
	}
	
	$(window).resize(function(){
		moveInfo();
		moveAlertbox();
		moveSelectDateBox();
	});

	$(".returnMap").click(function() {
		window.location.href = serverUrl + lastHash;
	});

	$(".alertOk").click(function() {
		$('#alert').hide(1);
	});

	$(".showInfo").click(function() {
		showInfo();
		return false;
	});	

	$("#grayout").click(function() {
		var toclose = $("#grayout").attr("close");
		$('.'+toclose).hide();
		$('#grayout').hide();
		document.title = orgTitle;
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
			ga('send', 'pageview', '#info/' + div);
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
	

	$(".queryLink").click( function() {
		$(".queryList").toggle(100);
		return false;
	});
	
	$(".markerQuery").mouseleave( function() {
		$(".queryList").slideUp(100);
	});
});

function newHash(hash){
	lastHash = hash;
	lastActiveTime = new Date().getTime();
	location.replace(lastHash); 
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
function moveSelectDateBox() {
	$('#infoBox').css({
		position:'absolute',
		maxWidth: ($(window).width()-100),
	});
	$('#infoBox').css({
		left: (($(window).width() - $('#infoBox').outerWidth()) /2 ),
	});
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
