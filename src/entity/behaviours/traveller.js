var Sensor = require('./util/sensor');

// where a and b are entities
// response is a SAT.js object
var handleCollision = function (a, b, response) {
	var tA = a.hasBehaviour('traveller'),
		tB = b.hasBehaviour('traveller');
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

// TODO: set these to _variable to make private
var Traveller = function (parent) {
	this._parent = parent;
	this._destination = new THREE.Vector2();
	this._force = new THREE.Vector2();
	this._velocity = new THREE.Vector2();
	// this._travelling = false;
	this._collisions = new Sensor(this._parent);

	this._stopped = true;

	this._collisions.on('collision.detected', handleCollision);

	Minivents(this);
};

Traveller.prototype = {
	atDestination: function () {
		var arrived = this._parent.position.x === this._destination.x && this._parent.position.y === this._destination.y;
		if (arrived) {
			this.stop();
		}
		return arrived;
	},

	setVelocity: function () {
		if (this._parent.position.x !== this._destination.x) {
			if (this._velocity.x < 0) {
				this._parent.position.x += Math.max(this._velocity.x, this._destination.x - this._parent.position.x);
			} else {
				this._parent.position.x += Math.min(this._velocity.x, this._destination.x - this._parent.position.x);
			}
		}
		if (this._parent.position.y !== this._destination.y) {
			if (this._velocity.y < 0) {
				this._parent.position.y += Math.max(this._velocity.y, this._destination.y - this._parent.position.y);
			} else {
				this._parent.position.y += Math.min(this._velocity.y, this._destination.y - this._parent.position.y);
			}
		}
	},

	setDestination: function (dest) {
		this._destination.copy(dest);
		this._velocity.set(dest.x - this._parent.position.x, dest.y - this._parent.position.y)
			.normalize()
			.multiplyScalar(this._parent.travelSpeed || 0.1);
		if (this._stopped) {
			this.emit('traveller.started');
		}
		this._stopped = false;
	},

	getAngleToDestination: function () {
		return Math.atan2(this._velocity.y, this._velocity.x);
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
			this._collisions.check(world.entities);
		}

		// update the avatar position
		var p = this._parent.position,
			a = this._parent.avatar.position;
		a.set(p.x, p.y, a.z);
		this._parent.avatar.rotation.y = this._parent.behaviours.traveller.getAngleToDestination() - rads(270);
	}
};

module.exports = Traveller;
