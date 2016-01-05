'use strict';

var gamepads = require('./gamepads'),
	util = require('util'),
	EventEmitter = require('events').EventEmitter,
	Stats = require('stats.js');

module.exports = function () {
	const stats = function () {
		var s = {begin: function () {},end: function () {}};

		if (typeof Stats !== 'undefined') {
			s = new Stats();
			s.setMode(0);
			s.domElement.style.position = 'absolute';
			s.domElement.style.left = '0px';
			s.domElement.style.top = '0px';
			document.body.appendChild(s.domElement);
		}
		return s;
	}();

	var timestamp = function () {
		return window.performance && window.performance.now ? window.performance.now() : new Date().getTime();
	};

	var loop,
		paused = false,
		step = 1 / 60,
		dt = 0,
		now,
		last = timestamp(),
		ticks = 0;

	var Loop = function () {
		EventEmitter.call(this);
		this.reset = function () {
			ticks = 0;
		};
	};
	util.inherits(Loop, EventEmitter);
	loop = new Loop();

	+function run () {
		gamepads.update();
		requestAnimationFrame(run);
		stats.begin();
		now = timestamp();
		dt = now - last;
		last = now;
		loop.emit('loop.update', ticks, step);
		loop.emit('loop.render', dt);
		ticks += 1;
		stats.end();
	}();

	return loop;
}();
