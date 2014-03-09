<?php
include_once 'database_config.php';
include_once 'functions.php';

$id		= convert_UTF8($_GET["id"]);
$hash	= convert_UTF8($_GET["hash"]);
// $nemail = convert_UTF8($_GET["email"]);
$description = convert_UTF8($_GET["description"]);


$sql='UPDATE marker SET flag = 1 WHERE id=? AND LEFT(hash,8)=?';
$stmt = $db->prepare($sql);

if($stmt === false) {
  echo "error";
  trigger_error('Wrong SQL: ' . $sql . ' Error: ' . $db->error, E_USER_ERROR);
}
 
/* Bind parameters. Types: s = string, i = integer, d = double,  b = blob */
$stmt->bind_param('is',$id,$hash);
$stmt->execute();

$status = $stmt->affected_rows;

echo "Ok:".$status;

$stmt->close();

flagMarkerMail($id,$hash,$description);

?>