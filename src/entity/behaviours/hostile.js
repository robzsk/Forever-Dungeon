var Sensor = require('./util/sensor');

var handleSensorCollision = function (a, b) {
	if (a.hasBehaviour('attacker')) {
		// a.traveller.setDestination(b.position);

		var vel = new THREE.Vector2();
		vel.set(b.position.x, b.position.y);
		vel.x -= a.position.x;
		vel.y -= a.position.y;
		vel.normalize().multiplyScalar(0.1);
		a.traveller.setVelocity(vel);

		a.attacker.setTarget(b);
	}
};

var Hostile = function (parent) {
	this._parent = parent;
	this._home = new THREE.Vector2();
	this._hostileSensor = new Sensor(parent, 'hostileRadius');
	this._hostileSensor.on('collision.detected', handleSensorCollision);
	Minivents(this);
};

Hostile.prototype = {
	init: function () {
		this._home.copy(this._parent.position);
	},

	update: function (world) {
		if (!this._hostileSensor.check([world.player])) {
			if (this._parent.hasBehaviour('traveller')) {
				this._parent.traveller.setVelocity();
			}
		}
	}
};

module.exports = Hostile;
