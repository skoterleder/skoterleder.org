<?php
include_once 'database_config.php';
include_once 'functions.php';
require __DIR__ . '../../vendor/autoload.php';

$pdp_db = new \PDO('mysql:dbname='.DATABASE.';host=localhost;charset=utf8mb4', USER, PASSWORD);
$auth = new \Delight\Auth\Auth($pdp_db);

$auth->logOut();
$msg = "ok";

$jsonData = array(
	'result' => htmlspecialchars($msg),
);
$json = json_encode($jsonData);
print_r($json);
?>