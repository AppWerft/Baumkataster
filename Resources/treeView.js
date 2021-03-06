module.exports = function(t) {
	var $ = Ti.UI.createView({
		width : 140,
		height : 130,
		borderRadius : 3,
		backgroundColor : "transparent"
	});
	$.add(Ti.UI.createImageView({
		image : "/assets/images/tree.png",
		height : 100,
		width : 60,
		opacity : 1,
		top : 0
	}));
	$.add(Ti.UI.createLabel({
		bottom : 0,
		color : 'white',
		width : Ti.UI.FILL,
		textAlign : 'center',
		backgroundColor : BLUE,
		text : t["sorte_latein"]+ "\n"+ t.strasse,
		zIndex : 9999,
		font : {
			fontSize : 12
		}
	}));
	return $;
};

