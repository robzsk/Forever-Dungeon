var behaviours = require('./behaviours');

var Entity = function (properties) {
	var scope = this;
	this._behaviours = [];

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
					scope[b] = new behaviours[b](scope);
					scope._behaviours.push(b);
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
	_.each(this._behaviours, function (b) {
		scope[b].init && scope[b].init();
	});

};

Entity.prototype = {
	update: function (world) {
		var scope = this;
		_.each(this._behaviours, function (b) {
			scope[b].update && scope[b].update(world);
		});
	},

	render: function () {
		//
	},

	hasBehaviour: function (b) {
		return this.hasOwnProperty(b);
	}
};

module.exports = Entity;
