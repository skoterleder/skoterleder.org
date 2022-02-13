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

$imgUrl1 = SERVERADRESS."image/?zoom=$zoom&lat=$lat&lng=$lng&width=$width&height=$height&.png";
$imgMapLink = SERVERADRESS."#map/$zoom/$lat/$lng";

$printZoomIn = SERVERADRESS."preview-image/?zoom=".($zoom+1)."&lat=$lat&lng=$lng&width=".($width*2)."&height=".($height*2)."&icon=$type";
$printZoomOut = SERVERADRESS."preview-image/?zoom=".($zoom-1)."&lat=$lat&lng=$lng&width=".($width/2)."&height=".($height/2)."&icon=$type";

$BBlink  = "[url=".$imgMapLink."][img]".$imgUrl1."[/img][/url]";
$HTMLlink = '<a href="'.$imgMapLink.'"><img src="'.$imgUrl1.'" width="'.$width.'" height="'.$height.'" alt="Skoterledskarta" border="0" /></a>';

?>
<!DOCTYPE html>
<html lang="se">
	<head>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=2.0, user-scalable=yes" />
		<title>Förhandsgranska bild</title>
		<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/1.11.0/jquery.min.js"></script>
		<style type="text/css">
			body {
				padding: 0;
				margin: 10px;
				font-family: Georgia, Times New Roman, times-roman, georgia, serif;
				height: 100%;
			}
			html {
				height: 100%;
			}
			.wrap {
				display: inline-block;
				width: 100%;
				height: 100%;
			}
			.button {
				color: black;
				background-color: #D8D8D8;
				border-radius: 4px;
				text-decoration: none;
				margin: 0 7px;
				padding: 3px 14px;
				font-size: 1.1em;
			}
			img {
				margin:8px;
				padding:4px;
				border: solid #D0D0EE 1px;
			}
			input[type="text"] {
				width: 95%
			}
		</style>
		<script>
			$(document).ready(function(){
				$(".shareLinkText").click(function () {
				   $(this).select();
				});
			});
		</script>

			
		</head>
	<body>
		<div class='wrap'>
			<div class='menu'>
				Zoom:<?=$zoom?> &nbsp;&nbsp;&nbsp; <a href="<?=$printZoomIn?>">Zoom in</a> eller
				<a href="<?=$printZoomOut?>">Zoom ut</a>. &nbsp;&nbsp;&nbsp;
				(<?=$width?> x <?=$height?> pixel)
				<a href="javascript:window.close()" class='button'>Stäng</a>
			</div>
			<img src="<?=$imgUrl1?>" height="<?=$height?>" width="<?=$width?>" alt="Skoterledskarta" >
			<p>
				Placera gärna kartbilden på din sida! Kartan kommer att uppdateras automatiskt
				när någon ändrar den.
			</p>
			<p>
				Tips, ca 660 pixlar bred bild kan vara lagom för att visa på forum.
				Använd BBCode länken för att få en kartbild som är länka till samma ställe på skoterleder.org kartan.
			</p>
			<h2>Länk till kartbilden:</h2>
			<p>
				<table width="100%">
				<tr><td width="10px">Direktlänk: </td><td><input type='text' value='<?=$imgUrl1?>' class='shareLinkText'></td></tr>
				<tr><td>BBCode:</td><td><input type='text' value='<?=$BBlink?>' class='shareLinkText'></td></tr>
				<tr><td>HTML:</td><td><input type='text' value='<?=$HTMLlink?>' class='shareLinkText'></td></tr>
				</table>
			</p>
			<p>
				Använd gärna följande länk för att länka till kartan: 
			</p>
			<p>
				<a href="<?=$imgMapLink?>"><?=$imgMapLink?></a>
			</p>
		</div>
		<script src="../js/analytics.js"></script>
	</body>
</html>








