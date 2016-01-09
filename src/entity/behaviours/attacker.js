var Sensor = require('./util/sensor');

var handleSensorCollision = function (a, b) {
	if (b === a.behaviours.attacker._target) {
		// must stop first else idle will be the last thing we've triggered
		a.behaviours.traveller.stop();
		if (!a.behaviours.attacker._attacking) {
			a.behaviours.attacker.emit('attacker.started');
			a.behaviours.attacker._attacking = true;
		}
	}
};

var Attacker = function (parent) {
	this._parent = parent;
	this._home = new THREE.Vector2();
	this._target = undefined;
	this._attacking = false;
	this._attackSensor = new Sensor(parent, 'attackRadius');
	this._attackSensor.on('collision.detected', handleSensorCollision);
	Minivents(this);
};

Attacker.prototype = {
	init: function () {
		//
	},

	update: function (world) {
		if (this._target) {
			if (!this._attackSensor.check([this._target])) {
				if (this._parent.hasBehaviour('traveller')) {
					this._parent.behaviours.traveller.setDestination(this._target.position);
				}
			}
		}
	},

	applyAttack: function () {
		var d = this._target.hasBehaviour('destructible') && this._target.behaviours.destructible;
		this._attacking = false;
		if (d) {
			d.takeDamage(1);
			if (d.dead()) {
				this.clearTarget();
			}
		}
	},

	clearTarget: function () {
		this._target = undefined;
		this._attacking = false;
	},

	setTarget: function (entity) {
		this._target = entity;
	}

};

module.exports = Attacker;