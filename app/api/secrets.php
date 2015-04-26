<?php

//
// : https://www.google.com/recaptcha/api/siteverify
// secret(required)    Host key
// response(required)	El valor de "g-recaptcha-response".
// remoteip	The end user's ip address.

class Configuration {
	var $db_user_name = "";
	var $db_password = "";
	var $db_database = "";
	var $db_prefix = "map_";
	var $db_server = "localhost";

	function Configuration() {
	}
}

$configuration = new Configuration();

?>