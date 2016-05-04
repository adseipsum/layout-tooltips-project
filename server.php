<?php 
header("Access-Control-Allow-Origin: *");
//MySQL connection
$servername = "localhost";
$username = "root";
$password = "opossum";
$database = "layout-tooltips-project";

$connection = new mysqli($servername, $username, $password, $database);

if(!empty($_GET['action'])){ 
	switch($_GET['action']){
	case 'saveComment':
		saveComment($_POST, $connection);
		break;
	case 'getComments':
		getComments($_POST, $connection);
		break;
	case 'updateGuideSteps':
		updateGuideSteps($_POST, $connection);
		break;
	case 'uploadFile':
		uploadFile($_FILES, $_GET, $connection);
		break;
	default:
		break;
	}
}

function saveComment($data, $connection){
	$sql = "INSERT INTO `comments` 
	(`comment`, `namespace`, `baseURL`, `position`, `elementPath`, `stepNumber`) 
		VALUES 
	('{$data['comment']}', '{$data['namespace']}', '{$data['baseURL']}', '{$data['position']}', '{$data['elementPath']}', '{$data['stepNumber']}')";
	
	if(!$result = $connection->query($sql)){
		die('There was an error running the query [' . $connection->error . ']');
	}

	echo mysqli_insert_id($connection);
}

function getComments($data, $connection){
	$sql = "SELECT * FROM `comments` WHERE `baseURL` = '{$connection->real_escape_string($data['baseURL'])}'";
	
	if(!$result = $connection->query($sql)){
		die('There was an error running the query [' . $connection->error . ']');
	}
	
	$comments = array();
	while($row = $result->fetch_assoc()){
		$comments[] = $row;
	}
	echo json_encode($comments);
}

function updateGuideSteps($data, $connection){
	$stepsOrder = json_decode($data['data']);
	if($stepsOrder) foreach($stepsOrder as $record){
		$sql = "UPDATE `comments` SET `stepNumber` = '{$record->stepNumber}' WHERE `id` = '{$connection->real_escape_string($record->id)}'";
	
		if(!$result = $connection->query($sql)){
			die('There was an error running the query [' . $connection->error . ']');
		}
	}
	
	getComments($data, $connection);
}

function uploadFile($files, $get, $connection){
	$finfo = new finfo(FILEINFO_MIME_TYPE);
	if (false === $ext = array_search(
			$finfo->file($files['file']['tmp_name']),
			array(
					'jpg' => 'image/jpeg',
					'png' => 'image/png',
					'gif' => 'image/gif',
					'pdf' => 'application/pdf',
			),
			true
	)) {
		throw new RuntimeException('Invalid file format.');
	}
	
	if(!empty($files['file']) && !empty($get['lastId'])){
		if (!move_uploaded_file($files['file']['tmp_name'], sprintf('./uploads/%s.%s', $get['lastId'], $ext))) {
			throw new RuntimeException('Failed to move uploaded file.');
		}
		
		$sql = "UPDATE `comments` SET `fileName` = '" . $get['lastId'] . '.' . $ext . "' WHERE `id` = '{$get['lastId']}'";
		
		if(!$result = $connection->query($sql)){
			die('There was an error running the query [' . $connection->error . ']');
		}
	}
	
	return true;
}

$connection->close();
?>