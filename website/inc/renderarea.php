<?php
include_once 'database_config.php';
include_once 'functions.php';


$lat1 = "";
$lng1 = "";
$lat2 = "";
$lng2 = "";
$tiles = 0;
$render = "";
$bb = "";

if(isset($_GET['lat1'])) $lat1 = convert_UTF8($_GET["lat1"]);
if(isset($_GET['lng1'])) $lng1 = convert_UTF8($_GET["lng1"]);
if(isset($_GET['lat2'])) $lat1 = convert_UTF8($_GET["lat2"]);
if(isset($_GET['lng2'])) $lng1 = convert_UTF8($_GET["lng2"]);

if(isset($_GET['tiles']))  $tiles  = convert_UTF8($_GET["tiles"]);
if(isset($_GET['render'])) $render = convert_UTF8($_GET["render"]);
if(isset($_GET['bb']))     $bb     = convert_UTF8($_GET["bb"]);

$cord = explode(",", $bb);

if ( (0 === strpos($render, 'nz8x') || 0 === strpos($render, 'sz9x') )  && $bb) {
	echo "Saves data \n";
	
	/* Prepare statement */
	$sql='INSERT INTO updateareas (lat1, lng1, lat2, lng2, tiles, name ,create_date) VALUES (?,?,?,?,?,?,CURDATE())';
	$stmt = $db->prepare($sql);
	if($stmt === false) {
	  trigger_error('Wrong SQL: ' . $sql . ' Error: ' . $db->error, E_USER_ERROR);
	}
	 
	/* Bind parameters. Types: s = string, i = integer, d = double,  b = blob */
	$stmt->bind_param('ddddis',$cord[1],$cord[0],$cord[3],$cord[2],$tiles,$render);
	 
	/* Execute statement */
	$stmt->execute();
	$stmt->close();
}
?>