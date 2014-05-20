<?php  

/*class listData {
	private $request;
	
	public function __construct($request) {
		$this->request = is_object($request) ? $request : json_decode($request, true);
	}

	public function echo2() {
		var_dump($this->request);
	}

	public function connect($connection = null, $dbName = null) {
		return $connection == null ? new Mongo() : $connection;

		$db = $dbName == null ? $connection->humanidade : $connection->selectDatabase($dbName);


	}

	public function connectAndSetDatabase($connection = null, $dbName = null) {
		$connection = $this->connect($connection);
		$db = $this->db($dbName);
	}
	public function connectAndSetCollection($collectionName, $connection = null, $dbName = null) {
		$connection = $this->connect($connection);
		$db = $this->db($dbName);
		$collection = $db->selectCollection($collectionName);
	}
}

$test = new ListData(file_get_contents("php://input"));
$test->echo2();*/


$request = json_decode(file_get_contents("php://input"), true);

if($request["collectionName"])
	connect($request);
else
	echo "What is the collection name?";

function connect($request) {
	//echo "iniciando conexão";

	$connection = new Mongo();
	$db = $connection->humanidade;

	$collection = $db->selectCollection($request["collectionName"]);
	//echo "\ncollection count: ". $collection->count();

	if($collection->count()) {
		loadData($collection, $request);
	}

	$connection->close();
}

function loadData($collection, $request) {
	//echo "\nIniciando busca de campos\n";

	$criteria = $request["fields"] ? $request["fields"] : "";

	$caster = $collection->findOne();
	
	$criteria = deleteEmptyFields($criteria);
	$criteria = deleteTypeFields($criteria);
	//$criteria = castCriteria($criteria, $caster);

	$cursor = $collection->find($criteria);

	if(!$cursor->count()) {
		echo "\nNenhum resultado encontrado";
		return;
	}

	foreach($cursor as $document) {
		$document = deleteIdField($document);
		$data[] = $document;
	}

	echo json_encode($data);
}

function castCriteria($criteria, $fields) {
	foreach($fields as $key => $value) {
		$type = gettype($value);
		if(isset($criteria[$key]) && ($type == "double" || $type == "float" || $type == "int"))
			$criteria[$key] = (double)$criteria[$key];
	}
	return $criteria;
}

//if a field is empty, it is deleted from the criteria array
function deleteEmptyFields($fields) {
	foreach($fields as $key => $value) {
		if($value["value"] === "" || !isset($value))
			unset($fields[$key]);
	}
	return $fields;
}
function deleteTypeFields($fields) {
	foreach($fields as $key => $value) {
		// $fields[$key] = $fields[$value]
		unset($fields[$key]["type"]);
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
