'use strict';

var gulp = require('gulp'),
	browserify = require('browserify'),
	source = require('vinyl-source-stream'),
	buffer = require('vinyl-buffer');

gulp.task('default', function () {
	var electron = require('electron-connect').server.create();
	electron.start();
	gulp.watch(['index.js'], electron.restart);
	gulp.watch(['index.html', 'forever-dungeon.js', 'src/**', 'assets/**'], electron.reload);
	gulp.task('reload:browser', function () {
		electron.restart();
	});

	gulp.task('reload:renderer', function () {
		electron.reload();
	});
});

gulp.task('build', function () {
	return browserify('forever-dungeon.js')
		.bundle()
		.pipe(source('forever-dungeon.bundle.js'))
		.pipe(buffer())
		// .pipe(uglify()) //does not work with ES6 template strings
		.pipe(gulp.dest('./'));
});
