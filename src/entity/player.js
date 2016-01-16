var Entity = require('./base'),
	assets = require('../assets');

var Player = function (pos) {
	var scope = this;

	Entity.call(this, {
		position: pos,
		travelSpeed: 0.3,
		radius: 1,
		attackRadius: 2,// collide with this and the entity will attack you if you're the target
		debugColor: 0x00ff00,
		behaviours: ['attacker', 'destructible', 'traveller']
	});

	this.avatar = assets.get('player');

	this.traveller.on('traveller.stopped', function () {
		scope.avatar.crossfadeTo('Idle', 1);
	});

	this.traveller.on('traveller.started', function () {
		scope.avatar.play('Run');
	});

	this.destructible.on('destructible.dead', function () {
		// console.log('you are dead');
	});

	this.attacker.on('attacker.started', function () {
		scope.avatar.play('Attack', {
			loopOnce: true,
			onComplete: function () {
				scope.attacker.applyAttack();
				// scope.behaviours.attacker.clearTarget();// must click again to attack
				scope.avatar.play('Idle');
			}
		});
	});

	this.render = function () {
		this.avatar.update(0.1);
	};

	var sword = assets.get('sword');
	assets.findBoneByName(this.avatar.skeleton, 'hand.r').add(sword);

};
Player.prototype = Object.create(Entity.prototype);
module.exports = Player;
