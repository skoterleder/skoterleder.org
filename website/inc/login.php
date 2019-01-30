<?php
include_once 'database_config.php';
include_once 'functions.php';
require __DIR__ . '../../vendor/autoload.php';

$pdp_db = new \PDO('mysql:dbname='.DATABASE.';host=localhost;charset=utf8mb4', USER, PASSWORD);
$auth = new \Delight\Auth\Auth($pdp_db);
$msg = "Error";
$remember = 0;

if (isset($_POST['email']))    $email =    convert_UTF8($_POST["email"]);
if (isset($_POST['password'])) $password = convert_UTF8($_POST["password"]);
if (isset($_POST['remember'])) $remember = convert_UTF8($_POST["remember"]);

if ($remember == 1) {
    // keep logged in for one year
    $rememberDuration = (int) (60 * 60 * 24 * 365.25);
}
else {
    // keep logged in for one day
    $rememberDuration = (int) (60 * 60 * 24 );
}

try {
    $auth->login($email, $password, $rememberDuration);
    // User is logged in
	$msg = "ok";
}
catch (\Delight\Auth\InvalidEmailException $e) {
    // Wrong email address
	$msg = "-1";
}
catch (\Delight\Auth\InvalidPasswordException $e) {
    // Wrong password
	$msg = "-1";
}
catch (\Delight\Auth\EmailNotVerifiedException $e) {
    // Email not verified
	$msg = "-2";
}
catch (\Delight\Auth\TooManyRequestsException $e) {
    // Too many requests
	$msg = "Too many requests";
}

$jsonData = array(
	'result' => htmlspecialchars($msg),
);
$json = json_encode($jsonData);
print_r($json);
?>