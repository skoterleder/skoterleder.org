<?php
include_once 'database_config.php';
include_once 'functions.php';
require __DIR__ . '../../vendor/autoload.php';

$pdp_db = new \PDO('mysql:dbname='.DATABASE.';host=localhost;charset=utf8mb4', USER, PASSWORD);
$auth = new \Delight\Auth\Auth($pdp_db);

if (isset($_POST['oldPassword'])) $oldPassword = convert_UTF8($_POST["oldPassword"]);
if (isset($_POST['newPassword'])) $newPassword = convert_UTF8($_POST["newPassword"]);

$msg = "Error";

if ( strlen($newPassword) < 8 ) {
	$msg = "Lösenordet är för kort, min 8 tecken";
}
$blacklist = [ 'password','password1','12345678','qwertyui','asdfghjk','sommar12','!"#¤%&/(' ];
if ( in_array($newPassword, $blacklist) ) {
	$msg = "Lösenordet är för lätt";
}

if ( $msg == "Error" ) {
	try {
		$auth->changePassword($oldPassword, $newPassword);
		// Password has been changed
		$msg = "ok";
	}
	catch (\Delight\Auth\NotLoggedInException $e) {
		$msg = "Ej inloggad";
	}
	catch (\Delight\Auth\InvalidPasswordException $e) {
		$msg = "Felaktigt lösenord";
	}
	catch (\Delight\Auth\TooManyRequestsException $e) {
		$msg = "Too many requests";
	}
}

$jsonData = array(
	'result' => htmlspecialchars($msg),
);

$json = json_encode($jsonData);
print_r($json);
?>