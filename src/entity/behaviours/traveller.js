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
	this._destination = new THREE.Vector2();
	this._force = new THREE.Vector2();
	this._velocity = new THREE.Vector2();
	this._currentAngle = 0;
	this._targetAngle = 0;
	this._collisions = new Sensor(this._parent);
	this._stopped = true;
	this._collisions.on('collision.detected', handleCollision);
	Minivents(this);
};

Traveller.prototype = {
	atDestination: function () {
		var p = this._parent.position;
		var d = this._destination;
		var arrived = p.x === d.x && p.y === d.y;

		if (arrived) {
			this.stop();
		}

		return arrived;
	},

	setVelocity: function () {
		var p = this._parent.position;
		var v = this._velocity;
		var d = this._destination;

		if (p.x !== d.x) {
			if (v.x < 0) {
				p.x += Math.max(v.x, d.x - p.x);
			} else {
				p.x += Math.min(v.x, d.x - p.x);
			}
		}
		if (p.y !== d.y) {
			if (v.y < 0) {
				p.y += Math.max(v.y, d.y - p.y);
			} else {
				p.y += Math.min(v.y, d.y - p.y);
			}
		}
	},

	updateAngle: function () {
		this._currentAngle = shortestAngle(getAngle(this._velocity), this._currentAngle, 0.4);
	},

	setDestination: function (dest) {
		var p = this._parent.position;

		this._destination.copy(dest);

		this._velocity.set(dest.x - p.x, dest.y - p.y)
			.normalize()
			.multiplyScalar(this._parent.travelSpeed || 0.1);

		if (this._stopped) {
			this.emit('traveller.started');
		}

		this._stopped = false;
	},

	stop: function () {
		this._destination.copy(this._parent.position);

		if (!this._stopped) {
			this._stopped = true;
			this.emit('traveller.stopped');
		}
	},

	init: function () {
		this._destination.copy(this._parent.position);
	},

	update: function (world) {
		if (!this.atDestination()) {
			// when collision correction occur we need to adjust velocity
			// could possibly find a more efficient way to do this
			this.setDestination(this._destination);
			this.setVelocity();
			this.updateAngle();
			this._collisions.check(world.entities);
		}

		// update the avatar position
		var p = this._parent.position;
		var a = this._parent.avatar.position;

		a.set(p.x, p.y, a.z);

		this._parent.avatar.rotation.y = this._currentAngle - rads(270);
	}
};

module.exports = Traveller;
