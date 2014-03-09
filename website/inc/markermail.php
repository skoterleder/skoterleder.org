<?php
include_once 'database_config.php';
include_once 'functions.php';

$id		= convert_UTF8($_GET["id"]);
$nemail = convert_UTF8($_GET["email"]);

newChangeMarkerMail($id,$nemail);

?>