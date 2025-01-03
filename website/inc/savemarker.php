<?php
include_once 'database_config.php';
include_once 'functions.php';
require __DIR__ . '../../vendor/autoload.php';

$pdp_db = new \PDO('mysql:dbname='.DATABASE.';host=localhost;charset=utf8mb4', USER, PASSWORD);
$auth = new \Delight\Auth\Auth($pdp_db);

$userEmail = $auth->getEmail();
$userName = $auth->getUsername();

if (!$userEmail) {
	echo "error - Du är inte inloggad, vänligen logga in.";
	exit;
}

$title = 		convert_UTF8($_REQUEST["title"]);
$lat = 			convert_UTF8($_REQUEST["lat"]);
$lng = 			convert_UTF8($_REQUEST["lng"]);
$description = 	convert_UTF8($_REQUEST["description"]); 
$type = 		convert_UTF8($_REQUEST["type"]); 
$name = 		convert_UTF8($_REQUEST["name"]);
$email = $userEmail;

if (!$email || !$name || !$description || !$type || !$lat || !$lng || !$title) {
	echo "error - Vänligen fyll i alla fält!";
	exit;
}

$hash = md5("SECRET_KEY".time());
$ehash = md5("SECRET_KEY".$email);
$point = "POINT($lng $lat)";

/* Prepare statement */
$sql='INSERT INTO marker (status,title,description, lat, lng, type, name, email,hash,ehash,expirationtime,point) VALUES (1,?,?,?,?,?,?,?,?,?,TIMESTAMPADD(DAY,30,NOW()),ST_GeomFromText(?))';
$stmt = $db->prepare($sql);
if($stmt === false) {
  trigger_error('Wrong SQL: ' . $sql . ' Error: ' . $db->error, E_USER_ERROR);
}
 
/* Bind parameters. TYpes: s = string, i = integer, d = double,  b = blob */
$stmt->bind_param('ssddisssss',$title,$description,$lat,$lng,$type,$name,$email,$hash,$ehash,$point);
 
/* Execute statement */
$stmt->execute();

$id = $stmt->insert_id;

echo "Ok, id:$id";



//  ------ Sending mail  ------

mb_internal_encoding('UTF-8');

$to      = $email;
$subject = "Ny markör: $title";

$server_ur	= SERVERADRESS;
$open_url  	= SERVERADRESS . "#marker/$id";
$my_url     = SERVERADRESS . "#!mypage";
$message = '
<html>
<body>
	<p><b>Hej '.$userName.'!</b></p>
	<br>
	<p>Tack för att du registrerat en ny markör på skoterleder.org</p>
	<p>Tänk på att uppdatera markören om förutsättningar ändras så att det är aktuell information på <a href="'.$server_ur.'">skoterleder.org</a> sidan.</p>
	<br>
	<br>Information om din markör:<br>
	<b>'.$title.'</b><br>
	'.$description.'<br>
	<br>
	<a href="'.$open_url.'"><img src="http://skoterleder.org/image/?zoom=13&lat='.$lat.'&lng='.$lng.'&height=250&width=640&icon='.$type.'" height=250 width=640></a>
	<br>
	<p>Direktlänk till markören: <a href="'.$open_url.'">'.$open_url.'</a><br>
	På din sida kan du se alla dina markörer: <a href="'.$my_url.'">'.$my_url.'</a></p>
	<br>
	<br>
	<br>
	<p>Med vänliga hälsningar<br>
	Skoterleder.org</p>
</body>
</html>
';

sendMail($to, $subject, $message);
saveMarkerAddress();

$stmt->close();
 

function saveMarkerAddress() {
	global $db,$id,$lat,$lng;
	
	$url = "https://nominatim.openstreetmap.org/reverse?lat=$lat&lon=$lng&format=json&addressdetails=1&zoom=10";
	$options = array(
	  'http'=>array(
		'method'=>"GET",
		'header'=>"Accept-language: SE\r\n" .
				  "User-Agent: Skoterleder.org" 
	  )
	);

	$context = stream_context_create($options);
	$json = file_get_contents($url, false, $context);

	$adress = json_decode($json, true);

	$municipality = $adress["address"]["municipality"]; //Kommun
	$county = $adress["address"]["county"];				//Län


	$sql='UPDATE marker SET municipality=?, county=? WHERE id=?';
	$stmt = $db->prepare($sql);
	if($stmt === false) {
	  echo "error";
	  trigger_error('Wrong SQL: ' . $sql . ' Error: ' . $db->error, E_USER_ERROR);
	}
		
	/* Bind parameters. TYpes: s = string, i = integer, d = double,  b = blob */
	$stmt->bind_param('sss', $municipality, $county, $id);
	$stmt->execute();
	$affected_rows = $stmt->affected_rows;
	$stmt->close();

}

?>