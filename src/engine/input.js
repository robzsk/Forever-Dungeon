'use strict';

var $ = require('jquery');
var _ = require('underscore');
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var gamepads = require('./gamepads');

var applyDeadzone = function (number, threshold) {
	var percentage = (Math.abs(number) - threshold) / (1 - threshold);
	if (percentage < 0) {
		percentage = 0;
	}
	return percentage * (number > 0 ? 1 : -1);
};

var ReplayInput = function (file) {
	var moves = file ? JSON.parse(file) : [];
	var self = this;

	EventEmitter.call(this);

	this.update = function (tick) {
		var m = moves[tick.toString()];
		if (m) {
			self.emit('input.move', _.clone(m));
		}
	};

	this.serialize = function () {
		return JSON.stringify(moves);
	};

};
util.inherits(ReplayInput, EventEmitter);

var GamepadInput = function (index, buttons) {
	var current = _.mapObject(buttons, function () { return false; });
	var prev = _.clone(current);
	var self = this;

	EventEmitter.call(this);

	this.update = function (tick) {
		var pad = gamepads.get(index);
		var joystickX;
		var joystickY;
		if (pad) {
			_.each(buttons, function (button, action) {
				current[action] = pad.buttons[button].pressed;
			});
			var jX = applyDeadzone(pad.axes[0], 0.25);
			var jY = applyDeadzone(pad.axes[1], 0.25);

			// if (jX !== 0 || jY !== 0) {
			self.emit('gamepad.axis', jX, jY);
		// }
		}
		if (!_.isMatch(current, prev)) {
			self.emit('input.move', _.clone(current));
			_.extend(prev, current); // copy
		}
	};
};
util.inherits(GamepadInput, EventEmitter);

var KeyboardInput = function (keys) {
	var current = _.mapObject(keys, function () { return false; });
	var prev = _.clone(current);
	var self = this;

	EventEmitter.call(this);

	var onkey = function (ev, kc, down) {
		_.findKey(keys, function (v, k) {
			if (v === kc) {
				current[k] = down;
				ev.preventDefault();
				return true;
			}
		});
	};

	$(document.body).on('keydown', function (ev) { return onkey(ev, ev.keyCode, true); });
	document.body.addEventListener('keyup', function (ev) { return onkey(ev, ev.keyCode, false); });

	this.update = function (tick) {
		if (!_.isMatch(current, prev)) {
			self.emit('input.move', _.clone(current));
			_.extend(prev, current); // copy
		}
	};
};
util.inherits(KeyboardInput, EventEmitter);

// this class allows for dual gamepad and keyboard configuration of the same player at the same time
var UserInput = function (config) {
	// TODO: check for config.keys and config.buttons alignment(they need to have the same properties)
	var current = _.mapObject(config.keys || config.buttons, function () { return false; });
	var prev = _.clone(current);
	var moves = {};
	var self = this;
	var gamepad;
	var keyboard;

	// not recording gamepad axis
	var handleInput = function (m) {
		current = _.clone(m);
	};

	EventEmitter.call(this);

	if (typeof config.gamepad === 'object') {
		gamepad = new GamepadInput(config.gamepad.index, config.buttons);
		gamepad.on('input.move', handleInput);

		// gamepad axis is not recorded in replays
		gamepad.on('gamepad.axis', function (x, y) {
			self.emit('gamepad.axis', x, y);
		});
	}
	if (typeof config.keys === 'object') {
		keyboard = new KeyboardInput(config.keys);
		keyboard.on('input.move', handleInput);
	}

	this.reset = function () {
		moves = {};
		self.removeAllListeners('input.move');
		self.removeAllListeners('gamepad.axis');
	};

	this.serialize = function () {
		return JSON.stringify(moves);
	};

	this.update = function (tick) {
		if (gamepad) {
			gamepad.update(tick);
		}
		if (keyboard) {
			keyboard.update(tick);
		}

		if (!_.isMatch(current, prev)) {
			moves[tick.toString()] = _.clone(current);
			_.extend(prev, current); // copy
			self.emit('input.move', _.clone(current));
		}
	};

};

util.inherits(UserInput, EventEmitter);

module.exports = function (config) {
	config = config || {};
	if (typeof config.replay === 'object') {
		return new ReplayInput(config.replay);
	} else {
		return new UserInput(config);
	}
};
