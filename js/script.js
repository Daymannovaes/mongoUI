window.onload = function() {
	updateContainerHeight();
	updateModalHeight();
	setItemInDropdownAsSelected();
}
window.onresize = function() {
	updateContainerHeight();
	updateModalHeight();
}

addModifiedStyle = function(field) {
	$(field).css("border-bottom", "1px dotted red");
	$(field).parent().parent().children().first().css("border-left", "1px solid red");
	$(field).parent().parent().children().first().css("padding-left", "3px");

	//able the commit button
}

var updateContainerHeight = function() {
	$("#form, #data").css("min-height", window.innerHeight);

	navbarHeight = (parseInt($("nav").css("height"), 10)*2) || 50;

	$("#data").css("padding-top", navbarHeight);
}
var updateModalHeight = function() {
	$("#newField .modal-content").css("min-height", window.innerHeight*0.8);
}


var scrollToTop = function() {
	var scrollInterval = setInterval(function() {
		if(window.scrollY == 0)
			clearInterval(scrollInterval);
		this.scrollBy(0, -30);
	}, 0);
}



var setItemInDropdownAsSelected = function() {
	$("div#newField ul.dropdown-menu li").click(function() {
		$(this).css("background-color", "#ddd");
		$("div#newField ul.dropdown-menu li").not(this).css("background-color", "#fff");
	});	
}
