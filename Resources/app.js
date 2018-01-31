/**
 * Create a new `Ti.UI.TabGroup`.
 */
var Promise = require('org.favo.promise');

var RED = "#ca1812";
var BLUE = "#005cA9";
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
	Log("get Trees");
	Log(JSON.stringify(e));
	var trees = require("store").getTrees({
		latitude : e.coords.latitude,
		longitude : e.coords.longitude,
		latitudeDelta : 0.015,
		longitudeDelta : 0.015
	}).slice(0, 77);
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
	Log("onBoarding");
	var control = Ti.UI.createRefreshControl();
	control.addEventListener('refreshstart', function(e) {
		setTimeout(function() {
			control.endRefreshing();
		}, 1000);
		Log("P2R");
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
	})];
	$.setTabs(tabs);
	$.setActiveTab(tabs[0]);
	$.tabs[0].window.add(tableView);
	$.tabs[1].window.add(mapView);
	$.tabs[2].window.add(arView);
	Log("build ready");
	$.addEventListener("open", function(e) {
		Log("open event");
		setTimeout(updateListAndMap, 100);
		require("onLoad")(e);
	});
	$.open();
});
onBoard.open();
