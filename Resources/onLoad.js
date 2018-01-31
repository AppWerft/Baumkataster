module.exports = function(_event) {
	if (Ti.Platform.osname == 'android') {
		
		Abar.backgroundColor = RED;
		Abar.statusbarColor = BLUE;
		Abar.title = "Hamburger Baumkataster";
		Abar.subtitle = "Dein Standort ist noch unklar.";
		var activity = _event.source.getActivity();
		if (activity) {
			activity.onCreateOptionsMenu = function(_menuevent) {
				return;
				_menuevent.menu.clear();
				var item = _menuevent.menu.add({
					title : 'Reload',
					showAsAction : Ti.Android.SHOW_AS_ACTION_IF_ROOM,
					icon : "/assets/images/reload.png"
				});
				item.addEventListener("click", updateListAndMap);

			};
			activity.invalidateOptionsMenu();
		}
	}
};
