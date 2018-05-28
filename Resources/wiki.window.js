module.exports = function(species) {
	var win = Ti.UI.createWindow();
	var $ = Ti.UI.createWebView({
		backgroundColor : BLUE,
		enableZoomControls : false,
		url : "https://species.m.wikimedia.org/wiki/" + species

	});
	win.add($);
	win.addEventListener("open", function(_event) {

		Abar.backgroundColor = RED;
		Abar.statusbarColor = BLUE;
		Abar.title = "Hamburger Baumkataster";
		Abar.subtitle = species;
		var activity = _event.source.getActivity();
		if (activity) {
			activity.actionBar.displayHomeAsUp = true;
			activity.actionBar.onHomeIconItemSelected = function() {
				win.close();
			};
			activity.onCreateOptionsMenu = function(_menuevent) {
			};
			activity.invalidateOptionsMenu();
		}
	});

	return win;
};
