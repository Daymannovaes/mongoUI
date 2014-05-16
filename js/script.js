var $outScope;

var mongoApp = angular.module('mongoApp', [])
.controller("collectionController", function($scope, $http){

	$scope.consolelog = function(message) {
		if($scope.debug)
			console.log(message);
	}

// ---- CREATING $scope model -------------------------------------------------]

	$scope.connection = {}; //functions
	$scope.field = {}; //functions
	$scope.field.type = {
		"string": "string",
		"double": "number",
		"float": "number",
		"int": "number"
	}
	$scope.show = {}; //show and hide flags
	$scope.debug = true;
	$scope.connection.connect = false;

	$scope.class = {
		container: ["container"],
		popup: ["popup", "popup-hide"],
		loading: ["loading", "loading-hide"]
	};
	$scope.label_loading = "Loading collection names";

	$scope.languages = {
		"pt_BR": "Português",
		"en_US": "English",
		"es_ES": "Español",
	};


	$scope.consolelog("\nGetting messages from the server.");
	$http.get("json/messages.json").success(function(messages) {
		$scope.messages = messages;
		$scope.consolelog("Get messages successful.");
	}).error(function(error) {
		console.log("Error while getting messages from the server.");
		console.log(error);
	});
// ---- END creating $scope model ---------------------------------------------

	/* 
		@TODO
			ADD A "TYPE" FIELD IN FIELD
				TO RESOLVE THE CAST PROBLEM (THE ACTUALLY SOLUTION WORKS MORE AND LESS, AND ITS UGLY!)
					type field added
			
			REFACTOR JSON MESSAGES

			CREATE AUTO TEST WITH SELENIUM AND XDEBUGGER CODE COVERAGE

			FIRST, ADD SINGLETON CONNECTION TO INSTANTIATE ONLY A ONE CONNECTION (AND CLOSE IN FINISH WINDOW)
			SECOND, ADD AN SINGLETON BY USER (DEFINIED BY AN ID, FOR EXAMPLE)

			CLOSE POPUP WITH ESC KEY

			REFACTOR THE NAME OF VARIABLES, FIELD AND COLUMN ARE THE SAME THING, LIST AND LOAD TOO

			ADD SOME GOOD JAVASCRIPT PATTERN TO CREATE PRIVATE METHOD THAT ONLY ARE ACCESSED BY THE PUBLICS
				CONNECTION METHODS ARE PUBLIC
				SHOW LOADING AND CLEAR LOADING ARE PRIVATE

			CHANGE $SCOPE.NEWFIELDNAME
	 */


	$scope.show.showLoading = function(label) {
		$scope.label_loading = label != undefined ? label : $scope.label_loading;
		$scope.class.container[1] = "container-blur";
		$scope.show.loading = true;
	}
	$scope.show.clearLoading = function() {
		$scope.label_loading = "";
		$scope.class.container[1] = "container-focus";
		$scope.show.loading = false;
	}

	
// ----------------------------------------------------------------------------------------------------------
// ---- CONNECTION methods ----- methods that connect with database -----------
	$scope.connection.loadCollections = function() {
			return;
		$scope.consolelog("Getting collection names from the server");
		$scope.show.showLoading();

		$http.get("php/loadCollections.php").success(function(collections) {
			$scope.show.clearLoading();
			$scope.collections = collections;

			$scope.consolelog("Get collection names successful.");
		}).error(function(error) {
			console.log("Error while getting collection names from the server.");
			console.log(error);
		});
	}
	$scope.connection.loadCollections();

	$scope.connection.loadFields = function() {
		$scope.consolelog("\n\nLoading Fields");
		$scope.show.fields = false; //first hide the old fields
		$scope.show.showLoading("Loading fields");

		//if the collection is null, nothing is done and nothing is showed
		if(!$scope.currentCollection) {
			$scope.show.clearLoading();
			$scope.show.data = false;
			return;
		}

		$scope.data = $scope.currentCollection.data;
		
		//not implemented yet
		if($scope.collections.persistFieldValues == false)
			$scope.field.clear();

		//if a connection has already been made, doesn't need to do it again
		if($scope.currentCollection.fields) {
			$scope.show.fields = true;
			$scope.show.data = true;
			$scope.show.clearLoading();
			return;
		}

		if(!$scope.connection.connect) return;
		$http.post("php/loadFields.php", {"collectionName": $scope.currentCollection.name})
			.success(function(response) {
				$scope.currentCollection.fields = response;
				$scope.show.fields = true;
				$scope.show.clearLoading();

				$scope.consolelog("Load fields successful");
			}).error(function(error) {
				$scope.consolelog("Error while loading fields from server.");
				console.log(error);
				console.log(response);
		});
	}

	$scope.connection.loadData = function() {
		$scope.consolelog("\n\nLoading data");

		$scope.show.data = true; //first hide the old fields
		if(!$scope.connection.connect) return;
		$scope.show.showLoading("Loading data");

		var data = {
			collectionName: $scope.currentCollection.name,
			fields: $scope.currentCollection.fields
		};

		$http.post("php/loadData.php", data)
			.success(function(response) {
				$scope.currentCollection.data = response;
				$scope.data = $scope.currentCollection.data;

				$scope.show.clearLoading();
				$scope.show.data = true;

				$scope.consolelog("Load data successful");
			}).error(function(error) {
				$scope.consolelog("Error while loading data from server.");
				console.log(error);
				console.log(response);
			});
		//executeConnection("POST", "php/ListData.php", false, data, onloadCallback);
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

		if($scope.data == undefined) $scope.data = [];
		$scope.data.push(($scope.currentCollection.fields));

		if(!$scope.connection.connect) return;
		$http.post("php/insertData.php", data)
			.success(function(response) {
				//@todo show a popup with successs! (or not sucess)
				console.log(response);
				$scope.field.clear();

				$scope.show.loading_data = false;
				$scope.consolelog("Insert data successful");
			}).error(function(error) {
				$scope.consolelog("Error while inserting data in server.");
				console.log(error);
				console.log(response);
			});
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
		executeConnection("POST", "php/deleteData.php", false, data, onloadCallback);
	}

	$scope.connection.changeData = function(data) {
		console.log(data);
		return;
		data["nome"] = "deu certo";
	}
// ---- END connection methods ------------------------------------------------
	$scope.field.add = function() {
		$scope.show.newField = false; //hide the input

		$scope.currentCollection.fields[$scope.newFieldName] = {value: "", type:"string"}; //actual add of the field
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
		$scope.isArray = function(input) {
			return input instanceof Array;
		}
		$scope.isObjectAndNotArray = function(input) {
			return (typeof input == "object") && !(input instanceof Array);
		}
		$scope.isNumber = function(input) {
			return !isNaN(parseInt(input));
		}

	$scope.toggle = function(data, key) {
		$scope.consolelog(data);
		data["show"+key] = data["show"+key] ? !data["show"+key] : true;
	}

	$scope.openPopup = function() {
		$scope.class.container[1] = "container-blur";
		$scope.class.popup[1] = "popup-show";

		$(".popup-show input[type='text']").click();
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
		$scope.addData = function() {
			$scope.data = [];/*
			$scope.data.push({nome:"dayman", idade:"18", a:"b"});
			$scope.data.push({nome:"bru", idade:"19", nacionalidade:"brasil"});
			$scope.data.push({nome:"outro", orgaos:[{peso:"100g", nome:["coracao"]},{peso:"1g", nome:"oi"}]});*/
			$scope.data.push({familias: [
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
							 ],
							nome:"BH"
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

});

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
