<?php
include_once 'database_config.php';
include_once 'functions.php';

$title = 		convert_UTF8($_GET["title"]);
$lat = 			convert_UTF8($_GET["lat"]);
$lng = 			convert_UTF8($_GET["lng"]);
$description = 	convert_UTF8($_GET["description"]); 
$type = 		convert_UTF8($_GET["type"]); 
$name = 		convert_UTF8($_GET["name"]);
$email = 		convert_UTF8($_GET["email"]);


if (!$email || !$name || !$description || !$type || !$lat || !$lng || !$title) {
	echo "error - Vänligen fyll i alla fält!";
	exit;
}

$hash = md5("SECRET_KEY".time());
$ehash = md5("SECRET_KEY".$email);

/* Prepare statement */
$sql='INSERT INTO marker (title,description, lat, lng, type, name, email,hash,ehash) VALUES (?,?,?,?,?,?,?,?,?)';
$stmt = $db->prepare($sql);
if($stmt === false) {
  trigger_error('Wrong SQL: ' . $sql . ' Error: ' . $db->error, E_USER_ERROR);
}
 
/* Bind parameters. TYpes: s = string, i = integer, d = double,  b = blob */
$stmt->bind_param('ssddissss',$title,$description,$lat,$lng,$type,$name,$email,$hash,$ehash);
 
/* Execute statement */
$stmt->execute();

$id = $stmt->insert_id;

echo "Ok, id:$id";



//  ------ Sending mail  ------

mb_internal_encoding('UTF-8');

$to      = $email;
$subject = "Ny markör: $title";
$subject = mb_encode_mimeheader($subject, 'UTF-8', 'B');

$open_url  	= SERVERADRESS . "#marker/$id";
$change_url = SERVERADRESS . "#marker/$id/change/$hash";
$aktiv_url  = SERVERADRESS . "#marker/$id/activate/$hash";
$delete_url = SERVERADRESS . "#marker/$id/remove/$hash";
$my_url     = SERVERADRESS . "#mymarkers/$ehash";
$message = '
<html>
<body>
	<h2>Verifiering av ny markör</h2>
	<p><b>Hej '.$name.'!</b></p>
	<br>
	<p>Tack för att du registrerat en ny markör på skoterleder.org</p>
	<p>För att markören ska visas på kartan måste du först aktivera den genom att klicka på aktiveringslänken nedan.</p>
	<br>
	<p>Aktiverings länk: <a href="'.$aktiv_url.'">'.$aktiv_url.'</a></p>
	<br>
	<br>
	<h2>Andra bra länkar</h2>
	<p>Direktlänk: <a href="'.$open_url.'">'.$open_url.'</a></p>
	<p>Ändra/inaktivera länk: <a href="'.$change_url.'">'.$change_url.'</a></p>
	<p>Mina markörer: <a href="'.$my_url.'">'.$my_url.'</a></p>
	<br>
	<br>
	<p><b>Observera att alla som har dessa "långa" länkar kan radera eller ändra på markören!</b> Var lite rädd om länkarna!</p>
	<p>Om du tappar bort detta mail kan du få nytt mail ut skickat via kartan/markören</p>
	<br>
	<br>
	<p>Med vänliga hälsningar</p>
	<p>Skoterleder.org</p>
</body>
</html>
';

sendMail($to, $subject, $message);

$stmt->close();

?>