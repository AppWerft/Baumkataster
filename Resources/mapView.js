module.exports = function() {
	var $ = Ti.UI.createView({
		backgroundColor : BLUE
	});
	var Map = require("ti.map");

	var mapView = Map.createView({
		bottom : 0,
		userLocation : Ti.Geolocation.locationServicesEnabled ? true : false,
		region : {
			latitude : 53.5535071,
			longitude : 9.9899668,
			latitudeDelta : 0.01,
			longitudeDelta : 0.01
		},
		mapType : Map.NORMAL_TYPE,
		mapToolbarEnabled : false,
		mapStyle : Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory, "model", "mapstyle.json").read().getText(),

		enableZoomControls : false
	});
	var marker = Map.createAnnotation({
		latitude : 53.0,
		longitude : 10.0,
		image : "/assets/images/null.png",
		title : "Lade …",
		rightButton : "/assets/wiki.png"
	});
	mapView.addAnnotation(marker);
	mapView.addEventListener("complete", function() {
		//https://map1.hamburg.de/geowebcache/service/wms?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&FORMAT=image/png&TRANSPARENT=true&t=299&zufall=0.6604606208700923&LAYERS=geobasisdaten&WIDTH=256&HEIGHT=256&SRS=EPSG:25832&STYLES=&BBOX=570138.5979038238,5932274.600098383,571493.2638389709,5933629.266033529
		//http://geodienste.hamburg.de/HH_WMS_Cache?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetCapabilities
		mapView.addTileOverlay(Map.createTileOverlay({
			type : Map.TYPE_TMS,
			zIndex : 10,
			tileProvider : "OpenSeaMap"
		}));
		mapView.addTileOverlay(Map.createTileOverlay({
			type : Map.TYPE_WMS,
			url : "http://geodienste.hamburg.de/HH_WMS_Cache",
			layer : "strassenbaum",
			zIndex : 99,
			version : "1.1.1",
		}));
		/*mapView.addTileOverlay(Map.createTileOverlay({
		 type : Map.TYPE_WMS,
		 url : "http://geodienste.hamburg.de/HH_WMS_Strassenbaumkataster",
		 layer : "strassenbaum_hpa",
		 zIndex : 99,
		 version : "1.3.0",
		 }));
		 */
		mapView.addEventListener("click", function(e) {
			console.log(e.clicksource);
			if (e.clicksource == "rightPane" && e.annotation && e.annotation.species) {
				require("wiki.window")(e.annotation.species.replace("europea", "europaea").replace(" x "," × ")).open();
			}
		});
		mapView.addEventListener("mapclick", function(e) {
			marker.latitude = e.latitude;
			marker.longitude = e.longitude;
			marker.title = " Lade … ";

			marker.subtitle = "";
			Log("mapclick");
			var trees = require("store").getNearestTree(e.latitude, e.longitude);

			if (!trees || !trees[0]) {
				mapView.deselectAnnotation(marker);
				Ti.UI.createNotification({
					message : "Für diesen Standort gibt es leider keine Bauminformationen."
				}).show();
				return;
			}
			var tree = trees[0];
			Log("found tree nearby " + tree.leaf);
			marker.title = tree["sorte_latein"];
			marker.subtitle = tree["sorte_deutsch"] + " (" + tree.pflanzjahr + ")";
			marker.latitude = tree.latitude;
			marker.longitude = tree.longitude;
			marker.leftButton = tree.leaf;
			marker.species = tree["art_latein"], mapView.selectAnnotation(marker);
		});

	});
	$.add(mapView);
	return $;
};
