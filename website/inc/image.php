<?php
header ('Content-Type: image/png');

$icon="";

if(isset($_GET['zoom'])) $zoom = $_GET["zoom"];
if(isset($_GET['lat'])) $lat = $_GET["lat"];
if(isset($_GET['lng'])) $lng = $_GET["lng"];
if(isset($_GET['height'])) $height = $_GET["height"];
if(isset($_GET['width'])) $width = $_GET["width"];
if(isset($_GET['icon'])) $icon = $_GET["icon"];

// Icons from http://mapicons.nicolasmollet.com/

$icons[1] = '../images/icons/snowmobile-green.png';
$icons[2] = '../images/icons/information.png';
$icons[3] = '../images/icons/treedown.png';
$icons[4] = '../images/icons/caution.png';
$icons[5] = '../images/icons/fixmap.png';
$icons['l'] = '../images/icons/map22-1.png';
	
$x = (($lng + 180) / 360) * pow(2, $zoom);
$y = (1 - log(tan(deg2rad($lat)) + 1 / cos(deg2rad($lat))) / pi()) /2 * pow(2, $zoom);

$xStart = $x - ($width/2/256);
$yStart = $y - ($height/2/256);
$xEnd = $x + ($width/2/256);
$yEnd = $y + ($height/2/256);

$yoffset = floor(($yStart-floor($yStart)) * 256);
$xoffset = floor(($xStart-floor($xStart)) * 256);

$mapImage = imagecreatetruecolor($width, $height);
$row=0;
$firstrow=0;
$firstrowInv=1;

for ($yy = floor($yStart); $yy < $yEnd; $yy++) {
	$col=0;
	$firstcol=0;
	$firstcolInv=1;
	for ($xx = floor($xStart); $xx < $xEnd; $xx++) {
		$tile = imagecreatefrompng('http://tiles.skoterleder.org/tiles/'.$zoom.'/'.$xx.'/'.$yy.'.png');
		imagecopy($mapImage, $tile, ($col*256-$xoffset)*$firstcol, ($row*256-$yoffset)*$firstrow, $xoffset*$firstcolInv, $yoffset*$firstrowInv, 256, 256);
		$col++;
		$firstcolInv=0;
		$firstcol=1;
		// echo "<br>".'http://tiles.skoterleder.org/tiles/11/'.$xx.'/'.$yy.'.png';
	}
	$firstrow=1;
	$firstrowInv=0;
	$row++;
}

if ($icon) {
	list($iconWidth, $iconHeight) = getimagesize($icons[$icon]);
	$icon = imagecreatefrompng($icons[$icon]);
	imagecopy($mapImage, $icon, ($width/2) - ($iconWidth/2), ($height/2) - $iconHeight, 0, 0, $iconWidth, $iconHeight);
}

$textcolor = imagecolorallocate($mapImage, 140, 140, 150);

$textSize= 5;
if ($width < 650) $textSize= 4;
if ($width < 500) $textSize= 3;
// Write the string at the bottom left
imagestring($mapImage, $textSize, 20, $height-20, 'Skoterleder.org (c) OpenStreetMaps bidragsgivare', $textcolor);

imagepng($mapImage);
imagedestroy($mapImage);
?>