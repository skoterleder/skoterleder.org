<?php
include_once 'database_config.php';
include_once 'functions.php';

$uid = convert_UTF8($_GET["uid"]);
$lat = convert_UTF8($_GET["lat"]);
$lng = convert_UTF8($_GET["lng"]);

$sql='INSERT INTO location (`identifier`, `lat`, `lng`) VALUES (?,?,?)';
$stmt = $db->prepare($sql);

if($stmt === false) {
  echo "error";
  trigger_error('Wrong SQL: ' . $sql . ' Error: ' . $db->error, E_USER_ERROR);
}
 
/* Bind parameters. Types: s = string, i = integer, d = double,  b = blob */
$stmt->bind_param('sdd',$uid,$lat,$lng);
$stmt->execute();

$stmt->close();
?>