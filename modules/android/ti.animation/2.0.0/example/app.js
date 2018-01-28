var TiAnimation = require('ti.animation');
var isAndroid = (Ti.Platform.osname == 'android');

var win = Ti.UI.createWindow({
	backgroundColor: '#fff',
	title: 'Ti.Animation Demo',
	fullscreen: true
});

var lbl = Ti.UI.createLabel({
	bottom: 50,
	color: "#000",
	textAlign: Ti.UI.TEXT_ALIGNMENT_CENTER,
	font: {
		fontSize: 12
	}
});

var offset = 0;

var view = TiAnimation.createLottieView({
	file: 'sample_lottie.json',
	loop: false,
	bottom: 300,
	height: 120,
	width: 120,
	borderRadius: 60,
	autoStart: false,
	update: onUpdate
});

var view2 = TiAnimation.createLottieView({
	file: 'sample_lottie.json',
	loop: false,
	bottom: 200,
	height: 120,
	width: 120,
	borderRadius: 60,
	autoStart: true,
	speed: 2,
	loop: true
});

var slider = Ti.UI.createSlider({
	value: 0,
	min: 0,
	max: 1,
	bottom: 10,
	width: 300
});

slider.addEventListener('change', seekToProgress);

win.add(view);
win.add(view2);
win.add(lbl);

win.add(createButtonWithAction('Start animation', startAnimation));
win.add(createButtonWithAction('Pause animation', pauseAnimation));
win.add(createButtonWithAction('Resume animation', resumeAnimation));
win.add(createButtonWithAction('Double speed', doubleSpeed));

function onOpen(e) {
	var dur = (isAndroid) ? view.getDuration() : (Math.floor(view.getDuration() * 1000));
	lbl.text = "Lottie: Duration: " + dur + "ms\n";
}

function onUpdate(e) {
	slider.setValue(e.percentage);
}

win.addEventListener("open", onOpen);
win.add(slider);

if (isAndroid) {
	win.open();
} else {
	var nav = Ti.UI.iOS.createNavigationWindow({
		window: win
	});
	nav.open();
}

var isDouble = false;
function doubleSpeed(e) {
	if (isDouble){
		e.source.title = "Double speed";
		view.setSpeed(1);
	} else {
		e.source.title = "Normal speed";
		view.setSpeed(2);
	}
	isDouble = !isDouble;
}

function seekToProgress(e) {
	view.setProgress(e.value);
}

function createButtonWithAction(title, action) {
	var btn = Ti.UI.createButton({
		title: title,
		top: offset,
		height: 35,
		width: 200,
		borderRadius: 4,
		borderWidth: 1,
		borderColor: "#000",
		color: "#000",
		backgroundColor: "#fff"
	});

	btn.addEventListener('click', action);

	offset += 38;
	return btn;
}

function startAnimation() {
	view.start();
}

function pauseAnimation() {
	view.pause();
}

function resumeAnimation() {
	view.resume();
}
