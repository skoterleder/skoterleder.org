<?php
include_once 'database_config.php';
$icon = "";
$debug = "";

if(isset($_GET['zoom'])) $zoom = $_GET["zoom"];
if(isset($_GET['lat'])) $lat = $_GET["lat"];
if(isset($_GET['lng'])) $lng = $_GET["lng"];
if(isset($_GET['height'])) $height = $_GET["height"];
if(isset($_GET['width'])) $width = $_GET["width"];
if(isset($_GET['icon'])) $icon = $_GET["icon"];
if(isset($_GET['debug'])) $debug = $_GET["debug"];

if(!preg_match('/^FacebookExternalHit\/.*?/i',$_SERVER['HTTP_USER_AGENT']) AND !$debug){
	if ($icon) $icon = "/l"; 
	header("Location: ".SERVERADRESS."#map/$zoom/$lat/$lng$icon");
}
if ($icon) $icon = "&icon=l";

$width = 470;
$height = floor($width / 1.9);

$imgUrl1 = SERVERADRESS."image/?zoom=".($zoom-0)."&lat=$lat&lng=$lng&height=$height&width=$width$icon";
$imgUrl2 = SERVERADRESS."image/?zoom=".($zoom-1)."&lat=$lat&lng=$lng&height=$height&width=$width$icon";
$imgUrl3 = SERVERADRESS."image/?zoom=".($zoom-2)."&lat=$lat&lng=$lng&height=$height&width=$width$icon";

$title = "Skoterleder.org - Snöskoterkarta!";
$description = "Skoterkarta för skoteråkare av skoteråkare! Perfekt vid planering inför skoterresan eller ute på leden med kartan i mobilen.";
?>

<!DOCTYPE html>
<html lang="se">
	<head>
		<meta charset="utf-8" />
		<title>Skoterleder.org - <?=$title?></title>
		<meta property="og:title" content="<?=$title?>" />
		<meta property="og:type" content="website" />
		<meta property="og:url" content="<?=SERVERADRESS?>map/?zoom=<?=$zoom?>&lat=<?=$lat?>&lng=<?=$lng?><?=$icon?>" />
		<meta property="og:image" content="<?=$imgUrl1?>" />
		<meta property="og:image:width" content="<?=$width?>" />
		<meta property="og:image:height" content="<?=$height?>" />
		<meta property="og:image" content="<?=$imgUrl2?>" />
		<meta property="og:image:width" content="<?=$width?>" />
		<meta property="og:image:height" content="<?=$height?>" />
		<meta property="og:image" content="<?=$imgUrl3?>" />
		<meta property="og:image:width" content="<?=$width?>" />
		<meta property="og:image:height" content="<?=$height?>" />
		<meta property="og:site_name" content="Skoterleder.org" />
		<meta property="og:description" content="<?=$description?>"
	</head>
	<body>
		<h1><?=$title?></h1>
		<p><?=$description?></p>
		<p>
		<img src="<?=$imgUrl1?>" />
		</p>
		<p>
		<img src="<?=$imgUrl2?>" />
		</p>
		<p>
		<img src="<?=$imgUrl3?>" />
		</p>
		<p><?=$width?> x <?=$height?></p>
	</body>
</html>
