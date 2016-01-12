'use strict';

require('seedrandom');

var THREE = require('three'),
	SAT = require('sat'),
	_ = require('underscore'),
	assets = require('./src/assets'),// TODO: don't want this here
	Minivents = require('minivents');

var rads = function () {
	var R = Math.PI / 180;
	return function (d) {
		return d * R;
	};
}();

var degs = function () {
	var D = 180 / Math.PI;
	return function (r) {
		return r * D;
	};
}();

// NOTE: three.js will make calls to Math.random which will throw out our seed
// need to find a way around this
var r = 0.6155678408686072;// Math.random();
Math.seedrandom(r);
console.log('Using seed ' + r);

var getFreeSpace = function () {
	var occupied = {};
	return function (r) {
		var found = false, x, y, k;
		while (!found) {
			x = Math.floor(Math.random() * r * (Math.random() > 0.5? -1: 1));
			y = Math.floor(Math.random() * r * (Math.random() > 0.5? -1: 1));
			k = x + ',' + y;
			if (!occupied[k]) {
				found = true;
				occupied[k] = true;
			}
		}
		return new THREE.Vector2(x, y);
	};
}();

var assets = require('./src/assets');
assets.load(function () {
	var SIZE = 50;
	var Entity = require('./src/entity'),
		player = new Entity.Player(),
		scene = require('./src/scene');

	var initSomeSlime = function () {
		_.times(8, function () {
			scene.addEntity(new Entity.Slime(getFreeSpace(SIZE)));
		});
	};

	var initSomeRocks = function () {
		_.times(8, function () {
			scene.addEntity(new Entity.Rock(getFreeSpace(SIZE)));
		});
	};

	scene.addPlayer(player);
	initSomeRocks();
	initSomeSlime();

});
