// Dave: checkout https://css-tricks.com/gulp-for-beginners/
// Sass configuration:
// https://code.visualstudio.com/docs/languages/css
// .js stuff:
// https://www.npmjs.com/package/gulp-minify
// https://www.npmjs.com/package/gulp-concat

// https://github.com/OverZealous/run-sequence   (I want to concat, then compress)

var gulp = require('gulp');             // look for gulp in package node-modules
var sass = require('gulp-sass');
var minify = require('gulp-minify');
var concat = require('gulp-concat');
var runSequence = require('run-sequence');

gulp.task('sass', function() {
    gulp.src('css/*.scss')
        .pipe(sass())
        .pipe(gulp.dest(function(f) {
            return f.base;
        }))
});

gulp.task('compress-home', function() {
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

gulp.task('concat-home', function() {
  return gulp.src(['./js-debug-home/water.js', './js-debug-home/OrbitControls.js', './js-debug-home/scene.js'])
    .pipe(concat('homepage.js'))
    .pipe(gulp.dest('./js-debug-home/'));
});

// want the homepage to be fast so concatenate & compress all js files
// to one (but also separates for three stuff, for other pages)
gulp.task('sequence-homepage', function() {
    runSequence(
        ['sass', 'concat-home'],
        'compress-home'
    );
});

gulp.task('default', 'sequence-homepage', function() {
    gulp.watch('css/*.scss', ['sass']);
    gulp.watch('js-debug-home/*.js', ['sequence-homepage']);
})

