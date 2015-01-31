<?php
include_once 'database_config.php';
include_once 'functions.php';

$date = "";
if(isset($_GET['d'])) $date = convert_UTF8($_GET["d"]);

if ($date) {

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

	$jsonData  = array("change" => array());

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
	$sql='SELECT lat1, lng1,lat2, lng2, tiles, name FROM updateareas WHERE create_date = ?';
	$stmt = $db->prepare($sql);
	if($stmt === false) {
	  trigger_error('Wrong SQL: ' . $sql . ' Error: ' . $db->error, E_USER_ERROR);
	}

	/* Bind parameters. TYpes: s = string, i = integer, d = double,  b = blob */
	$stmt->bind_param('s',$date);

	$stmt->execute();
	$stmt->bind_result($lat1, $lng1, $lat2, $lng2, $tiles, $name);

	$jsonData  = $jsonData + array("areas" => array());

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

if (!$date) {

	/* Prepare statement */
	$sql='SELECT * FROM (SELECT DISTINCT (`create_date`) FROM  `updateareas` Order by create_date DESC LIMIT 7) s order by create_date' ;
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