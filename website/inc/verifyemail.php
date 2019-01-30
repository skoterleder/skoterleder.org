<?php
include_once 'database_config.php';
include_once 'functions.php';
require __DIR__ . '../../vendor/autoload.php';

$pdp_db = new \PDO('mysql:dbname='.DATABASE.';host=localhost;charset=utf8mb4', USER, PASSWORD);
$auth = new \Delight\Auth\Auth($pdp_db);

if (isset($_POST['selector']))	$selector 	= convert_UTF8($_POST["selector"]);
if (isset($_POST['token']))		$token 		= convert_UTF8($_POST["token"]);
$msg = "Error";

try {
	$auth->confirmEmailAndSignIn($selector, $token);
	// Email address has been verified
	$msg = "ok";
}
catch (\Delight\Auth\InvalidSelectorTokenPairException $e) {
	$msg = "Invalid token";
}
catch (\Delight\Auth\TokenExpiredException $e) {
	$msg = "Token expired";
}
catch (\Delight\Auth\UserAlreadyExistsException $e) {
	$msg = "E-postadressen finns redan";
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