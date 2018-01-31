var DBNAME = 'TREES';

var doImport = function() {
	var speciesSQL = "CREATE TABLE IF NOT EXISTS `species` (`sorte_latein` TEXT UNIQUE, `sorte_deutsch` TEXT, `gattung_latein` TEXT,`gattung_deutsch`  TEXT,  `art_latein`  TEXT, `art_deutsch`  TEXT)";
	var treesSQL = "CREATE TABLE IF NOT EXISTS `trees` (`baumid` NUMBER UNIQUE, latitude NUMBER,  longitude NUMBER, `sorte_latein`  TEXT, `kronendurchmesser`  TEXT, `stammumfang`  TEXT, `stand_bearbeitung`  TEXT, `pflanzjahr`  TEXT, `strasse`  TEXT, `hausnummer`  TEXT, `bezirk`  TEXT,`dist` NUMBER)";

	var link = Ti.Database.open(DBNAME);
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
				var link = Ti.Database.open(DBNAME);
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
	var link = Ti.Database.open(DBNAME);

	var foo = link.file;
	link.close();
	bar = Ti.Filesystem.getFile(Ti.Filesystem.externalStorageDirectory, "TREES.sqlite");
	bar.write(foo.read());
};

var isCached = function() {
	return true;
};

var startCaching = function(onStart, onProgress, onCompleted) {
	var test = Ti.Database.open("TEST");
	var filePath = test.file.nativePath.replace("TEST", DBNAME);
	console.log(filePath);
	test.close();
	var DownLoader = require("dk.napp.downloadmanager");
	DownLoader.cleanUp();
	DownLoader.addEventListener('progress', onProgress);
	DownLoader.addEventListener('started', onStart);
	DownLoader.addEventListener('completed', onCompleted);
	DownLoader.addEventListener('failed',function(){
		alert("Irgendetwas mit dem Internet stimmt nicht.");
	} );
	DownLoader.addDownload({
		headers : {
			"Accept-Encoding" : "deflate, gzip;q=1.0, *;q=0.5"
		},
		name : 'Hamburger Bäume',
		url : 'https://github.com/AppWerft/Baumkataster/blob/master/TREES.sqlite?raw=true&zuf=' + Math.random(),
		filePath : filePath,
		priority : DownLoader.DOWNLOAD_PRIORITY_NORMAL
	});

};

var getTrees = function(region, cb) {
	if (isCached()) {
		var trees = [];
		var d = parseFloat(region.latitudeDelta) / 2;
		var lat = parseFloat(region.latitude);
		var lon = parseFloat(region.longitude);
		var sql = "SELECT species.*,trees.* FROM species, trees WHERE trees.sorte_latein = species.sorte_latein AND " + "trees.latitude>" + (lat - d) + " AND trees.latitude<" + (lat + d) + " AND trees.longitude>" + (lon - d) + " AND trees.longitude<" + (lon + d);
	//	console.log(sql);
	Log("Start DB");
		var link = Ti.Database.open(DBNAME);
		var res = link.execute(sql);
		link.close();
		Log("stop DB");
		while (res.isValidRow()) {
			var latitude = res.fieldByName('latitude');
			var longitude = res.fieldByName('longitude');
			trees.push({
				latitude: latitude,
				longitude: longitude,
				baumid : res.fieldByName('baumid'),
				"sorte_latein" : res.fieldByName("sorte_latein")|| "",
				"sorte_deutsch" : res.fieldByName("sorte_deutsch")|| "",
				"gattung_latein" : res.fieldByName("gattung_latein")|| "",
				"gattung_deutsch" : res.fieldByName("gattung_deutsch")|| "",
				"art_latein" : res.fieldByName("sorte_latein")|| "",
				"art_deutsch" : res.fieldByName("sorte_deutsch")|| "",
				kronendurchmesser : res.fieldByName("kronendurchmesser") || "",
				stammumfang : res.fieldByName("stammumfang") || "",
				strasse : res.fieldByName("strasse") || "",
				hausnummer : res.fieldByName("hausnummer") || "",
				bezirk : res.fieldByName("bezirk") || "",
				pflanzjahr : res.fieldByName("pflanzjahr") || "",
				dist : parseFloat(require("geodist")(latitude, longitude, region.latitude, region.longitude))
			});
			res.next();
		}
		res.close();
		Log("stop cursor");
		trees.sort(function(a, b) {
			return a.dist - b.dist;
		});
		Log("stop sort");
		return trees;

	}
};

exports.getTrees = getTrees;
exports.isCached = isCached;
exports.startCaching = startCaching;
exports.doImport = doImport;
