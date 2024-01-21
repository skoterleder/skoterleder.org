<?php
include_once 'database_config.php';
include_once 'functions.php';

$debug = "";
$id = "";
if(isset($_GET['id'])) $id = $_GET["id"];
if(isset($_GET['debug'])) $debug = $_GET["debug"];

$isUser = "";
$agent = $_SERVER['HTTP_USER_AGENT'];

if( stristr( $agent, "FacebookExternalHit" ) ) $isUser = "fb";
if( stristr( $agent, "Google" ) ) $isUser = "google";
if( stristr( $agent, "Google" ) ) $isUser = "msnbot";

if( $isUser == "" AND !$debug ) {
	header("Location: ".SERVERADRESS."#marker/$id");
}

/* Prepare statement */
$sql='SELECT status, title, description,name, createtime, commenttime, updatetime, email, lat, lng, comments, hash, type, count, municipality, county FROM marker WHERE id = ?';
$stmt = $db->prepare($sql);
if($stmt === false) {
  trigger_error('Wrong SQL: ' . $sql . ' Error: ' . $db->error, E_USER_ERROR);
}

/* Bind parameters. TYpes: s = string, i = integer, d = double,  b = blob */
$stmt->bind_param('i',$id);

$stmt->execute();

$stmt->bind_result($status,$title,$description,$name,$createtime,$commenttime,$updatetime,$email,$lat,$lng,$comments, $hash, $type, $count, $municipality, $county);
$stmt->fetch();
$stmt->close();

$width = 500;
$height = floor($width / 1);

$imgUrl1 = tileImage(12,$lat,$lng,$height,$width,$type);
$imgUrl2 = tileImage(11,$lat,$lng,$height,$width,$type);
$imgUrl3 = tileImage(10,$lat,$lng,$height,$width,$type);

$place = "";
if ( $municipality ) {
	$place = "<p>Denna markör finns i ".$municipality." i ".$county.".</p>";
}

$noindex = "";
if ( $status != 1 ) $noindex = "<meta name='robots' content='noindex' />";

$commentHTML = "";
$numberOfComments = 0;
$identifier = $id;

if ($identifier) {
	/* Prepare statement */
	$sql='SELECT sort,createtime,status,name,comment,flag FROM comment WHERE identifier = ? AND status=1 ORDER BY sort, id';
	$stmt = $db->prepare($sql);
	if($stmt === false) {
	  trigger_error('Wrong SQL: ' . $sql . ' Error: ' . $db->error, E_USER_ERROR);
	}

	/* Bind parameters. TYpes: s = string, i = integer, d = double,  b = blob */
	$stmt->bind_param('s',$identifier);

	$stmt->execute();
	$stmt->bind_result($sort,$ccreatetime,$status,$cname,$comment,$flag);
	
	$numberOfComments = 0;
	
	while ($stmt->fetch()) {
		$commentHTML .= "<h4>Av $cname</h4>";
		$commentHTML .= "<p class='commettxt'>$comment</p>";
		$numberOfComments++;
	}

	$stmt->close();
}

if ($numberOfComments == 0 ) {
	$commentHTML = "<h3>0 Kommentarer</h3>".$commentHTML;
}elseif ($numberOfComments == 1 ) {
	$commentHTML = "<h3>1 Kommentar</h3>".$commentHTML;
}elseif ($numberOfComments > 1 ) {
	$commentHTML = "<h3>$numberOfComments Kommentarer</h3>".$commentHTML;
}

$db->close();

?>

<!DOCTYPE html>
<html lang="se">
	<head>
		<meta charset="utf-8" />
		<title>Skoterleder.org - <?=$title?></title>
		<link rel="canonical" href="<?=SERVERADRESS?>#!marker/<?=$id?>/show" />
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
		<meta property="og:description" content="<?=$description?>" />
		<?=$noindex?>
	</head>
	<body>
		<h1><?=$title?></h1>
		<p><?=$description?></p>
		<p>Skapad av: <?=$name?></p>
		<p>Skapad <?=$createtime?></p>
		<p>
			<img src="<?=$imgUrl1?>" />
		</p>
		<?=$place?>
		<div><?=$commentHTML?></div>
		<p>
			<img src="<?=$imgUrl2?>" />
		</p>
		<p>
			<img src="<?=$imgUrl3?>" />
		</p>
		<p><?=$width?> x <?=$height?></p>
	</body>
</html>
