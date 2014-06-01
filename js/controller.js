var $outScope;


var mongoApp = angular.module('mongoApp', [])
.controller("collectionController", function($scope, $http){

	$scope.consolelog = function(message) {
		if($scope.debug)
			console.log(message);
	}

// ---- CREATING $scope model -------------------------------------------------
	$scope.connection = {}; //functions

	$scope.field = {}; //functions
	$scope.field.type = ["Number", "Text", "Checkbox", "Object", "Array"];

	$scope.show = {}; //show and hide flags

	$scope.debug = true;
	$scope.connection.connect = true;

	$scope.class = {
		container: [""],
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
		@TODO search by sql? (already exist in php)

		have a todo in "field"

		hide data if all documents was deleted

		remove br's

		add tabindex in ngrepeats

		improve the javascript (jquery css) in select type in new field.	

		refactor insert data

	 */

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
			scrollToTop();
		}).error(function(error) {
			console.log("Error while getting collection names from the server.");
			console.log(error);
		});
	}

// ----------------------------------------------------------------------------
// ---- LOAD FIELDS methods
	$scope.connection.loadFields = function() {
		if(!shouldConnectToloadFields($scope.currentCollection)) {
			$scope.show.clearLoading();
			return;
		}

		//not implemented yet @todo
		if($scope.currentCollection.persistFieldValues == false)
			$scope.field.clear();

		showLogAngLoading("Loading fields for " + $scope.currentCollection.name);

		$http.post("php/loadFields.php", {"collectionName": $scope.currentCollection.name})
			.success(function(response) {
				$scope.currentCollection.fields = response;
				$scope.show.fields = true;
				$scope.show.clearLoading();

				//focus first field after 10 milisseconds
				setTimeout(function() {$("form#form_fields input:first").focus()}, 100);

				console.log(response);
				$scope.consolelog("Load fields successful");
			}).error(function(error) {
				$scope.consolelog("Error while loading fields from server.");
				console.log(error);
		});
	}
	shouldConnectToloadFields = function(collection) {
		if(collectionIsNull(collection))
			return false;
		if(fieldsAlreadyExist(collection))
			return false;
		if(!$scope.connection.connect) //flag to not execute connection
			return false;

		$scope.show.data = false;
		$scope.show.fields = false;
		return true;
	}	
	collectionIsNull = function(collection) {
		if(!collection) {
			$scope.show.data = false;
			$scope.show.fields = false;
			return true;
		}
		return false;
	}
	fieldsAlreadyExist = function(collection) {
		if(collection.fields) {
			$scope.show.data = true;
			$scope.show.fields = true;
			return true;
		}
		return false;
	}
// ---- END load fields methods
// ----------------------------------------------------------------------------


// ----------------------------------------------------------------------------
// ---- LOAD DATA methods
	$scope.connection.loadData = function() {
		if(!$scope.connection.connect) return;

		var data = {
			collectionName: $scope.currentCollection.name,
			fields: $scope.currentCollection.fields
		};
		$scope.show.data = false; //first hide the old data

		showLogAngLoading("Loading data for " + $scope.currentCollection.name);

		$http.post("php/loadData.php", data)
			.success(function(response) {
				$scope.currentCollection.data = response;

				$scope.show.clearLoading();
				$scope.show.data = true;

				$scope.consolelog("Load data successful");

				$("html, body").animate({
					scrollTop: 150
				}, 500);
			}).error(function(error) {
				$scope.consolelog("Error while loading data from server.");
				console.log(error);
				console.log(response);
			});
		//executeConnection("POST", "php/ListData.php", false, data, onloadCallback);
	}
// ---- END load data methods
// ----------------------------------------------------------------------------


// ----------------------------------------------------------------------------
// ---- INSERT DATA methods
	$scope.connection.insertData = function() {
		//@todo receive data as parameter
		showLogAngLoading("Inserting data");


		if($scope.currentCollection.data == undefined) $scope.currentCollection.data = [];
		obj = {};
		for(key in $outScope.currentCollection.fields)
			obj[key] = $outScope.currentCollection.fields[key]["value"];
		$scope.currentCollection.data.push(obj);
		$scope.show.data = true;
		$scope.field.clear();

		var data = {
			collectionName: $scope.currentCollection.name,
			data: obj
		};

		if(!$scope.connection.connect) return;
		$http.post("php/insertData.php", data)
			.success(function(response) {
				//@todo show a popup with successs! (or not sucess)
				console.log(response);
				$scope.field.clear();

				$scope.show.clearLoading();
				$scope.consolelog("Insert data successful");
			}).error(function(error) {
				$scope.consolelog("Error while inserting data in server.");
				console.log(error);
				console.log(response);
			});
	}
// ---- END insert data methods
// ----------------------------------------------------------------------------


// ----------------------------------------------------------------------------
// ---- DELETE data methods
	$scope.connection.deleteData = function(dataNumber) {

		if(!confirm($scope.messages[$scope.messages.current]["message_confirmDelete"])) {
			$scope.consolelog("Delete canceled");
			return;
		}
		$scope.consolelog("\n\nDeleting data");
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
// ---- END delete data methods
// ----------------------------------------------------------------------------


	showLogAngLoading = function(description) {
		$scope.consolelog("\n\n" + description);
		$scope.show.showLoading(description);
	}
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

	$scope.connection.changeData = function(data) {
		console.log(data);
		//if(confirm("Update data is not working well yet, want to continue?"))
			$scope.dataType = "text";
			
		//data["nome"] = "deu certo";
	}
	$scope.connection.commitActions = function(data) {
		//window.alert("Commit is not working yet");
		
		$scope.dataType = "button";
	}
	$scope.dataType = "button"; 
// ---- END commit actions methods
// ----------------------------------------------------------------------------


	$scope.connection.loadCollections();
// ---- END connection methods ------------------------------------------------
// --------------------------------------------------------------------------------------------------------------------
// --------------------------------------------------------------------------------------------------------------------


// ---- NEW FIELD methods -----------------------------------------------------
	//@TODO consist the names, repeateds, empts and etc
	$scope.field.arrayToObject = function(field) {
		if(field.type == "object" && field.value instanceof Array) {
			var temporaryObject = {};
			for(key in field.value) {
				temporaryObject[field.value[key].name] = {
					value: "",
					type: field.value[key].type,
					value: $scope.field.arrayToObject(field.value[key]) || "",
				};
			}
			return temporaryObject;
		}
		return field.type;
	}

	$scope.field.addNew = function(field) {
		$scope.currentCollection.fields[$scope.field.new.name] = {
			value: "",
			type: $scope.field.arrayToObject($scope.field.new)
		}; //actual add of the field

		console.log($scope.currentCollection.fields[$scope.field.new.name]);
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
		type: "Text",
		value: ""
	}
	$scope.field.new = angular.copy($scope.field.template);

	$scope.field.updateTemplate = function(field, fieldType) {
		field.type = fieldType;

		console.log(field);
		//field.type == "object" ? updateTemplateAsObject(field) : updateTemplateAsNotObject(field) 
		if(field.type == "Object") {
			field.value = [];
			field.value.push(angular.copy($scope.field.template));
			field.showAddChild = true;
		}
		else {
			field.value = "";
			field.showAddChild = false;
		}
	}
	/*$scope.field.updateTemplateAsObject = function(field) {

	}*/

	$scope.field.addChild = function(field) {
		field.value.push(angular.copy($scope.field.template));
	}
	$scope.field.selfDelete = function(field, fieldNumber) {


		realParent = field.$parent.$parent.$parent.$parent.value ?
						field.$parent.$parent.$parent.$parent.value :
						field.$parent.$parent.$parent.field.new;

		if(realParent.value.length > 1) {
			realParent.value.splice(fieldNumber, 1);
			delete field;
		}
	}	
// ---- END new field methods ------------------------------------------------


// ---- HELPER methods in recursive template (will be deprecated when node and jade comes)
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
// ----- END helper methods --------------------------------------------------------------

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
