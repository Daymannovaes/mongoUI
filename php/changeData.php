<?php  

if(isset($_POST["collectionName"]))
	connect($_POST["collectionName"]);

function connect($collectionName) {
	//echo "iniciando conexão";

	$connection = new Mongo();
	$db = $connection->humanidade;

	$collection = $db->selectCollection($collectionName);
	//echo "\ncollection count: ". $collection->count();

	changeData($collection);

	$connection->close();
}

function changeData($collection) {
	//echo "\nIniciando busca de campos\n";

	$data = $_POST["data"] ? (array)json_decode($_POST["data"]) : "";
	
	var_dump(deleteHashKeyField($data));

	//echo "delete result: ".$collection->remove($data, array("justOne" => true));
	
}

//delete all id fields recursively
function deleteHashKeyField($fields) {
	//var_dump($fields);
	$fields = (array)$fields;
	if(isset($fields["\$\$hashKey"]))
		unset($fields["\$\$hashKey"]);

	foreach($fields as $key => $value) {
		if(gettype($value) == "object" || gettype($value) == "array")
			$fields[$key] = deleteHashKeyField($value);
	}
	return $fields;
}

?>
