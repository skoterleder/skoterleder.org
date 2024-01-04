<?php
include_once 'database_config.php';
include_once 'functions.php';
require __DIR__ . '../../vendor/autoload.php';

$pdp_db = new \PDO('mysql:dbname='.DATABASE.';host=localhost;charset=utf8mb4', USER, PASSWORD);
$auth = new \Delight\Auth\Auth($pdp_db);

$userEmail = $auth->getEmail();
$userName = $auth->getUsername();

if ( $userEmail == "" ) $userEmail = "null";

$identifier = "";
$comment = "";
$url = "";
$title = "";
$affected_rows = "";
$action = "";
$sort = 1;

if(isset($_REQUEST['identifier'])) 	$identifier = 	convert_UTF8($_REQUEST["identifier"]);
if(isset($_REQUEST['comment'])) 	$comment = 		convert_UTF8($_REQUEST["comment"]);
if(isset($_REQUEST['url'])) 		$url = 			convert_UTF8($_REQUEST["url"]);
if(isset($_REQUEST['title']))		$title = 		convert_UTF8($_REQUEST["title"]);
if(isset($_REQUEST['sort']))		$sort = 		convert_UTF8($_REQUEST["sort"]);
if(isset($_REQUEST['hash'])) 		$hash = 		convert_UTF8($_REQUEST["hash"]);
if(isset($_REQUEST['type'])) 		$type = 		convert_UTF8($_REQUEST["type"]);
if(isset($_REQUEST['commentsCount'])) $commentsCount = convert_UTF8($_REQUEST["commentsCount"]);

if (!$comment ) {
	echo "error "." - Vänligen fyll i alla fält!";
	exit;
}

if ($action == "") {
	
	$commentHash = md5("SECRET_KEY".time());

	/* Prepare statement */
	$sql='INSERT INTO comment (identifier, sort, comment, url, title, email, name, hash) VALUES (?,?,?,?,?,?,?,?)';
	$stmt = $db->prepare($sql);
	if($stmt === false) {
	  trigger_error('Wrong SQL: ' . $sql . ' Error: ' . $db->error, E_USER_ERROR);
	}
	 
	/* Bind parameters. TYpes: s = string, i = integer, d = double,  b = blob */
	$stmt->bind_param('sissssss',$identifier,$sort,$comment,$url,$title,$userEmail,$userName,$commentHash);

	/* Execute statement */
	$stmt->execute();
	$stmt->close();
}

if ( $type == "info" || $type == "track" ) {
	newCommentInfoMail($identifier,$comment);
}

if ( $type == "marker" ) {
	newcommentmail($identifier,$comment);

	$commentsCount++;

	$sql='UPDATE marker SET comments = ?, commenttime = now() WHERE id=? AND LEFT(hash,8)=?';
	$stmt = $db->prepare($sql);

	if($stmt === false) {
	  echo "error";
	  trigger_error('Wrong SQL: ' . $sql . ' Error: ' . $db->error, E_USER_ERROR);
	}
	 
	/* Bind parameters. Types: s = string, i = integer, d = double,  b = blob */
	$stmt->bind_param('sis',$commentsCount,$identifier,$hash);
	$stmt->execute();

	$status = $stmt->affected_rows;

	echo "Ok:".$status;

	$stmt->close();
}

?>