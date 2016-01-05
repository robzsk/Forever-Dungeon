'use strict';
var app = require('app'),
	BrowserWindow = require('browser-window'),
	client = require('electron-connect').client;

app.on('ready', function (n) {
	var mainWindow = new BrowserWindow({
		// frame: false,
		// toolbar: false,
		// 'accept-first-mouse': true,
		transparent: true,
		// 'skip-taskbar': true,
		'auto-hide-menu-bar': true,
		'enable-larger-than-screen': true,
		// width: 1200,
		// height: 900
		width: 800,
		height: 600
	});
	// mainWindow.setMenuBarVisibility(false);
	// mainWindow.setAutoHideMenuBar(true);
	// mainWindow.setFullScreen(true);
	mainWindow.loadUrl('file://' + __dirname + '/index.html');
	client.create(mainWindow);
});
