var $outScope;

var messages = {
	"pt_BR": {
		error_deleteData_alreadyDeleted: "O dado não existe mais (por favor, atualize seus dados).",
		error_deleteData_cantDelete: "Não foi possível excluir o registro.",
		message_confirmDelete: "Deseja realmente excluir?",
		label_collections: "Coleções",
		label_languages: "Idioma",
		label_search: "Pesquisar",
		label_addField: "Adicionar campo",
		label_insertData: "Inserir registro",
		label_deleteData: "Deletar",
		label_changeData: "Alterar",
		label_showData: "Mostrar",
		"test_message": "Essa é uma mensagem teste!",
	},
	"en_US": {
		error_deleteData_alreadyDeleted: "The data no longer exists (please update your data).",
		error_deleteData_cantDelete: "Unable to delete the data",
		message_confirmDelete: "Are you sure you want to delete?",
		label_collections: "Collections",
		label_languages: "Language",
		label_search: "Search",
		label_addField: "Add field",
		label_insertData: "Insert data",
		label_changeData: "Change",
		label_deleteData: "Delete",
		label_showData: "Show",
		"test_message": "This is a text message!",

	},
	"es_ES": {
		error_deleteData_alreadyDeleted: "NON POSSIBLE!!",
		error_deleteData_cantDelete: "Can't exclude this register.",
		message_confirmDelete: "Deseja realmente excluir?",
		label_collections: "Coleciones",
		label_languages: "Idioma",
		label_search: "Pesquisar",
		label_addField: "Adicionar campo",
		label_insertData: "Inserir registro",
		label_deleteData: "Deletar",
		label_changeData: "Alterar",
		label_showData: "Mostrar",
		"test_message": "Se trata de un mensaje de texto!",

	},

};

var lang = "pt_BR";

var collectionController = function($scope, $http) {
	/**
	 * Only for debug and test where the mongoDB not work
	 * like teknisa. So, to acess the intern methods of
	 * the controller is used the $outScope
	 */
		$outScope = $scope;
		$scope.addData = function() {
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
		$scope.currentCollection = $scope.collections[0];
	//end the forced data bind ($outScope)

	$scope.messages = messages;
	$scope.lang = {lang:lang}; //must be an object because the reference copy object (primitive doesn't work with ng include)
	$scope.languages = {
		"pt_BR": "Português",
		"en_US": "English",
		"es_ES": "Español"
	};
	$scope.toggleLanguage = function(key) {
		console.log(key);
	}

	/* 
		@TODO
			ADD A "TYPE" FIELD IN FIELD
				TO RESOLVE THE CAST PROBLEM (THE ACTUALLY SOLUTION WORKS MORE AND LESS, AND ITS UGLY!)
	 */


	 $scope.addParentProperty = function(data, parentName) {
	 	if(parentName && data instanceof Array)
	 		data["parentName"] = parentName;
	 	
	 	for(attr in data) {
	 		if(typeof data[attr] == "object")
	 			$scope.addParentProperty(data[attr], attr);
	 	}
	 }
	 $scope.getParentByParentNameProperty = function(data, parentName) {

	 }
// ---- CONNECTION methods ----- methods that connect with database -----------
	var listCollectionsCallback = function() {
		$scope.collections = JSON.parse(this.responseText);
		//the response already come with "name" field (name of collection)
	};
	executeConnection("POST", "php/ListCollections.php", false, null, listCollectionsCallback);

	$scope.loadFields = function() {
		//if the collection is null, nothing is done and nothing is showed
		if(!$scope.currentCollection) {
			$scope.showFields = false;
			return;
		}
		$scope.data = $scope.currentCollection.data;
		
		//not implemented yet
		if($scope.collections.persistFieldValues == false)
			$scope.clearFields();

		//if a connection has already been made, doesn't need to do it again
		if($scope.currentCollection.fields) {
			$scope.showFields = true;
			return;
		}


		var data = new FormData(); //define the parameters
		data.append("collectionName", $scope.currentCollection.name);

		var onloadCallback = function() {
			try {
				$scope.currentCollection.fields = JSON.parse(this.responseText);
				$scope.showFields = true;
			} catch(error) {
				$scope.showFields = false;
			}
		};

		executeConnection("POST", "php/ListFields.php", false, data, onloadCallback);
	}

	$scope.loadData = function() {
		//@todo gif 
		var data = new FormData();
		data.append("collectionName", $scope.currentCollection.name);
		data.append("fields", JSON.stringify($scope.currentCollection.fields));

		//called when the load document was done
		
		onloadCallback = function() {
			try {
				$scope.currentCollection.data = JSON.parse(this.responseText);
				$scope.data = $scope.currentCollection.data;
				$scope.showLoading = false;
			} catch(error) {
				//$scope.currentCollection.data = this.responseText;
			}
		};
		executeConnection("POST", "php/ListData.php", false, data, onloadCallback);
	}
	$scope.insertData = function() {
		//@todo receive data as parameter

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
				$scope.clearFields();

				$scope.showLoading = false;
			} catch(error) {
				//@todo show (not sucess for some reason (you can inspect the code and find the error by yourself, if you want!))
			}
		};
		executeConnection("POST", "php/InsertData.php", false, data, onloadCallback);
	}
	$scope.deleteData = function(dataNumber) {
		//if(!confirm($scope.messages[$scope.lang.lang]["message_confirmDelete"]))
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
// ---- END utility connection methods ----------------------------------------


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

	$scope.toggle = function(data, key) {
		data["show"+key] = data["show"+key] ? !data["show"+key] : true;
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
