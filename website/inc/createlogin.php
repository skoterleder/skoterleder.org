<?php
include_once 'database_config.php';
include_once 'functions.php';
require __DIR__ . '../../vendor/autoload.php';

$pdp_db = new \PDO('mysql:dbname='.DATABASE.';host=localhost;charset=utf8mb4', USER, PASSWORD);
$auth = new \Delight\Auth\Auth($pdp_db);

$newsletter = 0;

if (isset($_POST['name'])) $name = convert_UTF8($_POST["name"]);
if (isset($_POST['email'])) $email = strtolower(convert_UTF8($_POST["email"]));
if (isset($_POST['password'])) $password = convert_UTF8($_POST["password"]);
if (isset($_POST['newsletter'])) $newsletter = convert_UTF8($_POST["newsletter"]);

$msg = "no_error";

if ( strlen($password) < 8 ) {
	$msg = "Lösenordet är för kort, min 8 tecken";
}

$blacklist = [ 'password','password1','12345678','qwertyui','asdfghjk','sommar12','!"#¤%&/(' ];
if ( in_array($password, $blacklist) ) {
	$msg = "Lösenordet är för enkelt";
}

if ( strlen($name) < 2 ) {
	$msg = "Namnet är för kort";
}

if ( $msg == "no_error" ) {
	try {
		$userId = $auth->register($email, $password, $name, function ($selector, $token) use (&$email) {
			sendConfirmeMail($email,$selector,$token);
		});
		$msg = "ok";
		saveUsersProfiles($userId);
	}
	catch (\Delight\Auth\InvalidEmailException $e) {
		$msg = "Ogiltig e-postadress";
	}
	catch (\Delight\Auth\InvalidPasswordException $e) {
		$msg = "Felaktigt lösenord";
	}
	catch (\Delight\Auth\UserAlreadyExistsException $e) {
		$msg = "E-postadressen finns redan";
	}
	catch (\Delight\Auth\TooManyRequestsException $e) {
		$msg = "För många förfrågningar - försök igen senare";
	}
}

$jsonData = array('result' => htmlspecialchars($msg));
$json = json_encode($jsonData);
print_r($json);

function saveUsersProfiles($user_id){
	global $db,$newsletter;
	
	$sql='INSERT INTO users_profiles (`user_id`, `newsletter`) VALUES (?,?)';
	$stmt = $db->prepare($sql);

	if($stmt === false) {
	  echo "error";
	  trigger_error('Wrong SQL: ' . $sql . ' Error: ' . $db->error, E_USER_ERROR);
	}

	$stmt->bind_param('ii',$user_id,$newsletter);
	$stmt->execute();
	$stmt->close();
	
}
?>