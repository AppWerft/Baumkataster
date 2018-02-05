var DBNAME = 'TREESv2';
function capitalizeFirstLetter(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
}

var doImport = function() {
	Log("doImport started");
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
	var DELTA = 0.02;
	var regions = [];
	console.log("DB initiated");
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
	var i = 0;
	function getDataFromWFS() {

		if (i < regions.length - 1) {
			Log(i + " getTrees");
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
					console.log((link.file.size / 1000000).toFixed(3));
					link.close();
				}
				getDataFromWFS();
			});

		} else {

			var link = Ti.Database.open(DBNAME);
			var foo = link.file;
			var bar = Ti.Filesystem.getFile(Ti.Filesystem.externalStorageDirectory, DBNAME);
			bar.write(foo.read());
			link.close();
			console.log("adb pull " + bar.nativePath);
		}
	};

	getDataFromWFS();

};

var isCached = function() {
	return true;
};

var startCaching = function(onStart, onProgress, onCompleted) {
	var test = Ti.Database.open("TEST");
	var filePath = test.file.nativePath.replace("TEST", DBNAME);
	test.close();
	Ti.Filesystem.getFile(filePath).deleteFile();
	var DownLoader = require("dk.napp.downloadmanager");
	DownLoader.cleanUp();
	DownLoader.addEventListener('progress', onProgress);
	DownLoader.addEventListener('started', onStart);
	DownLoader.addEventListener('completed', function() {
		var link = Ti.Database.open(DBNAME);
		link.execute("CREATE INDEX itrees ON trees(sorte_latein)");
		link.execute("CREATE INDEX ispecies ON species(sorte_latein)");
		link.close();
		onCompleted();
	});
	DownLoader.addEventListener('failed', function() {
		alert("Irgend etwas mit dem Internet stimmt nicht.");
	});
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
			var leaf = '/assets/tree_leaves/' + capitalizeFirstLetter(res.fieldByName("art_latein").replace(" x "," ")) + ' 1.png';
			
			trees.push({
				latitude : latitude,
				longitude : longitude,
				baumid : res.fieldByName('baumid'),
				"sorte_latein" : res.fieldByName("sorte_latein") || "",
				"sorte_deutsch" : res.fieldByName("sorte_deutsch") || "",
				"gattung_latein" : res.fieldByName("gattung_latein") || "",
				"gattung_deutsch" : res.fieldByName("gattung_deutsch") || "",
				"art_latein" : res.fieldByName("art_latein") || "",
				leaf : leaf,
				"art_deutsch" : res.fieldByName("art_deutsch") || "",
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
		trees.sort(function(a, b) {
			return a.dist - b.dist;
		});
		Log("stop sort");
		return trees;

	}
};

exports.getGattungen = function() {
	var gattungen = [];
	var link = Ti.Database.open(DBNAME);
	var res = link.execute("SELECT DISTINCT gattung_deutsch,gattung_latein from species WHERE gattung_deutsch is not null");
	while (res.isValidRow()) {
		var gattung = res.fieldByName("gattung_latein");
		var sql = "SELECT count(trees.baumid) total from  species,trees WHERE species.sorte_latein=trees.sorte_latein AND gattung_latein='" + gattung + "'";
		var subres = link.execute(sql);
		var total = subres.fieldByName("total");
		subres.close();
		gattungen.push({
			deutsch : res.fieldByName("gattung_deutsch") || "",
			latein : gattung,
			total : parseInt(total)
		});
		res.next();
	}
	link.close();
	res.close();
	gattungen.sort(function(a, b) {
		return b.total - a.total;
	});
	return gattungen;
};

exports.getSorten = function(gattung) {
	var arten = [];
	var link = Ti.Database.open(DBNAME);
	var res = link.execute('SELECT DISTINCT sorte_deutsch, sorte_latein from species WHERE gattung_latein=?', gattung);
	while (res.isValidRow()) {
		var art = res.fieldByName("sorte_latein");
		var sql = 'SELECT count(trees.baumid) total from species,trees WHERE species.sorte_latein=trees.sorte_latein AND trees.sorte_latein="' + art + '"';
		var subres = link.execute(sql);
		var total = subres.fieldByName("total");
		subres.close();
		arten.push({
			deutsch : res.fieldByName("sorte_deutsch") || "",
			latein : art || "",
			total : parseInt(total)
		});
		res.next();
	}
	res.close();
	link.close();
	arten.sort(function(a, b) {
		return b.total - a.total;
	});
	return arten;
};

exports.getTreesBySort = function(sorte) {
	var trees = [];
	var xmin,
	    ymin,
	    xmax,
	    ymax;
	var link = Ti.Database.open(DBNAME);
	var res = link.execute('SELECT latitude,longitude, strasse || " " || hausnummer adresse,pflanzjahr from trees WHERE sorte_latein="' + sorte + '"');
	var ndx = 0;
	while (res.isValidRow()) {
		var lat = res.field(0, Ti.Database.FIELD_TYPE_DOUBLE);
		var lng = res.field(1, Ti.Database.FIELD_TYPE_DOUBLE);
		if (!ndx) {//initialization
			xmin = xmax = lng;
			ymin = ymax = lat;
		} else {// feeding boundary
			if (lng > xmax)
				xmax = lng;
			if (lng < xmin)
				xmin = lng;
			if (lat > ymax)
				ymax = lat;
			if (lat < ymin)
				ymin = lat;
		}
		trees.push({
			lat : lat,
			lng : lng,
			title : res.field(2, Ti.Database.FIELD_TYPE_STRING),
			subtitle : "Pflanzjahr: " + res.field(3, Ti.Database.FIELD_TYPE_STRING)
		});
		ndx++;
		res.next();
	}
	res.close();
	link.close();
	return {
		trees : trees,
		region : {
			latitude : (ymin + ymax) / 2,
			longitude : (xmin + xmax) / 2,
			latitudeDelta : (ymax - ymin) * 1.2 || 0.05,
			longitudeDelta : (xmax - xmin) * 1.2 || 0.05
		}
	};
};
exports.getTrees = getTrees;
exports.isCached = isCached;
exports.startCaching = startCaching;
exports.doImport = doImport;
