var Sensor = require('./util/sensor');

var handleSensorCollision = function (a, b) {
	if (a.hasBehaviour('traveller')) {
		a.behaviours.traveller.setDestination(b.position);
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
				this._parent.behaviours.traveller.setDestination(this._home);
			}
		}
	}
};

module.exports = Hostile;
