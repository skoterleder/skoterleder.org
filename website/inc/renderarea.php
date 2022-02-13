<?php
mb_internal_encoding('UTF-8');
include_once 'database_config.php';
include_once 'functions.php';

$lat1 = "";
$lng1 = "";
$lat2 = "";
$lng2 = "";
$tiles = 0;
$render = "";
$bb = "";
$id = "";
$render_time = "";

if(isset($_GET['lat1'])) $lat1 = convert_UTF8($_GET["lat1"]);
if(isset($_GET['lng1'])) $lng1 = convert_UTF8($_GET["lng1"]);
if(isset($_GET['lat2'])) $lat1 = convert_UTF8($_GET["lat2"]);
if(isset($_GET['lng2'])) $lng1 = convert_UTF8($_GET["lng2"]);

if(isset($_GET['tiles']))  $tiles  = convert_UTF8($_GET["tiles"]);
if(isset($_GET['render'])) $render = convert_UTF8($_GET["render"]);
if(isset($_GET['bb']))     $bb     = convert_UTF8($_GET["bb"]);
if(isset($_GET['id']))     $id 	   = convert_UTF8($_GET["id"]);

if(isset($_GET['st']))     $render_time = convert_UTF8($_GET["st"]);


$cord = explode(",", $bb);

if ( !$id ) {
	$sql='INSERT INTO updates (create_date,create_time) VALUES (CURDATE(),CURRENT_TIME())';
	$stmt = $db->prepare($sql);
	if($stmt === false) {
	  trigger_error('Wrong SQL: ' . $sql . ' Error: ' . $db->error, E_USER_ERROR);
	}

	$stmt->execute();
	$new_id = $stmt->insert_id;
	$stmt->close();
	
	echo "$new_id";
	exit;
}

if ( $bb && $id) {
	echo "Saves data \n";
	
	$layer = explode("x", $render);
	$zoom  = preg_replace("/[^0-9,.]/", "", $layer[0]);
	
	echo "Layer:".$layer[0]." zoom:$zoom";
	
	/* Prepare statement */
	$sql='INSERT INTO updateareas (update_id, layer, lat1, lng1, lat2, lng2, tiles, name ,create_date,zoom) VALUES (?,?,?,?,?,?,?,?,CURDATE(),?)';
	$stmt = $db->prepare($sql);
	if($stmt === false) {
	  trigger_error('Wrong SQL: ' . $sql . ' Error: ' . $db->error, E_USER_ERROR);
	}
	 
	/* Bind parameters. Types: s = string, i = integer, d = double,  b = blob */
	$stmt->bind_param('dsddddisi',$id,$layer[0],$cord[1],$cord[0],$cord[3],$cord[2],$tiles,$render,$zoom);
	 
	/* Execute statement */
	$stmt->execute();
	$stmt->close();
	
	if ( $tiles > 4000 && $zoom > 0 ) {              //700 tidiagre
		$lat = $cord[1]+($cord[3]-$cord[1])/2;
		$lng = $cord[0]+($cord[2]-$cord[0])/2;
		$center="http://skoterleder.org/#map/$zoom/$lat/$lng";
		$centerCh="http://skoterleder.org/osmchanges.html#map/$zoom/$lat/$lng";

		$subject = "Många ändrade tiles";
		$message  = "<p>Hej Henrik!</p><p>Det är många ($tiles st) ändrade tiles här: <a href=$center>$center</a></p>";
		$message .= "<p>Se även här: <a href=$centerCh>$centerCh</a></p>";
		$message .= "<img src='http://skoterleder.org/image/?zoom=$zoom&lat=$lat&lng=$lng&height=400&width=400'>";
		$message .= "<p>$render</p><p>Mvh<br/>Din renderardator</p>";

		$status = sendMail("henrik_rosvall@yahoo.se", $subject , $message);
		if ($status) echo "Mail sent";
	}
}
?>
