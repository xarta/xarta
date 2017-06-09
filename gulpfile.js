// Dave: checkout https://css-tricks.com/gulp-for-beginners/
// Sass configuration:
// https://code.visualstudio.com/docs/languages/css
// .js stuff:
// https://www.npmjs.com/package/gulp-minify
// https://www.npmjs.com/package/gulp-concat

// https://github.com/OverZealous/run-sequence   (I want to concat, then compress)
//                                               e.g. ['task1', 'task2'], 'task3', ['t4', 't5']
//                                                      parallel       then series then parallel

var gulp = require('gulp');             // look for gulp in package node-modules
var sass = require('gulp-sass');
var minify = require('gulp-minify');
var cleanCSS = require('gulp-clean-css');
var concat = require('gulp-concat');
var runSequence = require('run-sequence');

gulp.task('sass', function() {
    gulp.src('css/css-debug/*.scss')
        .pipe(sass())
        .pipe(gulp.dest(function(f) {
            return f.base;
        }))
});

gulp.task('minify-css', function() {
  return gulp.src('css/css-debug/styles.css')
    .pipe(cleanCSS({compatibility: '*'}))
    .pipe(gulp.dest('css'));
});

gulp.task('minify-home-js', function() {
  gulp.src('js-debug-home/*.js')
    .pipe(minify({
        ext:{
            src:'-debug.js',
            min:'-min.js'
        },
        exclude: ['tasks'],
        ignoreFiles: ['.combo.js', '-min.js'],
        noSource: ['*.js']
    }))
    .pipe(gulp.dest('js'))
});

gulp.task('concat-home-js', function() {
  return gulp.src(['./js-debug-home/water.js', './js-debug-home/OrbitControls.js', './js-debug-home/scene.js'])
    .pipe(concat('homepage.js'))
    .pipe(gulp.dest('./js-debug-home/'));
});

gulp.task('sass-minify', function() {
    runSequence(
        'sass', 'minify-css'
    );
});

// want the homepage to be fast so concatenate & compress all js files
// to one (but also separates for three stuff, for other pages)
gulp.task('concat-minify-home-js', function() {
    runSequence(
        'concat-home-js', 'minify-home-js'
    );
});


gulp.task('xarta', function() {
    gulp.watch('css/css-debug/*.scss', ['sass']);
    gulp.watch('css/css-debug/*.css', ['minify-css']);
    gulp.watch('js-debug-home/*.js', ['concat-minify-home-js']);
});

