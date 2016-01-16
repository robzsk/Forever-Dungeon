/**
 * @author Michael Guerrero / http://realitymeltdown.com
 */

THREE.BlendCharacter = function (geometry, material) {
	this.animations = {};
	this.weightSchedule = [];
	this.warpSchedule = [];

	var scope = this;
	material.skinning = true;
	THREE.SkinnedMesh.call(scope, geometry, material);
	scope.mixer = new THREE.AnimationMixer(scope);
	// Create the animations
	_.each(geometry.animations, function (a) {
		scope.animations[a.name] = a;
	});

	this.update = function ( dt ) {
		this.mixer.update(dt);
	};

	this.removeAllListeners = function () {
		// TODO: seems like the api does not want us to do it this way
		// look for a better way
		if (this.mixer._listeners) {
			this.mixer._listeners['finished'] = [];
		}
	};

	this.play = function (animName, conf) {
		var action = new THREE.AnimationAction(this.animations[animName]);
		var scope = this;
		this.mixer.removeAllActions();

		this.removeAllListeners();

		conf = conf || {};
		action.loop = conf.loopOnce ? THREE.LoopOnce : THREE.Loop;
		if (conf.onComplete) {
			this.mixer.addEventListener('finished', function anon () {
				scope.mixer.removeEventListener('finished', anon);
				conf.onComplete();
			});
		}
		//
		this.mixer.play(action);

	};

	this.crossfadeTo = function (animName, duration, conf) {
		var scope = this;
		var toAction = null;
		_.each(this.mixer.actions, function (action) {
			scope.mixer.fadeOut(action, 0.5);
			if (action.name === animName) {
				toAction = action;
			}
		});

		// var toAction = this.mixer.findActionByName(animName);

		if (toAction === null) {
			toAction = new THREE.AnimationAction(this.animations[animName]);
			toAction.name = animName;
		}
		this.mixer.fadeIn(toAction, 1);
		this.mixer.play(toAction);
	};

	this.crossfade = function ( fromAnimName, toAnimName, duration ) {
		this.mixer.removeAllActions();

		var fromAction = new THREE.AnimationAction(this.animations[ fromAnimName ]);
		var toAction = new THREE.AnimationAction(this.animations[ toAnimName ]);

		this.mixer.play(fromAction);
		this.mixer.play(toAction);

		this.mixer.crossFade(fromAction, toAction, duration, false);

	};

	this.warp = function ( fromAnimName, toAnimName, duration ) {
		this.mixer.removeAllActions();

		var fromAction = new THREE.AnimationAction(this.animations[ fromAnimName ]);
		var toAction = new THREE.AnimationAction(this.animations[ toAnimName ]);

		this.mixer.play(fromAction);
		this.mixer.play(toAction);

		this.mixer.crossFade(fromAction, toAction, duration, true);

	};

	this.applyWeight = function ( animName, weight ) {
		var action = this.mixer.findActionByName(animName);
		if ( action ) {
			action.weight = weight;
		}

	};

	this.pauseAll = function () {
		this.mixer.timeScale = 0;

	};

	this.unPauseAll = function () {
		this.mixer.timeScale = 1;

	};

	this.stopAll = function () {
		this.mixer.removeAllActions();

	};

	this.showModel = function ( boolean ) {
		this.visible = boolean;

	};
};

THREE.BlendCharacter.prototype = Object.create(THREE.SkinnedMesh.prototype);
THREE.BlendCharacter.prototype.constructor = THREE.BlendCharacter;

THREE.BlendCharacter.prototype.getForward = function () {
	var forward = new THREE.Vector3();

	return function () {
		// pull the character's forward basis vector out of the matrix
		forward.set(
			- this.matrix.elements[ 8 ],
			- this.matrix.elements[ 9 ],
			- this.matrix.elements[ 10 ]);

		return forward;

	};

};
