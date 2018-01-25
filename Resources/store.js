var speciesSQL = "CREATE TABLE IF NOT EXISTS `species` (`sorte_latein` TEXT UNIQUE, `sorte_deutsch` TEXT, `gattung_latein` TEXT,`gattung_deutsch`  TEXT,  `art_latein`  TEXT, `art_deutsch`  TEXT)";
var treesSQL = "CREATE TABLE IF NOT EXISTS `trees` (`baumid` NUMBER UNIQUE, latitude NUMBER,  longitude NUMBER, `sorte_latein`  TEXT, `kronendurchmesser`  TEXT, `stammumfang`  TEXT, `stand_bearbeitung`  TEXT, `pflanzjahr`  TEXT, `strasse`  TEXT, `hausnummer`  TEXT, `bezirk`  TEXT,`dist` NUMBER)";

var link = Ti.Database.open("TREES.sqlite");
if (link) {
	link.execute(speciesSQL);
	link.execute(treesSQL);
}
link.close();

module.exports = function() {
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
			if (i < 1080) {
				i++;
				getData();
				return;
			}
			require("getTrees")(regions[i], function(trees) {
				i++;
				console.log(trees.length + "     " + i + "/" + (regions.length - 1));

				var link = Ti.Database.open("TREES.sqlite");
				var species = {};
				if (link) {
					link.execute("BEGIN TRANSACTION");
					trees.forEach(function(tree) {
						link.execute("INSERT OR REPLACE INTO trees VALUES (?,?,?,?,?,?,?,?,?,?,?,?)", tree.baumid, tree.latitude, tree.longitude, tree["sorte_latein"], tree.kronendurchmesser, tree.stammumfang, tree.stand_bearbeitung, tree.pflanzjahr, tree.strasse, tree.hausnummer, tree.bezirk, tree.dist);
					});
					link.execute("COMMIT");
					link.execute("BEGIN TRANSACTION");
					trees.forEach(function(tree) {
						if (!species["sorte_latein"]) {
							link.execute("INSERT OR REPLACE INTO species VALUES (?,?,?,?,?,?)", tree["sorte_latein"], tree["sorte_deutsch"], tree["gattung_latein"], tree["gattung_deutsch"], tree["art_latein"], tree["art_deutsch"]);
							species["sorte_latein"] = 1;
						}
					});
					link.execute("COMMIT");

					console.log((link.file.size / 1000000).toFixed(3) );
				}
				link.close();
				getData();
			});
		}
	}

	var i = 0;
	//getData();
	var link = Ti.Database.open("TREES.sqlite");

	var foo = link.file;
	bar = Ti.Filesystem.getFile(Ti.Filesystem.externalStorageDirectory, "TREES.sqlite");
	bar.write(foo.read());

	link.close();
	console.log(foo.nativePath);
	console.log(bar.nativePath);
};
