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

// https://www.npmjs.com/package/gulp-babel  (GOING TO START USING ES6 !!! BIT LATE LOL)

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
const gutil = require('gulp-util');
var sass = require('gulp-sass');
var minify = require('gulp-minify');
var cleanCSS = require('gulp-clean-css');
var concat = require('gulp-concat');
var runSequence = require('run-sequence');
var htmlmin = require('gulp-htmlmin');
var rename = require('gulp-rename');
var replace = require('gulp-replace');
const babel = require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');
const fs = require('fs');   // https://nodejs.org/api/fs.html#fs_file_system

// my own attempt at cache busting (don't want to use Gulp(rev) ... not more requires
// and complexity !!! ... Keep It Simple :)  ) BUT REMEMBER: only call this when
// my sources change ... not intermediates.
// Just using date time (to hex to keep it shorter) ... not a hash per se
// saving to file so if I save the index again, it can use the correct time value
// (using global var with runsequence so I don't have to mess-about with promises
// or vinyl or streams or whatnot ... really am keeping things simple and using
// resources I've already required)
var cachebustHex = null;
gulp.task('setDateTimeHash', function(){
    cachebustHex = ( (new Date()).getTime()  ).toString(16);
    return gulp.src("cacheBustingHashSrc.txt")
        .pipe (replace('NothingHere', cachebustHex))
        .pipe (rename(function (path) {
            path.basename = path.basename.replace("Src", "Dst");
        }))
        .pipe(gulp.dest('./'))
});

gulp.task('cachebust-html', function(){
    fs.readFile("cacheBustingHashDst.txt", "utf-8", function(err, _data) {
            cachebustHex = _data;
            gutil.log('This cachebuster datetime stamp is: ' + cachebustHex);
            gulp.start('minify-html');
            gulp.start('cachebust-web-config');
    })
    return true;
});

gulp.task('cachebust-web-config', function(){
    return gulp.src("web.config")
        .pipe (replace(/styles-[0-9a-fA-F]+.css/g, 'styles-' + cachebustHex + '.css'))
        .pipe(gulp.dest(function(f) {
            gutil.log('NEARLY DONE');
            return f.base;
        })) 
});

gulp.task('TEST', function(){
    gutil.log('In gulp.task TEST: ' + cachebustHex);
});

// minifyJS and minifyCSS (as options) break my page at the moment
// need to learn how to pass options to minifyJS here
gulp.task('minify-html', function() {
    return gulp.src("html-debug/*-debug.html")
        .pipe (htmlmin({collapseWhitespace: true, conservativeCollapse: true, caseSensitive: true, minifyJS: true, minifyCSS: false, removeComments: true, removeEmptyElements: false }))
        .pipe (replace('<script></script>', ''))
        .pipe (replace('homepage-min.js', 'homepage-' + cachebustHex + '.js'))
        .pipe (replace('defer-min.js', 'defer-' + cachebustHex + '.js'))
        .pipe (replace('styles.css', 'styles-' + cachebustHex + '.css'))
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


gulp.task('cachebust-homepage-min', function() {
  return gulp.src('js/homepage-min.js')
    .pipe (rename(function (path) {
        path.basename = path.basename.replace("min", cachebustHex);
    }))
    .pipe(gulp.dest('js'))   
});

gulp.task('cachebust-defer-min', function() {
  return gulp.src('js/defer-min.js')
    .pipe (rename(function (path) {
        path.basename = path.basename.replace("min", cachebustHex);
    }))
    .pipe(gulp.dest('js'))   
});

gulp.task('cachebust-styles-css', function() {
  return gulp.src('css/styles.css')
    .pipe (rename(function (path) {
        path.basename = path.basename.replace("styles", 'styles-' + cachebustHex);
    }))
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


// see: https://github.com/gulp-sourcemaps/gulp-sourcemaps
// when I need to, use base e.g.
// gulp.src(['src/test.js', 'src/testdir/test2.js'], { base: 'src' })

/**
 * pollyfill.js ... from: http://babeljs.io/docs/usage/polyfill/
 *              ... installed using NPM, and copied from module dist folder
 *              ... needed to fix non ES2015 compatibility in Edge (for of)
 *              ... gave error: Object doesn't support property or method 'ToString'
 */
gulp.task('concat-home-js', function() {
  return gulp.src([ './js-debug-home/polyfill.js',
                    './js-debug-home/CSS3DRenderer.js',
                    './js-debug-home/beep.js', 
                    './js-debug-home/water.js',
                    './js-debug-home/scene.js'], {base: './'})
    .pipe(sourcemaps.init())
    .pipe(babel({
        presets: ['es2015']
    }))
    .pipe(concat('homepage.js'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./js-debug-home/'));
});

gulp.task('concat-defer-js', function() {
  return gulp.src([ './js-debug-home/cookie-consent.js', 
                    './js-debug-home/defer-xarta.js'], {base: './'})
    .pipe(sourcemaps.init())
    .pipe(babel({
        presets: ['es2015']
    }))
    .pipe(concat('defer.js'))
    .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest('./js-debug-home/'));
});


// want the homepage to be fast so concatenate & compress all js files
// to one (but also separates for three stuff, for other pages)
gulp.task('concat-minify-home-js-css', function() {
    runSequence(
        'setDateTimeHash', 'concat-home-js', 'concat-defer-js', 'minify-home-js', 'homepage-js-cloudinary', 'cachebust-homepage-min',
        'cachebust-defer-min', 'minify-css', 'cachebust-styles-css', 'cachebust-html'
    );
});


gulp.task('xarta', function() {
    gulp.watch('css/css-debug/*.scss', ['sass']);
    gulp.watch('css/css-debug/*.css', ['concat-minify-home-js-css']);
    gulp.watch('html-debug/*.html', ['cachebust-html', 'debug-js']);
    gulp.watch(['js-debug-home/*.js', '!js-debug-home/homepage.js', '!js-debug-home/defer.js'], ['concat-minify-home-js-css']);
});

