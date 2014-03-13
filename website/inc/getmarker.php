<?php
include_once 'database_config.php';
include_once 'functions.php';

$id = $_GET["id"];

/* Prepare statement */
$sql='SELECT status, title, description,name, createtime, commenttime, updatetime, email, lat, lng, comments, hash, type, count FROM marker WHERE id = ?';
$stmt = $db->prepare($sql);
if($stmt === false) {
  trigger_error('Wrong SQL: ' . $sql . ' Error: ' . $db->error, E_USER_ERROR);
}

/* Bind parameters. TYpes: s = string, i = integer, d = double,  b = blob */
$stmt->bind_param('i',$id);

$stmt->execute();

$stmt->bind_result($status, $title, $description,$name,$createtime,$commenttime,$updatetime,$email,$lat,$lng,$comments, $hash, $type, $count);
while ($stmt->fetch()) {
  // echo "title:$title Desc: $description <br>";
  	$jsonData = array(
		'status' => htmlspecialchars($status, ENT_QUOTES, 'UTF-8'),
		'title' =>  htmlspecialchars($title, ENT_QUOTES, 'UTF-8'),
		'description' => htmlspecialchars($description, ENT_QUOTES, 'UTF-8'),  // nl2br removed!
		'name' =>  htmlspecialchars($name, ENT_QUOTES, 'UTF-8'),
		'createtime' => $createtime,  // date('Y-m-d H:i',strtotime($createtime)),
		'commenttime' => $commenttime, // date('Y-m-d H:i',strtotime($commenttime)),
		'updatetime' => $updatetime,  // date('Y-m-d H:i',strtotime($updatetime)),
		'md5' => md5(strtolower(trim($email))),
		'latlng' => array (
			$lat, $lng
		),
		'hash' => substr($hash,0,8),
		'comments' => $comments,
		'type' => $type,
		'count' => $count,
	);
}
$stmt->close();

// update count of visited marker
$sql='UPDATE marker SET count = count + 1 WHERE id=?';
$stmt = $db->prepare($sql);
if($stmt === false) {
  echo "error";
  trigger_error('Wrong SQL: ' . $sql . ' Error: ' . $db->error, E_USER_ERROR);
}
$stmt->bind_param('i',$id);
$stmt->execute();
$stmt->close();

$db->close();

$json = "";
if (!isset($jsonData)) {
	$jsonData = array(
		'title' => "error",
	);
}

$json = json_encode($jsonData);

print_r($json);
?>