var Entity = require('./base'),
	assets = require('../assets');

var Rock = function (pos) {
	Entity.call(this, {
		position: pos,
		radius: 1,
		debugColor: 0x555555,
		behaviours: []
	});
	this.avatar = assets.get('rock');
	this.avatar.rotation.y = Math.random() * 360;
	this.avatar.position.z = 0;
};

Rock.prototype = Object.create(Entity.prototype);

module.exports = Rock;
