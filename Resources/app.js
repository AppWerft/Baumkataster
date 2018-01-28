/**
 * Create a new `Ti.UI.TabGroup`.
 */
var Promise = require('org.favo.promise');
var Abar = require('com.alcoapps.actionbarextras');
var RED = "#ca1812";
var BLUE = "#005cA9";

function onOpen() {
	console.log("onReady");

	Abar.backgroundColor = RED;
	Abar.statusbarColor = BLUE;
	Abar.title = "Hamburger Baumkataster";
	Abar.subtitle = "Dein Standort wird bestimmt …";

	console.log("try get position");
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
			latitudeDelta : 0.01,
			longitudeDelta : 0.01
		}, function(trees) {
			Ti.UI.createNotification({
				message : "Bäume vom Server geholt."
			}).show();
			trees = trees.slice(0, 50);
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
	var mapView = require("mapView")(win);
	var arView = require("arview")({
		pois : [],
		maxDistance : 1500,
	});
	arView.startAR();
	var container = Ti.UI.createScrollableView({
		views : [tableView, mapView,arView],
		showPagingControl : true,
		bottom : 16,

		backgroundColor : BLUE
	});
	win.add(container);

	//win.addEventListener("open", win.updateListAndMap);

	container.scrollToView(mapView);
};
// Start:

//win.addEventListener("open", require("onLoad"));
//win.addEventListener("open", onOpen);
var win;
var onBoard = require("onboarding")(function() {
	win = Ti.UI.createWindow({
		title : "Hamburger Baumkataster",
		fullscreen : false,
		exitOnClose : true,
		backgroundColor : BLUE
	});
	win.addEventListener("open", function(e) {
		require("onLoad")(e);
		onOpen();
	});
	win.open();
});
onBoard.open();
