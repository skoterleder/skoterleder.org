<?php
include_once 'database_config.php';
include_once 'functions.php';
require __DIR__ . '../../vendor/autoload.php';

$pdp_db = new \PDO('mysql:dbname='.DATABASE.';host=localhost;charset=utf8mb4', USER, PASSWORD);
$auth = new \Delight\Auth\Auth($pdp_db);

$email = $auth->getEmail();
$id = "";
if(isset($_REQUEST['id'])) $id = convert_UTF8($_REQUEST["id"]);
$jsonData ="";

if ($auth->hasRole(\Delight\Auth\Role::MODERATOR) AND $id > 0 ) {
	/* Prepare statement */
	$sql='SELECT email FROM marker WHERE id = ?';
	$stmt = $db->prepare($sql);
	if($stmt === false) {
	  trigger_error('Wrong SQL: ' . $sql . ' Error: ' . $db->error, E_USER_ERROR);
	}

	/* Bind parameters. TYpes: s = string, i = integer, d = double,  b = blob */
	$stmt->bind_param('i',$id);
	$stmt->execute();
	$stmt->bind_result($email);
	$stmt->fetch();
	$stmt->close();
}

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
				'title' => htmlspecialchars($title, ENT_QUOTES, 'UTF-8'),
				'description' => htmlspecialchars($description, ENT_QUOTES, 'UTF-8'),  // nl2br removed!
				'name' => htmlspecialchars($name, ENT_QUOTES, 'UTF-8'),
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