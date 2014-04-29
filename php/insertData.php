<?php  

if(isset($_POST["collectionName"]))
	connect($_POST["collectionName"]);

function connect($collectionName) {
	//echo "iniciando conexão";

	$connection = new Mongo();
	$db = $connection->humanidade;

	$collection = $db->selectCollection($collectionName);
	//echo "\ncollection count: ". $collection->count();

	insertData($collection);

	$connection->close();
}

function loadData($collection) {
	//echo "\nIniciando busca de campos\n";

	$data = $_POST["data"] ? (array)json_decode($_POST["data"]) : "";
	$collection->save($data);

	//do something, verify is the save was sucessful and etc
	echo "sucess";
}
?>
