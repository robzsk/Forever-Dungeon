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

	render: function () {
		//
	},

	hasBehaviour: function (b) {
		return this.behaviours.hasOwnProperty(b);
	}
};

module.exports = Entity;
