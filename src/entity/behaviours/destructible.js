var Sensor = require('./util/sensor');

var handleSensorCollision = function (a, b) {
	// if (b === a.behaviours.attacker._target) {
	// 	a.behaviours.traveller.stop();// must stop first else idle will be the last thing we've triggered
	// 	if (!a.behaviours.attacker._attacking) {
	// 		a.behaviours.attacker.emit('attacker.started');
	// 		a.behaviours.attacker._attacking = true;
	// 	}
	// }
};

var Destructible = function (parent) {
	this._parent = parent;
	this._home = new THREE.Vector2();
	this._target = undefined;
	this._attacking = false;
	this._hp = parent.health;// TODO: use configuration
	this._attackSensor = new Sensor(parent, 'attackRadius');
	this._attackSensor.on('collision.detected', handleSensorCollision);
	Minivents(this);
};

Destructible.prototype = {
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

	takeDamage: function (damage) {
		this._hp -= damage;
		if (this._hp <= 0) {
			this.emit('destructible.dead');
		}
	},

	dead: function () {
		return this._hp <= 0;
	},

	clearTarget: function () {
		this._target = undefined;
		this._attacking = false;
	},

	setTarget: function (entity) {
		this._target = entity;
	}

};

module.exports = Destructible;
