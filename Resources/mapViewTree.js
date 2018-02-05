var MarkerManager = require('vendor/markermanager');
var Map = require("ti.map");
module.exports = function(props) {
	var win = Ti.UI.createWindow();
	var $ = Ti.UI.createView({
		backgroundColor : BLUE
	});
	var mapView = Map.createView({
		bottom : 0,
		userLocation : Ti.Geolocation.locationServicesEnabled ? true : false,
		region : {
			latitude : 53.5535071,
			longitude : 9.9899668,
			latitudeDelta : 0.6,
			longitudeDelta : 0.6
		},
		mapType : Map.NORMAL_TYPE,
		mapToolbarEnabled : false,
		mapStyle : Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory, "model", "mapstyle.json").read().getText(),

		enableZoomControls : false
	});
	$.add(mapView);
	win.add($);
	win.addEventListener("open", function(_event) {
		Abar.backgroundColor = RED;
		Abar.statusbarColor = BLUE;
		Abar.title = "Hamburger Baumkataster";
		Abar.subtitle = props.subtitle;
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
		var data = require("store").getTreesBySort(props['sorte_latein']);
		mapView.setRegion(data.region);
		setTimeout(function() {
			var Trees = new MarkerManager({
				name : 'trees',
				image : "/assets/images/minitree.png",
				points : data.trees,
				map : mapView,
				maxannotations : 200
			});
		},10);
	});
	return win;
};
