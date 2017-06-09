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

gulp.task('default', ['sass'], function() {
    gulp.watch('css/*.scss', ['sass']);
})

gulp.task('compress', function() {
  gulp.src('lib/*.js')
    .pipe(minify({
        ext:{
            src:'-debug.js',
            min:'.js'
        },
        exclude: ['tasks'],
        ignoreFiles: ['.combo.js', '-min.js']
    }))
    .pipe(gulp.dest('dist'))
});