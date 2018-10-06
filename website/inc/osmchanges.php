<?php
ini_set('max_execution_time', 300); //300 seconds = 5 minutes
include_once 'database_config.php';

$xml = file_get_contents("php://input") ;
$row = explode('"', $xml);

$user = "";
$lat = "";
echo "osmchanges.php start\n";

$db->query("START TRANSACTION");

for ($i = 0; $i < count($row); ++$i) {
	
	if ($row[$i] == " lat=") {
		$lat = $row[$i+1];
		$lon = "";
		$changeset = "";
		$user = "";
		$uid = "";
	}
	if ($row[$i] == " lon=")       $lng  = $row[$i+1];
	if ($row[$i] == " changeset=") $changeset = $row[$i+1];
	if ($row[$i] == " uid=")       $uid  = $row[$i+1];
	if ($row[$i] == " user=")      $user = $row[$i+1];
	
	if ($user && $lat) {
		// Save data
		echo "lat: $lat lng: $lng changeset: $changeset user: $user \n";
		
		/* Prepare statement */
		$sql='INSERT INTO osmchange (lat, lng, changeset, user, uid,create_date) VALUES (?,?,?,?,?,CURDATE())';
		$stmt = $db->prepare($sql);
		if($stmt === false) {
		  trigger_error('Wrong SQL: ' . $sql . ' Error: ' . $db->error, E_USER_ERROR);
		}
		 
		/* Bind parameters. TYpes: s = string, i = integer, d = double,  b = blob */
		$stmt->bind_param('ddisi',$lat,$lng,$changeset,$user,$uid);
		 
		/* Execute statement */
		$stmt->execute();
		$stmt->close();
		
		$user = "";
		$lat = "";
	}
}

$db->query("COMMIT");

echo "osmchanges.php done\n\n";
?>