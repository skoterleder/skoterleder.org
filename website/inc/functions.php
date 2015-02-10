<?php
function convert_UTF8($str) {  	// Används när data sparas till databasen
	$str = mb_convert_encoding($str, 'UTF-8', 'UTF-8');
	return $str;
}
function entQuotesREMOVE($str) {		// Används när data läses ur databasen
	// $str = htmlentities($str, ENT_QUOTES, 'UTF-8');
	$str = htmlspecialchars($str, ENT_QUOTES, 'UTF-8');
	return $str;
}

function convert_UTF8_htmlentities($str) {
	$str = mb_convert_encoding($str, 'UTF-8', 'UTF-8');
	$str = htmlentities($str, ENT_QUOTES, 'UTF-8');
	return $str;
}

function decode_UTF8_htmlentities($str) {
	$str = html_entity_decode($str, ENT_QUOTES, 'UTF-8');

	return $str;
}

function newcommentmail($id,$text){
	global $db;
	
	/* Prepare statement */
	$sql='SELECT email, name, title, hash FROM marker WHERE id = ?';
	$stmt = $db->prepare($sql);
	if($stmt === false) {
	  trigger_error('Wrong SQL: ' . $sql . ' Error: ' . $db->error, E_USER_ERROR);
	}

	/* Bind parameters. TYpes: s = string, i = integer, d = double,  b = blob */
	$stmt->bind_param('i',$id);

	$stmt->execute();

	$stmt->bind_result($email,$name,$title,$hash);
	$stmt->fetch();
	$stmt->close();
	$db->close();	

	mb_internal_encoding('UTF-8');
	
	$to      = $email;
	$subject = "Ny kommentar till markör: $title";
	$subject = mb_encode_mimeheader($subject, 'UTF-8', 'B');

	$open_url  	= SERVERADRESS . "#marker/$id/show";
	$change_url = SERVERADRESS . "#marker/$id/change/$hash";
	
	$message = '
	<html>
	<body>
		<p><b>Hej '.$name.'!</b></p>
		<p> </p>
		<p>En ny kommentar har skrivits om din markör som du skapat på skoterleder.org</p>
		<br>
		<p>Kommentar:</p>
		<br>
		<p><cite>
		'.$text.'
		</cite></p>
		<br>
		<br>
		<p>Läs alla kommentarer här: <a href="'.$open_url.'">'.$open_url.'</a></p>
		<br>
		<br>
		<p>Ändra/inaktivera länk: <a href="'.$change_url.'">'.$change_url.'</a></p>
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

	// To send HTML mail, the Content-type header must be set
	$headers  = 'MIME-Version: 1.0' . "\r\n";
	$headers .= 'Content-type: text/html; charset=UTF-8' . "\r\n";

	// Additional headers
	// $headers .= "To: $email . \r\n";
	$headers .= 'From: Skoterleder.org <info@skoterleder.org>' . "\r\n";
	$headers .= 'Bcc: henrik_rosvall@yahoo.se' . "\r\n";
	
	mail($to, $subject, $message, $headers);
}

function newChangeMarkerMail($id,$nemail){
	global $db;
	
	/* Prepare statement */
	$sql='SELECT email, name, title, hash, ehash FROM marker WHERE id = ? AND email=?';
	$stmt = $db->prepare($sql);
	if($stmt === false) {
	  trigger_error('Wrong SQL: ' . $sql . ' Error: ' . $db->error, E_USER_ERROR);
	}

	/* Bind parameters. TYpes: s = string, i = integer, d = double,  b = blob */
	$stmt->bind_param('is',$id,$nemail);

	$stmt->execute();

	$stmt->bind_result($email,$name,$title,$hash,$ehash);
	$stmt->fetch();
	$stmt->close();
	$db->close();	

	if ($email) {
		mb_internal_encoding('UTF-8');

		$name = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
		$title = htmlspecialchars($title, ENT_QUOTES, 'UTF-8');
		$description = htmlspecialchars($description, ENT_QUOTES, 'UTF-8');
		
		$to      = $email;
		$subject = "Din markör: $title";
		$subject = mb_encode_mimeheader($subject, 'UTF-8', 'B');

		$open_url  	= SERVERADRESS . "#marker/$id/show";
		$change_url = SERVERADRESS . "#marker/$id/change/$hash";
		$my_url     = SERVERADRESS . "#mymarkers/$ehash";
		
		$message = '
		<html>
		<body>
			<p><b>Hej '.$name.'!</b></p>
			<br>
			<p>Länkar till markören: <b>'.$title.'</b></p>
			<br>
			<p>Direktlänk: <a href="'.$open_url.'">'.$open_url.'</a></p>
			<p>Ändra/inaktivera länk: <a href="'.$change_url.'">'.$change_url.'</a></p>
			<br>
			<p>Lista alla min markörer: <a href="'.$my_url.'">'.$my_url.'</a></p>
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

		// To send HTML mail, the Content-type header must be set
		$headers  = 'MIME-Version: 1.0' . "\r\n";
		$headers .= 'Content-type: text/html; charset=UTF-8' . "\r\n";

		// Additional headers
		// $headers .= "To: $email . \r\n";
		$headers .= 'From: Skoterleder.org <info@skoterleder.org>' . "\r\n";
		$headers .= 'Bcc: henrik_rosvall@yahoo.se' . "\r\n";
		
		mail($to, $subject, $message, $headers);
	}
}
function flagMarkerMail($id,$hash,$description){
	global $db;
	
	/* Prepare statement */
	$sql='SELECT email, name, title, hash, ehash FROM marker WHERE id = ? AND LEFT(hash,8)=?';
	$stmt = $db->prepare($sql);
	if($stmt === false) {
	  trigger_error('Wrong SQL: ' . $sql . ' Error: ' . $db->error, E_USER_ERROR);
	}

	/* Bind parameters. TYpes: s = string, i = integer, d = double,  b = blob */
	$stmt->bind_param('is',$id,$hash);

	$stmt->execute();

	$stmt->bind_result($email,$name,$title,$hash,$ehash);
	$stmt->fetch();
	$stmt->close();
	$db->close();	

	if ($email) {
		mb_internal_encoding('UTF-8');
		
		$name = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
		$title = htmlspecialchars($title, ENT_QUOTES, 'UTF-8');
		$description = htmlspecialchars($description, ENT_QUOTES, 'UTF-8');
		
		$to      = $email;
		$subject = "Flaggad markör: $title";
		$subject = mb_encode_mimeheader($subject, 'UTF-8', 'B');

		$open_url  	= SERVERADRESS . "#marker/$id/show";
		$change_url = SERVERADRESS . "#marker/$id/change/$hash";
		$my_url     = SERVERADRESS . "#mymarkers/$ehash";
		
		$message = '
		<html>
		<body>
			<p><b>Hej '.$name.'!</b></p>
			<br>
			<p>Det är tydligen någon användare som finner din markör "'.$title.'" kränkande eller på annat sätt olämpligt.</p>
			<br>
			<p>Följande motivering angavs på sidan: 
			<br>
			<p><cite>'.$description.'</cite></p>			
			<br>
			<br>
			<p>Vänligen kontrollera din markör!</p>
			<br>
			<p>Länkar till markören: <b>'.$title.'</b></p>
			<br>
			<p>Direktlänk: <a href="'.$open_url.'">'.$open_url.'</a></p>
			<p>Ändra/inaktivera länk: <a href="'.$change_url.'">'.$change_url.'</a></p>
			<br>
			<p>Lista alla min markörer: <a href="'.$my_url.'">'.$my_url.'</a></p>
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

		// To send HTML mail, the Content-type header must be set
		$headers  = 'MIME-Version: 1.0' . "\r\n";
		$headers .= 'Content-type: text/html; charset=UTF-8' . "\r\n";

		// Additional headers
		// $headers .= "To: $email . \r\n";
		$headers .= 'From: Skoterleder.org <info@skoterleder.org>' . "\r\n";
		$headers .= 'Bcc: henrik_rosvall@yahoo.se' . "\r\n";

		mail($to, $subject, $message, $headers);
	}
}




?>