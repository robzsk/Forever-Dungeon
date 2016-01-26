'use strict';

var $ = require('jquery'),
	_ = require('underscore'),
	util = require('util'),
	EventEmitter = require('events').EventEmitter,
	gamepads = require('./gamepads');

var ReplayInput = function (file) {
	var moves = file ? JSON.parse(file) : [], self = this;

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
	var current = _.mapObject(buttons, function () { return false; }),
		prev = _.clone(current), self = this;

	EventEmitter.call(this);

	this.update = function (tick) {
		var pad = gamepads.get(index);
		if (pad) {
			_.each(buttons, function (button, action) {
				current[action] = pad.buttons[button].pressed;
			});
		}
		if (!_.isMatch(current, prev)) {
			self.emit('input.move', _.clone(current));
			_.extend(prev, current); // copy
		}
	};
};
util.inherits(GamepadInput, EventEmitter);

var KeyboardInput = function (keys) {
	var current = _.mapObject(keys, function () { return false; }),
		prev = _.clone(current), self = this;

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
	var current = _.mapObject(config.keys || config.buttons, function () { return false; }),
		prev = _.clone(current), moves = {}, self = this, gamepad, keyboard;

	var handleInput = function (m) {
		current = _.clone(m);
	};

	EventEmitter.call(this);

	if (typeof config.gamepad === 'object') {
		gamepad = new GamepadInput(config.gamepad.index, config.buttons);
		gamepad.on('input.move', handleInput);
	}
	if (typeof config.keys === 'object') {
		keyboard = new KeyboardInput(config.keys);
		keyboard.on('input.move', handleInput);
	}

	this.reset = function () {
		moves = {};
		self.removeAllListeners('input.move');
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
