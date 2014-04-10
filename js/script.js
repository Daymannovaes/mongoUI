var collectionController = function($scope){
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
	
	var http = defineXmlhttpByBrowser();
	http.onload = function() {

		$scope.collections = JSON.parse(http.responseText);
		//the response already come with "name" field (name of collection)

	};
	http.open("POST", "listCollections.php", false);	
	http.send();


	function defineXmlhttpByBrowser() {
		if (window.XMLHttpRequest)
			return new XMLHttpRequest();
		else
			return new ActiveXObject("Microsoft.XMLHTTP");
	}

	$scope.loadFields = function() {
		if(!$scope.persistFieldValues)
			$scope.clearFields();

		//define the parameters
		var data = new FormData();

		if($scope.currentCollection.fields) {
			return;
		}

		data.append("collectionName", $scope.currentCollection.name);
		data.append("fields", "");


		var http = defineXmlhttpByBrowser();
		http.onload = function() {
			$scope.currentCollection.fields = JSON.parse(http.responseText);

			$scope.showFields = true;
		};
		http.open("POST", "listFields.php", false);
		http.send(data);
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

	$scope.showCollections = function() {
		console.log("Collections: ");
		console.log($scope.collections);

		console.log("\nactual collection: ");
		console.log($scope.currentCollection);

	}

	$scope.loadData = function() {
		var data = new FormData();
/*
		if($scope.currentCollection.fields) {
			return;
		}*/

		data.append("collectionName", $scope.currentCollection.name);
		data.append("fields", JSON.stringify($scope.currentCollection.fields));


		var http = defineXmlhttpByBrowser();
		http.onload = function() {
			//console.log(JSON.parse(http.responseText));
			$scope.data = (JSON.parse(http.responseText));
		};
		http.open("POST", "listData.php", false);
		http.send(data);		
	}

	$scope.typeOf = function(input) {
	    return typeof input;
	  }

};
