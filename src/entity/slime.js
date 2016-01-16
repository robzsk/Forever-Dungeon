var scene = require('../scene'),// TODO: don't use the scene object to remove entities
	Entity = require('./base'),
	assets = require('../assets');

var Slime = function (pos) {
	var scope = this;
	Entity.call(this, {
		position: pos,
		radius: 1,
		health: 1,
		attackRadius: 2,// collide with this and the entity will attack you if you're the target
		hostileRadius: 12,// collide with this and the entity will become hotile toward you
		debugColor: 0xff0000,
		behaviours: ['traveller', 'attacker', 'hostile', 'destructible']
	});

	this.avatar = assets.get('slime');

	this.behaviours.destructible.on('destructible.dead', function () {
		scene.removeEntity(scope);
	});

	this.behaviours.attacker.on('attacker.started', function () {
		setTimeout(function () {
			scope.behaviours.attacker.applyAttack();
		}, 500);
	});

};
Slime.prototype = Object.create(Entity.prototype);
module.exports = Slime;
