blurAll = function() {
	$(".button-blur").val("Hide popup");

	$(".container").removeClass("container-focus");
	$(".container").addClass("container-blur");

	$(".popup").removeClass("popup-hide");
	$(".popup").addClass("popup-show");
}
focusAll = function() {
	$(".button-blur").val("Show popup");

	$(".container").addClass("container-focus");
	$(".container").removeClass("container-blur");

	$(".popup").removeClass("popup-show");
	$(".popup").addClass("popup-hide");
}