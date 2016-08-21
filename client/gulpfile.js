var gulp = require('gulp'),
    del = require('del'),
    run = require('gulp-run'),
    sass = require('gulp-sass'),
    browserify = require('browserify'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    jshint = require('gulp-jshint'),
    browserSync = require('browser-sync'),
    source = require('vinyl-source-stream'),
    buffer = require('vinyl-buffer'),
    reactify = require('reactify'),
    cdnizer = require("gulp-cdnizer"),
    package = require('./package.json'),
    reload = browserSync.reload;

/**
 * Running Bower
 */
gulp.task('bower', function() {
  run('bower install').exec();
})

/**
 * Cleaning dist/ folder
 */
.task('clean', function(cb) {
  del(['production/**'], cb);
})

/**
 * Copy index.html for production
 * or any assests like Images, font files...
 */
.task('copy', function(){
  gulp.src(package.paths.html)
    .pipe(gulp.dest(package.dest.distribution));
})

/**
 * Add cdn files based on bowerComponents
 *
 */
.task('cdnizer', function(){
  // gulp.src(package.paths.html)
  //       .pipe(cdnizer({
  //         allowRev: true,
  //         allowMin: true,
  //         files: [
  //           {
  //             file: 'development/bower_components/bootstrap/dist/css/bootstrap.min.css',
  //             package: 'bootstrap',
  //             test: 'window.bootstrap',
  //             cdn: 'https://cdnjs.cloudflare.com/ajax/libs/twitter-bootstrap/4.0.0-alpha/css/bootstrap.min.css'
  //           }
  //         ]
  //       }))
  //       .pipe(gulp.dest(package.dest.distribution));
})

/**
 * Running livereload server
 */
.task('server', function() {
  browserSync({
    server: {
     baseDir: './development'
    }
  });
})

/**
 * sass compilation
 */
.task('sass', function() {
  return gulp.src(package.paths.sass)
    .pipe(sass().on('error', sass.logError))
    .pipe(concat('app.css'))
    .pipe(gulp.dest(package.paths.styles));
})
.task('sass:min', function() {
  return gulp.src(package.paths.sass)
   .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
   .pipe(concat('app.css'))
   .pipe(gulp.dest(package.dest.styles));
})

/**
 * JSLint/JSHint validation
 */
.task('lint', function() {
  return gulp.src(package.paths.js)
  .pipe(jshint())
  .pipe(jshint.reporter('default'));
})

/** JavaScript compilation */
.task('js', function() {
  return browserify(package.paths.app)
  .transform(reactify)
  .bundle()
  .pipe(source(package.dest.app))
  //.pipe(gulp.dest(package.paths.development));
})
.task('js:min', function() {
  return browserify(package.paths.app)
  .transform(reactify)
  .bundle()
  .pipe(source(package.dest.app))
  .pipe(buffer())
  .pipe(uglify())
  .pipe(gulp.dest(package.dest.distribution));
})

/**
 * Compiling resources and serving application
 */
.task('serve', ['bower', 'clean', 'lint', 'sass', 'js', 'server'], function() {
  return gulp.watch([
    package.paths.js, package.paths.jsx, package.paths.html, package.paths.sass
  ], [
   'lint', 'sass', 'js', browserSync.reload
  ]);
})
.task('build', ['bower', 'clean', 'cdnizer', 'copy', 'lint', 'sass:min', 'js:min', 'server'], function() {
  return gulp.watch([
    package.paths.js, package.paths.jsx, package.paths.html, package.paths.sass
  ], [
   'lint', 'sass:min', 'js:min', browserSync.reload
  ]);
});
