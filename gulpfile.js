'use strict';

var gulp       = require('gulp');
var moment     = require('moment');
var sass       = require('gulp-sass');
var uglify     = require('gulp-uglify');
var rename     = require('gulp-rename');
var jsHint     = require('gulp-jshint');
var plumber    = require('gulp-plumber');
var nodemon    = require('gulp-nodemon');
var imagemin   = require('gulp-imagemin');
var minifyCSS  = require('gulp-minify-css');
var livereload = require('gulp-livereload');
var prefix     = require('gulp-autoprefixer');

gulp.task('lint', function () {
  gulp
  .src([
    './server.js',
    './app/models/**/*.js',
    './app/controllers/**/*.js',
    './app/assets/js/**/*.js'
  ])
  .pipe(jsHint());
});

gulp.task('sass', function() {
  gulp
  .src('./app/assets/sass/main.scss')
  .pipe(plumber())
  .pipe(sass())
  .pipe(prefix())
  .pipe(rename({ suffix: '.min' }))
  .pipe(minifyCSS())
  .pipe(gulp.dest('./public/css'))
  .pipe(livereload());
});

gulp.task('img', function () {
  gulp
  .src('./app/assets/img/**/*')
  .pipe(imagemin({ optimizationLevel: 3, progressive: true, interlaced: true }))
  .pipe(gulp.dest('./public/img'));
});

gulp.task('icons', function() {
  gulp
  .src('./app/assets/icons/**/*')
  .pipe(gulp.dest('./public/icons'));
});

gulp.task('js', function() {
  gulp
  .src('./app/assets/js/**/*.js')
  .pipe(uglify())
  .pipe(gulp.dest('./public/js'));

  gulp
  .src([
    './bower_components/d3/d3.js',
    './bower_components/modernizr/modernizr.js',
    './bower_components/lodash/lodash.js',
    './bower_components/jquery/dist/jquery.js',
    './bower_components/jquery-validation/dist/jquery.validate.js',
    './bower_components/jquery-validation/dist/additional-methods.js',
    './bower_components/rangeslider.js/dist/rangeslider.js',
    './bower_components/foundation/js/foundation.js',
    './bower_components/foundation/js/foundation/foundation.tab.js',
    './bower_components/foundation/js/foundation/foundation.topbar.js',
    './bower_components/jquery.cookie/jquery.cookie.js',
    './bower_components/foundation/js/foundation/foundation.tooltip.js',
    './bower_components/jquery.inputmask/dist/jquery.inputmask.bundle.js',
    './bower_components/html2canvas/build/html2canvas.min.js',
  ])
  .pipe(uglify())
  .pipe(gulp.dest('./public/js/libs'));
});

gulp.task('watch', function() {
  livereload.listen();
  gulp.watch('./app/assets/sass/**/*.scss', ['sass']);
  gulp.watch('./app/assets/img/**/*', ['images']);
  gulp.watch('./app/assets/js/**/*.js', ['js']);
  gulp.watch(['./public/**/*', './templates/**/*']).on('change', function(file) {
    livereload.changed(file.path);
  });
});

gulp.task('serve', function() {
  nodemon({ script: 'server.js', ext: 'js', watch: ['./app/controllers', './app/routes', './server.js'] })
  .on('restart', function() {
    console.log('Restarted! ' + moment(new Date()).calendar());
  })
});

gulp.task('build', ['lint', 'sass', 'img', 'icons', 'js']);
gulp.task('default', ['build', 'serve', 'watch']);
