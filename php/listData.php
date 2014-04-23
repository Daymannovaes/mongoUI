<?php  

if(isset($_POST["collectionName"]))
	connect($_POST["collectionName"]);

function connect($collectionName) {
	//echo "iniciando conexão";

	$connection = new Mongo();
	$db = $connection->humanidade;

	$collection = $db->selectCollection($collectionName);
	//echo "\ncollection count: ". $collection->count();

	if($collection->count()) {
		loadData($collection);
	}

	$connection->close();
}

function loadData($collection) {
	//echo "\nIniciando busca de campos\n";

	$criteria = $_POST["fields"] ? (array)json_decode($_POST["fields"]) : "";
	$criteria = deleteEmptyFields($criteria);


	$cursor = $collection->find($criteria);

	if(!$cursor) {
		echo "\nCampos não encontrados";
		return;
	}

	foreach($cursor as $document) {
		$document = deleteIdField($document);
		$data[] = $document;
	}

	echo json_encode($data);
}

//if a field is empty, it is deleted from the criteria array
function deleteEmptyFields($fields) {
	foreach($fields as $key => $value) {
		if($value == "")
			unset($fields[$key]);
	}
	return $fields;
}

//delete all id fields recursively
function deleteIdField($fields) {
	//var_dump($fields);
	if(isset($fields["_id"]))
		unset($fields["_id"]);

	foreach($fields as $key => $value) {
		if(gettype($value) == "object" || gettype($value) == "array")
			$fields[$key] = deleteIdField($value);
	}
	return $fields;
}
?>
