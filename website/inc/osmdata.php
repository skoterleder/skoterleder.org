<?php
include_once 'database_config.php';
include_once 'functions.php';

$date = "";
$layer = "";
$id = "";

if(isset($_GET['d']))  $date  = convert_UTF8($_GET["d"]);
if(isset($_GET['l']))  $layer = convert_UTF8($_GET["l"]);
if(isset($_GET['id'])) $id    = convert_UTF8($_GET["id"]);

if ($date && !$id )  {  // När ett datum väljs, veturnerar alla ändringar och alla uppdateringstider.

	/* Prepare statement */
	$sql='SELECT lat, lng, changeset, user, uid FROM osmchange WHERE create_date = ?';
	$stmt = $db->prepare($sql);
	if($stmt === false) {
	  trigger_error('Wrong SQL: ' . $sql . ' Error: ' . $db->error, E_USER_ERROR);
	}

	/* Bind parameters. TYpes: s = string, i = integer, d = double,  b = blob */
	$stmt->bind_param('s',$date);

	$stmt->execute();
	$stmt->bind_result($lat, $lng,$changeset,$user,$uid);

	$jsonData = array("change" => array());

	while ($stmt->fetch()) {
		$array = array(
			'c' => array (
				$lat, $lng
			),
			'cs' => $changeset,
			'u' => $user,
			'i' => $uid,
		);
		array_push($jsonData["change"], $array);
	}
	$stmt->close();


	/* Prepare statement */
	$sql='SELECT id, create_time FROM updates WHERE create_date = ?';
	$stmt = $db->prepare($sql);
	if($stmt === false) {
	  trigger_error('Wrong SQL: ' . $sql . ' Error: ' . $db->error, E_USER_ERROR);
	}

	/* Bind parameters. TYpes: s = string, i = integer, d = double,  b = blob */
	$stmt->bind_param('s',$date);

	$stmt->execute();
	$stmt->bind_result($id,$create_time);

	$jsonData = $jsonData + array("updates" => array());

	while ($stmt->fetch()) {
		$array = array(
			'id' => $id,
			'time' => substr($create_time,0,5),
		);
		array_push($jsonData["updates"], $array);
	}
	$stmt->close();
	
	$layer = "";
	$id = "";
}



if ( $id && !$layer ) {

	/* Prepare statement */
	$sql='SELECT lat, lng, changeset, user, uid FROM osmchange WHERE update_id = ?';
	$stmt = $db->prepare($sql);
	if($stmt === false) {
	  trigger_error('Wrong SQL: ' . $sql . ' Error: ' . $db->error, E_USER_ERROR);
	}

	/* Bind parameters. TYpes: s = string, i = integer, d = double,  b = blob */
	$stmt->bind_param('s',$id);

	$stmt->execute();
	$stmt->bind_result($lat, $lng,$changeset,$user,$uid);

	$jsonData = array("change" => array());

	while ($stmt->fetch()) {
		$array = array(
			'c' => array (
				$lat, $lng
			),
			'cs' => $changeset,
			'u' => $user,
			'i' => $uid,
		);
		array_push($jsonData["change"], $array);
	}
	$stmt->close();


	/* Prepare statement */
	$sql='SELECT DISTINCT (layer) FROM updateareas WHERE update_id = ?';
	$stmt = $db->prepare($sql);
	if($stmt === false) {
	  trigger_error('Wrong SQL: ' . $sql . ' Error: ' . $db->error, E_USER_ERROR);
	}

	/* Bind parameters. TYpes: s = string, i = integer, d = double,  b = blob */
	$stmt->bind_param('d',$id);

	$stmt->execute();
	$stmt->bind_result($layer);

	$jsonData = $jsonData + array("layer" => array());

	while ($stmt->fetch()) {
		$array = array(
			'name' => $layer,
		);
		array_push($jsonData["layer"], $array);
	}
	$stmt->close();
	
	$layer="";
}

if ($id && $layer) { 

	/* Prepare statement */
	$sql='SELECT lat1, lng1,lat2, lng2, tiles, name FROM updateareas WHERE update_id = ? AND layer = ?';
	$stmt = $db->prepare($sql);
	if($stmt === false) {
	  trigger_error('Wrong SQL: ' . $sql . ' Error: ' . $db->error, E_USER_ERROR);
	}

	/* Bind parameters. TYpes: s = string, i = integer, d = double,  b = blob */
	$stmt->bind_param('ds',$id,$layer);

	$stmt->execute();
	$stmt->bind_result($lat1, $lng1, $lat2, $lng2, $tiles, $name);

	$jsonData = array("areas" => array());

	while ($stmt->fetch()) {
		$array = array(
			'bb' => array (
				array ($lat1, $lng1),
				array ($lat2, $lng2)
			),
			't' => $tiles,
			'n' => $name,
		);
		array_push($jsonData["areas"], $array);
	}

	$stmt->close();
	$db->close();
}

if (!$date && !$id) {  // Hittar alla datum

	/* Prepare statement */
	//$sql='SELECT * FROM (SELECT DISTINCT (`create_date`) FROM  `updateareas` Order by create_date DESC LIMIT 7) s order by create_date' ;
	//$sql='SELECT create_date FROM  `updates` GROUP by create_date Order by create_date ASC LIMIT 7' ;
	
	$sql='SELECT * FROM (SELECT DISTINCT (`create_date`) FROM  `updates` Order by create_date DESC LIMIT 7) s order by create_date' ;
	$stmt = $db->prepare($sql);
	if($stmt === false) {
	  trigger_error('Wrong SQL: ' . $sql . ' Error: ' . $db->error, E_USER_ERROR);
	}

	$stmt->execute();
	$stmt->bind_result($date);

	$jsonData  = array("dates" => array());

	while ($stmt->fetch()) {
		$array = array('date' => $date);
		array_push($jsonData["dates"], $array);
	}

	$stmt->close();
	$db->close();
}

$json = json_encode($jsonData);

print_r($json);
?>