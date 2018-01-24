module.exports = function(win) {
	var $ = Ti.UI.createView();
	var Map = require("ti.map");

	var mapView = Map.createView({
		bottom : 0,
		userLocation : Ti.Geolocation.locationServicesEnabled ? true : false,
		region : {
			latitude : 53.5535071,
			longitude : 9.9899668,
			latitudeDelta : 0.08,
			longitudeDelta : 0.08
		},
		mapType : Map.NORMAL_TYPE,
		mapToolbarEnabled : false,
		mapStyle : Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory, "model", "mapstyle.json").read().getText(),
		lifecycleContainer : win,
		enableZoomControls : false
	});
	var marker = Map.createAnnotation({
		latitude : 53.0,
		longitude : 10.0,
		image : "/assets/images/null.png",
		title : "Lade …"
	});
	mapView.addAnnotation(marker);
	mapView.addEventListener("complete", function() {
		//https://map1.hamburg.de/geowebcache/service/wms?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&FORMAT=image/png&TRANSPARENT=true&t=299&zufall=0.6604606208700923&LAYERS=geobasisdaten&WIDTH=256&HEIGHT=256&SRS=EPSG:25832&STYLES=&BBOX=570138.5979038238,5932274.600098383,571493.2638389709,5933629.266033529
		mapView.addTileOverlay(Map.createTileOverlay({
			type : Map.TYPE_TMS,
			zIndex : 10,
			tileProvider : "OpenSeaMap"
		}));
		mapView.addTileOverlay(Map.createTileOverlay({
			type : Map.TYPE_WMS,
			url : "https://geodienste.hamburg.de/HH_WMS_Strassenbaumkataster",
			layer : "strassenbaum_hpa",
			zIndex : 99,
			version : "1.3.0",
		}));
		mapView.addTileOverlay(Map.createTileOverlay({
			type : Map.TYPE_WMS,
			url : "http://geodienste.hamburg.de/HH_WMS_Strassenbaumkataster",
			layer : "strassenbaum",
			zIndex : 99,
			version : "1.3.0",
		}));

		mapView.addEventListener("mapclick", function(e) {
			marker.latitude = e.latitude;
			marker.longitude = e.longitude;
			marker.title = " Lade … ";
			marker.subtitle = "";

			mapView.selectAnnotation(marker);
			require("getTrees")({
				latitude : e.latitude,
				longitude : e.longitude,
				latitudeDelta : 0.001,
				longitudeDelta : 0.001
			}, function(res) {
				if (!res) {
					mapView.deselectAnnotation(marker);
					return;
				}
				console.log(res.length);
				marker.title = res[0]["sorte_latein"];
				marker.subtitle = res[0]["sorte_deutsch"];

				marker.latitude = res[0].latitude;
				marker.longitude = res[0].longitude;
			});
		});

	});
	$.add(mapView);
	return $;
};
