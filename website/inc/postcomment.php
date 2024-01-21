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
	
	if (isset($_FILES["file"]) && $_FILES["file"]["error"] == 0) {

		if($_FILES['file']['size'] > 4194304 ) { //4 MB (size is also in bytes)
			echo "error - Max 4 MB filstorlek.";
			exit;
		}

		$fileName = basename($_FILES["file"]["name"]);
		$imageFileType = strtolower(pathinfo($fileName, PATHINFO_EXTENSION));
		$allowedExtensions = array("jpg", "jpeg", "png");

		if ( !in_array($imageFileType, $allowedExtensions) ) {		
			echo "error - använd jpg eller png fil.";
			exit;
		}
	}

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
	$id = $stmt->insert_id;

	// Upload file and update database.
	if (isset($_FILES["file"]) && $_FILES["file"]["error"] == 0) {
		$hash = md5("SECRET_KEY".time());
		$targetDir = UPLOADPATH;
		$fileName = basename($_FILES["file"]["name"]);
		$targetTmpFilePath = $targetDir . $hash;
		$targetFilePath = $targetDir.$fileName;

		// Move the uploaded file to the specified directory
		if ( move_uploaded_file($_FILES["file"]["tmp_name"], $targetTmpFilePath) ) {

			$maxWidth = 5000;
			resizeImage($targetTmpFilePath,$targetFilePath, $id, $maxWidth);
			$maxWidth = 600;
			resizeImage($targetTmpFilePath,$targetFilePath, $id, $maxWidth);	

			unlink($targetTmpFilePath);

			// Update database.
			$sql='UPDATE comment SET filename=? WHERE id=?';
			$stmt = $db->prepare($sql);

			if($stmt === false) {
			  echo "error";
			  trigger_error('Wrong SQL: ' . $sql . ' Error: ' . $db->error, E_USER_ERROR);
			}
			 
			/* Bind parameters. Types: s = string, i = integer, d = double,  b = blob */
			$stmt->bind_param('si',$fileName,$id);
			$stmt->execute();
			
		} else {
			echo "error - något gick fel i uppladningen av fil.";
		}
	}
	
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

function resizeImage($filePath, $targetFilePath, $id, $maxWidth) {
	list($origWidth, $origHeight,$imageType) = getimagesize($filePath);

	$prefix = $id."-".$maxWidth."-";
	if ( $maxWidth > $origWidth ) $maxWidth = $origWidth;

	$ratio = $maxWidth / $origWidth;
	$newWidth = $maxWidth;
	$newHeight = $origHeight * $ratio;
	$newFilePath = pathinfo($targetFilePath, PATHINFO_DIRNAME).'/'.$prefix.pathinfo($targetFilePath, PATHINFO_BASENAME);

	$imageResized = imagecreatetruecolor($newWidth, $newHeight);

	switch ($imageType) {
		case IMAGETYPE_PNG:
			$imageSource = imagecreatefrompng($filePath);
			imagecopyresampled($imageResized, $imageSource, 0, 0, 0, 0, $newWidth, $newHeight, $origWidth, $origHeight);
			imagepng($imageResized, $newFilePath);
			break;

		case IMAGETYPE_JPEG:
			$imageSource = imagecreatefromjpeg($filePath);
			imagecopyresampled($imageResized, $imageSource, 0, 0, 0, 0, $newWidth, $newHeight, $origWidth, $origHeight);
			imagejpeg($imageResized, $newFilePath);
			break;

		default:
			echo "Invalid Image type.";
			exit;
			break;
	}

	imagedestroy($imageResized);
	imagedestroy($imageSource);
}
?>