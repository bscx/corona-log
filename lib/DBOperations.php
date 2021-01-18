<?php

/**
 * Controller class DBOperations
 * This class provides all methods for database manipulation (CRUD)
 *
 * @version 2.0
 * @author Boris Bischoff
 */

class DBOperations implements DBOperationsInterface {

    function registerUser($payload) {
      $sql = "INSERT INTO `users` (`id`, `username`) VALUES (NULL, ?);";
      $parameters = array($payload);
      $result = Database::run($sql, $parameters)->fetchAll(PDO::FETCH_ASSOC);
      return $result;
    }

    function getUserId($payload) {
      $sql = "SELECT `id` FROM `users` WHERE `username` = ?;";
      $parameters = array($payload);
      $result = Database::run($sql, $parameters)->fetchAll(PDO::FETCH_ASSOC);
      return $result;
    }

    function getEntries($payload) {
      $sql = "SELECT * FROM `entries` WHERE `uid` = ? ORDER BY `eid` ASC;";
      $parameters = array($payload[0]['id']);
      $result = Database::run($sql, $parameters)->fetchAll(PDO::FETCH_ASSOC);
      return $result;
    }
    
    function addEntry($payload, $jsonObject) {
      $sql = "INSERT INTO `entries` (`eid`, `uid`, `date`, `entry`) VALUES (NULL, ?, NULL, ?);";
      $parameters = array($payload[0]['id'], $jsonObject);
      $result = Database::run($sql, $parameters);
      return $result;
    }

    function linkToExistingAccount($payload, $jsonObject) {
      $sql = "INSERT INTO `tokens` (`tid`, `date`, `tan`, `publicKey`) VALUES (NULL, NULL, ?, ?);";
      $parameters = array($payload, $jsonObject);
      $result = Database::run($sql, $parameters);
      return $result;
    }

    function retrievePublicKey($payload) {
      $sql = "SELECT `publicKey` FROM `tokens` WHERE `tan` = ?;";
      $parameters = array($payload);
      $result = Database::run($sql, $parameters)->fetchAll(PDO::FETCH_ASSOC);
      return $result;
    }

    function retrieveEncryptedLocalStorage($payload) {
      $sql = "SELECT `encryptedStorage` FROM `transfer` WHERE `tan` = ?;";
      $parameters = array($payload);
      $result = Database::run($sql, $parameters)->fetchAll(PDO::FETCH_ASSOC);
      return $result;
    }

    function addKeysToTransfer($payload, $jsonObject) {
      $sql = "INSERT INTO `transfer` (`tid`, `date`, `tan`, `encryptedStorage`) VALUES (NULL, NULL, ?, ?);";
      $parameters = array($payload, $jsonObject);
      $result = Database::run($sql, $parameters);
      return $result;
    }

    function removeEncryptedLocalStorage($payload) {
        $sql = "DELETE FROM `tokens`, `transfer` WHERE `tan` = ?;";
        $parameters = array($payload);
        $result = Database::run($sql, $parameters);
    }
}

?>
