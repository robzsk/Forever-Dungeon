var SAT = require('sat');
var _ = require('underscore');
var Minivents = require('minivents');
var cA = new SAT.Circle();
var cB = new SAT.Circle();
var response = new SAT.Response();

var copyToCircle = function (e, c, r) {
	c.pos.x = e.position.x;
	c.pos.y = e.position.y;
	c.r = e[r || 'radius'];
};

var Sensor = function (parent, radiusProp) {
	this._parent = parent;
	this._radiusProp = _.isString(radiusProp) ? radiusProp : null;
	Minivents(this);
};

Sensor.prototype = {
	check: function (entities) {
		var found = false, scope = this;
		_.each(entities, function (other) {
			if (other !== scope._parent) {
				copyToCircle(scope._parent, cA, scope._radiusProp);
				copyToCircle(other, cB);
				response.clear();
				if (SAT.testCircleCircle(cA, cB, response)) {
					scope.emit('collision.detected', scope._parent, other, response);
					found = true;
				}
			}
		});
		return found;
	}
};

module.exports = Sensor;
