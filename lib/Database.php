<?php

/**
 * Controller class Database
 *
 * As seen here: https://stackoverflow.com/questions/33067214/pdo-connection-and-abstract-class
 */

class Database {
    protected static $instance = null;

    public function __construct() {}
    public function __clone() {}

    // instantiates PDO instance
    public static function instance()
    {
        if (self::$instance === null)
        {
        	$username = $GLOBALS['config']['mysql']['username'];
            $password = $GLOBALS['config']['mysql']['password'];
            $host = $GLOBALS['config']['mysql']['host'];
            $db = $GLOBALS['config']['mysql']['db'];
            $charset = 'utf8mb4';
            $opt  = array(
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => TRUE,
            );
            $dsn = 'mysql:host='.$host.';dbname='.$db.';charset='.$charset;
            self::$instance = new PDO($dsn, $username, $password, $opt);
        }
        return self::$instance;
    }

    // provides all methods provided by PDO
    public static function __callStatic($method, $args)
    {
        return call_user_func_array(array(self::instance(), $method), $args);
    }

    // prepares SQL queries
    public static function run($sql, $args = [])
    {
        $stmt = self::instance()->prepare($sql);
        $stmt->execute($args);
        return $stmt;
    }
}
?>
