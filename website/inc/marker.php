<?php
include_once 'database_config.php';
include_once 'functions.php';

$id = $_GET["id"];
if(isset($_GET['debug'])) $debug = $_GET["debug"];

if(!preg_match('/^FacebookExternalHit\/.*?/i',$_SERVER['HTTP_USER_AGENT']) AND !$debug){
	header("Location: ".SERVERADRESS."#marker/$id");
}

/* Prepare statement */
$sql='SELECT status, title, description,name, createtime, commenttime, updatetime, email, lat, lng, comments, hash, type, count FROM marker WHERE id = ?';
$stmt = $db->prepare($sql);
if($stmt === false) {
  trigger_error('Wrong SQL: ' . $sql . ' Error: ' . $db->error, E_USER_ERROR);
}

/* Bind parameters. TYpes: s = string, i = integer, d = double,  b = blob */
$stmt->bind_param('i',$id);

$stmt->execute();

$stmt->bind_result($status,$title,$description,$name,$createtime,$commenttime,$updatetime,$email,$lat,$lng,$comments, $hash, $type, $count);
$stmt->fetch();
$stmt->close();
$db->close();

$width = 470;
$height = floor($width / 1.9);

$imgUrl1 = SERVERADRESS."image/?zoom=12&lat=$lat&lng=$lng&height=$height&width=$width&icon=$type";
$imgUrl2 = SERVERADRESS."image/?zoom=11&lat=$lat&lng=$lng&height=$height&width=$width&icon=$type";
$imgUrl3 = SERVERADRESS."image/?zoom=10&lat=$lat&lng=$lng&height=$height&width=$width&icon=$type";

?>

<!DOCTYPE html>
<html lang="se">
	<head>
		<meta charset="utf-8" />
		<title>Skoterleder.org - <?=$title?></title>
		<meta property="og:title" content="Skoterleder.org - <?=$title?>" />
		<meta property="og:type" content="website" />
		<meta property="og:url" content="<?=SERVERADRESS?>marker/?id=<?=$id?>" />
		<meta property="og:image" content="<?=$imgUrl1?>" />
		<meta property="og:image:width" content="<?=$width?>" />
		<meta property="og:image:height" content="<?=$height?>" />
		<meta property="og:image" content="<?=$imgUrl2?>" />
		<meta property="og:image:width" content="<?=$width?>" />
		<meta property="og:image:height" content="<?=$height?>" />
		<meta property="og:image" content="<?=$imgUrl3?>" />
		<meta property="og:image:width" content="<?=$width?>" />
		<meta property="og:image:height" content="<?=$height?>" />
		<meta property="og:site_name" content="Skoterleder.org" />
		<meta property="og:description" content="<?=$description?>"
	</head>
	<body>
		<h1><?=$title?></h1>
		<p><?=$description?></p>
		<p>Skapad av <?=$name?></p>
		<p>
			<img src="<?=$imgUrl1?>" />
		</p>
		<p>
			<img src="<?=$imgUrl2?>" />
		</p>
		<p>
			<img src="<?=$imgUrl3?>" />
		</p>
		<p><?=$width?> x <?=$height?></p>
	</body>
</html>
