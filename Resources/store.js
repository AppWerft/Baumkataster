var dbFile = (Ti.Platform.name === 'android' && Ti.Filesystem.isExternalStoragePresent()) ? Ti.Filesystem.getFile(Ti.Filesystem.externalStorageDirectory + 'TREES.sqlite') : Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory + 'TREES.sqlite');
dbFile = Ti.Filesystem.getFile(Ti.Filesystem.applicationDataDirectory + 'TREES.sqlite');
var doImport = function() {
	var speciesSQL = "CREATE TABLE IF NOT EXISTS `species` (`sorte_latein` TEXT UNIQUE, `sorte_deutsch` TEXT, `gattung_latein` TEXT,`gattung_deutsch`  TEXT,  `art_latein`  TEXT, `art_deutsch`  TEXT)";
	var treesSQL = "CREATE TABLE IF NOT EXISTS `trees` (`baumid` NUMBER UNIQUE, latitude NUMBER,  longitude NUMBER, `sorte_latein`  TEXT, `kronendurchmesser`  TEXT, `stammumfang`  TEXT, `stand_bearbeitung`  TEXT, `pflanzjahr`  TEXT, `strasse`  TEXT, `hausnummer`  TEXT, `bezirk`  TEXT,`dist` NUMBER)";

	var link = Ti.Database.open("TREES.sqlite");
	if (link) {
		link.execute(speciesSQL);
		link.execute(treesSQL);
	}
	link.close();
	var BB = {
		minx : 53.39760784,
		miny : 9.73143837,
		maxx : 53.72818020,
		maxy : 10.32027293
	};
	var DELTA = 0.012;
	var regions = [];
	for (var x = BB.minx; x < BB.maxx; x += DELTA) {
		for (var y = BB.miny; y < BB.maxy; y += DELTA) {
			regions.push({
				latitude : x + DELTA / 2,
				longitude : y + DELTA / 2,
				latitudeDelta : DELTA,
				longitudeDelta : DELTA,
			});
		}
	}
	function getData() {

		if (i < regions.length - 1) {

			require("getTrees")(regions[i], function(trees) {
				i++;
				console.log(trees.length + "     " + i + "/" + (regions.length - 1));
				var link = Ti.Database.open("TREES.sqlite");
				if (link) {
					link.execute("BEGIN");
					trees.forEach(function(tree) {
						link.execute("INSERT OR REPLACE INTO trees VALUES (?,?,?,?,?,?,?,?,?,?,?,?)", tree.baumid, tree.latitude, tree.longitude, tree["sorte_latein"], tree.kronendurchmesser, tree.stammumfang, tree.stand_bearbeitung, tree.pflanzjahr, tree.strasse, tree.hausnummer, tree.bezirk, tree.dist);
						link.execute("INSERT OR REPLACE INTO species VALUES (?,?,?,?,?,?)", tree["sorte_latein"], tree["sorte_deutsch"], tree["gattung_latein"], tree["gattung_deutsch"], tree["art_latein"], tree["art_deutsch"]);
					});
					link.execute("COMMIT");
					link.close();
				}
			});

			console.log((link.file.size / 1000000).toFixed(3));
		}

		getData();

	};

	var i = 0;
	getData();
	var link = Ti.Database.open("TREES.sqlite");

	var foo = link.file;
	link.close();
	bar = Ti.Filesystem.getFile(Ti.Filesystem.externalStorageDirectory, "TREES.sqlite");
	bar.write(foo.read());
};

var isCached = function() {
	return dbFile.exists();
};

var startCaching = function(onStart, onProgress, onCompleted) {
	var DownLoader = require("dk.napp.downloadmanager");
	DownLoader.cleanUp();
	DownLoader.addEventListener('progress', onProgress);
	DownLoader.addEventListener('started', onStart);
	DownLoader.addEventListener('completed', onCompleted);
	DownLoader.addDownload({
		headers : {
			"Accept-Encoding" : "deflate, gzip;q=1.0, *;q=0.5"
		},
		name : 'Hamburger Bäume',
		url : 'https://github.com/AppWerft/Baumkataster/blob/master/TREES.sqlite?raw=true&zuf=' + Math.random(),
		filePath : dbFile.nativePath,
		priority : DownLoader.DOWNLOAD_PRIORITY_NORMAL
	});
};

var getTrees = function(region, cb) {
	if (isCached()) {
		var trees;
		var link = Ti.Database.open("TREES.sqlite");
		var res = link.execute("SELECT species.*,trees.* FROM species, trees WHERE trees.sorte_latein = species.sorte_latein AND trees.latitude");
		while (res.isValidRow()) {
			trees.push({
				baumid : res.fieldByName('baumid')
			});
			res.next();
		}
		res.close();
		link.close();
	} else {
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
	}
};

exports.getTrees = getTrees;
exports.isCached = isCached;
exports.startCaching = startCaching;
exports.doImport = doImport;
