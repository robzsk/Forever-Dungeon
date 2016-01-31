var THREE = require('three');
var util = require('../util');
var Input = require('../engine/input');
var input = new Input({
	gamepad: { index: 0 },
	buttons: { left: 14, right: 15, up: 12, down: 13, attack: 0 },
	keys: { left: 37, right: 39, up: 38, down: 40, attack: 90 }
});

var Entity = require('./base'),
	assets = require('../assets');

var Player = function (pos) {
	var scope = this;

	Entity.call(this, {
		position: pos,
		travelSpeed: 0.3,
		radius: 1,
		attackRadius: 2,// collide with this and the entity will attack you if you're the target
		debugColor: 0x00ff00,
		behaviours: ['attacker', 'destructible', 'traveller']
	});

	this.avatar = assets.get('player');

	// input
	var getD = function (a) {
		return {
			x: Math.sin(util.rads(a)) * 0.4, y: Math.cos(util.rads(a)) * 0.4
		};
	};
	var D = {
		N: getD(315),
		NE: getD(0),
		E: getD(45),
		SE: getD(90),
		S: getD(135),
		SW: getD(180),
		W: getD(225),
		NW: getD(270),
	};

	var axis = new THREE.Vector2();
	input.on('gamepad.axis', function (x, y) {
		axis.x = (x * Math.cos(util.rads(45)) - (-y * Math.sin(45)));
		axis.y = (-y * Math.cos(util.rads(45)) + (x * Math.sin(45)));
		axis.normalize().multiplyScalar(0.4);
	});

	input.on('gamepad.axis.stop', function () {
		scope.traveller.stop();
	});

	input.on('input.move', function (m) {
		var direction = 0;
		var t = scope.traveller;

		// reset velocity
		if (!m.up && !m.down && !m.left && !m.right) {
			t.stop();
		}

		if (m.attack) {
			scope.attacker.attack();
		} else {
			var d = '';
			if (m.up) d += 'N';
			if (m.down) d += 'S';
			if (m.left) d += 'W';
			if (m.right) d += 'E';
			t.travel(D[d]);
		}
	});

	this.updateInput = function (ticks) {
		axis.set(0, 0);
		input.update(ticks);
		if (axis.x || axis.y) {
			this.traveller.travel(axis);
		}
	};
	// end input

	this.render = function () {
		this.avatar.update(0.1);
	};

	var sword = assets.get('sword');
	assets.findBoneByName(this.avatar.skeleton, 'hand.r').add(sword);

};
Player.prototype = Object.create(Entity.prototype);
module.exports = Player;
