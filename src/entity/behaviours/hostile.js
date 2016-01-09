var Sensor = require('./util/sensor');

var handleSensorCollision = function (a, b) {
	var abh = a.behaviours;
	if (a.hasBehaviour('attacker') && !abh.hostile._agro) {
		abh.traveller.setDestination(b.position);
		abh.attacker.setTarget(b);
		abh.hostile._agro = true;
	}
};

var Hostile = function (parent) {
	this._parent = parent;
	this._home = new THREE.Vector2();
	this._hostileSensor = new Sensor(parent, 'hostileRadius');
	this._hostileSensor.on('collision.detected', handleSensorCollision);
	this._agro = false;
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
			this._agro = false;
		}
	}
};

module.exports = Hostile;
