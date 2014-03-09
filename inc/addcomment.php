<?php
include_once 'database_config.php';
include_once 'functions.php';

if(isset($_GET['id']))	 $id =   convert_UTF8($_GET["id"]);
if(isset($_GET['hash'])) $hash = convert_UTF8($_GET["hash"]);
if(isset($_GET['text'])) $text = convert_UTF8($_GET["text"]);

$sql='UPDATE marker SET comments = comments + 1, commenttime = now() WHERE id=? AND LEFT(hash,8)=?';
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

if ($status === 1) newcommentmail($id,$text);

?>