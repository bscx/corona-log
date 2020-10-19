<?php

/**
 * Interface IDBOperations
 * This interface provides the general structure of methods that need to be implemented by all classes
 *
 * @version 1.0
 * @author Boris Bischoff
 */

interface DBOperationsInterface {
    public function registerUser($payload);
    public function getUserId($payload);
    public function getEntries($payload);
    public function addEntry($payload, $jsonObject);
    public function addToken($payload, $jsonObject);
    public function getToken($payload);
    public function removeToken($payload);
}

?>
