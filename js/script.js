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
		"text": "text",
		"string": "text",
		"number": "number",
		"double": "number",
		"float": "number",
		"int": "number",
	};
	$scope.show = {}; //show and hide flags
	$scope.debug = true;
	$scope.connection.connect = true;

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
		
			REFACTOR NEW.FIELD OBJECT

			ADD NEW FIELD IN THE END

			STORE DELETE AND UPDATE ACTIONS IN SOMEWHERE TO COMMIT (IN DATA BASE) AFTER
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

	
// --------------------------------------------------------------------------------------------------------------------

// --------------------------------------------------------------------------------------------------------------------

// ---- CONNECTION methods ----- methods that connect with database -----------
	$scope.connection.loadCollections = function() {
		$scope.consolelog("Getting collection names from the server");
		$scope.show.showLoading();

		$http.get("php/loadCollections.php").success(function(collections) {
			$scope.show.clearLoading();
			$scope.collections = collections;

			//set focus to selection after 10 mili seconds
			setTimeout(function() {$("select[data-ng-model='currentCollection']").focus()}, 10);

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

				//focus first field after 10 milisseconds
				setTimeout(function() {$("form#form_fields input:first").focus()}, 100);

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

				$scope.show.clearLoading();
				$scope.show.data = true;

				console.log(response);
				$scope.consolelog("Load data successful");
			}).error(function(error) {
				$scope.consolelog("Error while loading data from server.");
				console.log(error);
			});
		//executeConnection("POST", "php/ListData.php", false, data, onloadCallback);
	}
	$scope.connection.insertData = function() {
		//@todo receive data as parameter
		$scope.consolelog("\n\nInserting data");

		var data = new FormData();

		var data = {
			collectionName: $scope.currentCollection.name,
			fields: $scope.currentCollection.fields
		};

		if($scope.currentCollection.data == undefined) $scope.currentCollection.data = [];
		obj = {};
		for(key in $outScope.currentCollection.fields)
			obj[key] = $outScope.currentCollection.fields[key]["value"];
		$scope.currentCollection.data.push(obj);
		$scope.show.data = true;
		$scope.field.clear();
		return;
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

		if(!confirm($scope.messages[$scope.messages.current]["message_confirmDelete"])) {
			$scope.consolelog("Delete canceled");
			return;
		}
		$scope.show.showLoading("Deleting data");

		console.log("data: ");
		console.log($scope.currentCollection.data[dataNumber]);

		var data = {
			collectionName: $scope.currentCollection.name,
			data: $scope.currentCollection.data[dataNumber]
		};

		$http.post("php/deleteData.php", data)
			.success(function(response) {
				//for now, this works!
				//@todo show a popup with successs! (or not sucess)
				console.log(response);
				//@todo fade out
				$scope.currentCollection.data.splice(dataNumber, 1);	
				$scope.show.clearLoading();			
			}).error(function(error) {
				$scope.consolelog("Error while deleting data in server.");
				console.log(error);
				console.log(response);				
			});
	}

	$scope.connection.changeData = function(data) {
		console.log(data);
		if(confirm("Update data is not working yet"))
			data["nome"] = "deu certo";
	}
	$scope.connection.commitActions = function(data) {
		window.alert("Commit is not working yet");
	}
// ---- END connection methods ------------------------------------------------
	

// --------------------------------------------------------------------------------------------------------------------

// --------------------------------------------------------------------------------------------------------------------

// ---- NEW FIELD methods -----------------------------------------------------
	$scope.field.add = function() {
		$scope.currentCollection.fields[$scope.field.new.name] = {
			value: "",
			type:$scope.field.new.type
		}; //actual add of the field

		//clear field and selection
		$scope.field.new.name = "";
		$scope.field.new.type = "";
	}

	$scope.field.clear = function() {
		for(key in $scope.currentCollection.fields)
			$scope.currentCollection.fields[key]["value"] = "";
	}

	
	$scope.field.template = {
		name: "",
		type: "text",
		value: ""
	}
	$scope.field.new = angular.copy($scope.field.template);

	$scope.field.updateTemplate = function(field) {
		console.log(field);
		if(field.type == "object") {
			field.value = [];
			field.value.push(angular.copy($scope.field.template));
			field.showAddChild = true;
		}
		else {
			field.value = "";
			field.showNew = true;
		}
		console.log(field);
	}
	$scope.field.addChild = function(field) {
		field.value.push(angular.copy($scope.field.template));
	}
	$scope.field.selfDelete = function(field, fieldNumber) {


		realParent = field.$parent.$parent.$parent.$parent.value ?
						field.$parent.$parent.$parent.$parent.value.value :
						field.$parent.$parent.$parent.field.new.value;

		if(realParent.length > 1) {
			realParent.splice(fieldNumber, 1);
			delete field;
		}
	}

	// ---- POPUP VISIBILITY methods ------------------------------------------
	$scope.openPopup = function() {
		$scope.show.newField = true;

		$scope.class.container[1] = "container-blur";
		$scope.class.popup[1] = "popup-show";

		//set focus to the field ten milisseconds after, because of the delay to show popup
		setTimeout(function(){$(".popup-show input[type='text']").focus()}, 10);
	}
	$scope.closePopup = function(event) {
		if(!event || event.which == 27) {
			$scope.class.container[1] = "container-focus";
			$scope.class.popup[1] = "popup-hide";
			$scope.field.new = angular.copy($scope.field.template); //clear properties

			$scope.show.newField = false;
		}
	}
	$scope.containerClosepopup = function() {
		if($scope.show.newField)
			$scope.closePopup();
	}	
// ---- END new field methods ------------------------------------------------



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
		$scope.currentCollection = $scope.collections[0];*/
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
