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
      $sql = "SELECT * FROM `entries` WHERE `uid` = ? ORDER BY `eid` DESC;";
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

    function addToken($payload, $jsonObject) {
      $sql = "INSERT INTO `tokens` (`tid`, `date`, `tan`, `encryptedKey`) VALUES (NULL, NULL, ?, ?);";
      $parameters = array($payload, $jsonObject);
      $result = Database::run($sql, $parameters);
      return $result;
    }

    function getToken($payload) {
      $sql = "SELECT `encryptedKey` FROM `tokens` WHERE `tan` = ?;";
      $parameters = array($payload);
      $result = Database::run($sql, $parameters)->fetchAll(PDO::FETCH_ASSOC);
      return $result;
    }

    function removeToken($payload) {
        $sql = 'DELETE FROM `tokens` WHERE `tan` = ?;';
        $parameters = array($payload);
        $result = Database::run($sql, $parameters);
    }
}

?>
