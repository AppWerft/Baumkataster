module.exports = function(tree) {
	console.log(tree.leaf);
	var row = Ti.UI.createTableViewRow({
		height : 120,
		backgroundColor : 'white'
	});
	row.add(Ti.UI.createLabel({
		left : 60,
		top : 5,right:10,
		color : BLUE,
		font : {
			fontSize : 20,
			fontWeight : 'bold'
		},
		text : tree["sorte_latein"]
	}));
	row.add(Ti.UI.createLabel({
		left : 60,
		top : 55,
		color : "black",
		font : {
			fontSize : 14,
		},
		text : "∅ Krone/Stamm:  " + tree.kronendurchmesser + "/" + tree.stammumfang
	}));
	row.add(Ti.UI.createLabel({
		right : 5,
		bottom : 0,
		color : "#000",
		opacity: 0.5,
		height: 50,
		font : {
			fontSize : 27,
			fontWeight : 'bold'

		},
		text : Math.round(tree.dist) + "m"
	}));
	row.add(Ti.UI.createLabel({
		left : 60,
		top : 75,
		color : "black",
		font : {
			fontSize : 14,

		},
		text : "Standort: " + tree.strasse + " " + tree.hausnummer
	}));
	row.add(Ti.UI.createLabel({
		left : 60,
		top : 95,
		color : "black",
		font : {
			fontSize : 14,
		},
		text : "Pflanzjahr: " + tree.pflanzjahr
	}));
	row.add(Ti.UI.createImageView({
		left : 5,
		top : 5,
		image : tree.leaf,
		width : 45,
		height : Ti.UI.SIZE,
		opacity : 0.5
	}));
	return row;
};
