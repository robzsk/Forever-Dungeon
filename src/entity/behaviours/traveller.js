var THREE = require('three');
var Minivents = require('minivents');
var util = require('../../util');
var Sensor = require('./util/sensor');

// where a and b are entities
// response is a SAT.js object
var handleCollision = function (a, b, response) {
	var tA = a.hasBehaviour('traveller');
	var tB = b.hasBehaviour('traveller');

	if (tA && tB) {
		response.overlapV.scale(0.5);
		a.position.sub(response.overlapV);
		b.position.add(response.overlapV);
	} else if (tA) {
		a.position.sub(response.overlapV);
	} else if (tB) {
		b.position.add(response.overlapV);
	}
};

var clamp = function (r) {
	var p2 = Math.PI * 2;

	return function (r) {
		if (r > Math.PI) {
			r -= p2;
		}
		if (r < -Math.PI) {
			r += p2;
		}
		return r;
	};
}();

var shortestAngle = function (from, to, n) {
	var a = from - to;
	var ret = to;

	a = clamp(a);

	if (a > 0) {
		ret += Math.min(n, Math.abs(a));
	} else {
		ret -= Math.min(n, Math.abs(a));
	}

	return clamp(ret);
};

var getAngle = function (v) {
	return Math.atan2(v.y, v.x);
};

var canAnimate = function (a) {
	return a.getCurrentAnimation && a.getCurrentAnimation() !== 'Attack';
};

var Traveller = function (parent) {
	this._parent = parent;
	this._velocity = new THREE.Vector2();
	this._currentAngle = 0;
	this._targetAngle = 0;

	this._collisions = new Sensor(this._parent);
	this._collisions.on('collision.detected', handleCollision);
	Minivents(this);
};

Traveller.prototype = {
	updateAngle: function () {
		this._currentAngle = shortestAngle(this._targetAngle, this._currentAngle, 0.4);
	},

	stop: function () {
		this._velocity.set(0, 0);
	},

	travel: function (v) {
		var a = this._parent.avatar;

		// if (!canAnimate(a)) {
		// 	this._velocity.set(0, 0);
		// 	return;
		// }

		if (v) {
			this._velocity.set(v.x, v.y);
			if (v.x !== 0 || v.y !== 0) {
				this._targetAngle = getAngle(v);
			}
		} else {
			this._velocity.set(0, 0);
		}

	},

	init: function () {
		// this._destination.copy(this._parent.position);
	},

	animate: function () {
		var a = this._parent.avatar;
		if (canAnimate(a)) {
			var v = this._velocity;
			if (v.x !== 0 || v.y !== 0) {
				a.play && a.play('Run');
			} else {
				a.crossfadeTo && a.crossfadeTo('Idle');
			}
		}
	},

	update: function (world) {
		var p = this._parent.position;
		var v = this._velocity;
		var a = this._parent.avatar;
		var ap = a.position;

		if (canAnimate(a)) {
			p.x += v.x;
			p.y += v.y;
		}

		this._collisions.check(world.entities);

		// set avatar position
		ap.set(p.x, p.y, ap.z);
		this.updateAngle();
		a.rotation.y = this._currentAngle - util.rads(270);

		this.animate();

	}
};

module.exports = Traveller;
