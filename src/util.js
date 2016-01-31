module.exports = {
	rads: function () {
		var R = Math.PI / 180;
		return function (d) {
			return d * R;
		};
	}(),

	degs: function () {
		var D = 180 / Math.PI;
		return function (r) {
			return r * D;
		};
	}()

};
