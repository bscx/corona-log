<?php

/**
 * Initialization of global variables and session initialization
 *
 * @version 1.1
 * @author Boris Bischoff
 */

$GLOBALS['config'] = array (
			'mysql' => array(
					'host' => '',
					'username' => '',
					'password' => '',
					'db' => ''
			)
	);

// Initialization of all available classes
spl_autoload_register(function($class){
	require_once './lib/' . $class . '.php';
});

$GLOBALS['dbops'] = new DBOperations();

?>
