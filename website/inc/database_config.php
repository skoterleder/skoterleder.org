<?php
/**
 * These are the database login details
 */  
define("HOST", "localhost");							// The host you want to connect to.
define("USER", ""); 									// The database username. 
define("PASSWORD", "");									// The database password. 
define("DATABASE", "");									// The database name.
define("SERVERADRESS", "http://skoterleder.org/");	// The server adress.
define('SECRET_KEY', "");								// Change this to a unique phrase.
define('TILESPATH', "");
define('IMGPATH', "");
define('UPLOADPATH', "");
define('CLIENTID', "");
define('CLIENTSECRET', "");
define('REFRESHTOKEN', "");

global $db;

$db = new mysqli(HOST, USER, PASSWORD, DATABASE);

if($db->connect_errno > 0){
    die('Unable to connect to database [' . $db->connect_error . ']');
}
$db->set_charset("utf8");
?>