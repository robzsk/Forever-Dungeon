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

var clickables = [];

var updateInput = function () {
	var leftButton = false,
		mousePosition = new THREE.Vector2(),
		raycaster = new THREE.Raycaster(),
		mouse = new THREE.Vector2(),
		intersects, clickedEntity, targetEntity = false, targetGround = false;
	clickPlane = new THREE.Mesh(new THREE.PlaneGeometry(250, 250),
		new THREE.MeshBasicMaterial());
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
	var ret;
	_.each(world.entities, function (e) {// TODO: use every or find here instead of each to return and stop when found
		if (e.avatar.uuid === clicked.uuid) {
			ret = e;
		}
	});
	return ret;
};

loop.on('loop.update', function () {
	updateInput();
	_.each(world.entities, function (e) {
		e.update && e.update(world);
	});
});

loop.on('loop.render', function () {
	_.each(world.entities, function (e) {
		// entities may be removed during this loop
		// need to check they still exist.
		// should we do this a safer way?
		e && e.render && e.render();
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
		var index = world.entities.indexOf(entity);
		if (index !== -1) {
			world.entities.splice(index, 1);
			clickables.splice(clickables.indexOf(entity.avatar), 1);
			scene.remove(entity.avatar);
		}
	}
};
