<?php
include_once 'database_config.php';
include_once 'functions.php';
require __DIR__ . '../../vendor/autoload.php';

$pdp_db = new \PDO('mysql:dbname='.DATABASE.';host=localhost;charset=utf8mb4', USER, PASSWORD);
$auth = new \Delight\Auth\Auth($pdp_db);
$msg = "Error";

if (isset($_POST['action']))   $action =   convert_UTF8($_POST["action"]);
if (isset($_POST['email']))    $email =    convert_UTF8($_POST["email"]);
if (isset($_POST['password'])) $password = convert_UTF8($_POST["password"]);
if (isset($_POST['selector'])) $selector = convert_UTF8($_POST["selector"]);
if (isset($_POST['token']))    $token =    convert_UTF8($_POST["token"]);

if ($action == "resett") {
	try {
		$auth->forgotPassword($email, function ($selector, $token) use (&$email) {
			resetpasswordMail($email,$selector,$token);
		});
		$msg = "ok";
	}
	catch (\Delight\Auth\InvalidEmailException $e) {
		$msg = "Ogiltig e-postadress";
	}
	catch (\Delight\Auth\EmailNotVerifiedException $e) {
		$msg = "E-post inte verifierad";
	}
	catch (\Delight\Auth\ResetDisabledException $e) {
		$msg = "Password reset is disabled";
	}
	catch (\Delight\Auth\TooManyRequestsException $e) {
		$msg = "För många förfrågningar - försök igen senare";
	}
}
if ($action == "canReset") {
	try {
		$auth->canResetPasswordOrThrow($selector,$token);
		$msg = "ok";
	}
	catch (\Delight\Auth\InvalidSelectorTokenPairException $e) {
		$msg = "Invalid token";
	}
	catch (\Delight\Auth\TokenExpiredException $e) {
		$msg = "Token expired";
	}
	catch (\Delight\Auth\ResetDisabledException $e) {
		$msg = "Password reset is disabled";
	}
	catch (\Delight\Auth\TooManyRequestsException $e) {
		$msg = "För många förfrågningar - försök igen senare";
	}
}

if ($action == "resetPassword") {

	if ( strlen($password) < 8 ) {
		$msg = "Lösenordet är för kort, min 8 tecken";
	} else {
		try {
			$auth->resetPassword($selector, $token, $password);
			$msg = "ok";
		}
		catch (\Delight\Auth\InvalidSelectorTokenPairException $e) {
			$msg = "Invalid token";
		}
		catch (\Delight\Auth\TokenExpiredException $e) {
			$msg = "Token expired";
		}
		catch (\Delight\Auth\ResetDisabledException $e) {
			$msg = "Password reset is disabled";
		}
		catch (\Delight\Auth\InvalidPasswordException $e) {
			$msg = "Felaktigt lösenord";
		}
		catch (\Delight\Auth\TooManyRequestsException $e) {
			$msg = "För många förfrågningar - försök igen senare";
		}
	}
}

$jsonData = array(
	'result' => htmlspecialchars($msg),
);

$json = json_encode($jsonData);
print_r($json);
?>