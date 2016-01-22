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

var clickPlane;
var world = {
	player: {},
	entities: []
};

var clickables = [];

var toBeRemoved = [];

var updateInput = function () {
	var leftButton = false;
	var mousePosition = new THREE.Vector2();
	var raycaster = new THREE.Raycaster();
	var mouse = new THREE.Vector2();
	var intersects;
	var clickedEntity;
	var targetEntity = false;
	var targetGround = false;

	clickPlane = new THREE.Mesh(new THREE.PlaneGeometry(250, 250), new THREE.MeshBasicMaterial());

	clickables.push(clickPlane);

	$(document).on('mousemove', function (e) {
		mousePosition.set(e.clientX, e.clientY);
	});

	$(document).on('mouseup', function (e) {
		targetEntity = targetGround = false;
		leftButton = e.which === 1 ? false: leftButton;
	});

	$(document).on('mousedown', function (e) {
		leftButton = e.which === 1;
	});

	return function () {
		if (leftButton) {
			mouse.x = (mousePosition.x / renderer.domElement.width) * 2 - 1;
			mouse.y = -(mousePosition.y / renderer.domElement.height) * 2 + 1;
			raycaster.setFromCamera(mouse, camera);
			intersects = raycaster.intersectObjects(clickables, false);
			if (intersects.length > 0) {
				if (intersects[0].object.uuid === clickPlane.uuid && !targetEntity) {
					world.player.traveller.setDestination(intersects[0].point);
					world.player.attacker.clearTarget();
					targetGround = true;
				} else if (!targetGround && !targetEntity) {
					clickedEntity = getClickedEntity(intersects[0].object);
					if (clickedEntity) {
						targetEntity = true;
						world.player.attacker.setTarget(clickedEntity);
					}
				}
			}
		}
	};
}();

var getClickedEntity = function (clicked) {
	return _.find(world.entities, function (e) {
		return e.avatar.uuid === clicked.uuid;
	});
};

loop.on('loop.update', function () {
	updateInput();
	_.each(world.entities, function (e) {
		e.update && e.update(world);
	});

	// entities get killed/removed during the update loop, but we actually do the removal here
	world.entities = _.difference(world.entities, toBeRemoved);
	clickables = _.difference(clickables, toBeRemoved);
	toBeRemoved = [];
});

loop.on('loop.render', function () {
	_.each(world.entities, function (e) {
		e.render && e.render();
	});
	camera.position.set(world.player.position.x, world.player.position.y, 0);// following the player
	clickPlane.position.set(world.player.position.x, world.player.position.y, 0);
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
		clickables.push(entity.avatar);
	},

	removeEntity: function (entity) {
		toBeRemoved.push(entity);
		scene.remove(entity.avatar);
	}
};
