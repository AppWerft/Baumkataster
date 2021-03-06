/**
 * Create a new `Ti.UI.TabGroup`.
 */
var Promise = require('org.favo.promise');

var RED = "#ca1812";
var BLUE = "#005cA9";
var LISTVIEW = 0,
    MAPVIEW = 1,
    ARVIEW = 2,
    DBVIEW = 3;

var Abar = require('com.alcoapps.actionbarextras');
// Start:
var start = new Date().getTime();
function Log(msg) {
	console.log((new Date().getTime() - start) + "    >>>>>> " + msg);
	start = new Date().getTime();
}

//win.addEventListener("open", require("onLoad"));
//win.addEventListener("open", onOpen);

var $ = Ti.UI.createTabGroup({
	title : 'Hamburger Baumkataster',
	exitOnClose : true,
	backgroundColor : "transparent"

});

var onGeolocation = function(e) {
	Ti.UI.createNotification({
		message : "Position erkannt."
	}).show();
	var trees = require("store").getTrees(e.coords.latitude, e.coords.longitude, 500).slice(0, 377);
	Log("end of get Trees");
	$.tabs[0].window.children[0].setData(trees.map(require("createRow")));
	Log("end of setData to list");
	$.tabs[2].window.children[0].setPOIs(trees.map(function(t) {
		return {
			latitude : t.latitude,
			longitude : t.longitude,
			title : t.sorte,
			view : require("treeView")(t)
		};
	}));
	Abar.subtitle = e.coords.latitude + ", " + e.coords.longitude;
	if (Ti.Network.online)
		Ti.Geolocation.reverseGeocoder(e.coords.latitude, e.coords.longitude, function(e) {
			if (e.success) {
				Abar.subtitle = e.places[0].address;
			}
		});
};

var updateListAndMap = function() {
	console.log("Start geo");
	Ti.Geolocation.getCurrentPosition(onGeolocation);
	return;
	if (Ti.Geolocation.lastGeolocation) {
		Log("lastLocation");
		onGeolocation({
			coords : JSON.parse(Ti.Geolocation.lastGeolocation)
		});
	}
};

Log("start");

var onBoard = require("onboarding")(function() {
	var control = Ti.UI.createRefreshControl();
	control.addEventListener('refreshstart', function(e) {
		setTimeout(function() {
			control.endRefreshing();
		}, 1000);
		updateListAndMap();
	});
	var tableView = Ti.UI.createTableView({
		refreshControl : control,
		data : [],
		backgroundColor : BLUE

		//backgroundColor : BLUE
	});
	var mapView = require("mapView")();
	var arView = require("arview")({
		pois : [],
		maxDistance : 1500,
	});
	arView.startAR();
	var tabs = [Ti.UI.createTab({
		title : "BaumListe",
		window : Ti.UI.createWindow({
			backgroundColor : "transparent"
		})
	}), Ti.UI.createTab({
		title : "BaumKarte",
		window : Ti.UI.createWindow()
	}), Ti.UI.createTab({
		title : "Augmented Reality",
		window : Ti.UI.createWindow()
	}), Ti.UI.createTab({
		title : "Baum Datenbank",
		window : Ti.UI.createWindow()
	})];
	$.setTabs(tabs);
	$.setActiveTab(tabs[MAPVIEW]);
	$.tabs[LISTVIEW].window.add(tableView);
	$.tabs[MAPVIEW].window.add(mapView);
	$.tabs[ARVIEW].window.add(arView);
	$.tabs[DBVIEW].window.add(require("dbgattungen")());
	$.addEventListener("open", function(e) {
		Log("open event");
		setTimeout(updateListAndMap, 100);
		require("onLoad")(e);
	});
	$.open();
});
onBoard.open();

//require("store").doImport();
