/**
 * Create a new `Ti.UI.TabGroup`.
 */
var Promise = require('org.favo.promise');
var Abar = require('com.alcoapps.actionbarextras');
var RED = "#ca1812";
var BLUE = "#005cA9";
var win = Ti.UI.createWindow({
	title : "Hamburger Baumkataster",
	fullscreen : false,
	exitOnClose : true,
	backgroundColor : BLUE
});

win.updateListAndMap = function() {
	Abar.backgroundColor = RED;
	Abar.statusbarColor = BLUE;
	Abar.title = "Hamburger Baumkataster";
	Abar.subtitle = "Dein Standort wird bestimmt …";
	require('vendor/permissions').requestPermissions(['WRITE_EXTERNAL_STORAGE', 'ACCESS_FINE_LOCATION', 'ACCESS_COARSE_LOCATION', 'CAMERA'], function(res) {
		if (!!res) {
			arView.startAR();
			Ti.Geolocation.getCurrentPosition(function(e) {
				Ti.UI.createNotification({
					message : "Position erkannt."
				}).show();
				Abar.subtitle = e.coords.latitude + ", " + e.coords.longitude;
				Ti.Geolocation.reverseGeocoder(e.coords.latitude, e.coords.longitude, function(e) {
					if (e.success) {
						Abar.subtitle = e.places[0].address;
					}
				});
				require("getTrees")({
					latitude : e.coords.latitude,
					longitude : e.coords.longitude,
					latitudeDelta : 0.02,
					longitudeDelta : 0.02
				}, function(trees) {
					Ti.UI.createNotification({
						message : "Bäume vom Server geholt."
					}).show();
					trees = trees.slice(0,50);
					tableView.setData(trees.map(require("createRow")));
					arView.setPOIs(trees.map(function(t) {
						return {
							latitude : t.latitude,
							longitude : t.longitude,
							title : t.sorte,
							view : require("treeView")(t)
						};
					}));
				});
			});
		}
	});
};

var control = Ti.UI.createRefreshControl();
control.addEventListener('refreshstart', function(e) {
	win.updateListAndMap();
	setTimeout(function() {
		control.endRefreshing();
	}, 5000);
});

var tableView = Ti.UI.createTableView({
	refreshControl : control
});
var arView = require("arview")({
	pois : [],
	maxDistance : 1500,
});
var mapView = require("mapView")(win);
var container = Ti.UI.createScrollableView({
	views : [tableView, mapView, arView],
	showPagingControl : true,
	bottom : 16,

	backgroundColor : BLUE
});
win.add(container);
win.addEventListener("open", require("onLoad"));
win.addEventListener("open", win.updateListAndMap);
win.open();
container.scrollToView(mapView);
setTimeout(function() {
	require("importer")();
}, 2000);
