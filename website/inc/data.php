<?php
include_once 'database_config.php';
include_once 'functions.php';

$q = "";
$ehash = "";

if(isset($_GET['q']))	  $q =	   convert_UTF8($_GET["q"]);
if(isset($_GET['ehash'])) $ehash = convert_UTF8($_GET["ehash"]);

if (!$ehash) {

	$from = "2012-01-01";
	if ($q == "new" ) $from = date('Y-m-d', strtotime("-7 day"));
	
	/* Prepare statement */
	$sql='SELECT id,title,lat, lng, type FROM marker WHERE status=1 AND (createtime > ? OR updatetime > ?)';
	$stmt = $db->prepare($sql);
	if($stmt === false) {
	  trigger_error('Wrong SQL: ' . $sql . ' Error: ' . $db->error, E_USER_ERROR);
	}

	/* Bind parameters. TYpes: s = string, i = integer, d = double,  b = blob */
	$stmt->bind_param('ss',$from,$from);

	$stmt->execute();
	$stmt->bind_result($id,$title,$lat, $lng, $type);

	$jsonData  = array("marker" => array());

	while ($stmt->fetch()) {
		$array = array(
			'coordinates' => array (
				$lat, $lng
			),
			'icon' => $type,
			'properties' => array(
				'id' => $id,
				'title' => $title,
			)
		);
		array_push($jsonData["marker"], $array);
	}

	$stmt->close();
	$db->close();
}
if ($ehash) {
	/* Prepare statement */
	$sql='SELECT id,title,hash,lat,lng,type,status,createtime,commenttime,updatetime,count,comments FROM marker WHERE status < 2 AND ehash=? ORDER BY id DESC';
	$stmt = $db->prepare($sql);
	if($stmt === false) {
	  trigger_error('Wrong SQL: ' . $sql . ' Error: ' . $db->error, E_USER_ERROR);
	}

	/* Bind parameters. TYpes: s = string, i = integer, d = double,  b = blob */
	$stmt->bind_param('s',$ehash);

	$stmt->execute();
	$stmt->bind_result($id,$title,$hash,$lat, $lng, $type, $status,$createtime,$commenttime,$updatetime,$count,$comments);

	$jsonData  = array("marker" => array());

	while ($stmt->fetch()) {
		$array = array(
			'coordinates' => array (
				$lat, $lng
			),
			'icon' => $type,
			'properties' => array(
				'id' => $id,
				'title' => $title,
				'createtime' => $createtime,
				'status' => $status,
				'comments' => $comments,
				'count' => $count,
				'hash' => $hash,
			)
		);
		array_push($jsonData["marker"], $array);
	}

	$stmt->close();
	$db->close();
}


$json = json_encode($jsonData);

print_r($json);
?>