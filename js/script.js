var $outScope;

var collectionController = function($scope){
	/* 
	 * Only for debug and test where the mongoDB not work
	 * like teknisa. So, to acess the intern methods of
	 * the controller is used the $outScope
	*/
/*		$outScope = $scope;
		$scope.addData = function() {
			$scope.data = [];
			$scope.data.push({nome:"dayman", idade:"18", a:"b"});
			$scope.data.push({nome:"bru", idade:"19", nacionalidade:"brasil"});
			$scope.data.push({nome:"outro", orgaos:[{peso:"100g", nome:"coracao"},{peso:"1g", nome:"oi"}]});
		}

		$scope.collections = [
			{
				name:"testCollection",
				fields: {
					nome: "",
					campo1: "",
					campo2: ""
				}
			},
			{
				name:"anotherCollection",
				fields: {
					firstField: ""
				}
			}
		];
		$scope.currentCollection = {
				name:"testCollection",
				fields: {
					nome: "",
					campo1: "",
					campo2: ""
				}
			};*/
	//end the forced data bind ($outScope)
	
	var listCollectionsCallback = function() {
		$scope.collections = JSON.parse(this.responseText);
		//the response already come with "name" field (name of collection)
	};
	executeConnection("POST", "php/listCollections.php", false, null, listCollectionsCallback);

	$scope.loadFields = function() {
		//not implemented yet
		if(!$scope.collections.persistFieldValues)
			$scope.clearFields();

		if($scope.currentCollection.fields) {
			//if a connection has already been made, doesn't need to do it again
			return;
		}

		var data = new FormData(); //define the parameters
		data.append("collectionName", $scope.currentCollection.name);


		var onloadCallback = function() {
			$scope.currentCollection.fields = JSON.parse(this.responseText);
			$scope.showFields = true;
		};

		executeConnection("POST", "php/listFields.php", false, data, onloadCallback);
	}

	$scope.loadData = function() {
		var data = new FormData();
		data.append("collectionName", $scope.currentCollection.name);
		data.append("fields", JSON.stringify($scope.currentCollection.fields));

		//called when the load document was done
		onloadCallback = function() {
			$scope.data = (JSON.parse(this.responseText));
		};
		executeConnection("POST", "php/listData.php", false, data, onloadCallback);
	}

	function executeConnection(type, url, sync, data, onload) {
		var http = defineXmlhttpByBrowser();

		http.onload = onload;

		http.open(type, url, sync);
		http.send(data);
	}
	function defineXmlhttpByBrowser() {
		if (window.XMLHttpRequest)
			return new XMLHttpRequest();
		else
			return new ActiveXObject("Microsoft.XMLHTTP");
	}

	$scope.addField = function() {
		$scope.showNewField = false; //hide the input

		$scope.currentCollection.fields[$scope.newFieldName] = ""; //actual add of the field
		$scope.newFieldName = ""; //clear the field input
	}

	$scope.clearFields = function() {
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
