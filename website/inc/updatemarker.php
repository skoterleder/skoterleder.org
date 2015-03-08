<?php
include_once 'database_config.php';
include_once 'functions.php';

$title="";
$description="";
$newType="";

if(isset($_GET['id'])) 			$id = 			convert_UTF8($_GET["id"]);
if(isset($_GET['hash'])) 		$hash = 		convert_UTF8($_GET["hash"]);
if(isset($_GET['action'])) 		$action = 		convert_UTF8($_GET["action"]);
if(isset($_GET['title'])) 		$title = 		convert_UTF8($_GET["title"]);
if(isset($_GET['description'])) $description = 	convert_UTF8($_GET["description"]);
if(isset($_GET['hash']))		$hash = 		convert_UTF8($_GET["hash"]);
if(isset($_GET['type']))		$newType = 		convert_UTF8($_GET["type"]);


if (!$description || !$title AND $action == "update") {
	echo "error - Vänligen fyll i alla fält!";
	exit;
}


if ($action == "activate") {

	$sql='UPDATE marker SET status=1 WHERE id=? AND hash=?';
	$stmt = $db->prepare($sql);
	if($stmt === false) {
	  echo "error";
	  trigger_error('Wrong SQL: ' . $sql . ' Error: ' . $db->error, E_USER_ERROR);
	}
	 
	/* Bind parameters. TYpes: s = string, i = integer, d = double,  b = blob */
	$stmt->bind_param('is',$id,$hash);
	$stmt->execute();
}

if ($action == "remove") {

	$sql='UPDATE marker SET status=-1 WHERE id=? AND hash=?';
	$stmt = $db->prepare($sql);
	if($stmt === false) {
	  echo "error";
	  trigger_error('Wrong SQL: ' . $sql . ' Error: ' . $db->error, E_USER_ERROR);
	}
	 
	/* Bind parameters. TYpes: s = string, i = integer, d = double,  b = blob */
	$stmt->bind_param('is',$id,$hash);
	$stmt->execute();
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
	
	// Save a copy on old marker nuu
	$sql='INSERT INTO marker (status,orgid,title,description,lat,lng,type,name,email,hash,ehash,createtime,updatetime,node,changeable) VALUES (2,?,?,?,?,?,?,?,?,?,?,?,?,?,?)';
	$stmt = $db->prepare($sql);
	if($stmt === false) {
	  trigger_error('Wrong SQL: ' . $sql . ' Error: ' . $db->error, E_USER_ERROR);
	}
	/* Bind parameters. TYpes: s = string, i = integer, d = double,  b = blob */
	$stmt->bind_param('issddissssssii',$id,$oTitle,$oDescription,$oLat,$oLng,$oType,$oName,$oEmail,$oHash,$oEhash,$oCreatetime,$oUpdatetime,$oNode,$oChangeable);
	$stmt->execute();
	$stmt->close();

	$type = $oType;
	if ( $newType > 0 ) $type = $newType;
	if ( $hash == "" ) $hash= "null";

	$sql='UPDATE marker SET status=1,title=?, description=?, updatetime=now(), type=? WHERE id=? AND ( hash=? OR changeable IS TRUE )';
	$stmt = $db->prepare($sql);
	if($stmt === false) {
	  echo "error";
	  trigger_error('Wrong SQL: ' . $sql . ' Error: ' . $db->error, E_USER_ERROR);
	}
		
	/* Bind parameters. TYpes: s = string, i = integer, d = double,  b = blob */
	$stmt->bind_param('ssiis',$title,$description,$type,$id,$hash);
	$stmt->execute();
}


echo "Ok:".$stmt->affected_rows;

$stmt->close();

?>