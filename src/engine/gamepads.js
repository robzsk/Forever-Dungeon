'use strict';

var gamepads;

module.exports = {
	update: function () {
		gamepads = navigator.getGamepads();
	},
	get: function (index) {
		return gamepads[index];
	}
};
