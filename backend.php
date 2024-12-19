<?php

function validate($condition, $message, $code)
{
    if (!$condition) {
        echo json_encode(['message' => $message]);
        http_response_code($code);
        exit;
    }
}

function isValidMySQLDatetime($datetime)
{
    $format = 'Y-m-d H:i:s';
    $dt = DateTime::createFromFormat($format, $datetime);
    return $dt && $dt->format($format) === $datetime;
}

function validateRequest($request)
{
    validate($request != null, 'Valid JSON syntax required', 400);

    validate(isset($request['name']), 'Property "name" is required', 400);
    validate($request['name'] != '', 'Property "name" must not be empty', 400);
    validate(strlen($request['name']) < 45, 'Property "name" must not be not longer than 45 characters', 400);


    validate(isset($request['timestamp']), 'Property "timestamp" is required', 400);
    validate($request['timestamp'] != '', 'Property "timestamp" must not be empty', 400);
    validate(isValidMySQLDatetime($request['timestamp']), 'Property "timestamp" is not valid datetime format', 400);


    validate(isset($request['burned_calories']), 'Property "burned_calories" is required', 400);
    $burnedCalories = intval($request['burned_calories']);
    validate($burnedCalories >= 1 && $burnedCalories <= 10000, 'Property "burned_calories" must be inside range between 1 and 10000', 400);


    validate(isset($request['training_type']), 'Property "training_type" is required', 400);
    validate($request['training_type'] === "indoor" || $request['training_type'] === "outdoor", 'Property "training_type" has invalid type', 400);

    validate(isset($request['description']), 'Property "description" is required', 400);
    validate($request['description'] != '', 'Property "description" must not be empty', 400);
    validate(strlen($request['description']) < 300, 'Property "description" must not be not longer than 300 characters', 400);
}

$requestMethod = $_SERVER['REQUEST_METHOD'];
$requestBody = file_get_contents("php://input");
$parsedRequest = json_decode($requestBody, true);

$connection = mysqli_connect("localhost", "root", "", "fitnesstracker", 3306);
validate($connection, 'Establishing database connection failed (internal error)', 500);

if ($requestMethod == 'GET') {

    $query = "SELECT recordId, name, timestamp, burned_calories, training_type, description FROM record";

    $stmt = mysqli_prepare($connection, $query);

    validate($stmt, 'Failed to prepare SQL statement', 500);

    mysqli_stmt_execute($stmt);

    validate($stmt, 'Failed to execute SQL statement', 500);

    $stmtResult = mysqli_stmt_get_result($stmt);

    validate($stmtResult, 'Error occurred when obtaining query result from the database', 500);

    $rows = mysqli_fetch_all($stmtResult, MYSQLI_ASSOC);

    validate($stmtResult, 'Error occurred when obtaining rows from query result', 500);

    mysqli_close($connection);

    $response = ['result' => $rows];

    header('Content-type: application/json');
    echo json_encode($response);

} elseif ($requestMethod == 'POST') {
    validateRequest($parsedRequest);

    $name = $parsedRequest['name'];
    $timestamp = $parsedRequest['timestamp'];
    $burnedCalories = $parsedRequest['burned_calories'];
    $trainingType = $parsedRequest['training_type'];
    $description = $parsedRequest['description'];

    $query = "insert into record (name, timestamp, burned_calories, training_type, description) values (?, ?, ?, ?, ?)";

    $stmt = mysqli_prepare($connection, $query);

    validate($stmt, 'Failed to prepare SQL statement', 500);

    mysqli_stmt_bind_param($stmt, 'ssiss', $name, $timestamp, $burnedCalories, $trainingType, $description);

    validate($stmt, 'Failed to bind parameters to SQL statement', 500);

    $stmtResult = mysqli_stmt_execute($stmt);

    validate($stmtResult, 'Error occured during insertion...', 500);

    mysqli_close($connection);

    if (isset($_COOKIE['inserted_records'])) {
        $insertedRecords = intval($_COOKIE['inserted_records']);
        $insertedRecords += 1;
    } else {
        $insertedRecords = 1;
    }

    setcookie('inserted_records', $insertedRecords);

    $response = ['result' => 'Successfully added new training record!'];

    header('Content-type: application/json');
    echo json_encode($response);
}
?>