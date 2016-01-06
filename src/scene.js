var $ = require('jquery'),
	loop = require('./engine/loop');

var windowWidth = window.innerWidth,
	windowHeight = window.innerHeight,
	ZOOM = 0.075;

var scene = new THREE.Scene(),
	camera = new THREE.OrthographicCamera(windowWidth * ZOOM / -2, windowWidth * ZOOM / 2, windowHeight * ZOOM / 2, windowHeight * ZOOM / -2, -100, 100),
	renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setClearColor(0xffffff, 1);
renderer.setSize(window.innerWidth, window.innerHeight);
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

var updateInput = function () {
	var leftButton = false,
		mousePosition = new THREE.Vector2(),
		raycaster = new THREE.Raycaster(),
		mouse = new THREE.Vector2(),
		intersects;
	clickPlane = new THREE.Mesh(new THREE.PlaneGeometry(250, 250),
		new THREE.MeshBasicMaterial());
	$(document).on('mousemove', function (e) {
		mousePosition.set(e.clientX, e.clientY);
	});
	$(document).on('mouseup', function (e) {
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
			intersects = raycaster.intersectObjects([clickPlane], false);
			if (intersects.length > 0) {
				world.player.behaviours.traveller.setDestination(intersects[0].point);
			}
		}
	};
}();

loop.on('loop.update', function () {
	updateInput();
	_.each(world.entities, function (e) {
		e.update && e.update(world);
	});
});

loop.on('loop.render', function () {
	_.each(world.entities, function (e) {
		var p = e.position,
			a = e.avatar.position;
		a.set(p.x, p.y, 0);
	});
	camera.position.set(world.player.position.x, world.player.position.y, 0);// following the player
	clickPlane.position.set(world.player.position.x, world.player.position.y, 0);

	renderer.render(scene, camera);
});

module.exports = {
	addPlayer: function (entity) {
		var geometry = new THREE.CircleGeometry(entity.radius, 24),
			material = new THREE.MeshBasicMaterial({ color: entity.debugColor }),
			disc = new THREE.Mesh(geometry, material);
		disc.position.set(0, 0, 0);
		scene.add(disc);
		world.player = entity;
		world.player.avatar = disc;
		world.entities.push(world.player);

		runTest();
	},
	addEntity: function (entity) {
		// TODO: this is just for testing load the avatar differently
		if (!entity.avatar) {
			var geometry = new THREE.CircleGeometry(entity.radius, 24),
				material = new THREE.MeshBasicMaterial({ color: entity.debugColor }),
				disc = new THREE.Mesh(geometry, material);
			disc.position.set(entity.position.x, entity.position.y, 0);
			scene.add(disc);
			entity.avatar = disc;
		} else {
			entity.avatar.position.set(entity.position.x, entity.position.y, 0);
			scene.add(entity.avatar);
		}

		world.entities.push(entity);
	}
};

var runTest = function () {
	// this changes the random seed somehow
	var testPlayerMesh = assets.get('player');
	var sword = assets.get('sword');
	var player = world.player;
	var running = false;
	var scale = 2;
	testPlayerMesh.scale.set(scale, scale, scale);

	scene.add(testPlayerMesh);

	assets.findBoneByName(testPlayerMesh.skeleton, 'hand.r').add(sword);

	var f = function () {
		testPlayerMesh.update(0.03);
		requestAnimationFrame(f);

		testPlayerMesh.rotation.y = player.behaviours.traveller.getAngleToDestination() - (270 * Math.PI / 180);
		testPlayerMesh.position.set(player.position.x, player.position.y, 0);
		if (!player.behaviours.traveller.isTravelling()) {
			testPlayerMesh.play('Idle', 0.1);
			running = false;
		} else if (!running && player.behaviours.traveller.isTravelling()) {
			running = true;
			testPlayerMesh.play('Run', 1);
		}

	};
	requestAnimationFrame(f);
};
