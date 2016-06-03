'use strict';
const gulp = require('gulp'),
      clean = require('gulp-clean'),
      zip = require('gulp-zip'),
      browserify = require('browserify'),
      babelify = require('babelify'),
      babel = require('gulp-babel'),
      uglify = require('gulp-uglify'),
      source = require('vinyl-source-stream'),
      buffer = require('vinyl-buffer')

gulp.task('browserify', () => {
  return browserify({ debug: true })
    .transform(babelify)
    .require("./src/js/content.js", { entry: true })
    .bundle()
    .pipe(source('content.js'))
    .pipe(buffer())
    .pipe(uglify())
    .pipe(gulp.dest('coach_panel/assets/js/'))
})

gulp.task('build', ['browserify'], () => {
  return gulp.src(['src/js/*.js', '!src/js/content.js'])
    .pipe(babel({
      presets: ['es2015']
    }))
    .pipe(uglify())
    .pipe(gulp.dest('coach_panel/assets/js/'))
});

gulp.task('clean', () => {
  return gulp.src('build/*', {read: false})
    .pipe(clean());
});

gulp.task('zip', () => {
  var manifest = require('./coach_panel/manifest'),
    distFileName = manifest.name + ' v' + manifest.version + '.zip';

  //build distributable extension
  return gulp.src(['coach_panel/**'])
    .pipe(zip(distFileName))
    .pipe(gulp.dest('build'));
})

gulp.task('default', ['clean'], () => {
    gulp.start('zip');
})
