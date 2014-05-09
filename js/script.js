var $outScope;
var collectionController = function($scope, $http) {

	$scope.consolelog = function(message) {
		if($scope.debug)
			console.log(message);
	}
// ---- CREATING $scope model -------------------------------------------------]

	$scope.connection = {}; //functions
	$scope.field = {}; //functions
	$scope.show = {}; //show and hide flags
	$scope.debug = false;

	$scope.class = {
		container: ["container"],
		popup: ["popup", "popup-hide"]
	};

	$scope.languages = {
		"pt_BR": "Português",
		"en_US": "English",
		"es_ES": "Español",
	};


	$scope.consolelog("\nGetting messages from the server.");
	$http.get("js/messages.json").success(function(messages) {
		$scope.messages = messages;
	}).error(function(error) {
		console.log("Error while getting messages from the server.");
		console.log(error);
	});
// ---- END creating $scope model ---------------------------------------------

	/* 
		@TODO
			ADD A "TYPE" FIELD IN FIELD
				TO RESOLVE THE CAST PROBLEM (THE ACTUALLY SOLUTION WORKS MORE AND LESS, AND ITS UGLY!)
			
			REFACTOR JSON MESSAGES

			CREATE AUTO TEST WITH SELENIUM AND XDEBUGGER CODE COVERAGE
	 */


// ----------------------------------------------------------------------------------------------------------
// ---- CONNECTION methods ----- methods that connect with database -----------
	var listCollectionsCallback = function() {
		$scope.collections = JSON.parse(this.responseText);
		//the response already come with "name" field (name of collection)
	};
	executeConnection("POST", "php/ListCollections.php", false, null, listCollectionsCallback);

	$scope.connection.loadFields = function() {
		$scope.consolelog("\n\nLoading Fields");

		//if the collection is null, nothing is done and nothing is showed
		if(!$scope.currentCollection) {
			$scope.show.fields = false;
			return;
		}
		$scope.data = $scope.currentCollection.data;
		
		//not implemented yet
		if($scope.collections.persistFieldValues == false)
			$scope.field.clear();

		//if a connection has already been made, doesn't need to do it again
		if($scope.currentCollection.fields) {
			$scope.show.fields = true;
			return;
		}


		var data = new FormData(); //define the parameters
		data.append("collectionName", $scope.currentCollection.name);

		var onloadCallback = function() {
			try {
				$scope.consolelog("Parsing fields from the server.");
				$scope.currentCollection.fields = JSON.parse(this.responseText);
				$scope.show.fields = true;
				$scope.consolelog("Parse successful");
			} catch(error) {
				$scope.show.fields = false;
				$scope.consolelog("Error while parsing fields from the server.");
				$scope.consolelog(this.responseText);
				$scope.consolelog(error);
			}
		};

		executeConnection("POST", "php/ListFields.php", false, data, onloadCallback);
	}

	$scope.connection.loadData = function() {
		//@todo gif 
		$scope.consolelog("\n\nLoading data");
		var data = new FormData();
		data.append("collectionName", $scope.currentCollection.name);
		data.append("fields", JSON.stringify($scope.currentCollection.fields));

		onloadCallback = function() {
			try {
				$scope.consolelog("Parsing data from the server.");
				$scope.currentCollection.data = JSON.parse(this.responseText);
				$scope.consolelog("Parse successful");

				$scope.data = $scope.currentCollection.data;
				$scope.show.loading_data = false;
			} catch(error) {
				//$scope.currentCollection.data = this.responseText;
				$scope.consolelog("Error while parsing data from the server.");
				$scope.consolelog(this.responseText);
				$scope.consolelog(error);
			}
		};
		executeConnection("POST", "php/ListData.php", false, data, onloadCallback);
	}
	$scope.connection.insertData = function() {
		//@todo receive data as parameter
		$scope.consolelog("\n\nInserting data");

		var data = new FormData();
		data.append("collectionName", $scope.currentCollection.name);
		data.append("data", JSON.stringify($scope.currentCollection.fields));

		//resolve the reference copy problem
		var copyObject = function(object) {
			newobj = {};
			for(key in object) {
				newobj[key] = object[key];
			}
			return newobj;
		}

		onloadCallback = function() {
			try {
				//@todo show a popup with successs! (or not sucess)
				console.log(this.responseText);

				if($scope.data == undefined) $scope.data = [];
				$scope.data.push(copyObject($scope.currentCollection.fields));
				$scope.field.clear();

				$scope.show.loading_data = false;
			} catch(error) {
				//@todo show (not sucess for some reason (you can inspect the code and find the error by yourself, if you want!))
			}
		};
		executeConnection("POST", "php/InsertData.php", false, data, onloadCallback);
	}
	$scope.connection.deleteData = function(dataNumber) {
		$scope.consolelog("\n\nDeleting data");

		//if(!confirm($scope.messages[$scope.languages.current]["message_confirmDelete"]))
			//return;

		console.log("data: ");
		console.log($scope.data[dataNumber]);
		return;
		var data = new FormData();
		data.append("collectionName", $scope.currentCollection.name);
		data.append("data", JSON.stringify($scope.data[dataNumber]));

		onloadCallback = function() {
			try {
				//for now, this works!
				//@todo show a popup with successs! (or not sucess)
				console.log(this.responseText);
				$scope.data.splice(dataNumber, 1);
			} catch(error) {
				//@todo show (not sucess for some reason (you can inspect the code and find the error by yourself, if you want!))
			}
		};
		executeConnection("POST", "php/DeleteData.php", false, data, onloadCallback);
	}
// ---- END connection methods ------------------------------------------------


// ---- UTILITY CONNECTION methods --------------------------------------------
	function executeConnection(type, url, sync, data, onload) {
		$scope.consolelog("\nConnecting at " + url);

		var http = defineXmlhttpByBrowser();

		http.onload = onload;

		http.open(type, url, sync);
		http.send(data);
		$scope.consolelog("Connection done");

	}
	function defineXmlhttpByBrowser() {
		if (window.XMLHttpRequest)
			return new XMLHttpRequest();
		else
			return new ActiveXObject("Microsoft.XMLHTTP");
	}
// ---- END utility connection methods ----------------------------------------


	$scope.field.add = function() {
		$scope.show.newField = false; //hide the input

		$scope.currentCollection.fields[$scope.newFieldName] = ""; //actual add of the field
		$scope.newFieldName = ""; //clear the field input
	}

	$scope.field.clear = function() {
		for(key in $scope.currentCollection.fields)
			$scope.currentCollection.fields[key] = "";
	}

	//only console.log
	$scope.showCollections = function() {
		console.log("Collections: ");
		console.log($scope.collections);

		console.log("\nactual collection: ");
		console.log($scope.currentCollection);

	}	

	//used in recursive template (show data)
	$scope.typeOf = function(input) {
	    return typeof input;
	  }


	$scope.toggle = function(data, key) {
		$scope.consolelog(data);
		data["show"+key] = data["show"+key] ? !data["show"+key] : true;
	}

	$scope.openPopup = function() {
		$scope.class.container[1] = "container-blur";
		$scope.class.popup[1] = "popup-show";
	}
	$scope.closePopup = function() {
		$scope.class.container[1] = "container-focus";
		$scope.class.popup[1] = "popup-hide";
	}
	$scope.containerClosepopup = function() {
		if($scope.show.newField) {
			$scope.closePopup();
			$scope.show.newField = false;
		}
	}


	 $scope.addParentProperty = function(data, parentName) {
	 	if(parentName && data instanceof Array)
	 		data["parentName"] = parentName;
	 	
	 	for(attr in data) {
	 		if(typeof data[attr] == "object")
	 			$scope.addParentProperty(data[attr], attr);
	 	}
	 }
	 //@todo create add level property
	 //@todo consider the possibility of a stak model with one level
	 $scope.getParentByParentNameProperty = function(data, parentName) {

	 }

	 	/**
	 * Only for debug and test where the mongoDB not work
	 * like teknisa. So, to acess the intern methods of
	 * the controller is used the $outScope
	 */
		$outScope = $scope;
		/*$scope.addData = function() {
			$scope.data = [];
			$scope.data.push({nome:"dayman", idade:"18", a:"b"});
			$scope.data.push({nome:"bru", idade:"19", nacionalidade:"brasil"});
			$scope.data.push({nome:"outro", orgaos:[{peso:"100g", nome:["coracao"]},{peso:"1g", nome:"oi"}]});
			$scope.data.push({nome:"BH",
							 familias: [
							 	{
							 		nome: "Familia1",
							 		quantidade: 2,
							 		pessoas: [
							 			{
							 				nome:"day",
							 				idade: 18
							 			}, 
							 			{
							 				nome:"bru",
							 				idade: 19
							 			}
							 		]
							 	},
							 	{
							 		nome: "Familia2",
							 		quantidade: 2,
							 		pessoas: [
							 			{
							 				nome:"day",
							 				idade: 18
							 			}, 
							 			{
							 				nome:"bru",
							 				idade: 19
							 			}
							 		]
							 	}
							 ]
							});
		}

		$scope.collections = [
			{
				name:"pessoa",
				fields: {
					nome: {value:"", type:"string"},
					idade: {value:"", type:"int"},
					nacionalidade: {value:"", type:"string"}
				}
			},
			{
				name:"anotherCollection",
				fields: {
					firstField: {value:"default", }
				}
			}
		];
		$scope.currentCollection = $scope.collections[0];*/
	//end the forced data bind ($outScope)

};

/*
	$scope.collections = [
		{
			name: "pessoa",
			columns: ["nome", "idade", "nacionalidade"]
		},
		{
			name: "familia",
			columns: ["nome", "pessoas"]
		},
		{
			name: "cidade",
			columns: ["nome", "bairro", "familias", "pontosTuristicos"]
		},
	]
*/
