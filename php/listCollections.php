<?php 

require "Connection.php";

class ListCollections {

	private $connection;
	private $collectionNames;

	public function __construct($connection = null, $collectionNames = null) {
		$this->connection = $connection ? $connection : new Connection();

		$this->collectionNames = $collectionNames ? $collectionNames : $this->connection->getCollectionNames(); //cidade, familia, pessoa...

	}

	public function buildResponse() {
		foreach($this->collectionNames as $collection) {
			$collections[] = Array("name" => $collection);
		}
		echo json_encode($collections);
	}

	public function closeConnection() {
		$this->connection->close();
	}
}

$listc = new ListCollections();
$listc->buildResponse();
$listc->closeConnection();

?>
