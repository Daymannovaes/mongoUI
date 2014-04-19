<?php
class Connection {
    /**
     * @var Mongo
     */
    private $connection;
    private $db;
    private $collection;

    public function __construct($connection = null, $db = null, $collection = null) {
    	$this->connection = $connection ? $connection : new Mongo();

    	$this->db = $db ? $db : $this->connection->humanidade;

    	$this->collection = $collection;
    }

    public function getCollectionNames() {
        return $this->db->getCollectionNames();
    }
    public function close() {
        $this->connection->close();
    }
    public function selectCollection($collectionName) {
        $this->db->selectCollection($collectionName);
    }

// ---- GETTERS and SETTERS
    public function getConnection() {
        return $this->connection;
    }
    public function setConnection($connection) {
        $this->connection = $connection;
    }

    public function getDb() {
        return $this->db;
    }
    public function setDb($db) {
        $this->db = $db;
    }

    public function getCollection() {
        return $this->collection;
    }
    public function setCollection($collection) {
        $this->collection = $collection;
    }

}
/*
$con = new Connection(null, null, "a");

var_dump($con->getConnection());
var_dump($con->getDb());
var_dump($con->getCollection());

var_dump($con->setConnection($con->getCollection()));
var_dump($con->setDb(Array("first"=>"second")));
var_dump($con->setCollection(new Mongo()));

var_dump($con->getConnection());
var_dump($con->getDb());
var_dump($con->getCollection());*/