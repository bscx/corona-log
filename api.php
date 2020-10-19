<?php

/**
 * API handler
 * This provides all methods for mapping API requests to database manipulation (CRUD)
 *
 * @version 0.1
 * @author Boris Bischoff
 */

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
    elseif ($request == 'addToken') {
      if ($data = $GLOBALS['dbops']->addToken($payload, $json)) {
        return json_encode(array('code' => 'ok', 'message' => 'Token stored'));
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
    } elseif ($request == 'getToken') {
      if ($data = $GLOBALS['dbops']->getToken($payload)) {
        $GLOBALS['dbops']->removeToken($payload);
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
