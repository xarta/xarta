// Sass configuration
// https://code.visualstudio.com/docs/languages/css
// https://www.npmjs.com/package/gulp-minify
var gulp = require('gulp');             // look for gulp in package node-modules
var sass = require('gulp-sass');
var minify = require('gulp-minify');

gulp.task('sass', function() {
    gulp.src('css/*.scss')
        .pipe(sass())
        .pipe(gulp.dest(function(f) {
            return f.base;
        }))
});

gulp.task('compress', function() {
  gulp.src('js-debug/*.js')
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

gulp.task('default', ['sass', 'compress'], function() {
    gulp.watch('css/*.scss', ['sass']);
    gulp.watch('js-debug/*.js', ['compress']);
})

