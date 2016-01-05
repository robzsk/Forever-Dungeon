var behaviours = require('./behaviours');

var Entity = function (properties) {
	var scope = this;
	this.behaviours = {};

	if (!properties.position) {
		properties.position = new THREE.Vector2();
	}

	_.each(properties, function (v, k) {
		// add defined bahaviours
		if (k === 'behaviours') {
			_.each(v, function (b) {
				if (scope.hasOwnProperty(b)) {
					throw new Error('Behavour ' + v + ' already exists');
				}
				// construct the behaviour
				if (_.isString(b)) {
					scope.behaviours[b] = new behaviours[b](scope);
				}
			});
		} else {
			// add configuration
			if (scope.hasOwnProperty(k)) {
				throw new Error('Redefined property: ' + k);
			}
			scope[k] = v;
		}
	});

	// call init on all our defined behaviours
	_.each(this.behaviours, function (b) {
		b.init && b.init();
	});

};

Entity.prototype = {
	update: function (world) {
		_.each(this.behaviours, function (b) {
			b.update && b.update(world);
		});
	},
	hasBehaviour: function (b) {
		return this.behaviours.hasOwnProperty(b);
	}
};

var templates = {
	Player: function (pos) {
		Entity.call(this, {
			position: pos,
			travelSpeed: 0.3,
			radius: 1,
			debugColor: 0x00ff00,
			behaviours: ['traveller']
		});
	},

	Enemy: function (pos) {
		Entity.call(this, {
			position: pos,
			radius: 1,
			hostileRadius: 6,
			debugColor: 0xff0000,
			behaviours: ['traveller', 'hostile']
		});
	},

	Rock: function (pos) {
		Entity.call(this, {
			position: pos,
			radius: 1,
			debugColor: 0x555555,
			behaviours: []
		});
	}
};

module.exports = templates;

_.each(templates, function (e) {
	e.prototype = Object.create(Entity.prototype);
});
