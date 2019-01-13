<?php
include_once 'database_config.php';
include_once 'functions.php';
require __DIR__ . '../../vendor/autoload.php';

$pdp_db = new \PDO('mysql:dbname='.DATABASE.';host=localhost;charset=utf8mb4', USER, PASSWORD);
$auth = new \Delight\Auth\Auth($pdp_db);

$userEmail = $auth->getEmail();
$userName = $auth->getUsername();

if ( $userEmail == "" ) $userEmail = "null";

$title="";
$description="";
$newType="";
$affected_rows = "";
$hash = "";

if(isset($_REQUEST['id'])) 			$id = 			convert_UTF8($_REQUEST["id"]);
if(isset($_REQUEST['hash'])) 		$hash = 		convert_UTF8($_REQUEST["hash"]);
if(isset($_REQUEST['action'])) 		$action = 		convert_UTF8($_REQUEST["action"]);
if(isset($_REQUEST['title'])) 		$title = 		convert_UTF8($_REQUEST["title"]);
if(isset($_REQUEST['description']))	$description = 	convert_UTF8($_REQUEST["description"]);
if(isset($_REQUEST['type']))		$newType = 		convert_UTF8($_REQUEST["type"]);
if(isset($_REQUEST['name']))		$name = 		convert_UTF8($_REQUEST["name"]);


if (!$description || !$title AND $action == "update") {
	echo "error - Vänligen fyll i alla fält!";
	exit;
}


if ($action == "activate") {

	//To do!!!
	$sql='UPDATE marker SET status=1 WHERE id=? AND hash=?';
	$stmt = $db->prepare($sql);
	if($stmt === false) {
	  echo "error";
	  trigger_error('Wrong SQL: ' . $sql . ' Error: ' . $db->error, E_USER_ERROR);
	}
	 
	/* Bind parameters. TYpes: s = string, i = integer, d = double,  b = blob */
	$stmt->bind_param('is',$id,$hash);
	$stmt->execute();
	$affected_rows = $stmt->affected_rows;
	$stmt->close();
}

if ($action == "remove") {

	$sql='UPDATE marker SET status=-1 WHERE id=? AND ( hash=? OR email=? )';
	$stmt = $db->prepare($sql);
	if($stmt === false) {
	  echo "error";
	  trigger_error('Wrong SQL: ' . $sql . ' Error: ' . $db->error, E_USER_ERROR);
	}
	 
	/* Bind parameters. TYpes: s = string, i = integer, d = double,  b = blob */
	$stmt->bind_param('iss',$id,$hash,$userEmail);
	$stmt->execute();
	$affected_rows = $stmt->affected_rows;
	$stmt->close();
}

if ($action == "change") {
	// Read all old values
	$sql='SELECT status, title, description,name, createtime, commenttime, updatetime, email, lat, lng, comments, hash, ehash, type, node, changeable  FROM marker WHERE id = ?';
	$stmt = $db->prepare($sql);
	if($stmt === false) {
	  trigger_error('Wrong SQL: ' . $sql . ' Error: ' . $db->error, E_USER_ERROR);
	}
	/* Bind parameters. TYpes: s = string, i = integer, d = double,  b = blob */
	$stmt->bind_param('i',$id);
	$stmt->execute();
	$stmt->bind_result($oStatus,$oTitle,$oDescription,$oName,$oCreatetime,$oCommenttime,$oUpdatetime,$oEmail,$oLat,$oLng,$oComments,$oHash,$oEhash,$oType,$oNode,$oChangeable);	
	$stmt->fetch();
	$stmt->close();

	if ( $oChangeable != 1 AND $oHash != $hash and $userEmail != $oEmail ) {
			echo "oChangeable: $oChangeable<br>";
			echo "$hash<br>";
			echo "$oHash<br>";
			echo "$userEmail<br>";
			echo "$oEmail<br>";
			die('Wrong user');
	}

	if ( $title != $oTitle || $description != $oDescription || $name != $oName || $newType != $oType ) {
		// Save a copy off old marker
		$sql='INSERT INTO marker (status,orgid,title,description,lat,lng,type,name,email,hash,ehash,createtime,updatetime,node,changeable) VALUES (2,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
		$stmt = $db->prepare($sql);
		if($stmt === false) {
		  trigger_error('Wrong SQL: ' . $sql . ' Error: ' . $db->error, E_USER_ERROR);
		}
		/* Bind parameters. TYpes: s = string, i = integer, d = double,  b = blob */
		$stmt->bind_param('issddissssssii',$id,$oTitle,$oDescription,$oLat,$oLng,$oType,$oName,$oEmail,$oHash,$oEhash,$oCreatetime,$oUpdatetime,$oNode,$oChangeable);
		$stmt->execute();
		$stmt->close();
	}

	$type = $oType;
	if ( $newType > 0 ) $type = $newType;
	if ( $hash == "" ) $hash= "null";

	$days = 30;
	if ( $type > 5) $days = 60;  // For Markers of: Parking, coffee, Fule, Shelter and Wildernesshut

	$sql='UPDATE marker SET status=1,title=?, description=?, name=?, updatetime=now(), type=?, expirationtime = NOW() + INTERVAL ? DAY, notification=0, expires=null  WHERE id=? AND ( hash=? OR email=? OR changeable IS TRUE )';
	$stmt = $db->prepare($sql);
	if($stmt === false) {
	  echo "error";
	  trigger_error('Wrong SQL: ' . $sql . ' Error: ' . $db->error, E_USER_ERROR);
	}
		
	/* Bind parameters. TYpes: s = string, i = integer, d = double,  b = blob */
	$stmt->bind_param('sssiiiss',$title,$description,$name,$type,$days,$id,$hash,$userEmail);
	$stmt->execute();
	$affected_rows = $stmt->affected_rows;
	$stmt->close();
}

if ($action == "uptodate") {

	$sql='SELECT type FROM marker WHERE id = ?';
	$stmt = $db->prepare($sql);
	if($stmt === false) {
	  trigger_error('Wrong SQL: ' . $sql . ' Error: ' . $db->error, E_USER_ERROR);
	}
	$stmt->bind_param('i',$id);
	$stmt->execute();
	$stmt->bind_result($type);	
	$stmt->fetch();
	$stmt->close();
	
	$days = 30;
	if ( $type > 5) $days = 60;  // For Markers of: Parking, coffee, Fule, Shelter and Wildernesshut
	
	$sql='UPDATE marker SET notification=0, expirationtime = NOW() + INTERVAL ? DAY, status=1 WHERE id=? AND hash=?';
	$stmt = $db->prepare($sql);
	if($stmt === false) {
	  echo "error";
	  trigger_error('Wrong SQL: ' . $sql . ' Error: ' . $db->error, E_USER_ERROR);
	}
	 
	/* Bind parameters. TYpes: s = string, i = integer, d = double,  b = blob */
	$stmt->bind_param('iis',$days,$id,$hash);
	$stmt->execute();
	
	$affected_rows = $stmt->affected_rows;
	$stmt->close();
}

echo "Ok:".$affected_rows;

?>