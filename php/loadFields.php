<?php  

class ListFields {
	private $connection;

	public function __construct($connection = null, $collectionName = null) {
		$this->connection = $connection ? $connection : new Connection();

		$this->connection->selectCollection($collectionName);

	}
}
$request = json_decode(file_get_contents("php://input"), true);

if($request["collectionName"])
	connect($request["collectionName"]);
else
	echo "What is the collection name?";

function connect($collectionName) {
	//echo "iniciando conexão";

	$connection = new Mongo();
	$db = $connection->humanidade;

	$collection = $db->selectCollection($collectionName);
	//echo "\ncollection: ". $collection->count();

	if($collection->count()) {
		_loadFields($collection);
	}

	$connection->close();
}

function loadFields($collection) {
	//echo "\nIniciando busca de campos";
	//$response = Array();

	$cursor = $collection->findOne(Array(),Array("_id"=>0));

	if(!$cursor) {
		echo "\nCampos não encontrados";
		return;
	}
	//echo "\nCampos buscados com sucesso: ";
	
	//return only the column names
	foreach($cursor as $key => $value) {
		$fields[$key]["value"] = "";
		$fields[$key]["type"] = gettype($value);
	}
	echo json_encode($fields);
}
function _loadFields($collection) {
	//echo "\nIniciando busca de campos";
	//$response = Array();

	$cursor = $collection->find(Array(),Array("_id"=>0));

	if(!$cursor) {
		echo "\nCampos não encontrados";
		return;
	}
	//echo "\nCampos buscados com sucesso: ";
	
	$columns = Array();
	foreach($cursor as $document) {
		foreach($document as $key => $value) {
			if(!keyExists($columns, $key)) {
				$columns[$key]["value"] = "";
				$columns[$key]["type"] = gettype($value);
			}
		}
	}
	echo json_encode($columns);
}

function keyExists($columns, $searchedKey, $recursive = true) {
	foreach($columns as $key => $value) {
		if($key === $searchedKey)
			return true;
	}
	return false;
}

//@todo list all fields from all data in collection
?>