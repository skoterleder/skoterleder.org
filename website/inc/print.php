<?php
include_once 'database_config.php';
$type ="";

if(isset($_GET['zoom'])) $zoom = $_GET["zoom"];
if(isset($_GET['lat'])) $lat = $_GET["lat"];
if(isset($_GET['lng'])) $lng = $_GET["lng"];
if(isset($_GET['height'])) $height = $_GET["height"];
if(isset($_GET['width'])) $width = $_GET["width"];
if(isset($_GET['icon'])) $icon = $_GET["icon"];
if(isset($_GET['type'])) $type = $_GET["type"];

$imgUrl1 = SERVERADRESS."image/?zoom=$zoom&lat=$lat&lng=$lng&height=$height&width=$width";

$printZoomIn = SERVERADRESS."print/?zoom=".($zoom+1)."&lat=$lat&lng=$lng&height=".($height*2)."&width=".($width*2);
$printZoomOut = SERVERADRESS."print/?zoom=".($zoom-1)."&lat=$lat&lng=$lng&height=".($height/2)."&width=".($width/2);

$page_size = "landscape";
if ($width/$height < 1) $page_size = "portrait";

?>
<!DOCTYPE html>
<html lang="se">
	<head>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=2.0, user-scalable=yes" />
		<title>Förhandsgranska utskrift</title>
		<style type="text/css">
			body {padding: 0;	margin: 0; height: 100%;
				font-family: Georgia, Times New Roman, times-roman, georgia, serif;}
			html { height: 100%;}
			.wrap { display: inline-block; width: 100%;	height: 100%;}
			.button { color: black;	background-color: #D8D8D8; border-radius: 4px;
				text-decoration: none; margin: 0 7px; padding: 3px 14px; font-size: 1.1em; }
			@media screen {
				body {margin: 10px;}
				img { margin:8px 0 0 4px; padding:4px; border: solid #D0D0EE 1px;
					max-height:92%; max-width:95%; }
			}
			@media print {
				@page {size:<?=$page_size ?>;}
				.wrap { display:block; }
				.menu, .dontprint{ display:none;}
				img { height:99%; }
			}
		</style>
		</head>
	<body>
		<div class='wrap'>
			<div class='menu'>
				Zoom: <?=$zoom?> &nbsp;&nbsp;&nbsp; <a href="<?=$printZoomIn?>">Zoom in</a> eller
				<a href="<?=$printZoomOut?>">Zoom ut</a>. &nbsp;&nbsp;&nbsp;
				(<?=$width?> x <?=$height?> pixel)
				<a href="javascript:window.close()" class='button'>Stäng</a>
				<a href="javascript:window.print()" class='button'>Skriv ut</a>
			</div>
			<img src="<?=$imgUrl1?>" >
		</div>
		<script src="../js/analytics.js"></script>
	</body>
</html>
