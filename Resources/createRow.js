module.exports = function(tree) {
	var row = Ti.UI.createTableViewRow({
		height : 100,
		backgroundColor : 'white'
	});
	row.add(Ti.UI.createLabel({
		left : 10,
		top : 5,
		color : BLUE,
		font : {
			fontSize : 22,
			fontWeight : 'bold'
		},
		text : tree["sorte_latein"]
	}));
	row.add(Ti.UI.createLabel({
		left : 10,
		top : 35,
		color : "black",
		font : {
			fontSize : 14,
		},
		text : "∅ Krone/Stamm:  " + tree.kronendurchmesser + "/" + tree.stammumfang 
	}));
	row.add(Ti.UI.createLabel({
		right : 5,
		bottom : 5,
		color : "#bbb",
		font : {
			fontSize : 32,
			fontWeight : 'bold'

		},
		text : Math.round(tree.dist) + "m"
	}));
	row.add(Ti.UI.createLabel({
		left : 10,
		top : 55,
		color : "black",
		font : {
			fontSize : 14,

		},
		text : "Standort: " +tree.strasse + " " + tree.hausnummer
	}));
	row.add(Ti.UI.createLabel({
		left : 10,
		top : 75,
		color : "black",
		font : {
			fontSize : 14,
		},
		text : "Pflanzjahr: " + tree.pflanzjahr
	}));
	return row;
};
