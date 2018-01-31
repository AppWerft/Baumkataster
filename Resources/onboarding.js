module.exports = function(cb) {
	var GeoOK = CacheOK = false;
	Log("start on boarding");
	var $ = Ti.UI.createWindow({
		theme : "Theme.Dialog", // full transparent
		backgroundColor : "transparent"
	});
	var onOpen = function() {
		Log("onboarding opened");
		require('vendor/permissions').requestPermissions(['ACCESS_FINE_LOCATION', 'CAMERA'], function(res) {
			console.log(require("ti.geolocationenabled").getProviders());
			Log("getpermission");
			if (!!res) {
				if (require("ti.geolocationenabled").getLocationServicesEnabled() == false) {
					var alertDlg = Titanium.UI.createAlertDialog({
						title : 'Baumkataster',
						message : 'Der Ortungsdienst ist global ausgeschaltet, bitte aktivieren!',
						buttonNames : ['Abbruch', 'Einstellungen öffnen'],
						cancel : 0
					});
					alertDlg.addEventListener('click', function(e) {
						$.addEventListener("focus", onOpen);
						if (e.index !== e.source.cancel) {
							var settingsIntent = Ti.Android.createIntent({
								action : 'android.settings.LOCATION_SOURCE_SETTINGS'
							});
							$.activity.startActivityForResult(settingsIntent, function(e) {
								console.log(e.resultCode);
							});
						}
					});
					alertDlg.show();
				} else
					GeoOK = true;
				close();
			}
		});
	};
	var dialog = Ti.UI.createView({
		width : Ti.UI.FILL,
		height : Ti.UI.FILL,
		bottom : 0,
		backgroundColor : "transparent"
	});
	console.log("dialog created");
	dialog.add(Ti.UI.createView({
		height : 80,
		left : 0,
		bottom : 0,
		zIndex : 9,
		backgroundColor : "#8000"

	}));
	dialog.add(Ti.UI.createLabel({
		font : {
			fontSize : 64,
			fontWeight : 'bold'
		},
		height : Ti.UI.SIZE,
		color : BLUE,
		textAlign : "right",
		width : Ti.UI.FILL,
		bottom : 0,
		zIndex : 99,
		backgroundColor : "#8fff"

	}));
	dialog.add(require("ti.animation").createLottieView({
		file : 'assets/gears.json',
		loop : true,
		bottom : 90,
		width : Ti.UI.FILL,
		transform : Ti.UI.create2DMatrix({
			scale : 3.0
		}),
		height : "50%",
		touchEnabled : false,
		zindex : 999,
		autoStart : true
	}));
	$.addEventListener("open", onOpen);
	var Store = require("store");
	if (Ti.App.Properties.hasProperty("CacheOK") == false) {
		Store.startCaching(function() {
			console.log("caching started");
			$.add(dialog);
			Ti.UI.createNotification({duration:5000,
				message : "Daten von 225000 Bäumen werden einmalig runtergeladen."
			}).show();
		}, function(e) {
			dialog.children[1].setText(" " + (100 * e.downloadedBytes / e.totalBytes).toFixed(1) + "% ");
			dialog.children[0].setWidth((100 * e.downloadedBytes / e.totalBytes) + "% ");
		}, function() {
			console.log("CacheOK");
			CacheOK = true;
			close();
			Ti.App.Properties.setBool("CacheOK", true);
		});
	} else {
		CacheOK = true;
		close();
	}
	function close() {
		if (CacheOK && GeoOK) {
			console.log("cache and Geo OK");
			//$.close();
			cb();
		}
	}
	return $;
};
