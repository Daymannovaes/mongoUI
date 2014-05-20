<?php  

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

	deleteData($collection, $request);

	$connection->close();
}

function deleteData($collection, $request) {
	//echo "\nIniciando busca de campos\n";

	$data = $request["data"] ? $request["data"] : "";
	unset($data["\$\$hashKey"]);

	echo "delete result: ".$collection->remove($data, array("justOne" => true));
}
?>
