module.exports = function(region, cb) {
	var WFS = require("ti.wfs").createWFS("https://geodienste.hamburg.de/HH_WFS_Strassenbaumkataster", "2.0.0");

	WFS.getFeature({
		region : region,
		typeNames : "app:strassenbaumkataster",
		limit : 2000
	}, function(e) {
		var trees = e.data["wfs:FeatureCollection"]["wfs:member"];
		if (!trees) {
			cb([]);
			return;
		}
		if (!trees.list)
			trees.list = [trees];
		var mytrees = trees.list.map(function(tree) {
			var t = tree["app:strassenbaumkataster"];
			var latitude = t["app:geom"]["gml:Point"]["gml:pos"].split(" ")[0];
			var longitude = t["app:geom"]["gml:Point"]["gml:pos"].split(" ")[1];
			
			var ret = {
				"baumid" : t["gml:id"].split("_")[2],
				"gattung_latein" : t["app:gattung_latein"],
				"gattung_deutsch" : t["app:gattung_deutsch"],
				"art_latein" : t["app:art_latein"],
				"art_latein" : t["app:art_latein"],
				"sorte_latein" : t["app:sorte_latein"],
				"sorte_deutsch" : t["app:sorte_deutsch"],
				"stand_bearbeitung" : t["app:stand_bearbeitung"] || "",
				kronendurchmesser : t["app:kronendmzahl"] || "",
				stammumfang : t["app:stammumfangzahl"] || "",
				strasse : t["app:strasse"] || "",
				hausnummer : t["app:hausnummer"] || "",
				
				bezirk : t["app:bezirk"] || "",
				latitude : latitude,
				longitude : longitude,
				hausnummer : t["app:hausnummer"] || "",
				pflanzjahr : t["app:pflanzjahr"] || "",
				dist : parseFloat(require("geodist")(latitude, longitude, region.latitude, region.longitude))
			};
			
			return ret;
		});
		mytrees.sort(function(a, b) {
			return a.dist - b.dist;
		});
		cb(mytrees);
	});
};
