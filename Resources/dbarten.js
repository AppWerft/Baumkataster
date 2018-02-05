module.exports = function(gattung) {
	var win = Ti.UI.createWindow();
	var $ = Ti.UI.createTableView({
		backgroundColor : BLUE,

	});
	win.add($);
	win.addEventListener("open", function(_event) {
		$.setData(require("store").getSorten(gattung).map(function(art) {
			var row = Ti.UI.createTableViewRow({
				height : Ti.UI.SIZE,
				backgroundColor : "white",
				layout : "vertical",
				sorte_latein : art.latein,
				subtitle : art.deutsch
			});
			row.add(Ti.UI.createLabel({
				text : art.deutsch,
				font : {
					fontSize : 24,
					fontWeight : 'bold'
				},
				color : BLUE,
				top : 5,
				touchEnabled : false,
				left : 10,
				textAlign : "left",
				height : Ti.UI.SIZE
			}));
			row.add(Ti.UI.createLabel({
				text : art.latein,
				font : {
					fontSize : 18,
					fontStyle : 'italic'
				},
				color : '#444',
				top : 0,
				left : 10,
				touchEnabled : false,
				textAlign : "left",
				height : Ti.UI.SIZE
			}));
			row.add(Ti.UI.createLabel({
				text : "Exemplare: " + (art.total || ""),
				font : {
					fontSize : 12,
				},
				color : '#444',
				top : 0,
				bottom : 5,
				left : 10,
				touchEnabled : false,
				textAlign : "left",
				height : Ti.UI.SIZE
			}));
			return row;
		}));

		Abar.backgroundColor = RED;
		Abar.statusbarColor = BLUE;
		Abar.title = "Hamburger Baumkataster";
		Abar.subtitle = gattung;
		var activity = _event.source.getActivity();
		if (activity) {
			activity.actionBar.displayHomeAsUp = true;
			activity.actionBar.onHomeIconItemSelected = function() {
				win.close();
			};
			activity.onCreateOptionsMenu = function(_menuevent) {
			};
			activity.invalidateOptionsMenu();
		}
	});
	$.addEventListener("click", function(e) {
		var data = e.rowData;
		require("mapViewTree")({
			"sorte_latein" : data["sorte_latein"],
			"subtitle" : data.subtitle
		}).open();
	});
	return win;
};
