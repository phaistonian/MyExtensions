//var xhr = new XMLHttpRequest();
//xhr.open('GET', 'http://chrome.dev.pathfinder.gr/test.php', true);
//xhr.send(null);
//new Ext.Notification('once upon a time there was bla');
Ext.initialize();

if (Ext.options) {
	Ext.timer = Ext.update.delay(parseInt(Ext.options.interval) * 1000 * 60, Ext);
}

// BG is already processed.
// Used for desktop notifications
Ext.bgDone = true;

Ajax.setOptions({
	'timeout'	: 30,
	'onTimeout'	: function() {
		alert('There seems to be a network problem at this moment. Aborting all running network operations.');
	}
})

chrome.extension.onRequest.addListener(function(req, sender, sendResponse) {
	// Handle updates
	if (req['bg.reload']) {
		//Ext.extensions	= localStorage['data'] ? JSON.parse(localStorage['data']) : {};
		//Ext.options		= localStorage['options'] ? JSON.parse(localStorage['options']) : { 'notify' : { 'comments': true, 'ratings' : true}};
		Ext.initialize();
	}

	if (req['bg.update']) {
		Ext.update();
	}

	if (req['bg.interval']) {
		if (Ext.timer) {
			clearTimeout(Ext.timer);
		}

		Ext.options = JSON.parse(localStorage['options']);
		if (parseInt(Ext.options.timer) === -1)  {
			return this;
		}

		//Ext.load();
		//console.log(Ext.options.interval)
		Ext.timer = Ext.update.delay(parseInt(Ext.options.interval) * 1000 * 60, Ext);
	}

	// Check if url matches an extensions page.
	// If so, initialize comment counters.
	if (req['href']) {
		Ext.scanURL(req['href']);
	}
});