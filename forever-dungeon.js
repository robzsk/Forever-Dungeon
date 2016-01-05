'use strict';

require('seedrandom');

var THREE = require('three'),
	SAT = require('sat'),
	_ = require('underscore'),
	Minivents = require('minivents');

var rads = function () {
	var R = Math.PI / 180;
	return function (d) {
		return d * R;
	};
}();

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

+ function () {
	var SIZE = 30;
	var Entity = require('./src/entity'),
		player = new Entity.Player(),
		scene = require('./src/scene');

	var initSomeEnemies = function () {
		_.times(8, function () {
			var pos = getFreeSpace(SIZE),
				enemy = new Entity.Enemy(pos);
			scene.addEntity(enemy);
		});
	};

	var initSomeRocks = function () {
		_.times(50, function () {
			var pos = getFreeSpace(SIZE),
				rock = new Entity.Rock(pos);
			scene.addEntity(rock);
		});
	};

	scene.addPlayer(player);
	initSomeRocks();
	initSomeEnemies();

}();
