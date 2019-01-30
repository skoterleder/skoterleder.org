<?php
include_once 'database_config.php';
include_once 'functions.php';
require __DIR__ . '../../vendor/autoload.php';

$pdp_db = new \PDO('mysql:dbname='.DATABASE.';host=localhost;charset=utf8mb4', USER, PASSWORD);
$auth = new \Delight\Auth\Auth($pdp_db);

$email = $auth->getEmail();
$jsonData ="";

if ($email) {
	$sql='SELECT id,title,description,name,lat,lng,type,status,createtime,commenttime,updatetime,count,comments,expires FROM marker WHERE status < 2 AND email=? ORDER BY expires DESC, status DESC, id DESC';
	$stmt = $db->prepare($sql);
	if($stmt === false) {
	  trigger_error('Wrong SQL: ' . $sql . ' Error: ' . $db->error, E_USER_ERROR);
	}

	$stmt->bind_param('s',$email);

	$stmt->execute();
	$stmt->bind_result($id,$title,$description,$name,$lat,$lng,$type,$status,$createtime,$commenttime,$updatetime,$count,$comments,$expires);

	$jsonData  = array("marker" => array());

	if ( $updatetime == "" ) $updatetime = $createtime;
	
	while ($stmt->fetch()) {
		
		if ( $updatetime == "" ) $updatetime = $createtime;
		
		$array = array(
			'coordinates' => array (
				$lat, $lng
			),
			'icon' => $type,
			'properties' => array(
				'id' => $id,
				'title' => $title,
				'description' => $description,
				'name' => $name,
				'type' => $type,
				'createtime' => $createtime,
				'updatetime' => $updatetime,
				'status' => $status,
				'comments' => $comments,
				'count' => $count,
				'expires' => $expires
			)
		);
		array_push($jsonData["marker"], $array);
	}

	$stmt->close();
	$db->close();
} else {
	$jsonData = "-1";
}

$json = json_encode($jsonData);
print_r($json);
?>