<?php  

if(isset($_POST["collectionName"]))
	connect($_POST["collectionName"]);

function connect($collectionName) {
	//echo "iniciando conexão";

	$connection = new Mongo();
	$db = $connection->humanidade;

	$collection = $db->selectCollection($collectionName);
	//echo "\ncollection: ". $collection->count();

	if($collection->count()) {
		loadFields($collection);
	}

	$connection->close();
}

function loadFields($collection) {
	//echo "\nIniciando busca de campos";

	$cursor = $collection->findOne(Array(),Array("_id"=>0));

	if(!$cursor) {
		echo "\nCampos não encontrados";
		return;
	}
	//echo "\nCampos buscados com sucesso: ";
	
	//return only the column names
	$keys = array_keys($cursor);
	foreach($keys as $key) {
		$columns[$key] = "";
	}
	echo json_encode($columns);
}
?>