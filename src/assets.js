require('./BlendCharacter');
var SCALE = 2,
	basePath = './assets/';

var configs = [
	{ name: 'player', meshFile: 'player', textureFile: 'player' },
	{ name: 'sword', meshFile: 'sword' },
	{ name: 'slime', meshFile: 'slime', textureFile: 'slime' },
	{ name: 'rock', meshFile: 'rock', textureFile: 'rock' },
];

var onComplete = function (callback) {
	var complete = true;
	// check to see if everything is loaded
	_.each(configs, function (c) {
		if (c.meshFile && !c.geometry) {
			complete = false;
		}
		if (c.textureFile && !c.texture) {
			complete = false;
		}
	});

	if (complete) {
		// Everything is loaded, create the meshes
		_.each(configs, function (c) {
			var material = new THREE.MeshBasicMaterial({ map: c.texture || null, color: c.texture? null: 0xff00ff, transparent: true });
			if (c.geometry.animations) {
				c.mesh = new THREE.BlendCharacter(c.geometry, material);
			} else {
				c.mesh = new THREE.Mesh(c.geometry, material);
			}
			// Blender uses z up, three uses y up. compo here
			c.mesh.rotation.x = rads(90);
		});
		callback();
	}
};

module.exports = {
	get: function (name) {
		var ret;
		_.each(configs, function (c) {
			if (c.name === name) {
				ret = c.mesh;
			}
		});
		if (ret) {
			return ret.clone();
		}
		throw new Error('Mesh was not defined: ' + name);
	},

	findBoneByName: function (skeleton, name) {
		var ret;
		_.each(skeleton.bones, function (bone) {
			if (bone.name === name) {
				ret = bone;
			}
		});
		if (!ret) {
			throw new Error('Could not find bone: ' + name);
		}
		return ret;
	},

	load: function (onloaded) {
		var meshLoader = new THREE.JSONLoader(),
			textureLoader = new THREE.TextureLoader();
		_.each(configs, function (c) {
			// load the mesh if one is specified
			if (c.meshFile) {
				meshLoader.load(basePath + c.meshFile + '.json', function (geometry) {
					c.geometry = geometry;
					onComplete(onloaded);
				});
			}
			// load texture if one is specified
			if (c.textureFile) {
				textureLoader.load(basePath + c.textureFile + '.png', function (texture) {
					c.texture = texture;
					onComplete(onloaded);
				});
			}
		});
	}
};
