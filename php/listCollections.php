<?php 
	$connection = new Mongo();  
	$db = $connection->humanidade;  
	$collectionsNames = $db->getCollectionNames(); //cidade, familia, pessoa...
	
	foreach($collectionsNames as $collection) {
		$collections[] = Array("name" => $collection);
	}
	
	$connection->close();
	echo json_encode($collections);
?>