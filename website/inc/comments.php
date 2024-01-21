<?php
header("Access-Control-Allow-Origin: *");

include_once 'database_config.php';
include_once 'functions.php';

$identifier = "";
$jsonData = "";

if(isset($_GET['identifier']))	  $identifier =	   convert_UTF8($_GET["identifier"]);

if ($identifier) {
	/* Prepare statement */
	$sql='SELECT id,sort,createtime,status,name,comment,url,title,hash,flag,filename FROM comment WHERE identifier = ? AND status=1 ORDER BY sort, id';
	$stmt = $db->prepare($sql);
	if($stmt === false) {
	  trigger_error('Wrong SQL: ' . $sql . ' Error: ' . $db->error, E_USER_ERROR);
	}

	/* Bind parameters. TYpes: s = string, i = integer, d = double,  b = blob */
	$stmt->bind_param('s',$identifier);

	$stmt->execute();
	$stmt->bind_result($id,$sort,$createtime,$status,$name,$comment,$url,$title,$hash,$flag,$filename);

	$jsonData  = array("comment" => array());

	
		
	while ($stmt->fetch()) {
		$array = array(
			'id' => $id,
			'sort' => $sort,
			'createtime' => $createtime,
			'status' => $status,
			'name' =>  htmlspecialchars($name, ENT_QUOTES, 'UTF-8'),
			'comment' => htmlspecialchars($comment, ENT_QUOTES, 'UTF-8'),  // nl2br removed!   ,
			'url' => $url,
			'title' => $title,
			'hash' => substr($hash,0,8),
			'flag' => $flag,
			'filename' => $filename,
		);
		array_push($jsonData["comment"], $array);
	}

	$stmt->close();
	$db->close();
}

$json = json_encode($jsonData);

print_r($json);
?>