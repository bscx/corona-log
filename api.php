<?php

/**
 * API handler
 * This provides all methods for mapping API requests to database manipulation (CRUD)
 *
 * @version 0.1
 * @author Boris Bischoff
 */
error_reporting(E_ALL);
ini_set('display_errors', 1);

//header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
require_once './initialize.php';

if (!empty($_GET['request']) && !empty($_GET['payload'])) {
  $method = $_SERVER['REQUEST_METHOD'];
  $request = $_GET['request'];
  $payload = $_GET['payload'];

  // Reading JSON POST using PHP
  $json = file_get_contents('php://input');
  //$jsonObject = json_decode($json);

  echo executeCommand($method, $request, $payload, $json);
} else {
  echo json_encode(array('code' => 'nok', 'message' => 'request method not found'));
}

function sanitizeString($unsafe) {
  return htmlspecialchars($unsafe, ENT_QUOTES);
}

/**
 * Generate a random string, using a cryptographically secure 
 * pseudorandom number generator (random_int)
 *
 * This function uses type hints now (PHP 7+ only), but it was originally
 * written for PHP 5 as well.
 * 
 * For PHP 7, random_int is a PHP core function
 * For PHP 5.x, depends on https://github.com/paragonie/random_compat
 * 
 * @param int $length      How many characters do we want?
 * @param string $keyspace A string of all possible characters
 *                         to select from
 * @return string
 */

 // Source: https://stackoverflow.com/questions/4356289/php-random-string-generator/31107425#31107425

function getRandomString(
  int $length = 64,
  string $keyspace = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'
): string {
  if ($length < 1) {
      throw new \RangeException("Length must be a positive integer");
  }
  $pieces = [];
  $max = mb_strlen($keyspace, '8bit') - 1;
  for ($i = 0; $i < $length; ++$i) {
      $pieces []= $keyspace[random_int(0, $max)];
  }
  return implode('', $pieces);
}

function executeCommand($method, $request, $payload, $json = '') {
  if ($method == 'PUT' || $method == 'POST') {
    if ($request == 'addEntry') {
      $userId = $GLOBALS['dbops']->getUserId($payload);
      if ($data = $GLOBALS['dbops']->addEntry($userId, $json)) {
        return json_encode(array('code' => 'ok', 'message' => 'Entry stored'));
      } else {
        return json_encode(array('code' => 'nok', 'message' => 'Entry not stored'));
      }
    } 
    elseif ($request == 'linkToExistingAccount') {
      $payload = getRandomString(4) . '-' . getRandomString(4);
      if ($data = $GLOBALS['dbops']->linkToExistingAccount($payload, $json)) {
        return json_encode(array('code' => 'ok', 'message' => $payload));
      } else {
        return json_encode(array('code' => 'nok', 'message' => 'Token not stored'));
      }
    }
    elseif ($request == 'addKeysToTransfer') {
      if ($data = $GLOBALS['dbops']->addKeysToTransfer($payload, $json)) {
        return json_encode(array('code' => 'ok', 'message' => $payload));
      } else {
        return json_encode(array('code' => 'nok', 'message' => 'Token not stored'));
      }
    }
    else {
      return json_encode(array('code' => 'nok', 'message' => 'Request not found'));
    }
  }



  elseif ($method == 'GET') {
    if ($request == 'registerUser') {
      if ($data = $GLOBALS['dbops']->registerUser(sanitizeString($payload))) {
        return json_encode($data);
      } else {
        return json_encode(array('code' => 'nok', 'message' => 'User not registered'));
      }
    } elseif ($request == 'getEntries') {
      $userId = $GLOBALS['dbops']->getUserId($payload);
      if ($data = $GLOBALS['dbops']->getEntries($userId)) {
        return json_encode($data);
      } else {
        return json_encode(array('code' => 'nok', 'message' => 'Entry not found'));
      }
    } elseif ($request == 'retrieveEncryptedLocalStorage') {
      if ($data = $GLOBALS['dbops']->retrieveEncryptedLocalStorage($payload)) {
        // $GLOBALS['dbops']->removeEncryptedLocalStorage($payload);
        return json_encode($data);
      } else {
        return json_encode(array('code' => 'nok', 'message' => 'Entry not found'));
      }
    } elseif ($request == 'retrievePublicKey') {
      if ($data = $GLOBALS['dbops']->retrievePublicKey($payload)) {
        // $GLOBALS['dbops']->removeEncryptedLocalStorage($payload);
        return json_encode($data);
      } else {
        return json_encode(array('code' => 'nok', 'message' => 'Entry not found'));
      }
    } 
    else {
      return json_encode(array('code' => 'nok', 'message' => 'Request not found'));
    }
  }




  elseif ($method == 'DELETE') {
    // ...
  }




  else {
    return json_encode(array('code' => 'nok', 'message' => 'request method not found'));
  }

}

?>
