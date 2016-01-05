var $ = require('jquery'),
	loop = require('./engine/loop');

var windowWidth = window.innerWidth,
	windowHeight = window.innerHeight,
	ZOOM = 0.075;

var scene = new THREE.Scene(),
	camera = new THREE.OrthographicCamera(windowWidth * ZOOM / -2, windowWidth * ZOOM / 2, windowHeight * ZOOM / 2, windowHeight * ZOOM / -2, -100, 100),
	renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setClearColor(0xeeeeee, 1);
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
	},
	addEntity: function (entity) {
		var geometry = new THREE.CircleGeometry(entity.radius, 24),
			material = new THREE.MeshBasicMaterial({ color: entity.debugColor }),
			disc = new THREE.Mesh(geometry, material);
		disc.position.set(entity.position.x, entity.position.y, 0);
		scene.add(disc);

		entity.avatar = disc;
		world.entities.push(entity);
	}
};

// this changes the random seed somehow
var assets = require('./assets');

require('./assets').load(function () {
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
});
//
// // TESTING ANIMATIONS
// // NOTES: when exporting from blender need to reset the pose to rest position
// //		Clear Pose Transforms in blender to do above
// // also need to export skeletal as pose not rest
// // need to only have the object selected in object mode else you get an export error
// var findBoneByName = function (skeleton, name) {
// 	var ret;
// 	_.each(skeleton.bones, function (bone) {
// 		if (bone.name === name) {
// 			ret = bone;
// 		}
// 	});
// 	if (!ret) {
// 		throw new Error('Could not find bone: ' + name);
// 	}
// 	return ret;
// };
// require('./BlendCharacter');
// var blendMesh = new THREE.BlendCharacter();
// // scene.add(leg);
// // leg.quaternion.copy(camera.quaternion);
// var loader = new THREE.JSONLoader();
// loader.load('./src/sword.json', function (geometry, materials) {
// 	var sword = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({color: 0xff0000}));
// 	// sword.scale.zet(2, 2, 2);
// 	sword.rotation.x = 45 * Math.PI / 180;
// 	sword.updateMatrix();
// 	sword.geometry.applyMatrix(sword.matrix);
// 	scene.add(sword);
// 	blendMesh.load('./src/sprite.json', function () {
// 		console.log('loaded sprite.json');
//
// 		var player = world.player;
// 		var running = false;
//
// 		var s = 2;
// 		blendMesh.scale.set(s, s, s);
// 		// Blender uses z up, three uses y up. compo here
// 		blendMesh.rotation.x = 90 * Math.PI / 180;
//
// 		blendMesh.play('Run', 1);
// 		// blendMesh.quaternion.copy(camera.quaternion);
// 		scene.add(blendMesh);
//
// 		findBoneByName(blendMesh.skeleton, 'hand.r').add(sword);
//
// 		var f = function () {
// 			blendMesh.update(0.03);
// 			requestAnimationFrame(f);
//
// 			// console.log();
// 			blendMesh.rotation.y = player.behaviours.traveller.getAngleToDestination() - (270 * Math.PI / 180);
// 			blendMesh.position.set(player.position.x, player.position.y, 0);
// 			if (!player.behaviours.traveller.isTravelling()) {
// 				blendMesh.play('Idle', 0.1);
// 				running = false;
// 			} else if (!running && player.behaviours.traveller.isTravelling()) {
// 				running = true;
// 				blendMesh.play('Run', 1);
// 			}
//
// 		// blendMesh.updateMatrix();
// 		// blendMesh.geometry.applyMatrix(blendMesh.matrix);
// 		};
// 		requestAnimationFrame(f);
//
// 		// scene.add(sphere);
// 		// blendMesh.skeleton.bones[0].add(insert some mesh/weapon here);
//
// 	});
// });
