<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\OAuth;
use League\OAuth2\Client\Provider\Google;
require __DIR__ . '../../vendor/autoload.php';

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
	$pdp_db = new \PDO('mysql:dbname='.DATABASE.';host=localhost;charset=utf8mb4', USER, PASSWORD);
	$auth = new \Delight\Auth\Auth($pdp_db);
	$userEmail = $auth->getEmail();

	/* Prepare statement */
	$sql='SELECT email, name, title, hash, lat,lng, type FROM marker WHERE id = ?';
	$stmt = $db->prepare($sql);
	if($stmt === false) {
	  trigger_error('Wrong SQL: ' . $sql . ' Error: ' . $db->error, E_USER_ERROR);
	}

	/* Bind parameters. TYpes: s = string, i = integer, d = double,  b = blob */
	$stmt->bind_param('i',$id);

	$stmt->execute();

	$stmt->bind_result($email,$name,$title,$hash,$lat,$lng,$type);
	$stmt->fetch();
	$stmt->close();
	

	mb_internal_encoding('UTF-8');
	
	$to      = $email;
	$subject = "Ny kommentar till markör: $title";

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
		<p><cite>
		'.$text.'
		</cite></p>
		<br>
		<br>
		<p>Läs alla kommentarer här: <a href="'.$open_url.'">'.$open_url.'</a></p>
		<br>
		<p><a href="'.$open_url.'"><img src="http://skoterleder.org/image/?zoom=13&lat='.$lat.'&lng='.$lng.'&height=250&width=640&icon='.$type.'" height=250 width=640></a></p>
		<p>Ändra/inaktivera länk: <a href="'.$change_url.'">'.$change_url.'</a></p>
		<br>
		<br>
		<p><b>Observera att alla som har dessa "långa" länkar kan radera eller ändra på markören!</b> Var lite rädd om länkarna!</p>
		<br>
		<br>
		<p>Med vänliga hälsningar</p>
		<p>Skoterleder.org</p>
	</body>
	</html>
	';

	if ( $email != $userEmail ) sendMail($to, $subject, $message);  //Only send if not users makrer.



	/* Send email to everyone who commented */

	/* Prepare statement */
	// comments > 0 AND
	$sql='SELECT email, name FROM comment WHERE identifier=? AND status=1 GROUP BY email';
	$stmt = $db->prepare($sql);
	if($stmt === false) {
	  trigger_error('Wrong SQL: ' . $sql . ' Error: ' . $db->error, E_USER_ERROR);
	}

	/* Bind parameters. TYpes: s = string, i = integer, d = double,  b = blob */
	$stmt->bind_param('i',$id);

	$stmt->execute();
	$status = $stmt->bind_result( $CommentEmail, $name );
	
	$i=0;
	$tmpCommentEmail = [];
	$tmpName = [];
	
	if ( $status > 0 ) {
		while ($stmt->fetch()) {
			
			if ( $CommentEmail != $email && $userEmail != $CommentEmail ) {
				$tmpCommentEmail[$i] = $CommentEmail;
				$tmpname[$i] = $name;
				$i++;
			}
		}
		
		$i=0;
		foreach ( $tmpCommentEmail as &$x) {
			$to   = $tmpCommentEmail[$i];
			$name = $tmpname[$i];
			$subject = "Ny kommentar till markör: $title";

			$message = '
			<html>
			<body>
				<p><b>Hej '.$name.'!</b></p>
				<p> </p>
				<p>En ny kommentar har postats på en markör som du kommenterat tidigare på skoterleder.org</p>
				<br>
				<p>Kommentar:</p>
				<p><cite>
				'.$text.'
				</cite></p>
				<br>
				<p><a href="'.$open_url.'"><img src="http://skoterleder.org/image/?zoom=13&lat='.$lat.'&lng='.$lng.'&height=250&width=640&icon='.$type.'" height=250 width=640></a></p>
				<p>Läs alla kommentarer här: <a href="'.$open_url.'">'.$open_url.'</a></p>
				<br>
				<br>
				<br>
				<p>Med vänliga hälsningar</p>
				<p>Skoterleder.org</p>
			</body>
			</html>
			';

			sendMail($to, $subject, $message);
			$i++;
		}
	}
	$stmt->close();

	if ( $email == $userEmail && $i == 0 ) sendMail("", $subject, $message);  //Send mail to admin
}
function getGPXupploadUserInfo($id) {
	global $db;
	
	$id = str_replace("-track", "", $id);
	
	/* Prepare statement */
	$sql='SELECT email, name, perfemail, perfname FROM gpxtrack WHERE id = ?';
	$stmt = $db->prepare($sql);
	if($stmt === false) {
	  trigger_error('Wrong SQL: ' . $sql . ' Error: ' . $db->error, E_USER_ERROR);
	}

	/* Bind parameters. TYpes: s = string, i = integer, d = double,  b = blob */
	$stmt->bind_param('i',$id);

	$stmt->execute();

	$stmt->bind_result($user["email"],$user["name"],$user["perfemail"],$user["perfname"]);
	$stmt->fetch();
	$stmt->close();
	
	return $user;
}

function newCommentInfoMail($id,$text){
	global $db;
	$pdp_db = new \PDO('mysql:dbname='.DATABASE.';host=localhost;charset=utf8mb4', USER, PASSWORD);
	$auth = new \Delight\Auth\Auth($pdp_db);
	$userEmail = $auth->getEmail();
	
	mb_internal_encoding('UTF-8');

	$user = getGPXupploadUserInfo($id);

	/* Send email to everyone who commented */
	/* Prepare statement */
	$sql='SELECT email, id, name, title, url FROM comment WHERE identifier=? AND status=1 GROUP BY email';
	$stmt = $db->prepare($sql);
	if($stmt === false) {
	  trigger_error('Wrong SQL: ' . $sql . ' Error: ' . $db->error, E_USER_ERROR);
	}

	/* Bind parameters. TYpes: s = string, i = integer, d = double,  b = blob */
	$stmt->bind_param('s',$id);

	$stmt->execute();
	$status = $stmt->bind_result( $CommentEmail, $comId, $name, $title, $url );
	
	$tmpCommentEmail[0] = $user["email"];
	$tmpName[0] = $user["name"];
	$i=1;

	if ( filter_var($user["perfemail"], FILTER_VALIDATE_EMAIL) && $user["perfemail"] != $userEmail ) {
		$tmpCommentEmail[1] = $user["perfemail"];
		$tmpName[1] = $user["perfname"];
		$i=2;
	}
	
	if ( $status > 0 ) {
		while ($stmt->fetch()) {
			
			if ( $userEmail != $CommentEmail ) {
				$tmpCommentEmail[$i] = $CommentEmail;
				$tmpName[$i] = $name;
				$i++;
			}
		}

		$open_url  	= $url;
		$i=0;
		
		foreach ( $tmpCommentEmail as &$x) {
			
			$to		 = $tmpCommentEmail[$i];
			$name	 = $tmpName[$i];
			$subject = "Ny kommentar till sidan: $title";

			$message = '
			<html>
			<body>
				<p><b>Hej '.$name.'!</b></p>
				<p>En ny kommentar har postats på sidan '.$title.'.</p>
				<br>
				<p>Kommentar:</p>
				<p>"<cite>'.$text.'</cite>"</p>
				<br>
				<p>Läs alla kommentarer här: <a href="'.$open_url.'">'.$open_url.'</a></p>
				<br>
				<br>
				<br>
				<p>Med vänliga hälsningar</p>
				<p>Skoterleder.org</p>
			</body>
			</html>
			';

			sendMail($to, $subject, $message);
			$i++;
		}
	}
	$stmt->close();

	if ( $i == 0 ) {
		$message = '<html><body><p>En ny kommentar har postats på sidan '.$title.'.</p><p>"<cite>'.$text.'</cite>"
					</p><br><p><a href="'.$open_url.'">'.$open_url.'</a></p><p>Skoterleder.org</p></body></html>';
		$subject = "Ny kommentar till sidan: $title";
		sendMail("", $subject, $message);  //Send mail to admin
	}
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

	if ($email) {
		mb_internal_encoding('UTF-8');

		$name = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
		$title = htmlspecialchars($title, ENT_QUOTES, 'UTF-8');
		
		$to      = $email;
		$subject = "Din markör: $title";

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

		sendMail($to, $subject, $message);
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

	if ($email) {
		mb_internal_encoding('UTF-8');
		
		$name = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
		$title = htmlspecialchars($title, ENT_QUOTES, 'UTF-8');
		$description = htmlspecialchars($description, ENT_QUOTES, 'UTF-8');
		
		$to      = $email;
		$subject = "Flaggad markör: $title";

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

		sendMail($to, $subject, $message);
	}
}

function flagCommentMail($id,$hash,$description){
	global $db;
	
	/* Prepare statement */
	$sql='SELECT email, name, comment, url, title FROM comment WHERE id = ? AND LEFT(hash,8)=?';
	$stmt = $db->prepare($sql);
	if($stmt === false) {
	  trigger_error('Wrong SQL: ' . $sql . ' Error: ' . $db->error, E_USER_ERROR);
	}

	/* Bind parameters. TYpes: s = string, i = integer, d = double,  b = blob */
	$stmt->bind_param('is',$id,$hash);

	$stmt->execute();

	$stmt->bind_result($email,$name,$comment,$url,$title);
	$stmt->fetch();
	$stmt->close();

	if ($email) {
		mb_internal_encoding('UTF-8');

		$name = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
		$title = htmlspecialchars(substr($comment,0,20), ENT_QUOTES, 'UTF-8');
		$comment = htmlspecialchars($comment, ENT_QUOTES, 'UTF-8');
		$description = htmlspecialchars($description, ENT_QUOTES, 'UTF-8');
		
		$to      = $email;
		$subject = "Flaggad kommentar: $title";

		$message = '
		<html>
		<body>
			<p><b>Hej '.$name.'!</b></p>
			<p>En användare har anmält din kommentar som kränkande eller på annat sätt olämplig.</p>
			<p>Följande motivering angavs på sidan:</p>
			<p>"<cite>'.$description.'</cite>"</p>
			<br>
			<p>Din kommentar:</p>
			<p>"<cite>'.$comment.'</cite>"</p>
			<br>
			<p>För tillfället kam du inte ändra dina kommentare. Administratören kommer att vidta lämpliga åtgärder, t.ex. såsom att ta bort kommentaren.</p>
			<br>
			<p>Länkar till kommentaren: <a href="'.$url.'">'.$url.'</a></b></p>
			<br>
			<br>
			<br>
			<p>Med vänliga hälsningar</p>
			<p>Skoterleder.org</p>
		</body>
		</html>
		';

		sendMail($to, $subject, $message);
	}
}

function newGPXcommentmail($id,$text){
	global $db;
	
	/* Prepare statement */ 
	$sql='SELECT email, name, trackname, perfname, perfemail FROM gpxtrack WHERE id = ?';
	$stmt = $db->prepare($sql);
	if($stmt === false) {
	  trigger_error('Wrong SQL: ' . $sql . ' Error: ' . $db->error, E_USER_ERROR);
	}

	/* Bind parameters. TYpes: s = string, i = integer, d = double,  b = blob */
	$stmt->bind_param('i',$id);

	$stmt->execute();

	$stmt->bind_result($email, $name, $trackname, $perfname, $perfemail);
	$stmt->fetch();
	$stmt->close();

	mb_internal_encoding('UTF-8');
	
	if ( filter_var($email, FILTER_VALIDATE_EMAIL) ) {
		$to      = $email;
		$subject = "Ny kommentar till spår: $trackname";
		$open_url  	= SERVERADRESS . "gpx/#!track/$id";
		
		$message = '
		<html>
		<body>
			<p><b>Hej '.$name.'!</b></p>
			<p> </p>
			<p>En ny kommentar har skrivits om spåret som du laddat upp på skoterleder.org</p>
			<br><p>Kommentar:</p><br>
			<p><cite>'.$text.'</cite></p><br><br>
			<p>Läs och svara på kommentarer här: <a href="'.$open_url.'">'.$open_url.'</a></p>
			<br><br><br>
			<p>Med vänliga hälsningar</p>
			<p>Skoterleder.org</p>
		</body>
		</html>
		';

		sendMail($to, $subject, $message);
	}
	if ( filter_var($perfemail, FILTER_VALIDATE_EMAIL) && $perfemail != $email ) {
		$to      = $perfemail;
		$subject = "Ny kommentar till spår: $trackname";
		$open_url  	= SERVERADRESS . "gpx/#!track/$id";
		
		$message = '
		<html>
		<body>
			<p><b>Hej '.$perfname.'!</b></p>
			<p> </p>
			<p>En ny kommentar har skrivits om spåret som du anmält dig som införare till på skoterleder.org</p>
			<br><p>Kommentar:</p><br>
			<p><cite>'.$text.'</cite></p><br><br>
			<p>Läs och svara på kommentarer här: <a href="'.$open_url.'">'.$open_url.'</a></p>
			<br><br><br>
			<p>Med vänliga hälsningar</p>
			<p>Skoterleder.org</p>
		</body>
		</html>
		';

		sendMail($to, $subject, $message);
	}
}

function sendConfirmeMail($email,$selector,$token){
	$subject = "Verifiera din epostadress";
	$url = SERVERADRESS.'#confirmemail/' . \urlencode($selector) . '/' . \urlencode($token);
	$to = $email;
	
	$message = '
	<html>
	<body>
		<p>Du har skapat ett konto till skoterleder.org med e-postadressen <b>'.$email.'.</b></p>
		<p>Klicka på länken för att aktivera ditt konto: <a href="'.$url.'">'.$url.'</a>
		(går det inte att klicka på länken kan du kopiera den och klistra in den direkt till din webbläsare)</p>
		<br>
		<br>
		<p>Med vänliga hälsningar</p>
		<a href='.SERVERADRESS.'>Skoterleder.org</a></p>
	</body>
	</html>
	';
	sendMail($to, $subject, $message);
}

function resetpasswordMail($email,$selector,$token){
	$subject = "Återställande av lösenord";
	$url = SERVERADRESS.'#resetpassword/' . \urlencode($selector) . '/' . \urlencode($token);
	$to = $email;

	$message = '
	<html>
	<body>
		<p>Du kan återställa ditt lösenord till Skoterleder.org genom att klicka på länken nedan:
		<br><br>
		<a href="'.$url.'">'.$url.'</a>
		<br>
		(går det inte att klicka på länken kan du kopiera den och klistra in den direkt till din webbläsare)</p>
		<br>
		<br>
		<p>Med vänliga hälsningar<br>
		<a href='.SERVERADRESS.'>Skoterleder.org</a></p>
	</body>
	</html>
	';
	sendMail($to, $subject, $message);
}
function sendMail($to, $subject, $message) {

	$subjectMime = mb_encode_mimeheader($subject, 'UTF-8', 'B');
	date_default_timezone_set("Europe/Stockholm");

	//Create a new PHPMailer instance
	$mail = new PHPMailer;
	$mail->isSMTP();
	$mail->SMTPDebug = 0;
	$mail->Host = 'smtp.gmail.com';
	$mail->Port = 587;
	$mail->SMTPSecure = 'tls';
	$mail->SMTPAuth = true;
	$mail->AuthType = 'XOAUTH2';
	$email = 'info@skoterleder.org';
	$clientId = CLIENTID;
	$clientSecret = CLIENTSECRET;
	$refreshToken = REFRESHTOKEN;

	$provider = new Google(
		[
			'clientId' => $clientId,
			'clientSecret' => $clientSecret,
		]
	);

	$mail->setOAuth(
		new OAuth(
			[
				'provider' => $provider,
				'clientId' => $clientId,
				'clientSecret' => $clientSecret,
				'refreshToken' => $refreshToken,
				'userName' => $email,
			]
		)
	);

	$mail->isHTML(true); 
	$mail->CharSet = 'utf-8';
	$mail->setFrom($email, 'Skoterleder.org');
	$mail->addAddress($to);
	$mail->addBCC('henrik_rosvall@yahoo.se');
	$mail->Subject = $subjectMime;
	$mail->Body    = $message;

	//send the message, check for errors
	if (!$mail->send()) {
		$result = "Error";
	} else {
		$result = "ok";
	}

	saveMail($to,$subject,$message,$result);
	return $result;
}

function saveMail($to,$subject,$message,$result){
	global $db;

	$sql='INSERT INTO messages (`email`, `subject`, `message`, `result`) VALUES (?,?,?,?)';
	$stmt = $db->prepare($sql);

	if($stmt === false) {
	  echo "error";
	  trigger_error('Wrong SQL: ' . $sql . ' Error: ' . $db->error, E_USER_ERROR);
	}

	$stmt->bind_param('ssss',$to,$subject,$message,$result);
	$stmt->execute();
	$stmt->close();
}


function tileImage(	$zoom, $lat, $lng, $height, $width, $icon="" ) {
	// Icons from http://mapicons.nicolasmollet.com/

	$icons[1] = '../images/icons/snowmobile-green.png';
	$icons[2] = '../images/icons/information.png';
	$icons[3] = '../images/icons/treedown.png';
	$icons[4] = '../images/icons/caution.png';
	$icons[5] = '../images/icons/fixmap.png';
	$icons[6] = '../images/icons/parking.png';
	$icons[7] = '../images/icons/coffee.png';
	$icons[500] = '../images/icons/fuel.png';
	$icons[501] = '../images/icons/shelter.png';
	$icons[502] = '../images/icons/wildernesshut.png';
	$icons['l'] = '../images/icons/map22-1.png';
		
	$x = (($lng + 180) / 360) * pow(2, $zoom);
	$y = (1 - log(tan(deg2rad($lat)) + 1 / cos(deg2rad($lat))) / pi()) /2 * pow(2, $zoom);

	$xStart = $x - ($width/2/256);
	$yStart = $y - ($height/2/256);
	$xEnd = $x + ($width/2/256);
	$yEnd = $y + ($height/2/256);

	$yoffset = floor(($yStart-floor($yStart)) * 256);
	$xoffset = floor(($xStart-floor($xStart)) * 256);

	$mapImage = imagecreatetruecolor($width, $height);
	$row=0;
	$firstrow=0;
	$firstrowInv=1;

	for ($yy = floor($yStart); $yy < $yEnd; $yy++) {
		$col=0;
		$firstcol=0;
		$firstcolInv=1;
		for ($xx = floor($xStart); $xx < $xEnd; $xx++) {
			$tile = "";
			if (file_exists(TILESPATH.$zoom.'/'.$xx.'/'.$yy.'.png')) $tile = imagecreatefrompng(TILESPATH.$zoom.'/'.$xx.'/'.$yy.'.png');
			if ($tile) imagecopy($mapImage, $tile, ($col*256-$xoffset)*$firstcol, ($row*256-$yoffset)*$firstrow, $xoffset*$firstcolInv, $yoffset*$firstrowInv, 256, 256);
			$col++;
			$firstcolInv=0;
			$firstcol=1;
		}
		$firstrow=1;
		$firstrowInv=0;
		$row++;
	}

	if ($icon) {
		list($iconWidth, $iconHeight) = getimagesize($icons[$icon]);
		$iconPNG = imagecreatefrompng($icons[$icon]);
		imagecopy($mapImage, $iconPNG, ($width/2) - ($iconWidth/2), ($height/2) - $iconHeight, 0, 0, $iconWidth, $iconHeight);
	}

	$textcolor = imagecolorallocate($mapImage, 140, 140, 150);

	$textSize= 5;
	if ($width < 650) $textSize= 4;
	if ($width < 500) $textSize= 3;
	// Write the string at the bottom left
	imagestring($mapImage, $textSize, 20, $height-20, 'Skoterleder.org (c) OpenStreetMaps bidragsgivare', $textcolor);
	
	$filename = $zoom."-".$lat."-".$lng."-".$height."-".$width."-".$icon.".png";
	imagepng($mapImage, IMGPATH.$filename);
	imagedestroy($mapImage);

	return "/img/".$filename;
}

?>