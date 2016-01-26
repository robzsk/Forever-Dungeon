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

var getAngle = function (vec2) {
	return Math.atan2(vec2.y, vec2.x);
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

	setVelocity: function (v) {
		if (v) {
			this._velocity.set(v.x, v.y);
			if (v.x !== 0 || v.y !== 0) {
				this._targetAngle = getAngle(v);
				this._parent.avatar.play && this._parent.avatar.play('Run');
			}
		} else {
			this._velocity.set(0, 0);
			this._parent.avatar.crossfadeTo && this._parent.avatar.crossfadeTo('Idle');
		}
	},

	init: function () {
		// this._destination.copy(this._parent.position);
	},

	update: function (world) {
		var p = this._parent.position;
		var v = this._velocity;
		var a = this._parent.avatar.position;

		p.x += v.x;
		p.y += v.y;

		this._collisions.check(world.entities);

		// set avatar position
		a.set(p.x, p.y, a.z);
		this.updateAngle();
		this._parent.avatar.rotation.y = this._currentAngle - rads(270);

	}
};

module.exports = Traveller;
