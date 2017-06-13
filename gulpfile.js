// Dave: checkout https://css-tricks.com/gulp-for-beginners/
// Sass configuration:
// https://code.visualstudio.com/docs/languages/css
// .js stuff:
// https://www.npmjs.com/package/gulp-minify
// https://www.npmjs.com/package/gulp-concat

// https://www.npmjs.com/package/gulp-htmlmin
// https://github.com/kangax/html-minifier

// https://www.npmjs.com/package/gulp-rename
// https://www.npmjs.com/package/gulp-replace

// https://github.com/OverZealous/run-sequence   (I want to concat, then compress)
//                                               e.g. ['task1', 'task2'], 'task3', ['t4', 't5']
//                                                      parallel       then series then parallel

/* NOTE: Windows paths ... I'm using mapped UNC path as L:\
         ... however glob pattern matching doesn't work 
         ... properly with this ... e.g. if cwd is L:\
         ... then wildcard matching won't work for files
         ... in cwd.  Even if L:/ is specified.
         
         ... Have to use a subdirectory.
*/

var gulp = require('gulp');             // look for gulp in package node-modules
var sass = require('gulp-sass');
var minify = require('gulp-minify');
var cleanCSS = require('gulp-clean-css');
var concat = require('gulp-concat');
var runSequence = require('run-sequence');
var htmlmin = require('gulp-htmlmin');
var rename = require('gulp-rename');
var replace = require('gulp-replace');

gulp.task('minify-html', function() {
    return gulp.src("html-debug/*-debug.html")
        .pipe (htmlmin({collapseWhitespace: true, conservativeCollapse: true, caseSensitive: true, minifyJS: true, removeComments: true, removeEmptyElements: false }))
        .pipe (replace('<script></script>', ''))
        .pipe (rename(function (path) {
            path.basename = path.basename.replace("-debug", "");
        }))
        .pipe(gulp.dest('./'))
});

//                                           ************
// MAKE DEBUG VERSION OF index.html ... i.e. index-d.html
//                                           ************
// as well as debugging js (i.e. don't have to prettify all the time when stepping)
// ... wanted to reduce bandwidth use on my account on cloudinary.com
gulp.task('debug-js', function() {
    return gulp.src("html-debug/*-debug.html")
        .pipe (replace('js/homepage-min.js', 'js-debug-home/homepage.js'))
        .pipe (replace('js/OrbitControls-min.js', 'js-debug-home/OrbitControls.js'))
        .pipe (replace('https://cdn.jsdelivr.net/threejs/0.85.2/three.min.js', 'js-debug-home/three.js'))
        .pipe (replace('https://res.cloudinary.com/xarta/image/upload/','images/'))
        .pipe (replace(/v\d{10}\/xarta\//g, ''))
        .pipe (rename(function (path) {
            path.basename = path.basename.replace("-debug", "-d");
        }))
        .pipe(gulp.dest('./'))    
});


// change cloudinary (CDN) paths in homepage.js (not homepage-min.js)
// for debugging (so only effects homepage.js which is generated every time)
// - reduce bandwidth use on Cloudinary account when debugging
gulp.task('homepage-js-cloudinary', function() {
    return gulp.src("js-debug-home/homepage.js")
        .pipe (replace("setPath('https://res.cloudinary.com/xarta/image/upload/'", "setPath('https://xarta.co.uk/images/'"))
        .pipe (replace('https://res.cloudinary.com/xarta/image/upload/','images/'))
        .pipe (replace(/v\d{10}\/xarta\//g, ''))
        .pipe(gulp.dest(function(f) {
            return f.base;
        })) 
});


gulp.task('sass', function() {
    return gulp.src('css/css-debug/*.scss')
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
  return gulp.src('js-debug-home/*.js')
    .pipe(minify({
        ext:{
            src:'-debug.js',
            min:'-min.js'
        },
        exclude: ['tasks'],
        ignoreFiles: ['.combo.js', '-min.js', 'three.js', 'three.module.js'],
        noSource: ['*.js']
    }))
    .pipe(gulp.dest('js'))
});

gulp.task('concat-home-js', function() {
  return gulp.src([ './js-debug-home/CSS3DRenderer.js', 
                    './js-debug-home/beep.js', 
                    './js-debug-home/water.js',
                    './js-debug-home/scene.js'])
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
        'concat-home-js', 'minify-home-js', 'homepage-js-cloudinary'
    );
});


gulp.task('xarta', function() {
    gulp.watch('css/css-debug/*.scss', ['sass']);
    gulp.watch('css/css-debug/*.css', ['minify-css']);
    gulp.watch('html-debug/*.html', ['minify-html', 'debug-js']);
    gulp.watch(['js-debug-home/*.js', '!js-debug-home/homepage.js'], ['concat-minify-home-js']);
});

