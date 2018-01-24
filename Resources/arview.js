var isAndroid = Ti.Platform.osname == 'android';
/*if (isAndroid) {
 // Landscape Mode
 var screenWidth = Ti.Platform.displayCaps.platformHeight;
 var screenHeight = Ti.Platform.displayCaps.platformWidth;
 } else {*/
var LDF = Ti.Platform.displayCaps.logicalDensityFactor || 1;
var screenWidth = (Math.min(Ti.Platform.displayCaps.platformWidth, Ti.Platform.displayCaps.platformHeight)) / LDF;
var screenHeight = (Math.max(Ti.Platform.displayCaps.platformWidth, Ti.Platform.displayCaps.platformHeight)) / LDF;
//console.log('SCREENWIDTH=' + screenWidth);
//console.log('SCREENHEIGHT=' + screenHeight);

//}
// https://github.com/jeffbonnes/parmavision
var MAX_ZOOM = 1.0;
var MIN_ZOOM = 0.55;
var DELTA_ZOOM = MAX_ZOOM - MIN_ZOOM;
var numberOfpanels = 4;
var MIN_Y = Math.floor(screenHeight * .1);
var MAX_Y = Math.floor(screenHeight * .65);
var DELTA_Y = MAX_Y - MIN_Y;

// https://jira.appcelerator.org/browse/TIMOB-9434

if (isAndroid) {
	Ti.Geolocation.getCurrentHeading(function() {
	});
	Ti.Geolocation.accuracy = Ti.Geolocation.ACCURACY_LOW;
} else {

	Ti.Geolocation.distanceFilter = 100;
	//Ti.Geolocation.showCalibration = false;
	Ti.Geolocation.preferredProvider = "gps";
	Ti.Geolocation.accuracy = Ti.Geolocation.ACCURACY_NEAREST_TEN_METERS;
	Ti.Geolocation.purpose = "Augmented Reality";
}
Ti.Geolocation.headingFilter = 0.1;

// function to create the window
module.exports = function(params) {
	var started = false;
	var $ = Ti.UI.createView({
		width : Ti.UI.FILL,
		height : Ti.UI.FILL
	});

	$.maxDistance = params.maxDistance || 2500;
	$.startAR = function() {
		if (started)
			return;
		started = true;
		$.add(require("pw.custom.androidcamera").createCameraView({
			width : Ti.UI.FILL,
			height : Ti.UI.FILL
		}));
		$.add(overlay);
	};
	$.stoppAR = function() {
		started=false;
	};
	$.setPOIs = function(pois) {
		$.pois = pois;
		console.log("AR contains now "+  pois.length + " pois" );
		redrawPois();
	};

	function showAR() {
		if (Ti.App.Properties.hasProperty('lastGeolocation')) {
			locationCallback({
				coords : JSON.parse(Ti.App.Properties.getString('lastGeolocation'))
			});
		}
		Ti.Geolocation.addEventListener('heading', headingCallback);
		Ti.Geolocation.addEventListener('location', locationCallback);

	}

	function closeAR() {
		Ti.Geolocation.removeEventListener('heading', headingCallback);
		Ti.Geolocation.removeEventListener('location', locationCallback);
		if (!isAndroid) {
			console.log('camera closed');

		}
		$.removeAllChildren();

	}

	var panels = [];
	// background colors for debugging
	var showColors = false;
	var colors = ['red', 'yellow', 'pink', 'green', 'purple', 'orange', 'blue', 'aqua', 'white', 'silver'];

	var myLocation = null;
	var overlay = Ti.UI.createView({
		top : 0,

		height : screenHeight,
		left : 0,
		width : screenWidth,
		backgroundColor : 'transparent'
	});
	// Create the main view - only as wide as the viewport

	// Create all the view that will contain the points of interest
	for (var i = 0; i < numberOfpanels; i++) {
		// create a view 1.6x the screen width
		// they will overlap so any poi view that
		// are near the edge will continue over into the
		// 'next' view.
		panels[i] = Ti.UI.createView({
			top : 0,
			//borderWidth : 1,
			//borderColor : "silver",
			height : screenHeight,
			right : 0,
			width : (screenWidth * 1.6),
			visible : false
		});
		
		if (showColors) {
			panels[i].backgroundColor = colors[i];
			panels[i].opacity = 0.6;
		}
		overlay.add(panels[i]);
	};

	var radar = Ti.UI.createView({
		backgroundImage : '/assets/radar.png',
		width : '80dp',
		height : '80dp',
		bottom : '10dp',
		left : '10dp',
		zIndex : 9999,
		opacity : 0.6
	});
	radar.addEventListener('click', closeAR);
	var compass = Ti.UI.createLabel({
		left : '50dp',
		color : '#009FE0',
		bottom : 2,
		visible : false
	});
	overlay.add(compass);

	//overlay.add(radar);

	if (!isAndroid) {
		var button = Ti.UI.createButton({
			top : '5dp',
			right : '5dp',
			height : '45dp',
			width : '45dp',
			backgroundImage : '/images/close.png'
		});
		button.addEventListener('click', closeAR);
		overlay.add(button);
	}
	var lastActiveView = -1;
	var viewChange = false;
	var centerY = screenHeight / 2;
	var activePois;
	var TP = new (require('vendor/tiefpass'))({
		steps : 3
	});

	function headingCallback(e) {
		var currBearing = e.heading.trueHeading || e.heading.magneticHeading;
		currBearing = TP.add(currBearing);
		// Rotate the radar
		radar.transform = Ti.UI.create2DMatrix().rotate(-currBearing);

		var internalBearing = currBearing / (360 / panels.length);
		var activeView = Math.floor(internalBearing);
		var pixelOffset = screenWidth - (Math.floor((internalBearing % 1) * screenWidth));
		// console.log('currBearing ' + currBearing);
		//   console.log('internalBearing ' + internalBearing);
		// console.log('activeView ' + activeView);

		if (activeView != lastActiveView) {
			viewChange = true;
			lastActiveView = activeView;
		} else {
			viewChange = false;
		}
		for (var i = 0; i < panels.length; i++) {
			var diff = activeView - i;
			if (diff >= -1 && diff <= 1) {
				panels[i].center = {
					y : centerY,
					x : pixelOffset - (diff * screenWidth)
				};
				if (viewChange) {
					panels[i].visible = true;
				}
			} else {
				if (viewChange) {
					panels[i].visible = false;
				}
			}
		}

		/* edge issue */
		if (activeView == 0) {// first panel
			panels[panels.length - 1].center = {
				y : centerY,
				x : panels[0].center.x - screenWidth
			};
			if (viewChange) {
				panels[panels.length - 1].visible = true;
			}
		} else if (activeView == (panels.length - 1 )) {// last panel
			panels[0].center = {
				y : centerY,
				x : panels[panels.length - 1].center.x + screenWidth
			};
			if (viewChange) {
				panels[0].visible = true;
			}
		}

	}// end of heading changing

	// Just a container window to hold all these objects
	// user will never know

	/*win.addEventListener('close',closeAR);
	 if (params.maxDistance) {
	 win.maxDistance = params.maxDistance;
	 }
	 */

	setTimeout(showAR, 500);

	$.assignPOIs = function(pois) {
		$.pois = pois;
		// TODO - something here to make sure the pois redraw
		// even if the location doesn't update
	};
	function poiClick(e) {
		Ti.API.debug('heard a click');
		Ti.API.debug('number=' + e.source.number);
		var poi = activePois[e.source.number];
		var view = poi.view;
		$.fireEvent('click', {
			source : poi.view,
			poi : poi
		});
	}

	function locationCallback(e) {
		myLocation = e.coords;
		redrawPois();
	};

	function redrawPois() {
		console.log("==redrawPois");
		if (!myLocation) {
			Ti.API.warn("location not known. Can't draw pois");
			return;
		}
		// remove any existing panels
		for (var i = 0; i < panels.length; i++) {
			panels[i].removeAllChildren();
		}
		console.log("==panels now empty");
		radar.removeAllChildren();

		// Draw the Points of Interest on the panels
		activePois = [];
		if ($ && $.pois) {
			for (var i = 0; i < $.pois.length && i < 12; i++) {
				var poi = $.pois[i];
				if (poi.view) {
					var distance = calculateDistance(myLocation, poi);
					if ($.maxDistance && distance < $.maxDistance) {
						poi.bearing = calculateBearing(myLocation, poi);
						var internalBearing = poi.bearing / (360 / numberOfpanels);
						poi.distance = distance;
						poi.pixelOffset = (internalBearing % 1) * screenWidth + (panels[0].width - screenWidth) / 2;
						poi.activeView = Math.floor(internalBearing) % numberOfpanels;
						activePois.push(poi);
					} else {
						Ti.API.debug(poi.title + " not added, maxDistance=" + $.maxDistance);
					}
				} else
					console.log("pois has no view");

			}
		} else
			console.log("== no pois available");
		// Sort by Distance
		activePois.sort(function(a, b) {
			return b.distance - a.distance;
		});
		if (activePois[0]) {
			console.log("== activePois: " + activePois.length);
			var maxDistance = activePois[0].distance;
			var minDistance = activePois[activePois.length - 1].distance;
			var distanceDelta = maxDistance - minDistance;

			// Add the view
			for (var i = 0; i < activePois.length; i++) {
				var poi = activePois[i];
				if (showColors) {
					Ti.API.debug('viewColor======' + panels[poi.activeView].backgroundColor);
				}
				//    Ti.API.debug('bearing=' + poi.bearing);
				// Calcuate the Scaling (for distance)
				var distanceFromSmallest = poi.distance - minDistance;
				var percentFromSmallest = 1 - (distanceFromSmallest / distanceDelta);
				var zoom = (percentFromSmallest * DELTA_ZOOM) + MIN_ZOOM;
				// Calculate the y (farther away = higher )
				var y = MIN_Y + (percentFromSmallest * DELTA_Y);
				var view = poi.view;
				// Apply the transform
				var transform = Ti.UI.create2DMatrix();
				transform = transform.scale(zoom);
				view.transform = transform;
				//  Ti.API.debug('pixelOffset=' + poi.pixelOffset);
				view.center = {
					x : poi.pixelOffset,
					y : y
				};

				panels[poi.activeView].add(view);
				var nextView;
				var nextOffset;
				if (poi.pixelOffset > (panels[0].width / 2 )) {
					nextView = poi.activeView + 1;
					nextOffset = poi.pixelOffset - screenWidth;
				} else {
					nextView = poi.activeView - 1;
					nextOffset = poi.pixelOffset + screenWidth;
				}

				if (nextView < 0) {
					nextView = panels.length - 1;
				} else if (nextView == panels.length) {
					nextView = 0;
				}

				Ti.API.debug('nextView=' + nextView);
				Ti.API.debug('nextOffset=' + nextOffset);

				/*   clickHandler2.center = {
				x : nextOffset,
				y : y
				};*/
				// panels[nextView].add(clickHandler2);
				// End Click Handlers

				// add to blip to the radar
				// The Radar Blips ....
				/*var rad = toRad(poi.bearing);
				 var relativeDistance = poi.distance / (maxDistance * 1.2);
				 var centerX = (40 + (relativeDistance * 40 * Math.sin(rad)));
				 var centerY = (40 - (relativeDistance * 40 * Math.cos(rad)));
				 var displayBlip = Ti.UI.createView({
				 height : '2dp',
				 width : '2dp',
				 backgroundColor : 'white',
				 borderRadius : 2,
				 top : (centerY - 1) + "dp",
				 left : (centerX - 1) + "dp"
				 });
				 radar.add(displayBlip);*/
			}
		} else
			console.log("no active POI");
	};

	if (params.pois) {
		$.assignPOIs(params.pois);
	}

	return $;

};

function toRad(val) {
	return val * Math.PI / 180;
};

function calculateBearing(point1, point2) {
	var lat1 = toRad(point1.latitude);
	var lat2 = toRad(point2.latitude);
	var dlng = toRad((point2.longitude - point1.longitude));
	var y = Math.sin(dlng) * Math.cos(lat2);
	var x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dlng);
	var brng = Math.atan2(y, x);
	return ((brng * (180 / Math.PI)) + 360) % 360;
};

function calculateDistance(loc1, loc2) {
	var R = 6371;
	// Radius of the earth in km
	var dLat = (toRad(loc2.latitude - loc1.latitude));
	// Javascript functions in radians
	var dLon = (toRad(loc2.longitude - loc1.longitude));
	var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(toRad(loc1.latitude)) * Math.cos(toRad(loc2.latitude)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	// Distance in m
	return R * c * 1000;
};

