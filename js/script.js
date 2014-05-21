var updateParallax = function() {
	$("#parallax-1").css("height", window.innerHeight);

	$("#parallax-2").css("top", window.innerHeight);
	$("#parallax-2").css("min-height", window.innerHeight);

	navbarHeight = (parseInt($("nav").css("height"), 10)*2) || 50;

	$("#parallax-2").css("padding-top", navbarHeight);
}

window.onresize = function() {
	updateParallax();
}

var scrollToTop = function() {
	var scrollInterval = setInterval(function() {
		if(window.scrollY == 0)
			clearInterval(scrollInterval);
		this.scrollBy(0, -30);
	}, 0);
}



window.onload = function() {
	updateParallax();
}
