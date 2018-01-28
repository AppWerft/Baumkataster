module.exports = function(cb) {
	var GeoOK = CacheOK = false;
	var $ = Ti.UI.createWindow({
		theme : "Theme.Dialog", // full transparent
		backgroundColor : "transparent"
	});
	var onOpen = function() {
		require('vendor/permissions').requestPermissions(['ACCESS_FINE_LOCATION', 'CAMERA'], function(res) {
			console.log(require("ti.geolocationenabled").getProviders());
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
		height :Ti.UI.FILL,
		bottom : 0,
		backgroundColor : "transparent"
	});

	dialog.add(Ti.UI.createLabel({
		font : {
			fontSize : 64,
			fontWeight : 'bold'
		},
		height:Ti.UI.SIZE,
		color : BLUE,
		bottom : 0

	}));
	dialog.add(require("ti.animation").createLottieView({
		file : 'assets/welle.json',
		loop : true,
		bottom : 0,
		width : Ti.UI.FILL,

		height : 400,
		touchEnabled : false,
		zindex : 999,
		autoStart : true
	}));
	$.addEventListener("open", onOpen);
	var Store = require("store");
	if (Ti.App.Properties.hasProperty("CacheOK") == false) {
		Store.startCaching(function() {
			$.add(dialog);
		}, function(e) {
			dialog.children[0].setText((100 * e.downloadedBytes / e.totalBytes).toFixed(1) + "%");
		}, function() {
			console.log("CacheOK");
			CacheOK = true;
			close();
			Ti.App.Properties.setBool("CacheOK", true);
		});
	} else {
		console.log("always cached.");
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
