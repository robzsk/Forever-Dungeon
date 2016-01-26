var $ = require('jquery');
var loop = require('./engine/loop');

var W = window.innerWidth;
var H = window.innerHeight;
var Z = 0.075;

var scene = new THREE.Scene();
var camera = new THREE.OrthographicCamera(W * Z / -2, W * Z / 2, H * Z / 2, H * Z / -2, -100, 100);
var renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setClearColor(0xffffff, 1);
renderer.setSize(W, H);
document.body.appendChild(renderer.domElement);
camera.rotation.order = 'ZXY';
camera.rotation.z = 45 * Math.PI / 180;

// camera.rotation.x = 60 * Math.PI / 180;
camera.rotation.x = 45 * Math.PI / 180;
camera.position.set(0, 0, 0);

var world = {
	player: {},
	entities: []
};

var toBeRemoved = [];

loop.on('loop.update', function (ticks, step) {
	world.player.updateInput(ticks);
	_.each(world.entities, function (e) {
		e.update && e.update(world);
	});

	// entities get killed/removed during the update loop, but we actually do the removal here
	world.entities = _.difference(world.entities, toBeRemoved);
	toBeRemoved = [];
});

loop.on('loop.render', function () {
	_.each(world.entities, function (e) {
		e.render && e.render();
	});
	camera.position.set(world.player.position.x, world.player.position.y, 0);// following the player
	renderer.render(scene, camera);
});

module.exports = {
	addPlayer: function (entity) {
		world.player = entity;
		scene.add(entity.avatar);
		world.entities.push(world.player);
	},

	addEntity: function (entity) {
		entity.avatar.position.set(entity.position.x, entity.position.y, 0);
		scene.add(entity.avatar);
		world.entities.push(entity);
	},

	removeEntity: function (entity) {
		toBeRemoved.push(entity);
		scene.remove(entity.avatar);
	}
};
