module.exports = function() {
	var $ = Ti.UI.createTableView({
		backgroundColor : BLUE,
		data : require("store").getGattungen().map(function(g) {
			var row = Ti.UI.createTableViewRow({
				height : Ti.UI.SIZE,
				backgroundColor : "white",
				layout : "vertical",
				itemId: g.latein
			});
			row.add(Ti.UI.createLabel({
				text : g.deutsch,
				touchEnabled:false,
				font : {
					fontSize : 24,
					fontWeight : 'bold'
				},
				color : BLUE,
				top : 5,
				left : 10,
				textAlign : "left",
				height : Ti.UI.SIZE
			}));
			row.add(Ti.UI.createLabel({
				text : g.latein,
				touchEnabled:false,
				font : {
					fontSize : 18,
					fontStyle : 'italic'
				},
				color : '#444',
				top : 0,
				left : 10,
				textAlign : "left",
				height : Ti.UI.SIZE
			}));
			row.add(Ti.UI.createLabel({
				text : "Exemplare: " +g.total,
				font : {
					fontSize : 12,
		
				},
				touchEnabled:false,
				color : '#444',
				top : 5,bottom:5,
				left : 10,
				textAlign : "left",
				height : Ti.UI.SIZE
			}));
			return row;
		})
	});
	$.addEventListener("click",function(e) {
		require("dbarten")(e.source.itemId).open();
	});
	return $;
};
