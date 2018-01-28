module.exports = function(_event) {
	if (Ti.Platform.osname == 'android') {
		
		var activity = _event.source.getActivity();
		if (activity) {
			activity.onCreateOptionsMenu = function(_menuevent) {
				_menuevent.menu.clear();
				var item = _menuevent.menu.add({
					title : 'Reload',
					showAsAction : Ti.Android.SHOW_AS_ACTION_IF_ROOM,
					icon : "/assets/images/reload.png"
				});
			//	item.addEventListener("click", _event.source.updateListAndMap);

			};
			activity.invalidateOptionsMenu();
		}
	}
};
