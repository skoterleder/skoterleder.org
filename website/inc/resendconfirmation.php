<?php
include_once 'database_config.php';
include_once 'functions.php';
require __DIR__ . '../../vendor/autoload.php';

$pdp_db = new \PDO('mysql:dbname='.DATABASE.';host=localhost;charset=utf8mb4', USER, PASSWORD);
$auth = new \Delight\Auth\Auth($pdp_db);
$msg = "Error";

if (isset($_POST['email'])) $email = convert_UTF8($_POST["email"]);

try {
    $auth->resendConfirmationForEmail($email, function ($selector, $token) use (&$email) {
		sendConfirmemail($email,$selector,$token);
	});
	$msg = "ok";
}
catch (\Delight\Auth\ConfirmationRequestNotFound $e) {
	$msg = "Ingen tidigare förfrågning hittades som kunde skickas om";
}
catch (\Delight\Auth\TooManyRequestsException $e) {
	$msg = "För många förfrågningar - försök igen senare";
}

$jsonData = array(
	'result' => htmlspecialchars($msg),
);
$json = json_encode($jsonData);
print_r($json);
?>